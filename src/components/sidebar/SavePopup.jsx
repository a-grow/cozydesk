import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const FONT = "'Nunito', sans-serif";

function getSlotMeta(theme, slot) {
  try {
    const raw = localStorage.getItem(`cozydesk_saved_${theme}_slot_${slot}`);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return { slot, name: d.name || `Slot ${slot}`, savedAt: d.savedAt || null };
  } catch { return null; }
}

function getLastSaved(theme) {
  let latest = null;
  for (let i = 1; i <= 10; i++) {
    const m = getSlotMeta(theme, i);
    if (m && m.savedAt) {
      if (!latest || new Date(m.savedAt) > new Date(latest.savedAt)) latest = m;
    }
  }
  return latest;
}

function getFirstEmpty(theme) {
  for (let i = 1; i <= 10; i++) {
    if (!getSlotMeta(theme, i)) return i;
  }
  return null;
}

const BTN = {
  base: { fontFamily: FONT, fontWeight: 700, fontSize: '0.9rem', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', color: '#fff', lineHeight: 1.4 },
  green:  { background: '#4CAF50' },
  blue:   { background: '#2196F3' },
  red:    { background: '#f44336', padding: '8px 13px' },
  gray:   { background: '#9E9E9E', cursor: 'not-allowed' },
};

function Btn({ color, disabled, onClick, children }) {
  return (
    <button
      style={{ ...BTN.base, ...(disabled ? BTN.gray : BTN[color] || BTN.green) }}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function SavePopup({ themeName, currentDesk, onSave, onClose }) {
  // Use the currently loaded/saved desk as overwrite target; fall back to most recent save
  const overwriteTarget = currentDesk || getLastSaved(themeName);
  const firstEmpty = getFirstEmpty(themeName);
  const hasSaves   = overwriteTarget !== null;
  const allFull    = firstEmpty === null;

  // mode: 'choose' | 'overwrite-only' | 'name-input'
  const [mode, setMode] = useState(
    !hasSaves   ? 'name-input' :
    allFull     ? 'overwrite-only' :
                  'choose'
  );
  const [name, setName] = useState('');

  const doOverwrite = () => { onSave(overwriteTarget.slot, overwriteTarget.name); onClose(); };
  const doSaveNew   = () => { if (!name.trim()) return; onSave(firstEmpty, name.trim()); onClose(); };

  const boxStyle = {
    background: '#fff',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
    width: '300px',
    fontFamily: FONT,
  };

  const labelStyle = { fontFamily: FONT, fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '8px' };
  const inputStyle = {
    fontFamily: FONT, fontSize: '0.9rem', width: '100%', boxSizing: 'border-box',
    border: '1.5px solid #ddd', borderRadius: '8px', padding: '8px 10px',
    outline: 'none', marginBottom: '14px', color: '#333',
  };
  const rowStyle = { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' };
  const msgStyle = { fontFamily: FONT, fontSize: '0.9rem', color: '#333', margin: '0 0 16px', textAlign: 'center', lineHeight: 1.4 };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={boxStyle} onClick={e => e.stopPropagation()}>

        {/* ── CHOOSE: overwrite or new ── */}
        {mode === 'choose' && (
          <>
            <p style={msgStyle}>
              Overwrite <strong>&ldquo;{overwriteTarget.name}&rdquo;</strong> or save as a new desk?
            </p>
            <div style={rowStyle}>
              <Btn color="green" onClick={doOverwrite}>Overwrite</Btn>
              <Btn color="blue"  onClick={() => { setMode('name-input'); setName(''); }}>Create New</Btn>
              <Btn color="red"   onClick={onClose}>✕</Btn>
            </div>
          </>
        )}

        {/* ── ALL FULL: only overwrite ── */}
        {mode === 'overwrite-only' && (
          <>
            <p style={msgStyle}>
              All 10 slots are full.<br />
              Overwrite <strong>&ldquo;{overwriteTarget.name}&rdquo;</strong>?
            </p>
            <div style={rowStyle}>
              <Btn color="green" onClick={doOverwrite}>Overwrite</Btn>
              <Btn color="red"   onClick={onClose}>✕</Btn>
            </div>
          </>
        )}

        {/* ── NAME INPUT: first save or create new ── */}
        {mode === 'name-input' && (
          <>
            <label style={labelStyle}>Name your desk:</label>
            <input
              style={inputStyle}
              placeholder="My desk layout…"
              value={name}
              maxLength={24}
              autoFocus
              onChange={e => setName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && name.trim()) doSaveNew();
                if (e.key === 'Escape') onClose();
              }}
            />
            <div style={rowStyle}>
              <Btn color="green" disabled={!name.trim()} onClick={doSaveNew}>Save</Btn>
              <Btn color="red"   onClick={onClose}>✕</Btn>
            </div>
          </>
        )}

      </div>
    </div>,
    document.body
  );
}
