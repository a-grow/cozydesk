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

  const setTheme = (name) => {
    if (THEME_CONFIGS[name] || availableThemeNames.includes(name)) {
      setThemeName(name);
    }
  };

  const theme = getThemeConfig(themeName);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme.themeColor || '#e6cba8');
  }, [themeName]);
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
