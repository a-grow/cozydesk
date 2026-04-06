// ─── Theme Registry ───────────────────────────────────────────────
// Auto-discovers theme folders and their assets via Vite's import.meta.glob.
// To add a new theme, create a folder under src/themes/<name>/ with
// subfolders: stickers/, stickynotes/, widgets/, props/, wallart/
// Then add a visual config entry in THEME_CONFIGS below.
// ──────────────────────────────────────────────────────────────────
import lofiBackground from '../assets/backgrounds/lofiblue.png';
import steampunkBackground from '../assets/backgrounds/steampunkbg.png';

// ── Asset discovery (build-time glob) ──
const allThemeStickers = import.meta.glob(
  './*/stickers/*.{png,jpg,jpeg,webp,gif}',
  { eager: true }
);

const allThemeStickyNotes = import.meta.glob(
  './*/stickynotes/*.{png,jpg,jpeg,webp,gif}',
  { eager: true }
);

// ── Visual config per theme ──
const THEME_CONFIGS = {
  cozykawaii: {
    name: 'Cozy Kawaii',
    background: "url('/src/assets/backgrounds/cozycornerbg.png')",
    text: '#4b4b4b',
    accent: '#ffb6b9',
    fontFamily: "'Comic Neue', cursive",
    previewBg: '#fff8f0',
    previewAccent: '#ffb6b9',
  },
  lofi: {
    name: 'Lo-Fi',
    background: `url(${lofiBackground})`,
    text: '#e0e0e0',
    accent: '#a29bfe',
    fontFamily: "'Courier New', monospace",
    previewBg: '#1e1e2f',
    previewAccent: '#a29bfe',
  },
  steampunk: {
    name: 'Steampunk',
    background: `url(${steampunkBackground})`,
    text: '#f5deb3',
    accent: '#c19a6b',
    fontFamily: "'Cinzel Decorative', serif",
    previewBg: '#3b2f2f',
    previewAccent: '#c19a6b',
  },
};

// ── Group glob results by theme folder name ──
function groupByTheme(globResult) {
  const themes = {};
  for (const [path, module] of Object.entries(globResult)) {
    // path example: "./cozykawaii/stickers/plant.png"
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

// Discover all theme names (union of folders with assets + configured themes)
const discoveredFolders = new Set([
  ...Object.keys(stickersByTheme),
  ...Object.keys(stickyNotesByTheme),
]);

// Only expose themes that have a config entry AND at least some assets,
// OR themes that appear in both config and folders.
// This ensures new themes are auto-detected when assets are added.
const availableThemeNames = Object.keys(THEME_CONFIGS).filter(
  (name) => discoveredFolders.has(name) || THEME_CONFIGS[name]
);

// ── Public API ──
export function getThemeConfig(name) {
  return THEME_CONFIGS[name] || THEME_CONFIGS.cozykawaii;
}

export function getThemeStickers(name) {
  return stickersByTheme[name] || [];
}

export function getThemeStickyNotes(name) {
  return stickyNotesByTheme[name] || [];
}

export { THEME_CONFIGS, availableThemeNames, stickersByTheme, stickyNotesByTheme };
