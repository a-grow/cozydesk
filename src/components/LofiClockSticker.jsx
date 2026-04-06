import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import clockImg from "../themes/lofi/stickers/loficlock.png";

// Screen area (cyan/teal display) coordinates relative to loficlock.png (712×319).
// Estimated from the image: cyan rectangle sits in the center-left of the clock body.
const SCREEN = {
  left:   "10%",
  right:  "19%",
  top:    "18%",
  bottom: "14%",
};

// Aspect ratio of loficlock.png (712 × 319)
const ASPECT = 319 / 712;

export const LOFI_CLOCK_PRESETS = {
  xs:  { w: 190, h: Math.round(190 * ASPECT) },   // 190 × 85
  sm:  { w: 280, h: Math.round(280 * ASPECT) },   // 280 × 126
  md:  { w: 380, h: Math.round(380 * ASPECT) },   // 380 × 170
  lg:  { w: 500, h: Math.round(500 * ASPECT) },   // 500 × 224
  xl:  { w: 640, h: Math.round(640 * ASPECT) },   // 640 × 287
};
const PRESET_LABELS = { xs: 'XS', sm: 'S', md: 'M', lg: 'L', xl: 'XL' };

export default function LofiClockSticker({
  x, y, sizePreset = 'md',
  isSelected, onSelect, onUpdate, onDelete, onChangeSize,
  layer, onContextMenu,
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const preset = LOFI_CLOCK_PRESETS[sizePreset] || LOFI_CLOCK_PRESETS.md;
  const effW = preset.w;
  const effH = preset.h;
  const zIndex = layer != null ? layer : 5;

  // Screen area dimensions for font scaling
  // Screen spans left 10% → right 81% = 71% width, top 18% → bottom 86% = 68% height
  const screenWidth  = effW * 0.71;
  const screenHeight = effH * 0.68;
  // Two lines: time+ampm row, then date row — allocate ~55% height to time line
  const timeFontFromW = Math.floor(screenWidth  * 0.72 / 5.2); // "12:34" ≈ 5.2 char-widths
  const timeFontFromH = Math.floor(screenHeight * 0.50);
  const timeFontSize  = Math.max(10, Math.min(timeFontFromW, timeFontFromH));
  const ampmFontSize  = Math.max(6,  Math.floor(timeFontSize * 0.40));
  const dateFontSize  = Math.max(7,  Math.floor(timeFontSize * 0.45));

  let hours = time.getHours();
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timeStr = `${hours}:${minutes}`;
  const dateStr = time.toLocaleDateString([], { month: 'numeric', day: 'numeric' });

  return (
    <Rnd
      size={{ width: effW, height: effH }}
      position={{ x, y }}
      enableResizing={false}
      style={{ zIndex, border: "none", boxShadow: "none" }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onDragStart={() => onSelect()}
      onDragStop={(e, d) => onUpdate({ x: d.x, y: d.y })}
    >
      <div onContextMenu={onContextMenu} style={{ width: "100%", height: "100%", position: "relative" }}>

        {/* Lofi clock PNG */}
        <img
          src={clockImg}
          alt="Lofi Clock"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none",
            filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.28))",
          }}
        />

        {/* Time overlay — centered on the cyan display screen */}
        <div
          style={{
            position: "absolute",
            top: SCREEN.top,
            left: SCREEN.left,
            right: SCREEN.right,
            bottom: SCREEN.bottom,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {/* Time + AM/PM on same line */}
          <div style={{
            display: "flex",
            alignItems: "baseline",
            gap: `${Math.max(2, Math.floor(timeFontSize * 0.15))}px`,
            lineHeight: 1.0,
          }}>
            <span style={{
              fontSize: `${timeFontSize}px`,
              fontWeight: 400,
              fontFamily: "'Share Tech Mono', monospace",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
              color: "#000000",
              WebkitFontSmoothing: "none",
              MozOsxFontSmoothing: "none",
            }}>
              {timeStr}
            </span>
            <span style={{
              fontSize: `${ampmFontSize}px`,
              fontFamily: "'Share Tech Mono', monospace",
              fontWeight: 400,
              color: "#000000",
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
              WebkitFontSmoothing: "none",
              MozOsxFontSmoothing: "none",
            }}>
              {ampm}
            </span>
          </div>
          {/* Date below */}
          <p style={{
            fontSize: `${dateFontSize}px`,
            margin: `${Math.max(1, Math.floor(timeFontSize * 0.08))}px 0 0 0`,
            fontFamily: "'Share Tech Mono', monospace",
            fontWeight: 400,
            color: "#000000",
            letterSpacing: "0.06em",
            lineHeight: 1.0,
            whiteSpace: "nowrap",
            WebkitFontSmoothing: "none",
            MozOsxFontSmoothing: "none",
          }}>
            {dateStr}
          </p>
        </div>

        {/* Controls when selected */}
        {isSelected && (
          <>
            <div style={{
              position: 'absolute', top: '-26px', left: '50%',
              transform: 'translateX(-50%)', display: 'flex', gap: '4px', zIndex: 30,
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
              className="delete-btn"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{ top: "4px", right: "4px" }}
            >
              ✕
            </button>
          </>
        )}
      </div>
    </Rnd>
  );
}
