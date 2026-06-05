# CozyDesk — Claude Instructions
Last updated: Jun 5 2026. Read fully before touching any code.

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
- One fix per commit. Stage only the files for that fix; commit and push before starting the next.

## Project Info
- App: ~/Developer/cozydesk (moved off iCloud Desktop — see "Environment — CRITICAL")
- Dev server: npm run dev (check terminal for port).
- GitHub Pages, repo a-grow/cozydesk. dev = active development, main = landing page only. Domain: cozydesk.app
- Stack: Vite + React (PWA). UI font: Nunito everywhere.

## Environment — CRITICAL
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

## Asset Path Rule — CRITICAL (production builds)
- NEVER reference assets with a literal `/src/...` path in code (e.g. `src="/src/assets/..."`
  or `new Audio('/src/assets/...')`). Those resolve ONLY in `npm run dev`; in the GitHub Pages
  / Tauri build the asset silently vanishes.
- Images: use a static import (`import logo from '../assets/cozydesk-logo.png'`).
- Sounds: route through soundManager (see Sound Effects System) — never `new Audio()` on a `/src/` path.

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
- Play via `soundManager.play('sfx_name')`. Never `new Audio()` outside soundManager.
- SFX toggle renders in BOTH Sidebar.jsx and LofiSidebar.jsx, directly after MusicPlayer.
- Never duplicate sound logic outside soundManager.js.

### Sound Map
| Sound | Trigger |
|---|---|
| sfx_place_note | Sticky note dropped on desk |
| sfx_alert_box | Sticker, to-do list, or calendar dropped on desk |
| sfx_sticker_lift | Sticker dragged off sidebar |
| sfx_click_button | Save / My Desks / Settings buttons; sidebar show-hide toggle |
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
- Tracks live in src/assets/music/ (Pixabay, commercial-free). NEVER rename — original filenames are the paper trail.

## Logo Rules — NEVER BREAK
- src/assets/cozydesk-logo.png, width 180px, centered, zIndex 1.
- Referenced via static import (NOT a `/src/...` string — see Asset Path Rule).
- Renders in BOTH Sidebar.jsx and LofiSidebar.jsx.

## Sidebar Rules — CRITICAL
- Never change sidebar fonts, icons, or colors unless explicitly asked.
- Never touch steampunk animated gears or lofi sidebar icon images.
- Buttons use CSS vars --btn-bg, --btn-text, --btn-font (use !important).
- Any sidebar UI change must be applied to BOTH Sidebar.jsx and LofiSidebar.jsx.
- To-do icon is theme-aware: Sidebar.jsx reads the active theme's todo asset from
  themeStickyNotes (filename contains `todo`), fallback assets/stickynotes/todolist1.png.
  Same pattern as ReminderPaper.jsx. New themes get the right icon automatically.

## Calendar System
- CalendarSticker.jsx = sticker wrapper. sidebar/MiniCalendar.jsx renders the grid.
- Per-theme config under theme.calendarTheme. Sidebar icon = theme.calendarTheme.image.
- contentArea — DO NOT change without measuring (DevTools + math).
- MiniCalendar fixed values: gridAutoRows 17px, gap 0, alignContent start, event dot bottom 3px.

## Save Slot Data Shape — Do Not Break
- Slots store: notes, stickers, papers, clocks, calendars, calendarEvents, reminders, remindersLayer, themeMode, remindersVisible, remindersPos.
- noteId = Date.now() — never regenerate on load.
- Keys: cozydesk_state_{theme} (auto-save), cozydesk_saved_{theme}_slot_{n} (named slots).

## Storage-Full Warning
- useDeskState.js exposes `storageFull` (bool) + `setStorageFull`. `saveThemeState` and
  `saveToSlot` set it true on a failed localStorage write. cozykawaii.jsx renders a
  dismissible popup when true (same style as the Clear All / carry-over modals).
- KNOWN FOLLOW-UP (not urgent): the popup can re-fire on every action when storage is
  genuinely full, and fires immediately in Safari private mode (where setItem throws).
  Planned softening: show once per session + private-mode-friendly wording.

## Stale PWA / Service Worker — KNOWN GREMLIN
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

## Theme Carry-Over (DONE — working)
- On theme switch, a popup asks whether to bring to-do lists and calendar events to the new
  theme. The calendar WIDGET carries over alongside its events (respects the 1-calendar-per-theme
  cap), so events are visible without re-adding a calendar. Sticky notes intentionally excluded.
- Calendar events merge with dedup; papers/reminders merge by id. Pref stored in localStorage
  key: cozydesk_carryover_pref.
- Files: ThemeContext.jsx (snapshot includes `calendars`), useDeskState.js (mergeCarryOver
  has a guarded calendar-merge block), ThemesSection.jsx, Sidebar.jsx, LofiSidebar.jsx.
- Testing note: to force the popup, clear the pref first —
  `localStorage.removeItem('cozydesk_carryover_pref')` then reload.

## Key Learnings
- NEVER use localStorage.clear() in dev — it breaks Vite HMR and causes black screen.
  Safe clear command (run as one line in console):
  `Object.keys(localStorage).filter(k=>k.startsWith('cozydesk')).forEach(k=>localStorage.removeItem(k)); location.reload()`
- The `rising client:438` error in DevTools is Vite HMR websocket noise. Harmless in dev,
  absent in production. Ignore it.
- When something behaves impossibly (fixes don't show, old version reappears), suspect the
  ENVIRONMENT (where files live, what's caching them) before the code.

## Known Bugs — Queued
1. Live small-screen clamp — to-do clamp is spawn-time only; move to render-time so saved desks fit phones. Do before launch.
2. Launch maximized — PWA manifest to open maximized.
3. Resize warning popup — once-per-session popup when resizing below threshold.

## Known Issues
- Active theme not persisted across reload. App always opens on Cozy Kawaii
  (ThemeContext.jsx `themeName` defaults to `'cozykawaii'`, never read from storage).
  Per-theme desks are saved; the selected theme is not. Minor launch UX item.

## Architecture / Performance Roadmap (agreed Jun 4 2026)
**Order and caveats matter. Do NOT batch these. One at a time, backup + commit each.**

1. **DONE (Jun 4) — Storage-full warning (#1).** See "Storage-Full Warning" section.

2. **DONE (Jun 5) — Production asset paths (#2), the launch-blocker.**
   - Logo in Sidebar.jsx now uses a static import instead of the dev-only `/src/...` path.
   - Toggle sound in cozykawaii.jsx `playToggleSound` now calls `soundManager.play('sfx_click_button')`.
     The old `new Audio('/src/assets/sounds/${theme.sound}.mp3')` pointed at files that never
     existed (pastel-click/lofi-pop/gear-shift were never created), so the toggle had been
     silently failing — now it plays. No new sound files added; soundManager.js untouched.
   - General rule extracted from this: see "Asset Path Rule — CRITICAL".

3. **BEFORE LAUNCH (high value, low risk) — Lighter images / WebP (#6).**
   - One-time, hand-checked conversion of current PNGs. NO blind batch convert.
   - Quality control: cozy art is gradient/transparency-heavy; lossy WebP can smear gradients —
     review each asset, preserve alpha.
   - No new dependency for now (KISS). The asset glob already accepts `.webp`. Add an automated
     pipeline only if theme count makes manual conversion a chore.

4. **AFTER LAUNCH / beta — Smoother saving / debounce auto-save (#3).** Medium risk — only safe WITH guardrails:
   - Debounce ONLY the background auto-save effect. Keep explicit Save-slot and theme-switch saves immediate.
   - Flush on `visibilitychange`/`pagehide`, NOT just `beforeunload` (`beforeunload` is unreliable on
     mobile PWAs — without this, debounce can CAUSE the data loss it's meant to prevent).

5. **ANYTIME (trivial) — Theme-proof clock logic (#4).**
   - useDeskState.js `addStickerAtPosition`: replace `name.includes('cozyclock') || 'loficlock' || 'steampunkclock'`
     with generic `name.includes('clock')`.
   - Safe because `clock` is already a reserved filename keyword (sticker-grid filter + documented). Keep it documented.

6. **HOLD — Load art on demand / lazy-load (#5).** NOT a fix — a project. Defer until ~10+ themes.
   - Risks: turns the registry's synchronous asset arrays async → touches ReminderPaper, the sticker grid,
     the sidebar icon (broad footprint). Worsens the known StickyNote asset-timing race. Needs loading
     placeholders + service-worker caching. Partial payoff anyway (Tauri loads art from local disk).

7. **MINOR (verify first) — Possibly-unused deps** `react-draggable`, `framer-motion` in package.json.
   Confirm they're truly unused (framer-motion may live in a file not yet reviewed) before removing.

## On the Horizon
- Welcome / splash screen (app "pre-show"): logo bloom → theme carousel (left/right arrows,
  FREE/price badges, data-driven from the theme registry so new themes auto-appear, optional
  "Coming soon" ghost card) → first-run legal gate (local-save warning + AI-art disclosure + Terms;
  scroll-to-bottom-then-agree; store acceptance + version in a localStorage key like
  `cozydesk_terms_v1`; skip for returning users). Concept mocked, not built.
- New 10th music track `kawaii-cavnai-Mochi Tea Party.mp3` sitting in src/assets/music/ but NOT
  yet committed or wired in. Verify the player auto-discovers it, test it plays, then commit
  as its own "Add track" commit.

## Pre-Launch Checklist
1. Warn users desks save locally (clearing browser data erases them).
2. Graceful handling if localStorage corrupts.
3. Test Safari/Firefox/mobile/Windows.
4. Run /securityreview in Claude Code.
5. Beta test with 3-5 users.
6. Handle the 5MB localStorage limit.

## Legal / Pre-Launch Notes (NOT legal advice; finalize with a lawyer or Termly/iubenda)
- No law requires disclosing that an app was BUILT with AI. AI-disclosure laws target:
  (a) chatbots telling users they're AI, (b) labeling AI-generated content SHOWN to users,
  (c) training-data transparency for AI model makers. CozyDesk has none as user-facing AI.
  Light touch only: theme art is AI-generated → a simple "Artwork created with AI tools" line
  as goodwill, not obligation.
- Documents to prepare: Terms of Service / EULA; Privacy Policy (even for local-only storage —
  covers the "Get Early Access" email capture, Pixabay music, hosting); Refund Policy (you sell
  themes); Disclaimer of warranties + limitation of liability (pair with the local-save warning).
- App stores: if you wrap via Tauri/native, Apple & Google add their own requirements (privacy
  labels, in-app payment rules). The landing page advertises Desktop/iPhone/Android/iPad — know
  this before marketing those hard.

## Changelog
- Jun 5 2026 — Shipped #2 (production asset paths), the launch-blocker. Logo → static import; toggle sound → soundManager.play('sfx_click_button') (old path targeted nonexistent files). Banked last session's storage-full fix (#1) that was uncommitted. Added "Asset Path Rule — CRITICAL". CLAUDE.md consolidated/deduplicated.
- Jun 4 2026 — Steampunk sidebar to-do icon now theme-aware (reads themeStickyNotes). Steampunk to-do text shifted left: todoTextArea.left 32% → 26%. Storage-full warning shipped (#1).
- Jun 3 2026 — Service worker now registers in production only (moved to src/main.jsx behind import.meta.env.PROD). Project relocated off iCloud to ~/Developer/cozydesk. Calendar widget now carries over on theme switch (not just events). Confirmed carry-over was never broken in code — the bug was a stale service worker.
- Jun 2 2026 — Sound effects system built (soundManager.js singleton, SFX toggle in both sidebars). Steampunk note text area fixed; all steampunk notes 703×634px. Sticker grid filters clock/calendar/todo/stickynote assets across all themes. Theme carry-over feature built.
- May 30 2026 — Fixed sizing bug: notes/papers switched from window-ratio to absolute pixels; added todoBase per theme; render fallback heals old saves.
