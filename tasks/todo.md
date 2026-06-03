# Theme Carry-Over Feature — Change Summary
Date: Jun 2 2026

## What was built
When a user switches themes, a popup asks whether to bring their sticky notes, to-do papers, and calendar events to the new theme. A "Remember my choice" checkbox lets them skip the popup on future switches.

## Files changed

### src/hooks/useDeskState.js
- Added `mergeCarryOver(snapshot)` — merges a snapshot into the new theme's desk state. Deduplicates notes/papers/reminders by id, calendar events by `text||dateKey`. Never replaces; always appends new items only.
- Exported in the return object.
- **Bug 3 fix (Jun 2):** Removed `getCarryOverSnapshot()` — snapshot is now read directly from localStorage in ThemeContext, making stale-ref issues impossible.

### src/themes/ThemeContext.jsx
- Added `useCallback` to import.
- Added `CARRY_PREF_KEY = 'cozydesk_carryover_pref'` constant.
- Added `carryOverPending` state `{ targetTheme, snapshot, confirmed }`.
- `setTheme(name, _getSnapshot, currentThemeName)` reads snapshot from `localStorage.getItem('cozydesk_state_${currentThemeName}')` — always fresh, no stale ref. If pref='yes' → auto-carry and switch. If pref='no' → skip and switch. If pref=null → store pending and wait (theme does NOT switch yet).
- Added `resolveCarryOver(doCarry, remember)` — called by cozykawaii after user answers popup. Saves pref if remember=true, updates confirmed flag, then switches theme.
- Added `clearCarryOver()` — resets `carryOverPending` to null after merge or decline is handled.
- `carryOverPending`, `resolveCarryOver`, `clearCarryOver` all on context value and createContext default.

### src/themes/cozykawaii.jsx
- Destructures `carryOverPending`, `resolveCarryOver`, `clearCarryOver`, `setTheme: rawSetTheme` from useTheme().
- Local `setTheme` wrapper passes `themeName` as third arg so ThemeContext reads the right localStorage key.
- `prevCarryRef` + useEffect: skips while `confirmed === null` (user deciding). On `confirmed === true`, waits 100ms then calls `mergeCarryOver` + `clearCarryOver`. On `confirmed === false`, just calls `clearCarryOver`.
- Added `carryRemember` state (checkbox value for popup).
- Added carry-over popup modal (renders when `carryOverPending.confirmed === null`).
- Passes `onSetTheme={setTheme}` to Sidebar.

### src/components/sidebar/ThemesSection.jsx
- Accepts optional `onSetTheme` prop.
- Uses `handleSetTheme = onSetTheme || setTheme` so it works with or without the prop.
- Calls `handleSetTheme(e.target.value)` on dropdown change.

### src/components/Sidebar.jsx
- Accepts `onSetTheme` prop.
- Forwards `onSetTheme` to `<ThemesSection />`.
- Forwards `onSetTheme` to `<LofiSidebar />`.

### src/components/LofiSidebar.jsx
- Accepts `onSetTheme` prop.
- Forwards `onSetTheme` to `<ThemesSection />`.

## localStorage keys
- `cozydesk_carryover_pref` — `'yes'` | `'no'` | absent. Controls popup visibility.
  - TODO: add a "Reset carry-over preference" button to Settings so users can change their saved choice.

## Fix (Jun 2): ThemeContext.jsx — skip carry-over popup when desk is empty; switch silently instead.
## Fix (Jun 2): Carry-over polish — notes excluded from carry-over; incoming papers get correct layer ordering above existing items; popup text updated and "Remember my choice" moved below buttons.
## Fix (Jun 2): ThemeContext.jsx — setTheme falls back to themeName when currentThemeName is not passed (e.g. from LofiSidebar), ensuring correct localStorage key is always read; added themeName to useCallback deps.

## What is NOT carried over (by design)
- Stickers (theme-specific assets)
- Clocks (theme-specific widget)
- Calendar widget itself (only events are carried)
