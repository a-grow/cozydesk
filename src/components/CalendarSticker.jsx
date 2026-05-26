import React, { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import MiniCalendar from './sidebar/MiniCalendar';
import LargeCalendarModal from './LargeCalendarModal';

const CAL_BASE = 260;

export const CAL_PRESETS = {
  xs:  { w: 160, h: 160 },
  sm:  { w: 220, h: 220 },
  md:  { w: 260, h: 260 },
  lg:  { w: 340, h: 340 },
  xl:  { w: 440, h: 440 },
};
const PRESET_LABELS = { xs: 'XS', sm: 'S', md: 'M', lg: 'L', xl: 'XL' };

export default function CalendarSticker({
  x, y, sizePreset = 'md', isSelected, onSelect, onUpdate, onDelete, onChangeSize,
  events, onAddEvent, onRemoveEvent, layer, onContextMenu, snapToGrid = false,
  stickerCalendarLinks, onSyncToSticker, onUpdateLink, onRemoveLink,
}) {
  const nodeRef = useRef(null);
  const preset = CAL_PRESETS[sizePreset] || CAL_PRESETS.md;
  const scale  = preset.w / CAL_BASE;
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
          zIndex: layer != null ? layer : 50,
          cursor: 'grab',
          filter: isSelected ? 'drop-shadow(0 0 12px var(--sb-accent))' : 'none',
        }}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onDoubleClick={(e) => { e.stopPropagation(); setShowModal(true); }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: CAL_BASE, height: CAL_BASE }}>
          <MiniCalendar
            events={events}
            onAddEvent={onAddEvent}
            onRemoveEvent={onRemoveEvent}
            noPopup={true}
            onDayClick={() => { onSelect(); setShowModal(true); }}
          />
        </div>

        {isSelected && (
          <>
            <div style={{
              position: 'absolute', top: '-32px', left: '50%',
              transform: 'translateX(-50%)', display: 'flex', gap: '4px', zIndex: 110,
            }}>
              {Object.entries(PRESET_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={(e) => { e.stopPropagation(); onChangeSize(key); }}
                  style={{
                    padding: '2px 8px', fontSize: '11px', fontWeight: 600,
                    background: sizePreset === key ? '#d4a373' : '#fff',
                    color: sizePreset === key ? '#fff' : '#8b5e3c',
                    border: '1px solid #d4a373', borderRadius: '6px',
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