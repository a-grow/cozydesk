// dynasty/world.js — EVERYTHING about this world in one place.
// The folder name IS the world key. It is used inside customers' save keys —
// NEVER rename this folder.
//
// stickers/  = what shows in the sticker panel (PNG + animated WebP).
// stills/    = still copies of the animated stickers (for a future "reduce motion"
//              option). Nothing imports them yet.
//
// Art rule (Andy): life, culture and beautiful furniture only. No religion, myths,
// dragons, lucky charms, incense or spiritual symbols.

import DigitalClockSticker from '../../components/DigitalClockSticker';
import CalendarSticker from '../../components/CalendarSticker';
import dynastyBackground from '../../assets/backgrounds/dynasty-background.png';
import dynastyCalendarBase from './widgets/dynasty-calendar.png';
import dynastyClockImg from './widgets/dynasty-clock.png';

// Music — filenames are the license paper trail (Pixabay). Never rename.
import dynasty1 from '../../assets/music/dynasty-kaazoom-mountain-spring-full-version-chinese-music-410476.mp3';
import dynasty2 from '../../assets/music/dynasty-djovan-gardens-of-the-dynasty-443408.mp3';
import dynasty3 from '../../assets/music/dynasty-djovan-nights-of-the-palace-443437.mp3';
import dynasty4 from '../../assets/music/dynasty-lunarboommusic-chinese-harmony-564699.mp3';
import dynasty5 from '../../assets/music/dynasty-mccb_visuals-wither-tears-370809.mp3';

// Background sound — one loop mixed from 3 Pixabay sounds (kept quiet):
// freesound_community "calm garden ambience" 29993, dragon-studio "quiet stream" 420899,
// ahmed_abdulaal "nature birds singing" 336990.
import dynastyAmbience from './sounds/dynasty-ambience-garden-stream-birds-29993-420899-336990.mp3';

// Desk look & widgets (colors, sizes, to-do paper, calendar, clock).
const config = {
  name: 'Ancient Dynasty',
  background: `url(${dynastyBackground})`,
  text: '#f5e6c8',
  accent: '#d4a84b',
  fontFamily: "'Nunito', sans-serif",
  previewBg: '#4a1f14',
  previewAccent: '#d4a84b',
  themeColor: '#4a1f14',
  tabStyle: { backgroundColor: '#7a2e1f', color: '#f5e6c8', boxShadow: '0 2px 8px rgba(122,46,31,0.5)', hoverGlow: '0 0 14px rgba(212,168,75,0.7)' },
  sound: 'pastel-click',
  modalTheme: { bg: '#2a140d', border: '#5c3420', text: '#f5e6c8', accent: '#d4a84b', headerBg: '#3a1d12', subtext: '#c9a77a', inputBg: '#3a1d12' },
  brandFont: "'Nunito', sans-serif",
  defaultNoteFont: "'Nunito', sans-serif",
  todoTextArea: { top: '25%', left: '13%', right: '13%', bottom: '12%' },
  todoSize: { wRatio: 0.18, hRatio: 0.18 },           // legacy, unused
  todoBase: { w: 358, h: 358 },                       // image is 951x952
  showTape: false,
  // No todoInputColor: this paper is light, so items use the app's dark ink.
  checkboxBorder: '2px solid #2e7d5a',
  clockComponent: DigitalClockSticker,
  clockTheme: {
    image: dynastyClockImg,
    aspect: 623 / 1273,                               // height / width of the art
    screen: { left: '15.9%', right: '16.1%', top: '13.6%', bottom: '23.9%' },
    numberColor: '#f6c85a',
    numberFont: "'Nunito', sans-serif",
    activeBtn:   { bg: '#d4a84b', color: '#2a140d', border: '#d4a84b' },
    inactiveBtn: { bg: '#2a140d', color: '#d4a84b', border: '#d4a84b' },
    hideFlip: true,
  },
  calendarComponent: CalendarSticker,
  stickyNoteSize: 180,
  maxItems: 5,
  calendarTheme: {
    image: dynastyCalendarBase,
    baseW: 240,
    baseH: 264,                                        // image is 654x718
    contentArea: { top: '110px', left: '22px', right: '22px', bottom: '18px' },
    font: "'Nunito', sans-serif",
    gridAutoRows: '15px',
    navFontSize: '16px',
    monthFontSize: '11px',
    colors: {
      accent: '#2e7d5a',
      text: '#3a1d12',
      today: '#2e7d5a',
      selectedBg: 'rgba(46,125,90,0.18)',
      dayLabel: '#8a5a32',
      navBtn: '#7a2e1f',
      popupBg: '#2a140d',
      popupBorder: '#5c3420',
      popupText: '#f5e6c8',
      addBtn: '#2e7d5a',
      contentBg: 'transparent',
    },
    sizeButtons: {
      active: { bg: '#2e7d5a', color: '#fff', border: '#2e7d5a' },
      inactive: { bg: '#fff', color: '#2e7d5a', border: '#2e7d5a' },
    },
  },
  // Quiet garden, stream and birds, looped while this world is open (follows the Sound Effects switch).
  ambience: dynastyAmbience,
};

export default {
  order: 6,                 // position in the World Gallery
  paid: true,
  price: "$2.99",
  gumroadProductId: "",     // TODO: copy from the Gumroad dashboard once the product exists
  gumroadUrl: "https://doodleandy.gumroad.com/l/ancient-dynasty",   // TODO: confirm after creating the product
  flavor: "Step into a study from an ancient Chinese dynasty. Carved rosewood walls, glowing silk lanterns, warm tea and dumplings, and a cherry blossom garden just outside the window. Settle in and get your work done.",
  backgroundImage: dynastyBackground,
  music: [dynasty1, dynasty2, dynasty3, dynasty4, dynasty5],
  config,
};
