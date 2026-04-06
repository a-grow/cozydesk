import React, { useState, useEffect } from 'react';
import { getDominantColor } from '../../utils/colors';
import { useTheme } from '../../themes/ThemeContext';

// Fallback default icon (always available regardless of theme)
import defaultIcon from '../../assets/stickynotes/stickynotecozyyellow.png';

export default function StickyNotesSection({ onAddNote }) {
  const { themeStickyNotes } = useTheme();
  const [swatches, setSwatches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Re-compute swatches whenever the theme's sticky notes change
  useEffect(() => {
    let cancelled = false;
    async function loadColors() {
      const assets = themeStickyNotes.length > 0 ? themeStickyNotes : [];
      const loaded = await Promise.all(
        assets.map(async (asset) => {
          const color = await getDominantColor(asset.src);
          return { ...asset, color };
        })
      );
      if (!cancelled) setSwatches(loaded);
    }
    loadColors();
    return () => { cancelled = true; };
  }, [themeStickyNotes]);

  // Use theme's yellow note if available, else the bundled fallback
  const getDefaultNoteSrc = () => {
    const yellow = themeStickyNotes.find(s => s.name.includes('yellow'));
    return yellow ? yellow.src : (themeStickyNotes[0]?.src || defaultIcon);
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    onAddNote(getDefaultNoteSrc());
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%', marginTop: '6px' }}>
      {/* Container for icon and hover button */}
      <div 
        className="sb-todo-icon-btn sb-stickynote-container"
        title="Drag to add to desk"
        style={{ position: 'relative' }}
      >
        <img
          src={getDefaultNoteSrc()}
          alt="Sticky Notes"
          className="sb-todo-icon-img"
          draggable
          onDragStart={(e) => {
            const noteSrc = getDefaultNoteSrc();
            const noteName = themeStickyNotes.find(s => s.name.includes("yellow"))?.name || 'stickynote.png';
            e.dataTransfer.setData('application/json', JSON.stringify({ 
              type: 'note', 
              src: noteSrc,
              name: noteName 
            }));
            e.dataTransfer.effectAllowed = 'copy';
            
            const ghost = e.currentTarget.cloneNode(true);
            ghost.style.opacity = '0.5';
            ghost.style.position = 'absolute';
            ghost.style.top = '-9999px';
            document.body.appendChild(ghost);
            e.dataTransfer.setDragImage(ghost, 40, 40);
            setTimeout(() => document.body.removeChild(ghost), 0);
          }}
        />
      </div>

      {/* Swatches Popup */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--sb-card)',
          border: '1px solid var(--sb-border)',
          borderRadius: '12px',
          padding: '8px',
          marginTop: '6px',
          zIndex: 50,
          display: 'flex',
          gap: '8px',
          boxShadow: '0 4px 12px var(--sb-shadow)',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {swatches.map((swatch, idx) => (
            <div
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                onAddNote(swatch.src);
                setIsOpen(false);
              }}
              title={swatch.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: swatch.color,
                cursor: 'pointer',
                border: '2px solid rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, boxShadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = `0 0 8px ${swatch.color}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
