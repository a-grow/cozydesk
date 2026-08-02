import React, { useState, useEffect, useRef } from "react";
import idlePose from "../assets/mascot/mug-idle.png";
import sparklePose from "../assets/mascot/mug-sparkle.png";
import { onTaskComplete } from "../utils/mugzyBus";

export default function Mugzy() {
  const [visible, setVisible] = useState(
    () => localStorage.getItem('cozydesk_mugzy') !== 'off'
  );
  const [reacting, setReacting] = useState(false);
  const timerRef = useRef(null);

  // Live show/hide from Settings toggle
  useEffect(() => {
    const onToggle = () => setVisible(localStorage.getItem('cozydesk_mugzy') !== 'off');
    window.addEventListener('cozydesk-mugzy-toggle', onToggle);
    return () => window.removeEventListener('cozydesk-mugzy-toggle', onToggle);
  }, []);

  // React to a completed task
  useEffect(() => {
    const off = onTaskComplete(() => {
      setReacting(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setReacting(false), 1100);
    });
    return () => { off(); clearTimeout(timerRef.current); };
  }, []);

  if (!visible) return null;

  const BADGE = 132;

  return (
    <div
      style={{
        position: "absolute",
        right: "26px",
        bottom: "22px",
        width: `${BADGE}px`,
        height: `${BADGE}px`,
        zIndex: 400,
        pointerEvents: "none",
      }}
    >
      {/* Badge backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 38%, #fdf6e9 0%, #f5e6cf 72%, #eddbc0 100%)",
          border: "3px solid #c9a227",
          boxShadow: "0 6px 18px rgba(60,40,20,0.28), inset 0 -6px 14px rgba(160,120,60,0.16)",
        }}
      />

      {/* Mugzy's shadow on the badge */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "20px",
          width: "58%",
          height: "12px",
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: "rgba(90,60,30,0.30)",
          filter: "blur(4px)",
          animation: reacting
            ? "mugzy-shadow-pop 1.1s ease-out"
            : "mugzy-shadow-breathe 3.2s ease-in-out infinite",
        }}
      />

      {/* Mugzy */}
      <img
        src={reacting ? sparklePose : idlePose}
        alt="Mugzy"
        style={{
          position: "absolute",
          left: "50%",
          bottom: "16px",
          width: "80%",
          height: "80%",
          transform: "translateX(-50%)",
          objectFit: "contain",
          transformOrigin: "bottom center",
          animation: reacting
            ? "mugzy-pop 1.1s ease-out"
            : "mugzy-breathe 3.2s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes mugzy-breathe {
          0%, 100% { transform: translateX(-50%) scale(1, 1); }
          50%      { transform: translateX(-50%) scale(1.03, 0.97); }
        }
        @keyframes mugzy-pop {
          0%   { transform: translateX(-50%) scale(1, 1); }
          15%  { transform: translateX(-50%) scale(0.86, 1.14); }
          40%  { transform: translateX(-50%) scale(1.14, 0.86); }
          65%  { transform: translateX(-50%) scale(0.96, 1.04); }
          100% { transform: translateX(-50%) scale(1, 1); }
        }
        @keyframes mugzy-shadow-breathe {
          0%, 100% { transform: translateX(-50%) scaleX(1);    opacity: 0.30; }
          50%      { transform: translateX(-50%) scaleX(1.05); opacity: 0.24; }
        }
        @keyframes mugzy-shadow-pop {
          0%   { transform: translateX(-50%) scaleX(1);    opacity: 0.30; }
          15%  { transform: translateX(-50%) scaleX(1.12); opacity: 0.34; }
          40%  { transform: translateX(-50%) scaleX(0.82); opacity: 0.18; }
          65%  { transform: translateX(-50%) scaleX(1.04); opacity: 0.28; }
          100% { transform: translateX(-50%) scaleX(1);    opacity: 0.30; }
        }
      `}</style>
    </div>
  );
}
