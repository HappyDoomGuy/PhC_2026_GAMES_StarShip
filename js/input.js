/**
 * Управление: мышь — перетаскивание по области (абсолютный X).
 * Тач по полю — относительное ведение (палец не обязан сидеть на корабле).
 * Нижняя полоса — абсолютный X по дорожке (удобный большой палец без перекрытия экрана).
 */

import { SHIP_WIDTH } from './config.js';
import { getGameArea } from './ui.js';
import { getDimensions } from './renderer.js';

/**
 * @param {(kind: 'absolute' | 'touch-drag', data: {
 *   x?: number;
 *   pointerX?: number;
 *   anchorPointerX?: number;
 *   anchorTargetX?: number;
 * }) => void} onInput
 * @param {() => number} getShipTargetX — для якоря относительного тача по полю
 */
export function initInput(onInput, getShipTargetX) {
  const area = getGameArea();
  const strip = document.getElementById('touch-steer-strip');
  const thumbWrap = strip?.querySelector('.touch-steer-strip__thumb-wrap');

  function isButton(target) {
    return target && target.closest('button, a, [role="button"]');
  }

  function stripToGameX(clientX) {
    if (!strip) return null;
    const { gameWidth } = getDimensions();
    if (!gameWidth || gameWidth <= 0) return null;
    const rect = strip.getBoundingClientRect();
    if (rect.width <= 0) return null;
    const t = (clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(1, t));
    return clamped * gameWidth;
  }

  function setThumbTrackFraction(t) {
    if (!thumbWrap) return;
    const f = Math.max(0, Math.min(1, t));
    thumbWrap.style.left = `${f * 100}%`;
    thumbWrap.style.transform = 'translate(-50%, -50%)';
  }

  /** x — то же значение абсолютного управления, что и для корабля (горизонталь в координатах поля) */
  function updateThumbByGameX(x) {
    const { gameWidth } = getDimensions();
    if (!gameWidth || gameWidth <= 0) return;
    const t = x / gameWidth;
    setThumbTrackFraction(t);
  }

  /** после относительного тача — положение кружка по фактической цели корабля */
  function syncThumbAfterTouchDrag() {
    const { gameWidth } = getDimensions();
    if (!thumbWrap || !gameWidth) return;
    const center = getShipTargetX() + SHIP_WIDTH / 2;
    setThumbTrackFraction(center / gameWidth);
  }

  const ptrOpts = { passive: false };

  if (strip) {
    function applyStrip(clientX) {
      const x = stripToGameX(clientX);
      if (x != null) {
        onInput('absolute', { x });
        updateThumbByGameX(x);
      }
    }

    strip.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') return;
      e.preventDefault();
      e.stopPropagation();
      try {
        strip.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      applyStrip(e.clientX);
    }, ptrOpts);

    strip.addEventListener('pointermove', e => {
      if (!strip.hasPointerCapture(e.pointerId)) return;
      e.preventDefault();
      e.stopPropagation();
      applyStrip(e.clientX);
    }, ptrOpts);

    function releaseStripPointer(e) {
      e.stopPropagation();
      if (strip.hasPointerCapture(e.pointerId)) {
        try {
          strip.releasePointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
      }
    }
    strip.addEventListener('pointerup', releaseStripPointer);
    strip.addEventListener('pointercancel', releaseStripPointer);
  }

  if (!area) return;

  function gameX(clientX) {
    const rect = area.getBoundingClientRect();
    return clientX - rect.left;
  }

  /** Якорь для относительного тача по полю (не с полоски): один активный палец */
  /** @type {{ id: number, pointerX: number, shipTargetX: number } | null} */
  let areaTouchAnchor = null;

  function emitAreaTouchDrag(clientX) {
    if (!areaTouchAnchor) return;
    onInput('touch-drag', {
      pointerX: gameX(clientX),
      anchorPointerX: areaTouchAnchor.pointerX,
      anchorTargetX: areaTouchAnchor.shipTargetX,
    });
    syncThumbAfterTouchDrag();
  }

  area.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    if (strip && e.target instanceof Node && strip.contains(e.target)) return;
    if (isButton(e.target)) return;
    if (areaTouchAnchor !== null) return;
    e.preventDefault();
    areaTouchAnchor = {
      id: e.pointerId,
      pointerX: gameX(e.clientX),
      shipTargetX: getShipTargetX(),
    };
    try {
      area.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    emitAreaTouchDrag(e.clientX);
  }, ptrOpts);

  area.addEventListener('pointermove', e => {
    if (!areaTouchAnchor || e.pointerId !== areaTouchAnchor.id) return;
    if (!area.hasPointerCapture(e.pointerId)) return;
    e.preventDefault();
    emitAreaTouchDrag(e.clientX);
  }, ptrOpts);

  function clearAreaAnchor(e) {
    if (!areaTouchAnchor || e.pointerId !== areaTouchAnchor.id) return;
    if (area.hasPointerCapture(e.pointerId)) {
      try {
        area.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
    areaTouchAnchor = null;
  }
  area.addEventListener('pointerup', clearAreaAnchor);
  area.addEventListener('pointercancel', clearAreaAnchor);

  let mouseDown = false;
  area.addEventListener('mousedown', e => {
    if (isButton(e.target)) return;
    mouseDown = true;
    const x = gameX(e.clientX);
    onInput('absolute', { x });
    updateThumbByGameX(x);
  });
  area.addEventListener('mousemove', e => {
    if (!mouseDown) return;
    const x = gameX(e.clientX);
    onInput('absolute', { x });
    updateThumbByGameX(x);
  });
  area.addEventListener('mouseup', () => {
    mouseDown = false;
  });
  area.addEventListener('mouseleave', () => {
    mouseDown = false;
  });
}
