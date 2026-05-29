import React, { useState, useEffect } from 'react';

// ── Live clock overlay for the kawaii clock icon ──────────────────────────────
function LiveClockIcon({ src, onDragStart }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');
  let h = time.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const m = pad(time.getMinutes());

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '140px' }}>
      <img
        src={src}
        alt="Clock"
        className="sb-todo-icon-img"
        draggable
        onDragStart={onDragStart}
        style={{ display: 'block', width: '100%' }}
      />
      <div className="sb-clock-overlay" style={{ pointerEvents: 'none' }}>
        <div className="sb-clock-overlay-time">{h}:{m}</div>
        <div className="sb-clock-overlay-ampm">{ampm}</div>
      </div>
    </div>
  );
}
// ── Live clock overlay for the steampunk clock icon ──────────────────────────
// Shows 4 glowing orange digits over the 4 glass tubes in steampunkclock.png.
// Image is 750×982 (portrait); tube centers are at roughly cx 26/39/54/67 %, cy 28%.
function LiveSteampunkClockIcon({ onDragStart }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  let h = time.getHours();
  h = h % 12 || 12;
  const hStr = String(h).padStart(2, '0');
  const mStr = String(time.getMinutes()).padStart(2, '0');
  const digits = [hStr[0], hStr[1], mStr[0], mStr[1]];
  const tubeCX = ['25%', '40%', '58%', '75%'];

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '140px' }}>
      <img
        src={steampunkClockIcon}
        alt="Steampunk Clock"
        className="sb-todo-icon-img"
        draggable
        onDragStart={onDragStart}
        style={{ display: 'block', width: '100%' }}
      />
      {digits.map((digit, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: tubeCX[i],
            top: '37%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <span className="sb-sp-clock-digit">{digit}</span>
        </div>
      ))}
    </div>
  );
}

import './Sidebar.css';
import { useTheme } from '../themes/ThemeContext';

// ── Proper mechanical gear path generator ────────────────────────────────────
// Builds an SVG path for a cog with realistic rectangular teeth.
// Each tooth: root arc → radial rise → tip arc → radial fall. Hub cut via evenodd.
function buildGearPath(gcx, gcy, rRoot, rTip, rHub, nTeeth, rootHalf, tipHalf) {
  const toRad = a => (a * Math.PI) / 180;
  const pt = (r, deg) => [
    (gcx + r * Math.cos(toRad(deg))).toFixed(2),
    (gcy + r * Math.sin(toRad(deg))).toFixed(2),
  ];
  const pitch = 360 / nTeeth;
  let d = '';

  for (let i = 0; i < nTeeth; i++) {
    const mid = i * pitch;
    const [x0, y0] = pt(rRoot, mid - rootHalf); // root lead-in
    const [x1, y1] = pt(rTip,  mid - tipHalf);  // tooth flank start
    const [x2, y2] = pt(rTip,  mid + tipHalf);  // tooth flank end
    const [x3, y3] = pt(rRoot, mid + rootHalf); // root trail-out

    if (i === 0) d += `M ${x0},${y0} `;
    else         d += `A ${rRoot},${rRoot} 0 0,1 ${x0},${y0} `;

    d += `L ${x1},${y1} `;
    d += `A ${rTip},${rTip} 0 0,1 ${x2},${y2} `;
    d += `L ${x3},${y3} `;
  }

  // Final root arc closing the gear body back to the start point
  const [sx, sy] = pt(rRoot, -rootHalf);
  d += `A ${rRoot},${rRoot} 0 0,1 ${sx},${sy} Z `;

  // Hub cutout — three 120° arcs, CW; evenodd fill rule punches the hole
  const [h0x, h0y] = pt(rHub, 0);
  const [h1x, h1y] = pt(rHub, 120);
  const [h2x, h2y] = pt(rHub, 240);
  d += `M ${h0x},${h0y} `;
  d += `A ${rHub},${rHub} 0 0,1 ${h1x},${h1y} `;
  d += `A ${rHub},${rHub} 0 0,1 ${h2x},${h2y} `;
  d += `A ${rHub},${rHub} 0 0,1 ${h0x},${h0y} Z`;

  return d;
}

// ── Steampunk gear SVG (12-tooth mechanical cog) ─────────────────────────────
function GearSVG({ size, className }) {
  const gearPath = buildGearPath(50, 50, 27, 40, 11, 12, 7, 5.5);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Gear body with proper teeth — hub punched out via evenodd */}
      <path d={gearPath} fill="#b87333" fillRule="evenodd" />
      {/* Decorative hub ring and centre rivet */}
      <circle cx="50" cy="50" r="16" fill="none" stroke="#c89640" strokeWidth="1.5" strokeOpacity="0.45" />
      <circle cx="50" cy="50" r="4"  fill="#c89640" fillOpacity="0.75" />
    </svg>
  );
}

// ── Steampunk decorative gears — renders only when steampunk theme is active ──
function SteampunkGearDecor() {
  return (
    <>
      {/* Top-right: large gear */}
      <div className="sp-gear-decor sp-gear-tr-large">
        <GearSVG size={52} className="sp-spin-cw-12" />
      </div>
      {/* Top-right: small gear meshing below-left of the large one */}
      <div className="sp-gear-decor sp-gear-tr-small">
        <GearSVG size={30} className="sp-spin-ccw-9" />
      </div>
      {/* Bottom-left: medium gear, partially off-edge for subtlety */}
      <div className="sp-gear-decor sp-gear-bl-mid">
        <GearSVG size={44} className="sp-spin-cw-15" />
      </div>
    </>
  );
}
import LofiSidebar from './LofiSidebar';
import PomodoroTimer from './sidebar/PomodoroTimer';
import StickersSection from './sidebar/StickersSection';
import ThemesSection from './sidebar/ThemesSection';
import StickyNotesSection from './sidebar/StickyNotesSection';
import SavedDesksModal from './sidebar/SavedDesksModal';
import SavePopup from './sidebar/SavePopup';
import sidebarTodoListIcon from '../assets/stickynotes/todolist1.png';
import clockIcon from '../themes/cozykawaii/stickers/cozyclock.png';
import steampunkClockIcon from '../themes/steampunk/stickers/steampunkclock.png';

export default function Sidebar({
  stickers,
  onAddNote,
  onAddTodoList,
  onReset,
  onSettings,
  canUndo,
  onUndo,
  canRedo,
  onRedo,
  onSaveSlot,
  onLoadSlot,
}) {
  const { themeName, theme } = useTheme();
  const [savedDesksOpen, setSavedDesksOpen] = React.useState(false);
  const [savePopupOpen, setSavePopupOpen]   = React.useState(false);
  const [currentDesk, setCurrentDesk]       = React.useState(null);

  // Intercept load to capture which desk is now active
  const handleLoad = React.useCallback((slot) => {
    try {
      const raw = localStorage.getItem(`cozydesk_saved_${themeName}_slot_${slot}`);
      if (raw) {
        const d = JSON.parse(raw);
        setCurrentDesk({ slot, name: d.name || `Slot ${slot}` });
      }
    } catch (_) {}
    onLoadSlot(slot);
  }, [themeName, onLoadSlot]);

  // Intercept save to keep currentDesk in sync
  const handleSave = React.useCallback((slot, name) => {
    onSaveSlot(slot, name);
    setCurrentDesk({ slot, name });
  }, [onSaveSlot]);

  if (themeName === 'lofi') {
    return (
      <LofiSidebar
        stickers={stickers}
        onAddNote={onAddNote}
        onSettings={onSettings}
        canUndo={canUndo}
        onUndo={onUndo}
        canRedo={canRedo}
        onRedo={onRedo}
        onSaveSlot={onSaveSlot}
        onLoadSlot={onLoadSlot}
      />
    );
  }

  return (
    <div className="cozy-sidebar" data-theme={themeName}>
      {themeName === 'steampunk' && <SteampunkGearDecor />}
      <div className="sb-inner-wrapper">
        <div className="sb-logo">
          <h1 className="sb-logo-title">CozyDesk</h1>
          <p className="sb-logo-subtitle">YOUR COZY WORKSPACE ✦</p>
        </div>

        {/* ═══════════════════════════════════════
            Themes
            ═══════════════════════════════════════ */}
        <div className="sb-section">
          <h3 className="sb-section-title">🎨 Themes</h3>
          <ThemesSection />
        </div>

        <button className="sb-action-btn sb-action-mydesks" onClick={() => setSavedDesksOpen(true)}>
          📁 My Desks
        </button>

        <hr className="sb-divider" />

        {/* ═══════════════════════════════════════
            Section 1 — Productivity Tools
            (To-Do List, Sticky Notes, Calendar)
            ═══════════════════════════════════════ */}
        <div className="sb-section">
          <h3 className="sb-section-title">✦ Productivity Tools</h3>
          
          <div className="sb-todo-container">
            <div
                title="Drag to add to desk"
                className="sb-todo-icon-btn"
                style={{ position: 'relative' }}
              >
                <img
                  src={sidebarTodoListIcon}
                  alt="To-Do List"
                  className="sb-todo-icon-img"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'todolist' }));
                    e.dataTransfer.effectAllowed = 'copy';
                    
                    const ghost = e.currentTarget.cloneNode(true);
                    ghost.style.opacity = '0.5';
                    ghost.style.position = 'absolute';
                    ghost.style.top = '-9999px';
                    document.body.appendChild(ghost);
                    e.dataTransfer.setDragImage(ghost, 40, 40);
                    setTimeout(() => document.body.removeChild(ghost), 0);
                  }}
                />
            </div>
            <div className="sb-icon-label">To-Do List</div>
          </div>

          <div className="sb-todo-container">
            <StickyNotesSection onAddNote={onAddNote} />
            <div className="sb-icon-label" style={{ marginTop: '2px' }}>Sticky Notes</div>
          </div>

          <div className="sb-todo-container">
            <div
                title="Drag to add to desk"
                className="sb-todo-icon-btn"
                style={{ position: 'relative' }}
              >
                <img
                  src={theme.calendarTheme?.image}
                  alt="Calendar"
                  className="sb-todo-icon-img"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'calendar' }));
                    e.dataTransfer.effectAllowed = 'copy';
                    
                    const ghost = e.currentTarget.cloneNode(true);
                    ghost.style.opacity = '0.5';
                    ghost.style.position = 'absolute';
                    ghost.style.top = '-9999px';
                    document.body.appendChild(ghost);
                    e.dataTransfer.setDragImage(ghost, 40, 40);
                    setTimeout(() => document.body.removeChild(ghost), 0);
                  }}
                />
            </div>
            <div className="sb-icon-label" style={{ marginTop: '2px' }}>Calendar</div>
          </div>

          <div className="sb-todo-container">
            <div
                title="Drag to add to desk"
                className="sb-todo-icon-btn"
                style={{ position: 'relative' }}
              >
                {themeName === 'steampunk' ? (
                  <LiveSteampunkClockIcon
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify({ name: 'steampunkclock.png', src: steampunkClockIcon }));
                      e.dataTransfer.effectAllowed = 'copy';
                      const ghost = document.createElement('img');
                      ghost.src = steampunkClockIcon;
                      ghost.style.cssText = 'position:absolute;top:-9999px;width:60px;opacity:0.5';
                      document.body.appendChild(ghost);
                      e.dataTransfer.setDragImage(ghost, 30, 40);
                      setTimeout(() => document.body.removeChild(ghost), 0);
                    }}
                  />
                ) : (
                  <LiveClockIcon
                    src={clockIcon}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify({ name: 'cozyclock.png', src: clockIcon }));
                      e.dataTransfer.effectAllowed = 'copy';
                      const ghost = document.createElement('img');
                      ghost.src = clockIcon;
                      ghost.style.cssText = 'position:absolute;top:-9999px;width:80px;opacity:0.5';
                      document.body.appendChild(ghost);
                      e.dataTransfer.setDragImage(ghost, 40, 20);
                      setTimeout(() => document.body.removeChild(ghost), 0);
                    }}
                  />
                )}
            </div>
            <div className="sb-icon-label" style={{ marginTop: '2px' }}>Clock</div>
          </div>
        </div>

        <div className="sb-section" style={{ textAlign: 'center' }}>
          <PomodoroTimer />
          <div className="sb-icon-label" style={{ marginTop: '8px' }}>Pomodoro Timer</div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          Section 2 — Stickers
          ═══════════════════════════════════════ */}
      <div className="sb-section">
        <h3 className="sb-section-title">🌸 Stickers</h3>

        <StickersSection
          stickers={stickers}
          canUndo={canUndo}
          onUndo={onUndo}
          canRedo={canRedo}
          onRedo={onRedo}
        />
      </div>

      {/* Push settings to the bottom */}
      <div className="sb-spacer" />

      <button className="sb-action-btn sb-action-save" onClick={() => setSavePopupOpen(true)}>
        💾 SAVE
      </button>

      <button className="sb-action-btn sb-action-settings" onClick={onSettings}>
        ⚙️ Settings
      </button>

      {savedDesksOpen && (
        <SavedDesksModal
          themeName={themeName}
          onLoad={handleLoad}
          onClose={() => setSavedDesksOpen(false)}
        />
      )}

      {savePopupOpen && (
        <SavePopup
          themeName={themeName}
          currentDesk={currentDesk}
          onSave={handleSave}
          onClose={() => setSavePopupOpen(false)}
        />
      )}
    </div>
  );
}
