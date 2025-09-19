// src/features/assessments/AssessmentQuizModal.jsx
import { useEffect, useMemo, useState } from "react";
import { X, CheckCircle2, CircleX, RotateCcw } from "lucide-react";

/* ---------------- helpers ---------------- */
const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[ri(0, arr.length - 1)];
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const STACK = [
  "React","TypeScript","JavaScript","HTML","CSS","Node.js","Express","MongoDB","SQL",
  "Docker","Kubernetes","AWS","GCP","Azure","Git","CI/CD","Data Structures","Algorithms","OS","DBMS",
];

function makeMCQ(id) {
  const tech = pick(STACK);
  const correct = tech;
  const pool = shuffle(STACK.filter((t) => t !== correct)).slice(0, 3);
  const options = shuffle([correct, ...pool]);
  return {
    id,
    type: "mcq",
    prompt: `Which of the following is most closely related to ${tech}?`,
    options,
    correct: options.indexOf(correct),
  };
}

function makeNumeric(id) {
  const n = ri(6, 40);
  const a = ri(2, 9);
  const ans = a * n;
  return {
    id,
    type: "numeric",
    prompt: `Compute ${a} × ${n}`,
    correct: ans,
  };
}

function makeText(id) {
  const word = pick(["closure","memoization","immutable","polymorphism","idempotent"]);
  return {
    id,
    type: "text",
    prompt: `Type the keyword: ${word.toUpperCase()}`,
    correct: word.toLowerCase(),
    maxLength: 40,
  };
}

function buildQuestionSet() {
  const items = [];
  for (let i = 0; i < 10; i++) items.push(makeMCQ(`q-m-${i}`));
  for (let i = 0; i < 5; i++) items.push(makeNumeric(`q-n-${i}`));
  for (let i = 0; i < 5; i++) items.push(makeText(`q-t-${i}`));
  return shuffle(items).slice(0, 20);
}

/* ---------------- component ---------------- */
export default function AssessmentQuizModal({ open, onClose, assessment }) {
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const questions = useMemo(buildQuestionSet, []); // fixed per open

  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setAnswers({});
    }
  }, [open]);

  if (!open) return null;

  const title = assessment?.title || "Preview Quiz";
  const jobTitle = assessment?.jobTitle || "Unknown Job";
  const description =
    assessment?.description ||
    "This is a dummy quiz generated for preview. Your answers are not stored.";

  function score() {
    let correct = 0;
    questions.forEach((q) => {
      const val = answers[q.id];
      if (q.type === "mcq") {
        if (typeof val === "number" && val === q.correct) correct++;
      } else if (q.type === "numeric") {
        if (val !== "" && val != null && Number(val) === Number(q.correct)) correct++;
      } else if (q.type === "text") {
        const norm = (val ?? "").toString().trim().toLowerCase();
        if (norm && norm === q.correct) correct++;
      }
    });
    const total = questions.length;
    return { correct, total, percent: Math.round((correct / total) * 100) };
  }

  const { correct, total, percent } = score();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* modal */}
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-auto rounded-2xl bg-[#0f1623] border border-gray-700 shadow-2xl">
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-gray-700 bg-[#0f1623]">
          <div>
            <div className="text-white font-semibold">{title}</div>
            <div className="text-xs text-[#e6dc95]">{jobTitle}</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-800 text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* intro */}
        <div className="px-5 pt-4 text-gray-200">
          <p>{description}</p>
        </div>

        {/* body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="px-5 py-5 space-y-5"
        >
          {questions.map((q, idx) => (
            <fieldset key={q.id} className="rounded-xl border border-gray-700 bg-[#121a27] p-4">
              <legend className="px-1 text-gray-100 font-semibold mb-3">
                Q{idx + 1}. {q.prompt}
              </legend>

              {q.type === "mcq" && (
                <ul className="space-y-2">
                  {q.options.map((opt, i) => {
                    const picked = answers[q.id] === i;
                    const right = submitted && i === q.correct;
                    const wrong = submitted && picked && i !== q.correct;
                    return (
                      <li key={i}>
                        <label
                          className={[
                            "flex items-center justify-between gap-2 rounded-md px-3 py-2 border",
                            picked ? "border-blue-500/40 bg-blue-500/10" : "border-white/10 bg-white/5",
                            right ? "ring-1 ring-emerald-400/50" : "",
                            wrong ? "ring-1 ring-rose-400/50" : "",
                          ].join(" ")}
                        >
                          <span className="flex items-center gap-2 text-gray-100">
                            <input
                              type="radio"
                              className="accent-blue-600"
                              name={`q-${q.id}`}
                              checked={picked}
                              onChange={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                              disabled={submitted}
                            />
                            {opt}
                          </span>

                          {right && (
                            <span className="inline-flex items-center gap-1 text-emerald-300 text-xs">
                              <CheckCircle2 className="w-4 h-4" /> Correct
                            </span>
                          )}
                          {wrong && (
                            <span className="inline-flex items-center gap-1 text-rose-300 text-xs">
                              <CircleX className="w-4 h-4" /> Wrong
                            </span>
                          )}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}

              {q.type === "numeric" && (
                <div className="space-y-2">
                  <input
                    type="number"
                    className="w-full rounded bg-white/5 border border-white/10 px-3 py-2 outline-none text-gray-100"
                    value={answers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((a) => ({
                        ...a,
                        [q.id]: e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    disabled={submitted}
                    placeholder="Enter a number"
                  />
                  {submitted && (
                    <p className="text-xs">
                      Correct answer:{" "}
                      <span className="text-emerald-300 font-semibold">{q.correct}</span>
                    </p>
                  )}
                </div>
              )}

              {q.type === "text" && (
                <div className="space-y-2">
                  <input
                    type="text"
                    className="w-full rounded bg-white/5 border border-white/10 px-3 py-2 outline-none text-gray-100"
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                    maxLength={q.maxLength ?? 40}
                    disabled={submitted}
                    placeholder="Type your answer"
                  />
                  <p className="text-xs text-gray-400">Case-insensitive exact match.</p>
                  {submitted && (
                    <p className="text-xs">
                      Correct answer:{" "}
                      <span className="text-emerald-300 font-semibold">{q.correct}</span>
                    </p>
                  )}
                </div>
              )}
            </fieldset>
          ))}

          {/* footer */}
          <div className="sticky bottom-0 z-10 bg-[#0f1623] border-t border-white/10 -mx-5 px-5 pt-4 pb-5 flex items-center justify-between">
            {!submitted ? (
              <>
                <div className="text-sm text-gray-400">Answer all you can. You can submit anytime.</div>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">
                  Submit
                </button>
              </>
            ) : (
              <>
                <div className="text-sm">
                  <span className="text-gray-300">Score: </span>
                  <span className="font-semibold text-white">
                    {correct}/{total} ({percent}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setAnswers({});
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded bg-white/10 text-gray-100 border border-white/10 hover:bg-white/20"
                  >
                    <RotateCcw className="w-4 h-4" /> Retake
                  </button>
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
