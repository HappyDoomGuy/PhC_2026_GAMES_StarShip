/**
 * UI: панели, экраны, оверлеи
 */

import { INGREDIENTS, GRAY } from './config.js';

let collectBar;
let levelDisplay, scoreDisplay, livesDisplay, comboDisplay;
let mainMenu, levelComplete, gameOverScreen;
let startBtn, nextLevelBtn;

export function initUI() {
  collectBar = document.getElementById('collect-bar');
  levelDisplay = document.getElementById('level-display');
  scoreDisplay = document.getElementById('score-display');
  livesDisplay = document.getElementById('lives-display');
  comboDisplay = document.getElementById('combo-display');
  mainMenu = document.getElementById('main-menu');
  levelComplete = document.getElementById('level-complete');
  gameOverScreen = document.getElementById('game-over');
  startBtn = document.getElementById('start-btn');
  nextLevelBtn = document.getElementById('next-level-btn');
}

export function buildPanels() {
  if (!collectBar) return;
  collectBar.innerHTML = '';
  const half = Math.ceil(INGREDIENTS.length / 2);
  const row1 = document.createElement('div');
  row1.className = 'collect-row collect-row-1';
  const row2 = document.createElement('div');
  row2.className = 'collect-row collect-row-2';
  INGREDIENTS.slice(0, half).forEach(ing => addSlot(row1, ing));
  INGREDIENTS.slice(half).forEach(ing => addSlot(row2, ing));
  collectBar.appendChild(row1);
  collectBar.appendChild(row2);
}

function addSlot(container, ing) {
  const el = document.createElement('div');
  el.className = 'ingredient-slot';
  el.dataset.id = ing.id;
  el.style.color = GRAY;
  el.textContent = ing.name;
  container.appendChild(el);
}

export function resetCollectibles() {
  document.querySelectorAll('.ingredient-slot').forEach(el => {
    el.classList.remove('collected');
    el.style.background = '';
    el.style.color = GRAY;
  });
}

export function updateSlot(id) {
  const ing = INGREDIENTS.find(i => i.id === id);
  const el = document.querySelector(`.ingredient-slot[data-id="${id}"]`);
  if (el && ing) {
    el.classList.add('collected');
    el.style.background = ing.color;
    el.style.color = ing.color;
  }
}

export function setLevel(level) {
  levelDisplay.textContent = `Lv.${level}`;
}

export function setScore(score, record) {
  if (scoreDisplay) scoreDisplay.textContent = score.toLocaleString();
  const recordEl = document.getElementById('record-display-inline');
  if (recordEl) recordEl.textContent = (record || 0).toLocaleString();
}

export function showFloatingPoints(x, y, points) {
  const container = document.getElementById('floating-points');
  if (!container) return;
  const el = document.createElement('div');
  let cls = 'floating-point';
  if (points < 0) cls += ' floating-point-negative';
  else if (points > 10) cls += ' floating-point-bonus';
  el.className = cls;
  el.textContent = points > 0 ? `+${points}` : `${points}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.transform = 'translate(-50%, -50%)';
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('floating-point-visible'));
  setTimeout(() => el.remove(), 1100);
}

export function showFloatingVitaminName(x, y, fullName) {
  const container = document.getElementById('floating-points');
  if (!container || !fullName) return;
  const el = document.createElement('div');
  el.className = 'floating-point floating-vitamin-name';
  el.textContent = fullName;
  el.style.left = `${x}px`;
  el.style.top = `${y - 18}px`;
  el.style.transform = 'translate(-50%, -50%)';
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('floating-point-visible'));
  setTimeout(() => el.remove(), 1100);
}

export function setLives(lives) {
  if (!livesDisplay) return;
  livesDisplay.innerHTML = '♥'.repeat(lives) + '♡'.repeat(Math.max(0, 3 - lives));
  livesDisplay.title = `Жизни: ${lives}/3`;
}

export function setActiveBonuses(bonuses) {
  const el = document.getElementById('active-bonuses');
  if (!el) return;
  const now = performance.now();
  const parts = [];
  if (bonuses.magnet > now) {
    const s = Math.ceil((bonuses.magnet - now) / 1000);
    parts.push(`<span class="bonus-tag magnet"><span class="bonus-icon">🧲</span> ${s}с</span>`);
  }
  if (bonuses.slowdown > now) {
    const s = Math.ceil((bonuses.slowdown - now) / 1000);
    parts.push(`<span class="bonus-tag slowdown"><span class="bonus-icon">⌛</span> ${s}с</span>`);
  }
  if (bonuses.shield > now) {
    const s = Math.ceil((bonuses.shield - now) / 1000);
    parts.push(`<span class="bonus-tag shield"><span class="bonus-icon">🛡</span> ${s}с</span>`);
  }
  el.innerHTML = parts.join('');
  el.style.display = parts.length ? 'flex' : 'none';
}

export function setCombo(combo, multiplier = 1, tierIndex = 1) {
  if (!comboDisplay) return;
  if (combo <= 0) {
    comboDisplay.style.display = 'none';
    comboDisplay.className = 'combo-display';
    return;
  }
  comboDisplay.style.display = 'flex';
  comboDisplay.className = `combo-display combo-tier-${tierIndex}`;
  const multStr = multiplier % 1 === 0 ? multiplier : multiplier.toFixed(1);
  comboDisplay.innerHTML = `
    <span class="combo-label">${multiplier > 1 ? 'x' + multStr + ' МНОЖИТЕЛЬ' : 'СЕРИЯ'}</span>
    <span class="combo-count">${combo}</span>
  `;
  comboDisplay.classList.remove('combo-pop');
  void comboDisplay.offsetWidth;
  comboDisplay.classList.add('combo-pop');
}

export function showComboMilestone(multiplier) {
  const container = document.getElementById('milestone-messages');
  if (!container) return;
  const el = document.createElement('div');
  const multStr = multiplier % 1 === 0 ? multiplier : multiplier.toFixed(1);
  el.className = 'milestone-message milestone-tier';
  el.innerHTML = `<span class="milestone-text">x${multStr} МНОЖИТЕЛЬ!</span>`;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('visible'));
  setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => el.remove(), 400);
  }, 1800);
}

export function showMainMenu() {
  if (mainMenu) mainMenu.style.display = 'flex';
  levelComplete && (levelComplete.style.display = 'none');
  gameOverScreen && (gameOverScreen.style.display = 'none');
}

export function hideMainMenu() {
  if (mainMenu) mainMenu.style.display = 'none';
}

export function showLevelComplete(level, stars = 1) {
  levelComplete.style.display = 'flex';
  document.querySelector('#level-complete h2').textContent = `Супрадин собран! Уровень ${level}`;
  const starsEl = document.getElementById('level-stars');
  if (starsEl) {
    starsEl.innerHTML = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    starsEl.className = `stars stars-${stars}`;
  }
}

export function hideLevelComplete() {
  levelComplete.style.display = 'none';
}

export function showGameOver(stats) {
  const el = document.getElementById('game-over');
  if (!el) return;
  const set = (id, val) => {
    const node = document.getElementById(id);
    if (node) node.textContent = String(val ?? 0);
  };
  set('go-level', stats.level);
  set('go-score', stats.score?.toLocaleString?.() ?? stats.score);
  set('go-record', stats.record?.toLocaleString?.() ?? stats.record);
  set('go-combo', stats.maxCombo);
  set('go-record-combo', stats.recordCombo);
  set('go-levels-done', stats.levelsCompleted);
  el.classList.add('game-over-visible');
  el.style.display = 'flex';
  el.style.visibility = 'visible';
}

export function hideGameOver() {
  const el = document.getElementById('game-over');
  if (el) {
    el.classList.remove('game-over-visible');
    el.style.display = 'none';
  }
}

export function getStartButton() {
  return startBtn;
}

export function getNextLevelButton() {
  return nextLevelBtn;
}

export function getGameArea() {
  return document.getElementById('game-area');
}
