import { getGameState, updateGameState, canAccessEpilogue } from '../gameState.js';
import { EPILOGUE_SCENES, EPILOGUE_EVIDENCE, findLastMessage, epilogueImage } from '../data/epilogue-scenes.js';
import { EpilogueNovel } from '../components/EpilogueNovel.js';
import { mountEvidenceComparison, sourceMarkup } from '../components/EvidenceComparison.js';
import { mountFinalQuestion } from '../components/FinalQuestion.js';
import { mountFinalMessageChoice } from '../components/FinalMessageChoice.js';
import { escapeHTML } from '../components/EpilogueUI.js';

const cachedImages = new Map();
function preloadImage(url) {
  if (!cachedImages.has(url)) {
    cachedImages.set(url, new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Không thể tải hình ${url}`));
      img.src = url;
    }));
  }
  return cachedImages.get(url);
}

const PHASE_META = {
  scene1: { scene: 'scene1', tag: '01 / THE COMPLETE ARCHIVE', next: 'scene2' },
  scene2: { scene: 'scene2', tag: '02 / THEN & NOW', next: 'evidence' },
  evidence: { scene: 'scene2', tag: '02 / THEN & NOW', next: 'question' },
  question: { background: epilogueImage('epilogue_03.png'), tag: '03 / THE FINAL DISCOVERY', next: 'scene4' },
  scene4: { scene: 'scene4', tag: '04 / THE LAST MESSAGE', next: 'choice' },
  choice: { scene: 'scene4', tag: '04 / THE LAST MESSAGE', next: 'scene5' },
  scene5: { scene: 'scene5', tag: '05 / ARCHIVE TRANSMITTED', next: 'ending' },
  ending: { scene: 'scene5', tag: '05 / ARCHIVE RESTORED' },
};
const NOVEL_PHASES = new Set(['scene1', 'scene2', 'scene4', 'scene5']);

const fullscreenIcon = `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/></svg>`;

class EpilogueController {
  constructor(root, { onBack, preview = false }) {
    this.root = root;
    this.onBack = onBack;
    this.preview = preview === true;
    // An isolated, in-memory practice session: never writes game completion.
    this.previewProgress = { finalQuestionCompleted: false, finalMessageChoice: null };
    this.phase = null;
    this.novel = null;
    this.isDestroyed = false;
    this.backgroundToken = 0;
    this.activeBackground = -1;
    this.modalOpen = false;
    this.modalReturnFocus = null;
    // One tap cannot cross two narrative steps, even when a new scene mounts.
    this.lastNarrativeActionAt = -Infinity;
    this.clickHandler = (e) => this.onScreenClick(e);
    this.keyHandler = (e) => this.onKeyDown(e);
  }

  mount() {
    this.root.innerHTML = `
      <section class="epi-screen${this.preview ? ' is-preview' : ''}" aria-label="Epilogue – The Lost Elephant Archive">
        <div class="epi-backgrounds" aria-hidden="true"><img class="epi-background" alt="" /><img class="epi-background" alt="" /></div>
        <div class="epi-screen-wash" aria-hidden="true"></div>
        <header class="epi-topbar">
          <div class="epi-topbar__identity"><span class="epi-star" aria-hidden="true">✧</span><div><strong>THE LOST ELEPHANT ARCHIVE</strong><small>HỒ SƠ VOI THẤT LẠC / EPILOGUE</small></div></div>
          <div class="epi-topbar__actions">
            ${this.preview ? '<span class="epi-preview-chip" title="Bản xem thử. Tiến độ trò chơi không thay đổi">XEM THỬ · KHÔNG LƯU</span>' : ''}
            <span class="epi-phase-label"></span>
            <button type="button" class="game-fullscreen" data-fullscreen-toggle title="Toàn màn hình" aria-label="Bật chế độ toàn màn hình" aria-pressed="false">${fullscreenIcon}</button>
            <button type="button" class="epi-topbar__skip" data-skip>SKIP <span aria-hidden="true">»</span></button>
          </div>
        </header>
        <div class="epi-main"></div>
        <div class="epi-asset-warning sr-only" role="status" aria-live="polite"></div>
        <div class="epi-modal" hidden></div>
      </section>`;
    this.screen = this.root.querySelector('.epi-screen');
    this.main = this.root.querySelector('.epi-main');
    this.bgLayers = [...this.root.querySelectorAll('.epi-background')];
    this.skipButton = this.root.querySelector('[data-skip]');
    this.modal = this.root.querySelector('.epi-modal');
    this.screen.addEventListener('click', this.clickHandler);
    document.addEventListener('keydown', this.keyHandler);
    this.skipButton.addEventListener('click', () => this.skipNarrative());
    if (!this.preview) updateGameState({ epilogueStarted: true });
    this.setPhase('scene1');
  }

  async backgroundFor(meta) {
    const setting = meta.scene ? EPILOGUE_SCENES[meta.scene] : null;
    const url = setting?.image || meta.background;
    const fallback = setting?.fallbackImage || null;
    const token = ++this.backgroundToken;
    let resolved = url;
    try {
      await preloadImage(url);
    } catch (error) {
      // The seventh image wasn't included in the supplied assets. Until the
      // artist adds it, the provided laboratory illustration stays on screen.
      if (!fallback) {
        console.warn(error.message);
        this.root.querySelector('.epi-asset-warning').textContent = error.message;
        return;
      }
      try {
        resolved = await preloadImage(fallback);
      } catch (_) { return; }
    }
    if (this.isDestroyed || token !== this.backgroundToken) return;
    if (this.activeBackground >= 0 && this.bgLayers[this.activeBackground].getAttribute('src') === resolved) return;
    const nextIndex = this.activeBackground < 0 ? 0 : 1 - this.activeBackground;
    const next = this.bgLayers[nextIndex];
    next.src = resolved;
    next.classList.add('is-visible');
    if (this.activeBackground >= 0) this.bgLayers[this.activeBackground].classList.remove('is-visible');
    this.activeBackground = nextIndex;
  }

  setPhase(phase, startLine = 0) {
    if (this.isDestroyed || !PHASE_META[phase]) return;
    this.novel?.destroy();
    this.novel = null;
    this.closeModal();
    this.phase = phase;
    this.screen.dataset.phase = phase;
    this.main.replaceChildren();
    const meta = PHASE_META[phase];
    this.screen.querySelector('.epi-phase-label').textContent = meta.tag;
    this.skipButton.hidden = !NOVEL_PHASES.has(phase);
    void this.backgroundFor(meta);

    if (NOVEL_PHASES.has(phase)) {
      const scene = EPILOGUE_SCENES[phase];
      this.novel = new EpilogueNovel(this.main, {
        onDone: () => this.setPhase(meta.next),
        onBeforeFirst: () => this.goBackFromPhase(),
      });
      this.novel.start(scene.dialogue, startLine);
    } else if (phase === 'evidence') {
      mountEvidenceComparison(this.main, {
        onInspect: (id) => this.inspectEvidence(id),
        onContinue: () => this.setPhase('question'),
        onBack: () => this.setPhase('scene2', EPILOGUE_SCENES.scene2.dialogue.length - 1),
      });
    } else if (phase === 'question') {
      mountFinalQuestion(this.main, {
        onInspect: (id) => this.inspectEvidence(id),
        onCorrect: () => {
          if (this.preview) this.previewProgress.finalQuestionCompleted = true;
          else updateGameState({ finalQuestionCompleted: true });
        },
        onContinue: () => this.setPhase('scene4'),
        onBack: () => this.setPhase('evidence'),
      });
    } else if (phase === 'choice') {
      const saved = this.preview ? this.previewProgress.finalMessageChoice : getGameState().finalMessageChoice;
      mountFinalMessageChoice(this.main, {
        savedId: saved?.id,
        onConfirm: (choice) => {
          if (this.preview) this.previewProgress.finalMessageChoice = choice;
          else updateGameState({ finalMessageChoice: choice });
          this.setPhase('scene5');
        },
        onBack: () => this.setPhase('scene4', EPILOGUE_SCENES.scene4.dialogue.length - 1),
      });
    } else if (phase === 'ending') {
      this.showEnding();
    }
    // Preload only the next major background, not all assets at once.
    const nextMeta = PHASE_META[meta.next];
    const upcoming = nextMeta?.scene ? EPILOGUE_SCENES[nextMeta.scene].image : nextMeta?.background;
    if (upcoming && upcoming !== EPILOGUE_SCENES.scene5.image) {
      void preloadImage(upcoming).catch(() => {});
    }
  }

  goBackFromPhase() {
    switch (this.phase) {
      case 'scene2': this.setPhase('scene1', EPILOGUE_SCENES.scene1.dialogue.length - 1); break;
      case 'scene4': this.setPhase('question'); break;
      case 'scene5': this.setPhase('choice'); break;
      default: break;
    }
  }

  skipNarrative() {
    // Skipping narrative must NEVER bypass an educational interaction.
    switch (this.phase) {
      case 'scene1':
      case 'scene2': this.setPhase('evidence'); break;
      case 'scene4': this.setPhase('choice'); break;
      case 'scene5':
        {
          const progress = this.preview ? this.previewProgress : getGameState();
          if (progress.finalQuestionCompleted && findLastMessage(progress.finalMessageChoice?.id)) this.setPhase('ending');
        }
        break;
      default: break;
    }
  }

  onScreenClick(event) {
    if (this.modalOpen || !NOVEL_PHASES.has(this.phase)) return;
    if (event.target.closest('button, a, input, select, textarea, [role="button"]')) return;
    const now = performance.now();
    if (now - this.lastNarrativeActionAt < 165) return;
    this.lastNarrativeActionAt = now;
    const bounds = this.screen.getBoundingClientRect();
    const side = event.clientX < bounds.left + bounds.width / 2 ? 'back' : 'forward';
    this.novel?.navigate(side);
  }

  onKeyDown(event) {
    if (event.key === 'Escape' && this.modalOpen) {
      event.preventDefault();
      this.closeModal();
      return;
    }
    if (this.modalOpen || !NOVEL_PHASES.has(this.phase)) return;
    if (event.repeat || !['Enter', ' ', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (document.activeElement?.matches('button, a, input, textarea, select, [role="button"]')) return;
    event.preventDefault();
    const now = performance.now();
    if (now - this.lastNarrativeActionAt < 165) return;
    this.lastNarrativeActionAt = now;
    this.novel?.navigate(event.key === 'ArrowLeft' ? 'back' : 'forward');
  }

  inspectEvidence(id) {
    const item = EPILOGUE_EVIDENCE.find((e) => e.id === id);
    if (!item || this.isDestroyed) return;
    this.modalReturnFocus = document.activeElement;
    this.modalOpen = true;
    this.modal.innerHTML = `
      <div class="epi-modal__scrim" data-close-modal></div>
      <div class="epi-modal__dialog" role="dialog" aria-modal="true" aria-label="${escapeHTML(item.eyebrow)}">
        <button class="epi-modal__close" type="button" data-close-modal aria-label="Đóng hình ảnh">✕</button>
        <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.imageAlt)}" />
        <div class="epi-modal__copy"><strong>${escapeHTML(item.eyebrow)} — ${escapeHTML(item.name)}</strong><p>${escapeHTML(item.description)}</p>${sourceMarkup(item)}<small>Hình minh họa, không phải ảnh chụp hiện vật hay tư liệu gốc.</small></div>
      </div>`;
    this.modal.hidden = false;
    this.modal.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', () => this.closeModal()));
    this.modal.querySelector('.epi-modal__close').focus();
  }

  closeModal() {
    if (!this.modalOpen) return;
    this.modalOpen = false;
    this.modal.hidden = true;
    this.modal.replaceChildren();
    if (this.modalReturnFocus?.isConnected) this.modalReturnFocus.focus();
    this.modalReturnFocus = null;
  }

  showEnding() {
    const state = getGameState();
    const progress = this.preview ? this.previewProgress : state;
    const choice = findLastMessage(progress.finalMessageChoice?.id);
    const branches = new Set(state.unlockedBranches || []);
    const complete = (this.preview || canAccessEpilogue(state)) && progress.finalQuestionCompleted === true && Boolean(choice);
    if (!complete) {
      // A malformed/old saved state must not forge an archive completion.
      this.setPhase(!progress.finalQuestionCompleted ? 'question' : 'choice');
      return;
    }
    if (!this.preview) updateGameState({ epilogueCompleted: true });
    // In preview the 6/6 ending is an explicit illustration, not saved progress.
    const count = this.preview ? 6 : ['behavior', 'domestication', 'care', 'culture', 'society', 'economy'].filter((id) => branches.has(id)).length;
    this.main.innerHTML = `
      <section class="epi-ending" aria-labelledby="epi-ending-title">
        <p class="epi-ending__kicker">KEP-207 // TRANSMISSION COMPLETE</p>
        ${this.preview ? '<p class="epi-ending__preview-note">BẢN XEM THỬ · TIẾN ĐỘ 6/6 ĐƯỢC MÔ PHỎNG, KHÔNG GHI VÀO GAME</p>' : ''}
        <div class="epi-ending__seal" aria-hidden="true">✧</div>
        <h1 id="epi-ending-title">ARCHIVE <em>RESTORED</em></h1>
        <p>Hồ sơ voi Tây Nguyên đã được phục dựng.</p>
        <strong class="epi-ending__progress">${count}/6 <span>NHÁNH TRI THỨC ${this.preview ? '(MÔ PHỎNG)' : 'HOÀN THÀNH'}</span></strong>
        <div class="epi-ending__message"><span>THÔNG ĐIỆP BẠN ĐÃ LƯU GIỮ · ${escapeHTML(choice.title)}</span><blockquote>${escapeHTML(choice.text)}</blockquote></div>
        <p class="epi-ending__quote">The future of a species is not yet written.<br/><small>Tương lai của một loài vẫn chưa được định đoạt.</small></p>
        <div class="epi-ending__actions">
          <button type="button" class="epi-action" data-ending-mindmap>XEM LẠI MINDMAP</button>
          <button type="button" class="epi-tertiary" data-ending-replay>XEM LẠI EPILOGUE</button>
          <button type="button" class="epi-tertiary" data-ending-home>VỀ TRANG CHỦ</button>
        </div>
      </section>`;
    this.main.querySelector('[data-ending-mindmap]').addEventListener('click', this.onBack);
    this.main.querySelector('[data-ending-home]').addEventListener('click', this.onBack);
    this.main.querySelector('[data-ending-replay]').addEventListener('click', () => this.setPhase('scene1'));
  }

  destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.backgroundToken += 1;
    this.novel?.destroy();
    this.closeModal();
    this.screen?.removeEventListener('click', this.clickHandler);
    document.removeEventListener('keydown', this.keyHandler);
  }
}

/** Mount in the existing hash router; never creates a second application. */
export function mountEpilogue(root, { onBack, preview = false }) {
  // Only the explicit preview route may opt in. The production entry stays gated.
  if (!preview && !canAccessEpilogue(getGameState())) {
    onBack();
    return () => {};
  }
  const controller = new EpilogueController(root, { onBack, preview });
  controller.mount();
  return () => controller.destroy();
}
