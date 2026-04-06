import React, { useEffect, useRef } from "react";

const menuStyle = {
  position: "fixed",
  background: "rgba(255, 253, 248, 0.96)",
  backdropFilter: "blur(8px)",
  borderRadius: "10px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
  border: "1px solid rgba(200, 190, 175, 0.5)",
  padding: "4px 0",
  zIndex: 10000,
  minWidth: "160px",
  fontFamily: "'Patrick Hand', cursive",
  fontSize: "14px",
};

const itemStyle = {
  padding: "8px 16px",
  cursor: "pointer",
  color: "#4b3b2a",
  userSelect: "none",
  transition: "background 0.15s",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const ACTIONS = [
  { key: "bringToFront", label: "Bring to Front", icon: "⬆️" },
  { key: "moveForward",  label: "Move Forward",   icon: "🔼" },
  { key: "moveBackward", label: "Move Backward",  icon: "🔽" },
  { key: "sendToBack",   label: "Send to Back",   icon: "⬇️" },
];

const ATTACH_ACTION = { key: "attach", label: "Attach to Back Layer", icon: "📎" };
const DETACH_ACTION = { key: "detach", label: "Detach",               icon: "✂️" };

export default function ContextMenu({ x, y, onAction, onClose, isAttached, canAttach }) {
  const ref = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Adjust position so menu doesn't overflow viewport
  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      ref.current.style.left = `${window.innerWidth - rect.width - 8}px`;
    }
    if (rect.bottom > window.innerHeight) {
      ref.current.style.top = `${window.innerHeight - rect.height - 8}px`;
    }
  }, [x, y]);

  const actions = isAttached
    ? [DETACH_ACTION]
    : canAttach
      ? [...ACTIONS, ATTACH_ACTION]
      : ACTIONS;

  return (
    <div
      ref={ref}
      style={{ ...menuStyle, left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {actions.map(({ key, label, icon }) => (
        <div
          key={key}
          style={itemStyle}
          onClick={() => {
            onAction(key);
            onClose();
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200, 180, 160, 0.25)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
