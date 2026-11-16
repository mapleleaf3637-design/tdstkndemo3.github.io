import { prologueScenes } from '../data/prologue-scenes.js';
import { TYPEWRITER_MS, SCENE_FADE_MS } from '../config.js';
import { getGameState } from '../gameState.js';

const SETTINGS_KEY = 'lost-elephant-archive:typewriter';
const MIN_TAP_GAP_MS = 165;
const imagePromises = new Map();

/** Loads the next illustration before it becomes visible; no dependency on external APIs. */
function preloadImage(src) {
  if (imagePromises.has(src)) return imagePromises.get(src);
  const loading = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Không tải được ảnh: ${src}`));
    img.src = src;
  });
  imagePromises.set(src, loading);
  return loading;
}

function getTypewriterEnabled() {
  try {
    const saved = window.localStorage.getItem(SETTINGS_KEY);
    if (saved === 'on') return true;
    if (saved === 'off') return false;
  } catch (_) { /* Private browsing can disable storage. */ }
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Reusable visual-novel player.
 * @param {HTMLElement} root The screen container.
 * @param {{onComplete: function, onSkip: function}} callbacks Routing callbacks.
 */
export class ProloguePlayer {
  constructor(root, { onComplete, onSkip }) {
    this.root = root;
    this.onComplete = onComplete;
    this.onSkip = onSkip;
    this.sceneIndex = -1;
    this.lineIndex = 0;
    this.activeLayerIndex = 0;
    this.isTyping = false;
    this.isTransitioning = false;
    this.destroyed = false;
    this.typewriterEnabled = getTypewriterEnabled();
    this.lastNavigationTime = -Infinity;
    this.typeTimer = null;
    this.fadeTimer = null;
    this.typeToken = 0;
    this.sceneToken = 0;
    this.boundKeydown = (event) => this.onKeyDown(event);
    this.boundAreaClick = (event) => this.onAreaClick(event);
  }

  mount() {
    this.root.innerHTML = `
      <section class="vn-screen" aria-label="Prologue – Chạm bên trái để quay lại, bên phải để tiếp tục">
        <div class="vn-ambient" aria-hidden="true"></div>
        <div class="vn-illustrations" role="img" aria-label="Minh họa bối cảnh câu chuyện">
          <img class="vn-illustration" alt="" draggable="false" />
          <img class="vn-illustration" alt="" draggable="false" />
        </div>
        <div class="vn-vignette" aria-hidden="true"></div>
        <div class="vn-signal-effect" aria-hidden="true"></div>
        <header class="vn-topbar">
          <div class="vn-brand" aria-label="The Lost Elephant Archive">
            <span class="vn-brand__symbol" aria-hidden="true">✧</span>
            <span class="vn-brand__copy">
              <span class="vn-brand__title">THE LOST ELEPHANT ARCHIVE</span>
              <span class="vn-brand__subtitle">HỒ SƠ VOI THẤT LẠC <span aria-hidden="true">/</span> PROLOGUE</span>
            </span>
          </div>
          <div class="vn-controls">
            <button type="button" class="game-fullscreen" data-fullscreen-toggle aria-label="Bật chế độ toàn màn hình" aria-pressed="false" title="Toàn màn hình">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" /></svg>
            </button>
            <button type="button" class="vn-type-toggle" aria-pressed="false" title="Bật hoặc tắt hiệu ứng gõ chữ"></button>
            <div class="vn-scene-count" aria-label="Tiến độ prologue"><span class="vn-scene-current">01</span><span class="vn-scene-slash">/</span><span>${String(prologueScenes.length).padStart(2, '0')}</span></div>
            <button type="button" class="vn-skip" aria-label="Bỏ qua cốt truyện, đến bản đồ tri thức">SKIP <span aria-hidden="true">»</span></button>
          </div>
        </header>
        <aside class="vn-status" hidden aria-live="off"></aside>
        <div class="vn-chapter" aria-hidden="true"><span>KEP—207</span><i></i><span class="vn-chapter-name"></span></div>
        <button type="button" class="vn-finish" hidden>
          <span>KHỞI HÀNH</span><span class="vn-finish__arrow" aria-hidden="true">↗</span><small>ENTER ARCHIVE</small>
        </button>
        <article class="vn-dialog" aria-label="Hội thoại của câu chuyện">
          <div class="vn-dialog__eyebrow">
            <span class="vn-dialog__dot" aria-hidden="true"></span>
            <span class="vn-speaker">NHẬT KÝ NGHIÊN CỨU</span>
            <span class="vn-line-number"></span>
          </div>
          <p class="vn-dialog__text" aria-hidden="true"></p>
          <span class="sr-only vn-dialog__accessible" aria-live="polite"></span>
          <div class="vn-dialog__footer">
            <span class="vn-dialog__back" aria-hidden="true">← TRÁI · QUAY LẠI</span>
            <span class="vn-dialog__hint">PHẢI · HIỆN HẾT LỜI THOẠI</span>
            <span class="vn-dialog__continue" aria-hidden="true"><span>PHẢI · TIẾP TỤC</span><span class="vn-right-arrow"></span></span>
          </div>
        </article>
        <div class="vn-loading" role="status" aria-live="polite">Đang kết nối kho lưu trữ<span class="vn-loading__ellipsis">...</span></div>
        <div class="vn-image-error" role="status" hidden></div>
      </section>
    `;

    this.screen = this.root.querySelector('.vn-screen');
    this.images = [...this.screen.querySelectorAll('.vn-illustration')];
    this.ambient = this.screen.querySelector('.vn-ambient');
    this.status = this.screen.querySelector('.vn-status');
    this.speaker = this.screen.querySelector('.vn-speaker');
    this.dialogText = this.screen.querySelector('.vn-dialog__text');
    this.accessibleText = this.screen.querySelector('.vn-dialog__accessible');
    this.continueHint = this.screen.querySelector('.vn-dialog__hint');
    this.continueIndicator = this.screen.querySelector('.vn-dialog__continue');
    this.lineNumber = this.screen.querySelector('.vn-line-number');
    this.finishButton = this.screen.querySelector('.vn-finish');
    this.typeButton = this.screen.querySelector('.vn-type-toggle');
    this.loading = this.screen.querySelector('.vn-loading');
    this.error = this.screen.querySelector('.vn-image-error');

    this.screen.addEventListener('click', this.boundAreaClick);
    document.addEventListener('keydown', this.boundKeydown);
    this.screen.querySelector('.vn-skip').addEventListener('click', (event) => {
      event.stopPropagation();
      this.skip();
    });
    this.finishButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.finish();
    });
    this.typeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.toggleTypewriter();
    });
    this.renderTypewriterSetting();
    void this.showScene(0, true);
  }

  renderTypewriterSetting() {
    this.typeButton.textContent = `Aa · ${this.typewriterEnabled ? 'BẬT' : 'TẮT'}`;
    this.typeButton.setAttribute('aria-pressed', String(this.typewriterEnabled));
    this.typeButton.setAttribute('aria-label', `Hiệu ứng gõ chữ: ${this.typewriterEnabled ? 'bật' : 'tắt'}`);
  }

  toggleTypewriter() {
    this.typewriterEnabled = !this.typewriterEnabled;
    try { window.localStorage.setItem(SETTINGS_KEY, this.typewriterEnabled ? 'on' : 'off'); } catch (_) { /* Optional preference. */ }
    this.renderTypewriterSetting();
    if (!this.typewriterEnabled && this.isTyping) this.revealCurrentLine();
  }

  /** All scene transitions are cancelable by Skip or router teardown. */
  async showScene(index, isInitial = false, startLineIndex = 0) {
    if (this.destroyed || index < 0 || index >= prologueScenes.length) return;
    this.cancelTyping();
    window.clearTimeout(this.fadeTimer);
    this.isTransitioning = true;
    this.loading.classList.add('is-active');
    this.finishButton.hidden = true;
    this.finishButton.classList.remove('is-revealed');

    const token = ++this.sceneToken;
    const next = prologueScenes[index];
    const incomingLayerIndex = isInitial ? this.activeLayerIndex : 1 - this.activeLayerIndex;
    const incoming = this.images[incomingLayerIndex];
    const outgoing = this.images[this.activeLayerIndex];

    try {
      await preloadImage(next.image);
    } catch (error) {
      // Never trap the player in a loading state if an asset is misnamed/missing.
      if (this.destroyed || token !== this.sceneToken) return;
      console.warn(error);
      this.error.hidden = false;
      this.error.textContent = `${error.message}. Kiểm tra thư mục assets/prologue/.`;
    }
    if (this.destroyed || token !== this.sceneToken) return;

    incoming.src = next.image;
    this.ambient.style.backgroundImage = `url("${next.image}")`;
    this.screen.classList.remove('scene-opening', 'scene-fade', 'scene-signal', 'scene-portal', 'scene-warm', 'scene-reveal');
    this.screen.classList.add(`scene-${next.effect}`);
    this.screen.querySelector('.vn-chapter-name').textContent = next.title;
    this.screen.querySelector('.vn-scene-current').textContent = String(index + 1).padStart(2, '0');
    this.screen.querySelector('.vn-illustrations').setAttribute('aria-label', `Cảnh ${index + 1}: ${next.title}`);
    this.status.hidden = !next.status;
    this.status.replaceChildren();
    if (next.status) {
      next.status.forEach((line) => {
        const label = document.createElement('div');
        label.textContent = line.startsWith('KNOWLEDGE RESTORED:')
          ? `KNOWLEDGE RESTORED: ${Math.min(6, getGameState().unlockedBranches.length)}/6`
          : line;
        this.status.append(label);
      });
    }

    this.sceneIndex = index;
    // Going backwards enters the previous scene at its last dialogue, not its first.
    this.lineIndex = Math.max(0, Math.min(startLineIndex, next.dialogue.length - 1));
    // requestAnimationFrame ensures opacity transitions are painted from a stable frame.
    requestAnimationFrame(() => {
      if (this.destroyed || token !== this.sceneToken) return;
      incoming.classList.add('is-visible');
      if (!isInitial && incoming !== outgoing) outgoing.classList.remove('is-visible');
      this.activeLayerIndex = incomingLayerIndex;
      this.loading.classList.remove('is-active');
      this.showLine(this.lineIndex);
      const fadeMs = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : SCENE_FADE_MS;
      this.fadeTimer = window.setTimeout(() => {
        if (this.destroyed || token !== this.sceneToken) return;
        this.isTransitioning = false;
        // Preload just the next scene; no need to fetch all nine at startup.
        if (prologueScenes[index + 1]) void preloadImage(prologueScenes[index + 1].image).catch(console.warn);
      }, fadeMs);
    });
  }

  cancelTyping() {
    window.clearTimeout(this.typeTimer);
    this.typeTimer = null;
    ++this.typeToken;
    this.isTyping = false;
  }

  showLine(index) {
    this.cancelTyping();
    this.lineIndex = index;
    const scene = prologueScenes[this.sceneIndex];
    const entry = scene.dialogue[index];
    if (!entry) return;

    this.speaker.textContent = entry.speaker;
    this.lineNumber.textContent = `${String(index + 1).padStart(2, '0')} / ${String(scene.dialogue.length).padStart(2, '0')}`;
    this.dialogText.textContent = '';
    this.accessibleText.textContent = entry.text;
    this.continueIndicator.classList.remove('is-visible');
    this.continueHint.textContent = 'PHẢI · HIỆN HẾT LỜI THOẠI';
    this.finishButton.hidden = true;
    this.finishButton.classList.remove('is-revealed');

    const chars = Array.from(entry.text);
    const speed = this.typewriterEnabled
      ? (this.sceneIndex === 0 && index === 0 ? TYPEWRITER_MS * 1.7 : TYPEWRITER_MS)
      : 0;
    if (speed <= 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.dialogText.textContent = entry.text;
      this.endTyping();
      return;
    }
    const token = ++this.typeToken;
    this.isTyping = true;
    let count = 0;
    const type = () => {
      if (this.destroyed || token !== this.typeToken) return;
      count += 1;
      this.dialogText.textContent = chars.slice(0, count).join('');
      if (count === chars.length) {
        this.endTyping();
      } else {
        this.typeTimer = window.setTimeout(type, speed);
      }
    };
    this.typeTimer = window.setTimeout(type, speed);
  }

  endTyping() {
    this.isTyping = false;
    this.typeTimer = null;
    this.continueHint.textContent = 'PHẢI · TIẾP TỤC';
    this.continueIndicator.classList.add('is-visible');
    const isLastScene = this.sceneIndex === prologueScenes.length - 1;
    const isLastLine = this.lineIndex === prologueScenes[this.sceneIndex].dialogue.length - 1;
    if (isLastScene && isLastLine) {
      this.finishButton.hidden = false;
      requestAnimationFrame(() => this.finishButton?.classList.add('is-revealed'));
      this.continueHint.textContent = 'PHẢI · KHỞI HÀNH';
    }
  }

  revealCurrentLine() {
    if (!this.isTyping || this.sceneIndex < 0) return;
    this.cancelTyping();
    this.dialogText.textContent = prologueScenes[this.sceneIndex].dialogue[this.lineIndex].text;
    this.endTyping();
  }

  /** Avoid accidental double navigation from rapid taps in either direction. */
  canNavigate() {
    if (this.destroyed || this.isTransitioning || this.sceneIndex < 0) return false;
    const now = performance.now();
    if (now - this.lastNavigationTime < MIN_TAP_GAP_MS) return false;
    this.lastNavigationTime = now;
    return true;
  }

  /** Right half: finish the typewriter line first, then move forward. */
  advance() {
    if (!this.canNavigate()) return;

    if (this.isTyping) {
      this.revealCurrentLine();
      return;
    }
    const currentScene = prologueScenes[this.sceneIndex];
    if (this.lineIndex < currentScene.dialogue.length - 1) {
      this.showLine(this.lineIndex + 1);
    } else if (this.sceneIndex < prologueScenes.length - 1) {
      void this.showScene(this.sceneIndex + 1);
    } else {
      this.finish();
    }
  }

  /** Left half: go back one dialogue, including across scene boundaries. */
  goBack() {
    if (!this.canNavigate()) return;
    if (this.lineIndex > 0) {
      // showLine cancels any active typewriter timer and hides the final CTA.
      this.showLine(this.lineIndex - 1);
    } else if (this.sceneIndex > 0) {
      const previousIndex = this.sceneIndex - 1;
      const lastLine = prologueScenes[previousIndex].dialogue.length - 1;
      void this.showScene(previousIndex, false, lastLine);
    }
    // The first dialogue of scene 1 has no predecessor.
  }

  onAreaClick(event) {
    // Buttons must never advance/reverse the story as a side effect.
    if (event.target.closest('button, a, input, select, textarea, [role="button"]')) return;
    const bounds = this.screen.getBoundingClientRect();
    if (event.clientX < bounds.left + bounds.width / 2) {
      this.goBack();
    } else {
      this.advance();
    }
  }

  onKeyDown(event) {
    if (event.repeat || !['Enter', ' ', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    // Let native buttons handle their own keys; no duplicate story navigation.
    const focused = document.activeElement;
    if (focused?.matches('button, a, input, textarea, select, [role="button"], [contenteditable]')) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') this.goBack();
    else this.advance();
  }

  finish() {
    if (this.destroyed) return;
    this.destroy();
    this.onComplete();
  }

  skip() {
    if (this.destroyed) return;
    this.destroy();
    this.onSkip();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    ++this.sceneToken;
    this.cancelTyping();
    window.clearTimeout(this.fadeTimer);
    this.screen?.removeEventListener('click', this.boundAreaClick);
    document.removeEventListener('keydown', this.boundKeydown);
  }
}
