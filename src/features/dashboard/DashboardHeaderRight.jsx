import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, UserPlus, CheckCircle2, GitBranch, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LS_KEY = "tf_notifications_v1";

/* ---------- helpers ---------- */
function seedNotifications() {
  const names = ["Aarav", "Isha", "Vihaan", "Anaya", "Kabir", "Zoya", "Reyansh", "Myra"];
  const jobs = ["Backend Engineer", "Product Manager", "ML Engineer", "Data Analyst", "Frontend Dev"];
  const kinds = ["applied", "screening", "technical", "offer", "hired", "rejected"];
  const now = Date.now();
  return Array.from({ length: 6 }).map((_, i) => {
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const ts = now - (i + 1) * (10 + Math.floor(Math.random() * 80)) * 60000;
    return { id: `n-${ts}-${i}`, kind, name, job, ts, read: false };
  });
}

function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function Icon({ kind }) {
  const base = "w-8 h-8 rounded-lg grid place-items-center border border-white/10";
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

/* ---------- component ---------- */
export default function DashboardHeaderRight() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return seedNotifications();
      const saved = JSON.parse(raw);
      return Array.isArray(saved) && saved.length ? saved : seedNotifications();
    } catch {
      return seedNotifications();
    }
  });

  const unread = useMemo(() => items.filter((i) => !i.read).length, [items]);
  const ddRef = useRef(null);

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    } else {
      localStorage.removeItem(LS_KEY); // ensures reseed next refresh
    }
  }, [items]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!ddRef.current) return;
      if (!ddRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function onToggle() {
    setOpen((v) => !v);
    if (!open && unread) setItems((prev) => prev.map((x) => ({ ...x, read: true })));
  }

  // Static HR info (no auth)
  const hrName = "Priya Sharma";
  const hrAvatar = null; // or "https://i.pravatar.cc/100?img=47"
  const initials = hrName.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-4">
      {/* Bell */}
      <div className="relative" ref={ddRef}>
        <button
          onClick={onToggle}
          className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-white/90" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-[#0b1120]" />
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-[#121826] shadow-xl z-10">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="text-white font-semibold">Notifications</div>
              <button
                onClick={() => {
                  setItems([]);
                  localStorage.removeItem(LS_KEY);
                }}
                className="text-xs text-white/70 hover:text-white"
              >
                Clear all
              </button>
            </div>
            <ul className="max-h-80 overflow-auto py-1">
              {items.length === 0 && (
                <li className="px-4 py-6 text-sm text-gray-400">No notifications</li>
              )}
              {items.map((n) => (
                <li key={n.id} className="px-3 py-2 hover:bg-white/5">
                  <div className="flex items-start gap-3">
                    <Icon kind={n.kind} />
                    <div className="min-w-0">
                      <div className="text-sm text-white/90">
                        <strong>{n.name}</strong>{" "}
                        {n.kind === "applied"
                          ? "applied to"
                          : n.kind === "hired"
                          ? "was hired for"
                          : n.kind === "rejected"
                          ? "was rejected for"
                          : "moved stage on"}{" "}
                        <span className="text-white/80">{n.job}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{timeAgo(n.ts)}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Avatar → HR profile page */}
      <button
        onClick={() => navigate("/hr")}
        className="relative h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border border-white/20 grid place-items-center text-white font-bold shadow hover:brightness-110"
        title="HR profile"
      >
        {hrAvatar ? (
          <img src={hrAvatar} alt="HR" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <span className="text-[11px] leading-none">{initials}</span>
        )}
      </button>
    </div>
  );
}
