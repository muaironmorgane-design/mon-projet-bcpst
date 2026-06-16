import { useState } from "react";

interface PDF {
  title: string;
  category: string;
  chapter: string;
  url: string;
}

const DEFAULT_PDFS: PDF[] = [
  { title: "Guide : Tout ce que j'aurais voulu savoir avant d'entrer en BCPST (Emmanuel Ahr)", category: "Méthodologie", chapter: "Introduction", url: "https://cahier-de-prepa.fr/bcpst1-delatour/download?id=459" },
  { title: "Annales : Sujet de Biologie Cellulaire — Mitochondrie & Métabolisme", category: "Biologie", chapter: "Cellule & Métabolisme", url: "https://cahier-de-prepa.fr/bcpst1-delatour/download?id=459" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Biologie: "bg-emerald-100 text-emerald-900",
  Géologie: "bg-amber-100 text-amber-900",
  Chimie: "bg-indigo-100 text-indigo-900",
  Maths: "bg-red-100 text-red-900",
  Physique: "bg-blue-100 text-blue-900",
  Méthodologie: "bg-[#e3eee8] text-[#1b3224]",
  Français: "bg-purple-100 text-purple-900",
  Anglais: "bg-sky-100 text-sky-900",
};

const CATEGORIES = ["Biologie", "Géologie", "Chimie", "Maths", "Physique", "Méthodologie", "Français", "Anglais"];

function loadPdfs(): PDF[] {
  if (typeof window === "undefined") return [...DEFAULT_PDFS];
  try {
    const raw = localStorage.getItem("khube_pdfs_2026");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...DEFAULT_PDFS];
}

export default function DocumentsPDF() {
  const [pdfs, setPdfs] = useState<PDF[]>(loadPdfs);
  const [form, setForm] = useState({ title: "", category: "Biologie", chapter: "", url: "" });
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"category" | "chapter" | "title">("category");

  function savePdfs(updated: PDF[]) {
    setPdfs(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("khube_pdfs_2026", JSON.stringify(updated));
    }
  }

  function add() {
    if (!form.title.trim() || !form.url.trim() || !form.chapter.trim()) {
      alert("Veuillez saisir un titre, un chapitre et un lien.");
      return;
    }
    if (!form.url.startsWith("http")) {
      alert("Le lien doit commencer par http:// ou https://");
      return;
    }
    const updated = [...pdfs, { ...form, title: form.title.trim(), chapter: form.chapter.trim() }];
    savePdfs(updated);
    setForm({ title: "", category: "Biologie", chapter: "", url: "" });
  }

  function remove(i: number) {
    if (!confirm("Supprimer ce document ?")) return;
    const updated = pdfs.filter((_, idx) => idx !== i);
    savePdfs(updated);
  }

  function exportPdfs() {
    const json = JSON.stringify(pdfs, null, 2);
    setImportJson(json);
    setImportError(null);
    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(json).catch(() => {
        /* ignore clipboard errors */
      });
    }
    alert("JSON des documents copié dans le presse-papiers. Vous pouvez le coller sur votre téléphone.");
  }

  function importPdfs() {
    try {
      const parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed)) throw new Error("Le JSON doit être un tableau de documents.");
      const cleaned: PDF[] = parsed.map((item) => {
        if (!item || typeof item !== "object") throw new Error("Format invalide dans le tableau.");
        const title = String((item as any).title || "").trim();
        const url = String((item as any).url || "").trim();
        const category = String((item as any).category || "Biologie").trim();
        const chapter = String((item as any).chapter || "Général").trim();
        if (!title || !url || !chapter) throw new Error("Chaque document doit avoir un titre, un chapitre et une URL.");
        return { title, category: category || "Biologie", chapter, url };
      });
      savePdfs(cleaned);
      setImportError(null);
      alert("Importation réussie ! Vos documents PDF sont maintenant sur le téléphone.");
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "JSON invalide.");
    }
  }

  const filteredPdfs = pdfs
    .filter((p) => filterCategory === "all" || p.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "chapter") return a.chapter.localeCompare(b.chapter) || a.title.localeCompare(b.title);
      return a.category.localeCompare(b.category) || a.chapter.localeCompare(b.chapter) || a.title.localeCompare(b.title);
    });

  const grouped = filteredPdfs.reduce((acc, pdf) => {
    if (!acc[pdf.category]) acc[pdf.category] = {};
    if (!acc[pdf.category][pdf.chapter]) acc[pdf.category][pdf.chapter] = [];
    acc[pdf.category][pdf.chapter].push(pdf);
    return acc;
  }, {} as Record<string, Record<string, PDF[]>>);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1b3224]">Bibliothèque de Documents PDF</h2>
          <p className="text-sm text-slate-500">Classés par matière et chapitre — filtre et trie comme tu veux.</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 rounded-xl text-xs font-semibold border border-[#cae0d4] bg-white">
              <option value="all">Toutes matières</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "category" | "chapter" | "title")} className="px-3 py-2 rounded-xl text-xs font-semibold border border-[#cae0d4] bg-white">
              <option value="category">Trier par matière</option>
              <option value="chapter">Trier par chapitre</option>
              <option value="title">Trier par titre</option>
            </select>
            <span className="text-xs text-slate-400 self-center">{filteredPdfs.length} document{filteredPdfs.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="text-center p-8 bg-white border border-dashed border-slate-200 rounded-3xl">
            <p className="text-sm text-slate-500">Aucun document. Utilisez le formulaire !</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, chapters]) => (
              <div key={category} className="bg-white rounded-3xl border border-[#e3eee8] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#eef3ee] bg-[#f3f7f5]">
                  <h3 className="font-serif text-lg font-semibold text-[#1b3224]">{category}</h3>
                </div>
                <div className="space-y-4 p-6">
                  {Object.entries(chapters).map(([chapter, items]) => (
                    <div key={chapter} className="rounded-3xl border border-[#e3eee8] bg-[#f9faf8] p-4">
                      <h4 className="text-sm font-semibold text-[#1b3224] mb-3">Chapitre : {chapter}</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {items.map((pdf, index) => (
                          <div key={`${pdf.url}-${index}`} className="rounded-3xl border border-[#e3e7e4] bg-white p-4 shadow-sm flex flex-col justify-between gap-3">
                            <div>
                              <span className={`${CATEGORY_COLORS[pdf.category] || "bg-[#e3eee8] text-[#1b3224]"} text-[10px] font-bold px-2.5 py-1 rounded-md uppercase inline-block`}>{pdf.category}</span>
                              <h3 className="font-serif text-base font-bold text-slate-900 mt-2">{pdf.title}</h3>
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#eef3ee]">
                              <a href={pdf.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#1b3224] hover:text-[#5c7d67] transition">📄 Ouvrir</a>
                              <button onClick={() => remove(pdfs.indexOf(pdf))} className="text-xs text-red-400 hover:text-red-600">🗑</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full lg:w-80">
        <div className="bg-white p-6 rounded-2xl border border-[#e3eee8] shadow-sm space-y-4 sticky top-24">
          <h3 className="font-serif font-bold text-[#1b3224]">➕ Ajouter un document</h3>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Titre *</label>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] focus:ring-2 focus:ring-[#a3caa0] outline-none" placeholder="Ex: Annales Biologie 2023…" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Chapitre *</label>
            <input type="text" value={form.chapter} onChange={(e) => setForm((f) => ({ ...f, chapter: e.target.value }))} className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] focus:ring-2 focus:ring-[#a3caa0] outline-none" placeholder="Ex: Cycle cellulaire" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Lien URL *</label>
            <input type="url" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] focus:ring-2 focus:ring-[#a3caa0] outline-none" placeholder="https://…" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Catégorie</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={add} className="w-full py-2.5 bg-[#8da894] text-white text-xs font-semibold rounded-xl hover:bg-[#5c7d67] transition shadow-sm">Ajouter à la bibliothèque</button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#e3eee8] shadow-sm space-y-4 mt-6">
          <h3 className="font-serif font-bold text-[#1b3224]">📥 Export / Import de vos PDF</h3>
          <p className="text-xs text-slate-500">Copiez vos liens PDF depuis Replit et collez-les ici pour transférer vers le téléphone.</p>
          <button onClick={exportPdfs} className="w-full py-2.5 bg-[#6d9b75] text-white text-xs font-semibold rounded-xl hover:bg-[#5c7d67] transition shadow-sm">Exporter les documents (copier JSON)</button>
          <label className="text-xs font-semibold text-slate-600 block">JSON à importer</label>
          <textarea value={importJson} onChange={(e) => setImportJson(e.target.value)} rows={8} className="w-full text-xs p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] focus:ring-2 focus:ring-[#a3caa0] outline-none" placeholder="Collez le JSON exporté depuis l’ancienne app ici"></textarea>
          {importError && <p className="text-xs text-red-500">Erreur : {importError}</p>}
          <button onClick={importPdfs} className="w-full py-2.5 bg-[#8da894] text-white text-xs font-semibold rounded-xl hover:bg-[#5c7d67] transition shadow-sm">Importer depuis JSON</button>
        </div>
      </div>
    </div>
  );
}
