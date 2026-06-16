import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

type Kholle = {
  id: string;
  subject: string;
  date: string;
  note: number | null;
  salle: string;
  colleur: string;
  programmePhoto: string;
  alert: boolean;
  comment: string;
};

const STORAGE = "khube_kholles_v1";
const SUBJECTS = ["Maths", "Biologie", "Chimie", "Physique", "Géologie", "Géographie", "Français", "Anglais"];

function load(): Kholle[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getWeekKey(dateStr: string) {
  const d = new Date(dateStr);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay() + 1);
  return start.toISOString().split("T")[0];
}

export default function Kholles() {
  const [kholles, setKholles] = useState<Kholle[]>(load);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [form, setForm] = useState({
    subject: "Maths",
    date: new Date().toISOString().split("T")[0],
    note: "",
    salle: "",
    colleur: "",
    comment: "",
    alert: false,
    programmePhoto: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(kholles));
  }, [kholles]);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setForm((f) => ({ ...f, programmePhoto: evt.target?.result as string }));
    reader.readAsDataURL(file);
  }

  function add() {
    const note = form.note.trim() ? parseFloat(form.note) : null;
    if (note !== null && (isNaN(note) || note < 0 || note > 20)) return;
    setKholles((prev) => [
      ...prev,
      {
        id: `kh_${Date.now()}`,
        subject: form.subject,
        date: form.date,
        note,
        salle: form.salle.trim(),
        colleur: form.colleur.trim(),
        programmePhoto: form.programmePhoto,
        alert: form.alert,
        comment: form.comment.trim(),
      },
    ]);
    setForm({ subject: "Maths", date: new Date().toISOString().split("T")[0], note: "", salle: "", colleur: "", comment: "", alert: false, programmePhoto: "" });
  }

  function remove(id: string) {
    if (!confirm("Supprimer cette khôlle ?")) return;
    setKholles((prev) => prev.filter((k) => k.id !== id));
  }

  function toggleAlert(id: string) {
    setKholles((prev) => prev.map((k) => (k.id === id ? { ...k, alert: !k.alert } : k)));
  }

  const chartData = useMemo(() => {
    const byWeek: Record<string, { total: number; count: number; label: string }> = {};
    kholles
      .filter((k) => k.note !== null)
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((k) => {
        const wk = getWeekKey(k.date);
        if (!byWeek[wk]) {
          const d = new Date(wk);
          byWeek[wk] = { total: 0, count: 0, label: d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) };
        }
        byWeek[wk].total += k.note!;
        byWeek[wk].count += 1;
      });
    return Object.entries(byWeek)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ label: v.label, moyenne: Math.round((v.total / v.count) * 10) / 10 }));
  }, [kholles]);

  const upcoming = kholles.filter((k) => k.date >= new Date().toISOString().split("T")[0]).sort((a, b) => a.date.localeCompare(b.date));
  const past = kholles.filter((k) => k.date < new Date().toISOString().split("T")[0]).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-8">
      {lightbox && (
        <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Programme khôlle" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224]">📋 Khôlles</h2>
        <p className="text-sm text-slate-500">Salle, colleur, programme en photo, alertes et statistiques de progression.</p>
      </div>

      {chartData.length >= 2 && (
        <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
          <h3 className="font-serif font-bold text-[#1b3224] mb-4">📈 Évolution des notes de khôlles (par semaine)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 20]} tick={{ fontSize: 11 }} />
              <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="4 2" />
              <ReferenceLine y={14} stroke="#22c55e" strokeDasharray="4 2" />
              <Tooltip formatter={(v: number) => [`${v}/20`, "Moyenne"]} />
              <Line type="monotone" dataKey="moyenne" stroke="#8da894" strokeWidth={3} dot={{ r: 5, fill: "#8da894" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm">
              <h3 className="font-semibold text-amber-800 mb-3">🔔 Khôlles à venir</h3>
              <div className="space-y-3">
                {upcoming.map((k) => (
                  <KholleCard key={k.id} k={k} onRemove={remove} onToggleAlert={toggleAlert} onPhotoClick={setLightbox} />
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
            <h3 className="font-semibold text-[#1b3224] mb-3">Historique ({past.length})</h3>
            <div className="space-y-3">
              {past.length === 0 && <p className="text-sm text-slate-400">Aucune khôlle passée.</p>}
              {past.map((k) => (
                <KholleCard key={k.id} k={k} onRemove={remove} onToggleAlert={toggleAlert} onPhotoClick={setLightbox} />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm space-y-4 self-start sticky top-24">
          <h3 className="font-semibold text-[#1b3224]">➕ Ajouter une khôlle</h3>
          <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" />
          <input value={form.salle} onChange={(e) => setForm((f) => ({ ...f, salle: e.target.value }))} placeholder="Salle (ex: S12)" className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" />
          <input value={form.colleur} onChange={(e) => setForm((f) => ({ ...f, colleur: e.target.value }))} placeholder="Colleur (ex: M. Dupont)" className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" />
          <input type="number" min={0} max={20} step={0.5} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Note /20 (optionnel si à venir)" className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" />
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Programme de khôlle (photo)</label>
            <input type="file" accept="image/*" onChange={handlePhoto} className="w-full text-xs p-2 rounded-2xl border border-[#cae0d4] bg-white" />
            {form.programmePhoto && <img src={form.programmePhoto} alt="Preview" className="mt-2 h-24 rounded-xl object-cover border" />}
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.alert} onChange={(e) => setForm((f) => ({ ...f, alert: e.target.checked }))} className="rounded" />
            <span>🔔 Alerte importante (rappel sur l'accueil)</span>
          </label>
          <textarea value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} rows={2} placeholder="Commentaire…" className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none resize-none" />
          <button onClick={add} className="w-full py-3 rounded-2xl bg-[#8da894] text-white text-sm font-semibold hover:bg-[#5c7d67] transition">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

function KholleCard({ k, onRemove, onToggleAlert, onPhotoClick }: {
  k: Kholle;
  onRemove: (id: string) => void;
  onToggleAlert: (id: string) => void;
  onPhotoClick: (uri: string) => void;
}) {
  const isPast = k.date < new Date().toISOString().split("T")[0];
  return (
    <div className={`rounded-2xl border p-4 ${k.alert ? "border-amber-400 bg-amber-50" : "border-[#e3eee8] bg-[#f8faf8]"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#1b3224]">{k.subject}</span>
            {k.alert && <span className="text-[10px] bg-amber-400 text-white px-2 py-0.5 rounded-full font-bold">ALERTE</span>}
            {k.note !== null && <span className="text-sm font-bold text-[#1b3224]">{k.note}/20</span>}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {new Date(k.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            {k.salle && ` · Salle ${k.salle}`}
            {k.colleur && ` · ${k.colleur}`}
          </div>
          {k.comment && <p className="text-xs text-slate-600 mt-1">{k.comment}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => onToggleAlert(k.id)} className="text-xs" title="Alerte">{k.alert ? "🔔" : "🔕"}</button>
          <button onClick={() => onRemove(k.id)} className="text-xs text-red-400">🗑</button>
        </div>
      </div>
      {k.programmePhoto && (
        <button onClick={() => onPhotoClick(k.programmePhoto)} className="mt-3 block">
          <img src={k.programmePhoto} alt="Programme" className="h-20 rounded-xl object-cover border border-[#cae0d4] hover:opacity-90 transition cursor-zoom-in" />
          <span className="text-[10px] text-slate-400">Cliquer pour agrandir</span>
        </button>
      )}
      {!isPast && !k.note && <p className="text-[10px] text-amber-600 mt-2 font-semibold">À venir</p>}
    </div>
  );
}

// Export helper for home page alerts
export function getKholleAlerts(): Kholle[] {
  return load().filter((k) => k.alert && k.date >= new Date().toISOString().split("T")[0]);
}

export function getAllKholles(): Kholle[] {
  return load();
}
