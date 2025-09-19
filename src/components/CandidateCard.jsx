// src/features/candidates/components/CandidateCard.jsx
import { useEffect, useRef, useState } from "react";
import {
  MoreHorizontal,
  Mail,
  MapPin,
  Calendar,
  ChevronRight,
  CircleUserRound,   // <-- add this
} from "lucide-react";

const STAGE_LABELS = {
  applied: "Applied",
  screening: "Screening",
  technical: "Technical",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

const STAGE_BADGE = {
  hired: "bg-emerald-900/40 text-emerald-300 border-emerald-700/40",
  rejected: "bg-rose-900/40 text-rose-300 border-rose-700/40",
  offer: "bg-purple-900/40 text-purple-300 border-purple-700/40",
  technical: "bg-cyan-900/40 text-cyan-300 border-cyan-700/40",
  screening: "bg-indigo-900/40 text-indigo-300 border-indigo-700/40",
  applied: "bg-blue-900/30 text-blue-200 border-blue-700/30",
};

export default function CandidateCard({ candidate, onView, onMove, variant = "list" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const {
    name = "Unnamed",
    email,
    phone,
    location,
    experienceYears,
    appliedAt,
    stage = "applied",
    jobTitle,
    skills,
    initials,
  } = candidate || {};

  const tags = Array.isArray(skills)
    ? skills
    : typeof skills === "string"
    ? skills.split(/[,/|·]/g).map((t) => t.trim()).filter(Boolean)
    : [];

  const badge = STAGE_BADGE[stage] || STAGE_BADGE.applied;

  const wrap = [
    "rounded-2xl border border-gray-700/70",
    "bg-gradient-to-br from-slate-800 to-slate-900",
    "shadow-sm hover:shadow-lg",
    "transition-transform duration-200",
    variant === "kanban" ? "p-4 hover:-translate-y-0.5" : "p-5 hover:-translate-y-0.5",
  ].join(" ");

  return (
    <div className={wrap}>
      <div className="flex items-start justify-between gap-4">
        {/* Left: avatar + info */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#0051ff34] flex items-center justify-center text-[#00c3ff] font-semibold shadow-md border border-[#053ef9] ">
            {initials || (name ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "C")}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-base md:text-lg font-semibold truncate text-gray-100">{name}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badge}`}>
                {STAGE_LABELS[stage] || stage}
              </span>
            </div>

            <div className="mt-1 text-[13px] md:text-sm text-gray-300 flex flex-wrap gap-x-5 gap-y-1">
              {email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{email}</span>
                </span>
              )}
              {phone && (
                <span className="inline-flex items-center gap-1">
                  <span>📞</span>
                  <span className="truncate">{phone}</span>
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{location}</span>
                </span>
              )}
              {(experienceYears != null || appliedAt) && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {experienceYears != null ? `${experienceYears} years exp.` : ""}
                    {experienceYears != null && appliedAt ? " • " : ""}
                    {appliedAt ? `Applied ${appliedAt}` : ""}
                  </span>
                </span>
              )}
              {jobTitle && (
                <span className="inline-flex items-center gap-1">
                  <span>🏷️</span>
                  <span className="truncate">{jobTitle}</span>
                </span>
              )}
            </div>

            {/* skills */}
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.slice(0, 8).map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="px-2 py-0.5 rounded-full text-xs border border-gray-600 bg-slate-700/70 text-gray-200"
                  >
                    {t}
                  </span>
                ))}
                {tags.length > 8 && (
                  <span className="px-2 py-0.5 rounded-full text-xs border border-gray-600 bg-slate-700/70 text-gray-300">
                    +{tags.length - 8} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: 3-dot menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-full hover:bg-slate-700/60 text-gray-300"
            aria-label="More actions"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-lg shadow-xl border border-gray-700 z-20 overflow-hidden">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-slate-800 flex items-center gap-2"
                onClick={() => {
                  setMenuOpen(false);
                  onView?.(candidate);
                }}
              >
                <CircleUserRound className="w-4 h-4" />
                View Profile
              </button>
              <div className="h-px bg-gray-700" />
              {["applied", "screening", "technical", "offer", "hired", "rejected"].map((s) => (
                <button
                  key={s}
                  className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-slate-800 flex items-center justify-between"
                  onClick={() => {
                    setMenuOpen(false);
                    onMove?.(candidate.id, s);
                  }}
                >
                  Move to {s.charAt(0).toUpperCase() + s.slice(1)}
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
