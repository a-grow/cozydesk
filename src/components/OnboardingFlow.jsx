import React, { useState } from 'react';
import { useTheme } from '../themes/ThemeContext.jsx';
import { recordTermsAgreement } from '../utils/onboardingState.js';
import { getThemeConfig } from '../themes/themeRegistry';
import cozydeskLogo from '../assets/cozydesk-logo.png';

// The four worlds shown on the pick-your-world screen.
// Card image = each theme's existing background. To swap in styled hero shots
// later, change ONLY what worldImage() returns — nothing else needs to change.
const WORLDS = [
  { key: 'cafe',       label: 'Café Morning' },
  { key: 'cozykawaii', label: 'Cozy Kawaii' },
  { key: 'steampunk',  label: 'Steampunk' },
  { key: 'lofi',       label: 'Lo-Fi' },
];

// Pull a displayable background image URL out of a theme's config.
function worldImage(themeKey) {
  try {
    const cfg = getThemeConfig(themeKey);
    const bg = cfg && cfg.background ? cfg.background : '';
    const match = bg.match(/url\(["']?(.*?)["']?\)/);
    if (match && match[1]) return match[1];
  } catch (_) {}
  return '';
}

const TERMS_URL   = 'https://cozydesk.app/legal/terms.html';
const PRIVACY_URL = 'https://cozydesk.app/legal/privacy.html';

const primaryBtn = (enabled) => ({
  fontFamily: 'Nunito, sans-serif',
  fontSize: '18px',
  fontWeight: 700,
  color: '#fff',
  background: enabled ? '#c98bb9' : 'rgba(150,130,145,0.45)',
  border: 'none',
  borderRadius: '14px',
  padding: '14px 32px',
  cursor: enabled ? 'pointer' : 'not-allowed',
  boxShadow: enabled ? '0 6px 18px rgba(0,0,0,0.25)' : 'none',
  transition: 'background 0.2s, box-shadow 0.2s',
});

// Outer shell holds the blurred world backdrop + the frosted card on top.
const shell = {
  position: 'fixed',
  inset: 0,
  zIndex: 20000,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Nunito, sans-serif',
  color: '#3f3138',
  padding: '24px',
  boxSizing: 'border-box',
  background: '#2b2430',
};

// Frosted glass card — the world glows through it.
const card = {
  position: 'relative',
  zIndex: 2,
  background: 'rgba(255,255,255,0.86)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.6)',
  borderRadius: '26px',
  boxShadow: '0 24px 70px rgba(0,0,0,0.4)',
  padding: '44px',
  maxWidth: '760px',
  width: '100%',
  textAlign: 'center',
  boxSizing: 'border-box',
};

// All four world images are stacked; only the active one is visible.
// Changing which is active crossfades the whole backdrop.
function Backdrop({ activeWorld }) {
  return (
    <>
      {WORLDS.map((w) => {
        const img = worldImage(w.key);
        return (
          <div
            key={w.key}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: '-60px',
              backgroundImage: img ? `url(${img})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(28px) saturate(1.15)',
              transform: 'scale(1.12)',
              opacity: activeWorld === w.key ? 1 : 0,
              transition: 'opacity 0.8s ease',
              zIndex: 0,
            }}
          />
        );
      })}
      {/* Soft darkening + warm vignette so the card reads clearly */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 42%, rgba(20,12,20,0.18) 0%, rgba(20,12,20,0.62) 100%)',
          zIndex: 1,
        }}
      />
    </>
  );
}

export default function OnboardingFlow({ isExistingUser, onFinish }) {
  const { setThemeDirect, themeName } = useTheme();

  const [step, setStep] = useState(isExistingUser ? 'gate' : 'splash');
  const [chosenWorld, setChosenWorld] = useState(null);
  const [agreed, setAgreed] = useState(false);

  // Existing users see their own current world blurred behind the card.
  // First-timers start on kawaii, then the backdrop follows their selection.
  const backdropWorld =
    chosenWorld || (isExistingUser ? themeName : 'cozykawaii');

  const finish = () => {
    if (!isExistingUser && chosenWorld) {
      setThemeDirect(chosenWorld);
    }
    recordTermsAgreement();
    onFinish();
  };

  // ---------- SPLASH ----------
  if (step === 'splash') {
    return (
      <div style={shell}>
        <Backdrop activeWorld={backdropWorld} />
        <div style={card}>
          <img
            src={cozydeskLogo}
            alt="CozyDesk"
            style={{ width: '220px', maxWidth: '70%', margin: '0 auto 20px', display: 'block' }}
          />
          {/* COPY — edit anytime */}
          <p style={{ fontSize: '19px', lineHeight: 1.5, margin: '0 0 32px', color: '#6b5763' }}>
            A little corner of calm for your day. Pick a world, settle in, and make it yours.
          </p>
          {/* END COPY */}
          <button style={primaryBtn(true)} onClick={() => setStep('pick')}>
            Step inside
          </button>
        </div>
      </div>
    );
  }

  // ---------- PICK YOUR WORLD ----------
  if (step === 'pick') {
    return (
      <div style={shell}>
        <Backdrop activeWorld={backdropWorld} />
        <div style={{ ...card, maxWidth: '860px' }}>
          {/* COPY — edit anytime */}
          <h2 style={{ fontSize: '30px', margin: '0 0 8px', fontWeight: 800 }}>
            Pick your world
          </h2>
          <p style={{ fontSize: '17px', margin: '0 0 28px', color: '#6b5763' }}>
            This is just your starting desk — you can switch worlds anytime.
          </p>
          {/* END COPY */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '18px',
            marginBottom: '32px',
          }}>
            {WORLDS.map((w) => {
              const img = worldImage(w.key);
              const selected = chosenWorld === w.key;
              return (
                <button
                  key={w.key}
                  onClick={() => setChosenWorld(w.key)}
                  style={{
                    position: 'relative',
                    border: selected ? '4px solid #c98bb9' : '4px solid rgba(255,255,255,0.5)',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    padding: 0,
                    height: '150px',
                    background: '#eee',
                    boxShadow: selected
                      ? '0 8px 22px rgba(201,139,185,0.55)'
                      : '0 3px 10px rgba(0,0,0,0.18)',
                    transform: selected ? 'translateY(-2px)' : 'none',
                    transition: 'border 0.15s, box-shadow 0.15s, transform 0.15s',
                  }}
                >
                  {img ? (
                    <img
                      src={img}
                      alt={w.label}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : null}
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '10px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '17px',
                    fontFamily: 'Nunito, sans-serif',
                  }}>
                    {w.label}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            style={primaryBtn(!!chosenWorld)}
            disabled={!chosenWorld}
            onClick={() => setStep('gate')}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ---------- GATE (terms + local-save warning) ----------
  const worldLabel = (WORLDS.find((w) => w.key === chosenWorld) || {}).label || '';

  return (
    <div style={shell}>
      <Backdrop activeWorld={backdropWorld} />
      <div style={card}>
        {/* COPY — edit anytime */}
        {isExistingUser ? (
          <>
            <h2 style={{ fontSize: '28px', margin: '0 0 10px', fontWeight: 800 }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '17px', lineHeight: 1.5, margin: '0 0 24px', color: '#6b5763' }}>
              Your desks are exactly where you left them — this is just a quick,
              one-time agreement before you continue.
            </p>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '28px', margin: '0 0 10px', fontWeight: 800 }}>
              One last thing
            </h2>
            <p style={{ fontSize: '17px', lineHeight: 1.5, margin: '0 0 24px', color: '#6b5763' }}>
              Before you step into your world, a couple of things to know.
            </p>
          </>
        )}

        <div style={{
          textAlign: 'left',
          background: 'rgba(250,245,249,0.85)',
          borderRadius: '14px',
          padding: '18px 20px',
          margin: '0 0 22px',
          fontSize: '15px',
          lineHeight: 1.55,
          color: '#5a4a53',
        }}>
          <p style={{ margin: 0 }}>
            <strong>Your desks are saved on this device only.</strong> CozyDesk keeps
            everything in your browser — nothing is uploaded to a server. Clearing your
            browser's site data will erase your desks, so use the backup option in the
            sidebar to keep a copy safe.
          </p>
        </div>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontSize: '16px',
          margin: '0 0 14px',
          cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span>
            I have read and agree to the{' '}
            <a href={TERMS_URL} target="_blank" rel="noopener noreferrer"
               style={{ color: '#b06fa0', fontWeight: 700 }}>
              Terms of Service
            </a>{' '}and{' '}
            <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer"
               style={{ color: '#b06fa0', fontWeight: 700 }}>
              Privacy Policy
            </a>
          </span>
        </label>

        <p style={{ fontSize: '13px', color: '#8a7883', margin: '0 0 26px', lineHeight: 1.5 }}>
          The hundreds of pieces of artwork in CozyDesk were created with AI tools. Each one
          was reviewed by hand — kept when it was right, and edited and finished in Procreate
          when it needed work.
        </p>
        {/* END COPY */}

        <button
          style={primaryBtn(agreed)}
          disabled={!agreed}
          onClick={finish}
        >
          {isExistingUser
            ? 'Continue to my desk'
            : worldLabel
              ? `Enter ${worldLabel}`
              : 'Enter'}
        </button>
      </div>
    </div>
  );
}
