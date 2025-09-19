// src/components/Sidebar.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Briefcase,
  Users,
  ClipboardList,
  ChevronLeft,
  LayoutGrid as MenuIcon,
  X as CloseIcon,
} from "lucide-react";
import TalentFlowLogo from "../assets/Logo.png";

// Local data helpers (IndexedDB via localforage)
import {
  loadJobs,
  getAllAssessments,
  getAllDeletedAssessments,
} from "../lib/storage.js";

/* ----------------------------- styles ----------------------------- */
const linkBase =
  "group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition";
const active =
  "bg-blue-600 text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)]";
const inactive = "text-slate-300 hover:bg-slate-700 hover:text-white";

const railActive =
  "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)]";

const SIDEBAR_KEY = "tf_sidebar_collapsed_v1";
const mqDesktop = "(min-width: 1024px)"; // Tailwind lg

/* ----------------------------- utils ----------------------------- */
function isDesktopNow() {
  if (typeof window === "undefined") return true;
  return window.matchMedia(mqDesktop).matches;
}

function applySidebarWidth(isCollapsed) {
  const root = document.documentElement;
  const desktop = isDesktopNow();

  // On mobile, sidebar is overlay; content should be full width
  if (!desktop) {
    root.style.setProperty("--sidebar-w", "0px");
    root.classList.remove("sidebar-collapsed");
    return;
  }

  root.style.setProperty("--sidebar-w", isCollapsed ? "76px" : "16rem");
  root.classList.toggle("sidebar-collapsed", !!isCollapsed);
}

// Simple JSON fetcher
async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} ${r.status}`);
  return r.json();
}

// Combine server + local for live counts
async function getLiveCounts() {
  // Jobs
  const jobsResp = await fetchJSON("/api/jobs?limit=1");
  const serverJobsTotal = Number(jobsResp?.meta?.total ?? 0);

  const localJobs = await loadJobs();
  const localMap = new Map();
  for (const j of localJobs) {
    const key = String(j.id ?? j.slug ?? j.title);
    localMap.set(key, j);
  }
  let allServerJobs = [];
  try {
    const big = await fetchJSON("/api/jobs?limit=100000");
    allServerJobs = Array.isArray(big?.jobs) ? big.jobs : [];
  } catch {}
  const allMap = new Map();
  for (const j of allServerJobs) allMap.set(String(j.id ?? j.slug ?? j.title), j);
  for (const j of localJobs) allMap.set(String(j.id ?? j.slug ?? j.title), j);
  const jobsTotal = allMap.size || serverJobsTotal + localMap.size;

  // Candidates
  const candResp = await fetchJSON("/api/candidates?limit=1");
  const candidatesTotal = Number(candResp?.meta?.total ?? 0);

  // Assessments (respect local deletes)
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
  const assessmentsTotal = amap.size;

  return { jobs: jobsTotal, candidates: candidatesTotal, assessments: assessmentsTotal };
}

/* ----------------------------- component ----------------------------- */
export default function Sidebar() {
  // Desktop collapse (persisted)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === "1";
    } catch {
      return false;
    }
  });

  // Responsive flags
  const [isDesktop, setIsDesktop] = useState(isDesktopNow());
  const [mobileOpen, setMobileOpen] = useState(false);

  // Apply widths + keyboard shortcut
  useEffect(() => {
    applySidebarWidth(collapsed);

    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (isDesktopNow()) {
          setCollapsed((v) => !v);
        } else {
          setMobileOpen((v) => !v);
        }
      }
    };

    const onResize = () => {
      const desktop = isDesktopNow();
      setIsDesktop(desktop);
      applySidebarWidth(collapsed);
      if (!desktop) setMobileOpen(false); // avoid stuck open when switching breakpoints
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist collapse
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
    } catch {}
    applySidebarWidth(collapsed);
  }, [collapsed]);

  // Live counts
  const [counts, setCounts] = useState({ jobs: 0, candidates: 0, assessments: 0 });
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const c = await getLiveCounts();
        if (!cancelled) setCounts(c);
      } catch {}
    }

    load();

    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    const id = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const links = useMemo(
    () => [
      { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
      { to: "/jobs", label: "Jobs", icon: Briefcase, badge: counts.jobs },
      { to: "/candidates", label: "Candidates", icon: Users, badge: counts.candidates },
      { to: "/assessments", label: "Assessments", icon: ClipboardList, badge: counts.assessments },
    ],
    [counts.jobs, counts.candidates, counts.assessments]
  );

  const Badge = ({ children }) => (
    <span className="ml-auto inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-slate-700 text-slate-200">
      {children}
    </span>
  );

  /* ---------- shared inner (used by both desktop and mobile aside) ---------- */
  const asideInner = (
    <>
      {/* Header / Logo row */}
      <div className="h-20 flex items-center px-4 relative border-b border-slate-800">
        <div
          className={[
            "overflow-hidden rounded-full ring-black/20",
            isDesktop && collapsed ? "h-16 w-16" : "h-20 w-20",
          ].join(" ")}
        >
          <img
            src={TalentFlowLogo}
            alt="TalentFlow"
            className="h-full w-full object-cover transition-transform duration-500 hover:rotate-360"
          />
        </div>

        {/* Collapse toggle (desktop only) */}
        {isDesktop && (
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 
                bg-blue-600 text-white rounded-full p-1 shadow-md 
                hover:bg-blue-500 transition"
            title={collapsed ? "Expand" : "Collapse"}
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        )}

        {/* Close (mobile only) */}
        {!isDesktop && (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto inline-flex items-center justify-center rounded-full p-2 text-slate-200 hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={() => {
              if (!isDesktop) setMobileOpen(false); // auto-close on navigation (mobile)
            }}
            className={({ isActive }) =>
              [
                linkBase,
                isActive ? active : inactive,
                isDesktop && collapsed ? "justify-center px-2 py-2" : "",
              ].join(" ")
            }
          >
            <span className={railActive} aria-hidden="true" />
            <Icon className="h-5 w-5 shrink-0" />
            {(!isDesktop || !collapsed) && <span>{label}</span>}
            {(!isDesktop || !collapsed) && typeof badge === "number" && (
              <Badge>{badge}</Badge>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer hint */}
      <div className="px-3 pb-4 border-t border-slate-800">
        <div className="mt-2 text-[10px] text-center text-slate-400">
          Tip: Press{" "}
          <kbd className="px-1 py-0.5 bg-slate-700 rounded">Ctrl/⌘ + B</kbd>
          {isDesktop
            ? collapsed
              ? " to expand."
              : " to collapse."
            : mobileOpen
            ? " to close."
            : " to open."}
        </div>
      </div>
    </>
  );

  /* ----------------------------- render ----------------------------- */
  return (
    <>
      {/* Desktop (lg+) persistent sidebar */}
      <aside
        className={[
          "hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col border-r transition-[width,background] duration-300",
          "text-slate-200 border-slate-800",
          isDesktop && collapsed ? "w-[76px]" : "w-64",
        ].join(" ")}
        style={{ backgroundColor: "#0a101d" }}
      >
        {asideInner}
      </aside>

      {/* Mobile (below lg) drawer */}
      <aside
        className={[
          "lg:hidden fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800",
          "transition-transform duration-300 will-change-transform",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "text-slate-200",
        ].join(" ")}
        style={{ backgroundColor: "#0a101d" }}
        aria-hidden={!mobileOpen}
      >
        {asideInner}
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <button
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px]"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar backdrop"
        />
      )}

      {/* Floating MENU button (mobile only) — hidden while drawer is open */}
      <button
        className={[
          "lg:hidden fixed top-4 left-3 z-50 rounded-full",
          "bg-blue-600 text-white px-3 py-2 shadow-lg active:scale-95 transition",
          mobileOpen ? "hidden" : "inline-flex",
          "items-center gap-2",
        ].join(" ")}
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <MenuIcon className="h-5 w-5" />
        <span className="text-sm font-semibold">Menu</span>
      </button>
    </>
  );
}