// ── Music tracks ──────────────────────────────────────────────────────────
// Each world's playlist lives in its own world.js (`music: [...]`), loaded via
// static imports there so tracks survive the production build. Filenames are
// the Pixabay commercial-use paper trail — never rename them.
// A world with no tracks borrows Cozy Kawaii's playlist (see switchTheme).
import { WORLDS } from '../themes/themeRegistry';

const THEME_TRACKS = Object.fromEntries(
  WORLDS.filter((w) => w.music && w.music.length).map((w) => [w.key, w.music])
);

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