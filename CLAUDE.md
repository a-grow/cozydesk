# CozyDesk — Claude Instructions
# Last Updated: May 28, 2026

## What is CozyDesk?
A React/Vite PWA productivity app with themed desktops (sticky notes, calendars,
clocks, todo lists, stickers). Multiple visual themes share identical functionality.
Built by Andrew, deployed to cozydesk.app. Currently in active development.

---

# ⚠️ TIER 1 — CRITICAL SAFETY RULES
# Read these first. These prevent catastrophic mistakes.

1. VERIFY ON DISK after every Claude Code change:
   grep -n "pattern" src/path/to/file.jsx
   Never trust Claude Code's self-report. Never trust VS Code display.
   Terminal output is the only truth.

2. NEVER run git reset --hard without first running:
   git show <sha> — to see what that commit contains
   git log --all — to see all commits including floating ones
   git reset --hard is permanent. Check before you run it.

3. NEVER reconstruct files from memory.
   Always read from disk first: cat src/path/to/file.jsx
   Memory reconstructions introduce new bugs every time.

4. NEVER give terminal commands without full absolute paths.
   Wrong: cp -r cozydesk cozydesk_backup
   Right: cp -r ~/Desktop/.../cozydesk ~/Desktop/.../cozydesk_backup_MMDD
   Backups ALWAYS go outside the project folder.

5. When a bug is patched twice and still broken — STOP.
   Add console.log first. Diagnose before patching a third time.
   Assumptions without logging cost hours.

6. When the user hesitates or asks "are you sure" — STOP.
   Their instincts are signal, not obstacle. Ask what they see.

7. Before any rm -rf — move to trash instead.
   rm -rf is permanent and silent. Never use it casually.

8. Claude Code and this chat share NO memory.
   Always paste full CLAUDE.md at the start of every Claude Code session.
   Claude Code reads CLAUDE.md from disk automatically — keep it updated.

---

# TIER 2 — PROJECT RULES
# Read at the start of every session.

## Project Info
- App: ~/Desktop/Desktop/Work/AppDesignJourney/cozydesk
- Dev server: npm run dev (localhost:5173 or 5174)
- Hard refresh: Command+Shift+R
- Terminal shortcut: type `cozydesk` to launch Claude Code in correct folder

## Branches
- dev = active development. Always push here first.
- main = production landing page only. Never push app code here.
- Deploy landing page: git checkout main → git merge dev → git push origin main

## Daily Workflow
1. npm run dev (localhost:5173)
2. git add . && git commit -m "message" && git push origin dev
3. After every commit: check for embedded repo warning, fix with:
   git rm --cached cozydesk && git commit -m "remove accidental embedded repo"

## Tech Stack
- Vite, React, PWA
- All UI fonts: Nunito only
- Sidebar buttons: CSS variables --btn-bg, --btn-text, --btn-font

---

## Theme System — How It Works

### The One Rule
themeRegistry.js is the ONLY place for per-theme values.
Zero hardcoded theme checks anywhere else.
Adding a new theme = one entry in THEME_CONFIGS + image assets. Nothing else.

### Every Theme Entry Must Have These Keys
name, background, text, accent, fontFamily, previewBg, previewAccent,
themeColor, tabStyle, sound, modalTheme, brandFont, defaultNoteFont,
stickyNoteTextArea, todoTextArea, showTape, todoInputColor, checkboxBorder,
clockComponent, calendarComponent, stickyNoteSize

### Asset Discovery
Vite glob auto-discovers: stickers/, stickynotes/
Note: productivitystickers/ is RETIRED — do not use this folder name ever again
Background images live in: src/assets/backgrounds/

### Current Themes
- Cozy Kawaii (free)
- Lo-Fi Night (free)
- Steampunk ($1.99)

### Pricing
- Free: Cozy Kawaii + Lo-Fi Night
- Extra themes: $1.99 each
- All Access Pass: $10.99 one-time

---

## Font Rules — CRITICAL
- ALL UI elements: Nunito only
- Patrick Hand: ONLY inside sticky note/todo font picker dropdowns
- Fredoka One: DEPRECATED — never use
- Steampunk sidebar labels: Cinzel Decorative
- Lo-Fi todo list: Caveat
- Landing page: Baloo 2 only

---

## Sticky Note Rules
- Default size: 180×180px, locked aspect ratio, ALL themes
- Yellow kawaii note has separate size override — do not remove
- Color picker: exactly 4 swatches (blue, green, pink, yellow) — no sticker assets
- Sticky note → calendar sync is PERMANENTLY REMOVED as of May 28, 2026
- Sticky notes are standalone notepads only — no date detection, no calendar popup, no reverse sync
- Never restore this feature without explicit instruction

---

## zIndex Hierarchy
- Sidebar: 500
- Sidebar tab button: 100
- Stickers/items: variable
- Context menu backdrop: 9999 (correct — leave it)
- ALL modals and popups: 10100 (must be above everything)

---

## File Structure
src/
  themes/
    themeRegistry.js        ← ALL theme config lives here
    ThemeContext.jsx         ← reads from registry
    cozykawaii.jsx           ← main desk renderer for ALL themes
    cozykawaii/             ← kawaii assets
    lofi/                   ← lofi assets
    steampunk/              ← steampunk assets
  Each theme folder must contain: stickynotes/, stickers/, widgets/, wallart/, props/
  Sticky note assets → stickynotes/ (glob reads here only)
  Calendar widget images → widgets/ (NOT stickynotes/)
  Any file in stickynotes/ gets picked up as a color swatch — keep it clean
  Filenames must contain "blue", "green", "pink", or "yellow" for color swatches to appear
  loficalendarbase.png lives in lofi/widgets/ — imported directly in LofiSidebar.jsx and LofiMiniCalendar.jsx
  components/
    StickyNote.jsx          ← do not touch unless fixing sticky note bugs
    ReminderPaper.jsx       ← do not touch unless fixing todo bugs
    Reminders.jsx           ← do not touch unless fixing todo bugs
    CalendarSticker.jsx     ← kawaii + steampunk calendar widget
    LofiCalendarSticker.jsx ← lofi calendar widget (different aspect ratio)
    LargeCalendarModal.jsx  ← full calendar modal, all themes
    sidebar/
      MiniCalendar.jsx      ← kawaii mini calendar (has noPopup support)
      LofiMiniCalendar.jsx  ← lofi mini calendar (has noPopup support)
  hooks/
    useDeskState.js         ← ALL desk state lives here
  assets/
    backgrounds/            ← all background images
    sounds/                 ← all click sounds
    icons/                  ← calendar base image

---

## Sidebar Rules — NEVER TOUCH UNLESS ASKED
- Never change sidebar fonts, icons, colors
- Never touch steampunk animated gears
- Never touch lofi sidebar icon images

---

## Features Already Built — DO NOT REBUILD
- Clock flip button
- XS/S/M/L/XL size buttons on clock and calendar
- Attach/Detach sticker system
- Save/My Desks — 10 slots per theme
- Undo/Redo
- Multi-select with Shift+click
- Snap to grid
- Theme-color meta tag
- Aspect ratio locking on sticky notes and todo lists
- Event dots on mini calendar widget (MiniCalendar.jsx and LofiMiniCalendar.jsx) — uses {ev.icon || '●'}
- Sticky note assets loading from stickynotes/ folder for all themes

---

## How Claude Should Work
1. Read ALL relevant files before answering or changing anything
2. Write a plan, check in, wait for approval
3. Make the smallest possible change
4. Verify on disk after every change
5. Test in browser before moving to next change
6. Never touch files not related to the current task
7. When intent is ambiguous — ask, don't assume
8. Before writing any Claude Code prompt, reason through the FULL chain of consequences. Read the files, think every layer, be certain — then act. Predictable side effects caught after testing are a failure of preparation, not bad luck.

---

# TIER 3 — REFERENCE
# Look up as needed. No need to memorize.

## Save Slot Data Shape (do not break)
- Keys: notes, stickers, papers, clocks, calendars, calendarEvents,
  reminders, remindersLayer, themeMode, remindersVisible, remindersPos
- noteId format: Date.now() timestamp — never regenerate on load
- calendarEvents: { "YYYY-MM-DD": [{ text, category, noteId }] }
- Storage: cozydesk_state_{theme} and cozydesk_saved_{theme}_slot_{n}

## Image Rules
- Compress before committing: sips -Z 1920 image.png --out image.png
- Max 2MB per image
- Large images cause GitHub push failures

## Landing Page (cozydesk.app)
- File: coming-soon/index.html (static HTML/CSS — no React)
- Font: Baloo 2 only
- Colors: #1e0f05 base, #FFD700/#FF8C00 gold, #FDF0DC cream
- DO NOT put on resume yet

## Deployment
- Hosted: GitHub Pages (free, no limits)
- Repo: github.com/a-grow/cozydesk
- Custom domain: cozydesk.app (GoDaddy, renews Mar 30, 2027)
- dev branch = active development, push here daily
- main branch = landing page only, never push app code here
- cozydesk.netlify.app = frozen old build, ignore it, do not use it
- Tauri desktop app: src-tauri folder exists but CLI not installed — future dedicated task
- Plan: cozydesk.app = landing page with download button, Tauri app = actual shipped product
- localhost:5173 is the test environment for all development

## Completed Fixes Log
- Font violations fixed (April 17, 2026)
- Theme registry refactor complete (May 26, 2026)
- Popup zIndex fixed (May 26, 2026) — all modals zIndex 10100
- Calendar limit fixed (May 26, 2026) — stateRef.current.calendars.length
- Calendar widget double-click → large modal (May 26, 2026)
- noPopup support added to MiniCalendar + LofiMiniCalendar (May 26, 2026)
- May 28, 2026:
  - Calendar event dots fixed — ev.icon was always undefined for modal-created events. Fixed with {ev.icon || '●'} in MiniCalendar.jsx and LofiMiniCalendar.jsx
  - Sticky note assets fixed — glob was pointing at productivitystickers/ (empty). Updated to stickynotes/
  - Steampunk sticky note images recovered from dist/assets/ and placed in src/themes/steampunk/stickynotes/
  - loficalendarbase.png moved from lofi/stickynotes/ to lofi/widgets/ — imports updated in LofiSidebar.jsx and LofiMiniCalendar.jsx
  - Sticky note → calendar sync REMOVED permanently — detectAllDates, MONTH_MAP, isMountedRef, handleDateDetected, stickyCalendarPopup, noCalendarPopup all deleted from StickyNote.jsx and cozykawaii.jsx
  - Empty productivitystickers/ folders deleted from cozykawaii and steampunk theme folders
  - Clock flip button restored across all 3 themes (lost in May 28 cleanup)
  - Clock flip alignment fixed — scaleX(-1) on outer wrapper div, counter-flip on text overlays and controls row, delete button swaps right/left instead of using transform

## Still To Do / Known Bugs
- Fix Patrick Hand showing as default font in steampunk and lofi sticky note pickers
- Set up Tauri desktop app as dedicated session
- Refactor MiniCalendar.jsx and LofiMiniCalendar.jsx into one shared component when adding next theme
- Clock flip: fully restored and working across all 3 themes ✅

## CSS Transform Rules — Clock Flip Pattern
When applying scaleX(-1) to an outer wrapper div, ALL children are affected:
- Absolutely positioned children: right/left values are visually swapped — fix by swapping right/left values when flipped, NOT by adding transform
- Text overlays: must have their own counter-flip scaleX(-1) to read correctly
- Controls row: translateX(-50%) must become translateX(-50%) scaleX(-1) when flipped
- Steampunk-style digit spans: wrap in counter-flip div with explicit left/right/top/bottom: 0
- Future clock components must follow this same pattern — it is universal