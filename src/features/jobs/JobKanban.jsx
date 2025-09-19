// src/features/jobs/JobKanban.jsx
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { ArrowRightLeft } from "lucide-react";
import { useMemo, useState } from "react";

/**
 * Props:
 *  - jobs: Job[]
 *  - onMove(id, nextStatus): Promise<void> (called when moved column)
 *  - onReorder?(fromOrder, toOrder): Promise<void> (optional reorder API)
 */
export default function JobKanban({ jobs = [], onMove, onReorder }) {
  // local state to render instant changes (optimistic)
  const [list, setList] = useState(jobs);
  const [activeJob, setActiveJob] = useState(null);

  // keep local list synced if parent changes
  // (simple sync; for large lists you might diff)
  if (jobs !== list) {
    // shallow compare lengths to avoid re-setting on each render
    if (jobs.length !== list.length) setList(jobs);
  }

  const active = useMemo(() => list.filter((j) => j.status === "active").sort((a,b)=> (a.order??0)-(b.order??0)), [list]);
  const archived = useMemo(() => list.filter((j) => j.status === "archived").sort((a,b)=> (a.order??0)-(b.order??0)), [list]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const columns = ["active", "archived"]; // droppable ids

  function handleDragStart(evt) {
    const { active } = evt;
    const job = list.find((j) => j.id === active.id);
    setActiveJob(job || null);
  }

  async function handleDragEnd(evt) {
    const { active, over } = evt;
    setActiveJob(null);
    if (!over) return;

    const draggedId = active.id;
    const overId = over.id; // can be column id ("active"/"archived") or another job id

    const fromIdx = list.findIndex((j) => j.id === draggedId);
    if (fromIdx < 0) return;

    const dragged = list[fromIdx];

    // Determine target column
    let targetStatus = dragged.status;
    if (columns.includes(String(overId))) {
      targetStatus = String(overId); // dropped on empty column area
    } else {
      const overJob = list.find((j) => j.id === overId);
      if (overJob) targetStatus = overJob.status;
    }

    // Reordering within same column vs moving between columns
    if (targetStatus === dragged.status) {
      // reordering inside same column
      const column = targetStatus === "active" ? active : archived;
      const fromPos = column.findIndex((j) => j.id === draggedId);

      let toPos;
      if (columns.includes(String(overId))) {
        // dropped on column header/empty — keep original pos
        toPos = fromPos;
      } else {
        const overJob = column.find((j) => j.id === overId);
        toPos = overJob ? column.findIndex((j) => j.id === overJob.id) : fromPos;
      }
      if (fromPos === -1 || toPos === -1 || fromPos === toPos) return;

      // optimistic reorder: swap order numbers
      const fromOrder = column[fromPos].order ?? fromPos + 1;
      const toOrder = column[toPos].order ?? toPos + 1;

      const next = list.map((j) =>
        j.id === column[fromPos].id ? { ...j, order: toOrder } :
        j.id === column[toPos].id   ? { ...j, order: fromOrder } :
        j
      );
      setList(next);

      try {
        // optional backend reorder
        await onReorder?.(fromOrder, toOrder);
      } catch (e) {
        // rollback
        setList(list);
        console.error("Reorder failed; rolled back", e);
      }
      return;
    }

    // moving across columns
    const prev = list;
    const next = list.map((j) =>
      j.id === draggedId ? { ...j, status: targetStatus } : j
    );
    setList(next); // optimistic

    try {
      await onMove?.(draggedId, targetStatus);
    } catch (e) {
      setList(prev); // rollback
      console.error("Move failed; rolled back", e);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KanbanColumn id="active" title="Active" count={active.length}>
          <SortableContext items={active.map((j) => j.id)} strategy={verticalListSortingStrategy}>
            {active.map((job) => (
              <SortableJobCard key={job.id} job={job} />
            ))}
          </SortableContext>
        </KanbanColumn>

        <KanbanColumn id="archived" title="Archived" count={archived.length}>
          <SortableContext items={archived.map((j) => j.id)} strategy={verticalListSortingStrategy}>
            {archived.map((job) => (
              <SortableJobCard key={job.id} job={job} />
            ))}
          </SortableContext>
        </KanbanColumn>
      </div>

      <DragOverlay>
        {activeJob ? (
          <Card job={activeJob} className="opacity-90 shadow-2xl border border-blue-500/40" />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

/** Droppable column */
function KanbanColumn({ id, title, count, children }) {
  return (
    <section
      id={id}
      data-droppable
      className="rounded-lg border border-gray-700 bg-gray-800"
    >
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h2 className="text-white font-semibold">{title}</h2>
        <span className="text-xs text-gray-400">{count}</span>
      </header>
      <div className="p-3 space-y-3 min-h-[200px]" id={id}>
        {children}
      </div>
    </section>
  );
}

/** Sortable card */
function SortableJobCard({ job }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card job={job} />
    </div>
  );
}

/** Presentational card used in list/overlay */
function Card({ job, className = "" }) {
  return (
    <div className={`rounded-md border border-gray-700 bg-gray-900/60 p-3 ${className}`}>
      <div className="text-white font-medium">{job.title}</div>
      <div className="text-xs text-gray-400">{job.slug ?? `job-${job.id}`}</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {(job.tags || []).map((t) => (
          <span
            key={t}
            className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/30"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-gray-300 text-xs">
        <ArrowRightLeft className="w-3.5 h-3.5" />
        Drag to move/reorder
      </div>
    </div>
  );
}
