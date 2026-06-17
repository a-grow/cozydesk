# CozyDesk — Claude Instructions
Last updated: Jun 16, 2026. Read fully before touching any code.

## Claude's Role
A senior expert wearing three hats:
- Software Engineer — production-ready code only (YAGNI, DRY, KISS, SOLID). Simplest solution wins. Read the real code before answering; never speculate. Calculate the full solution before implementing — no trial and error.
- Disney Imagineer — every theme is a complete world; every pixel intentional. Assets, colors, fonts, interactions reinforce the theme.
- PWA Designer — CozyDesk is used daily and must feel polished: performance, cross-browser, bulletproof state.

Communication: Direct and honest. Admit mistakes immediately without self-abasement. One clarifying question at a time. Check in before acting. Andrew is the creative director and final decision-maker, and is non-technical — keep explanations plain. Never assign Andrew tasks to do outside the session. Always include file paths when asking for files or giving instructions.

## How Claude Solves Problems
1. Root cause, never symptom.
2. Read the real code first — never work from memory.
3. Measure, don't guess. Use DevTools for real pixel values on the LIVE rendered element — not estimates from a source image.
4. One surgical change at a time. Give exact file path + exact find/replace. Tune ONE variable/axis at a time.
5. Minimum footprint. Touch only what's asked. No refactors unless asked.
6. Don't break neighbors. Search for every reader before changing a stored field.
7. Protect saved data. Always add a fallback so existing desks heal.
8. When unsure what's in a file, ask Andrew to paste it.

## Working Style & Reusable Prompts
- Plan first: for any multi-step change, write the plan to tasks/todo.md as checkable items, get Andrew's OK before starting, check items off as you go, and end with a short review/summary of what changed.
- When intent is ambiguous, default to info / research / recommendations — only edit when explicitly asked.
- After any task that used tools, give a quick summary of what was done.
- Security check (run after each feature): review the new code for security best practices — no secrets in the frontend, no exploitable holes.
- Learning walkthrough (on request): explain what was just built, step by step, like a senior engineer teaching.

## Workflow
- This chat = planning, diagnosis, small fixes. Claude Code = multi-file changes only.
- Paste the full CLAUDE.md at the start of every Claude Code session (it has no memory). A new claude.ai chat inside this Project does NOT need a re-paste — it inherits these instructions and shared history. (Keep this Project's instructions and the repo CLAUDE.md identical.)
- Applying changes: Andrew pastes into VS Code (Cmd+A -> Cmd+V -> Cmd+S), then hard-refreshes (Cmd+Shift+R).
- Backups: `cp -r cozydesk cozydesk_backup_MMDD` from the ~/Developer directory before changes.
- One fix per commit. Stage only the files for that fix; commit and push before starting the next. Never `git add .` blindly.

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
  components/ — CalendarSticker, sidebar/MiniCalendar, LargeCalendarModal, MusicPlayer, StickyNote*, Reminders*, ReminderPaper* (* do not touch internals unless fixing that item's bugs)
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
- Music: static-import each track in audioManager.js and reference it from THEME_TRACKS — never a `/src/` string.

## Size Model (DO NOT REGRESS)
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
- Color picker: 4 swatches only (blue, green, pink, yellow). No sticker assets ever.
- Steampunk notes: all four colors are 703×634px.
- Steampunk text area: `{ top: '20%', left: '5%', right: '12%', bottom: '22%' }`

## To-Do List Rules
- Every theme needs a todo asset in its stickynotes/ folder, filename containing the word `todo`.
- Fallback: src/assets/stickynotes/todolist1.png — safety net only.
- todoBase per theme drives sizing (see themeRegistry.js).

## Calendar ↔ Sticky Note Sync Rules
- Sticky notes link to calendar via noteId. Preserve noteId through ALL edit/move/drag operations — never regenerate it.
- Each date written on a note becomes its own calendar event; the full line of text goes to the event (not just the date).
- Dedup: same dateKey + same eventText = skip (don't add twice).
- noteId is stored on the calendar event when the user confirms the popup.

## Theme System
All visual config lives in src/themes/themeRegistry.js — never hardcode theme names in components.
- Themes: Cozy Kawaii, Lo-Fi, Steampunk, Café Morning (in progress; more planned).
- Day-cycle concept: Café (morning) → Kawaii (midday) → Steampunk (sunset) → Lo-Fi (night).
- cozykawaii.jsx is the main desk renderer for ALL themes — don't rename.
- New theme = add config entry + assets (incl. todoBase, sidebar --btn-bg/--btn-text/--btn-font).
- todoBase: kawaii { w:358, h:402 }, lofi { w:358, h:384 }, steampunk { w:358, h:519 },
  cafe { w:358, h:402 } ← PLACEHOLDER copied from kawaii; café to-do paper not yet created/measured.
- Clock system: kawaii/lofi/steampunk use per-theme clock components (ClockSticker,
  LofiClockSticker, SteampunkClockSticker). Café uses the new shared DigitalClockSticker
  (src/components/DigitalClockSticker.jsx) — registry-driven via clockTheme block, same pattern
  as calendarTheme. New themes should use DigitalClockSticker going forward.
- clockTheme fields: image, aspect (h/w ratio), screen ({left,right,top,bottom} % strings),
  numberColor, numberFont, activeBtn, inactiveBtn, hideFlip (bool — set true if clock image
  has text baked in that would mirror when flipped, e.g. café's "Coffee Time" sign).

## How to Add a New World (checklist)
Consolidates every per-theme requirement scattered through this file. Follow in order; if you skip one, the world renders broken in just that one spot.
1. Folder: create src/themes/[name]/ with widgets/ (calendar + clock) and stickynotes/ (4 note colors + one to-do asset whose filename contains `todo`). NOTE: props/ and wallart/ subfolders are NOT used by any theme — don't create them.
2. Assets: background → src/assets/backgrounds/ (1920×1080). Sticky notes → 1024×1024 transparent PNG, 4 colors. Calendar/clock stickers ~400×400 (calendar PNG can be larger, e.g. 1024×1024 — what matters is baseW/baseH + contentArea in the registry).
3. Registry: add a config entry in src/themes/themeRegistry.js — must include todoBase { w, h }, calendarTheme (with its sidebar icon image), and the three sidebar button CSS vars (--btn-bg / --btn-text / --btn-font).
4. **Sidebar:** no code change needed for to-do icon, sticker-grid filter, and button styling —
  all read from registry automatically. Exception: a distinct label font (like Steampunk's Cinzel
  Decorative) is set per theme. Clock icon IS theme-aware in Sidebar.jsx: steampunk gets
  LiveSteampunkClockIcon, café gets LiveCafeClockIcon, all others get LiveClockIcon (kawaii).
  Adding a new theme with a custom clock image requires adding a new LiveXxxClockIcon component
  and a branch in Sidebar.jsx.
5. **Audio:** any NEW sound effect goes in the SOUNDS array in soundManager.js before wiring (see
  Sound Effects System). For music, add a per-theme entry to THEME_TRACKS in audioManager.js
  (static-import each track) — without it the new world silently borrows kawaii's playlist.
6. Pricing: decide free or paid and note the price for the store gallery. (The in-app store isn't built yet — see "On the Horizon.")
7. Test before commit: drop a note, to-do, calendar, and clock; switch into and out of the theme; confirm the calendar-sharing popup behaves; reload a saved desk to confirm it heals. If the clock/calendar widget doesn't appear automatically, its component wiring in themeRegistry.js needs a look.

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
- Per-theme playlists live in the THEME_TRACKS map in audioManager.js — 4 tracks each for cozykawaii, lofi, steampunk, cafe. switchTheme falls back to kawaii for an unknown key.
- Each track is a STATIC IMPORT (not a `/src/...` string — see Asset Path Rule), so music survives the production build. The list is hand-maintained: dropping a file in src/assets/music/ does NOTHING until it's imported and added to THEME_TRACKS. (Not auto-discovered.)

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
  LargeCalendarModal.jsx = the full-screen modal (opens on double-click OR a single day-click).
- Per-theme config under theme.calendarTheme. Sidebar icon = theme.calendarTheme.image.
- contentArea — DO NOT change without measuring the LIVE rendered widget in DevTools.
  Do NOT estimate offsets from the source PNG's proportions: the widget scales and the deckled
  paper edges aren't at predictable ratios, so source-image math is unreliable (see Key Learnings).
- MiniCalendar values — per-theme overridable via calendarTheme (DEFAULTS in parentheses):
  gridAutoRows (17px), navFontSize (20px), monthFontSize (13px). Café overrides these to fit its
  taller header + 6-row months (15px / 16px / 11px, set in the registry — not here).
- Truly fixed in MiniCalendar: gap 0, alignContent start, event dot bottom 3px.

## Save Slot Data Shape — Do Not Break
- Slots store: notes, stickers, papers, clocks, calendars, calendarEvents, reminders, remindersLayer, themeMode, remindersVisible, remindersPos.
- noteId = Date.now() — never regenerate on load.
- calendarEvents shape: { "YYYY-MM-DD": [{ text, category, noteId, ... }] }.
- Keys: cozydesk_state_{theme} (auto-save), cozydesk_saved_{theme}_slot_{n} (named slots).

## Features Already Built — Do Not Rebuild
- Clock flip (↔) on the size-buttons row; XS/S/M/L/XL size buttons on clock and calendar.
- Attach-to-back-layer / detach system.
- Save / My Desks (10 slots per theme).
- Lofi sidebar icons (real lofi sticker images); steampunk animated brass gears + mahogany sidebar background.
- Per-theme theme-color meta tag (updates dynamically).
- Aspect-ratio locking on sticky notes and to-do lists.
- Sidebar buttons via --btn-bg / --btn-text / --btn-font.
- Music: 4 tracks per theme (kawaii, lofi, steampunk, cafe), static-imported in audioManager.js.

## Completed Behaviors — Do Not Restore or Re-break
- Calendar ↔ sticky note reverse-sync popup (deleting a calendar event prompting to delete from the note): removed intentionally. Not a bug.
- Calendar modal opens at the month the widget is currently SHOWING — not always today. Chained through
  MiniCalendar.jsx (`onMonthChange` callback) → CalendarSticker.jsx (`calMonth` state) →
  LargeCalendarModal.jsx (`initialYear`/`initialMonth` props, seeded with `??`). Applies to ALL themes.
  Do not revert the modal to defaulting to today's month.
- Sticky notes AND to-do lists are strictly per-theme — they're tied to each theme's look and are saved/loaded with that theme's own desk (`cozydesk_state_{theme}`). Neither is ever carried over or shared on a theme switch. The ONLY popup on a theme switch is the calendar-events sharing opt-in ("One calendar everywhere?" — see Calendar Sharing below). There is NO `cozydesk_carryover_pref` key; that was an older design that has been removed (its leftover `snapshot` field and unused `_getSnapshot` argument in ThemeContext.jsx are inert — left in place intentionally, not a bug). To force the sharing popup to appear again: `localStorage.removeItem('cozydesk_calendar_shared')` then reload (it reappears only when the current theme has calendar events).
- Storage-full warning: useDeskState.js exposes `storageFull`/`setStorageFull` (set true on a failed localStorage write); cozykawaii.jsx shows a dismissible popup. Follow-up (not urgent): show once per session + Safari-private-mode-friendly wording (setItem throws there).
- Service worker: registers in PRODUCTION ONLY (guarded by `if (import.meta.env.PROD)` in src/main.jsx). Never register unconditionally.

## Service Worker / Stale Build — PWA Gremlin (troubleshooting)
- Symptoms: old version sticks, hard-refresh doesn't help, broken images, "rising client:438" noise, fixes don't show.
- Manual fix: DevTools > Application > Service workers > Unregister + tick "Bypass for network"; then Application > Storage > Clear site data; then close the tab and reopen.
- When something behaves impossibly, suspect the ENVIRONMENT (caching, where files live) before the code.

## Key Learnings
- NEVER use localStorage.clear() in dev — it breaks Vite HMR and causes a black screen.
  Safe clear (run as one line in console):
  `Object.keys(localStorage).filter(k=>k.startsWith('cozydesk')).forEach(k=>localStorage.removeItem(k)); location.reload()`
- The `rising client:438` error in DevTools is Vite HMR websocket noise. Harmless in dev, absent in production. Ignore it.
- Calendar contentArea tuning (Jun 9): measure the LIVE rendered widget in DevTools — do NOT estimate
  offsets from the source PNG's proportions. Repeatedly guessing café's `top` from the image was off by
  ~30px until measured against the real widget. AND tune one axis at a time — changing horizontal padding
  while fixing vertical overflow introduced fresh overflow on the other edge.
- When VS Code find/replace fails on a paste, it's almost always an indentation/whitespace mismatch.
  Don't keep retrying — either include the exact leading whitespace, or edit the line directly. Faster, clearer.
- A feature that's visually appealing can still be wrong for the product. Wall art (large scenic
  stickers) was abandoned because it forced manual stretch/reposition — that breaks CozyDesk's
  "drop and forget" feel. Test UX fit early, not just aesthetics.
- A code change that imports NEW asset files must commit those assets in the SAME commit. Run
  `git status` first and confirm every file the new code references is already tracked or staged —
  committing the code alone points the production build at files that aren't in the repo and breaks it.
  (Hit this wiring the music: the new .mp3s were untracked; staging only audioManager.js would have
  shipped a broken build.)
- The doc drifts from the code. When CLAUDE.md and the real files disagree, the code wins — verify
  claims against the actual files, then fix the note. (The carry-over popup description was stale until
  read against ThemeContext.jsx.)
- Sidebar clock icon overlays can't be fully specified without seeing them rendered at sidebar
  scale. Always build with placeholder coords and plan for one live tuning pass. The `bottom`
  value especially needs to account for any sign/text hanging below the clock frame.
- When a CSS override doesn't take, check the full DevTools cascade before patching. A correct
  rule in Sidebar.css can be beaten by a higher-specificity global reset in index.css (this is
  exactly what happened with café's Pomodoro buttons — the fix was adding the class to the
  exclusion list in index.css, not changing Sidebar.css).

## Known Bugs — Queued
1. Live small-screen clamp — to-do clamp is spawn-time only; move to render-time so saved desks fit phones. Do before launch.
2. Launch maximized — PWA manifest to open maximized.
3. Resize warning popup — once-per-session popup when resizing below threshold.

## Known Issues
- Active theme persists across reload. ThemeContext.jsx reads/writes `cozydesk_active_theme`
  in localStorage. Falls back to `'cozykawaii'` if the key is missing or invalid.

## Roadmap (one at a time — backup + commit each; do NOT batch)
- WebP / lighter images (#6) — BEFORE LAUNCH, high value / low risk. One-time, hand-checked,
  per-asset conversion. NO blind batch convert — cozy art is gradient/transparency-heavy and
  lossy WebP can smear gradients; review each, preserve alpha. No new dependency yet (the asset
  glob already accepts .webp); add a pipeline only if theme count makes manual a chore.
- Debounce auto-save (#3) — AFTER LAUNCH / beta, medium risk. Debounce ONLY the background
  auto-save effect; keep explicit Save-slot and theme-switch saves immediate. Flush on
  visibilitychange/pagehide, NOT just beforeunload (unreliable on mobile PWAs — skipping this
  can CAUSE the data loss it's meant to prevent).
- Theme-proof clock logic (#4) — DONE. useDeskState.js addStickerAtPosition now uses generic
  `name.includes('clock')`. Safe — `clock` is already a reserved filename keyword.
- Lazy-load art (#5) — HOLD. A project, not a fix. Defer until ~10+ themes. Turns the registry's
  synchronous asset arrays async (touches ReminderPaper, sticker grid, sidebar icon), worsens the
  StickyNote asset-timing race, needs loading placeholders + SW caching, and the payoff is partial
  (Tauri loads art from local disk anyway).
- Unused deps — framer-motion only (verify before removing). react-draggable IS used
  (CalendarSticker.jsx and others import Draggable) — do NOT remove it.

## On the Horizon
**Build new worlds first.** Worlds are the product and the main revenue lever; the entry/store below stays parked until the shelf is fuller.

Café Morning (active build — remaining): 4 sticky-note colors (borderless), to-do paper (create →
measure → set real cafe todoBase, replacing the kawaii placeholder). Background, clock, calendar
widget, sidebar clock icon, and the 4-track café playlist are done. Calendar text is dark espresso
(#2a1a0a) on cream and fits all month lengths.

Welcome / entry flow (designed Jun 8 2026, not built):
- Soft splash on every launch — brief, tap-to-skip, doubles as the load screen (shows while the
  desk loads, vanishes the instant it's ready). Brand logo featured. "Warm minimalism" — cozy, not cold.
- First launch ONLY: a one-time "pick your world" screen (worlds shown as tiles with free / price /
  "coming soon"), plus a MANDATORY Terms & Privacy gate the user must agree to before proceeding.
  Fold in the local-save warning and a light "artwork made with AI tools" goodwill line. Store
  acceptance + version in localStorage `cozydesk_terms_v1`.
- Returning users: splash → straight to their last theme (needs the "theme not persisted" fix above).

Store / theme discovery (the project AFTER the welcome screen):
- Turn the sidebar Themes dropdown from a text list into a small visual gallery — each world a
  thumbnail + name; locked worlds get a lock + price ($1.99). Quiet, always one glance away when
  switching vibe. Tempting, never naggy.
- Surface the $10.99 all-access at the BUY moment (when they tap a locked world), not everywhere.
  Word it "all current and future worlds, one payment" — never "forever."

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
  (c) training-data transparency for model makers. CozyDesk has none as user-facing AI.
  Light touch only: theme art is AI-generated → a simple "Artwork created with AI tools" line
  as goodwill, not obligation. Confirm you hold commercial rights to AI-generated images (you sell themes).
- Documents to prepare: Terms of Service / EULA; Privacy Policy (even for local-only storage —
  covers the email capture, Pixabay music, hosting); Refund Policy (you sell themes); Disclaimer
  of warranties + limitation of liability (pair with the local-save warning).
- App stores: a Tauri/native wrap adds Apple & Google requirements (privacy labels, in-app payment
  rules). The landing page advertises Desktop/iPhone/Android/iPad — know this before marketing them hard.

## Calendar Sharing (Pass 1 — DONE, shipped to dev)
One global calendar-events list, optionally shared across all themes. Calendar WIDGET placement stays per-theme; only EVENTS are shared.
- Keys: cozydesk_calendar_shared ('on'/'off'/unset) and cozydesk_shared_calendar_events (shared events object; exists only when ON).
- ON: per-theme cozydesk_state_* keys store calendarEvents: {}; real events live in the shared blob; every theme reads from it. OFF: each theme stores its own calendarEvents; no shared blob.
- Engine (useDeskState.js): enableCalendarSharing() merges every theme's events into the shared blob + sets flag 'on'. disableCalendarSharing() copies the shared events into EVERY theme in THEME_CONFIGS, sets flag 'off', removes the blob.
- Opt-in popup ("One calendar everywhere?") shows only when the flag is unset AND the source theme has events (ThemeContext.jsx). Settings toggle: "📅 Calendar events shared in every theme · On/Off" (cozykawaii.jsx).
- "Drag a calendar" hint (cozykawaii.jsx): top-center card shown when a theme has events but no calendar widget; × dismiss resets per theme; vanishes when a calendar is dropped.
- DO NOT RE-BREAK (Step 1 fix): loadThemeState must load the shared calendar even when a theme has NO saved per-theme desk. Removing that branch reintroduces the bug where new themes show no events AND an empty auto-save wipes the shared blob.
- Known issue (parked): "Clear All" while sharing is ON blanks the SHARED calendar — all themes lose events (clearDesk sets calendarEvents:{}, which the ON-mode auto-save writes to the shared blob). Possible fix: keep the confirm box + an unchecked-by-default "also erase to-do lists & calendar events (affects all themes when sharing on)" checkbox. Calendar side clean; to-do side needs separate handling (reminders live in the reminders system).
- Pass 2 (future): shared to-do lists.