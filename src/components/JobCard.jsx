// src/components/JobCard.jsx
import {
  GripVertical,
  Layers,
  MapPin,
  Users,
  MoreHorizontal,
  Edit,
  Eye,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function JobCard({ job, onEdit, onView }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Normalize tags
  let tags = [];
  if (Array.isArray(job?.tags)) {
    tags = job.tags.filter(Boolean).map((t) => String(t).trim());
  } else if (typeof job?.tags === "string") {
    tags = job.tags
      .split(/[,/|·]/g)
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if ((!tags || tags.length === 0) && Array.isArray(job?.requirements)) {
    const raw = job.requirements
      .join(", ")
      .split(/[,/|·]/g)
      .map((t) => t.trim())
      .filter(Boolean);
    const seen = new Set();
    tags = raw
      .filter((t) => t.length <= 20 && !/^\d/.test(t))
      .map((t) => t.replace(/\.$/, ""))
      .filter((t) => {
        const key = t.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 10);
  }

  return (
    <div
      className="
        bg-[#534a4a32] p-4 rounded-lg
        flex flex-col sm:flex-row sm:items-center justify-between
        shadow-md border border-gray-700 relative cursor-pointer
        hover:bg-[#0e0d0d] transition
        gap-3
      "
    >
      {/* Left Section */}
      <div className="flex items-start sm:items-center gap-4">
        <div className="text-gray-500 cursor-move shrink-0">
          <GripVertical className="w-6 h-6" />
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-semibold flex flex-wrap items-center gap-2">
            <span className="truncate">{job.title}</span>
            <span
              className={`text-xs font-medium px-1.5 py-0.5 rounded-[10px] ${
                job.status === "active"
                  ? "bg-[#183821ec] text-[#96fa96] border-[0.6px] border-solid border-[#52b46a]"
                  : "bg-[#55555559] text-[#aaa9a9] border-[1px] border-solid border-gray-500"
              }`}
            >
              {job.status}
            </span>
          </h2>

          <div className="text-gray-400 text-sm mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <Layers className="w-4 h-4" />
              <span className="truncate">{job.department}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{job.location}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{job.candidates} Candidates</span>
            </span>
          </div>

          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((t, i) => (
                <span
                  key={`${t}-${i}`}
                  className="px-2 py-0.5 text-xs border bg-blue-600 text-gray-200 border-none rounded-[6px] cursor-default"
                  title={t}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div
        className="
          flex items-center gap-2
          w-full sm:w-auto
          justify-between sm:justify-end
          mt-1 sm:mt-0
        "
        ref={menuRef}
      >
        <div className="flex -space-x-2">
          {(job.candidateAvatars || []).map((avatarUrl, index) => (
            <img
              key={index}
              src={avatarUrl}
              alt={`Candidate ${index + 1}`}
              className="w-8 h-8 rounded-full border-2 border-gray-800"
            />
          ))}
        </div>

        {/* 3-dot menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2 rounded-full hover:bg-gray-700 text-gray-400"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-900 rounded-lg shadow-lg border border-gray-700 z-10">
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit?.(job);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Job
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-b-lg"
                onClick={() => {
                  setMenuOpen(false);
                  onView?.(job);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Job
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
