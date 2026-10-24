// licenseManager.js
// Owns which worlds are paid vs free, and which paid worlds the user has unlocked.
// Unlocks are verified against Gumroad once, then cached to localStorage forever (offline after).
// No secrets live here: Gumroad's verify endpoint needs only product_id + license_key (both public).

const UNLOCK_KEY = 'cozydesk_unlocked';
const VERIFY_URL = 'https://api.gumroad.com/v2/licenses/verify';

// Gumroad product IDs (public — safe in frontend).
const PRODUCT_IDS = {
  cafe: 'ag20VA20ZA5MRprzdCfkbQ==',
  steampunk: 'dTPl_boio9BdX4AmKgLFDA==',
  bundle: 'ow1nWZSw-biORBpzMWA1Qw==',
};

// Which worlds require payment. Everything not listed here is free.
const PAID_WORLDS = ['cafe', 'steampunk'];

// A bundle key unlocks EVERY paid world — including worlds added later.
const BUNDLE_UNLOCKS = PAID_WORLDS;

// Record format version stored inside cozydesk_unlocked (additive field, see migrateUnlocks).
const UNLOCKS_VERSION = 2;

function readUnlocks() {
  try {
    const raw = localStorage.getItem(UNLOCK_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}

function writeUnlocks(obj) {
  try {
    localStorage.setItem(UNLOCK_KEY, JSON.stringify(obj));
  } catch (_) {}
}

// One-time upgrade of existing purchase records (runs once per browser, at startup).
// Old records only list worlds (e.g. { cafe: true, steampunk: true }) — they can't tell a
// bundle buyer from someone who bought both worlds separately. Decision (Oct 23, 2026):
// anyone who already owns BOTH is treated as a bundle owner, so new worlds unlock for them.
// Only ADDS fields ('bundle', '_v'); never removes. Old app versions ignore the extra fields.
function migrateUnlocks() {
  try {
    if (!localStorage.getItem(UNLOCK_KEY)) return; // no purchases on record — nothing to upgrade
    const unlocks = readUnlocks();
    if (unlocks._v) return; // already upgraded
    if (unlocks.cafe === true && unlocks.steampunk === true) unlocks.bundle = true;
    unlocks._v = UNLOCKS_VERSION;
    writeUnlocks(unlocks);
  } catch (_) {}
}
migrateUnlocks();

// True if this browser has a bundle purchase on record.
export function ownsBundle() {
  return readUnlocks().bundle === true;
}

export function isPaidWorld(name) {
  return PAID_WORLDS.includes(name);
}

export function isWorldUnlocked(name) {
  if (!isPaidWorld(name)) return true; // free worlds always open
  const unlocks = readUnlocks();
  if (unlocks[name] === true) return true;
  return unlocks.bundle === true && BUNDLE_UNLOCKS.includes(name);
}

// Marks one or more worlds unlocked in the cache (and the bundle, if bought).
function grantUnlocks(worldNames, isBundle = false) {
  const unlocks = readUnlocks();
  worldNames.forEach((w) => { unlocks[w] = true; });
  if (isBundle) unlocks.bundle = true;
  unlocks._v = UNLOCKS_VERSION;
  writeUnlocks(unlocks);
}

// Calls Gumroad for a single product_id + key. Returns the raw parsed JSON,
// or throws on network/CORS failure so the caller can surface a clear message.
async function callVerify(productId, licenseKey) {
  const body = new URLSearchParams();
  body.append('product_id', productId);
  body.append('license_key', licenseKey.trim());
  body.append('increment_uses_count', 'false'); // checking never burns a use

  const res = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  return res.json();
}

// A verify result counts as a valid, active purchase only if Gumroad says
// success AND the purchase was not refunded / chargebacked / disputed.
function isValidPurchase(data) {
  if (!data || data.success !== true) return false;
  const p = data.purchase || {};
  if (p.refunded === true) return false;
  if (p.chargebacked === true) return false;
  if (p.disputed === true) return false;
  return true;
}

// Verify a key for a target world.
// Tries the world's own product first, then the bundle.
// On success, caches the unlock(s) and returns { ok: true, unlocked: [...] }.
// On an invalid/refunded/wrong key, returns { ok: false, reason: 'invalid' }.
// On network/CORS failure, returns { ok: false, reason: 'network' }.
export async function verifyAndUnlock(worldName, licenseKey) {
  if (!isPaidWorld(worldName)) {
    return { ok: true, unlocked: [worldName] }; // nothing to buy
  }
  const key = (licenseKey || '').trim();
  if (!key) return { ok: false, reason: 'invalid' };

  const ownId = PRODUCT_IDS[worldName];

  try {
    // 1) Try the world's own product.
    if (ownId) {
      const data = await callVerify(ownId, key);
      if (isValidPurchase(data)) {
        grantUnlocks([worldName]);
        return { ok: true, unlocked: [worldName] };
      }
    }

    // 2) Try the bundle.
    const bundleData = await callVerify(PRODUCT_IDS.bundle, key);
    if (isValidPurchase(bundleData)) {
      grantUnlocks(BUNDLE_UNLOCKS, true);
      return { ok: true, unlocked: [...BUNDLE_UNLOCKS] };
    }

    // Key was readable by Gumroad but matched neither this product nor the bundle,
    // or the purchase was refunded/chargebacked.
    return { ok: false, reason: 'invalid' };
  } catch (_) {
    // fetch threw — almost always a network drop or a CORS block from the browser.
    return { ok: false, reason: 'network' };
  }
}

// Exposed for future UI / debugging.
export { PRODUCT_IDS, PAID_WORLDS, BUNDLE_UNLOCKS };
