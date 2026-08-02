import React, { useState, useEffect } from "react";
import { onFocusChange } from "../utils/focusBus";

export default function FocusOverlay() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const off = onFocusChange(setActive);
    return () => off();
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 350,
        pointerEvents: "none",
        opacity: active ? 1 : 0,
        transition: "opacity 1.4s ease-in-out",
      }}
    >
      {/* Strong dark vignette — frames the edges, keeps center clear */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 75% 75% at 50% 52%, rgba(0,0,0,0) 32%, rgba(12,8,20,0.55) 72%, rgba(8,5,16,0.86) 100%)",
        }}
      />
      {/* Warm lamp glow in the center — adds richness, not a flat film */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 55% 55% at 50% 55%, rgba(255,180,90,0.20) 0%, rgba(255,160,70,0.06) 40%, rgba(0,0,0,0) 70%)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
