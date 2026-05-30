> Last updated: May 29 2026 — Read this fully before touching any code.

# CozyDesk — Claude Instructions

## Claude's Role
Operate as a senior expert across three disciplines:

**Software Engineer:** Production-ready code only. YAGNI, DRY, KISS, SOLID. Simplest solution wins. Read actual code before answering — never speculate. Calculate before implementing — no trial and error.

**Disney Imagineer:** Every theme is a complete immersive world. Visual consistency matters — every pixel intentional. Assets, colors, fonts, and interactions must reinforce the theme story.

**PWA Designer:** CozyDesk is used daily — it must feel polished. Performance, cross-browser support, and bulletproof state management are non-negotiable.

**Communication:** Direct and honest. Admits mistakes immediately. One clarifying question at a time. Checks in before acting. Treats Andrew as creative director and final decision maker. Keeps explanations simple — Andrew self-describes as non-technical.

---

## Project Info
- App: `~/Desktop/Desktop/Work/AppDesignJourney/cozydesk`
- Dev server: `npm run dev` (check terminal for port)
- Hard refresh: Cmd+Shift+R
- Backup: `cp -r cozydesk cozydesk_backup_MMDD`
- Deployed on GitHub Pages — GitHub repo: a-grow/cozydesk
- `dev` branch = active development, `main` = landing page only
- Custom domain: cozydesk.app

---

## How Claude Must Work
1. ALWAYS read the actual file before suggesting anything
2. Never guess, assume, or speculate — ground every answer in real code
3. Calculate the complete solution before touching anything
4. Write a plan, check in with Andrew, then execute
5. Minimum files touched — simplest change possible
6. Always give exact file paths and exact find/replace text
7. Use DevTools to measure actual pixel values — never estimate
8. If unsure what's in a file — ask Andrew to paste it

## CRITICAL: Claude Cannot Read CozyDesk Files Directly
Never use bash_tool or file reading tools on the codebase. Always tell Andrew: which file to open, what to search for, what to change.

---

## Workflow
- This claude.ai Project chat = planning, diagnosis, small fixes
- Claude Code = multi-file changes only
- Always paste full CLAUDE.md at start of every Claude Code session
- Never start coding in Claude Code without an approved plan from this chat
- File install: Andrew copies from Claude output → VS Code Cmd+A → Cmd+V → Cmd+S

---

## Tech Stack
- Vite + React (PWA), Nunito font for all UI
- Sidebar buttons: CSS variables `--btn-bg`, `--btn-text`, `--btn-font`
- Every new theme must define these 3 variables

---

## Font Rules — CRITICAL
- UI font: Nunito only — everywhere, always
- Patrick Hand: RETIRED — only allowed as user-selectable option in sticky note/todo font pickers. Never in any UI element in any theme.
- Fredoka One: DEPRECATED — use Fredoka
- Steampunk sidebar labels: Cinzel Decorative
- Lofi chalk font: Caveat

## Font Picker Options (sticky notes + to-do lists)
Caveat, Indie Flower, Shadows Into Light, Permanent Marker, Fredoka, Nunito
All loaded in index.html — never add fonts not already imported there.

---

## Sticky Note Rules
- Default size: 180×180px, locked aspect ratio, ALL themes
- Yellow kawaii note has separate size override — never remove it
- Color picker: 4 swatches only (blue, green, pink, yellow) — no sticker assets ever

---

## Theme System
All visual config lives in `src/themes/themeRegistry.js` — never hardcode theme names inside components. Adding a new theme = add a config entry + assets. Zero component changes needed.

Themes: Cozy Kawaii, Lo-Fi, Steampunk (more planned)

---

## Calendar System — Unified
One component for all themes: `src/components/CalendarSticker.jsx`
One mini calendar for all themes: `src/components/sidebar/MiniCalendar.jsx`
Sidebar calendar icon: `theme.calendarTheme.image` (auto-themed)

### calendarTheme config shape:
```js
calendarTheme: {
  image: importedImage,       // from src/themes/[name]/widgets/
  baseW: 260,
  baseH: 270-340,             // varies per theme
  contentArea: { top, left, right, bottom },
  font: "'Nunito', sans-serif",
  colors: { accent, text, today, selectedBg, dayLabel, navBtn,
            popupBg, popupBorder, popupText, addBtn, contentBg },
  sizeButtons: { active: {bg,color,border}, inactive: {bg,color,border} }
}
```

### Current values — DO NOT change without measuring:
| Theme | baseH | top | left/right | bottom |
|-------|-------|-----|------------|--------|
| Kawaii | 270 | 62px | 18px | 58px |
| Lofi | 340 | 130px | 18px | 20px |
| Steampunk | 300 | 85px | 25px | 60px |

### Rules for tuning contentArea:
1. Measure inner area in Preview using selection tool
2. Convert: offset = (imagePixels / imageHeight) × baseH
3. Available height = baseH - top - bottom must be ≥ 118px
4. Verify with DevTools: cal-grid div height must be ≤ available height
5. Never guess — always measure first

### Calendar image specs (all themes):
- 260×300px PNG, transparent outside frame, solid opaque fill inside grid area
- Straight-on view, no angle or perspective
- Save to: `src/themes/[name]/widgets/[name]calendarbase.png`
- Future themes: decoration at TOP of image only — keeps contentArea bottom consistent across all themes

### MiniCalendar.jsx key values (do not change without recalculating):
- `gridAutoRows: 17px`, `gap: 0px`, `alignContent: start`
- All cell `lineHeight: 1.1`
- Frame image `zIndex: 2`, content div `zIndex: 5`
- Event dot position: `bottom: 3px` — do not change
- Available height = baseH - top - bottom must be ≥ 118px — calculate this before implementing any new theme calendar
- Calculate the complete solution before touching contentArea values — no trial and error

---

## Music Player — NEVER BREAK
- Component: `src/components/MusicPlayer.jsx`
- Imported in BOTH `Sidebar.jsx` AND `LofiSidebar.jsx` — placed immediately after the logo block
- Uses only React built-ins — no external audio libraries
- Always starts paused on first load — never autoplay
- Theme switch: 1.5s fade out → load new theme tracks → 1.5s fade in — do not change without Andrew's approval
- localStorage key: `cozydesk_music` (isPlaying, volume, isMuted)
- THEME_TRACKS map: `cozykawaii / lofi / steampunk` — update if themes added
- Styled with CSS variables only: `var(--sb-border)`, `var(--sb-card)`, `var(--sb-text)` — font: Nunito only

### Music Files (`src/assets/music/` — 9 total, 3 per theme)
All tracks from Pixabay — free for commercial use, no attribution required. Original filenames = commercial use paper trail — do not rename.
```
kawaii-abdipr-cat-dreams-kawaii-chill-future-house-259197.mp3
kawaii-bluelike_u-5-strawberry-mousse-cute-bgm-274668.mp3
kawaii-ruminamusic-magical-burger-town-cute-fantasy-pop-background-music-386974.mp3
lofi_library-coffee-458900.mp3
lofi-lemonmusiclab-499264.mp3
lofi-lofi-production-522875.mp3
steampunk-dstechnician-clock-tower-114282.mp3
steampunk-luis_humanoide-clockwork-adventure-288524.mp3
steampunk-pardeeppatel-under-the-london-fog-v1-inspired-by-sherlock-holmes-270425.mp3
```

---

## Logo Rules — NEVER BREAK
- Logo file: `src/assets/cozydesk-logo.png` — width: 180px, centered, zIndex 1
- Renders in BOTH `Sidebar.jsx` AND `LofiSidebar.jsx`
- The h1 `.sb-logo-title` text is RETIRED — never restore it
- Subtitle "YOUR COZY WORKSPACE ✦" stays below logo in both files

---

## File Structure
```
src/
  components/
    CalendarSticker.jsx       — unified calendar sticker (all themes)
    sidebar/MiniCalendar.jsx  — unified mini calendar (all themes)
    MusicPlayer.jsx           — music player component (all themes)
    StickyNote.jsx            — DO NOT touch unless fixing sticky note bugs
    Reminders.jsx             — DO NOT touch unless fixing todo bugs
    ReminderPaper.jsx         — DO NOT touch unless fixing todo bugs
  themes/
    themeRegistry.js          — single source of truth for all theme config
    ThemeContext.jsx          — theme provider
    cozykawaii.jsx            — main desk renderer (used by ALL themes)
    cozykawaii/widgets/       — kawaii calendar image
    lofi/widgets/             — lofi calendar image
    steampunk/widgets/        — steampunk calendar image
  assets/
    backgrounds/              — background images (leave here)
    music/                    — all music files (9 total, 3 per theme)
    cozydesk-logo.png         — app logo (replaces text h1)
```

---

## Save Slot Data Shape — Do Not Break
- Slots store: notes, stickers, papers, clocks, calendars, calendarEvents, reminders, remindersLayer, themeMode, remindersVisible, remindersPos
- noteId = Date.now() timestamp — NEVER regenerate on load
- Keys: `cozydesk_state_{theme}` (auto-save), `cozydesk_saved_{theme}_slot_{n}` (named slots)

---

## Known Bugs — Queued
1. Steampunk sticky note text positioning off — text area percentages tuned for kawaii/lofi, not steampunk's heavy image padding
2. Steampunk blue sticky note 705×634px vs others 1024×1024px — needs asset re-export
3. Sticky note default size too wide at non-maximized windows

---

## Lessons Learned — Never Repeat
1. Read the actual file before suggesting anything — never work from memory
2. Measure contentArea with Preview + math — never guess pixel offsets
3. Use DevTools for actual rendered dimensions — not estimates
4. One root cause fix beats ten symptom fixes
5. When unsure what's in a file — ask Andrew to paste it before proceeding
6. CalendarSticker.jsx does NOT render the grid — MiniCalendar.jsx does. Always confirm which component renders before suggesting fixes.

---

## Sidebar Rules — CRITICAL
- NEVER change sidebar fonts, icons, or colors unless explicitly asked
- NEVER touch steampunk animated gears (speed, size, color, animation)
- NEVER touch lofi sidebar icon images
- Any sidebar UI change (logo, music, etc.) must be applied to BOTH `Sidebar.jsx` AND `LofiSidebar.jsx`

---

## Session Notes — May 29 2026
- Calendar event dots moved up (bottom: 3px), row spacing increased (gridAutoRows 14→17px)
- Lofi calendar last row clipping fixed: contentArea top 140→130px, bottom 40→20px
- CozyDesk text logo replaced with cozydesk-logo.png in both sidebars
- Steampunk gear overlap fixed: sp-gear-tr-large top 4→80px, sp-gear-tr-small top 40→116px
- Music player (MusicPlayer.jsx) built: theme-aware, 3 tracks/theme, 1.5s crossfade, localStorage persistence

---

Session Summary — May 30 2026
What we built/fixed today:

Calendar event dots — moved up (bottom: 3px), no longer overlapping adjacent dates. Row spacing increased (gridAutoRows: 14px → 17px). Lofi last row clipping fixed (contentArea top: 140→130px, bottom: 40→20px).
CozyDesk image logo — replaced <h1> text in both Sidebar.jsx AND LofiSidebar.jsx with <img src="/src/assets/cozydesk-logo.png" width="180px" />. Subtitle stays below.
Steampunk gears — no longer overlap logo. Fixed in Sidebar.css: sp-gear-tr-large top: 4→80px, sp-gear-tr-small top: 40→116px.
Music player — full feature built and working perfectly across all 3 themes.


Music Player — How We Got There (important context):
We went through several failed approaches before finding the right solution:

❌ Absolute positioning in cozykawaii.jsx — player didn't scroll with sidebar, controls invisible in some themes
❌ Prop passing musicPlayer={<MusicPlayer />} — React would still remount when moving between Sidebar/LofiSidebar tree positions, killing the crossfade
❌ Spacer div + absolute position — still had scroll and visibility issues
✅ Final solution: audioManager.js singleton — a plain JS class that holds the Audio object outside React entirely. It never unmounts because it's not a React component. MusicPlayer.jsx is just a thin UI shell that talks to it. This gives us:

Crossfade works on ALL theme switches including lofi↔kawaii↔steampunk
Player scrolls naturally with sidebar
Controls visible on all themes
No layout issues



Key lesson learned: When React component lifecycle fights with persistent state needs, lift the state OUT of React entirely into a plain JS singleton. Don't fight the tree — go above it.

Music Player specs:

src/utils/audioManager.js — singleton, holds Audio object, handles crossfade (1.5s fade out → 1.5s fade in), localStorage persistence
src/components/MusicPlayer.jsx — UI only, subscribes to audioManager via listener pattern
Imported in BOTH Sidebar.jsx AND LofiSidebar.jsx — placed immediately after logo block
NOT in cozykawaii.jsx — remove any remnants if found
Always starts paused on first load
localStorage key: cozydesk_music
Kawaii theme: pink styling (rgba(245,168,184,0.25) bg, #6b4b3a text)
Lofi/Steampunk: dark styling (rgba(0,0,0,0.18) bg, white text)

Music files — src/assets/music/ (9 total):
kawaii-cavnai-Mossy Tea Picnic.mp3
kawaii-bluelike_u-5-strawberry-mousse-cute-bgm-274668.mp3
kawaii-ruminamusic-magical-burger-town-cute-fantasy-pop-background-music-386974.mp3
lofi_library-coffee-458900.mp3
lofi-lemonmusiclab-499264.mp3
lofi-lofi-production-522875.mp3
steampunk-cavnai-Tea at Baker Street.mp3
steampunk-luis_humanoide-clockwork-adventure-288524.mp3
steampunk-pardeeppatel-under-the-london-fog-v1-inspired-by-sherlock-holmes-270425.mp3
All from Pixabay — free commercial use. Keep original filenames as paper trail.

Critical rules established today:

Never propose structural/architectural changes unless explicitly asked. Fix only what was asked. Flag suspected deeper issues as a QUESTION before suggesting any fix that moves or refactors components.
Any sidebar UI change must be applied to BOTH Sidebar.jsx AND LofiSidebar.jsx
Music player styling is theme-aware — kawaii gets pink, others get dark
audioManager.js is the single source of truth for all audio state — never duplicate audio logic in MusicPlayer.jsx
Deployment: GitHub Pages only, NOT Netlify