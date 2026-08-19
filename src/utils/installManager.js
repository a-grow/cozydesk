let deferredPrompt = null;
let installed = false;
const listeners = new Set();

function notify() {
  listeners.forEach(fn => { try { fn(); } catch (_) {} });
}

function isStandalone() {
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  } catch (_) {
    return false;
  }
}

export const installManager = {
  // Called once from main.jsx, as early as possible.
  init() {
    if (isStandalone()) installed = true;

    window.addEventListener('beforeinstallprompt', (e) => {
      // Stash the event so we can trigger the prompt later on a user click.
      e.preventDefault();
      deferredPrompt = e;
      notify();
    });

    window.addEventListener('appinstalled', () => {
      installed = true;
      deferredPrompt = null;
      notify();
    });
  },

  // True only when we have a real prompt to fire AND we're not already installed.
  canInstall() {
    return !installed && !!deferredPrompt;
  },

  // Fires the native install prompt. Returns the outcome, or null if unavailable.
  async promptInstall() {
    if (!deferredPrompt) return null;
    const evt = deferredPrompt;
    deferredPrompt = null; // a prompt can only be used once
    notify();
    try {
      evt.prompt();
      const choice = await evt.userChoice;
      return choice?.outcome ?? null;
    } catch (_) {
      return null;
    }
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
