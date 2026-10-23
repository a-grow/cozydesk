// assetHeal.js
// Saved stickers and notes remember their picture by its built web address
// (e.g. /assets/cozycoffeemug-AbC123xY.png). That address changes whenever the
// art file is edited, renamed or converted — which would leave a blank on every
// customer's saved desk. This file finds the CURRENT picture for a saved item by
// its file name instead. Display-only: it never changes what is saved.

import { stickersByTheme } from '../themes/themeRegistry';

// Every sticky-note picture the app has ever shipped from these folders.
const noteModules = import.meta.glob(
  [
    '../assets/stickynotes/*.{png,jpg,jpeg,webp,gif}',
    '../themes/*/stickynotes/*.{png,jpg,jpeg,webp,gif}',
  ],
  { eager: true }
);

// "folder/name.png" -> "name" (no extension, lower case)
function stem(fileName) {
  return fileName.replace(/\.[a-z0-9]+$/i, '').toLowerCase();
}

// Last path segment of a saved address, without ?query or #hash.
function fileOf(src) {
  return String(src).split(/[?#]/)[0].split('/').pop() || '';
}

const notesByStem = {};
for (const [path, mod] of Object.entries(noteModules)) {
  const s = stem(path.split('/').pop());
  if (!notesByStem[s]) notesByStem[s] = mod.default;
}

// Universal note per color — rescue for very old notes whose file is gone.
const universalByColor = {
  yellow: notesByStem['note-yellow'],
  pink:   notesByStem['note-pink'],
  blue:   notesByStem['note-blue'],
  green:  notesByStem['note-green'],
};

// Find the stem a saved address belongs to. Handles both dev addresses
// ("/src/.../name.png") and built ones ("/assets/name-HASH.png").
// Longest matching stem wins, so "note-yellow-big" beats "note-yellow".
function matchStem(src, stems) {
  const file = fileOf(src).toLowerCase();
  if (!file) return null;
  const exact = stem(file);
  if (stems.includes(exact)) return exact;
  let best = null;
  for (const s of stems) {
    if (file.startsWith(s + '-') && (!best || s.length > best.length)) best = s;
  }
  return best;
}

export function healStickerSrc(sticker, themeName) {
  if (!sticker) return undefined;
  const saved = sticker.src;
  if (typeof saved === 'string' && saved.startsWith('data:')) return saved;
  const list = stickersByTheme[themeName] || [];
  if (sticker.name) {
    const want = stem(sticker.name);
    const hit = list.find(a => stem(a.name) === want);
    if (hit) return hit.src;
  }
  return saved;
}

export function healNoteSrc(saved) {
  if (typeof saved !== 'string' || !saved || saved.startsWith('data:')) return saved;
  const s = matchStem(saved, Object.keys(notesByStem));
  if (s) return notesByStem[s];
  const file = fileOf(saved).toLowerCase();
  const color = ['yellow', 'pink', 'blue', 'green'].find(c => file.includes(c));
  if (color && universalByColor[color]) return universalByColor[color];
  return saved;
}
