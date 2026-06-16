import { useEffect, useState } from "react";

const KHUBE_START = new Date(2026, 8, 1);
const CONCOURS_DATE = new Date(2027, 6, 1);

export function getGrowthProgress(): number {
  const now = Date.now();
  const start = KHUBE_START.getTime();
  const end = CONCOURS_DATE.getTime();
  if (now <= start) return 0;
  if (now >= end) return 1;
  return (now - start) / (end - start);
}

type FocusTreeProps = {
  size?: "sm" | "lg";
};

export default function FocusTree({ size = "lg" }: FocusTreeProps) {
  const scale = size === "lg" ? 1 : 0.55;
  const [progress, setProgress] = useState(getGrowthProgress);
  const [sessionBonus, setSessionBonus] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setProgress(getGrowthProgress()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setSessionBonus((b) => Math.min(0.05, b + 0.001));
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  const p = Math.min(1, progress + sessionBonus);
  const stage = p < 0.08 ? 0 : p < 0.22 ? 1 : p < 0.45 ? 2 : p < 0.72 ? 3 : 4;
  const stageLabels = ["🌰 Graine", "🌱 Pousse", "🌿 Tige", "🌳 Jeune arbre", "🌳 Arbre mature"];
  const pct = Math.round(p * 100);

  return (
    <div
      className="relative flex flex-col items-center justify-end select-none"
      style={{ width: 220 * scale, height: 280 * scale }}
    >
      <div
        className="absolute inset-0 rounded-3xl overflow-hidden transition-all duration-[2000ms]"
        style={{
          background: "linear-gradient(180deg, #87CEEB 0%, #b8e0c8 55%, #6b9b6e 100%)",
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-[18%] rounded-b-3xl bg-[#4a7c59]" />

      <svg viewBox="0 0 200 260" className="relative z-10 w-full h-full drop-shadow-lg">
        {/* Stage 0: Seed in soil */}
        {stage === 0 && (
          <g className="tree-grow">
            <ellipse cx="100" cy="218" rx="28" ry="8" fill="#3d5a3e" opacity="0.6" />
            <ellipse cx="100" cy="215" rx="10" ry="12" fill="#8B6914" />
            <ellipse cx="97" cy="212" rx="4" ry="3" fill="#a07818" opacity="0.5" />
          </g>
        )}

        {/* Stage 1: Sprout */}
        {stage === 1 && (
          <g className="tree-grow">
            <ellipse cx="100" cy="218" rx="30" ry="8" fill="#3d5a3e" opacity="0.5" />
            <path d="M100 215 Q98 200 100 185 Q102 200 100 215" fill="#52b788" />
            <ellipse cx="92" cy="188" rx="8" ry="5" fill="#74c69d" transform="rotate(-30 92 188)" />
            <ellipse cx="108" cy="188" rx="8" ry="5" fill="#74c69d" transform="rotate(30 108 188)" />
          </g>
        )}

        {/* Stage 2: Stem with small leaves */}
        {stage === 2 && (
          <g className="tree-grow">
            <rect x="96" y="175" width="8" height="45" rx="3" fill="#6b4423" />
            <ellipse cx="88" cy="178" rx="12" ry="7" fill="#40916c" transform="rotate(-25 88 178)" />
            <ellipse cx="112" cy="172" rx="12" ry="7" fill="#40916c" transform="rotate(25 112 172)" />
            <ellipse cx="85" cy="158" rx="10" ry="6" fill="#52b788" transform="rotate(-20 85 158)" />
            <ellipse cx="115" cy="155" rx="10" ry="6" fill="#52b788" transform="rotate(20 115 155)" />
            <ellipse cx="100" cy="148" rx="14" ry="8" fill="#74c69d" />
          </g>
        )}

        {/* Stage 3: Young tree */}
        {stage === 3 && (
          <g className="tree-grow">
            <rect x="92" y="160" width="16" height="60" rx="4" fill="#6b4423" />
            <ellipse cx="100" cy="115" rx="52" ry="48" fill="#2d6a4f" opacity="0.95" />
            <ellipse cx="75" cy="130" rx="32" ry="28" fill="#40916c" />
            <ellipse cx="125" cy="128" rx="34" ry="30" fill="#52b788" />
            <ellipse cx="100" cy="95" rx="36" ry="32" fill="#74c69d" />
            <ellipse cx="88" cy="90" rx="12" ry="9" fill="#95d5b2" opacity="0.6" />
          </g>
        )}

        {/* Stage 4: Full tree */}
        {stage === 4 && (
          <g className="tree-grow">
            <rect x="88" y="155" width="24" height="70" rx="4" fill="#6b4423" />
            <ellipse cx="100" cy="90" rx="72" ry="68" fill="#2d6a4f" opacity="0.95" />
            <ellipse cx="72" cy="110" rx="48" ry="44" fill="#40916c" />
            <ellipse cx="128" cy="108" rx="50" ry="46" fill="#52b788" />
            <ellipse cx="100" cy="72" rx="52" ry="48" fill="#74c69d" />
            <ellipse cx="85" cy="65" rx="18" ry="14" fill="#95d5b2" opacity="0.6" />
            <ellipse cx="118" cy="80" rx="14" ry="12" fill="#b7e4c7" opacity="0.5" />
            <circle cx="70" cy="95" r="4" fill="#fbbf24" />
            <circle cx="130" cy="88" r="4" fill="#fbbf24" />
            <circle cx="100" cy="60" r="4" fill="#fde68a" />
            <circle cx="88" cy="120" r="3" fill="#f472b6" />
            <circle cx="115" cy="115" r="3" fill="#f472b6" />
          </g>
        )}
      </svg>

      <div className="absolute top-3 left-3 right-3 z-20 text-center text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-600/90 text-white">
        {stageLabels[stage]}
      </div>

      <div className="absolute bottom-3 z-20 w-[85%]">
        <div className="h-1.5 rounded-full bg-white/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-300 transition-all duration-[2000ms]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[9px] text-white/90 font-medium text-center mt-1">{pct}% de croissance</p>
      </div>

      <style>{`
        .tree-grow {
          animation: treeGrowIn 1.2s ease-out forwards;
          transform-origin: 100px 220px;
        }
        @keyframes treeGrowIn {
          from { opacity: 0; transform: scale(0.6) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
