import { useEffect, useMemo, useState } from "react";

type MapZone = "metropole" | "reunion" | "mayotte" | "martinique" | "guadeloupe" | "guyane";

type GeoPlace = {
  id: string;
  name: string;
  region: string;
  x: number;
  y: number;
  zone: MapZone;
  description: string;
  specialties: string[];
  photos: string[];
  maps: string[];
};

const STORAGE = "khube_geographie_v1";

const REGIONS = [
  "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Bretagne", "Centre-Val de Loire",
  "Corse", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandie",
  "Nouvelle-Aquitaine", "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur",
  "Guadeloupe", "Martinique", "Guyane", "La Réunion", "Mayotte",
];

const DROM: { id: MapZone; label: string; color: string }[] = [
  { id: "reunion", label: "La Réunion", color: "#40916c" },
  { id: "mayotte", label: "Mayotte", color: "#52b788" },
  { id: "martinique", label: "Martinique", color: "#74c69d" },
  { id: "guadeloupe", label: "Guadeloupe", color: "#95d5b2" },
  { id: "guyane", label: "Guyane", color: "#b7e4c7" },
];

function load(): GeoPlace[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [
    {
      id: "p1",
      name: "Roquefort-sur-Soulzon",
      region: "Occitanie",
      x: 52,
      y: 58,
      zone: "metropole",
      description: "Village des causses où est fabriqué le Roquefort AOP depuis des siècles.",
      specialties: ["Roquefort AOP", "Agneau des Causses"],
      photos: [],
      maps: [],
    },
    {
      id: "p2",
      name: "Saint-Pierre (La Réunion)",
      region: "La Réunion",
      x: 50,
      y: 50,
      zone: "reunion",
      description: "Chef-lieu de La Réunion, entouré par le volcan Piton de la Fournaise.",
      specialties: ["Vanille bourbon", "Rhums arrangés", "Carri réunionnais"],
      photos: [],
      maps: [],
    },
  ];
}

function FranceMetropoleSVG() {
  return (
    <path
      d="M95 15 L115 12 L130 18 L138 28 L142 40 L145 55 L148 70 L150 85 L148 100 L140 115 L130 125 L120 132 L105 138 L90 140 L75 135 L62 125 L52 110 L45 95 L42 78 L45 60 L52 45 L62 32 L75 22 L85 18 Z"
      fill="#d1e5d5"
      stroke="#5c7d67"
      strokeWidth="2"
    />
  );
}

export default function Geographie() {
  const [places, setPlaces] = useState<GeoPlace[]>(load);
  const [selected, setSelected] = useState<GeoPlace | null>(null);
  const [activeZone, setActiveZone] = useState<MapZone>("metropole");
  const [filterRegion, setFilterRegion] = useState("all");
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    region: REGIONS[0],
    description: "",
    specialty: "",
    specialties: [] as string[],
  });

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(places));
  }, [places]);

  const zonePlaces = useMemo(() => {
    let list = places.filter((p) => p.zone === activeZone);
    if (filterRegion !== "all") list = list.filter((p) => p.region === filterRegion);
    return list;
  }, [places, activeZone, filterRegion]);

  function handleMapClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!placing) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const name = form.name.trim() || "Nouveau lieu";
    const newPlace: GeoPlace = {
      id: `geo_${Date.now()}`,
      name,
      region: form.region,
      x,
      y,
      zone: activeZone,
      description: form.description,
      specialties: form.specialties,
      photos: [],
      maps: [],
    };
    setPlaces((prev) => [...prev, newPlace]);
    setSelected(newPlace);
    setPlacing(false);
    setForm((f) => ({ ...f, name: "", description: "", specialties: [] }));
  }

  function addSpecialty() {
    const s = form.specialty.trim();
    if (!s) return;
    if (selected) {
      setPlaces((prev) =>
        prev.map((p) =>
          p.id === selected.id ? { ...p, specialties: [...p.specialties, s] } : p
        )
      );
      setSelected((prev) => prev ? { ...prev, specialties: [...prev.specialties, s] } : prev);
    } else {
      setForm((f) => ({ ...f, specialties: [...f.specialties, s], specialty: "" }));
    }
  }

  function handlePhoto(placeId: string, e: React.ChangeEvent<HTMLInputElement>, field: "photos" | "maps") {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result as string;
      setPlaces((prev) =>
        prev.map((p) => (p.id === placeId ? { ...p, [field]: [...p[field], data] } : p))
      );
      setSelected((s) => (s?.id === placeId ? { ...s, [field]: [...s[field], data] } : s));
    };
    reader.readAsDataURL(file);
  }

  function updateSelected(field: keyof GeoPlace, value: string) {
    if (!selected) return;
    setPlaces((prev) => prev.map((p) => (p.id === selected.id ? { ...p, [field]: value } : p)));
    setSelected((s) => (s ? { ...s, [field]: value } : s));
  }

  function removePlace(id: string) {
    if (!confirm("Supprimer ce lieu ?")) return;
    setPlaces((prev) => prev.filter((p) => p.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224]">🗺️ Géographie — Carte de France</h2>
        <p className="text-sm text-slate-500">Explore les régions, AOP/AOC, villes et spécialités. Clique sur un marqueur pour voir les détails.</p>
      </div>

      <div className="grid xl:grid-cols-[1.2fr_1fr] gap-6">
        {/* Carte */}
        <div className="bg-white p-5 rounded-3xl border border-[#e3eee8] shadow-sm space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveZone("metropole")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${activeZone === "metropole" ? "bg-[#1b3224] text-white" : "bg-[#f3f7f5]"}`}
            >
              🇫🇷 France métropolitaine
            </button>
            {DROM.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveZone(d.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${activeZone === d.id ? "bg-[#1b3224] text-white" : "bg-[#f3f7f5]"}`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {activeZone === "metropole" ? (
            <div className="relative">
              <svg
                viewBox="0 0 200 160"
                className={`w-full rounded-2xl border border-[#cae0d4] bg-[#e8f4ec] ${placing ? "cursor-crosshair" : "cursor-default"}`}
                onClick={handleMapClick}
              >
                <FranceMetropoleSVG />
                {zonePlaces.map((p) => (
                  <g key={p.id} onClick={(e) => { e.stopPropagation(); setSelected(p); }} className="cursor-pointer">
                    <circle cx={p.x * 2} cy={p.y * 1.6} r="6" fill="#c49b80" stroke="#1b3224" strokeWidth="1.5" className="hover:fill-[#9d7053]" />
                    <circle cx={p.x * 2} cy={p.y * 1.6} r="10" fill="none" stroke="#c49b80" strokeWidth="1" opacity="0.4" className="animate-ping" style={{ animationDuration: "2s" }} />
                  </g>
                ))}
              </svg>

              {/* Insets DROM */}
              <div className="grid grid-cols-5 gap-2 mt-3">
                {DROM.map((d) => {
                  const count = places.filter((p) => p.zone === d.id).length;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setActiveZone(d.id)}
                      className="rounded-xl p-2 text-[10px] font-semibold text-center border border-[#cae0d4] hover:bg-[#e8f4ec]"
                      style={{ background: d.color + "33" }}
                    >
                      {d.label.split(" ").pop()}
                      <div className="text-[9px] text-slate-500">{count} lieu(x)</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <svg
              viewBox="0 0 100 80"
              className={`w-full max-w-md mx-auto rounded-2xl border border-[#cae0d4] bg-[#e8f4ec] ${placing ? "cursor-crosshair" : "cursor-default"}`}
              onClick={handleMapClick}
            >
              <rect x="5" y="5" width="90" height="70" rx="8" fill="#d1e5d5" stroke="#5c7d67" strokeWidth="2" />
              <text x="50" y="42" textAnchor="middle" fontSize="8" fill="#1b3224" fontWeight="bold">
                {DROM.find((d) => d.id === activeZone)?.label}
              </text>
              {zonePlaces.map((p) => (
                <g key={p.id} onClick={(e) => { e.stopPropagation(); setSelected(p); }} className="cursor-pointer">
                  <circle cx={p.x} cy={p.y * 0.8} r="5" fill="#c49b80" stroke="#1b3224" strokeWidth="1.5" />
                </g>
              ))}
            </svg>
          )}

          {placing && (
            <p className="text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-2 rounded-xl">
              📍 Clique sur la carte pour placer « {form.name || "le nouveau lieu"} »
            </p>
          )}
        </div>

        {/* Panneau détail / ajout */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-[#e3eee8] shadow-sm space-y-3">
            <h3 className="font-semibold text-[#1b3224]">{selected ? `📍 ${selected.name}` : "➕ Ajouter un lieu"}</h3>

            {selected ? (
              <div className="space-y-3">
                <input value={selected.name} onChange={(e) => updateSelected("name", e.target.value)} className="w-full p-2.5 text-sm rounded-xl border border-[#cae0d4] outline-none font-semibold" />
                <select value={selected.region} onChange={(e) => updateSelected("region", e.target.value)} className="w-full p-2.5 text-sm rounded-xl border border-[#cae0d4] outline-none">
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <textarea value={selected.description} onChange={(e) => updateSelected("description", e.target.value)} rows={4} placeholder="Description du lieu…" className="w-full p-2.5 text-sm rounded-xl border border-[#cae0d4] outline-none resize-none" />

                <div>
                  <h4 className="text-sm font-semibold text-[#1b3224] mb-2">🏷 AOP / AOC / Spécialités</h4>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selected.specialties.map((s, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-[#e8f4ec] text-[#5c7d67] font-semibold">{s}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} placeholder="Ajouter AOP/AOC…" className="flex-1 p-2 text-sm rounded-xl border border-[#cae0d4] outline-none" onKeyDown={(e) => e.key === "Enter" && addSpecialty()} />
                    <button onClick={addSpecialty} className="px-3 py-2 rounded-xl bg-[#8da894] text-white text-xs font-semibold">+</button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-[#f3f7f5] border text-xs font-semibold">
                    📷 Photo
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(selected.id, e, "photos")} />
                  </label>
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-[#f3f7f5] border text-xs font-semibold">
                    🗺 Carte
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(selected.id, e, "maps")} />
                  </label>
                  <button onClick={() => removePlace(selected.id)} className="px-3 py-2 rounded-xl text-xs text-red-500 border border-red-200">Supprimer</button>
                </div>

                {selected.photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selected.photos.map((ph, i) => (
                      <img key={i} src={ph} alt="" className="w-full h-24 object-cover rounded-xl border" />
                    ))}
                  </div>
                )}
                {selected.maps.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selected.maps.map((m, i) => (
                      <img key={i} src={m} alt="Carte" className="w-full h-24 object-cover rounded-xl border" />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nom du lieu / ville" className="w-full p-2.5 text-sm rounded-xl border border-[#cae0d4] outline-none" />
                <select value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} className="w-full p-2.5 text-sm rounded-xl border border-[#cae0d4] outline-none">
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} placeholder="Description…" className="w-full p-2.5 text-sm rounded-xl border border-[#cae0d4] outline-none resize-none" />
                <div className="flex flex-wrap gap-1.5">
                  {form.specialties.map((s, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-[#e8f4ec] text-[#5c7d67] font-semibold">{s}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} placeholder="AOP/AOC / spécialité" className="flex-1 p-2 text-sm rounded-xl border border-[#cae0d4] outline-none" />
                  <button onClick={addSpecialty} className="px-3 py-2 rounded-xl bg-[#e8f4ec] text-xs font-semibold">+</button>
                </div>
                <button
                  onClick={() => setPlacing(true)}
                  className="w-full py-3 rounded-2xl bg-[#8da894] text-white text-sm font-semibold hover:bg-[#5c7d67]"
                >
                  📍 Placer sur la carte
                </button>
              </div>
            )}
          </div>

          {/* Liste des lieux */}
          <div className="bg-white p-5 rounded-3xl border border-[#e3eee8] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1b3224]">Lieux ({places.length})</h3>
              <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="text-xs p-1.5 rounded-lg border border-[#cae0d4] outline-none">
                <option value="all">Toutes régions</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {places.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelected(p); setActiveZone(p.zone); }}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition ${selected?.id === p.id ? "border-[#8da894] bg-[#e8f4ec]" : "border-[#e3eee8] hover:bg-[#f8faf8]"}`}
                >
                  <div className="font-semibold text-[#1b3224]">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.region} · {p.specialties.length} spécialité(s)</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
