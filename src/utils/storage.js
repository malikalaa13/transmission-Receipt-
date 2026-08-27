const prefix = 'trm:';
export function readStore(key, fallback) {
  try { const raw = localStorage.getItem(prefix + key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
export function writeStore(key, value) { localStorage.setItem(prefix + key, JSON.stringify(value)); }
export function removeStore(key) { localStorage.removeItem(prefix + key); }
