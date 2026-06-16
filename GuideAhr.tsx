import { useState } from "react";

const chapters = [
  {
    id: "ch1",
    icon: "🧠",
    title: "I. Conseils Généraux & Bon Rythme",
    content: (
      <div className="space-y-4">
        <p><strong>L'état d'esprit initial :</strong> Il faut partir confiante, mais humble. Bannissez la rivalité stérile : l'ambiance de classe et l'entraide sont vos meilleurs leviers.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <h4 className="font-bold text-[#1b3224] mb-2">Présentation de la copie</h4>
            <p className="text-xs">Votre copie est l'unique vitrine de votre cerveau. Soignez l'écriture, encadrez vos résultats et laissez respirer la mise en page.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <h4 className="font-bold text-[#1b3224] mb-2">Trouver son rythme</h4>
            <p className="text-xs">Travailler intelligemment 3 à 4 heures chaque soir de manière concentrée vaut mieux que 6 heures de survol passif.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "ch2",
    icon: "⚠️",
    title: "II. Les Soucis Rencontrés",
    content: (
      <div className="space-y-3 text-sm text-slate-600">
        <p>Les plus grands obstacles ne sont pas toujours cognitifs, mais psychologiques.</p>
        {[
          { color: "bg-red-50 text-red-700", label: "Le Stress paralysant", desc: "Fractionnez vos tâches. Une khôlle ratée est simplement un indicateur des notions à consolider." },
          { color: "bg-amber-50 text-amber-700", label: "L'Énervement et la frustration", desc: "Passez à autre chose et revenez le lendemain à tête reposée. Demander de l'aide est un signe d'intelligence adaptative." },
          { color: "bg-blue-50 text-blue-700", label: "La Tentation du lâcher-prise", desc: "Utilisez des bloqueurs d'applications pendant vos heures de travail pour conserver une efficacité maximale." },
        ].map((item) => (
          <div key={item.label} className="flex gap-3">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 ${item.color}`}>!</span>
            <div>
              <h4 className="font-bold text-xs">{item.label}</h4>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "ch3",
    icon: "❤️",
    title: "III. L'Hygiène de vie du Major",
    content: (
      <div className="space-y-4 text-sm text-slate-600">
        <p>Emmanuel Ahr l'écrit en gras : <strong>sans hygiène de vie, pas d'intégration possible à haut niveau</strong>.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "🛏️", title: "Savoir s'arrêter", desc: "Dormez 8h minimum. Le sommeil consolide les réseaux de neurones codant les cours." },
            { icon: "🏃", title: "Faire du sport", desc: "Une heure de sport hebdomadaire libère des endorphines et repart avec un cerveau frais." },
            { icon: "🍎", title: "Bien manger & Parler", desc: "Ne sautez aucun repas. Extérioriser la pression évite les crises d'angoisse." },
          ].map((item) => (
            <div key={item.title} className="p-4 border border-[#e3eee8] rounded-xl">
              <h4 className="font-bold text-xs mb-1">{item.icon} {item.title}</h4>
              <p className="text-[11px] text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "ch4",
    icon: "♟️",
    title: "IV. Stratégies de Concours",
    content: (
      <div className="space-y-4 text-sm text-slate-600">
        <p><strong>L'art de la fiche utile :</strong> Ne recopiez pas passivement votre cours. Une bonne fiche contient uniquement les définitions rigoureuses, les théorèmes fondamentaux et les schémas de synthèse.</p>
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
          <h4 className="font-bold text-amber-900 mb-1 text-xs">📚 La règle d'or d'Emmanuel : Compulsez les rapports du jury</h4>
          <p className="text-xs text-slate-600">Les rapports de jury de l'Agro-Véto sont une mine d'or sous-exploitée. Ils détaillent précisément les attentes des correcteurs, les fautes récurrentes éliminatoires et les questions différenciantes.</p>
        </div>
      </div>
    ),
  },
  {
    id: "ch5",
    icon: "📖",
    title: "V. Décryptage Discipline par Discipline",
    content: (
      <div className="space-y-6 text-sm text-slate-600">
        <div>
          <h4 className="font-serif font-bold text-[#1b3224] text-base mb-2">➗ Les Mathématiques en BCPST</h4>
          <p className="text-xs">L'algèbre linéaire et les probabilités exigent une logique et une rigueur absolue. Pratiquez au quotidien.</p>
        </div>
        <div className="border-t border-slate-100 pt-4">
          <h4 className="font-serif font-bold text-[#1b3224] text-base mb-2">🧬 La Biologie & SVT</h4>
          <p className="text-xs">La clé : les schémas de synthèse fonctionnels. Au concours, un dessin vaut mille mots — parfaits, colorés, légendés.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div>
            <h5 className="font-bold text-xs mb-1">⚗️ Physique & Chimie</h5>
            <p className="text-[11px] text-slate-500">Misez sur la chimie organique (mécanismes par cœur) et entraînez-vous sur la thermodynamique.</p>
          </div>
          <div>
            <h5 className="font-bold text-xs mb-1">✍️ Français, Philo & Langues</h5>
            <p className="text-[11px] text-slate-500">Ne négligez jamais ces matières ! Elles font souvent la différence pour les places Véto.</p>
          </div>
        </div>
      </div>
    ),
  },
];

export default function GuideAhr() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#e3eee8] shadow-sm">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-8">
          <span className="bg-[#e3eee8] text-[#1b3224] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            Document officiel BCPST (ID: 459)
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#1b3224]">
            Tout ce que j'aurais voulu savoir avant d'entrer en BCPST
          </h2>
          <p className="text-slate-500 text-sm">
            La bible méthodologique rédigée par <strong>Emmanuel Ahr</strong> (ENS de Lyon) — Lycée Henri Poincaré / Georges de la Tour.
          </p>
          <a
            href="https://cahier-de-prepa.fr/bcpst1-delatour/download?id=459"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-[#1b3224] text-white text-xs font-semibold rounded-xl hover:bg-[#5c7d67] transition"
          >
            📄 Télécharger le PDF original
          </a>
        </div>

        <div className="space-y-4 max-w-5xl mx-auto">
          {chapters.map((ch) => (
            <div key={ch.id} className="border border-[#e3eee8] rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen(open === ch.id ? null : ch.id)}
                className="w-full flex justify-between items-center p-5 bg-[#f3f7f5] hover:bg-[#e3eee8]/50 transition text-left"
              >
                <span className="font-serif font-bold text-lg text-[#1b3224]">
                  {ch.icon} <span className="ml-2">{ch.title}</span>
                </span>
                <span className={`text-[#8da894] transition-transform duration-200 text-sm ${open === ch.id ? "rotate-180" : ""}`}>▼</span>
              </button>
              {open === ch.id && (
                <div className="p-6 bg-white border-t border-[#f3f7f5] text-sm text-slate-600 leading-relaxed">
                  {ch.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
