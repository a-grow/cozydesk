import React, { useState, useEffect, useRef } from "react";
import idlePose from "../assets/mascot/mug-idle.png";
import sparklePose from "../assets/mascot/mug-sparkle.png";
import cheerPose from "../assets/mascot/mug-cheer.png";
import focusPose from "../assets/mascot/mug-focus.png";
import { onTaskComplete } from "../utils/mugzyBus";
import { onFocusChange } from "../utils/focusBus";

export default function Mugzy() {
  const [visible, setVisible] = useState(
    () => localStorage.getItem('cozydesk_mugzy') !== 'off'
  );
  const [reacting, setReacting] = useState(false);   // task-complete sparkle
  const [cheering, setCheering] = useState(false);   // brief cheer burst on focus start
  const [focusing, setFocusing] = useState(false);   // whole focus session
  const timerRef = useRef(null);
  const cheerTimerRef = useRef(null);

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

  // Focus session: cheer burst on start, then settle into the calm focus pose.
  useEffect(() => {
    const off = onFocusChange((on) => {
      setFocusing(on);
      if (on) {
        setCheering(true);
        clearTimeout(cheerTimerRef.current);
        cheerTimerRef.current = setTimeout(() => setCheering(false), 1600);
      } else {
        setCheering(false);
        clearTimeout(cheerTimerRef.current);
      }
    });
    return () => { off(); clearTimeout(cheerTimerRef.current); };
  }, []);

  if (!visible) return null;

  const BADGE = 132;

  // Which pose: cheer burst > task sparkle > calm focus (during session) > idle
  const pose = cheering ? cheerPose
             : reacting ? sparklePose
             : focusing ? focusPose
             : idlePose;

  const isPopping = reacting || cheering;

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
      {/* Badge backdrop — gains a blue "Focus glow" during a session */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 38%, #fdf6e9 0%, #f5e6cf 72%, #eddbc0 100%)",
          border: focusing ? "3px solid #8ec5ff" : "3px solid #c9a227",
          boxShadow: focusing
            ? "0 0 18px rgba(130,190,255,0.85), 0 0 30px rgba(120,170,255,0.55), 0 6px 18px rgba(40,60,90,0.30), inset 0 -6px 14px rgba(120,150,200,0.18)"
            : "0 6px 18px rgba(60,40,20,0.28), inset 0 -6px 14px rgba(160,120,60,0.16)",
          transition: "border 0.8s ease, box-shadow 0.8s ease",
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
          animation: isPopping
            ? "mugzy-shadow-pop 1.1s ease-out"
            : "mugzy-shadow-breathe 3.2s ease-in-out infinite",
        }}
      />

      {/* Mugzy */}
      <img
        src={pose}
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
          animation: isPopping
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
