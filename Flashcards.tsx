import { useState } from "react";

interface Deck { id: string; name: string; subject: string; count: number; ankiUrl: string; color: string; themes: string[]; }

const COLORS = ["bg-blue-50 border-blue-200", "bg-emerald-50 border-emerald-200", "bg-purple-50 border-purple-200",
  "bg-orange-50 border-orange-200", "bg-rose-50 border-rose-200", "bg-amber-50 border-amber-200"];

const DEFAULTS: Omit<Deck, "id">[] = [
  { name: "Maths — Analyse", subject: "Maths", count: 120, ankiUrl: "", color: COLORS[0], themes: ["Suites", "Intégrales", "Équations diff.", "Développements limités", "Fonctions classiques"] },
  { name: "Biologie cellulaire", subject: "Biologie", count: 200, ankiUrl: "", color: COLORS[1], themes: ["Membrane plasmique", "Mitochondries", "Cycle cellulaire", "ADN-ARN", "Ribosomes"] },
  { name: "Chimie organique", subject: "Chimie", count: 150, ankiUrl: "", color: COLORS[2], themes: ["Groupes fonctionnels", "Mécanismes réactionnels", "Stéréochimie", "Spectroscopie IR/RMN"] },
  { name: "Physique — Électromagnétisme", subject: "Physique", count: 90, ankiUrl: "", color: COLORS[3], themes: ["Lois de Maxwell", "Circuits RLC", "Ondes EM", "Optique géométrique"] },
];

function load(): Deck[] {
  try {
    const stored = JSON.parse(localStorage.getItem("khube_flashcards_v1") || "[]") as Deck[];
    if (stored.length) return stored;
  } catch {}
  return DEFAULTS.map((d, i) => ({ ...d, id: `fc_${i}` }));
}
function save(d: Deck[]) { localStorage.setItem("khube_flashcards_v1", JSON.stringify(d)); }

export default function Flashcards() {
  const [decks, setDecks] = useState<Deck[]>(load);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [count, setCount] = useState(50);
  const [ankiUrl, setAnkiUrl] = useState("");
  const [themes, setThemes] = useState("");
  const [colorIdx, setColorIdx] = useState(0);

  function add() {
    if (!name.trim()) return;
    const d: Deck = {
      id: `fc_${Date.now()}`, name: name.trim(), subject: subject.trim(), count,
      ankiUrl: ankiUrl.trim(), color: COLORS[colorIdx],
      themes: themes.split(",").map(t => t.trim()).filter(Boolean),
    };
    const updated = [...decks, d]; setDecks(updated); save(updated);
    setName(""); setSubject(""); setAnkiUrl(""); setThemes(""); setShowForm(false);
  }

  function del(id: string) {
    const updated = decks.filter(d => d.id !== id); setDecks(updated); save(updated);
  }

  const totalCards = decks.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1b3224] mb-1">🗂️ Banque de Flashcards</h2>
            <p className="text-sm text-slate-500">Gère tes paquets Anki et les thèmes clés à réviser régulièrement.</p>
            <p className="text-xs text-slate-400 mt-1">{decks.length} paquet{decks.length > 1 ? "s" : ""} · {totalCards} cartes</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-[#8da894] text-white text-xs font-bold rounded-xl hover:bg-[#5c7d67] transition">
            + Nouveau paquet
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-3xl border-2 border-[#8da894] shadow-md space-y-4">
          <h3 className="font-serif font-bold text-[#1b3224]">Nouveau paquet</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom du paquet *"
              className="text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" />
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Matière"
              className="text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" />
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-600 shrink-0">Nb de cartes :</label>
              <input type="number" value={count} onChange={e => setCount(+e.target.value)} min={1}
                className="flex-1 text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" />
            </div>
            <input value={ankiUrl} onChange={e => setAnkiUrl(e.target.value)} placeholder="Lien Anki (optionnel)"
              className="text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" />
            <div className="md:col-span-2">
              <input value={themes} onChange={e => setThemes(e.target.value)} placeholder="Thèmes séparés par des virgules (ex: Suites, Intégrales)"
                className="w-full text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" />
            </div>
            <div className="flex gap-2">
              {COLORS.map((c, i) => (
                <button key={i} onClick={() => setColorIdx(i)}
                  className={`w-7 h-7 rounded-full border-2 transition ${c.split(" ")[0]} ${colorIdx === i ? "border-[#1b3224] scale-110" : "border-transparent"}`} />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 text-slate-500 text-xs rounded-xl">Annuler</button>
            <button onClick={add} className="flex-1 py-2 bg-[#1b3224] text-white text-xs font-bold rounded-xl hover:bg-[#5c7d67] transition">Créer le paquet</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {decks.map(deck => (
          <div key={deck.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${deck.color}`}>
            <button onClick={() => setExpanded(expanded === deck.id ? null : deck.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/40 transition">
              <div className="flex-1">
                <p className="font-semibold text-[#1b3224]">{deck.name}</p>
                <p className="text-xs text-slate-500">{deck.subject} · {deck.count} cartes</p>
              </div>
              <span className="text-slate-400">{expanded === deck.id ? "▲" : "▼"}</span>
            </button>
            {expanded === deck.id && (
              <div className="px-5 pb-4 border-t border-white/50 space-y-3 bg-white/30">
                {deck.themes.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Thèmes clés</p>
                    <div className="flex flex-wrap gap-1.5">
                      {deck.themes.map((t, i) => (
                        <span key={i} className="text-xs bg-white/80 px-2 py-1 rounded-lg border border-current/20 text-slate-700">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  {deck.ankiUrl && (
                    <a href={deck.ankiUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 bg-[#1b3224] text-white rounded-lg font-semibold hover:bg-[#5c7d67] transition">
                      🔗 Ouvrir Anki
                    </a>
                  )}
                  <button onClick={() => del(deck.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 rounded-lg border border-red-100">🗑 Supprimer</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
