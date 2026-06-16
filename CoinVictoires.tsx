import { useState } from "react";

type Category = "note" | "notion" | "exercice" | "perso" | "autre";

interface Victory {
  id: string; date: string; text: string; category: Category;
}

const CATS: { value: Category; emoji: string; label: string; color: string }[] = [
  { value: "note",     emoji: "📊", label: "Bonne note",     color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "notion",   emoji: "💡", label: "Notion comprise", color: "bg-[#e3eee8] text-[#1b3224] border-[#a3caa0]" },
  { value: "exercice", emoji: "🔥", label: "Exercice réussi", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { value: "perso",    emoji: "🧠", label: "Victoire perso",  color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "autre",    emoji: "⭐", label: "Autre",           color: "bg-amber-50 text-amber-700 border-amber-200" },
];

function load(): Victory[] {
  try { return JSON.parse(localStorage.getItem("khube_victoires_v1") || "[]"); } catch { return []; }
}
function save(d: Victory[]) { localStorage.setItem("khube_victoires_v1", JSON.stringify(d)); }
function fmt(iso: string) { return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long" }); }

export default function CoinVictoires() {
  const [victories, setVictories] = useState<Victory[]>(load);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("notion");
  const [filter, setFilter] = useState<Category | "all">("all");

  function add() {
    if (!text.trim()) return;
    const v: Victory = { id: `v_${Date.now()}`, date: new Date().toISOString().split("T")[0], text: text.trim(), category };
    const updated = [v, ...victories];
    setVictories(updated); save(updated); setText("");
  }

  function del(id: string) {
    const updated = victories.filter(v => v.id !== id);
    setVictories(updated); save(updated);
  }

  const filtered = filter === "all" ? victories : victories.filter(v => v.category === filter);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224] mb-1">🏆 Le Coin des Victoires</h2>
        <p className="text-sm text-slate-500 mb-6">Chaque petite victoire compte. Note-les ici pour ne jamais oublier que tu progresses.</p>

        <div className="flex gap-2 flex-wrap mb-3">
          {CATS.map(c => (
            <button key={c.value} onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${c.color} ${category === c.value ? "ring-2 ring-offset-1 ring-[#8da894]" : "opacity-60 hover:opacity-100"}`}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            placeholder="J'ai réussi à… J'ai enfin compris… J'ai obtenu…"
            className="flex-1 text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none focus:ring-2 focus:ring-[#a3caa0]" />
          <button onClick={add}
            className="px-5 py-3 bg-[#c49b80] text-white text-xs font-bold rounded-xl hover:bg-[#9d7053] transition shadow-sm">
            + Ajouter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {CATS.map(c => {
          const count = victories.filter(v => v.category === c.value).length;
          return (
            <button key={c.value} onClick={() => setFilter(filter === c.value ? "all" : c.value)}
              className={`bg-white rounded-2xl p-4 text-center border shadow-sm transition ${filter === c.value ? "border-[#8da894] ring-1 ring-[#8da894]" : "border-[#e3eee8] hover:border-[#a3caa0]"}`}>
              <div className="text-2xl mb-1">{c.emoji}</div>
              <div className="text-lg font-bold text-[#1b3224] font-serif">{count}</div>
              <div className="text-[10px] text-slate-500">{c.label}</div>
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="text-5xl mb-3">🌱</div>
          <p>Aucune victoire ici pour l'instant — la première arrive bientôt !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filter !== "all" && (
            <button onClick={() => setFilter("all")} className="text-xs text-[#5c7d67] underline">← Voir tout</button>
          )}
          {filtered.map(v => {
            const cat = CATS.find(c => c.value === v.category)!;
            return (
              <div key={v.id} className={`bg-white rounded-2xl p-4 border shadow-sm flex items-start gap-3 ${cat.color}`}>
                <span className="text-xl shrink-0 mt-0.5">{cat.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{v.text}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{fmt(v.date)}</p>
                </div>
                <button onClick={() => del(v.id)} className="text-xs opacity-40 hover:opacity-80 shrink-0">🗑</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
