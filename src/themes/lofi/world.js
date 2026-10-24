// lofi/world.js — EVERYTHING about this world in one place.
// The folder name IS the world key. It is used inside customers' save keys —
// NEVER rename this folder.

import LofiClockSticker from '../../components/LofiClockSticker';
import CalendarSticker from '../../components/CalendarSticker';
import lofiBackground from '../../assets/backgrounds/lofiblue.png';
import lofiCalendarBase from './widgets/loficalendarbase.png';

// Music — filenames are the license paper trail (Pixabay). Never rename.
import lofi1 from '../../assets/music/lofi_library-coffee-458900.mp3';
import lofi2 from '../../assets/music/lofi-lemonmusiclab-499264.mp3';
import lofi3 from '../../assets/music/lofi-lofi-production-522875.mp3';
import lofi4 from '../../assets/music/lofi-alex-morgan-peaceful-cafe-jazz-relaxing-coffee-shop-541031.mp3';

// Desk look & widgets (colors, sizes, to-do paper, calendar, clock).
const config = {
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
    todoTextArea: { top: 'calc(46% + 20px)', left: '10%', right: '10%', bottom: '14%' },
    todoSize: { wRatio: 0.18, hRatio: 0.38 },
    todoBase: { w: 358, h: 384 },
    showTape: false,
    todoInputColor: '#ffffff',
    checkboxBorder: '2px solid rgba(255,255,255,0.6)',
    clockComponent: LofiClockSticker,
    calendarComponent: CalendarSticker,
    stickyNoteSize: 180,
    maxItems: 4,
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
};

export default {
  order: 2,                 // position in the World Gallery
  paid: false,
  price: null,
  gumroadProductId: null,
  gumroadUrl: null,
  flavor: null,
  backgroundImage: lofiBackground,
  music: [lofi1, lofi2, lofi3, lofi4],
  config,
};
