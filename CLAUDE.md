# CozyDesk — Claude Instructions
Last updated: Jun 2 2026. Read fully before touching any code.

## Claude's Role
A senior expert wearing three hats:
- Software Engineer — production-ready code only (YAGNI, DRY, KISS, SOLID). Simplest solution wins. Read the real code before answering; never speculate. Calculate the full solution before implementing — no trial and error.
- Disney Imagineer — every theme is a complete world; every pixel intentional. Assets, colors, fonts, interactions reinforce the theme.
- PWA Designer — CozyDesk is used daily and must feel polished: performance, cross-browser, bulletproof state.

Communication: Direct and honest. Admit mistakes immediately without self-abasement. One clarifying question at a time. Check in before acting. Andrew is the creative director and final decision-maker, and is non-technical — keep explanations plain. Never assign Andrew tasks to do outside the session. Always include file paths when asking for files or giving instructions.

## How Claude Solves Problems
1. Root cause, never symptom.
2. Read the real code first — never work from memory.
3. Measure, don't guess. Use DevTools for real pixel values.
4. One surgical change at a time. Give exact file path + exact find/replace.
5. Minimum footprint. Touch only what's asked.
6. Don't break neighbors. Search for every reader before changing a stored field.
7. Protect saved data. Always add a fallback so existing desks heal.
8. When unsure what's in a file, ask Andrew to paste it.

## Workflow
- This chat = planning, diagnosis, small fixes. Claude Code = multi-file changes only.
- Paste the full CLAUDE.md at the start of every Claude Code session.
- Applying changes: Andrew pastes into VS Code (Cmd+A -> Cmd+V -> Cmd+S), then hard-refreshes (Cmd+Shift+R).
- Backups: `cp -r cozydesk cozydesk_backup_MMDD` from AppDesignJourney directory before changes.

## Project Info
- App: ~/Desktop/Desktop/Work/AppDesignJourney/cozydesk
- Dev server: npm run dev (check terminal for port).
- GitHub Pages, repo a-grow/cozydesk. dev = active development, main = landing page only. Domain: cozydesk.app
- Stack: Vite + React (PWA). UI font: Nunito everywhere.

## Environment — CRITICAL (added Jun 3 2026)
- Project MUST live at ~/Developer/cozydesk — NOT on the iCloud-synced Desktop.
  iCloud sync on Desktop creates conflict-duplicate files (e.g. "useDeskState 2.js")
  and duplicates Vite's cache, causing stale builds and "fixes that don't show up."
- Old Desktop location is now a backup only. Do not work in it.

## File Structure
src/
  components/ — CalendarSticker, sidebar/MiniCalendar, MusicPlayer, StickyNote*, Reminders*, ReminderPaper* (* do not touch internals unless fixing that item's bugs)
  themes/ — themeRegistry.js (single source of config), ThemeContext.jsx, cozykawaii.jsx (main renderer ALL themes — in src/themes/ NOT src/themes/cozykawaii/), [theme]/widgets/ (calendar+clock), [theme]/stickynotes/ (notes + todo asset)
  hooks/useDeskState.js — all desk state, CRUD, undo/redo, persistence
  utils/audioManager.js — music audio singleton
  utils/soundManager.js — SFX singleton
  assets/ — backgrounds/, music/, sounds/, stickynotes/ (legacy fallback), cozydesk-logo.png

## ⭐ Size Model (DO NOT REGRESS)
SIZE = absolute pixels (window-independent). POSITION = ratios (xRatio/yRatio).
- Sticky notes: store `w` (px); always square. Base 180px.
- To-do papers: store absolute `w`/`h` from each theme's `todoBase` in themeRegistry.js.
- Render fallback: `item.w ?? item.wRatio * dimensions.width`.
- todoSize in themeRegistry is LEGACY — do not use for new logic.

## Font Rules
- UI font: Nunito only, everywhere.
- Patrick Hand: RETIRED — allowed only as user-selectable option in note/to-do font pickers.
- Fredoka One deprecated → use Fredoka. Steampunk sidebar labels: Cinzel Decorative. Lofi chalk: Caveat.
- Font-picker options: Caveat, Indie Flower, Shadows Into Light, Permanent Marker, Fredoka, Nunito.

## Sticky Note Rules
- Default 180×180px, locked aspect ratio, all themes.
- Color picker: 4 swatches only (blue, green, pink, yellow).
- Steampunk notes: all four colors are 703×634px.
- Steampunk text area: `{ top: '20%', left: '5%', right: '12%', bottom: '22%' }`

## To-Do List Rules
- Every theme needs a todo asset in its stickynotes/ folder, filename containing the word `todo`.
- Fallback: src/assets/stickynotes/todolist1.png — safety net only.
- todoBase per theme drives sizing (see themeRegistry.js).

## Theme System
All visual config lives in src/themes/themeRegistry.js — never hardcode theme names in components.
- Themes: Cozy Kawaii, Lo-Fi, Steampunk (more planned).
- cozykawaii.jsx is the main desk renderer for ALL themes — don't rename.
- New theme = add config entry + assets (incl. todoBase, sidebar --btn-bg/--btn-text/--btn-font).
- todoBase: kawaii { w:358, h:402 }, lofi { w:358, h:384 }, steampunk { w:358, h:519 }.

## Sticker Grid Rules
- NEVER show clock, calendar, todo, or stickynote assets in the sticker grid.
- Filter in src/themes/cozykawaii.jsx: exclude filenames containing 'clock', 'calendar', 'todo', 'stickynote'.
- Applies to ALL themes.

## Sound Effects System
- Singleton: src/utils/soundManager.js — mirrors audioManager.js pattern.
- localStorage key: cozydesk_sfx (boolean, default true).
- ALWAYS add new sounds to the SOUNDS array in soundManager.js before wiring triggers.
- SFX toggle renders in BOTH Sidebar.jsx and LofiSidebar.jsx, directly after MusicPlayer.
- Never duplicate sound logic outside soundManager.js.

### Sound Map
| Sound | Trigger |
|---|---|
| sfx_place_note | Sticky note dropped on desk |
| sfx_alert_box | Sticker, to-do list, or calendar dropped on desk |
| sfx_sticker_lift | Sticker dragged off sidebar |
| sfx_click_button | Save, My Desks, Settings buttons |
| sfx_save | Save slot |
| sfx_delete_whoosh | Delete anything |
| sfx_ping | Check off a reminder (ON only) |
| sfx_uhoh | Hit calendar or to-do list cap |
| sfx_timer_start | Pomodoro start |
| sfx_timer_end | Pomodoro complete |
| sfx_timer_reset | Pomodoro reset |
| sfx_undo_redo | Undo / Redo |
| sfx_clear_screen | Clear All confirmed |
| sfx_areyousure | Any confirmation popup appears |

## Music Player — NEVER BREAK
- MusicPlayer.jsx (UI) + utils/audioManager.js (singleton).
- Imported in BOTH Sidebar.jsx and LofiSidebar.jsx, right after the logo.
- Always starts paused. localStorage key: cozydesk_music.
- 9 tracks in src/assets/music/ (Pixabay, commercial-free). NEVER rename.

## Logo Rules — NEVER BREAK
- src/assets/cozydesk-logo.png, width 180px, centered, zIndex 1.
- Renders in BOTH Sidebar.jsx and LofiSidebar.jsx.

## Sidebar Rules — CRITICAL
- Never change sidebar fonts, icons, or colors unless explicitly asked.
- Never touch steampunk animated gears or lofi sidebar icon images.
- Buttons use CSS vars --btn-bg, --btn-text, --btn-font (use !important).
- Any sidebar UI change must be applied to BOTH Sidebar.jsx and LofiSidebar.jsx.

## Calendar System
- CalendarSticker.jsx = sticker wrapper. sidebar/MiniCalendar.jsx renders the grid.
- Per-theme config under theme.calendarTheme. Sidebar icon = theme.calendarTheme.image.
- contentArea — DO NOT change without measuring (DevTools + math).
- MiniCalendar fixed values: gridAutoRows 17px, gap 0, alignContent start, event dot bottom 3px.

## Save Slot Data Shape — Do Not Break
- Slots store: notes, stickers, papers, clocks, calendars, calendarEvents, reminders, remindersLayer, themeMode, remindersVisible, remindersPos.
- noteId = Date.now() — never regenerate on load.
- Keys: cozydesk_state_{theme} (auto-save), cozydesk_saved_{theme}_slot_{n} (named slots).

## Known Bugs — Queued
1. Live small-screen clamp — to-do clamp is spawn-time only; move to render-time so saved desks fit phones. Do before launch.
2. Launch maximized — PWA manifest to open maximized.
3. Resize warning popup — once-per-session popup when resizing below threshold.
4. Theme-switch carry-over — optional "bring my notes with me" when switching themes.
6. Theme carry-over — popup and carry not working reliably

Popup sometimes doesn't appear and to-do lists don't carry when switching themes.
Suspected root cause: ThemesSection falls back to useTheme().setTheme directly
instead of the wrapped version in cozykawaii.jsx. This means currentThemeName
arrives as undefined in ThemeContext.setTheme, causing
localStorage.getItem('cozydesk_state_undefined') to return null, hasContent=false,
and a silent switch with no popup and no carry.
Last attempted fix (NOT YET CONFIRMED): added fallback in ThemeContext.jsx:
const sourceTheme = currentThemeName || themeName;
const raw = localStorage.getItem(`cozydesk_state_${sourceTheme}`);
Also added themeName to setTheme useCallback deps: }, [themeName]);
Must verify fix works before closing this bug.
Secondary issue during testing: old corrupted data in cozydesk_state_steampunk
caused ghost to-do lists. Test pollution, not a real bug — clean localStorage
before every carry-over test.

## Stale PWA / Service Worker — KNOWN GREMLIN (added Jun 3 2026)
- CozyDesk is a PWA; the browser registers a service worker that aggressively caches the
  app on localhost. Stale symptoms: old version appears, hard-refresh doesn't help, broken
  images, "rising client:438" errors, fixes don't show.
- Manual fix: DevTools > Application > Service workers > Unregister + tick "Bypass for
  network"; then Application > Storage > Clear site data; then close the tab and reopen.
- PERMANENT FIX (still TODO): disable the PWA service worker in DEV mode only. Production
  behavior must stay unchanged.

## Intentionally Removed Features — Do Not Restore
- Calendar ↔ sticky note reverse sync popup (deleting calendar event prompting to delete from note) — removed intentionally. Do not restore or reference as a bug.
- Sticky notes do NOT carry over on theme switch — intentional. They are visual assets tied to each theme's aesthetic. Only to-do lists and calendar events travel.

## Key Learnings
- NEVER use localStorage.clear() in dev — it breaks Vite HMR and causes black screen.
  Safe clear command (run as one line in console):
  `Object.keys(localStorage).filter(k=>k.startsWith('cozydesk')).forEach(k=>localStorage.removeItem(k)); location.reload()`
- Before testing carry-over, always check and clear the pref key:
  `localStorage.getItem('cozydesk_carryover_pref')` — if 'yes' or 'no', remove it first
  or the popup will never show.
- The `rising client:438` error in DevTools is Vite HMR websocket noise. Harmless in dev,
  absent in production. Ignore it.
- Theme carry-over test sequence:
  1. Clear localStorage with safe command above
  2. Verify pref is null
  3. Kawaii: add to-do item + calendar event
  4. Switch to Lo-Fi → popup must appear
  5. Yes → to-do and calendar arrive on Lo-Fi
  6. Switch to Steampunk → popup again
  7. No → Steampunk clean
  8. Test Remember my choice for both Yes and No
  9. If popup doesn't show: add console.log in ThemeContext.setTheme to check what
     currentThemeName and sourceTheme resolve to — confirms if prop chain is broken.

## Pre-Launch Checklist
1. Warn users desks save locally (clearing browser data erases them).
2. Graceful handling if localStorage corrupts.
3. Test Safari/Firefox/mobile/Windows.
4. Run /securityreview in Claude Code.
5. Beta test with 3-5 users.
6. Handle the 5MB localStorage limit.

## Changelog
- May 30 2026 — Fixed sizing bug: notes/papers switched from window-ratio to absolute pixels; added todoBase per theme; render fallback heals old saves.
- Jun 2 2026 — Sound effects system built (soundManager.js singleton, 14 sounds, SFX toggle in both sidebars). Steampunk sticky note text area fixed: { top:'20%', left:'5%', right:'12%', bottom:'22%' }. All steampunk notes now 703×634px. Sticker grid now filters clock/calendar/todo/stickynote assets across all themes.
- Jun 2 2026 — Theme carry-over feature built. Popup asks to bring to-do lists and calendar events when switching themes. Sticky notes intentionally excluded (they belong to each theme's world). Calendar events merge with dedup. Papers/reminders merge by id. Pref stored in localStorage key: cozydesk_carryover_pref. Files: ThemeContext.jsx, cozykawaii.jsx, useDeskState.js, ThemesSection.jsx, Sidebar.jsx, LofiSidebar.jsx.

## Theme Carry-Over — UPDATE (Jun 3 2026)
- Calendar WIDGET now carries over on theme switch (not just events), so events are visible
  on the new theme without re-adding a calendar. Respects the 1-calendar-per-theme cap.
- Files: ThemeContext.jsx (snapshot now includes `calendars`), useDeskState.js
  (mergeCarryOver has a guarded calendar-merge block).
- The original carry-over was NEVER broken in code — the "popup doesn't appear" bug was the
  stale service worker serving old code. Confirmed working Jun 3 2026.