import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../../utils/soundManager';
import audioManager from '../../utils/audioManager';
import { setFocusActive } from '../../utils/focusBus';
import sleepPose from '../../assets/mascot/mug-sleep.png';
import wavePose from '../../assets/mascot/mug-wave.png';

export default function PomodoroTimer() {
  const [workMins, setWorkMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const completedRef = useRef(false);

  const [mugzyOn, setMugzyOn] = useState(() => localStorage.getItem('cozydesk_mugzy') !== 'off');

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

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
  setIsRunning(false);
  setIsComplete(true);
  completedRef.current = true;
  soundManager.play('sfx_timer_end');
  return 0;
}
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  useEffect(() => {
    setFocusActive(isRunning && mode === 'work');
    return () => setFocusActive(false);
  }, [isRunning, mode]);

  const handleStartStop = () => {
    if (isComplete) {
      const next = mode === 'work' ? 'break' : 'work';
      setMode(next);
      setTimeLeft((next === 'work' ? workMins : breakMins) * 60);
      setIsComplete(false);
      setIsRunning(true);
    } else {
      setIsRunning(r => {
        const starting = !r;
        if (starting) {
          soundManager.play('sfx_timer_start');
          // Music reacts: if off, start it; if already playing, skip to next track.
          const musicState = audioManager.getState();
          if (musicState.isPlaying) {
            audioManager.next();
          } else {
            audioManager.play();
          }
          // Starting a work session summons Mugzy if he's currently off,
          // so the user sees his focus glow. He stays on afterward.
          if (mode === 'work' && localStorage.getItem('cozydesk_mugzy') === 'off') {
            localStorage.setItem('cozydesk_mugzy', 'on');
            setMugzyOn(true);
            window.dispatchEvent(new Event('cozydesk-mugzy-toggle'));
          }
        } else {
          // Pausing the timer quiets the music.
          audioManager.pause();
        }
        return !r;
      });
    }
  };

  const handleReset = () => {
    soundManager.play('sfx_timer_reset');
    audioManager.pause();
    setIsRunning(false);
    setIsComplete(false);
    setTimeLeft((mode === 'work' ? workMins : breakMins) * 60);
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className={`pomo-widget ${isComplete ? 'pomo-complete' : ''}`}>
      <div className={`pomo-circle ${mode === 'break' ? 'pomo-break-mode' : ''} ${isComplete ? 'pomo-wiggle pomo-glow' : ''} ${isRunning ? 'pomo-pulse' : ''}`}>
        <span className="pomo-emoji">🍅</span>
        <span className="pomo-timer">{mm}:{ss}</span>
        <span className="pomo-label">{mode === 'work' ? 'Focus' : 'Break'}</span>
      </div>
      <div className="pomo-btns">
        <button className="pomo-btn pomo-main-btn" onClick={handleStartStop}>
          {isComplete ? '⏭ Next' : isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
        <button className="pomo-btn pomo-reset-btn" onClick={handleReset}>↺</button>
        <button className="pomo-btn pomo-gear-btn" onClick={() => setShowSettings(s => !s)}>⚙</button>
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
      {showSettings && (
        <div className="pomo-settings">
          <label className="pomo-setting">
            Work
            <input
              type="number" className="pomo-num" min={1} max={99}
              value={workMins}
              onChange={e => {
                const v = Math.max(1, Math.min(99, +e.target.value || 1));
                setWorkMins(v);
                if (!isRunning && mode === 'work') setTimeLeft(v * 60);
              }}
            />
            min
          </label>
          <label className="pomo-setting">
            Break
            <input
              type="number" className="pomo-num" min={1} max={99}
              value={breakMins}
              onChange={e => {
                const v = Math.max(1, Math.min(99, +e.target.value || 1));
                setBreakMins(v);
                if (!isRunning && mode === 'break') setTimeLeft(v * 60);
              }}
            />
            min
          </label>
        </div>
      )}
    </div>
  );
}
