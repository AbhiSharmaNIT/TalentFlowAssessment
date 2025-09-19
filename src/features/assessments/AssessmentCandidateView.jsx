import React from "react";

export default function AssessmentCandidateView({
  title = "",
  jobTitle = "Unknown Job",
  description = "",
  sections = [],
  readOnly = true,
}) {
  return (
    <div className="text-gray-100">
      <div className="text-2xl font-bold">{title}</div>
      <div className="mt-1 text-sm text-[#e6dc95]">{jobTitle}</div>
      {description && <p className="mt-3 text-gray-200">{description}</p>}

      <form className="mt-5 space-y-5" onSubmit={(e) => e.preventDefault()}>
        {sections.map((s, sIdx) => (
          <fieldset
            key={s.id || sIdx}
            className="rounded-xl border border-gray-700 bg-[#121a27] p-4"
            disabled={readOnly}
          >
            <legend className="px-1 text-gray-100 font-semibold mb-3">
              {s.title || `Section ${sIdx + 1}`}
            </legend>

            <ul className="space-y-3">
              {(s.questions || []).map((q, qIdx) => (
                <li
                  key={q.id || qIdx}
                  className="rounded-md border border-gray-700 bg-[#0f1623] p-3"
                >
                  <label className="block text-gray-200 font-medium">
                    {q.prompt || "Untitled question"}
                  </label>

                  <div className="mt-2">
                    {q.type === "mcq" && (
                      <div className="space-y-2">
                        {(q.options || []).map((opt, i) => (
                          <label
                            key={i}
                            className="flex items-center gap-2 text-gray-200"
                          >
                            <input
                              type="radio"
                              name={`mcq-${sIdx}-${qIdx}`}
                              className="accent-blue-600"
                              disabled
                            />
                            <span>
                              {opt || <em className="opacity-70">empty</em>}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {q.type === "numeric" && (
                      <div className="space-y-1">
                        <input
                          type="number"
                          className="w-full rounded bg-white/5 border border-white/10 px-3 py-2 outline-none"
                          min={q.min ?? undefined}
                          max={q.max ?? undefined}
                          placeholder="Enter a number"
                          disabled
                        />
                        {(q.min != null || q.max != null) && (
                          <p className="text-xs text-gray-400">
                            Allowed range:{" "}
                            <span className="text-gray-300">
                              {q.min != null ? q.min : "—"} –{" "}
                              {q.max != null ? q.max : "—"}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    {q.type === "text" && (
                      <div className="space-y-1">
                        <input
                          type="text"
                          className="w-full rounded bg-white/5 border border-white/10 px-3 py-2 outline-none"
                          maxLength={q.maxLength ?? 200}
                          placeholder="Type your answer"
                          disabled
                        />
                        <p className="text-xs text-gray-400">
                          Max length:{" "}
                          <span className="text-gray-300">
                            {q.maxLength ?? 200}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </fieldset>
        ))}
      </form>
    </div>
  );
}
