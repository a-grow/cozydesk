// ambienceManager.js — a quiet looping background sound for worlds that have one
// (world.js config `ambience`). Follows the Sound Effects switch. Singleton.
//
// Browsers only allow sound after the user has clicked or typed once, so if play()
// is blocked we wait for the first click/key and try again.

import { soundManager } from './soundManager';

const VOLUME = 0.22;

class AmbienceManager {
  constructor() {
    this._audio = null;
    this._url = null;      // track currently loaded in _audio
    this._want = null;     // track the current world asks for (null = none)
    this._waiting = false;
    soundManager.onChange(() => this._sync());
  }

  // Called by the desk whenever the world changes. url = world's ambience, or null.
  setTrack(url) {
    this._want = url || null;
    this._sync();
  }

  _sync() {
    const url = soundManager.enabled ? this._want : null;
    if (!url) {
      if (this._audio) this._audio.pause();
      return;
    }
    if (!this._audio || this._url !== url) {
      if (this._audio) this._audio.pause();
      this._audio = new Audio(url);
      this._audio.loop = true;
      this._audio.volume = VOLUME;
      this._url = url;
    }
    const p = this._audio.play();
    if (p && p.catch) p.catch(() => this._waitForGesture());
  }

  _waitForGesture() {
    if (this._waiting) return;
    this._waiting = true;
    const go = () => {
      this._waiting = false;
      window.removeEventListener('pointerdown', go);
      window.removeEventListener('keydown', go);
      this._sync();
    };
    window.addEventListener('pointerdown', go);
    window.addEventListener('keydown', go);
  }
}

export const ambienceManager = new AmbienceManager();
