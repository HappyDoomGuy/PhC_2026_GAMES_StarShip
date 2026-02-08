/**
 * Точка входа приложения
 */

import { init, startGame, bindButtons } from './game.js';
import { getRecord, getShipType, setShipType as saveShipType } from './storage.js';
import { setShipType as setRendererShip } from './renderer.js';
import { showMainMenu } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  init();
  bindButtons(startGame);

  const recordEl = document.getElementById('record-display');
  if (recordEl) recordEl.textContent = `Рекорд: ${getRecord()}`;

  const savedShip = getShipType();
  setRendererShip(savedShip);
  document.querySelectorAll('.ship-option').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.ship === savedShip);
  });
  document.querySelectorAll('.ship-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const ship = btn.dataset.ship;
      if (ship !== 'r' && ship !== 'b') return;
      setRendererShip(ship);
      saveShipType(ship);
      document.querySelectorAll('.ship-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  const splash = document.getElementById('splash-screen');
  let splashDone = false;
  const goToMenu = () => {
    if (splashDone) return;
    splashDone = true;
    splash.classList.add('splash-hidden');
    setTimeout(() => {
      splash.style.display = 'none';
      showMainMenu();
    }, 500);
  };

  splash.addEventListener('click', goToMenu);
  splash.addEventListener('touchend', e => { e.preventDefault(); goToMenu(); }, { passive: false });
  setTimeout(goToMenu, 3000);
});
