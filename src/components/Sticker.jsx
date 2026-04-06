import React, { useState } from "react";
import { Rnd } from "react-rnd";

const OVERSHOOT = 30;

const clampPosition = (x, y, w, h, deskW, deskH) => ({
  x: Math.max(-OVERSHOOT, Math.min(x, deskW - w + OVERSHOOT)),
  y: Math.max(-OVERSHOOT, Math.min(y, deskH - h + OVERSHOOT)),
});

/* ── Handle dot base (corner resize, rotate, flip) ── */
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

const flipBtn = {
  ...handleDot,
  width: "18px",
  height: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "10px",
  padding: 0,
  cursor: "pointer",
  lineHeight: 1,
};

const Sticker = ({
  src, alt, x, y, width, height,
  isSelected, onSelect, onUpdate, onDelete,
  deskW = window.innerWidth, deskH = window.innerHeight,
  isBackdrop = false, layer, onContextMenu,
  isAttached = false, onDragMove, onResizeMove,
}) => {
  const [flippedX, setFlippedX] = useState(false);
  const [flippedY, setFlippedY] = useState(false);
  const [rotation, setRotation] = useState(0);

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

  const zIndex = layer != null
    ? layer
    : isBackdrop
      ? 2
      : 5;

  return (
    <Rnd
      size={{ width, height }}
      position={{ x, y }}
      bounds={undefined}
      disableDragging={isAttached}
      enableResizing={isSelected && !isAttached ? {
        top: false, right: false, bottom: false, left: false,
        topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
      } : false}
      resizeHandleClasses={{
        topLeft: "sticker-corner-handle nwse",
        topRight: "sticker-corner-handle nesw",
        bottomLeft: "sticker-corner-handle nesw",
        bottomRight: "sticker-corner-handle nwse",
      }}
      style={{ zIndex, border: "none", boxShadow: "none", borderRadius: "8px" }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onDragStart={() => onSelect()}
      onDrag={(e, d) => { if (onDragMove) onDragMove({ x: d.x, y: d.y }); }}
      onDragStop={(e, d) => {
        onUpdate({ x: d.x, y: d.y, width, height });
      }}
      onResize={(e, direction, ref, delta, position) => {
        if (onResizeMove) onResizeMove({ x: position.x, y: position.y, width: ref.offsetWidth, height: ref.offsetHeight });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        onUpdate({ x: position.x, y: position.y, width: ref.offsetWidth, height: ref.offsetHeight });
      }}
    >
      <div
        onContextMenu={onContextMenu}
        style={{
        width: "100%",
        height: "100%",
        position: "relative",
        transform: isBackdrop ? "none" : `rotate(${rotation}deg)`,
      }}>
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transform: `scaleX(${flippedX ? -1 : 1}) scaleY(${flippedY ? -1 : 1})`,
            pointerEvents: "none",
            filter: isBackdrop
              ? "drop-shadow(0 8px 28px rgba(0,0,0,0.25))"
              : "drop-shadow(0 4px 12px rgba(0,0,0,0.2))",
            borderRadius: isBackdrop ? "12px" : "8px",
            border: "none",
          }}
        />

        {isSelected && (
          <>
            {/* Delete */}
            <button
              className="delete-btn"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{ top: "4px", right: "4px" }}
            >
              ✕
            </button>

            {!isBackdrop && (
              <>
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

                {/* ── Flip horizontal (left edge) ── */}
                <button
                  className="flip-handle nodrag"
                  style={{
                    ...flipBtn,
                    left: "-22px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  onClick={(e) => { e.stopPropagation(); setFlippedX(v => !v); }}
                >
                  ⇋
                </button>

                {/* ── Flip horizontal (right edge) ── */}
                <button
                  className="flip-handle nodrag"
                  style={{
                    ...flipBtn,
                    right: "-22px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  onClick={(e) => { e.stopPropagation(); setFlippedX(v => !v); }}
                >
                  ⇋
                </button>

                {/* ── Flip vertical (top edge) ── */}
                <button
                  className="flip-handle nodrag"
                  style={{
                    ...flipBtn,
                    top: "-22px",
                    left: "calc(50% + 16px)",
                    transform: "translateX(-50%)",
                  }}
                  onClick={(e) => { e.stopPropagation(); setFlippedY(v => !v); }}
                >
                  ⇅
                </button>

                {/* ── Flip vertical (bottom edge) ── */}
                <button
                  className="flip-handle nodrag"
                  style={{
                    ...flipBtn,
                    bottom: "-22px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                  onClick={(e) => { e.stopPropagation(); setFlippedY(v => !v); }}
                >
                  ⇅
                </button>
              </>
            )}
          </>
        )}
      </div>
    </Rnd>
  );
};

export default Sticker;
