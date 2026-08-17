# CozyDesk — Claude Instructions
Last updated: Aug 17, 2026 (v1.3.3 to-do scroll + unlimited items; v1.3.4 My Desks three-choice fork owns saving; v1.3.5 backup "saved to Downloads" messages + theme-independent fork buttons). Read fully before touching any code.

## Claude's Role
A senior expert wearing three hats:
- Software Engineer — production-ready code only (YAGNI, DRY, KISS, SOLID). Simplest solution wins. Read the real code before answering; never speculate. Calculate the full solution before implementing — no trial and error.
- Disney Imagineer — every theme is a complete world; every pixel intentional. Assets, colors, fonts, interactions reinforce the theme.
- PWA Designer — CozyDesk is used daily and must feel polished: performance, cross-browser, bulletproof state.

Communication: Direct and honest. Admit mistakes immediately without self-abasement. One clarifying question at a time. Check in before acting. Andrew is the creative director and final decision-maker, and is non-technical — keep explanations plain. Never assign Andrew tasks to do outside the session. Always include file paths when asking for files or giving instructions.

## How Claude Solves Problems
1. Root cause, never symptom.
2. Read the real code first — never work from memory. And don't stop at the relevant line: TRACE it. Follow the actual values and execution path. A line can look correct and still never run, or be the victim rather than the cause (see Key Learnings — pin bug, cross-theme save bug).
3. Measure, don't guess. Use DevTools for real pixel values / the real cascade on the LIVE rendered element. When a behavior is reported broken, get a quick live test before asserting it's fine.
4. One surgical change at a time. Give exact file path + exact find/replace. Tune ONE variable/axis at a time.
5. Minimum footprint. Touch only what's asked. No refactors unless asked.
6. Don't break neighbors. Search for every reader before changing a stored field.
7. Protect saved data. Always add a fallback so existing desks heal.
8. When unsure what's in a file, ask Andrew to paste it — never edit from a stale copy.

## Working Style
- Plan first: for any multi-step change, agree the plan with Andrew before starting. When intent is ambiguous, default to info / research / recommendations — only edit when explicitly asked.
- After any task that used tools, give a quick summary of what was done.
- Security check (after each feature): review new code for security best practices — no secrets in the frontend, no exploitable holes.

## Claude Code Prompt Rules — REQUIRED PREAMBLE
This chat = planning, diagnosis, small single-file fixes (given as exact find/replace for VS Code). Claude Code = multi-file changes, or a new file + edits.

Andrew commits, tests, and pushes — Claude Code NEVER does. Every Claude Code prompt MUST begin with the HARD RULES block below. (Evidence: the one prompt that omitted it committed and pushed after being told not to, started a dev server, tried to install Playwright, and created stray files. Every prompt that included it behaved perfectly.)

    ## HARD RULES — READ FIRST, NO EXCEPTIONS
    - Do NOT run git add, git commit, or git push. Andrew commits himself AFTER he tests.
    - Do NOT install any package or run browser automation (no playwright, puppeteer, npm install).
    - Do NOT start a dev server. Andrew tests manually.
    - Do NOT create, modify, or write to any file not explicitly named in this prompt
      (no AGENTS.md, no tasks/todo.md, no settings files).
    - Make ONLY the edits listed. When done, STOP and report exactly what changed, then wait.

Also when writing Claude Code prompts:
- Give EXACT find/replace (you've already read the file). Never vague "create an array / rewrite the function" steps.
- Do NOT include a fake "@claude.ai/claude-code" header. Claude Code auto-loads CLAUDE.md from the repo.

## Workflow
- A new claude.ai chat inside this Project inherits these instructions and shared history — no re-paste needed. Keep this Project's instructions and the repo CLAUDE.md identical.
- Applying single-file changes: Andrew pastes into VS Code (Cmd+A → Cmd+V → Cmd+S), then hard-refreshes (Cmd+Shift+R).
- Backups before major changes: from home, real date pre-filled → `cd ~` then `cp -r ~/Developer/cozydesk ~/Developer/cozydesk_backup_MMDD`. NEVER back up from inside the cozydesk folder. Hand over the command with the real date already filled in (e.g. `_0811`), never a literal `MMDD` token.
- One fix per commit. Stage only that fix's files by name; run `git status` before AND after staging. NEVER `git add .`. Every git command anchored to `cd ~/Developer/cozydesk`. For a batch of small tested changes, still commit one-per-fix (clean history) but PUSH once at the end (rapid pushes cause harmless deploy cancellations; newest deploy contains all prior commits).
- Old `cozydesk_backup_*` folders in `~/Developer` show up in project-wide search — ignore any result whose path contains `cozydesk_backup_`.

## Project Info
- App: ~/Developer/cozydesk. Mac: "Minty."
- Dev server: `npm run dev` (check terminal for port; usually 5173).
- GitHub Pages, repo a-grow/cozydesk. `dev` = active development AND the production branch — every push to `dev` auto-deploys to app.cozydesk.app. `main` in this repo is stale/unused. Landing page lives in the separate repo a-grow/cozydesk-landing (`main`).
- Stack: Vite + React (PWA). UI font: Nunito everywhere.
- Hosting is 100% free and needs nothing running on Andrew's end. Users each run their own copy; deployed updates reach them on next open (once the service worker is correct — see below).

## Environment — CRITICAL
- Project MUST live at ~/Developer/cozydesk — NOT on the iCloud-synced Desktop. iCloud sync creates conflict-duplicate files ("useDeskState 2.js") and duplicates Vite's cache → stale builds. Old Desktop location is backup-only.
- ALWAYS `cd ~/Developer/cozydesk` before running `claude` — it once opened in the parent folder, exposing every project. Verify the "Accessing workspace" line before answering the trust prompt.

## Deployment — CRITICAL
- Push to `dev` → GitHub Actions (`.github/workflows/deploy.yml`) builds with Vite → publishes `dist` → live in ~2 minutes. Treat "push" as "publish."
- `public/CNAME` MUST contain `app.cozydesk.app`. If it drifts, the custom domain gets wiped on every deploy.
- The `github-pages` environment must allow the `dev` branch (Settings → Environments → github-pages → Deployment branches). Without that rule the build passes and the deploy fails.
- Bump the `package.json` version before each deploy — Settings shows it live, so bug reports name the build.
- After pushing, check `github.com/a-grow/cozydesk/actions`. A green `build` job with a red `deploy` job = permissions/config, not code.
- `git push` printing "Everything up-to-date" means the COMMIT never happened. Verify with `git log --oneline -3` after every push.
- A rejected push usually means the remote has a commit you don't (often a GitHub-generated CNAME commit). `git fetch` + check `origin` before acting.
- Landing + legal pages deploy separately from `a-grow/cozydesk-landing` (`main`, root). Setting a custom domain there creates a GitHub-authored CNAME commit — `git pull --rebase` before pushing.
- Service worker only runs in the production build — a cache/SW fix can't be fully tested in `npm run dev`; verify after deploy.

## Delivery Model (LIVE)
- CozyDesk is a **website**, shipped as a PWA. There is NO downloadable installer. "Install" is the browser's own button (Chrome/Edge one-click; Safari File → Add to Dock; Firefox CANNOT install PWAs) — it gives the app a dock icon and its own window. Same pattern as Excalidraw, Photopea, Figma.
- **App LIVE at `https://app.cozydesk.app`** — built from `a-grow/cozydesk`, branch `dev`.
- **Landing page at `https://cozydesk.app`** — separate repo `a-grow/cozydesk-landing`, branch `main`, root.
- WHY TWO REPOS: GitHub Pages allows only ONE custom domain per repository. The landing page was moved out so the app repo could own `app.cozydesk.app`.
- Legal pages live on the landing repo: `cozydesk.app/legal/terms.html`, `/legal/privacy.html`, `/legal/refund.html`. `local-save-warning.md` stays as in-app UI copy, not a page.
- Landing copy must lead with "Open CozyDesk," with "Install" as a small secondary line. Never "Download for Mac" (that would be the Tauri path).
- Tauri (true `.dmg`/`.exe`, silent auto-save to a folder) is DEFERRED — ~$99/yr Apple signing + notarization. Revisit only if demand proves it.
- Desktop-first. Phone/tablet responsive pass deferred.

## Data Model (understand before touching persistence)
- All user data lives in `localStorage` on the user's machine — NOT the cloud. Keys prefixed `cozydesk`.
- A normal app update/restart/reinstall does NOT touch it. Only the user clearing site data / cookies erases it. Known, respectable local-first pattern (Excalidraw ships it).
- Mitigations shipped: (1) local-save warning in the My Desks backup UI + onboarding; (2) Backup/Restore.
- A browser app CANNOT silently auto-save to a folder (sandbox). Every save-to-disk needs a user click. That's why backup is manual (one click), not automatic.
- NEVER `localStorage.clear()` in dev (breaks Vite HMR → black screen). Safe clear: `Object.keys(localStorage).filter(k=>k.startsWith('cozydesk')).forEach(k=>localStorage.removeItem(k)); location.reload()`.

## My Desks Fork (SHIPPED v1.3.4 — do not re-break)
- The sidebar button is now `💾 My Desks` (disk icon, both sidebars; icon matches the modal title). The old bottom `SAVE` button was REMOVED from both sidebars — My Desks now OWNS saving.
- `SavedDesksModal.jsx` holds a `screen` state: 'fork' | 'load' | 'backup'. Fork screen shows three choices: Save current desk (→ closes modal, opens the existing SavePopup via `onSaveCurrent` prop passed from each sidebar — keeps SavePopup's `currentDesk` overwrite logic intact), Load a saved desk (→ slot list), Backup & Restore / All desks in all worlds (→ backup screen). Non-fork screens show a `‹` back arrow in the header.
- `SavedDesksSection.jsx` takes `screen` ('load' default) and renders ONLY the slot list on 'load', ONLY the backup UI on 'backup'.
- Fork buttons are THEME-INDEPENDENT ON PURPOSE: fixed cozy tan `#e9dcc9` bg / `#4b3b2a` text (Load + Backup), honey-amber gradient for the Save hero. Do NOT wire them to `--sb-card`/`--sb-heading` — those swing per theme and caused the white-button saga (see Key Learnings). Sublabel is fixed `#7a5a3a`.
- Orphaned CSS after this change (queued cleanup): `.sds-save-current-btn`, `.sb-action-save`, `.lofi-save-btn`.

## Backup / Restore (SHIPPED — do not re-break)
- `src/utils/backupManager.js`: `hasBackupData()`, `downloadBackup()` (dumps every `cozydesk`-prefixed localStorage key into one downloaded JSON with a `_marker: 'cozydesk-backup'`), `restoreFromFile(file)` (validates `_marker`, then clears all cozydesk keys and rewrites from the file — a full REPLACE, not a merge).
- UI in `src/components/sidebar/SavedDesksSection.jsx`, now gated by a `screen` prop ('load' | 'backup') set by the My Desks fork (see "My Desks Fork"). Backup screen: warning line + "Save a backup file" (green) + a restore-helper line ("Look for cozydesk-backup-….json in your Downloads folder…") + "Restore from a backup file" (blue). Save disabled only when zero cozydesk data exists anywhere. Restore validates → polite refusal on bad file → "replace current desks?" confirm → success msg → auto-reload after ~1s. After a save, a confirmation shows the real dated filename ("✓ Saved to your Downloads folder as cozydesk-backup-YYYY-MM-DD.json…").
- Browser sandbox CANNOT choose the download folder or pre-open it on restore. The fix is CLEAR WORDS (tell users it lands in Downloads + name the file so Spotlight finds it even if moved), NOT code. Same limit family as the PWA-install lesson.
- Backup is GLOBAL (all themes + current desk + settings in one file), not per-theme.
- Warning text uses `var(--sb-heading)` so it's readable on all four themes (NOT a hardcoded color).
- Parked one-liner: add HHMM to the backup filename so same-day backups don't collide as `(1).json`.

## Asset Path Rule — CRITICAL (production builds)
- NEVER reference assets with a literal `/src/...` path (resolves only in dev; silently vanishes in the GitHub Pages build).
- Images: static import (`import logo from '../assets/cozydesk-logo.png'`). Sounds: route through soundManager. Music: static-import each track in audioManager.js and reference from THEME_TRACKS.

## Service Worker / Cache (do not regress)
- `src/main.jsx` registers `/sw.js` in PRODUCTION ONLY (`if (import.meta.env.PROD)`). Never unconditionally.
- `public/sw.js` serves the **app shell network-first** (navigation / `/` / `index.html` / `manifest.json`) and **hashed assets cache-first**. This is what lets deployed updates actually reach installed users. Cache name is versioned (`cozydesk-vN`); bump N to force old caches to clear. DO NOT revert to cache-first for the app shell.
- Manual unstick: DevTools > Application > Service workers > Unregister + "Bypass for network"; then Clear site data; close tab, reopen.
- When something behaves impossibly (fixes don't show, broken images, "rising client:438" noise — that last one is harmless Vite HMR websocket noise), suspect the ENVIRONMENT (caching, file location) before the code.

## Error Boundary (SHIPPED — do not re-break)
- `src/ErrorBoundary.jsx` (class component — error boundaries must be) wraps the app in `main.jsx`. On any render crash it shows a warm cozy card with a "Reload CozyDesk" button and text that explicitly steers users AWAY from clearing browser data. Self-contained inline styles (no theme/CSS dependency, since those could be what crashed).

## Size Model (DO NOT REGRESS)
SIZE = absolute pixels (window-independent). POSITION = ratios (xRatio/yRatio).
- Sticky notes: store `w` (px); always square. Base 180px.
- To-do papers: store absolute `w`/`h` from each theme's `todoBase` in themeRegistry.js.
- Render fallback: `item.w ?? item.wRatio * dimensions.width`.
- `todoSize` in themeRegistry is LEGACY — do not use for new logic.

## Font Rules
- UI font: Nunito only, everywhere.
- Patrick Hand: RETIRED — allowed only as a user-selectable option in note/to-do font pickers. KNOWN VIOLATION (queued cleanup): ContextMenu.jsx still sets `fontFamily: 'Patrick Hand'` — one-line fix, its own commit.
- Fredoka One deprecated → use Fredoka. Steampunk sidebar labels: Cinzel Decorative. Lofi chalk: Caveat.
- Font-picker options: Caveat, Indie Flower, Shadows Into Light, Permanent Marker, Fredoka, Nunito.
- The whole Pomodoro widget's text is now forced to Nunito (timer digits, Focus/Break label, Reset, Work/Break inputs). The sidebar section labels ("POMODORO", "TO-DO LIST", etc.) still use Fredoka/`.sb-icon-label`/`.lofi-card-label` — a shared class; changing it moves ALL those labels, so it's deferred as its own deliberate change.

## Sticky Note Rules — UNIVERSAL
- One universal note set shared by ALL themes: `src/assets/stickynotes/note-{yellow,pink,blue,green}.png` (1024×1024 transparent, soft pastel, one curled corner, NO baked shadow — component adds its own). `getThemeStickyNotes(name)` in themeRegistry returns a theme's own color notes if its folder has any (filename not containing 'todo'); otherwise the universal four, always with the theme's own to-do paper appended. Today no theme overrides.
- To change the note look for ALL themes: replace those 4 PNGs (make ONE master, recolor it). New worlds inherit them — they need only a to-do paper.
- ONE shared text area, default in StickyNote.jsx: `top 20% / left 19% / right 19% / bottom 22%`. No per-theme overrides today (component still supports `theme.stickyNoteTextArea` via `??`).
- Default 180×180px, locked aspect ratio. Color picker: 4 swatches; color derived from filename keyword.
- Pin to front: zIndex = `isPinned ? 450 : (layer ?? 5)`. 450 sits above desk layers, below sidebar (500) and modals (~10000). A pinned note's right-click menu shows "Unpin" INSTEAD of layer options. Local pin state syncs from the `pinned` prop via useEffect.

## To-Do List Rules
- Every theme needs a todo asset in its stickynotes/ folder, filename containing `todo`. Fallback: `src/assets/stickynotes/todolist1.png`.
- `todoBase` per theme drives sizing: kawaii {w:358,h:402}, lofi {358,384}, steampunk {358,519}, cafe {358,353}.
- UNLIMITED + SCROLLABLE (v1.3.3): the per-theme item cap was REMOVED. The to-do list now holds unlimited items and scrolls inside the paper. Reminders container in ReminderPaper.jsx uses `overflowY: auto` + class `todo-scroll` (cozy honey-amber scrollbar in index.css); the add-item input is always visible. Checked rows show a small ✕ → deleteReminder.
- `maxItems` in themeRegistry and `DEFAULT_ITEMS_PER_PAPER` in useDeskState.js are now UNUSED leftovers (queued cleanup) — do not wire new logic to them.
- Calendar → to-do (`sendReminderToDeskPaper` in useDeskState.js) now always targets the existing paper (`papers[0]`), never spawns a second paper.

## Calendar ↔ Sticky Note Sync
- Notes link to calendar via `noteId` — preserve it through ALL edit/move/drag ops, never regenerate.
- Each date written on a note becomes its own calendar event; the full line goes to the event. Dedup: same dateKey + same eventText = skip. noteId stored on the event when the user confirms the popup. Reverse-sync popup was removed intentionally (not a bug).

## Theme System
All visual config in `src/themes/themeRegistry.js` — never hardcode theme names in components.
- Themes: Cozy Kawaii, Lo-Fi, Steampunk, Café Morning (all four complete). Day-cycle concept: Café (morning) → Kawaii (midday) → Steampunk (sunset) → Lo-Fi (night).
- `cozykawaii.jsx` is the main desk renderer for ALL themes — don't rename. It's in `src/themes/`, NOT `src/themes/cozykawaii/`.
- Clocks: kawaii/lofi/steampunk use per-theme components (ClockSticker, LofiClockSticker, SteampunkClockSticker). Café uses shared `DigitalClockSticker` (registry-driven via `clockTheme`). New themes use it. `clockTheme.hideFlip: true` when the image has baked-in text that would mirror (e.g. café's "Coffee Time").
- Registry also exports (additive) `THEME_BACKGROUNDS` (raw background src per theme, for the World Gallery thumbnails) and `THEME_GUMROAD_URLS` (cafe + steampunk checkout links).
- New world checklist: create `src/themes/[name]/` with `widgets/` (calendar+clock) and `stickynotes/` (ONE `todo` asset — no note art needed). Background 1920×1080 → `src/assets/backgrounds/`. Add registry entry (todoBase, calendarTheme w/ sidebar icon, sidebar `--btn-bg`/`--btn-text`/`--btn-font`, plus a THEME_BACKGROUNDS entry). Sidebar clock icon is theme-aware (needs a new `LiveXxxClockIcon` + branch in Sidebar.jsx for a custom clock). Add a THEME_TRACKS entry in audioManager.js or it silently borrows kawaii's playlist. Test: drop note/todo/calendar/clock, switch in and out, confirm calendar-sharing popup, reload to confirm heal.

## Sidebar Rules — CRITICAL
- Two sidebar files: `Sidebar.jsx` and `LofiSidebar.jsx`. ANY sidebar UI change must be applied to BOTH. (Shared leaf components like `ThemesSection.jsx` and `PomodoroTimer.jsx` are rendered by both, so editing them once covers both — prefer that when possible.)
- Never change sidebar fonts, icons, or colors unless explicitly asked. Never touch steampunk animated gears or lofi sidebar icon images.
- Buttons use CSS vars `--btn-bg`, `--btn-text`, `--btn-font` (with `!important`).
- To-do and sticky-note icons are theme-aware (read from themeStickyNotes) — new themes get them automatically.
- MusicPlayer + SFX toggle live in BOTH sidebars (right after the logo / after MusicPlayer respectively). Logo: `src/assets/cozydesk-logo.png`, 180px, centered, static import (NOT a `/src/` string), in both sidebars.

## Sticker Grid Rules
- NEVER show clock, calendar, todo, or stickynote assets in the grid. Filter in cozykawaii.jsx excludes filenames containing 'clock', 'calendar', 'todo', 'stickynote'. Applies to all themes.
- Decorative sticker PNGs are pre-trimmed to their visible art (alpha>10 bounding box) so the box hugs the art. NEVER trim clock/calendar/todo/stickynote assets (overlays positioned as % of image — cropping shifts them). 0–3% trim is normal success. Trim by alpha threshold, not by eye.
- New stickers load via the asset glob — dropping a trimmed PNG into `[theme]/stickers/` is enough, NO themeRegistry edit (that's why art-only commits are safe). Deletions equally safe. A code change importing NEW assets must commit those assets in the SAME commit.
- Sticker.jsx reads each image's natural aspect ratio on load (imgAspect via onLoad) so handles hug the art. Display-only. Round art still has small corner gaps (geometry, not a bug).

## Sound Effects System
- Singleton `src/utils/soundManager.js`. localStorage key `cozydesk_sfx` (bool, default true). Add new sounds to the SOUNDS array before wiring. Play via `soundManager.play('name')` — never `new Audio()` elsewhere.
- Sound map: sfx_place_note (note drop / world-switch in gallery), sfx_alert_box (sticker/todo/calendar drop), sfx_sticker_lift, sfx_click_button (generic click / gallery open / timer Pause), sfx_save, sfx_delete_whoosh, sfx_ping (check reminder), sfx_uhoh (hit cap), sfx_timer_start/end/reset, sfx_undo_redo, sfx_clear_screen, sfx_areyousure (confirmation popup appears), sfx_mugzy_toggle.

## Music Player — NEVER BREAK
- MusicPlayer.jsx (UI) + utils/audioManager.js (singleton). Imported in BOTH sidebars, after the logo. Always starts paused. localStorage key `cozydesk_music`.
- The Pomodoro timer drives audioManager (play/pause/next) from `src/utils/timerStore.js`, not from the component. Start reacts music (off→play, on→next); Pause/Reset pause music (no rewind). See "Pomodoro timer state."
- Tracks in `src/assets/music/` (Pixabay, commercial-free) — NEVER rename (filenames are the paper trail). Per-theme playlists in THEME_TRACKS (4 each), each a STATIC IMPORT, hand-maintained. switchTheme falls back to kawaii for unknown keys.

## Calendar System
- CalendarSticker.jsx = wrapper. sidebar/MiniCalendar.jsx = grid. LargeCalendarModal.jsx = full-screen modal (opens on double-click OR single day-click). Per-theme config under `theme.calendarTheme`; sidebar icon = `calendarTheme.image`.
- `contentArea` — measure the LIVE rendered widget in DevTools, NOT the source PNG. Tune one axis at a time.
- MiniCalendar per-theme overridable via calendarTheme (defaults): gridAutoRows 17px, navFontSize 20px, monthFontSize 13px (café: 15/16/11). Fixed: gap 0, alignContent start, event dot bottom 3px.
- Modal opens at the month the widget is SHOWING, not always today.

## Layering System
- ONE shared `layer` number across every item type = zIndex. Exception: pinned note renders at 450.
- Right-click actions: handleLayerAction (cozykawaii.jsx) → applyNormalizedLayers (useDeskState.js). Bring to Front / Send to Back jump past everything. Move Forward/Backward re-seat past the nearest item the target ACTUALLY OVERLAPS (AABB bbox in ratio space), skipping non-overlapping items. Items with no stored size (clocks, calendars, reminders) return null bbox = "always overlapping." Do NOT revert to global-neighbor swap or the old +/-1.5 nudge.
- Corkboard drops as a NORMAL sticker (backdrop:false). No backdrop stickers exist.

## Attach / Detach (stickers AND notes)
- Right-click → Attach glues a child to the lower-layer item beneath its center. While attached it can't be dragged/resized (Detach to free). Notes ride the parent's position but NEVER scale (fixed-px). Stickers scale with the parent.
- Impl: attachNote/detachNote/moveAttachedNotes + resizeAttachedStickers (also repositions attached notes) in useDeskState.js; StickyNote.jsx has an isAttached prop → disableDragging + enableResizing guard. ContextMenu.jsx is generic (driven by isPinned/isAttached/canAttach) — no change needed.

## Save Slot Data Shape — Do Not Break
- Autosave key: `cozydesk_state_{theme}`. Named slots (10/theme): `cozydesk_saved_{theme}_slot_{n}`.
- Slots store: notes, stickers, papers, clocks, calendars, calendarEvents, reminders, remindersLayer, themeMode, remindersVisible, remindersPos.
- id = Date.now() — never regenerate on load. Notes persist: src, w, layer, text, `pinned`, `rotation`, attach fields. Papers persist `rotation`. Stickers persist flippedX/flippedY/rotation + attach fields.
- calendarEvents shape: `{ "YYYY-MM-DD": [{ text, category, noteId, ... }] }`.
- CRITICAL: any update fn that recomputes ratios from data.x/y/w/h MUST guard every field for `undefined` (partial updates — rotation-only, pin-only — WILL arrive). updateNote and updatePaper both guard. Removing the guards makes a rotation-only update recompute from undefined → NaN → saved as null → item VANISHES on reload.

## Calendar Sharing (shipped)
- One optional global events list. Widget placement stays per-theme; only EVENTS are shared. Keys: `cozydesk_calendar_shared` ('on'/'off'/unset) and `cozydesk_shared_calendar_events` (exists only when ON).
- ON: per-theme states store `calendarEvents:{}`, real events in the shared blob. OFF: each theme stores its own. Engine: enableCalendarSharing() merges all themes' events into the blob; disableCalendarSharing() copies shared events into EVERY theme then removes the blob.
- DO NOT RE-BREAK: loadThemeState must load the shared calendar even when a theme has NO saved desk (else new themes show no events AND an empty autosave wipes the blob).
- Opt-in popup shows only when the flag is unset AND the source theme has events (ThemeContext.jsx). Settings toggle in cozykawaii.jsx. "Clear All" while sharing ON shows an unchecked "Also erase shared calendar events" checkbox; clearDesk takes `{ clearCalendar }`.
- Force the popup again: `localStorage.removeItem('cozydesk_calendar_shared')` then reload.
- Inert `snapshot`/`_getSnapshot` leftovers in ThemeContext.jsx are intentional. There is NO `cozydesk_carryover_pref` key. Sticky notes and to-do lists are strictly per-theme, never carried across a switch — TODAY. Shared to-do lists ("Pass 2") are the intended next step but were blocked by per-theme item caps and board heights (unclear where overflow would go across differently-sized boards). Unblocked by adding SCROLL to the to-do widget (underlying list identical across themes; each board is just a differently-sized window). Build order: scroll first, then shared to-do. See Parked.

## Focus Mode + Mugzy (LIVE — do not re-break)
- Pomodoro Start (work mode) makes the world respond: dark vignette + warm center (`FocusOverlay.jsx`, `focusBus.js`) + contrast/brightness filter; stickers do a staggered settle-bounce (bounce fires on rising edge of `focusActive` inside each Sticker; class-removal timeout is `bounceDelay + 500` — a flat value once skipped later stickers, the "fishtank bug").
- `.pomo-circle` gets a blue pulsing glow, `.pomo-widget` a restrained blue frame — same blue in every theme ON PURPOSE (connects to Mugzy); do NOT theme-color it.
- Mugzy: poses in `src/assets/mascot/` (idle, wave, sparkle, cheer, sleep, run, focus, blink); idle-blinks ~130ms every 2–3.5s only when idle; ground shadow removed in all states; toggle button `.pomo-mugzy-btn` in PomodoroTimer.jsx reads/writes `cozydesk_mugzy` and syncs via the `cozydesk-mugzy-toggle` event.
- Hooks-before-early-return rule: any component with an early `if (!visible) return null;` (Mugzy et al.) MUST run all hooks BEFORE that early return, or toggling it off crashes.

## Pomodoro Timer State + UI (do not regress)
- State + ticking interval live in a singleton, `src/utils/timerStore.js` (same pattern as soundManager/audioManager), NOT in PomodoroTimer's local useState. This lets the timer survive crossing into/out of Lo-Fi — `Sidebar.jsx` returns `<LofiSidebar/>` for lofi (an element-TYPE change that unmounts PomodoroTimer); old local useState was wiped by that remount. Store owns state + interval; `PomodoroTimer.jsx` is a thin subscriber (useReducer+useEffect → timerStore.getState(), buttons call store methods).
- The store drives focus mode via setFocusActive() — the component MUST NOT call setFocusActive(false) on unmount (that cleanup flickered focus off on every world-switch; removed).
- SESSION-SCOPED: survives world-switches, resets on full page reload (correct — a stale countdown resuming hours later would be wrong). Reset pauses music but does NOT rewind; next Start resumes where it left off (deliberate).
- Sounds live in the store: Start → `sfx_timer_start`, Pause → `sfx_click_button`, Reset → `sfx_timer_reset`, complete → `sfx_timer_end`.
- UI (redesigned Aug 11): layout is circle → full-width Start/Pause button → Reset → always-visible Work/Break inputs → Mugzy toggle. The gear toggle was REMOVED (inputs always visible; `showSettings` state gone). Start button is a glossy candy-orange pill (`.pomo-main-btn`) that eases to warm green via `.pomo-running` when the timer runs, with a cosmetic label cross-fade (`.pomo-main-label` / `.pomo-label-fading`) and a press-sink. It is the SAME candy orange in all four worlds — `.pomo-main-btn` was removed from the café/steampunk `.pomo-btn` theme overrides so themes can't recolor it. Do NOT re-add it to those overrides. Reset is `.pomo-reset-btn`, full-width secondary, ↻ icon + text; it is excluded from the global `button:not(...)` reset in `src/index.css` (see Key Learnings) so it isn't painted white.
- Press-Start nudge (LIVE): a user who's never pressed Start sees (after ~3.5s) a glow on Start + label "Your world is waiting… press Start"; pressing Start fades it forever via localStorage flag `cozydesk_start_discovered`. `.pomo-start-nudge` + `.pomo-start-glow` in Sidebar.css, theme-variable colored.

## Key Learnings
- READ AND TRACE, don't just read. The pin bug: `layer != null ? layer : (isPinned ? 100 : 5)` always used layer, so the pinned branch was dead — the line looked right but never ran. Fix: `isPinned ? 450 : (layer ?? 5)`.
- The guilty-looking line is often the VICTIM. Cross-theme save bug: `currentDesk || getLastSaved` looked wrong, but the real cause was `currentDesk` state in the sidebars never being cleared on theme switch. Tracing to where the prop is SET found it. Fixed defensively in SavePopup (validate currentDesk against the current theme's slots).
- When a CSS override doesn't take, check the FULL DevTools cascade — a correct rule can be beaten by a higher-specificity global reset elsewhere. Concrete case: the lofi Reset button rendered white because the global `button:not(...)` reset in `src/index.css` sets `background-color:#f9f9f9` and `.pomo-reset-btn` wasn't in its `:not()` exclusion chain. Fix = add it to the chain (same as `.pomo-btn`/`.pomo-main-btn`), not a specificity hack.
- Measure before theorizing. When a behavior is intermittent, print the actual data (`Object.keys(localStorage)`, DevTools computed styles) before theorizing. Two wrong guesses = add logging / inspect, stop theorizing. (The onboarding bug was mis-diagnosed as an autosave race; the real cause was a leftover `cozydesk_state_lofi` key found only by measuring.)
- NEVER hardcode colors in shared UI — use `var(--sb-*)`. Hardcoded `#000`/`#333` was invisible on dark themes. Custom input styles must set BOTH `color` AND `background` explicitly (a bare `color:'#333'` was invisible in OS dark mode). Any bare input style is a candidate for the same bug.
- A found bug is usually pre-existing and SEPARATE from the current task — give it its own diagnosis and its own commit. Never `git add .`; check status before and after staging.
- LAYOUT-AFFECTING CAPS MUST BE PER-THEME. One global number was wrong (lofi short, café mid).
- DON'T BUILD FOR A STATE THE CODE CAN'T REACH — verify the problem is real and reachable first.
- A visually appealing feature can still be wrong for the product (wall art abandoned — manual stretch broke "drop and forget"). Test UX fit early.
- The doc drifts from the code. When CLAUDE.md and the files disagree, the CODE wins — verify, then fix the note.
- CLAUDE CODE OVERSTEPS WITHOUT THE HARD RULES BLOCK. Lead every prompt with it.
- CSS-OVERRIDE BUGS: READ THE LIVE DEVTOOLS CASCADE FIRST, not after guessing. The My Desks fork buttons rendered white/unreadable; Claude proposed FOUR fixes from assumption before actually inspecting. DevTools showed the cause in one screenshot: `.sds-modal-box` had `data-theme` overrides only for lofi/steampunk, so café/kawaii fell back to the near-white default `--sb-card`. Cost many turns. For any "override doesn't take" or "wrong color" bug, inspect the winning rule on the LIVE element before touching CSS.
- CROSS-THEME ELEMENTS: don't wire them to swinging theme variables. When an element must look identical across all worlds (fork buttons, the Pomodoro Start pill), use FIXED values, not `--sb-*`. Making the fork buttons theme-independent is what finally ended the white-button saga.
- COMMIT EACH TESTED FEATURE BEFORE STARTING THE NEXT. Two features tangled in the working tree because we rolled from one into the next without committing. `git diff <file>` instantly settles "did I break something?" — check, don't worry.
- existingUser-style checks must be captured ONCE at module load, not recomputed per render — any re-render reading live localStorage can change a routing decision. (`INITIAL_EXISTING_USER` in main.jsx; do not revert to per-render.)
- Onboarding test method: clear cozydesk keys in the console THEN IMMEDIATELY hard-refresh (Cmd+Shift+R) before the mounted desk autosaves itself back. Clearing while the app runs proves nothing — the desk re-writes cozydesk_state_* and you wrongly get "Welcome back." Confirm you're on the localhost port whose `npm run dev` banner shows cozydesk@<version> — NOT app.cozydesk.app, NOT a stale tab.
- TERMINAL STEPS IN SAFE ORDER: present multi-step commands in exact safe execution order — the precondition/safety step comes FIRST (e.g. `cd ~` before a `cp -r` backup, so the backup never runs from inside the folder being copied).
- `src/App.jsx` and `ThemeSwitcher.jsx` are DEAD CODE — never imported by `main.jsx`; all world switches flow through `setTheme` in `ThemeContext.jsx` (onboarding uses `setThemeDirect`). Candidates for a cleanup commit.
- A marketing/landing page CANNOT trigger a PWA install prompt — only a page with a web app manifest (the app at app.cozydesk.app) can fire beforeinstallprompt. Do NOT put "Add to Dock"/install buttons on the landing page; they can only ever open the app. The real install button belongs INSIDE the app. VERIFY a surface's capability before building a feature on it — capability first, implementation second.

## Payments & Licensing (DECIDED — Gumroad)
- Merchant of record: the EXISTING DoodleAndy Gumroad store (already approved/verified — handles global VAT/GST/sales tax; Andrew's "least tax work" requirement met). Fee 10% + $0.50/direct sale.
- FREE = Cozy Kawaii + Lo-Fi Night. PAID = Café Morning + Steampunk, $2.99 each à la carte. All-Access Bundle $10.99. PROMOTE the bundle. Instead of lowering prices, run a LAUNCH DISCOUNT (first-two-weeks or a YouTube code) for the "deal" + urgency while keeping anchors.
- Products LIVE + published with license keys (Aug 10): Café Morning (ID `ag2OVA20ZA5MRprzdCfkbQ==`, `/l/cafe-morning`), Steampunk (ID `dTPl_boio9BdX4AmKgLFDA==`, `/l/steampunk`), All-Access Bundle (ID `ow1nWZSw-biORBpzMWA1Qw==`, `/l/all-access`, $10.99). Full checkout URLs live at `https://doodleandy.gumroad.com/l/...`. Bundle is a plain Digital product (NOT Gumroad's Bundle type — that gives separate keys per product). App mapping: Café ID→Café only, Steampunk ID→Steampunk only, Bundle ID→both paid worlds + future worlds. Cover images DONE (Aug 12): café + steampunk cropped from live-app screenshots; bundle image on hand.
- Refund stance DECIDED: no automatic refund window, instant-access, final-by-default, case-by-case goodwill. Parked store-UI task: add "unlocks instantly, non-refundable once used (see Refund Policy)" near the Buy button to make the waiver bind.
- Legal notes: no law requires disclosing the app was BUILT with AI; the AI-art line is goodwill. EU AI Act Art. 50 targets live AI systems/deepfakes, not a static app shipping pre-made art. Confirm commercial rights to the AI-generated images.
- Profile-name "DoodleAndy" does NOT need renaming to launch — CozyDesk themes are products inside it; renaming is a later optional branding call.

## License Unlock Feature — COMPLETE (shipped Aug 12, 2026)
Locked-world UX: clicking a locked/paid world shows a clean PREVIEW SCREEN (full-bleed world bg + frosted-glass card with name, flavor text, gold Unlock→Gumroad button, "already bought? enter key" link) — NOT the "grayed-out tools inside the desk" version. Onboarding shows only the 2 FREE worlds; paid worlds discovered via the gallery.

- **Step 1 — DONE.** `src/utils/licenseManager.js`: owns paid/free map (cafe+steampunk paid; cozykawaii+lofi free), product IDs, `verifyAndUnlock(world, key)` (checks key against Gumroad's verify endpoint — own product then bundle — validates not refunded/chargebacked/disputed, caches to localStorage `cozydesk_unlocked`, offline forever after). Exposes `isPaidWorld()`, `isWorldUnlocked()`. Passes `increment_uses_count:false` so checking never burns a use. Returns `{ok:true, unlocked:[...]}` / `{ok:false, reason:'invalid'|'network'}`.
- **Step 2 — DONE.** World Gallery (`WorldGalleryModal.jsx`, createPortal). 4 world cards + 2 "Coming Soon" teaser cards (Space Cruiser, Ancient Dynasty — teaser ART ONLY, not real worlds). Lock badge + $2.99 on paid worlds. All-Access bundle banner below the grid ($10.99 → preview → Gumroad `/l/all-access`); banner hides once both paid worlds owned. Gold buy buttons + frosted-glass panels. `THEME_GUMROAD_URLS` gained `allaccess`.
- **CORS — RESOLVED (Aug 12).** Live console fetch against Gumroad's verify endpoint (real bundle key) returned success, no CORS block. NO proxy needed — licenseManager calls Gumroad directly from the browser.
- **Step 3 — DONE.** Enter-key screen: "Already bought? Enter your key" (on both single-world and All-Access previews) opens a simple non-technical screen (heading "Enter your unlock key", plain instructions, one input, gold Unlock button, friendly status: "Checking…" / "You're in!" / invalid / network). Calls verifyAndUnlock; on success drops straight into the world (bundle target = cafe, which falls through to the bundle product). Tested on 2 real devices with a real bundle key.
- **Step 4 — DONE.** `setTheme` + `setThemeDirect` in ThemeContext.jsx refuse to switch into a locked paid world (fall back to cozykawaii). The saved-theme restore-on-load (`useState` init) heals the same way — won't reload into a now-locked world (covers a cleared/refunded unlock cache). Onboarding `WORLDS` filtered via `isPaidWorld` → pick-your-world shows FREE worlds only. Defense in depth: the lock lives in the SWITCH, not just the gallery UI. Verified in Incognito.
- **Step 5 — DONE.** End-to-end verified: real Gumroad purchase → license key → paste → unlock → persists, on the buyer's own laptop.

## Landing Page (LIVE)
Landing page fully redesigned (Aug 14): white background, honey-amber vertical-gradient CTAs (linear-gradient(180deg,#F6B73C,#E8843C)), logo 2x (110px nav), four-worlds showcase with Free/$2.99 tags, slim 3-up features row, real testimonials (Shirley L. — Content Creator; Bruce G. — Product Reviewer), single honey "Open CozyDesk" button (nav + hero + bottom, all identical). Hero subtext points users to in-app instructions to add to dock/taskbar. Service-worker self-unregister/cache-clear script retained at top of <body> (fixes ghost-SW white-screen from an old Vite build of the domain). Still open: hero loop video (placeholder image in hero + demo slots). Claude cannot edit/deploy the landing repo — Andrew runs Claude Code there separately.

## Launch Prep — Status
Shipped & LIVE: cache fix, error boundary, backup/restore, Settings version + Report a Bug, legal docs, onboarding, deploy, smoke test, focus mode + Mugzy, timer-reset fix, double-click-to-add, press-Start nudge, landing redesign, Gumroad products, World Gallery (Step 2), Pomodoro redesign. Friends beta DONE; beta push freeze LIFTED. Small-screen gate (phones/tablets, (hover:none) and (pointer:coarse), v1.3.2) and the landing redesign (Aug 14) are now SHIPPED & LIVE.
Pre-public-launch blockers still open: (1) hero loop video; (2) in-app "Install CozyDesk" instructions/button (landing now promises this). Plus Andrew's checks: cross-browser/Windows/phone test, live Gumroad purchase test, bundle CTA confirm. (To-do list scrolling SHIPPED v1.3.3; License unlock feature COMPLETE; Gumroad cover images done.)

## Completed — Do Not Rebuild or Re-break (one-line index)
Universal sticky notes; per-theme maxItems + delete-completed ✕; settings panel zIndex 600; pin-to-front + Unpin; clock flip + XS–XL sizing; attach/detach (stickers + notes); Save / My Desks (10 slots/theme); lofi sidebar icons; steampunk gears + mahogany sidebar; per-theme theme-color meta; aspect-ratio locking; 4 tracks/theme; sticker box hugs art; storage-full warning; calendar sharing; rotation persistence (rotationRef pattern: onMove writes ref, onUp reads it — dodges stale closure; add fns seed rotation:0; initialRotation prop seeds on load); cache/app-shell fix; error boundary; backup/restore; cross-theme save-overwrite fix; Settings live version + Report-a-Bug mailto; SavePopup dark-mode input fix; Focus Mode + Mugzy (v1.2.0); onboarding existing-user freeze fix; new café stickers; Lo-Fi timer-reset fix (timerStore singleton); double-click-to-add; press-Start nudge; Lo-Fi sleeping-dog sticker; World Gallery Step 2; Pomodoro redesign (candy button + Nunito + lofi fixes) + gallery/pause sounds; All-Access bundle banner + preview (gold buttons, frosted glass); Coming Soon teaser cards (Space Cruiser, Ancient Dynasty — teaser ART only, NOT real worlds yet); license unlock Steps 3–5 (enter-key screen + locked-world gating in setTheme/setThemeDirect + onboarding free-only); Gumroad café/steampunk cover images (cropped from live-app screenshots); small-screen gate (SmallScreenGate.jsx, phone/tablet takeover + Browse-the-worlds buy path, iOS-correct (hover:none)+(pointer:coarse) detection); landing redesign (white/amber, worlds showcase, real testimonials, single Open-CozyDesk CTA).

## Parked — After Launch / Growth (NOT launch blockers)
- Build new worlds (standing priority once launch prep is done).
- "Worlds" rename (Themes → Worlds everywhere — its own deliberate session; only the visible sidebar label is done so far).
- Positioning/landing copy ("cozy workspace," sell the feeling first). Premium messaging + community roadmap + vote-on-next-world.
- Analytics — privacy-friendly only (Plausible / Fathom / Cloudflare), landing page only, not in-app. Adds a privacy-policy disclosure obligation — add it when analytics ship.
- Demo video + screenshots.
- Hover-glow (desktop-only). Export a single desk to share (distinct from backup). Tauri native wrap (only if demand proves a real installer / folder auto-save).
- (To-do list SCROLL — SHIPPED v1.3.3, unblocks shared to-do. Bruce's Safari yellow-streak artifact is also fixed.)
- Shared to-do list "Pass 2" — after scroll ships. Same pattern as calendar sharing: one shared list, every theme reads/writes it. Do NOT require the visible content area to be pixel-identical across themes — with scroll the underlying LIST is identical, the WINDOW can vary per theme.
- Auto-add calendar events to the to-do list — unresolved; risky as automatic (could flood), more plausible as opt-in per event.
- (Save/My Desks UX — DONE v1.3.4: saving now lives inside My Desks via the three-choice fork. See "My Desks Fork".)
- Install-button discoverability: in-app "Install CozyDesk" button (sidebar or Settings) shown only when `beforeinstallprompt` fires; Safari gets a "File → Add to Dock" hint; hidden if already installed. Both sidebars. Pair with ONE gentle dismissible nudge after the 3rd visit — not on the splash.
- (Small-screen notice — SHIPPED v1.3.2 as SmallScreenGate.jsx.)
- Welcome/tutorial screen — NOT a fourth forced popup (first-run flow already has splash → pick world → terms; fatigue risk). Instead: dismissible "i" info button in sidebar corner, with a one-time gentle nudge for first-timers, opening a Mugzy 1-2-3 (calendar/notes · drag stickers · press Start Focus). Build post-launch, informed by whether real users seem lost; the press-Start nudge may already suffice.
- When Space Cruiser / Ancient Dynasty become real worlds: swap the lush teaser backgrounds for plainer wall+desk versions, with the window/pond as a placeable sticker (keeps "drop and forget" intact). The current teaser images are gallery art only.
- Timer discoverability upgrades IF the press-Start nudge proves insufficient: richer "guided Mugzy tutorial (Version B)" (Mugzy spotlights sticker area → to-do → glows Start), and/or a "first-focus whisper after the world transforms" (`cozydesk_focus_revealed` flag). Not needed now.
- Retention direction (parked, NOT decided — drive with real feedback): (1) give the to-do list "teeth" (carryover of unfinished items, a sense of "today," a completion moment) — closest to what exists, highest leverage, benefits from shared-to-do work; (2) make the Pomodoro/focus timer the centerpiece — position CozyDesk as a focus-ritual destination vs "leave a lo-fi video running," most differentiated; (3) let the world visibly remember daily use (growing plant ~5 stages / seasonal decor) — ties retention to theme-purchase motivation. The "world remembers you" plant: blooms, gently wilts without visits, never dies.

## Queued Cleanups (one at a time — backup + commit each; do NOT batch)
- ContextMenu.jsx font 'Patrick Hand' → Nunito (one line).
- stickynotes/ → todo/ folder rename per theme (git mv, update glob in themeRegistry, grep stray refs). Optional.
- WebP conversion — BEFORE LAUNCH, one-time hand-checked per-asset (NO blind batch — lossy WebP smears gradient/transparency; preserve alpha). Glob already accepts .webp.
- Debounce auto-save — AFTER beta (debounce only background autosave; keep slot + theme-switch saves immediate; flush on visibilitychange/pagehide).
- ClockSticker + calendar flip/rotate: audit for the same rotation-only NaN trap that hit papers.
- To-do small-screen clamp: move from spawn-time to render-time so saved desks fit phones.
- Backup filename: add HHMM so same-day backups don't collide (one line in backupManager.js).
- Move old `cozydesk_backup_*` folders out of `~/Developer` to declutter search.
- Unused deps: framer-motion only (verify first). react-draggable IS used — do NOT remove.
- Dead code removal: `src/App.jsx`, `ThemeSwitcher.jsx`.
- Orphaned CSS from the My Desks fork: `.sds-save-current-btn`, `.sb-action-save`, `.lofi-save-btn` (unused after v1.3.4).
- Unused: `maxItems` (themeRegistry) + `DEFAULT_ITEMS_PER_PAPER` (useDeskState.js) after v1.3.3 unlimited to-do.

## Known Limits
- Firefox desktop cannot install PWAs (browser limitation, not fixable).
- "Launch maximized" isn't guaranteed by the manifest (own-window, not maximized) — set expectations.
