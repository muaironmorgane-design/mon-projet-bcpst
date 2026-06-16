import { useState, useEffect } from "react";

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6h to 23h
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const SHORT_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const CELL_HEIGHT = 48;

// All months June 2026 → July 2027
const MONTHS = [
  { label: "Juin 2026", year: 2026, month: 5 },
  { label: "Juillet 2026", year: 2026, month: 6 },
  { label: "Août 2026", year: 2026, month: 7 },
  { label: "Septembre 2026", year: 2026, month: 8 },
  { label: "Octobre 2026", year: 2026, month: 9 },
  { label: "Novembre 2026", year: 2026, month: 10 },
  { label: "Décembre 2026", year: 2026, month: 11 },
  { label: "Janvier 2027", year: 2027, month: 0 },
  { label: "Février 2027", year: 2027, month: 1 },
  { label: "Mars 2027", year: 2027, month: 2 },
  { label: "Avril 2027", year: 2027, month: 3 },
  { label: "Mai 2027", year: 2027, month: 4 },
  { label: "Juin 2027", year: 2027, month: 5 },
  { label: "Juillet 2027", year: 2027, month: 6 },
];

// Get all Monday-starting weeks for a given month
function getWeeksForMonth(year: number, month: number): { label: string; weekKey: string; startDate: Date }[] {
  const weeks: { label: string; weekKey: string; startDate: Date }[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Find the Monday on or before the first day of the month
  let cursor = new Date(firstDay);
  const dayOfWeek = cursor.getDay();
  const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  cursor.setDate(cursor.getDate() + offset);

  while (cursor <= lastDay) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    const weekKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, "0")}-${String(weekStart.getDate()).padStart(2, "0")}`;

    weeks.push({
      label: `${fmt(weekStart)} → ${fmt(weekEnd)}`,
      weekKey,
      startDate: weekStart,
    });

    cursor.setDate(cursor.getDate() + 7);
  }
  return weeks;
}

type EventCategory = "cours" | "travail" | "ds" | "loisirs" | "concours";

interface CalEvent {
  id: string;
  title: string;
  category: EventCategory;
  startHour: number;
  endHour: number;
  dayIndex: number;
}

const CATEGORY_STYLES: Record<EventCategory, { bg: string; border: string; text: string; dot: string }> = {
  cours: { bg: "bg-[#e3eee8]", border: "border-[#8da894]", text: "text-[#1b3224]", dot: "bg-[#8da894]" },
  travail: { bg: "bg-emerald-50", border: "border-emerald-400", text: "text-emerald-900", dot: "bg-emerald-500" },
  ds: { bg: "bg-amber-50", border: "border-amber-400", text: "text-amber-900", dot: "bg-amber-500" },
  loisirs: { bg: "bg-indigo-50", border: "border-indigo-400", text: "text-indigo-900", dot: "bg-indigo-500" },
  concours: { bg: "bg-red-50", border: "border-red-400", text: "text-red-900", dot: "bg-red-500" },
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  cours: "🔬 Cours / TP",
  travail: "📚 Travail Perso",
  ds: "📋 Khôlle / DS",
  loisirs: "🌳 Repos / Loisirs",
  concours: "🎯 Concours",
};

function loadEventsForWeek(weekKey: string): CalEvent[] {
  try {
    const raw = localStorage.getItem(`khube_cal_week_${weekKey}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveEventsForWeek(weekKey: string, events: CalEvent[]) {
  localStorage.setItem(`khube_cal_week_${weekKey}`, JSON.stringify(events));
}

interface EventModalProps {
  defaultDay: number;
  defaultHour: number;
  event?: CalEvent;
  onSave: (ev: CalEvent) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

function EventModal({ defaultDay, defaultHour, event, onSave, onDelete, onClose }: EventModalProps) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [category, setCategory] = useState<EventCategory>(event?.category ?? "cours");
  const [dayIndex, setDayIndex] = useState(event?.dayIndex ?? defaultDay);
  const [startHour, setStartHour] = useState(event?.startHour ?? defaultHour);
  const [endHour, setEndHour] = useState(event?.endHour ?? Math.min(defaultHour + 2, 23));

  function handleSave() {
    if (!title.trim()) return;
    onSave({
      id: event?.id ?? `ev_${Date.now()}`,
      title: title.trim(),
      category,
      dayIndex,
      startHour,
      endHour: Math.max(endHour, startHour + 1),
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-serif text-xl font-bold text-[#1b3224]">{event ? "Modifier l'événement" : "Ajouter un événement"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Titre *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] focus:ring-2 focus:ring-[#a3caa0] outline-none" placeholder="Ex: CM Biologie, Révision Chimie Orga…" autoFocus onKeyDown={(e) => e.key === "Enter" && handleSave()} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Jour</label>
            <select value={dayIndex} onChange={(e) => setDayIndex(Number(e.target.value))} className="w-full text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] focus:ring-2 focus:ring-[#a3caa0] outline-none">
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Début</label>
              <select value={startHour} onChange={(e) => setStartHour(Number(e.target.value))} className="w-full text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
                {HOURS.map((h) => <option key={h} value={h}>{h}h00</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Fin</label>
              <select value={endHour} onChange={(e) => setEndHour(Number(e.target.value))} className="w-full text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
                {HOURS.filter((h) => h > startHour).map((h) => <option key={h} value={h}>{h}h00</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-2">Catégorie</label>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(CATEGORY_LABELS) as EventCategory[]).map((cat) => {
                const style = CATEGORY_STYLES[cat];
                return (
                  <button key={cat} onClick={() => setCategory(cat)} className={`flex items-center gap-3 p-2.5 rounded-xl text-xs font-medium border-2 transition ${style.bg} ${style.text} ${category === cat ? `${style.border} ring-2 ring-offset-1 ${style.border}` : "border-transparent opacity-60 hover:opacity-100"}`}>
                    <span className={`w-3 h-3 rounded-full ${style.dot} shrink-0`} />
                    {CATEGORY_LABELS[cat]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          {event && onDelete && (
            <button onClick={() => { onDelete(event.id); onClose(); }} className="px-4 py-2.5 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-50 transition">🗑 Supprimer</button>
          )}
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition">Annuler</button>
          <button onClick={handleSave} disabled={!title.trim()} className="flex-1 py-2.5 bg-[#8da894] text-white text-xs font-semibold rounded-xl hover:bg-[#5c7d67] transition shadow-sm disabled:opacity-40">💾 Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

export default function EmploiDuTemps() {
  // Find the current month index
  const defaultMonthIdx = (() => {
    const now = new Date();
    const idx = MONTHS.findIndex((m) => m.year === now.getFullYear() && m.month === now.getMonth());
    return idx >= 0 ? idx : 0;
  })();

  const [monthIdx, setMonthIdx] = useState(defaultMonthIdx);
  const [weekIdx, setWeekIdx] = useState(0);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [modal, setModal] = useState<{ day: number; hour: number; event?: CalEvent } | null>(null);

  const { year, month } = MONTHS[monthIdx];
  const weeks = getWeeksForMonth(year, month);
  const safeWeekIdx = Math.min(weekIdx, weeks.length - 1);
  const currentWeek = weeks[safeWeekIdx];

  // Load events whenever the week changes
  useEffect(() => {
    if (currentWeek) {
      setEvents(loadEventsForWeek(currentWeek.weekKey));
    }
  }, [currentWeek?.weekKey]);

  // Reset week index when month changes
  useEffect(() => {
    // Try to find the week containing today
    const now = new Date();
    const weeks = getWeeksForMonth(MONTHS[monthIdx].year, MONTHS[monthIdx].month);
    const todayKey = now.toISOString().split("T")[0];
    const todayWeekIdx = weeks.findIndex((w) => {
      const end = new Date(w.startDate);
      end.setDate(end.getDate() + 6);
      return w.startDate <= now && now <= end;
    });
    setWeekIdx(todayWeekIdx >= 0 ? todayWeekIdx : 0);
  }, [monthIdx]);

  function saveAndUpdateEvents(newEvents: CalEvent[]) {
    setEvents(newEvents);
    saveEventsForWeek(currentWeek.weekKey, newEvents);
  }

  function handleSave(ev: CalEvent) {
    const updated = [...events.filter((e) => e.id !== ev.id), ev];
    saveAndUpdateEvents(updated);
    setModal(null);
  }

  function handleDelete(id: string) {
    saveAndUpdateEvents(events.filter((e) => e.id !== id));
  }

  function getEventsForCell(dayIndex: number, hour: number) {
    return events.filter((e) => e.dayIndex === dayIndex && e.startHour === hour);
  }

  function isOccupied(dayIndex: number, hour: number) {
    return events.some((e) => e.dayIndex === dayIndex && hour > e.startHour && hour < e.endHour);
  }

  // Get the actual date for each day of the selected week
  function getDayDate(dayIndex: number): Date {
    const d = new Date(currentWeek.startDate);
    d.setDate(d.getDate() + dayIndex);
    return d;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 border-b border-[#e3eee8] pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1b3224]">Emploi du Temps — {MONTHS[monthIdx].label}</h2>
            <p className="text-sm text-slate-500">Cliquez sur un créneau pour ajouter · sur un événement pour modifier.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {(Object.keys(CATEGORY_LABELS) as EventCategory[]).map((cat) => {
              const style = CATEGORY_STYLES[cat];
              return (
                <span key={cat} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${style.bg} ${style.text} border ${style.border} font-medium`}>
                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  {CATEGORY_LABELS[cat]}
                </span>
              );
            })}
          </div>
        </div>

        {/* Month selector */}
        <div className="overflow-x-auto pb-2 mb-4">
          <div className="flex gap-2 min-w-max">
            {MONTHS.map((m, i) => (
              <button
                key={i}
                onClick={() => setMonthIdx(i)}
                className={`month-pill ${monthIdx === i ? "active" : ""}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Week selector */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => {
              if (safeWeekIdx > 0) setWeekIdx(safeWeekIdx - 1);
              else if (monthIdx > 0) { setMonthIdx(monthIdx - 1); }
            }}
            disabled={safeWeekIdx === 0 && monthIdx === 0}
            className="w-8 h-8 rounded-full bg-[#f3f7f5] hover:bg-[#e3eee8] flex items-center justify-center text-[#1b3224] font-bold disabled:opacity-30 transition"
          >‹</button>
          <div className="flex gap-2 overflow-x-auto flex-1">
            {weeks.map((w, i) => (
              <button
                key={w.weekKey}
                onClick={() => setWeekIdx(i)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${safeWeekIdx === i ? "bg-[#1b3224] text-white border-[#1b3224]" : "bg-[#f3f7f5] text-[#1b3224] border-[#cae0d4] hover:bg-[#e3eee8]"}`}
              >
                {w.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (safeWeekIdx < weeks.length - 1) setWeekIdx(safeWeekIdx + 1);
              else if (monthIdx < MONTHS.length - 1) { setMonthIdx(monthIdx + 1); setWeekIdx(0); }
            }}
            disabled={safeWeekIdx === weeks.length - 1 && monthIdx === MONTHS.length - 1}
            className="w-8 h-8 rounded-full bg-[#f3f7f5] hover:bg-[#e3eee8] flex items-center justify-center text-[#1b3224] font-bold disabled:opacity-30 transition"
          >›</button>
        </div>

        {/* Calendar grid */}
        <div className="overflow-x-auto">
          <div style={{ minWidth: 700 }}>
            {/* Header row with dates */}
            <div className="grid gap-0" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
              <div className="h-12 border-b border-[#e3eee8]" />
              {SHORT_DAYS.map((d, i) => {
                const dayDate = getDayDate(i);
                dayDate.setHours(0, 0, 0, 0);
                const isToday = dayDate.getTime() === today.getTime();
                return (
                  <div key={d} className={`h-12 flex flex-col items-center justify-center rounded-t-lg border-b border-[#e3eee8] ${i >= 5 ? "bg-[#f3f7f5]" : ""} ${isToday ? "bg-[#e3eee8]" : ""}`}>
                    <span className={`text-[10px] font-bold ${i >= 5 ? "text-[#8da894]" : "text-[#1b3224]"} ${isToday ? "text-[#c49b80]" : ""}`}>{d}</span>
                    <span className={`text-[11px] font-semibold ${isToday ? "text-[#c49b80] bg-[#c49b80]/10 rounded-full px-1.5" : "text-slate-400"}`}>
                      {dayDate.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Hour rows */}
            {HOURS.map((hour) => (
              <div key={hour} className="grid gap-0" style={{ gridTemplateColumns: "64px repeat(7, 1fr)", height: CELL_HEIGHT }}>
                <div className="flex items-start justify-end pr-3 pt-1 border-r border-[#e3eee8]">
                  <span className="text-[11px] text-slate-400 font-semibold">{hour}h</span>
                </div>
                {DAYS.map((_, dayIdx) => {
                  const eventsHere = getEventsForCell(dayIdx, hour);
                  const occupied = isOccupied(dayIdx, hour);
                  const dayDate = getDayDate(dayIdx);
                  dayDate.setHours(0, 0, 0, 0);
                  const isToday = dayDate.getTime() === today.getTime();

                  return (
                    <div
                      key={dayIdx}
                      className={`cal-hour-slot border-r border-[#e3eee8] relative ${occupied ? "pointer-events-none" : ""} ${isToday ? "bg-[#f3f7f5]/50" : ""}`}
                      style={{ height: CELL_HEIGHT }}
                      onClick={() => !occupied && !eventsHere.length && setModal({ day: dayIdx, hour })}
                    >
                      {!occupied && !eventsHere.length && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="text-[#8da894] text-xl font-light">+</span>
                        </div>
                      )}
                      {eventsHere.map((ev) => {
                        const style = CATEGORY_STYLES[ev.category];
                        const height = (ev.endHour - ev.startHour) * CELL_HEIGHT - 4;
                        return (
                          <div
                            key={ev.id}
                            onClick={(e) => { e.stopPropagation(); setModal({ day: dayIdx, hour, event: ev }); }}
                            className={`absolute left-1 right-1 top-1 rounded-lg border-l-[3px] px-1.5 py-1 cursor-pointer z-10 overflow-hidden ${style.bg} ${style.border} ${style.text} hover:opacity-85 transition-opacity shadow-sm`}
                            style={{ height, pointerEvents: "auto" }}
                          >
                            <p className="text-[10px] font-bold leading-tight truncate">{ev.title}</p>
                            <p className="text-[9px] opacity-70">{ev.startHour}h – {ev.endHour}h</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400 text-center">Chaque semaine garde ses propres événements · Total cette semaine : <strong>{events.length}</strong> événement(s)</p>
      </div>

      {modal && (
        <EventModal
          defaultDay={modal.day}
          defaultHour={modal.hour}
          event={modal.event}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
