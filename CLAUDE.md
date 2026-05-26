# CozyDesk - Claude Instructions
# Last Updated: May 26, 2026

## Project Info
- App lives at: ~/Desktop/Desktop/Work/AppDesignJourney/cozydesk
- Dev server: `npm run dev` (localhost:5173)
- Hard refresh: Command+Shift+R
- Backups: `cp -r cozydesk cozydesk_backup_MMDD` in AppDesignJourney folder (NEVER inside the project folder)

## Tech Stack
- Vite, React, PWA
- Font: Nunito (all UI elements — see Font Rules below)
- Sidebar buttons use CSS variables: --btn-bg, --btn-text, --btn-font

## Deployment (Updated May 2026)
- Hosted: GitHub Pages (FREE — migrated from Netlify May 2026)
- Netlify: ABANDONED — out of credits, ignore it entirely
- Repo: github.com/a-grow/cozydesk
- CI/CD: GitHub Actions — auto-deploys on push to main
- Custom domain: cozydesk.app (GoDaddy, auto-renews Mar 30, 2027)
- main branch = cozydesk.app LANDING PAGE ONLY (not the full app)
- dev branch = full app, local only, NOT publicly deployed yet
- gh CLI: NOT installed. Use plain git only.
- To deploy landing page: git checkout main -> git merge dev -> git push origin main
- To work on app: git checkout dev -> npm run dev

## Daily Workflow
1. Test locally: npm run dev (localhost:5173)
2. Save: git add . && git commit -m "message" && git push origin dev
3. Go live: git checkout main -> git merge dev -> git push origin main

## Landing Page (cozydesk.app — May 2026)
- File: coming-soon/index.html (pure static HTML/CSS — NO React, no build step)
- Images: coming-soon/images/ (kawaii.png, lofi.png, steampunk.png, cozydesklogo.png)
- Font: Baloo 2 — NEVER use Fredoka One on the landing page
- Colors: #1e0f05 base, #FFD700/#FF8C00 gold, #FDF0DC cream
- Logo: static, centered, hover glow pulse only — NO floating animation
- DO NOT put cozydesk.app on resume yet — shows landing page only
- When editing landing page CSS: NEVER use global sed on color values
  (they appear in multiple places). Use grep -n first to find exact line,
  then targeted Python replacement or direct file edit.

## Pricing Model (Decided May 26, 2026)
- FREE forever: Cozy Kawaii + Lo-Fi Night themes
- Extra themes: $1.99 each (e.g. Steampunk)
- All Access Pass: $10.99 one-time — all current + future themes
- Theme updates are a bonus, not a guarantee. No schedule promised.

## How Claude Should Work
1. Read ALL relevant files before answering or making any changes
2. Think through the problem and write a plan to tasks/todo.md
3. Check in with Andrew and wait for approval before starting
4. Work through todo items, marking complete as you go
5. Give a high-level explanation of every change made
6. Keep every change as small and simple as possible
7. Add a review section to tasks/todo.md when done

## Efficiency Rule (Added May 2026)
- For simple single-file fixes: give Andrew the exact terminal command to paste
- For multi-file or complex changes: use Claude Code with full plan approval first
- Use this chat (claude.ai Project) for planning, analysis, diagnosis, small fixes
- Use Claude Code for bigger multi-file changes only
- When using Claude Code: always paste full CLAUDE.md at start of every session
- Claude Code and this chat share NO memory — treat them as completely separate

## Important Rules — NEVER VIOLATE
- Touch ONLY what is asked. Nothing else.
- No massive refactors unless explicitly asked
- Always ask before touching theme files unrelated to current task
- NEVER change fonts, colors, or sidebar behavior unless explicitly asked
- NEVER change things not related to the current task — even if you think it's better
- If it is not in the request, do not touch it

## Reduce Hallucinations
- Never speculate about code you have not opened
- If the user references a file, READ IT before answering
- Never make claims about code without investigating first
- Give grounded, hallucination-free answers only

## Adjust Eagerness
- Do NOT jump into implementation unless clearly instructed
- When intent is ambiguous, provide info and recommendations — not code
- Only proceed with edits when explicitly requested

## Parallel Tool Calls
- When reading multiple files with no dependencies, read all in parallel
- Maximize parallel tool calls for speed
- Never use placeholders or guess parameters

## Security Check (run after every feature)
Review all code just written for security best practices. No sensitive info in frontend. No exploitable vulnerabilities.

## Code Quality Standards
- Senior-level, clean, production-ready code
- Follow: YAGNI, DRY, SRP, KISS, SOLID
- Never over-engineer — keep solutions simple and robust
- Code must always be commit-ready
- Ask questions if anything is unclear — never assume

---

## Claude Code — Critical Warnings (Added May 26, 2026)

### ALWAYS verify with terminal — never trust Claude Code's self-report
- Claude Code sometimes reports "already done" or "changes applied" when the file was NOT changed
- After EVERY Claude Code session verify with terminal: grep -n "pattern" filepath
- NEVER trust VS Code to show the current file after Claude Code edits — it caches stale versions
- VS Code truth test: cat filepath in terminal shows the REAL file on disk
- If VS Code looks different from terminal output — terminal wins, always

### Verification workflow after every Claude Code change
1. Claude Code makes changes
2. Run: grep -n "key_pattern" src/path/to/file.jsx
3. Confirm the pattern is there on disk
4. THEN hard refresh browser and test
5. Never skip step 2-3

### cozydesk alias
- Type: cozydesk in any terminal to launch Claude Code in right folder
- If alias fails: cd ~/Desktop/Desktop/Work/AppDesignJourney/cozydesk && claude
- Alias lives in ~/.zshrc — if new terminal doesn't have it, run: source ~/.zshrc

### Embedded git repo warning
- Happens when backup folders accidentally get committed
- Fix: git rm --cached cozydesk && git commit -m "remove accidental embedded repo"
- Prevention: cozydesk_backup* is in .gitignore
- NEVER make backup folders inside the project folder

### Never patch without diagnosing first
- When a bug persists after 2 fix attempts: STOP and add console.log first
- Confirm the data actually exists before writing code to handle it
- Pattern that failed May 26: patched deleteEdit/saveEdit 4 times without confirming
  stickerCalendarLinks was populated — always log first, patch second

---

## Theme System

### Theme Conventions
- Themes: Cozy Kawaii, Lo-Fi Night, Steampunk (more planned)
- Each theme has full sidebar treatment
- Sticky notes: 180×180px, locked aspect ratio

### Theme Architecture Rules (CRITICAL)
- themeRegistry.js defines ALL per-theme visual values — ZERO hardcoded theme values in components
- Adding a new theme = one entry in themeRegistry.js + image assets. NOTHING ELSE.
- ALL productivity tools (calendar, clock, sticky notes, to-do, pomodoro, reminders)
  are fully shared components — IDENTICAL behavior across ALL themes
- Theme controls ONLY: background, color palette, decorative stickers, sidebar skin
- themeRegistry.js auto-discovers assets via Vite glob (stickers/notes/backgrounds)
- THEME_CONFIGS needs a manual entry for each new theme

### Theme Registry Keys (ALL themes must have these)
Each theme in THEME_CONFIGS must define:
- name, background, text, accent, fontFamily, previewBg, previewAccent
- themeColor — used for meta theme-color tag
- tabStyle — { backgroundColor, color, boxShadow, hoverGlow }
- sound — sound file name string (e.g. 'pastel-click')
- modalTheme — { bg, border, text, accent, headerBg, subtext, inputBg }
- brandFont — font for "CozyDesk Calendar" header
- defaultNoteFont — default font for new sticky notes
- stickyNoteTextArea — { top, left, right, bottom } percentages
- todoTextArea — { top, left, right, bottom } percentages
- showTape — boolean, show tape decoration on todo list
- todoInputColor — input text color (undefined = default)
- checkboxBorder — border style string
- clockComponent — React component reference
- calendarComponent — React component reference
- stickyNoteSize — number in px

### CSS Variable System
- --btn-bg, --btn-text, --btn-font defined per theme
- New themes only need these 3 variables for buttons to work automatically
- Use !important on button styles to prevent overrides
- Every new theme must define these 3 variables

---

## Font Rules — CRITICAL
- ONLY font allowed in all UI: Nunito
- Patrick Hand: ONLY allowed as user-selectable option inside sticky note/todo font pickers
- Patrick Hand NEVER in: sidebars, logos, headings, popups, modals, labels, any UI element
- Fredoka One: DEPRECATED — never use it anywhere ever
- Steampunk sidebar labels: Cinzel Decorative
- Lofi todo list chalk font: Caveat
- Landing page font: Baloo 2 ONLY
- These rules apply to ALL existing and future themes

---

## State Management — Single Source of Truth
- useDeskState.js manages ALL desk state
- Calendar events, sticky note dates, and reminders all share ONE events array
- No component manages its own event state independently
- Save slot data shape (DO NOT BREAK):
  - Each slot: notes, stickers, papers, clocks, calendars, calendarEvents,
    reminders, remindersLayer, themeMode, remindersVisible, remindersPos
  - noteId format: Date.now() timestamp — NEVER regenerate on load
  - calendarEvents: { "YYYY-MM-DD": [{ text, category, noteId, ... }] }
  - Storage keys: cozydesk_state_{theme} and cozydesk_saved_{theme}_slot_{n}

---

## Calendar ↔ Sticky Note Sync Rules (CRITICAL)
- Sticky notes link to calendar via noteId
- noteId must be preserved through ALL edit/move/drag operations
- Full line text goes to calendar (not just the date)
- Each date on a sticky note gets its own calendar event
- Dedup: never add same date+text combo twice

### Bidirectional Sync Expected Behavior
- Sticky note date added → prompt user to add to calendar
- Sticky note date deleted → delete from calendar
- Calendar event edited → auto-update linked sticky note + update stickerCalendarLink.eventText
- Calendar event deleted → prompt "Delete from sticky note too?" with Remember checkbox
- These MUST work in ALL combinations. Build and test FULLY before adding new themes.

### Calendar Sync — What Works (May 26, 2026)
- Add sticky note with date → calendar popup → Yes → event appears on calendar ✅
- Edit calendar event → sticky note auto-updates ✅
- stickerCalendarLinks.eventText updates on edit ✅
- Calendar limited to 1 per desk (enforced via stateRef.current.calendars.length) ✅

### Calendar Sync — Known Broken (May 26, 2026)
- Delete calendar event → popup does NOT appear → sticky note text stays ❌
- Root cause: NOT YET DIAGNOSED — needs console.log on stickerCalendarLinks at delete time
- DO NOT patch deleteEdit again without first confirming stickerCalendarLinks is populated
- Diagnostic to run next session:
  Add this to deleteEdit in LargeCalendarModal.jsx:
  console.log('deleteEdit fired', { stickerCalendarLinks, originalText, originalDateKey });
  Then test and check browser console to see what's actually there

### Calendar Sync — Eager Popup Bug
- Calendar add popup fires while user is still typing on sticky note ❌
- Should ONLY fire on blur (clicking away from note), never during active typing
- isMountedRef guard exists but may need revisiting

### Other Known Calendar Bugs
1. Orphan events — deleting a sticky note does NOT delete its calendar events
2. Reverse sync is fragile — pendingNoteSync ref only works if onRemoveEvent
   fires immediately before onAddEvent

### Refresh Popup Bug (partially fixed — watch for regression)
- onDateDetected must only fire on real user blur, never on mount
- isMountedRef guard added — do not remove it

---

## Sticky Note Rules
- Default size: 180×180px ALL colors ALL existing and future themes
- Yellow kawaii note has separate size override — do not remove it
- Color picker shows ONLY 4 swatches: blue, green, pink, yellow
- No sticker assets in color picker ever

---

## Sidebar Rules — CRITICAL
- NEVER change sidebar fonts, icons, or colors unless explicitly asked
- NEVER touch animated gears in steampunk (speed, size, color, animation)
- NEVER touch lofi sidebar icon images
- Sidebar buttons: My Desks, Save, Settings, Undo, Redo all use --btn-bg/text/font

---

## zIndex Hierarchy (CRITICAL — do not break)
- Sidebar: 500
- Sidebar tab button: 100
- Stickers/notes/clocks/calendars: variable, up to ~9000
- Context menu backdrop: 9999
- Multi-select badge: 9998
- All modals and popups: 10100 (MUST be above everything)
- If a new popup appears behind stickers, its zIndex needs to be 10100

---

## File Structure
- src/themes/cozykawaii/ — kawaii theme files
- src/themes/lofi/ — lofi theme files
- src/themes/steampunk/ — steampunk theme files
- src/assets/backgrounds/ — all background images
- src/assets/stickynotes/ — legacy fallback (do not delete)
- src/components/StickyNote.jsx — DO NOT touch unless fixing sticky note bugs
- src/components/Reminders.jsx — DO NOT touch unless fixing todo bugs
- src/components/ReminderPaper.jsx — DO NOT touch unless fixing todo bugs
- src/components/LargeCalendarModal.jsx — calendar modal, handles bidirectional sync
- src/hooks/useDeskState.js — ALL desk state lives here
- src/themes/themeRegistry.js — ALL per-theme config lives here
- src/themes/ThemeContext.jsx — theme provider, reads from registry

---

## Features Already Built — DO NOT REBUILD
- Clock flip (↔ button) — on same row as size buttons
- XS/S/M/L/XL size buttons on clock and calendar
- Attach to Back Layer / Detach system
- Save/My Desks system with 10 slots per theme
- Lofi sidebar icons using actual lofi sticker images
- Steampunk animated brass gears in sidebar
- Steampunk mahogany wood grain sidebar background
- Theme-color meta tag updates dynamically per theme
- Aspect ratio locking on all sticky notes and todo lists
- CSS variables --btn-bg, --btn-text, --btn-font for all sidebar buttons
- Calendar limited to 1 per desk
- All popup modals appear above stickers (zIndex: 10100)
- Theme registry fully centralized — zero hardcoded theme values in components

---

## Known Bugs — Queued for Fixing
1. Calendar delete → no reverse sync popup (DIAGNOSE FIRST with console.log — see above)
2. Calendar add popup fires too early while typing on sticky note
3. Sticky note default size too wide — check addNoteAtPosition in useDeskState.js
4. Steampunk sticky note sizes inconsistent — blue image 705x634px vs others 1024x1024px
   (asset re-export needed, not a code fix)
5. Steampunk sticky note text positioning wrong — per-theme offsets exist in themeRegistry
   but may need tuning

---

## Completed Fixes Log
- Font violations fixed (April 17, 2026): Nunito everywhere, Patrick Hand removed from UI
- Plan 2 complete (April 18, 2026): themeRegistry clockComponent/calendarComponent/themeColor
- Theme registry refactor complete (May 26, 2026): ALL hardcoded theme values moved to registry
- Popup zIndex fixed (May 26, 2026): all modals now zIndex 10100
- Calendar limit fixed (May 26, 2026): uses stateRef.current to prevent stale closure bug
- Color picker bugs: COMPLETED AND FIXED

---

## Image Rules
- Always compress images before committing: sips -Z 1920 image.png --out image.png
- Target under 2MB per image
- Check sizes with ls -lh before pushing
- Large images cause GitHub push to fail with Internal Server Error

## Git Rules
- dev = active development. Always push here first.
- main = production (landing page). Only merge when ready.
- Never commit node_modules, .env files, or images over 2MB
- Backup naming: cozydesk_backup_MMDD in AppDesignJourney folder (NEVER inside project)
- After every commit: check for embedded repo warning and fix immediately with:
  git rm --cached cozydesk && git commit -m "remove accidental embedded repo"