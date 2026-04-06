import React from 'react';

export default function StickersSection({ stickers, canUndo, onUndo, canRedo, onRedo }) {
  return (
    <div className="stickers-section">
      {/* Undo / Redo bar — always visible */}
      <div className="stickers-undo-redo">
        <button className="sb-undo-btn" disabled={!canUndo} onClick={onUndo}>↺ Undo</button>
        <button className="sb-redo-btn" disabled={!canRedo} onClick={onRedo}>Redo ↻</button>
      </div>

      {/* Draggable sticker grid */}
      <div className="stickers-grid">
        {stickers.map((sticker, i) => (
          <div
            className="sticker-thumb-cell"
            key={i}
            title={sticker.name.replace(/\.png$/i, '').replace(/[_-]/g, ' ')}
          >
            <img
              src={sticker.src}
              alt={sticker.name}
              className="sticker-thumb-img"
              draggable
              onDragStart={(e) => {
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
