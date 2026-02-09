/**
 * Работа с localStorage
 */

const RECORD_KEY = 'supradin_record';
const RECORD_COMBO_KEY = 'supradin_record_combo';
const SHIP_KEY = 'supradin_ship';

export function getShipType() {
  try {
    const val = localStorage.getItem(SHIP_KEY);
    return (val === 'r' || val === 'b') ? val : 'r';
  } catch {
    return 'r';
  }
}

export function setShipType(type) {
  try {
    if (type === 'r' || type === 'b') {
      localStorage.setItem(SHIP_KEY, type);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export function getRecord() {
  try {
    const val = localStorage.getItem(RECORD_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export function setRecord(score) {
  try {
    const current = getRecord();
    if (score > current) {
      localStorage.setItem(RECORD_KEY, String(score));
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export function getRecordCombo() {
  try {
    const val = localStorage.getItem(RECORD_COMBO_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export function setRecordCombo(combo) {
  try {
    const current = getRecordCombo();
    if (combo > current) {
      localStorage.setItem(RECORD_COMBO_KEY, String(combo));
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export function getLevelStars(level) {
  try {
    const data = JSON.parse(localStorage.getItem(STARS_KEY) || '{}');
    return data[level] || 0;
  } catch {
    return 0;
  }
}

export function setLevelStars(level, stars) {
  try {
    const data = JSON.parse(localStorage.getItem(STARS_KEY) || '{}');
    const current = data[level] || 0;
    if (stars > current) {
      data[level] = stars;
      localStorage.setItem(STARS_KEY, JSON.stringify(data));
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export function getTotalStars() {
  try {
    const data = JSON.parse(localStorage.getItem(STARS_KEY) || '{}');
    return Object.values(data).reduce((s, n) => s + n, 0);
  } catch {
    return 0;
  }
}
