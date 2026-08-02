const listeners = new Set();
export function onTaskComplete(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function fireTaskComplete() {
  listeners.forEach(fn => fn());
}
