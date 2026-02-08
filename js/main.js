/**
 * Точка входа приложения
 */

import { init, startGame, bindButtons } from './game.js';
import { getRecord } from './storage.js';
import { showMainMenu } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  init();
  bindButtons(startGame);

  const recordEl = document.getElementById('record-display');
  if (recordEl) recordEl.textContent = `Рекорд: ${getRecord()}`;

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
