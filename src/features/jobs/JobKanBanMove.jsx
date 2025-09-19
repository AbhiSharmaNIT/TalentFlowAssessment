import { DndContext, PointerSensor, useSensor, useSensors, useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState, useEffect } from "react";

/**
 * Props:
 *  - jobs: [{ id, title, status, tags?, slug? }]
 *  - onMove(id, nextStatus): Promise<void>  // server patch
 */
export default function JobKanbanMoveOnly({ jobs = [], onMove }) {
  // keep local copy for optimistic updates
  const [list, setList] = useState(jobs);
  useEffect(() => setList(jobs), [jobs]);

  const active = useMemo(() => list.filter(j => j.status === "active"), [list]);
  const archived = useMemo(() => list.filter(j => j.status === "archived"), [list]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const draggedId = active.id;
    const overId = over.id; // "active" or "archived" (column ids)

    if (overId !== "active" && overId !== "archived") return;

    const i = list.findIndex(j => j.id === draggedId);
    if (i === -1) return;

    const job = list[i];
    if (job.status === overId) return; // dropped back in same column

    // optimistic update
    const prev = list;
    const next = list.map(j => j.id === draggedId ? { ...j, status: overId } : j);
    setList(next);

    try {
      await onMove?.(draggedId, overId);
    } catch (e) {
      // rollback on failure
      setList(prev);
      console.error("Move failed; rolled back", e);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Column id="active" title="Active" count={active.length}>
          {active.map(job => <CardDraggable key={job.id} job={job} />)}
        </Column>
        <Column id="archived" title="Archived" count={archived.length}>
          {archived.map(job => <CardDraggable key={job.id} job={job} />)}
        </Column>
      </div>
    </DndContext>
  );
}

/** Droppable column */
function Column({ id, title, count, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <section
      ref={setNodeRef}
      className={`rounded-lg border border-gray-700 bg-gray-800 transition
        ${isOver ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900" : ""}`}
    >
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h2 className="text-white font-semibold">{title}</h2>
        <span className="text-xs text-gray-400">{count}</span>
      </header>
      <div className="p-3 space-y-3 min-h-[220px]">{children}</div>
    </section>
  );
}

/** Draggable job card */
function CardDraggable({ job }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: job.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
    cursor: "grab",
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-md border border-gray-700 bg-gray-900/60 p-3"
    >
      <div className="text-white font-medium">{job.title}</div>
      <div className="text-xs text-gray-400">{job.slug ?? `job-${job.id}`}</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {(job.tags || []).map(t => (
          <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/30">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-gray-400">Drag to move between columns</div>
    </div>
  );
}
