import { initRouter } from './router.js';
import { initFullscreen } from './fullscreen.js';

initFullscreen();
initRouter(document.querySelector('#app'));

/** An accessible way to keep playing if someone cannot physically rotate their device. */
document.querySelector('#portrait-continue')?.addEventListener('click', () => {
  document.body.classList.add('allow-portrait');
});

// For developers: import { restoreKnowledgeBranch } from './gameState.js'
// from a future stage module; do not toggle branch completion during a cutscene.
