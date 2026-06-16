import { useState, useEffect, useRef } from "react";

const RESPIRATIONS = [
  { name: "Cohérence cardiaque", description: "La méthode 365 : 3× par jour, 6 respirations/min pendant 5 min.", steps: ["Inspire 5 secondes", "Expire 5 secondes"], duration: 5, color: "#8da894", bg: "#e3eee8" },
  { name: "4-7-8 Anti-stress", description: "Parfaite avant un concours ou une khôlle pour calmer le système nerveux.", steps: ["Inspire 4 secondes", "Retiens 7 secondes", "Expire 8 secondes"], duration: 4 + 7 + 8, color: "#c49b80", bg: "#ebdcd3" },
  { name: "Respiration en boîte", description: "Utilisée par les Navy SEALs pour maîtriser le stress intense.", steps: ["Inspire 4 secondes", "Retiens 4 secondes", "Expire 4 secondes", "Retiens 4 secondes"], duration: 16, color: "#5c7d67", bg: "#f3f7f5" },
];

const PLAYLISTS = [
  { name: "Lo-fi Hip Hop — Concentration", url: "https://www.youtube.com/watch?v=jfKfPfyJRdk", emoji: "🎵", desc: "Le classique : Lofi Girl sur YouTube" },
  { name: "Musique classique — Mozart Effect", url: "https://www.youtube.com/watch?v=iUohO2MSot8", emoji: "🎻", desc: "Concentration et mémoire" },
  { name: "Nature sounds — Forest", url: "https://www.youtube.com/watch?v=xNN7iTA57jM", emoji: "🌲", desc: "Sons de forêt apaisants" },
  { name: "Binaural Beats — Focus", url: "https://www.youtube.com/watch?v=WPni755-Krg", emoji: "🧠", desc: "Ondes cérébrales pour la concentration profonde" },
  { name: "Jazz étude — Relaxation", url: "https://www.youtube.com/watch?v=Dx5qFachd3A", emoji: "🎷", desc: "Jazz doux pour les pauses" },
];

const AFFIRMATIONS = [
  "Je suis capable. J'ai traversé deux années de prépa — je suis prête.",
  "Chaque heure de travail aujourd'hui est un pas de plus vers Véto.",
  "Les difficultés d'aujourd'hui forgent la vétérinaire de demain.",
  "Je ne compare pas mon chapitre 1 au chapitre 20 des autres.",
  "Le travail régulier bat toujours le travail intense et irrégulier.",
  "Ma détermination est ma plus grande force.",
  "Je me repose sans culpabilité — le repos fait partie de la performance.",
];

export default function ZoneDeconnexion() {
  const [selectedRespiration, setSelectedRespiration] = useState(0);
  const [breathing, setBreathing] = useState(false);
  const [step, setStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);
  const [affirmation] = useState(() => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resp = RESPIRATIONS[selectedRespiration];
  const stepDurations = resp.name === "4-7-8 Anti-stress" ? [4, 7, 8]
    : resp.name === "Respiration en boîte" ? [4, 4, 4, 4] : [5, 5];

  function startBreathing() {
    setStep(0); setTimeLeft(stepDurations[0]); setBreathing(true); setTotalCycles(0);
  }
  function stopBreathing() {
    setBreathing(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  useEffect(() => {
    if (!breathing) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setStep(s => {
            const next = (s + 1) % resp.steps.length;
            if (next === 0) setTotalCycles(c => c + 1);
            setTimeLeft(stepDurations[next]);
            return next;
          });
          return stepDurations[0];
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [breathing, selectedRespiration]);

  const circleScale = breathing
    ? (resp.steps[step]?.toLowerCase().includes("inspire") ? 1.3 : resp.steps[step]?.toLowerCase().includes("retiens") ? 1.3 : 0.8)
    : 1;

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224] mb-1">🌿 Zone de Déconnexion</h2>
        <p className="text-sm text-slate-500">Respiration, musique, affirmations positives — prends soin de toi pour performer au maximum.</p>
      </div>

      {/* Affirmation du jour */}
      <div className="bg-[#1b3224] text-white p-6 rounded-3xl text-center space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#a3caa0]">✨ Affirmation du jour</p>
        <p className="font-serif text-xl md:text-2xl font-medium leading-relaxed italic">"{affirmation}"</p>
      </div>

      {/* Respiration guidée */}
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm space-y-6">
        <h3 className="font-serif font-bold text-[#1b3224]">🌬️ Exercices de Respiration</h3>
        <div className="flex gap-3 flex-wrap">
          {RESPIRATIONS.map((r, i) => (
            <button key={i} onClick={() => { setSelectedRespiration(i); stopBreathing(); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition ${i === selectedRespiration ? "text-white" : "border-[#e3eee8] text-slate-600 hover:border-[#a3caa0]"}`}
              style={i === selectedRespiration ? { background: r.color, borderColor: r.color } : {}}>
              {r.name}
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-600">{resp.description}</p>

        <div className="flex flex-col items-center gap-6 py-4">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full transition-transform duration-1000 opacity-20"
              style={{ transform: `scale(${circleScale})`, background: resp.color }} />
            <div className="w-28 h-28 rounded-full flex flex-col items-center justify-center text-white transition-transform duration-1000"
              style={{ transform: `scale(${circleScale * 0.85})`, background: resp.color }}>
              {breathing ? (
                <>
                  <span className="text-2xl font-bold font-serif">{timeLeft}</span>
                  <span className="text-[10px] font-semibold text-center px-2">{resp.steps[step]}</span>
                </>
              ) : (
                <span className="text-3xl">🌿</span>
              )}
            </div>
          </div>

          {breathing && <p className="text-xs text-slate-500">{totalCycles} cycle{totalCycles > 1 ? "s" : ""} complété{totalCycles > 1 ? "s" : ""}</p>}

          <button onClick={breathing ? stopBreathing : startBreathing}
            className="px-8 py-3 text-white text-sm font-bold rounded-xl transition shadow-sm"
            style={{ background: resp.color }}>
            {breathing ? "⏹ Arrêter" : "▶ Commencer"}
          </button>
        </div>
      </div>

      {/* Playlists */}
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h3 className="font-serif font-bold text-[#1b3224] mb-4">🎧 Playlists de Concentration</h3>
        <div className="space-y-3">
          {PLAYLISTS.map(p => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl border border-[#e3eee8] hover:border-[#8da894] hover:bg-[#f3f7f5] transition group">
              <span className="text-2xl">{p.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#1b3224] group-hover:text-[#5c7d67] transition">{p.name}</p>
                <p className="text-xs text-slate-500">{p.desc}</p>
              </div>
              <span className="text-xs text-[#8da894] font-semibold shrink-0 group-hover:text-[#5c7d67]">Écouter →</span>
            </a>
          ))}
        </div>
      </div>

      {/* Conseils */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { emoji: "😴", title: "Dors 7-8h", text: "Le sommeil consolide la mémoire. Dormir moins ne fait pas travailler plus — ça fait retenir moins." },
          { emoji: "🏃‍♀️", title: "Bouge !", text: "30 min de marche ou sport 3× par semaine améliore la concentration et réduit le stress de 40%." },
          { emoji: "📵", title: "Déconnecte", text: "1h sans écran avant de dormir = endormissement plus rapide et sommeil de meilleure qualité." },
        ].map(c => (
          <div key={c.title} className="bg-[#f3f7f5] rounded-2xl p-5 border border-[#e3eee8] text-center space-y-2">
            <span className="text-3xl">{c.emoji}</span>
            <p className="font-serif font-bold text-[#1b3224]">{c.title}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
