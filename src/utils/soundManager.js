const SOUNDS = [
  'sfx_place_note',
  'sfx_alert_box',
  'sfx_click_button',
  'sfx_drag_note',
  'sfx_timer_start',
  'sfx_timer_end',
  'sfx_save',
  'sfx_sticker_lift',
  'sfx_delete_whoosh',
  'sfx_ping',
  'sfx_uhoh',
  'sfx_timer_reset',
  'sfx_undo_redo',
  'sfx_clear_screen',
  'sfx_areyousure',
];

const STORAGE_KEY = 'cozydesk_sfx';

class SoundManager {
  constructor() {
    this._enabled = localStorage.getItem(STORAGE_KEY) !== 'false';
    this._buffers = {};
    this._ctx = null;
    this._load();
  }

  _getCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  }

  async _load() {
    for (const name of SOUNDS) {
      try {
        const url = new URL(`../assets/sounds/${name}.mp3`, import.meta.url).href;
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        const ctx = this._getCtx();
        this._buffers[name] = await ctx.decodeAudioData(buf);
      } catch { /* ignore missing files */ }
    }
  }

  play(name) {
    if (!this._enabled) return;
    const buf = this._buffers[name];
    if (!buf) return;
    try {
      const ctx = this._getCtx();
      const source = ctx.createBufferSource();
      source.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = 0.4;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch { /* ignore */ }
  }

  get enabled() { return this._enabled; }

  setEnabled(val) {
    this._enabled = val;
    localStorage.setItem(STORAGE_KEY, String(val));
  }
}

export const soundManager = new SoundManager();
