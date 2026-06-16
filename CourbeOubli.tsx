import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from "recharts";

// Ebbinghaus repetition intervals (in days after initial learning)
const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 90];

// Retention function: R = e^(-t/S) where S = memory strength
// After each review, S increases (we use a simplified spaced repetition model)
function getRetentionPct(daysSince: number, strength: number): number {
  return Math.max(0, Math.round(100 * Math.exp(-daysSince / strength)));
}

type Subject = "Maths" | "Biologie" | "Chimie" | "Physique" | "Géologie" | "Français" | "Anglais";
const SUBJECTS: Subject[] = ["Maths", "Biologie", "Chimie", "Physique", "Géologie", "Français", "Anglais"];

interface Lesson {
  id: string;
  title: string;
  subject: Subject;
  learnedDate: string; // ISO date string
  reviews: string[]; // ISO dates when reviews were done
  strength: number; // increases with each review
}

function loadLessons(): Lesson[] {
  try {
    const raw = localStorage.getItem("khube_oubli_v1");
    if (raw) return JSON.parse(raw);
  } catch {}
  const today = new Date();
  const d = (daysAgo: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - daysAgo);
    return dt.toISOString().split("T")[0];
  };
  return [
    { id: "l1", title: "Mitochondrie & Chaîne respiratoire", subject: "Biologie", learnedDate: d(12), reviews: [d(11), d(9), d(5)], strength: 14 },
    { id: "l2", title: "Substitution Nucléophile SN1/SN2", subject: "Chimie", learnedDate: d(8), reviews: [d(7), d(5)], strength: 7 },
    { id: "l3", title: "Algèbre Linéaire — Diagonalisation", subject: "Maths", learnedDate: d(3), reviews: [d(2)], strength: 3 },
    { id: "l4", title: "Tectonique des plaques", subject: "Géologie", learnedDate: d(1), reviews: [], strength: 1 },
    { id: "l5", title: "Probabilités — Variables aléatoires", subject: "Maths", learnedDate: d(20), reviews: [d(19), d(17), d(13), d(6)], strength: 30 },
  ];
}

function saveLessons(l: Lesson[]) {
  localStorage.setItem("khube_oubli_v1", JSON.stringify(l));
}

function getDaysSince(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - d.getTime()) / 86400000));
}

function getNextReviewDate(lesson: Lesson): string | null {
  const reviewCount = lesson.reviews.length;
  if (reviewCount >= REVIEW_INTERVALS.length) return null; // Fully memorized
  const daysFromLearn = REVIEW_INTERVALS[reviewCount];
  const learnDate = new Date(lesson.learnedDate);
  learnDate.setDate(learnDate.getDate() + daysFromLearn);
  return learnDate.toISOString().split("T")[0];
}

function getUrgency(lesson: Lesson): "overdue" | "today" | "soon" | "ok" | "mastered" {
  if (lesson.reviews.length >= REVIEW_INTERVALS.length) return "mastered";
  const nextReview = getNextReviewDate(lesson);
  if (!nextReview) return "mastered";
  const today = new Date().toISOString().split("T")[0];
  if (nextReview < today) return "overdue";
  if (nextReview === today) return "today";
  const nextDate = new Date(nextReview);
  const todayDate = new Date(today);
  const daysUntil = Math.floor((nextDate.getTime() - todayDate.getTime()) / 86400000);
  if (daysUntil <= 3) return "soon";
  return "ok";
}

// Generate forgetting curve data points for visualization
function buildCurveData(lesson: Lesson) {
  const days = 30;
  const data = [];
  for (let t = 0; t <= days; t++) {
    const daysSinceLearned = getDaysSince(lesson.learnedDate) - (getDaysSince(lesson.learnedDate) - t);
    const ret = getRetentionPct(Math.max(0, t), lesson.strength);
    data.push({ jour: `J+${t}`, retention: ret });
  }
  return data;
}

const URGENCY_CONFIG = {
  overdue: { label: "En retard !", badge: "bg-red-100 text-red-800 border border-red-200", dot: "bg-red-500" },
  today: { label: "Aujourd'hui !", badge: "bg-amber-100 text-amber-800 border border-amber-200", dot: "bg-amber-500" },
  soon: { label: "Bientôt", badge: "bg-yellow-50 text-yellow-800 border border-yellow-200", dot: "bg-yellow-400" },
  ok: { label: "En cours", badge: "bg-[#e3eee8] text-[#1b3224] border border-[#cae0d4]", dot: "bg-[#8da894]" },
  mastered: { label: "Maîtrisé ✓", badge: "bg-emerald-100 text-emerald-800 border border-emerald-200", dot: "bg-emerald-500" },
};

const SUBJECT_COLORS: Record<Subject, string> = {
  Maths: "#ef4444", Biologie: "#22c55e", Chimie: "#6366f1",
  Physique: "#3b82f6", Géologie: "#f59e0b", Français: "#a855f7", Anglais: "#06b6d4",
};

// Global Ebbinghaus reference curve data
const REFERENCE_CURVE = Array.from({ length: 31 }, (_, t) => ({
  jour: `J+${t}`,
  "Sans révision": Math.round(100 * Math.exp(-t / 3)),
  "Après 1 révision": t < 3 ? null : Math.round(100 * Math.exp(-(t - 3) / 7)),
  "Après 3 révisions": t < 14 ? null : Math.round(100 * Math.exp(-(t - 14) / 30)),
}));

export default function CourbeOubli() {
  const [lessons, setLessons] = useState<Lesson[]>(loadLessons);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", subject: "Biologie" as Subject, learnedDate: new Date().toISOString().split("T")[0] });
  const [showAddForm, setShowAddForm] = useState(false);

  function addLesson() {
    if (!form.title.trim()) { alert("Veuillez saisir le titre du cours"); return; }
    const l: Lesson = { id: `l_${Date.now()}`, title: form.title.trim(), subject: form.subject, learnedDate: form.learnedDate, reviews: [], strength: 1 };
    const updated = [l, ...lessons];
    setLessons(updated);
    saveLessons(updated);
    setForm((f) => ({ ...f, title: "" }));
    setShowAddForm(false);
  }

  function markReviewed(id: string) {
    const today = new Date().toISOString().split("T")[0];
    const updated = lessons.map((l) => {
      if (l.id !== id) return l;
      const newStrength = REVIEW_INTERVALS[Math.min(l.reviews.length, REVIEW_INTERVALS.length - 1)];
      return { ...l, reviews: [...l.reviews, today], strength: newStrength };
    });
    setLessons(updated);
    saveLessons(updated);
  }

  function deleteLesson(id: string) {
    if (!confirm("Supprimer ce cours ?")) return;
    const updated = lessons.filter((l) => l.id !== id);
    setLessons(updated);
    saveLessons(updated);
    if (selectedLesson === id) setSelectedLesson(null);
  }

  const sorted = useMemo(() => {
    const order = { overdue: 0, today: 1, soon: 2, ok: 3, mastered: 4 };
    return [...lessons].sort((a, b) => order[getUrgency(a)] - order[getUrgency(b)]);
  }, [lessons]);

  const overdueCount = sorted.filter((l) => getUrgency(l) === "overdue" || getUrgency(l) === "today").length;
  const masteredCount = sorted.filter((l) => getUrgency(l) === "mastered").length;
  const curveLesson = selectedLesson ? lessons.find((l) => l.id === selectedLesson) : null;
  const curveData = curveLesson ? buildCurveData(curveLesson) : null;

  return (
    <div className="space-y-8">
      {/* Header + stats */}
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#1b3224]">Courbe de l'Oubli — Ebbinghaus</h2>
            <p className="text-sm text-slate-500">Chaque cours oublié = une chance de mieux le retenir. Révisez au bon moment !</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="text-center p-4 rounded-2xl bg-red-50 border border-red-100 min-w-[90px]">
              <div className="font-serif text-2xl font-bold text-red-700">{overdueCount}</div>
              <div className="text-[10px] text-red-600 mt-0.5">À réviser</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-[#f3f7f5] border border-[#e3eee8] min-w-[90px]">
              <div className="font-serif text-2xl font-bold text-[#1b3224]">{lessons.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Cours suivis</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-emerald-50 border border-emerald-100 min-w-[90px]">
              <div className="font-serif text-2xl font-bold text-emerald-700">{masteredCount}</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Maîtrisés</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reference curve */}
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm space-y-4">
        <div>
          <h3 className="font-serif font-bold text-[#1b3224] text-xl">📉 La Courbe de l'Oubli d'Ebbinghaus</h3>
          <p className="text-xs text-slate-500 mt-1">Sans révision active, on oublie ~70% d'un cours en 24h. Chaque révision repousse la courbe.</p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={REFERENCE_CURVE} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="red" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
              <linearGradient id="amber" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
              <linearGradient id="green" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="jour" tick={{ fontSize: 10, fill: "#64748b" }} interval={4} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} unit="%" />
            <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="4 2" />
            <Tooltip formatter={(v: number, name: string) => [v !== null ? `${v}%` : "—", name]} contentStyle={{ borderRadius: 10, border: "1px solid #cae0d4", fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="Sans révision" stroke="#ef4444" fill="url(#red)" strokeWidth={2} dot={false} connectNulls />
            <Area type="monotone" dataKey="Après 1 révision" stroke="#f59e0b" fill="url(#amber)" strokeWidth={2} dot={false} connectNulls />
            <Area type="monotone" dataKey="Après 3 révisions" stroke="#22c55e" fill="url(#green)" strokeWidth={2} dot={false} connectNulls />
          </AreaChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl">
            <div className="w-3 h-3 rounded-full bg-red-500 mt-0.5 shrink-0" />
            <div><strong className="text-red-800">Sans révision</strong><br /><span className="text-red-600">-70% en 24h, -90% en 1 semaine</span></div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
            <div className="w-3 h-3 rounded-full bg-amber-400 mt-0.5 shrink-0" />
            <div><strong className="text-amber-800">Après 1 révision (J+3)</strong><br /><span className="text-amber-600">Courbe ralentie, -50% en 1 semaine</span></div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-xl">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mt-0.5 shrink-0" />
            <div><strong className="text-emerald-800">Après 3 révisions (J+14)</strong><br /><span className="text-emerald-600">Mémoire longue durée stabilisée</span></div>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Lessons list */}
        <div className="flex-1 bg-white rounded-3xl border border-[#e3eee8] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#e3eee8] flex justify-between items-center">
            <h3 className="font-serif font-bold text-[#1b3224]">📚 Mes cours suivis</h3>
            <button onClick={() => setShowAddForm((v) => !v)} className="px-4 py-2 bg-[#8da894] text-white text-xs font-semibold rounded-xl hover:bg-[#5c7d67] transition">
              {showAddForm ? "Fermer" : "➕ Ajouter un cours"}
            </button>
          </div>

          {/* Add form */}
          {showAddForm && (
            <div className="p-5 border-b border-[#e3eee8] bg-[#f3f7f5] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-white focus:ring-2 focus:ring-[#a3caa0] outline-none" placeholder="Titre du cours… *" />
                </div>
                <div>
                  <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value as Subject }))} className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-white outline-none">
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <input type="date" value={form.learnedDate} onChange={(e) => setForm((f) => ({ ...f, learnedDate: e.target.value }))} className="flex-1 text-xs p-3 rounded-xl border border-[#cae0d4] bg-white outline-none" />
                  <button onClick={addLesson} className="px-4 py-2 bg-[#1b3224] text-white text-xs font-bold rounded-xl hover:bg-[#5c7d67] transition whitespace-nowrap">OK</button>
                </div>
              </div>
            </div>
          )}

          {/* Lesson items */}
          <div className="divide-y divide-[#f3f7f5]">
            {sorted.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">Ajoutez votre premier cours à suivre !</div>
            )}
            {sorted.map((lesson) => {
              const urgency = getUrgency(lesson);
              const cfg = URGENCY_CONFIG[urgency];
              const daysSince = getDaysSince(lesson.learnedDate);
              const retention = getRetentionPct(daysSince, lesson.strength);
              const nextReview = getNextReviewDate(lesson);
              const reviewCount = lesson.reviews.length;
              const isSelected = selectedLesson === lesson.id;

              return (
                <div key={lesson.id} className={`p-4 transition-colors ${isSelected ? "bg-[#f3f7f5]" : "hover:bg-[#f3f7f5]/50"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-[#1b3224] truncate">{lesson.title}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cfg.badge}`}>{cfg.label}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: SUBJECT_COLORS[lesson.subject] + "20", color: SUBJECT_COLORS[lesson.subject] }}>
                            {lesson.subject}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                          <span>Appris il y a {daysSince}j</span>
                          <span>
                            <span className="font-bold">{reviewCount}/{REVIEW_INTERVALS.length}</span> révisions
                          </span>
                          {nextReview && urgency !== "mastered" && (
                            <span>Prochaine révision : <strong>{new Date(nextReview).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</strong></span>
                          )}
                        </div>

                        {/* Retention bar */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${retention}%`, background: retention > 70 ? "#22c55e" : retention > 40 ? "#f59e0b" : "#ef4444" }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 w-10 text-right">{retention}%</span>
                        </div>

                        {/* Review dots */}
                        <div className="mt-2 flex gap-1.5 items-center">
                          {REVIEW_INTERVALS.map((_, i) => (
                            <div key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border ${i < reviewCount ? "bg-[#8da894] border-[#5c7d67] text-white" : "bg-slate-100 border-slate-200 text-slate-400"}`} title={`J+${REVIEW_INTERVALS[i]}`}>
                              {i < reviewCount ? "✓" : REVIEW_INTERVALS[i]}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      {urgency !== "mastered" && (
                        <button onClick={() => markReviewed(lesson.id)} className="px-3 py-1.5 bg-[#8da894] text-white text-[10px] font-bold rounded-lg hover:bg-[#5c7d67] transition whitespace-nowrap">
                          ✓ Révisé !
                        </button>
                      )}
                      <button onClick={() => setSelectedLesson(isSelected ? null : lesson.id)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-lg hover:bg-slate-200 transition">
                        📈 Courbe
                      </button>
                      <button onClick={() => deleteLesson(lesson.id)} className="px-3 py-1.5 text-red-400 hover:text-red-600 text-[10px] text-center transition">🗑</button>
                    </div>
                  </div>

                  {/* Individual curve */}
                  {isSelected && curveData && (
                    <div className="mt-4 bg-white rounded-2xl border border-[#e3eee8] p-4">
                      <h5 className="text-xs font-bold text-[#1b3224] mb-3">Courbe de rétention estimée — {lesson.title}</h5>
                      <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={curveData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                          <defs>
                            <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8da894" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#8da894" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="jour" tick={{ fontSize: 9 }} interval={4} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} unit="%" />
                          <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" />
                          <Tooltip formatter={(v: number) => [`${v}%`, "Rétention"]} contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                          <Area type="monotone" dataKey="retention" stroke="#8da894" fill="url(#retGrad)" strokeWidth={2} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info panel */}
        <div className="w-full xl:w-72 space-y-4">
          <div className="bg-[#1b3224] text-white rounded-3xl p-6 space-y-4">
            <h3 className="font-serif font-bold text-lg">🎯 Intervalles de révision</h3>
            <p className="text-xs text-[#a3caa0]">Révisez chaque cours aux moments optimaux pour ancrer le souvenir en mémoire longue durée :</p>
            <div className="space-y-2">
              {REVIEW_INTERVALS.map((days, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2">
                  <span className="w-6 h-6 rounded-full bg-[#c49b80] text-white text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div>
                    <div className="text-xs font-bold">Révision n°{i + 1}</div>
                    <div className="text-[10px] text-[#a3caa0]">J+{days} après l'apprentissage</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e3eee8] p-5 space-y-3">
            <h3 className="font-bold text-[#1b3224] text-sm">💡 Pourquoi ça fonctionne ?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hermann Ebbinghaus a découvert en 1885 que la mémoire se consolide à chaque rappel. Chaque révision repousse l'oubli exponentiellement — après 6 révisions espacées, le souvenir est ancré en mémoire à long terme.
            </p>
            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Sans révision :</span><span className="text-red-600 font-bold">Oublié en 3 jours</span></div>
              <div className="flex justify-between"><span className="text-slate-500">1 révision :</span><span className="text-amber-600 font-bold">Tient 1 semaine</span></div>
              <div className="flex justify-between"><span className="text-slate-500">3 révisions :</span><span className="text-blue-600 font-bold">Tient 1 mois</span></div>
              <div className="flex justify-between"><span className="text-slate-500">6 révisions :</span><span className="text-emerald-600 font-bold">Mémoire longue durée</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
