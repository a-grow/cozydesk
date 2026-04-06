import React from 'react';
import { useTheme } from '../themes/ThemeContext.jsx';
import { THEME_CONFIGS, availableThemeNames } from '../themes/themeRegistry';

const ThemeSwitcher = () => {
  const { themeName, setTheme } = useTheme();
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor="theme-select">Theme: </label>
      <select
        id="theme-select"
        value={themeName}
        onChange={e => setTheme(e.target.value)}
      >
        {availableThemeNames.map((key) => (
          <option key={key} value={key}>
            {THEME_CONFIGS[key]?.name || key}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;
