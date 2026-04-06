import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import clockImg from "../themes/cozykawaii/stickers/cozyclock.png";

// Screen area overlay coordinates relative to the actual image (946×496).
// Mapped from the previous square-container percentages to image-relative ones:
//   left/right: unchanged (image filled container width)
//   top/bottom: converted from square → image via objectFit:contain offset math
const SCREEN = {
  left:   "20%",
  right:  "20.2%",
  top:    "22.5%",
  bottom: "6.7%",
};

// Aspect ratio of cozyclock.png (946 × 496 → 1.907 : 1)
const ASPECT = 496 / 946;

// Fixed preset sizes (px) — landscape, matching the clock image aspect ratio
export const CLOCK_PRESETS = {
  xs:  { w: 190, h: Math.round(190 * ASPECT) },   // 190 × 100
  sm:  { w: 280, h: Math.round(280 * ASPECT) },   // 280 × 147
  md:  { w: 380, h: Math.round(380 * ASPECT) },   // 380 × 199
  lg:  { w: 500, h: Math.round(500 * ASPECT) },   // 500 × 262
  xl:  { w: 640, h: Math.round(640 * ASPECT) },   // 640 × 336
};
const PRESET_LABELS = { xs: 'XS', sm: 'S', md: 'M', lg: 'L', xl: 'XL' };


export default function ClockSticker({
  x, y, sizePreset = 'md',
  isSelected, onSelect, onUpdate, onDelete, onChangeSize,
  layer, onContextMenu,
}) {
  const [time, setTime] = useState(new Date());

  // ── Live clock ──────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const preset = CLOCK_PRESETS[sizePreset] || CLOCK_PRESETS.md;
  const effW = preset.w;
  const effH = preset.h;
  const zIndex = layer != null ? layer : 5;

  // Scale font to fit the screen area inside the clock face
  const screenWidth  = effW * 0.598;          // 20% → 79.8%
  const screenHeight = effH * 0.708;          // 22.5% → 93.3%
  const timeFontFromW = Math.floor(screenWidth  * 0.88 / 5.2);
  const timeFontFromH = Math.floor(screenHeight * 0.88 / 1.7);
  const timeFontSize   = Math.max(12, Math.min(timeFontFromW, timeFontFromH));
  const detailFontSize = Math.max(9, Math.floor(timeFontSize * 0.55));

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

        {/* Clock PNG background */}
        <img
          src={clockImg}
          alt="Cozy Clock"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none",
            filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.22))",
          }}
        />

        {/* Crisp LED-style live clock overlay, positioned to match clock face screen area */}
        <div
          style={{
            position: "absolute",
            top: SCREEN.top,
            left: SCREEN.left,
            right: SCREEN.right,
            bottom: SCREEN.bottom,
            padding: "4%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            color: "#ff3b3b",
            fontFamily: "monospace",
            WebkitFontSmoothing: "none",
            MozOsxFontSmoothing: "none",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <p style={{
            fontSize: `${timeFontSize}px`,
            margin: 0,
            fontWeight: 700,
            letterSpacing: "0.08em",
            lineHeight: 1.05,
            whiteSpace: "nowrap",
          }}>
            {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </p>
          <p style={{
            fontSize: `${detailFontSize}px`,
            margin: 0,
            fontWeight: 600,
            opacity: 0.95,
            lineHeight: 1.1,
            whiteSpace: "nowrap",
          }}>
            {time.toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
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
                    background: sizePreset === key ? '#d4a373' : '#fff',
                    color: sizePreset === key ? '#fff' : '#8b5e3c',
                    border: '1px solid #d4a373', borderRadius: '6px',
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
