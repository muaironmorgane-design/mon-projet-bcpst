const EPREUVES_ECRITS = [
  { matiere: "Mathématiques", coeff: 5, type: "Écrit", color: "bg-blue-50 border-blue-300 text-blue-900", emoji: "📐" },
  { matiere: "Physique-Chimie", coeff: 4, type: "Écrit", color: "bg-purple-50 border-purple-300 text-purple-900", emoji: "⚗️" },
  { matiere: "Sciences de la Vie", coeff: 5, type: "Écrit", color: "bg-emerald-50 border-emerald-300 text-emerald-900", emoji: "🧬" },
  { matiere: "Biochimie-Biologie", coeff: 5, type: "Écrit", color: "bg-green-50 border-green-300 text-green-900", emoji: "🔬" },
  { matiere: "Français-Philo", coeff: 3, type: "Écrit", color: "bg-rose-50 border-rose-300 text-rose-900", emoji: "✍️" },
  { matiere: "LV1 (Anglais)", coeff: 2, type: "Écrit", color: "bg-yellow-50 border-yellow-300 text-yellow-900", emoji: "🌍" },
];

const EPREUVES_ORAUX = [
  { matiere: "Mathématiques (Kh.)", coeff: 3, type: "Oral", color: "bg-blue-50 border-blue-300 text-blue-900", emoji: "📐" },
  { matiere: "Physique-Chimie (Kh.)", coeff: 3, type: "Oral", color: "bg-purple-50 border-purple-300 text-purple-900", emoji: "⚗️" },
  { matiere: "SVT / Biologie (Kh.)", coeff: 3, type: "Oral", color: "bg-emerald-50 border-emerald-300 text-emerald-900", emoji: "🧬" },
  { matiere: "Français (Kh.)", coeff: 2, type: "Oral", color: "bg-rose-50 border-rose-300 text-rose-900", emoji: "✍️" },
  { matiere: "LV1 (Kh.)", coeff: 2, type: "Oral", color: "bg-yellow-50 border-yellow-300 text-yellow-900", emoji: "🌍" },
  { matiere: "TP Sciences", coeff: 3, type: "Oral", color: "bg-teal-50 border-teal-300 text-teal-900", emoji: "🧪" },
];

const totalEcrits = EPREUVES_ECRITS.reduce((s, e) => s + e.coeff, 0);
const totalOraux = EPREUVES_ORAUX.reduce((s, e) => s + e.coeff, 0);

const PRIORITES = [
  { label: "Haute priorité (coeff ≥ 5)", items: ["Maths", "SVT", "Biochimie-Bio"], color: "text-red-700 bg-red-50 border-red-200" },
  { label: "Priorité moyenne (coeff 3–4)", items: ["Physique-Chimie", "Français-Philo", "TP Sciences", "Kh. Maths/Physique/SVT"], color: "text-amber-700 bg-amber-50 border-amber-200" },
  { label: "À ne pas négliger (coeff 2)", items: ["LV1", "Kh. Français", "Kh. LV1"], color: "text-[#5c7d67] bg-[#e3eee8] border-[#a3caa0]" },
];

export default function Coefficients() {
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224] mb-1">⚖️ Coefficients Agro-Véto B</h2>
        <p className="text-sm text-slate-500">Visualise où concentrer ton énergie pour maximiser ton score.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Écrits */}
        <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
          <h3 className="font-serif font-bold text-[#1b3224] mb-4 flex items-center gap-2">
            ✍️ Épreuves Écrites
            <span className="text-xs bg-[#e3eee8] text-[#5c7d67] px-2 py-0.5 rounded-full font-normal">Total coeff. {totalEcrits}</span>
          </h3>
          <div className="space-y-3">
            {EPREUVES_ECRITS.map(e => (
              <div key={e.matiere} className={`flex items-center gap-3 p-3 rounded-xl border ${e.color}`}>
                <span className="text-lg">{e.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{e.matiere}</p>
                  <div className="h-1.5 bg-white/60 rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full bg-current opacity-40"
                      style={{ width: `${(e.coeff / 5) * 100}%` }} />
                  </div>
                </div>
                <span className="font-bold text-lg font-serif">{e.coeff}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Oraux */}
        <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
          <h3 className="font-serif font-bold text-[#1b3224] mb-4 flex items-center gap-2">
            🎤 Épreuves Orales
            <span className="text-xs bg-[#e3eee8] text-[#5c7d67] px-2 py-0.5 rounded-full font-normal">Total coeff. {totalOraux}</span>
          </h3>
          <div className="space-y-3">
            {EPREUVES_ORAUX.map(e => (
              <div key={e.matiere} className={`flex items-center gap-3 p-3 rounded-xl border ${e.color}`}>
                <span className="text-lg">{e.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{e.matiere}</p>
                  <div className="h-1.5 bg-white/60 rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full bg-current opacity-40"
                      style={{ width: `${(e.coeff / 3) * 100}%` }} />
                  </div>
                </div>
                <span className="font-bold text-lg font-serif">{e.coeff}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priorités */}
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h3 className="font-serif font-bold text-[#1b3224] mb-4">🎯 Stratégie de Révision par Priorité</h3>
        <div className="space-y-3">
          {PRIORITES.map(p => (
            <div key={p.label} className={`p-4 rounded-2xl border ${p.color}`}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2">{p.label}</p>
              <div className="flex flex-wrap gap-2">
                {p.items.map(item => (
                  <span key={item} className="text-xs bg-white/70 px-2 py-1 rounded-lg border border-current/20 font-medium">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4 text-center">* Coefficients indicatifs — vérifie sur le site officiel Agro-Véto avant les concours.</p>
      </div>
    </div>
  );
}
