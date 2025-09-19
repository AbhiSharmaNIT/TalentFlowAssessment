// src/features/assessments/AssessmentCard.jsx
import {
  CalendarDays,
  Clock3,
  Pencil,
  Trash2,
  Eye,
  Hash,
} from "lucide-react";

/**
 * Visual quiz/assessment card.
 *
 * Props:
 *  - assessment: { id, title, theme, status, startAt, durationMin, tags[], bannerUrl, description }
 *  - onPreview(assessment)
 *  - onEdit(assessment)
 *  - onDelete(assessment)
 */
export default function AssessmentCard({
  assessment = {},
  onPreview,
  onEdit,
  onDelete,
}) {
  const {
    title = "April Quiz - 1",
    theme = "DEVOPS",
    status = "expired", // "live" | "upcoming" | "expired"
    startAt,
    durationMin = 30,
    tags = ["Azure", "Cloud", "DevOps"],
    bannerUrl,
  } = assessment ?? {};

  const dateText = formatDateTime(startAt);
  const pill = getStatusPill(status);

  const img =
    bannerUrl ||
    "https://t4.ftcdn.net/jpg/10/55/20/11/360_F_1055201192_W4n4uWXJ7EIJ3AyjKNSDAG5B2PtFPkta.jpg"; // fallback

  return (
    <div
      className="
        group rounded-xl overflow-hidden
        border border-slate-200/80 dark:border-slate-700/60
        bg-white/90 dark:bg-slate-900/80
        shadow-[0_6px_24px_rgba(2,6,23,0.06)]
        dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)]
        hover:shadow-[0_10px_32px_rgba(2,6,23,0.10)]
        dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)]
        backdrop-blur supports-[backdrop-filter]:bg-white/70
        dark:supports-[backdrop-filter]:bg-slate-900/70
        transition
      "
    >
      {/* Top banner with hover effect */}
      <div className="relative overflow-hidden">
        <img
          src={img}
          alt={title}
          className="
            h-48 w-full object-cover
            transition-transform duration-700 ease-out
            group-hover:scale-110 group-hover:brightness-110
          "
          draggable={false}
        />

        {/* dark overlay + hover fade */}
        <div
          className="
            absolute inset-0
            bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.35)_35%,rgba(0,0,0,0.55)_100%)]
            dark:bg-[linear-gradient(to_bottom,rgba(0,0,0,0.65)_0%,rgba(0,0,0,0.45)_35%,rgba(0,0,0,0.65)_100%)]
            pointer-events-none
            transition-opacity duration-500
            group-hover:opacity-80
          "
        />

        {/* status pill */}
        <div className="absolute z-20 top-2 left-2">
          <span
            className={`text-[11px] font-semibold px-2 py-1 rounded-md shadow ${pill.bg} ${pill.text} border ${pill.border}`}
          >
            {pill.label}
          </span>
        </div>

        {/* quick actions */}
        <div className="absolute z-30 top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            type="button"
            onClick={() => onPreview?.(assessment)}
            className="p-2 rounded-md bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-gray-800 dark:text-slate-200 shadow"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit?.(assessment)}
            className="p-2 rounded-md bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-gray-800 dark:text-slate-200 shadow"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(assessment)}
            className="p-2 rounded-md bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-gray-800 dark:text-slate-200 shadow"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* banner text */}
        <div
          className="absolute z-10 left-0 right-0 top-0 h-full flex flex-col items-center justify-center text-center px-4 select-none"
          onClick={() => onPreview?.(assessment)}
          role="button"
        >
          <div className="text-white/90 text-[13px] tracking-[0.12em] font-semibold">
            {title.toUpperCase()}
          </div>
          <div className="mt-1 text-[#35f0ff] dark:text-cyan-300 text-xs tracking-[0.14em]">
            THEME: <span className="font-semibold">{theme.toUpperCase()}</span>
          </div>
        </div>

        {/* banner footer date */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
          <div className="px-3 py-1 rounded-md bg-black/60 text-white text-xs font-medium">
            {dateText || "—"}
          </div>
        </div>
      </div>

      {/* tags */}
      {Array.isArray(tags) && tags.length > 0 && (
        <div className="px-4 pt-3 pb-1 flex flex-wrap gap-2">
          {tags.slice(0, 4).map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="
                inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md
                border border-rose-300 text-rose-600 bg-rose-50
                dark:border-cyan-400/30 dark:text-cyan-200 dark:bg-cyan-900/20
              "
            >
              <Hash className="w-3 h-3" />
              {t}
            </span>
          ))}
          {tags.length > 4 && (
            <span
              className="
                text-[11px] font-medium px-2 py-1 rounded-md
                border border-rose-300 text-rose-600 bg-rose-50
                dark:border-cyan-400/30 dark:text-cyan-200 dark:bg-cyan-900/20
              "
            >
              +{tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* title (outside banner) */}
      <button
        type="button"
        onClick={() => onPreview?.(assessment)}
        className="w-full text-left px-4 pt-1 pb-2"
        title="Open preview"
      >
        <h3 className="text-[18px] font-semibold text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300 transition">
          {title}
        </h3>
      </button>

      {/* bottom meta row */}
      <div className="px-4 pb-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <div className="inline-flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4" />
          <span>{dateText || "—"}</span>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <Clock3 className="w-4 h-4" />
          <span>{durationMin} min</span>
        </div>
      </div>
    </div>
  );
}

/* ----------- utils ----------- */

function getStatusPill(status) {
  const s = (status || "").toLowerCase();
  if (s === "live")
    return {
      label: "Live",
      bg: "bg-[#e6fff1] dark:bg-emerald-900/20",
      text: "text-[#039855] dark:text-emerald-300",
      border: "border-[#7cd4a8] dark:border-emerald-400/30",
    };
  if (s === "upcoming")
    return {
      label: "Upcoming",
      bg: "bg-[#fff8e6] dark:bg-amber-900/20",
      text: "text-[#b76e00] dark:text-amber-300",
      border: "border-[#ffd27a] dark:border-amber-400/30",
    };
  // default expired
  return {
    label: "Expired",
    bg: "bg-[#ffe7e7] dark:bg-rose-900/20",
    text: "text-[#d12c2c] dark:text-rose-300",
    border: "border-[#ff9b9b] dark:border-rose-400/30",
  };
}

function formatDateTime(v) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";
  const day = d.getDate();
  const suffix = getOrdinal(day);
  const month = d.toLocaleString(undefined, { month: "short" });
  const year = d.getFullYear();
  const time = d.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${day}${suffix} ${month}, ${year}, ${time}`;
}

function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
