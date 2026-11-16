/**
 * Browser chrome (the URL/address bar) is controlled by the browser itself.
 * This module uses the Fullscreen API only after a real user click and provides
 * instructions for home-screen installation when full screen is unavailable.
 */
const FULLSCREEN_SELECTOR = '[data-fullscreen-toggle]';
let messageTimer;

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true;
}

function showNotice(message) {
  let notice = document.getElementById('immersive-notice');
  if (!notice) {
    notice = document.createElement('div');
    notice.id = 'immersive-notice';
    notice.className = 'immersive-notice';
    notice.setAttribute('role', 'status');
    notice.setAttribute('aria-live', 'polite');
    document.body.append(notice);
  }
  notice.textContent = message;
  notice.hidden = false;
  window.clearTimeout(messageTimer);
  messageTimer = window.setTimeout(() => { notice.hidden = true; }, 6500);
}

function syncButtons() {
  const isFullscreen = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  document.querySelectorAll(FULLSCREEN_SELECTOR).forEach((button) => {
    button.setAttribute('aria-pressed', String(isFullscreen));
    button.setAttribute('aria-label', isFullscreen ? 'Thoát toàn màn hình' : 'Bật chế độ toàn màn hình');
    button.title = isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình · Ẩn thanh địa chỉ nếu trình duyệt hỗ trợ';
    // Installed PWA/shortcuts already remove the URL bar: avoid wasting toolbar space.
    button.hidden = isStandalone() && !isFullscreen;
  });
}

async function toggleFullscreen() {
  const doc = document;
  const root = doc.documentElement;
  const currentlyFullscreen = Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
  try {
    if (currentlyFullscreen) {
      const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
      if (typeof exit !== 'function') throw new Error('Fullscreen exit unavailable');
      await exit.call(doc);
    } else {
      const enter = root.requestFullscreen || root.webkitRequestFullscreen;
      if (typeof enter !== 'function') throw new Error('Fullscreen unavailable');
      await enter.call(root, { navigationUI: 'hide' });
    }
    syncButtons();
  } catch (_) {
    showNotice('Trình duyệt chưa cho phép toàn màn hình. Trên Chrome Android: ⋮ → Thêm vào màn hình chính → Cài đặt ứng dụng để chơi không có thanh địa chỉ.');
  }
}

export function initFullscreen() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest(FULLSCREEN_SELECTOR);
    if (!button) return;
    event.preventDefault();
    // This click originated from a real control. Screen navigation ignores buttons.
    void toggleFullscreen();
  });
  document.addEventListener('fullscreenchange', syncButtons);
  document.addEventListener('webkitfullscreenchange', syncButtons);
  window.addEventListener('pageshow', syncButtons);
  window.addEventListener('resize', syncButtons);
  const observer = new MutationObserver((mutations) => {
    // Prologue / Archive are re-mounted when navigating via the hash router.
    if (mutations.some((mutation) => Array.from(mutation.addedNodes).some((node) =>
      node.nodeType === Node.ELEMENT_NODE &&
      (node.matches?.(FULLSCREEN_SELECTOR) || node.querySelector?.(FULLSCREEN_SELECTOR))))) {
      syncButtons();
    }
  });
  observer.observe(document.querySelector('#app'), { childList: true, subtree: true });
  syncButtons();
}
