import { useState, useEffect } from "react";

type Mood = "super" | "bien" | "moyen" | "difficile";

interface JournalEntry {
  id: string;
  date: string;
  mood: Mood;
  content: string;
  victories: string;
  objectives: string;
}

const MOODS: { value: Mood; emoji: string; label: string; color: string }[] = [
  { value: "super",     emoji: "🌟", label: "Super !",    color: "bg-emerald-50 border-emerald-300 text-emerald-800" },
  { value: "bien",      emoji: "😊", label: "Bien",       color: "bg-[#e3eee8] border-[#8da894] text-[#1b3224]" },
  { value: "moyen",     emoji: "😐", label: "Moyen",      color: "bg-amber-50 border-amber-300 text-amber-800" },
  { value: "difficile", emoji: "😓", label: "Difficile",  color: "bg-red-50 border-red-300 text-red-800" },
];

function loadEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem("khube_journal_v1");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem("khube_journal_v1", JSON.stringify(entries));
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default function MonJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>(loadEntries);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [date, setDate] = useState(todayISO());
  const [mood, setMood] = useState<Mood>("bien");
  const [content, setContent] = useState("");
  const [victories, setVictories] = useState("");
  const [objectives, setObjectives] = useState("");

  // Open a fresh form for today (or load existing entry for today)
  function openNew() {
    const existing = entries.find((e) => e.date === todayISO());
    if (existing) {
      startEdit(existing);
    } else {
      setDate(todayISO());
      setMood("bien");
      setContent("");
      setVictories("");
      setObjectives("");
      setEditingId(null);
      setShowForm(true);
    }
  }

  function startEdit(entry: JournalEntry) {
    setDate(entry.date);
    setMood(entry.mood);
    setContent(entry.content);
    setVictories(entry.victories);
    setObjectives(entry.objectives);
    setEditingId(entry.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function save() {
    if (!content.trim() && !victories.trim() && !objectives.trim()) {
      alert("Écris au moins quelque chose avant d'enregistrer !");
      return;
    }
    const entry: JournalEntry = {
      id: editingId ?? `j_${Date.now()}`,
      date,
      mood,
      content: content.trim(),
      victories: victories.trim(),
      objectives: objectives.trim(),
    };
    const updated = editingId
      ? entries.map((e) => (e.id === editingId ? entry : e))
      : [entry, ...entries];
    const sorted = updated.sort((a, b) => b.date.localeCompare(a.date));
    setEntries(sorted);
    saveEntries(sorted);
    setShowForm(false);
    setEditingId(null);
    setContent(""); setVictories(""); setObjectives("");
  }

  function deleteEntry(id: string) {
    if (!confirm("Supprimer cette entrée ?")) return;
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
    if (editingId === id) { setShowForm(false); setEditingId(null); }
  }

  function cancel() {
    setShowForm(false);
    setEditingId(null);
    setContent(""); setVictories(""); setObjectives("");
  }

  const hasTodayEntry = entries.some((e) => e.date === todayISO());
  const moodCounts = MOODS.map((m) => ({
    ...m,
    count: entries.filter((e) => e.mood === m.value).length,
  }));

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1b3224]">Mon Journal de Prépa</h2>
            <p className="text-sm text-slate-500">Tes pensées, victoires et objectifs — un espace rien qu'à toi.</p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            {/* Mood stats */}
            <div className="flex gap-1.5">
              {moodCounts.map((m) => m.count > 0 && (
                <span key={m.value} title={m.label} className="text-sm">{m.emoji} <span className="text-xs text-slate-500">{m.count}</span></span>
              ))}
            </div>
            <span className="text-xs text-slate-400">{entries.length} entrée{entries.length > 1 ? "s" : ""}</span>
            <button
              onClick={openNew}
              className="px-4 py-2.5 bg-[#8da894] text-white text-xs font-bold rounded-xl hover:bg-[#5c7d67] transition shadow-sm"
            >
              {hasTodayEntry ? "✏️ Modifier l'entrée du jour" : "✍️ Nouvelle entrée"}
            </button>
          </div>
        </div>
      </div>

      {/* Write form */}
      {showForm && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-[#8da894] shadow-md space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-bold text-[#1b3224]">
              {editingId ? "✏️ Modifier une entrée" : "✍️ Nouvelle entrée"}
            </h3>
            <button onClick={cancel} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm">✕</button>
          </div>

          {/* Date + Mood */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none focus:ring-2 focus:ring-[#a3caa0]"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600 block mb-2">Comment tu te sens ?</label>
              <div className="flex gap-2 flex-wrap">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border-2 transition ${m.color} ${mood === m.value ? "ring-2 ring-offset-1 ring-[#8da894] border-current" : "border-transparent opacity-60 hover:opacity-90"}`}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              📝 Pensées du jour <span className="font-normal text-slate-400">(liberté totale — comment s'est passée ta journée ?)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full text-sm p-4 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] focus:ring-2 focus:ring-[#a3caa0] outline-none resize-none leading-relaxed"
              placeholder="Aujourd'hui j'ai… Je me suis rendu compte que… Ce qui m'a aidée c'est… Ce qui m'a bloquée c'est…"
            />
          </div>

          {/* Victories + Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                🏆 Mes victoires du jour
              </label>
              <textarea
                value={victories}
                onChange={(e) => setVictories(e.target.value)}
                rows={3}
                className="w-full text-sm p-4 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] focus:ring-2 focus:ring-[#a3caa0] outline-none resize-none"
                placeholder="J'ai enfin compris… J'ai réussi… J'ai bien travaillé sur…"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                🎯 Objectifs pour demain
              </label>
              <textarea
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                rows={3}
                className="w-full text-sm p-4 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] focus:ring-2 focus:ring-[#a3caa0] outline-none resize-none"
                placeholder="Demain je veux… Je dois absolument revoir… Mon objectif est…"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={cancel} className="px-6 py-2.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition">
              Annuler
            </button>
            <button onClick={save} className="flex-1 py-2.5 bg-[#1b3224] text-white text-xs font-bold rounded-xl hover:bg-[#5c7d67] transition shadow-sm">
              💾 Enregistrer cette entrée
            </button>
          </div>
        </div>
      )}

      {/* Entries timeline */}
      {entries.length === 0 && !showForm && (
        <div className="text-center py-16 space-y-4">
          <div className="text-6xl">📓</div>
          <p className="font-serif text-xl text-[#1b3224]">Ton journal est vide pour l'instant.</p>
          <p className="text-sm text-slate-500">Clique sur "Nouvelle entrée" pour commencer à écrire !</p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-[#1b3224] text-lg flex items-center gap-2">
            📚 Historique
            <span className="text-sm font-normal text-slate-400">({entries.length} entrée{entries.length > 1 ? "s" : ""})</span>
          </h3>

          {entries.map((entry, idx) => {
            const moodCfg = MOODS.find((m) => m.value === entry.mood)!;
            const isToday = entry.date === todayISO();
            return (
              <div
                key={entry.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${isToday ? "border-[#8da894] ring-1 ring-[#8da894]" : "border-[#e3eee8]"}`}
              >
                {/* Entry header */}
                <div className={`flex justify-between items-center px-6 py-4 border-b border-[#f3f7f5] ${moodCfg.color} bg-opacity-30`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{moodCfg.emoji}</span>
                    <div>
                      <p className="font-bold text-sm text-[#1b3224] capitalize">{formatDate(entry.date)}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${moodCfg.color}`}>{moodCfg.label}</span>
                      {isToday && <span className="ml-2 text-[10px] bg-[#c49b80] text-white px-2 py-0.5 rounded-full font-bold">Aujourd'hui</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(entry)} className="px-3 py-1.5 text-[10px] font-semibold text-[#1b3224] bg-white border border-[#cae0d4] rounded-lg hover:bg-[#e3eee8] transition">✏️ Modifier</button>
                    <button onClick={() => deleteEntry(entry.id)} className="px-3 py-1.5 text-[10px] font-semibold text-red-500 bg-white border border-red-100 rounded-lg hover:bg-red-50 transition">🗑</button>
                  </div>
                </div>

                {/* Entry body */}
                <div className="p-6 space-y-4">
                  {entry.content && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">📝 Journal</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                    </div>
                  )}
                  {(entry.victories || entry.objectives) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {entry.victories && (
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1.5">🏆 Victoires</p>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.victories}</p>
                        </div>
                      )}
                      {entry.objectives && (
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1.5">🎯 Objectifs</p>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.objectives}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
