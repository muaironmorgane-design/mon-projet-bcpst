import { useState, useEffect } from "react";

type Meal = { id: string; name: string; color: string; recipe: string; prepTime: number; price: number };
type DayMeals = { day: string; meals: Meal[] };

const MEAL_COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#6366f1", "#ec4899", "#14b8a6", "#f97316"];
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const DEFAULT_MEALS: Meal[] = [
  { id: "m1", name: "🥚 Omelette pommes de terre", color: MEAL_COLORS[0], recipe: "Éplucher et couper les pommes de terre, cuire à la poêle avec oignons, verser œufs battus, plier en deux.", prepTime: 20, price: 2.50 },
  { id: "m2", name: "🍝 Pâtes sauce tomate", color: MEAL_COLORS[1], recipe: "Cuire pâtes al dente. Sauce: tomates concassées, ail, basilic, oignon, huile d'olive. Mélanger.", prepTime: 25, price: 3.00 },
  { id: "m3", name: "🍚 Riz cantonais", color: MEAL_COLORS[2], recipe: "Riz cuit, œufs brouillés, petits pois, maïs, riz froid, sauce soja, oignons verts.", prepTime: 20, price: 3.50 },
  { id: "m4", name: "🍝 Gratin pâtes jambon", color: MEAL_COLORS[3], recipe: "Pâtes cuites, jambon émincé, béchamel, gruyère râpé. Cuire 25 min au four à 180°C.", prepTime: 35, price: 4.50 },
  { id: "m5", name: "🥪 Croque-monsieur", color: MEAL_COLORS[4], recipe: "Jambon et fromage entre deux tranches de pain. Cuire à la poêle jusqu'à doré. Servir avec salade verte.", prepTime: 15, price: 3.00 },
  { id: "m6", name: "🌶️ Chili sin carne", color: MEAL_COLORS[5], recipe: "Haricots rouges, tomates, oignons, ail, épices, cacao. Mijoter 30 min. Servir sur riz.", prepTime: 40, price: 4.00 },
  { id: "m7", name: "🥧 Quiche lorraine", color: MEAL_COLORS[6], recipe: "Pâte brisée, lard cuit, œufs, crème, lait. Verser sur pâte, cuire 30 min à 180°C.", prepTime: 45, price: 5.00 },
  { id: "m8", name: "🍛 Curry lentilles coco", color: MEAL_COLORS[0], recipe: "Lentilles corail cuites, oignon, ail, curry, lait de coco, tomates. Mijoter 25 min.", prepTime: 30, price: 4.50 },
  { id: "m9", name: "🍠 Pommes terre saucisses", color: MEAL_COLORS[1], recipe: "Pommes de terre en dés poêlées, saucisses cuites, oignons. Cuire ensemble 25 min.", prepTime: 25, price: 4.00 },
  { id: "m10", name: "🍝 Spaghetti aglio e olio", color: MEAL_COLORS[2], recipe: "Spaghetti, ail tranché, piment, huile d'olive généreuse. Faire infuser ail et piment dans l'huile.", prepTime: 15, price: 2.50 },
  { id: "m11", name: "🥔 Galettes pommes de terre", color: MEAL_COLORS[3], recipe: "Pommes de terre râpées, oignon, œuf. Former galettes, cuire à la poêle jusqu'à croustillant.", prepTime: 25, price: 3.00 },
  { id: "m12", name: "🍚 Riz légumes sautés", color: MEAL_COLORS[4], recipe: "Riz cuit, légumes variés (carotte, poivron, brocoli), ail, sauce soja. Sauter à la poêle.", prepTime: 20, price: 3.50 },
  { id: "m13", name: "🥚 Tortilla espagnole", color: MEAL_COLORS[5], recipe: "Pommes de terre, oignons, œufs, sel. Cuire les pommes de terre, verser œufs battus, cuire des deux côtés.", prepTime: 30, price: 3.50 },
  { id: "m14", name: "🍲 Soupe légumes maison", color: MEAL_COLORS[6], recipe: "Légumes variés (carottes, poireaux, courge, haricots), bouillon. Cuire 30 min, mixer partiellement.", prepTime: 35, price: 3.00 },
  { id: "m15", name: "🌾 Couscous végétarien", color: MEAL_COLORS[0], recipe: "Couscous gonflé au bouillon, pois chiches, légumes (carotte, courge), raisins secs, épices.", prepTime: 25, price: 4.00 },
  { id: "m16", name: "🍝 Pâtes carbonara", color: MEAL_COLORS[1], recipe: "Pâtes, lard cuit croquant, œufs, parmesan. Mélanger pâtes chaudes, lard, puis œuf + fromage rapidement.", prepTime: 20, price: 3.50 },
  { id: "m17", name: "🍲 Hachis Parmentier", color: MEAL_COLORS[2], recipe: "Viande hachée braisée avec oignons, purée de pommes de terre par-dessus. Cuire au four 25 min à 180°C.", prepTime: 40, price: 5.00 },
  { id: "m18", name: "🌯 Wraps poulet crudités", color: MEAL_COLORS[3], recipe: "Wraps, poulet cuit émincé, laitue, tomate, concombre, sauce (mayo/yaourt).", prepTime: 15, price: 4.50 },
  { id: "m19", name: "🥚 Purée + œufs au plat", color: MEAL_COLORS[4], recipe: "Pommes de terre cuites, écrasées avec beurre/lait. Œufs à la poêle à côté. Simple et réconfortant.", prepTime: 25, price: 3.50 },
  { id: "m20", name: "🥔 Gnocchis légumes", color: MEAL_COLORS[5], recipe: "Gnocchis poêlés avec légumes (champignons, épinards, tomates). Ajouter crème/pesto selon goût.", prepTime: 20, price: 4.00 },
  { id: "m21", name: "🥧 Tarte poireaux fromage", color: MEAL_COLORS[6], recipe: "Pâte brisée, poireaux cuits tendres, crème, fromage râpé. Cuire 30 min à 180°C.", prepTime: 40, price: 5.50 },
  { id: "m22", name: "🍚 Riz thon petits pois", color: MEAL_COLORS[0], recipe: "Riz cuit, thon en conserve égoutté, petits pois surgelés, huile, citron, persil.", prepTime: 15, price: 3.50 },
  { id: "m23", name: "🍜 Nouilles sautées légumes", color: MEAL_COLORS[1], recipe: "Nouilles cuites, ail, légumes (carotte, poivron), sauce soja, huile de sésame. Sauter rapidement.", prepTime: 20, price: 3.50 },
  { id: "m24", name: "🥔 Gratin dauphinois salade", color: MEAL_COLORS[2], recipe: "Pommes de terre épluchées tranchées fines, crème, ail, gruyère. Cuire 45 min à 180°C. Salade à côté.", prepTime: 50, price: 5.00 },
  { id: "m25", name: "🫘 Falafels sauce yaourt", color: MEAL_COLORS[3], recipe: "Pois chiches mixés, épices (cumin, coriandre), oignons, persil. Former boulettes, frire. Sauce yaourt concombre.", prepTime: 30, price: 4.50 },
  { id: "m26", name: "🍕 Pizza maison simple", color: MEAL_COLORS[4], recipe: "Pâte (farine, eau, levure), sauce tomate, fromage, garniture simple. Cuire 15 min à 220°C.", prepTime: 35, price: 5.00 },
  { id: "m27", name: "🍝 Boulettes viande tomate", color: MEAL_COLORS[5], recipe: "Viande hachée, pain rassis, œuf, persil. Former boulettes, cuire à la sauce tomate 25 min. Servir sur pâtes.", prepTime: 35, price: 4.50 },
  { id: "m28", name: "🥔 Pommes farcies fromage", color: MEAL_COLORS[6], recipe: "Pommes de terre cuites coupées en deux, chair évidée mélangée avec fromage/lard. Remplir, cuire 15 min au four.", prepTime: 35, price: 4.00 },
  { id: "m29", name: "🍚 Risotto champignons", color: MEAL_COLORS[0], recipe: "Riz arborio, champignons sautés, bouillon chaud versé progressivement, vin blanc, parmesan, beurre. Remuer 18 min.", prepTime: 30, price: 5.50 },
  { id: "m30", name: "🥗 Salade composée", color: MEAL_COLORS[1], recipe: "Pommes de terre cuites, œufs durs, thon en conserve, laitue, tomate, anchois optionnel. Vinaigrette.", prepTime: 20, price: 4.00 },
  { id: "m31", name: "🥞 Crêpes jambon-fromage", color: MEAL_COLORS[2], recipe: "Pâte à crêpes (farine, œufs, lait), cuire dans poêle. Garnir jambon et fromage, replier, servir chaud.", prepTime: 25, price: 3.50 },
];

function loadMeals(): Meal[] {
  try {
    const raw = localStorage.getItem("khube_meals_v1");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_MEALS;
}

function saveMeals(meals: Meal[]) {
  localStorage.setItem("khube_meals_v1", JSON.stringify(meals));
}

function loadWeekMeals(): DayMeals[] {
  try {
    const raw = localStorage.getItem("khube_week_meals_v1");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DAYS.map((day) => ({ day, meals: [] }));
}

function saveWeekMeals(weekMeals: DayMeals[]) {
  localStorage.setItem("khube_week_meals_v1", JSON.stringify(weekMeals));
}

export default function MealPlannerDragDrop() {
  const [meals, setMeals] = useState<Meal[]>(loadMeals);
  const [weekMeals, setWeekMeals] = useState<DayMeals[]>(loadWeekMeals);
  const [newMealName, setNewMealName] = useState("");
  const [draggedMeal, setDraggedMeal] = useState<Meal | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  useEffect(() => saveMeals(meals), [meals]);
  useEffect(() => saveWeekMeals(weekMeals), [weekMeals]);

  function addMeal() {
    if (!newMealName.trim()) return;
    const id = `m_${Date.now()}`;
    const newMeal: Meal = { 
      id, 
      name: newMealName.trim(), 
      color: MEAL_COLORS[Math.floor(Math.random() * MEAL_COLORS.length)],
      recipe: "Ajouter une recette...",
      prepTime: 30,
      price: 4.00
    };
    setMeals((prev) => [...prev, newMeal]);
    setNewMealName("");
  }

  function removeMeal(id: string) {
    setMeals((prev) => prev.filter((m) => m.id !== id));
    // Remove from all days too
    setWeekMeals((prev) =>
      prev.map((d) => ({ ...d, meals: d.meals.filter((m) => m.id !== id) }))
    );
  }

  function addMealToDay(dayIdx: number, meal: Meal) {
    setWeekMeals((prev) => {
      const updated = [...prev];
      if (!updated[dayIdx].meals.some((m) => m.id === meal.id)) {
        updated[dayIdx].meals = [...updated[dayIdx].meals, meal];
      }
      return updated;
    });
  }

  function removeMealFromDay(dayIdx: number, mealId: string) {
    setWeekMeals((prev) => {
      const updated = [...prev];
      updated[dayIdx].meals = updated[dayIdx].meals.filter((m) => m.id !== mealId);
      return updated;
    });
  }

  function handleDragStart(meal: Meal, e: React.DragEvent) {
    setDraggedMeal(meal);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", meal.id);
  }

  function handleDropOnDay(dayIdx: number, e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDay(null);
    if (draggedMeal) {
      addMealToDay(dayIdx, draggedMeal);
      setDraggedMeal(null);
    }
  }

  function handleDragOver(dayIdx: number, e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverDay(dayIdx);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOverDay(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224]">Planificateur de Repas — Tableau Noir</h2>
        <p className="text-sm text-slate-500 mt-1">Créez des plats (étiquettes), puis glissez-les sur les jours de la semaine.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left: Meal list (draggable) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-[#e3eee8] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#e3eee8] bg-[#f3f7f5]">
              <h3 className="font-semibold text-[#1b3224]">🍽️ Mes plats</h3>
              <p className="text-[11px] text-slate-500 mt-1">Glisse-dépose sur un jour</p>
            </div>

            <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(meal, e)}
                  onClick={() => setSelectedMeal(meal)}
                  className="group p-3 rounded-2xl text-white font-semibold text-sm cursor-grab active:cursor-grabbing transition-transform hover:scale-105 select-none"
                  style={{ backgroundColor: meal.color, opacity: 0.9 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{meal.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMeal(meal.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 ml-2 text-xs bg-black/30 px-2 py-1 rounded-lg transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-[#e3eee8]">
                <div className="flex gap-2">
                  <input
                    value={newMealName}
                    onChange={(e) => setNewMealName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addMeal()}
                    placeholder="Nouveau plat…"
                    className="flex-1 p-2 rounded-lg border border-[#cae0d4] text-xs outline-none focus:ring-2 focus:ring-[#8da894]"
                  />
                  <button
                    onClick={addMeal}
                    className="px-3 py-2 bg-[#8da894] text-white rounded-lg text-xs font-semibold hover:bg-[#5c7d67] transition"
                  >
                    ➕
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Weekly board (dark) */}
        <div className="lg:col-span-3">
          <div className="bg-[#1a1a1a] rounded-3xl border border-[#333] shadow-2xl p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-white">📅 Semaine</h3>

            <div className="grid grid-cols-7 gap-3">
              {weekMeals.map((dayData, dayIdx) => (
                <div
                  key={dayIdx}
                  onDragOver={(e) => handleDragOver(dayIdx, e)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDropOnDay(dayIdx, e)}
                  className={`rounded-2xl border p-3 min-h-[320px] transition-all ${
                    dragOverDay === dayIdx
                      ? "bg-[#2a2a2a] border-[#8da894] shadow-lg shadow-[#8da894]/20"
                      : "bg-[#2a2a2a] border-[#404040] hover:border-[#404040]/50"
                  }`}
                >
                  {/* Day header */}
                  <div className="mb-3 pb-3 border-b border-[#404040]">
                    <h4 className="font-bold text-white text-sm">{dayData.day}</h4>
                    <p className="text-[10px] text-[#a3caa0] mt-1">{dayData.meals.length} plat{dayData.meals.length !== 1 ? "s" : ""}</p>
                  </div>

                  {/* Meals in day */}
                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {dayData.meals.map((meal) => (
                      <div
                        key={meal.id}
                        onClick={() => setSelectedMeal(meal)}
                        className="group p-2 rounded-xl text-white text-[11px] font-medium cursor-pointer select-none flex items-center justify-between hover:opacity-100 transition"
                        style={{ backgroundColor: meal.color, opacity: 0.85 }}
                      >
                        <span className="truncate flex-1">{meal.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMealFromDay(dayIdx, meal.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 ml-1 text-xs bg-black/40 px-1.5 py-0.5 rounded transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {dayData.meals.length === 0 && (
                    <div className="h-[250px] flex items-center justify-center text-[#666] text-[10px] text-center">
                      Glisse un plat ici
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Weekly overview */}
            <div className="pt-4 border-t border-[#404040] text-[11px] text-[#a3caa0]">
              <p className="text-center">
                Total semaine : <strong className="text-white">{weekMeals.reduce((sum, d) => sum + d.meals.length, 0)} repas</strong> — 
                Plats disponibles : <strong className="text-white">{meals.length}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reset button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            if (confirm("Réinitialiser toute la semaine ?")) {
              setWeekMeals(DAYS.map((day) => ({ day, meals: [] })));
            }
          }}
          className="px-4 py-2 text-xs border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition"
        >
          🔄 Réinitialiser la semaine
        </button>
      </div>

      {/* Detail modal */}
      {selectedMeal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] backdrop-blur-sm"
          onClick={() => setSelectedMeal(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 w-[90%] max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-serif text-2xl font-bold text-[#1b3224]">{selectedMeal.name}</h3>
              </div>
              <button
                onClick={() => setSelectedMeal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Temps de préparation */}
              <div className="rounded-2xl bg-[#f3f7f5] border border-[#e3eee8] p-4">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-[0.1em]">⏱️ Temps de préparation</p>
                <p className="text-xl font-bold text-[#1b3224] mt-2">{selectedMeal.prepTime} minutes</p>
              </div>

              {/* Prix */}
              <div className="rounded-2xl bg-[#f3f7f5] border border-[#e3eee8] p-4">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-[0.1em]">💰 Prix estimé</p>
                <p className="text-xl font-bold text-[#1b3224] mt-2">{selectedMeal.price.toFixed(2)} €</p>
              </div>

              {/* Recette */}
              <div className="rounded-2xl bg-[#f3f7f5] border border-[#e3eee8] p-4">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-[0.1em]">👨‍🍳 Recette</p>
                <p className="text-sm text-[#1b3224] mt-2 leading-relaxed">{selectedMeal.recipe}</p>
              </div>

              {/* Couleur */}
              <div className="flex items-center gap-3 rounded-2xl bg-[#f3f7f5] border border-[#e3eee8] p-4">
                <div
                  className="w-12 h-12 rounded-xl shrink-0"
                  style={{ backgroundColor: selectedMeal.color }}
                />
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-[0.1em]">Couleur</p>
                  <p className="text-sm text-[#1b3224] font-mono">{selectedMeal.color}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedMeal(null)}
                className="flex-1 py-2.5 bg-[#8da894] text-white text-xs font-semibold rounded-xl hover:bg-[#5c7d67] transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
