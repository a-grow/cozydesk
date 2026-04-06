import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  availableThemeNames,
  getThemeConfig,
  getThemeStickers,
  getThemeStickyNotes,
  THEME_CONFIGS,
} from './themeRegistry';

const ThemeContext = createContext({
  theme: getThemeConfig('cozykawaii'),
  themeName: 'cozykawaii',
  setTheme: () => {},
  themeStickers: [],
  themeStickyNotes: [],
  availableThemes: [],
});

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('cozykawaii');

  const themeColors = { cozykawaii: '#e6cba8', lofi: '#1e1e2f', steampunk: '#2a1f1f' };

  const setTheme = (name) => {
    if (THEME_CONFIGS[name] || availableThemeNames.includes(name)) {
      setThemeName(name);
    }
  };

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', themeColors[themeName] || '#e6cba8');
  }, [themeName]);

  const theme = getThemeConfig(themeName);
  const themeStickers = getThemeStickers(themeName);
  const themeStickyNotes = getThemeStickyNotes(themeName);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      themeName,
      themeStickers,
      themeStickyNotes,
      availableThemes: availableThemeNames,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
