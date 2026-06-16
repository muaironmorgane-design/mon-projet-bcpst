import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

type LineItem = { id: string; label: string; amount: number };
type VariableItem = LineItem & { category: "besoins" | "loisirs" };
type SavingsGoal = { id: string; label: string; target: number; current: number };

type MonthBudget = {
  revenus: LineItem[];
  depensesFixes: LineItem[];
  depensesVariables: VariableItem[];
  objectifsEpargne: SavingsGoal[];
};

type BudgetStore = Record<string, MonthBudget>;

const STORAGE = "khube_budget_v2";

function emptyMonth(): MonthBudget {
  return { revenus: [], depensesFixes: [], depensesVariables: [], objectifsEpargne: [] };
}

function load(): BudgetStore {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const legacy = localStorage.getItem("khube_budget_monthly_v1");
  if (legacy) {
    try {
      const old = JSON.parse(legacy) as Record<string, { revenus: number; depenses: number }>;
      const store: BudgetStore = {};
      MONTHS.forEach((m) => {
        const row = old[m];
        if (row) {
          store[m] = {
            revenus: row.revenus ? [{ id: "r1", label: "Revenus principaux", amount: row.revenus }] : [],
            depensesFixes: [{ id: "f1", label: "Charges fixes", amount: row.depenses * 0.6 }],
            depensesVariables: [{ id: "v1", label: "Courses & besoins", amount: row.depenses * 0.3, category: "besoins" }],
            objectifsEpargne: [{ id: "e1", label: "Épargne mensuelle", target: row.revenus - row.depenses, current: row.revenus - row.depenses }],
          };
        }
      });
      return store;
    } catch { /* ignore */ }
  }
  return {};
}

const PIE_COLORS = { besoins: "#8da894", loisirs: "#c49b80", epargne: "#5c7d67" };

export default function BudgetAlimentation() {
  const [budget, setBudget] = useState<BudgetStore>(load);
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(2026);

  const data = budget[month] ?? emptyMonth();

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(budget));
  }, [budget]);

  function updateMonth(updater: (m: MonthBudget) => MonthBudget) {
    setBudget((prev) => ({ ...prev, [month]: updater(prev[month] ?? emptyMonth()) }));
  }

  function addRevenu() {
    updateMonth((m) => ({ ...m, revenus: [...m.revenus, { id: `r_${Date.now()}`, label: "Nouveau revenu", amount: 0 }] }));
  }
  function addFixe() {
    updateMonth((m) => ({ ...m, depensesFixes: [...m.depensesFixes, { id: `f_${Date.now()}`, label: "Nouvelle charge", amount: 0 }] }));
  }
  function addVariable() {
    updateMonth((m) => ({ ...m, depensesVariables: [...m.depensesVariables, { id: `v_${Date.now()}`, label: "Nouvelle dépense", amount: 0, category: "besoins" }] }));
  }
  function addEpargne() {
    updateMonth((m) => ({ ...m, objectifsEpargne: [...m.objectifsEpargne, { id: `e_${Date.now()}`, label: "Nouvel objectif", target: 0, current: 0 }] }));
  }

  function updateItem<K extends keyof MonthBudget>(
    list: K,
    id: string,
    field: string,
    value: string | number
  ) {
    updateMonth((m) => ({
      ...m,
      [list]: (m[list] as { id: string }[]).map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }

  function removeItem<K extends keyof MonthBudget>(list: K, id: string) {
    updateMonth((m) => ({
      ...m,
      [list]: (m[list] as { id: string }[]).filter((item) => item.id !== id),
    }));
  }

  const totals = useMemo(() => {
    const revenus = data.revenus.reduce((s, r) => s + r.amount, 0);
    const fixes = data.depensesFixes.reduce((s, r) => s + r.amount, 0);
    const variables = data.depensesVariables.reduce((s, r) => s + r.amount, 0);
    const depenses = fixes + variables;
    const epargne = data.objectifsEpargne.reduce((s, r) => s + r.current, 0);
    const reste = revenus - depenses - epargne;
    return { revenus, depenses, fixes, variables, epargne, reste };
  }, [data]);

  const pieData = useMemo(() => {
    const besoins = data.depensesFixes.reduce((s, r) => s + r.amount, 0)
      + data.depensesVariables.filter((v) => v.category === "besoins").reduce((s, r) => s + r.amount, 0);
    const loisirs = data.depensesVariables.filter((v) => v.category === "loisirs").reduce((s, r) => s + r.amount, 0);
    const epargne = data.objectifsEpargne.reduce((s, r) => s + r.current, 0);
    return [
      { name: "Besoins", value: besoins, color: PIE_COLORS.besoins },
      { name: "Loisirs", value: loisirs, color: PIE_COLORS.loisirs },
      { name: "Épargne", value: epargne, color: PIE_COLORS.epargne },
    ].filter((d) => d.value > 0);
  }, [data]);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#1b3224]">💰 Budget mensuel</h2>
        <p className="text-sm text-slate-500">Revenus, charges fixes, dépenses variables, objectifs d'épargne et répartition.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="p-3 text-sm rounded-2xl border border-[#cae0d4] bg-white outline-none font-semibold">
          {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <div className="flex gap-1">
          <button onClick={() => setYear((y) => y - 1)} className="px-3 py-2 rounded-xl bg-[#f3f7f5] text-sm">◀</button>
          <span className="px-3 py-2 font-semibold text-[#1b3224]">{year}</span>
          <button onClick={() => setYear((y) => y + 1)} className="px-3 py-2 rounded-xl bg-[#f3f7f5] text-sm">▶</button>
        </div>
      </div>

      {/* Récapitulatif mensuel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-[#e3eee8] bg-[#e8f4ec] p-5 text-center">
          <div className="text-xs uppercase text-slate-500 mb-1">Revenus totaux</div>
          <div className="text-2xl font-serif font-bold text-emerald-800">{totals.revenus.toFixed(0)}€</div>
        </div>
        <div className="rounded-3xl border border-[#e3eee8] bg-[#fff7ed] p-5 text-center">
          <div className="text-xs uppercase text-slate-500 mb-1">Dépenses totales</div>
          <div className="text-2xl font-serif font-bold text-amber-800">{totals.depenses.toFixed(0)}€</div>
        </div>
        <div className="rounded-3xl border border-[#e3eee8] bg-[#f0f5f9] p-5 text-center">
          <div className="text-xs uppercase text-slate-500 mb-1">Épargne</div>
          <div className="text-2xl font-serif font-bold text-[#5c7d67]">{totals.epargne.toFixed(0)}€</div>
        </div>
        <div className={`rounded-3xl border p-5 text-center ${totals.reste >= 0 ? "bg-[#f3f7f5] border-[#a3caa0]" : "bg-[#fee2e2] border-[#fca5a5]"}`}>
          <div className="text-xs uppercase text-slate-500 mb-1">Reste à vivre</div>
          <div className="text-2xl font-serif font-bold text-[#1b3224]">{totals.reste.toFixed(0)}€</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Camembert */}
        {pieData.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm">
            <h3 className="font-serif font-bold text-[#1b3224] mb-4">Répartition des dépenses</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v.toFixed(0)}€`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Objectifs épargne */}
        <div className="bg-white p-6 rounded-3xl border border-[#e3eee8] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#1b3224]">🎯 Objectifs d'épargne</h3>
            <button onClick={addEpargne} className="text-xs px-3 py-1 rounded-xl bg-[#e8f4ec] font-semibold">+ Ajouter</button>
          </div>
          {data.objectifsEpargne.map((g) => (
            <div key={g.id} className="rounded-2xl border border-[#e3eee8] p-3 space-y-2">
              <div className="flex gap-2">
                <input value={g.label} onChange={(e) => updateItem("objectifsEpargne", g.id, "label", e.target.value)} className="flex-1 p-2 text-sm rounded-xl border border-[#cae0d4] outline-none" />
                <button onClick={() => removeItem("objectifsEpargne", g.id)} className="text-red-400 text-xs">🗑</button>
              </div>
              <div className="flex gap-2 text-xs">
                <label className="flex-1">Objectif<input type="number" value={g.target} onChange={(e) => updateItem("objectifsEpargne", g.id, "target", parseFloat(e.target.value) || 0)} className="w-full mt-1 p-2 rounded-xl border border-[#cae0d4] outline-none" /></label>
                <label className="flex-1">Mis de côté<input type="number" value={g.current} onChange={(e) => updateItem("objectifsEpargne", g.id, "current", parseFloat(e.target.value) || 0)} className="w-full mt-1 p-2 rounded-xl border border-[#cae0d4] outline-none" /></label>
              </div>
              {g.target > 0 && (
                <div className="h-2 rounded-full bg-[#e8f4ec] overflow-hidden">
                  <div className="h-full rounded-full bg-[#8da894]" style={{ width: `${Math.min(100, (g.current / g.target) * 100)}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <BudgetSection title="💵 Revenus" items={data.revenus} onAdd={addRevenu} onUpdate={(id, f, v) => updateItem("revenus", id, f, v)} onRemove={(id) => removeItem("revenus", id)} color="emerald" />
      <BudgetSection title="🏠 Dépenses fixes (charges)" items={data.depensesFixes} onAdd={addFixe} onUpdate={(id, f, v) => updateItem("depensesFixes", id, f, v)} onRemove={(id) => removeItem("depensesFixes", id)} color="amber" />
      <BudgetSection
        title="🛒 Dépenses variables"
        items={data.depensesVariables}
        onAdd={addVariable}
        onUpdate={(id, f, v) => updateItem("depensesVariables", id, f, v)}
        onRemove={(id) => removeItem("depensesVariables", id)}
        color="slate"
        showCategory
      />
    </div>
  );
}

function BudgetSection({
  title,
  items,
  onAdd,
  onUpdate,
  onRemove,
  color,
  showCategory,
}: {
  title: string;
  items: (LineItem | VariableItem)[];
  onAdd: () => void;
  onUpdate: (id: string, field: string, value: string | number) => void;
  onRemove: (id: string) => void;
  color: string;
  showCategory?: boolean;
}) {
  const total = items.reduce((s, i) => s + i.amount, 0);
  return (
    <div className="bg-white rounded-3xl border border-[#e3eee8] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#e3eee8] flex items-center justify-between">
        <h3 className="font-semibold text-[#1b3224]">{title}</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#1b3224]">{total.toFixed(2)}€</span>
          <button onClick={onAdd} className="text-xs px-3 py-1.5 rounded-xl bg-[#e8f4ec] font-semibold hover:bg-[#d1e5d5]">+ Ajouter</button>
        </div>
      </div>
      <div className="divide-y divide-[#f3f7f5]">
        {items.length === 0 && <p className="p-4 text-sm text-slate-400">Aucune entrée.</p>}
        {items.map((item) => (
          <div key={item.id} className="p-4 flex flex-wrap items-center gap-3">
            <input
              value={item.label}
              onChange={(e) => onUpdate(item.id, "label", e.target.value)}
              className="flex-1 min-w-[160px] p-2 text-sm rounded-xl border border-[#cae0d4] outline-none"
            />
            <input
              type="number"
              step={0.01}
              value={item.amount}
              onChange={(e) => onUpdate(item.id, "amount", parseFloat(e.target.value) || 0)}
              className={`w-28 p-2 text-sm rounded-xl border border-[#cae0d4] font-semibold outline-none text-${color}-800`}
            />
            {showCategory && "category" in item && (
              <select
                value={item.category}
                onChange={(e) => onUpdate(item.id, "category", e.target.value)}
                className="p-2 text-sm rounded-xl border border-[#cae0d4] outline-none"
              >
                <option value="besoins">Besoins</option>
                <option value="loisirs">Loisirs</option>
              </select>
            )}
            <button onClick={() => onRemove(item.id)} className="text-red-400 text-sm">🗑</button>
          </div>
        ))}
      </div>
    </div>
  );
}
