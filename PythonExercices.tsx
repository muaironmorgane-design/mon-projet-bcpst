import { useEffect, useState } from "react";

type PythonEntry = {
  id: string;
  title: string;
  category: "programme" | "exercice";
  subject: string;
  code: string;
  notes: string;
  date: string;
};

const STORAGE = "khube_python_v1";
const SUBJECTS = ["Maths", "Physique", "Biologie", "Chimie", "Général"];

function load(): PythonEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function PythonExercices() {
  const [entries, setEntries] = useState<PythonEntry[]>(load);
  const [filter, setFilter] = useState<"all" | "programme" | "exercice">("all");
  const [form, setForm] = useState({
    title: "",
    category: "programme" as PythonEntry["category"],
    subject: "Maths",
    code: "",
    notes: "",
  });
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(entries));
  }, [entries]);

  function add() {
    if (!form.title.trim() || !form.code.trim()) return;
    setEntries((prev) => [
      ...prev,
      {
        id: `py_${Date.now()}`,
        title: form.title.trim(),
        category: form.category,
        subject: form.subject,
        code: form.code,
        notes: form.notes.trim(),
        date: new Date().toISOString().split("T")[0],
      },
    ]);
    setForm({ title: "", category: "programme", subject: "Maths", code: "", notes: "" });
  }

  function remove(id: string) {
    if (!confirm("Supprimer ?")) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const filtered = entries.filter((e) => filter === "all" || e.category === filter);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224]">🐍 Python — Programmes & Exos types</h2>
        <p className="text-sm text-slate-500">Stocke tes scripts Python et tes exercices types par matière.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "programme", "exercice"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              filter === f ? "bg-[#1b3224] text-white" : "bg-[#f3f7f5] text-[#1b3224] border border-[#cae0d4]"
            }`}
          >
            {f === "all" ? "Tout" : f === "programme" ? "Programmes" : "Exos types"}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-[#cae0d4] text-center text-slate-400 text-sm">
              Aucun programme Python. Ajoute ton premier script !
            </div>
          )}
          {filtered.map((entry) => (
            <div key={entry.id} className="bg-white rounded-3xl border border-[#e3eee8] shadow-sm overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${entry.category === "programme" ? "bg-indigo-100 text-indigo-800" : "bg-amber-100 text-amber-800"}`}>
                      {entry.category === "programme" ? "Programme" : "Exo type"}
                    </span>
                    <span className="text-[10px] bg-[#e3eee8] text-[#1b3224] px-2 py-0.5 rounded-full font-semibold">{entry.subject}</span>
                  </div>
                  <h3 className="font-semibold text-[#1b3224]">{entry.title}</h3>
                  {entry.notes && <p className="text-xs text-slate-500 mt-1">{entry.notes}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setExpanded(expanded === entry.id ? null : entry.id)} className="text-xs text-[#5c7d67] font-semibold">
                    {expanded === entry.id ? "Réduire" : "Voir code"}
                  </button>
                  <button onClick={() => remove(entry.id)} className="text-xs text-red-400">🗑</button>
                </div>
              </div>
              {expanded === entry.id && (
                <pre className="mx-4 mb-4 p-4 rounded-2xl bg-[#1b3224] text-emerald-300 text-xs overflow-x-auto font-mono leading-relaxed">
                  {entry.code}
                </pre>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm space-y-4 self-start sticky top-24">
          <h3 className="font-semibold text-[#1b3224]">➕ Ajouter</h3>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Titre (ex: Résolution d'équations)"
            className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as PythonEntry["category"] }))} className="p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
              <option value="programme">Programme</option>
              <option value="exercice">Exo type</option>
            </select>
            <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <textarea
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            rows={8}
            placeholder="# Ton code Python ici…"
            className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#1b3224] text-emerald-300 font-mono outline-none resize-none"
          />
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={2}
            placeholder="Notes / astuces…"
            className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none resize-none"
          />
          <button onClick={add} className="w-full py-3 rounded-2xl bg-[#8da894] text-white text-sm font-semibold hover:bg-[#5c7d67] transition">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
