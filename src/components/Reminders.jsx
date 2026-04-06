import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { useTheme } from '../themes/ThemeContext';
import todolistBg from '../assets/stickynotes/todolist1.png';
import './Reminders.css';

const FONT_OPTIONS = [
  { label: 'Patrick Hand', value: "'Patrick Hand', cursive" },
  { label: 'Fredoka', value: "'Fredoka', cursive" },
  { label: 'Arial', value: "Arial" },
  { label: 'Courier New', value: "Courier New" },
  { label: 'Georgia', value: "Georgia" },
  { label: 'Comic Sans MS', value: "Comic Sans MS" },
];

const handleDot = {
  position: 'absolute',
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.85)',
  border: '1.5px solid #bbb',
  boxSizing: 'border-box',
  transition: 'box-shadow 0.15s, background 0.15s',
  zIndex: 20,
};

export default function Reminders({
  x, y, width, height,
  reminders,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
  onEditReminder,
  isSelected,
  onSelect,
  onUpdate,
  onClose,
  layer,
  onContextMenu,
}) {
  const { themeName } = useTheme();

  const [inputText, setInputText] = useState('');
  const [inputFont, setInputFont] = useState(FONT_OPTIONS[0].value);
  const [fontSizeRatio, setFontSizeRatio] = useState(0.055);
  const [alarmedIds, setAlarmedIds] = useState(new Set());
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [editingDetailsId, setEditingDetailsId] = useState(null);

  const [detailDate, setDetailDate] = useState('');
  const [detailTime, setDetailTime] = useState('');
  const [detailAlarm, setDetailAlarm] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const nowDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const ids = new Set();
      reminders.forEach(r => {
        if (r.hasAlarm && !r.done && r.date === nowDate && r.time === nowTime) {
          ids.add(r.id);
        }
      });
      setAlarmedIds(ids);
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, [reminders]);

  const handleAdd = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onAddReminder({
      id: Date.now(),
      text: trimmed,
      done: false,
      date: '',
      time: '',
      hasAlarm: false,
    });
    setInputText('');
  };

  const openDetails = (rem) => {
    if (editingDetailsId === rem.id) {
      setEditingDetailsId(null);
    } else {
      setEditingDetailsId(rem.id);
      setDetailDate(rem.date || '');
      setDetailTime(rem.time || '');
      setDetailAlarm(rem.hasAlarm || false);
    }
  };

  const saveDetails = (id) => {
    onEditReminder(id, {
      date: detailDate,
      time: detailTime,
      hasAlarm: detailAlarm
    });
    setEditingDetailsId(null);
  };

  return (
    <Rnd
      size={{ width, height }}
      position={{ x, y }}
      bounds="parent"
      cancel=".nodrag"
      enableResizing={isSelected ? {
        top: false, right: false, bottom: false, left: false,
        topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
      } : false}
      resizeHandleClasses={{
        topLeft: 'sticker-corner-handle nwse',
        topRight: 'sticker-corner-handle nesw',
        bottomLeft: 'sticker-corner-handle nesw',
        bottomRight: 'sticker-corner-handle nwse',
      }}
      minWidth={150}
      minHeight={150}
      maxWidth={typeof window !== 'undefined' ? window.innerWidth * 0.7 : 900}
      maxHeight={typeof window !== 'undefined' ? window.innerHeight * 0.7 : 700}
      style={{ zIndex: layer != null ? layer : (isSelected ? 10 : 5), border: 'none', boxShadow: 'none' }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragStart={() => onSelect()}
      onDragStop={(e, d) => onUpdate({ x: d.x, y: d.y, width, height })}
      className={isHovered ? 'hover-glow' : ''}
      onResizeStop={(e, dir, ref, delta, pos) =>
        onUpdate({ x: pos.x, y: pos.y, width: ref.offsetWidth, height: ref.offsetHeight })
      }
    >
      <div onContextMenu={onContextMenu} style={{ width: '100%', height: '100%', position: 'relative', transform: `rotate(${rotation}deg)` }}>
        <div
          className="rw-notebook"
          data-theme={themeName}
          style={{ 
            '--rw-bg-img': `url(${todolistBg})`, 
            '--rw-w': `${width}px`,
            filter: isHovered ? "drop-shadow(0 4px 16px rgba(0,0,0,0.3)) brightness(1.05)" : "drop-shadow(0 4px 12px rgba(0,0,0,0.2))",
            transition: "filter 0.3s ease"
          }}
        >
          <div className="rw-header" />

          <div className="rw-content">
            <div className="rw-task-list">
              {reminders.map((rem) => (
                <div key={rem.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className={`rw-task-item ${rem.done ? 'rw-task-item-done' : ''}`}>
                    {/* Alarm state indicator */}
                    {rem.hasAlarm && !rem.done && (
                      <span className={alarmedIds.has(rem.id) ? "rw-alarm-light" : ""} style={{ fontSize: '0.6em', marginRight: '2px' }}>
                        {alarmedIds.has(rem.id) ? "" : "🔔"}
                      </span>
                    )}

                    <div
                      className={`rw-checkbox ${rem.done ? 'rw-checkbox-checked' : ''}`}
                      onClick={() => onToggleReminder(rem.id)}
                    >
                      {rem.done && '✓'}
                    </div>

                    <div className="rw-task-content" style={{ flex: 1, minWidth: 0 }}>
                      <span
                        className={`rw-task-text ${rem.done ? 'rw-task-text-done' : ''}`}
                        style={{
                          fontFamily: inputFont,
                          fontSize: `${Math.max(10, Math.min(24, width * fontSizeRatio))}px`,
                        }}
                      >
                        {rem.text}
                      </span>
                      {!rem.done && (rem.date || rem.time) && (
                        <div style={{ fontSize: '0.6em', color: 'var(--rw-subtext)', opacity: 0.8 }}>
                          {rem.date && rem.date.split('-').slice(1).join('/')} {rem.time}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button
                        className="nodrag"
                        onClick={(e) => { e.stopPropagation(); openDetails(rem); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8em', opacity: 0.6 }}
                        title="Set date/alarm"
                      >⏰</button>
                      <button
                        className="rw-task-delete"
                        onClick={() => onDeleteReminder(rem.id)}
                        title="Remove"
                      >✕</button>
                    </div>
                  </div>

                  {editingDetailsId === rem.id && (
                    <div className="nodrag" style={{ 
                      background: 'rgba(255,255,255,0.7)', 
                      padding: '4px 8px', 
                      borderRadius: '8px', 
                      marginTop: '2px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      fontSize: '0.7em',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }} onPointerDownCapture={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input type="date" value={detailDate} onChange={e => setDetailDate(e.target.value)} style={{ padding: '2px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }} />
                        <input type="time" value={detailTime} onChange={e => setDetailTime(e.target.value)} style={{ padding: '2px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={detailAlarm} onChange={e => setDetailAlarm(e.target.checked)} /> 🔔 Alarm
                        </label>
                        <button onClick={() => saveDetails(rem.id)} style={{ background: '#ffdca8', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 4px",
                marginTop: "2px",
              }}>
                <div style={{
                  width: "15px", height: "15px",
                  borderRadius: "4px",
                  border: "1.5px dashed #c8a97e",
                  flexShrink: 0,
                  opacity: 0.5,
                }} />
                <input
                  ref={inputRef}
                  className="paper-item-input"
                  placeholder="Add item & press Enter…"
                  style={{ 
                    fontSize: `${Math.max(12, Math.min(24, width * fontSizeRatio))}px`, 
                    fontFamily: inputFont,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    flex: 1
                  }}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  onPointerDownCapture={e => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        </div>

        {isSelected && (
          <>
            <button
              className="delete-btn"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              style={{ position: 'absolute', top: '4px', right: '4px' }}
            >
              ✕
            </button>

            <div
              className="rotate-handle nodrag"
              style={{
                ...handleDot,
                width: '14px', height: '14px',
                top: '-24px', left: '50%',
                transform: 'translateX(-50%)',
                cursor: 'grab',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '9px',
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const rect = e.currentTarget.parentElement.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
                const startRot = rotation;
                const onMove = (ev) => {
                  const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI);
                  setRotation(startRot + (angle - startAngle));
                };
                const onUpToken = () => {
                  window.removeEventListener('pointermove', onMove);
                  window.removeEventListener('pointerup', onUpToken);
                  window.removeEventListener('pointercancel', onUpToken);
                };
                window.addEventListener('pointermove', onMove);
                window.addEventListener('pointerup', onUpToken);
                window.addEventListener('pointercancel', onUpToken);
              }}
            >↻</div>

            <div className="nodrag" style={{
              position: "absolute",
              top: "105%",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.9)",
              padding: "5px 10px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              zIndex: 30,
              width: "180px",
              cursor: "default"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "#333", background: "#f9f9f9", padding: "4px", borderRadius: "6px" }}>
                <span>Size</span>
                <input type="range" min="0.04" max="0.1" step="0.005" value={fontSizeRatio} onChange={(e) => setFontSizeRatio(Number(e.target.value))} style={{ width: "60px", cursor: "pointer" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "#333", background: "#f9f9f9", padding: "4px", borderRadius: "6px" }}>
                <span>Font</span>
                <select value={inputFont} onChange={(e) => setInputFont(e.target.value)} style={{ width: "90px", border: "1px solid #ccc", borderRadius: "4px", padding: "2px", cursor: "pointer" }}>
                  {FONT_OPTIONS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </Rnd>
  );
}
