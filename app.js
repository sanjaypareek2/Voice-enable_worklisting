import { items, itemMap, baseInventory, levelTwoUnlocks, levelNames, levelThresholds } from './data/items.js';
import { recipeMap, canonicalKey } from './data/recipes.js';
import { loadState, saveState, resetState } from './utils/storage.js';

const inventoryList = document.getElementById('inventory-list');
const discoveriesList = document.getElementById('discoveries-list');
const heatToggle = document.getElementById('heat-toggle');
const levelLabel = document.getElementById('level-label');
const levelNameEl = document.getElementById('level-name');
const xpNumeric = document.getElementById('xp-numeric');
const xpFill = document.getElementById('xp-fill');
const lastResult = document.getElementById('last-result');
const craftInfo = document.getElementById('craft-info');
const resetBtn = document.getElementById('reset-btn');

const defaultState = {
  discovered: [],
  inventory: [...baseInventory],
  xp: 0,
  level: 1,
  heatOn: false
};

let state = loadState(defaultState);

initLevelUnlocks(state.level);
renderAll();
attachEvents();

function attachEvents() {
  heatToggle.addEventListener('change', () => {
    state.heatOn = heatToggle.checked;
    saveState(state);
  });

  resetBtn.addEventListener('click', () => {
    resetState();
    location.reload();
  });
}

function renderAll() {
  renderHeader();
  renderInventory();
  renderDiscoveries();
}

function renderHeader() {
  levelLabel.textContent = state.level;
  levelNameEl.textContent = levelNames[state.level];
  xpNumeric.textContent = `${state.xp} XP`;
  const threshold = levelThresholds[state.level + 1] || levelThresholds[levelThresholds.length - 1];
  const prevThreshold = levelThresholds[state.level] || 0;
  const progressRange = threshold - prevThreshold;
  const clampedXp = Math.max(0, Math.min(state.xp - prevThreshold, progressRange));
  const percent = progressRange ? (clampedXp / progressRange) * 100 : 100;
  xpFill.style.width = `${percent}%`;
  heatToggle.disabled = state.level < 3;
  heatToggle.checked = state.level >= 3 && state.heatOn;
}

function renderInventory() {
  inventoryList.innerHTML = '';
  state.inventory.forEach((id) => {
    const item = itemMap[id];
    if (!item) return;
    const tile = document.createElement('div');
    tile.className = 'inventory-tile';
    tile.draggable = true;
    tile.dataset.id = id;
    tile.innerHTML = `
      <div class="tile-title">${item.name}</div>
      <div class="tile-meta">${item.formula}</div>
    `;

    tile.addEventListener('dragstart', (e) => {
      tile.classList.add('dragging');
      e.dataTransfer.setData('text/plain', id);
    });

    tile.addEventListener('dragend', () => tile.classList.remove('dragging'));
    tile.addEventListener('dragover', (e) => e.preventDefault());
    tile.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');
      if (!draggedId || draggedId === id) return;
      attemptCraft(draggedId, id);
    });

    inventoryList.appendChild(tile);
  });
}

function renderDiscoveries() {
  discoveriesList.innerHTML = '';
  state.discovered.forEach((id) => {
    const item = itemMap[id];
    if (!item) return;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-title">${item.name}</div>
      <div class="card-formula">${item.formula}</div>
    `;
    const tagsRow = document.createElement('div');
    tagsRow.className = 'card-tags';

    const tagBadge = document.createElement('span');
    tagBadge.className = 'badge muted';
    tagBadge.textContent = item.tag;
    tagsRow.appendChild(tagBadge);

    if (state.level >= 2 && item.state) {
      const stateBadge = document.createElement('span');
      stateBadge.className = 'badge';
      stateBadge.textContent = item.state;
      tagsRow.appendChild(stateBadge);
    }

    if (state.level >= 4 && item.rarity) {
      const rarityBadge = document.createElement('span');
      rarityBadge.className = 'badge rare';
      rarityBadge.textContent = item.rarity;
      tagsRow.appendChild(rarityBadge);
    }

    card.appendChild(tagsRow);
    discoveriesList.appendChild(card);
  });
}

function attemptCraft(aId, bId) {
  const key = canonicalKey(aId, bId);
  const recipe = recipeMap[key];
  const itemA = itemMap[aId];
  const itemB = itemMap[bId];

  if (!recipe) {
    showToast('No reaction.');
    updateCraftInfo(itemA, itemB, null);
    return;
  }

  if (recipe.requiresHeat && !state.heatOn) {
    showToast('Heat required.');
    updateCraftInfo(itemA, itemB, null);
    return;
  }

  const resultItem = itemMap[recipe.result];
  if (!resultItem) return;

  const isNew = !state.discovered.includes(resultItem.id);
  if (isNew) {
    state.discovered.unshift(resultItem.id);
    if (!state.inventory.includes(resultItem.id)) {
      state.inventory.push(resultItem.id);
    }
    gainXp(20);
    renderDiscoveries();
  } else {
    gainXp(5);
  }

  updateCraftInfo(itemA, itemB, resultItem);
  renderInventory();
  renderHeader();
  saveState(state);
}

function updateCraftInfo(a, b, result) {
  craftInfo.textContent = `${a?.name || 'Unknown'} + ${b?.name || 'Unknown'}`;
  if (result) {
    lastResult.textContent = `Result: ${result.name} (${result.formula})`;
  } else {
    lastResult.textContent = 'Result: none';
  }
}

function gainXp(amount) {
  state.xp += amount;
  const prevLevel = state.level;
  updateLevel();
  if (state.level !== prevLevel) {
    handleLevelUp();
  }
  saveState(state);
  renderHeader();
}

function updateLevel() {
  let newLevel = state.level;
  for (let i = levelThresholds.length - 1; i >= 1; i--) {
    if (state.xp >= levelThresholds[i]) {
      newLevel = Math.min(i, 4);
      break;
    }
  }
  state.level = newLevel;
}

function handleLevelUp() {
  showToast(`Level Up: ${levelNames[state.level]}`);
  initLevelUnlocks(state.level);
  renderInventory();
  renderDiscoveries();
}

function initLevelUnlocks(level) {
  if (level >= 2) {
    levelTwoUnlocks.forEach((id) => {
      if (!state.inventory.includes(id)) state.inventory.push(id);
    });
  }
  if (level < 3) {
    state.heatOn = false;
  }
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2000);
}
