import { imagePathFor } from '../config.js';
import { getGameState } from '../gameState.js';

/**
 * Replace the body of this function with your Stage 1 gameplay module.
 * DO NOT read prologueStatus as a substitute for stage1TutorialCompleted.
 * When you later implement the tutorial, show it whenever
 * getGameState().stage1TutorialCompleted === false — including after Skip.
 */
export function mountStage1(root, { onBack }) {
  const state = getGameState();
  root.innerHTML = `
    <section class="stage-screen" style="--stage-bg: url('${imagePathFor(5)}')" aria-label="Stage 1: The Forgotten Species">
      <div class="stage-backdrop" aria-hidden="true"></div>
      <header class="stage-topbar"><span>THE LOST ELEPHANT ARCHIVE</span><span>STAGE 01 / 02</span><span class="stage-topbar__actions"><button type="button" class="game-fullscreen" data-fullscreen-toggle aria-label="Bật chế độ toàn màn hình" aria-pressed="false" title="Toàn màn hình">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" /></svg>
            </button></span></header>
      <div class="stage-card">
        <span class="eyebrow">STAGE 1 <span aria-hidden="true">/</span> THE FORGOTTEN SPECIES</span>
        <h1>Những dấu vết<br /><em>bị lãng quên</em></h1>
        <p>Bạn sẽ tìm hiểu về <strong>tập tính</strong>, <strong>thuần dưỡng</strong> và <strong>chăm sóc</strong> voi để phục dựng ba nhánh tri thức đầu tiên.</p>
        <div class="stage-tutorial" aria-label="Hướng dẫn trước khi chơi Stage 1">
          <span class="stage-tutorial__title">HƯỚNG DẪN STAGE 1</span>
          <div class="stage-tutorial__steps">
            <span><b>01</b> Quan sát tư liệu</span>
            <span><b>02</b> Thu thập bằng chứng</span>
            <span><b>03</b> Kết nối tri thức</span>
          </div>
          <p>Đây là màn hình chờ dành cho phiên bản đầu tiên. Phần tương tác và hướng dẫn chi tiết của Stage 1 sẽ được tích hợp vào đây sau. ${state.stage1TutorialCompleted ? 'Bạn đã có cờ hoàn thành hướng dẫn.' : 'Hướng dẫn chưa được đánh dấu hoàn thành, kể cả khi bạn bỏ qua Prologue.'}</p>
        </div>
        <button type="button" class="primary-button stage-back">← &nbsp; QUAY LẠI BẢN ĐỒ</button>
      </div>
    </section>
  `;
  const back = root.querySelector('.stage-back');
  back.addEventListener('click', onBack);
  return () => back.removeEventListener('click', onBack);
}
