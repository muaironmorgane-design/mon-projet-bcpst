import { useState } from "react";

type MediaType = "Documentaire" | "Podcast" | "Article" | "Livre" | "Vidéo" | "Autre";
type Domaine = "Biologie" | "Écologie" | "Chimie" | "Physique" | "Médecine" | "Culture G" | "Autre";

interface Ressource {
  id: string; title: string; author: string; type: MediaType;
  domaine: Domaine; url: string; note: string; viewed: boolean;
}

const DEFAULTS: Omit<Ressource, "id" | "viewed">[] = [
  { title: "ARTE — Le Règne Animal (série docs)", author: "ARTE", type: "Documentaire", domaine: "Biologie", url: "https://www.arte.tv", note: "Excellent pour la biodiversité et les comportements animaux — utile en khôlle SVT" },
  { title: "Podcast 'La Méthode Scientifique'", author: "France Culture", type: "Podcast", domaine: "Culture G", url: "https://www.radiofrance.fr/franceculture", note: "Parfait en transport — actualité scientifique rigoureuse" },
  { title: "One Health — liens entre santé humaine, animale et environnementale", author: "OMS", type: "Article", domaine: "Médecine", url: "https://www.who.int/health-topics/one-health", note: "Concept clé pour les futurs vétérinaires, souvent cité dans les entretiens" },
  { title: "Chaîne YouTube 'ScienceEtonnante'", author: "David Louapre", type: "Vidéo", domaine: "Physique", url: "https://www.youtube.com/@ScienceEtonnante", note: "Vulgarisation scientifique de haute qualité — maths et physique" },
  { title: "Le Signal et le Bruit — Nate Silver", author: "Nate Silver", type: "Livre", domaine: "Culture G", url: "", note: "Culture G autour des statistiques et de la prédiction — utile en dissert" },
];

const TYPES: MediaType[] = ["Documentaire","Podcast","Article","Livre","Vidéo","Autre"];
const DOMAINES: Domaine[] = ["Biologie","Écologie","Chimie","Physique","Médecine","Culture G","Autre"];
const TYPE_ICONS: Record<MediaType, string> = { Documentaire: "🎬", Podcast: "🎙️", Article: "📰", Livre: "📚", Vidéo: "▶️", Autre: "🔗" };
const DOM_COLORS: Record<Domaine, string> = {
  Biologie: "bg-emerald-50 border-emerald-200 text-emerald-800",
  Écologie: "bg-green-50 border-green-200 text-green-800",
  Chimie: "bg-orange-50 border-orange-200 text-orange-800",
  Physique: "bg-purple-50 border-purple-200 text-purple-800",
  Médecine: "bg-rose-50 border-rose-200 text-rose-800",
  "Culture G": "bg-amber-50 border-amber-200 text-amber-800",
  Autre: "bg-slate-50 border-slate-200 text-slate-700",
};

function load(): Ressource[] {
  try {
    const stored = JSON.parse(localStorage.getItem("khube_cultureg_v1") || "[]") as Ressource[];
    if (stored.length) return stored;
  } catch {}
  return DEFAULTS.map((d, i) => ({ ...d, id: `cg_${i}`, viewed: false }));
}
function save(d: Ressource[]) { localStorage.setItem("khube_cultureg_v1", JSON.stringify(d)); }

export default function CultureG() {
  const [items, setItems] = useState<Ressource[]>(load);
  const [showForm, setShowForm] = useState(false);
  const [filterDom, setFilterDom] = useState<Domaine | "all">("all");

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [type, setType] = useState<MediaType>("Podcast");
  const [domaine, setDomaine] = useState<Domaine>("Biologie");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");

  function add() {
    if (!title.trim()) return;
    const r: Ressource = { id: `cg_${Date.now()}`, title: title.trim(), author: author.trim(), type, domaine, url: url.trim(), note: note.trim(), viewed: false };
    const updated = [r, ...items]; setItems(updated); save(updated);
    setTitle(""); setAuthor(""); setUrl(""); setNote(""); setShowForm(false);
  }

  function toggleViewed(id: string) {
    const updated = items.map(i => i.id === id ? { ...i, viewed: !i.viewed } : i);
    setItems(updated); save(updated);
  }

  function del(id: string) {
    const updated = items.filter(i => i.id !== id); setItems(updated); save(updated);
  }

  const filtered = items.filter(i => filterDom === "all" || i.domaine === filterDom);
  const viewedCount = items.filter(i => i.viewed).length;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1b3224] mb-1">🌍 Culture Générale & Veille Scientifique</h2>
            <p className="text-sm text-slate-500">Documentaires, podcasts, articles… ce qui te donnera l'edge en khôlle et à l'écrit.</p>
            <p className="text-xs text-slate-400 mt-1">{viewedCount}/{items.length} consulté{viewedCount > 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-[#8da894] text-white text-xs font-bold rounded-xl hover:bg-[#5c7d67] transition">
            + Ajouter une ressource
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-3xl border-2 border-[#8da894] shadow-md space-y-4">
          <h3 className="font-serif font-bold text-[#1b3224]">Nouvelle ressource</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre *"
                className="w-full text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none focus:ring-2 focus:ring-[#a3caa0]" />
            </div>
            <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Auteur / Source"
              className="text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" />
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Lien URL (optionnel)"
              className="text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none" />
            <select value={type} onChange={e => setType(e.target.value as MediaType)}
              className="text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={domaine} onChange={e => setDomaine(e.target.value as Domaine)}
              className="text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none">
              {DOMAINES.map(d => <option key={d}>{d}</option>)}
            </select>
            <div className="md:col-span-2">
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Note / Pourquoi c'est utile…"
                className="w-full text-sm p-3 rounded-xl border border-[#cae0d4] bg-[#f3f7f5] outline-none resize-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 text-slate-500 text-xs rounded-xl hover:bg-slate-50">Annuler</button>
            <button onClick={add} className="flex-1 py-2 bg-[#1b3224] text-white text-xs font-bold rounded-xl hover:bg-[#5c7d67] transition">Enregistrer</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterDom("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${filterDom === "all" ? "bg-[#1b3224] text-white border-[#1b3224]" : "border-[#cae0d4] text-slate-600 hover:border-[#8da894]"}`}>
          Tous ({items.length})
        </button>
        {DOMAINES.filter(d => items.some(i => i.domaine === d)).map(d => (
          <button key={d} onClick={() => setFilterDom(d === filterDom ? "all" : d)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${DOM_COLORS[d]} ${filterDom === d ? "ring-2 ring-offset-1 ring-[#8da894]" : ""}`}>
            {d} ({items.filter(i => i.domaine === d).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(item => (
          <div key={item.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition ${item.viewed ? "opacity-70" : ""}`}>
            <div className={`flex items-center gap-3 px-5 py-3 border-b ${DOM_COLORS[item.domaine]}`}>
              <span className="text-xl">{TYPE_ICONS[item.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#1b3224] truncate">{item.title}</p>
                {item.author && <p className="text-[10px] opacity-70">{item.author}</p>}
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${DOM_COLORS[item.domaine]}`}>{item.domaine}</span>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => toggleViewed(item.id)}
                  className={`text-[10px] px-2 py-1 rounded-lg border font-semibold transition ${item.viewed ? "border-slate-200 text-slate-400" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}>
                  {item.viewed ? "✓ Lu" : "Marquer lu"}
                </button>
                {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] px-2 py-1 rounded-lg border border-[#cae0d4] text-[#5c7d67] hover:bg-[#e3eee8]">🔗</a>}
                <button onClick={() => del(item.id)} className="text-[10px] text-red-400 hover:text-red-600 px-1">🗑</button>
              </div>
            </div>
            {item.note && <p className="px-5 py-3 text-xs text-slate-600 leading-relaxed">{item.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
