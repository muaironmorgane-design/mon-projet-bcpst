import { useState } from "react";

type Category = "Biologie" | "Géologie" | "Chimie" | "Physique" | "Maths" | "Français" | "Anglais" | "Méthodologie";
type Difficulty = "facile" | "moyen" | "difficile" | "tres-difficile";

interface Subject {
  title: string;
  category: Category;
  year: string;
  url: string;
  correctionUrl: string;
  difficulty: Difficulty;
}

const DEFAULT_SUBJECTS: Subject[] = [
  { title: "Guide Méthodologique BCPST — Emmanuel Ahr", category: "Méthodologie", year: "2024", url: "https://cahier-de-prepa.fr/bcpst1-delatour/download?id=459", correctionUrl: "", difficulty: "moyen" },
  { title: "Mitochondrie, Chaîne Respiratoire et Couplage Chimio-Osmotique", category: "Biologie", year: "2023", url: "", correctionUrl: "", difficulty: "difficile" },
  { title: "Les Mécanismes de la Substitution Nucléophile (SN1 et SN2)", category: "Chimie", year: "2024", url: "", correctionUrl: "", difficulty: "moyen" },
  { title: "Algèbre Linéaire — Réduction des Endomorphismes", category: "Maths", year: "2023", url: "", correctionUrl: "", difficulty: "tres-difficile" },
  { title: "La Tectonique des Plaques — Preuves et Mécanismes", category: "Géologie", year: "2024", url: "", correctionUrl: "", difficulty: "moyen" },
  { title: "Thermodynamique — Fonctions d'État et Cycles de Carnot", category: "Physique", year: "2022", url: "", correctionUrl: "", difficulty: "difficile" },
];

const CATEGORY_STYLES: Record<Category, { bg: string; text: string; badge: string; accent: string; icon: string }> = {
  Biologie: { bg: "bg-emerald-50", text: "text-emerald-800", badge: "bg-emerald-100", accent: "border-emerald-300", icon: "🧬" },
  Géologie: { bg: "bg-amber-50", text: "text-amber-800", badge: "bg-amber-100", accent: "border-amber-300", icon: "⛰️" },
  Chimie: { bg: "bg-indigo-50", text: "text-indigo-800", badge: "bg-indigo-100", accent: "border-indigo-300", icon: "⚗️" },
  Physique: { bg: "bg-blue-50", text: "text-blue-800", badge: "bg-blue-100", accent: "border-blue-300", icon: "⚡" },
  Maths: { bg: "bg-rose-50", text: "text-rose-800", badge: "bg-rose-100", accent: "border-rose-300", icon: "➗" },
  Français: { bg: "bg-purple-50", text: "text-purple-800", badge: "bg-purple-100", accent: "border-purple-300", icon: "✍️" },
  Anglais: { bg: "bg-sky-50", text: "text-sky-800", badge: "bg-sky-100", accent: "border-sky-300", icon: "🌐" },
  Méthodologie: { bg: "bg-[#f3f7f5]", text: "text-[#1b3224]", badge: "bg-[#e3eee8]", accent: "border-[#a3caa0]", icon: "📖" },
};

const DIFFICULTY_STARS: Record<Difficulty, string> = { facile: "⭐", moyen: "⭐⭐", difficile: "⭐⭐⭐", "tres-difficile": "⭐⭐⭐⭐" };
const CATEGORIES: Category[] = ["Biologie", "Géologie", "Chimie", "Physique", "Maths", "Français", "Anglais", "Méthodologie"];

function loadSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem("khube_subjects_2026");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...DEFAULT_SUBJECTS];
}

function saveSubjects(s: Subject[]) {
  localStorage.setItem("khube_subjects_2026", JSON.stringify(s));
}

export default function SujetsEntrainement() {
  const [subjects, setSubjects] = useState<Subject[]>(loadSubjects);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [form, setForm] = useState({ title: "", category: "Biologie" as Category, year: "", url: "", correctionUrl: "", difficulty: "moyen" as Difficulty });

  function addSubject() {
    if (!form.title.trim()) { alert("Veuillez saisir un titre."); return; }
    if (form.url && !form.url.startsWith("http")) { alert("Le lien doit commencer par http://"); return; }
    const updated = [...subjects, { ...form, title: form.title.trim() }];
    setSubjects(updated);
    saveSubjects(updated);
    setForm({ title: "", category: "Biologie", year: "", url: "", correctionUrl: "", difficulty: "moyen" });
  }

  function deleteSubject(i: number) {
    if (!confirm("Supprimer ce sujet ?")) return;
    const updated = subjects.filter((_, idx) => idx !== i);
    setSubjects(updated);
    saveSubjects(updated);
  }

  const filtered = filter === "all" ? subjects : subjects.filter((s) => s.category === filter);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* List */}
      <div className="flex-1 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1b3224]">Sujets d'Entraînement</h2>
            <p className="text-sm text-slate-500">Cliquez sur un sujet pour accéder au PDF.</p>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg font-medium transition ${filter === "all" ? "bg-[#1b3224] text-white" : "bg-[#f3f7f5] text-[#1b3224] border border-[#cae0d4] hover:bg-[#e3eee8]"}`}>Tout</button>
            {CATEGORIES.map((c) => {
              const s = CATEGORY_STYLES[c];
              return (
                <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg font-medium transition ${filter === c ? "bg-[#1b3224] text-white" : `${s.bg} ${s.text} border ${s.accent} hover:opacity-80`}`}>
                  {s.icon} {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length === 0 && (
            <div className="col-span-2 text-center p-8 bg-white border border-dashed border-slate-200 rounded-3xl">
              <p className="text-sm text-slate-500">Aucun sujet dans cette catégorie. Ajoutez-en un avec le formulaire !</p>
            </div>
          )}
          {filtered.map((s, i) => {
            const realIdx = subjects.indexOf(s);
            const style = CATEGORY_STYLES[s.category];
            return (
              <div key={i} className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden border-l-4 ${style.accent}`}>
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${style.badge} ${style.text}`}>
                      {style.icon} {s.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">{s.year || "—"}</span>
                  </div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm leading-snug">{s.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{DIFFICULTY_STARS[s.difficulty]}</span>
                    <div className="flex gap-2 items-center">
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-[#1b3224] text-white text-[10px] font-bold rounded-lg hover:bg-[#5c7d67] transition">📄 Sujet</a>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-400 text-[10px] rounded-lg">📄 Sujet</span>
                      )}
                      {s.correctionUrl ? (
                        <a href={s.correctionUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-[#c49b80] text-white text-[10px] font-bold rounded-lg hover:bg-[#9d7053] transition">✅ Correction</a>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-400 text-[10px] rounded-lg">⭕ Correction</span>
                      )}
                      <button onClick={() => deleteSubject(realIdx)} className="p-1.5 text-red-400 hover:text-red-600 transition text-xs">🗑</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add form */}
      <div className="w-full lg:w-80 space-y-4">
        <div className="bg-white p-6 rounded-2xl border border-[#e3eee8] shadow-sm space-y-4 sticky top-24">
          <h3 className="font-serif font-bold text-[#1b3224]">➕ Ajouter un sujet</h3>
          {[
            { label: "Titre du sujet *", key: "title", type: "text", placeholder: "Ex: Analyse — Séries de Fourier" },
            { label: "Année", key: "year", type: "text", placeholder: "Ex: 2024" },
            { label: "Lien PDF (sujet)", key: "url", type: "url", placeholder: "https://…" },
            { label: "Lien PDF (correction)", key: "correctionUrl", type: "url", placeholder: "https://…" },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-xs font-semibold text-slate-600 block mb-1">{field.label}</label>
              <input
                type={field.type}
                value={(form as Record<string, string>)[field.key]}
                onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] focus:ring-2 focus:ring-[#a3caa0] outline-none"
                placeholder={field.placeholder}
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Matière</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))} className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Difficulté</label>
            <select value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as Difficulty }))} className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
              <option value="facile">⭐ Facile</option>
              <option value="moyen">⭐⭐ Moyen</option>
              <option value="difficile">⭐⭐⭐ Difficile</option>
              <option value="tres-difficile">⭐⭐⭐⭐ Très difficile</option>
            </select>
          </div>
          <button onClick={addSubject} className="w-full py-2.5 bg-[#8da894] text-white text-xs font-semibold rounded-xl hover:bg-[#5c7d67] transition shadow-sm">
            Ajouter à la liste
          </button>
        </div>
      </div>
    </div>
  );
}
