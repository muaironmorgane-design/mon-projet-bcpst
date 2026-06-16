import { useState } from "react";

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
  { label: "Avril 2027", year: 2027, month: 3, isEcrits: true },
  { label: "Mai 2027", year: 2027, month: 4 },
  { label: "Juin 2027", year: 2027, month: 5, isOraux: true },
  { label: "Juillet 2027", year: 2027, month: 6, isOraux: true },
];

type DayType = "cours" | "travail" | "ds" | "loisirs" | "vide" | "concours";

interface DayData {
  type: DayType;
  text: string;
  completed?: boolean;
}

function getDayKey(year: number, month: number, day: number) {
  return `khube_cal_${year}_${month}_${day}`;
}

function getDayData(year: number, month: number, day: number): DayData {
  const raw = localStorage.getItem(getDayKey(year, month, day));
  if (raw) {
    try { return JSON.parse(raw); } catch { }
  }
  return { type: "vide", text: "", completed: false };
}

function saveDayData(year: number, month: number, day: number, data: DayData) {
  localStorage.setItem(getDayKey(year, month, day), JSON.stringify(data));
}

function getDayEvents(year: number, month: number, day: number) {
  try {
    const raw = localStorage.getItem(`${getDayKey(year, month, day)}_events`);
    if (raw) return JSON.parse(raw) as { id: string; title: string; hour: number; done: boolean }[];
  } catch {}
  return [];
}

function saveDayEvents(year: number, month: number, day: number, events: { id: string; title: string; hour: number; done: boolean }[]) {
  localStorage.setItem(`${getDayKey(year, month, day)}_events`, JSON.stringify(events));
}

const DAY_TYPE_STYLES: Record<DayType, string> = {
  cours: "bg-[#e3eee8] border-[#a3caa0] text-[#1b3224]",
  travail: "bg-emerald-50 border-emerald-300 text-emerald-900",
  ds: "bg-amber-50 border-amber-300 text-amber-900",
  loisirs: "bg-indigo-50 border-indigo-300 text-indigo-900",
  vide: "bg-slate-50 border-slate-200 text-slate-400",
  concours: "bg-red-50 border-red-300 text-red-900",
};

const TYPE_LABELS: Record<DayType, string> = {
  cours: "🔬 Cours/TP",
  travail: "📚 Travail Perso",
  ds: "📋 Khôlle/DS",
  loisirs: "🌳 Repos",
  concours: "🎯 Concours",
  vide: "⬜ Vide",
};

interface DayModalProps {
  year: number;
  month: number;
  day: number;
  onClose: () => void;
  onSave: () => void;
}

function DayModal({ year, month, day, onClose, onSave }: DayModalProps) {
  const existing = getDayData(year, month, day);
  const [text, setText] = useState(existing.text);
  const [type, setType] = useState<DayType>(existing.type);
  const [completed, setCompleted] = useState(existing.completed ?? false);
  const [events, setEvents] = useState(() => getDayEvents(year, month, day));
  const [newEvent, setNewEvent] = useState({ title: "", hour: 8 });

  const date = new Date(year, month, day);
  const label = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  function save() {
    saveDayData(year, month, day, { type, text: text.trim(), completed });
    saveDayEvents(year, month, day, events);
    onSave();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-7 w-[90%] max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-xl font-bold text-[#1b3224] capitalize">{label}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Description de la journée :</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] focus:ring-2 focus:ring-[#a3caa0] outline-none resize-none"
              placeholder="Ex: 🔬 Cours chimie orga + 📚 Révision chapitre 3 bio…"
            />
          </div>
          <div className="rounded-2xl border border-[#e3eee8] bg-[#f8faf8] p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-[0.18em]">Suivi d'actions</p>
                <p className="text-[11px] text-slate-500">Ajoute des actions horaires et coche celles que tu as faites.</p>
              </div>
              <button onClick={() => setCompleted((prev) => !prev)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${completed ? "bg-[#8da894] text-white" : "bg-white text-slate-700 border border-[#cae0d4]"}`}>
                {completed ? "✓ Journée complète" : "Marquer comme fait"}
              </button>
            </div>
            <div className="space-y-3">
              {events.map((event, index) => (
                <div key={event.id} className="rounded-2xl border border-[#d7e5da] bg-white p-3 space-y-3">
                  <div className="flex items-start gap-3">
                    <button onClick={() => setEvents((prev) => prev.map((e) => e.id === event.id ? { ...e, done: !e.done } : e))} className={`w-9 h-9 rounded-full border flex items-center justify-center ${event.done ? "bg-[#8da894] text-white" : "bg-white text-slate-500 border-[#cbd5e1]"}`}>
                      ✓
                    </button>
                    <div className="flex-1 min-w-0 space-y-2">
                      <input
                        value={event.title}
                        onChange={(e) => setEvents((prev) => prev.map((item) => item.id === event.id ? { ...item, title: e.target.value } : item))}
                        className={`w-full text-sm p-3 rounded-2xl border ${event.done ? "border-slate-200 bg-slate-50 text-slate-400 line-through" : "border-[#cae0d4] bg-[#f8faf8] text-[#1b3224]"}`}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={event.hour}
                          onChange={(e) => setEvents((prev) => prev.map((item) => item.id === event.id ? { ...item, hour: Number(e.target.value) } : item))}
                          className="w-full text-xs p-3 rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none"
                        >
                          {Array.from({ length: 18 }, (_, idx) => idx + 6).map((h) => (
                            <option key={h} value={h}>{h}h</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEvents((prev) => {
                              const next = [...prev];
                              if (index > 0) {
                                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                              }
                              return next;
                            })}
                            className="flex-1 py-2 rounded-2xl bg-[#f3f7f5] text-[11px] font-semibold text-[#1b3224] hover:bg-[#e3eee8] transition"
                          >↑ Monter</button>
                          <button
                            onClick={() => setEvents((prev) => {
                              const next = [...prev];
                              if (index < next.length - 1) {
                                [next[index + 1], next[index]] = [next[index], next[index + 1]];
                              }
                              return next;
                            })}
                            className="flex-1 py-2 rounded-2xl bg-[#f3f7f5] text-[11px] font-semibold text-[#1b3224] hover:bg-[#e3eee8] transition"
                          >↓ Descendre</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <div className={`text-[11px] ${event.done ? "text-slate-400" : "text-slate-500"}`}>
                      {event.done ? "Action complétée" : "Action à réaliser"}
                    </div>
                    <button onClick={() => setEvents((prev) => prev.filter((e) => e.id !== event.id))} className="text-red-400 hover:text-red-600 text-xs font-semibold">
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-2">
                <input value={newEvent.title} onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))} placeholder="Ex: Réviser Bio" className="p-3 rounded-2xl border border-[#cae0d4] bg-white text-xs outline-none" />
                <select value={newEvent.hour} onChange={(e) => setNewEvent((prev) => ({ ...prev, hour: Number(e.target.value) }))} className="p-3 rounded-2xl border border-[#cae0d4] bg-white text-xs outline-none">
                  {Array.from({ length: 18 }, (_, idx) => idx + 6).map((h) => <option key={h} value={h}>{h}h</option>)}
                </select>
              </div>
              <button onClick={() => {
                if (!newEvent.title.trim()) return;
                setEvents((prev) => [...prev, { id: `event_${Date.now()}`, title: newEvent.title.trim(), hour: newEvent.hour, done: false }]);
                setNewEvent({ title: "", hour: 8 });
              }} className="w-full py-2 rounded-2xl bg-[#8da894] text-white text-xs font-semibold hover:bg-[#5c7d67] transition">Ajouter une action</button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-2">Type de journée :</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TYPE_LABELS) as DayType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border-2 transition ${DAY_TYPE_STYLES[t]} ${type === t ? "border-[#8da894] ring-2 ring-[#8da894]" : "border-transparent"}`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition">
            Annuler
          </button>
          <button onClick={save} className="flex-1 py-2.5 bg-[#8da894] text-white text-xs font-semibold rounded-xl hover:bg-[#5c7d67] transition shadow-sm">
            💾 Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlanningMensuel() {
  const [monthIdx, setMonthIdx] = useState(() => {
    const now = new Date();
    const idx = MONTHS.findIndex(m => m.year === now.getFullYear() && m.month === now.getMonth());
    return idx >= 0 ? idx : 0;
  });
  const [modal, setModal] = useState<{ year: number; month: number; day: number } | null>(null);
  const [tick, setTick] = useState(0);

  const { year, month, isEcrits, isOraux } = MONTHS[monthIdx];

  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const allDays: (null | { day: number; data: DayData; isToday: boolean })[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => {
      const d = i + 1;
      const data = getDayData(year, month, d);
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
      return { day: d, data, isToday };
    }),
  ];

  const stats: Record<DayType, number> = { cours: 0, travail: 0, ds: 0, loisirs: 0, vide: 0, concours: 0 };
  for (let d = 1; d <= totalDays; d++) {
    const t = getDayData(year, month, d).type;
    if (stats[t] !== undefined) stats[t]++;
  }

  return (
    <div className="space-y-6">
      {modal && (
        <DayModal
          year={modal.year}
          month={modal.month}
          day={modal.day}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); setTick(t => t + 1); }}
        />
      )}

      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1b3224]">Planning Mensuel Khûbe 2026 – 2027</h2>
            <p className="text-sm text-slate-500">Cliquez sur un jour pour ajouter/modifier votre programme.</p>
          </div>
          <div className="flex gap-2 flex-wrap text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-[#e3eee8] text-[#1b3224] border border-[#cae0d4] font-medium">🔬 Cours/TP</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 font-medium">📚 Travail Perso</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-100 font-medium">📋 Khôlles/DS</span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-100 font-medium">🌳 Repos/Loisirs</span>
            <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-100 font-medium">🎯 Concours</span>
          </div>
        </div>

        {/* Month selector */}
        <div className="overflow-x-auto pb-3 mb-6">
          <div className="flex gap-2 min-w-max">
            {MONTHS.map((m, i) => (
              <button
                key={i}
                onClick={() => setMonthIdx(i)}
                className={`month-pill ${monthIdx === i ? "active" : ""} ${m.isEcrits ? "ring-2 ring-amber-400" : ""} ${m.isOraux ? "ring-2 ring-purple-400" : ""}`}
              >
                {m.isEcrits ? "✍️ " : m.isOraux ? "🎤 " : ""}
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Special month banners */}
        {isEcrits && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
            ✍️ <strong>Épreuves Écrites Agro-Véto — Avril 2027</strong> — Ce mois est celui des concours écrits. Concentration maximale !
          </div>
        )}
        {isOraux && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 font-medium">
            🎤 <strong>Oraux Agro-Véto (Juin → Juillet 2027)</strong> — Les épreuves orales se déroulent de juin à juillet. Préparez votre expression orale, vos schémas et votre sérénité !
          </div>
        )}

        {/* Calendar header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d, i) => (
            <div key={d} className={`text-xs font-bold text-[#1b3224] py-2 rounded-lg ${i >= 5 ? "bg-[#e3eee8] text-[#8da894]" : "bg-[#f3f7f5]"}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {allDays.map((cell, i) => {
            if (!cell) {
              return <div key={`empty-${i}`} className="cal-cell type-vide opacity-30" />;
            }
            const { day, data, isToday } = cell;
            let displayType = data.type;
            let displayText = data.text;
            if (isOraux && !data.text) {
              displayType = "concours";
              displayText = "🎤 Oraux Agro-Véto";
            }
            return (
              <div
                key={day}
                onClick={() => setModal({ year, month, day })}
                className={`cal-cell type-${displayType} flex flex-col gap-1 select-none ${isToday ? "ring-2 ring-offset-1 ring-[#c49b80]" : ""}`}
                title="Cliquez pour modifier"
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[11px] font-bold ${isToday ? "text-[#c49b80]" : ""}`}>{day}</span>
                  {isToday && <span className="text-[9px] bg-[#c49b80] text-white px-1 rounded font-bold">TODAY</span>}
                </div>
                <div className="text-[10px] leading-tight mt-auto line-clamp-3">{displayText}</div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          {(["cours", "travail", "ds", "loisirs", "vide"] as DayType[]).map((t) => (
            <div key={t} className={`rounded-xl p-3 text-center border ${DAY_TYPE_STYLES[t]}`}>
              <div className="font-bold text-xl font-serif">{stats[t]}</div>
              <div className="text-[10px] mt-0.5">{TYPE_LABELS[t]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
