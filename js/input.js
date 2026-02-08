/**
 * Управление: тап, клик и свайп (зажать и вести пальцем)
 */

import { getGameArea } from './ui.js';

export function initInput(onMove) {
  const area = getGameArea();
  if (!area) return;

  function handlePosition(clientX) {
    const rect = area.getBoundingClientRect();
    const x = clientX - rect.left;
    onMove(x);
  }

  function isButton(target) {
    return target && target.closest('button, a, [role="button"]');
  }

  // Тач: tap + свайп (палец ведёт корабль). Не блокировать клики по кнопкам.
  area.addEventListener('touchstart', e => {
    if (isButton(e.target)) return;
    e.preventDefault();
    handlePosition(e.touches[0].clientX);
  });
  area.addEventListener('touchmove', e => {
    if (isButton(e.target)) return;
    e.preventDefault();
    handlePosition(e.touches[0].clientX);
  });

  // Мышь: клик + зажать и вести
  let mouseDown = false;
  area.addEventListener('mousedown', e => {
    if (isButton(e.target)) return;
    mouseDown = true;
    handlePosition(e.clientX);
  });
  area.addEventListener('mousemove', e => {
    if (mouseDown) handlePosition(e.clientX);
  });
  area.addEventListener('mouseup', () => { mouseDown = false; });
  area.addEventListener('mouseleave', () => { mouseDown = false; });
}
