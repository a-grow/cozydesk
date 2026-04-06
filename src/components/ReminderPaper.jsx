import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import paperImg from "../assets/stickynotes/todolist1.png";
import { useTheme } from "../themes/ThemeContext";

const ITEMS_PER_PAPER = 6;
const SPARKLE_EMOJIS = ["✨", "⭐", "🌟", "💫", "🎉"];

/* ── Handle dot base (corner resize, rotate) ── */
const handleDot = {
  position: "absolute",
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.85)",
  border: "1.5px solid #bbb",
  boxSizing: "border-box",
  transition: "box-shadow 0.15s, background 0.15s",
  zIndex: 20,
};

// Individual reminder row with cozy checkbox + sparkle animation
function ReminderRow({ rem, onToggle, width, fontSizeRatio, fontFamily, isLofi }) {
  const [showSparkle, setShowSparkle] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggle(rem.id);
    if (!rem.done) {
      setShowSparkle(true);
      setAnimKey(k => k + 1);
      setTimeout(() => setShowSparkle(false), 650);
    }
  };

  const fontSize = Math.max(12, Math.min(24, width * fontSizeRatio));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 4px",
        borderRadius: "6px",
        cursor: "pointer",
        userSelect: "none",
        minHeight: "22px",
        transition: "background 0.2s",
        position: "relative",
      }}
      onClick={handleToggle}
    >
      {/* Sparkle burst */}
      {showSparkle && (
        <span key={animKey} className="sparkle">
          {SPARKLE_EMOJIS[Math.floor(Math.random() * SPARKLE_EMOJIS.length)]}
        </span>
      )}

      {/* Cozy checkbox */}
      <div
        className={rem.done ? "checkbox-done" : ""}
        style={{
          width: "15px",
          height: "15px",
          borderRadius: "4px",
          border: isLofi ? "2px solid rgba(255,255,255,0.6)" : "2px solid #c8a97e",
          background: rem.done ? (isLofi ? "rgba(255,255,255,0.25)" : "#ffdca8") : "rgba(255,255,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "10px",
          color: "#7a5230",
          fontWeight: "bold",
          transition: "background 0.25s",
        }}
      >
        {rem.done && "✓"}
      </div>

      {/* Text */}
      <span
        style={{
          fontFamily: fontFamily,
          fontSize: `${fontSize}px`,
          color: isLofi ? (rem.done ? "rgba(255,255,255,0.5)" : "#ffffff") : (rem.done ? "#b5977a" : "#4b3b2a"),
          textDecoration: rem.done ? "line-through" : "none",
          opacity: rem.done ? 0.55 : 1,
          transition: "color 0.3s, opacity 0.3s, text-decoration 0.3s",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          flex: 1,
        }}
      >
        {rem.emoji && <span style={{ marginRight: "3px" }}>{rem.emoji}</span>}
        {rem.text}
      </span>
    </div>
  );
}

// Main Paper component
const ReminderPaper = ({
  x, y, width, height,
  reminders = [],
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onToggleReminder,
  onAddInlineReminder,
  layer,
  onContextMenu,
}) => {
  const { themeStickyNotes, themeName } = useTheme();
  const todoImg = themeStickyNotes.find(a => a.name.includes('todo'))?.src || paperImg;
  const [newText, setNewText] = useState("");
  const [rotation, setRotation] = useState(0);
  const [fontFamily, setFontFamily] = useState(themeName === 'lofi' ? "'Caveat', cursive" : "Patrick Hand");
  const [fontSizeRatio, setFontSizeRatio] = useState(0.055);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef(null);

  const handleRotate = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    const startRot = rotation;
    const onMove = (ev) => {
      const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI);
      setRotation(startRot + (angle - startAngle));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const handleAddInline = (e) => {
    if (e.key === "Enter" && newText.trim()) {
      onAddInlineReminder?.({ id: Date.now(), text: newText.trim(), emoji: "", done: false });
      setNewText("");
    }
  };

  const fontSize = Math.max(12, Math.min(24, width * fontSizeRatio));
  const remainingSlots = ITEMS_PER_PAPER - reminders.length;

  return (
    <Rnd
      size={{ width, height }}
      position={{ x, y }}
      bounds="parent"
      cancel=".nodrag"
      lockAspectRatio={true}
      enableResizing={isSelected ? {
        top: true, right: true, bottom: true, left: true,
        topRight: true, bottomRight: true, bottomLeft: true, topLeft: true
      } : false}
      resizeHandleClasses={{
        topLeft: "sticker-corner-handle nwse",
        topRight: "sticker-corner-handle nesw",
        bottomLeft: "sticker-corner-handle nesw",
        bottomRight: "sticker-corner-handle nwse",
      }}
      style={{ zIndex: layer != null ? layer : 5, border: "none", boxShadow: "none" }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragStart={onSelect}
      onDragStop={(e, d) => onUpdate({ x: d.x, y: d.y, width, height })}
      className={isHovered ? 'hover-glow' : ''}
      onResizeStop={(e, dir, ref, delta, pos) =>
        onUpdate({ x: pos.x, y: pos.y, width: ref.offsetWidth, height: ref.offsetHeight })
      }
    >
      {/* Rotation wrapper */}
      <div
        onContextMenu={onContextMenu}
        style={{
        width: "100%",
        height: "100%",
        position: "relative",
        transform: `rotate(${rotation}deg)`,
      }}>
        {/* Paper background — transparent PNG, no mesh, no borders */}
        <img
          src={todoImg}
          alt="to-do list paper"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "fill",
          pointerEvents: "none",
          filter: isHovered ? "drop-shadow(0 4px 16px rgba(0,0,0,0.3)) brightness(1.05)" : "drop-shadow(0 4px 12px rgba(0,0,0,0.2))",
          transition: "filter 0.3s ease"
        }}
      />

      {/* Transparent tape at top — kawaii only */}
      {themeName !== 'lofi' && (
        <div style={{
          position: "absolute",
          top: "-10px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "55px",
          height: "20px",
          background: "rgba(255,220,180,0.52)",
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          zIndex: 2,
        }} />
      )}

      {/* Reminders area — overlaid on the lined section of the paper */}
      <div
        style={{
          position: "absolute",
          top: themeName === 'lofi' ? "calc(46% + 20px)" : "30%",
          left: themeName === 'lofi' ? "10%" : "12%",
          right: themeName === 'lofi' ? "10%" : "6%",
          bottom: themeName === 'lofi' ? "14%" : "8%",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          zIndex: 3,
          overflow: "hidden",
        }}
        onPointerDownCapture={e => e.stopPropagation()}
      >
        {/* Existing reminder rows */}
        {reminders.slice(0, ITEMS_PER_PAPER).map(rem => (
          <ReminderRow
            key={rem.id}
            rem={rem}
            onToggle={onToggleReminder}
            width={width}
            fontSizeRatio={fontSizeRatio}
            fontFamily={fontFamily}
            isLofi={themeName === 'lofi'}
          />
        ))}

        {/* Inline "add" input when slots remain */}
        {remainingSlots > 0 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "3px 4px",
            marginTop: reminders.length > 0 ? "2px" : 0,
          }}>
            <div style={{
              width: "15px", height: "15px",
              borderRadius: "4px",
              border: themeName === 'lofi' ? "1.5px dashed rgba(255,255,255,0.5)" : "1.5px dashed #c8a97e",
              flexShrink: 0,
              opacity: 0.5,
            }} />
            <input
              ref={inputRef}
              className="paper-item-input"
              placeholder="Add item & press Enter…"
              style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily, color: themeName === 'lofi' ? '#ffffff' : undefined }}
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={handleAddInline}
            />
          </div>
        )}
      </div>

        {/* Delete when selected */}
        {isSelected && (
          <>
            <button
              className="delete-btn"
              style={{ top: "4px", right: "4px", zIndex: 20 }}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              ✕
            </button>

            {/* ── Rotate handle (above top center) ── */}
            <div
              className="rotate-handle nodrag"
              style={{
                ...handleDot,
                width: "14px",
                height: "14px",
                top: "-24px",
                left: "50%",
                transform: "translateX(-50%)",
                cursor: "grab",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "9px",
              }}
              onPointerDown={handleRotate}
            >
              ↻
            </div>

            <div className="nodrag" style={{
              position: "absolute",
              top: "105%",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.9)",
              padding: "5px 10px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              zIndex: 30,
              width: "180px",
              cursor: "default"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "#333", background: "#f9f9f9", padding: "4px", borderRadius: "6px" }}>
                <span>Size</span>
                <input type="range" min="0.03" max="0.08" step="0.005" value={fontSizeRatio} onChange={(e) => setFontSizeRatio(Number(e.target.value))} style={{ width: "60px", cursor: "pointer" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "#333", background: "#f9f9f9", padding: "4px", borderRadius: "6px" }}>
                <span>Font</span>
                <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} style={{ width: "90px", border: "1px solid #ccc", borderRadius: "4px", padding: "2px", cursor: "pointer" }}>
                  <option value="'Caveat', cursive">Caveat</option>
                  <option value="'Patrick Hand', cursive">Patrick Hand</option>
                  <option value="'Fredoka', cursive">Fredoka</option>
                  <option value="Arial">Arial</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </Rnd>
  );
};

export default ReminderPaper;
