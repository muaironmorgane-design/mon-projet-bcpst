import { useState } from "react";

interface Item { id: string; label: string; done: boolean; category: string; }

const DEFAULT_ITEMS: Omit<Item, "id" | "done">[] = [
  // Administratif
  { label: "Convocation(s) imprimées et vérifiées", category: "📄 Administratif" },
  { label: "Pièce d'identité valide (CNI ou passeport)", category: "📄 Administratif" },
  { label: "Numéro de candidat noté quelque part", category: "📄 Administratif" },
  { label: "Confirmation de logement (hôtel / chez quelqu'un)", category: "📄 Administratif" },
  // Matériel
  { label: "Calculatrice autorisée + piles neuves", category: "🎒 Matériel" },
  { label: "2 stylos noirs + 1 stylo rouge / crayon de papier", category: "🎒 Matériel" },
  { label: "Règle, compas, rapporteur", category: "🎒 Matériel" },
  { label: "Eau et en-cas (barre de céréales, fruits secs)", category: "🎒 Matériel" },
  // Logistique
  { label: "Itinéraire vérifié (bus / train / voiture)", category: "🚆 Logistique" },
  { label: "Départ calculé avec 30min de marge minimum", category: "🚆 Logistique" },
  { label: "Numéro du centre de concours sauvegardé", category: "🚆 Logistique" },
  { label: "Plan du campus imprimé ou sur téléphone", category: "🚆 Logistique" },
  // Bien-être
  { label: "Dîner léger la veille (pas d'alcool)", category: "🌙 Veille" },
  { label: "Coucher tôt — objectif 8h de sommeil", category: "🌙 Veille" },
  { label: "Révisions légères seulement (pas de nouveaux chapitres)", category: "🌙 Veille" },
  { label: "Réveil positionné + alarme de secours", category: "🌙 Veille" },
  { label: "Tenue confortable choisie à l'avance", category: "🌙 Veille" },
  // Oraux / TP
  { label: "Trousse à dissection prête", category: "🎤 Oraux / TP" },
  { label: "Vernis transparent pour montage et schéma", category: "🎤 Oraux / TP" },
  { label: "Lunettes de protection propres", category: "🎤 Oraux / TP" },
  { label: "Lames de rasoir supplémentaires", category: "🎤 Oraux / TP" },
  { label: "Blouse propre et confortable", category: "🎤 Oraux / TP" },
  { label: "Liste des khôlles passées relue", category: "🎤 Oraux" },
  { label: "Fiches de synthèse récapitulées", category: "🎤 Oraux" },
  { label: "Exercices types refaits à blanc", category: "🎤 Oraux" },
];

function load(): Item[] {
  try {
    const stored = JSON.parse(localStorage.getItem("khube_checklist_v1") || "[]") as Item[];
    if (stored.length) return stored;
  } catch {}
  return DEFAULT_ITEMS.map((item, i) => ({ ...item, id: `cl_${i}`, done: false }));
}
function save(d: Item[]) { localStorage.setItem("khube_checklist_v1", JSON.stringify(d)); }

export default function ChecklistVeille() {
  const [items, setItems] = useState<Item[]>(load);
  const [newLabel, setNewLabel] = useState("");
  const [newCat, setNewCat] = useState("📄 Administratif");

  function toggle(id: string) {
    const updated = items.map(i => i.id === id ? { ...i, done: !i.done } : i);
    setItems(updated); save(updated);
  }
  function addItem() {
    if (!newLabel.trim()) return;
    const updated = [...items, { id: `cl_${Date.now()}`, label: newLabel.trim(), done: false, category: newCat }];
    setItems(updated); save(updated); setNewLabel("");
  }
  function reset() {
    const updated = items.map(i => ({ ...i, done: false }));
    setItems(updated); save(updated);
  }

  const cats = [...new Set(items.map(i => i.category))];
  const doneCount = items.filter(i => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1b3224] mb-1">☑️ Checklist Veille de Concours</h2>
            <p className="text-sm text-slate-500">Ne rien oublier le jour J — coche tout avant de dormir !</p>
          </div>
          <button onClick={reset} className="text-xs border border-[#cae0d4] text-slate-500 px-4 py-2 rounded-xl hover:bg-[#f3f7f5] transition">
            ↺ Tout réinitialiser
          </button>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>{doneCount} / {items.length} éléments cochés</span>
            <span className={pct === 100 ? "text-emerald-600 font-bold" : ""}>{pct}% {pct === 100 ? "✅ Prête !" : ""}</span>
          </div>
          <div className="h-3 bg-[#e3eee8] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: pct === 100 ? "#8da894" : "linear-gradient(to right, #c49b80, #8da894)" }} />
          </div>
        </div>
      </div>

      {cats.map(cat => {
        const catItems = items.filter(i => i.category === cat);
        const doneCat = catItems.filter(i => i.done).length;
        return (
          <div key={cat} className="bg-white rounded-3xl border border-[#e3eee8] shadow-sm overflow-hidden">
            <div className={`px-5 py-3 flex justify-between items-center border-b border-[#f3f7f5] ${doneCat === catItems.length && catItems.length > 0 ? "bg-emerald-50 border-emerald-100" : "bg-[#f3f7f5]"}`}>
              <h3 className="font-semibold text-sm text-[#1b3224]">{cat}</h3>
              <span className="text-xs text-slate-400">{doneCat}/{catItems.length}</span>
            </div>
            <div className="divide-y divide-[#f3f7f5]">
              {catItems.map(item => (
                <label key={item.id} className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-[#fafcfb] transition">
                  <input type="checkbox" checked={item.done} onChange={() => toggle(item.id)}
                    className="w-4 h-4 accent-[#8da894] shrink-0" />
                  <span className={`text-sm ${item.done ? "line-through text-slate-400" : "text-slate-700"}`}>{item.label}</span>
                  {item.done && <span className="ml-auto text-emerald-500 text-xs shrink-0">✓</span>}
                </label>
              ))}
            </div>
          </div>
        );
      })}

      {/* Add custom */}
      <div className="bg-white p-5 rounded-3xl border border-[#e3eee8] shadow-sm space-y-3">
        <h3 className="font-serif font-bold text-[#1b3224] text-sm">+ Ajouter un élément personnalisé</h3>
        <div className="flex gap-3 flex-wrap">
          <select value={newCat} onChange={e => setNewCat(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
          <input value={newLabel} onChange={e => setNewLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && addItem()}
            placeholder="Nouvelle tâche…"
            className="flex-1 text-sm p-2.5 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none focus:ring-2 focus:ring-[#a3caa0]" />
          <button onClick={addItem} className="px-4 py-2.5 bg-[#8da894] text-white text-xs font-bold rounded-xl hover:bg-[#5c7d67] transition">
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
