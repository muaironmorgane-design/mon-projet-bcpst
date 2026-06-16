import { useEffect, useMemo, useState } from "react";

type EventItem = {
  id: string;
  hour: number;
  endHour?: number;
  title: string;
  color: string;
  done: boolean;
};

const STORAGE = "khube_planning_v1";

const COLORS = [
  { id: "green", hex: "#8da894", label: "Vert" },
  { id: "blue", hex: "#3b82f6", label: "Bleu" },
  { id: "amber", hex: "#f59e0b", label: "Ambre" },
  { id: "red", hex: "#ef4444", label: "Rouge" },
  { id: "purple", hex: "#a855f7", label: "Violet" },
  { id: "pink", hex: "#ec4899", label: "Rose" },
  { id: "teal", hex: "#14b8a6", label: "Turquoise" },
  { id: "slate", hex: "#64748b", label: "Gris" },
];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function normalizeEvent(ev: Partial<EventItem> & { id: string; hour: number; title: string }): EventItem {
  return {
    id: ev.id,
    hour: ev.hour,
    endHour: ev.endHour,
    title: ev.title,
    color: ev.color ?? "#8da894",
    done: ev.done ?? false,
  };
}

function loadStore(): Record<string, EventItem[]> {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Partial<EventItem>[]>;
    const result: Record<string, EventItem[]> = {};
    for (const [date, events] of Object.entries(parsed)) {
      result[date] = (events ?? []).map((e) => normalizeEvent(e as EventItem));
    }
    return result;
  } catch {
    return {};
  }
}

export default function Planning() {
  const [view, setView] = useState<"month" | "week">("month");
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [store, setStore] = useState<Record<string, EventItem[]>>(loadStore);
  const [newColor, setNewColor] = useState(COLORS[0].hex);

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(store));
  }, [store]);

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const first = new Date(year, month, 1);
    const startDay = (first.getDay() + 6) % 7; // Monday start
    const length = new Date(year, month + 1, 0).getDate();
    const cells: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < startDay; i++) {
      cells.push({ date: new Date(year, month, i - startDay + 1), inMonth: false });
    }
    for (let d = 1; d <= length; d++) cells.push({ date: new Date(year, month, d), inMonth: true });
    while (cells.length % 7 !== 0) {
      cells.push({ date: new Date(year, month, length + (cells.length - startDay - length) + 1), inMonth: false });
    }
    return cells;
  }, [currentMonth]);

  const weekDays = useMemo(() => {
    const sel = new Date(selectedDate);
    const dow = sel.getDay();
    const monday = new Date(sel);
    monday.setDate(sel.getDate() - ((dow + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  function prevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }

  function addEvent(date: string, hour: number, title: string, color = newColor) {
    if (!title.trim()) return;
    const ev = normalizeEvent({ id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, hour, title: title.trim(), color });
    setStore((s) => ({ ...s, [date]: [...(s[date] || []), ev].sort((a, b) => a.hour - b.hour) }));
  }

  function removeEvent(date: string, id: string) {
    setStore((s) => ({ ...s, [date]: (s[date] || []).filter((e) => e.id !== id) }));
  }

  function toggleDone(date: string, id: string) {
    setStore((s) => ({
      ...s,
      [date]: (s[date] || []).map((e) => (e.id === id ? { ...e, done: !e.done } : e)),
    }));
  }

  function updateEvent(date: string, id: string, patch: Partial<EventItem>) {
    setStore((s) => ({
      ...s,
      [date]: (s[date] || []).map((e) => (e.id === id ? { ...e, ...patch } : e)).sort((a, b) => a.hour - b.hour),
    }));
  }

  function moveEvent(fromDate: string, toDate: string, id: string, toHour: number) {
    setStore((s) => {
      const from = (s[fromDate] || []).slice();
      const idx = from.findIndex((x) => x.id === id);
      if (idx === -1) return s;
      const ev = { ...from[idx], hour: toHour };
      from.splice(idx, 1);
      const to = (s[toDate] || []).slice();
      to.push(ev);
      to.sort((a, b) => a.hour - b.hour);
      return { ...s, [fromDate]: from, [toDate]: to };
    });
  }

  function onDragStart(e: React.DragEvent, date: string, id: string) {
    e.dataTransfer.setData("text/plain", JSON.stringify({ date, id }));
    e.dataTransfer.effectAllowed = "move";
  }

  function onDropHour(e: React.DragEvent, toDate: string, toHour: number) {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      moveEvent(data.date, toDate, data.id, toHour);
    } catch { /* ignore */ }
  }

  function onDropDay(e: React.DragEvent, toDate: string) {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const fromList = store[data.date] || [];
      const ev = fromList.find((x) => x.id === data.id);
      moveEvent(data.date, toDate, data.id, ev?.hour ?? 9);
    } catch { /* ignore */ }
  }

  const selectedEvents = store[selectedDate] || [];
  const today = formatDate(new Date());

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1b3224]">📅 Emploi du temps</h2>
          <p className="text-sm text-slate-500">Vue mensuelle type Google Agenda — clique sur un jour pour gérer tes plages horaires.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView("month")} className={`px-4 py-2 rounded-xl text-xs font-semibold ${view === "month" ? "bg-[#1b3224] text-white" : "bg-[#f3f7f5] border border-[#cae0d4]"}`}>Mois</button>
          <button onClick={() => setView("week")} className={`px-4 py-2 rounded-xl text-xs font-semibold ${view === "week" ? "bg-[#1b3224] text-white" : "bg-[#f3f7f5] border border-[#cae0d4]"}`}>Semaine</button>
        </div>
      </div>

      {view === "month" ? (
        <div className="grid md:grid-cols-[1fr_420px] gap-6">
          <div className="bg-white p-6 rounded-3xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold capitalize">{currentMonth.toLocaleString("fr-FR", { month: "long", year: "numeric" })}</div>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="px-3 py-1 rounded bg-[#f3f7f5]">◀</button>
                <button onClick={() => { setCurrentMonth(startOfMonth(new Date())); setSelectedDate(today); }} className="px-3 py-1 rounded bg-[#e3eee8] text-xs font-semibold">Aujourd'hui</button>
                <button onClick={nextMonth} className="px-3 py-1 rounded bg-[#f3f7f5]">▶</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs text-slate-500 mb-2 text-center font-semibold">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((cell) => {
                const key = formatDate(cell.date);
                const evs = store[key] || [];
                const isSelected = selectedDate === key;
                const isToday = key === today;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedDate(key)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDropDay(e, key)}
                    className={`min-h-[90px] p-1.5 rounded-xl border cursor-pointer transition ${
                      !cell.inMonth ? "bg-[#f7faf7] opacity-50" : "bg-white hover:bg-[#f8faf8]"
                    } ${isSelected ? "ring-2 ring-[#8da894]" : ""} ${isToday ? "border-[#8da894] border-2" : "border-[#e3eee8]"}`}
                  >
                    <div className={`text-xs font-bold mb-1 ${isToday ? "text-[#1b3224]" : "text-slate-600"}`}>{cell.date.getDate()}</div>
                    <div className="space-y-0.5 overflow-hidden">
                      {evs.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          className={`text-[9px] px-1 py-0.5 rounded truncate text-white font-medium ${ev.done ? "opacity-50 line-through" : ""}`}
                          style={{ backgroundColor: ev.done ? "#94a3b8" : ev.color }}
                        >
                          {ev.hour}h {ev.title}
                        </div>
                      ))}
                      {evs.length > 3 && <div className="text-[9px] text-slate-400">+{evs.length - 3} autres</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DayPanel
            selectedDate={selectedDate}
            events={selectedEvents}
            newColor={newColor}
            setNewColor={setNewColor}
            onAdd={(hour, title) => addEvent(selectedDate, hour, title)}
            onRemove={(id) => removeEvent(selectedDate, id)}
            onToggleDone={(id) => toggleDone(selectedDate, id)}
            onUpdate={(id, patch) => updateEvent(selectedDate, id, patch)}
            onDragStart={(e, id) => onDragStart(e, selectedDate, id)}
            onDropHour={(e, hour) => onDropHour(e, selectedDate, hour)}
          />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-3xl border shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold">Semaine du {weekDays[0].toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</div>
            <div className="flex gap-2">
              <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 7); setSelectedDate(formatDate(d)); }} className="px-3 py-1 rounded bg-[#f3f7f5]">◀</button>
              <button onClick={() => setSelectedDate(today)} className="px-3 py-1 rounded bg-[#e3eee8] text-xs font-semibold">Aujourd'hui</button>
              <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 7); setSelectedDate(formatDate(d)); }} className="px-3 py-1 rounded bg-[#f3f7f5]">▶</button>
            </div>
          </div>
          <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 min-w-[700px]">
            <div />
            {weekDays.map((d) => {
              const key = formatDate(d);
              return (
                <div key={key} className={`text-center text-xs font-semibold p-2 rounded-t-xl ${key === today ? "bg-[#8da894] text-white" : "bg-[#f3f7f5] text-[#1b3224]"}`}>
                  {d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })}
                </div>
              );
            })}
            {Array.from({ length: 16 }).map((_, i) => {
              const hour = 7 + i;
              return (
                <div key={hour} className="contents">
                  <div className="text-[10px] text-slate-400 text-right pr-2 pt-2">{hour}:00</div>
                  {weekDays.map((d) => {
                    const key = formatDate(d);
                    const evs = (store[key] || []).filter((e) => e.hour === hour);
                    return (
                      <div
                        key={`${key}-${hour}`}
                        className="min-h-[44px] border border-[#eef3ee] rounded-lg p-1 bg-[#fafafa]"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => onDropHour(e, key, hour)}
                        onClick={() => setSelectedDate(key)}
                      >
                        {evs.map((ev) => (
                          <div
                            key={ev.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, key, ev.id)}
                            className={`text-[9px] px-1 py-0.5 rounded mb-0.5 text-white cursor-grab ${ev.done ? "opacity-50 line-through" : ""}`}
                            style={{ backgroundColor: ev.done ? "#94a3b8" : ev.color }}
                          >
                            <button onClick={(e) => { e.stopPropagation(); toggleDone(key, ev.id); }} className="mr-0.5">{ev.done ? "✓" : "○"}</button>
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DayPanel({
  selectedDate, events, newColor, setNewColor, onAdd, onRemove, onToggleDone, onUpdate, onDragStart, onDropHour,
}: {
  selectedDate: string;
  events: EventItem[];
  newColor: string;
  setNewColor: (c: string) => void;
  onAdd: (hour: number, title: string) => void;
  onRemove: (id: string) => void;
  onToggleDone: (id: string) => void;
  onUpdate: (id: string, patch: Partial<EventItem>) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDropHour: (e: React.DragEvent, hour: number) => void;
}) {
  return (
    <div className="bg-white p-6 rounded-3xl border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold capitalize">{new Date(selectedDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {COLORS.map((c) => (
          <button key={c.id} onClick={() => setNewColor(c.hex)} className={`w-6 h-6 rounded-full border-2 transition ${newColor === c.hex ? "border-[#1b3224] scale-110" : "border-transparent"}`} style={{ backgroundColor: c.hex }} title={c.label} />
        ))}
      </div>

      <div className="space-y-2 max-h-[70vh] overflow-y-auto">
        {Array.from({ length: 16 }).map((_, i) => {
          const hour = 7 + i;
          const evHere = events.filter((e) => e.hour === hour);
          return (
            <div key={hour} className="flex items-start gap-3" onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDropHour(e, hour)}>
              <div className="w-12 text-xs text-slate-500 pt-2 shrink-0">{hour}:00</div>
              <div className="flex-1 min-h-[44px] rounded-lg border p-2 bg-[#f8faf8]">
                {evHere.length === 0 ? (
                  <EmptyHourAdd hour={hour} color={newColor} onAdd={(title) => onAdd(hour, title)} />
                ) : (
                  <div className="space-y-2">
                    {evHere.map((ev) => (
                      <div
                        key={ev.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, ev.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-white text-sm cursor-grab ${ev.done ? "opacity-60" : ""}`}
                        style={{ backgroundColor: ev.done ? "#94a3b8" : ev.color }}
                      >
                        <button onClick={() => onToggleDone(ev.id)} className="shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">{ev.done ? "✓" : "○"}</button>
                        <span className={`flex-1 ${ev.done ? "line-through" : ""}`}>{ev.title}</span>
                        <select
                          value={ev.color}
                          onChange={(e) => onUpdate(ev.id, { color: e.target.value })}
                          className="text-[10px] rounded px-1 py-0.5 text-[#1b3224] bg-white/80"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {COLORS.map((c) => <option key={c.id} value={c.hex}>{c.label}</option>)}
                        </select>
                        <button onClick={() => onRemove(ev.id)} className="text-xs opacity-80 hover:opacity-100">✕</button>
                      </div>
                    ))}
                    <EmptyHourAdd hour={hour} color={newColor} onAdd={(title) => onAdd(hour, title)} compact />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyHourAdd({ hour, color, onAdd, compact }: { hour: number; color: string; onAdd: (title: string) => void; compact?: boolean }) {
  const [val, setVal] = useState("");
  return (
    <div className={`flex items-center gap-2 ${compact ? "mt-1" : ""}`}>
      <input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { onAdd(val); setVal(""); } }} placeholder="Nouvelle action…" className="flex-1 p-2 text-sm rounded border bg-white" />
      <button onClick={() => { if (val.trim()) { onAdd(val); setVal(""); } }} className="px-3 py-1 rounded text-white text-sm shrink-0" style={{ backgroundColor: color }}>+</button>
    </div>
  );
}

// Export for home dashboard
export function getPlanningEvents(): Record<string, EventItem[]> {
  return loadStore();
}

export type { EventItem };
