import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const FONT = "'Nunito', sans-serif";
const slotKey = (theme, slot) => `cozydesk_saved_${theme}_slot_${slot}`;

function readSlot(theme, slot) {
  try {
    const raw = localStorage.getItem(slotKey(theme, slot));
    if (!raw) return null;
    const d = JSON.parse(raw);
    return { name: d.name || `Slot ${slot}`, savedAt: d.savedAt || null };
  } catch { return null; }
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
      + ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

const BTN_BASE = { fontFamily: FONT, fontWeight: 700, fontSize: '0.78rem', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', color: '#fff', lineHeight: 1.5, whiteSpace: 'nowrap' };
const COLORS = { load: '#2196F3', rename: '#FF9800', delete: '#f44336', green: '#4CAF50', gray: '#9E9E9E', red: '#f44336' };

function Btn({ color, onClick, children, style }) {
  return <button style={{ ...BTN_BASE, background: COLORS[color] || color, ...style }} onClick={onClick}>{children}</button>;
}

export default function SavedDesksSection({ themeName, onLoad }) {
  const [refresh, setRefresh]           = useState(0);
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  // rename mini-popup
  const [renamingSlot, setRenamingSlot] = useState(null);
  const [renameVal, setRenameVal]       = useState('');

  const slots = Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    return { slot: n, data: readSlot(themeName, n) };
  });

  const toggleExpand = (e, slot) => {
    e.stopPropagation();
    setExpandedSlot(prev => prev === slot ? null : slot);
    setConfirmDelete(null);
  };

  const handleLoad = (e, slot) => { e.stopPropagation(); onLoad(slot); };

  const askDelete = (e, slot) => { e.stopPropagation(); setConfirmDelete(slot); };
  const doDelete  = (e, slot) => {
    e.stopPropagation();
    try { localStorage.removeItem(slotKey(themeName, slot)); } catch (_) {}
    setConfirmDelete(null);
    setExpandedSlot(null);
    setRefresh(r => r + 1);
  };

  const startRename = (e, slot, name) => { e.stopPropagation(); setRenamingSlot(slot); setRenameVal(name); };
  const confirmRename = (e) => {
    e && e.stopPropagation();
    try {
      const raw = localStorage.getItem(slotKey(themeName, renamingSlot));
      if (raw) {
        const d = JSON.parse(raw);
        d.name = renameVal.trim() || d.name;
        localStorage.setItem(slotKey(themeName, renamingSlot), JSON.stringify(d));
      }
    } catch (_) {}
    setRenamingSlot(null);
    setRefresh(r => r + 1);
  };

  const slotBox = { fontFamily: FONT, borderRadius: '8px', padding: '7px 9px', marginBottom: '5px', border: '1px solid var(--sb-border)', background: 'var(--sb-card)', boxSizing: 'border-box' };

  return (
    <div data-refresh={refresh}>
      {slots.map(({ slot, data }) => {
        const isExpanded   = expandedSlot === slot;
        const isConfirming = confirmDelete === slot;

        return (
          <div key={slot} style={slotBox} onClick={e => e.stopPropagation()}>

            {/* ── EMPTY SLOT: plain text ── */}
            {!data && (
              <span style={{ fontFamily: FONT, fontSize: '0.8rem', color: 'var(--sb-subtext)', opacity: 0.7 }}>
                Slot {slot} — Empty
              </span>
            )}

            {/* ── FILLED SLOT: header (click to expand) ── */}
            {data && (
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
                onClick={(e) => toggleExpand(e, slot)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1, minWidth: 0 }}>
                  <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.82rem', color: 'var(--sb-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {data.name}
                  </span>
                  <span style={{ fontFamily: FONT, fontSize: '0.68rem', color: 'var(--sb-subtext)' }}>
                    {formatDate(data.savedAt)}
                  </span>
                </div>
                <span style={{ fontFamily: FONT, fontSize: '0.65rem', color: 'var(--sb-subtext)', marginLeft: '6px', flexShrink: 0 }}>
                  {isExpanded ? '▴' : '▾'}
                </span>
              </div>
            )}

            {/* ── FILLED SLOT: action buttons ── */}
            {data && isExpanded && !isConfirming && (
              <div style={{ display: 'flex', gap: '5px', marginTop: '7px' }}>
                <Btn color="load"   onClick={(e) => handleLoad(e, slot)}>Load</Btn>
                <Btn color="rename" onClick={(e) => startRename(e, slot, data.name)}>Rename</Btn>
                <Btn color="delete" onClick={(e) => askDelete(e, slot)}>Delete</Btn>
              </div>
            )}

            {/* ── FILLED SLOT: delete confirmation ── */}
            {data && isExpanded && isConfirming && (
              <div style={{ marginTop: '7px' }}>
                <div style={{ fontFamily: FONT, fontSize: '0.78rem', color: 'var(--sb-text)', marginBottom: '6px' }}>
                  Delete &ldquo;{data.name}&rdquo;?
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <Btn color="delete" onClick={(e) => doDelete(e, slot)}>Delete</Btn>
                  <Btn color="gray"   onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}>Cancel</Btn>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── RENAME mini-popup (portal) ── */}
      {renamingSlot !== null && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setRenamingSlot(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: '14px', padding: '22px 24px', boxShadow: '0 8px 28px rgba(0,0,0,0.22)', width: '280px', fontFamily: FONT }}
            onClick={e => e.stopPropagation()}
          >
            <label style={{ fontFamily: FONT, fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '8px' }}>
              Rename:
            </label>
            <input
              style={{ fontFamily: FONT, fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', border: '1.5px solid #ddd', borderRadius: '8px', padding: '8px 10px', outline: 'none', marginBottom: '14px', color: '#333' }}
              value={renameVal}
              maxLength={24}
              autoFocus
              onChange={e => setRenameVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && renameVal.trim()) confirmRename(e);
                if (e.key === 'Escape') setRenamingSlot(null);
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Btn color="green" onClick={confirmRename} style={{ opacity: renameVal.trim() ? 1 : 0.5, cursor: renameVal.trim() ? 'pointer' : 'not-allowed' }}>✓ Save</Btn>
              <Btn color="red"   onClick={() => setRenamingSlot(null)}>✕</Btn>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
