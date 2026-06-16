import { useState, useEffect, useMemo } from "react";
import FocusTree from "@/components/FocusTree";

const CONCOURS_DATE = new Date(2027, 6, 1);

function getMonthData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7;
  const length = new Date(year, month + 1, 0).getDate();
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < startDay; i++) cells.push({ date: new Date(year, month, i - startDay + 1), inMonth: false });
  for (let d = 1; d <= length; d++) cells.push({ date: new Date(year, month, d), inMonth: true });
  while (cells.length % 7 !== 0) cells.push({ date: new Date(year, month, length + (cells.length - startDay - length) + 1), inMonth: false });
  return { cells, year, month };
}

function loadPlanning() {
  try {
    return JSON.parse(localStorage.getItem("khube_planning_v1") ?? "{}") as Record<string, { title: string; hour: number; done?: boolean }[]>;
  } catch {
    return {};
  }
}

function loadKholles() {
  try {
    return JSON.parse(localStorage.getItem("khube_kholles_v1") ?? "[]") as { date: string; subject: string; alert: boolean; note: number | null }[];
  } catch {
    return [];
  }
}

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem("khube_notes_v1") ?? "[]") as { date: string; type: string; subject: string; value: number; alert?: boolean }[];
  } catch {
    return [];
  }
}

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function MonHistoire() {
  const [countdown, setCountdown] = useState({ days: 0, weeks: 0 });
  const [, setTick] = useState(0);

  useEffect(() => {
    function update() {
      const now = new Date();
      const diff = CONCOURS_DATE.getTime() - now.getTime();
      if (diff <= 0) return;
      const days = Math.floor(diff / 86400000);
      setCountdown({
        days,
        weeks: Math.floor(days / 7),
      });
    }
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const today = formatDate(new Date());
  const { cells, year, month } = getMonthData();
  const planning = loadPlanning();
  const kholles = loadKholles();
  const notes = loadNotes();

  const dsColleEvents = useMemo(() => {
    const events: { date: string; title: string; kind: "ds" | "colle"; past: boolean }[] = [];
    kholles.forEach((k) => {
      events.push({ date: k.date, title: `Khôlle ${k.subject}`, kind: "colle", past: k.date < today });
    });
    notes.filter((n) => n.type === "DS" || n.type === "Khôlle").forEach((n) => {
      events.push({ date: n.date, title: `${n.type} ${n.subject} (${n.value}/20)`, kind: n.type === "DS" ? "ds" : "colle", past: n.date < today });
    });
    Object.entries(planning).forEach(([date, evs]) => {
      evs.forEach((ev) => {
        const t = ev.title.toLowerCase();
        if (t.includes("ds") || t.includes("khôlle") || t.includes("kholle") || t.includes("colle")) {
          events.push({ date, title: ev.title, kind: t.includes("ds") ? "ds" : "colle", past: date < today });
        }
      });
    });
    return events.sort((a, b) => a.date.localeCompare(b.date));
  }, [planning, kholles, notes, today]);

  const monthStats = useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    const inMonth = dsColleEvents.filter((e) => e.date.startsWith(monthPrefix));
    return {
      colles: inMonth.filter((e) => e.kind === "colle").length,
      ds: inMonth.filter((e) => e.kind === "ds").length,
    };
  }, [dsColleEvents, year, month]);

  const upcoming = dsColleEvents.filter((e) => !e.past).slice(0, 5);
  const past = [...dsColleEvents].filter((e) => e.past).reverse().slice(0, 5);

  const alerts = [
    ...kholles.filter((k) => k.alert && k.date >= today).map((k) => ({ date: k.date, text: `🔔 Khôlle ${k.subject} le ${new Date(k.date).toLocaleDateString("fr-FR")}` })),
    ...notes.filter((n) => n.alert && (n.type === "DS" || n.type === "Khôlle") && n.date >= today).map((n) => ({ date: n.date, text: `🔔 ${n.type} ${n.subject} le ${new Date(n.date).toLocaleDateString("fr-FR")}` })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-8">
      {/* Focus Tree + Alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div className="card-refined p-5 flex flex-col items-center">
          <h3 className="section-heading text-sm mb-4 self-start">🌳 Mon arbre de concentration</h3>
          <FocusTree size="lg" />
          <p className="text-[11px] text-slate-500 mt-3 text-center leading-relaxed">
            Ton arbre grandit au fil de l'année Khûbe, de la graine jusqu'à l'arbre mature !
          </p>
        </div>

        <div className="space-y-4">
          {alerts.length > 0 && (
            <div className="card-refined p-5 border-l-4 border-amber-400 bg-amber-50/50">
              <h3 className="section-heading text-sm mb-3">🔔 Rappels importants</h3>
              <div className="space-y-2">
                {alerts.map((a, i) => (
                  <div key={i} className="text-sm text-amber-900 font-medium">{a.text}</div>
                ))}
              </div>
            </div>
          )}

          <div className="card-refined p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-heading text-sm">📅 Aperçu du mois</h3>
              <div className="flex gap-3 text-xs">
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-bold">{monthStats.colles} colles</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold">{monthStats.ds} DS</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-[10px] text-slate-400 mb-1 text-center">
              {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <div key={i}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell) => {
                const key = formatDate(cell.date);
                const dayEvents = dsColleEvents.filter((e) => e.date === key);
                const hasColle = dayEvents.some((e) => e.kind === "colle");
                const hasDs = dayEvents.some((e) => e.kind === "ds");
                return (
                  <div key={key} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] ${!cell.inMonth ? "opacity-30" : ""} ${key === today ? "ring-2 ring-[#8da894] bg-[#e8f4ec]" : "bg-[#f8faf8]"}`}>
                    <span className="font-bold">{cell.date.getDate()}</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {hasColle && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      {hasDs && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* DS/Colles lists */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-refined p-5">
          <h3 className="section-heading text-sm mb-3">📋 À venir</h3>
          {upcoming.length === 0 ? <p className="text-xs text-slate-400">Rien de prévu.</p> : (
            <div className="space-y-2">
              {upcoming.map((e, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.kind === "ds" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{e.kind === "ds" ? "DS" : "Colle"}</span>
                  <span className="text-slate-600 flex-1 truncate">{e.title}</span>
                  <span className="text-xs text-slate-400 shrink-0">{new Date(e.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card-refined p-5">
          <h3 className="section-heading text-sm mb-3">✅ Passées</h3>
          {past.length === 0 ? <p className="text-xs text-slate-400">Aucune pour l'instant.</p> : (
            <div className="space-y-2">
              {past.map((e, i) => (
                <div key={i} className="flex items-center gap-3 text-sm opacity-60">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.kind === "ds" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>{e.kind === "ds" ? "DS" : "Colle"}</span>
                  <span className="text-slate-600 flex-1 truncate line-through">{e.title}</span>
                  <span className="text-xs text-slate-400 shrink-0">{new Date(e.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card-refined p-7 md:p-9 relative overflow-hidden">
            <div className="absolute -top-14 -right-14 w-56 h-56 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(163,202,160,0.12) 0%, transparent 70%)" }} />
            <div className="relative z-10 space-y-5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full" style={{ background: "rgba(196,155,128,0.12)", color: "#9d7053", border: "1px solid rgba(196,155,128,0.25)" }}>
                Témoignage d'une 5/2 (Khûbe)
              </span>
              <h2 className="font-serif text-[1.75rem] md:text-[2rem] text-[#1b3224] leading-[1.2] tracking-tight">
                "Échouer pour mieux rebondir : pourquoi je choisis de cuber pour décrocher Véto."
              </h2>
              <div className="w-12 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, #c49b80, #8da894)" }} />
              <p className="text-slate-600 leading-relaxed text-[0.9375rem]">
                Juin 2026. Les résultats de l'Agro-Véto tombent. Après deux ans de travail intense, le verdict est sans appel : non retenue cette année. Le choc est lourd, mais ma vocation est intacte.
              </p>
              <p className="text-slate-600 leading-relaxed text-sm">
                J'ai décidé de <strong className="text-[#1b3224]">cuber (faire une 5/2)</strong> pour l'année universitaire <strong className="text-[#1b3224]">2026-2027</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "🎯", color: "#e8f0ec", accent: "#8da894", title: "Focus Chimie Orga", desc: "Sécuriser les mécanismes et synthèses complexes." },
              { icon: "⏱️", color: "#fdf2ec", accent: "#c49b80", title: "Efficacité Écrits", desc: "Maximiser la vitesse de rédaction selon les rapports jury." },
              { icon: "❤️", color: "#f0f5f9", accent: "#94a3b8", title: "Équilibre Mental", desc: "Sommeil réparateur (8h), sport et pauses indispensables." },
            ].map((card) => (
              <div key={card.title} className="card-refined p-5 text-center space-y-3">
                <div className="w-11 h-11 rounded-2xl mx-auto flex items-center justify-center text-xl" style={{ background: card.color, border: `1px solid ${card.accent}30` }}>{card.icon}</div>
                <div>
                  <h4 className="font-semibold text-[#1b3224] text-sm">{card.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card-refined p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">⏳</span>
              <h3 className="section-heading text-sm">Compte à rebours</h3>
            </div>
            <div className="stat-tile px-4 py-6 text-center">
              <div className="font-serif text-5xl font-bold text-[#1b3224]">{countdown.days}</div>
              <div className="text-xs text-slate-500 mt-2 uppercase tracking-wider">Jours restants</div>
            </div>
            <div className="rounded-xl px-3 py-2.5 text-center text-[11px] font-medium text-[#5c7d67]" style={{ background: "rgba(141,168,148,0.1)" }}>
              Concours ENV · <strong className="text-[#1b3224]">Juillet 2027</strong> · {countdown.weeks} semaines
            </div>
          </div>

          <div className="card-refined p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <h3 className="section-heading text-sm">Ma vocation</h3>
            </div>
            <p className="text-xs text-slate-500">Devenir vétérinaire est mon rêve d'enfance.</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(141,168,148,0.15)" }}>
                <div className="h-full rounded-full progress-bar" style={{ "--target-width": "7%", background: "linear-gradient(90deg, #8da894, #c49b80)" } as React.CSSProperties} />
              </div>
              <span className="text-[10px] font-semibold text-[#5c7d67]">7%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
