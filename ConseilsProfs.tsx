import { useEffect, useMemo, useState } from "react";

type ConseilProf = {
  id: string;
  prof: string;
  date: string;
  subject: string;
  text: string;
};

const STORAGE = "khube_conseils_profs_v1";
const SUBJECTS = ["Maths", "Biologie", "Chimie", "Physique", "Géologie", "Géographie", "Français", "Anglais", "Général"];

function load(): ConseilProf[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [
    { id: "c1", prof: "Exemple", date: "2026-09-01", subject: "Général", text: "Relis ton sujet avant de commencer : identifie le type d'exercice immédiatement." },
    { id: "c2", prof: "Exemple", date: "2026-09-01", subject: "Général", text: "Respire avant de répondre et formule toujours ta première phrase." },
  ];
}

export default function ConseilsProfs() {
  const [conseils, setConseils] = useState<ConseilProf[]>(load);
  const [sortProf, setSortProf] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    prof: "",
    date: new Date().toISOString().split("T")[0],
    subject: "Général",
    text: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(conseils));
  }, [conseils]);

  const profs = useMemo(() => {
    const set = new Set(conseils.map((c) => c.prof).filter(Boolean));
    return Array.from(set).sort();
  }, [conseils]);

  const filtered = useMemo(() => {
    let list = [...conseils].sort((a, b) => b.date.localeCompare(a.date));
    if (sortProf !== "all") list = list.filter((c) => c.prof === sortProf);
    return list;
  }, [conseils, sortProf]);

  function save() {
    if (!form.text.trim() || !form.prof.trim()) return;
    if (editingId) {
      setConseils((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, prof: form.prof.trim(), date: form.date, subject: form.subject, text: form.text.trim() }
            : c
        )
      );
      setEditingId(null);
    } else {
      setConseils((prev) => [
        ...prev,
        { id: `cp_${Date.now()}`, prof: form.prof.trim(), date: form.date, subject: form.subject, text: form.text.trim() },
      ]);
    }
    setForm({ prof: "", date: new Date().toISOString().split("T")[0], subject: "Général", text: "" });
  }

  function startEdit(c: ConseilProf) {
    setEditingId(c.id);
    setForm({ prof: c.prof, date: c.date, subject: c.subject, text: c.text });
  }

  function remove(id: string) {
    if (!confirm("Supprimer ce conseil ?")) return;
    setConseils((prev) => prev.filter((c) => c.id !== id));
    if (editingId === id) setEditingId(null);
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224]">🧑‍🏫 Conseils des profs</h2>
        <p className="text-sm text-slate-500">Ajoute, modifie et trie les conseils par professeur et matière.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-[#1b3224]">Filtrer par prof :</span>
            <select
              value={sortProf}
              onChange={(e) => setSortProf(e.target.value)}
              className="p-2 text-sm rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none"
            >
              <option value="all">Tous les profs</option>
              {profs.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <span className="text-xs text-slate-400">{filtered.length} conseil(s)</span>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun conseil pour ce filtre.</p>
          ) : (
            filtered.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-3xl border border-[#e3eee8] shadow-sm group">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#1b3224]">{c.prof}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e8f4ec] text-[#5c7d67] font-bold">{c.subject}</span>
                      <span className="text-xs text-slate-400">{new Date(c.date).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <p className="text-sm text-slate-700 mt-2 leading-relaxed">{c.text}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => startEdit(c)} className="text-xs text-[#5c7d67]">✏️</button>
                    <button onClick={() => remove(c.id)} className="text-xs text-red-400">🗑</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm space-y-4 self-start sticky top-24">
          <h3 className="font-semibold text-[#1b3224]">{editingId ? "✏️ Modifier" : "➕ Ajouter un conseil"}</h3>
          <input
            value={form.prof}
            onChange={(e) => setForm((f) => ({ ...f, prof: e.target.value }))}
            placeholder="Nom du prof"
            className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none"
          />
          <select
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none"
          >
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <textarea
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            rows={4}
            placeholder="Le conseil du prof…"
            className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none resize-none"
          />
          <div className="flex gap-2">
            <button onClick={save} className="flex-1 py-3 rounded-2xl bg-[#8da894] text-white text-sm font-semibold hover:bg-[#5c7d67]">
              {editingId ? "Mettre à jour" : "Enregistrer"}
            </button>
            {editingId && (
              <button onClick={() => { setEditingId(null); setForm({ prof: "", date: new Date().toISOString().split("T")[0], subject: "Général", text: "" }); }} className="px-4 py-3 rounded-2xl bg-slate-200 text-sm">
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
