# CozyDesk — Claude Instructions
# Last Updated: May 27, 2026

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
Vite glob auto-discovers: stickers/, productivitystickers/
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

## Calendar ↔ Sticky Note Sync

### How It Works
- Sticky notes link to calendar via stickerCalendarLinks array
- Each link: { linkId, stickerId, stickerType, eventText, dateKey }
- eventText in the link MUST stay in sync when events are edited

### What Works (May 26, 2026)
- Add date to sticky note → popup → yes → event on calendar ✅
- Edit calendar event → auto-updates linked sticky note ✅
- Calendar limited to 1 per desk (stateRef.current.calendars.length) ✅
- All popups appear above stickers (zIndex: 10100) ✅
- Double-click calendar widget → large modal opens (all themes) ✅

### Known Broken
- Delete calendar event → popup does NOT appear → sticky note unchanged ❌
  Diagnostic: add console.log('deleteEdit', {stickerCalendarLinks, originalText, originalDateKey})
  DO NOT patch again without confirming data is populated first

- Small calendar widget doesn't show events added via large modal ❌
  Needs investigation of events prop flow from LargeCalendarModal back to widget

- Calendar popup fires while still typing on sticky note ❌
  Should only fire on blur, not during active typing

### Dedup Rule
Same dateKey + same eventText = skip. Never add duplicates.

---

## Sticky Note Rules
- Default size: 180×180px, locked aspect ratio, ALL themes
- Yellow kawaii note has separate size override — do not remove
- Color picker: exactly 4 swatches (blue, green, pink, yellow) — no sticker assets

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

---

## How Claude Should Work
1. Read ALL relevant files before answering or changing anything
2. Write a plan, check in, wait for approval
3. Make the smallest possible change
4. Verify on disk after every change
5. Test in browser before moving to next change
6. Never touch files not related to the current task
7. When intent is ambiguous — ask, don't assume

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
- Hosted: GitHub Pages (free)
- Repo: github.com/a-grow/cozydesk
- Custom domain: cozydesk.app (GoDaddy, renews Mar 30, 2027)

## Completed Fixes Log
- Font violations fixed (April 17, 2026)
- Theme registry refactor complete (May 26, 2026)
- Popup zIndex fixed (May 26, 2026) — all modals zIndex 10100
- Calendar limit fixed (May 26, 2026) — stateRef.current.calendars.length
- Calendar widget double-click → large modal (May 26, 2026)
- noPopup support added to MiniCalendar + LofiMiniCalendar (May 26, 2026)