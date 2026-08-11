import React, { useState, useEffect, useReducer } from 'react';
import { soundManager } from '../../utils/soundManager';
import { timerStore } from '../../utils/timerStore';
import sleepPose from '../../assets/mascot/mug-sleep.png';
import wavePose from '../../assets/mascot/mug-wave.png';

export default function PomodoroTimer() {
  // Subscribe to the shared timer store; force a re-render whenever it changes.
  const [, forceRender] = useReducer(x => x + 1, 0);
  useEffect(() => timerStore.subscribe(forceRender), []);

  const { workMins, breakMins, mode, timeLeft, isRunning, isComplete } = timerStore.getState();

  const [mugzyOn, setMugzyOn] = useState(() => localStorage.getItem('cozydesk_mugzy') !== 'off');

  // One-time "press Start" nudge: shows only for users who've never pressed Start.
  const [showStartNudge, setShowStartNudge] = useState(false);
  useEffect(() => {
    if (localStorage.getItem('cozydesk_start_discovered')) return;
    if (timerStore.getState().isRunning) return;
    const t = setTimeout(() => {
      // Re-check: don't show if they started the timer during the delay.
      if (!localStorage.getItem('cozydesk_start_discovered') && !timerStore.getState().isRunning) {
        setShowStartNudge(true);
      }
    }, 3500);
    return () => clearTimeout(t);
  }, []);

  const dismissStartNudge = () => {
    if (!localStorage.getItem('cozydesk_start_discovered')) {
      localStorage.setItem('cozydesk_start_discovered', 'true');
    }
    setShowStartNudge(false);
  };

  useEffect(() => {
    const sync = () => setMugzyOn(localStorage.getItem('cozydesk_mugzy') !== 'off');
    window.addEventListener('cozydesk-mugzy-toggle', sync);
    return () => window.removeEventListener('cozydesk-mugzy-toggle', sync);
  }, []);

  const toggleMugzy = () => {
    soundManager.play('sfx_mugzy_toggle');
    const next = mugzyOn ? 'off' : 'on';
    localStorage.setItem('cozydesk_mugzy', next);
    setMugzyOn(next !== 'off');
    window.dispatchEvent(new Event('cozydesk-mugzy-toggle'));
  };

  // Cosmetic label cross-fade when Start<->Pause toggles. Purely visual;
  // timerStore stays the source of truth for actual timer state.
  const [labelFade, setLabelFade] = useState(false);
  const prevRunning = React.useRef(isRunning);
  useEffect(() => {
    if (prevRunning.current !== isRunning) {
      prevRunning.current = isRunning;
      setLabelFade(true);
      const t = setTimeout(() => setLabelFade(false), 160);
      return () => clearTimeout(t);
    }
  }, [isRunning]);

  const handleStartStop = () => {
    dismissStartNudge();
    timerStore.startStop();
  };
  const handleReset = () => timerStore.reset();

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className={`pomo-widget ${isComplete ? 'pomo-complete' : ''} ${isRunning && mode === 'work' ? 'pomo-widget-focus' : ''}`}>
      <div className={`pomo-circle ${mode === 'break' ? 'pomo-break-mode' : ''} ${isComplete ? 'pomo-wiggle pomo-glow' : ''} ${isRunning ? 'pomo-pulse' : ''} ${isRunning && mode === 'work' ? 'pomo-focus-glow' : ''}`}>
        <span className="pomo-emoji">🍅</span>
        <span className="pomo-timer">{mm}:{ss}</span>
        <span className="pomo-label">{mode === 'work' ? 'Focus' : 'Break'}</span>
      </div>
      {showStartNudge && (
        <div className="pomo-start-nudge">Your world is waiting… press Start</div>
      )}
      <button
        className={`pomo-main-btn ${isRunning ? 'pomo-running' : ''} ${showStartNudge ? 'pomo-start-glow' : ''}`}
        onClick={handleStartStop}
      >
        <span className={`pomo-main-label ${labelFade ? 'pomo-label-fading' : ''}`}>
          {isComplete ? '⏭ Next' : isRunning ? '⏸ Pause Focus' : '▶ Start Focus'}
        </span>
      </button>

      <button className="pomo-reset-btn" onClick={handleReset}>
        <span className="pomo-reset-icon">↻</span> Reset
      </button>

      <div className="pomo-settings pomo-settings-always">
        <label className="pomo-setting">
          Work Time
          <input
            type="number" className="pomo-num" min={1} max={99}
            value={workMins}
            onChange={e => timerStore.setWork(+e.target.value)}
          />
          min
        </label>
        <label className="pomo-setting">
          Break Time
          <input
            type="number" className="pomo-num" min={1} max={99}
            value={breakMins}
            onChange={e => timerStore.setBreak(+e.target.value)}
          />
          min
        </label>
      </div>

      <button
        className="pomo-mugzy-btn"
        onClick={toggleMugzy}
        title={mugzyOn ? 'Hide Mugzy' : 'Show Mugzy'}
      >
        <img
          src={mugzyOn ? wavePose : sleepPose}
          alt=""
          className="pomo-mugzy-btn-img"
        />
      </button>
    </div>
  );
}
