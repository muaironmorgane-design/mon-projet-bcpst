import { useEffect, useMemo, useState } from "react";

type ResourceKind = "pdf" | "photo" | "url";

type Resource = { id: string; kind: ResourceKind; label: string; uri: string };

type Chapter = { id: string; title: string; completed: boolean; resources: Resource[] };

type SubjectProgress = { id: string; subject: string; chapters: Chapter[] };

const STORAGE_KEY = "khube_revisions_v1";

const DEFAULT_SUBJECTS: SubjectProgress[] = [
  {
    id: "math",
    subject: "Mathématiques",
    chapters: [
      { id: "math-1", title: "Fonctions et dérivées", completed: false, resources: [] },
      { id: "math-2", title: "Suites et séries", completed: false, resources: [] },
      { id: "math-3", title: "Probabilités", completed: false, resources: [] },
    ],
  },
  {
    id: "bio",
    subject: "Biologie",
    chapters: [
      { id: "bio-1", title: "Respiration cellulaire", completed: false, resources: [] },
      { id: "bio-2", title: "Cycle cellulaire", completed: false, resources: [] },
      { id: "bio-3", title: "Écologie et environnement", completed: false, resources: [] },
    ],
  },
  {
    id: "chimie",
    subject: "Chimie",
    chapters: [
      { id: "chimie-1", title: "Chimie organique", completed: false, resources: [] },
      { id: "chimie-2", title: "Réactions acide/base", completed: false, resources: [] },
      { id: "chimie-3", title: "Cinétique chimique", completed: false, resources: [] },
    ],
  },
  {
    id: "physique",
    subject: "Physique",
    chapters: [
      { id: "phys-1", title: "Électrocinétique", completed: false, resources: [] },
      { id: "phys-2", title: "Thermodynamique", completed: false, resources: [] },
      { id: "phys-3", title: "Ondes et optique", completed: false, resources: [] },
    ],
  },
  {
    id: "geographie",
    subject: "Géographie",
    chapters: [
      { id: "geo-1", title: "Territoires et développement", completed: false, resources: [] },
      { id: "geo-2", title: "Risques et ressources", completed: false, resources: [] },
    ],
  },
];

function loadProgress(): SubjectProgress[] {
  if (typeof window === "undefined") return DEFAULT_SUBJECTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SUBJECTS;
  } catch {
    return DEFAULT_SUBJECTS;
  }
}

function saveProgress(value: SubjectProgress[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export default function Revisions() {
  const [progress, setProgress] = useState<SubjectProgress[]>(loadProgress);
  const [newSubject, setNewSubject] = useState("");
  const [newChapter, setNewChapter] = useState<Record<string, string>>({});
  const [resourceForms, setResourceForms] = useState<Record<string, { label: string; uri: string; kind: ResourceKind }>>({});

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const globalPercent = useMemo(() => {
    const all = progress.flatMap((s) => s.chapters);
    if (!all.length) return 0;
    const done = all.filter((c) => c.completed).length;
    return Math.round((done / all.length) * 100);
  }, [progress]);

  function addSubject() {
    const title = newSubject.trim();
    if (!title) return;
    setProgress((prev) => [
      ...prev,
      { id: `subj_${Date.now()}`, subject: title, chapters: [] },
    ]);
    setNewSubject("");
  }

  function addChapter(subjectId: string) {
    const title = (newChapter[subjectId] || "").trim();
    if (!title) return;
    setProgress((prev) => prev.map((subject) => subject.id !== subjectId ? subject : {
      ...subject,
      chapters: [...subject.chapters, { id: `chap_${Date.now()}`, title, completed: false, resources: [] }],
    }));
    setNewChapter((prev) => ({ ...prev, [subjectId]: "" }));
  }

  function toggleChapter(subjectId: string, chapterId: string) {
    setProgress((prev) => prev.map((subject) => subject.id !== subjectId ? subject : {
      ...subject,
      chapters: subject.chapters.map((chapter) => chapter.id === chapterId ? { ...chapter, completed: !chapter.completed } : chapter),
    }));
  }

    function updateResourceForm(
      subjectId: string,
      chapterId: string,
      field: "label" | "uri" | "kind",
      value: string
    ) {
      const formKey = `${subjectId}_${chapterId}`;
      setResourceForms((prev) => ({
        ...prev,
        [formKey]: {
          label: field === "label" ? value : prev[formKey]?.label ?? "",
          uri: field === "uri" ? value : prev[formKey]?.uri ?? "",
          kind: (field === "kind" ? (value as ResourceKind) : prev[formKey]?.kind) ?? "url",
        },
      }));
    }

  function addResource(subjectId: string, chapterId: string) {
    const formKey = `${subjectId}_${chapterId}`;
    const form = resourceForms[formKey];
    if (!form || !form.label.trim() || !form.uri.trim()) return;
    if (form.kind !== "photo" && !form.uri.startsWith("http")) {
      alert("Le lien doit commencer par http:// ou https://");
      return;
    }
    setProgress((prev) => prev.map((subject) => subject.id !== subjectId ? subject : {
      ...subject,
      chapters: subject.chapters.map((chapter) => chapter.id !== chapterId ? chapter : {
        ...chapter,
        resources: [...chapter.resources, { id: `res_${Date.now()}`, label: form.label.trim(), kind: form.kind, uri: form.uri.trim() }],
      }),
    }));
    setResourceForms((prev) => ({
      ...prev,
      [formKey]: { label: "", uri: "", kind: form.kind },
    }));
  }

  const subjectCards = progress.map((subject) => {
    const done = subject.chapters.filter((c) => c.completed).length;
    const total = subject.chapters.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return (
      <div key={subject.id} className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-[#1b3224] text-lg">{subject.subject}</h3>
            <p className="text-xs text-slate-500">{done}/{total} chapitres complétés</p>
          </div>
          <div className="w-full lg:w-72 bg-[#f3f7f5] rounded-full h-3 overflow-hidden mt-2 lg:mt-0">
            <div className="h-full bg-[#8da894] rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="grid gap-4">
          {subject.chapters.map((chapter) => {
            const formKey = `${subject.id}_${chapter.id}`;
            const resourceForm = resourceForms[formKey] ?? { label: "", uri: "", kind: "url" as ResourceKind };
            return (
              <div key={chapter.id} className={`rounded-3xl border p-5 ${chapter.completed ? "border-[#8da894] bg-[#ebf7ef]" : "border-[#e3eee8] bg-[#f8faf8]"}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div>
                    <h4 className="font-semibold text-[#1b3224]">{chapter.title}</h4>
                    <p className="text-[11px] text-slate-500">{chapter.resources.length} ressource(s)</p>
                  </div>
                  <button onClick={() => toggleChapter(subject.id, chapter.id)} className={`px-4 py-2 rounded-2xl text-xs font-semibold ${chapter.completed ? "bg-white text-slate-600 border border-[#d1e5db]" : "bg-[#8da894] text-white"}`}>
                    {chapter.completed ? "Revoir" : "Marquer comme révisé"}
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_0.85fr]">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input value={resourceForm.label} onChange={(e) => updateResourceForm(subject.id, chapter.id, "label", e.target.value)} placeholder="Nom de la ressource" className="w-full p-3 rounded-2xl border border-[#cae0d4] bg-white outline-none text-sm" />
                      <input value={resourceForm.uri} onChange={(e) => updateResourceForm(subject.id, chapter.id, "uri", e.target.value)} placeholder="URL ou chemin" className="w-full p-3 rounded-2xl border border-[#cae0d4] bg-white outline-none text-sm" />
                    </div>
                    <div className="flex items-center gap-3">
                      <select value={resourceForm.kind} onChange={(e) => updateResourceForm(subject.id, chapter.id, "kind", e.target.value)} className="text-xs p-3 rounded-2xl border border-[#cae0d4] bg-white outline-none">
                        <option value="url">Lien</option>
                        <option value="pdf">PDF</option>
                        <option value="photo">Photo</option>
                      </select>
                      <button onClick={() => addResource(subject.id, chapter.id)} className="px-4 py-3 rounded-2xl bg-[#8da894] text-white text-sm font-semibold hover:bg-[#5c7d67] transition">Ajouter ressource</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {chapter.resources.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-[#d1d5db] p-4 text-sm text-slate-500">Aucune ressource ajoutée pour ce chapitre.</div>
                    ) : (
                      <div className="space-y-3">
                        {chapter.resources.map((resource) => (
                          <div key={resource.id} className="rounded-2xl border border-[#e3e8e5] bg-white p-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">{resource.label}</p>
                              <p className="text-[11px] text-slate-500">{resource.kind.toUpperCase()}</p>
                            </div>
                            <a href={resource.uri} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#1b3224] hover:text-[#5c7d67]">Ouvrir</a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="rounded-3xl border border-[#e3eee8] bg-[#f3f7f5] p-5">
            <h4 className="font-semibold text-[#1b3224] mb-3">Ajouter un chapitre</h4>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input value={newChapter[subject.id] || ""} onChange={(e) => setNewChapter((prev) => ({ ...prev, [subject.id]: e.target.value }))} placeholder="Titre du chapitre" className="w-full p-3 rounded-2xl border border-[#cae0d4] bg-white outline-none text-sm" />
              <button onClick={() => addChapter(subject.id)} className="px-4 py-3 rounded-2xl bg-[#8da894] text-white text-sm font-semibold hover:bg-[#5c7d67] transition">Ajouter</button>
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1b3224]">📚 Révisions</h2>
            <p className="text-sm text-slate-500">Ajoute des matières, chapitres et ressources (PDF, photo, liens) directement dans tes fiches.</p>
          </div>
          <div className="rounded-3xl border border-[#e3eee8] bg-[#f3f7f5] p-4 text-center min-w-[180px]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Progression totale</p>
            <p className="text-4xl font-serif font-bold text-[#1b3224]">{globalPercent}%</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_0.8fr] items-end">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Ajouter une matière</label>
            <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="w-full p-3 rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" placeholder="Ex: SVT, Chimie, Géographie" />
          </div>
          <button onClick={addSubject} className="w-full md:w-auto px-5 py-3 rounded-2xl bg-[#8da894] text-white text-sm font-semibold hover:bg-[#5c7d67] transition">Ajouter une matière</button>
        </div>
      </div>

      <div className="grid gap-6">
        {subjectCards}
      </div>
    </div>
  );
}
