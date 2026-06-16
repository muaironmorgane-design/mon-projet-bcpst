import { useState } from "react";

interface FAQ { id: string; question: string; answer: string; category: string; pinned: boolean; }

const CATS = ["Méthode", "Concours", "Sciences", "Maths", "Français", "Oraux", "Vie de prépa", "Autre"];

const DEFAULTS: Omit<FAQ, "id" | "pinned">[] = [
  { question: "Comment bien gérer le stress le jour du concours ?", category: "Concours", answer: "Arrive avec 30min d'avance pour t'installer. Lis d'abord tout le sujet avant d'écrire. Si tu bloques, passe à la question suivante et reviens. Rappelle-toi : tout le monde est stressé, c'est normal." },
  { question: "Comment rédiger une introduction en dissertation de Français ?", category: "Français", answer: "1. Amorce (contextualisation du sujet) → 2. Définition des termes → 3. Problématique → 4. Annonce du plan. Vise 15-20 lignes claires, pas une introduction fleuve." },
  { question: "Quelle est la différence entre admissibilité et admission ?", category: "Concours", answer: "L'admissibilité : tu passes les écrits et tu es sélectionnée pour passer les oraux (khôlles). L'admission : tu passes les oraux et tu es retenue dans une école. Les deux barrières comptent !" },
  { question: "Combien de temps consacrer aux révisions par jour ?", category: "Méthode", answer: "En 5/2 : vise 8-10h de travail effectif max. Au-delà tu perds en qualité. Dors 7-8h, c'est non-négociable pour la mémoire. Inclure du sport 3x/semaine aide énormément." },
];

function load(): FAQ[] {
  try {
    const stored = JSON.parse(localStorage.getItem("khube_faq_v1") || "[]") as FAQ[];
    if (stored.length) return stored;
  } catch {}
  return DEFAULTS.map((d, i) => ({ ...d, id: `faq_${i}`, pinned: i < 2 }));
}
function save(d: FAQ[]) { localStorage.setItem("khube_faq_v1", JSON.stringify(d)); }

export default function FAQPerso() {
  const [items, setItems] = useState<FAQ[]>(load);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("Méthode");

  function add() {
    if (!question.trim()) return;
    const f: FAQ = { id: `faq_${Date.now()}`, question: question.trim(), answer: answer.trim(), category, pinned: false };
    const updated = [...items, f]; setItems(updated); save(updated);
    setQuestion(""); setAnswer(""); setShowForm(false);
  }
  function togglePin(id: string) {
    const updated = items.map(f => f.id === id ? { ...f, pinned: !f.pinned } : f);
    setItems(updated); save(updated);
  }
  function del(id: string) {
    const updated = items.filter(f => f.id !== id); setItems(updated); save(updated);
  }

  const filtered = items
    .filter(f => filterCat === "all" || f.category === filterCat)
    .filter(f => !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1b3224] mb-1">❓ FAQ Personnelle</h2>
            <p className="text-sm text-slate-500">Compile ici les réponses aux questions que tu poses souvent ou que tu te poses à toi-même.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-[#8da894] text-white text-xs font-bold rounded-xl hover:bg-[#5c7d67] transition">
            + Nouvelle Q&A
          </button>
        </div>
        <div className="mt-4 flex gap-3 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher…"
            className="flex-1 min-w-0 text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none focus:ring-2 focus:ring-[#a3caa0]" />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
            <option value="all">Toutes catégories</option>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-3xl border-2 border-[#8da894] shadow-md space-y-4">
          <h3 className="font-serif font-bold text-[#1b3224]">Nouvelle question</h3>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
          <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Question *"
            className="w-full text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none focus:ring-2 focus:ring-[#a3caa0]" />
          <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={4} placeholder="Réponse (tu pourras la compléter plus tard)"
            className="w-full text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none resize-none" />
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 text-slate-500 text-xs rounded-xl">Annuler</button>
            <button onClick={add} className="flex-1 py-2 bg-[#1b3224] text-white text-xs font-bold rounded-xl hover:bg-[#5c7d67] transition">Enregistrer</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">Aucune question trouvée.</div>}
        {filtered.map(f => (
          <div key={f.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${f.pinned ? "border-[#c49b80]" : "border-[#e3eee8]"}`}>
            <button onClick={() => setExpanded(expanded === f.id ? null : f.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#fafcfb] transition">
              {f.pinned && <span className="text-[#c49b80] shrink-0">📌</span>}
              <span className="text-[10px] bg-[#e3eee8] text-[#5c7d67] px-2 py-0.5 rounded-full font-semibold shrink-0">{f.category}</span>
              <span className="flex-1 text-sm font-semibold text-[#1b3224]">{f.question}</span>
              <span className="text-slate-400 shrink-0">{expanded === f.id ? "▲" : "▼"}</span>
            </button>
            {expanded === f.id && (
              <div className="px-5 pb-4 border-t border-[#f3f7f5]">
                {f.answer ? (
                  <p className="text-sm text-slate-700 leading-relaxed mt-3 whitespace-pre-wrap">{f.answer}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic mt-3">Pas encore de réponse — modifie cette entrée pour l'ajouter.</p>
                )}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => togglePin(f.id)}
                    className={`text-[10px] px-3 py-1.5 rounded-lg border font-semibold transition ${f.pinned ? "border-[#c49b80] text-[#c49b80]" : "border-[#cae0d4] text-slate-500 hover:border-[#c49b80]"}`}>
                    {f.pinned ? "📌 Épinglée" : "📌 Épingler"}
                  </button>
                  <button onClick={() => del(f.id)} className="text-[10px] text-red-400 hover:text-red-600 px-2 py-1 rounded-lg border border-red-100">🗑 Supprimer</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
