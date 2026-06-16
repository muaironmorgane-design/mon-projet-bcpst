import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from "recharts";

interface DayEntry { date: string; mood: number; fatigue: number; note?: string; }

const MOOD_OPTS = [
  { v: 1, emoji: "😭", label: "Terrible" },
  { v: 2, emoji: "😔", label: "Bas" },
  { v: 3, emoji: "😐", label: "Neutre" },
  { v: 4, emoji: "😊", label: "Bien" },
  { v: 5, emoji: "🌟", label: "Super !" },
];
const ENERGY_OPTS = [
  { v: 1, emoji: "💤", label: "Épuisée" },
  { v: 2, emoji: "😴", label: "Fatiguée" },
  { v: 3, emoji: "😑", label: "Normale" },
  { v: 4, emoji: "💪", label: "En forme" },
  { v: 5, emoji: "⚡", label: "Au top !" },
];

const KEY = "khube_mood_v1";
function load(): DayEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function save(d: DayEntry[]) { localStorage.setItem(KEY, JSON.stringify(d)); }
function todayISO() { return new Date().toISOString().split("T")[0]; }
function fmtShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
function fmtFull(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

function moodColor(v: number) {
  if (v <= 1) return "#ef4444";
  if (v === 2) return "#f97316";
  if (v === 3) return "#8da894";
  if (v === 4) return "#22c55e";
  return "#8b5cf6";
}

export default function MoodTracker() {
  const [entries, setEntries] = useState<DayEntry[]>(load);
  const [mood, setMood] = useState(3);
  const [fatigue, setFatigue] = useState(3);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const today = todayISO();
  const existing = entries.find(e => e.date === today);

  useEffect(() => {
    if (existing) {
      setMood(existing.mood);
      setFatigue(existing.fatigue);
      setNote(existing.note || "");
    }
  }, []);

  function saveToday() {
    const entry: DayEntry = { date: today, mood, fatigue, note: note.trim() || undefined };
    const updated = existing
      ? entries.map(e => e.date === today ? entry : e)
      : [entry, ...entries].sort((a, b) => b.date.localeCompare(a.date));
    setEntries(updated);
    save(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const chartData = [...entries]
    .slice(0, 60)
    .reverse()
    .map(e => ({
      date: fmtShort(e.date),
      iso: e.date,
      moral: e.mood,
      energie: e.fatigue,
    }));

  const avgMood = entries.length
    ? (entries.reduce((s, e) => s + e.mood, 0) / entries.length).toFixed(1)
    : "–";
  const avgEnergy = entries.length
    ? (entries.reduce((s, e) => s + e.fatigue, 0) / entries.length).toFixed(1)
    : "–";
  const streak = (() => {
    let s = 0;
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    const now = new Date(today);
    for (const e of sorted) {
      const d = new Date(e.date);
      const diff = Math.round((now.getTime() - d.getTime()) / 86400000);
      if (diff === s) s++;
      else break;
    }
    return s;
  })();

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-[#e3eee8] rounded-2xl p-3 shadow-lg text-xs space-y-1">
        <p className="font-semibold text-[#1b3224] mb-1">{label}</p>
        {payload.map(p => {
          const opts = p.dataKey === "moral" ? MOOD_OPTS : ENERGY_OPTS;
          const opt = opts.find(o => o.v === p.value);
          return (
            <p key={p.dataKey} style={{ color: p.dataKey === "moral" ? "#8da894" : "#c49b80" }}>
              {p.dataKey === "moral" ? "Moral" : "Énergie"} : {opt?.emoji} {opt?.label}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* ── Input card ── */}
      <div className="card-refined p-6 md:p-8">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1b3224]">Tracker d'Humeur</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {existing ? `Entrée du ${fmtFull(today)} — tu peux modifier` : `Aujourd'hui · ${fmtFull(today)}`}
            </p>
          </div>
          {saved && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-4 py-2 rounded-full border border-emerald-200 animate-pulse">
              ✓ Enregistré !
            </div>
          )}
          {existing && !saved && (
            <div className="flex items-center gap-1.5 text-xs text-[#5c7d67] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#8da894] inline-block" />
              Déjà noté aujourd'hui
            </div>
          )}
        </div>

        {/* Emoji selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">😊 Moral du jour</p>
            <div className="flex gap-2 justify-between">
              {MOOD_OPTS.map(o => (
                <button
                  key={o.v}
                  onClick={() => setMood(o.v)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all text-center mood-btn ${mood === o.v ? "mood-btn-active" : ""}`}
                  style={{
                    background: mood === o.v ? `${moodColor(o.v)}20` : undefined,
                    border: mood === o.v ? `2px solid ${moodColor(o.v)}` : "2px solid transparent",
                    transform: mood === o.v ? "scale(1.06)" : "scale(1)",
                    boxShadow: mood === o.v ? `0 4px 14px ${moodColor(o.v)}30` : "none",
                  }}
                >
                  <span className="text-2xl leading-none">{o.emoji}</span>
                  <span className="text-[9px] font-semibold text-slate-500">{o.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">⚡ Énergie</p>
            <div className="flex gap-2 justify-between">
              {ENERGY_OPTS.map(o => (
                <button
                  key={o.v}
                  onClick={() => setFatigue(o.v)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all text-center mood-btn ${fatigue === o.v ? "mood-btn-active" : ""}`}
                  style={{
                    background: fatigue === o.v ? "#c49b8020" : undefined,
                    border: fatigue === o.v ? "2px solid #c49b80" : "2px solid transparent",
                    transform: fatigue === o.v ? "scale(1.06)" : "scale(1)",
                    boxShadow: fatigue === o.v ? "0 4px 14px #c49b8030" : "none",
                  }}
                >
                  <span className="text-2xl leading-none">{o.emoji}</span>
                  <span className="text-[9px] font-semibold text-slate-500">{o.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Optional note */}
        <div className="mb-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📝 Note rapide (optionnel)</p>
          <textarea
            rows={2}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Un mot sur ta journée, une pensée…"
            className="w-full px-4 py-3 text-sm text-slate-700 resize-none"
            style={{ background: "#f8faf9", border: "1.5px solid rgba(163,202,160,0.35)", borderRadius: "14px" }}
          />
        </div>

        <button
          onClick={saveToday}
          className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all"
          style={{ background: "linear-gradient(135deg, #1b3224, #2d5a3e)", boxShadow: "0 4px 16px rgba(27,50,36,0.25)" }}
        >
          {existing ? "✏️ Mettre à jour" : "💾 Enregistrer mon humeur du jour"}
        </button>
      </div>

      {/* ── Stats summary ── */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-tile p-4 text-center">
            <div className="font-serif text-2xl font-bold text-[#1b3224]">{entries.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">entrées au total</div>
          </div>
          <div className="stat-tile p-4 text-center">
            <div className="font-serif text-2xl font-bold" style={{ color: moodColor(Math.round(parseFloat(avgMood as string))) }}>{avgMood}</div>
            <div className="text-[11px] text-slate-500 mt-1">moral moyen / 5</div>
          </div>
          <div className="stat-tile p-4 text-center">
            <div className="font-serif text-2xl font-bold text-[#c49b80]">{streak}</div>
            <div className="text-[11px] text-slate-500 mt-1">jours consécutifs</div>
          </div>
        </div>
      )}

      {/* ── Chart ── */}
      {chartData.length >= 1 && (
        <div className="card-refined p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="section-heading">📈 Évolution de l'humeur</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {chartData.length} {chartData.length === 1 ? "entrée" : "entrées"} · 60 derniers jours max
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-3 h-0.5 bg-[#8da894] rounded-full inline-block" /> Moral
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-3 h-0.5 bg-[#c49b80] rounded-full inline-block" /> Énergie
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradMoral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8da894" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8da894" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradEnergie" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c49b80" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#c49b80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,202,160,0.2)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={{ stroke: "rgba(163,202,160,0.3)" }}
                interval={chartData.length > 14 ? Math.floor(chartData.length / 7) : 0}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <ReferenceLine y={3} stroke="rgba(163,202,160,0.4)" strokeDasharray="4 4" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="moral"
                stroke="#8da894" strokeWidth={2.5}
                fill="url(#gradMoral)" dot={{ r: 4, fill: "#8da894", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#8da894", stroke: "white", strokeWidth: 2 }}
              />
              <Area
                type="monotone" dataKey="energie"
                stroke="#c49b80" strokeWidth={2.5}
                fill="url(#gradEnergie)" dot={{ r: 4, fill: "#c49b80", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#c49b80", stroke: "white", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          {entries.some(e => e.mood <= 2) && (
            <p className="text-[11px] text-slate-400 mt-3 text-center">
              💡 Plusieurs jours sous 2 de suite → c'est le signe qu'il faut une vraie pause. Tu l'as mérité.
            </p>
          )}
        </div>
      )}

      {/* ── Recent entries list ── */}
      {entries.length > 0 && (
        <div className="card-refined p-6">
          <h3 className="section-heading mb-4">📋 Historique récent</h3>
          <div className="space-y-2">
            {entries.slice(0, 10).map(e => {
              const m = MOOD_OPTS.find(o => o.v === e.mood)!;
              const f = ENERGY_OPTS.find(o => o.v === e.fatigue)!;
              const isToday = e.date === today;
              return (
                <div key={e.date}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors history-row ${isToday ? "history-row-today" : ""}`}
                >
                  <span className="text-[11px] font-medium text-slate-400 w-20 shrink-0">
                    {isToday ? "Aujourd'hui" : fmtShort(e.date)}
                  </span>
                  <span className="text-xl leading-none">{m.emoji}</span>
                  <span className="text-xs text-slate-600 flex-1">{m.label}</span>
                  <span className="text-xl leading-none">{f.emoji}</span>
                  <span className="text-xs text-slate-500">{f.label}</span>
                  {e.note && (
                    <span className="text-[10px] text-slate-400 italic truncate max-w-[120px]">"{e.note}"</span>
                  )}
                  {isToday && (
                    <span className="text-[9px] font-bold uppercase tracking-wide text-[#5c7d67] bg-[#e3eee8] px-2 py-0.5 rounded-full">Aujourd'hui</span>
                  )}
                </div>
              );
            })}
          </div>
          {entries.length > 10 && (
            <p className="text-xs text-slate-400 text-center mt-3">{entries.length - 10} entrées plus anciennes non affichées</p>
          )}
        </div>
      )}

      {entries.length === 0 && (
        <div className="card-refined p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-slate-500 font-medium">Enregistre ta première humeur ci-dessus pour commencer à suivre ton évolution.</p>
          <p className="text-xs text-slate-400 mt-2">La courbe s'affiche dès la première entrée !</p>
        </div>
      )}
    </div>
  );
}
