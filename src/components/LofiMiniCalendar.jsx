import React, { useState, useRef, useEffect } from 'react';
import calendarBase from '../themes/lofi/widgets/loficalendarbase.png';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const EVENT_ICONS = ['●', '⭐', '🌸', '📌', '🎉'];

// Base dimensions matching the loficalendarbase.png aspect ratio (646×744 ≈ 0.868 wide/tall)
export const LOFI_CAL_BASE_W = 260;
export const LOFI_CAL_BASE_H = 300;

export default function LofiMiniCalendar({
  events = {},
  onAddEvent,
  onRemoveEvent,
  noPopup = false,
  onDayClick,
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [popupText, setPopupText] = useState('');
  const [popupIcon, setPopupIcon] = useState('●');
  const popupRef = useRef(null);

  useEffect(() => {
    if (selectedDay == null) return;
    const handleOutsideClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setSelectedDay(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [selectedDay]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleDateString('en', { month: 'short' });

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const dayKey = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const internalAddEvent = () => {
    if (!selectedDay || !popupText.trim()) return;
    const key = dayKey(selectedDay);
    onAddEvent?.(key, { text: popupText.trim(), icon: popupIcon });
    setPopupText('');
  };

  const internalRemoveEvent = (day, idx) => {
    const key = dayKey(day);
    onRemoveEvent?.(key, idx);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="cal-widget" style={{
      background: 'transparent',
      border: 'none',
      padding: 0,
      width: `${LOFI_CAL_BASE_W}px`,
      height: `${LOFI_CAL_BASE_H}px`,
      position: 'relative',
      fontFamily: "'Nunito', sans-serif",
    }}>
      {/* Calendar frame image */}
      <img src={calendarBase} alt="Lofi Calendar Frame" style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'fill',
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      {/* Calendar content — positioned over the white page area of the image.
          bottom/right are increased to keep content clear of the folded corner. */}
      <div style={{
        position: 'absolute',
        top: '114px',
        left: '22px',
        right: '28px',
        bottom: '80px',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 2px',
        zIndex: 5,
        overflow: 'hidden',
      }}>
        {/* Month navigation header */}
        <div className="cal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1px',
          flexShrink: 0,
        }}>
          <button className="cal-nav" onClick={prevMonth} style={{
            background: 'transparent', border: 'none', padding: '0 2px',
            fontSize: '16px', cursor: 'pointer', color: '#6d5fc0', lineHeight: 1,
          }}>‹</button>
          <span className="cal-month-label" style={{
            fontSize: '11px', fontWeight: 'bold', color: '#4d3fa0',
            textTransform: 'uppercase', letterSpacing: '0.03em',
          }}>{monthName} {year}</span>
          <button className="cal-nav" onClick={nextMonth} style={{
            background: 'transparent', border: 'none', padding: '0 2px',
            fontSize: '16px', cursor: 'pointer', color: '#6d5fc0', lineHeight: 1,
          }}>›</button>
        </div>

        {/* Day grid */}
        <div className="cal-grid" style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0px',
          alignContent: 'start',
          rowGap: '0px',
        }}>
          {DAYS.map(d => (
            <div key={d} className="cal-day-label" style={{
              fontSize: '8px', textAlign: 'center',
              color: '#9b8ed4', fontWeight: 'bold',
              lineHeight: '1.4',
            }}>{d}</div>
          ))}
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} className="cal-cell cal-empty" style={{ lineHeight: '1.5' }} />;
            const key = dayKey(d);
            const dayEvents = events[key] || [];
            return (
              <div
                key={d}
                className={`cal-cell ${isToday(d) ? 'cal-today' : ''} ${selectedDay === d ? 'cal-selected' : ''}`}
                onClick={() => { if (noPopup) { onDayClick?.(); } else { setSelectedDay(selectedDay === d ? null : d); } }}
                style={{
                  position: 'relative',
                  fontSize: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  lineHeight: '1.5',
                  background: selectedDay === d ? 'rgba(124,115,192,0.2)' : 'transparent',
                }}
              >
                <span className="cal-day-num" style={{
                  color: isToday(d) ? '#6d5fc0' : '#2d2060',
                  fontWeight: isToday(d) ? 'bold' : 'normal',
                }}>{d}</span>
                {dayEvents.length > 0 && (
                  <div className="cal-event-dots" style={{
                    position: 'absolute', bottom: '0px',
                    display: 'flex', gap: '1px',
                  }}>
                    {dayEvents.slice(0, 2).map((ev, j) => (
                      <span key={j} className="cal-event-dot" style={{ fontSize: '5px' }}>{ev.icon || '●'}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Day popup */}
        {!noPopup && selectedDay && (
          <div ref={popupRef} className="cal-popup" style={{
            position: 'absolute',
            bottom: '100%',
            left: '-10px',
            right: '-10px',
            background: '#1e1640',
            border: '2px solid #7c73c0',
            borderRadius: '14px',
            padding: '10px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            zIndex: 10,
            marginBottom: '12px',
          }}>
            <div className="cal-popup-title" style={{
              fontSize: '14px', fontWeight: 'bold', color: '#c5b8ff',
              marginBottom: '6px', borderBottom: '1px solid rgba(124,115,192,0.4)',
              paddingBottom: '4px',
            }}>
              {monthName} {selectedDay}
            </div>
            <div style={{ maxHeight: '70px', overflowY: 'auto', marginBottom: '6px' }}>
              {(events[dayKey(selectedDay)] || []).map((ev, i) => (
                <div key={i} className="cal-popup-event" style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '12px', marginBottom: '3px', color: '#e8e0ff',
                }}>
                  <span>{ev.icon} {ev.text}</span>
                  <button className="cal-popup-remove" onClick={() => internalRemoveEvent(selectedDay, i)} style={{
                    background: 'transparent', border: 'none',
                    color: '#ff8080', cursor: 'pointer', padding: '0 4px',
                  }}>✕</button>
                </div>
              ))}
            </div>
            <div className="cal-popup-add">
              <div className="cal-popup-icon-row" style={{
                display: 'flex', gap: '6px', marginBottom: '8px', justifyContent: 'center',
              }}>
                {EVENT_ICONS.map(ic => (
                  <span
                    key={ic}
                    className={`cal-icon-option ${popupIcon === ic ? 'cal-icon-active' : ''}`}
                    onClick={() => setPopupIcon(ic)}
                    style={{
                      cursor: 'pointer', padding: '3px 5px', borderRadius: '6px',
                      fontSize: '14px',
                      background: popupIcon === ic ? 'rgba(124,115,192,0.3)' : 'transparent',
                      border: popupIcon === ic ? '1px solid #a29bfe' : '1px solid transparent',
                    }}
                  >{ic}</span>
                ))}
              </div>
              <div className="cal-popup-input-row" style={{ display: 'flex', gap: '6px' }}>
                <input
                  className="cal-popup-input"
                  placeholder="Add note..."
                  style={{
                    flex: 1, fontSize: '12px', padding: '5px 8px',
                    border: '1px solid #7c73c0', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)', color: '#e8e0ff',
                    fontFamily: 'inherit',
                  }}
                  value={popupText}
                  onChange={e => setPopupText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && internalAddEvent()}
                />
                <button className="cal-popup-add-btn" onClick={internalAddEvent} style={{
                  background: '#7c73c0', color: 'white', border: 'none',
                  borderRadius: '8px', padding: '0 10px',
                  cursor: 'pointer', fontWeight: 'bold',
                }}>+</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
