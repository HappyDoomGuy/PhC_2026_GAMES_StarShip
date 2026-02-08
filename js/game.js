/**
 * Игровая логика
 */

import {
  INGREDIENTS,
  BASE_SPEED,
  SPAWN_INTERVAL,
  ITEM_SIZE,
  SHIP_WIDTH,
  SHIP_HEIGHT,
  LIVES as INITIAL_LIVES,
  TRASH_SPAWN_CHANCE_BASE,
  TRASH_SPAWN_CHANCE_PER_LEVEL,
  TRASH_SPEED_BONUS,
  POINTS_VITAMIN,
  POINTS_DUPLICATE,
  PENALTY_VITAMIN_MISS,
  PENALTY_DUPLICATE_MISS,
  COMBO_TIERS,
  BONUS_SPAWN_CHANCE,
  BONUS_DURATION_MS,
  BONUS_SHIELD_DURATION_MS,
  BONUS_MAGNET_PULL,
  BONUS_SLOW_FACTOR
} from './config.js';
import { initRenderer, resize, clear, drawFallingItems, drawShip, drawShieldBubble, spawnSparks, updateAndDrawSparks, getDimensions } from './renderer.js';
import {
  initUI,
  buildPanels,
  resetCollectibles,
  updateSlot,
  setLevel,
  setScore,
  setLives,
  setCombo,
  setActiveBonuses,
  showComboMilestone,
  showFloatingPoints,
  hideMainMenu,
  showLevelComplete,
  hideLevelComplete,
  showGameOver,
  hideGameOver
} from './ui.js';
import { initInput } from './input.js';
import { getRecord, setRecord, setLevelStars } from './storage.js';

let ship = { x: 0, targetX: 0 };
let fallingItems = [];
let collected = {};
let level = 1;
let lives = INITIAL_LIVES;
let score = 0;
let combo = 0;
let gameLoop;
let lastSpawn = 0;
let isPlaying = false;
let noMisses = true;
let bonuses = { magnet: 0, slowdown: 0, shield: 0 };

export function init() {
  initUI();
  initRenderer();
  buildPanels();
  initInput(handleTap);

  window.addEventListener('resize', () => {
    const rect = document.getElementById('canvas')?.parentElement?.getBoundingClientRect();
    if (rect) {
      resize(rect.width, rect.height);
      ship.x = rect.width / 2 - SHIP_WIDTH / 2;
      ship.targetX = ship.x;
    }
  });

  const rect = document.getElementById('canvas')?.parentElement?.getBoundingClientRect();
  if (rect) {
    resize(rect.width, rect.height);
    ship.x = rect.width / 2 - SHIP_WIDTH / 2;
    ship.targetX = ship.x;
  }
}

function handleTap(clientX) {
  if (!isPlaying) return;
  const { gameWidth } = getDimensions();
  ship.targetX = Math.max(0, Math.min(gameWidth - SHIP_WIDTH, clientX - SHIP_WIDTH / 2));
}

export function startGame() {
  hideMainMenu();
  hideLevelComplete();
  hideGameOver();
  level = 1;
  lives = INITIAL_LIVES;
  score = 0;
  combo = 0;
  fallingItems = [];
  resetCollectibles();
  collected = {};
  noMisses = true;
  bonuses = { magnet: 0, slowdown: 0, shield: 0 };
  ship.x = getDimensions().gameWidth / 2 - SHIP_WIDTH / 2;
  ship.targetX = ship.x;
  isPlaying = true;
  lastSpawn = 0;
  setLevel(level);
  setActiveBonuses(bonuses);
  setLives(lives);
  setCombo(0);
  updateScoreDisplay();
  if (gameLoop) cancelAnimationFrame(gameLoop);
  gameLoop = requestAnimationFrame(loop);
}

function nextLevel() {
  hideLevelComplete();
  level++;
  lives = INITIAL_LIVES;
  fallingItems = [];
  resetCollectibles();
  collected = {};
  noMisses = true;
  bonuses = { magnet: 0, slowdown: 0, shield: 0 };
  ship.x = getDimensions().gameWidth / 2 - SHIP_WIDTH / 2;
  ship.targetX = ship.x;
  lastSpawn = 0;
  setLevel(level);
  setLives(lives);
  setActiveBonuses(bonuses);
  const tier = getComboTier(combo);
  setCombo(combo, tier.mult, tier.tier);
  updateScoreDisplay();
  isPlaying = true;
  gameLoop = requestAnimationFrame(loop);
}

function calculateStars() {
  let stars = 1;
  if (lives === INITIAL_LIVES) stars = 2;
  if (lives === INITIAL_LIVES && noMisses) stars = 3;
  return stars;
}

function getComboTier(combo) {
  for (let i = COMBO_TIERS.length - 1; i >= 0; i--) {
    if (combo >= COMBO_TIERS[i].min) {
      return COMBO_TIERS[i];
    }
  }
  return { min: 0, mult: 1, tier: 1 };
}

function updateScoreDisplay() {
  setScore(score, getRecord());
}

const BONUS_TYPES = [
  { id: 'magnet', name: '🧲', color: '#00d4ff' },
  { id: 'slowdown', name: '⏱', color: '#9b59b6' },
  { id: 'shield', name: '🛡', color: '#2ecc71' }
];

function spawnItem() {
  const { gameWidth } = getDimensions();
  const trashChance = TRASH_SPAWN_CHANCE_BASE + (level - 1) * TRASH_SPAWN_CHANCE_PER_LEVEL;
  const isTrash = Math.random() < trashChance;

  let isBonus = false;
  if (!isTrash && Math.random() < BONUS_SPAWN_CHANCE) {
    isBonus = true;
  }

  const item = {
    x: Math.random() * (gameWidth - ITEM_SIZE),
    y: -40,
    size: ITEM_SIZE,
    rotation: Math.random() * Math.PI * 2,
    isTrash,
    isBonus
  };

  if (isTrash) {
    item.id = 'trash';
    item.name = '✗';
    item.color = '#4a4a5a';
  } else if (isBonus) {
    const b = BONUS_TYPES[Math.floor(Math.random() * BONUS_TYPES.length)];
    item.id = b.id;
    item.name = b.name;
    item.color = b.color;
  } else {
    const ing = INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];
    Object.assign(item, ing);
  }

  fallingItems.push(item);
}

function collides(item, shipOval) {
  const px = item.x + item.size / 2;
  const py = item.y + item.size / 2;
  const dx = (px - shipOval.cx) / shipOval.rx;
  const dy = (py - shipOval.cy) / shipOval.ry;
  return dx * dx + dy * dy <= 1;
}

function loop(timestamp) {
  if (!isPlaying) return;

  const { gameWidth, gameHeight } = getDimensions();
  const speed = BASE_SPEED + (level - 1) * 0.4;
  const spawnRate = Math.max(400, SPAWN_INTERVAL - (level - 1) * 80);

  if (timestamp - lastSpawn > spawnRate) {
    spawnItem();
    lastSpawn = timestamp;
  }

  ship.x += (ship.targetX - ship.x) * 0.15;

  const sy = gameHeight - SHIP_HEIGHT - 12;
  const shipOval = {
    cx: ship.x + SHIP_WIDTH / 2,
    cy: sy + SHIP_HEIGHT / 2,
    rx: SHIP_WIDTH / 2,
    ry: SHIP_HEIGHT / 2
  };

  const now = timestamp;
  const trashSpeedBonus = (level - 1) * TRASH_SPEED_BONUS;
  const slowActive = bonuses.slowdown > now;
  const magnetActive = bonuses.magnet > now;
  const shipCenterX = ship.x + SHIP_WIDTH / 2;

  fallingItems = fallingItems.filter(item => {
    let itemSpeed = item.isTrash ? speed + trashSpeedBonus : speed;
    if (slowActive) itemSpeed *= BONUS_SLOW_FACTOR;

    if (magnetActive && !item.isTrash && !item.isBonus) {
      const cx = item.x + item.size / 2;
      const dx = shipCenterX - cx;
      item.x += dx * 0.02 * BONUS_MAGNET_PULL;
      item.x = Math.max(0, Math.min(gameWidth - item.size, item.x));
    }

    item.y += itemSpeed;
    item.rotation += 0.04;

    if (item.y > gameHeight) {
      if (!item.isTrash && !item.isBonus) {
        noMisses = false;
        combo = 0;
        setCombo(0);
        const penalty = collected[item.id] ? PENALTY_DUPLICATE_MISS : PENALTY_VITAMIN_MISS;
        score += penalty;
        score = Math.max(0, score);
        showFloatingPoints(item.x + item.size / 2, gameHeight - 60, penalty);
        updateScoreDisplay();
      }
      return false;
    }

    if (collides(item, shipOval)) {
      if (item.isBonus) {
        if (item.id === 'magnet') bonuses.magnet = now + BONUS_DURATION_MS;
        else if (item.id === 'slowdown') bonuses.slowdown = now + BONUS_DURATION_MS;
        else if (item.id === 'shield') bonuses.shield = now + BONUS_SHIELD_DURATION_MS;
        setActiveBonuses(bonuses);
        return false;
      }
      if (item.isTrash) {
        const impactX = item.x + item.size / 2;
        const impactY = item.y + item.size / 2;
        spawnSparks(impactX, impactY);
        if (bonuses.shield > now) {
          bonuses.shield = 0;
          setActiveBonuses(bonuses);
        } else {
          lives--;
          setLives(lives);
          if (lives <= 0) {
            setRecord(score);
            gameOver();
          }
        }
        return false;
      }
      combo++;
      const tier = getComboTier(combo);
      const prevTier = getComboTier(combo - 1);
      if (tier.mult > prevTier.mult) showComboMilestone(tier.mult);
      const basePoints = collected[item.id] ? POINTS_DUPLICATE : POINTS_VITAMIN;
      const points = Math.round(basePoints * tier.mult);
      score += points;
      setCombo(combo, tier.mult, tier.tier);
      showFloatingPoints(item.x + item.size / 2, item.y, points);
      const isNew = !collected[item.id];
      if (isNew) {
        collected[item.id] = true;
        updateSlot(item.id);
        if (Object.keys(collected).length === INGREDIENTS.length) {
          setRecord(score);
          levelComplete();
        }
      }
      updateScoreDisplay();
      return false;
    }
    return true;
  });

  setActiveBonuses(bonuses);
  clear();
  drawFallingItems(fallingItems, collected);
  drawShip(ship.x, ship.targetX - ship.x);
  if (bonuses.shield > now) drawShieldBubble(ship.x);
  updateAndDrawSparks();
  gameLoop = requestAnimationFrame(loop);
}

function levelComplete(stars) {
  isPlaying = false;
  cancelAnimationFrame(gameLoop);
  showLevelComplete(level, stars);
}

function gameOver() {
  isPlaying = false;
  cancelAnimationFrame(gameLoop);
  showGameOver(level, score, getRecord());
}

function setupButton(id, handler) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', handler);
  btn.addEventListener('touchend', e => {
    e.preventDefault();
    handler();
  }, { passive: false });
}

export function bindButtons(onStart) {
  setupButton('start-btn', onStart);
  setupButton('next-level-btn', nextLevel);
  setupButton('restart-btn', onStart);
}
