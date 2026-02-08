/**
 * Отрисовка canvas: витамины, корабль
 */

import { SHIP_WIDTH, SHIP_HEIGHT } from './config.js';

let canvas, ctx;
let gameWidth, gameHeight;
const PLAYER_SPRITES = {
  l1: null, l2: null, m: null, r1: null, r2: null
};
const SPRITE_NAMES = ['player_r_l1', 'player_r_l2', 'player_r_m', 'player_r_r1', 'player_r_r2'];
const TRASH_SPRITES = [null, null, null, null];
const TRASH_NAMES = ['trash1', 'trash2', 'trash3', 'trash4'];

export function initRenderer() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  SPRITE_NAMES.forEach((name) => {
    const key = name.replace('player_r_', '');
    const img = new Image();
    img.src = `assets/${name}.png`;
    img.onload = () => { PLAYER_SPRITES[key] = img; };
  });
  TRASH_NAMES.forEach((name, i) => {
    const img = new Image();
    img.src = `assets/${name}.png`;
    img.onload = () => { TRASH_SPRITES[i] = img; };
  });
  return { canvas, ctx };
}

function getTrashSprite() {
  const frame = Math.floor((Date.now() / 80) % 4);
  return TRASH_SPRITES[frame];
}

function getPlayerSprite(velocity) {
  const v = velocity ?? 0;
  if (Math.abs(v) < 10) return PLAYER_SPRITES.m;
  if (v > 0) return Math.abs(v) >= 40 ? PLAYER_SPRITES.r2 : PLAYER_SPRITES.r1;
  return Math.abs(v) >= 40 ? PLAYER_SPRITES.l1 : PLAYER_SPRITES.l2;
}

let starField = [];

export function resize(width, height) {
  gameWidth = width;
  gameHeight = height;
  starField = [];
  if (canvas) {
    canvas.width = width;
    canvas.height = height;
  }
}

export function getDimensions() {
  return { gameWidth, gameHeight };
}

function initStarField() {
  starField = [];
  const w = gameWidth || 400;
  const h = gameHeight || 600;
  for (let i = 0; i < 120; i++) {
    starField.push({
      x: Math.random() * w,
      y: Math.random() * h,
      speed: 0.3 + Math.random() * 1.2,
      size: 0.8 + Math.random() * 2,
      brightness: 0.4 + Math.random() * 0.6,
      layer: Math.random()
    });
  }
}

export function clear() {
  const grad = ctx.createLinearGradient(0, 0, gameWidth, gameHeight);
  grad.addColorStop(0, '#0d0d1a');
  grad.addColorStop(0.3, '#12122a');
  grad.addColorStop(0.6, '#0a0a20');
  grad.addColorStop(1, '#181830');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, gameWidth, gameHeight);

  const nebula = ctx.createRadialGradient(
    gameWidth * 0.3, gameHeight * 0.2, 0,
    gameWidth * 0.5, gameHeight * 0.5, gameHeight
  );
  nebula.addColorStop(0, 'rgba(60, 40, 120, 0.12)');
  nebula.addColorStop(0.5, 'rgba(30, 20, 80, 0.06)');
  nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, gameWidth, gameHeight);

  if (starField.length === 0 || starField.length < 120) initStarField();
  const w = gameWidth || 400;
  const h = gameHeight || 600;
  const t = Date.now() / 1000;
  starField.forEach(star => {
    star.y += star.speed * (0.7 + star.layer * 0.6);
    if (star.y > h) {
      star.y = 0;
      star.x = Math.random() * w;
    }
    const twinkle = 0.7 + 0.3 * Math.sin(t * 2 + star.x * 0.02);
    const alpha = star.brightness * twinkle * (1 - (star.y / h) * 0.15);
    const hue = star.layer > 0.8 ? '200, 220, 255' : '255, 255, 255';
    ctx.fillStyle = `rgba(${hue}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function drawFallingItems(items, collected) {
  const t = Date.now() / 1000;

  items.forEach(item => {
    const cx = item.x + item.size / 2;
    const cy = item.y + item.size / 2;
    const r = item.size / 2;
    const isTrash = item.isTrash;
    const isBonus = item.isBonus;
    const needToCollect = (!isTrash && !isBonus && !collected[item.id]) || isBonus;

    if (isTrash) {
      const trashImg = getTrashSprite();
      if (trashImg && trashImg.complete && trashImg.naturalWidth) {
        const trashSize = item.size * 1.6;
        const trashX = item.x - (trashSize - item.size) / 2;
        const trashY = item.y - (trashSize - item.size) / 2;
        ctx.drawImage(trashImg, trashX, trashY, trashSize, trashSize);
      } else {
        ctx.fillStyle = '#4a4a5a';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,80,80,0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#888';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✗', cx, cy);
      }
    } else {
      if (needToCollect) {
        for (let w = 0; w < 4; w++) {
          const phase = (t * 2 + w * 0.35) % 1;
          const ringR = r + 2 + phase * 14;
          const alpha = (1 - phase) * 0.6 * Math.sin(phase * Math.PI);
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = isBonus ? (item.color || '#00d4ff') : item.color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isBonus ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)';
      ctx.lineWidth = isBonus ? 2 : 1;
      ctx.stroke();

      if (isBonus) {
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 12;
      }
      const hlAngle = item.rotation;
      const hlX = cx + r * 0.55 * Math.cos(hlAngle);
      const hlY = cy + r * 0.55 * Math.sin(hlAngle);
      const hlGrad = ctx.createRadialGradient(hlX - r * 0.25, hlY - r * 0.08, 0, hlX, hlY, r * 0.5);
      hlGrad.addColorStop(0, 'rgba(255,255,255,0.9)');
      hlGrad.addColorStop(0.3, 'rgba(255,255,255,0.4)');
      hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.ellipse(hlX, hlY, r * 0.35, r * 0.12, hlAngle, 0, Math.PI * 2);
      ctx.fillStyle = hlGrad;
      ctx.fill();
      if (isBonus) {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = isBonus ? '#fff' : '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.name, cx, cy);
    }
  });
}

export function drawShip(shipX, velocity = 0) {
  const h = SHIP_HEIGHT;
  const w = SHIP_WIDTH;
  const sx = shipX;
  const sy = gameHeight - h - 12;
  const cx = sx + w / 2;
  const cy = sy + h / 2;
  const r = Math.max(w, h) / 2 + 10;

  ctx.save();
  const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
  glowGrad.addColorStop(0, 'rgba(100, 200, 255, 0.35)');
  glowGrad.addColorStop(0.5, 'rgba(100, 200, 255, 0.15)');
  glowGrad.addColorStop(1, 'rgba(100, 200, 255, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const ovalPath = () => {
    ctx.ellipse(cx, sy + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  };

  const img = getPlayerSprite(velocity);
  if (img && img.complete && img.naturalWidth) {
    ctx.save();
    ctx.beginPath();
    ovalPath();
    ctx.clip();
    ctx.drawImage(img, sx, sy, w, h);
    ctx.restore();
  } else {
    const g = ctx.createLinearGradient(shipX, 0, shipX + SHIP_WIDTH, 0);
    g.addColorStop(0, '#e94560');
    g.addColorStop(0.5, '#ff6b6b');
    g.addColorStop(1, '#e94560');
    ctx.fillStyle = g;
    ctx.beginPath();
    ovalPath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚀', shipX + w / 2, gameHeight - h / 2 - 12);
  }
}

export function drawShieldBubble(shipX) {
  const cx = shipX + SHIP_WIDTH / 2;
  const cy = gameHeight - SHIP_HEIGHT / 2 - 12;
  const r = Math.max(SHIP_WIDTH, SHIP_HEIGHT) / 2 + 18;

  ctx.save();
  const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
  grad.addColorStop(0, 'rgba(100, 200, 255, 0.35)');
  grad.addColorStop(0.5, 'rgba(100, 200, 255, 0.15)');
  grad.addColorStop(1, 'rgba(100, 200, 255, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

let sparks = [];

export function spawnSparks(x, y) {
  const count = 12 + Math.floor(Math.random() * 8);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    sparks.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 1,
      size: 1.5 + Math.random() * 2.5,
      hue: Math.random() < 0.6 ? 30 : 0
    });
  }
}

export function updateAndDrawSparks() {
  sparks = sparks.filter(s => {
    s.x += s.vx;
    s.y += s.vy;
    s.vy += 0.15;
    s.life -= 0.03;
    if (s.life <= 0) return false;
    const alpha = s.life;
    ctx.fillStyle = s.hue === 30
      ? `rgba(255, 180, 80, ${alpha})`
      : `rgba(255, 255, 200, ${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
    ctx.fill();
    return true;
  });
}
