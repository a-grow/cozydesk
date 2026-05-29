import ClockSticker from '../components/ClockSticker';
import LofiClockSticker from '../components/LofiClockSticker';
import SteampunkClockSticker from '../components/SteampunkClockSticker';
import CalendarSticker from '../components/CalendarSticker';

import cozyBackground from '../assets/backgrounds/cozycornerbg.png';
import lofiBackground from '../assets/backgrounds/lofiblue.png';
import steampunkBackground from '../assets/backgrounds/steampunkbg.png';

import kawaiiCalendarBase from './cozykawaii/widgets/cozycalendarbase.png';
import lofiCalendarBase from './lofi/widgets/loficalendarbase.png';
import steampunkCalendarBase from './steampunk/widgets/stmpnkcalendarbase.png';

const allThemeStickers = import.meta.glob(
  './*/stickers/*.{png,jpg,jpeg,webp,gif}',
  { eager: true }
);

const allThemeStickyNotes = import.meta.glob(
  './*/stickynotes/*.{png,jpg,jpeg,webp,gif}',
  { eager: true }
);

const THEME_CONFIGS = {
  cozykawaii: {
    name: 'Cozy Kawaii',
    background: `url(${cozyBackground})`,
    text: '#4b4b4b',
    accent: '#ffb6b9',
    fontFamily: "'Nunito', sans-serif",
    previewBg: '#fff8f0',
    previewAccent: '#ffb6b9',
    themeColor: '#e6cba8',
    tabStyle: { backgroundColor: '#f5d0e5', color: '#fff', boxShadow: '0 2px 8px rgba(245,208,229,0.5)', hoverGlow: '0 0 14px rgba(245,208,229,0.7)' },
    sound: 'pastel-click',
    modalTheme: { bg: '#fff8f0', border: '#ecddd0', text: '#4b3b2a', accent: '#d4a373', headerBg: '#fdf0e8', subtext: '#a07850', inputBg: '#fffdf8' },
    brandFont: "'Nunito', sans-serif",
    defaultNoteFont: "'Nunito', sans-serif",
    stickyNoteTextArea: { top: '28%', left: '10%', right: '8%', bottom: '12%' },
    todoTextArea: { top: '30%', left: '12%', right: '6%', bottom: '8%' },
    showTape: true,
    todoInputColor: undefined,
    checkboxBorder: '2px solid #c8a97e',
    clockComponent: ClockSticker,
    calendarComponent: CalendarSticker,
    stickyNoteSize: 180,
    calendarTheme: {
      image: kawaiiCalendarBase,
      baseW: 260,
      baseH: 270,
      contentArea: { top: '62px', left: '18px', right: '18px', bottom: '58px' },
      font: "'Nunito', sans-serif",
      colors: {
        accent: '#8b5e3c',
        text: '#4b3b2a',
        today: '#d4a373',
        selectedBg: 'rgba(200,169,126,0.2)',
        dayLabel: '#b5977a',
        navBtn: '#8b5e3c',
        popupBg: 'white',
        popupBorder: '#e0d4c8',
        popupText: '#4b3b2a',
        addBtn: '#d4a373',
        contentBg: 'transparent',
      },
      sizeButtons: {
        active: { bg: '#d4a373', color: '#fff', border: '#d4a373' },
        inactive: { bg: '#fff', color: '#8b5e3c', border: '#d4a373' },
      },
    },
  },
  lofi: {
    name: 'Lo-Fi',
    background: `url(${lofiBackground})`,
    text: '#e0e0e0',
    accent: '#a29bfe',
    fontFamily: "'Nunito', sans-serif",
    previewBg: '#1e1e2f',
    previewAccent: '#a29bfe',
    themeColor: '#1e1e2f',
    tabStyle: { backgroundColor: '#6d5fc0', color: '#e8e0ff', boxShadow: '0 0 12px rgba(109,95,192,0.7), 0 2px 6px rgba(0,0,0,0.3)', hoverGlow: '0 0 22px rgba(109,95,192,1), 0 0 44px rgba(109,95,192,0.45)' },
    sound: 'lofi-pop',
    modalTheme: { bg: '#1a1a2e', border: '#3a3a5c', text: '#c8c4d8', accent: '#7c73c0', headerBg: '#252540', subtext: '#8888a8', inputBg: '#252540' },
    brandFont: "'Nunito', sans-serif",
    defaultNoteFont: "'Caveat', cursive",
    stickyNoteTextArea: { top: '8%', left: '8%', right: '10%', bottom: '6%' },
    todoTextArea: { top: 'calc(46% + 20px)', left: '10%', right: '10%', bottom: '14%' },
    showTape: false,
    todoInputColor: '#ffffff',
    checkboxBorder: '2px solid rgba(255,255,255,0.6)',
    clockComponent: LofiClockSticker,
    calendarComponent: CalendarSticker,
    stickyNoteSize: 180,
    calendarTheme: {
      image: lofiCalendarBase,
      baseW: 260,
      baseH: 340,
      contentArea: { top: '130px', left: '18px', right: '18px', bottom: '20px' },
      font: "'Nunito', sans-serif",
      colors: {
        accent: '#6d5fc0',
        text: '#e8e0ff',
        today: '#6d5fc0',
        selectedBg: 'rgba(124,115,192,0.2)',
        dayLabel: '#c5b8ff',
        navBtn: '#6d5fc0',
        popupBg: '#1e1640',
        popupBorder: '#7c73c0',
        popupText: '#e8e0ff',
        addBtn: '#7c73c0',
        contentBg: 'transparent',
      },
      sizeButtons: {
        active: { bg: '#7c73c0', color: '#fff', border: '#7c73c0' },
        inactive: { bg: '#fff', color: '#4d3fa0', border: '#7c73c0' },
      },
    },
  },
  steampunk: {
    name: 'Steampunk',
    background: `url(${steampunkBackground})`,
    text: '#f5deb3',
    accent: '#c19a6b',
    fontFamily: "'Cinzel Decorative', serif",
    previewBg: '#3b2f2f',
    previewAccent: '#c19a6b',
    themeColor: '#2a1f1f',
    tabStyle: { backgroundColor: '#b87333', color: '#3b2f2f', boxShadow: 'inset 0 0 4px #2a1f1f, 0 2px 6px rgba(0,0,0,0.3)', hoverGlow: '0 0 14px rgba(184,115,51,0.6)' },
    sound: 'gear-shift',
    modalTheme: { bg: '#2a2018', border: '#5a4a3a', text: '#e8d4b0', accent: '#b87333', headerBg: '#3a2e22', subtext: '#b8a080', inputBg: '#3a2e22' },
    brandFont: "'Cinzel Decorative', serif",
    defaultNoteFont: "'Nunito', sans-serif",
    stickyNoteTextArea: { top: '28%', left: '10%', right: '8%', bottom: '12%' },
    todoTextArea: { top: '30%', left: '12%', right: '6%', bottom: '8%' },
    showTape: true,
    todoInputColor: undefined,
    checkboxBorder: '2px solid #c8a97e',
    clockComponent: SteampunkClockSticker,
    calendarComponent: CalendarSticker,
    stickyNoteSize: 180,
    calendarTheme: {
      image: steampunkCalendarBase,
      baseW: 260,
      baseH: 300,
      contentArea: { top: '85px', left: '25px', right: '25px', bottom: '60px' },
      font: "'Nunito', sans-serif",
      colors: {
        accent: '#b87333',
        text: '#3b2f2f',
        today: '#b87333',
        selectedBg: 'rgba(184,115,51,0.2)',
        dayLabel: '#8b6914',
        navBtn: '#b87333',
        popupBg: '#2a2018',
        popupBorder: '#5a4a3a',
        popupText: '#e8d4b0',
        addBtn: '#b87333',
        contentBg: 'transparent',
      },
      sizeButtons: {
        active: { bg: '#b87333', color: '#fff', border: '#b87333' },
        inactive: { bg: '#fff', color: '#3b2f2f', border: '#b87333' },
      },
    },
  },
};

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

export function getThemeStickyNotes(name) {
  return stickyNotesByTheme[name] || [];
}

export { THEME_CONFIGS, availableThemeNames, stickersByTheme, stickyNotesByTheme };