/**
 * Конфигурация игры
 */

export const VITAMIN_FULL_NAMES = {
  A: 'Ретинола пальмитат 3333 МЕ',
  D3: 'Колекальциферол 500 МЕ',
  E: 'D,L-α-токоферола ацетат 10 мг',
  C: 'Аскорбиновая кислота 150 мг',
  B1: 'Тиамина гидрохлорид 20 мг',
  B2: 'Рибофлавин 5 мг',
  B3: 'Никотинамид 50 мг',
  B5: 'Кальция пантотенат 11,6 мг',
  B6: 'Пиридоксина гидрохлорид 10 мг',
  B9: 'Фолиевая кислота 1 мг',
  B12: 'Цианокобаламин 5 мкг',
  B8: 'Биотин 250 мкг',
  B: 'Биотин 250 мкг',
  Mg: 'Магний ~5 мг',
  P: 'Фосфор ~47 мг',
  Fe: 'Железо ~1,25 мг',
  Zn: 'Цинк 500 мкг',
  Mn: 'Марганец 500 мкг',
  Cu: 'Медь 100 мкг',
  Mo: 'Молибден 100 мкг'
};

export const INGREDIENTS = [
  { id: 'A', name: 'A', color: '#FF6B6B' },
  { id: 'B1', name: 'B1', color: '#4ECDC4' },
  { id: 'B2', name: 'B2', color: '#45B7D1' },
  { id: 'B3', name: 'B3', color: '#96CEB4' },
  { id: 'B5', name: 'B5', color: '#FFEAA7' },
  { id: 'B6', name: 'B6', color: '#DDA0DD' },
  { id: 'B8', name: 'B8', color: '#98D8C8' },
  { id: 'B9', name: 'B9', color: '#F7DC6F' },
  { id: 'B12', name: 'B12', color: '#BB8FCE' },
  { id: 'C', name: 'C', color: '#85C1E9' },
  { id: 'D3', name: 'D3', color: '#F8B500' },
  { id: 'E', name: 'E', color: '#2ECC71' },
  { id: 'Mg', name: 'Mg', color: '#E74C3C' },
  { id: 'Fe', name: 'Fe', color: '#9B59B6' },
  { id: 'Zn', name: 'Zn', color: '#3498DB' },
  { id: 'Cu', name: 'Cu', color: '#E67E22' },
  { id: 'Mn', name: 'Mn', color: '#1ABC9C' },
  { id: 'P', name: 'P', color: '#F39C12' },
  { id: 'Mo', name: 'Mo', color: '#95A5A6' },
  { id: 'B', name: 'B', color: '#ECF0F1' }
];

export const GRAY = '#5a5a7a';
export const BASE_SPEED = 1.5;
export const SPAWN_INTERVAL = 1200;
export const ITEM_SIZE = 40;
export const SHIP_WIDTH = 110;
export const SHIP_HEIGHT = 76;

export function getShipScale() {
  return typeof window !== 'undefined' && window.innerWidth < 500 ? 0.72 : 1;
}

// Очки (×10 уменьшено)
export const POINTS_VITAMIN = 10;
export const POINTS_DUPLICATE = 5;
export const PENALTY_VITAMIN_MISS = -10;
export const PENALTY_DUPLICATE_MISS = -5;

// Комбо: 10 уровней множителя (считаются витамины и дубликаты, сброс при пропуске)
export const COMBO_TIERS = [
  { min: 0, mult: 1, tier: 1 },
  { min: 2, mult: 1.5, tier: 2 },
  { min: 4, mult: 2, tier: 3 },
  { min: 6, mult: 2.5, tier: 4 },
  { min: 8, mult: 3, tier: 5 },
  { min: 11, mult: 4, tier: 6 },
  { min: 14, mult: 5, tier: 7 },
  { min: 18, mult: 6, tier: 8 },
  { min: 24, mult: 8, tier: 9 },
  { min: 30, mult: 10, tier: 10 }
];

// Жизни и мусор
export const LIVES = 3;
export const TRASH_COLOR = '#4a4a5a';
export const TRASH_SPAWN_CHANCE_BASE = 0.15;   // 15% на 1 уровне
export const TRASH_SPAWN_CHANCE_PER_LEVEL = 0.03; // +3% за уровень
export const TRASH_SPEED_BONUS = 0.5;           // мусор падает быстрее на N за уровень

// Бонусы: магнит, замедление, щит (8% при спавне)
export const BONUS_SPAWN_CHANCE = 0.08;
export const BONUS_DURATION_MS = 5000;   // магнит, замедление
export const BONUS_SHIELD_DURATION_MS = 15000;  // щит 15 сек, не накапливается
export const BONUS_MAGNET_PULL = 1.2;    // сила притяжения
export const BONUS_SLOW_FACTOR = 0.4;    // множитель скорости (0.4 = 60% замедление)
