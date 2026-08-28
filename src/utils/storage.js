const prefix = 'trm:';

export function readStore(key, fallback) {
try {
const raw = localStorage.getItem(prefix + key);


if (!raw) {
  return fallback;
}

return JSON.parse(raw);


} catch (error) {
console.error('Storage read error:', error);
return fallback;
}
}

export function writeStore(key, value) {
try {
localStorage.setItem(
prefix + key,
JSON.stringify(value)
);


return true;


} catch (error) {
console.error('Storage write error:', error);
return false;
}
}

export function removeStore(key) {
try {
localStorage.removeItem(prefix + key);


return true;


} catch (error) {
console.error('Storage remove error:', error);
return false;
}
}

export function clearStore() {
try {
Object.keys(localStorage)
.filter((key) => key.startsWith(prefix))
.forEach((key) => localStorage.removeItem(key));

return true;


} catch (error) {
console.error('Storage clear error:', error);
return false;
}
}
