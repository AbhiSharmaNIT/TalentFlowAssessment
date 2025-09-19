// src/features/candidates/CandidatesPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { List, KanbanSquare } from "lucide-react";
import CandidateFilterUI from "./CandidateFilterUI";
import CandidateKanbanMoveOnly from "./CandidateKanbanMoveOnly";
import CandidateCard from "../../components/CandidateCard";
import PipelineSummary from "./PipelineSummary";

const PAGE_SIZE = 12;
const STAGES = ["applied", "screening", "technical", "offer", "hired", "rejected"];

export default function CandidatesPage() {
  const navigate = useNavigate();

  const [view, setView] = useState("list"); // "list" | "kanban"
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    search: "",
    stage: "All Stages",
    job: "All Jobs",
  });

  const [counts, setCounts] = useState({
    applied: 0,
    screening: 0,
    technical: 0,
    offer: 0,
    hired: 0,
    rejected: 0,
  });

  const [jobOptions, setJobOptions] = useState(["All Jobs"]);

  // ---------- API params ----------
  // KANBAN: ignore stage filter so all columns fill
  const apiParams = useMemo(() => {
    const p = { page, limit: PAGE_SIZE };
    if (filters.search?.trim()) p.search = filters.search.trim();
    if (view !== "kanban" && filters.stage !== "All Stages") {
      p.stage = filters.stage.toLowerCase();
    }
    if (filters.job !== "All Jobs") p.job = filters.job;
    return p;
  }, [page, filters, view]);

  const normalizeArray = (v) =>
    Array.isArray(v)
      ? v
      : typeof v === "string"
      ? v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  function matchesClientFilters(c) {
    const q = (filters.search || "").toLowerCase();
    const effectiveStage = view === "kanban" ? "" : (filters.stage || "").toLowerCase();

    const inStage =
      !effectiveStage ||
      effectiveStage === "all stages" ||
      (c.stage || "").toLowerCase() === effectiveStage;

    const hay = [c.name, c.email, c.phone, c.location, c.jobTitle, ...normalizeArray(c.skills)].join(
      " "
    );
    const inSearch = !q || hay.toLowerCase().includes(q);

    const inJob =
      filters.job === "All Jobs" ||
      !filters.job ||
      String(c.jobTitle || c.job || "") === filters.job ||
      String(c.jobId || "") === filters.job;

    return inStage && inSearch && inJob;
  }

  // Counters
  async function loadCounts() {
    try {
      const r = await fetch("/api/candidates/stats");
      if (r.ok) {
        const s = await r.json();
        const next = { ...counts };
        STAGES.forEach((k) => (next[k] = s[k] ?? 0));
        setCounts(next);
        return;
      }
    } catch (_) {}
    // fallback aggregate
    const r = await fetch(`/api/candidates?limit=5000`);
    const j = await r.json();
    const list = Array.isArray(j?.candidates) ? j.candidates : j?.items || j || [];
    const agg = { applied: 0, screening: 0, technical: 0, offer: 0, hired: 0, rejected: 0 };
    list.forEach((c) => {
      const s = (c.stage || "").toLowerCase();
      if (agg[s] != null) agg[s] += 1;
    });
    setCounts(agg);
  }

  async function loadJobOptions() {
    try {
      const r = await fetch("/api/jobs?limit=5000");
      const j = await r.json();
      const data = j?.jobs ?? j?.data ?? [];
      const set = new Set(data.map((x) => String(x.title || x.name || x.slug || x.id)));
      setJobOptions(["All Jobs", ...Array.from(set)]);
    } catch {
      setJobOptions(["All Jobs"]);
    }
  }

  // Fetch a page
  const fetchPage = async (params) => {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    const r = await fetch(`/api/candidates?${qs}`);
    const j = await r.json();
    const serverList = Array.isArray(j?.candidates) ? j.candidates : j?.items || j || [];
    const serverTotal = j?.meta?.total ?? j?.total ?? serverList.length;

    const finalPage = serverList.filter(matchesClientFilters);

    setCandidates(finalPage);
    setTotalPages(Math.max(1, Math.ceil((serverTotal || finalPage.length) / PAGE_SIZE)));
  };

  const moveStage = async (id, nextStage) => {
    const prev = candidates;
    setCandidates((curr) =>
      curr.map((c) => (String(c.id) === String(id) ? { ...c, stage: nextStage } : c))
    );
    try {
      const r = await fetch(`/api/candidates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: nextStage }),
      });
      if (!r.ok) throw new Error("PATCH failed");
      await fetchPage(apiParams);
      await loadCounts();
    } catch {
      setCandidates(prev);
    }
  };

  useEffect(() => {
    loadCounts();
    loadJobOptions();
  }, []);

  // Refetch when switching views or filters
  useEffect(() => {
    fetchPage(apiParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiParams.page, apiParams.search, apiParams.stage, apiParams.job, view]);

  function onFiltersChange(next) {
    setFilters(next);
    setPage(1);
  }

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-6 pt-1 pb-4 ">
        <div className="flex items-start justify-between w-[100%]">
          <div>
            <h1 className="text-[2rem] font-bold text-white">Candidates</h1>
            <p className="text-sm text-gray-300 mt-1">
              Manage your candidate pipeline and applications
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView("list")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${
                view === "list"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
              List View
            </button>
            <button
              type="button"
              onClick={() => setView("kanban")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${
                view === "kanban"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
              }`}
              title="Kanban"
            >
              <KanbanSquare className="w-4 h-4" />
              Kanban
            </button>
          </div>
        </div>

        {/* ✨ Dynamic pipeline summary with hover/shine/animated numbers */}
        <div className="mt-5">
          <PipelineSummary
            counts={counts}
            activeStage={filters.stage}
            onPick={(stageLabel) => onFiltersChange({ ...filters, stage: stageLabel })}
          />
        </div>

        {/* Search + filters */}
        <div className="mt-5">
          <CandidateFilterUI
            value={filters}
            onChange={onFiltersChange}
            jobOptions={jobOptions}
            stageCounts={counts} // safe extra; used if your filter shows counts
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {view === "kanban" ? (
          <CandidateKanbanMoveOnly candidates={candidates} onMove={moveStage} stages={STAGES} />
        ) : (
          <>
            <ul className="space-y-4">
              {(candidates ?? []).map((c) => (
                <li key={c.id}>
                  <CandidateCard
                    candidate={c}
                    onView={() => navigate(`/candidates/${c.id}`)} // open profile
                    onMove={moveStage}
                  />
                </li>
              ))}
            </ul>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!canPrev}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!canNext}
                className="px-7 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
