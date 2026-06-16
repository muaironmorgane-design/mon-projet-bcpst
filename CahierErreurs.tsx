import { useState } from "react";

type Matiere = "Maths" | "Physique" | "Chimie" | "SVT" | "Biologie" | "Français" | "LV1" | "Autre";
type ErrType = "Étourderie" | "Lacune de cours" | "Mauvaise méthode" | "Calcul" | "Rédaction" | "Autre";

interface Erreur {
  id: string; date: string; matiere: Matiere; type: ErrType;
  description: string; correction: string; resolved: boolean;
}

const MATIERES: Matiere[] = ["Maths","Physique","Chimie","SVT","Biologie","Français","LV1","Autre"];
const TYPES: ErrType[] = ["Étourderie","Lacune de cours","Mauvaise méthode","Calcul","Rédaction","Autre"];
const MAT_COLORS: Record<Matiere, string> = {
  "Maths": "bg-blue-50 text-blue-800 border-blue-200",
  "Physique": "bg-purple-50 text-purple-800 border-purple-200",
  "Chimie": "bg-orange-50 text-orange-800 border-orange-200",
  "SVT": "bg-emerald-50 text-emerald-800 border-emerald-200",
  "Biologie": "bg-green-50 text-green-800 border-green-200",
  "Français": "bg-rose-50 text-rose-800 border-rose-200",
  "LV1": "bg-yellow-50 text-yellow-800 border-yellow-200",
  "Autre": "bg-slate-50 text-slate-800 border-slate-200",
};

function load(): Erreur[] {
  try { return JSON.parse(localStorage.getItem("khube_erreurs_v1") || "[]"); } catch { return []; }
}
function save(d: Erreur[]) { localStorage.setItem("khube_erreurs_v1", JSON.stringify(d)); }

export default function CahierErreurs() {
  const [erreurs, setErreurs] = useState<Erreur[]>(load);
  const [matiere, setMatiere] = useState<Matiere>("Maths");
  const [type, setType] = useState<ErrType>("Étourderie");
  const [description, setDescription] = useState("");
  const [correction, setCorrection] = useState("");
  const [filterMat, setFilterMat] = useState<Matiere | "all">("all");
  const [showResolved, setShowResolved] = useState(false);

  function add() {
    if (!description.trim()) return;
    const e: Erreur = {
      id: `e_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      matiere, type, description: description.trim(),
      correction: correction.trim(), resolved: false,
    };
    const updated = [e, ...erreurs];
    setErreurs(updated); save(updated);
    setDescription(""); setCorrection("");
  }

  function toggle(id: string) {
    const updated = erreurs.map(e => e.id === id ? { ...e, resolved: !e.resolved } : e);
    setErreurs(updated); save(updated);
  }

  function del(id: string) {
    const updated = erreurs.filter(e => e.id !== id);
    setErreurs(updated); save(updated);
  }

  const filtered = erreurs
    .filter(e => filterMat === "all" || e.matiere === filterMat)
    .filter(e => showResolved ? true : !e.resolved);

  const stats = MATIERES.map(m => ({ m, count: erreurs.filter(e => e.matiere === m && !e.resolved).length })).filter(s => s.count > 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224] mb-1">📕 Cahier d'Erreurs</h2>
        <p className="text-sm text-slate-500 mb-6">Recense tes erreurs récurrentes — c'est ce qui transforme un 12 en 16.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Matière</label>
            <select value={matiere} onChange={e => setMatiere(e.target.value as Matiere)}
              className="w-full text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
              {MATIERES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Type d'erreur</label>
            <select value={type} onChange={e => setType(e.target.value as ErrType)}
              className="w-full text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Description de l'erreur *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="Ex : J'ai oublié de vérifier le signe lors de la factorisation…"
              className="w-full text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none resize-none focus:ring-2 focus:ring-[#a3caa0]" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Ce qu'il faut faire à la place</label>
            <textarea value={correction} onChange={e => setCorrection(e.target.value)} rows={2}
              placeholder="Ex : Toujours vérifier le discriminant avant de factoriser…"
              className="w-full text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none resize-none focus:ring-2 focus:ring-[#a3caa0]" />
          </div>
        </div>

        <button onClick={add} className="w-full py-2.5 bg-[#1b3224] text-white text-xs font-bold rounded-xl hover:bg-[#5c7d67] transition">
          + Ajouter cette erreur
        </button>
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-[#e3eee8] shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Erreurs actives par matière</p>
          <div className="flex flex-wrap gap-2">
            {stats.map(s => (
              <button key={s.m} onClick={() => setFilterMat(filterMat === s.m ? "all" : s.m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${MAT_COLORS[s.m]} ${filterMat === s.m ? "ring-2 ring-offset-1 ring-[#8da894]" : ""}`}>
                {s.m} · {s.count}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex justify-between items-center">
        <h3 className="font-serif font-bold text-[#1b3224]">
          {filtered.length} erreur{filtered.length > 1 ? "s" : ""} {showResolved ? "" : "actives"}
        </h3>
        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
          <input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} />
          Afficher les résolues
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <div className="text-4xl mb-2">✅</div>
          <p>{erreurs.length === 0 ? "Aucune erreur enregistrée pour l'instant." : "Toutes les erreurs de cette sélection sont résolues !"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => (
            <div key={e.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${e.resolved ? "opacity-60" : ""}`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b ${MAT_COLORS[e.matiere]}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${MAT_COLORS[e.matiere]}`}>{e.matiere}</span>
                  <span className="text-[10px] text-slate-500">{e.type}</span>
                  {e.resolved && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">✓ Résolue</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggle(e.id)}
                    className={`text-[10px] px-2 py-1 rounded-lg border font-semibold transition ${e.resolved ? "border-slate-200 text-slate-400 hover:bg-slate-50" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}>
                    {e.resolved ? "↩ Réouvrir" : "✓ Résolu"}
                  </button>
                  <button onClick={() => del(e.id)} className="text-[10px] text-red-400 hover:text-red-600 px-1">🗑</button>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm text-slate-700">{e.description}</p>
                {e.correction && (
                  <div className="flex gap-2 items-start bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <span className="text-emerald-500 shrink-0">✅</span>
                    <p className="text-xs text-emerald-800">{e.correction}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
