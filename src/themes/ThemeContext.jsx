import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import {
  availableThemeNames,
  getThemeConfig,
  getThemeStickers,
  getThemeStickyNotes,
  THEME_CONFIGS,
} from './themeRegistry';

const CALENDAR_SHARED_KEY = 'cozydesk_calendar_shared';

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
  const [themeName, setThemeName] = useState(() => {
    try {
      const saved = localStorage.getItem('cozydesk_active_theme');
      if (saved && (THEME_CONFIGS[saved] || availableThemeNames.includes(saved))) return saved;
    } catch (_) {}
    return 'cozykawaii';
  });

  // { targetTheme, snapshot, confirmed } — set when a switch is intercepted
  const [carryOverPending, setCarryOverPending] = useState(null);

  // Called by cozykawaii.jsx after the user answers the popup
  const resolveCarryOver = useCallback((doCarry, remember) => {
    if (!carryOverPending) return;
    const { targetTheme } = carryOverPending;

    // YES path: enableCalendarSharing() in useDeskState sets 'on' — nothing to do here.
    // NO path: if Remember is checked, persist the 'off' decision.
    if (!doCarry && remember) {
      localStorage.setItem(CALENDAR_SHARED_KEY, 'off');
    }

    setCarryOverPending(prev => ({ ...prev, confirmed: doCarry }));
    setThemeName(targetTheme);
  }, [carryOverPending]);

  const clearCarryOver = useCallback(() => {
    setCarryOverPending(null);
  }, []);

  // Used by onboarding's "pick your world" — sets the starting theme with no
  // calendar-sharing popup baggage. Guards against unknown theme names.
  const setThemeDirect = useCallback((name) => {
    if (!THEME_CONFIGS[name] && !availableThemeNames.includes(name)) return;
    setThemeName(name);
  }, []);

  // setTheme is called by ThemesSection via useTheme().
  // currentThemeName is injected by cozykawaii.jsx so we can read the right localStorage key.
  const setTheme = useCallback((name, _getSnapshot, currentThemeName) => {
    if (!THEME_CONFIGS[name] && !availableThemeNames.includes(name)) return;

    const sharingPref = localStorage.getItem(CALENDAR_SHARED_KEY);

    // If sharing preference is already set, switch silently — no popup needed.
    if (sharingPref === 'on' || sharingPref === 'off') {
      setCarryOverPending({ targetTheme: name, snapshot: null, confirmed: false });
      setThemeName(name);
      return;
    }

    // Sharing is unset — check if the current theme has any calendar events.
    const sourceTheme = currentThemeName || themeName;
    let hasCalendarEvents = false;
    try {
      const raw = localStorage.getItem(`cozydesk_state_${sourceTheme}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        hasCalendarEvents = !!(parsed.calendarEvents && Object.keys(parsed.calendarEvents).length > 0);
      }
    } catch (_) {}

    if (hasCalendarEvents) {
      // Show the sharing popup — theme switch is deferred until user answers.
      setCarryOverPending({ targetTheme: name, snapshot: null, confirmed: null });
    } else {
      // No events to share — switch immediately.
      setCarryOverPending({ targetTheme: name, snapshot: null, confirmed: false });
      setThemeName(name);
    }
  }, [themeName]);

  const theme = getThemeConfig(themeName);

  useEffect(() => {
    try { localStorage.setItem('cozydesk_active_theme', themeName); } catch (_) {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme.themeColor || '#e6cba8');
  }, [themeName]);

  const themeStickers = getThemeStickers(themeName);
  const themeStickyNotes = getThemeStickyNotes(themeName);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      setThemeDirect,
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
