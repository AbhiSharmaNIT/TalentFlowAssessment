// src/features/jobs/JobsPage.jsx
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/Button";
import JobCard from "../../components/JobCard";
import { List, KanbanSquare } from "lucide-react";
import JobKanbanMoveOnly from "./JobKanbanMoveOnly";
import { useToast } from "../../components/ToastProvider";
import {
  setJobStatusOverride,
  getAllJobStatusOverrides,
  loadJobs,
  saveJob,
} from "../../lib/storage";
import FilterUI from "./FilterUI";
import JobModal from "./JobModel";
import JobViewModal from "./JobViewModel";

function slugify(s = "") {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export default function JobsPage() {
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState("list");
  const [filters, setFilters] = useState({
    search: "",
    status: "All Status",
    type: "All Types",
  });

  // modal state (create/edit)
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [editingJob, setEditingJob] = useState(null);

  const [form, setForm] = useState({
    title: "",
    department: "",
    description: "",
    type: "Full Time",
    level: "Mid",
    status: "active",
    location: "Remote",
    minSalary: "",
    maxSalary: "",
    tags: [],
    requirements: [],
  });

  const [errors, setErrors] = useState({});

  // view-only modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewJob, setViewJob] = useState(null);

  const pageSize = 10;

  // Map UI filters -> API params
  const apiParams = useMemo(() => {
    const params = { page, pageSize, limit: pageSize };
    if (filters.search?.trim()) params.search = filters.search.trim();
    params.status =
      filters.status && filters.status !== "All Status"
        ? filters.status.toLowerCase()
        : "";
    return params;
  }, [page, pageSize, filters]);

  // Helper: client-side filter for saved (created-only) jobs
  function matchesFilters(job) {
    const q = (filters.search || "").toLowerCase();
    const statusFilter = (filters.status || "").toLowerCase();

    const inStatus =
      !statusFilter ||
      statusFilter === "all status" ||
      (job.status || "").toLowerCase() === statusFilter;

    const hay =
      (job.title || "") +
      " " +
      (job.slug || "") +
      " " +
      (job.department || "") +
      " " +
      (Array.isArray(job.tags) ? job.tags.join(" ") : "");

    const inSearch = !q || hay.toLowerCase().includes(q);

    return inStatus && inSearch;
  }

  // Fetch server page and MERGE with IndexedDB (saved jobs + overrides)
  const fetchJobs = (params) => {
    const controller = new AbortController();
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();

    fetch(`/api/jobs?${qs}`, { signal: controller.signal })
      .then((res) => res.json())
      .then(async (data) => {
        const serverList = Array.isArray(data?.jobs)
          ? data.jobs
          : data?.items || [];
        const serverTotal =
          data?.meta?.total ?? data?.total ?? serverList.length;

        // Load local overrides + saved jobs
        const [overridesMap, savedJobsArr] = await Promise.all([
          getAllJobStatusOverrides(),
          loadJobs(),
        ]);

        const savedMap = new Map(savedJobsArr.map((j) => [String(j.id), j]));
        const serverIds = new Set(serverList.map((j) => String(j.id)));

        // 1) Overlay saved edits + status overrides onto current server page
        const overlaidPage = serverList.map((j) => {
          const id = String(j.id);
          const saved = savedMap.get(id);
          const override = overridesMap[id];
          let merged = { ...j };
          if (saved) merged = { ...merged, ...saved };
          if (override?.status) merged.status = override.status;
          return merged;
        });

        // 🔒 2) ENFORCE UI FILTERS AFTER OVERLAY to prevent mixed statuses
        const filteredOverlaid = overlaidPage.filter(matchesFilters);

        // 3) Created-only jobs (exist in IndexedDB but not on server page at all)
        const createdOnly = savedJobsArr
          .filter((sj) => !serverIds.has(String(sj.id)))
          .filter(matchesFilters)
          .sort((a, b) => {
            const ao = a.order ?? Number.POSITIVE_INFINITY;
            const bo = b.order ?? Number.POSITIVE_INFINITY;
            return ao - bo;
          });

        // 4) Build final page: prepend created-only on page 1, then clamp
        let combined = filteredOverlaid;
        if (params.page === 1) {
          combined = [...createdOnly, ...filteredOverlaid]
            .sort((a, b) => {
              const ao = a.order ?? Number.POSITIVE_INFINITY;
              const bo = b.order ?? Number.POSITIVE_INFINITY;
              return ao - bo;
            })
            .slice(0, pageSize);
        }

        // 5) Adjust total for pagination to reflect post-overlay filtering
        const excludedByOverlay = overlaidPage.length - filteredOverlaid.length;
        const serverTotalFiltered = Math.max(
          0,
          serverTotal - excludedByOverlay
        );
        const totalForPaging =
          params.page === 1
            ? serverTotalFiltered + createdOnly.length
            : serverTotalFiltered;

        setJobs(combined);
        setTotalPages(Math.max(1, Math.ceil(totalForPaging / pageSize)));
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setJobs([]);
          setTotalPages(1);
        }
      });

    return () => controller.abort();
  };

  useEffect(() => {
    const cleanup = fetchJobs(apiParams);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiParams.page, apiParams.search, apiParams.status]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages || 1));
  }, [totalPages]);

  function handleFiltersChange(next) {
    setFilters((prev) => {
      const changed =
        prev.search !== next.search ||
        prev.status !== next.status ||
        prev.type !== next.type;

      if (changed) {
        setPage(1);
        return next;
      }
      return prev;
    });
  }

  const handlePrev = () => page > 1 && setPage((p) => p - 1);
  const handleNext = () => page < totalPages && setPage((p) => p + 1);

  // ---------- modal openers ----------
  function openCreateModal() {
    setMode("create");
    setEditingJob(null);
    setErrors({});
    setForm({
      title: "",
      department: "",
      description: "",
      type: "Full Time",
      level: "Mid",
      status: "active",
      location: "Remote",
      minSalary: "",
      maxSalary: "",
      tags: [],
      requirements: [],
    });
    setOpen(true);
  }

  function openEditModal(job) {
    setMode("edit");
    setEditingJob(job);
    setErrors({});
    setForm({
      title: job.title || "",
      department: job.department || "",
      description: job.description || "",
      type: job.type || "Full Time",
      level: job.level || "Mid",
      status: job.status || "active",
      location: job.location || "Remote",
      minSalary: job.minSalary ?? "",
      maxSalary: job.maxSalary ?? "",
      tags: Array.isArray(job.tags) ? job.tags : [],
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
    });
    setOpen(true);
  }

  // ---------- submit (create or edit) ----------
  async function submit() {
    if (!form.title?.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }

    const payload = {
      title: form.title.trim(),
      department: form.department?.trim(),
      description: form.description?.trim(),
      type: form.type,
      level: form.level,
      status: form.status,
      location: form.location?.trim() || "Remote",
      minSalary: form.minSalary === "" ? undefined : Number(form.minSalary),
      maxSalary: form.maxSalary === "" ? undefined : Number(form.maxSalary),
      tags: form.tags || [],
      requirements: form.requirements || [],
    };

    try {
      setSaving(true);

      if (mode === "edit" && editingJob?.id) {
        // PATCH (edit)
        const res = await fetch(`/api/jobs/${editingJob.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
          // If Mirage lost this ID after refresh, store locally anyway
          if (res.status === 404) {
            const localUpdated = { ...editingJob, ...payload };
            await saveJob(localUpdated);
            setOpen(false);
            fetchJobs(apiParams);
            showToast("Job updated (stored locally)", "success");
            return;
          }
          setErrors({ form: body?.message || "Save failed" });
          return;
        }

        // Persist edit to IndexedDB so it survives refresh
        await saveJob(body);

        setOpen(false);
        fetchJobs(apiParams);
        showToast("Job updated", "success");
      } else {
        // POST (create)
        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, slug: slugify(form.title) }),
        });

        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
          setErrors({ form: body?.message || "Failed to create job" });
          return;
        }

        // Persist the created job locally (so it survives refresh)
        await saveJob(body);

        setOpen(false);
        setPage(1);
        fetchJobs({ ...apiParams, page: 1 });
        showToast("Job created", "success");
      }
    } catch (e) {
      setErrors({ form: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  // ---------- view-only modal ----------
  function openViewModal(job) {
    setViewJob(job);
    setViewOpen(true);
  }

  // ---------- KANBAN MOVE (FIXED: handles local-only jobs) ----------
  const handleKanbanMove = async (id, nextStatus) => {
    // Find previous status for rollback if needed
    const prevJob = jobs.find((j) => String(j.id) === String(id));
    const prevStatus = prevJob?.status;

    // Optimistic update
    setJobs((curr) =>
      curr.map((j) =>
        String(j.id) === String(id) ? { ...j, status: nextStatus } : j
      )
    );

    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.status === 404) {
        // Not on server (created-only). Persist locally.
        await setJobStatusOverride(id, nextStatus);

        // Also update the saved job object (so it survives refresh)
        const localJobs = await loadJobs();
        const local = localJobs.find((j) => String(j.id) === String(id));
        if (local) {
          await saveJob({ ...local, status: nextStatus });
        }

        showToast(`Moved to ${nextStatus}`, "success");
        // Refresh so overlay+filters re-apply
        fetchJobs(apiParams);
        return;
      }

      if (!res.ok) throw new Error("PATCH /jobs failed");

      // Server ok — still store override so UI stays consistent
      await setJobStatusOverride(id, nextStatus);
      showToast(`Moved to ${nextStatus}`, "success");
      fetchJobs(apiParams);
    } catch (err) {
      // Rollback optimistic UI on error
      setJobs((curr) =>
        curr.map((j) =>
          String(j.id) === String(id) ? { ...j, status: prevStatus } : j
        )
      );
      showToast("Failed to update job status", "error");
    }
  };

  return (
    <div className="w-full px-4 md:px-6 py-4 mt-[-40px]">
      {/* Header */}
      <div className="shrink-0 px-4 md:px-6 pt-6 pb-4 sticky top-0 bg-[#05080f] z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left title */}
          <div className="min-w-0">
            <h1 className="text-[1.75rem] md:text-[2rem] font-bold text-white leading-tight">
              Jobs
            </h1>
            <div className="text-slate-400">
              <p className="font-semibold">
                Manage your job listings and applications
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setView("list")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${
                view === "list"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
              }`}
              title="List view"
            >
              <List className="w-4 h-4" /> List
            </button>
            <button
              type="button"
              onClick={() => setView("kanban")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${
                view === "kanban"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
              }`}
              title="Kanban view"
            >
              <KanbanSquare className="w-4 h-4" /> Kanban
            </button>

            <Button onClick={openCreateModal}>Add Job</Button>
          </div>
        </div>

        <div className="mt-4">
          <FilterUI value={filters} onChange={handleFiltersChange} />
        </div>

        <hr className="border-slate-700 mt-4" />
      </div>

      {/* Content (unchanged) */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6">
        {view === "kanban" ? (
          <JobKanbanMoveOnly jobs={jobs} onMove={handleKanbanMove} />
        ) : (
          <>
            <ul className="space-y-4">
              {(jobs ?? []).map((job) => (
                <li key={job.id}>
                  <JobCard
                    job={job}
                    onEdit={() => openEditModal(job)}
                    onView={() => openViewModal(job)}
                  />
                </li>
              ))}
            </ul>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                onClick={() => page > 1 && setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => page < totalPages && setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="px-7 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modals (unchanged) */}
      <JobModal
        open={open}
        mode={mode}
        saving={saving}
        form={form}
        errors={errors}
        setForm={setForm}
        setOpen={setOpen}
        submit={submit}
      />
      <JobViewModal
        open={viewOpen}
        job={viewJob}
        onClose={() => setViewOpen(false)}
      />
    </div>
  );
}
