/* To add a new theme, define --btn-bg, --btn-text, --btn-font in Sidebar.css */
import React, { useState, useEffect, useCallback, useRef } from "react";
import Sticker from "../components/Sticker";
import StickyNote from "../components/StickyNote";
import ReminderPaper from "../components/ReminderPaper";
import ClockSticker from "../components/ClockSticker";
import LofiClockSticker from "../components/LofiClockSticker";
import SteampunkClockSticker from "../components/SteampunkClockSticker";
import Sidebar from "../components/Sidebar";
import Reminders from "../components/Reminders";
import CalendarSticker from "../components/CalendarSticker";
import LofiCalendarSticker from "../components/LofiCalendarSticker";
import ContextMenu from "../components/ContextMenu";
import { useTheme } from "./ThemeContext";
import { useDeskState } from "../hooks/useDeskState";
import deskImg from "../assets/backgrounds/cozycornerbg.png";

const SIDEBAR_WIDTH = 250;

// ─── Settings overlay position ────────────────────────────────────────────────
const overlayStyle = {
  position: "absolute", left: "270px", top: "50px",
  background: "rgba(255,253,248,0.92)", backdropFilter: "blur(5px)",
  borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  padding: "24px", zIndex: 15, display: "flex", gap: "20px",
  border: "1px solid rgba(224,212,200,0.6)",
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function Cozykawaii() {
  const { theme, themeName, themeStickers: allThemeStickers } = useTheme();

  // Window dimensions — needed for ratio ↔ pixel conversion
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const onResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // All desk state + operations
  const desk = useDeskState({ dimensions, themeName });

  const availableStickers = allThemeStickers.filter(s => !s.name.includes('cozyclock'));
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
    try {
      const soundName = theme.sound || 'default-click';
      const audio = new Audio(`/src/assets/sounds/${soundName}.mp3`);
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (_) {}
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

    if (action === 'detach') {
      if (itemType === 'sticker') desk.detachSticker(itemId);
      return;
    }

    if (action === 'attach') {
      if (itemType !== 'sticker') return;
      const childSticker = desk.stickers.find(s => s.id === itemId);
      if (!childSticker) return;
      const cx = childSticker.xRatio + childSticker.wRatio / 2;
      const cy = childSticker.yRatio + childSticker.hRatio / 2;
      const childLayer = childSticker.layer ?? 0;
      const candidates = [
        ...desk.notes.map(n    => ({ ...n, _type: 'note'    })),
        ...desk.stickers.filter(s => s.id !== itemId).map(s => ({ ...s, _type: 'sticker' })),
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
      desk.attachSticker(
        itemId, parent._type, parent.id,
        childSticker.xRatio - parent.xRatio,
        childSticker.yRatio - parent.yRatio,
        {
          relX: parent.wRatio > 0 ? (childSticker.xRatio - parent.xRatio) / parent.wRatio : 0,
          relY: parent.hRatio > 0 ? (childSticker.yRatio - parent.yRatio) / parent.hRatio : 0,
          relW: parent.wRatio > 0 ? childSticker.wRatio / parent.wRatio : 1,
          relH: parent.hRatio > 0 ? childSticker.hRatio / parent.hRatio : 1,
        },
      );
      return;
    }

    const allItems = getAllItems();
    const withLayers = allItems.map((item, i) => ({ ...item, layer: item.layer != null ? item.layer : i }));
    const updated = withLayers.map(item => {
      if (item._type !== itemType || item.id !== itemId) return item;
      const layers = withLayers.map(i => i.layer);
      switch (action) {
        case 'bringToFront': return { ...item, layer: Math.max(...layers) + 1 };
        case 'sendToBack':   return { ...item, layer: Math.min(...layers) - 1 };
        case 'moveForward':  return { ...item, layer: item.layer + 1.5 };
        case 'moveBackward': return { ...item, layer: item.layer - 1.5 };
        default: return item;
      }
    });
    const sorted     = [...updated].sort((a, b) => a.layer - b.layer);
    const normalized = sorted.map((item, i) => ({ ...item, layer: i }));
    desk.applyNormalizedLayers(normalized);
  }, [contextMenu, desk.notes, desk.stickers, desk.papers, desk.calendars,
      desk.clocks, desk.remindersVisible, desk.remindersLayer, desk.applyNormalizedLayers,
      desk.attachSticker, desk.detachSticker]);

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

  if (!desk.mounted) return null;

  return (
    <div
      style={{
        ...getDesktopBackground(),
        width: "100vw", height: "100vh",
        position: "relative", overflow: "hidden",
        fontFamily: "'Nunito', sans-serif",
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
          onSaveSlot={desk.saveToSlot}
          onLoadSlot={desk.loadFromSlot}
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
            style={{ width: "100%", padding: "10px", border: "none", borderRadius: "12px", background: "#ffe0e0", color: "#c00", fontFamily: "'Nunito', sans-serif", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}
            onClick={(e) => { e.stopPropagation(); setShowClearConfirm(true); }}
          >
            🗑️ Clear All
          </button>
          <p style={{ margin: "8px 0 0 0", color: "#a07850", fontSize: "13px", textAlign: "center", fontFamily: "'Nunito', sans-serif" }}>
            CozyDesk v1.0 · Your cozy productivity hub 🌸
          </p>
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
              Everything including your reminders, To Do List, and Calendar will all be erased.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => { desk.clearDesk(); setShowClearConfirm(false); setActiveMenu(null); }}
                style={{ padding: "9px 20px", borderRadius: "10px", border: "none", background: "#ff7675", color: "white", fontWeight: "bold", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: "0.9rem" }}
              >
                Proceed
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{ padding: "9px 20px", borderRadius: "10px", border: "none", background: "#eee", color: "#4b3b2a", fontWeight: "bold", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: "0.9rem" }}
              >
                Cancel
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
          width={paper.wRatio * dimensions.width}
          height={paper.hRatio * dimensions.height}
          layer={paper.layer}
          reminders={desk.reminders.filter(r => paper.reminderIds.includes(r.id))}
          isSelected={selectedId?.type === "paper" && selectedId?.id === paper.id}
          onSelect={() => setSelectedId({ type: "paper", id: paper.id })}
          onUpdate={data => {
            const dxRatio = data.x / dimensions.width - paper.xRatio;
            const dyRatio = data.y / dimensions.height - paper.yRatio;
            desk.updatePaper(paper.id, data);
            desk.moveAttachedStickers(paper.id, dxRatio, dyRatio);
          }}
          onDelete={() => { desk.removePaper(paper.id); setSelectedId(null); }}
          onToggleReminder={desk.toggleReminder}
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
        />
      ))}

      {/* ── Regular stickers ── */}
      {desk.stickers.filter(s => !s.backdrop).map(sticker => (
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
          isAttached={!!sticker.attachedTo}
          onContextMenu={(e) => handleContextMenu(e, 'sticker', sticker.id)}
        />
      ))}

      {/* ── Sticky notes ── */}
      {desk.notes.map(note => (
        <StickyNote
          key={note.id}
          x={note.xRatio * dimensions.width}
          y={note.yRatio * dimensions.height}
          width={note.wRatio * dimensions.width}
          height={note.hRatio * dimensions.height}
          src={note.src}
          pinned={note.pinned}
          layer={note.layer}
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
            }}
            onDelete={() => { desk.removeClock(clock.id); setSelectedId(null); }}
            onChangeSize={preset => desk.changeClockSize(clock.id, preset)}
            onContextMenu={(e) => handleContextMenu(e, 'clock', clock.id)}
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
            isAttached={
              contextMenu.itemType === 'sticker' &&
              !!desk.stickers.find(s => s.id === contextMenu.itemId)?.attachedTo
            }
            canAttach={
              contextMenu.itemType === 'sticker' &&
              !desk.stickers.find(s => s.id === contextMenu.itemId)?.attachedTo
            }
          />
        </>
      )}
    </div>
  );
}
