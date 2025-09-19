import { useEffect, useState } from "react";
import { X, Plus, Trash2, GripVertical, CheckCircle2, CircleX, Sparkles } from "lucide-react";
import AssessmentCandidateView from "./AssessmentCandidateView";

export default function AssessmentFormModal({ open, initialData, onClose, onSaved }) {
  const isEdit = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title || "");
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [sections, setSections] = useState(() => {
    if (Array.isArray(initialData?.sections)) return normalizeSections(initialData.sections);
    return [makeSection(1)];
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(initialData?.title || "");
    setJobTitle(initialData?.jobTitle || "");
    setDescription(initialData?.description || "");
    setSections(
      Array.isArray(initialData?.sections)
        ? normalizeSections(initialData.sections)
        : [makeSection(1)]
    );
    setError("");
    setSaving(false);
  }, [open, initialData]);

  const questionTypes = [
    { value: "mcq", label: "MCQ (Single Choice)" },
    { value: "numeric", label: "Numeric (Range/Value)" },
    { value: "text", label: "Text (Exact Match)" },
  ];

  /** ---------- helpers ---------- */
  function makeSection(n) {
    return { id: crypto.randomUUID(), title: `Section ${n}`, questions: [] };
  }
  function normalizeSections(list) {
    return (list || []).map((s, i) => ({
      id: s.id ?? crypto.randomUUID(),
      title: s.title || `Section ${i + 1}`,
      questions: (s.questions || []).map((q) => ({
        id: q.id ?? crypto.randomUUID(),
        type: q.type || "mcq",
        prompt: q.prompt || "",
        options: Array.isArray(q.options) ? q.options : ["Option A", "Option B"],
        correct: typeof q.correct === "number" ? q.correct : 0,
        min: q.min ?? null,
        max: q.max ?? null,
        maxLength: q.maxLength ?? 200,
      })),
    }));
  }

  function addSection() {
    setSections((prev) => [...prev, makeSection(prev.length + 1)]);
  }
  function removeSection(idx) {
    setSections((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateSectionTitle(idx, val) {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, title: val } : s)));
  }

  function addQuestion(sectionIdx) {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== sectionIdx) return s;
        const q = {
          id: crypto.randomUUID(),
          type: "mcq",
          prompt: "",
          options: ["Option A", "Option B"],
          correct: 0,
          min: null,
          max: null,
          maxLength: 200,
        };
        return { ...s, questions: [...s.questions, q] };
      })
    );
  }
  function removeQuestion(sectionIdx, qIdx) {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== sectionIdx) return s;
        return { ...s, questions: s.questions.filter((_, j) => j !== qIdx) };
      })
    );
  }
  function updateQuestion(sectionIdx, qIdx, patch) {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== sectionIdx) return s;
        const qs = s.questions.map((q, j) => (j === qIdx ? { ...q, ...patch } : q));
        return { ...s, questions: qs };
      })
    );
  }
  function addOption(sectionIdx, qIdx) {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== sectionIdx) return s;
        const qs = s.questions.map((q, j) => {
          if (j !== qIdx) return q;
          const next = [...(q.options || [])];
          next.push(`Option ${String.fromCharCode(65 + next.length)}`);
          return { ...q, options: next };
        });
        return { ...s, questions: qs };
      })
    );
  }
  function updateOption(sectionIdx, qIdx, optIdx, val) {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== sectionIdx) return s;
        const qs = s.questions.map((q, j) => {
          if (j !== qIdx) return q;
          const next = [...(q.options || [])];
          next[optIdx] = val;
          return { ...q, options: next };
        });
        return { ...s, questions: qs };
      })
    );
  }
  function removeOption(sectionIdx, qIdx, optIdx) {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== sectionIdx) return s;
        const qs = s.questions.map((q, j) => {
          if (j !== qIdx) return q;
          const next = (q.options || []).filter((_, k) => k !== optIdx);
          let correct = q.correct ?? 0;
          if (correct >= next.length) correct = Math.max(0, next.length - 1);
          return { ...q, options: next, correct };
        });
        return { ...s, questions: qs };
      })
    );
  }

  /** Quick-fill: build 2 sections x 10 questions = 20 */
  function quickFillTemplate() {
    const mkId = () => crypto.randomUUID();
    const mkMC = (prompt, opts, correct) => ({ id: mkId(), type: "mcq", prompt, options: opts, correct });
    const mkNum = (prompt, min, max, correct) => ({ id: mkId(), type: "numeric", prompt, min, max, correct });
    const mkTxt = (prompt, correct, maxLength = 200) => ({ id: mkId(), type: "text", prompt, correct, maxLength });

    const S1 = {
      id: mkId(),
      title: "Section 1",
      questions: [
        mkMC("React state updates are:", ["Synchronous", "Asynchronous/batched", "Blocking", "Always synchronous"], 1),
        mkMC("Key prop helps React to:", ["Bind events", "Track identity", "Style elements", "Boost CSS"], 1),
        mkMC("useMemo is for:", ["Side-effects", "Memoizing expensive calc", "Avoiding all re-renders", "Replacing vars"], 1),
        mkMC("Context API avoids:", ["Hooks", "Prop-drilling", "Effects", "Events"], 1),
        mkMC("Strict equality === checks:", ["Value", "Type", "Value & Type", "Reference only"], 2),
        mkMC("Which is NOT truthy?", ["[]", "{}", "0", "\"0\""], 2),
        mkNum("HTTP Created status code?", 100, 600, 201),
        mkTxt("Hook to store mutable value without re-render:", "useRef", 40),
        mkTxt("Event loop queue for Promises (two words):", "microtask queue", 40),
        mkMC("Offline large structured store:", ["localStorage", "IndexedDB", "Cookies", "sessionStorage"], 1),
      ],
    };

    const S2 = {
      id: mkId(),
      title: "Section 2",
      questions: [
        mkMC("Binary search average time:", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], 1),
        mkMC("Merge sort space:", ["O(1)", "O(log n)", "O(n)", "O(n^2)"], 2),
        mkMC("Trie is used for:", ["Prefix search", "Graph coloring", "Matrix expo", "Path compression"], 0),
        mkMC("Topological sort applies to:", ["Cyclic", "DAG", "Trees", "Complete graphs"], 1),
        mkMC("ACID: I =", ["Isolation", "Indexing", "Integrity", "Inversion"], 0),
        mkMC("CSP mainly defends against:", ["CSRF", "XSS", "SQLi", "DDoS"], 1),
        mkNum("Default HTTPS port:", 1, 65535, 443),
        mkTxt("Header that controlled framing (now CSP):", "x-frame-options", 40),
        mkMC("SameSite=Lax cookies:", ["Always sent", "Never sent", "Sent on top-level GET but not most cross-site POSTs", "Only with POST"], 2),
        mkMC("HTTP 304:", ["Permanent redirect", "Not Modified", "Partial content", "Bad request"], 1),
      ],
    };

    if (!title) setTitle("New Live Assessment");
    if (!jobTitle) setJobTitle("Generalist SWE");
    if (!description) setDescription("Auto-generated 20-question template. Edit anything before saving.");
    setSections([S1, S2]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const payload = {
      title: title.trim(),
      jobTitle: jobTitle.trim() || "Unknown Job",
      description: description.trim(),
      sections,
      status: "live", // ✅ ensure new assessments appear with Live tag
    };

    if (!payload.title) {
      setError("Title is required");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(
        isEdit ? `/api/assessments/${initialData.id}` : `/api/assessments`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Failed to ${isEdit ? "update" : "create"} assessment`);
      }
      const saved = await res.json();
      onSaved?.(saved);
      onClose?.();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-6xl max-h-[92vh] overflow-auto rounded-2xl bg-[#0f1623] border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-gray-700 bg-[#0f1623]">
          <div className="text-white font-semibold">
            {isEdit ? "Edit Assessment" : "Create Assessment"}
          </div>
          <div className="flex items-center gap-2">
            {/* Quick-fill 20Q template */}
            {!isEdit && (
              <button
                type="button"
                onClick={quickFillTemplate}
                className="inline-flex items-center gap-2 px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
                title="Auto-create 20 questions (you can still edit)"
              >
                <Sparkles className="w-4 h-4" />
                20-Q Template
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-800 text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-6">
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          {/* Basic fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-white/20"
                placeholder="e.g., Frontend Screening"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full rounded bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-white/20"
                placeholder="e.g., Senior Frontend Developer"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-white/20 resize-y"
                placeholder="Optional short intro for candidates"
              />
            </div>
          </div>

          {/* Sections & Questions Editor */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Sections & Questions</h3>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-2 px-3 py-2 rounded bg-white/10 text-gray-100 border border-white/10 hover:bg-white/20"
              >
                <Plus className="w-4 h-4" /> Add Section
              </button>
            </div>

            {sections.map((s, sIdx) => (
              <fieldset key={s.id} className="rounded-xl border border-gray-700 bg-[#121a27] p-4">
                <legend className="px-1 text-gray-100 font-semibold">Section {sIdx + 1}</legend>

                <div className="mt-3 grid md:grid-cols-[1fr_auto] gap-3">
                  <input
                    type="text"
                    value={s.title}
                    onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                    className="rounded bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-white/20"
                    placeholder="Section title (e.g., Basics)"
                  />
                  <button
                    type="button"
                    onClick={() => removeSection(sIdx)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-rose-600/90 hover:bg-rose-600 text-white"
                  >
                    <Trash2 className="w-4 h-4" /> Remove Section
                  </button>
                </div>

                {/* Questions */}
                <ul className="mt-4 space-y-4">
                  {s.questions.map((q, qIdx) => (
                    <li key={q.id} className="rounded-lg border border-white/10 bg-white/5">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                        <div className="inline-flex items-center gap-2 text-gray-200">
                          <GripVertical className="w-4 h-4 opacity-60" />
                          <span className="text-sm font-medium">Q{qIdx + 1}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-xs text-gray-300">
                            Type
                            <select
                              value={q.type}
                              onChange={(e) =>
                                updateQuestion(sIdx, qIdx, { type: e.target.value })
                              }
                              className="ml-2 rounded bg-[#353c47] border border-white/10 px-2 py-1 text-gray-100"
                            >
                              {questionTypes.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button
                            type="button"
                            onClick={() => removeQuestion(sIdx, qIdx)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 text-gray-100 border border-white/10 hover:bg-white/20"
                            title="Delete question"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="p-3 space-y-3">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Prompt</label>
                          <input
                            type="text"
                            value={q.prompt}
                            onChange={(e) =>
                              updateQuestion(sIdx, qIdx, { prompt: e.target.value })
                            }
                            className="w-full rounded bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-white/20"
                            placeholder="Type the question text"
                          />
                        </div>

                        {q.type === "mcq" && (
                          <div className="space-y-3">
                            <div className="text-sm text-gray-300">Options & Answer</div>
                            <ul className="space-y-2">
                              {(q.options || []).map((opt, i) => {
                                const isCorrect = q.correct === i;
                                return (
                                  <li
                                    key={i}
                                    className={`flex items-center gap-2 p-2 rounded border ${
                                      isCorrect
                                        ? "border-emerald-500/40 bg-emerald-500/10"
                                        : "border-white/10 bg-white/5"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`correct-${sIdx}-${qIdx}`}
                                      checked={isCorrect}
                                      onChange={() => updateQuestion(sIdx, qIdx, { correct: i })}
                                      className="accent-emerald-500"
                                      title="Mark as correct"
                                    />
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => updateOption(sIdx, qIdx, i, e.target.value)}
                                      className="flex-1 rounded bg-white/0 border border-white/10 px-3 py-2 text-white outline-none focus:border-white/20"
                                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeOption(sIdx, qIdx, i)}
                                      className="p-2 rounded bg-white/10 text-gray-100 border border-white/10 hover:bg-white/20"
                                      title="Remove option"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                    {isCorrect ? (
                                      <span className="inline-flex items-center gap-1 text-emerald-300 text-xs">
                                        <CheckCircle2 className="w-4 h-4" /> correct
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-gray-400 text-xs">
                                        <CircleX className="w-4 h-4" /> mark correct
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                            <button
                              type="button"
                              onClick={() => addOption(sIdx, qIdx)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded bg-white/10 text-gray-100 border border-white/10 hover:bg-white/20"
                            >
                              <Plus className="w-4 h-4" /> Add Option
                            </button>
                          </div>
                        )}

                        {q.type === "numeric" && (
                          <div className="grid sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Min</label>
                              <input
                                type="number"
                                value={q.min ?? ""}
                                onChange={(e) =>
                                  updateQuestion(sIdx, qIdx, {
                                    min: e.target.value === "" ? null : Number(e.target.value),
                                  })
                                }
                                className="w-full rounded bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-white/20"
                                placeholder="e.g., 0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Max</label>
                              <input
                                type="number"
                                value={q.max ?? ""}
                                onChange={(e) =>
                                  updateQuestion(sIdx, qIdx, {
                                    max: e.target.value === "" ? null : Number(e.target.value),
                                  })
                                }
                                className="w-full rounded bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-white/20"
                                placeholder="e.g., 100"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Correct</label>
                              <input
                                type="number"
                                value={q.correct ?? ""}
                                onChange={(e) =>
                                  updateQuestion(sIdx, qIdx, {
                                    correct: e.target.value === "" ? null : Number(e.target.value),
                                  })
                                }
                                className="w-full rounded bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-white/20"
                                placeholder="Exact value"
                              />
                            </div>
                          </div>
                        )}

                        {q.type === "text" && (
                          <div className="grid sm:grid-cols-[2fr_1fr] gap-3">
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Correct Text</label>
                              <input
                                type="text"
                                value={q.correct ?? ""}
                                onChange={(e) =>
                                  updateQuestion(sIdx, qIdx, { correct: e.target.value })
                                }
                                className="w-full rounded bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-white/20"
                                placeholder="Case-insensitive exact match"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Max Length</label>
                              <input
                                type="number"
                                value={q.maxLength ?? 200}
                                onChange={(e) =>
                                  updateQuestion(sIdx, qIdx, {
                                    maxLength:
                                      e.target.value === "" ? 200 : Number(e.target.value),
                                  })
                                }
                                className="w-full rounded bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-white/20"
                                placeholder="e.g., 200"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => addQuestion(sIdx)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" /> Add Question
                  </button>
                </div>
              </fieldset>
            ))}
          </div>

          {/* Live Preview */}
          <div className="mt-8 border-t border-white/10 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Live Preview</h3>
              <span className="text-xs text-gray-400">
                Exactly how candidates will see it (inputs disabled).
              </span>
            </div>

            <div className="rounded-2xl border border-gray-700 bg-[#0f1623] p-4">
              <AssessmentCandidateView
                title={title}
                jobTitle={jobTitle || "Unknown Job"}
                description={description}
                sections={sections}
                readOnly
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-white/10 text-gray-100 border border-white/10 hover:bg-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
