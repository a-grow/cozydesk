import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../themes/ThemeContext';

const THEME_TRACKS = {
  cozykawaii: [
    '/src/assets/music/kawaii-abdipr-cat-dreams-kawaii-chill-future-house-259197.mp3',
    '/src/assets/music/kawaii-bluelike_u-5-strawberry-mousse-cute-bgm-274668.mp3',
    '/src/assets/music/kawaii-ruminamusic-magical-burger-town-cute-fantasy-pop-background-music-386974.mp3',
  ],
  lofi: [
    '/src/assets/music/lofi_library-coffee-458900.mp3',
    '/src/assets/music/lofi-lemonmusiclab-499264.mp3',
    '/src/assets/music/lofi-lofi-production-522875.mp3',
  ],
  steampunk: [
    '/src/assets/music/steampunk-dstechnician-clock-tower-114282.mp3',
    '/src/assets/music/steampunk-luis_humanoide-clockwork-adventure-288524.mp3',
    '/src/assets/music/steampunk-pardeeppatel-under-the-london-fog-v1-inspired-by-sherlock-holmes-270425.mp3',
  ],
};

const LS_KEY = 'cozydesk_music';

const btnStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--sb-text)',
  fontSize: '16px',
  padding: '2px 4px',
  fontFamily: "'Nunito', sans-serif",
  lineHeight: 1,
};

export default function MusicPlayer() {
  const { themeName } = useTheme();

  const audioRef = useRef(null);
  const fadeRef = useRef(null);
  const themeNameRef = useRef(themeName);
  const isPlayingRef = useRef(false);
  const volumeRef = useRef(0.5);
  const isMutedRef = useRef(false);
  const trackIndexRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [prevVolume, setPrevVolume] = useState(0.5);

  // Keep refs in sync with state for use in callbacks
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { trackIndexRef.current = trackIndex; }, [trackIndex]);

  // Mount: create audio element and restore saved state
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    let savedVolume = 0.5;
    let savedMuted = false;

    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        savedVolume = typeof data.volume === 'number' ? data.volume : 0.5;
        savedMuted = !!data.isMuted;
      }
    } catch (_) {}

    // Always start paused regardless of saved isPlaying
    setIsPlaying(false);
    isPlayingRef.current = false;
    setVolume(savedVolume);
    setIsMuted(savedMuted);
    setPrevVolume(savedVolume);
    volumeRef.current = savedVolume;
    isMutedRef.current = savedMuted;

    const tracks = THEME_TRACKS[themeNameRef.current] || THEME_TRACKS.cozykawaii;
    audio.src = tracks[0];
    audio.volume = savedMuted ? 0 : savedVolume;
    audio.load();

    audio.onended = () => {
      const currentTracks = THEME_TRACKS[themeNameRef.current] || THEME_TRACKS.cozykawaii;
      setTrackIndex(prev => {
        const next = (prev + 1) % currentTracks.length;
        trackIndexRef.current = next;
        audio.src = currentTracks[next];
        audio.volume = isMutedRef.current ? 0 : volumeRef.current;
        audio.load();
        audio.play().catch(() => {});
        return next;
      });
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Theme change: cross-fade old track out, new theme's first track in
  useEffect(() => {
    themeNameRef.current = themeName;
    const audio = audioRef.current;
    if (!audio) return;

    if (fadeRef.current) {
      clearInterval(fadeRef.current);
      fadeRef.current = null;
    }

    const tracks = THEME_TRACKS[themeName] || THEME_TRACKS.cozykawaii;
    setTrackIndex(0);
    trackIndexRef.current = 0;

    const wasPlaying = isPlayingRef.current;
    const targetVolume = isMutedRef.current ? 0 : volumeRef.current;

    if (!wasPlaying) {
      audio.pause();
      audio.src = tracks[0];
      audio.volume = targetVolume;
      audio.load();
      return;
    }

    const steps = 30;
    const stepMs = 1500 / steps;
    const startVol = audio.volume;
    let outStep = 0;

    fadeRef.current = setInterval(() => {
      outStep++;
      audio.volume = Math.max(0, startVol * (1 - outStep / steps));
      if (outStep >= steps) {
        clearInterval(fadeRef.current);
        fadeRef.current = null;

        audio.pause();
        audio.src = tracks[0];
        audio.volume = 0;
        audio.load();
        audio.play().catch(() => {});

        let inStep = 0;
        fadeRef.current = setInterval(() => {
          inStep++;
          audio.volume = Math.min(targetVolume, targetVolume * (inStep / steps));
          if (inStep >= steps) {
            clearInterval(fadeRef.current);
            fadeRef.current = null;
            audio.volume = targetVolume;
          }
        }, stepMs);
      }
    }, stepMs);

    return () => {
      if (fadeRef.current) {
        clearInterval(fadeRef.current);
        fadeRef.current = null;
      }
    };
  }, [themeName]);

  // Sync audio volume when volume/muted state changes (skip during a fade)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || fadeRef.current) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ isPlaying, volume, isMuted }));
    } catch (_) {}
  }, [isPlaying, volume, isMuted]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      isPlayingRef.current = false;
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      isPlayingRef.current = true;
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const tracks = THEME_TRACKS[themeName] || THEME_TRACKS.cozykawaii;
    const newIndex = (trackIndex - 1 + tracks.length) % tracks.length;
    setTrackIndex(newIndex);
    trackIndexRef.current = newIndex;
    audio.src = tracks[newIndex];
    audio.volume = isMuted ? 0 : volume;
    audio.load();
    if (isPlaying) audio.play().catch(() => {});
  };

  const handleNext = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const tracks = THEME_TRACKS[themeName] || THEME_TRACKS.cozykawaii;
    const newIndex = (trackIndex + 1) % tracks.length;
    setTrackIndex(newIndex);
    trackIndexRef.current = newIndex;
    audio.src = tracks[newIndex];
    audio.volume = isMuted ? 0 : volume;
    audio.load();
    if (isPlaying) audio.play().catch(() => {});
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      const restored = prevVolume > 0 ? prevVolume : 0.5;
      setVolume(restored);
      volumeRef.current = restored;
      setIsMuted(false);
      isMutedRef.current = false;
    } else {
      setPrevVolume(volume);
      setVolume(0);
      volumeRef.current = 0;
      setIsMuted(true);
      isMutedRef.current = true;
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    volumeRef.current = val;
    if (val === 0) {
      setIsMuted(true);
      isMutedRef.current = true;
    } else {
      setIsMuted(false);
      isMutedRef.current = false;
      setPrevVolume(val);
    }
  };

  return (
    <div style={{
      margin: '8px 12px 4px',
      padding: '8px 10px',
      borderRadius: '12px',
      border: '1px solid var(--sb-border)',
      background: 'var(--sb-card)',
      fontFamily: "'Nunito', sans-serif",
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '6px',
      }}>
        <button onClick={handlePrev} style={btnStyle}>⏮</button>
        <button onClick={handlePlayPause} style={btnStyle}>{isPlaying ? '⏸' : '▶'}</button>
        <button onClick={handleNext} style={btnStyle}>⏭</button>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <button onClick={handleMuteToggle} style={{ ...btnStyle, fontSize: '14px' }}>
          {(isMuted || volume === 0) ? '🔇' : '🔊'}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          style={{
            flex: 1,
            accentColor: 'var(--sb-text)',
            cursor: 'pointer',
          }}
        />
      </div>
    </div>
  );
}
