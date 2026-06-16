import { useState, useEffect } from "react";

const CONCOURS_DATE = new Date(2027, 6, 1);
const START_DATE = new Date(2026, 6, 1);

export default function Banderole() {
  const [countdown, setCountdown] = useState({ days: 0, weeks: 0, hours: 0, mins: 0, secs: 0, pct: 0 });

  useEffect(() => {
    function update() {
      const now = new Date();
      const diff = CONCOURS_DATE.getTime() - now.getTime();
      if (diff <= 0) return;
      const totalMs = CONCOURS_DATE.getTime() - START_DATE.getTime();
      const elapsed = now.getTime() - START_DATE.getTime();
      const pct = Math.min(100, Math.max(0, (elapsed / totalMs) * 100));
      const days = Math.floor(diff / 86400000);
      const weeks = Math.floor(days / 7);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown({ days, weeks, hours, mins, secs, pct });
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="banderole py-8 px-6">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Logo */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full overflow-hidden banderole-logo-ring bg-white">
              <img
                src="https://skyagent-artifacts.skywork.ai/router/agent/2026-06-13/prod_agent_80212b8c-1d72-4328-bf5b-9afbf7ae405c/logo-journal-bcpst_a93674912b9947019708ae450e2377df.png"
                alt="Logo Journal BCPST"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs text-[#5c7d67] font-semibold uppercase tracking-widest">
              BCPST · Khûbe 2026–27
            </span>
          </div>

          {/* Central text */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c49b80] animate-pulse inline-block" />
              <span className="text-[#9d7053] text-xs font-bold uppercase tracking-widest">
                Journal de bord — Année 5/2
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1b3224] leading-tight">
              Le Journal d'une Khûbe
            </h1>
            <p className="text-[#5c7d67] text-lg font-light">
              Cap sur les Écoles Nationales Vétérinaires · Concours{" "}
              <span className="text-[#9d7053] font-semibold">Juillet 2027</span>
            </p>
            {/* Progress bar */}
            <div className="mt-4 max-w-sm">
              <div className="flex justify-between text-xs text-[#5c7d67] mb-1">
                <span>Début Khûbe (Juil 2026)</span>
                <span>Concours (Juil 2027)</span>
              </div>
              <div className="h-2.5 bg-[#c3dfc9] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full progress-bar"
                  style={{
                    background: "linear-gradient(to right, #c49b80, #8da894)",
                    "--target-width": `${countdown.pct.toFixed(1)}%`,
                    width: `${countdown.pct.toFixed(1)}%`,
                  } as React.CSSProperties}
                />
              </div>
              <p className="text-xs text-[#8da894] mt-1 text-right">
                {countdown.days} jours restants ({countdown.pct.toFixed(0)}% parcouru)
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="shrink-0 grid grid-cols-2 gap-3">
            <div className="bg-white/70 rounded-2xl p-4 text-center border border-[#c3dfc9] shadow-sm">
              <div className="text-2xl font-bold text-[#1b3224] font-serif">{countdown.weeks}</div>
              <div className="text-xs text-[#5c7d67] mt-0.5">semaines restantes</div>
            </div>
            <div className="bg-white/70 rounded-2xl p-4 text-center border border-[#c3dfc9] shadow-sm">
              <div className="text-2xl font-bold text-[#c49b80] font-serif">5/2</div>
              <div className="text-xs text-[#5c7d67] mt-0.5">Khûbe — ENV</div>
            </div>
            <div className="bg-white/70 rounded-2xl p-4 text-center border border-[#c3dfc9] shadow-sm">
              <div className="text-2xl font-bold text-[#1b3224] font-serif">13</div>
              <div className="text-xs text-[#5c7d67] mt-0.5">mois de prépa</div>
            </div>
            <div className="bg-white/70 rounded-2xl p-4 text-center border border-[#c3dfc9] shadow-sm">
              <div className="text-lg font-bold text-[#5c7d67] font-serif">
                {String(countdown.hours).padStart(2,"0")}:{String(countdown.mins).padStart(2,"0")}:{String(countdown.secs).padStart(2,"0")}
              </div>
              <div className="text-xs text-[#5c7d67] mt-0.5">Objectif ENV</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
