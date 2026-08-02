import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../../utils/soundManager';
import audioManager from '../../utils/audioManager';
import { setFocusActive } from '../../utils/focusBus';

export default function PomodoroTimer() {
  const [workMins, setWorkMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const completedRef = useRef(false);

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
        }
        return !r;
      });
    }
  };

  const handleReset = () => {
    soundManager.play('sfx_timer_reset');
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
