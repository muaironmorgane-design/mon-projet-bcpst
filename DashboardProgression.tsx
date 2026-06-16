import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";

const COEFFS: Record<string, number> = {
  "Mathématiques": 5, "Physique": 4, "Chimie": 4, "SVT": 5, "Biologie": 5,
  "Français": 3, "LV1": 2, "Autre": 1,
};

interface Note { id: string; subject: string; value: number; date: string; label: string; }

function loadNotes(): Note[] {
  try { return JSON.parse(localStorage.getItem("khube_notes_v1") || "[]"); } catch { return []; }
}

function weightedAvg(notes: Note[]): number {
  if (!notes.length) return 0;
  let sum = 0, coeffSum = 0;
  for (const n of notes) {
    const c = COEFFS[n.subject] ?? 1;
    sum += n.value * c;
    coeffSum += c;
  }
  return coeffSum ? sum / coeffSum : 0;
}

function mention(avg: number) {
  if (avg >= 16) return { label: "Très Bien", color: "text-emerald-700" };
  if (avg >= 14) return { label: "Bien", color: "text-[#5c7d67]" };
  if (avg >= 12) return { label: "Assez Bien", color: "text-amber-600" };
  return { label: "Passable", color: "text-red-600" };
}

export default function DashboardProgression() {
  const notes = loadNotes();

  const bySubject = useMemo(() => {
    const map: Record<string, Note[]> = {};
    for (const n of notes) {
      if (!map[n.subject]) map[n.subject] = [];
      map[n.subject].push(n);
    }
    return map;
  }, [notes]);

  const allDates = useMemo(() => {
    const dates = [...new Set(notes.map(n => n.date))].sort();
    return dates;
  }, [notes]);

  const chartData = useMemo(() => {
    return allDates.map(date => {
      const notesUpToDate = notes.filter(n => n.date <= date);
      const avg = weightedAvg(notesUpToDate);
      return {
        date: new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        moyenne: parseFloat(avg.toFixed(2)),
      };
    });
  }, [allDates, notes]);

  const currentAvg = weightedAvg(notes);
  const currentMention = mention(currentAvg);

  const subjectStats = Object.entries(bySubject).map(([subj, ns]) => ({
    subject: subj,
    avg: ns.reduce((s, n) => s + n.value, 0) / ns.length,
    count: ns.length,
    coeff: COEFFS[subj] ?? 1,
    last: ns.sort((a,b) => b.date.localeCompare(a.date))[0]?.value,
  })).sort((a,b) => b.coeff - a.coeff);

  if (notes.length === 0) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-[#e3eee8] shadow-sm text-center space-y-4">
        <div className="text-5xl">📈</div>
        <h2 className="font-serif text-2xl font-bold text-[#1b3224]">Dashboard de Progression</h2>
        <p className="text-slate-500">Ajoute des notes dans l'onglet <strong>Mes Notes</strong> pour voir ton évolution ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224] mb-1">📈 Dashboard de Progression</h2>
        <p className="text-sm text-slate-500">Ta moyenne pondérée réelle au fil de l'année.</p>
      </div>

      {/* Global avg */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e3eee8] shadow-sm text-center col-span-2 md:col-span-1">
          <p className="text-xs text-slate-400 mb-1">Moyenne pondérée</p>
          <p className={`font-serif text-4xl font-bold ${currentMention.color}`}>{currentAvg.toFixed(2)}</p>
          <p className={`text-xs font-semibold mt-1 ${currentMention.color}`}>{currentMention.label}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#e3eee8] shadow-sm text-center">
          <p className="text-xs text-slate-400 mb-1">Notes saisies</p>
          <p className="font-serif text-3xl font-bold text-[#1b3224]">{notes.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#e3eee8] shadow-sm text-center">
          <p className="text-xs text-slate-400 mb-1">Matières</p>
          <p className="font-serif text-3xl font-bold text-[#1b3224]">{Object.keys(bySubject).length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#e3eee8] shadow-sm text-center">
          <p className="text-xs text-slate-400 mb-1">Objectif ENV</p>
          <p className="font-serif text-3xl font-bold text-[#c49b80]">15.5</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
          <h3 className="font-serif font-bold text-[#1b3224] mb-4">Courbe de moyenne cumulée</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3eee8" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[8, 20]} ticks={[8,10,12,14,15.5,16,18,20]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [`${v.toFixed(2)} /20`, "Moyenne pondérée"]} />
              <ReferenceLine y={15.5} stroke="#c49b80" strokeDasharray="4 2" label={{ value: "Objectif ENV", fontSize: 10, fill: "#c49b80" }} />
              <Line type="monotone" dataKey="moyenne" stroke="#8da894" strokeWidth={2.5} dot={{ r: 4, fill: "#8da894" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per subject */}
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h3 className="font-serif font-bold text-[#1b3224] mb-4">Par matière</h3>
        <div className="space-y-3">
          {subjectStats.map(s => {
            const pct = (s.avg / 20) * 100;
            const color = s.avg >= 15.5 ? "#8da894" : s.avg >= 12 ? "#c49b80" : "#ef4444";
            return (
              <div key={s.subject} className="flex items-center gap-4">
                <div className="w-32 shrink-0">
                  <p className="text-sm font-semibold text-[#1b3224] truncate">{s.subject}</p>
                  <p className="text-[10px] text-slate-400">coeff.{s.coeff} · {s.count} note{s.count > 1 ? "s" : ""}</p>
                </div>
                <div className="flex-1 h-2.5 bg-[#e3eee8] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="font-bold text-sm w-12 text-right font-serif" style={{ color }}>{s.avg.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
