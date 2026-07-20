// Backs up and restores ALL CozyDesk data by operating directly on localStorage.
// It captures every key starting with "cozydesk" — desk autosaves, all named save
// slots, the shared calendar, and settings — so nothing is missed and new keys are
// captured automatically in future.

const PREFIX = 'cozydesk';
const BACKUP_MARKER = 'cozydesk-backup';

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

      try {
        // Clear existing cozydesk keys first (restore is a full replace).
        const toRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(PREFIX)) toRemove.push(key);
        }
        toRemove.forEach((k) => localStorage.removeItem(k));

        // Write the backup's keys back.
        for (const [key, value] of Object.entries(parsed.data)) {
          if (key.startsWith(PREFIX) && typeof value === 'string') {
            localStorage.setItem(key, value);
          }
        }
      } catch {
        return resolve({ ok: false, reason: 'write-failed' });
      }

      resolve({ ok: true });
    };

    reader.readAsText(file);
  });
}
