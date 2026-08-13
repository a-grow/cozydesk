import React, { useState, useEffect } from 'react';
import logo from '../assets/cozydesk-logo.png';
import WorldGalleryModal from './sidebar/WorldGalleryModal';

// Pure-touch devices only: a finger is the ONLY pointer (phones + tablets).
// A touchscreen laptop also has a fine pointer (trackpad), so it passes through
// to the real app. A small desktop browser window is 'fine' too — never gated.
const TOUCH_ONLY_QUERY = '(hover: none) and (pointer: coarse)';

function isTouchOnly() {
  try {
    return window.matchMedia(TOUCH_ONLY_QUERY).matches;
  } catch (_) {
    return false;
  }
}

export default function SmallScreenGate({ children }) {
  const [gated, setGated] = useState(isTouchOnly);
  const [galleryOpen, setGalleryOpen] = useState(false);

  // Re-evaluate if the pointer capability changes (rare, but e.g. a tablet
  // gaining a paired trackpad, or dev-tools device emulation toggling).
  useEffect(() => {
    let mq;
    try {
      mq = window.matchMedia(TOUCH_ONLY_QUERY);
    } catch (_) {
      return;
    }
    const update = () => setGated(mq.matches);
    // Safari < 14 uses addListener/removeListener.
    if (mq.addEventListener) mq.addEventListener('change', update);
    else if (mq.addListener) mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update);
      else if (mq.removeListener) mq.removeListener(update);
    };
  }, []);

  if (!gated) return children;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        background: 'linear-gradient(160deg, #2b2340 0%, #1c1830 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 26px',
        boxSizing: 'border-box',
        fontFamily: "'Nunito', sans-serif",
        textAlign: 'center',
        overflowY: 'auto',
      }}
    >
      <img
        src={logo}
        alt="CozyDesk"
        style={{ width: '200px', maxWidth: '68vw', marginBottom: '26px' }}
      />

      <div
        style={{
          fontSize: '25px',
          fontWeight: 800,
          color: '#fdf6ec',
          lineHeight: 1.3,
          marginBottom: '14px',
          maxWidth: '420px',
        }}
      >
        CozyDesk is built for a bigger screen
      </div>

      <div
        style={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#c9c0dc',
          maxWidth: '380px',
          marginBottom: '30px',
        }}
      >
        It's a drag-and-drop desk you set up with a mouse — so it lives on your
        laptop or desktop. Open{' '}
        <span style={{ color: '#fdf6ec', fontWeight: 700 }}>app.cozydesk.app</span>{' '}
        on your computer to build your cozy workspace.
      </div>

      <button
        type="button"
        onClick={() => setGalleryOpen(true)}
        style={{
          padding: '15px 34px',
          borderRadius: '30px',
          border: '1px solid rgba(255,240,200,0.6)',
          cursor: 'pointer',
          fontWeight: 800,
          fontSize: '17px',
          fontFamily: "'Nunito', sans-serif",
          background: 'linear-gradient(180deg, #ffd98a 0%, #f6b73c 55%, #e8992e 100%)',
          color: '#3a2410',
          boxShadow:
            '0 6px 20px rgba(180,120,30,0.45), inset 0 1px 1px rgba(255,255,255,0.5)',
        }}
      >
        Browse the worlds
      </button>

      <div
        style={{
          marginTop: '20px',
          fontSize: '13.5px',
          lineHeight: 1.6,
          color: '#a99fc4',
          maxWidth: '360px',
        }}
      >
        You can buy a world now and unlock it later on your computer with the key
        we email you.
      </div>

      {galleryOpen && (
        <WorldGalleryModal
          currentTheme={null}
          onPick={() => setGalleryOpen(false)}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  );
}
