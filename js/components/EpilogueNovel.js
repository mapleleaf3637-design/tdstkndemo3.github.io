import { TYPEWRITER_MS } from '../config.js';

const SETTINGS_KEY = 'lost-elephant-archive:typewriter';
const TAP_GUARD_MS = 155;

function typewriterEnabled() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try { return window.localStorage.getItem(SETTINGS_KEY) !== 'off'; } catch (_) { return true; }
}

/**
 * Minimal visual novel dialogue player, compatible with the Prologue controls.
 * The Epilogue controller owns scenes; this component owns only dialogue typing.
 * It intentionally never auto-advances on a timer.
 */
export class EpilogueNovel {
  constructor(host, { onDone, onBeforeFirst }) {
    this.host = host;
    this.onDone = onDone;
    this.onBeforeFirst = onBeforeFirst;
    this.lines = [];
    this.index = 0;
    this.isTyping = false;
    this.timer = null;
    this.token = 0;
    this.lastNavigationAt = -Infinity;
    this.destroyed = false;
  }

  start(lines, startIndex = 0) {
    this.clearTimer();
    this.destroyed = false;
    this.lines = lines;
    this.host.innerHTML = `
      <div class="epi-dialogue" aria-label="Nhật ký nghiên cứu">
        <div class="epi-dialogue__top"><span>✧ &nbsp; NHẬT KÝ NGHIÊN CỨU</span><span class="epi-dialogue__count"></span></div>
        <p class="epi-dialogue__body" aria-hidden="true"></p>
        <span class="sr-only epi-dialogue__accessible" aria-live="polite"></span>
        <div class="epi-dialogue__footer">
          <span class="epi-dialogue__back">← CHẠM TRÁI ĐỂ QUAY LẠI</span>
          <span class="epi-dialogue__hint">CHẠM PHẢI ĐỂ TIẾP TỤC <span aria-hidden="true">▸</span></span>
        </div>
      </div>`;
    this.display(startIndex);
  }

  clearTimer() {
    window.clearTimeout(this.timer);
    this.timer = null;
    this.token += 1;
    this.isTyping = false;
  }

  display(index) {
    this.clearTimer();
    this.index = index;
    const line = this.lines[index];
    const text = typeof line === 'string' ? line : line.text;
    const body = this.host.querySelector('.epi-dialogue__body');
    const readable = this.host.querySelector('.epi-dialogue__accessible');
    const hint = this.host.querySelector('.epi-dialogue__hint');
    if (!body || !readable) return;
    body.textContent = '';
    readable.textContent = text;
    this.host.querySelector('.epi-dialogue__count').textContent = `${String(index + 1).padStart(2, '0')} / ${String(this.lines.length).padStart(2, '0')}`;
    hint.innerHTML = 'CHẠM PHẢI ĐỂ HIỂN THỊ HẾT CHỮ <span aria-hidden="true">▸</span>';
    if (!typewriterEnabled()) {
      body.textContent = text;
      this.finishTyping();
      return;
    }
    const chars = Array.from(text);
    this.isTyping = true;
    const id = ++this.token;
    let offset = 0;
    const tick = () => {
      if (this.destroyed || id !== this.token) return;
      offset += 1;
      body.textContent = chars.slice(0, offset).join('');
      if (offset >= chars.length) this.finishTyping();
      else this.timer = window.setTimeout(tick, TYPEWRITER_MS);
    };
    this.timer = window.setTimeout(tick, TYPEWRITER_MS);
  }

  finishTyping() {
    this.isTyping = false;
    this.timer = null;
    const hint = this.host.querySelector('.epi-dialogue__hint');
    if (hint) hint.innerHTML = 'TIẾP TỤC <span aria-hidden="true">▸</span>';
  }

  reveal() {
    if (!this.isTyping) return;
    this.clearTimer();
    const line = this.lines[this.index];
    const body = this.host.querySelector('.epi-dialogue__body');
    if (body) body.textContent = typeof line === 'string' ? line : line.text;
    this.finishTyping();
  }

  /** Handles a single physical action, protected against double taps. */
  navigate(direction) {
    if (this.destroyed) return;
    const time = performance.now();
    if (time - this.lastNavigationAt < TAP_GUARD_MS) return;
    this.lastNavigationAt = time;
    if (direction === 'back') {
      if (this.index > 0) this.display(this.index - 1);
      else this.onBeforeFirst?.();
      return;
    }
    if (this.isTyping) return this.reveal();
    if (this.index < this.lines.length - 1) this.display(this.index + 1);
    else this.onDone?.();
  }

  destroy() {
    this.destroyed = true;
    this.clearTimer();
    this.host.replaceChildren();
  }
}
