import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import LofiMiniCalendar, { LOFI_CAL_BASE_W, LOFI_CAL_BASE_H } from './LofiMiniCalendar';

// Fixed preset sizes maintaining the lofi calendar aspect ratio (260×300)
export const LOFI_CAL_PRESETS = {
  xs:  { w: 140, h: Math.round(140 * LOFI_CAL_BASE_H / LOFI_CAL_BASE_W) },   // 140×162
  sm:  { w: 200, h: Math.round(200 * LOFI_CAL_BASE_H / LOFI_CAL_BASE_W) },   // 200×231
  md:  { w: LOFI_CAL_BASE_W, h: LOFI_CAL_BASE_H },                            // 260×300
  lg:  { w: 320, h: Math.round(320 * LOFI_CAL_BASE_H / LOFI_CAL_BASE_W) },   // 320×369
  xl:  { w: 400, h: Math.round(400 * LOFI_CAL_BASE_H / LOFI_CAL_BASE_W) },   // 400×462
};
const PRESET_LABELS = { xs: 'XS', sm: 'S', md: 'M', lg: 'L', xl: 'XL' };

export default function LofiCalendarSticker({
  x, y, sizePreset = 'md', isSelected, onSelect, onUpdate, onDelete, onChangeSize,
  events, onAddEvent, onRemoveEvent, layer, onContextMenu,
}) {
  const nodeRef = useRef(null);
  const preset = LOFI_CAL_PRESETS[sizePreset] || LOFI_CAL_PRESETS.md;
  const scale = preset.w / LOFI_CAL_BASE_W;

  const handleDrag = (e, data) => {
    onUpdate({ x: data.x, y: data.y });
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x, y }}
      onDrag={handleDrag}
      onStart={onSelect}
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
          filter: isSelected ? 'drop-shadow(0 0 12px rgba(124,115,192,0.8))' : 'none',
        }}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
      >
        <div style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: LOFI_CAL_BASE_W,
          height: LOFI_CAL_BASE_H,
        }}>
          <LofiMiniCalendar
            events={events}
            onAddEvent={onAddEvent}
            onRemoveEvent={onRemoveEvent}
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
                    background: sizePreset === key ? '#7c73c0' : '#fff',
                    color: sizePreset === key ? '#fff' : '#4d3fa0',
                    border: '1px solid #7c73c0', borderRadius: '6px',
                    cursor: 'pointer', lineHeight: 1.4,
                  }}
                >{label}</button>
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#ff4d4d',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                zIndex: 110,
              }}
            >
              ✕
            </button>
          </>
        )}
      </div>
    </Draggable>
  );
}
