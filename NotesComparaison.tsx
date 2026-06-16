import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type YearNote = {
  id: string;
  subject: string;
  value: number;
  type: string;
  date: string;
  year: "terminale" | "concours" | "khube";
  comment: string;
};

const STORAGE = "khube_notes_compare_v1";
const SUBJECTS = ["Maths", "Biologie", "Chimie", "Physique", "Géologie", "Géographie", "Français", "Anglais"];
const YEAR_LABELS = {
  terminale: "1ère année BCPST",
  concours: "2ème année BCPST (concours 1)",
  khube: "Année de Khûbe",
};
const YEAR_COLORS = { terminale: "#94a3b8", concours: "#f59e0b", khube: "#22c55e" };

function load(): YearNote[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function avg(notes: YearNote[], subject: string, year: YearNote["year"]) {
  const vals = notes.filter((n) => n.subject === subject && n.year === year).map((n) => n.value);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

export default function NotesComparaison() {
  const [notes, setNotes] = useState<YearNote[]>(load);
  const [form, setForm] = useState({
    subject: "Maths",
    value: "",
    type: "Khôlle",
    date: new Date().toISOString().split("T")[0],
    year: "khube" as YearNote["year"],
    comment: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(notes));
  }, [notes]);

  function add() {
    const v = parseFloat(form.value);
    if (isNaN(v) || v < 0 || v > 20) return;
    setNotes((prev) => [
      ...prev,
      {
        id: `yc_${Date.now()}`,
        subject: form.subject,
        value: v,
        type: form.type,
        date: form.date,
        year: form.year,
        comment: form.comment.trim(),
      },
    ]);
    setForm((f) => ({ ...f, value: "", comment: "" }));
  }

  function remove(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  const comparisonData = useMemo(() => {
    return SUBJECTS.map((subject) => ({
      subject,
      terminale: avg(notes, subject, "terminale"),
      concours: avg(notes, subject, "concours"),
      khube: avg(notes, subject, "khube"),
    })).filter((row) => row.terminale !== null || row.concours !== null || row.khube !== null);
  }, [notes]);

  const progression = useMemo(() => {
    return SUBJECTS.map((subject) => {
      const t = avg(notes, subject, "terminale");
      const c = avg(notes, subject, "concours");
      const k = avg(notes, subject, "khube");
      const ref = c ?? t;
      const diff = ref !== null && k !== null ? k - ref : null;
      return { subject, terminale: t, concours: c, khube: k, diff };
    }).filter((r) => r.khube !== null);
  }, [notes]);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224]">📊 Comparaison des notes — Progression</h2>
        <p className="text-sm text-slate-500">Compare tes notes de 1ère année BCPST, 2ème année (concours 1) et Khûbe pour visualiser ta progression.</p>
      </div>

      {comparisonData.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
          <h3 className="font-serif font-bold text-[#1b3224] mb-4">Moyennes par matière et par année</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 20]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v?.toFixed(1)}/20`]} />
              <Legend />
              <Line type="monotone" dataKey="terminale" name="1ère année BCPST" stroke={YEAR_COLORS.terminale} strokeWidth={2} connectNulls dot={{ r: 4 }} />
              <Line type="monotone" dataKey="concours" name="2ème année (concours 1)" stroke={YEAR_COLORS.concours} strokeWidth={2} connectNulls dot={{ r: 4 }} />
              <Line type="monotone" dataKey="khube" name="Année de Khûbe" stroke={YEAR_COLORS.khube} strokeWidth={2.5} connectNulls dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {progression.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
          <h3 className="font-serif font-bold text-[#1b3224] mb-4">Progression Khûbe vs année précédente</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {progression.map((p) => (
              <div key={p.subject} className="rounded-2xl border border-[#e3eee8] p-4 bg-[#f8faf8]">
                <div className="text-sm font-semibold text-[#1b3224]">{p.subject}</div>
                <div className="text-2xl font-serif font-bold text-[#1b3224] mt-1">{p.khube?.toFixed(1)}</div>
                {p.diff !== null && (
                  <div className={`text-xs font-bold mt-1 ${p.diff >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {p.diff >= 0 ? "▲" : "▼"} {Math.abs(p.diff).toFixed(1)} pts vs {p.concours !== null ? "2ème année" : "1ère année"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="bg-white rounded-3xl border border-[#e3eee8] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#e3eee8] font-semibold text-[#1b3224]">Historique ({notes.length})</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#f3f7f5] text-left">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Année</th>
                  <th className="px-4 py-2">Matière</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Note</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f7f5]">
                {[...notes].sort((a, b) => b.date.localeCompare(a.date)).map((n) => (
                  <tr key={n.id} className="hover:bg-[#f8faf8]">
                    <td className="px-4 py-2">{new Date(n.date).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-2"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${YEAR_COLORS[n.year]}22`, color: YEAR_COLORS[n.year] }}>{YEAR_LABELS[n.year]}</span></td>
                    <td className="px-4 py-2">{n.subject}</td>
                    <td className="px-4 py-2">{n.type}</td>
                    <td className="px-4 py-2 font-bold">{n.value}/20</td>
                    <td className="px-4 py-2"><button onClick={() => remove(n.id)} className="text-red-400">🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm space-y-4 self-start sticky top-24">
          <h3 className="font-semibold text-[#1b3224]">➕ Ajouter une note</h3>
          <select value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value as YearNote["year"] }))} className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
            <option value="terminale">1ère année BCPST</option>
            <option value="concours">2ème année BCPST (concours 1)</option>
            <option value="khube">Année de Khûbe</option>
          </select>
          <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="number" min={0} max={20} step={0.5} value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder="Note /20" className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" />
          <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" />
          <input value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} placeholder="Type (Khôlle, DS…)" className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" />
          <button onClick={add} className="w-full py-3 rounded-2xl bg-[#8da894] text-white text-sm font-semibold hover:bg-[#5c7d67] transition">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
