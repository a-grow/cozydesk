/* To add a new theme, define --btn-bg, --btn-text, --btn-font in Sidebar.css */
import React, { useState, useEffect, useCallback, useRef } from "react";
import Sticker from "../components/Sticker";
import StickyNote from "../components/StickyNote";
import ReminderPaper from "../components/ReminderPaper";
import ClockSticker from "../components/ClockSticker";
import LofiClockSticker from "../components/LofiClockSticker";
import SteampunkClockSticker from "../components/SteampunkClockSticker";
import DigitalClockSticker from "../components/DigitalClockSticker";
import Sidebar from "../components/Sidebar";
import Reminders from "../components/Reminders";
import CalendarSticker from "../components/CalendarSticker";
import ContextMenu from "../components/ContextMenu";
import Mugzy from "../components/Mugzy";
import FocusOverlay from "../components/FocusOverlay";
import { onFocusChange } from "../utils/focusBus";
import { useTheme } from "./ThemeContext";
import { useDeskState } from "../hooks/useDeskState";
import deskImg from "../assets/backgrounds/cozycornerbg.png";
import { soundManager } from '../utils/soundManager';
import pkg from '../../package.json';

const SIDEBAR_WIDTH = 250;

// ─── Settings overlay position ────────────────────────────────────────────────
const overlayStyle = {
  position: "absolute", left: "270px", top: "50px",
  background: "rgba(255,253,248,0.92)", backdropFilter: "blur(5px)",
  borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  padding: "24px", zIndex: 600, display: "flex", gap: "20px",
  border: "1px solid rgba(224,212,200,0.6)",
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function Cozykawaii() {
  const { theme, themeName, themeStickers: allThemeStickers, carryOverPending, resolveCarryOver, clearCarryOver, setTheme: rawSetTheme } = useTheme();

  // Window dimensions — needed for ratio ↔ pixel conversion
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const onResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const off = onFocusChange(setFocusActive);
    return () => off();
  }, []);



  // UI-only state (not persisted with desk items)
  const [selectedId, setSelectedId]       = useState(null);
  const [activeMenu, setActiveMenu]       = useState(null);
  const [contextMenu, setContextMenu]     = useState(null); // { x, y, itemType, itemId }
  const settingsRef = useRef(null);

  // Close settings popup when clicking ANYWHERE outside it (capture phase fires
  // before stopPropagation() in stickers/notes/etc. can block the event).
  useEffect(() => {
    if (activeMenu !== 'settings') return;
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('pointerdown', handler, true);
    return () => document.removeEventListener('pointerdown', handler, true);
  }, [activeMenu]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [carryRemember, setCarryRemember] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [focusActive, setFocusActive] = useState(false);
  const [calendarShared, setCalendarShared] = useState(() => localStorage.getItem('cozydesk_calendar_shared') === 'on');
  const [mugzyOn, setMugzyOn] = useState(() => localStorage.getItem('cozydesk_mugzy') !== 'off');
  const [calHintDismissed, setCalHintDismissed] = useState(false);
  const [clearAlsoCalendar, setClearAlsoCalendar] = useState(false);

  // Keep the Settings toggle's On/Off label correct each time the panel opens
  useEffect(() => {
    if (activeMenu === 'settings') {
      setCalendarShared(localStorage.getItem('cozydesk_calendar_shared') === 'on');
    }
  }, [activeMenu]);

  // Reset the "drag a calendar" hint dismissal whenever the theme changes
  useEffect(() => {
    setCalHintDismissed(false);
  }, [themeName]);

  // All desk state + operations
  const desk = useDeskState({ dimensions, themeName });

  // Wrap setTheme to pass the current themeName so ThemeContext reads the right localStorage key
  const setTheme = useCallback((name) => {
    rawSetTheme(name, null, themeName);
  }, [rawSetTheme, themeName]);

  // After theme switch resolves, merge or clear the carry-over snapshot
  const prevCarryRef = useRef(null);
  useEffect(() => {
    if (!carryOverPending) return;
    if (carryOverPending.confirmed === null) return; // waiting for user input
    if (prevCarryRef.current === carryOverPending) return;
    prevCarryRef.current = carryOverPending;
    if (carryOverPending.confirmed === true) {
      const t = setTimeout(() => {
        desk.enableCalendarSharing();
        clearCarryOver();
      }, 100);
      return () => clearTimeout(t);
    } else {
      // confirmed === false — no carry, just clear
      clearCarryOver();
    }
  }, [carryOverPending]);

  const availableStickers = allThemeStickers.filter(s =>
  !s.name.includes('clock') &&
  !s.name.includes('calendar') &&
  !s.name.includes('todo') &&
  !s.name.includes('stickynote')
);
  const stickyNoteSize = theme.stickyNoteSize || 180;

  const getTabStyle = (sidebarVisible) => {
    const t = theme.tabStyle;
    return {
      position: 'absolute', top: '50%',
      left: sidebarVisible ? `${SIDEBAR_WIDTH}px` : '0px',
      transform: 'translateY(-50%)',
      width: '28px', height: '56px',
      borderRadius: '0 28px 28px 0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: 'none', cursor: 'pointer',
      transition: 'all 0.3s ease-in-out',
      zIndex: 100, fontSize: '14px', lineHeight: 1,
      backgroundColor: t.backgroundColor,
      color: t.color,
      boxShadow: t.boxShadow,
    };
  };

  const playToggleSound = () => {
    soundManager.play('sfx_click_button');
  };

  // ─── Keyboard shortcuts ────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault(); desk.handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault(); desk.handleRedo();
      } else if (e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'y') {
        e.preventDefault(); desk.handleRedo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [desk.handleUndo, desk.handleRedo]);

  // ─── Sidebar toggle ────────────────────────────────────────────────
  const toggleSidebar = useCallback(() => {
    setSidebarVisible(v => !v);
    playToggleSound();
  }, [themeName]);

  // ─── Layer management ──────────────────────────────────────────────
  const handleContextMenu = useCallback((e, itemType, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, itemType, itemId });
  }, []);

  const getAllItems = () => [
    ...desk.notes.map(n    => ({ ...n, _type: 'note'     })),
    ...desk.stickers.map(s => ({ ...s, _type: 'sticker'  })),
    ...desk.papers.map(p   => ({ ...p, _type: 'paper'    })),
    ...desk.calendars.map(c => ({ ...c, _type: 'calendar' })),
    ...desk.clocks.map(c   => ({ ...c, _type: 'clock'    })),
    ...(desk.remindersVisible ? [{ id: 'reminders-widget', layer: desk.remindersLayer, _type: 'reminders' }] : []),
  ];

  const handleLayerAction = useCallback((action) => {
    if (!contextMenu) return;
    const { itemType, itemId } = contextMenu;

    if (action === 'unpin') {
      if (itemType === 'note') desk.updateNote(itemId, { pinned: false });
      return;
    }

    if (action === 'detach') {
      if (itemType === 'sticker') desk.detachSticker(itemId);
      else if (itemType === 'note') desk.detachNote(itemId);
      return;
    }

    if (action === 'attach') {
      if (itemType !== 'sticker' && itemType !== 'note') return;

      // Resolve the child's geometry as ratios (notes store w in px and are square)
      let child;
      if (itemType === 'sticker') {
        const s = desk.stickers.find(s => s.id === itemId);
        if (!s) return;
        child = { xRatio: s.xRatio, yRatio: s.yRatio, wRatio: s.wRatio, hRatio: s.hRatio, layer: s.layer ?? 0 };
      } else {
        const n = desk.notes.find(n => n.id === itemId);
        if (!n) return;
        child = {
          xRatio: n.xRatio, yRatio: n.yRatio,
          wRatio: n.w != null ? n.w / dimensions.width  : n.wRatio,
          hRatio: n.w != null ? n.w / dimensions.height : n.hRatio,
          layer: n.layer ?? 0,
        };
      }

      const cx = child.xRatio + child.wRatio / 2;
      const cy = child.yRatio + child.hRatio / 2;
      const childLayer = child.layer;
      const candidates = [
        ...desk.notes.filter(n => !(itemType === 'note' && n.id === itemId)).map(n => ({
          ...n, _type: 'note',
          wRatio: n.w != null ? n.w / dimensions.width  : n.wRatio,
          hRatio: n.w != null ? n.w / dimensions.height : n.hRatio,
        })),
        ...desk.stickers.filter(s => !(itemType === 'sticker' && s.id === itemId)).map(s => ({ ...s, _type: 'sticker' })),
        ...desk.papers.map(p   => ({ ...p, _type: 'paper'   })),
      ].filter(item =>
        item.wRatio != null && item.hRatio != null &&
        (item.layer ?? 0) < childLayer &&
        cx >= item.xRatio && cx <= item.xRatio + item.wRatio &&
        cy >= item.yRatio && cy <= item.yRatio + item.hRatio
      );
      if (candidates.length === 0) return;
      candidates.sort((a, b) => (b.layer ?? 0) - (a.layer ?? 0));
      const parent = candidates[0];
      const attachRelative = {
        relX: parent.wRatio > 0 ? (child.xRatio - parent.xRatio) / parent.wRatio : 0,
        relY: parent.hRatio > 0 ? (child.yRatio - parent.yRatio) / parent.hRatio : 0,
        relW: parent.wRatio > 0 ? child.wRatio / parent.wRatio : 1,
        relH: parent.hRatio > 0 ? child.hRatio / parent.hRatio : 1,
      };
      const attachFn = itemType === 'sticker' ? desk.attachSticker : desk.attachNote;
      attachFn(
        itemId, parent._type, parent.id,
        child.xRatio - parent.xRatio,
        child.yRatio - parent.yRatio,
        attachRelative,
      );
      return;
    }

    const allItems = getAllItems();
    const withLayers = allItems.map((item, i) => ({ ...item, layer: item.layer != null ? item.layer : i }));

    // Move Forward / Backward: swap with the immediate neighbor in the stack.
    // (A fixed nudge fails when layer numbers have gaps; swapping always crosses exactly one item.)
    if (action === 'moveForward' || action === 'moveBackward') {
      const ordered = [...withLayers].sort((a, b) => a.layer - b.layer); // back → front
      const idx = ordered.findIndex(it => it._type === itemType && it.id === itemId);
      if (idx === -1) return;
      const clicked = ordered[idx];

      // Bounding box in ratio space. Clocks/calendars/reminders don't store a size
      // here, so bbox returns null and they're treated as "always overlapping" —
      // you can still cross them, it may just cost an extra click.
      const bbox = (it) => {
        switch (it._type) {
          case 'note':    return { x: it.xRatio, y: it.yRatio, w: (it.w ?? 0) / dimensions.width, h: (it.w ?? 0) / dimensions.height };
          case 'sticker': return { x: it.xRatio, y: it.yRatio, w: it.wRatio ?? 0, h: it.hRatio ?? 0 };
          case 'paper': {
            const w = it.w != null ? it.w / dimensions.width  : (it.wRatio ?? 0);
            const h = it.h != null ? it.h / dimensions.height : (it.hRatio ?? 0);
            return { x: it.xRatio, y: it.yRatio, w, h };
          }
          default: return null;
        }
      };
      const overlaps = (a, b) => {
        const A = bbox(a), B = bbox(b);
        if (!A || !B) return true; // unknown size → assume overlap (safe)
        return A.x < B.x + B.w && A.x + A.w > B.x && A.y < B.y + B.h && A.y + A.h > B.y;
      };

      // Re-seat the clicked item just past the nearest item it ACTUALLY overlaps,
      // skipping non-overlapping items so every click makes a visible change.
      if (action === 'moveBackward') {
        let j = -1;
        for (let i = idx - 1; i >= 0; i--) { if (overlaps(clicked, ordered[i])) { j = i; break; } }
        if (j === -1) return; // nothing it overlaps sits behind it
        ordered.splice(idx, 1);
        ordered.splice(j, 0, clicked);
      } else {
        let k = -1;
        for (let i = idx + 1; i < ordered.length; i++) { if (overlaps(clicked, ordered[i])) { k = i; break; } }
        if (k === -1) return; // nothing it overlaps sits in front of it
        ordered.splice(idx, 1);
        ordered.splice(k, 0, clicked);
      }
      const normalized = ordered.map((item, i) => ({ ...item, layer: i }));
      desk.applyNormalizedLayers(normalized);
      return;
    }

    // Bring to Front / Send to Back: jump past everything (these already worked).
    const updated = withLayers.map(item => {
      if (item._type !== itemType || item.id !== itemId) return item;
      const layers = withLayers.map(i => i.layer);
      switch (action) {
        case 'bringToFront': return { ...item, layer: Math.max(...layers) + 1 };
        case 'sendToBack':   return { ...item, layer: Math.min(...layers) - 1 };
        default: return item;
      }
    });
    const sorted     = [...updated].sort((a, b) => a.layer - b.layer);
    const normalized = sorted.map((item, i) => ({ ...item, layer: i }));
    desk.applyNormalizedLayers(normalized);
  }, [dimensions, contextMenu, desk.notes, desk.stickers, desk.papers, desk.calendars,
      desk.clocks, desk.remindersVisible, desk.remindersLayer, desk.applyNormalizedLayers,
      desk.attachSticker, desk.detachSticker, desk.attachNote, desk.detachNote, desk.updateNote]);

  // ─── Background ────────────────────────────────────────────────────
  // Each theme supplies its own background. cozykawaii uses the photo background
  // in "cozy" mode; other themes use their theme colour. "desktop" mode on any
  // theme is always transparent.
  const getDesktopBackground = () => {
    if (desk.themeMode !== 'cozy') return {};
    if (themeName === 'cozykawaii') {
      return {
        backgroundImage: `url(${deskImg})`,
        backgroundColor: '#e6cba8',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      };
    }
    // For other themes use the theme config background (colour or url)
    const bg = theme.background;
    if (bg.includes('url')) {
      return { backgroundImage: bg, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' };
    }
    return { backgroundColor: bg };
  };

  const hasCalendarEvents = Object.values(desk.calendarEvents).some(arr => Array.isArray(arr) && arr.length > 0);
  const showCalendarHint = hasCalendarEvents && desk.calendars.length === 0 && !calHintDismissed;

  if (!desk.mounted) return null;

  return (
    <div
      style={{
        ...getDesktopBackground(),
        width: "100vw", height: "100vh",
        position: "relative", overflow: "hidden",
        fontFamily: "'Nunito', sans-serif",
        filter: focusActive
          ? "brightness(1.06) contrast(1.14) saturate(1.12)"
          : "none",
        transition: "filter 1.4s ease-in-out",
      }}
      onClick={() => { setSelectedId(null); setActiveMenu(null); setContextMenu(null); }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={desk.handleDeskDrop}
    >
      {/* ── Sidebar tab toggle ── */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleSidebar(); }}
        title={sidebarVisible ? 'Hide sidebar (Shift+S)' : 'Show sidebar (Shift+S)'}
        style={getTabStyle(sidebarVisible)}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = theme.tabStyle.hoverGlow; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = theme.tabStyle.boxShadow; }}
      >
        {sidebarVisible ? '◀' : '▶'}
      </button>

      {/* ── Sidebar ── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${SIDEBAR_WIDTH}px`, zIndex: 500, overflow: 'hidden',
          opacity: sidebarVisible ? 1 : 0,
          transform: sidebarVisible ? 'translateX(0)' : `translateX(-${SIDEBAR_WIDTH}px)`,
          transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
          pointerEvents: sidebarVisible ? 'auto' : 'none',
        }}
      >
        <Sidebar
          stickers={availableStickers}
          onSettings={() => setActiveMenu(v => v === "settings" ? null : "settings")}
          onToggleReminders={desk.toggleRemindersWidget}
          remindersVisible={desk.remindersVisible}
          canUndo={desk.undoStack.length > 0}
          onUndo={desk.handleUndo}
          canRedo={desk.redoStack.length > 0}
          onRedo={desk.handleRedo}
          onAddNote={desk.addNote}
          onAddTodoList={desk.addTodoList}
          onDeskAdd={desk.handleDeskAdd}
          onSaveSlot={desk.saveToSlot}
          onLoadSlot={desk.loadFromSlot}
          onSetTheme={setTheme}
        />
      </div>

      {/* ── Settings overlay ── */}
      {activeMenu === "settings" && (
        <div ref={settingsRef} style={{ ...overlayStyle, flexDirection: "column", minWidth: "220px", gap: "10px" }} onClick={e => e.stopPropagation()}>
          <h3 style={{ margin: "0 0 10px 0", color: "#4b3b2a", borderBottom: "1px solid #ecddd0", paddingBottom: "10px", fontFamily: "'Nunito', sans-serif" }}>
            Settings
          </h3>
          <button
            style={{ width: "100%", padding: "10px", border: "none", borderRadius: "12px", background: "#e0d4c8", color: "#4b3b2a", fontFamily: "'Nunito', sans-serif", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}
            onClick={() => desk.setThemeMode(t => t === "cozy" ? "desktop" : "cozy")}
          >
            {desk.themeMode === "cozy" ? "🖥️ Transparent Background" : "🌿 Cozy Background"}
          </button>
          <button
            style={{ width: "100%", padding: "10px", border: "none", borderRadius: "12px", background: "#d4e0c8", color: "#3b4b2a", fontFamily: "'Nunito', sans-serif", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}
            onClick={desk.handleTidyDesk}
          >
            🧹 Tidy Notes
          </button>
          <button
            style={{ width: "100%", padding: "10px", border: "none", borderRadius: "12px", background: "#d6e4f0", color: "#2a3b4b", fontFamily: "'Nunito', sans-serif", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}
            onClick={() => {
              soundManager.play('sfx_click_button');
              if (calendarShared) { desk.disableCalendarSharing(); setCalendarShared(false); }
              else { desk.enableCalendarSharing(); setCalendarShared(true); }
            }}
          >
            📅 Calendar events shared in every theme · {calendarShared ? "On" : "Off"}
          </button>
          <button
            style={{ width: "100%", padding: "10px", border: "none", borderRadius: "12px", background: "#f0e0d6", color: "#5a3b2a", fontFamily: "'Nunito', sans-serif", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}
            onClick={() => {
              soundManager.play('sfx_click_button');
              const next = mugzyOn ? 'off' : 'on';
              localStorage.setItem('cozydesk_mugzy', next);
              setMugzyOn(next !== 'off');
              window.dispatchEvent(new Event('cozydesk-mugzy-toggle'));
            }}
          >
            ☕ Show Mugzy · {mugzyOn ? "On" : "Off"}
          </button>
          <button
            style={{ width: "100%", padding: "10px", border: "none", borderRadius: "12px", background: "#ffe0e0", color: "#c00", fontFamily: "'Nunito', sans-serif", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}
            onClick={(e) => { e.stopPropagation(); soundManager.play('sfx_areyousure'); setShowClearConfirm(true); }}
          >
            🗑️ Clear All
          </button>
          <p style={{ margin: "8px 0 0 0", color: "#a07850", fontSize: "13px", textAlign: "center", fontFamily: "'Nunito', sans-serif" }}>
            CozyDesk v{pkg.version} · Your cozy productivity hub 🌸
          </p>
          <a
            href={`mailto:cozydesksupport@gmail.com?subject=${encodeURIComponent(`CozyDesk Bug Report (v${pkg.version})`)}&body=${encodeURIComponent(`Tell us what happened:\n\n\nWhat did you expect instead?\n\n\nBrowser (Chrome, Safari, etc.):\n\n\n———\nApp version: ${pkg.version}\n(Please keep this version line so we know which build you're on. Thank you! 🌸)`)}`}
            onClick={e => e.stopPropagation()}
            style={{ display: "block", margin: "2px 0 0 0", color: "#a07850", fontSize: "13px", textAlign: "center", fontFamily: "'Nunito', sans-serif", textDecoration: "underline", cursor: "pointer" }}
          >
            🐛 Report a bug
          </a>
        </div>
      )}

      {/* ── "Drag a calendar" hint (events exist but no calendar on the desk) ── */}
      {showCalendarHint && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)",
            zIndex: 50, maxWidth: "360px",
            background: "rgba(255,253,248,0.95)", backdropFilter: "blur(5px)",
            border: "1px solid rgba(224,212,200,0.7)", borderRadius: "14px",
            boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
            padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          <span style={{ fontSize: "22px" }}>📅</span>
          <span style={{ color: "#4b3b2a", fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.35 }}>
            You've got calendar events here! Drag a calendar from the sidebar to see them.
          </span>
          <button
            onClick={() => setCalHintDismissed(true)}
            aria-label="Dismiss"
            style={{
              border: "none", background: "transparent", cursor: "pointer",
              color: "#a07850", fontSize: "18px", lineHeight: 1, padding: "0 2px",
            }}
          >×</button>
        </div>
      )}

      {/* ── Reminders widget ── */}
      {desk.remindersVisible && (
        <Reminders
          x={desk.remindersPos.xRatio * dimensions.width}
          y={desk.remindersPos.yRatio * dimensions.height}
          width={desk.remindersPos.wRatio * dimensions.width}
          height={desk.remindersPos.hRatio * dimensions.height}
          reminders={desk.reminders}
          onAddReminder={desk.addReminder}
          onToggleReminder={desk.toggleReminder}
          onDeleteReminder={desk.deleteReminder}
          onEditReminder={desk.editReminder}
          isSelected={selectedId?.type === 'reminders'}
          onSelect={() => setSelectedId({ type: 'reminders', id: 'widget' })}
          onUpdate={desk.updateRemindersPos}
          onClose={() => { desk.toggleRemindersWidget(); }}
          layer={desk.remindersLayer}
          onContextMenu={(e) => handleContextMenu(e, 'reminders', 'reminders-widget')}
        />
      )}

      {/* ── Carry-over popup ── */}
      {carryOverPending && carryOverPending.confirmed === null && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10100,
        }}>
          <div
            style={{
              background: "white", padding: "24px", borderRadius: "16px",
              maxWidth: "320px", width: "90%", textAlign: "center",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              fontFamily: "'Nunito', sans-serif",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: "44px", marginBottom: "8px" }}>📅</div>
            <h3 style={{ margin: "0 0 8px 0", color: "#4b3b2a", fontSize: "1.2rem", fontFamily: "'Nunito', sans-serif", fontWeight: 800 }}>
              One calendar everywhere?
            </h3>
            <p style={{ margin: "0 0 16px 0", color: "#6b5b4a", lineHeight: "1.5", fontSize: "0.88rem", fontFamily: "'Nunito', sans-serif" }}>
              Want your calendar events to show up in all your themes?<br/>
              <span style={{ color: "#a07850", fontSize: "0.82rem" }}>You can change this anytime in Settings.</span>
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "14px" }}>
              <button
                onClick={() => { resolveCarryOver(true, carryRemember); setCarryRemember(false); }}
                style={{ padding: "9px 20px", borderRadius: "10px", border: "none", background: "#d4a373", color: "white", fontWeight: "bold", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: "0.9rem" }}
              >
                Yes, share
              </button>
              <button
                onClick={() => { resolveCarryOver(false, carryRemember); setCarryRemember(false); }}
                style={{ padding: "9px 20px", borderRadius: "10px", border: "none", background: "#eee", color: "#4b3b2a", fontWeight: "bold", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: "0.9rem" }}
              >
                No, keep separate
              </button>
            </div>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", color: "#8b7b6a", fontFamily: "'Nunito', sans-serif" }}>
              <input
                type="checkbox"
                checked={carryRemember}
                onChange={e => setCarryRemember(e.target.checked)}
                style={{ width: "15px", height: "15px", cursor: "pointer" }}
              />
              Remember my choice
            </label>
          </div>
        </div>
      )}

      {/* ── Clear All confirmation modal ── */}
      {showClearConfirm && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10100,
        }}>
          <div
            style={{
              background: "white", padding: "18px 20px", borderRadius: "16px",
              maxWidth: "300px", width: "90%", textAlign: "center",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)", animation: "modalFadeIn 0.3s ease-out",
              fontFamily: "'Nunito', sans-serif",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: "44px", marginBottom: "8px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px 0", color: "#4b3b2a", fontSize: "1.2rem", fontFamily: "'Nunito', sans-serif", fontWeight: 800 }}>Are you sure?</h3>
            <p style={{ margin: "0 0 16px 0", color: "#6b5b4a", lineHeight: "1.4", fontSize: "0.88rem", fontFamily: "'Nunito', sans-serif" }}>
              {calendarShared
                ? "Everything on this desk will be erased."
                : "Everything including your reminders, To Do List, and Calendar will all be erased."}
            </p>
            {calendarShared && (
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", color: "#8b7b6a", fontFamily: "'Nunito', sans-serif", marginBottom: "14px" }}>
                <input
                  type="checkbox"
                  checked={clearAlsoCalendar}
                  onChange={e => setClearAlsoCalendar(e.target.checked)}
                  style={{ width: "15px", height: "15px", cursor: "pointer" }}
                />
                Also erase shared calendar events (used in all themes)
              </label>
            )}
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => { soundManager.play('sfx_clear_screen'); desk.clearDesk({ clearCalendar: !calendarShared || clearAlsoCalendar }); setClearAlsoCalendar(false); setShowClearConfirm(false); setActiveMenu(null); }}
                style={{ padding: "9px 20px", borderRadius: "10px", border: "none", background: "#ff7675", color: "white", fontWeight: "bold", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: "0.9rem" }}
              >
                Proceed
              </button>
              <button
                onClick={() => { setClearAlsoCalendar(false); setShowClearConfirm(false); }}
                style={{ padding: "9px 20px", borderRadius: "10px", border: "none", background: "#eee", color: "#4b3b2a", fontWeight: "bold", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: "0.9rem" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Storage full warning ── */}
      {desk.storageFull && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10100,
        }}>
          <div
            style={{
              background: "white", padding: "18px 20px", borderRadius: "16px",
              maxWidth: "300px", width: "90%", textAlign: "center",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              fontFamily: "'Nunito', sans-serif",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: "44px", marginBottom: "8px" }}>💾</div>
            <h3 style={{ margin: "0 0 8px 0", color: "#4b3b2a", fontSize: "1.2rem", fontFamily: "'Nunito', sans-serif", fontWeight: 800 }}>Storage is full</h3>
            <p style={{ margin: "0 0 16px 0", color: "#6b5b4a", lineHeight: "1.4", fontSize: "0.88rem", fontFamily: "'Nunito', sans-serif" }}>
              Your browser's storage is full, so recent changes might not be saved. Try removing a few saved desks, or back up your desk before continuing.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => desk.setStorageFull(false)}
                style={{ padding: "9px 20px", borderRadius: "10px", border: "none", background: "#d4a373", color: "white", fontWeight: "bold", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: "0.9rem" }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── To-do list papers ── */}
      {desk.papers.map(paper => (
        <ReminderPaper
          key={paper.id}
          x={paper.xRatio * dimensions.width}
          y={paper.yRatio * dimensions.height}
          width={paper.w ?? paper.wRatio * dimensions.width}
          height={paper.h ?? paper.hRatio * dimensions.height}
          layer={paper.layer}
          initialRotation={paper.rotation ?? 0}
          reminders={desk.reminders.filter(r => paper.reminderIds.includes(r.id))}
          isSelected={selectedId?.type === "paper" && selectedId?.id === paper.id}
          onSelect={() => setSelectedId({ type: "paper", id: paper.id })}
          onUpdate={data => {
            const dxRatio = data.x / dimensions.width - paper.xRatio;
            const dyRatio = data.y / dimensions.height - paper.yRatio;
            desk.updatePaper(paper.id, data);
            desk.moveAttachedStickers(paper.id, dxRatio, dyRatio);
            desk.moveAttachedNotes(paper.id, dxRatio, dyRatio);
          }}
          onDelete={() => { desk.removePaper(paper.id); setSelectedId(null); }}
          onToggleReminder={desk.toggleReminder}
          onDeleteReminder={desk.deleteReminder}
          onAddInlineReminder={(rem) => desk.addInlineReminder(rem, paper.id)}
          onContextMenu={(e) => handleContextMenu(e, 'paper', paper.id)}
        />
      ))}

      {/* ── Corkboard backdrops (rendered first so everything sits on top) ── */}
      {desk.stickers.filter(s => s.backdrop).map(sticker => (
        <Sticker
          key={sticker.id}
          src={sticker.src}
          alt={sticker.name}
          x={sticker.xRatio * dimensions.width}
          y={sticker.yRatio * dimensions.height}
          width={sticker.wRatio * dimensions.width}
          height={sticker.hRatio * dimensions.height}
          layer={sticker.layer}
          isSelected={selectedId?.type === "sticker" && selectedId?.id === sticker.id}
          onSelect={() => setSelectedId({ type: "sticker", id: sticker.id })}
          onDragMove={data => desk.resizeAttachedStickers(
            sticker.id, data.x / dimensions.width, data.y / dimensions.height,
            sticker.wRatio, sticker.hRatio
          )}
          onResizeMove={data => desk.resizeAttachedStickers(
            sticker.id, data.x / dimensions.width, data.y / dimensions.height,
            data.width / dimensions.width, data.height / dimensions.height
          )}
          onUpdate={data => {
            desk.updateSticker(sticker.id, data);
            desk.resizeAttachedStickers(
              sticker.id, data.x / dimensions.width, data.y / dimensions.height,
              data.width / dimensions.width, data.height / dimensions.height
            );
          }}
          onDelete={() => { desk.removeSticker(sticker.id); setSelectedId(null); }}
          deskW={dimensions.width}
          deskH={dimensions.height}
          isBackdrop
          isAttached={!!sticker.attachedTo}
          onContextMenu={(e) => handleContextMenu(e, 'sticker', sticker.id)}
          flippedX={sticker.flippedX || false}
          flippedY={sticker.flippedY || false}
          rotation={sticker.rotation || 0}
          onTransformChange={(t) => desk.updateStickerTransform(sticker.id, t)}
        />
      ))}

      {/* ── Regular stickers ── */}
      {desk.stickers.filter(s => !s.backdrop).map((sticker, i) => (
        <Sticker
          src={sticker.src}
          alt={sticker.name}
          x={sticker.xRatio * dimensions.width}
          y={sticker.yRatio * dimensions.height}
          width={sticker.wRatio * dimensions.width}
          height={sticker.hRatio * dimensions.height}
          layer={sticker.layer}
          isSelected={selectedId?.type === "sticker" && selectedId?.id === sticker.id}
          onSelect={() => setSelectedId({ type: "sticker", id: sticker.id })}
          onDragMove={data => desk.resizeAttachedStickers(
            sticker.id, data.x / dimensions.width, data.y / dimensions.height,
            sticker.wRatio, sticker.hRatio
          )}
          onResizeMove={data => desk.resizeAttachedStickers(
            sticker.id, data.x / dimensions.width, data.y / dimensions.height,
            data.width / dimensions.width, data.height / dimensions.height
          )}
          onUpdate={data => {
            desk.updateSticker(sticker.id, data);
            desk.resizeAttachedStickers(
              sticker.id, data.x / dimensions.width, data.y / dimensions.height,
              data.width / dimensions.width, data.height / dimensions.height
            );
          }}
          onDelete={() => { desk.removeSticker(sticker.id); setSelectedId(null); }}
          deskW={dimensions.width}
          deskH={dimensions.height}
          isAttached={!!sticker.attachedTo}
          key={sticker.id}
          focusActive={focusActive}
          bounceDelay={i * 50}
          onContextMenu={(e) => handleContextMenu(e, 'sticker', sticker.id)}
          flippedX={sticker.flippedX || false}
          flippedY={sticker.flippedY || false}
          rotation={sticker.rotation || 0}
          onTransformChange={(t) => desk.updateStickerTransform(sticker.id, t)}
        />
      ))}

      {/* ── Sticky notes ── */}
      {desk.notes.map(note => (
        <StickyNote
          key={note.id}
          x={note.xRatio * dimensions.width}
          y={note.yRatio * dimensions.height}
          width={note.w ?? note.wRatio * dimensions.width}
          height={note.w ?? note.wRatio * dimensions.width}
          src={note.src}
          pinned={note.pinned}
          isAttached={!!note.attachedTo}
          layer={note.layer}
          initialRotation={note.rotation ?? 0}
          initialText={note.text}
          isSelected={selectedId?.type === "note" && selectedId?.id === note.id}
          onSelect={() => setSelectedId({ type: "note", id: note.id })}
          onUpdate={data => {
            desk.updateNote(note.id, data);
            if (data.x !== undefined) {
              desk.moveAttachedStickers(
                note.id,
                data.x / dimensions.width - note.xRatio,
                data.y / dimensions.height - note.yRatio,
              );
              desk.moveAttachedNotes(
                note.id,
                data.x / dimensions.width - note.xRatio,
                data.y / dimensions.height - note.yRatio,
              );
            }
          }}
          onDelete={() => { desk.removeNote(note.id); setSelectedId(null); }}
          onContextMenu={(e) => handleContextMenu(e, 'note', note.id)}
        />
      ))}

      {/* ── Clock stickers ── */}
      {desk.clocks.map(clock => {
        const ClockComponent = theme.clockComponent || ClockSticker;
        return (
          <ClockComponent
            key={clock.id}
            x={clock.xRatio * dimensions.width}
            y={clock.yRatio * dimensions.height}
            sizePreset={clock.sizePreset || 'md'}
            layer={clock.layer}
            isSelected={selectedId?.type === "clock" && selectedId?.id === clock.id}
            onSelect={() => setSelectedId({ type: "clock", id: clock.id })}
            onUpdate={data => {
              const dxRatio = data.x / dimensions.width - clock.xRatio;
              const dyRatio = data.y / dimensions.height - clock.yRatio;
              desk.updateClock(clock.id, data);
              desk.moveAttachedStickers(clock.id, dxRatio, dyRatio);
              desk.moveAttachedNotes(clock.id, dxRatio, dyRatio);
            }}
            flipped={clock.flipped || false}
            onFlip={() => desk.changeClockFlip(clock.id)}
            onDelete={() => { desk.removeClock(clock.id); setSelectedId(null); }}
            onChangeSize={preset => desk.changeClockSize(clock.id, preset)}
            onContextMenu={(e) => handleContextMenu(e, 'clock', clock.id)}
            clockTheme={theme.clockTheme || {}}
            showFlip={!theme.clockTheme?.hideFlip}
          />
        );
      })}

      {/* ── Calendar stickers ── */}
      {desk.calendars.map(cal => {
        const CalComponent = theme.calendarComponent || CalendarSticker;
        return (
          <CalComponent
            key={cal.id}
            x={cal.xRatio * dimensions.width}
            y={cal.yRatio * dimensions.height}
            sizePreset={cal.sizePreset || 'md'}
            layer={cal.layer}
            isSelected={selectedId?.type === "calendar" && selectedId?.id === cal.id}
            onSelect={() => setSelectedId({ type: "calendar", id: cal.id })}
            onUpdate={data => {
              const dxRatio = data.x / dimensions.width - cal.xRatio;
              const dyRatio = data.y / dimensions.height - cal.yRatio;
              desk.updateCalendar(cal.id, data);
              desk.moveAttachedStickers(cal.id, dxRatio, dyRatio);
              desk.moveAttachedNotes(cal.id, dxRatio, dyRatio);
            }}
            onDelete={() => { desk.removeCalendar(cal.id); setSelectedId(null); }}
            onChangeSize={preset => desk.changeCalendarSize(cal.id, preset)}
            events={desk.calendarEvents}
            onAddEvent={desk.addCalendarEvent}
            onRemoveEvent={desk.removeCalendarEvent}
            onContextMenu={(e) => handleContextMenu(e, 'calendar', cal.id)}
          />
        );
      })}

      {/* ── Focus mode overlay ── */}
      <FocusOverlay />

      {/* ── Mugzy the mascot ── */}
      <Mugzy />

      {/* ── Layer context menu ── */}
      {contextMenu && (
        <>
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
          />
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onAction={handleLayerAction}
            onClose={() => setContextMenu(null)}
            isPinned={
              contextMenu.itemType === 'note' &&
              !!desk.notes.find(n => n.id === contextMenu.itemId)?.pinned
            }
            isAttached={
              (contextMenu.itemType === 'sticker' &&
                !!desk.stickers.find(s => s.id === contextMenu.itemId)?.attachedTo) ||
              (contextMenu.itemType === 'note' &&
                !!desk.notes.find(n => n.id === contextMenu.itemId)?.attachedTo)
            }
            canAttach={
              (contextMenu.itemType === 'sticker' &&
                !desk.stickers.find(s => s.id === contextMenu.itemId)?.attachedTo) ||
              (contextMenu.itemType === 'note' &&
                !desk.notes.find(n => n.id === contextMenu.itemId)?.attachedTo)
            }
          />
        </>
      )}
    </div>
  );
}
