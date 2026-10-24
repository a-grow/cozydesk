// themeRegistry.js — the list of worlds, found automatically.
// Every world is ONE folder in src/themes/ with a world.js file inside
// (settings, price, music, flavor text). Add a folder → the world appears.
// The folder name is the world key used in customers' save keys — never rename one.

import noteYellow from '../assets/stickynotes/note-yellow.png';
import notePink   from '../assets/stickynotes/note-pink.png';
import noteBlue   from '../assets/stickynotes/note-blue.png';
import noteGreen  from '../assets/stickynotes/note-green.png';

const allThemeStickers = import.meta.glob(
  './*/stickers/*.{png,jpg,jpeg,webp,gif}',
  { eager: true }
);

const allThemeStickyNotes = import.meta.glob(
  './*/stickynotes/*.{png,jpg,jpeg,webp,gif}',
  { eager: true }
);

const worldModules = import.meta.glob('./*/world.js', { eager: true });

// All worlds, in World Gallery order. Each: { key, order, paid, price, gumroadProductId,
// gumroadUrl, flavor, backgroundImage, music, config }.
export const WORLDS = Object.entries(worldModules)
  .map(([path, mod]) => ({ key: path.split('/')[1], ...mod.default }))
  .sort((a, b) => a.order - b.order);

// Desk settings per world (same shape as before the move to world.js files).
const THEME_CONFIGS = Object.fromEntries(WORLDS.map((w) => [w.key, w.config]));

function groupByTheme(globResult) {
  const themes = {};
  for (const [path, module] of Object.entries(globResult)) {
    const parts = path.split('/');
    const themeName = parts[1];
    const fileName = parts[parts.length - 1];
    if (!themes[themeName]) themes[themeName] = [];
    themes[themeName].push({ name: fileName, src: module.default });
  }
  return themes;
}

const stickersByTheme = groupByTheme(allThemeStickers);
const stickyNotesByTheme = groupByTheme(allThemeStickyNotes);

const discoveredFolders = new Set([
  ...Object.keys(stickersByTheme),
  ...Object.keys(stickyNotesByTheme),
]);

const availableThemeNames = Object.keys(THEME_CONFIGS).filter(
  (name) => discoveredFolders.has(name) || THEME_CONFIGS[name]
);

export function getThemeConfig(name) {
  return THEME_CONFIGS[name] || THEME_CONFIGS.cozykawaii;
}

export function getThemeStickers(name) {
  return stickersByTheme[name] || [];
}

const universalNotes = [
  { name: 'note-yellow.png', src: noteYellow },
  { name: 'note-pink.png',   src: notePink },
  { name: 'note-blue.png',   src: noteBlue },
  { name: 'note-green.png',  src: noteGreen },
];

export function getThemeStickyNotes(name) {
  const own = stickyNotesByTheme[name] || [];
  const ownNotes = own.filter(a => !a.name.includes('todo'));
  const ownTodo  = own.filter(a =>  a.name.includes('todo'));
  // No own color notes → use the universal set. Theme keeps its own to-do paper.
  const notes = ownNotes.length ? ownNotes : universalNotes;
  return [...notes, ...ownTodo];
}

// Raw background image URLs (registry stores them as `url(...)` CSS strings;
// the World Gallery needs the raw src for <img> thumbnails).
export const THEME_BACKGROUNDS = Object.fromEntries(
  WORLDS.map((w) => [w.key, w.backgroundImage])
);

// Gumroad checkout URLs for paid worlds (used by the unlock preview screen).
// Each paid world's link comes from its world.js; the bundle link lives here.
export const THEME_GUMROAD_URLS = {
  ...Object.fromEntries(WORLDS.filter((w) => w.gumroadUrl).map((w) => [w.key, w.gumroadUrl])),
  allaccess: 'https://doodleandy.gumroad.com/l/all-access',
};

export { THEME_CONFIGS, availableThemeNames, stickersByTheme, stickyNotesByTheme };