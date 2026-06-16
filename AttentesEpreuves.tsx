import { useEffect, useState } from "react";

type AttenteDoc = {
  id: string;
  type: "image" | "pdf" | "url";
  name: string;
  data: string;
};

type AttenteSection = {
  id: string;
  subject: string;
  items: { id: string; text: string }[];
  documents: AttenteDoc[];
};

const STORAGE = "khube_attentes_v1";

const DEFAULT: AttenteSection[] = [
  {
    id: "maths",
    subject: "Mathématiques",
    items: [
      { id: "m1", text: "Maîtriser les raisonnements logiques et les démonstrations claires." },
      { id: "m2", text: "Savoir vulgariser un résultat et expliquer la démarche." },
      { id: "m3", text: "Ne pas négliger les annales de probabilités et d'analyse." },
    ],
    documents: [],
  },
  {
    id: "pc",
    subject: "Physique-Chimie",
    items: [
      { id: "p1", text: "Présenter les expériences avec un vocabulaire précis." },
      { id: "p2", text: "Relier les formules aux situations physiques du sujet." },
      { id: "p3", text: "Soigner les schémas et les unités." },
    ],
    documents: [],
  },
  {
    id: "sv",
    subject: "Sciences de la Vie / Biologie",
    items: [
      { id: "s1", text: "Structurer les arguments autour d'un diagramme ou d'un axe." },
      { id: "s2", text: "Utiliser les bons termes biologiques et les liaisons moléculaires." },
      { id: "s3", text: "Faire le lien entre hypothèse, résultat et interprétation." },
    ],
    documents: [],
  },
  {
    id: "geo",
    subject: "Géographie",
    items: [
      { id: "g1", text: "Analyser une carte en identifiant l'échelle, les légendes et les flux." },
      { id: "g2", text: "Relier les territoires aux enjeux humains / environnementaux." },
      { id: "g3", text: "Donner des exemples précis et actuels." },
    ],
    documents: [],
  },
  {
    id: "fr",
    subject: "Français",
    items: [
      { id: "f1", text: "Proposer une lecture structurée du texte en 3 parties." },
      { id: "f2", text: "Ne pas oublier l'introduction, la problématique et la conclusion." },
      { id: "f3", text: "Soigner l'expression et les transitions." },
    ],
    documents: [],
  },
  {
    id: "en",
    subject: "Anglais",
    items: [
      { id: "e1", text: "Répondre précisément aux questions en respectant les temps." },
      { id: "e2", text: "Ne pas traduire mot à mot : privilégier la fluidité et le vocabulaire." },
      { id: "e3", text: "Présenter un plan clair, surtout à l'oral." },
    ],
    documents: [],
  },
  {
    id: "tp",
    subject: "TP / Khôlles",
    items: [
      { id: "t1", text: "Commencer par reformuler la question ou l'objectif de l'expérience." },
      { id: "t2", text: "Décrire brièvement le protocole et le matériel utilisé." },
      { id: "t3", text: "Énoncer les conclusions même quand le résultat n'est pas attendu." },
    ],
    documents: [],
  },
];

function load(): AttenteSection[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT;
}

export default function AttentesEpreuves() {
  const [sections, setSections] = useState<AttenteSection[]>(load);
  const [editingItem, setEditingItem] = useState<{ sectionId: string; itemId: string } | null>(null);
  const [editText, setEditText] = useState("");
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [newSubject, setNewSubject] = useState("");
  const [urlInput, setUrlInput] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(sections));
  }, [sections]);

  function updateSection(id: string, updater: (s: AttenteSection) => AttenteSection) {
    setSections((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
  }

  function addItem(sectionId: string) {
    const text = (newItemText[sectionId] ?? "").trim();
    if (!text) return;
    updateSection(sectionId, (s) => ({
      ...s,
      items: [...s.items, { id: `i_${Date.now()}`, text }],
    }));
    setNewItemText((p) => ({ ...p, [sectionId]: "" }));
  }

  function saveEdit(sectionId: string) {
    if (!editingItem || !editText.trim()) return;
    updateSection(sectionId, (s) => ({
      ...s,
      items: s.items.map((i) => (i.id === editingItem.itemId ? { ...i, text: editText.trim() } : i)),
    }));
    setEditingItem(null);
  }

  function removeItem(sectionId: string, itemId: string) {
    updateSection(sectionId, (s) => ({ ...s, items: s.items.filter((i) => i.id !== itemId) }));
  }

  function addSection() {
    const subject = newSubject.trim();
    if (!subject) return;
    setSections((prev) => [
      ...prev,
      { id: `sec_${Date.now()}`, subject, items: [], documents: [] },
    ]);
    setNewSubject("");
  }

  function removeSection(id: string) {
    if (!confirm("Supprimer cette matière et tous ses contenus ?")) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  function handleFile(sectionId: string, e: React.ChangeEvent<HTMLInputElement>, type: "image" | "pdf") {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      updateSection(sectionId, (s) => ({
        ...s,
        documents: [
          ...s.documents,
          { id: `d_${Date.now()}`, type, name: file.name, data: evt.target?.result as string },
        ],
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function addUrl(sectionId: string) {
    const url = (urlInput[sectionId] ?? "").trim();
    if (!url) return;
    updateSection(sectionId, (s) => ({
      ...s,
      documents: [
        ...s.documents,
        { id: `d_${Date.now()}`, type: "url", name: url, data: url },
      ],
    }));
    setUrlInput((p) => ({ ...p, [sectionId]: "" }));
  }

  function removeDoc(sectionId: string, docId: string) {
    updateSection(sectionId, (s) => ({
      ...s,
      documents: s.documents.filter((d) => d.id !== docId),
    }));
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224]">🎯 Attentes pour chaque épreuve</h2>
        <p className="text-sm text-slate-500">Modifie les attentes, ajoute des rapports de jury (images, PDF, liens).</p>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-[#e3eee8] shadow-sm flex flex-wrap gap-3">
        <input
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="Nouvelle matière…"
          className="flex-1 min-w-[200px] p-3 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none"
        />
        <button onClick={addSection} className="px-5 py-3 rounded-2xl bg-[#8da894] text-white text-sm font-semibold hover:bg-[#5c7d67]">
          + Ajouter une matière
        </button>
      </div>

      <div className="grid gap-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-[#1b3224] text-lg">{section.subject}</h3>
              <button onClick={() => removeSection(section.id)} className="text-xs text-red-400 hover:text-red-600">Supprimer matière</button>
            </div>

            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item.id} className="flex items-start gap-2 text-sm text-slate-700 group">
                  <span className="text-[#8da894] mt-0.5">•</span>
                  {editingItem?.sectionId === section.id && editingItem.itemId === item.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 p-2 rounded-xl border border-[#cae0d4] text-sm outline-none"
                        autoFocus
                      />
                      <button onClick={() => saveEdit(section.id)} className="text-xs px-2 py-1 rounded-lg bg-[#8da894] text-white">OK</button>
                      <button onClick={() => setEditingItem(null)} className="text-xs px-2 py-1 rounded-lg bg-slate-200">Annuler</button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1">{item.text}</span>
                      <button
                        onClick={() => { setEditingItem({ sectionId: section.id, itemId: item.id }); setEditText(item.text); }}
                        className="opacity-0 group-hover:opacity-100 text-xs text-[#5c7d67]"
                      >✏️</button>
                      <button onClick={() => removeItem(section.id, item.id)} className="opacity-0 group-hover:opacity-100 text-xs text-red-400">🗑</button>
                    </>
                  )}
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <input
                value={newItemText[section.id] ?? ""}
                onChange={(e) => setNewItemText((p) => ({ ...p, [section.id]: e.target.value }))}
                placeholder="Ajouter une attente…"
                className="flex-1 p-2.5 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none"
                onKeyDown={(e) => e.key === "Enter" && addItem(section.id)}
              />
              <button onClick={() => addItem(section.id)} className="px-4 py-2 rounded-2xl bg-[#e8f4ec] text-[#1b3224] text-sm font-semibold hover:bg-[#d1e5d5]">+</button>
            </div>

            <div className="border-t border-[#e3eee8] pt-4 space-y-3">
              <h4 className="text-sm font-semibold text-[#1b3224]">📎 Documents & rapports de jury</h4>
              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer px-3 py-2 rounded-xl bg-[#f3f7f5] border border-[#cae0d4] text-xs font-semibold hover:bg-[#e8f4ec]">
                  🖼 Image
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(section.id, e, "image")} />
                </label>
                <label className="cursor-pointer px-3 py-2 rounded-xl bg-[#f3f7f5] border border-[#cae0d4] text-xs font-semibold hover:bg-[#e8f4ec]">
                  📄 PDF
                  <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFile(section.id, e, "pdf")} />
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  value={urlInput[section.id] ?? ""}
                  onChange={(e) => setUrlInput((p) => ({ ...p, [section.id]: e.target.value }))}
                  placeholder="Lien URL (rapport jury, annales…)"
                  className="flex-1 p-2.5 text-sm rounded-2xl border border-[#cae0d4] bg-[#f3f7f5] outline-none"
                />
                <button onClick={() => addUrl(section.id)} className="px-4 py-2 rounded-2xl bg-[#8da894] text-white text-xs font-semibold">Ajouter lien</button>
              </div>

              {section.documents.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {section.documents.map((doc) => (
                    <div key={doc.id} className="rounded-2xl border border-[#e3eee8] p-3 bg-[#f8faf8] relative group">
                      <button onClick={() => removeDoc(section.id, doc.id)} className="absolute top-2 right-2 text-red-400 text-xs opacity-0 group-hover:opacity-100">🗑</button>
                      {doc.type === "image" && (
                        <a href={doc.data} target="_blank" rel="noreferrer">
                          <img src={doc.data} alt={doc.name} className="w-full h-24 object-cover rounded-xl" />
                        </a>
                      )}
                      {doc.type === "pdf" && (
                        <a href={doc.data} download={doc.name} className="flex items-center gap-2 text-sm text-[#1b3224] hover:underline">
                          📄 {doc.name}
                        </a>
                      )}
                      {doc.type === "url" && (
                        <a href={doc.data} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                          🔗 {doc.name}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
