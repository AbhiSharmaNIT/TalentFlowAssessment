import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import AssessmentCard from "../../components/AssessmentCard";
import AssessmentFormModal from "./AssessmentFormModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import AssessmentQuizModal from "./AssessmentQuizModal";

import {
  saveAssessment,
  getAllAssessments,
  deleteAssessmentFromStorage,
  markAssessmentDeleted,
  getAllDeletedAssessments,
} from "../../lib/storage";

/** Merge two lists by id, preferring local over server */
function mergeByIdPreferLocal(serverList = [], localList = []) {
  const byId = new Map();
  for (const a of serverList) {
    if (!a || a.id == null) continue;
    byId.set(String(a.id), a);
  }
  for (const a of localList) {
    if (!a || a.id == null) continue;
    byId.set(String(a.id), { ...byId.get(String(a.id)), ...a });
  }
  return Array.from(byId.values());
}

export default function AssessmentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // form
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch("/api/assessments?limit=1000");
        const j = await r.json();
        const serverData = j?.items || j?.assessments || j || [];

        const localData = await getAllAssessments();

        let deletedIds = [];
        try {
          deletedIds = await getAllDeletedAssessments();
        } catch {
          deletedIds = [];
        }
        const deleted = new Set((deletedIds || []).map(String));
        const serverFiltered = (serverData || []).filter(
          (a) => !deleted.has(String(a?.id))
        );

        const combined = mergeByIdPreferLocal(serverFiltered, localData);
        if (alive) setItems(Array.isArray(combined) ? combined : []);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  function onCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function onEdit(item) {
    setEditing(item);
    setFormOpen(true);
  }

  function onSaved(saved) {
    setFormOpen(false);
    setEditing(null);
    (async () => {
      try {
        const stored = await saveAssessment(saved);
        setItems((curr) => {
          const idx = curr.findIndex((x) => String(x.id) === String(stored.id));
          if (idx >= 0) {
            const next = [...curr];
            next[idx] = { ...next[idx], ...stored };
            return next;
          }
          return [stored, ...curr];
        });
      } catch {
        setItems((curr) => {
          const idx = curr.findIndex((x) => String(x.id) === String(saved.id));
          if (idx >= 0) {
            const next = [...curr];
            next[idx] = { ...next[idx], ...saved };
            return next;
          }
          return [saved, ...curr];
        });
      }
    })();
  }

  function onAskDelete(item) {
    setToDelete(item);
    setDeleteOpen(true);
  }
  async function onConfirmDelete() {
    const id = toDelete?.id;
    const doomed = toDelete;
    setDeleteOpen(false);
    setToDelete(null);
    if (!id) return;

    try { await fetch(`/api/assessments/${id}`, { method: "DELETE" }); } catch {}

    setItems((curr) => curr.filter((x) => String(x.id) !== String(id)));

    try {
      await deleteAssessmentFromStorage(doomed);
      await markAssessmentDeleted(id);
    } catch {}
  }

  function onPreview(item) {
    setPreviewItem(item);
    setPreviewOpen(true);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Assessments</h1>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Assessment
        </button>
      </div>

      {/* grid of cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading && <div className="text-gray-400">Loading…</div>}
        {!loading && items.length === 0 && (
          <div className="text-gray-400">No assessments yet. Create one to get started.</div>
        )}
        {items.map((a) => (
          <AssessmentCard
            key={a.id}
            assessment={a}
            onPreview={() => onPreview(a)}
            onEdit={() => onEdit(a)}
            onDelete={() => onAskDelete(a)}
          />
        ))}
      </div>

      {/* Create / Edit form */}
      {formOpen && (
        <AssessmentFormModal
          open={formOpen}
          initialData={editing}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSaved={onSaved}
        />
      )}

      {/* Delete confirmation */}
      {deleteOpen && toDelete && (
        <DeleteConfirmationModal
          open={deleteOpen}
          assessment={toDelete}
          onClose={() => {
            setDeleteOpen(false);
            setToDelete(null);
          }}
          onConfirm={onConfirmDelete}
        />
      )}

      {/* Interactive Preview (dummy quiz) */}
      {previewOpen && previewItem && (
        <AssessmentQuizModal
          open={previewOpen}
          assessment={previewItem}
          onClose={() => {
            setPreviewOpen(false);
            setPreviewItem(null);
          }}
        />
      )}
    </div>
  );
}
