import React, { useState, useEffect, useRef } from 'react';

export default function PomodoroTimer() {
  const [workMins, setWorkMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsComplete(true);
          completedRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // Sound cue when timer finishes
  useEffect(() => {
    if (!completedRef.current || !soundEnabled) return;
    completedRef.current = false;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0.15;
      osc.frequency.value = 880;
      osc.type = 'sine';
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch { /* ignore */ }
  }, [isComplete, soundEnabled]);

  const handleStartStop = () => {
    if (isComplete) {
      const next = mode === 'work' ? 'break' : 'work';
      setMode(next);
      setTimeLeft((next === 'work' ? workMins : breakMins) * 60);
      setIsComplete(false);
      setIsRunning(true);
    } else {
      setIsRunning(r => !r);
    }
  };

  const handleReset = () => {
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
          <label className="pomo-setting">
            <input type="checkbox" checked={soundEnabled} onChange={e => setSoundEnabled(e.target.checked)} />
            🔊 Sound
          </label>
        </div>
      )}
    </div>
  );
}
