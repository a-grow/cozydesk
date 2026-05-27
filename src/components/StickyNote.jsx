import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import defaultNoteImg from "../assets/stickynotes/stickynotecozyyellow.png";
import { useTheme } from "../themes/ThemeContext";

// ── Date detection ──────────────────────────────────────────────────────────
const MONTH_MAP = {
  january:1, february:2, march:3, april:4, may:5, june:6,
  july:7, august:8, september:9, october:10, november:11, december:12,
  jan:1, feb:2, mar:3, apr:4, may:5, jun:6, jul:7, aug:8, sep:9, oct:10, nov:11, dec:12,
};

function detectAllDates(text) {
  const found = [];
  const curYear = new Date().getFullYear();

  const re1 = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?\b/gi;
  for (const m of text.matchAll(re1)) {
    const monthNum = MONTH_MAP[m[1].toLowerCase()];
    const day = parseInt(m[2], 10);
    if (monthNum && day >= 1 && day <= 31) {
      found.push({ index: m.index, end: m.index + m[0].length, dateKey: `${curYear}-${String(monthNum).padStart(2,'0')}-${String(day).padStart(2,'0')}` });
    }
  }

  const re2 = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g;
  for (const m of text.matchAll(re2)) {
    const month = parseInt(m[1], 10);
    const day   = parseInt(m[2], 10);
    let year    = m[3] ? parseInt(m[3], 10) : curYear;
    if (year < 100) year += 2000;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      found.push({ index: m.index, end: m.index + m[0].length, dateKey: `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}` });
    }
  }

  if (found.length === 0) return [];
  found.sort((a, b) => a.index - b.index);

  return found.map((f, i) => {
    const nextStart = i + 1 < found.length ? found[i + 1].index : text.length;
    const afterText = text.slice(f.end, nextStart).replace(/[\n\r]+/g, ' ').trim();
    const eventText = (afterText || text.slice(0, f.index).replace(/[\n\r]+/g, ' ').trim()).slice(0, 80);
    return { dateKey: f.dateKey, eventText };
  });
}
// ────────────────────────────────────────────────────────────────────────────

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

const StickyNote = ({
  x, y, width, height,
  src = defaultNoteImg,
  pinned = false,
  initialText = "",
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  layer,
  onContextMenu,
  onDateDetected,
}) => {
  const { themeStickyNotes, themeName, theme } = useTheme();
  const stickyNoteAssets = themeStickyNotes.filter(a => !a.name.includes('todo'));
  const [text, setText] = useState(initialText);
  const [rotation, setRotation] = useState(0);
  const [fontFamily, setFontFamily] = useState(theme.defaultNoteFont || "'Nunito', sans-serif");
  const [fontSizeRatio, setFontSizeRatio] = useState(0.055);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(pinned);
  const contentRef = useRef(null);
  const isMountedRef = useRef(false);

  // Set initial text imperatively
  useEffect(() => {
    if (contentRef.current) {
      // Always sync the dom to the initialText provided by props IF we just mounted
      // BUT if we are updating, we must only set it if the internal text state matches the prop
      // For simplicity on color change: the component re-renders but doesn't unmount.
      // So we must ensure initialText from props is placed in the div if it changed from outside.
      if (contentRef.current.innerText !== initialText) {
         contentRef.current.innerText = initialText;
         setText(initialText);
      }
    }
    isMountedRef.current = true;
  }, [initialText]);

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

  const handleBlur = () => {
    if (!contentRef.current) return;
    const currentText = contentRef.current.innerText;
    onUpdate({ text: currentText });
    if (onDateDetected && isMountedRef.current) {
      const pairs = detectAllDates(currentText);
      pairs.forEach(({ dateKey, eventText }) => {
        onDateDetected(dateKey, eventText);
      });
    }
  };

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
      style={{
        zIndex: layer != null ? layer : (isPinned ? 100 : 5),
        borderRadius: "8px",
        border: "none"
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDragStart={onSelect}
      onDragStop={(e, d) => {
        onUpdate({ x: d.x, y: d.y, width, height, text: contentRef.current?.innerText || text });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        onUpdate({
          x: position.x,
          y: position.y,
          width: ref.offsetWidth,
          height: ref.offsetHeight,
          text: contentRef.current?.innerText || text
        });
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`sticky-note-wrapper ${isHovered ? 'hover-glow' : ''}`}
    >
      <div
        onContextMenu={onContextMenu}
        style={{
        width: "100%",
        height: "100%",
        position: "relative",
        transform: `rotate(${rotation}deg)`,
        transition: isHovered && !isSelected ? "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)" : "none",
      }}>
        <img
          src={src || defaultNoteImg}
          alt="Sticky Note"
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            filter: isHovered ? "drop-shadow(0 4px 16px rgba(0,0,0,0.3)) brightness(1.05)" : "drop-shadow(0 4px 12px rgba(0,0,0,0.2))",
            transition: "filter 0.3s ease"
          }}
        />

        <div style={{
          position: "absolute",
          top: "-10px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "18px",
          cursor: "pointer",
          zIndex: 30,
          opacity: isPinned || isHovered ? 1 : 0,
          transition: "opacity 0.2s, transform 0.2s",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => {
          e.stopPropagation();
          setIsPinned(!isPinned);
          onUpdate({ x, y, width, height, pinned: !isPinned });
        }}
        title="Pin to Top"
        >
          {isPinned ? "📌" : "📍"}
        </div>

        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning={true}
          dir="ltr"
          data-placeholder="Write a note..."
          style={{
            position: "absolute",
            top: theme.stickyNoteTextArea?.top ?? '28%',
            left: theme.stickyNoteTextArea?.left ?? '10%',
            right: theme.stickyNoteTextArea?.right ?? '8%',
            bottom: theme.stickyNoteTextArea?.bottom ?? '12%',
            outline: "none",
            fontSize: `${Math.max(12, Math.min(24, width * fontSizeRatio))}px`,
            fontFamily: fontFamily,
            lineHeight: "1.5",
            color: "#3a2a1a",
            cursor: "text",
            overflow: "hidden",
            background: "transparent",
            boxShadow: "none",
            padding: "4px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
          onPointerDownCapture={(e) => e.stopPropagation()}
          onInput={e => setText(e.currentTarget.innerText)}
          onBlur={handleBlur}
        />

        {isSelected && (
          <>
            <button 
              className="delete-btn" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={{ top: "4px", right: "4px" }}
            >
              ✕
            </button>

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
              top: "105%", // Adjusted slightly if needed
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.95)",
              padding: "10px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              zIndex: 30,
              width: "200px",
              cursor: "default"
            }}>
              {/* Color Chooser Bar */}
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "4px" }}>
                {stickyNoteAssets.map((asset) => (
                  <button
                    key={asset.name}
                    onClick={() => {
                        // Persist current text when changing color
                        onUpdate({ src: asset.src, text: contentRef.current?.innerText || text });
                    }}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: src === asset.src ? "2px solid #666" : "1px solid #ddd",
                      background: asset.name.includes("yellow") ? "#ffed91" :
                                 asset.name.includes("pink") ? "#ffc6c6" :
                                 asset.name.includes("blue") ? "#97e1ff" :
                                 asset.name.includes("green") ? "#a9f7a9" : "#fff",
                      cursor: "pointer",
                      padding: 0,
                      boxShadow: src === asset.src ? "inset 0 0 4px rgba(0,0,0,0.2)" : "none"
                    }}
                    title={asset.name}
                  />
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "#333", background: "#f9f9f9", padding: "4px", borderRadius: "6px" }}>
                <span>Size</span>
                <input type="range" min="0.04" max="0.1" step="0.005" value={fontSizeRatio} onChange={(e) => setFontSizeRatio(Number(e.target.value))} style={{ width: "60px", cursor: "pointer" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "#333", background: "#f9f9f9", padding: "4px", borderRadius: "6px" }}>
                <span>Font</span>
                <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} style={{ width: "90px", border: "1px solid #ccc", borderRadius: "4px", padding: "2px", cursor: "pointer" }}>
                  <option value="'Patrick Hand', cursive">Patrick Hand</option>
                  <option value="'Fredoka', cursive">Fredoka</option>
                  <option value="Arial">Arial</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </Rnd>
  );
};

export default StickyNote;
