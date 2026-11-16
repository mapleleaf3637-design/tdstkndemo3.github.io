import { EPILOGUE_EVIDENCE, FINAL_DISCOVERY } from '../data/epilogue-scenes.js';
import { escapeHTML } from './EpilogueUI.js';
import { evidenceThumbnail } from './EvidenceComparison.js';

/**
 * One synthesis question. Wrong answers are informative and retryable.
 * Correct answers are stored by the screen controller, not by this view.
 */
export function mountFinalQuestion(host, { onInspect, onCorrect, onContinue, onBack }) {
  let completed = false;
  host.innerHTML = `
    <section class="epi-workspace epi-workspace--question" aria-label="Câu hỏi khám phá cuối cùng">
      <div class="epi-question-layout">
        <aside class="epi-question-evidence" aria-label="Hai tư liệu để đối chiếu">
          <p class="epi-kicker">ĐỐI CHIẾU TƯ LIỆU</p>
          <div class="epi-question-evidence__grid">
            ${EPILOGUE_EVIDENCE.map((entry) => `<div class="epi-mini-card">
              ${evidenceThumbnail(entry, true)}
              <strong>${escapeHTML(entry.eyebrow)}</strong>
            </div>`).join('')}
          </div>
          <p>Chạm vào hình ảnh để xem lớn và đọc thông tin nguồn.</p>
        </aside>
        <div class="epi-question-main">
          <p class="epi-kicker">03 / ${escapeHTML(FINAL_DISCOVERY.heading)}</p>
          <h1>${escapeHTML(FINAL_DISCOVERY.question)}</h1>
          <div class="epi-answer-options" role="group" aria-label="Chọn câu trả lời">
            ${FINAL_DISCOVERY.options.map((choice) => `<button class="epi-answer" type="button" data-answer="${choice.id}" aria-pressed="false"><span class="epi-answer__letter">${choice.id}</span><span>${escapeHTML(choice.text)}</span></button>`).join('')}
          </div>
          <div class="epi-feedback" role="status" aria-live="polite" hidden></div>
        </div>
      </div>
      <div class="epi-workspace__actions"><button type="button" class="epi-tertiary" data-prev>← XEM LẠI TƯ LIỆU</button><button type="button" class="epi-action" data-next hidden>TIẾP TỤC <span aria-hidden="true">→</span></button></div>
    </section>`;
  const answers = [...host.querySelectorAll('[data-answer]')];
  const feedback = host.querySelector('.epi-feedback');
  const next = host.querySelector('[data-next]');
  for (const button of answers) {
    button.addEventListener('click', () => {
      if (completed) return;
      const selectedId = button.dataset.answer;
      const correct = selectedId === FINAL_DISCOVERY.correctId;
      for (const option of answers) {
        const selected = option.dataset.answer === selectedId;
        option.classList.toggle('is-selected', selected);
        option.classList.toggle('is-incorrect', selected && !correct);
        option.classList.toggle('is-correct', selected && correct);
        option.setAttribute('aria-pressed', String(selected));
      }
      feedback.hidden = false;
      feedback.classList.toggle('is-correct', correct);
      feedback.classList.toggle('is-incorrect', !correct);
      feedback.textContent = correct ? FINAL_DISCOVERY.feedbackCorrect : FINAL_DISCOVERY.feedbackIncorrect;
      if (correct) {
        completed = true;
        answers.forEach((item) => { item.disabled = true; });
        next.hidden = false;
        onCorrect();
      }
    });
  }
  host.querySelectorAll('[data-inspect]').forEach((button) => button.addEventListener('click', () => onInspect(button.dataset.inspect)));
  next.addEventListener('click', () => { if (completed) onContinue(); });
  host.querySelector('[data-prev]').addEventListener('click', onBack);
}
