import { useState, useEffect } from "react";

type Subj = { id: string; name: string; ecrit: number; oral: number };

const DEFAULTS: Subj[] = [
  { id: "s_bio", name: "Biologie", ecrit: 5, oral: 4 },
  { id: "s_phys", name: "Physique", ecrit: 4, oral: 2 },
  { id: "s_chim", name: "Chimie", ecrit: 4, oral: 1 },
  { id: "s_hum", name: "Humanités", ecrit: 4, oral: 0 },
  { id: "s_methods", name: "Méthodes de calcul", ecrit: 2, oral: 0 },
  { id: "s_model", name: "Modélisation", ecrit: 2, oral: 2 },
];

const PRESET_CPGE_BCPST_VETO: Subj[] = [
  // ÉPREUVES ÉCRITES (admissibilité)
  { id: "e_bio_synth", name: "Biologie — Epreuve de synthèse (ÉCRIT)", ecrit: 5, oral: 0 },
  { id: "e_svt_doc", name: "SVT — Support documents (ÉCRIT)", ecrit: 5, oral: 0 },
  { id: "e_chim", name: "Chimie (ÉCRIT)", ecrit: 4, oral: 0 },
  { id: "e_phys", name: "Physique (ÉCRIT)", ecrit: 4, oral: 0 },
  { id: "e_hum", name: "Humanités (ÉCRIT)", ecrit: 4, oral: 0 },
  { id: "e_methods", name: "Méthodes de calcul & raisonnement (ÉCRIT)", ecrit: 2, oral: 0 },
  { id: "e_model", name: "Modélisation math. & Informatique (ÉCRIT)", ecrit: 2, oral: 0 },
  { id: "e_ang", name: "Anglais (ÉCRIT)", ecrit: 0, oral: 0 },
  { id: "e_geo", name: "Géographie (ÉCRIT)", ecrit: 0, oral: 0 },
  // ÉPREUVES ORALES (admission)
  { id: "o_bio_prat", name: "Biologie pratique — biogéosciences (ORAL)", ecrit: 0, oral: 4 },
  { id: "o_bio_oral", name: "Biologie — biogéosciences (ORAL)", ecrit: 0, oral: 4 },
  { id: "o_phys_chim", name: "Physique-Chimie (ORAL)", ecrit: 0, oral: 4 },
  { id: "o_tipe", name: "TIPE — Entretien professionnel & scientifique (ORAL)", ecrit: 0, oral: 4 },
  { id: "o_math_prat", name: "Mathématiques pratiques & Informatique (ORAL)", ecrit: 0, oral: 2 },
  { id: "o_geo", name: "Géographie (ORAL)", ecrit: 0, oral: 2 },
];

function load(): Subj[] {
  try {
    const raw = localStorage.getItem("khube_coeffs_v1");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULTS;
}

function save(items: Subj[]) {
  localStorage.setItem("khube_coeffs_v1", JSON.stringify(items));
}

export default function CoefficientsConcours() {
  const [items, setItems] = useState<Subj[]>(load);
  const [weightEcrit, setWeightEcrit] = useState(0.7);
  const [importText, setImportText] = useState("");

  useEffect(() => save(items), [items]);

  function update(id: string, patch: Partial<Subj>) {
    setItems((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p));
  }

  function addSubject() {
    const id = `s_${Date.now()}`;
    setItems((p) => [...p, { id, name: "Nouvelle matière", ecrit: 0, oral: 0 }]);
  }

  function removeSubject(id: string) {
    setItems((p) => p.filter((s) => s.id !== id));
  }

  function importJSON() {
    try {
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed)) { setItems(parsed.map((s, i) => ({ id: s.id ?? `s_imp_${i}`, name: s.name ?? s.matiere ?? "Matière", ecrit: Number(s.ecrit || s.ecrits || 0), oral: Number(s.oral || 0) }))); }
    } catch (e) { alert("JSON invalide"); }
  }

  function exportJSON() {
    const txt = JSON.stringify(items, null, 2);
    setImportText(txt);
    navigator.clipboard?.writeText(txt).catch(() => {});
    alert("JSON copié dans le presse-papiers (et placé dans le champ d'import)");
  }

  const byEcrit = [...items].sort((a, b) => b.ecrit - a.ecrit || b.oral - a.oral);
  const byOral = [...items].sort((a, b) => b.oral - a.oral || b.ecrit - a.ecrit);
  const byCombined = [...items].map((s) => ({ ...s, score: s.ecrit * weightEcrit + s.oral * (1 - weightEcrit) })).sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224]">Coefficients Concours — CPGE BCPST (éditeur)</h2>
        <p className="text-sm text-slate-500">Éditez les coefficients écrits / oraux et obtenez un ordre de priorité.</p>

        <div className="mt-4 grid gap-3">
          <div className="flex items-center gap-3">
            <button onClick={addSubject} className="px-3 py-2 bg-[#8da894] text-white rounded-xl text-xs font-semibold">Ajouter matière</button>
            <button onClick={() => { setItems(DEFAULTS); }} className="px-3 py-2 bg-white border rounded-xl text-xs">Charger valeurs par défaut</button>
            <button onClick={() => { setItems(PRESET_CPGE_BCPST_VETO); }} className="px-3 py-2 bg-white border rounded-xl text-xs">Charger CPGE BCPST (VETO)</button>
            <button onClick={exportJSON} className="px-3 py-2 bg-white border rounded-xl text-xs">Exporter JSON</button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#e3eee8]">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-[#f3f7f5] sticky top-0">
                <tr className="text-xs text-slate-600">
                  <th className="min-w-[280px] px-4 py-3 font-semibold">Matière</th>
                  <th className="w-20 px-4 py-3 font-semibold text-center">Écrits</th>
                  <th className="w-20 px-4 py-3 font-semibold text-center">Oraux</th>
                  <th className="w-24 px-4 py-3 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="max-h-[400px] divide-y divide-[#e3eee8]">
                {items.map((s) => (
                  <tr key={s.id} className="hover:bg-[#f9fdf8] transition-colors">
                    <td className="px-4 py-3">
                      <input 
                        value={s.name} 
                        onChange={(e) => update(s.id, { name: e.target.value })} 
                        className="w-full p-2 rounded-lg border border-[#cae0d4] text-sm outline-none focus:ring-2 focus:ring-[#8da894]" 
                        placeholder="Nom matière"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="number" 
                        min="0" 
                        value={s.ecrit} 
                        onChange={(e) => update(s.id, { ecrit: parseInt(e.target.value) || 0 })} 
                        className="w-full p-2 rounded-lg border border-[#cae0d4] text-sm text-center outline-none focus:ring-2 focus:ring-[#8da894]"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="number" 
                        min="0" 
                        value={s.oral} 
                        onChange={(e) => update(s.id, { oral: parseInt(e.target.value) || 0 })} 
                        className="w-full p-2 rounded-lg border border-[#cae0d4] text-sm text-center outline-none focus:ring-2 focus:ring-[#8da894]"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => removeSubject(s.id)} 
                        className="px-3 py-1 text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl p-4 border bg-[#f8faf8]">
            <label className="text-xs font-semibold">Pondération globale (écrits vs oraux)</label>
            <div className="flex items-center gap-3 mt-2">
              <input type="range" min={0} max={1} step={0.05} value={weightEcrit} onChange={(e) => setWeightEcrit(Number(e.target.value))} />
              <div className="text-xs">Écrits: {(weightEcrit*100).toFixed(0)}% — Oraux: {((1-weightEcrit)*100).toFixed(0)}%</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="rounded-xl p-4 bg-white border">
              <h4 className="font-semibold text-sm">Priorité — Écrits</h4>
              <ol className="mt-2 text-sm list-decimal pl-5">
                {byEcrit.map((s) => <li key={s.id}>{s.name} — {s.ecrit}</li>)}
              </ol>
            </div>

            <div className="rounded-xl p-4 bg-white border">
              <h4 className="font-semibold text-sm">Priorité — Oraux</h4>
              <ol className="mt-2 text-sm list-decimal pl-5">
                {byOral.map((s) => <li key={s.id}>{s.name} — {s.oral}</li>)}
              </ol>
            </div>

            <div className="rounded-xl p-4 bg-white border">
              <h4 className="font-semibold text-sm">Priorité — Combiné</h4>
              <ol className="mt-2 text-sm list-decimal pl-5">
                {byCombined.map((s) => <li key={s.id}>{s.name} — {s.ecrit} / {s.oral} — score: {s.score.toFixed(2)}</li>)}
              </ol>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold">Import / Export JSON</label>
            <textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={6} className="w-full p-3 rounded-xl border text-sm bg-white" placeholder='Coller un JSON: [{"name":"Maths","ecrit":6,"oral":0}, ...]' />
            <div className="flex gap-2">
              <button onClick={importJSON} className="px-3 py-2 bg-[#8da894] text-white rounded-xl text-xs">Importer</button>
              <button onClick={() => { setImportText(JSON.stringify(items, null, 2)); }} className="px-3 py-2 bg-white border rounded-xl text-xs">Pré-remplir</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
