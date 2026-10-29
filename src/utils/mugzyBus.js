const listeners = new Set();
export function onTaskComplete(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function fireTaskComplete() {
  listeners.forEach(fn => fn());
}

// Mugzy speech bubble: mugzySay('text') shows a short message next to Mugzy for a few seconds.
const sayListeners = new Set();
export function onMugzySay(fn) {
  sayListeners.add(fn);
  return () => sayListeners.delete(fn);
}
export function mugzySay(text) {
  sayListeners.forEach(fn => fn(text));
}
