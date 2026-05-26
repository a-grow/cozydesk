import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
const CATEGORIES = [
  { id: 'personal', label: 'Personal', color: '#f9a8d4' },
  { id: 'work',     label: 'Work',     color: '#93c5fd' },
  { id: 'health',   label: 'Health',   color: '#86efac' },
  { id: 'family',   label: 'Family',   color: '#fcd34d' },
  { id: 'other',    label: 'Other',    color: '#d1d5db' },
];

function resolveEventsForDate(events, dateKey) {
  const direct = events[dateKey] || [];
  const recurring = [];
  for (const [srcKey, evList] of Object.entries(events)) {
    if (srcKey === dateKey) continue;
    (evList || []).forEach((ev, srcIdx) => {
      if (!ev.repeat || ev.repeat === 'none') return;
      const [yr, mo, da] = srcKey.split('-').map(Number);
      const [tyr, tmo, tda] = dateKey.split('-').map(Number);
      const src  = new Date(yr, mo - 1, da);
      const target = new Date(tyr, tmo - 1, tda);
      if (target <= src) return;
      let match = false;
      if (ev.repeat === 'daily') match = true;
      if (ev.repeat === 'weekly' && src.getDay() === target.getDay()) match = true;
      if (ev.repeat === 'monthly' && da === tda) match = true;
      if (match) recurring.push({ ...ev, isRecurring: true, srcKey, srcIdx });
    });
  }
  return [...direct, ...recurring];
}
import { useTheme } from '../themes/ThemeContext';

const FONT = "'Roboto', sans-serif";
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_BARS = 3;

function getEventColor(ev) {
  if (ev.category) return CATEGORIES.find(c => c.id === ev.category)?.color ?? '#d1d5db';
  return '#d1d5db';
}

function toDateKey(year, month, d) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function inputStyle(mt, extra = {}) {
  return {
    fontSize: '13px', padding: '6px 10px',
    border: `1px solid ${mt.border}`, borderRadius: '8px',
    background: mt.inputBg, color: mt.text,
    fontFamily: FONT, outline: 'none', ...extra,
  };
}

export default function LargeCalendarModal({
  events, onAddEvent, onRemoveEvent, onClose,
  stickerCalendarLinks, onSyncToSticker, onUpdateLink, onRemoveLink,
}) {
  const { theme } = useTheme();
  const mt = theme.modalTheme;
  const brandFont = theme.brandFont;

  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [addFormDay, setAddFormDay] = useState(null);
  const [editing, setEditing] = useState(null);
  const editInputRef = useRef(null);
  const [search, setSearch] = useState('');
  const [dragging, setDragging]       = useState(null);
  const [dragOverKey, setDragOverKey] = useState(null);
  const [recurringDialog, setRecurringDialog] = useState(null);
  const [calSyncPrompt, setCalSyncPrompt] = useState(null);
  const [calDeleteSync, setCalDeleteSync] = useState(() => {
    try { return localStorage.getItem('cozydesk_cal_delete_sync'); }
    catch { return null; }
  });

  const firedRef = useRef(new Set());
  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') Notification.requestPermission();
    const check = () => {
      if (Notification.permission !== 'granted') return;
      const now = new Date();
      for (const [dateKey, evList] of Object.entries(events)) {
        (evList || []).forEach((ev, idx) => {
          if (!ev.reminder || !ev.time) return;
          const [h, m] = ev.time.split(':').map(Number);
          const [yr, mo, da] = dateKey.split('-').map(Number);
          const evDate = new Date(yr, mo - 1, da, h, m);
          const diffMs = evDate - now;
          const reminderMs = (ev.reminderMinutes || 10) * 60000;
          const fireKey = `${dateKey}:${idx}`;
          if (diffMs > 0 && diffMs <= reminderMs && !firedRef.current.has(fireKey)) {
            firedRef.current.add(fireKey);
            new Notification(`CozyDesk Reminder: ${ev.text}`, {
              body: `Starting at ${ev.time}`,
              icon: '/favicon.ico',
            });
          }
        });
      }
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [events]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (editing) { setEditing(null); }
      else if (addFormDay) { setAddFormDay(null); }
      else { onClose(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing, addFormDay, onClose]);

  useEffect(() => {
    if (editing && editInputRef.current) editInputRef.current.focus();
  }, [editing]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setAddFormDay(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setAddFormDay(null);
  };

  const openEdit = (key, idx, ev) => {
    setAddFormDay(null);
    setEditing({
      key, idx, isNew: false,
      originalText: ev.text,
      originalDateKey: key,
      text: ev.text,
      category: ev.category || 'personal',
      time: ev.time || '',
      repeat: ev.repeat || 'none',
      date: key,
      reminder: !!ev.reminder,
      reminderMinutes: ev.reminderMinutes || 10,
      noteId: ev.noteId || null,
    });
  };

  const openNewEdit = (key, ev) => {
    setAddFormDay(null);
    setEditing({
      key, idx: null, isNew: true,
      text: ev.text,
      category: ev.category || 'personal',
      time: ev.time || '',
      repeat: 'none',
      date: key,
      reminder: false,
      reminderMinutes: 10,
      noteId: ev.noteId || null,
    });
  };

  const saveEdit = () => {
    if (!editing || !editing.text.trim()) return;
    const { key, idx, isNew, originalText, originalDateKey, text, category, time, repeat, date, reminder, reminderMinutes, noteId } = editing;
    if (!isNew) onRemoveEvent(key, idx);
    onAddEvent(date, {
      text: text.trim(), category,
      ...(time.trim() ? { time: time.trim() } : {}),
      ...(repeat !== 'none' ? { repeat } : {}),
      ...(reminder ? { reminder: true, reminderMinutes } : {}),
      ...(noteId ? { noteId } : {}),
    });
    setEditing(null);
    if (!isNew && stickerCalendarLinks) {
      const link = stickerCalendarLinks.find(l => l.eventText === originalText && l.dateKey === originalDateKey);
      if (link && (text.trim() !== originalText || date !== originalDateKey)) {
        onSyncToSticker?.(link, text.trim(), date, false);
        onUpdateLink?.(link.linkId, { eventText: text.trim(), dateKey: date });
      }
    }
  };

  const deleteEdit = () => {
    if (!editing) return;
    const { key, idx, isNew, originalText, originalDateKey } = editing;
    if (!isNew) onRemoveEvent(key, idx);
    setEditing(null);
    if (!isNew && stickerCalendarLinks) {
      const link = stickerCalendarLinks.find(
        l => l.eventText === originalText && l.dateKey === originalDateKey
      );
      if (link) {
        if (calDeleteSync === 'yes') {
          onSyncToSticker?.(link, null, null, true);
          onRemoveLink?.(link.linkId);
        } else if (calDeleteSync === 'no') {
          onRemoveLink?.(link.linkId);
        } else {
          setCalSyncPrompt({ type: 'delete', link });
        }
      }
    }
  };

  const handleDrop = (e, targetKey) => {
    e.preventDefault();
    if (!dragging || !targetKey || dragging.key === targetKey) { setDragOverKey(null); return; }
    const { key: srcKey, idx, ev } = dragging;
    onRemoveEvent(srcKey, idx);
    onAddEvent(targetKey, {
      text: ev.text, category: ev.category,
      ...(ev.time ? { time: ev.time } : {}),
      ...(ev.repeat && ev.repeat !== 'none' ? { repeat: ev.repeat } : {}),
      ...(ev.reminder ? { reminder: true, reminderMinutes: ev.reminderMinutes || 10 } : {}),
      ...(ev.noteId ? { noteId: ev.noteId } : {}),
    });
    setDragging(null);
    setDragOverKey(null);
  };

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel  = new Date(year, month).toLocaleDateString('en', { month: 'long', year: 'numeric' });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (d) =>
    d !== null && d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const modal = (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9500,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT,
    }}>
      <div
        style={{
          position: 'relative', width: 'min(92vw, 960px)', maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          background: mt.bg, border: `2px solid ${mt.border}`,
          borderRadius: '20px', overflow: 'hidden', animation: 'calFadeIn 0.22s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: mt.headerBg, borderBottom: `1px solid ${mt.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 20px 4px', position: 'relative' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: mt.accent, fontFamily: brandFont, letterSpacing: '0.04em', opacity: 0.9 }}>
              CozyDesk Calendar
            </span>
            <button onClick={onClose} style={{
              position: 'absolute', right: '20px', width: '28px', height: '28px', borderRadius: '50%',
              background: '#ff4d4d', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            }}>✕</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px 10px', gap: '16px' }}>
            <button onClick={prevMonth} style={{ background: 'transparent', border: 'none', color: mt.accent, fontSize: '24px', cursor: 'pointer', padding: '0 8px', lineHeight: 1 }}>‹</button>
            <span style={{ fontSize: '20px', fontWeight: '700', color: mt.text, letterSpacing: '0.01em' }}>{monthLabel}</span>
            <button onClick={nextMonth} style={{ background: 'transparent', border: 'none', color: mt.accent, fontSize: '24px', cursor: 'pointer', padding: '0 8px', lineHeight: 1 }}>›</button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '6px 16px', background: mt.headerBg, borderBottom: `1px solid ${mt.border}`, flexShrink: 0 }}>
          <input
            placeholder="🔍  Search events…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={inputStyle(mt, { width: '100%', boxSizing: 'border-box', fontSize: '12px', padding: '5px 10px' })}
          />
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '6px 12px 2px', flexShrink: 0 }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '500', color: mt.subtext, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          gridAutoRows: 'minmax(80px, 1fr)', gap: '1px',
          padding: '0 12px 12px', background: mt.border,
        }}>
          {cells.map((d, i) => {
            const key = d !== null ? toDateKey(year, month, d) : null;
            const allDayEvents = key ? resolveEventsForDate(events, key) : [];
            const visibleEvents = search.trim()
              ? allDayEvents.filter(ev => ev.text.toLowerCase().includes(search.toLowerCase()))
              : allDayEvents;
            const overflow  = visibleEvents.length > MAX_BARS;
            const todayCell = isToday(d);
            const isAddOpen = addFormDay === key;
            const isDragOver = dragOverKey === key && key !== null;

            return (
              <div
                key={i}
                onClick={() => { if (d !== null) { setEditing(null); setAddFormDay(addFormDay === key ? null : key); } }}
                onDragOver={(e) => { if (key) { e.preventDefault(); setDragOverKey(key); } }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverKey(null); }}
                onDrop={(e) => key && handleDrop(e, key)}
                style={{
                  background: isDragOver ? mt.accent + '30' : todayCell ? mt.accent + '18' : mt.bg,
                  padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px',
                  position: 'relative', minHeight: '80px', transition: 'background 0.1s',
                  outline: isDragOver ? `2px dashed ${mt.accent}` : 'none', outlineOffset: '-2px',
                  cursor: d !== null ? 'pointer' : 'default',
                }}
              >
                {d !== null && (
                  <>
                    <span style={{
                      fontSize: '13px', fontWeight: todayCell ? '700' : '400',
                      color: todayCell ? mt.accent : mt.text,
                      alignSelf: 'flex-start', lineHeight: 1.3, userSelect: 'none',
                      borderRadius: todayCell ? '50%' : undefined,
                      background: todayCell ? mt.accent + '22' : undefined,
                      padding: todayCell ? '1px 5px' : undefined,
                    }}>{d}</span>

                    {isAddOpen && (
                      <input
                        autoFocus placeholder="New event…"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            onAddEvent(key, { text: e.target.value.trim(), category: 'personal' });
                            setAddFormDay(null);
                          }
                          if (e.key === 'Escape') setAddFormDay(null);
                        }}
                        onBlur={() => setAddFormDay(null)}
                        style={inputStyle(mt, { width: '100%', boxSizing: 'border-box', fontSize: '12px', padding: '3px 6px' })}
                      />
                    )}

                    {visibleEvents.slice(0, MAX_BARS).map((ev, j) => {
                      const color = getEventColor(ev);
                      const realIdx = allDayEvents.indexOf(ev);
                      const isDraggingThis = dragging?.key === key && dragging?.idx === realIdx;
                      return (
                        <div
                          key={j}
                          draggable={!ev.isRecurring}
                          onDragStart={(e) => { e.stopPropagation(); setDragging({ key, idx: realIdx, ev }); e.dataTransfer.effectAllowed = 'move'; }}
                          onDragEnd={() => { setDragging(null); setDragOverKey(null); }}
                          onClick={(e) => { e.stopPropagation(); if (ev.isRecurring) { setRecurringDialog({ key, ev }); } else { openEdit(key, realIdx, ev); } }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '2px 6px', borderRadius: '4px',
                            background: color + '44', borderLeft: `3px solid ${color}`,
                            fontSize: '11px', color: mt.text,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            flexShrink: 0, cursor: ev.isRecurring ? 'pointer' : 'grab',
                            opacity: isDraggingThis ? 0.4 : 1, transition: 'opacity 0.15s',
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, fontWeight: '500' }}>
                            {ev.text}
                            {ev.time && <span style={{ color: mt.subtext, marginLeft: '5px', fontSize: '10px', fontWeight: '400' }}>· {ev.time}</span>}
                            {ev.reminder && <span style={{ marginLeft: '4px', fontSize: '10px' }}>🔔</span>}
                            {ev.isRecurring && <span style={{ marginLeft: '4px', fontSize: '10px' }}>🔄</span>}
                          </span>
                        </div>
                      );
                    })}

                    {overflow && (
                      <span style={{ fontSize: '10px', color: mt.subtext, paddingLeft: '4px' }}>
                        +{visibleEvents.length - MAX_BARS} more
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '11px', color: mt.subtext, padding: '6px', borderTop: `1px solid ${mt.border}`, flexShrink: 0 }}>
          Click a date to add · Click an event to edit · Click 🔄 for recurring options · Drag to reschedule · Esc to close
        </div>
      </div>

      {/* Recurring dialog */}
      {recurringDialog && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setRecurringDialog(null)}>
          <div style={{
            background: mt.bg, border: `2px solid ${mt.border}`, borderRadius: '16px', padding: '20px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)', minWidth: '280px', maxWidth: '360px', width: '90vw',
            display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: FONT, animation: 'calFadeIn 0.15s ease-out',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: mt.text, borderBottom: `1px solid ${mt.border}`, paddingBottom: '8px' }}>🔄 Recurring Event</div>
            <div style={{ fontSize: '13px', color: mt.subtext, wordBreak: 'break-word' }}>"{recurringDialog.ev.text}" repeats from a previous date.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => { openNewEdit(recurringDialog.key, recurringDialog.ev); setRecurringDialog(null); }}
                style={{ padding: '9px 14px', borderRadius: '8px', background: mt.accent, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px', fontFamily: FONT }}>
                Edit this occurrence only</button>
              <button onClick={() => {
                const { ev } = recurringDialog;
                if (ev.srcKey) { const [yr, mo] = ev.srcKey.split('-').map(Number); setYear(yr); setMonth(mo - 1); const srcEv = events[ev.srcKey]?.[ev.srcIdx]; if (srcEv) openEdit(ev.srcKey, ev.srcIdx, srcEv); }
                setRecurringDialog(null);
              }} style={{ padding: '9px 14px', borderRadius: '8px', background: 'transparent', color: mt.text, border: `1px solid ${mt.border}`, cursor: 'pointer', fontSize: '13px', fontFamily: FONT }}>
                Edit the series</button>
              <button onClick={() => setRecurringDialog(null)}
                style={{ padding: '9px 14px', borderRadius: '8px', background: 'transparent', color: mt.subtext, border: `1px solid ${mt.border}`, cursor: 'pointer', fontSize: '13px', fontFamily: FONT }}>
                Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit popup */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setEditing(null)}>
          <div style={{
            background: mt.bg, border: `2px solid ${mt.border}`, borderRadius: '16px', padding: '20px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)', minWidth: '300px', maxWidth: '380px', width: '90vw',
            display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: FONT, animation: 'calFadeIn 0.15s ease-out',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: mt.text, borderBottom: `1px solid ${mt.border}`, paddingBottom: '8px' }}>Edit Event</div>

            <div>
              <div style={{ fontSize: '11px', color: mt.subtext, marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setEditing(p => ({ ...p, category: cat.id }))} title={cat.label} style={{
                    width: '22px', height: '22px', borderRadius: '50%', background: cat.color,
                    border: editing.category === cat.id ? `2px solid ${mt.text}` : '2px solid transparent',
                    cursor: 'pointer', padding: 0,
                  }} />
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: mt.subtext, marginBottom: '4px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</div>
              <input ref={editInputRef} value={editing.text}
                onChange={e => setEditing(p => ({ ...p, text: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(null); }}
                style={inputStyle(mt, { width: '100%', boxSizing: 'border-box' })} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: mt.subtext, marginBottom: '4px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</div>
                <input type="time" value={editing.time} onChange={e => setEditing(p => ({ ...p, time: e.target.value }))} style={inputStyle(mt, { width: '100%', boxSizing: 'border-box' })} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: mt.subtext, marginBottom: '4px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</div>
                <input type="date" value={editing.date} onChange={e => setEditing(p => ({ ...p, date: e.target.value }))} style={inputStyle(mt, { width: '100%', boxSizing: 'border-box' })} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: mt.subtext, marginBottom: '4px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Repeat</div>
              <select value={editing.repeat} onChange={e => setEditing(p => ({ ...p, repeat: e.target.value }))} style={inputStyle(mt, { width: '100%', boxSizing: 'border-box' })}>
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <input type="checkbox" id="lcm-reminder" checked={!!editing.reminder}
                onChange={e => {
                  if (e.target.checked && typeof Notification !== 'undefined' && Notification.permission === 'default') Notification.requestPermission();
                  setEditing(p => ({ ...p, reminder: e.target.checked, reminderMinutes: p.reminderMinutes || 10 }));
                }}
                style={{ cursor: 'pointer', width: '15px', height: '15px' }} />
              <label htmlFor="lcm-reminder" style={{ fontSize: '13px', color: mt.text, cursor: 'pointer', userSelect: 'none' }}>🔔 Remind me</label>
              {editing.reminder && (
                <>
                  <input type="number" min="1" max="60" value={editing.reminderMinutes || 10}
                    onChange={e => setEditing(p => ({ ...p, reminderMinutes: Number(e.target.value) }))}
                    style={inputStyle(mt, { width: '50px', padding: '3px 8px', fontSize: '12px', textAlign: 'center' })} />
                  <span style={{ fontSize: '12px', color: mt.subtext }}>min before</span>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button onClick={saveEdit} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: mt.accent, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px', fontFamily: FONT }}>Save</button>
              <button onClick={deleteEdit} style={{ padding: '8px 14px', borderRadius: '8px', background: '#ff4d4d', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px', fontFamily: FONT }}>Delete</button>
              <button onClick={() => setEditing(null)} style={{ padding: '8px 14px', borderRadius: '8px', background: 'transparent', color: mt.subtext, border: `1px solid ${mt.border}`, cursor: 'pointer', fontSize: '13px', fontFamily: FONT }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Cal sync prompt */}
      {calSyncPrompt && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9650,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', fontFamily: FONT,
        }} onClick={e => e.stopPropagation()}>
          <div style={{
            background: mt.bg, border: `2px solid ${mt.border}`, borderRadius: '16px',
            padding: '20px', maxWidth: '360px', width: '90vw',
            display: 'flex', flexDirection: 'column', gap: '12px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: mt.text }}>
              {calSyncPrompt.type === 'edit' ? '🔗 Update linked sticker?' : '🔗 Delete from linked sticker too?'}
            </div>
            <div style={{ fontSize: '13px', color: mt.subtext }}>
              {calSyncPrompt.type === 'edit'
                ? `Update the linked ${calSyncPrompt.link.stickerType === 'note' ? 'sticky note' : 'todo item'} to match?`
                : `This event is linked to a ${calSyncPrompt.link.stickerType === 'note' ? 'sticky note' : 'todo list'}. Remove it from there too?`}
            </div>
            {calSyncPrompt.type === 'delete' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: mt.subtext, cursor: 'pointer' }}>
                <input type="checkbox" id="cal-delete-remember" style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                  onChange={e => { e.target.closest('label').dataset.remember = e.target.checked ? 'true' : 'false'; }} />
                Remember my choice
              </label>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => {
                const remember = document.getElementById('cal-delete-remember')?.closest('label')?.dataset.remember === 'true';
                if (calSyncPrompt.type === 'edit') {
                  onSyncToSticker?.(calSyncPrompt.link, calSyncPrompt.newText, calSyncPrompt.newDateKey, false);
                  onUpdateLink?.(calSyncPrompt.link.linkId, { eventText: calSyncPrompt.newText, dateKey: calSyncPrompt.newDateKey });
                } else {
                  onSyncToSticker?.(calSyncPrompt.link, null, null, true);
                  onRemoveLink?.(calSyncPrompt.link.linkId);
                  if (remember) { localStorage.setItem('cozydesk_cal_delete_sync', 'yes'); setCalDeleteSync('yes'); }
                }
                setCalSyncPrompt(null);
              }} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: mt.accent, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700', fontFamily: FONT }}>
                Yes
              </button>
              <button onClick={() => {
                const remember = document.getElementById('cal-delete-remember')?.closest('label')?.dataset.remember === 'true';
                if (calSyncPrompt.type === 'edit') {
                  onUpdateLink?.(calSyncPrompt.link.linkId, { eventText: calSyncPrompt.newText, dateKey: calSyncPrompt.newDateKey });
                } else {
                  onRemoveLink?.(calSyncPrompt.link.linkId);
                  if (remember) { localStorage.setItem('cozydesk_cal_delete_sync', 'no'); setCalDeleteSync('no'); }
                }
                setCalSyncPrompt(null);
              }} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'transparent', color: mt.subtext, border: `1px solid ${mt.border}`, cursor: 'pointer', fontFamily: FONT }}>
                No, keep separate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
