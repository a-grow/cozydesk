// spacecruiser/world.js — EVERYTHING about this world in one place.
// The folder name IS the world key. It is used inside customers' save keys —
// NEVER rename this folder.
//
// stickers/  = what shows in the sticker panel (PNG + animated WebP).
// stills/    = still copies of the animated stickers (for a future "reduce motion"
//              option). Nothing imports them yet.

import DigitalClockSticker from '../../components/DigitalClockSticker';
import CalendarSticker from '../../components/CalendarSticker';
import spaceBackground from '../../assets/backgrounds/spacecruiser-background.png';
import spaceCalendarBase from './widgets/spacecruiser-calendar.png';
import spaceClockImg from './widgets/spacecruiser-clock.png';

// Music — filenames are the license paper trail (Pixabay). Never rename.
import space1 from '../../assets/music/spacecruiser-geoffharvey-the-blue-nebulae-331429.mp3';
import space2 from '../../assets/music/spacecruiser-geoffharvey-galactic-contact-330949.mp3';
import space3 from '../../assets/music/spacecruiser-geoffharvey-planetarium-330922.mp3';
import space4 from '../../assets/music/spacecruiser-geoffharvey-starfleet-command-150605.mp3';

// Sounds — filenames keep the source name (Pixabay / freesound). Never rename.
import spaceAmbience from './sounds/spacecruiser-ambience-bretbernhoft-space-flight-10-422488.mp3';
import spaceBeep from './sounds/spacecruiser-beep-freesound_community-beeps-107839.mp3';

// Food machine — what it can make (generator/ = only made by the machine, not in the sticker panel).
import genCandy from './generator/spacecruiser-gen-crystal-candy.png';
import genCake from './generator/spacecruiser-gen-galaxy-cake.png';
import genBerries from './generator/spacecruiser-gen-glow-berries.png';
import genJelly from './generator/spacecruiser-gen-jelly-cube.png';
import genMacarons from './generator/spacecruiser-gen-macarons.png';
import genDrink from './generator/spacecruiser-gen-sunset-drink.png';
import genBun from './generator/spacecruiser-gen-swirl-bun.png';
import genSkewer from './generator/spacecruiser-gen-veggie-skewer.png';
import genCocoa from './stickers/spacecruiser-drink-mug-cocoa.png';
import genRamen from './stickers/spacecruiser-food-ramen.png';
import genDonuts from './stickers/spacecruiser-food-donuts.png';
import genPancakes from './stickers/spacecruiser-food-pancakes.png';

// "Lights on" layers (lights/): same size as the sticker, only its lights brighter in their own colours.
const LIT_LAYERS = import.meta.glob('./lights/*.png', { eager: true, import: 'default' });
const litLayer = (file) => LIT_LAYERS[`./lights/spacecruiser-lit-${file.replace(/\.(png|webp)$/, '')}.png`];

// Desk look & widgets (colors, sizes, to-do paper, calendar, clock).
const config = {
  name: 'Space Cruiser',
  background: `url(${spaceBackground})`,
  text: '#eef0ff',
  accent: '#4fc9c4',
  fontFamily: "'Nunito', sans-serif",
  previewBg: '#1c2340',
  previewAccent: '#4fc9c4',
  themeColor: '#1c2340',
  tabStyle: { backgroundColor: '#2b3566', color: '#e8f4ff', boxShadow: '0 0 12px rgba(79,201,196,0.55), 0 2px 6px rgba(0,0,0,0.3)', hoverGlow: '0 0 20px rgba(79,201,196,0.9), 0 0 40px rgba(79,201,196,0.4)' },
  sound: 'lofi-pop',
  modalTheme: { bg: '#161c36', border: '#34406e', text: '#dfe6ff', accent: '#4fc9c4', headerBg: '#1f2748', subtext: '#8f9cc8', inputBg: '#1f2748' },
  brandFont: "'Nunito', sans-serif",
  defaultNoteFont: "'Nunito', sans-serif",
  todoTextArea: { top: '21%', left: '17%', right: '17%', bottom: '19%' },
  todoSize: { wRatio: 0.18, hRatio: 0.24 },          // legacy, unused
  todoBase: { w: 358, h: 419 },                       // 358 x image aspect (818x958)
  showTape: false,
  // No todoInputColor: this paper is light, so items use the app's dark ink.
  checkboxBorder: '2px solid #2f9f9a',
  clockComponent: DigitalClockSticker,
  clockTheme: {
    image: spaceClockImg,
    aspect: 660 / 938,
    screen: { left: '11%', right: '11%', top: '15.5%', bottom: '22%' },
    numberColor: '#6ff3ea',
    numberFont: "'Nunito', sans-serif",
    activeBtn:   { bg: '#4fc9c4', color: '#101830', border: '#4fc9c4' },
    inactiveBtn: { bg: '#101830', color: '#4fc9c4', border: '#4fc9c4' },
    hideFlip: true,
  },
  calendarComponent: CalendarSticker,
  stickyNoteSize: 180,
  maxItems: 5,
  calendarTheme: {
    image: spaceCalendarBase,
    baseW: 260,
    baseH: 260,                                        // image is square (886x886)
    contentArea: { top: '104px', left: '24px', right: '24px', bottom: '22px' },
    font: "'Nunito', sans-serif",
    gridAutoRows: '15px',
    navFontSize: '16px',
    monthFontSize: '11px',
    colors: {
      accent: '#2f9f9a',
      text: '#1e2a4a',
      today: '#2f9f9a',
      selectedBg: 'rgba(47,159,154,0.18)',
      dayLabel: '#5a6a9a',
      navBtn: '#2f9f9a',
      popupBg: '#161c36',
      popupBorder: '#34406e',
      popupText: '#dfe6ff',
      addBtn: '#2f9f9a',
      contentBg: 'transparent',
    },
    sizeButtons: {
      active: { bg: '#2f9f9a', color: '#fff', border: '#2f9f9a' },
      inactive: { bg: '#fff', color: '#2f9f9a', border: '#2f9f9a' },
    },
  },
  // Quiet cabin hum, looped while this world is open (follows the Sound Effects switch).
  ambience: spaceAmbience,
  // Sound played when a sticker is tapped (sticker file name → sound).
  stickerSounds: {
    'spacecruiser-wallart-panel-buttons.webp': spaceBeep,
    'spacecruiser-sidewall-panel.webp': spaceBeep,
    'spacecruiser-food-generator.png': spaceBeep,
  },
  // Tap the machine → a random food appears on its platform (not saved).
  // area/beam = % of the sticker image (measured on the 662x862 art).
  foodGenerators: {
    'spacecruiser-food-generator.png': {
      foods: [genCandy, genCake, genBerries, genJelly, genMacarons, genDrink, genBun, genSkewer,
              genCocoa, genRamen, genDonuts, genPancakes],
      area: { left: '25%', right: '25%', top: '30%', bottom: '23.5%' },
      beam: { left: '21%', right: '21%', top: '21%', bottom: '21%' },
    },
  },
  // Stickers with lights: tap to switch their lights on/off (sticker file name → "lights on" layer).
  // The on/off state is NOT saved (resets on reload).
  lightToggles: Object.fromEntries([
    'light-desklamp.webp', 'light-pendant.webp', 'light-sconce.webp', 'light-string-stars.webp',
    'sidewall-light.webp', 'energy-core.webp', 'device-walkietalkie.png',
    'animal-cat-pod.webp', 'rocket-model.png', 'wallart-panel-buttons.webp', 'sidewall-panel.webp',
    'wallart-radar.webp', 'plants-dome-succulent.png', 'sidewall-planter.png',
    'wallart-shelf-alien-plants.webp', 'star-projector.webp', 'wallart-shelf-alien-minerals.png',
    'wallart-cabinet-alien-collection.png', 'device-alien-curved-screen.png', 'device-alien-laptop.png',
    'device-alien-triple-screen.png', 'device-command-console.png', 'device-laptop.png', 'device-tablet.png',
  ].map((f) => [`spacecruiser-${f}`, litLayer(f)])),
};

export default {
  order: 5,                 // position in the World Gallery
  paid: true,
  price: "$2.99",
  gumroadProductId: "VZLFWQDb1s-_qexpB7y8NQ==",
  gumroadUrl: "https://doodleandy.gumroad.com/l/space-cruiser",
  flavor: "A little cabin on a spaceship, all to yourself. There's a sleepy cat, some glowing alien plants, and stars drifting past the window. Put on some music and get your work done.",
  backgroundImage: spaceBackground,
  music: [space1, space2, space3, space4],
  config,
};
