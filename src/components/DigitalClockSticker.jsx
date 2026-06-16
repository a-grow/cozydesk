import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";

const PRESET_LABELS = { xs: 'XS', sm: 'S', md: 'M', lg: 'L', xl: 'XL' };

export default function DigitalClockSticker({
  x, y, sizePreset = 'md',
  flipped = false, onFlip,
  isSelected, onSelect, onUpdate, onDelete, onChangeSize,
  layer, onContextMenu,
  clockTheme = {},
  showFlip = true,
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const {
    image,
    aspect = 1,
    screen = { left: '10%', right: '10%', top: '15%', bottom: '32%' },
    numberColor = '#f6b73c',
    numberFont = "'Nunito', sans-serif",
    activeBtn = { bg: '#f6b73c', color: '#fff', border: '#f6b73c' },
    inactiveBtn = { bg: '#fff', color: '#3a3a5e', border: '#f6b73c' },
  } = clockTheme;

  const PRESETS = {
    xs:  { w: 190, h: Math.round(190 * aspect) },
    sm:  { w: 280, h: Math.round(280 * aspect) },
    md:  { w: 380, h: Math.round(380 * aspect) },
    lg:  { w: 500, h: Math.round(500 * aspect) },
    xl:  { w: 640, h: Math.round(640 * aspect) },
  };

  const preset = PRESETS[sizePreset] || PRESETS.md;
  const { w: effW, h: effH } = preset;
  const zIndex = layer != null ? layer : 5;

  const screenW = effW * (1 - parseFloat(screen.left) / 100 - parseFloat(screen.right) / 100);
  const screenH = effH * (1 - parseFloat(screen.top) / 100 - parseFloat(screen.bottom) / 100);
  const timeFontFromW = Math.floor(screenW * 0.88 / 5.2);
  const timeFontFromH = Math.floor(screenH * 0.88 / 1.7);
  const timeFontSize  = Math.max(12, Math.min(timeFontFromW, timeFontFromH));
  const detailFontSize = Math.max(9, Math.floor(timeFontSize * 0.55));

  return (
    <Rnd
      size={{ width: effW, height: effH }}
      position={{ x, y }}
      enableResizing={false}
      style={{ zIndex, border: 'none', boxShadow: 'none' }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onDragStart={() => onSelect()}
      onDragStop={(e, d) => onUpdate({ x: d.x, y: d.y })}
    >
      <div onContextMenu={onContextMenu} style={{ width: '100%', height: '100%', position: 'relative', transform: flipped ? 'scaleX(-1)' : 'none' }}>

        <img
          src={image}
          alt="Clock"
          style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.22))' }}
        />

        <div style={{
          position: 'absolute',
          top: screen.top, left: screen.left, right: screen.right, bottom: screen.bottom,
          padding: '4%', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          textAlign: 'center',
          color: numberColor,
          fontFamily: numberFont,
          WebkitFontSmoothing: 'none', MozOsxFontSmoothing: 'none',
          pointerEvents: 'none', userSelect: 'none',
          transform: flipped ? 'scaleX(-1)' : 'none',
        }}>
          <p style={{ fontSize: `${timeFontSize}px`, margin: 0, fontWeight: 700, letterSpacing: '0.08em', lineHeight: 1.05, whiteSpace: 'nowrap' }}>
            {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </p>
          <p style={{ fontSize: `${detailFontSize}px`, margin: 0, fontWeight: 600, opacity: 0.95, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
            {time.toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
          </p>
        </div>

        {isSelected && (
          <>
            <div style={{
              position: 'absolute', top: '-26px', left: '50%',
              transform: flipped ? 'translateX(-50%) scaleX(-1)' : 'translateX(-50%)',
              display: 'flex', gap: '4px', zIndex: 30,
            }}>
              {showFlip && (
                <button
                  onClick={(e) => { e.stopPropagation(); onFlip?.(); }}
                  style={{ padding: '2px 8px', fontSize: '13px', fontWeight: 600, background: flipped ? activeBtn.bg : inactiveBtn.bg, color: flipped ? activeBtn.color : inactiveBtn.color, border: `1px solid ${activeBtn.border}`, borderRadius: '6px', cursor: 'pointer', lineHeight: 1.4 }}
                >↔</button>
              )}
              {Object.entries(PRESET_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={(e) => { e.stopPropagation(); onChangeSize(key); }}
                  style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 600, background: sizePreset === key ? activeBtn.bg : inactiveBtn.bg, color: sizePreset === key ? activeBtn.color : inactiveBtn.color, border: `1px solid ${activeBtn.border}`, borderRadius: '6px', cursor: 'pointer', lineHeight: 1.4 }}
                >{label}</button>
              ))}
            </div>
            <button
              className="delete-btn"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{ top: '4px', right: flipped ? undefined : '4px', left: flipped ? '4px' : undefined }}
            >✕</button>
          </>
        )}
      </div>
    </Rnd>
  );
}
