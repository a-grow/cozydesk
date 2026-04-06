import React from 'react';
import { useTheme } from '../../themes/ThemeContext';
import { THEME_CONFIGS, availableThemeNames } from '../../themes/themeRegistry';

export default function ThemesSection() {
  const { themeName, setTheme } = useTheme();

  return (
    <div className="themes-section">
      <select
        className="theme-dropdown"
        value={themeName}
        onChange={(e) => setTheme(e.target.value)}
      >
        {availableThemeNames.map((key) => (
          <option key={key} value={key}>
            {THEME_CONFIGS[key]?.name || key}
          </option>
        ))}
      </select>
    </div>
  );
}
