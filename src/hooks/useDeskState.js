import { useState, useEffect, useCallback, useRef } from "react";

const ITEMS_PER_PAPER = 6;

/**
 * All desk state, CRUD operations, undo/redo, and localStorage persistence
 * in one hook. cozykawaii.jsx keeps only UI state, layer management, and render.
 *
 * @param {{ dimensions: { width: number, height: number }, themeName: string }} params
 */
export function useDeskState({ dimensions, themeName }) {
  const [mounted, setMounted]                 = useState(false);
  const [themeMode, setThemeMode]             = useState("cozy");
  const [notes, setNotes]                     = useState([]);
  const [stickers, setStickers]               = useState([]);
  const [reminders, setReminders]             = useState([]);
  const [papers, setPapers]                   = useState([]);
  const [clocks, setClocks]                   = useState([]);
  const [calendars, setCalendars]             = useState([]);
  const [calendarEvents, setCalendarEvents]   = useState({});
  const [undoStack, setUndoStack]             = useState([]);
  const [redoStack, setRedoStack]             = useState([]);
  const [remindersVisible, setRemindersVisible] = useState(false);
  const [remindersPos, setRemindersPos]       = useState({ xRatio: 0.35, yRatio: 0.15, wRatio: 0.22, hRatio: 0.55 });
  const [remindersLayer, setRemindersLayer]   = useState(5);

  // Always-current snapshot used by undo system and theme-switch saves
  const stateRef = useRef({
    notes: [], stickers: [], papers: [], clocks: [], calendars: [],
    calendarEvents: {}, reminders: [], remindersLayer: 5,
    themeMode: 'cozy', remindersVisible: false,
    remindersPos: { xRatio: 0.35, yRatio: 0.15, wRatio: 0.22, hRatio: 0.55 },
  });
  useEffect(() => {
    stateRef.current = {
      notes, stickers, papers, clocks, calendars, calendarEvents, reminders, remindersLayer,
      themeMode, remindersVisible, remindersPos,
    };
  }, [notes, stickers, papers, clocks, calendars, calendarEvents, reminders, remindersLayer,
      themeMode, remindersVisible, remindersPos]);

  // ─── Per-theme storage key ────────────────────────────────────────
  const storageKey = (theme) => `cozydesk_state_${theme}`;

  const saveThemeState = (theme) => {
    try {
      const s = stateRef.current;
      localStorage.setItem(storageKey(theme), JSON.stringify({
        notes: s.notes, stickers: s.stickers, papers: s.papers,
        clocks: s.clocks, calendars: s.calendars, calendarEvents: s.calendarEvents,
        reminders: s.reminders, remindersLayer: s.remindersLayer,
        themeMode: s.themeMode, remindersVisible: s.remindersVisible,
        remindersPos: s.remindersPos,
      }));
    } catch (_) {}
  };

  const loadThemeState = (theme) => {
    try {
      const saved = localStorage.getItem(storageKey(theme));
      if (!saved) return;
      const {
        notes: sN, stickers: sS, papers: sP, reminders: sR, themeMode: sT,
        clocks: sCL, calendars: sCAL, calendarEvents: sCE,
        remindersVisible: sRV, remindersPos: sRP, remindersLayer: sRL,
      } = JSON.parse(saved);
      const ensureLayers = (...arrays) => {
        let counter = 0;
        return arrays.map(arr => (arr || []).map(item => ({
          ...item, layer: item.layer != null ? item.layer : counter++,
        })));
      };
      const [mN, mS, mP, mCL, mCAL] = ensureLayers(sN, sS, sP, sCL, sCAL);
      setNotes(mN.length    ? mN  : []);
      setStickers(mS.length ? mS  : []);
      setPapers(mP.length   ? mP  : []);
      setReminders(sR       || []);
      setClocks(mCL.length  ? mCL : []);
      setCalendars(mCAL.length ? mCAL : []);
      setCalendarEvents(sCE || {});
      if (sT)          setThemeMode(sT);
      if (sRV != null) setRemindersVisible(sRV);
      if (sRP)         setRemindersPos(sRP);
      if (sRL != null) setRemindersLayer(sRL);
    } catch (e) {
      console.warn("CozyDesk: could not restore state for theme", theme, e);
    }
  };

  // Track previous theme to detect switches — save old, load new
  const prevThemeRef = useRef(themeName);
  useEffect(() => {
    if (prevThemeRef.current === themeName) return;
    const oldTheme = prevThemeRef.current;
    prevThemeRef.current = themeName;

    // Save current desk to the old theme's slot
    saveThemeState(oldTheme);

    // Clear all desk items
    setNotes([]); setStickers([]); setPapers([]);
    setReminders([]); setClocks([]); setCalendars([]); setCalendarEvents({});
    setUndoStack([]); setRedoStack([]);

    // Restore the new theme's previously saved desk
    loadThemeState(themeName);
  }, [themeName]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Layer helper ─────────────────────────────────────────────────
  const getNextLayer = () => {
    const s = stateRef.current;
    const layers = [
      ...s.notes, ...s.stickers, ...s.papers, ...s.calendars, ...s.clocks,
    ].map(i => i.layer ?? 0);
    if (s.remindersLayer != null) layers.push(s.remindersLayer);
    return layers.length === 0 ? 1 : Math.max(...layers) + 1;
  };

  // ─── Undo / Redo ──────────────────────────────────────────────────
  const pushUndo = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-29), { ...stateRef.current }]);
    setRedoStack([]);
  }, []);

  const handleUndo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setRedoStack(rp => [...rp.slice(-29), { ...stateRef.current }]);
      setNotes(last.notes);
      setStickers(last.stickers);
      setPapers(last.papers);
      setClocks(last.clocks);
      setCalendars(last.calendars);
      setCalendarEvents(last.calendarEvents);
      setReminders(last.reminders);
      return prev.slice(0, -1);
    });
  }, []);

  const handleRedo = useCallback(() => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const next = prev[prev.length - 1];
      setUndoStack(up => [...up.slice(-29), { ...stateRef.current }]);
      setNotes(next.notes);
      setStickers(next.stickers);
      setPapers(next.papers);
      setClocks(next.clocks);
      setCalendars(next.calendars);
      setCalendarEvents(next.calendarEvents);
      setReminders(next.reminders);
      return prev.slice(0, -1);
    });
  }, []);

  // ─── Attachment ──────────────────────────────────────────────────
  const attachSticker = useCallback((childId, parentType, parentId, dxRatio, dyRatio, attachRelative) => {
    pushUndo();
    setStickers(prev => prev.map(s => s.id === childId ? {
      ...s,
      attachedTo: { type: parentType, id: parentId },
      attachOffset: { dxRatio, dyRatio },
      attachRelative: attachRelative ?? null,
    } : s));
  }, [pushUndo]);

  const detachSticker = useCallback((childId) => {
    pushUndo();
    setStickers(prev => prev.map(s => s.id === childId ? {
      ...s,
      attachedTo: null,
      attachOffset: null,
    } : s));
  }, [pushUndo]);

  // Move all stickers attached to parentId by a ratio delta (no undo push — used for non-sticker parents)
  const moveAttachedStickers = useCallback((parentId, dxRatio, dyRatio) => {
    setStickers(prev => {
      if (!prev.some(s => s.attachedTo?.id === parentId)) return prev;
      return prev.map(s => s.attachedTo?.id === parentId ? {
        ...s,
        xRatio: s.xRatio + dxRatio,
        yRatio: s.yRatio + dyRatio,
      } : s);
    });
  }, []);

  // Set attached stickers to absolute position using stored offset (no undo push).
  // Called on every onDrag frame AND onDragStop for sticker parents — idempotent, no compounding.
  const setAttachedStickersToParent = useCallback((parentId, parentXRatio, parentYRatio) => {
    setStickers(prev => {
      if (!prev.some(s => s.attachedTo?.id === parentId)) return prev;
      return prev.map(s => s.attachedTo?.id === parentId ? {
        ...s,
        xRatio: parentXRatio + s.attachOffset.dxRatio,
        yRatio: parentYRatio + s.attachOffset.dyRatio,
      } : s);
    });
  }, []);

  // Position AND scale all attached stickers using their proportional layout relative to parent.
  // Used for real-time onDrag AND onResize, and their corresponding stop events on sticker parents.
  // Idempotent — safe to call every animation frame. Falls back to attachOffset for legacy saves.
  const resizeAttachedStickers = useCallback((parentId, parentXRatio, parentYRatio, parentWRatio, parentHRatio) => {
    setStickers(prev => {
      if (!prev.some(s => s.attachedTo?.id === parentId)) return prev;
      return prev.map(s => {
        if (s.attachedTo?.id !== parentId) return s;
        if (s.attachRelative) {
          return {
            ...s,
            xRatio: parentXRatio + s.attachRelative.relX * parentWRatio,
            yRatio: parentYRatio + s.attachRelative.relY * parentHRatio,
            wRatio: s.attachRelative.relW * parentWRatio,
            hRatio: s.attachRelative.relH * parentHRatio,
          };
        }
        // Legacy fallback for saves that predate attachRelative (position-only)
        return {
          ...s,
          xRatio: parentXRatio + (s.attachOffset?.dxRatio ?? 0),
          yRatio: parentYRatio + (s.attachOffset?.dyRatio ?? 0),
        };
      });
    });
  }, []);

  // ─── Layer normalizer (called by cozykawaii's layer management) ───
  const applyNormalizedLayers = useCallback((normalized) => {
    const noteMap     = new Map();
    const stickerMap  = new Map();
    const paperMap    = new Map();
    const calendarMap = new Map();
    const clockMap    = new Map();
    let newRemindersLayer = null;

    for (const item of normalized) {
      switch (item._type) {
        case 'note':      noteMap.set(item.id, item.layer);     break;
        case 'sticker':   stickerMap.set(item.id, item.layer);  break;
        case 'paper':     paperMap.set(item.id, item.layer);    break;
        case 'calendar':  calendarMap.set(item.id, item.layer); break;
        case 'clock':     clockMap.set(item.id, item.layer);    break;
        case 'reminders': newRemindersLayer = item.layer;       break;
      }
    }
    if (noteMap.size)     setNotes(prev => prev.map(n => noteMap.has(n.id)     ? { ...n, layer: noteMap.get(n.id) }     : n));
    if (stickerMap.size)  setStickers(prev => prev.map(s => stickerMap.has(s.id)  ? { ...s, layer: stickerMap.get(s.id) }  : s));
    if (paperMap.size)    setPapers(prev => prev.map(p => paperMap.has(p.id)    ? { ...p, layer: paperMap.get(p.id) }    : p));
    if (calendarMap.size) setCalendars(prev => prev.map(c => calendarMap.has(c.id) ? { ...c, layer: calendarMap.get(c.id) } : c));
    if (clockMap.size)    setClocks(prev => prev.map(c => clockMap.has(c.id)    ? { ...c, layer: clockMap.get(c.id) }    : c));
    if (newRemindersLayer != null) setRemindersLayer(newRemindersLayer);
  }, []);

  // ─── Mount + persistence ──────────────────────────────────────────
  useEffect(() => {
    setMounted(true);

    // Migrate legacy single-key save → per-theme key (one-time)
    try {
      const legacy = localStorage.getItem("cozydesk_state");
      if (legacy && !localStorage.getItem(storageKey(themeName))) {
        localStorage.setItem(storageKey(themeName), legacy);
        localStorage.removeItem("cozydesk_state");
      }
    } catch (_) {}

    loadThemeState(themeName);

    // Safety-net save on page close
    const handleBeforeUnload = () => { saveThemeState(prevThemeRef.current); };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save on every state change (per-theme key)
  useEffect(() => {
    if (!mounted) return;
    saveThemeState(prevThemeRef.current);
  }, [notes, stickers, papers, reminders, themeMode, clocks, calendars,
      calendarEvents, remindersVisible, remindersPos, remindersLayer, mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Notes ────────────────────────────────────────────────────────
  const addNoteAtPosition = (src, xRatio, yRatio) => {
    pushUndo();
    setNotes(prev => [...prev, {
      id: Date.now(), src, xRatio, yRatio,
      wRatio: 180 / dimensions.width,
      hRatio: 180 / dimensions.height,
      text: "", pinned: false,
      layer: getNextLayer(),
    }]);
  };

  const addNote = (src) => addNoteAtPosition(src, 0.3 + Math.random() * 0.15, 0.2 + Math.random() * 0.15);

  const removeNote = (id) => {
    pushUndo();
    setNotes(n => n.filter(x => x.id !== id));
    setStickers(prev => prev.map(s =>
      s.attachedTo?.id === id ? { ...s, attachedTo: null, attachOffset: null } : s
    ));
  };

  const updateNote = (id, data) => {
    pushUndo();
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n;
      let nextWRatio = n.wRatio;
      let nextHRatio = n.hRatio;
      if (data.src && data.width === undefined) {
        nextWRatio = 180 / dimensions.width;
        nextHRatio = 180 / dimensions.height;
      }
      return {
        ...n, ...data,
        xRatio: data.x     !== undefined ? data.x      / dimensions.width  : n.xRatio,
        yRatio: data.y     !== undefined ? data.y      / dimensions.height : n.yRatio,
        wRatio: data.width !== undefined ? data.width  / dimensions.width  : nextWRatio,
        hRatio: data.height!== undefined ? data.height / dimensions.height : nextHRatio,
      };
    }));
  };

  // ─── Stickers ─────────────────────────────────────────────────────
  const addStickerAtPosition = useCallback((sticker, xRatio, yRatio) => {
    pushUndo();
    if (sticker.name.includes("cozyclock") || sticker.name.includes("loficlock") || sticker.name.includes("steampunkclock")) {
      setClocks(prev => [...prev, { id: Date.now(), xRatio, yRatio, sizePreset: 'md', layer: getNextLayer() }]);
      return;
    }
    const isCorkboard = sticker.name.includes("corkboard");
    setStickers(prev => [...prev, {
      id: Date.now(),
      name: sticker.name, src: sticker.src, xRatio, yRatio,
      wRatio: isCorkboard ? 0.38 : 0.11,
      hRatio: isCorkboard ? 0.52 : 0.14,
      backdrop: isCorkboard,
      layer: isCorkboard ? 0 : getNextLayer(),
    }]);
  }, [pushUndo]);

  const removeSticker = (id) => {
    pushUndo();
    setStickers(s => s.filter(x => x.id !== id).map(x =>
      x.attachedTo?.id === id ? { ...x, attachedTo: null, attachOffset: null } : x
    ));
  };

  const updateSticker = (id, data) => {
    pushUndo();
    setStickers(prev => prev.map(s => s.id === id ? {
      ...s,
      xRatio: data.x      / dimensions.width,
      yRatio: data.y      / dimensions.height,
      wRatio: data.width  / dimensions.width,
      hRatio: data.height / dimensions.height,
    } : s));
  };

  // ─── Calendars ────────────────────────────────────────────────────
  const addCalendarAtPosition = (xRatio, yRatio) => {
    if (stateRef.current.calendars.length >= 1) return;
    pushUndo();
    setCalendars(prev => [...prev, { id: Date.now(), xRatio, yRatio, sizePreset: 'md', layer: getNextLayer() }]);
  };

  const removeCalendar = (id) => {
    pushUndo();
    setCalendars(c => c.filter(x => x.id !== id));
  };

  const updateCalendar = (id, data) => {
    pushUndo();
    setCalendars(prev => prev.map(c => c.id === id ? {
      ...c,
      xRatio: data.x / dimensions.width,
      yRatio: data.y / dimensions.height,
    } : c));
  };

  const changeCalendarSize = (id, preset) => {
    pushUndo();
    setCalendars(prev => prev.map(c => c.id === id ? { ...c, sizePreset: preset } : c));
  };

  const addCalendarEvent = (key, event) => {
    pushUndo();
    setCalendarEvents(prev => ({ ...prev, [key]: [...(prev[key] || []), event] }));
  };

  const removeCalendarEvent = (key, idx) => {
    pushUndo();
    setCalendarEvents(prev => ({ ...prev, [key]: (prev[key] || []).filter((_, i) => i !== idx) }));
  };

  // ─── Clocks ───────────────────────────────────────────────────────
  const removeClock = (id) => {
    pushUndo();
    setClocks(c => c.filter(x => x.id !== id));
  };

  const updateClock = (id, data) => {
    pushUndo();
    setClocks(prev => prev.map(c => c.id === id ? {
      ...c,
      xRatio: data.x / dimensions.width,
      yRatio: data.y / dimensions.height,
    } : c));
  };

  const changeClockSize = (id, preset) => {
    pushUndo();
    setClocks(prev => prev.map(c => c.id === id ? { ...c, sizePreset: preset } : c));
  };

  const changeClockFlip = (id) => {
    pushUndo();
    setClocks(prev => prev.map(c => c.id === id ? { ...c, flipped: !c.flipped } : c));
  };

  // ─── Papers (to-do lists) ─────────────────────────────────────────
  const addPaperAtPosition = (xRatio, yRatio) => {
    if (papers.length >= 5) return;
    pushUndo();
    setPapers(prev => [...prev, {
      id: Date.now(), xRatio, yRatio,
      wRatio: 0.18, hRatio: 0.38,
      reminderIds: [], layer: getNextLayer(),
    }]);
  };

  const addTodoList = () => addPaperAtPosition(
    0.35 + Math.random() * 0.25,
    0.15 + Math.random() * 0.2,
  );

  const removePaper = (id) => {
    pushUndo();
    setPapers(p => p.filter(x => x.id !== id));
    setStickers(prev => prev.map(s =>
      s.attachedTo?.id === id ? { ...s, attachedTo: null, attachOffset: null } : s
    ));
  };

  const updatePaper = (id, data) => {
    pushUndo();
    setPapers(prev => prev.map(p => p.id === id ? {
      ...p,
      xRatio: data.x      / dimensions.width,
      yRatio: data.y      / dimensions.height,
      wRatio: data.width  / dimensions.width,
      hRatio: data.height / dimensions.height,
    } : p));
  };

  const sendReminderToDeskPaper = (reminder) => {
    const existing = papers.find(p => p.reminderIds.length < ITEMS_PER_PAPER);
    if (existing) {
      setPapers(prev => prev.map(p => p.id === existing.id
        ? { ...p, reminderIds: [...p.reminderIds, reminder.id] } : p));
    } else {
      setPapers(prev => [...prev, {
        id: Date.now(),
        xRatio: 0.35 + Math.random() * 0.2,
        yRatio: 0.2  + Math.random() * 0.2,
        wRatio: 0.18, hRatio: 0.36,
        reminderIds: [reminder.id], layer: getNextLayer(),
      }]);
    }
  };

  // Adds an inline reminder directly to a specific paper (no undo push — called inside a render callback)
  const addInlineReminder = (rem, paperId) => {
    setReminders(prev => [...prev, rem]);
    setPapers(prev => prev.map(p => p.id === paperId
      ? { ...p, reminderIds: [...p.reminderIds, rem.id] } : p));
  };

  // ─── Reminders ────────────────────────────────────────────────────
  const addReminder = (rem) => {
    pushUndo();
    setReminders(prev => [...prev, rem]);
  };

  const toggleReminder = (remId) => {
    pushUndo();
    setReminders(prev => prev.map(r => r.id === remId ? { ...r, done: !r.done } : r));
  };

  const deleteReminder = (remId) => {
    pushUndo();
    setReminders(prev => prev.filter(r => r.id !== remId));
    setPapers(prev => prev.map(p => ({
      ...p, reminderIds: p.reminderIds.filter(id => id !== remId),
    })));
  };

  const editReminder = (remId, updates) => {
    pushUndo();
    setReminders(prev => prev.map(r => r.id === remId ? { ...r, ...updates } : r));
  };

  const toggleRemindersWidget = useCallback(() => {
    setRemindersVisible(v => !v);
  }, []);

  const updateRemindersPos = useCallback((data) => {
    setRemindersPos({
      xRatio: data.x      / dimensions.width,
      yRatio: data.y      / dimensions.height,
      wRatio: data.width  / dimensions.width,
      hRatio: data.height / dimensions.height,
    });
  }, [dimensions]);

  // ─── Named save slots (10 per theme) ─────────────────────────────
  const slotKey = (theme, slot) => `cozydesk_saved_${theme}_slot_${slot}`;

  const saveToSlot = (slot, name) => {
    const s = stateRef.current;
    try {
      localStorage.setItem(slotKey(themeName, slot), JSON.stringify({
        name: name || `Slot ${slot}`,
        savedAt: new Date().toISOString(),
        notes: s.notes, stickers: s.stickers, papers: s.papers,
        clocks: s.clocks, calendars: s.calendars, calendarEvents: s.calendarEvents,
        reminders: s.reminders, remindersLayer: s.remindersLayer,
        themeMode: s.themeMode, remindersVisible: s.remindersVisible,
        remindersPos: s.remindersPos,
      }));
    } catch (_) {}
  };

  const loadFromSlot = (slot) => {
    try {
      const raw = localStorage.getItem(slotKey(themeName, slot));
      if (!raw) return;
      const d = JSON.parse(raw);
      const ensureLayers = (...arrays) => {
        let counter = 0;
        return arrays.map(arr => (arr || []).map(item => ({
          ...item, layer: item.layer != null ? item.layer : counter++,
        })));
      };
      const [mN, mS, mP, mCL, mCAL] = ensureLayers(d.notes, d.stickers, d.papers, d.clocks, d.calendars);
      setNotes(mN.length       ? mN   : []);
      setStickers(mS.length    ? mS   : []);
      setPapers(mP.length      ? mP   : []);
      setReminders(d.reminders || []);
      setClocks(mCL.length     ? mCL  : []);
      setCalendars(mCAL.length ? mCAL : []);
      setCalendarEvents(d.calendarEvents || {});
      if (d.themeMode)             setThemeMode(d.themeMode);
      if (d.remindersVisible != null) setRemindersVisible(d.remindersVisible);
      if (d.remindersPos)          setRemindersPos(d.remindersPos);
      if (d.remindersLayer != null)  setRemindersLayer(d.remindersLayer);
      setUndoStack([]);
      setRedoStack([]);
    } catch (e) {
      console.warn('CozyDesk: could not load slot', slot, e);
    }
  };

  // ─── Desk-wide actions ────────────────────────────────────────────
  const handleDeskDrop = useCallback((e) => {
    e.preventDefault();
    let data;
    try { data = JSON.parse(e.dataTransfer.getData('application/json')); } catch { return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top)  / rect.height;

    if      (data.type === 'todolist')  addPaperAtPosition(xRatio, yRatio);
    else if (data.type === 'note')      addNoteAtPosition(data.src, xRatio, yRatio);
    else if (data.type === 'calendar')  addCalendarAtPosition(xRatio, yRatio);
    else                                addStickerAtPosition(data, xRatio, yRatio);
  }, [addStickerAtPosition]);

  const handleTidyDesk = () => {
    pushUndo();
    setNotes(prev => prev.map((n, i) => {
      const cols = Math.floor((dimensions.width * 0.7) / (dimensions.width * 0.16));
      const col  = i % cols;
      const row  = Math.floor(i / cols);
      return { ...n, xRatio: 0.2 + col * 0.16, yRatio: 0.1 + row * 0.24 };
    }));
  };

  const clearDesk = () => {
    pushUndo();
    setNotes([]); setStickers([]); setPapers([]);
    setReminders([]); setClocks([]); setCalendars([]); setCalendarEvents({});
    try { localStorage.removeItem(storageKey(themeName)); } catch (_) {}
  };

  return {
    // mounting
    mounted,
    // theme display mode
    themeMode, setThemeMode,
    // item state
    notes, stickers, papers, clocks, calendars, calendarEvents, reminders,
    // reminders widget
    remindersVisible, remindersPos, remindersLayer,
    // undo/redo
    undoStack, redoStack, handleUndo, handleRedo,
    // layer support
    stateRef, applyNormalizedLayers,
    // notes
    addNote, addNoteAtPosition, removeNote, updateNote,
    // stickers
    addStickerAtPosition, removeSticker, updateSticker,
    attachSticker, detachSticker, moveAttachedStickers, setAttachedStickersToParent, resizeAttachedStickers,
    // calendars
    addCalendarAtPosition, removeCalendar, updateCalendar, changeCalendarSize,
    addCalendarEvent, removeCalendarEvent,
    // clocks
    removeClock, updateClock, changeClockSize, changeClockFlip,
    // papers
    addPaperAtPosition, addTodoList, removePaper, updatePaper,
    sendReminderToDeskPaper, addInlineReminder,
    // reminders
    addReminder, toggleReminder, deleteReminder, editReminder,
    toggleRemindersWidget, updateRemindersPos,
    // saved slots
    saveToSlot, loadFromSlot,
    // desk-wide
    handleDeskDrop, handleTidyDesk, clearDesk,
  };
}
