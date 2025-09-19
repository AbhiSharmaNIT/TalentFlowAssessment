// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  CalendarDays,
  Users,
  ClipboardList,
  ArrowRight,
  UserPlus,
  GitBranch,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

// Local storage helpers (jobs/assessments)
import {
  loadJobs,
  getAllAssessments,
  getAllDeletedAssessments,
} from "../../lib/storage";

/* ----------------------------- utilities ----------------------------- */
const fmt = (n) => new Intl.NumberFormat().format(n);

async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} ${r.status}`);
  return r.json();
}

// Jobs with meta.total from server
async function getJobsBundle() {
  try {
    const data = await fetchJSON("/api/jobs?limit=100000");
    const list = Array.isArray(data?.jobs)
      ? data.jobs
      : Array.isArray(data)
      ? data
      : [];
    const total = data?.meta?.total ?? list.length;
    return { list, total };
  } catch {
    return { list: [], total: 0 };
  }
}

// Recent candidate activity (applied + stage changes)
async function getRecentActivity(limit = 10) {
  try {
    const data = await fetchJSON("/api/candidates?limit=400");
    const list = Array.isArray(data?.candidates)
      ? data.candidates
      : Array.isArray(data)
      ? data
      : [];
    const items = [];

    for (const c of list) {
      if (c.appliedAtTS) {
        items.push({
          ts: c.appliedAtTS,
          kind: "applied",
          name: c.name,
          job: c.jobTitle || c.jobId || "Unknown job",
        });
      }
      if (c.updatedAtTS && c.stage && String(c.stage).toLowerCase() !== "applied") {
        items.push({
          ts: c.updatedAtTS,
          kind: String(c.stage).toLowerCase(),
          name: c.name,
          job: c.jobTitle || c.jobId || "Unknown job",
        });
      }
    }

    return items.sort((a, b) => b.ts - a.ts).slice(0, limit);
  } catch {
    return [];
  }
}

function timeAgo(ts) {
  if (!ts) return "";
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/* ------------------------ 3D-ish KPI card shell ------------------------ */
function useTilt({ maxX = 18, maxY = 28, hoverScale = 1.04 } = {}) {
  const ref = useRef(null);
  const [state, setState] = useState({ rx: 0, ry: 0, x: 0, y: 0, hover: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;

    const onEnter = () => setState((s) => ({ ...s, hover: true }));
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = x / rect.width;
      const py = y / rect.height;

      const rx = (py - 0.5) * -2 * maxX; // rotateX
      const ry = (px - 0.5) * 2 * maxY;  // rotateY

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setState({ rx, ry, x, y, hover: true }));
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setState({ rx: 0, ry: 0, x: 0, y: 0, hover: false })
      );
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return [ref, state];
}

function KpiCard3D({ title, value, icon, color = "indigo" }) {
  const [ref, t] = useTilt({ maxX: 18, maxY: 28, hoverScale: 1.06 });

  const classes =
    {
      indigo: "bg-indigo-600",
      emerald: "bg-emerald-600",
      sky: "bg-sky-600",
      violet: "bg-violet-600",
    }[color] || "bg-slate-600";

  return (
    <div
      ref={ref}
      className={`relative rounded-2xl ${classes} text-white shadow-xl ring-1 ring-black/10 overflow-hidden`}
      style={{
        transformStyle: "preserve-3d",
        transform: `perspective(1100px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${t.hover ? 1.06 : 1})`,
        transition: "transform 100ms ease",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,0.35), transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150"
        style={{
          opacity: t.hover ? 0.35 : 0,
          background: `radial-gradient(180px circle at ${t.x}px ${t.y}px, rgba(255,255,255,0.35), transparent 60%)`,
          mixBlendMode: "soft-light",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-black/15" />

      <div className="relative p-4">
        <div className="flex items-start justify-between">
          <div
            className="text-sm/5 font-medium text-white/90"
            style={{ transform: "translateZ(24px)" }}
          >
            {title}
          </div>
          <div
            className="shrink-0 rounded-xl bg-black/10 p-2 ring-2 ring-white/30"
            style={{ transform: "translateZ(36px)" }}
          >
            {icon}
          </div>
        </div>
        <div
          className="mt-3 text-3xl font-extrabold tracking-tight"
          style={{ transform: "translateZ(40px)" }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- page --------------------------------- */
export default function DashBoardPage() {
  const navigate = useNavigate();

  // Lock root scroll (removes outer scrollbar) while mounted
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  const [jobsServer, setJobsServer] = useState([]);
  const [jobsTotalServer, setJobsTotalServer] = useState(0);
  const [jobsLocal, setJobsLocal] = useState([]);

  const [candidatesTotal, setCandidatesTotal] = useState(0);
  const [assessmentsMerged, setAssessmentsMerged] = useState([]);

  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // load everything
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);

        // Jobs (server + local)
        const [{ list: srvJobs, total: srvTotal }, locJobs] = await Promise.all([
          getJobsBundle(),
          loadJobs(),
        ]);

        // Candidates totals and pipeline
        const [candPage1] = await Promise.all([
          fetchJSON("/api/candidates?limit=1"),
        ]);
        const totalCand = Number(candPage1?.meta?.total ?? 0);

        // Recent activity (newest 10)
        const act = await getRecentActivity(10);

        // Assessments: merge server + local (dedupe + respect deleted ids)
        let serverAssessments = [];
        try {
          const a = await fetchJSON("/api/assessments");
          serverAssessments = Array.isArray(a?.assessments) ? a.assessments : [];
        } catch {}
        const [localAssessments, deletedIds] = await Promise.all([
          getAllAssessments(),
          getAllDeletedAssessments(),
        ]);
        const deleted = new Set(deletedIds.map(String));
        const amap = new Map();
        for (const x of serverAssessments) {
          const id = String(x.id ?? x._localId);
          if (!deleted.has(id)) amap.set(id, x);
        }
        for (const x of localAssessments) {
          const id = String(x.id ?? x._localId);
          if (!deleted.has(id)) amap.set(id, x);
        }
        const mergedAssessments = [...amap.values()];

        if (!cancelled) {
          setJobsServer(srvJobs);
          setJobsTotalServer(srvTotal);
          setJobsLocal(locJobs);

          setCandidatesTotal(totalCand);
          setAssessmentsMerged(mergedAssessments);
          setActivity(act);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Merge jobs (id dedupe; prefer local)
  const allJobs = useMemo(() => {
    const map = new Map();
    for (const j of jobsServer) map.set(String(j.id ?? j.slug ?? j.title), j);
    for (const j of jobsLocal) map.set(String(j.id ?? j.slug ?? j.title), j);
    return [...map.values()];
  }, [jobsServer, jobsLocal]);

  const totalJobsCount = jobsTotalServer || allJobs.length;
  const activeJobsCount = useMemo(
    () =>
      allJobs.filter(
        (j) => (j.status || j.state || "active").toLowerCase() === "active"
      ).length,
    [allJobs]
  );

  // Recent jobs (last 7)
  const recentJobs = useMemo(() => {
    return allJobs
      .map((j) => ({
        ...j,
        _ts: new Date(j.updatedAt || j.createdAt || Date.now()).getTime(),
      }))
      .sort((a, b) => b._ts - a._ts)
      .slice(0, 7);
  }, [allJobs]);

  return (
    <div className="px-4 md:px-6 py-5 h-[100svh] overflow-hidden flex flex-col">
      {/* Outer container: full viewport height, no page scroll; inner sections handle their own scroll */}
      <h1 className="text-3xl font-bold text-white mb-4">Dashboard</h1>

      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 cursor-pointer">
        <KpiCard3D
          color="indigo"
          title="Total Jobs"
          value={loading ? "…" : fmt(totalJobsCount)}
          icon={<Briefcase className="w-5 h-5 text-white" />}
        />
        <KpiCard3D
          color="emerald"
          title="Active Jobs"
          value={loading ? "…" : fmt(activeJobsCount)}
          icon={<CalendarDays className="w-5 h-5 text-white" />}
        />
        <KpiCard3D
          color="sky"
          title="Candidates"
          value={loading ? "…" : fmt(candidatesTotal)}
          icon={<Users className="w-5 h-5 text-white" />}
        />
        <KpiCard3D
          color="violet"
          title="Assessments"
          value={loading ? "…" : fmt(assessmentsMerged.length)}
          icon={<ClipboardList className="w-5 h-5 text-white" />}
        />
      </div>

      {/* Body fills the remaining space; each panel scrolls independently */}
      <div className="grid lg:grid-cols-3 gap-5 flex-1 overflow-hidden">
        {/* Recent Jobs */}
        <section className="lg:col-span-2 rounded-xl border border-white/10 bg-[#121826] shadow flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 z-10 bg-[#121826]">
            <h2 className="text-white font-semibold">Recent Jobs</h2>
            <button
              onClick={() => navigate("/jobs")}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-sm"
              title="Go to all jobs"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <ul className="divide-y divide-white/10 flex-1 overflow-y-auto pr-2">
            {recentJobs.length === 0 && (
              <li className="px-4 py-6 text-gray-400">
                No jobs yet — create your first job from the Jobs page.
              </li>
            )}

            {recentJobs.map((j) => (
              <li
                key={String(j.id || j.slug || j.title)}
                className="px-4 py-4 hover:bg-white/5"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-white font-medium truncate">
                      {j.title || "Untitled job"}
                    </div>
                    <div className="mt-1 text-sm text-gray-400 flex items-center gap-3">
                      {j.location && <span>{j.location}</span>}
                      {j.department && <span>· {j.department}</span>}
                    </div>
                    {Array.isArray(j.tags) && j.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {j.tags.slice(0, 6).map((t, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-white/10 text-xs text-gray-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-xs">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        (j.status || j.state || "active").toLowerCase() === "active"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30"
                          : "bg-gray-500/15 text-gray-300 border border-white/15"
                      }`}
                    >
                      {(j.status || j.state || "active").toString().toLowerCase()}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Recent Activity */}
        <section className="rounded-xl border border-white/10 bg-[#121826] shadow flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between sticky top-0 z-10 bg-[#121826]">
            <h2 className="text-white font-semibold">Recent Activity</h2>
          </div>

          <ul className="p-3 space-y-2 flex-1 overflow-y-auto pr-2">
            {activity.length === 0 && (
              <li className="text-gray-400 text-sm px-2 py-4">
                No recent activity yet.
              </li>
            )}

            {activity.map((ev, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg_white/5"
              >
                <IconFor kind={ev.kind} />
                <div className="min-w-0">
                  <div className="text-sm text-white/90">
                    <strong className="font-semibold">{ev.name}</strong>{" "}
                    {textFor(ev.kind)}{" "}
                    <span className="text-white/80">— {ev.job}</span>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {timeAgo(ev.ts)}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="px-4 pb-3 text-xs text-gray-400">
            Activity is derived from candidate applications and stage updates.
          </div>
        </section>
      </div>
    </div>
  );
}

/* ----------------------------- helpers ----------------------------- */
function IconFor({ kind }) {
  const base =
    "w-8 h-8 shrink-0 grid place-items-center rounded-lg border border-white/10";
  if (kind === "applied")
    return (
      <div className={`${base} bg-sky-500/15 text-sky-300`}>
        <UserPlus className="w-4 h-4" />
      </div>
    );
  if (kind === "hired")
    return (
      <div className={`${base} bg-emerald-500/15 text-emerald-300`}>
        <CheckCircle2 className="w-4 h-4" />
      </div>
    );
  if (kind === "rejected")
    return (
      <div className={`${base} bg-rose-500/15 text-rose-300`}>
        <XCircle className="w-4 h-4" />
      </div>
    );
  return (
    <div className={`${base} bg-indigo-500/15 text-indigo-300`}>
      <GitBranch className="w-4 h-4" />
    </div>
  );
}

function textFor(kind) {
  if (kind === "applied") return "applied to";
  if (kind === "hired") return "was hired for";
  if (kind === "rejected") return "was rejected for";
  if (kind === "offer") return "moved to offer for";
  if (kind === "technical") return "moved to technical for";
  if (kind === "screening") return "moved to screening for";
  return "updated for";
}
