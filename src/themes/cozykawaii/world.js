// cozykawaii/world.js — EVERYTHING about this world in one place.
// The folder name IS the world key. It is used inside customers' save keys —
// NEVER rename this folder.

import ClockSticker from '../../components/ClockSticker';
import CalendarSticker from '../../components/CalendarSticker';
import cozyBackground from '../../assets/backgrounds/cozycornerbg.png';
import kawaiiCalendarBase from './widgets/cozycalendarbase.png';

// Music — filenames are the license paper trail (Pixabay). Never rename.
import kawaii1 from '../../assets/music/kawaii-cavnai-Mossy Tea Picnic.mp3';
import kawaii2 from '../../assets/music/kawaii-bluelike_u-5-strawberry-mousse-cute-bgm-274668.mp3';
import kawaii3 from '../../assets/music/kawaii-ruminamusic-magical-burger-town-cute-fantasy-pop-background-music-386974.mp3';
import kawaii4 from '../../assets/music/kawaii-cavnai-Mochi Tea Party.mp3';

// Desk look & widgets (colors, sizes, to-do paper, calendar, clock).
const config = {
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
    todoTextArea: { top: '30%', left: '12%', right: '6%', bottom: '8%' },
    todoSize: { wRatio: 0.18, hRatio: 0.202 },
    todoBase: { w: 358, h: 402 },
    showTape: true,
    todoInputColor: undefined,
    checkboxBorder: '2px solid #c8a97e',
    clockComponent: ClockSticker,
    calendarComponent: CalendarSticker,
    stickyNoteSize: 180,
    maxItems: 6,
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
};

export default {
  order: 1,                 // position in the World Gallery
  paid: false,
  price: null,
  gumroadProductId: null,
  gumroadUrl: null,
  flavor: null,
  backgroundImage: cozyBackground,
  music: [kawaii1, kawaii2, kawaii3, kawaii4],
  config,
};
