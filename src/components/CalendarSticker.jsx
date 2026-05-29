import React, { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import MiniCalendar from './sidebar/MiniCalendar';
import LargeCalendarModal from './LargeCalendarModal';
import { useTheme } from '../themes/ThemeContext';

const PRESET_LABELS = { xs: 'XS', sm: 'S', md: 'M', lg: 'L', xl: 'XL' };

export default function CalendarSticker({
  x, y, sizePreset = 'md', isSelected, onSelect, onUpdate, onDelete, onChangeSize,
  events, onAddEvent, onRemoveEvent, layer, onContextMenu, snapToGrid = false,
  stickerCalendarLinks, onSyncToSticker, onUpdateLink, onRemoveLink,
}) {
  const { theme } = useTheme();

  const CAL_BASE_W = theme.calendarTheme?.baseW || 260;
  const CAL_BASE_H = theme.calendarTheme?.baseH || 260;

  const CAL_PRESETS = {
    xs:  { w: 160,  h: Math.round(160  * CAL_BASE_H / CAL_BASE_W) },
    sm:  { w: 220,  h: Math.round(220  * CAL_BASE_H / CAL_BASE_W) },
    md:  { w: 260,  h: Math.round(260  * CAL_BASE_H / CAL_BASE_W) },
    lg:  { w: 340,  h: Math.round(340  * CAL_BASE_H / CAL_BASE_W) },
    xl:  { w: 440,  h: Math.round(440  * CAL_BASE_H / CAL_BASE_W) },
  };

  const nodeRef = useRef(null);
  const preset = CAL_PRESETS[sizePreset] || CAL_PRESETS.md;
  const scale  = preset.w / CAL_BASE_W;
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowModal(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  const handleDrag = (e, data) => { onUpdate({ x: data.x, y: data.y }); };

  return (
    <>
    <Draggable
      nodeRef={nodeRef}
      position={{ x, y }}
      onDrag={handleDrag}
      onStart={onSelect}
      grid={snapToGrid ? [20, 20] : [1, 1]}
      cancel=".cal-nav, .cal-popup, .cal-cell, .cal-header, .cal-day-label, .cal-icon-option, .cal-popup-remove, .cal-popup-add-btn, input, button"
    >
      <div
        ref={nodeRef}
        onContextMenu={onContextMenu}
        style={{
          position: 'absolute',
          width: preset.w,
          height: preset.h,
          zIndex: layer != null ? layer : 50,
          cursor: 'grab',
          filter: isSelected ? 'drop-shadow(0 0 12px var(--sb-accent))' : 'none',
        }}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onDoubleClick={(e) => { e.stopPropagation(); setShowModal(true); }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: CAL_BASE_W, height: CAL_BASE_H }}>
          <MiniCalendar
            events={events}
            onAddEvent={onAddEvent}
            onRemoveEvent={onRemoveEvent}
            noPopup={true}
            onDayClick={() => { onSelect(); setShowModal(true); }}
            calendarTheme={theme.calendarTheme}
          />
        </div>

        {isSelected && (
          <>
            <div style={{
              position: 'absolute', top: '-26px', left: '50%',
              transform: 'translateX(-50%)', display: 'flex', gap: '4px', zIndex: 110,
            }}>
              {Object.entries(PRESET_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={(e) => { e.stopPropagation(); onChangeSize(key); }}
                  style={{
                    padding: '2px 8px', fontSize: '11px', fontWeight: 600,
                    background: sizePreset === key ? theme.calendarTheme?.sizeButtons?.active?.bg || '#d4a373' : theme.calendarTheme?.sizeButtons?.inactive?.bg || '#fff',
                    color: sizePreset === key ? theme.calendarTheme?.sizeButtons?.active?.color || '#fff' : theme.calendarTheme?.sizeButtons?.inactive?.color || '#8b5e3c',
                    border: `1px solid ${theme.calendarTheme?.sizeButtons?.active?.border || '#d4a373'}`, borderRadius: '6px',
                    cursor: 'pointer', lineHeight: 1.4,
                  }}
                >{label}</button>
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{
                position: 'absolute', top: '-8px', right: '-8px',
                width: '24px', height: '24px', borderRadius: '50%',
                background: '#ff4d4d', color: 'white', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 110,
              }}
            >✕</button>
          </>
        )}
      </div>
    </Draggable>

    {showModal && (
      <LargeCalendarModal
        events={events}
        onAddEvent={onAddEvent}
        onRemoveEvent={onRemoveEvent}
        onClose={() => setShowModal(false)}
        stickerCalendarLinks={stickerCalendarLinks}
        onSyncToSticker={onSyncToSticker}
        onUpdateLink={onUpdateLink}
        onRemoveLink={onRemoveLink}
      />
    )}
    </>
  );
}