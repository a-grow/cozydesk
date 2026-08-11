import { soundManager } from './soundManager';
import audioManager from './audioManager';
import { setFocusActive } from './focusBus';

// Singleton timer store. Owns the Pomodoro state AND the ticking interval so the
// timer survives PomodoroTimer unmounting (which happens on every switch into/out
// of the Lo-Fi world, because Sidebar.jsx swaps element type to <LofiSidebar/>).
// Session-scoped on purpose: resets on full page reload, survives world-switches.

const state = {
  workMins: 25,
  breakMins: 5,
  mode: 'work',
  timeLeft: 25 * 60,
  isRunning: false,
  isComplete: false,
};

const listeners = new Set();
let intervalId = null;

function emit() {
  listeners.forEach(fn => fn());
}

// Focus mode is driven from here so it stays correct regardless of what is mounted.
function syncFocus() {
  setFocusActive(state.isRunning && state.mode === 'work');
}

function startInterval() {
  if (intervalId) return;
  intervalId = setInterval(() => {
    if (state.timeLeft <= 1) {
      state.timeLeft = 0;
      state.isRunning = false;
      state.isComplete = true;
      stopInterval();
      soundManager.play('sfx_timer_end');
      syncFocus();
      emit();
      return;
    }
    state.timeLeft -= 1;
    emit();
  }, 1000);
}

function stopInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export const timerStore = {
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  getState() {
    return state;
  },

  startStop() {
    if (state.isComplete) {
      // Move to the next phase and immediately run it.
      const next = state.mode === 'work' ? 'break' : 'work';
      state.mode = next;
      state.timeLeft = (next === 'work' ? state.workMins : state.breakMins) * 60;
      state.isComplete = false;
      state.isRunning = true;
      soundManager.play('sfx_timer_start');
      startInterval();
      syncFocus();
      emit();
      return;
    }

    const starting = !state.isRunning;
    state.isRunning = starting;

    if (starting) {
      soundManager.play('sfx_timer_start');
      // Music reacts: if off, start it; if already playing, skip to next track.
      const musicState = audioManager.getState();
      if (musicState.isPlaying) {
        audioManager.next();
      } else {
        audioManager.play();
      }
      // Starting a work session summons Mugzy if he's currently off, so the user
      // sees his focus glow. He stays on afterward.
      if (state.mode === 'work' && localStorage.getItem('cozydesk_mugzy') === 'off') {
        localStorage.setItem('cozydesk_mugzy', 'on');
        window.dispatchEvent(new Event('cozydesk-mugzy-toggle'));
      }
      startInterval();
    } else {
      // Pausing the timer quiets the music.
      soundManager.play('sfx_click_button');
      audioManager.pause();
      stopInterval();
    }

    syncFocus();
    emit();
  },

  reset() {
    soundManager.play('sfx_timer_reset');
    audioManager.pause();
    stopInterval();
    state.isRunning = false;
    state.isComplete = false;
    state.timeLeft = (state.mode === 'work' ? state.workMins : state.breakMins) * 60;
    syncFocus();
    emit();
  },

  setWork(v) {
    const val = Math.max(1, Math.min(99, v || 1));
    state.workMins = val;
    if (!state.isRunning && state.mode === 'work') {
      state.timeLeft = val * 60;
    }
    emit();
  },

  setBreak(v) {
    const val = Math.max(1, Math.min(99, v || 1));
    state.breakMins = val;
    if (!state.isRunning && state.mode === 'break') {
      state.timeLeft = val * 60;
    }
    emit();
  },
};
