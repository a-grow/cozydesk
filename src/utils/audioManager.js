// ── Music tracks ──────────────────────────────────────────────────────────
// Loaded via static imports so they survive the production (GitHub Pages /
// Tauri) build. Literal '/src/...' string paths only work in `npm run dev`
// and silently vanish once built — see the Asset Path Rule in CLAUDE.md.
// Filenames are kept exactly as-is (the Pixabay original names are the
// commercial-use paper trail) — never rename them.

// Cozy Kawaii
import kawaii1 from '../assets/music/kawaii-cavnai-Mossy Tea Picnic.mp3';
import kawaii2 from '../assets/music/kawaii-bluelike_u-5-strawberry-mousse-cute-bgm-274668.mp3';
import kawaii3 from '../assets/music/kawaii-ruminamusic-magical-burger-town-cute-fantasy-pop-background-music-386974.mp3';
import kawaii4 from '../assets/music/kawaii-cavnai-Mochi Tea Party.mp3';

// Lo-Fi
import lofi1 from '../assets/music/lofi_library-coffee-458900.mp3';
import lofi2 from '../assets/music/lofi-lemonmusiclab-499264.mp3';
import lofi3 from '../assets/music/lofi-lofi-production-522875.mp3';
import lofi4 from '../assets/music/lofi-alex-morgan-peaceful-cafe-jazz-relaxing-coffee-shop-541031.mp3';

// Steampunk
import steampunk1 from '../assets/music/steampunk-cavnai-Tea at Baker Street.mp3';
import steampunk2 from '../assets/music/steampunk-luis_humanoide-clockwork-adventure-288524.mp3';
import steampunk3 from '../assets/music/steampunk-pardeeppatel-under-the-london-fog-v1-inspired-by-sherlock-holmes-270425.mp3';
import steampunk4 from '../assets/music/steampunk-alex-morgan-string-quartet-elegance-537464.mp3';

// Café Morning
import cafe1 from '../assets/music/cafe-cocosmusic-golden-era-groove-293634.mp3';
import cafe2 from '../assets/music/cafe-soundore-jazz-cafe-379564.mp3';
import cafe3 from '../assets/music/cafe-tunetank-cafe-music-349477.mp3';
import cafe4 from '../assets/music/cafe-tunetank-calm-lounge-cafe-music-347401.mp3';

const THEME_TRACKS = {
  cozykawaii: [kawaii1, kawaii2, kawaii3, kawaii4],
  lofi:       [lofi1, lofi2, lofi3, lofi4],
  steampunk:  [steampunk1, steampunk2, steampunk3, steampunk4],
  cafe:       [cafe1, cafe2, cafe3, cafe4],
};

const LS_KEY = 'cozydesk_music';
const FADE_STEPS = 30;
const FADE_MS = 1500;

class AudioManager {
  constructor() {
    this.audio = new Audio();
    this.currentTheme = 'cozykawaii';
    this.trackIndex = 0;
    this.isPlaying = false;
    this.volume = 0.5;
    this.isMuted = false;
    this.prevVolume = 0.5;
    this.fadeInterval = null;
    this.listeners = new Set();

    // Restore from localStorage
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.volume = typeof data.volume === 'number' ? data.volume : 0.5;
        this.isMuted = !!data.isMuted;
        this.prevVolume = this.volume;
      }
    } catch (_) {}

    // Always start paused
    this.isPlaying = false;
    const tracks = THEME_TRACKS[this.currentTheme];
    this.audio.src = tracks[0];
    this.audio.volume = this.isMuted ? 0 : this.volume;
    this.audio.load();

    this.audio.onended = () => {
      const tracks = THEME_TRACKS[this.currentTheme];
      this.trackIndex = (this.trackIndex + 1) % tracks.length;
      this.audio.src = tracks[this.trackIndex];
      this.audio.volume = this.isMuted ? 0 : this.volume;
      this.audio.load();
      this.audio.play().catch(() => {});
      this.notify();
    };
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getState() {
    return {
      isPlaying: this.isPlaying,
      volume: this.volume,
      isMuted: this.isMuted,
      trackIndex: this.trackIndex,
      currentTheme: this.currentTheme,
    };
  }

  save() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        isPlaying: this.isPlaying,
        volume: this.volume,
        isMuted: this.isMuted,
      }));
    } catch (_) {}
  }

  clearFade() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }

  play() {
    this.audio.play().catch(() => {});
    this.isPlaying = true;
    this.save();
    this.notify();
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.save();
    this.notify();
  }

  next() {
    const tracks = THEME_TRACKS[this.currentTheme];
    this.trackIndex = (this.trackIndex + 1) % tracks.length;
    this.audio.src = tracks[this.trackIndex];
    this.audio.volume = this.isMuted ? 0 : this.volume;
    this.audio.load();
    if (this.isPlaying) this.audio.play().catch(() => {});
    this.notify();
  }

  prev() {
    const tracks = THEME_TRACKS[this.currentTheme];
    this.trackIndex = (this.trackIndex - 1 + tracks.length) % tracks.length;
    this.audio.src = tracks[this.trackIndex];
    this.audio.volume = this.isMuted ? 0 : this.volume;
    this.audio.load();
    if (this.isPlaying) this.audio.play().catch(() => {});
    this.notify();
  }

  setVolume(val) {
    this.volume = val;
    this.isMuted = val === 0;
    if (val > 0) this.prevVolume = val;
    if (!this.fadeInterval) this.audio.volume = val;
    this.save();
    this.notify();
  }

  toggleMute() {
    if (this.isMuted) {
      const restored = this.prevVolume > 0 ? this.prevVolume : 0.5;
      this.volume = restored;
      this.isMuted = false;
      if (!this.fadeInterval) this.audio.volume = restored;
    } else {
      this.prevVolume = this.volume;
      this.volume = 0;
      this.isMuted = true;
      if (!this.fadeInterval) this.audio.volume = 0;
    }
    this.save();
    this.notify();
  }

  switchTheme(newTheme) {
    if (newTheme === this.currentTheme) return;
    this.currentTheme = newTheme;
    this.trackIndex = 0;
    const tracks = THEME_TRACKS[newTheme] || THEME_TRACKS.cozykawaii;
    const wasPlaying = this.isPlaying || !this.audio.paused;
    const targetVol = this.isMuted ? 0 : this.volume;

    this.clearFade();

    if (!wasPlaying) {
      this.audio.pause();
      this.audio.src = tracks[0];
      this.audio.volume = targetVol;
      this.audio.load();
      this.notify();
      return;
    }

    const stepMs = FADE_MS / FADE_STEPS;
    const startVol = this.audio.volume;
    let outStep = 0;

    this.fadeInterval = setInterval(() => {
      outStep++;
      this.audio.volume = Math.max(0, startVol * (1 - outStep / FADE_STEPS));
      if (outStep >= FADE_STEPS) {
        clearInterval(this.fadeInterval);
        this.audio.pause();
        this.audio.src = tracks[0];
        this.audio.volume = 0;
        this.audio.load();
        this.audio.play().catch(() => {});

        let inStep = 0;
        this.fadeInterval = setInterval(() => {
          inStep++;
          this.audio.volume = Math.min(targetVol, targetVol * (inStep / FADE_STEPS));
          if (inStep >= FADE_STEPS) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
            this.audio.volume = targetVol;
          }
        }, stepMs);
      }
    }, stepMs);

    this.notify();
  }
}

const audioManager = new AudioManager();
export default audioManager;