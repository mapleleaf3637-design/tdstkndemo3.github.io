import { LAST_MESSAGES, findLastMessage } from '../data/epilogue-scenes.js';
import { escapeHTML } from './EpilogueUI.js';

/** Reflective choice; every option is valid and the player can revise before confirming. */
export function mountFinalMessageChoice(host, { savedId, onConfirm, onBack }) {
  let selected = findLastMessage(savedId)?.id || null;
  let submitted = false;
  host.innerHTML = `
    <section class="epi-workspace epi-workspace--choice" aria-labelledby="epi-choice-heading">
      <div class="epi-workspace__heading epi-workspace__heading--compact">
        <div><p class="epi-kicker">04 / THE LAST MESSAGE</p><h1 id="epi-choice-heading">Chọn <em>thông điệp cuối cùng</em></h1></div>
        <p>Hãy chọn điều bạn muốn lưu giữ cùng hồ sơ về loài voi. Không có đáp án đúng hoặc sai.</p>
      </div>
      <div class="epi-choice-grid" role="group" aria-label="Ba thông điệp cuối cùng">
        ${LAST_MESSAGES.map((m) => `<button type="button" class="epi-message-card" data-message="${escapeHTML(m.id)}" aria-pressed="false">
          <span class="epi-message-card__icon" aria-hidden="true">${escapeHTML(m.icon)}</span>
          <strong>${escapeHTML(m.title)}</strong>
          <span>${escapeHTML(m.text)}</span>
        </button>`).join('')}
      </div>
      <div class="epi-message-preview" aria-live="polite"><span>XEM TRƯỚC THÔNG ĐIỆP</span><p class="epi-message-preview__text">Chọn một thông điệp để xem trước.</p></div>
      <div class="epi-workspace__actions"><button type="button" class="epi-tertiary" data-prev>← QUAY LẠI</button><button type="button" class="epi-action" data-confirm disabled>XÁC NHẬN THÔNG ĐIỆP <span aria-hidden="true">→</span></button></div>
    </section>`;
  const buttons = [...host.querySelectorAll('[data-message]')];
  const confirmButton = host.querySelector('[data-confirm]');
  const preview = host.querySelector('.epi-message-preview__text');
  const redraw = () => {
    const message = findLastMessage(selected);
    buttons.forEach((btn) => {
      const active = btn.dataset.message === selected;
      btn.classList.toggle('is-selected', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    preview.textContent = message?.text || 'Chọn một thông điệp để xem trước.';
    confirmButton.disabled = !message;
  };
  buttons.forEach((button) => button.addEventListener('click', () => {
    if (submitted) return;
    selected = button.dataset.message;
    redraw();
  }));
  confirmButton.addEventListener('click', () => {
    if (submitted) return;
    const choice = findLastMessage(selected);
    if (!choice) return;
    submitted = true;
    confirmButton.disabled = true;
    onConfirm({ id: choice.id, title: choice.title, text: choice.text });
  });
  host.querySelector('[data-prev]').addEventListener('click', onBack);
  redraw();
}
