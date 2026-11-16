/**
 * Lightweight progress model; story replay never resets stage progress.
 * No stage tutorial is marked complete from a prologue event.
 */
const STORAGE_KEY = 'lost-elephant-archive:v1';

const defaults = () => ({
  currentStage: 'prologue',
  completedStages: [],
  unlockedBranches: [],
  collectedEvidence: [],
  prologueStatus: 'not-started', // 'completed' | 'skipped'
  stage1TutorialCompleted: false,
  epilogueStarted: false,
  finalQuestionCompleted: false,
  finalMessageChoice: null,
  epilogueCompleted: false,
});

function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return defaults();
    const base = defaults();
    return {
      ...base,
      ...saved,
      completedStages: Array.isArray(saved.completedStages) ? saved.completedStages : [],
      unlockedBranches: Array.isArray(saved.unlockedBranches) ? saved.unlockedBranches : [],
      collectedEvidence: Array.isArray(saved.collectedEvidence) ? saved.collectedEvidence : [],
      // Old or malformed saves must not count as having watched the Stage 1 tutorial.
      stage1TutorialCompleted: saved.stage1TutorialCompleted === true,
      epilogueStarted: saved.epilogueStarted === true,
      finalQuestionCompleted: saved.finalQuestionCompleted === true,
      finalMessageChoice: saved.finalMessageChoice && typeof saved.finalMessageChoice === 'object' ? saved.finalMessageChoice : null,
      epilogueCompleted: saved.epilogueCompleted === true,
    };
  } catch (error) {
    console.warn('Could not load game progress; using a temporary session.', error);
    return defaults();
  }
}

let state = load();

export function getGameState() {
  return JSON.parse(JSON.stringify(state));
}

export function updateGameState(patch) {
  state = { ...state, ...patch };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Progress could not be saved in this browser.', error);
  }
  return getGameState();
}

/** Future stages can call this after a genuinely completed evidence challenge. */
export function restoreKnowledgeBranch(branchId) {
  const valid = ['behavior', 'domestication', 'care', 'culture', 'society', 'economy'];
  if (!valid.includes(branchId)) throw new Error(`Unknown branch: ${branchId}`);
  updateGameState({ unlockedBranches: [...new Set([...state.unlockedBranches, branchId])] });
}

/** Intentionally never called by the Prologue or Skip actions. */
export function setStage1TutorialCompleted() {
  updateGameState({ stage1TutorialCompleted: true });
}

/**
 * Real progress gate: a URL/hash alone never unlocks the Epilogue.
 * The Stage 1 and Stage 2 modules must genuinely complete their own tasks
 * before calling markStageCompleted. Placeholder screens do not call it.
 */
export const REQUIRED_EPILOGUE_BRANCHES = Object.freeze([
  'behavior', 'domestication', 'care', 'culture', 'society', 'economy',
]);
export const REQUIRED_EPILOGUE_STAGES = Object.freeze(['stage-1', 'stage-2']);

export function canAccessEpilogue(snapshot = getGameState()) {
  const stages = new Set(Array.isArray(snapshot.completedStages) ? snapshot.completedStages : []);
  const branches = new Set(Array.isArray(snapshot.unlockedBranches) ? snapshot.unlockedBranches : []);
  return REQUIRED_EPILOGUE_STAGES.every((id) => stages.has(id)) &&
    REQUIRED_EPILOGUE_BRANCHES.every((id) => branches.has(id));
}

/** Use ONLY at the real successful end of each future Stage's challenges. */
export function markStageCompleted(stageId) {
  if (!REQUIRED_EPILOGUE_STAGES.includes(stageId)) throw new Error(`Unknown stage: ${stageId}`);
  updateGameState({ completedStages: [...new Set([...state.completedStages, stageId])] });
}
