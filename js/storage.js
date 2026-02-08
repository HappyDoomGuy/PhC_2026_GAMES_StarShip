/**
 * Работа с localStorage
 */

const RECORD_KEY = 'supradin_record';

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
