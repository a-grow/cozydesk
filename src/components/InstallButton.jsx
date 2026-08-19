import React, { useEffect, useState } from 'react';
import { installManager } from '../utils/installManager';
import { soundManager } from '../utils/soundManager';

// Shared install row for both sidebars. Renders nothing unless the browser
// has handed us a real install prompt (Chrome/Edge). Vanishes once installed.
export default function InstallButton() {
  const [canInstall, setCanInstall] = useState(installManager.canInstall());

  useEffect(() => {
    const update = () => setCanInstall(installManager.canInstall());
    update(); // sync immediately in case the prompt fired before mount
    const off = installManager.subscribe(update);
    return () => off();
  }, []);

  if (!canInstall) return null;

  const handleClick = async () => {
    soundManager.play('sfx_click_button');
    await installManager.promptInstall();
  };

  return (
    <div className="sb-install-wrap">
      <button
        className="sb-install-btn"
        onClick={handleClick}
        title="Add CozyDesk to your dock or taskbar"
      >
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none"
          stroke="#4b3b2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true">
          <path d="M10 2 L10 12" />
          <path d="M6 8 L10 12 L14 8" />
          <path d="M3 15 L3 17 L17 17 L17 15" />
        </svg>
        <span>Add to Dock / Taskbar</span>
      </button>
      <p className="sb-install-note">Adds an app icon you can keep in your dock</p>
    </div>
  );
}
