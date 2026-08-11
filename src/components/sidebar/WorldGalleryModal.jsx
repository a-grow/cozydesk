import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  THEME_CONFIGS,
  availableThemeNames,
  THEME_BACKGROUNDS,
  THEME_GUMROAD_URLS,
} from '../../themes/themeRegistry';
import { isPaidWorld, isWorldUnlocked } from '../../utils/licenseManager';
import { soundManager } from '../../utils/soundManager';

const FLAVOR = {
  cafe: "A fresh cup and a cozy table that's always waiting. It's morning here whenever you need it to be — quiet, unhurried, and entirely yours.",
  steampunk: "Brass, lamplight, and the slow turn of gears. A workshop built for long, focused hours — where the work pulls you in and the world outside goes quiet.",
};

const PRICE = { cafe: '$2.99', steampunk: '$2.99' };

const overlay = {
  position: 'fixed', inset: 0, zIndex: 10000,
  background: 'rgba(20,16,24,0.72)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '24px',
};

export default function WorldGalleryModal({ currentTheme, onPick, onClose }) {
  // When set to a world key, we're showing that world's unlock preview screen.
  const [previewWorld, setPreviewWorld] = useState(null);

  function handleCardClick(key) {
    const paid = isPaidWorld(key);
    const unlocked = isWorldUnlocked(key);
    if (paid && !unlocked) {
      setPreviewWorld(key);   // open the unlock preview
    } else {
      soundManager.play('sfx_place_note');
      onPick(key);            // free or already-unlocked → switch
    }
  }

  // ---------- Unlock preview screen ----------
  if (previewWorld) {
    const cfg = THEME_CONFIGS[previewWorld];
    const bg = THEME_BACKGROUNDS[previewWorld];
    const url = THEME_GUMROAD_URLS[previewWorld];
    return createPortal(
      <div style={overlay} onClick={onClose}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            width: 'min(560px, 92vw)',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />

          <div style={{ position: 'relative', padding: '40px 32px', color: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, marginBottom: '14px' }}>
              {cfg?.name || previewWorld}
            </div>
            <div style={{ fontSize: '16px', lineHeight: 1.6, maxWidth: '420px', margin: '0 auto 28px', opacity: 0.95 }}>
              {FLAVOR[previewWorld]}
            </div>
            <button
              type="button"
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
              style={{
                padding: '13px 30px', borderRadius: '30px', border: 'none',
                cursor: 'pointer', fontWeight: 800, fontSize: '16px',
                background: '#fff', color: '#2a2030',
                boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
              }}
            >
              Unlock — {PRICE[previewWorld] || '$2.99'}
            </button>
            <div
              onClick={() => console.log('[Step 3] enter-key flow goes here for', previewWorld)}
              style={{
                marginTop: '18px', fontSize: '13px', textDecoration: 'underline',
                cursor: 'pointer', opacity: 0.9,
              }}
            >
              Already bought? Enter your key
            </div>
          </div>

          <div
            onClick={() => setPreviewWorld(null)}
            style={{
              position: 'absolute', top: '14px', left: '16px', zIndex: 2,
              color: '#fff', fontSize: '22px', cursor: 'pointer', lineHeight: 1,
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            }}
            title="Back"
          >
            ‹
          </div>
          <div
            onClick={onClose}
            style={{
              position: 'absolute', top: '14px', right: '16px', zIndex: 2,
              color: '#fff', fontSize: '22px', cursor: 'pointer', lineHeight: 1,
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            }}
            title="Close"
          >
            ×
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // ---------- Gallery grid ----------
  return createPortal(
    <div style={overlay} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(720px, 94vw)',
          maxHeight: '86vh', overflowY: 'auto',
          background: '#fff8f0',
          borderRadius: '18px',
          padding: '28px 26px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <div
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '18px',
            fontSize: '24px', cursor: 'pointer', color: '#7a6a58', lineHeight: 1,
          }}
          title="Close"
        >
          ×
        </div>

        <div style={{ fontSize: '22px', fontWeight: 800, color: '#4b3b2a', marginBottom: '4px' }}>
          Choose your world
        </div>
        <div style={{ fontSize: '14px', color: '#a07850', marginBottom: '22px' }}>
          Each world is its own cozy place to work.
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '18px',
        }}>
          {availableThemeNames.map((key) => {
            const cfg = THEME_CONFIGS[key];
            const bg = THEME_BACKGROUNDS[key];
            const paid = isPaidWorld(key);
            const unlocked = isWorldUnlocked(key);
            const locked = paid && !unlocked;
            const isCurrent = key === currentTheme;

            return (
              <div
                key={key}
                onClick={() => handleCardClick(key)}
                style={{
                  position: 'relative',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isCurrent ? '3px solid #d4a373' : '3px solid transparent',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                }}
              >
                <div style={{
                  width: '100%', aspectRatio: '16 / 10',
                  backgroundImage: bg ? `url(${bg})` : 'none',
                  backgroundColor: '#e8ddd0',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  filter: locked ? 'brightness(0.7)' : 'none',
                }} />

                {locked && (
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'rgba(0,0,0,0.6)', color: '#fff',
                    borderRadius: '20px', padding: '4px 10px',
                    fontSize: '12px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '5px',
                  }}>
                    <span aria-hidden="true">🔒</span>
                    {PRICE[key] || ''}
                  </div>
                )}

                <div style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0,
                  padding: '10px 12px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0))',
                  color: '#fff', fontWeight: 800, fontSize: '15px',
                }}>
                  {cfg?.name || key}
                  {isCurrent && (
                    <span style={{ fontWeight: 600, fontSize: '12px', opacity: 0.85 }}>  · current</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
