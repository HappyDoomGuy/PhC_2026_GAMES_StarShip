/**
 * Отрисовка canvas: витамины, корабль
 */

import { SHIP_WIDTH, SHIP_HEIGHT } from './config.js';

let canvas, ctx;
let gameWidth, gameHeight;
const PLAYER_SPRITES = {
  r: { l1: null, l2: null, m: null, r1: null, r2: null },
  b: { l1: null, l2: null, m: null, r1: null, r2: null }
};
let selectedShipType = 'r';
const SHIP_SUFFIXES = ['r', 'b'];
const FRAME_KEYS = ['l1', 'l2', 'm', 'r1', 'r2'];
const TRASH_SPRITES = [null, null, null, null];
const TRASH_NAMES = ['trash1', 'trash2', 'trash3', 'trash4'];

export function setShipType(type) {
  if (type === 'r' || type === 'b') selectedShipType = type;
}

export function getShipType() {
  return selectedShipType;
}

export function initRenderer() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  SHIP_SUFFIXES.forEach(suffix => {
    FRAME_KEYS.forEach(key => {
      const name = `player_${suffix}_${key}`;
      const img = new Image();
      img.src = `assets/${name}.png`;
      img.onload = () => { PLAYER_SPRITES[suffix][key] = img; };
    });
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
  const sprites = PLAYER_SPRITES[selectedShipType];
  const v = velocity ?? 0;
  if (Math.abs(v) < 10) return sprites.m;
  if (v > 0) return Math.abs(v) >= 40 ? sprites.r2 : sprites.r1;
  return Math.abs(v) >= 40 ? sprites.l1 : sprites.l2;
}

let starField = [];
let bgGradSky = null;
let bgGradNebula = null;

export function resize(width, height) {
  gameWidth = width;
  gameHeight = height;
  starField = [];
  bgGradSky = null;
  bgGradNebula = null;
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
  for (let i = 0; i < 70; i++) {
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
  if (!bgGradSky) {
    bgGradSky = ctx.createLinearGradient(0, 0, gameWidth, gameHeight);
    bgGradSky.addColorStop(0, '#0d0d1a');
    bgGradSky.addColorStop(0.3, '#12122a');
    bgGradSky.addColorStop(0.6, '#0a0a20');
    bgGradSky.addColorStop(1, '#181830');
  }
  ctx.fillStyle = bgGradSky;
  ctx.fillRect(0, 0, gameWidth, gameHeight);

  if (!bgGradNebula) {
    bgGradNebula = ctx.createRadialGradient(
      gameWidth * 0.3, gameHeight * 0.2, 0,
      gameWidth * 0.5, gameHeight * 0.5, gameHeight
    );
    bgGradNebula.addColorStop(0, 'rgba(60, 40, 120, 0.12)');
    bgGradNebula.addColorStop(0.5, 'rgba(30, 20, 80, 0.06)');
    bgGradNebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
  }
  ctx.fillStyle = bgGradNebula;
  ctx.fillRect(0, 0, gameWidth, gameHeight);

  if (starField.length === 0 || starField.length < 70) initStarField();
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

function drawVitaminAtom(ctx, cx, cy, r, item, t, needToCollect) {
  const rot = t * 0.5;

  if (needToCollect) {
    for (let w = 0; w < 2; w++) {
      const phase = (t * 2 + w * 0.5) % 1;
      const ringR = r + 4 + phase * 12;
      const alpha = (1 - phase) * 0.6 * Math.sin(phase * Math.PI);
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = item.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  ctx.save();
  const c = item.color;
  const shells = [
    { radius: r * 0.82, electrons: 1 },
    { radius: r * 0.95, electrons: 2 }
  ];
  for (const s of shells) {
    ctx.strokeStyle = c;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, s.radius, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < s.electrons; i++) {
      const phase = (i / s.electrons) * Math.PI * 2 + rot * (1 + s.radius / r * 0.3);
      const ex = cx + s.radius * Math.cos(phase);
      const ey = cy + s.radius * Math.sin(phase);
      ctx.fillStyle = c;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(ex, ey, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  const coreSize = r * 0.75;
  const coreGrad = ctx.createRadialGradient(cx - coreSize * 0.4, cy - coreSize * 0.4, 0, cx, cy, coreSize);
  coreGrad.addColorStop(0, c);
  coreGrad.addColorStop(0.4, c);
  coreGrad.addColorStop(0.8, 'rgba(0,0,0,0.2)');
  coreGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.name, cx, cy);
  ctx.restore();
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
    } else if (isBonus) {
      const br = r * 1.1;
      const pulse = 0.92 + 0.08 * Math.sin(t * 4);
      const rot = t * 0.5;

      ctx.save();
      for (let i = 0; i < 3; i++) {
        const phase = (t * 1.5 + i * 0.4) % 1;
        const ringR = br + 4 + phase * 20;
        const alpha = (1 - phase) * 0.5 * Math.sin(phase * Math.PI);
        ctx.strokeStyle = item.color || '#00d4ff';
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 4;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + rot;
        const x = cx + br * Math.cos(a);
        const y = cy + br * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = item.color || '#00d4ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + rot;
        const x = cx + br * Math.cos(a);
        const y = cy + br * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = item.color || '#00d4ff';
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(cx, cy, br * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.name, cx, cy);
      ctx.restore();
    } else {
      drawVitaminAtom(ctx, cx, cy, r, item, t, needToCollect);
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
  const t = Date.now() / 80;

  const flameY = sy + h - 8;
  const flameH = 32 + Math.sin(t) * 2;
  const flameWTop = w * 0.08 + Math.sin(t * 1.3) * 0.8;
  const flameWBottom = w * 0.04;
  const wobble = (i) => Math.sin(t + i) * 1.5;

  ctx.save();
  const flameGrad = ctx.createLinearGradient(cx, flameY, cx, flameY + flameH);
  flameGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  flameGrad.addColorStop(0.08, 'rgba(255, 220, 120, 0.9)');
  flameGrad.addColorStop(0.25, 'rgba(255, 150, 50, 0.8)');
  flameGrad.addColorStop(0.5, 'rgba(240, 80, 20, 0.5)');
  flameGrad.addColorStop(0.8, 'rgba(180, 40, 10, 0.2)');
  flameGrad.addColorStop(1, 'rgba(120, 20, 5, 0)');
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(cx - flameWTop + wobble(0), flameY);
  ctx.lineTo(cx + flameWTop + wobble(1), flameY);
  ctx.lineTo(cx + flameWBottom + wobble(2), flameY + flameH);
  ctx.lineTo(cx - flameWBottom + wobble(3), flameY + flameH);
  ctx.closePath();
  ctx.fill();

  const coreGrad = ctx.createLinearGradient(cx, flameY, cx, flameY + flameH * 0.4);
  coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  coreGrad.addColorStop(0.3, 'rgba(255, 240, 200, 0.6)');
  coreGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
  ctx.fillStyle = coreGrad;
  const coreW = flameWTop * 0.4;
  ctx.beginPath();
  ctx.moveTo(cx - coreW, flameY);
  ctx.lineTo(cx + coreW, flameY);
  ctx.lineTo(cx + coreW * 0.2, flameY + flameH * 0.35);
  ctx.lineTo(cx - coreW * 0.2, flameY + flameH * 0.35);
  ctx.closePath();
  ctx.fill();

  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(255, 200, 100, 0.15)';
  ctx.beginPath();
  ctx.moveTo(cx - flameWTop, flameY);
  ctx.lineTo(cx + flameWTop, flameY);
  ctx.lineTo(cx + flameWBottom, flameY + flameH);
  ctx.lineTo(cx - flameWBottom, flameY + flameH);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
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

export function drawShieldBubble(shipX, remainingMs = 0) {
  const cx = shipX + SHIP_WIDTH / 2;
  const cy = gameHeight - SHIP_HEIGHT / 2 - 12;
  const r = Math.max(SHIP_WIDTH, SHIP_HEIGHT) / 2 + 8;

  const blink = remainingMs > 0 && remainingMs < 5000;
  const pulse = blink ? 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(Date.now() / 120)) : 1;
  const t = Date.now() / 1000;

  ctx.save();
  const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
  grad.addColorStop(0, `rgba(80, 220, 140, ${0.4 * pulse})`);
  grad.addColorStop(0.4, `rgba(60, 200, 120, ${0.25 * pulse})`);
  grad.addColorStop(0.8, `rgba(40, 180, 100, ${0.1 * pulse})`);
  grad.addColorStop(1, 'rgba(30, 160, 90, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgba(80, 220, 140, ${0.5 * pulse})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 3; i++) {
    const phase = (t * 1.2 + i * 0.4) % 1;
    const startAngle = phase * Math.PI * 2 - Math.PI * 0.2;
    const sweep = Math.PI * 0.4;
    ctx.strokeStyle = `rgba(80, 240, 140, ${0.6 * pulse})`;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, startAngle + sweep);
    ctx.stroke();
  }
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

let shieldShards = [];

export function spawnShieldShards(x, y) {
  const count = 16 + Math.floor(Math.random() * 12);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 8;
    shieldShards.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 1,
      len: 6 + Math.random() * 10,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3
    });
  }
}

function updateAndDrawShieldShards() {
  shieldShards = shieldShards.filter(s => {
    s.x += s.vx;
    s.y += s.vy;
    s.vy += 0.08;
    s.rot += s.rotSpeed;
    s.life -= 0.025;
    if (s.life <= 0) return false;
    const alpha = s.life;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.fillStyle = `rgba(80, 220, 140, ${alpha})`;
    ctx.strokeStyle = `rgba(150, 255, 180, ${alpha * 0.8})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -s.len / 2);
    ctx.lineTo(s.len * 0.3, s.len / 2);
    ctx.lineTo(-s.len * 0.3, s.len / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return true;
  });
}

export function updateAndDrawSparks() {
  updateAndDrawShieldShards();
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

let explosionParticles = [];
let explosionStartTime = 0;
let explosionCenter = { x: 0, y: 0 };

export function spawnExplosion(x, y) {
  explosionParticles = [];
  explosionCenter = { x, y };
  explosionStartTime = Date.now();
  const count = 35 + Math.floor(Math.random() * 25);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 14;
    const hue = Math.random() < 0.5 ? '255, 100, 50' : (Math.random() < 0.5 ? '255, 200, 50' : '255, 255, 150');
    explosionParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      life: 1,
      size: 2 + Math.random() * 5,
      hue
    });
  }
}

export function updateAndDrawExplosion() {
  if (explosionParticles.length === 0) return false;
  const elapsed = Date.now() - explosionStartTime;
  if (elapsed > 1400) return false;

  explosionParticles = explosionParticles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2;
    p.vx *= 0.98;
    p.life -= 0.022;
    if (p.life <= 0) return false;
    const alpha = p.life * (1 - elapsed / 1400 * 0.5);
    ctx.fillStyle = `rgba(${p.hue}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    return true;
  });

  if (elapsed < 150) {
    const flash = 1 - elapsed / 150;
    ctx.fillStyle = `rgba(255, 200, 100, ${flash * 0.5})`;
    ctx.beginPath();
    ctx.arc(explosionCenter.x, explosionCenter.y, 70, 0, Math.PI * 2);
    ctx.fill();
  }
  return true;
}

export function isExplosionActive() {
  return explosionParticles.length > 0 && (Date.now() - explosionStartTime) < 1400;
}
