# CozyDesk — Claude Instructions
Last updated: Jun 3 2026. Read fully before touching any code.

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
- Backups: `cp -r cozydesk cozydesk_backup_MMDD` from the ~/Developer directory before changes.

## Project Info
- App: ~/Developer/cozydesk (moved off iCloud Desktop — see "Environment — CRITICAL")
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
6. RESOLVED Jun 3 2026 — Theme carry-over was never broken in code. The real cause was a
   stale PWA service worker serving old code on localhost. Carry-over confirmed working.

## Stale PWA / Service Worker — KNOWN GREMLIN (added Jun 3 2026)
- CozyDesk is a PWA; the browser registers a service worker that aggressively caches the
  app on localhost. Stale symptoms: old version appears, hard-refresh doesn't help, broken
  images, "rising client:438" errors, fixes don't show.
- Manual fix: DevTools > Application > Service workers > Unregister + tick "Bypass for
  network"; then Application > Storage > Clear site data; then close the tab and reopen.
- PERMANENT FIX (DONE Jun 3 2026): service worker now registers in production only. The
  registration script was moved out of index.html into src/main.jsx, guarded by
  `if (import.meta.env.PROD)`. Dev no longer registers a worker; production unchanged.

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

  # PART 1 — CLAUDE.md updates

## Changelog (add this entry)
- **Jun 4 2026** — (a) Steampunk sidebar to-do icon now theme-aware: `Sidebar.jsx` reads the active theme's todo asset from `themeStickyNotes` (filename contains `todo`), falling back to `assets/stickynotes/todolist1.png` — mirrors `ReminderPaper.jsx`. (b) Steampunk to-do text shifted left: `todoTextArea.left` `32% → 26%` in `themeRegistry.js`. (c) Storage-full warning shipped (#1): `useDeskState` exposes `storageFull`/`setStorageFull`; `saveThemeState` and `saveToSlot` now set the flag on a failed write instead of swallowing the error; dismissible popup added in `cozykawaii.jsx`.

## Sidebar Rules (add)
- The sidebar **to-do icon is theme-aware**: it reads the active theme's todo asset from `themeStickyNotes` (find the one whose filename includes `todo`), fallback `assets/stickynotes/todolist1.png`. Same pattern as `ReminderPaper.jsx`. New themes get the right icon automatically.

## Storage-Full Warning (new system — add)
- `useDeskState.js` exposes `storageFull` (bool) + `setStorageFull`. `saveThemeState` and `saveToSlot` set it `true` on a failed `localStorage` write. `cozykawaii.jsx` renders a dismissible popup when true (same style as the Clear All / carry-over modals).
- **KNOWN FOLLOW-UP (not urgent):** the popup can re-fire on every action when storage is genuinely full, and fires immediately in **Safari private mode** (where `setItem` throws). Planned softening: show once per session + private-mode-friendly wording.

## Known Issues (add)
- **Active theme not persisted across reload.** App always opens on Cozy Kawaii (`ThemeContext.jsx` `themeName` defaults to `'cozykawaii'`, never read from storage). Per-theme *desks* are saved; the *selected theme* is not. Minor launch UX item.

## Architecture / Performance Roadmap (agreed Jun 4 2026 — add as its own section)
**Order and caveats matter. Do NOT batch these. One at a time, backup + commit each.**

1. **DONE — Storage-full warning (#1).** See above.

2. **LAUNCH-BLOCKER — Production asset paths (#2).** Two SEPARATE jobs, not one find/replace:
   - **Logo** in `Sidebar.jsx`: `src="/src/assets/cozydesk-logo.png"` → static import (`import logo from '../assets/cozydesk-logo.png'`). Trivial.
   - **Toggle sounds** in `cozykawaii.jsx` `playToggleSound`: `new Audio('/src/assets/sounds/${name}.mp3')` uses a **dynamic filename** — a naive `new URL(..., import.meta.url)` will NOT reliably bundle it in Vite. Fix by folding the three toggle sounds (`pastel-click`, `lofi-pop`, `gear-shift`) into `soundManager.js`'s `SOUNDS` array and playing via `soundManager`. One sound system, not two.
   - **Why blocker:** `/src/...` paths only resolve in `npm run dev`. In the GitHub Pages / Tauri build the **logo vanishes** and the toggle sound silently fails.

3. **BEFORE LAUNCH (high value, low risk) — Lighter images / WebP (#6).**
   - One-time, **hand-checked** conversion of current PNGs. NO blind batch convert.
   - Quality control: cozy art is gradient/transparency-heavy; lossy WebP can smear gradients — review each asset, preserve alpha.
   - No new dependency for now (KISS). The asset glob already accepts `.webp`. Add an automated build pipeline only if theme count makes manual conversion a chore.

4. **AFTER LAUNCH / beta — Smoother saving / debounce auto-save (#3).** Medium risk — only safe WITH guardrails:
   - Debounce ONLY the background auto-save effect. Keep explicit Save-slot and theme-switch saves **immediate**.
   - Flush on `visibilitychange`/`pagehide`, NOT just `beforeunload` (`beforeunload` is unreliable on mobile PWAs — without this, debounce can *cause* the data loss it's meant to prevent).

5. **ANYTIME (trivial) — Theme-proof clock logic (#4).**
   - `useDeskState.js` `addStickerAtPosition`: replace `name.includes('cozyclock') || 'loficlock' || 'steampunkclock'` with generic `name.includes('clock')`.
   - Safe because `clock` is already a reserved filename keyword (sticker-grid filter + documented). Keep it documented.

6. **HOLD — Load art on demand / lazy-load (#5).** NOT a fix — a **project**. Defer until ~10+ themes.
   - Risks: turns the registry's *synchronous* asset arrays *async* → touches `ReminderPaper`, the sticker grid, the sidebar icon (broad footprint). Worsens the known `StickyNote` asset-timing race. Needs loading placeholders (avoid empty-world flash) + service-worker caching (offline themes). Partial payoff anyway (Tauri loads art from local disk).

7. **MINOR (verify first) — Possibly-unused deps** `react-draggable`, `framer-motion` in `package.json`. Confirm they're truly unused (framer-motion may live in a file not yet reviewed) before removing. Removing trims the bundle.

## On the Horizon (add)
- **Welcome / splash screen (app "pre-show"):** logo bloom → **theme carousel** (left/right arrows, FREE/price badges, **data-driven from the theme registry** so new themes auto-appear, optional "Coming soon" ghost card) → **first-run legal gate** (local-save warning + AI-art disclosure + Terms; scroll-to-bottom-then-agree; store acceptance + version in a localStorage key like `cozydesk_terms_v1`; skip for returning users). Concept mocked, not built.

## Legal / Pre-Launch Notes (add — NOT legal advice; finalize with a lawyer or Termly/iubenda)
- **No law requires disclosing that an app was *built* with AI.** AI-disclosure laws target: (a) chatbots telling users they're AI, (b) labeling AI-generated content *shown to users*, (c) training-data transparency for AI *model makers*. CozyDesk has none of these as user-facing AI. Only light touch: theme art is AI-generated → a simple "Artwork created with AI tools" line as goodwill, not obligation.
- **Documents to prepare:** Terms of Service / EULA; Privacy Policy (even for local-only storage — covers the "Get Early Access" email capture, Pixabay music, hosting); Refund Policy (you sell themes); Disclaimer of warranties + limitation of liability (pair with the local-save warning).
- **App stores:** if you wrap via Tauri/native, Apple & Google add their own requirements (privacy labels, in-app payment rules). The landing page advertises Desktop/iPhone/Android/iPad — know this before marketing those hard.
