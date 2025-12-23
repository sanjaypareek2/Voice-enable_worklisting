const STORAGE_KEY = 'chemcraft-state-v1';

export function loadState(defaultState) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch (e) {
    return defaultState;
  }
}

export function saveState(state) {
  const snapshot = {
    discovered: state.discovered,
    inventory: state.inventory,
    xp: state.xp,
    level: state.level,
    heatOn: state.heatOn
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
}
