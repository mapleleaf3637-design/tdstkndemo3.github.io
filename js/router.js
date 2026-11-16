import { updateGameState, canAccessEpilogue } from './gameState.js';
import { ProloguePlayer } from './components/ProloguePlayer.js';
import { mountArchiveEntry } from './screens/ArchiveEntry.js';
import { mountStage1 } from './stages/stage1.js';
import { mountStage2 } from './stages/stage2.js';
import { mountEpilogue } from './screens/Epilogue.js';

const routeNames = new Set(['prologue', 'archive', 'stage-1', 'stage-2', 'epilogue', 'epilogue-preview']);
const pageTitles = {
  prologue: 'Prologue',
  archive: 'Bản đồ tri thức',
  'stage-1': 'Stage 1 – The Forgotten Species',
  'stage-2': 'Stage 2 – The Human Connection',
  epilogue: 'Epilogue',
  'epilogue-preview': 'Epilogue · Bản xem thử',
};

let root;
let cleanupActive = () => {};

function requestedRoute() {
  return window.location.hash.replace(/^#\/?/, '').split('?')[0];
}

function readRoute() {
  const requested = requestedRoute();
  return routeNames.has(requested) ? requested : 'prologue';
}

function renderRoute() {
  if (!root) return;
  // Route-level guard also protects direct #/epilogue navigation and refreshes.
  if (readRoute() === 'epilogue' && !canAccessEpilogue()) {
    navigate('archive', { replace: true });
    return;
  }
  cleanupActive();
  cleanupActive = () => {};
  root.replaceChildren();
  const route = readRoute();
  document.title = `${pageTitles[route]} | The Lost Elephant Archive`;
  // Preview is deliberately read-only with respect to the saved game.
  if (route !== 'epilogue-preview') updateGameState({ currentStage: route });

  switch (route) {
    case 'prologue': {
      const player = new ProloguePlayer(root, {
        onComplete: () => {
          updateGameState({ prologueStatus: 'completed' });
          showArchiveEntry();
        },
        onSkip: () => {
          updateGameState({ prologueStatus: 'skipped' });
          showArchiveEntry();
        },
      });
      player.mount();
      cleanupActive = () => player.destroy();
      break;
    }
    case 'archive':
      cleanupActive = mountArchiveEntry(root, { onEnter: startStage1, onReplay: showPrologue, onEpilogue: showEpilogue });
      break;
    case 'stage-1':
      cleanupActive = mountStage1(root, { onBack: showArchiveEntry });
      break;
    case 'stage-2':
      cleanupActive = mountStage2(root, { onBack: showArchiveEntry });
      break;
    case 'epilogue':
      cleanupActive = mountEpilogue(root, { onBack: showArchiveEntry });
      break;
    case 'epilogue-preview':
      // Story-only preview, not a completion or a bypass of the real game.
      cleanupActive = mountEpilogue(root, { onBack: showArchiveEntry, preview: true });
      break;
  }
}

export function navigate(route, { replace = false } = {}) {
  if (!routeNames.has(route)) throw new Error(`Unknown route: ${route}`);
  const nextHash = `#/${route}`;
  if (window.location.hash === nextHash) {
    renderRoute(); // Allows replaying the prologue from the beginning.
  } else if (replace) {
    window.history.replaceState(null, '', nextHash);
    renderRoute(); // replaceState does not dispatch hashchange.
  } else {
    window.location.hash = nextHash; // hashchange handles the screen swap.
  }
}

export const showPrologue = () => navigate('prologue');
export const showArchiveEntry = () => navigate('archive');
export const showMindmap = showArchiveEntry;
export const startStage1 = () => navigate('stage-1');
export const startStage2 = () => navigate('stage-2');
export const showEpilogue = () => navigate('epilogue');
export const showEpiloguePreview = () => navigate('epilogue-preview');

export function initRouter(element) {
  root = element;
  window.addEventListener('hashchange', renderRoute);
  if (!window.location.hash || !routeNames.has(requestedRoute())) {
    navigate('prologue', { replace: true });
  } else {
    renderRoute();
  }
}
