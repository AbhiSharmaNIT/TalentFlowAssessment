import React from "react";
import { X, Building2, MapPin, BadgeCheck } from "lucide-react";

function fmtMoney(n) {
  if (n === null || n === undefined || n === "") return null;
  const num = Number(n);
  if (Number.isNaN(num)) return null;
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function JobViewModal({ open, job, onClose }) {
  if (!open || !job) return null;

  const min = fmtMoney(job.minSalary);
  const max = fmtMoney(job.maxSalary);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto my-8 px-4">
        {/* glassy border frame */}
        <div className="relative rounded-2xl p-1 bg-gradient-to-br from-slate-300/20 via-white/10 to-black/10">
          {/* close button */}
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 p-2 rounded-full bg-gray-900 border border-gray-700 text-gray-200 hover:bg-gray-800 z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#0E1525] rounded-2xl p-6 border border-gray-700 shadow-xl">
            {/* LEFT: overview + candidates */}
            <div className="lg:col-span-2 space-y-6">
              {/* header card */}
              <section className="bg-[#0B1220] rounded-2xl border border-gray-700 p-6 shadow">
                <div className="flex items-start justify-between">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                    {job.title}
                  </h1>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                      job.status === "active"
                        ? "bg-emerald-900/50 text-emerald-300 border border-emerald-600/50"
                        : "bg-gray-700/60 text-gray-300 border border-gray-600/60"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-gray-300">
                  <div className="inline-flex items-center gap-2">
                    <Building2 className="w-4 h-4 opacity-80" />
                    <span>{job.department || "—"}</span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4 opacity-80" />
                    <span>{job.location || "—"}</span>
                  </div>
                </div>

                {job.description && (
                  <p className="mt-4 text-gray-300 leading-relaxed">
                    {job.description}
                  </p>
                )}
              </section>

              {/* candidates section */}
              <section className="bg-[#0B1220] rounded-2xl border border-gray-700 p-6 shadow">
                <h2 className="text-2xl font-bold text-yellow-300">
                  Candidates ({job.candidates ?? 0})
                </h2>

                {(job.candidates ?? 0) === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-gray-600 bg-[#0F182B] p-10 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center text-gray-400">
                      <BadgeCheck className="w-6 h-6" />
                    </div>
                    <p className="mt-4 text-gray-300 font-medium">No candidates found</p>
                    <p className="text-gray-400 text-sm">
                      Try adjusting your search criteria or filters.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 text-gray-300">
                    {/* render your candidate list here if available */}
                  </div>
                )}
              </section>
            </div>

            {/* RIGHT: details + requirements */}
            <div className="space-y-6">
              {/* details */}
              <section className="bg-[#0B1220] rounded-2xl border border-gray-700 p-6 shadow">
                <h3 className="text-2xl font-bold text-yellow-300">Job Details</h3>

                <div className="mt-4 space-y-4 text-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Salary Range</span>
                    <span className="font-semibold">
                      {min || max ? (
                        <>
                          {min ? `$ ${min}` : ""}
                          {min && max ? " - " : ""}
                          {max ? `$ ${max}` : ""}
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Type</span>
                    <span className="px-3 py-1 rounded-full text-xs capitalize bg-gray-800 border border-gray-700">
                      {String(job.type || "—").toLowerCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Level</span>
                    <span className="px-3 py-1 rounded-full text-xs capitalize bg-gray-800 border border-gray-700">
                      {String(job.level || "—").toLowerCase()}
                    </span>
                  </div>
                </div>
              </section>

              {/* requirements */}
              <section className="bg-[#0B1220] rounded-2xl border border-gray-700 p-6 shadow">
                <h3 className="text-2xl font-bold text-yellow-300">Requirements</h3>
                {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
                  <ul className="mt-4 space-y-2 text-gray-200">
                    {job.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-yellow-300" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-gray-400">No requirements listed.</p>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
