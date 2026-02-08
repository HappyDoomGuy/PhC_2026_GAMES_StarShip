/**
 * UI: панели, экраны, оверлеи
 */

import { INGREDIENTS, GRAY } from './config.js';

let leftPanel, rightPanel;
let levelDisplay, scoreDisplay, livesDisplay, comboDisplay;
let mainMenu, levelComplete, gameOverScreen;
let startBtn, nextLevelBtn;

export function initUI() {
  leftPanel = document.getElementById('left-panel');
  rightPanel = document.getElementById('right-panel');
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
  leftPanel.innerHTML = '';
  rightPanel.innerHTML = '';
  const half = Math.ceil(INGREDIENTS.length / 2);
  INGREDIENTS.slice(0, half).forEach(ing => addSlot(leftPanel, ing));
  INGREDIENTS.slice(half).forEach(ing => addSlot(rightPanel, ing));
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
    el.style.background = '#3d3d5c';
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
  levelDisplay.textContent = `Уровень ${level}`;
}

export function setScore(score, record) {
  scoreDisplay.innerHTML = `
    <div class="score-block">
      <span class="score-value">${score.toLocaleString()}</span>
      <span class="score-label">очки</span>
    </div>
    <span class="score-divider">|</span>
    <div class="record-block">
      <span class="record-value">${record.toLocaleString()}</span>
      <span class="record-label">рекорд</span>
    </div>
  `;
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
    parts.push(`<span class="bonus-tag magnet">🧲 ${s}с</span>`);
  }
  if (bonuses.slowdown > now) {
    const s = Math.ceil((bonuses.slowdown - now) / 1000);
    parts.push(`<span class="bonus-tag slowdown">⏱ ${s}с</span>`);
  }
  if (bonuses.shield > now) {
    const s = Math.ceil((bonuses.shield - now) / 1000);
    parts.push(`<span class="bonus-tag shield">🛡 ${s}с</span>`);
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

export function showGameOver(level, score, record) {
  if (!gameOverScreen) return;
  gameOverScreen.style.display = 'flex';
  const h2 = gameOverScreen.querySelector('h2');
  const p = gameOverScreen.querySelector('p');
  if (h2) h2.textContent = 'Игра окончена';
  if (p) p.textContent = `Уровень ${level}. Очки: ${score}${record > 0 ? `. Рекорд: ${record}` : ''}`;
}

export function hideGameOver() {
  if (gameOverScreen) gameOverScreen.style.display = 'none';
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
