import React from 'react';
import { soundManager } from '../../utils/soundManager';
import { useTheme } from '../../themes/ThemeContext';

export default function StickersSection({ stickers, onDeskAdd, canUndo, onUndo, canRedo, onRedo }) {
  // Interactive stickers (tap sounds / food machine, from world.js) get a little sparkle badge.
  const { theme } = useTheme();
  const isInteractive = (name) => !!(theme?.stickerSounds?.[name] || theme?.foodGenerators?.[name] || theme?.lightToggles?.[name]);
  return (
    <div className="stickers-section">
      {/* Undo / Redo bar — always visible */}
      <div className="stickers-undo-redo">
        <button className="sb-undo-btn" disabled={!canUndo} onClick={() => { soundManager.play('sfx_undo_redo'); onUndo(); }}>↺ Undo</button>
        <button className="sb-redo-btn" disabled={!canRedo} onClick={() => { soundManager.play('sfx_undo_redo'); onRedo(); }}>Redo ↻</button>
      </div>

      {/* Draggable sticker grid */}
      <div className="stickers-grid">
        {stickers.map((sticker, i) => (
          <div
            className="sticker-thumb-cell"
            key={i}
            title={isInteractive(sticker.name)
              ? 'Interactive! Tap it on your desk'
              : sticker.name.replace(/\.png$/i, '').replace(/[_-]/g, ' ')}
            style={isInteractive(sticker.name) ? { position: 'relative' } : undefined}
          >
            {isInteractive(sticker.name) && (
              <span aria-hidden style={{
                position: 'absolute', top: '3px', right: '5px', fontSize: '13px',
                pointerEvents: 'none', filter: 'drop-shadow(0 0 3px rgba(111,243,234,0.9))',
              }}>✨</span>
            )}
            <img
              src={sticker.src}
              alt={sticker.name}
              className="sticker-thumb-img"
              draggable
              onDoubleClick={() => onDeskAdd(sticker)}
              onDragStart={(e) => {
                soundManager.play('sfx_sticker_lift');
                e.dataTransfer.setData('application/json', JSON.stringify(sticker));
                e.dataTransfer.effectAllowed = 'copy';
                const ghost = e.currentTarget.cloneNode(true);
                ghost.style.opacity = '0.5';
                ghost.style.position = 'absolute';
                ghost.style.top = '-9999px';
                document.body.appendChild(ghost);
                e.dataTransfer.setDragImage(ghost, 26, 26);
                requestAnimationFrame(() => document.body.removeChild(ghost));
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
