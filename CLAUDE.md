# CozyDesk — Claude Instructions
Last updated: Jun 29, 2026. Read fully before touching any code.

## Claude's Role
A senior expert wearing three hats:
- Software Engineer — production-ready code only (YAGNI, DRY, KISS, SOLID). Simplest solution wins. Read the real code before answering; never speculate. Calculate the full solution before implementing — no trial and error.
- Disney Imagineer — every theme is a complete world; every pixel intentional. Assets, colors, fonts, interactions reinforce the theme.
- PWA Designer — CozyDesk is used daily and must feel polished: performance, cross-browser, bulletproof state.

Communication: Direct and honest. Admit mistakes immediately without self-abasement. One clarifying question at a time. Check in before acting. Andrew is the creative director and final decision-maker, and is non-technical — keep explanations plain. Never assign Andrew tasks to do outside the session. Always include file paths when asking for files or giving instructions.

## How Claude Solves Problems
1. Root cause, never symptom.
2. Read the real code first — never work from memory. And don't stop at the relevant line: TRACE it. Follow the actual values and execution path. A line can look correct and still never run (see Key Learnings — the pin bug).
3. Measure, don't guess. Use DevTools for real pixel values on the LIVE rendered element — not estimates from a source image. When a behavior is reported broken, get a quick live test before asserting it's fine (see Key Learnings — the Move Backward bug).
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

## Claude Code Prompt Rules — REQUIRED PREAMBLE
This chat = planning, diagnosis, small single-file fixes (give those as exact find/replace for VS Code). Claude Code = multi-file changes only.

Andrew commits, tests, and pushes — Claude Code NEVER does. Every Claude Code prompt MUST begin with the HARD RULES block below. (Evidence: the one prompt this session that omitted it committed and pushed after being told not to, started a dev server, tried to install Playwright, and created stray files. Every prompt that included it behaved perfectly.)

    ## HARD RULES — READ FIRST, NO EXCEPTIONS
    - Do NOT run git add, git commit, or git push. Andrew commits himself AFTER he tests.
    - Do NOT install any package or run browser automation (no playwright, puppeteer, npm install).
    - Do NOT start a dev server. Andrew tests manually.
    - Do NOT create, modify, or write to any file not explicitly named in this prompt
      (no AGENTS.md, no tasks/todo.md, no settings files).
    - Make ONLY the edits listed. When done, STOP and report exactly what changed, then wait.

Also when writing Claude Code prompts:
- Give EXACT find/replace (you've already read the file). Never vague "create an array / rewrite the function" steps — that's where small errors sneak in.
- Do NOT include a fake "@claude.ai/claude-code" header. Claude Code reads CLAUDE.md from the repo automatically — Andrew does not need to paste it (it auto-loads), and you never instruct Claude Code to "paste it to itself."

## Workflow
- Paste the full CLAUDE.md at the start of every Claude Code session only if it isn't auto-loaded; a new claude.ai chat inside this Project does NOT need a re-paste — it inherits these instructions and shared history. (Keep this Project's instructions and the repo CLAUDE.md identical.)
- Applying changes: Andrew pastes into VS Code (Cmd+A -> Cmd+V -> Cmd+S), then hard-refreshes (Cmd+Shift+R).
- Backups: from the ~/Developer directory (NOT inside cozydesk — backing up into the folder you're copying is a disaster), run `cd ~/Developer` then `cp -r cozydesk cozydesk_backup_MMDD`, then `cd cozydesk`. (Or one line from anywhere: `cp -r ~/Developer/cozydesk ~/Developer/cozydesk_backup_MMDD`.)
- One fix per commit. Stage only the files for that fix by name; commit and push before starting the next. Never `git add .` blindly. Every git command anchored to `cd ~/Developer/cozydesk` (the parent ~/Developer has no .git).

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
  components/ — Sticker, StickyNote, CalendarSticker, sidebar/MiniCalendar, LargeCalendarModal, MusicPlayer, ContextMenu, Reminders*, ReminderPaper* (* do not touch internals unless fixing that item's bugs)
  themes/ — themeRegistry.js (single source of config), ThemeContext.jsx, cozykawaii.jsx (main renderer ALL themes — in src/themes/ NOT src/themes/cozykawaii/), [theme]/widgets/ (calendar+clock), [theme]/stickynotes/ (to-do asset only — see Sticky Note Rules)
  hooks/useDeskState.js — all desk state, CRUD, undo/redo, persistence
  utils/audioManager.js — music audio singleton
  utils/soundManager.js — SFX singleton
  assets/ — backgrounds/, music/, sounds/, stickynotes/ (universal notes + legacy fallback), cozydesk-logo.png

## Asset Path Rule — CRITICAL (production builds)
- NEVER reference assets with a literal `/src/...` path in code (e.g. `src="/src/assets/..."`
  or `new Audio('/src/assets/...')`). Those resolve ONLY in `npm run dev`; in the GitHub Pages
  / Tauri build the asset silently vanishes.
- Images: use a static import (`import logo from '../assets/cozydesk-logo.png'`).
- Sounds: route through soundManager. Music: static-import each track in audioManager.js and reference from THEME_TRACKS — never a `/src/` string.

## Size Model (DO NOT REGRESS)
SIZE = absolute pixels (window-independent). POSITION = ratios (xRatio/yRatio).
- Sticky notes: store `w` (px); always square. Base 180px.
- To-do papers: store absolute `w`/`h` from each theme's `todoBase` in themeRegistry.js.
- Render fallback: `item.w ?? item.wRatio * dimensions.width`.
- todoSize in themeRegistry is LEGACY — do not use for new logic.

## Font Rules
- UI font: Nunito only, everywhere.
- Patrick Hand: RETIRED — allowed only as a user-selectable option in note/to-do font pickers.
- KNOWN VIOLATION (queued fix): ContextMenu.jsx still sets `fontFamily: 'Patrick Hand'`. The right-click menu is UI chrome and should be Nunito. One-line fix, its own commit.
- Fredoka One deprecated → use Fredoka. Steampunk sidebar labels: Cinzel Decorative. Lofi chalk: Caveat.
- Font-picker options: Caveat, Indie Flower, Shadows Into Light, Permanent Marker, Fredoka, Nunito.

## Sticky Note Rules — UNIVERSAL (changed Jun 17)
- One universal note set shared by ALL themes: src/assets/stickynotes/note-{yellow,pink,blue,green}.png
  (1024×1024 transparent PNG, soft pastel paper, one curled bottom-right corner, NO baked shadow —
  the component adds its own drop-shadow). Colors match the picker swatch hexes.
- Resolution: getThemeStickyNotes(name) in themeRegistry.js returns a theme's OWN color notes if its
  folder has any (filename not containing 'todo'); otherwise it returns the universal four. Every theme
  always keeps its OWN to-do paper appended. Today no theme overrides — all four use the universal set.
- To change the note look for ALL themes: replace those 4 PNGs. For consistency, make ONE master note,
  then recolor it (don't generate each color separately — they won't match). New worlds inherit the
  universal notes automatically — they need NO note art, only a to-do paper.
- ONE shared text area, defined as the default in StickyNote.jsx: `top 20% / left 19% / right 19% / bottom 22%`
  (measured against the universal note). There are NO per-theme `stickyNoteTextArea` overrides anymore.
  (The component still supports `theme.stickyNoteTextArea` via `??` if a future theme ever needs one.)
- Default 180×180px, locked aspect ratio. Color picker: 4 swatches (blue, green, pink, yellow); the swatch
  color is derived from the filename keyword. No sticker assets ever.
- Pin to front: the 📍/📌 pin on a selected note keeps it above all DESK items. zIndex = `isPinned ? 450
  : (layer ?? 5)`. 450 sits above desk layers but below the sidebar (500) and modals (~10000), so a pinned
  note never covers the UI. A pinned note's right-click menu shows "Unpin" INSTEAD of the layer options
  (layer actions can't beat a pinned note, so showing them would be dead buttons). The note's local pin
  state syncs from the `pinned` prop via a useEffect, so unpinning from the menu reflects visually.

## To-Do List Rules
- Every theme needs a todo asset in its stickynotes/ folder, filename containing the word `todo`.
- Fallback: src/assets/stickynotes/todolist1.png — safety net only.
- todoBase per theme drives sizing (see themeRegistry.js).
- PER-THEME ITEM CAP (added Jun 18): each theme sets `maxItems` in themeRegistry.js — how many rows
  the board can show before the "add item" input hides. kawaii 6, lofi 4, steampunk 6, café 5. Read by
  ReminderPaper.jsx (`theme.maxItems ?? 6`) and useDeskState.js (`getThemeConfig(themeName).maxItems`,
  with DEFAULT_ITEMS_PER_PAPER = 6 fallback). The cap is per-theme because boards differ in height — a
  single global ITEMS_PER_PAPER was wrong for lofi (short) and café. At the cap the input vanishes and
  the list holds still (the correct "full" state — no overflow, no popup needed).
- Checked items show a small ✕ ("delete completed item") at the end of the row → calls deleteReminder.

## Calendar ↔ Sticky Note Sync Rules
- Sticky notes link to calendar via noteId. Preserve noteId through ALL edit/move/drag operations — never regenerate it.
- Each date written on a note becomes its own calendar event; the full line of text goes to the event (not just the date).
- Dedup: same dateKey + same eventText = skip (don't add twice).
- noteId is stored on the calendar event when the user confirms the popup.

## Theme System
All visual config lives in src/themes/themeRegistry.js — never hardcode theme names in components.
- Themes: Cozy Kawaii, Lo-Fi, Steampunk, Café Morning (all four complete; more planned).
- Day-cycle concept: Café (morning) → Kawaii (midday) → Steampunk (sunset) → Lo-Fi (night).
- cozykawaii.jsx is the main desk renderer for ALL themes — don't rename.
- New theme = add config entry + assets (incl. todoBase, sidebar --btn-bg/--btn-text/--btn-font). It inherits the universal sticky notes — no note art needed.
- todoBase: kawaii { w:358, h:402 }, lofi { w:358, h:384 }, steampunk { w:358, h:519 },
  cafe { w:358, h:353 } ← real, measured Jun 18 from the 997×982 cafe-todolist.png (was a kawaii placeholder).
- Clock system: kawaii/lofi/steampunk use per-theme clock components (ClockSticker,
  LofiClockSticker, SteampunkClockSticker). Café uses the shared DigitalClockSticker
  (src/components/DigitalClockSticker.jsx) — registry-driven via clockTheme block. New themes use it.
- clockTheme fields: image, aspect (h/w ratio), screen ({left,right,top,bottom} % strings),
  numberColor, numberFont, activeBtn, inactiveBtn, hideFlip (bool — true if the clock image has text
  baked in that would mirror when flipped, e.g. café's "Coffee Time" sign).

## How to Add a New World (checklist)
Follow in order; skip one and the world renders broken in just that spot.
1. Folder: create src/themes/[name]/ with widgets/ (calendar + clock) and stickynotes/ (ONE to-do asset
   whose filename contains `todo`). NO note-color art needed — the world inherits the universal notes.
   (props/ and wallart/ subfolders are NOT used — don't create them.)
2. Assets: background → src/assets/backgrounds/ (1920×1080). Calendar/clock stickers (~400×400; calendar PNG
   can be larger — what matters is baseW/baseH + contentArea in the registry). To-do paper → measure it and
   set a real todoBase { w, h }.
3. Registry: add a config entry — must include todoBase { w, h }, calendarTheme (with its sidebar icon image),
   and the three sidebar button CSS vars (--btn-bg / --btn-text / --btn-font).
4. Sidebar: no code change for the to-do icon, sticker-grid filter, button styling, or the sticky-note icon
   (it reads the universal yellow from themeStickyNotes automatically). Exception: a distinct label font (like
   Steampunk's Cinzel Decorative) is set per theme. Clock icon IS theme-aware in Sidebar.jsx: steampunk gets
   LiveSteampunkClockIcon, café gets LiveCafeClockIcon, others get LiveClockIcon (kawaii). A new theme with a
   custom clock image needs a new LiveXxxClockIcon component + a branch in Sidebar.jsx.
5. Audio: any NEW sound effect goes in the SOUNDS array in soundManager.js before wiring. For music, add a
   per-theme entry to THEME_TRACKS in audioManager.js (static-import each track) — without it the new world
   silently borrows kawaii's playlist.
6. Pricing: decide free or paid and note the price for the store gallery (store not built yet).
7. Test before commit: drop a note, to-do, calendar, and clock; switch into and out of the theme; confirm
   the calendar-sharing popup behaves; reload a saved desk to confirm it heals.

## Sticker Grid Rules
- NEVER show clock, calendar, todo, or stickynote assets in the sticker grid.
- Filter in src/themes/cozykawaii.jsx: exclude filenames containing 'clock', 'calendar', 'todo', 'stickynote'.
- Applies to ALL themes.
- Decorative sticker PNGs are pre-trimmed to their visible art (alpha>10 bounding box) so the clickable box hugs the art. NEVER trim clock/calendar/todo/stickynote assets — their overlays are positioned as % of the image, so cropping shifts them off. A 0–3% trim is normal for frame-filling art; near-invisible alpha 1–9 edge pixels can inflate a box, so trim by alpha threshold, not by eye.
- New stickers load via the asset glob: dropping a trimmed PNG into [theme]/stickers/ is enough — NO themeRegistry edit needed (this is why an art-only commit is safe). Deletions are equally safe.

## Sound Effects System
- Singleton: src/utils/soundManager.js — mirrors audioManager.js pattern.
- localStorage key: cozydesk_sfx (boolean, default true).
- ALWAYS add new sounds to the SOUNDS array in soundManager.js before wiring triggers.
- Play via `soundManager.play('sfx_name')`. Never `new Audio()` outside soundManager.
- SFX toggle renders in BOTH Sidebar.jsx and LofiSidebar.jsx, directly after MusicPlayer.

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
- Per-theme playlists in THEME_TRACKS in audioManager.js — 4 tracks each for cozykawaii, lofi, steampunk, cafe.
  switchTheme falls back to kawaii for an unknown key. Each track is a STATIC IMPORT; the list is hand-maintained
  (dropping a file in src/assets/music/ does nothing until it's imported and added to THEME_TRACKS).

## Logo Rules — NEVER BREAK
- src/assets/cozydesk-logo.png, width 180px, centered, zIndex 1.
- Referenced via static import (NOT a `/src/...` string). Both Sidebar.jsx and LofiSidebar.jsx.
  (Lofi's was a literal `/src/` path — fixed Jun 17 to a static import.)

## Sidebar Rules — CRITICAL
- Never change sidebar fonts, icons, or colors unless explicitly asked.
- Never touch steampunk animated gears or lofi sidebar icon images.
- Buttons use CSS vars --btn-bg, --btn-text, --btn-font (use !important).
- Any sidebar UI change must be applied to BOTH Sidebar.jsx and LofiSidebar.jsx.
- To-do icon and sticky-note icon are theme-aware: both read from themeStickyNotes (todo asset = filename
  contains `todo`; note icon = the 'yellow' note, now the universal yellow). New themes get the right icons
  automatically.

## Calendar System
- CalendarSticker.jsx = sticker wrapper. sidebar/MiniCalendar.jsx renders the grid.
  LargeCalendarModal.jsx = the full-screen modal (opens on double-click OR a single day-click).
- Per-theme config under theme.calendarTheme. Sidebar icon = theme.calendarTheme.image.
- contentArea — DO NOT change without measuring the LIVE rendered widget in DevTools. Don't estimate from the
  source PNG's proportions (see Key Learnings).
- MiniCalendar values — per-theme overridable via calendarTheme (DEFAULTS in parens): gridAutoRows (17px),
  navFontSize (20px), monthFontSize (13px). Café overrides to 15px / 16px / 11px.
- Truly fixed in MiniCalendar: gap 0, alignContent start, event dot bottom 3px.

## Layering System (notes, stickers, papers, calendars, clocks, reminders)
- ONE shared `layer` number across every item type drives stacking; each item renders with zIndex = its layer.
  (Exception: a PINNED note renders at zIndex 450, overriding its layer — see Sticky Note Rules.)
- Right-click menu actions live in handleLayerAction (cozykawaii.jsx) → applyNormalizedLayers (useDeskState.js):
  - Bring to Front / Send to Back: jump the item's layer past everything (max+1 / min-1).
  - Move Forward / Backward: re-seat the item just past the nearest item it ACTUALLY OVERLAPS, skipping
    non-overlapping items (fixed Jun 25). History: the Jun-17 fix swapped with the immediate neighbor in the
    GLOBAL stack — but that neighbor is often a sticker elsewhere on the desk the item doesn't touch, so the
    swap is invisible and the action feels dead until you click many times. Now handleLayerAction computes an
    AABB overlap (bbox in ratio space) and only crosses items that actually overlap, so every click is visible.
    Items with no stored size (clocks, calendars, reminders widget) return null bbox and are treated as
    "always overlapping" — you can still cross them, at worst one extra click. Do NOT revert to the global-
    neighbor swap, and do NOT revert further to the old "+/- 1.5 nudge."
- No backdrop stickers anymore (Jun 23): corkboard now drops as a NORMAL sticker (backdrop:false, layer:getNextLayer) in addStickerAtPosition, so the box fix applies and it rotates/flips/layers like any sticker. It keeps its larger spawn size. backdrop was the only such trigger; a future real backdrop would be a deliberate new feature.

## Save Slot Data Shape — Do Not Break
- Slots store: notes, stickers, papers, clocks, calendars, calendarEvents, reminders, remindersLayer, themeMode, remindersVisible, remindersPos.
- noteId / item id = Date.now() — never regenerate on load.
- Notes also persist: src, w, layer, text, `pinned`, `rotation`, and attach fields (attachedTo/attachOffset/attachRelative). Papers also persist `rotation`. Stickers persist flippedX/flippedY/rotation and the same attach fields.
- calendarEvents shape: { "YYYY-MM-DD": [{ text, category, noteId, ... }] }.
- Keys: cozydesk_state_{theme} (auto-save), cozydesk_saved_{theme}_slot_{n} (named slots).

## Features Already Built — Do Not Rebuild
- Universal sticky notes across all four themes (one set, one text area).
- Per-theme to-do item cap (maxItems in themeRegistry) + delete-completed-item ✕ on checked rows.
- Settings panel renders at zIndex 600 — above all desk items AND pinned notes (450), below modals (10100).
- Working Pin-to-front (📍/📌) + "Unpin" in the right-click menu for pinned notes.
- Clock flip (↔) on the size-buttons row; XS/S/M/L/XL size buttons on clock and calendar.
- Attach/detach for BOTH stickers and notes. Right-click → Attach glues a child to the item beneath its center that has a lower layer (corkboard/sticker/paper/note); while attached it can't be dragged or resized (right-click → Detach to free it). Notes ride their parent's position but NEVER scale (fixed-px size model); stickers scale with the parent. Impl: attachNote/detachNote/moveAttachedNotes in useDeskState.js, and resizeAttachedStickers ALSO repositions attached notes now (its name under-describes it); the attach/detach cases + canAttach/isAttached props handle 'note' in cozykawaii.jsx; StickyNote.jsx gained an isAttached prop → disableDragging + enableResizing guard. ContextMenu.jsx needed NO change — it's already generic (driven by isPinned/isAttached/canAttach).
- Save / My Desks (10 slots per theme).
- Lofi sidebar icons; steampunk animated brass gears + mahogany sidebar background.
- Per-theme theme-color meta tag. Aspect-ratio locking on notes and to-do lists.
- Music: 4 tracks per theme, static-imported in audioManager.js.
- Sticker art refresh (Jun 25): large batch of new + re-trimmed sticker PNGs across all four themes, plus new kawaii (cozycornerbg.png) and café (cafe-background.png) backgrounds. New stickers load via the asset glob — dropping a trimmed PNG in [theme]/stickers/ is enough, NO themeRegistry edit (that's why an art-only commit is safe). Deletions are equally safe. Lofi sticker shelf grew (devices, drinks, food, photos, posters, plants); see the lofi sticker ideas list for what's next.
- Sticker box hugs its art (Jun 23): Sticker.jsx reads each image's natural aspect ratio on load (imgAspect via onLoad) and sets the Rnd box height to match, so handles hug the art and overlapping stickers stop stealing clicks. Display-only — does NOT change saved sizes, does NOT touch attach. Backdrops excluded. Round art still has small corner gaps (geometry, not a bug).

## Completed Behaviors — Do Not Restore or Re-break
- Move Forward/Backward cross only items the target ACTUALLY OVERLAPS (fixed Jun 25 — not a global-stack neighbor swap, not a fixed nudge). Pin overrides layer (zIndex 450). Pinned notes show "Unpin," not layer options.
- Sticker rotation persists across refresh (Jun 23): handleRotate keeps the live angle in rotationRef (onMove writes it, onUp reads it). The plain rotation state is stale inside onUp's closure — do NOT revert to reading it there, or rotation saves as its pre-gesture value (0 on a fresh sticker). Flip avoids this by computing next fresh per click.
- Sticky-note AND to-do-paper rotation persists across refresh (Jun 29): same rotationRef pattern as stickers — onMove writes rotationRef.current, onUp calls onUpdate({ rotation: rotationRef.current }); an initialRotation prop seeds state on load; addNoteAtPosition/addPaperAtPosition seed rotation:0. CRITICAL: updatePaper now guards x/y/w/h for undefined (mirrors updateNote). A rotation-only update arrives with NO x/y/w/h — without the guards updatePaper recomputed them from undefined → NaN → saved as null → the paper rendered at NaN and VANISHED on reload. Do NOT remove those guards. Clock/calendar flip+rotate still not audited for the same trap.
- Calendar ↔ sticky note reverse-sync popup: removed intentionally. Not a bug.
- Calendar modal opens at the month the widget is currently SHOWING — not always today (MiniCalendar onMonthChange → CalendarSticker calMonth → LargeCalendarModal initial props). Applies to ALL themes.
- Sticky notes AND to-do lists are strictly per-theme (saved with cozydesk_state_{theme}); never carried over on a theme switch. The ONLY theme-switch popup is the calendar-events sharing opt-in (see Calendar Sharing). There is NO cozydesk_carryover_pref key (older design, removed; the inert `snapshot`/`_getSnapshot` leftovers in ThemeContext.jsx are intentional, not a bug). Force the sharing popup again: `localStorage.removeItem('cozydesk_calendar_shared')` then reload (only reappears when the current theme has events).
- Storage-full warning: useDeskState.js exposes storageFull/setStorageFull; cozykawaii.jsx shows a dismissible popup.
- Service worker: registers in PRODUCTION ONLY (guarded by `if (import.meta.env.PROD)` in src/main.jsx). Never unconditionally.

## Service Worker / Stale Build — PWA Gremlin (troubleshooting)
- Symptoms: old version sticks, hard-refresh doesn't help, broken images, "rising client:438" noise, fixes don't show.
- Manual fix: DevTools > Application > Service workers > Unregister + tick "Bypass for network"; then Application > Storage > Clear site data; then close the tab and reopen.
- When something behaves impossibly, suspect the ENVIRONMENT (caching, where files live) before the code.

## Key Learnings
- NEVER use localStorage.clear() in dev — it breaks Vite HMR and causes a black screen.
  Safe clear (one line in console):
  `Object.keys(localStorage).filter(k=>k.startsWith('cozydesk')).forEach(k=>localStorage.removeItem(k)); location.reload()`
- The `rising client:438` error is Vite HMR websocket noise. Harmless in dev, absent in production. Ignore it.
- Calendar contentArea: measure the LIVE rendered widget in DevTools — don't estimate from the source PNG. Tune one axis at a time.
- When VS Code find/replace fails on a paste, it's almost always an indentation/whitespace mismatch. Don't retry — match the exact leading whitespace or edit the line directly.
- A visually appealing feature can still be wrong for the product (wall art was abandoned — manual stretch/reposition broke the "drop and forget" feel). Test UX fit early.
- A code change importing NEW asset files must commit those assets in the SAME commit. Run `git status` first; a code-only commit pointing at untracked assets ships a broken build.
- The doc drifts from the code. When CLAUDE.md and the files disagree, the code wins — verify, then fix the note.
- LAYOUT-AFFECTING CAPS MUST BE PER-THEME (Jun 18). One global ITEMS_PER_PAPER = 6 looked fine but was wrong:
  lofi's short board overflows at 4, café at 5, while steampunk/kawaii hold 6. Measure each board's real row
  capacity from a live screenshot; don't assume one number fits every theme.
- DON'T BUILD FOR A STATE THE CODE CAN'T REACH (Jun 18). Started designing a scroll/fade button for "too many
  to-do items" — but the item cap meant that state was unreachable. Caught it by re-reading the cap before
  coding. Verify the problem is real and reachable before designing a fix for it.
- Sidebar clock/icon overlays can't be fully specified without seeing them rendered at sidebar scale. Build with placeholder coords and plan one live tuning pass.
- When a CSS override doesn't take, check the full DevTools cascade — a correct rule can be beaten by a higher-specificity global reset in another file (café Pomodoro buttons: fix was the index.css exclusion list, not Sidebar.css).
- READ AND TRACE, don't just read (Jun 17). Told Andrew the pin "raises z-index to 100 and keeps it on top." It didn't: every note always has a `layer`, so `layer != null ? layer : (isPinned ? 100 : 5)` always used `layer` and the pinned branch was dead. The line looked right; tracing the actual values showed it never ran. Fix: `isPinned ? 450 : (layer ?? 5)`.
- GET A LIVE TEST BEFORE CALLING SOMETHING "FINE" (Jun 17). Leaned "Move Backward is working as designed, just one step." A 10-second test showed Send to Back worked but Move Backward didn't — a real bug: the fixed +/-1.5 nudge can't cross a neighbor when layer numbers have gaps. Fix: swap with the neighbor in the sorted stack.
- LOGS BEAT THEORIES; A "FIXED" BEHAVIOR CAN STILL BE WRONG (Jun 25). Move Forward/Backward felt finicky across
  all themes. First guess (stale-closure on getAllItems) was WRONG — the callback's deps already covered it.
  Rather than guess twice, dropped a temp console.log of the sorted stack + which item the swap targeted. The
  logs proved it instantly: the front item swapped with a NON-overlapping sticker, so nothing moved on screen.
  Lesson: when a behavior is intermittent, print the actual data before theorizing, and don't trust a
  "fixed Jun X" note as proof — a fix can solve one cause (layer gaps) and leave another (non-overlapping
  neighbors). Real fix: cross only items the target actually overlaps (AABB).
- CLAUDE CODE OVERSTEPS WITHOUT EXPLICIT GUARDRAILS (Jun 17). It committed and pushed after being told "do not commit," started a dev server, tried to install Playwright, and created stray files (AGENTS.md, tasks/todo.md). The reliable fix: lead EVERY Claude Code prompt with the HARD RULES block (see Claude Code Prompt Rules). Andrew commits — Claude Code never does. Prompts that included the block behaved perfectly.

## Known Bugs — Queued
1. Live small-screen clamp — to-do clamp is spawn-time only; move to render-time so saved desks fit phones. Do before launch.
2. Launch maximized — PWA manifest to open maximized.
3. Resize warning popup — once-per-session popup when resizing below threshold.

## Known Issues
- Active theme persists across reload. ThemeContext.jsx reads/writes `cozydesk_active_theme`; falls back to 'cozykawaii' if missing/invalid.

## Roadmap / Cleanups (one at a time — backup + commit each; do NOT batch)
- Folder rename: src/themes/[theme]/stickynotes/ → todo/ (the folders only hold the to-do paper now). git mv per theme, update the glob path in themeRegistry.js, grep for stray "stickynotes" refs, sync this doc. Optional cleanup.
- ContextMenu.jsx font: 'Patrick Hand' → Nunito (one line, its own commit). See Font Rules.
- .claude/settings.local.json: gitignored as of Jun 18 (commit 6647a11).
- WebP / lighter images — BEFORE LAUNCH. One-time, hand-checked, per-asset conversion. NO blind batch convert (lossy WebP smears the gradient/transparency art); preserve alpha. The asset glob already accepts .webp.
- Debounce auto-save — AFTER LAUNCH / beta. Debounce ONLY the background auto-save; keep Save-slot and theme-switch saves immediate. Flush on visibilitychange/pagehide, NOT just beforeunload (unreliable on mobile).
- Lazy-load art — HOLD. A project, not a fix. Defer until ~10+ themes.
- Unused deps — framer-motion only (verify before removing). react-draggable IS used — do NOT remove it.

## On the Horizon
**Build new worlds first.** Worlds are the product and the main revenue lever; the entry/store stays parked until the shelf is fuller.
Café Morning: COMPLETE as of Jun 18. To-do paper exists, todoBase measured (358×353), text area + chalk-white
input color tuned, cap set to 5. Background, clock, calendar widget, sidebar clock icon, 4-track playlist all done.

Lofi sticker ideas (Jun 25): a fresh batch of new lofi stickers already landed in the art refresh (devices,
drinks, food, photos, posters, plants). Remaining top picks still wanted: vinyl record, mechanical keyboard,
lava lamp, scented candle, stacked books, hourglass, pencil cup. (Open list — not yet built.)

Sticker hover-glow (designed, not built): subtle glow on hover, DESKTOP-ONLY (no hover on touch). Agreed as
polish after the trim pass. Not built.

Welcome / entry flow (designed, not built): soft splash on every launch (tap-to-skip, doubles as load screen);
first-launch-only "pick your world" + mandatory Terms & Privacy gate + local-save warning + "artwork made with AI
tools" line, stored in localStorage cozydesk_terms_v1; returning users go straight to their last theme.

Store / theme discovery (after the welcome screen): turn the sidebar Themes dropdown into a small visual gallery
(thumbnail + name; locked worlds get a lock + $1.99). Surface the $10.99 all-access only at the BUY moment;
word it "all current and future worlds, one payment" — never "forever."

## Pre-Launch Checklist
1. Warn users desks save locally (clearing browser data erases them).
2. Graceful handling if localStorage corrupts.
3. Test Safari/Firefox/mobile/Windows — INCLUDING: does the right-click layer menu work on touch (long-press)?
   If not, layering is inaccessible on mobile and the tappable pin matters even more. Verify before launch.
4. Run /securityreview in Claude Code.
5. Beta test with 3-5 users.
6. Handle the 5MB localStorage limit.

## Legal / Pre-Launch Notes (NOT legal advice; finalize with a lawyer or Termly/iubenda)
- No law requires disclosing an app was BUILT with AI. Light touch only: a simple "Artwork created with AI tools"
  line as goodwill. Confirm you hold commercial rights to the AI-generated images (you sell themes).
- Documents to prepare: Terms of Service / EULA; Privacy Policy (even for local-only storage — covers email
  capture, Pixabay music, hosting); Refund Policy; Disclaimer of warranties + limitation of liability.
- App stores: a Tauri/native wrap adds Apple & Google requirements (privacy labels, in-app payment rules).

## Calendar Sharing (Pass 1 — DONE, shipped to dev)
One global calendar-events list, optionally shared across all themes. Calendar WIDGET placement stays per-theme; only EVENTS are shared.
- Keys: cozydesk_calendar_shared ('on'/'off'/unset) and cozydesk_shared_calendar_events (exists only when ON).
- ON: per-theme cozydesk_state_* keys store calendarEvents:{}; real events live in the shared blob. OFF: each theme stores its own.
- Engine (useDeskState.js): enableCalendarSharing() merges every theme's events into the shared blob + flag 'on'. disableCalendarSharing() copies shared events into EVERY theme, flag 'off', removes the blob.
- Opt-in popup ("One calendar everywhere?") shows only when the flag is unset AND the source theme has events (ThemeContext.jsx). Settings toggle in cozykawaii.jsx.
- DO NOT RE-BREAK: loadThemeState must load the shared calendar even when a theme has NO saved per-theme desk. Removing that branch reintroduces the bug where new themes show no events AND an empty auto-save wipes the shared blob.
- "Clear All" while sharing is ON (FIXED Jun 18): the confirm dialog shows an unchecked-by-default checkbox "Also erase shared calendar events (used in all themes)" — only when sharing is on. clearDesk now takes { clearCalendar = true }; unchecked preserves the shared blob, checked wipes it everywhere. Sharing OFF: no checkbox, clears as before. The warning line also switches to "Everything on this desk will be erased" when sharing is on, so it no longer contradicts the checkbox.
- Pass 2 (future): shared to-do lists.
