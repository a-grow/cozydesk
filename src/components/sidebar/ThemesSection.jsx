import React, { useState } from 'react';
import { useTheme } from '../../themes/ThemeContext';
import WorldGalleryModal from './WorldGalleryModal';

export default function ThemesSection({ onSetTheme }) {
  const { themeName, setTheme } = useTheme();
  const handleSetTheme = onSetTheme || setTheme;
  const [galleryOpen, setGalleryOpen] = useState(false);

  return (
    <div className="themes-section">
      <button
        type="button"
        className="world-gallery-trigger"
        onClick={() => setGalleryOpen(true)}
      >
        Choose Your World
      </button>

      {galleryOpen && (
        <WorldGalleryModal
          currentTheme={themeName}
          onPick={(key) => { handleSetTheme(key); setGalleryOpen(false); }}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  );
}
