import React, { useState, useRef, useEffect } from 'react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const EVENT_ICONS = ['●', '⭐', '🌸', '📌', '🎉'];

export default function MiniCalendar({
  events = {},
  onAddEvent,
  onRemoveEvent,
  noPopup = false,
  onDayClick,
  calendarTheme,
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [popupText, setPopupText] = useState('');
  const [popupIcon, setPopupIcon] = useState('●');
  const popupRef = useRef(null);

  const baseW = calendarTheme?.baseW || 260;
  const baseH = calendarTheme?.baseH || 260;
  const contentArea = calendarTheme?.contentArea || { top: '46px', left: '36px', right: '36px', bottom: '52px' };
  const font = calendarTheme?.font || "'Nunito', sans-serif";
  const colors = calendarTheme?.colors || {
    accent: '#8b5e3c', text: '#4b3b2a', today: '#d4a373',
    selectedBg: 'rgba(200,169,126,0.2)', dayLabel: '#b5977a',
    navBtn: '#8b5e3c', popupBg: 'white', popupBorder: '#e0d4c8',
    popupText: '#4b3b2a', addBtn: '#d4a373', contentBg: 'white',
  };
  const image = calendarTheme?.image;

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
      width: `${baseW}px`,
      height: `${baseH}px`,
      position: 'relative',
      fontFamily: font,
    }}>
      {image && (
        <img src={image} alt="Calendar Frame" style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          pointerEvents: 'none',
          zIndex: 2,
        }} />
      )}

      <div style={{
        position: 'absolute',
        top: contentArea.top,
        left: contentArea.left,
        right: contentArea.right,
        bottom: contentArea.bottom,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 2px',
        zIndex: 5,
        overflow: 'hidden',
        background: colors.contentBg || 'transparent',
        borderRadius: '4px',
      }}>
        <div className="cal-header" style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '0px', flexShrink: 0,
        }}>
          <button className="cal-nav" onClick={prevMonth} style={{
            background: 'transparent', border: 'none', padding: '0 4px',
            fontSize: '20px', cursor: 'pointer', color: colors.navBtn, lineHeight: 1,
          }}>‹</button>
          <span className="cal-month-label" style={{
            fontSize: '13px', fontWeight: 'bold', color: colors.accent,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>{monthName} {year}</span>
          <button className="cal-nav" onClick={nextMonth} style={{
            background: 'transparent', border: 'none', padding: '0 4px',
            fontSize: '20px', cursor: 'pointer', color: colors.navBtn, lineHeight: 1,
          }}>›</button>
        </div>

        <div className="cal-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0px', alignContent: 'start',
          gridAutoRows: '13px',
        }}>
          {DAYS.map(d => (
            <div key={d} className="cal-day-label" style={{
              fontSize: '7px', textAlign: 'center',
              color: colors.dayLabel, fontWeight: 'bold', lineHeight: '1.1',
            }}>{d}</div>
          ))}
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} className="cal-cell cal-empty" style={{ lineHeight: '1.1' }} />;
            const key = dayKey(d);
            const dayEvents = events[key] || [];
            return (
              <div
                key={d}
                className={`cal-cell ${isToday(d) ? 'cal-today' : ''} ${selectedDay === d ? 'cal-selected' : ''}`}
                onClick={() => { if (noPopup) { onDayClick?.(); } else { setSelectedDay(selectedDay === d ? null : d); } }}
                style={{
                  position: 'relative', fontSize: '9px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', borderRadius: '3px', lineHeight: '1.1',
                  background: selectedDay === d ? colors.selectedBg : 'transparent',
                }}
              >
                <span className="cal-day-num" style={{
                  color: isToday(d) ? colors.today : colors.text,
                  fontWeight: isToday(d) ? 'bold' : 'normal',
                }}>{d}</span>
                {dayEvents.length > 0 && (
                  <div className="cal-event-dots" style={{
                    position: 'absolute', bottom: '0px', display: 'flex', gap: '1px',
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

        {!noPopup && selectedDay && (
          <div ref={popupRef} className="cal-popup" style={{
            position: 'absolute', bottom: '100%',
            left: '-10px', right: '-10px',
            background: colors.popupBg,
            border: `2px solid ${colors.popupBorder}`,
            borderRadius: '14px', padding: '10px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            zIndex: 10, marginBottom: '12px',
          }}>
            <div className="cal-popup-title" style={{
              fontSize: '14px', fontWeight: 'bold', color: colors.accent,
              marginBottom: '6px', borderBottom: `1px solid ${colors.popupBorder}`,
              paddingBottom: '4px',
            }}>
              {monthName} {selectedDay}
            </div>
            <div style={{ maxHeight: '70px', overflowY: 'auto', marginBottom: '6px' }}>
              {(events[dayKey(selectedDay)] || []).map((ev, i) => (
                <div key={i} className="cal-popup-event" style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '12px', marginBottom: '3px', color: colors.popupText,
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
                      background: popupIcon === ic ? colors.selectedBg : 'transparent',
                      border: popupIcon === ic ? `1px solid ${colors.accent}` : '1px solid transparent',
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
                    border: `1px solid ${colors.popupBorder}`, borderRadius: '8px',
                    background: 'transparent', color: colors.popupText,
                    fontFamily: 'inherit',
                  }}
                  value={popupText}
                  onChange={e => setPopupText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && internalAddEvent()}
                />
                <button className="cal-popup-add-btn" onClick={internalAddEvent} style={{
                  background: colors.addBtn, color: 'white', border: 'none',
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
