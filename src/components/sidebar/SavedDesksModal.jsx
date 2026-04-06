import React from 'react';
import { createPortal } from 'react-dom';
import SavedDesksSection from './SavedDesksSection';

export default function SavedDesksModal({ themeName, onLoad, onClose }) {
  return createPortal(
    <div className="sds-modal-backdrop">
      <div
        className="sds-modal-box"
        data-theme={themeName}
        onClick={e => e.stopPropagation()}
      >
        <div className="sds-modal-header">
          <span className="sds-modal-title">📁 My Desks</span>
          <button className="sds-modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="sds-modal-body">
          <SavedDesksSection
            themeName={themeName}
            onLoad={(slot) => { onLoad(slot); onClose(); }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
