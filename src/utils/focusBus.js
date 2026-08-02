const listeners = new Set();
export function onFocusChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function setFocusActive(active) {
  listeners.forEach(fn => fn(active));
}
