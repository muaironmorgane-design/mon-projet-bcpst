export default function ConseilsMetho() {
  return (
    <div className="space-y-8">
      {/* Main tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            icon: "🏆",
            title: "Organiser son travail efficacement",
            color: "bg-emerald-50",
            iconColor: "bg-emerald-100 text-emerald-700",
            items: [
              "Planifiez votre semaine le dimanche soir — priorisez les matières à khôlle",
              "Travaillez par blocs de 1h30 avec 15 min de pause (méthode Pomodoro adaptée)",
              "Ne sautez jamais la relecture du cours le soir même",
              "Créez vos fiches de synthèse au fur et à mesure, pas en fin de trimestre",
              "Tenez un journal de bord de vos lacunes (carnet ou appli)",
            ],
          },
          {
            icon: "✍️",
            title: "La copie parfaite",
            color: "bg-[#ebdcd3]",
            iconColor: "bg-[#ebdcd3] text-[#9d7053]",
            items: [
              "Soignez l'écriture et utilisez du matériel de qualité (stylos fiables)",
              "Encadrez vos résultats en rouge pour les rendre visibles au correcteur",
              "Laissez respirer la mise en page — marges, espaces inter-lignes",
              "Numérotez toutes vos pages et indiquez clairement les numéros de questions",
            ],
          },
          {
            icon: "❤️",
            title: "Hygiène de vie & Performance",
            color: "bg-indigo-50",
            iconColor: "bg-indigo-100 text-indigo-700",
            items: [
              "Sommeil : 8h minimum — consolide les réseaux neuronaux des cours",
              "Sport : 1h/semaine minimum — endorphines, évacuation du stress",
              "Alimentation : aucun repas sauté, apports glucidiques réguliers",
              "Sociabilité : extériorisez vos doutes à la famille ou aux amis proches",
              "Travailler après minuit est contre-productif — coucher avant 23h",
            ],
          },
          {
            icon: "♟️",
            title: "Stratégie Concours Agro-Véto",
            color: "bg-amber-50",
            iconColor: "bg-amber-100 text-amber-700",
            items: [
              "Lisez les rapports de jury dès le début — ils révèlent les attentes exactes",
              "Les fiches doivent être synthétiques : définitions + théorèmes + schémas-clés",
              "Entraînez-vous en temps limité dès le 1er trimestre",
              "Ne sautez jamais les questions de cours — elles sont les mieux notées",
              "Khôlles : utilisez-les pour identifier vos lacunes, pas pour vous évaluer",
            ],
          },
        ].map((card) => (
          <div key={card.title} className={`bg-white rounded-2xl p-6 shadow-sm border border-[#e3eee8] conseil-card space-y-3`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${card.iconColor}`}>{card.icon}</div>
              <h3 className="font-serif font-bold text-[#1b3224]">{card.title}</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              {card.items.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#c49b80] font-bold mt-0.5 shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Disciplines */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#e3eee8] space-y-6">
        <h3 className="font-serif text-2xl font-bold text-[#1b3224] border-b border-[#e3eee8] pb-4">
          📖 Conseils par Discipline
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { color: "bg-[#f3f7f5] border-[#e3eee8]", icon: "➗", title: "Mathématiques", items: ["Algèbre linéaire : rigueur absolue dans les démonstrations", "Probabilités : maîtrise des variables aléatoires et lois classiques", "Analyse : rapidité calculatoire et réflexes sur les séries/intégrales", "Pratiquez des exercices tous les jours, même 20 min", "Apprenez vos théorèmes sur le bout des doigts"] },
            { color: "bg-emerald-50 border-emerald-100", icon: "🧬", title: "Biologie & SVT", items: ["Schémas de synthèse fonctionnels — parfaits, colorés, légendés", "Titre scientifique rigoureux + flèche de sens de lecture", "Quantité d'infos colossale → organisez par blocs thématiques", "Rédigez systématiquement en utilisant le vocabulaire spécialisé", "Reliez biologie cellulaire, moléculaire et physiologie entre elles"] },
            { color: "bg-blue-50 border-blue-100", icon: "⚗️", title: "Physique & Chimie", items: ["Chimie organique : mécanismes par cœur (nucléophiles, électrophiles…)", "Thermodynamique : maîtrisez les fonctions d'état et cycles", "Cinétique : lois de vitesse et ordre de réaction", "Calculs d'incertitudes : une erreur = zéro sur la question", "Relisez l'analyse dimensionnelle systématiquement"] },
            { color: "bg-amber-50 border-amber-100", icon: "⛰️", title: "Géologie (Sciences de la Terre)", items: ["Cartographie : entraînez-vous sur toutes les configurations de couches", "Lithologie & minéralogie : fiches de reconnaissance visuelle", "Tectonique des plaques : reliez à l'actualité sismique/volcanique", "Sédimentologie : cycles, séquences et environnements de dépôt"] },
            { color: "bg-rose-50 border-rose-100", icon: "✍️", title: "Français & Philosophie", items: ["Ne négligez JAMAIS ces matières — elles font souvent la différence ENV", "Dissertation : introduction soignée = 50% de la note", "Lisez régulièrement la presse scientifique (Pour la Science, etc.)", "Commentaire : conclusion partielle à chaque grande partie"] },
            { color: "bg-purple-50 border-purple-100", icon: "🌐", title: "Langues Vivantes", items: ["Vocabulaire scientifique anglais : 10 mots/jour minimum", "Écoutez des podcasts en anglais (BBC Science, etc.) quotidiennement", "Expression orale : parlez sans peur de l'erreur dès le début", "Thème/version : exercice de précision incontournable"] },
          ].map((disc) => (
            <div key={disc.title} className={`p-4 rounded-2xl border ${disc.color}`}>
              <h4 className="font-bold text-[#1b3224] flex items-center gap-2 mb-3 text-sm">
                <span className="w-7 h-7 rounded-lg bg-[#1b3224] text-white flex items-center justify-center text-xs">{disc.icon}</span>
                {disc.title}
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5">
                {disc.items.map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Khôlles section */}
      <div className="bg-gradient-to-br from-[#1b3224] to-[#5c7d67] text-white rounded-3xl p-8 shadow-lg">
        <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-3">
          🎤 Réussir ses Khôlles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { period: "Avant", items: ["Révisez les 3 derniers chapitres du programme", "Ayez vos fiches synthétiques à portée la veille", "Dormez bien — une tête fatiguée perds ses mots"] },
            { period: "Pendant", items: ["Prenez 30 secondes pour structurer votre réponse", "Schémas au tableau = points bonus assurés", "Avouez honnêtement si vous ne savez pas"] },
            { period: "Après", items: ["Notez immédiatement les questions où vous avez bloqué", "Re-travaillez ces points dès le soir même", "Une khôlle ratée est votre meilleure alliée sur le long terme"] },
          ].map((section) => (
            <div key={section.period} className="bg-white/10 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-sm text-[#c49b80]">{section.period}</h4>
              <ul className="text-xs text-[#e3eee8] space-y-1">
                {section.items.map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
