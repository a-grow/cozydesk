import React, { useState, useEffect } from 'react';
import MusicPlayer from './MusicPlayer';
import './Sidebar.css';
import ThemesSection from './sidebar/ThemesSection';
import StickersSection from './sidebar/StickersSection';
import PomodoroTimer from './sidebar/PomodoroTimer';
import SavedDesksModal from './sidebar/SavedDesksModal';
import SavePopup from './sidebar/SavePopup';
import clockIcon from '../themes/lofi/stickers/loficlock.png';
import lofiTodoImg from '../themes/lofi/stickynotes/lofotodolist.png';
import lofiStickyNoteImg from '../themes/lofi/stickynotes/lofistickynoteblue.png';
import lofiCalendarImg from '../themes/lofi/widgets/loficalendarbase.png';
import { useTheme } from '../themes/ThemeContext';

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function IconTodo() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
      <rect x="9" y="5" width="28" height="36" rx="4" fill="rgba(124,115,192,0.15)" stroke="#7c73c0" strokeWidth="1.5"/>
      <rect x="17" y="3" width="12" height="6" rx="3" fill="#1e1640" stroke="#7c73c0" strokeWidth="1.5"/>
      <circle cx="14" cy="17" r="1.6" fill="#c5b8ff"/>
      <line x1="18" y1="17" x2="32" y2="17" stroke="#a29bfe" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="14" cy="24" r="1.6" fill="#c5b8ff"/>
      <line x1="18" y1="24" x2="31" y2="24" stroke="#a29bfe" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="14" cy="31" r="1.6" fill="#c5b8ff"/>
      <line x1="18" y1="31" x2="28" y2="31" stroke="#a29bfe" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconStickyNote() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
      <rect x="5" y="10" width="24" height="24" rx="3" fill="rgba(80,70,130,0.55)" stroke="#7c73c0" strokeWidth="1.5"/>
      <rect x="13" y="5" width="24" height="24" rx="3" fill="rgba(124,115,192,0.18)" stroke="#a29bfe" strokeWidth="1.5"/>
      <line x1="19" y1="13" x2="31" y2="13" stroke="#c5b8ff" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="19" y1="18" x2="31" y2="18" stroke="#c5b8ff" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="19" y1="23" x2="27" y2="23" stroke="#c5b8ff" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
      <rect x="4" y="8" width="38" height="34" rx="4" fill="rgba(124,115,192,0.13)" stroke="#7c73c0" strokeWidth="1.5"/>
      <rect x="4" y="8" width="38" height="12" rx="4" fill="rgba(124,115,192,0.38)"/>
      <rect x="4" y="17" width="38" height="3" fill="rgba(124,115,192,0.38)"/>
      <line x1="15" y1="4" x2="15" y2="14" stroke="#a29bfe" strokeWidth="2" strokeLinecap="round"/>
      <line x1="31" y1="4" x2="31" y2="14" stroke="#a29bfe" strokeWidth="2" strokeLinecap="round"/>
      {/* Day dots */}
      {[0,1,2,3,4,5,6].map(col =>
        [0,1,2,3].map(row => (
          <circle
            key={`${col}-${row}`}
            cx={9 + col * 4.7}
            cy={25 + row * 4.5}
            r="1.3"
            fill={col === 0 && row === 0 ? '#c5b8ff' : '#7c73c0'}
            fillOpacity={col === 0 && row === 0 ? 1 : 0.65}
          />
        ))
      )}
    </svg>
  );
}

function IconCassette() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
      {/* Body */}
      <rect x="2" y="11" width="42" height="24" rx="5" fill="rgba(124,115,192,0.18)" stroke="#7c73c0" strokeWidth="1.5"/>
      {/* Tape window */}
      <rect x="13" y="15" width="20" height="12" rx="3" fill="rgba(15,10,40,0.85)" stroke="#a29bfe" strokeWidth="1"/>
      {/* Left reel */}
      <circle cx="18" cy="21" r="4" fill="rgba(124,115,192,0.28)" stroke="#a29bfe" strokeWidth="1"/>
      <circle cx="18" cy="21" r="1.5" fill="#a29bfe"/>
      {/* Right reel */}
      <circle cx="28" cy="21" r="4" fill="rgba(124,115,192,0.28)" stroke="#a29bfe" strokeWidth="1"/>
      <circle cx="28" cy="21" r="1.5" fill="#a29bfe"/>
      {/* Tape path */}
      <path d="M 22 25 Q 23 26.5 24 25" stroke="#7c73c0" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Corner screws */}
      <circle cx="7" cy="16" r="1.8" fill="rgba(124,115,192,0.35)" stroke="#7c73c0" strokeWidth="0.8"/>
      <circle cx="39" cy="16" r="1.8" fill="rgba(124,115,192,0.35)" stroke="#7c73c0" strokeWidth="0.8"/>
      <circle cx="7" cy="30" r="1.8" fill="rgba(124,115,192,0.35)" stroke="#7c73c0" strokeWidth="0.8"/>
      <circle cx="39" cy="30" r="1.8" fill="rgba(124,115,192,0.35)" stroke="#7c73c0" strokeWidth="0.8"/>
      {/* Label stripe */}
      <line x1="8" y1="29" x2="38" y2="29" stroke="rgba(124,115,192,0.28)" strokeWidth="1"/>
    </svg>
  );
}

// ── Sidebar lofi clock — image + live overlay matching LofiClockSticker ───────
// SCREEN coords match LofiClockSticker (loficlock.png 712×319):
//   left 10%, right 19%, top 18%, bottom 14%
function SidebarLofiClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  let hours = time.getHours();
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timeStr = `${hours}:${minutes}`;
  const dateStr = time.toLocaleDateString([], { month: 'numeric', day: 'numeric' });

  return (
    <div style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
      <img
        src={clockIcon}
        alt="Lofi Clock"
        style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
      />
      <div style={{
        position: 'absolute',
        top: '18%', left: '10%', right: '19%', bottom: '14%',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        textAlign: 'center', pointerEvents: 'none', userSelect: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', lineHeight: 1.0 }}>
          <span style={{
            fontSize: '13px', fontWeight: 400,
            fontFamily: "'Share Tech Mono', monospace",
            letterSpacing: '0.05em', color: '#000000',
            WebkitFontSmoothing: 'none', MozOsxFontSmoothing: 'none',
            whiteSpace: 'nowrap',
          }}>{timeStr}</span>
          <span style={{
            fontSize: '6px', fontWeight: 400,
            fontFamily: "'Share Tech Mono', monospace",
            letterSpacing: '0.06em', color: '#000000',
            WebkitFontSmoothing: 'none', MozOsxFontSmoothing: 'none',
          }}>{ampm}</span>
        </div>
        <p style={{
          fontSize: '7px', margin: '1px 0 0 0',
          fontFamily: "'Share Tech Mono', monospace",
          fontWeight: 400, color: '#000000',
          letterSpacing: '0.06em', lineHeight: 1.0,
          whiteSpace: 'nowrap',
          WebkitFontSmoothing: 'none', MozOsxFontSmoothing: 'none',
        }}>{dateStr}</p>
      </div>
    </div>
  );
}

// ── Purple pill ghost for drag preview ───────────────────────────────────────
function makeDragGhost(label) {
  const el = document.createElement('div');
  el.textContent = label;
  el.style.cssText = [
    'position:absolute', 'top:-9999px',
    'background:#2D1B69', 'color:#c5b8ff',
    'padding:6px 16px', 'border-radius:20px',
    "font-family:'Fredoka',cursive", 'font-size:14px',
    'border:1px solid rgba(124,115,192,0.8)',
    'box-shadow:0 0 12px rgba(124,115,192,0.6)',
    'white-space:nowrap',
  ].join(';');
  return el;
}

// ── Big icon card ─────────────────────────────────────────────────────────────
function BigCard({ icon, label, onDragStart, children }) {
  return (
    <div
      className="lofi-big-card"
      title={onDragStart ? 'Drag to add to desk' : undefined}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      style={!onDragStart ? { cursor: 'default' } : undefined}
    >
      {icon && <div className="lofi-icon-box">{icon}</div>}
      {children}
      <div className="lofi-card-label">{label}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LofiSidebar({
  stickers,
  onAddNote,
  onSettings,
  canUndo,
  onUndo,
  canRedo,
  onRedo,
  onSaveSlot,
  onLoadSlot,
}) {
  const { themeStickyNotes, themeName } = useTheme();
  const [savedDesksOpen, setSavedDesksOpen] = React.useState(false);
  const [savePopupOpen, setSavePopupOpen]   = React.useState(false);
  const [currentDesk, setCurrentDesk]       = React.useState(null);
  const lofiNoteIcon = themeStickyNotes.find(s => s.name.includes('yellow')) || themeStickyNotes[0];

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

  const startDrag = (data, label) => (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'copy';
    const ghost = makeDragGhost(label);
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, 20);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  return (
    <div className="cozy-sidebar" data-theme="lofi">

      {/* ── Logo ── */}
      <div className="sb-logo">
  <img
    src="/src/assets/cozydesk-logo.png"
    alt="CozyDesk"
    style={{ width: '180px', display: 'block', margin: '0 auto', position: 'relative', zIndex: 1 }}
  />
  <p className="sb-logo-subtitle">YOUR COZY WORKSPACE ✦</p>
</div>
      <MusicPlayer />
      {/* ── Theme ── */}
      <div className="lofi-section-block">
        <div className="lofi-section-label">THEMES</div>
        <ThemesSection />
      </div>

      <button className="lofi-settings-full-btn" onClick={() => setSavedDesksOpen(true)}>
        📁 My Desks
      </button>

      {/* ── Productivity Tools ── */}
      <div className="lofi-section-block">
        <div className="lofi-section-label">PRODUCTIVITY TOOLS</div>

        <BigCard
          label="TO-DO LIST"
          onDragStart={startDrag({ type: 'todolist' }, 'To-Do List')}
        >
          <img src={lofiTodoImg} alt="To-Do List" style={{ width: '100%', maxWidth: '130px', height: 'auto', objectFit: 'contain', pointerEvents: 'none', userSelect: 'none' }} />
        </BigCard>

        <BigCard
          label="STICKY NOTES"
          onDragStart={startDrag(
            { type: 'note', src: lofiNoteIcon?.src, name: lofiNoteIcon?.name || 'lofistickynoteyellow.png' },
            'Sticky Note',
          )}
        >
          <img src={lofiStickyNoteImg} alt="Sticky Notes" style={{ width: '100%', maxWidth: '130px', height: 'auto', objectFit: 'contain', pointerEvents: 'none', userSelect: 'none' }} />
        </BigCard>

        <BigCard
          label="CALENDAR"
          onDragStart={startDrag({ type: 'calendar' }, 'Calendar')}
        >
          <img src={lofiCalendarImg} alt="Calendar" style={{ width: '100%', maxWidth: '130px', height: 'auto', objectFit: 'contain', pointerEvents: 'none', userSelect: 'none' }} />
        </BigCard>

        {/* Clock — lofi clock image with live time overlay */}
        <BigCard
          label="CLOCK"
          onDragStart={startDrag({ name: 'loficlock.png', src: clockIcon }, 'Clock')}
        >
          <SidebarLofiClock />
        </BigCard>

        {/* Pomodoro — embedded timer with label below */}
        <div className="lofi-big-card lofi-pomo-card" style={{ cursor: 'default' }}>
          <PomodoroTimer />
          <div className="lofi-card-label">POMODORO</div>
        </div>
      </div>

      {/* ── Stickers ── */}
      <div className="lofi-section-block">
        <div className="lofi-section-label">STICKERS</div>
        <StickersSection
          stickers={stickers}
          canUndo={canUndo}
          onUndo={onUndo}
          canRedo={canRedo}
          onRedo={onRedo}
        />
      </div>

      <div className="sb-spacer" />

      <button className="lofi-settings-full-btn lofi-save-btn" onClick={() => setSavePopupOpen(true)}>
        💾 SAVE
      </button>

      <button className="lofi-settings-full-btn" onClick={onSettings}>
        ⊙ Settings
      </button>

      {savedDesksOpen && (
        <SavedDesksModal
          themeName="lofi"
          onLoad={handleLoad}
          onClose={() => setSavedDesksOpen(false)}
        />
      )}

      {savePopupOpen && (
        <SavePopup
          themeName="lofi"
          currentDesk={currentDesk}
          onSave={handleSave}
          onClose={() => setSavePopupOpen(false)}
        />
      )}
    </div>
  );
}
