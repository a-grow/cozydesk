const TERMS_KEY = 'cozydesk_terms_v1';

// Has the user already agreed to terms? Returns the stored acceptance date, or null.
export function hasAgreedToTerms() {
  try {
    return localStorage.getItem(TERMS_KEY);
  } catch (_) {
    return null;
  }
}

// Store today's date (YYYY-MM-DD) as the acceptance record.
export function recordTermsAgreement() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(TERMS_KEY, today);
  } catch (_) {}
}

// Does this user already have desk data? Checks for any real saved-desk keys.
// cozydesk_active_theme is NOT used here — it is written on every launch and would
// always look "set", so it cannot distinguish a new user from an existing one.
export function hasExistingDeskData() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('cozydesk_state_') || key.startsWith('cozydesk_saved_'))) {
        return true;
      }
    }
  } catch (_) {}
  return false;
}
