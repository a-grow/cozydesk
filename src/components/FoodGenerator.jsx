// FoodGenerator.jsx — overlay for a "food generator" sticker (Space Cruiser's food machine).
// Each tap (the `tick` prop goes up by one) plays a teal shimmer in the alcove and a
// random food appears on the platform.
//
// The food is NOT saved — it lives only in this component. Saved desks never change,
// and after a reload the platform starts empty, ready to tap.
//
// Settings come from world.js (config.foodGenerators[stickerName]):
//   foods: [image urls], area: { left, right, top, bottom } in % of the sticker
//   (box the food stands in; its bottom edge = top of the platform), beam: same for the light.

import React, { useEffect, useRef, useState } from 'react';

const KEYFRAMES = `
@keyframes fg-materialize {
  0%   { opacity: 0; transform: scale(0.6); filter: brightness(2.2) blur(3px); }
  60%  { opacity: 1; transform: scale(1.04); filter: brightness(1.5) blur(0); }
  100% { opacity: 1; transform: scale(1); filter: brightness(1) blur(0); }
}
@keyframes fg-beam {
  0%   { opacity: 0; }
  35%  { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes fg-spark {
  0%   { opacity: 0; transform: translateY(0) scale(0.5); }
  40%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-40px) scale(1); }
}`;

export default function FoodGenerator({ tick, foods = [], area, beam }) {
  // The food shown belongs to one tap; a newer tap hides it until its own food appears.
  const [shown, setShown] = useState({ tick: 0, src: null });
  const last = useRef(-1);

  useEffect(() => {
    if (!tick || !foods.length) return;
    let i = Math.floor(Math.random() * foods.length);
    if (foods.length > 1 && i === last.current) i = (i + 1) % foods.length;
    last.current = i;
    const t = setTimeout(() => setShown({ tick, src: foods[i] }), 450);
    return () => clearTimeout(t);
  }, [tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const food = shown.tick === tick ? shown.src : null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <style>{KEYFRAMES}</style>

      {tick > 0 && (
        <div key={`beam${tick}`} style={{
          position: 'absolute', ...beam,
          background: 'linear-gradient(to top, rgba(111,243,234,0.65), rgba(111,243,234,0.15) 70%, rgba(111,243,234,0))',
          borderRadius: '10px',
          animation: 'fg-beam 1.1s ease-out forwards',
        }}>
          {[18, 38, 55, 72, 85].map((x, k) => (
            <span key={k} style={{
              position: 'absolute', left: `${x}%`, bottom: `${10 + (k % 3) * 12}%`,
              width: 4, height: 4, borderRadius: '50%', background: '#e9fffd',
              boxShadow: '0 0 6px #6ff3ea',
              animation: `fg-spark 0.9s ease-out ${k * 0.07}s forwards`, opacity: 0,
            }} />
          ))}
        </div>
      )}

      {food && (
        <div style={{ position: 'absolute', ...area }}>
          <img
            key={`${food}${tick}`}
            src={food}
            alt=""
            draggable={false}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'contain', objectPosition: 'center bottom',
              transformOrigin: 'center bottom',
              animation: 'fg-materialize 0.6s ease-out forwards',
            }}
          />
        </div>
      )}
    </div>
  );
}
