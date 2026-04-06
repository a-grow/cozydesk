import React, { useState, useRef, useEffect } from 'react';
import calendarBase from '../../assets/icons/cozycalendarbase.png';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const EVENT_ICONS = ['●', '⭐', '🌸', '📌', '🎉'];

export default function MiniCalendar({ 
  events = {}, 
  onAddEvent, 
  onRemoveEvent 
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [popupText, setPopupText] = useState('');
  const [popupIcon, setPopupIcon] = useState('●');
  const popupRef = useRef(null);

  // Close popup when clicking outside
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
      width: '260px', 
      height: '260px',
      position: 'relative',
      fontFamily: "'Patrick Hand', cursive"
    }}>
      {/* 1. THE CALENDAR FRAME IMAGE - Now using the user's baked-in background version */}
      <img src={calendarBase} alt="Calendar Frame" style={{ 
        position: 'absolute', 
        inset: 0, 
        width: '100%', 
        height: '100%', 
        objectFit: 'contain',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      {/* 2. FUNCTIONAL CALENDAR CONTENT - Positioned to fit the new frame perfectly */}
      <div style={{ 
        position: 'absolute', 
        top: '46px',
        left: '36px',
        right: '36px',
        bottom: '52px',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 6px',
        zIndex: 5
      }}>
        <div className="cal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <button className="cal-nav" onClick={prevMonth} style={{ background: 'transparent', border: 'none', padding: '0 4px', fontSize: '20px', cursor: 'pointer', color: '#8b5e3c' }}>‹</button>
          <span className="cal-month-label" style={{ fontSize: '18px', fontWeight: 'bold', color: '#8b5e3c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{monthName} {year}</span>
          <button className="cal-nav" onClick={nextMonth} style={{ background: 'transparent', border: 'none', padding: '0 4px', fontSize: '20px', cursor: 'pointer', color: '#8b5e3c' }}>›</button>
        </div>

        <div className="cal-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
          {DAYS.map(d => <div key={d} className="cal-day-label" style={{ fontSize: '11px', textAlign: 'center', color: '#b5977a', fontWeight: 'bold' }}>{d}</div>)}
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} className="cal-cell cal-empty" />;
            const key = dayKey(d);
            const dayEvents = events[key] || [];
            return (
              <div
                key={d}
                className={`cal-cell ${isToday(d) ? 'cal-today' : ''} ${selectedDay === d ? 'cal-selected' : ''}`}
                onClick={() => setSelectedDay(selectedDay === d ? null : d)}
                style={{ 
                  position: 'relative',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: '3px',
                  background: selectedDay === d ? 'rgba(200, 169, 126, 0.2)' : 'transparent'
                }}
              >
                <span className="cal-day-num" style={{ color: isToday(d) ? '#d4a373' : '#4b3b2a', fontWeight: isToday(d) ? 'bold' : 'normal' }}>{d}</span>
                {dayEvents.length > 0 && (
                  <div className="cal-event-dots" style={{ position: 'absolute', bottom: '1px', display: 'flex', gap: '1px' }}>
                    {dayEvents.slice(0, 3).map((ev, j) => (
                      <span key={j} className="cal-event-dot" style={{ fontSize: '7px' }}>{ev.icon}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedDay && (
          <div ref={popupRef} className="cal-popup" style={{ 
            position: 'absolute',
            bottom: '100%',
            left: '-10px',
            right: '-10px',
            background: 'white',
            border: '2px solid #e0d4c8',
            borderRadius: '16px',
            padding: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            zIndex: 10,
            marginBottom: '15px'
          }}>
            <div className="cal-popup-title" style={{ fontSize: '16px', fontWeight: 'bold', color: '#8b5e3c', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
              {monthName} {selectedDay}
            </div>
            <div style={{ maxHeight: '80px', overflowY: 'auto', marginBottom: '8px' }}>
              {(events[dayKey(selectedDay)] || []).map((ev, i) => (
                <div key={i} className="cal-popup-event" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span>{ev.icon} {ev.text}</span>
                  <button className="cal-popup-remove" onClick={() => internalRemoveEvent(selectedDay, i)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '0 4px' }}>✕</button>
                </div>
              ))}
            </div>
            <div className="cal-popup-add">
              <div className="cal-popup-icon-row" style={{ display: 'flex', gap: '8px', marginBottom: '10px', justifyContent: 'center' }}>
                {EVENT_ICONS.map(ic => (
                  <span
                    key={ic}
                    className={`cal-icon-option ${popupIcon === ic ? 'cal-icon-active' : ''}`}
                    onClick={() => setPopupIcon(ic)}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '4px 6px', 
                      borderRadius: '6px',
                      fontSize: '16px',
                      background: popupIcon === ic ? '#fdf2e8' : 'transparent',
                      border: popupIcon === ic ? '1px solid #c8a97e' : '1px solid transparent'
                    }}
                  >{ic}</span>
                ))}
              </div>
              <div className="cal-popup-input-row" style={{ display: 'flex', gap: '6px' }}>
                <input
                  className="cal-popup-input"
                  placeholder="Add note..."
                  style={{ 
                    flex: 1, 
                    fontSize: '12px', 
                    padding: '6px 10px', 
                    border: '1px solid #e0d4c8', 
                    borderRadius: '10px',
                    fontFamily: 'inherit'
                  }}
                  value={popupText}
                  onChange={e => setPopupText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && internalAddEvent()}
                />
                <button className="cal-popup-add-btn" onClick={internalAddEvent} style={{ background: '#d4a373', color: 'white', border: 'none', borderRadius: '10px', padding: '0 12px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
