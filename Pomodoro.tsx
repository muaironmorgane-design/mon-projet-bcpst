import { useState, useEffect, useRef } from "react";

type Mode = "travail" | "pause" | "longue-pause";
interface Session { date: string; subject: string; duration: number; }

const MODES: { value: Mode; label: string; mins: number; color: string; bg: string }[] = [
  { value: "travail",       label: "Deep Work",    mins: 25, color: "#1b3224", bg: "#e3eee8" },
  { value: "pause",         label: "Pause courte", mins: 5,  color: "#8da894", bg: "#f3f7f5" },
  { value: "longue-pause",  label: "Pause longue", mins: 15, color: "#c49b80", bg: "#ebdcd3" },
];

const SUJETS = ["Maths","Physique","Chimie","SVT","Biologie","Français","LV1","Révisions","Autre"];

function loadSessions(): Session[] {
  try { return JSON.parse(localStorage.getItem("khube_pomodoro_v1") || "[]"); } catch { return []; }
}
function saveSessions(d: Session[]) { localStorage.setItem("khube_pomodoro_v1", JSON.stringify(d)); }

export default function Pomodoro() {
  const [mode, setMode] = useState<Mode>("travail");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sujet, setSujet] = useState("Maths");
  const [sessions, setSessions] = useState<Session[]>(loadSessions);
  const [customMins, setCustomMins] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startMinsRef = useRef(25);

  function getMins() { return customMins ?? MODES.find(m => m.value === mode)!.mins; }

  function changeMode(m: Mode) {
    setMode(m); setRunning(false); setCustomMins(null);
    const mins = MODES.find(x => x.value === m)!.mins;
    setTimeLeft(mins * 60);
    startMinsRef.current = mins;
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function applyCustom(v: number) {
    setCustomMins(v); setTimeLeft(v * 60); startMinsRef.current = v; setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (mode === "travail") {
              const s: Session = { date: new Date().toISOString().split("T")[0], subject: sujet, duration: getMins() };
              const updated = [s, ...sessions];
              setSessions(updated); saveSessions(updated);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  function toggle() { setRunning(r => !r); }
  function reset() { setRunning(false); setTimeLeft(getMins() * 60); if (intervalRef.current) clearInterval(intervalRef.current); }

  const totalMins = getMins() * 60;
  const pct = ((totalMins - timeLeft) / totalMins) * 100;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const cfg = MODES.find(m => m.value === mode)!;

  const todaySessions = sessions.filter(s => s.date === new Date().toISOString().split("T")[0]);
  const todayMins = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224] mb-1">⏱️ Deep Work · Pomodoro</h2>
        <p className="text-sm text-slate-500">Sessions de travail intense — la méthode qui fait la différence en prépa.</p>
      </div>

      {/* Timer */}
      <div className="bg-white p-8 rounded-3xl border border-[#e3eee8] shadow-md text-center space-y-6">
        {/* Mode selector */}
        <div className="flex gap-2 justify-center">
          {MODES.map(m => (
            <button key={m.value} onClick={() => changeMode(m.value)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition border ${mode === m.value ? "text-white border-transparent" : "border-[#e3eee8] text-slate-500 hover:border-[#a3caa0]"}`}
              style={mode === m.value ? { background: m.color } : {}}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Circle */}
        <div className="relative w-52 h-52 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e3eee8" strokeWidth="6" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={cfg.color} strokeWidth="6"
              strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - pct / 100)}`}
              style={{ transition: "stroke-dashoffset 0.9s linear" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-5xl font-bold text-[#1b3224]">{mm}:{ss}</span>
            <span className="text-xs text-slate-500 mt-1">{cfg.label}</span>
          </div>
        </div>

        {/* Subject */}
        {mode === "travail" && (
          <select value={sujet} onChange={e => setSujet(e.target.value)}
            className="text-sm p-2 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
            {SUJETS.map(s => <option key={s}>{s}</option>)}
          </select>
        )}

        {/* Custom duration */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>Durée custom :</span>
          {[15, 25, 45, 90].map(m => (
            <button key={m} onClick={() => applyCustom(m)}
              className={`px-2 py-1 rounded-lg border transition ${customMins === m ? "bg-[#1b3224] text-white border-[#1b3224]" : "border-[#cae0d4] hover:border-[#8da894]"}`}>
              {m}min
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          <button onClick={reset}
            className="px-5 py-3 border border-[#cae0d4] text-slate-600 text-xs font-semibold rounded-xl hover:bg-[#f3f7f5] transition">
            ↺ Réinit.
          </button>
          <button onClick={toggle}
            className="px-10 py-3 text-white text-sm font-bold rounded-xl transition shadow-sm"
            style={{ background: cfg.color }}>
            {running ? "⏸ Pause" : timeLeft === 0 ? "✓ Terminé" : "▶ Démarrer"}
          </button>
        </div>
      </div>

      {/* Today stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#e3eee8] shadow-sm text-center">
          <p className="font-serif text-2xl font-bold text-[#1b3224]">{todaySessions.length}</p>
          <p className="text-xs text-slate-500">sessions aujourd'hui</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#e3eee8] shadow-sm text-center">
          <p className="font-serif text-2xl font-bold text-[#1b3224]">{todayMins}</p>
          <p className="text-xs text-slate-500">min de travail</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#e3eee8] shadow-sm text-center">
          <p className="font-serif text-2xl font-bold text-[#1b3224]">{sessions.length}</p>
          <p className="text-xs text-slate-500">sessions totales</p>
        </div>
      </div>

      {/* History */}
      {sessions.length > 0 && (
        <div className="bg-white p-5 rounded-3xl border border-[#e3eee8] shadow-sm">
          <h3 className="font-serif font-bold text-[#1b3224] mb-3">Dernières sessions</h3>
          <div className="space-y-2">
            {sessions.slice(0, 8).map((s, i) => (
              <div key={i} className="flex justify-between items-center text-sm py-1.5 border-b border-[#f3f7f5] last:border-0">
                <span className="text-slate-600">{s.subject}</span>
                <span className="text-[#5c7d67] font-semibold">{s.duration} min</span>
                <span className="text-xs text-slate-400">{new Date(s.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
