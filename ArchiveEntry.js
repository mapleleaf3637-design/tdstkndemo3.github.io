import { imagePathFor } from '../config.js';
import { getGameState, canAccessEpilogue } from '../gameState.js';

export const KNOWLEDGE_BRANCHES = [
  { id: 'behavior', label: 'Tập tính', stage: 1, num: '01', group: 'THE FORGOTTEN SPECIES' },
  { id: 'domestication', label: 'Thuần dưỡng', stage: 1, num: '02', group: 'THE FORGOTTEN SPECIES' },
  { id: 'care', label: 'Chăm sóc', stage: 1, num: '03', group: 'THE FORGOTTEN SPECIES' },
  { id: 'culture', label: 'Văn hóa', stage: 2, num: '04', group: 'THE HUMAN CONNECTION' },
  { id: 'society', label: 'Xã hội', stage: 2, num: '05', group: 'THE HUMAN CONNECTION' },
  { id: 'economy', label: 'Kinh tế', stage: 2, num: '06', group: 'THE HUMAN CONNECTION' },
];

function lockSvg() {
  return `<svg class="branch-lock" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5.5" y="10.5" width="13" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></svg>`;
}

export function mountArchiveEntry(root, { onEnter, onReplay, onEpilogue }) {
  const state = getGameState();
  const restored = new Set(state.unlockedBranches);
  const progress = KNOWLEDGE_BRANCHES.filter((branch) => restored.has(branch.id)).length;
  const epilogueReady = canAccessEpilogue(state);
  root.innerHTML = `
    <section class="archive-screen" style="--archive-bg: url('${imagePathFor(8)}')" aria-label="Bản đồ tri thức về voi">
      <div class="archive-backdrop" aria-hidden="true"></div>
      <div class="archive-wash" aria-hidden="true"></div>
      <header class="archive-header">
        <div class="archive-header__brand"><span class="archive-header__star" aria-hidden="true">✧</span><span>THE LOST ELEPHANT ARCHIVE</span></div>
        <div class="archive-header__actions">
          <span class="archive-header__status"><span class="archive-live-dot" aria-hidden="true"></span> ARCHIVE SYSTEM // ONLINE</span>
          <button type="button" class="game-fullscreen" data-fullscreen-toggle aria-label="Bật chế độ toàn màn hình" aria-pressed="false" title="Toàn màn hình">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" /></svg>
            </button>
        </div>
      </header>
      <div class="archive-intro">
        <span class="archive-overline">KHO LƯU TRỮ TRUNG TÂM <span aria-hidden="true">/</span> MINDMAP</span>
        <h1>Phục dựng <em>tri thức</em> thất lạc</h1>
        <p>Sáu nhánh dữ liệu đang chờ được kết nối. Hành trình bắt đầu từ những điều ta biết về loài voi.</p>
      </div>
      <div class="archive-map" aria-label="Sáu nhánh của bản đồ tri thức">
        <div class="map-side-label map-side-label--left">STAGE 01 <span>THE FORGOTTEN SPECIES</span></div>
        <div class="map-side-label map-side-label--right">STAGE 02 <span>THE HUMAN CONNECTION</span></div>
        <svg class="map-connections" viewBox="0 0 1000 408" preserveAspectRatio="none" aria-hidden="true">
          <path d="M500 204 C397 204 386 64 270 64" />
          <path d="M500 204 C390 204 390 204 270 204" />
          <path d="M500 204 C397 204 386 344 270 344" />
          <path d="M500 204 C603 204 614 64 730 64" />
          <path d="M500 204 C610 204 610 204 730 204" />
          <path d="M500 204 C603 204 614 344 730 344" />
          <circle cx="500" cy="204" r="132" class="map-orbit" />
          <circle cx="500" cy="204" r="119" class="map-orbit map-orbit--inner" />
        </svg>
        <div class="archive-hub" aria-label="Hồ sơ loài voi, trung tâm bản đồ">
          <span class="archive-hub__orbit" aria-hidden="true"></span>
          <span class="archive-hub__inner">
            <span class="archive-hub__symbol" aria-hidden="true">✧</span>
            <strong>HỒ SƠ<br />LOÀI VOI</strong>
            <small>ELEPHANT ARCHIVE</small>
          </span>
        </div>
        <div class="archive-branches"></div>
      </div>
      <footer class="archive-footer">
        <div class="archive-progress">
          <span class="archive-progress__label">TIẾN ĐỘ PHỤC DỰNG</span>
          <div class="archive-progress__value"><strong>${progress}<span>/6</span></strong> <span>NHÁNH ĐÃ PHỤC DỰNG</span></div>
          <div class="archive-progress__track"><span style="width:${progress / 6 * 100}%"></span></div>
        </div>
        <div class="archive-actions">
          <button class="subtle-button archive-replay" type="button">↺ &nbsp; XEM LẠI CỐT TRUYỆN</button>
          <button class="primary-button archive-enter" type="button">ENTER ARCHIVE <span aria-hidden="true">↗</span></button>
          ${epilogueReady ? '<button class="primary-button archive-epilogue" type="button">EPILOGUE ✧</button>' : ''}
        </div>
      </footer>
      <div class="archive-toast" role="status" aria-live="polite" hidden></div>
    </section>
  `;

  const branches = root.querySelector('.archive-branches');
  KNOWLEDGE_BRANCHES.forEach((branch, index) => {
    const isRestored = restored.has(branch.id);
    const node = document.createElement('button');
    node.type = 'button';
    node.className = `archive-node archive-node--${index + 1}${isRestored ? ' is-restored' : ''}`;
    node.setAttribute('aria-label', `${branch.label}, Stage ${branch.stage}, ${isRestored ? 'đã phục dựng' : 'đang khóa'}`);
    node.innerHTML = `
      <span class="archive-node__number">${branch.num}</span>
      <span class="archive-node__content"><strong>${branch.label}</strong><small>${isRestored ? 'ĐÃ PHỤC DỰNG' : 'DỮ LIỆU CHƯA KHÔI PHỤC'}</small></span>
      ${isRestored ? '<span class="archive-node__check" aria-hidden="true">✓</span>' : lockSvg()}
    `;
    node.addEventListener('click', () => {
      const toast = root.querySelector('.archive-toast');
      const status = isRestored ? 'đã được phục dựng' : 'vẫn đang bị khóa';
      toast.textContent = `Nhánh “${branch.label}” ${status}. ${isRestored ? 'Nội dung chi tiết sẽ được bổ sung.' : `Thu thập bằng chứng ở Stage ${branch.stage} để mở khóa.`}`;
      toast.hidden = false;
    });
    branches.appendChild(node);
  });

  const enter = root.querySelector('.archive-enter');
  const replay = root.querySelector('.archive-replay');
  enter.addEventListener('click', onEnter);
  replay.addEventListener('click', onReplay);
  const epilogue = root.querySelector('.archive-epilogue');
  if (epilogue && onEpilogue) epilogue.addEventListener('click', onEpilogue);

  return () => {
    enter.removeEventListener('click', onEnter);
    replay.removeEventListener('click', onReplay);
    if (epilogue && onEpilogue) epilogue.removeEventListener('click', onEpilogue);
  };
}
