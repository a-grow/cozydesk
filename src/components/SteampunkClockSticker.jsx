import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import clockImg from "../themes/steampunk/stickers/steampunkclock.png";

// steampunkclock.png is 750×982 (portrait).
// Tube X centers pixel-verified from neck scans; Y shifted down to sit inside tubes.
const TUBES = [
  { cx: "25%", cy: "37%" },   // H tens
  { cx: "40%", cy: "37%" },   // H units
  { cx: "58%", cy: "37%" },   // M tens
  { cx: "75%", cy: "37%" },   // M units
];

// Aspect ratio: 982 / 750 ≈ 1.309 (portrait)
const ASPECT = 982 / 750;

export const STEAMPUNK_CLOCK_PRESETS = {
  xs: { w: 150, h: Math.round(150 * ASPECT) },
  sm: { w: 220, h: Math.round(220 * ASPECT) },
  md: { w: 300, h: Math.round(300 * ASPECT) },
  lg: { w: 400, h: Math.round(400 * ASPECT) },
  xl: { w: 520, h: Math.round(520 * ASPECT) },
};
const PRESET_LABELS = { xs: "XS", sm: "S", md: "M", lg: "L", xl: "XL" };

export default function SteampunkClockSticker({
  x, y, sizePreset = "md",
  isSelected, onSelect, onUpdate, onDelete, onChangeSize,
  layer, onContextMenu,
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const preset = STEAMPUNK_CLOCK_PRESETS[sizePreset] || STEAMPUNK_CLOCK_PRESETS.md;
  const effW = preset.w;
  const effH = preset.h;
  const zIndex = layer != null ? layer : 5;

  let hours = time.getHours();
  hours = hours % 12 || 12;
  const hStr = String(hours).padStart(2, "0");
  const mStr = String(time.getMinutes()).padStart(2, "0");
  const digits = [hStr[0], hStr[1], mStr[0], mStr[1]];
  // Each tube is ~16% of widget width; 0.11 fills it comfortably
  const digitFont = Math.max(12, Math.floor(effW * 0.11));

  const glowStyle = {
    fontFamily: "'Share Tech Mono', monospace",
    fontWeight: 400,
    color: "#FF6600",
    textShadow:
      "0 0 7px rgba(255,102,0,0.95), 0 0 16px rgba(255,102,0,0.65), 0 0 32px rgba(255,140,0,0.35)",
    lineHeight: 1,
    WebkitFontSmoothing: "none",
    MozOsxFontSmoothing: "none",
  };

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

        {/* Steampunk clock PNG */}
        <img
          src={clockImg}
          alt="Steampunk Clock"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none",
            filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.5))",
          }}
        />

        {/* One digit per glass tube, perfectly centered */}
        {digits.map((digit, i) => (
          <span
            key={i}
            style={{
              ...glowStyle,
              position: "absolute",
              left: TUBES[i].cx,
              top: TUBES[i].cy,
              transform: "translate(-50%, -50%)",
              fontSize: `${digitFont}px`,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {digit}
          </span>
        ))}

        {/* Size controls + delete when selected */}
        {isSelected && (
          <>
            <div style={{
              position: "absolute", top: "-26px", left: "50%",
              transform: "translateX(-50%)", display: "flex", gap: "4px", zIndex: 30,
            }}>
              {Object.entries(PRESET_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={(e) => { e.stopPropagation(); onChangeSize(key); }}
                  style={{
                    padding: "2px 8px", fontSize: "11px", fontWeight: 600,
                    background: sizePreset === key ? "#b87333" : "#fff",
                    color: sizePreset === key ? "#fff" : "#7a4a1e",
                    border: "1px solid #b87333", borderRadius: "6px",
                    cursor: "pointer", lineHeight: 1.4,
                  }}
                >{label}</button>
              ))}
            </div>
            <button
              className="delete-btn"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{ top: "4px", right: "4px" }}
            >✕</button>
          </>
        )}
      </div>
    </Rnd>
  );
}
