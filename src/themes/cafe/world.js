// cafe/world.js — EVERYTHING about this world in one place.
// The folder name IS the world key. It is used inside customers' save keys —
// NEVER rename this folder.

import DigitalClockSticker from '../../components/DigitalClockSticker';
import CalendarSticker from '../../components/CalendarSticker';
import cafeBackground from '../../assets/backgrounds/cafe-background.png';
import cafeCalendarBase from './widgets/cafe-calendar.png';
import cafeClockImg from './widgets/cafe-clock.png';

// Music — filenames are the license paper trail (Pixabay). Never rename.
import cafe1 from '../../assets/music/cafe-cocosmusic-golden-era-groove-293634.mp3';
import cafe2 from '../../assets/music/cafe-soundore-jazz-cafe-379564.mp3';
import cafe3 from '../../assets/music/cafe-tunetank-cafe-music-349477.mp3';
import cafe4 from '../../assets/music/cafe-tunetank-calm-lounge-cafe-music-347401.mp3';

// Desk look & widgets (colors, sizes, to-do paper, calendar, clock).
const config = {
  name: 'Café Morning',
  background: `url(${cafeBackground})`,
  text: '#f5f0e8',
  accent: '#2d5a27',
  fontFamily: "'Nunito', sans-serif",
  previewBg: '#7a1f2e',
  previewAccent: '#2d5a27',
  themeColor: '#7a1f2e',
  tabStyle: { backgroundColor: '#2d5a27', color: '#f5f0e8', boxShadow: '0 2px 8px rgba(45,90,39,0.5)', hoverGlow: '0 0 14px rgba(45,90,39,0.7)' },
  sound: 'pastel-click',
  modalTheme: { bg: '#3d1a20', border: '#5a2d35', text: '#f5f0e8', accent: '#2d5a27', headerBg: '#4a2028', subtext: '#c4a882', inputBg: '#4a2028' },
  brandFont: "'Nunito', sans-serif",
  defaultNoteFont: "'Nunito', sans-serif",
  todoTextArea: { top: '25%', left: '22%', right: '14%', bottom: '28%' },
  todoSize: { wRatio: 0.18, hRatio: 0.202 },
  todoBase: { w: 358, h: 353 },
  showTape: true,
  todoInputColor: '#f0ece3',
  checkboxBorder: '2px solid #2d5a27',
  clockComponent: DigitalClockSticker,
  clockTheme: {
    image: cafeClockImg,
    aspect: 617 / 945,
    screen: { left: '10%', right: '10%', top: '15%', bottom: '32%' },
    numberColor: '#f6b73c',
    numberFont: "'Nunito', sans-serif",
    activeBtn:   { bg: '#f6b73c', color: '#2c1a0e', border: '#f6b73c' },
    inactiveBtn: { bg: '#2c1a0e', color: '#f6b73c', border: '#f6b73c' },
    hideFlip: true,
  },
  calendarComponent: CalendarSticker,
  stickyNoteSize: 180,
  maxItems: 5,
  calendarTheme: {
    image: cafeCalendarBase,
    baseW: 240,
    baseH: 275,
    contentArea: { top: '100px', left: '38px', right: '38px', bottom: '20px' },
    font: "'Nunito', sans-serif",
    gridAutoRows: '15px',
    navFontSize: '16px',
    monthFontSize: '11px',
    colors: {
      accent: '#2d5a27',
      text: '#2a1a0a',
      today: '#2d5a27',
      selectedBg: 'rgba(45,90,39,0.2)',
      dayLabel: '#5a3e28',
      navBtn: '#2d5a27',
      popupBg: '#3d1a20',
      popupBorder: '#5a2d35',
      popupText: '#f5f0e8',
      addBtn: '#2d5a27',
      contentBg: 'transparent',
    },
    sizeButtons: {
      active: { bg: '#2d5a27', color: '#fff', border: '#2d5a27' },
      inactive: { bg: '#fff', color: '#2d5a27', border: '#2d5a27' },
    },
  },
};

export default {
  order: 4,                 // position in the World Gallery
  paid: true,
  price: "$2.99",
  gumroadProductId: "ag20VA20ZA5MRprzdCfkbQ==",
  gumroadUrl: "https://doodleandy.gumroad.com/l/cafe-morning",
  flavor: "A fresh cup and a cozy table that's always waiting. It's morning here whenever you need it to be — quiet, unhurried, and entirely yours.",
  backgroundImage: cafeBackground,
  music: [cafe1, cafe2, cafe3, cafe4],
  config,
};
