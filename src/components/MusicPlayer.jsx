import React, { useState, useEffect } from 'react';
import { useTheme } from '../themes/ThemeContext';
import audioManager from '../utils/audioManager';

const getThemeStyles = (themeName) => {
  if (themeName === 'cozykawaii') {
    return {
      wrapper: {
        background: 'rgba(245, 168, 184, 0.25)',
        border: '1px solid rgba(245, 168, 184, 0.6)',
      },
      btn: {
        background: 'rgba(245, 168, 184, 0.4)',
        border: 'none',
        cursor: 'pointer',
        color: '#6b4b3a',
        fontSize: '16px',
        padding: '4px 8px',
        fontFamily: "'Nunito', sans-serif",
        lineHeight: 1,
        borderRadius: '6px',
      },
      sliderAccent: '#f5a8b8',
      muteBtn: {
        background: 'rgba(245, 168, 184, 0.4)',
        border: 'none',
        cursor: 'pointer',
        color: '#6b4b3a',
        fontSize: '14px',
        padding: '4px 8px',
        fontFamily: "'Nunito', sans-serif",
        lineHeight: 1,
        borderRadius: '6px',
      },
    };
  }
  return {
    wrapper: {
      background: 'rgba(0,0,0,0.18)',
      border: '1px solid var(--sb-border)',
    },
    btn: {
      background: 'rgba(0,0,0,0.25)',
      border: 'none',
      cursor: 'pointer',
      color: '#ffffff',
      fontSize: '16px',
      padding: '4px 8px',
      fontFamily: "'Nunito', sans-serif",
      lineHeight: 1,
      borderRadius: '6px',
    },
    sliderAccent: '#ffffff',
    muteBtn: {
      background: 'rgba(0,0,0,0.25)',
      border: 'none',
      cursor: 'pointer',
      color: '#ffffff',
      fontSize: '14px',
      padding: '4px 8px',
      fontFamily: "'Nunito', sans-serif",
      lineHeight: 1,
      borderRadius: '6px',
    },
  };
};

export default function MusicPlayer() {
  const { themeName } = useTheme();
  const [state, setState] = useState(() => audioManager.getState());
  const themeStyles = getThemeStyles(themeName);

  // Subscribe to audioManager changes
  useEffect(() => {
    const unsub = audioManager.subscribe(() => setState({ ...audioManager.getState() }));
    return unsub;
  }, []);

  // Switch theme when themeName changes
  useEffect(() => {
    audioManager.switchTheme(themeName);
  }, [themeName]);

  return (
    <div style={{
      margin: '8px 12px 4px',
      padding: '8px 10px',
      borderRadius: '12px',
      fontFamily: "'Nunito', sans-serif",
      ...themeStyles.wrapper,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '6px',
      }}>
        <button onClick={() => audioManager.prev()} style={themeStyles.btn}>⏮</button>
        <button onClick={() => state.isPlaying ? audioManager.pause() : audioManager.play()} style={themeStyles.btn}>
          {state.isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={() => audioManager.next()} style={themeStyles.btn}>⏭</button>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <button onClick={() => audioManager.toggleMute()} style={themeStyles.muteBtn}>
          {(state.isMuted || state.volume === 0) ? '🔇' : '🔊'}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={state.volume}
          onChange={e => audioManager.setVolume(parseFloat(e.target.value))}
          style={{
            flex: 1,
            accentColor: themeStyles.sliderAccent,
            cursor: 'pointer',
          }}
        />
      </div>
    </div>
  );
}
