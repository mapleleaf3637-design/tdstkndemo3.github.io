import { EPILOGUE_EVIDENCE } from '../data/epilogue-scenes.js';
import { escapeHTML, safeExternalUrl } from './EpilogueUI.js';

export function sourceMarkup(evidence) {
  const s = evidence.source;
  const year = s.year ? ` · ${escapeHTML(s.year)}` : '';
  const verifiedLink = s.status === 'verified' ? safeExternalUrl(s.url) : null;
  const title = verifiedLink
    ? `<a href="${escapeHTML(verifiedLink)}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.title)}</a>`
    : escapeHTML(s.title);
  const flag = s.status === 'needs-verification'
    ? '<span class="epi-source__pending">DỰ THẢO · CHƯA XÁC MINH NGUỒN</span>'
    : `<span class="epi-source__type">${s.status === 'verified' ? 'NGUỒN CÓ LIÊN KẾT XÁC MINH' : 'THAM CHIẾU TRƯNG BÀY'}</span>`;
  return `<div class="epi-source">${flag}<span>${title}${year}</span></div>`;
}

/** This component is used both in comparison and in the question's mini-gallery. */
export function evidenceThumbnail(evidence, compact = false) {
  return `<button type="button" class="epi-evidence-zoom ${compact ? 'epi-evidence-zoom--mini' : ''}" data-inspect="${escapeHTML(evidence.id)}" aria-label="Xem lớn tư liệu ${escapeHTML(evidence.eyebrow)}">
    <img src="${escapeHTML(evidence.image)}" alt="${escapeHTML(evidence.imageAlt)}" ${compact ? 'loading="lazy"' : ''} />
    <span aria-hidden="true">↗</span>
  </button>`;
}

export function mountEvidenceComparison(host, { onInspect, onContinue, onBack }) {
  host.innerHTML = `
    <section class="epi-workspace epi-workspace--comparison" aria-labelledby="epi-comparison-heading">
      <div class="epi-workspace__heading">
        <div><p class="epi-kicker">02 / THEN & NOW</p><h1 id="epi-comparison-heading">Một mối quan hệ <em>đang thay đổi</em></h1></div>
        <p>Hãy quan sát hai tư liệu và suy ngẫm về những thay đổi trong cách con người chung sống với voi.</p>
      </div>
      <div class="epi-evidence-grid">
        ${EPILOGUE_EVIDENCE.map((evidence) => `<article class="epi-evidence-card epi-evidence-card--${escapeHTML(evidence.id)}">
          ${evidenceThumbnail(evidence)}
          <div class="epi-evidence-card__copy">
            <span class="epi-evidence-card__eyebrow">${escapeHTML(evidence.eyebrow)}</span>
            <h2>${escapeHTML(evidence.name)}</h2>
            <p>${escapeHTML(evidence.description)}</p>
            ${sourceMarkup(evidence)}
          </div>
        </article>`).join('')}
      </div>
      <div class="epi-workspace__actions"><button type="button" class="epi-tertiary" data-prev>← QUAY LẠI</button><button type="button" class="epi-action" data-next>TIẾP TỤC <span aria-hidden="true">→</span></button></div>
    </section>`;
  host.querySelectorAll('[data-inspect]').forEach((button) => button.addEventListener('click', () => onInspect(button.dataset.inspect)));
  host.querySelector('[data-next]').addEventListener('click', onContinue);
  host.querySelector('[data-prev]').addEventListener('click', onBack);
}
