// steampunk/world.js — EVERYTHING about this world in one place.
// The folder name IS the world key. It is used inside customers' save keys —
// NEVER rename this folder.

import SteampunkClockSticker from '../../components/SteampunkClockSticker';
import CalendarSticker from '../../components/CalendarSticker';
import steampunkBackground from '../../assets/backgrounds/steampunkbg.png';
import steampunkCalendarBase from './widgets/stmpnkcalendarbase.png';

// Music — filenames are the license paper trail (Pixabay). Never rename.
import steampunk1 from '../../assets/music/steampunk-cavnai-Tea at Baker Street.mp3';
import steampunk2 from '../../assets/music/steampunk-luis_humanoide-clockwork-adventure-288524.mp3';
import steampunk3 from '../../assets/music/steampunk-pardeeppatel-under-the-london-fog-v1-inspired-by-sherlock-holmes-270425.mp3';
import steampunk4 from '../../assets/music/steampunk-alex-morgan-string-quartet-elegance-537464.mp3';

// Desk look & widgets (colors, sizes, to-do paper, calendar, clock).
const config = {
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
    todoTextArea: { top: '18%', left: '26%', right: '6%', bottom: '6%' },
    todoSize: { wRatio: 0.18, hRatio: 0.261 },
    todoBase: { w: 358, h: 519 },
    showTape: true,
    todoInputColor: undefined,
    checkboxBorder: '2px solid #c8a97e',
    clockComponent: SteampunkClockSticker,
    calendarComponent: CalendarSticker,
    stickyNoteSize: 180,
    maxItems: 6,
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
};

export default {
  order: 3,                 // position in the World Gallery
  paid: true,
  price: "$2.99",
  gumroadProductId: "dTPl_boio9BdX4AmKgLFDA==",
  gumroadUrl: "https://doodleandy.gumroad.com/l/steampunk",
  flavor: "Brass, lamplight, and the slow turn of gears. A workshop built for long, focused hours — where the work pulls you in and the world outside goes quiet.",
  backgroundImage: steampunkBackground,
  music: [steampunk1, steampunk2, steampunk3, steampunk4],
  config,
};
