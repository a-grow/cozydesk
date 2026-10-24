// Backs up and restores ALL CozyDesk data by operating directly on localStorage.
// It captures every key starting with "cozydesk" — desk autosaves, all named save
// slots, the shared calendar, and settings — so nothing is missed and new keys are
// captured automatically in future.

const PREFIX = 'cozydesk';
const BACKUP_MARKER = 'cozydesk-backup';
const UNLOCK_KEY = 'cozydesk_unlocked';

// Set once a restore has been written. Until the page reloads, the desk must NOT autosave —
// otherwise the desk still on screen overwrites the restored copy of the current world.
let restoreDone = false;
export function isRestoreDone() {
  return restoreDone;
}

// Purchases are never lost by a restore: unlocks from the current browser and from the
// backup are combined (anything unlocked in either stays unlocked).
function mergeUnlocks(currentRaw, backupRaw) {
  const parse = (raw) => {
    try { const o = JSON.parse(raw); return o && typeof o === 'object' ? o : {}; } catch { return {}; }
  };
  const a = parse(currentRaw);
  const b = parse(backupRaw);
  const merged = { ...b, ...a };
  for (const k of Object.keys(b)) if (b[k] === true) merged[k] = true;
  return JSON.stringify(merged);
}

// True if there is any saved CozyDesk data worth backing up.
export function hasBackupData() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) return true;
  }
  return false;
}

// Gather every cozydesk key into a single object and trigger a file download.
export function downloadBackup() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      data[key] = localStorage.getItem(key);
    }
  }

  const payload = {
    _marker: BACKUP_MARKER,
    _version: 1,
    _savedAt: new Date().toISOString(),
    data,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  a.href = url;
  a.download = `cozydesk-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Read a chosen File, validate it's a real CozyDesk backup, then restore.
// Returns a Promise that resolves { ok: true } on success or { ok: false, reason }
// if the file is not a valid backup. On success, the caller should reload the app.
export function restoreFromFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onerror = () => resolve({ ok: false, reason: 'unreadable' });

    reader.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(reader.result);
      } catch {
        return resolve({ ok: false, reason: 'invalid' });
      }

      if (!parsed || parsed._marker !== BACKUP_MARKER || typeof parsed.data !== 'object' || parsed.data === null) {
        return resolve({ ok: false, reason: 'invalid' });
      }

      // Only CozyDesk entries count. An empty backup is refused — restoring it would wipe everything.
      const entries = Object.entries(parsed.data).filter(
        ([key, value]) => key.startsWith(PREFIX) && typeof value === 'string'
      );
      if (entries.length === 0) return resolve({ ok: false, reason: 'invalid' });

      // Snapshot the current data first, so nothing can be lost if writing fails halfway
      // (e.g. browser storage full). Restore is a full replace: clear, then write.
      const snapshot = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(PREFIX)) snapshot[key] = localStorage.getItem(key);
      }

      const clearAll = () => {
        const toRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(PREFIX)) toRemove.push(key);
        }
        toRemove.forEach((k) => localStorage.removeItem(k));
      };

      restoreDone = true; // block autosave from here on (nothing may write over the restore)
      try {
        clearAll();
        for (const [key, value] of entries) localStorage.setItem(key, value);
        if (snapshot[UNLOCK_KEY]) {
          localStorage.setItem(UNLOCK_KEY, mergeUnlocks(snapshot[UNLOCK_KEY], localStorage.getItem(UNLOCK_KEY)));
        }
      } catch {
        // Put everything back exactly as it was before the restore started.
        try {
          clearAll();
          for (const [key, value] of Object.entries(snapshot)) localStorage.setItem(key, value);
        } catch (_) {}
        restoreDone = false; // restore failed and was rolled back — normal saving resumes
        return resolve({ ok: false, reason: 'write-failed' });
      }

      resolve({ ok: true });
    };

    reader.readAsText(file);
  });
}
