import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";

type Subject = "Maths" | "Biologie" | "Chimie" | "Physique" | "Géologie" | "Français" | "Anglais" | "Géographie";
type NoteType = "Khôlle" | "DS" | "Devoir" | "Interro";

interface Note {
  id: string;
  subject: Subject;
  value: number;
  type: NoteType;
  date: string;
  comment: string;
  coefficient?: number;
  alert?: boolean;
}

const SUBJECTS: Subject[] = ["Maths", "Biologie", "Chimie", "Physique", "Géologie", "Français", "Anglais", "Géographie"];
const NOTE_TYPES: NoteType[] = ["Khôlle", "DS", "Devoir", "Interro"];

const SUBJECT_COLORS: Record<Subject, string> = {
  Maths: "#ef4444",
  Biologie: "#22c55e",
  Chimie: "#6366f1",
  Physique: "#3b82f6",
  Géologie: "#f59e0b",
  Français: "#a855f7",
  Anglais: "#06b6d4",
  Géographie: "#8b5cf6",
};

const SUBJECT_STYLES: Record<Subject, { bg: string; text: string; badge: string }> = {
  Maths: { bg: "bg-red-50", text: "text-red-800", badge: "bg-red-100" },
  Biologie: { bg: "bg-emerald-50", text: "text-emerald-800", badge: "bg-emerald-100" },
  Chimie: { bg: "bg-indigo-50", text: "text-indigo-800", badge: "bg-indigo-100" },
  Physique: { bg: "bg-blue-50", text: "text-blue-800", badge: "bg-blue-100" },
  Géologie: { bg: "bg-amber-50", text: "text-amber-800", badge: "bg-amber-100" },
  Français: { bg: "bg-purple-50", text: "text-purple-800", badge: "bg-purple-100" },
  Anglais: { bg: "bg-sky-50", text: "text-sky-800", badge: "bg-sky-100" },
  Géographie: { bg: "bg-violet-50", text: "text-violet-800", badge: "bg-violet-100" },
};

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem("khube_notes_v1");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    { id: "n1", subject: "Maths", value: 14.5, type: "Khôlle", date: "2026-09-15", comment: "Algèbre linéaire, bon travail" },
    { id: "n2", subject: "Biologie", value: 16, type: "Khôlle", date: "2026-09-18", comment: "Cycle cellulaire" },
    { id: "n3", subject: "Chimie", value: 11.5, type: "DS", date: "2026-09-25", comment: "Mécanismes SN1/SN2" },
    { id: "n4", subject: "Maths", value: 15.5, type: "DS", date: "2026-10-10", comment: "Suites et séries" },
    { id: "n5", subject: "Biologie", value: 17, type: "Khôlle", date: "2026-10-14", comment: "Respiration cellulaire" },
    { id: "n6", subject: "Chimie", value: 13, type: "Khôlle", date: "2026-10-20", comment: "Thermodynamique" },
    { id: "n7", subject: "Physique", value: 12, type: "DS", date: "2026-10-28", comment: "Électrocinétique" },
    { id: "n8", subject: "Français", value: 14, type: "DS", date: "2026-11-05", comment: "Dissertation" },
    { id: "n9", subject: "Maths", value: 16.5, type: "Khôlle", date: "2026-11-12", comment: "Probabilités" },
    { id: "n10", subject: "Anglais", value: 15, type: "Interro", date: "2026-11-18", comment: "Vocabulaire scientifique" },
  ];
}

function saveNotes(n: Note[]) {
  localStorage.setItem("khube_notes_v1", JSON.stringify(n));
}

function getMention(v: number) {
  if (v >= 18) return { label: "Excellent", color: "text-emerald-700 bg-emerald-50" };
  if (v >= 15) return { label: "Très bien", color: "text-emerald-600 bg-emerald-50" };
  if (v >= 12) return { label: "Bien", color: "text-blue-700 bg-blue-50" };
  if (v >= 10) return { label: "Assez bien", color: "text-amber-700 bg-amber-50" };
  return { label: "À renforcer", color: "text-red-700 bg-red-50" };
}

function avg(arr: number[]) {
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export default function MesNotes() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [filterSubject, setFilterSubject] = useState<Subject | "all">("all");
  const [form, setForm] = useState({
    subject: "Maths" as Subject,
    value: "",
    coefficient: "",
    type: "Khôlle" as NoteType,
    date: new Date().toISOString().split("T")[0],
    comment: "",
    alert: false,
  });

  function addNote() {
    const v = parseFloat(form.value);
    const c = parseFloat(form.coefficient);
    if (isNaN(v) || v < 0 || v > 20) { alert("Note invalide (0-20)"); return; }
    if (form.coefficient.trim() && (isNaN(c) || c <= 0)) { alert("Coefficient invalide"); return; }
    const n: Note = {
      id: `n_${Date.now()}`,
      subject: form.subject,
      value: v,
      coefficient: isNaN(c) ? undefined : c,
      type: form.type,
      date: form.date,
      comment: form.comment.trim(),
      alert: form.alert,
    };
    const updated = [...notes, n].sort((a, b) => a.date.localeCompare(b.date));
    setNotes(updated);
    saveNotes(updated);
    setForm((f) => ({ ...f, value: "", coefficient: "", comment: "" }));
  }

  function deleteNote(id: string) {
    if (!confirm("Supprimer cette note ?")) return;
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  }

  const filteredNotes = filterSubject === "all" ? notes : notes.filter((n) => n.subject === filterSubject);

  // Build chart data per date
  const chartData = useMemo(() => {
    const byDate: Record<string, Record<string, number[]>> = {};
    notes.forEach((n) => {
      if (!byDate[n.date]) byDate[n.date] = {};
      if (!byDate[n.date][n.subject]) byDate[n.date][n.subject] = [];
      byDate[n.date][n.subject].push(n.value);
    });
    return Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, subjects]) => {
      const row: Record<string, string | number | null> = {
        date: new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
      };
      SUBJECTS.forEach((s) => {
        const vals = subjects[s];
        row[s] = vals ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
      });
      return row;
    });
  }, [notes]);

  // Stats per subject
  const subjectStats = useMemo(() => {
    return SUBJECTS.map((s) => {
      const subjectNotes = notes.filter((n) => n.subject === s);
      const vals = subjectNotes.map((n) => n.value);
      const weightedSum = subjectNotes.reduce((sum, n) => sum + n.value * (n.coefficient ?? 1), 0);
      const weightTotal = subjectNotes.reduce((sum, n) => sum + (n.coefficient ?? 1), 0);
      const weightedAverage = weightTotal ? weightedSum / weightTotal : null;
      const average = avg(vals);
      return {
        subject: s,
        average,
        weightedAverage,
        count: subjectNotes.length,
        min: vals.length ? Math.min(...vals) : null,
        max: vals.length ? Math.max(...vals) : null,
      };
    }).filter((s) => s.count > 0).sort((a, b) => ((b.weightedAverage ?? b.average ?? 0) - (a.weightedAverage ?? a.average ?? 0)));
  }, [notes]);

  const visibleSubjects = filterSubject === "all" ? SUBJECTS : [filterSubject];

  const kholleChartData = useMemo(() => {
    const byWeek: Record<string, { total: number; count: number; label: string }> = {};
    notes
      .filter((n) => n.type === "Khôlle")
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((n) => {
        const d = new Date(n.date);
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        const wk = monday.toISOString().split("T")[0];
        if (!byWeek[wk]) byWeek[wk] = { total: 0, count: 0, label: monday.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) };
        byWeek[wk].total += n.value;
        byWeek[wk].count += 1;
      });
    return Object.entries(byWeek)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ label: v.label, moyenne: Math.round((v.total / v.count) * 10) / 10 }));
  }, [notes]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1b3224]">Mes Notes & Progression</h2>
            <p className="text-sm text-slate-500">Suivez vos résultats de khôlles, DS et devoirs tout au long de l'année.</p>
          </div>
          {/* Stats cards */}
          <div className="flex flex-wrap gap-3">
            {subjectStats.slice(0, 4).map((s) => {
              const style = SUBJECT_STYLES[s.subject as Subject];
              const displayAverage = s.weightedAverage ?? s.average;
              const mention = getMention(displayAverage ?? 0);
              return (
                <div key={s.subject} className={`${style.bg} p-3 rounded-2xl min-w-[110px] text-center border border-white/50`}>
                  <div className={`font-serif text-2xl font-bold ${style.text}`}>{displayAverage?.toFixed(1)}</div>
                  <div className={`text-[10px] font-bold ${style.text} mt-0.5`}>{s.subject}</div>
                  <div className="text-[9px] text-slate-500 mt-1">{s.weightedAverage ? "Moy. pondérée" : "Moy. simple"}</div>
                  <div className={`text-[9px] px-1.5 py-0.5 rounded-full mt-2 font-medium inline-block ${mention.color}`}>{mention.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-serif font-bold text-[#1b3224] text-xl">📈 Courbe de progression</h3>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setFilterSubject("all")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterSubject === "all" ? "bg-[#1b3224] text-white" : "bg-[#f3f7f5] text-[#1b3224] border border-[#cae0d4] hover:bg-[#e3eee8]"}`}>Toutes</button>
            {SUBJECTS.map((s) => {
              const style = SUBJECT_STYLES[s];
              return (
                <button key={s} onClick={() => setFilterSubject(filterSubject === s ? "all" : s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterSubject === s ? "bg-[#1b3224] text-white" : `${style.bg} ${style.text} border hover:opacity-80`}`}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {chartData.length < 2 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
            Ajoutez au moins 2 notes pour afficher la courbe de progression.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: "#64748b" }} ticks={[0, 5, 8, 10, 12, 14, 16, 18, 20]} />
              <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1} label={{ value: "10", position: "insideLeft", fill: "#ef4444", fontSize: 10 }} />
              <ReferenceLine y={14} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1} label={{ value: "14", position: "insideLeft", fill: "#22c55e", fontSize: 10 }} />
              <Tooltip formatter={(v: number, name: string) => [`${v}/20`, name]} labelStyle={{ fontWeight: "bold", color: "#1b3224" }} contentStyle={{ borderRadius: 12, border: "1px solid #cae0d4", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {visibleSubjects.filter((s) => notes.some((n) => n.subject === s)).map((s) => (
                <Line key={s} type="monotone" dataKey={s} stroke={SUBJECT_COLORS[s]} strokeWidth={2.5} dot={{ r: 4, fill: SUBJECT_COLORS[s] }} activeDot={{ r: 6 }} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {kholleChartData.length >= 2 && (
        <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
          <h3 className="font-serif font-bold text-[#1b3224] text-xl mb-4">📈 Statistiques khôlles — évolution par semaine</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={kholleChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: "#64748b" }} />
              <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="4 2" />
              <ReferenceLine y={14} stroke="#22c55e" strokeDasharray="4 2" />
              <Tooltip formatter={(v: number) => [`${v}/20`, "Moyenne khôlles"]} />
              <Line type="monotone" dataKey="moyenne" stroke="#8da894" strokeWidth={3} dot={{ r: 5, fill: "#8da894" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table + Form */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Table */}
        <div className="flex-1 bg-white rounded-3xl border border-[#e3eee8] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#e3eee8]">
            <h3 className="font-serif font-bold text-[#1b3224]">📋 Historique des notes ({filteredNotes.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#f3f7f5] text-[#1b3224] text-left">
                  <th className="px-4 py-3 font-bold">Date</th>
                  <th className="px-4 py-3 font-bold">Matière</th>
                  <th className="px-4 py-3 font-bold">Type</th>
                  <th className="px-4 py-3 font-bold">Coef</th>
                  <th className="px-4 py-3 font-bold">Note</th>
                  <th className="px-4 py-3 font-bold">Mention</th>
                  <th className="px-4 py-3 font-bold">Commentaire</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f7f5]">
                {filteredNotes.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-400">Aucune note. Ajoutez la première !</td></tr>
                )}
                {[...filteredNotes].sort((a, b) => b.date.localeCompare(a.date)).map((n) => {
                  const style = SUBJECT_STYLES[n.subject];
                  const mention = getMention(n.value);
                  return (
                    <tr key={n.id} className="hover:bg-[#f3f7f5] transition-colors">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(n.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</td>
                      <td className="px-4 py-3">
                        <span className={`${style.badge} ${style.text} px-2 py-0.5 rounded-md font-bold`}>{n.subject}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{n.type}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{n.coefficient ?? 1}</td>
                      <td className="px-4 py-3 font-serif font-bold text-base text-[#1b3224]">{n.value}<span className="text-[10px] text-slate-400 font-normal">/20</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${mention.color}`}>{mention.label}</span></td>
                      <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate">{n.comment || "—"}</td>
                      <td className="px-4 py-3"><button onClick={() => deleteNote(n.id)} className="text-red-400 hover:text-red-600">🗑</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add form */}
        <div className="w-full lg:w-72 bg-white rounded-3xl border border-[#e3eee8] shadow-sm p-6 space-y-4 self-start sticky top-24">
          <h3 className="font-serif font-bold text-[#1b3224]">➕ Ajouter une note</h3>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Matière</label>
            <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value as Subject }))} className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Note /20 *</label>
              <input type="number" min={0} max={20} step={0.5} value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] focus:ring-2 focus:ring-[#a3caa0] outline-none" placeholder="Ex: 14.5" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Coefficient</label>
              <input type="number" min={0} step={0.1} value={form.coefficient} onChange={(e) => setForm((f) => ({ ...f, coefficient: e.target.value }))} className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] focus:ring-2 focus:ring-[#a3caa0] outline-none" placeholder="Ex: 2" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as NoteType }))} className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
                {NOTE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Commentaire</label>
            <input type="text" value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] focus:ring-2 focus:ring-[#a3caa0] outline-none" placeholder="Ex: Mécanique, bon résultat" />
          </div>
          {(form.type === "DS" || form.type === "Khôlle") && (
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={form.alert} onChange={(e) => setForm((f) => ({ ...f, alert: e.target.checked }))} className="rounded" />
              <span>🔔 Alerte importante (rappel sur l'accueil)</span>
            </label>
          )}
          <button onClick={addNote} className="w-full py-2.5 bg-[#8da894] text-white text-xs font-semibold rounded-xl hover:bg-[#5c7d67] transition shadow-sm">
            💾 Enregistrer la note
          </button>

          {/* Averages */}
          {subjectStats.length > 0 && (
            <div className="border-t border-[#e3eee8] pt-4 space-y-2">
              <p className="text-xs font-bold text-[#1b3224]">Moyennes par matière :</p>
              {subjectStats.map((s) => {
                const style = SUBJECT_STYLES[s.subject as Subject];
                const mention = getMention(s.average ?? 0);
                return (
                  <div key={s.subject} className="flex items-center justify-between">
                    <span className={`${style.badge} ${style.text} text-[10px] font-bold px-2 py-0.5 rounded-md`}>{s.subject}</span>
                    <span className={`text-xs font-bold ${mention.color} px-2 py-0.5 rounded-full`}>{s.average?.toFixed(2)}/20</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
