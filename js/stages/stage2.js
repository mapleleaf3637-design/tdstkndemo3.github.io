import { imagePathFor } from '../config.js';

/** Future extension point. Intentionally not yet part of the playable prototype. */
export function mountStage2(root, { onBack }) {
  root.innerHTML = `
    <section class="stage-screen" style="--stage-bg: url('${imagePathFor(7)}')">
      <div class="stage-backdrop" aria-hidden="true"></div>
      <header class="stage-topbar"><span>THE LOST ELEPHANT ARCHIVE</span><span>STAGE 02 / 02</span><span class="stage-topbar__actions"><button type="button" class="game-fullscreen" data-fullscreen-toggle aria-label="Bật chế độ toàn màn hình" aria-pressed="false" title="Toàn màn hình">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" /></svg>
            </button></span></header>
      <div class="stage-card">
        <span class="eyebrow">STAGE 2 / THE HUMAN CONNECTION</span>
        <h1>Voi và <em>con người</em></h1>
        <p>Chặng tiếp theo sẽ khám phá các mối liên kết về văn hóa, xã hội và kinh tế.</p>
        <p class="stage-coming-soon">Stage 2 chưa được triển khai trong nguyên mẫu này.</p>
        <button type="button" class="primary-button stage-back">← &nbsp; QUAY LẠI BẢN ĐỒ</button>
      </div>
    </section>
  `;
  const back = root.querySelector('.stage-back');
  back.addEventListener('click', onBack);
  return () => back.removeEventListener('click', onBack);
}
