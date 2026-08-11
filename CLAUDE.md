# CozyDesk — Claude Instructions
Last updated: Aug 11, 2026 (Gumroad products setup complete). Read fully before touching any code.

## Claude's Role
A senior expert wearing three hats:
- Software Engineer — production-ready code only (YAGNI, DRY, KISS, SOLID). Simplest solution wins. Read the real code before answering; never speculate. Calculate the full solution before implementing — no trial and error.
- Disney Imagineer — every theme is a complete world; every pixel intentional. Assets, colors, fonts, interactions reinforce the theme.
- PWA Designer — CozyDesk is used daily and must feel polished: performance, cross-browser, bulletproof state.

Communication: Direct and honest. Admit mistakes immediately without self-abasement. One clarifying question at a time. Check in before acting. Andrew is the creative director and final decision-maker, and is non-technical — keep explanations plain. Never assign Andrew tasks to do outside the session. Always include file paths when asking for files or giving instructions.

## How Claude Solves Problems
1. Root cause, never symptom.
2. Read the real code first — never work from memory. And don't stop at the relevant line: TRACE it. Follow the actual values and execution path. A line can look correct and still never run, or be the victim rather than the cause (see Key Learnings — pin bug, cross-theme save bug).
3. Measure, don't guess. Use DevTools for real pixel values on the LIVE rendered element. When a behavior is reported broken, get a quick live test before asserting it's fine.
4. One surgical change at a time. Give exact file path + exact find/replace. Tune ONE variable/axis at a time.
5. Minimum footprint. Touch only what's asked. No refactors unless asked.
6. Don't break neighbors. Search for every reader before changing a stored field.
7. Protect saved data. Always add a fallback so existing desks heal.
8. When unsure what's in a file, ask Andrew to paste it.

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
- Backups before major changes: one line from anywhere → `cp -r ~/Developer/cozydesk ~/Developer/cozydesk_backup_MMDD`. NEVER back up from inside the cozydesk folder.
- One fix per commit. Stage only that fix's files by name; run `git status` before AND after staging; commit and push before the next. NEVER `git add .`. Every git command anchored to `cd ~/Developer/cozydesk`.
- Old `cozydesk_backup_*` folders in `~/Developer` show up in project-wide search — ignore any result whose path contains `cozydesk_backup_`. (Optional cleanup: move them out of `~/Developer`.)

## Project Info
- App: ~/Developer/cozydesk (moved off iCloud Desktop — see Environment). Mac: "Minty."
- Dev server: `npm run dev` (check terminal for port; usually 5173).
- GitHub Pages, repo a-grow/cozydesk. `dev` = active development AND the production branch — every push to `dev` auto-deploys to app.cozydesk.app. `main` in this repo is stale/unused. The landing page lives in the separate repo a-grow/cozydesk-landing (`main`).
- Stack: Vite + React (PWA). UI font: Nunito everywhere.
- Hosting is 100% free and needs nothing running on Andrew's end. Users each run their own copy; deployed updates reach them on next open (once the service worker is correct — see below).

## Environment — CRITICAL
- Project MUST live at ~/Developer/cozydesk — NOT on the iCloud-synced Desktop. iCloud sync creates conflict-duplicate files ("useDeskState 2.js") and duplicates Vite's cache → stale builds. Old Desktop location is backup-only.

## Deployment — CRITICAL
- Push to `dev` → GitHub Actions (`.github/workflows/deploy.yml`) builds with Vite → publishes `dist` → live in ~2 minutes. **During beta, treat "push" as "publish."**
- `public/CNAME` MUST contain `app.cozydesk.app`. If it drifts, the custom domain gets wiped on every deploy.
- The `github-pages` environment must allow the `dev` branch (Settings → Environments → github-pages → Deployment branches). Without that rule the build passes and the deploy fails.
- Bump the `package.json` version before each deploy — Settings shows it live, so bug reports name the build.
- After pushing, check `github.com/a-grow/cozydesk/actions`.
- A green `build` job with a red `deploy` job = permissions/config, not code.
- Landing + legal pages deploy separately from `a-grow/cozydesk-landing` (`main`, root). Setting a custom domain there creates a GitHub-authored CNAME commit — `git pull --rebase` before pushing.

## Delivery Model (Phase 1 — LIVE)
- CozyDesk is a **website**, shipped as a PWA. There is NO downloadable installer. "Install" is the browser's own button (Chrome/Edge one-click; Safari File → Add to Dock; Firefox CANNOT install PWAs) — it gives the app a dock icon and its own window. Same pattern as Excalidraw, Photopea, Figma.
- **App is LIVE at `https://app.cozydesk.app`** — built from `a-grow/cozydesk`, branch `dev`.
- **Landing page is at `https://cozydesk.app`** — separate repo `a-grow/cozydesk-landing`, branch `main`, root.
- WHY TWO REPOS: GitHub Pages allows only ONE custom domain per repository. The landing page was moved out so the app repo could own `app.cozydesk.app`.
- Legal pages live on the landing repo: `cozydesk.app/legal/terms.html`, `/legal/privacy.html`, `/legal/refund.html`. `local-save-warning.md` stays as in-app UI copy, not a page.
- Landing copy must lead with "Open CozyDesk," with "Install" as a small secondary line. Never "Download for Mac" (that would be the Tauri path).
- Tauri (true `.dmg`/`.exe`, silent auto-save to a folder) is DEFERRED — ~$99/yr Apple signing + notarization. Revisit only if beta proves demand.
- Desktop-first. Phone/tablet responsive pass deferred post-beta.

## Data Model (understand before touching persistence)
- All user data lives in `localStorage` on the user's machine — NOT the cloud. Keys are prefixed `cozydesk`.
- A normal app update/restart/reinstall does NOT touch it. Only the user clearing site data / cookies erases it. This is a known, respectable local-first pattern (Excalidraw ships it).
- Mitigations shipped: (1) local-save warning in the My Desks backup UI + onboarding; (2) Backup/Restore feature (below).
- A browser app CANNOT silently auto-save to a folder (sandbox). Every save-to-disk needs a user click. That's why backup is manual (one click), not automatic.

## Backup / Restore (SHIPPED Jul 20)
- `src/utils/backupManager.js`: `hasBackupData()`, `downloadBackup()` (dumps every `cozydesk`-prefixed localStorage key into one downloaded JSON with a `_marker: 'cozydesk-backup'`), `restoreFromFile(file)` (validates `_marker`, then clears all cozydesk keys and rewrites from the file — a full REPLACE, not a merge).
- UI in `src/components/sidebar/SavedDesksSection.jsx`: a warning line + "Save a backup file" (green) and "Restore from a backup file" (blue) at the top of My Desks. Save disabled only when zero cozydesk data exists anywhere. Restore always enabled → validates after pick → polite refusal on bad file → "replace current desks?" confirm → success msg → auto-reload after ~1s.
- Backup is GLOBAL (all themes + current desk + settings in one file), not per-theme — so the Save button is correctly active even when the theme you're viewing has empty slots.
- Warning text uses `var(--sb-heading)` so it's readable on all four themes (NOT a hardcoded color).

## Asset Path Rule — CRITICAL (production builds)
- NEVER reference assets with a literal `/src/...` path (resolves only in dev; silently vanishes in the GitHub Pages build).
- Images: static import (`import logo from '../assets/cozydesk-logo.png'`). Sounds: route through soundManager. Music: static-import each track in audioManager.js and reference from THEME_TRACKS.

## Service Worker / Cache (FIXED Jul 20 — do not regress)
- `src/main.jsx` registers `/sw.js` in PRODUCTION ONLY (`if (import.meta.env.PROD)`). Never unconditionally.
- `public/sw.js` serves the **app shell network-first** (navigation / `/` / `index.html` / `manifest.json`) and **hashed assets cache-first**. This is what lets deployed updates actually reach installed users instead of sticking on a stale build. Cache name is versioned (`cozydesk-vN`); bump N to force old caches to clear. DO NOT revert to cache-first for the app shell.
- Manual unstick (if ever needed): DevTools > Application > Service workers > Unregister + "Bypass for network"; then Clear site data; close tab, reopen.
- When something behaves impossibly (fixes don't show, broken images, "rising client:438" noise — the last is harmless Vite HMR websocket noise), suspect the ENVIRONMENT (caching, file location) before the code.

## Error Boundary (SHIPPED Jul 20)
- `src/ErrorBoundary.jsx` (class component — error boundaries must be) wraps the app in `main.jsx`. On any render crash it shows a warm cozy card with a "Reload CozyDesk" button and text that explicitly steers users AWAY from clearing browser data. Self-contained inline styles (no theme/CSS dependency, since those could be what crashed).

## Size Model (DO NOT REGRESS)
SIZE = absolute pixels (window-independent). POSITION = ratios (xRatio/yRatio).
- Sticky notes: store `w` (px); always square. Base 180px.
- To-do papers: store absolute `w`/`h` from each theme's `todoBase` in themeRegistry.js.
- Render fallback: `item.w ?? item.wRatio * dimensions.width`.
- `todoSize` in themeRegistry is LEGACY — do not use for new logic.

## Font Rules
- UI font: Nunito only, everywhere.
- Patrick Hand: RETIRED — allowed only as a user-selectable option in note/to-do font pickers. KNOWN VIOLATION (queued): ContextMenu.jsx still sets `fontFamily: 'Patrick Hand'` — one-line fix, its own commit.
- Fredoka One deprecated → use Fredoka. Steampunk sidebar labels: Cinzel Decorative. Lofi chalk: Caveat.
- Font-picker options: Caveat, Indie Flower, Shadows Into Light, Permanent Marker, Fredoka, Nunito.

## Sticky Note Rules — UNIVERSAL
- One universal note set shared by ALL themes: `src/assets/stickynotes/note-{yellow,pink,blue,green}.png` (1024×1024 transparent, soft pastel, one curled corner, NO baked shadow — component adds its own). `getThemeStickyNotes(name)` in themeRegistry returns a theme's own color notes if its folder has any (filename not containing 'todo'); otherwise the universal four, always with the theme's own to-do paper appended. Today no theme overrides.
- To change the note look for ALL themes: replace those 4 PNGs (make ONE master, recolor it). New worlds inherit them — they need only a to-do paper.
- ONE shared text area, default in StickyNote.jsx: `top 20% / left 19% / right 19% / bottom 22%`. No per-theme overrides today (component still supports `theme.stickyNoteTextArea` via `??`).
- Default 180×180px, locked aspect ratio. Color picker: 4 swatches; color derived from filename keyword.
- Pin to front: zIndex = `isPinned ? 450 : (layer ?? 5)`. 450 sits above desk layers, below sidebar (500) and modals (~10000). A pinned note's right-click menu shows "Unpin" INSTEAD of layer options. Local pin state syncs from the `pinned` prop via useEffect.

## To-Do List Rules
- Every theme needs a todo asset in its stickynotes/ folder, filename containing `todo`. Fallback: `src/assets/stickynotes/todolist1.png`.
- `todoBase` per theme drives sizing: kawaii {w:358,h:402}, lofi {358,384}, steampunk {358,519}, cafe {358,353}.
- PER-THEME ITEM CAP `maxItems` in themeRegistry (kawaii 6, lofi 4, steampunk 6, café 5). Read by ReminderPaper.jsx (`theme.maxItems ?? 6`) and useDeskState.js (DEFAULT_ITEMS_PER_PAPER = 6 fallback). Per-theme because boards differ in height. At the cap the input hides and the list holds still (correct "full" state). Checked rows show a small ✕ → deleteReminder.

## Calendar ↔ Sticky Note Sync
- Notes link to calendar via `noteId` — preserve it through ALL edit/move/drag ops, never regenerate.
- Each date written on a note becomes its own calendar event; the full line goes to the event. Dedup: same dateKey + same eventText = skip. noteId stored on the event when the user confirms the popup. Reverse-sync popup was removed intentionally (not a bug).

## Theme System
All visual config in `src/themes/themeRegistry.js` — never hardcode theme names in components.
- Themes: Cozy Kawaii, Lo-Fi, Steampunk, Café Morning (all four complete). Day-cycle concept: Café (morning) → Kawaii (midday) → Steampunk (sunset) → Lo-Fi (night).
- `cozykawaii.jsx` is the main desk renderer for ALL themes — don't rename. It's in `src/themes/`, NOT `src/themes/cozykawaii/`.
- Clocks: kawaii/lofi/steampunk use per-theme components (ClockSticker, LofiClockSticker, SteampunkClockSticker). Café uses shared `DigitalClockSticker` (registry-driven via `clockTheme`). New themes use it. `clockTheme.hideFlip: true` when the image has baked-in text that would mirror (e.g. café's "Coffee Time").
- New world checklist: create `src/themes/[name]/` with `widgets/` (calendar+clock) and `stickynotes/` (ONE `todo` asset — no note art needed). Background 1920×1080 → `src/assets/backgrounds/`. Add registry entry (todoBase, calendarTheme w/ sidebar icon, sidebar `--btn-bg`/`--btn-text`/`--btn-font`). Sidebar clock icon is theme-aware (needs a new `LiveXxxClockIcon` + branch in Sidebar.jsx for a custom clock). Add a THEME_TRACKS entry in audioManager.js or it silently borrows kawaii's playlist. Test: drop note/todo/calendar/clock, switch in and out, confirm calendar-sharing popup, reload to confirm heal.

## Sidebar Rules — CRITICAL
- Two sidebar files: `Sidebar.jsx` and `LofiSidebar.jsx`. ANY sidebar UI change must be applied to BOTH.
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
- Sound map: sfx_place_note (note drop), sfx_alert_box (sticker/todo/calendar drop), sfx_sticker_lift, sfx_click_button, sfx_save, sfx_delete_whoosh, sfx_ping (check reminder), sfx_uhoh (hit cap), sfx_timer_start/end/reset, sfx_undo_redo, sfx_clear_screen, sfx_areyousure (confirmation popup appears).

## Music Player — NEVER BREAK
- MusicPlayer.jsx (UI) + utils/audioManager.js (singleton). Imported in BOTH sidebars, after the logo. Always starts paused. localStorage key `cozydesk_music`.
- RELATED: the Pomodoro timer drives audioManager (play/pause/next) from `src/utils/timerStore.js`, not from the component. Timer Start reacts music (off→play, on→next); Pause/Reset pause music (no rewind). See "Pomodoro timer state" section.
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
- Inert `snapshot`/`_getSnapshot` leftovers in ThemeContext.jsx are intentional. There is NO `cozydesk_carryover_pref` key. Sticky notes and to-do lists are strictly per-theme, never carried across a switch — TODAY. Shared to-do lists ("Pass 2") were always the intended next step after calendar sharing but were blocked because to-do items live in a separate system with per-theme item caps and per-theme board heights (kawaii/steampunk 6, café 5, lofi 4) — unclear where overflow would go if one list were shown across boards of different sizes. Resolved Jul 24: adding SCROLL to the to-do widget removes this blocker entirely (the underlying list can be identical across themes; each board just becomes a differently-sized window onto it). Build order: scroll first, then shared to-do. See Parked section.

## Key Learnings
- NEVER `localStorage.clear()` in dev (breaks Vite HMR → black screen). Safe clear: `Object.keys(localStorage).filter(k=>k.startsWith('cozydesk')).forEach(k=>localStorage.removeItem(k)); location.reload()`.
- READ AND TRACE, don't just read. The pin bug: `layer != null ? layer : (isPinned ? 100 : 5)` always used layer, so the pinned branch was dead — the line looked right but never ran. Fix: `isPinned ? 450 : (layer ?? 5)`.
- The guilty-looking line is often the VICTIM. Cross-theme save bug (Jul 20): `currentDesk || getLastSaved` looked wrong, but the real cause was `currentDesk` state in the sidebars never being cleared on theme switch. Tracing to where the prop is SET found it. Fixed defensively in SavePopup (validate currentDesk against the current theme's slots) — one file, and it makes the stale value harmless so it can't be re-broken.
- NEVER hardcode colors in shared UI — use `var(--sb-*)`. Hardcoded `#000` was invisible on dark themes (Jul 20).
- A found bug is usually pre-existing and SEPARATE from the current task — give it its own diagnosis and its own commit. Never `git add .`; check status before and after staging.
- LOGS BEAT THEORIES. When a behavior is intermittent, print the actual data before theorizing. Two wrong guesses = add logging, stop theorizing.
- LAYOUT-AFFECTING CAPS MUST BE PER-THEME. One global number was wrong (lofi short, café mid).
- DON'T BUILD FOR A STATE THE CODE CAN'T REACH — verify the problem is real and reachable first.
- When a CSS override doesn't take, check the full DevTools cascade — a correct rule can be beaten by a higher-specificity global reset elsewhere.
- A visually appealing feature can still be wrong for the product (wall art abandoned — manual stretch broke "drop and forget"). Test UX fit early.
- The doc drifts from the code. When CLAUDE.md and the files disagree, the CODE wins — verify, then fix the note.
- CLAUDE CODE OVERSTEPS WITHOUT THE HARD RULES BLOCK. Lead every prompt with it.
- Service worker only runs in the production build — a cache/SW fix can't be fully tested in `npm run dev`; verify after deploy.
- ALWAYS `cd ~/Developer/cozydesk` before running `claude`. It once opened in the parent folder, which would have exposed every project and backup. Verify the "Accessing workspace" line before answering the trust prompt.
- `git push` printing "Everything up-to-date" means the COMMIT never happened. Verify with `git log --oneline -3` after every push.
- A rejected push usually means the remote has a commit you don't (often GitHub-generated, e.g. a CNAME commit). `git fetch` + `git log origin/main` to confirm before acting.
- A green `build` job with a red `deploy` job is good news — it isolates the failure to permissions/config, not code.
- `src/App.jsx` is DEAD CODE — never imported by `main.jsx`. Candidate for a cleanup commit.
- Custom input styles must set BOTH `color` AND `background` explicitly. `SavePopup.jsx`'s desk-name input set `color: '#333'` with no `background` — invisible dark-on-dark in OS dark mode (fixed Jul 24, commit `179fe5e` — added `background: '#fff'`). Any other bare input style is a candidate for the same bug; worth a dark-mode click-through when convenient.
- Onboarding test method: to test the first-timer flow, clear cozydesk keys in the console THEN IMMEDIATELY hard-refresh (Cmd+Shift+R) before the mounted desk autosaves itself back. Clearing while the app runs proves nothing — the desk re-writes cozydesk_state_* and you wrongly get "Welcome back". Confirm you're on the localhost port whose npm run dev banner shows cozydesk@<version> — NOT app.cozydesk.app, NOT a stale tab on another port.
- Measure before theorizing (reinforced Aug 5): the onboarding bug was first diagnosed with a wrong autosave-race theory; the real cause was found only by running Object.keys(localStorage) and seeing a leftover cozydesk_state_lofi key (a testing artifact from clear-while-running). Always get the measurement before describing a mechanism.
- existingUser-style checks must be captured once at module load, not recomputed per render — any re-render reading live localStorage can change a routing decision.
- TERMINAL STEPS IN SAFE ORDER: always present multi-step commands in exact safe execution order — the precondition/safety step comes FIRST (e.g. `cd ~` before a `cp -r` backup, so the backup never runs from inside the folder being copied). Learned Aug 5 (backup steps were given cp-before-cd once; caught before harm).
- BACKUP NAMES WITH REAL DATES: hand over backup commands with the real date already filled in (`_0805d`), never a placeholder token like `MMDD` — a verbatim copy once created a literally-named `cozydesk_backup_MMDD` folder (harmless but confusing).
- Mugzy (and any component with an early `if (!visible) return null;`): all React hooks MUST run BEFORE that early return, or toggling the component off crashes. Never move hooks below an early return.
- RAPID PUSHES CAUSE HARMLESS DEPLOY CANCELLATIONS: pushing several commits in quick succession makes GitHub Pages cancel the earlier deploy ("Canceling since a higher priority waiting request for pages exists"). The newest deploy contains all prior commits, so nothing is lost. For a batch of small tested changes: still commit one-per-fix (clean history), but PUSH once at the end.

## Completed — Do Not Rebuild or Re-break
Universal sticky notes; per-theme maxItems + delete-completed ✕; settings panel zIndex 600; pin-to-front + Unpin; clock flip + XS/S/M/L/XL sizing; attach/detach for stickers and notes; Save / My Desks (10 slots/theme); lofi sidebar icons; steampunk gears + mahogany sidebar; per-theme theme-color meta; aspect-ratio locking; 4 tracks/theme; sticker box hugs art; storage-full warning; calendar sharing; sticker + note + to-do-paper rotation persistence (rotationRef pattern — onMove writes ref, onUp reads it, dodges stale closure; add fns seed rotation:0; initialRotation prop seeds on load); **cache/app-shell fix; error boundary; backup/restore; cross-theme save-overwrite fix** (all Jul 20). Settings now shows a live version number (read from package.json) plus a 'Report a bug' mailto link to cozydesksupport@gmail.com (Jul 21). Fixed: SavePopup.jsx desk-name input invisible in OS dark mode (Jul 24, commit `179fe5e`). Focus mode + Mugzy polish (Aug 2–3, on experiment-focus, NOT yet on dev): world vignette/glow, music reaction + pause-on-stop, sticker settle-bounce, Mugzy blink/glow/pulse/shadow-removal, Mugzy toggle button with summon-on-start + custom sound, timer circle+card focus glow, Settings Show-Mugzy label fix; to-do commit-on-blur, hover-glow removal, Safari drag-artifact fix; Pomodoro buttons Patrick Hand→Nunito.
- Focus Mode + Mugzy — SHIPPED LIVE (v1.2.0, Aug 5). experiment-focus merged to dev and deployed: FocusOverlay, focus glow (circle + card frame), sticker settle-bounce, music pause-on-stop, Mugzy (9 poses + blink + toggle button + summon-on-start + sfx_mugzy_toggle), to-do commit-on-blur, hover-glow removal, Safari drag fix, Pomodoro Patrick Hand→Nunito.
- Onboarding existing-user freeze fix (Aug 5, commit 0985a2b). src/main.jsx — existingUser is captured ONCE at module load (INITIAL_EXISTING_USER) instead of recomputed on every AppGate render. First-timer → splash→pick-world; returning user → "Welcome back". Do NOT revert to recomputing per-render.
- New café stickers (Aug 5, commit 9a36463). 8 new + 1 re-trimmed. Art-only, glob-loaded.
- Lo-Fi timer-reset FIX (Aug 5, commit 7012e01). timerStore.js singleton owns Pomodoro state + interval + focus-bus driving; PomodoroTimer.jsx now a thin subscriber. Timer survives world-switches, session-scoped. See "Pomodoro timer state" section. This closed the former #1 KNOWN BUG.
- Double-click-to-add (Aug 5, commit 4fbabc9). Second way to place items (drag is first). Stickers + all four tools (to-do, note, calendar, clock), BOTH sidebars. `handleDeskAdd(data)` in useDeskState.js is the double-click twin of handleDeskDrop — near-center random position, reuses the same addPaperAtPosition/addNoteAtPosition/addCalendarAtPosition/addStickerAtPosition fns (so caps + sounds inherited, nothing re-implemented). Additive only; drag path + data shapes untouched. onDeskAdd is prop-threaded hook→sidebar→leaf components; new themes reusing the shared Sidebar.jsx inherit it automatically.
- Press-Start nudge (Aug 8, commit 454200a). One-time nudge fixing the tester-confirmed problem that first-timers don't know to press Start. A user who's never pressed Start sees (after ~3.5s) a warm glow on the Start button + label "Your world is waiting… press Start"; pressing Start fades both forever (localStorage flag `cozydesk_start_discovered`). PomodoroTimer.jsx (nudge state + flag-flip on press) + Sidebar.css (`.pomo-start-nudge` + `.pomo-start-glow`, theme-variable colored, works in all 4 themes). The old "move timer to top" reveal task was DROPPED — the nudge solves discoverability directly and better.
- Lo-Fi sleeping-dog sticker (Aug 8, commit 01711c6). Art-only, glob-loaded, `src/themes/lofi/stickers/lofianimaldog.png`.

## Launch Prep — Where We Are
Shipped and LIVE: cache fix, error boundary, backup/restore, Settings version + Report a Bug, legal docs, onboarding, deploy, smoke test, focus mode + Mugzy, timer-reset fix, double-click-to-add, press-Start nudge. Friends beta is DONE — tester feedback drove the double-click + press-Start work; the beta push freeze is LIFTED.

LANDING PAGE — FULLY REDESIGNED & LIVE (Aug 8, commit 94728c9 on a-grow/cozydesk-landing). Was a stale waitlist; now: live-app framing ("Open CozyDesk"), transparent logo, all 4 worlds with correct free/paid tags, dark worlds-band, $10.99 bundle CTA (→ GUMROAD_BUNDLE_URL placeholder until Gumroad exists), soft/non-binding "$100 → 2 new worlds" note, browser-aware install hint, footer legal links wired to live pages + cozydesksupport@gmail.com contact. Still open (non-blocking): Lo-Fi hero video (hero.mp4 in images/), replace GUMROAD_BUNDLE_URL.

IN-APP LOCKED-THEME UX — DECIDED (not built): clicking a locked/paid world shows a clean "unlock this world" PREVIEW SCREEN (full-bleed world bg + card with name, flavor text, Unlock button → Gumroad, "already bought? enter key" link). Do NOT do the "grayed-out tools inside the desk" version. Onboarding first-screen shows only the 2 FREE worlds; paid worlds discovered via dropdown.
1. ✅ DONE (Aug 10): All 3 Gumroad products live + published with license keys. Café Morning (ID ag2OVA20ZA5MRprzdCfkbQ==, /l/cafe-morning), Steampunk (ID dTPl_boio9BdX4AmKgLFDA==, /l/steampunk), All-Access Bundle (ID ow1nWZSw-biORBpzMWA1Qw==, /l/all-access, $10.99). Bundle is a plain Digital product (NOT Gumroad's Bundle type — that gives separate keys per product). App mapping: Café ID→Café only, Steampunk ID→Steampunk only, Bundle ID→both paid worlds + future worlds. Cover images still TODO (separate creative session).
2. License unlock — Step 1 DONE (commit 223d379, on dev). src/utils/licenseManager.js built + console-tested: paid/free logic confirmed working. DORMANT — no UI wired, paid worlds still open freely (correct at this stage). Gumroad verify confirmed secret-free (product_id + license_key only, from live docs); passes increment_uses_count:false; validates not-refunded/chargebacked; caches to cozydesk_unlocked. OPEN: CORS untested — needs a real purchased key. Do a $2.99 Café test-buy before next session. Live picker = ThemesSection.jsx (native <select>, both sidebars); ThemeSwitcher.jsx+App.jsx dead. NEXT: Step 2 world gallery w/ lock badges (replaces the <select>) → Step 3 unlock modal → Step 4 gate setTheme/setThemeDirect + onboarding free-only → Step 5 e2e test.

PAYMENTS — DECIDED: GUMROAD (changed from Lemon Squeezy). Use the EXISTING DoodleAndy Gumroad store (already approved/verified — removes Lemon Squeezy's slow-verification launch risk). Gumroad is Merchant of Record (handles global VAT/GST/sales tax — Andrew's "least tax work" requirement met). Fee 10% + $0.50/direct sale (higher than LS's 5%+50¢, but the difference is trivial at launch volume). FREE/PAID SPLIT (confirmed Aug 8): FREE = Cozy Kawaii + Lo-Fi Night. PAID = Café Morning + Steampunk. PRICING DECIDED: per-world à la carte $2.99 each (keeps ~$2.19 after Gumroad's 10%+$0.50; chose $2.99 over $1.99 because $1.99 loses ~35% to the flat fee, and buying all 4 individually = ~$12 makes the bundle the smarter buy). All-access bundle $10.99 (keeps ~$9.39; buyers are warm, not cold impulse). Instead of lowering prices, run a LAUNCH DISCOUNT (e.g. "first two weeks" or a YouTube code) for the "deal" + urgency while keeping anchors. PROMOTE the bundle over per-theme sales. Profile-name "DoodleAndy" does NOT need renaming to launch — CozyDesk themes are products inside it; renaming is a later optional branding call.

Legal notes: no law requires disclosing the app was BUILT with AI; the AI-art line is goodwill. EU AI Act Art. 50 (applicable Aug 2, 2026) targets live AI systems/deepfakes, not a static app shipping pre-made art. Confirm commercial rights to the AI-generated images.

## Parked — After Beta / Growth (NOT launch blockers)
Build new worlds (standing priority once launch prep is done). "Worlds" rename (Themes → Worlds — its own deliberate session). Positioning/landing copy ("cozy workspace," sell the feeling first). Premium messaging + community roadmap + vote-on-next-world. Analytics (adds a privacy-policy obligation — defer, add the disclosure when it ships). Demo video + screenshots. Sidebar Themes dropdown → visual gallery (thumbnails, lock + $1.99; surface $10.99 all-access only at buy moment, worded "all current and future worlds, one payment" — never "forever"). Hover-glow (desktop-only). Export a single desk to share (distinct from backup). Tauri native wrap (only if beta demands a real installer / folder auto-save).
New parked (Jul 21): Remove the dead 'Notify Me / Save My Cozy Spot' email box from the landing page BEFORE legal docs go live (a live-looking signup contradicts 'no email collection'; it currently collects nothing). At checkout (store UI task), add a 'unlocks instantly, non-refundable once used (see Refund Policy)' line near the Buy button — this makes the refund waiver bind. Refund stance DECIDED: no automatic refund window, instant-access, final-by-default, case-by-case goodwill.

New parked (Jul 24, from first beta bug reports):
- Safari bug (reported by tester Bruce): to-do list shows yellow streak artifacts, suspected caused by a glow effect the to-do list has that no other widget has (an inconsistency Andrew wants removed regardless). Also reported to-do list "cutting off" tasks — needs clarifying with Bruce whether this means (a) the per-theme item cap is correctly stopping new items [designed behavior] or (b) items are being visually clipped [a real bug] before any fix is written.
- To-do list SCROLL — elevated priority. Fixes Bruce's cutting-off report either way, AND is now understood to be the prerequisite that unblocks shared to-do lists (see To-Do List Rules / Calendar Sharing sections). Build before shared to-do.
- Shared to-do list "Pass 2" — build after scroll ships. Same pattern as calendar sharing: one shared list, every theme reads/writes it. Do NOT require the visible content area to be pixel-identical across themes (would mean redrawing all four to-do boards to match) — with scrolling the underlying LIST is identical, the WINDOW onto it can keep varying by theme, same as today.
- Auto-add calendar events to the to-do list — separate, unresolved idea. Risky as automatic behavior (could flood the to-do with every appointment); more plausible as opt-in per event. Not decided.
- Save/My Desks UX: Andrew went to "My Desks" first to save a desk, not the Save button — natural instinct, not user error. If beta confirms others do the same, add a save action INSIDE the My Desks popup rather than retraining people to look elsewhere.
- Install button discoverability (elevated Aug 5): Chrome's address-bar install icon is easy to miss. Plan an in-app "Install CozyDesk" button (sidebar or Settings) that only shows when the browser supports installing (`beforeinstallprompt`); Safari users get a "File → Add to Dock" hint instead since there's no button to show; hide entirely if already installed. Apply to BOTH sidebars. Pair with ONE gentle, dismissible nudge after a user's 3rd visit ("Enjoying CozyDesk? Keep it in your dock") — not on the splash screen, which is too early to ask for that commitment.
- Backup filename timestamp: add HHMM so same-day backups don't collide as `(1).json`. One line in `backupManager.js`.
- Small-screen notice: warm "CozyDesk is built for a bigger screen" message for phone visitors. Needed before public launch, not for a briefed friends beta.
- Timer discoverability: SOLVED Aug 8 by the press-Start nudge (see Completed). The "move timer to top" idea was DROPPED as redundant. The richer "guided Mugzy tutorial (Version B)" — Mugzy spotlights sticker area → to-do → glows Start and waits for the press as the finale — remains PARKED as a possible post-launch upgrade IF the simple nudge proves insufficient with real users. A "first-focus whisper after the world transforms" (cozydesk_focus_revealed flag) is also still available as a later polish; not needed now.
## Focus Mode + Mugzy — quick reference (LIVE)
Pomodoro Start (work mode) makes the world respond: dark vignette + warm center (`FocusOverlay.jsx`, `focusBus.js`) + contrast/brightness filter; stickers do a staggered settle-bounce (bounce fires on rising edge of `focusActive` inside each Sticker; class-removal timeout is `bounceDelay + 500` — a flat value once skipped later stickers, the "fishtank bug"). `.pomo-circle` gets a blue pulsing glow, `.pomo-widget` a restrained blue frame — same blue in every theme ON PURPOSE (connects to Mugzy); do NOT theme-color it. Mugzy: poses in `src/assets/mascot/` (idle, wave, sparkle, cheer, sleep, run, focus, blink); idle-blinks ~130ms every 2–3.5s only when idle; ground shadow removed in all states; toggle button `.pomo-mugzy-btn` in PomodoroTimer.jsx reads/writes `cozydesk_mugzy` and syncs via `cozydesk-mugzy-toggle` event. (Hooks-before-early-return crash rule is in Key Learnings.)

## Pomodoro timer state — FIXED Aug 5 (commit 7012e01) — do not regress
Timer state and its ticking interval live in a singleton, `src/utils/timerStore.js` (same pattern as soundManager/audioManager), NOT in PomodoroTimer's local useState. This is what lets the timer survive crossing into/out of Lo-Fi — `Sidebar.jsx` returns `<LofiSidebar/>` for lofi (an element-TYPE change that unmounts PomodoroTimer), and the old local useState was wiped by that remount. Now the store owns state + interval, and `PomodoroTimer.jsx` is a thin subscriber view (useReducer+useEffect → timerStore.getState(), buttons call store methods). The store also drives focus mode via setFocusActive() — the component MUST NOT call setFocusActive(false) on unmount (that cleanup flickered focus off on every world-switch; it was removed). Timer is SESSION-SCOPED: survives world-switches, resets on full page reload (correct — a stale countdown resuming hours later would be wrong). Reset pauses music but does NOT rewind it; next Start resumes the track where it left off — deliberate (cozier than restarting). Kept showSettings + mugzyOn as local UI state.

## Strategy & Direction (parked — no code changes from this yet)
Jul 24 evening: a long product-strategy conversation concluded CozyDesk today is
strong on atmosphere/customization but has no mechanism that gives users a reason
to return daily — closing the tab currently costs nothing. Three candidate directions
were discussed, NOT decided, and explicitly deferred until after the Aug 3 beta
deadline so real feedback (not one enthusiastic text) drives the choice:
1. Give the to-do list "teeth" — carryover of unfinished items, a sense of "today,"
   a completion moment when finishing something. Closest to what exists; highest
   leverage; the direct beneficiary of the shared-to-do-list work above.
2. Make the Pomodoro/focus timer the centerpiece rather than a sidebar afterthought
   — position CozyDesk as a focus-ritual destination competing with "leave a lo-fi
   video running," not with Notion. Most differentiated option.
3. Let the world visibly remember daily use over time (growing plant, seasonal decor)
   — ties retention directly to theme-purchase motivation.
Full reasoning, including how non-creative productivity apps (Notion/Todoist/Calendar)
retain users and why CozyDesk shouldn't try to out-compete them at being "depended
upon," lives in the session summary docs, not reproduced here. Also confirmed this
session: the PWA + Lemon Squeezy payment model needs no special architecture — no
accounts, Lemon Squeezy is merchant of record, unlock state is a license key checked
against localStorage, same local-first tradeoff as desks (clearing data loses the
unlock; mitigated by the emailed key). Nothing here changes before Aug 3.

## Queued Cleanups (one at a time — backup + commit each; do NOT batch)
- ContextMenu.jsx font 'Patrick Hand' → Nunito (one line).
- stickynotes/ → todo/ folder rename per theme (git mv, update glob in themeRegistry, grep stray refs). Optional.
- WebP conversion — BEFORE LAUNCH, one-time hand-checked per-asset (NO blind batch — lossy WebP smears gradient/transparency; preserve alpha). Glob already accepts .webp.
- Debounce auto-save — AFTER beta (debounce only background autosave; keep slot + theme-switch saves immediate; flush on visibilitychange/pagehide).
- ClockSticker + calendar flip/rotate: audit for the same rotation-only NaN trap that hit papers.
- To-do small-screen clamp: move from spawn-time to render-time so saved desks fit phones.
- Move old `cozydesk_backup_*` folders out of `~/Developer` to declutter search.
- Unused deps: framer-motion only (verify first). react-draggable IS used — do NOT remove.

## Known Limits
- Firefox desktop cannot install PWAs (browser limitation, not fixable).
- "Launch maximized" isn't guaranteed by the manifest (own-window, not maximized) — set expectations.
