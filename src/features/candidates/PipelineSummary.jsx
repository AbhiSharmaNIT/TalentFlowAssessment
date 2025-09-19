// src/features/candidates/PipelineSummary.jsx
import { useEffect, useMemo, useRef, useState } from "react";

const STAGES = ["applied", "screening", "technical", "offer", "hired", "rejected"];

const ACCENT = {
  applied:   { dot: "#60a5fa",  barFrom: "#60a5fa",  barTo: "#3b82f6",  glow: "rgba(96,165,250,0.35)"  },
  screening: { dot: "#a78bfa",  barFrom: "#a78bfa",  barTo: "#7c3aed",  glow: "rgba(167,139,250,0.35)" },
  technical: { dot: "#22d3ee",  barFrom: "#22d3ee",  barTo: "#06b6d4",  glow: "rgba(34,211,238,0.35)"  },
  offer:     { dot: "#c084fc",  barFrom: "#c084fc",  barTo: "#8b5cf6",  glow: "rgba(192,132,252,0.35)" },
  hired:     { dot: "#34d399",  barFrom: "#34d399",  barTo: "#10b981",  glow: "rgba(52,211,153,0.35)"  },
  rejected:  { dot: "#fb7185",  barFrom: "#fb7185",  barTo: "#ef4444",  glow: "rgba(251,113,133,0.35)" },
};

function useAnimatedNumber(value, duration = 600) {
  const [display, setDisplay] = useState(value || 0);
  const startRef = useRef(0);
  const fromRef = useRef(value || 0);
  const toRef = useRef(value || 0);
  const rafRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();
    fromRef.current = display;
    toRef.current = value || 0;

    function tick(now) {
      const p = Math.min(1, (now - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(Math.round(fromRef.current + (toRef.current - fromRef.current) * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return display;
}

/**
 * Props:
 *  - counts: { applied, screening, technical, offer, hired, rejected }
 *  - activeStage: string ("All Stages" or one of the above, case-insensitive)
 *  - onPick(stageLabel: string) -> void  (send "All Stages" to clear)
 */
export default function PipelineSummary({ counts = {}, activeStage = "All Stages", onPick }) {
  const totals = useMemo(() => {
    const t = STAGES.reduce((sum, k) => sum + (counts[k] || 0), 0);
    return { total: t, by: STAGES.map((k) => [k, counts[k] || 0]) };
  }, [counts]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 ">
      {totals.by.map(([stage, raw]) => {
        const n = useAnimatedNumber(raw, 500);
        const pct = totals.total ? Math.max(2, Math.round((raw / totals.total) * 100)) : 0; // min 2%
        const active = (activeStage || "").toLowerCase() === stage;
        const a = ACCENT[stage];

        // Mouse-follow glow (no re-render)
        const onMouseMove = (e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          e.currentTarget.style.setProperty("--mx", `${x}px`);
          e.currentTarget.style.setProperty("--my", `${y}px`);
        };

        return (
          <button
            key={stage}
            type="button"
            onMouseMove={onMouseMove}
            onClick={() =>
              onPick?.(active ? "All Stages" : stage.charAt(0).toUpperCase() + stage.slice(1))
            }
            title={`${stage.toUpperCase()} — ${raw} (${totals.total ? Math.round((raw / totals.total) * 100) : 0}%)`}
            className={[
              "group relative overflow-hidden rounded-2xl px-4 py-3 text-left",
              "border border-gray-700/70 bg-[#141414] text-gray-100",
              "shadow-md hover:shadow-2xl transition-all duration-200",
              "hover:-translate-y-0.5 hover:brightness-[1.07]",
              active ? "ring-2 ring-yellow-400/60" : "hover:ring-[1.5px] hover:ring-white/10",
              "focus:outline-none focus:ring-2 focus:ring-yellow-400/60",
            ].join(" ")}
          >
            {/* cursor-follow glow */}
            <div
              className="pointer-events-none absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 "
              style={{
                background: `radial-gradient(180px circle at var(--mx, 50%) var(--my, 50%), ${a.glow}, transparent 55%)`,
                filter: "blur(6px)",
              }}
            />

            {/* soft top sheen */}
            <div className="pointer-events-none absolute inset-x-0 -top-16 h-24 bg-white/5 blur-2xl group-hover:opacity-100 opacity-70 " />

            {/* content */}
            <div className="relative z-10 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: a.dot }}
                  />
                  <div className="uppercase tracking-wider text-[11px] opacity-85">
                    {stage}
                  </div>
                </div>
              </div>

              <div className="text-2xl font-semibold mt-1 tabular-nums">{n}</div>

              {/* gradient progress bar */}
              <div className="mt-3 h-1.5 w-full rounded-full bg-black/20 overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${a.barFrom}, ${a.barTo})`,
                  }}
                />
              </div>
            </div>

            {/* subtle inner border to add solidity */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />
          </button>
        );
      })}
    </div>
  );
}
