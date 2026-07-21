# CozyDesk — Claude Instructions
Last updated: Jul 20, 2026. Read fully before touching any code.

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
- GitHub Pages, repo a-grow/cozydesk. `dev` = active development, `main` = landing page only. Domain: cozydesk.app; app will live at app.cozydesk.app.
- Stack: Vite + React (PWA). UI font: Nunito everywhere.
- Hosting is 100% free and needs nothing running on Andrew's end. Users each run their own copy; deployed updates reach them on next open (once the service worker is correct — see below).

## Environment — CRITICAL
- Project MUST live at ~/Developer/cozydesk — NOT on the iCloud-synced Desktop. iCloud sync creates conflict-duplicate files ("useDeskState 2.js") and duplicates Vite's cache → stale builds. Old Desktop location is backup-only.

## Delivery Model (Phase 1 — DECIDED)
- Ship as a **PWA (Option A), free.** Users visit app.cozydesk.app once and INSTALL through the browser: Chrome/Edge = one-click; Safari = File → Add to Dock; Firefox CANNOT install PWAs. End result = a real app in the dock/taskbar, own window, no browser visible.
- There is NO downloaded installer file. Landing copy must say "Install," never "Download for Mac" (that would be the Tauri path).
- Tauri (true `.dmg`/`.exe` installer, silent auto-save to a chosen folder) is DEFERRED — costs ~$99/yr Apple signing + notarization. Revisit only if beta proves demand.
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
- Inert `snapshot`/`_getSnapshot` leftovers in ThemeContext.jsx are intentional. There is NO `cozydesk_carryover_pref` key. Sticky notes and to-do lists are strictly per-theme, never carried across a switch.

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

## Completed — Do Not Rebuild or Re-break
Universal sticky notes; per-theme maxItems + delete-completed ✕; settings panel zIndex 600; pin-to-front + Unpin; clock flip + XS/S/M/L/XL sizing; attach/detach for stickers and notes; Save / My Desks (10 slots/theme); lofi sidebar icons; steampunk gears + mahogany sidebar; per-theme theme-color meta; aspect-ratio locking; 4 tracks/theme; sticker box hugs art; storage-full warning; calendar sharing; sticker + note + to-do-paper rotation persistence (rotationRef pattern — onMove writes ref, onUp reads it, dodges stale closure; add fns seed rotation:0; initialRotation prop seeds on load); **cache/app-shell fix; error boundary; backup/restore; cross-theme save-overwrite fix** (all Jul 20).

## Launch Prep — Where We Are
Done: cache fix, error boundary, backup/restore. Next, in order:
4. Settings additions — version number (so bug reports name the build) + lightweight "Report a Bug" contact.
5. Legal docs — Terms/EULA, Privacy, Refund, local-save warning (Claude drafts; review or run through Termly/iubenda). NOT legal advice.
6. Onboarding — splash + first-launch pick-your-world + Terms/Privacy gate + local-save warning + "Artwork made with AI tools" line; store `cozydesk_terms_v1`; returning users go straight to last theme.
7. Deploy — app.cozydesk.app (subdomain, keeps Vite base at '/'), GoDaddy DNS CNAME app → GitHub Pages, install button, "how to install (Chrome/Edge/Safari; Firefox can't)" copy.
8. Smoke-test matrix — fresh install, reinstall, save, load, theme switch, calendar, sticky notes, to-do lists, updates-don't-erase-data; check right-click layer menu on touch (long-press).
9. Friends beta (3–5).
10. Launch auditor — CozyDesk-specific PASS/FAIL gate (NOT a backend-SaaS checklist — no DB/RLS/server-auth items apply here).

Legal notes: no law requires disclosing the app was BUILT with AI; the AI-art line is goodwill. EU AI Act Art. 50 (applicable Aug 2, 2026) targets live AI systems/deepfakes, not a static app shipping pre-made art. Confirm commercial rights to the AI-generated images. Payments (LemonSqueezy, merchant of record) wired LAST, after worlds + store exist; sign up early (verification is slow). Recommend paid themes at $2.99 (flat $0.50/txn fee stings at $1.99).

## Parked — After Beta / Growth (NOT launch blockers)
Build new worlds (standing priority once launch prep is done). "Worlds" rename (Themes → Worlds — its own deliberate session). Positioning/landing copy ("cozy workspace," sell the feeling first). Premium messaging + community roadmap + vote-on-next-world. Analytics (adds a privacy-policy obligation — defer, add the disclosure when it ships). Demo video + screenshots. Sidebar Themes dropdown → visual gallery (thumbnails, lock + $1.99; surface $10.99 all-access only at buy moment, worded "all current and future worlds, one payment" — never "forever"). Hover-glow (desktop-only). Export a single desk to share (distinct from backup). Tauri native wrap (only if beta demands a real installer / folder auto-save).

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
