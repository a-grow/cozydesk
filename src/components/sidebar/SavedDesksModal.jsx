import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import SavedDesksSection from './SavedDesksSection';

export default function SavedDesksModal({ themeName, onLoad, onClose, onSaveCurrent }) {
  // screen: 'fork' | 'load' | 'backup'
  const [screen, setScreen] = useState('fork');

  const title =
    screen === 'load'   ? '📂 Load a saved desk' :
    screen === 'backup' ? '📦 Backup & Restore' :
                          '💾 My Desks';

  return createPortal(
    <div className="sds-modal-backdrop">
      <div
        className="sds-modal-box"
        data-theme={themeName}
        onClick={e => e.stopPropagation()}
      >
        <div className="sds-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {screen !== 'fork' && (
              <button className="sds-back-btn" onClick={() => setScreen('fork')}>‹</button>
            )}
            <span className="sds-modal-title">{title}</span>
          </div>
          <button className="sds-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="sds-modal-body">
          {screen === 'fork' && (
            <div className="sds-fork">
              <button
                className="sds-fork-btn sds-fork-btn--primary"
                onClick={() => { onClose(); onSaveCurrent(); }}
              >
                <span className="sds-fork-emoji">💾</span>
                <span className="sds-fork-label">Save current desk</span>
              </button>

              <button
                className="sds-fork-btn"
                onClick={() => setScreen('load')}
              >
                <span className="sds-fork-emoji">📂</span>
                <span className="sds-fork-label">Load a saved desk</span>
              </button>

              <button
                className="sds-fork-btn"
                onClick={() => setScreen('backup')}
              >
                <span className="sds-fork-emoji">📦</span>
                <span className="sds-fork-label">
                  Backup &amp; Restore
                  <span className="sds-fork-sublabel">All desks in all worlds</span>
                </span>
              </button>
            </div>
          )}

          {screen === 'load' && (
            <SavedDesksSection
              themeName={themeName}
              screen="load"
              onLoad={(slot) => { onLoad(slot); onClose(); }}
            />
          )}

          {screen === 'backup' && (
            <SavedDesksSection
              themeName={themeName}
              screen="backup"
              onLoad={(slot) => { onLoad(slot); onClose(); }}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
