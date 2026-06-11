import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import {
  availableThemeNames,
  getThemeConfig,
  getThemeStickers,
  getThemeStickyNotes,
  THEME_CONFIGS,
} from './themeRegistry';

const CARRY_PREF_KEY = 'cozydesk_carryover_pref';

const ThemeContext = createContext({
  theme: getThemeConfig('cozykawaii'),
  themeName: 'cozykawaii',
  setTheme: () => {},
  themeStickers: [],
  themeStickyNotes: [],
  availableThemes: [],
  carryOverPending: null,
  resolveCarryOver: () => {},
  clearCarryOver: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('cozykawaii');

  // { targetTheme, snapshot, confirmed } — set when a switch is intercepted
  const [carryOverPending, setCarryOverPending] = useState(null);

  // Called by cozykawaii.jsx after the user answers the popup
  const resolveCarryOver = useCallback((doCarry, remember) => {
    if (!carryOverPending) return;
    const { targetTheme } = carryOverPending;

    if (remember) {
      localStorage.setItem(CARRY_PREF_KEY, doCarry ? 'yes' : 'no');
    }

    setCarryOverPending(prev => ({ ...prev, confirmed: doCarry }));
    setThemeName(targetTheme);
  }, [carryOverPending]);

  const clearCarryOver = useCallback(() => {
    setCarryOverPending(null);
  }, []);

  // setTheme is called by ThemesSection via useTheme().
  // currentThemeName is injected by cozykawaii.jsx so we can read the right localStorage key.
  const setTheme = useCallback((name, _getSnapshot, currentThemeName) => {
    if (!THEME_CONFIGS[name] && !availableThemeNames.includes(name)) return;

    // Read snapshot from localStorage — always fresh, no stale ref risk
    const sourceTheme = currentThemeName || themeName;
    let snapshot = null;
    try {
      const raw = localStorage.getItem(`cozydesk_state_${sourceTheme}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        snapshot = {
          papers: parsed.papers || [],
          reminders: parsed.reminders || [],
          calendarEvents: parsed.calendarEvents || {},
          calendars: parsed.calendars || [],
        };
      }
    } catch (_) {}

    const hasContent = (
      (snapshot?.papers?.length > 0) ||
      (snapshot?.reminders?.length > 0) ||
      (snapshot?.calendarEvents && Object.keys(snapshot.calendarEvents).length > 0)
    );

    const pref = localStorage.getItem(CARRY_PREF_KEY);

    // Carry-over only fills a theme the FIRST time it's opened. If the
    // destination theme already has its own saved desk, never inject — this
    // is what stops deleted items from reappearing when you switch back.
    const destHasDesk = !!localStorage.getItem(`cozydesk_state_${name}`);

    if (!hasContent || destHasDesk) {
      setCarryOverPending({ targetTheme: name, snapshot: null, confirmed: false });
      setThemeName(name);
    } else if (pref === 'yes') {
      setCarryOverPending({ targetTheme: name, snapshot, confirmed: true });
      setThemeName(name);
    } else if (pref === 'no') {
      setCarryOverPending({ targetTheme: name, snapshot: null, confirmed: false });
      setThemeName(name);
    } else {
      setCarryOverPending({ targetTheme: name, snapshot, confirmed: null });
    }
  }, [themeName]);

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
      carryOverPending,
      resolveCarryOver,
      clearCarryOver,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
