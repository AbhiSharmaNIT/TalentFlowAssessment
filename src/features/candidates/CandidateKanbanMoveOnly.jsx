// src/features/candidates/components/CandidateKanbanMoveOnly.jsx
import { useMemo, useState } from "react";
import CandidateCard from "../../components/CandidateCard";

const ACCENTS = {
  applied:  { dot: "bg-blue-400",    ring: "ring-blue-400/40",    header: "from-slate-800 to-slate-900" },
  screening:{ dot: "bg-indigo-400",  ring: "ring-indigo-400/40",  header: "from-slate-800 to-slate-900" },
  technical:{ dot: "bg-cyan-400",    ring: "ring-cyan-400/40",    header: "from-slate-800 to-slate-900" },
  offer:    { dot: "bg-purple-400",  ring: "ring-purple-400/40",  header: "from-slate-800 to-slate-900" },
  hired:    { dot: "bg-emerald-400", ring: "ring-emerald-400/40", header: "from-slate-800 to-slate-900" },
  rejected: { dot: "bg-rose-400",    ring: "ring-rose-400/40",    header: "from-slate-800 to-slate-900" },
};

export default function CandidateKanbanMoveOnly({ candidates = [], stages = [], onMove }) {
  const grouped = useMemo(() => {
    const g = Object.fromEntries(stages.map((s) => [s, []]));
    (candidates || []).forEach((c) => {
      const s = (c.stage || "").toLowerCase();
      if (g[s]) g[s].push(c);
      else (g[stages[0]] || []).push(c);
    });
    return g;
  }, [candidates, stages]);

  // minimal HTML5 DnD
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null); // column key

  return (
    <div className="overflow-x-auto">
      {/* Horizontal, responsive columns — scrollable on small screens */}
      <div className="inline-flex gap-4 min-w-full pb-1 w-[30px]">
        {stages.map((col) => {
          const accent = ACCENTS[col] || ACCENTS.applied;
          const isOver = dragOver === col;

          return (
            <div
              key={col}
              className={[
                "min-w-[300px] md:min-w-[340px] xl:min-w-[360px] 2xl:min-w-[380px]",
                "flex-1 rounded-2xl border border-gray-700 bg-gradient-to-b from-slate-900/60 to-slate-900/30",
                "backdrop-blur-sm",
                isOver ? `ring-2 ${accent.ring}` : "ring-0",
                "transition-shadow"
              ].join(" ")}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(col);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId != null) onMove?.(dragId, col);
                setDragOver(null);
                setDragId(null);
              }}
            >
              {/* Sticky header */}
              <div
                className={[
                  "sticky top-0 z-10",
                  "rounded-t-2xl px-4 py-3",
                  "bg-gradient-to-br",
                  accent.header,
                  "border-b border-gray-700/70",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${accent.dot}`} />
                    <h3 className="uppercase tracking-wider text-xs text-gray-200">{col}</h3>
                  </div>
                  <span className="text-xs text-gray-400">{grouped[col]?.length || 0}</span>
                </div>
              </div>

              {/* Drop area */}
              <div
                className={[
                  "p-3 md:p-4 space-y-3",
                  "min-h-[180px]",
                  isOver ? "outline outline-2 outline-dashed outline-gray-600/60 rounded-xl" : "",
                ].join(" ")}
              >
                {(grouped[col] || []).map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDragId(c.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <CandidateCard candidate={c} onMove={onMove} variant="kanban" />
                  </div>
                ))}

                {/* Empty placeholder to make columns readable when empty */}
                {(grouped[col] || []).length === 0 && (
                  <div className="text-center text-xs text-gray-500 py-6">
                    Drag candidates here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
