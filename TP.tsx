import { useEffect, useMemo, useState } from "react";

type Attachment = {
  id: string;
  kind: "photo" | "pdf" | "url";
  label: string;
  uri: string;
};

type Task = {
  id: string;
  title: string;
  category: string;
  icon: string;
  notes: string;
  profAdvice: string;
  attachments: Attachment[];
  date?: string;
};

const STORAGE_KEY = "khube_tp_tasks_v1";

const CATEGORIES = [
  { label: "Dissection animale", icon: "🐁" },
  { label: "Dissection florale", icon: "🌸" },
  { label: "Coupes histologiques", icon: "🔬" },
  { label: "Microscope", icon: "🧫" },
  { label: "TP Enzymologie", icon: "🧬" },
  { label: "TP Numérique", icon: "💻" },
  { label: "Électrophorèse", icon: "⚡" },
  { label: "Chimie", icon: "⚗️" },
  { label: "Géologie", icon: "🪨" },
  { label: "Physique", icon: "🔭" },
  { label: "Observation", icon: "👁️" },
];

const DEFAULT_TASKS: Task[] = [
  { id: "task-1", title: "Dissection de la souris", category: "Dissection animale", icon: "🐁", notes: "Observer les organes et tracer un schéma clair.", profAdvice: "Prendre des photos étape par étape.", attachments: [] },
  { id: "task-2", title: "TP Enzymologie — Catalase", category: "TP Enzymologie", icon: "🧬", notes: "Mesurer l'activité enzymatique.", profAdvice: "Contrôler la température.", attachments: [] },
  { id: "task-3", title: "Électrophorèse protéines (semi-log)", category: "Électrophorèse", icon: "⚡", notes: "Analyser le papier semi-log.", profAdvice: "Bien calibrer les poids moléculaires.", attachments: [] },
];

type SortKey = "date" | "category" | "title";

function loadTasks(): Task[] {
  if (typeof window === "undefined") return DEFAULT_TASKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_TASKS;
  } catch {
    return DEFAULT_TASKS;
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export default function TP() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", category: CATEGORIES[0].label, notes: "", profAdvice: "" });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentLabel, setAttachmentLabel] = useState("");
  const [attachmentKind, setAttachmentKind] = useState<"photo" | "pdf" | "url">("url");
  const [attachmentValue, setAttachmentValue] = useState("");
  const [filePreview, setFilePreview] = useState<string>("");

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const sortedTasks = useMemo(() => {
    let list = filterCat === "all" ? [...tasks] : tasks.filter((t) => t.category === filterCat);
    list.sort((a, b) => {
      if (sortBy === "category") return a.category.localeCompare(b.category);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return (b.date ?? "").localeCompare(a.date ?? "");
    });
    return list;
  }, [tasks, sortBy, filterCat]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setAttachmentValue(evt.target?.result as string);
      setFilePreview(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function addAttachment() {
    if (!attachmentLabel.trim() || !attachmentValue.trim()) return;
    if (attachmentKind !== "photo" && !attachmentValue.startsWith("http") && !attachmentValue.startsWith("data:")) {
      alert("Pour un PDF ou un lien, commence par http:// ou https://");
      return;
    }
    setAttachments((prev) => [
      ...prev,
      { id: `att_${Date.now()}`, kind: attachmentKind, label: attachmentLabel.trim(), uri: attachmentValue.trim() },
    ]);
    setAttachmentLabel("");
    setAttachmentValue("");
    setFilePreview("");
  }

  function addTask() {
    if (!form.title.trim()) return;
    const category = CATEGORIES.find((c) => c.label === form.category) ?? CATEGORIES[0];
    setTasks((prev) => [
      ...prev,
      {
        id: `task_${Date.now()}`,
        title: form.title.trim(),
        category: category.label,
        icon: category.icon,
        notes: form.notes.trim(),
        profAdvice: form.profAdvice.trim(),
        attachments,
        date: new Date().toISOString().split("T")[0],
      },
    ]);
    setForm({ title: "", category: CATEGORIES[0].label, notes: "", profAdvice: "" });
    setAttachments([]);
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function addAttachmentToTask(taskId: string, att: Attachment) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, attachments: [...t.attachments, att] } : t)));
  }

  return (
    <div className="space-y-8">
      {lightbox && (
        <div className="fixed inset-0 z-[1000] bg-black/85 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Photo TP agrandie" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" />
          <button className="absolute top-4 right-4 text-white text-2xl" onClick={() => setLightbox(null)}>✕</button>
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224]">🔬 TP & Travaux pratiques</h2>
        <p className="text-sm text-slate-500">Dissections, enzymo, numérique, électrophorèse… Photos cliquables, plusieurs documents par TP.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#cae0d4] bg-white">
          <option value="all">Toutes catégories</option>
          {CATEGORIES.map((c) => <option key={c.label} value={c.label}>{c.icon} {c.label}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#cae0d4] bg-white">
          <option value="date">Trier par date</option>
          <option value="category">Trier par catégorie</option>
          <option value="title">Trier par titre</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="space-y-4">
          {sortedTasks.map((task) => (
            <div key={task.id} className="rounded-3xl border border-[#e3eee8] p-4 bg-[#f7faf8] shadow-sm">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{task.icon}</div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-semibold text-[#1b3224]">{task.title}</h4>
                      <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">{task.category}</div>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="text-red-400 hover:text-red-600 text-xs font-semibold">🗑 Supprimer</button>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">{task.notes || "Aucune note."}</p>
                  {task.profAdvice && (
                    <div className="rounded-2xl border border-[#e3eee8] bg-[#eef6ed] p-3 mb-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-1">Conseils profs</p>
                      <p className="text-sm text-slate-700">{task.profAdvice}</p>
                    </div>
                  )}
                  {task.attachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Documents & photos ({task.attachments.length})</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {task.attachments.map((att) => (
                          <div key={att.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#d9e7d7] bg-white p-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#1b3224] truncate">{att.label}</p>
                              <p className="text-[11px] text-slate-500">{att.kind === "photo" ? "Photo" : att.kind === "pdf" ? "PDF" : "Lien"}</p>
                            </div>
                            {att.kind === "photo" ? (
                              <button onClick={() => setLightbox(att.uri)} className="shrink-0">
                                <img src={att.uri} alt={att.label} className="h-16 w-16 rounded-2xl object-cover border border-[#e3eee8] hover:ring-2 hover:ring-[#8da894] transition cursor-zoom-in" />
                              </button>
                            ) : (
                              <a href={att.uri} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-[#1b3224] hover:text-[#5c7d67] shrink-0">Ouvrir ↗</a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <TaskAddAttachment onAdd={(att) => addAttachmentToTask(task.id, att)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm space-y-4 self-start sticky top-24">
          <h3 className="font-semibold text-[#1b3224]">Ajouter un TP</h3>
          <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" placeholder="Titre du TP" />
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
            {CATEGORIES.map((c) => <option key={c.label} value={c.label}>{c.icon} {c.label}</option>)}
          </select>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none resize-none" placeholder="Notes de séance" />
          <textarea value={form.profAdvice} onChange={(e) => setForm((f) => ({ ...f, profAdvice: e.target.value }))} rows={2} className="w-full p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none resize-none" placeholder="Conseils prof" />

          <div className="rounded-3xl border border-[#e3eee8] bg-[#f8faf8] p-4 space-y-3">
            <h4 className="text-sm font-semibold">Pièces jointes</h4>
            <div className="grid grid-cols-2 gap-2">
              <select value={attachmentKind} onChange={(e) => { setAttachmentKind(e.target.value as Attachment["kind"]); setAttachmentValue(""); setFilePreview(""); }} className="text-xs p-2 rounded-xl border bg-white">
                <option value="url">Lien</option>
                <option value="pdf">PDF</option>
                <option value="photo">Photo</option>
              </select>
              <input type="text" value={attachmentLabel} onChange={(e) => setAttachmentLabel(e.target.value)} placeholder="Nom" className="text-xs p-2 rounded-xl border bg-white" />
            </div>
            {attachmentKind === "photo" ? (
              <input type="file" accept="image/*" onChange={handleFileChange} className="text-xs w-full" />
            ) : (
              <input type="text" value={attachmentValue} onChange={(e) => setAttachmentValue(e.target.value)} placeholder="https://…" className="text-xs p-2 rounded-xl border bg-white w-full" />
            )}
            {filePreview && <img src={filePreview} alt="" className="h-20 rounded-xl object-cover" />}
            <button type="button" onClick={addAttachment} className="w-full py-2 bg-[#8da894] text-white text-xs font-semibold rounded-xl">+ Pièce jointe</button>
            {attachments.map((att) => (
              <div key={att.id} className="text-xs flex justify-between bg-white p-2 rounded-xl border">
                <span>{att.label}</span>
                <button onClick={() => setAttachments((p) => p.filter((a) => a.id !== att.id))} className="text-red-400">✕</button>
              </div>
            ))}
          </div>
          <button onClick={addTask} className="w-full py-3 rounded-2xl bg-[#8da894] text-white text-sm font-semibold hover:bg-[#5c7d67] transition">Ajouter le TP</button>
        </div>
      </div>
    </div>
  );
}

function TaskAddAttachment({ onAdd }: { onAdd: (att: Attachment) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<Attachment["kind"]>("photo");
  const [uri, setUri] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setUri(evt.target?.result as string);
    reader.readAsDataURL(file);
  }

  function submit() {
    if (!label.trim() || !uri.trim()) return;
    onAdd({ id: `att_${Date.now()}`, kind, label: label.trim(), uri: uri.trim() });
    setLabel(""); setUri(""); setOpen(false);
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} className="mt-2 text-xs text-[#5c7d67] font-semibold hover:underline">+ Ajouter un document à ce TP</button>;
  }
  return (
    <div className="mt-3 p-3 rounded-2xl border border-dashed border-[#cae0d4] bg-white space-y-2">
      <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nom du document" className="w-full text-xs p-2 rounded-xl border" />
      <select value={kind} onChange={(e) => setKind(e.target.value as Attachment["kind"])} className="text-xs p-2 rounded-xl border">
        <option value="photo">Photo</option>
        <option value="pdf">PDF</option>
        <option value="url">Lien</option>
      </select>
      {kind === "photo" ? <input type="file" accept="image/*" onChange={handleFile} className="text-xs w-full" /> : <input value={uri} onChange={(e) => setUri(e.target.value)} placeholder="URL" className="w-full text-xs p-2 rounded-xl border" />}
      <div className="flex gap-2">
        <button onClick={submit} className="text-xs px-3 py-1 bg-[#8da894] text-white rounded-lg">Ajouter</button>
        <button onClick={() => setOpen(false)} className="text-xs px-3 py-1 border rounded-lg">Annuler</button>
      </div>
    </div>
  );
}
