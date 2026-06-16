import { useState, useEffect, useRef, useCallback } from "react";
import Banderole from "@/components/Banderole";
import QuickNotes from "@/components/QuickNotes";
import InstallBanner from "@/components/InstallBanner";
import MonHistoire from "@/pages/MonHistoire";
import GuideAhr from "@/pages/GuideAhr";
import Planning from "@/pages/Planning";
import SujetsEntrainement from "@/pages/SujetsEntrainement";
import DocumentsPDF from "@/pages/DocumentsPDF";
import ConseilsMetho from "@/pages/ConseilsMetho";
import MesNotes from "@/pages/MesNotes";
import CourbeOubli from "@/pages/CourbeOubli";
import MonJournal from "@/pages/MonJournal";
import MoodTracker from "@/pages/MoodTracker";
import CoinVictoires from "@/pages/CoinVictoires";
import CahierErreurs from "@/pages/CahierErreurs";
import StatsConcours from "@/pages/StatsConcours";
import CoefficientsConcours from "@/pages/CoefficientsConcours";
import DashboardProgression from "@/pages/DashboardProgression";
import Pomodoro from "@/pages/Pomodoro";
import Flashcards from "@/pages/Flashcards";
import ChecklistVeille from "@/pages/ChecklistVeille";
import CultureG from "@/pages/CultureG";
import FAQPerso from "@/pages/FAQPerso";
import BudgetAlimentation from "@/pages/BudgetAlimentation";
import MealPlannerDragDrop from "@/pages/MealPlannerDragDrop";
import AttentesEpreuves from "@/pages/AttentesEpreuves";
import ConseilsProfs from "@/pages/ConseilsProfs";
import TP from "@/pages/TP";
import Revisions from "@/pages/Revisions";
import ZoneDeconnexion from "@/pages/ZoneDeconnexion";
import PythonExercices from "@/pages/PythonExercices";
import NotesComparaison from "@/pages/NotesComparaison";
import Kholles from "@/pages/Kholles";
import Geographie from "@/pages/Geographie";

type Tab =
  | "histoire" | "journal"
  | "planning" | "tp" | "python" | "sujets" | "annales" | "attentes-epreuves" | "conseils" | "conseils-profs"
  | "notes" | "notes-compare" | "kholles" | "oubli" | "revisions" | "cahier-erreurs" | "flashcards"
  | "stats-concours" | "coefficients" | "dashboard-progression" | "checklist-veille"
  | "mood-tracker" | "coin-victoires" | "pomodoro" | "zone-deco" | "budget" | "meal-planner"
  | "guide" | "culture-g" | "geographie" | "faq-perso";

interface TabDef { id: Tab; label: string; icon: string; }

interface Group {
  id: string; label: string; icon: string; tabs: TabDef[];
}

const GROUPS: Group[] = [
  {
    id: "parcours", label: "Mon Parcours", icon: "📖",
    tabs: [
      { id: "histoire",  label: "Mon Histoire", icon: "📖" },
      { id: "journal",   label: "Mon Journal",  icon: "📓" },
    ],
  },
  {
    id: "planning", label: "Planning", icon: "📅",
    tabs: [
      { id: "planning", label: "Emploi du temps", icon: "🕐" },
    ],
  },
  {
    id: "travail", label: "Travail", icon: "💼",
    tabs: [
      { id: "tp",                label: "TP / Travaux",       icon: "🧪" },
      { id: "python",            label: "Python",             icon: "🐍" },
      { id: "sujets",            label: "Sujets",             icon: "🔬" },
      { id: "annales",           label: "Documents PDF",      icon: "📂" },
      { id: "attentes-epreuves", label: "Attentes épreuves",  icon: "📌" },
      { id: "conseils",          label: "Conseils Métho",     icon: "💡" },
      { id: "conseils-profs",    label: "Conseils profs",     icon: "🧑‍🏫" },
    ],
  },
  {
    id: "revisions", label: "Révisions", icon: "📚",
    tabs: [
      { id: "notes",          label: "Mes Notes",              icon: "📊" },
      { id: "notes-compare",  label: "Notes année précédente", icon: "📈" },
      { id: "kholles",        label: "Khôlles",                icon: "📋" },
      { id: "geographie",     label: "Géographie",             icon: "🗺️" },
      { id: "oubli",          label: "Courbe de l'Oubli",      icon: "🧠" },
      { id: "revisions",      label: "Révisions",             icon: "✅" },
      { id: "cahier-erreurs", label: "Cahier d'Erreurs",       icon: "📕" },
      { id: "flashcards",     label: "Flashcards",             icon: "🗂️" },
    ],
  },
  {
    id: "concours", label: "Concours ENV", icon: "🎯",
    tabs: [
      { id: "stats-concours",        label: "Stats Concours",     icon: "📊" },
      { id: "coefficients",          label: "Coefficients",       icon: "⚖️" },
      { id: "dashboard-progression", label: "Ma Progression",     icon: "📈" },
      { id: "checklist-veille",      label: "Checklist Veille",   icon: "☑️" },
    ],
  },
  {
    id: "bienetre", label: "Bien-être", icon: "🌿",
    tabs: [
      { id: "mood-tracker",   label: "Mood Tracker",       icon: "😊" },
      { id: "coin-victoires", label: "Coin des Victoires", icon: "🏆" },
      { id: "pomodoro",       label: "Pomodoro",           icon: "⏱️" },
      { id: "zone-deco",      label: "Zone Déconnexion",   icon: "🧘" },
      { id: "meal-planner",   label: "Planif. Repas",      icon: "🍽️" },
      { id: "budget",         label: "Budget",             icon: "💰" },
    ],
  },
  {
    id: "ressources", label: "Ressources", icon: "💡",
    tabs: [
      { id: "guide",     label: "Guide E. Ahr",    icon: "🎓" },
      { id: "culture-g", label: "Culture G",        icon: "🌍" },
      { id: "faq-perso", label: "FAQ Personnelle",  icon: "❓" },
    ],
  },
];

function findGroup(tab: Tab) {
  return GROUPS.find(g => g.tabs.some(t => t.id === tab));
}

const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 90];

function countDueLessons(): number {
  try {
    const raw = localStorage.getItem("khube_oubli_v1");
    if (!raw) return 0;
    const lessons: { learnedDate: string; reviews: string[] }[] = JSON.parse(raw);
    const today = new Date().toISOString().split("T")[0];
    return lessons.filter(lesson => {
      const reviewCount = lesson.reviews.length;
      if (reviewCount >= REVIEW_INTERVALS.length) return false;
      const daysFromLearn = REVIEW_INTERVALS[reviewCount];
      const nextDate = new Date(lesson.learnedDate);
      nextDate.setDate(nextDate.getDate() + daysFromLearn);
      const nextStr = nextDate.toISOString().split("T")[0];
      return nextStr <= today;
    }).length;
  } catch { return 0; }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("histoire");
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string>(GROUPS[0]?.id ?? "");
  const [dark, setDark] = useState(() => localStorage.getItem("khube_dark") === "1");
  const [dueCount, setDueCount] = useState(() => countDueLessons());
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("khube_dark", dark ? "1" : "0");
  }, [dark]);

  const refreshDue = useCallback(() => setDueCount(countDueLessons()), []);
  useEffect(() => {
    refreshDue();
    const id = setInterval(refreshDue, 60_000);
    return () => clearInterval(id);
  }, [activeTab, refreshDue]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectTab(tab: Tab) {
    setActiveTab(tab);
    setMenuOpen(false);
  }

  function toggleGroup(groupId: string) {
    setExpandedGroup((prev) => (prev === groupId ? "" : groupId));
  }

  const activeGroup = findGroup(activeTab);
  const activeTabDef = GROUPS.flatMap(g => g.tabs).find(t => t.id === activeTab);

  return (
    <div className={`${dark ? "dark" : ""} ${dark ? "text-[#dde8e2]" : "text-slate-800"} flex flex-col min-h-screen`}>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <Banderole />
      <QuickNotes />
      <InstallBanner />

      <header className="glass-card sticky top-0 z-50 border-b border-[#dceee3]/60" style={{boxShadow:"0 1px 0 rgba(255,255,255,0.8) inset, 0 2px 12px rgba(27,50,36,0.07)"}}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#a3caa0]/60 shadow-sm bg-white shrink-0" style={{boxShadow:"0 0 0 3px rgba(163,202,160,0.15)"}}>
              <img
                src="https://skyagent-artifacts.skywork.ai/router/agent/2026-06-13/prod_agent_80212b8c-1d72-4328-bf5b-9afbf7ae405c/logo-journal-bcpst_a93674912b9947019708ae450e2377df.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-serif text-[15px] font-bold text-[#1b3224] leading-tight tracking-tight">
                Le Journal d'une Khûbe
              </h1>
              <p className="text-[10px] font-medium text-[#5c7d67] uppercase tracking-[0.1em] flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c49b80] animate-pulse inline-block" />
                Objectif ENV · Véto 2027
              </p>
            </div>
          </div>

          <div ref={navRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1b3224] text-white text-[13px] font-semibold shadow-md hover:bg-[#22312b] transition"
            >
              ☰ Menu rapide
              <span className={`text-[11px] opacity-80 transition-transform ${menuOpen ? "rotate-180" : ""}`}>▾</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-[280px] max-h-[calc(100vh-120px)] bg-white rounded-3xl border border-[#dceee3] shadow-2xl z-50 overflow-y-auto touch-pan-y overscroll-contain">
                {GROUPS.map((group) => {
                  const groupOpen = expandedGroup === group.id;
                  return (
                    <div key={group.id} className="border-b border-[#eff4ef] last:border-b-0">
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-[#f3f7f5] text-sm font-semibold text-[#1b3224] hover:bg-[#e7eee8] transition rounded-t-3xl"
                      >
                        <span className="flex items-center gap-2">
                          <span>{group.icon}</span>
                          <span>{group.label}</span>
                        </span>
                        <span className={`text-xs transition-transform ${groupOpen ? "rotate-180" : ""}`}>▾</span>
                      </button>
                      <div className={`${groupOpen ? "block" : "hidden"} space-y-1 px-2 py-2`}>
                        {group.tabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => selectTab(tab.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left rounded-2xl transition ${
                              activeTab === tab.id
                                ? "bg-[#e8f4ec] text-[#1b3224] font-semibold"
                                : "text-slate-600 hover:bg-[#f5faf7] hover:text-[#1b3224]"
                            }`}
                          >
                            <span className="w-5 text-center">{tab.icon}</span>
                            <span className="truncate">{tab.label}</span>
                            {tab.id === "oubli" && dueCount > 0 && (
                              <span className="ml-auto min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                                {dueCount > 9 ? "9+" : dueCount}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-[#cae0d4]/80 bg-white/90 px-3 py-2 text-[11px] text-slate-600 shadow-sm">
            <span>📱 Installe l'appli sur ton téléphone (PWA)</span>
          </div>
          <button
            onClick={() => setDark(!dark)}
            title={dark ? "Mode clair" : "Mode sombre"}
            className="shrink-0 w-9 h-9 rounded-full border border-[#cae0d4]/60 bg-white/80 hover:bg-[#e8f4ec] flex items-center justify-center text-base transition-all duration-200"
            style={{boxShadow:"0 1px 4px rgba(27,50,36,0.08)"}}
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>

        {activeTabDef && (
          <div className="max-w-7xl mx-auto px-4 md:px-6 pb-2 flex items-center gap-1.5 text-[10px]">
            <span className="text-slate-400">{activeGroup?.icon} {activeGroup?.label}</span>
            <span className="text-slate-300">›</span>
            <span className="text-[#5c7d67] font-semibold">{activeTabDef.icon} {activeTabDef.label}</span>
          </div>
        )}
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-8">
        {activeTab === "histoire"               && <MonHistoire />}
        {activeTab === "journal"                && <MonJournal />}
        {activeTab === "planning"               && <Planning />}
        {activeTab === "notes"                  && <MesNotes />}
        {activeTab === "notes-compare"          && <NotesComparaison />}
        {activeTab === "kholles"                && <Kholles />}
        {activeTab === "geographie"             && <Geographie />}
        {activeTab === "oubli"                  && <CourbeOubli />}
        {activeTab === "cahier-erreurs"         && <CahierErreurs />}
        {activeTab === "flashcards"             && <Flashcards />}
        {activeTab === "stats-concours"         && <StatsConcours />}
        {activeTab === "coefficients"           && <CoefficientsConcours />}
        {activeTab === "dashboard-progression"  && <DashboardProgression />}
        {activeTab === "checklist-veille"       && <ChecklistVeille />}
        {activeTab === "mood-tracker"           && <MoodTracker />}
        {activeTab === "coin-victoires"         && <CoinVictoires />}
        {activeTab === "pomodoro"               && <Pomodoro />}
        {activeTab === "zone-deco"              && <ZoneDeconnexion />}
        {activeTab === "meal-planner"           && <MealPlannerDragDrop />}
        {activeTab === "guide"                  && <GuideAhr />}
        {activeTab === "sujets"                 && <SujetsEntrainement />}
        {activeTab === "annales"                && <DocumentsPDF />}
        {activeTab === "attentes-epreuves"      && <AttentesEpreuves />}
        {activeTab === "conseils"               && <ConseilsMetho />}
        {activeTab === "conseils-profs"         && <ConseilsProfs />}
        {activeTab === "budget"                 && <BudgetAlimentation />}
        {activeTab === "culture-g"              && <CultureG />}
        {activeTab === "faq-perso"              && <FAQPerso />}
        {activeTab === "tp"                     && <TP />}
        {activeTab === "python"                 && <PythonExercices />}
        {activeTab === "revisions"              && <Revisions />}
      </main>

      <footer className="bg-[#1b3224] text-[#cae0d4] py-8 px-6 mt-12 border-t border-[#0e1c14]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#5c7d67] shrink-0">
              <img
                src="https://skyagent-artifacts.skywork.ai/router/agent/2026-06-13/prod_agent_80212b8c-1d72-4328-bf5b-9afbf7ae405c/logo-journal-bcpst_a93674912b9947019708ae450e2377df.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-serif">Le Journal d'une Khûbe — Cap sur Véto 2027</p>
          </div>
          <p className="text-xs text-[#a3caa0] font-light">
            © 2026–2027 · Journal collaboratif · Inspiré par Emmanuel Ahr (Lycée H. Poincaré / G. de la Tour)
          </p>
        </div>
      </footer>
    </div>
  );
}
