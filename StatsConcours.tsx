const YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019];

const OVERALL_STATS = [
  { year: 2025, places: 271, inscrits: 1680, presentesEcrit: 1671, admisEcrit: 796, rangDernierAdmissible: 794, moyenneDernierAdmissible: 10.30, presentesOral: 788, admisLP: 271, moyenneDernierLP: 13.44, rangDernierLC: 401, moyenneDernierLC: 12.69, inscritsLC: 130, definitifIntegres: 272, rangDernierIntegre: 363, moyenneDernierIntegre: 12.91 },
  { year: 2024, places: 301, inscrits: 1772, presentesEcrit: 1764, admisEcrit: 826, rangDernierAdmissible: 826, moyenneDernierAdmissible: 10.22, presentesOral: 822, admisLP: 301, moyenneDernierLP: 13.04, rangDernierLC: 441, moyenneDernierLC: 12.40, inscritsLC: 140, definitifIntegres: 304, rangDernierIntegre: 403, moyenneDernierIntegre: 12.55 },
  { year: 2023, places: 322, inscrits: 1803, presentesEcrit: 1791, admisEcrit: 848, rangDernierAdmissible: 848, moyenneDernierAdmissible: 10.23, presentesOral: 844, admisLP: 322, moyenneDernierLP: 12.46, rangDernierLC: 476, moyenneDernierLC: 11.80, inscritsLC: 155, definitifIntegres: 322, rangDernierIntegre: 424, moyenneDernierIntegre: 11.96 },
  { year: 2022, places: 323, inscrits: 1939, presentesEcrit: 1925, admisEcrit: 927, rangDernierAdmissible: 927, moyenneDernierAdmissible: 10.20, presentesOral: 918, admisLP: 323, moyenneDernierLP: 12.53, rangDernierLC: 501, moyenneDernierLC: 11.80, inscritsLC: 178, definitifIntegres: 328, rangDernierIntegre: 427, moyenneDernierIntegre: 12.08 },
  { year: 2021, places: 461, inscrits: 2055, presentesEcrit: 2038, admisEcrit: 967, rangDernierAdmissible: 966, moyenneDernierAdmissible: 10.40, presentesOral: 963, admisLP: 461, moyenneDernierLP: 12.26, rangDernierLC: 626, moyenneDernierLC: 11.55, inscritsLC: 165, definitifIntegres: 461, rangDernierIntegre: 576, moyenneDernierIntegre: 11.75 },
  { year: 2020, places: 462, inscrits: 2013, presentesEcrit: 1999, admisEcrit: 967, rangDernierAdmissible: -1, moyenneDernierAdmissible: -1, presentesOral: -1, admisLP: 462, moyenneDernierLP: 12.14, rangDernierLC: 629, moyenneDernierLC: 11.50, inscritsLC: 167, definitifIntegres: 462, rangDernierIntegre: 569, moyenneDernierIntegre: 11.70 },
  { year: 2019, places: 459, inscrits: 1951, presentesEcrit: 1942, admisEcrit: 961, rangDernierAdmissible: 961, moyenneDernierAdmissible: 10.20, presentesOral: 957, admisLP: 459, moyenneDernierLP: 12.08, rangDernierLC: 626, moyenneDernierLC: 11.49, inscritsLC: 167, definitifIntegres: 459, rangDernierIntegre: 558, moyenneDernierIntegre: 11.72 },
];

const SCHOOL_STATS = [
  {
    name: "ENV Alfort",
    integrated: [68, 72, 75, 77, 110, 110, 109],
    firstRank: [4, 2, 4, 3, 4, 6, 1],
    lastRank: [282, 322, 301, 320, 463, 429, 478],
    averageRank: [137, 173, 157, 179, 242, 224, 247],
  },
  {
    name: "VetAgro Sup Lyon",
    integrated: [68, 79, 86, 87, 121, 121, 120],
    firstRank: [5, 1, 8, 11, 11, 8, 10],
    lastRank: [306, 321, 330, 296, 366, 424, 346],
    averageRank: [183, 170, 168, 155, 197, 214, 189],
  },
  {
    name: "ONIRIS VetAgroBio Nantes",
    integrated: [68, 78, 82, 84, 116, 116, 116],
    firstRank: [17, 25, 21, 37, 6, 21, 16],
    lastRank: [363, 403, 424, 427, 576, 569, 558],
    averageRank: [288, 300, 318, 307, 407, 387, 339],
  },
  {
    name: "ENV Toulouse",
    integrated: [11, 17, 7, 33, 26, 4, 26],
    firstRank: [11, 17, 7, 33, 26, 4, 26],
    lastRank: [295, 344, 372, 418, 545, 543, 539],
    averageRank: [160, 193, 232, 269, 336, 345, 355],
  },
];

const LABELS = [
  { key: "places", label: "Nombre de places offertes" },
  { key: "inscrits", label: "Nb d'inscrits" },
  { key: "presentesEcrit", label: "Présents à l'écrit" },
  { key: "admisEcrit", label: "Nombre d'admissibles" },
  { key: "rangDernierAdmissible", label: "Rang du dernier admissible" },
  { key: "moyenneDernierAdmissible", label: "Moyenne du dernier admissible" },
  { key: "presentesOral", label: "Présents à l'oral" },
  { key: "admisLP", label: "Admis liste principale" },
  { key: "moyenneDernierLP", label: "Moyenne dernier de la LP" },
  { key: "rangDernierLC", label: "Rang dernier inscrit LC" },
  { key: "moyenneDernierLC", label: "Moyenne dernier LC" },
  { key: "inscritsLC", label: "Nb inscrits sur LC" },
  { key: "definitifIntegres", label: "Nb définitif intégrés" },
  { key: "rangDernierIntegre", label: "Rang dernier intégré" },
  { key: "moyenneDernierIntegre", label: "Moyenne dernier intégré" },
] as const;

type StatKey = (typeof LABELS)[number]["key"];

function formatValue(key: StatKey, value: number) {
  if (value < 0) return "—";
  return ["moyenneDernierAdmissible", "moyenneDernierLP", "moyenneDernierLC", "moyenneDernierIntegre"].includes(key)
    ? value.toFixed(2)
    : String(value);
}

export default function StatsConcours() {
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224] mb-1">📊 Statistiques Concours BCPST / CPGE ENV</h2>
        <p className="text-sm text-slate-500">Données officielles des années 2019 à 2025 — admissions, rangs et derniers intégrés.</p>
      </div>

      <div className="overflow-x-auto bg-white rounded-3xl border border-[#e3eee8] shadow-sm">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-[#f3f7f5] text-[11px] text-slate-500 uppercase tracking-[0.2em]">
            <tr>
              <th className="px-4 py-4 text-left">Indicateur</th>
              {YEARS.map((year) => <th key={year} className="px-4 py-4 text-center">{year}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef3ee]">
            {LABELS.map((label) => (
              <tr key={label.key} className="hover:bg-[#fcfdfa] transition-colors">
                <td className="px-4 py-4 font-medium text-slate-700">{label.label}</td>
                {OVERALL_STATS.map((stat) => (
                  <td key={stat.year} className="px-4 py-4 text-center text-slate-600">{formatValue(label.key, stat[label.key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-6">
        {SCHOOL_STATS.map((school) => (
          <div key={school.name} className="bg-white rounded-3xl border border-[#e3eee8] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eef3ee] bg-[#f3f7f5]">
              <h3 className="font-serif text-xl font-bold text-[#1b3224]">{school.name}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-[#fafbf9] text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-4 py-4 text-left">Indicateur</th>
                    {YEARS.map((year) => <th key={year} className="px-4 py-4 text-center">{year}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef3ee]">
                  <tr>
                    <td className="px-4 py-4 font-medium text-slate-700">Nombre d'intégrés</td>
                    {school.integrated.map((value, idx) => <td key={idx} className="px-4 py-4 text-center">{value}</td>)}
                  </tr>
                  <tr>
                    <td className="px-4 py-4 font-medium text-slate-700">Rang du premier intégré</td>
                    {school.firstRank.map((value, idx) => <td key={idx} className="px-4 py-4 text-center">{value}</td>)}
                  </tr>
                  <tr>
                    <td className="px-4 py-4 font-medium text-slate-700">Rang du dernier intégré</td>
                    {school.lastRank.map((value, idx) => <td key={idx} className="px-4 py-4 text-center">{value}</td>)}
                  </tr>
                  <tr>
                    <td className="px-4 py-4 font-medium text-slate-700">Rang moyen</td>
                    {school.averageRank.map((value, idx) => <td key={idx} className="px-4 py-4 text-center">{value}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
