// src/features/candidates/CandidateProfile.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  UserRound,
  Briefcase,
  Link2,
  FileText,
  ArrowRight,
} from "lucide-react";

/* ---------- helpers ---------- */
function initialsOf(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
function timeAgo(ts) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const yr = Math.floor(day / 365);
  if (yr >= 1) return `over ${yr} year${yr > 1 ? "s" : ""} ago`;
  if (day >= 1) return `${day} day${day > 1 ? "s" : ""} ago`;
  if (hr >= 1) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  if (min >= 1) return `${min} min ago`;
  return "just now";
}
function fmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function ensureArray(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") return v.split(/[,|/·]/g).map((s) => s.trim()).filter(Boolean);
  return [];
}

/* Timeline scaffolding */
const STAGE_ORDER = ["applied", "screening", "technical", "offer", "hired"];
const STAGE_LABEL = {
  applied: "Applied",
  screening: "Screening",
  technical: "Technical",
  offer: "Offer",
  hired: "Hired",
};
const STAGE_ICON = {
  applied: UserRound,
  screening: Clock,
  technical: Briefcase,
  offer: CheckCircle2,
  hired: CheckCircle2,
};

function buildTimeline(candidate) {
  const base = candidate?.appliedAtTS || Date.parse(candidate?.appliedAt || Date.now());
  const currentIdx = Math.max(0, STAGE_ORDER.indexOf((candidate?.stage || "applied").toLowerCase()));
  const items = [];
  for (let i = 0; i <= currentIdx; i++) {
    const key = STAGE_ORDER[i];
    const Icon = STAGE_ICON[key] || Clock;
    const ts = base + i * 24 * 60 * 60 * 1000;
    items.push({
      key,
      title: `Moved to ${STAGE_LABEL[key]}`,
      note:
        key === "applied"
          ? "Application submitted"
          : key === "screening"
          ? "Initial screening passed"
          : key === "technical"
          ? "Technical interview completed"
          : key === "offer"
          ? "Offer extended and accepted"
          : "Moved to hired",
      ts,
      Icon,
      // gradient stops; will be used with bg-gradient-to-br
      color:
        key === "applied"
          ? "from-blue-400 to-sky-500"
          : key === "screening"
          ? "from-violet-400 to-purple-500"
          : key === "technical"
          ? "from-cyan-400 to-teal-400"
          : key === "offer"
          ? "from-fuchsia-400 to-purple-400"
          : "from-emerald-400 to-green-400",
    });
  }
  return items.reverse();
}

/* Local notes persisted to localStorage so it survives refresh */
function useNotes(candidateId) {
  const key = `cand_notes_${candidateId}`;
  const [notes, setNotes] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(notes));
    } catch {}
  }, [key, notes]);
  return [notes, setNotes];
}

/* ---------- tiny UI bits ---------- */
const Card = ({ className = "", children }) => (
  <div
    className={[
      "rounded-2xl border border-white/10 bg-[#0b111a]/60 backdrop-blur-xl",
      "shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
      className,
    ].join(" ")}
  >
    {children}
  </div>
);

const Pill = ({ children, className = "" }) => (
  <span
    className={[
      "px-2.5 py-0.5 rounded-full text-xs",
      "border border-white/10 bg-white/5 text-yellow-300",
      className,
    ].join(" ")}
  >
    {children}
  </span>
);

/* ---------- page ---------- */
export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useNotes(id);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/candidates/${id}`);
        if (!r.ok) throw new Error("not found");
        const c = await r.json();
        if (alive) setCandidate(c);
      } catch {
        if (alive) setCandidate(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const timeline = useMemo(() => buildTimeline(candidate || {}), [candidate]);
  const skills = useMemo(() => ensureArray(candidate?.skills), [candidate]);

  function addNote() {
    const v = noteInput.trim();
    if (!v) return;
    setNotes((prev) => [{ id: crypto.randomUUID(), text: v, ts: Date.now(), author: "HR" }, ...prev]);
    setNoteInput("");
  }

  if (loading) {
    return (
      <div className="p-6 text-gray-300">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Candidates
        </button>
        <div className="mt-6 text-gray-400">Loading profile…</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-6 text-gray-300">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Candidates
        </button>
        <div className="mt-6 text-red-300">Candidate not found.</div>
      </div>
    );
  }

  const name = candidate.name || "Unnamed";
  const stage = (candidate.stage || "").toLowerCase();

  return (
    <div className="p-6 relative">
      {/* subtle glowing blob background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-16 w-80 h-80 rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-sky-500 to-indigo-500" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-15 bg-gradient-to-tr from-emerald-500 to-teal-400" />
      </div>

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Candidates
      </button>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Identity card */}
          <Card className="p-6 overflow-hidden relative">
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[120%] h-48 bg-white/10 blur-3xl rounded-full" />
            <div className="flex flex-col items-center text-center relative">
              {/* avatar with gradient ring */}
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500">
                <div className="w-28 h-28 rounded-full bg-[#0b111a] flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                    {candidate.initials || initialsOf(name)}
                  </div>
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-semibold text-yellow-300">{name}</h2>
              <div className="text-gray-400 mt-1">{candidate.jobTitle || "N/A"}</div>

              <div className="mt-3 flex items-center gap-2">
                <Pill
                  className={
                    stage === "hired"
                      ? "text-emerald-300 border-emerald-600/40 bg-emerald-500/10"
                      : stage === "rejected"
                      ? "text-rose-300 border-rose-600/40 bg-rose-500/10"
                      : "text-blue-200 border-blue-600/30 bg-blue-500/10"
                  }
                >
                  {stage}
                </Pill>
                {typeof candidate.experienceYears === "number" && (
                  <Pill className="text-sky-200 border-sky-600/30 bg-sky-500/10">
                    {candidate.experienceYears} yrs exp
                  </Pill>
                )}
                {candidate.location && (
                  <Pill className="text-teal-200 border-teal-600/30 bg-teal-500/10">
                    {candidate.location}
                  </Pill>
                )}
              </div>
            </div>
          </Card>

          {/* Contact info */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-yellow-300">Contact Information</h3>
            <div className="mt-4 space-y-3 text-gray-200">
              {candidate.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-sky-300" />
                  <span className="truncate">{candidate.email}</span>
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-sky-300" />
                  <span className="truncate">{candidate.phone}</span>
                </div>
              )}
              {candidate.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-sky-300" />
                  <span>{candidate.location}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Professional details */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-yellow-300">Professional Details</h3>
            <div className="mt-4 space-y-3 text-gray-200">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-sky-300" />
                <span>{candidate.experienceYears ?? "N/A"} years of experience</span>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((t, i) => (
                    <span
                      key={`${t}-${i}`}
                      className="px-2.5 py-1 rounded-full text-[11px] border border-yellow-700/40 bg-yellow-900/20 text-yellow-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Links */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-yellow-300">Links</h3>
            <div className="mt-4 space-y-3">
              <a
                href={candidate.linkedin || "#"}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-gray-100 hover:bg-white/10 transition"
              >
                <span className="inline-flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-blue-300" />
                  LinkedIn Profile
                </span>
                <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition" />
              </a>
              <a
                href={candidate.resumeUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-gray-100 hover:bg-white/10 transition"
              >
                <span className="inline-flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-300" />
                  View Resume
                </span>
                <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition" />
              </a>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card className="p-6">
            <div className="rounded-2xl bg-[#0f1623] border border-gray-700 shadow-lg p-6">
              <h3 className="text-2xl font-bold text-yellow-300">
                Activity Timeline
              </h3>

              <div className="mt-6 grid grid-cols-[1fr_auto] gap-x-6">
                <div className="relative">
                  {/* vertical line */}
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-700/70" />
                  <ul className="space-y-8">
                    {timeline.map((ev, i) => (
                      <li key={i} className="relative pl-10">
                         <div className="absolute left-1.5 top-0">
                        <div className={`p-[2px] rounded-full bg-gradient-to-br ${ev.color}`}>
                          <div className="w-8 h-8 rounded-full bg-[#0b111a] flex items-center justify-center text-white">
                            <ev.Icon className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                        <div className="text-gray-200 px-2">
                          <div className="font-semibold">
                            {ev.title.split(" ").slice(0, 2).join(" ")}{" "}
                            <span className="font-bold">
                              {ev.title.split(" ").slice(2).join(" ")}
                            </span>
                          </div>
                          <div className="text-gray-400 italic">{ev.note}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-right text-gray-300">
                <ul className="space-y-8">
                  {timeline.map((ev, i) => (
                    <li key={i}>
                      <span className="inline-block px-2 py-1 rounded-md text-[12px] bg-white/5 border border-white/10">
                        {fmtDate(ev.ts)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              </div>
            </div>
          </Card>


          {/* Notes */}
          <Card className="p-6">
            <h3 className="text-2xl font-bold text-yellow-300">Notes</h3>

            <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-start gap-3">
              <div className="flex-1">
                <div className="rounded-lg border border-white/10 bg-white/5 focus-within:ring-2 focus-within:ring-yellow-400/60">
                  <textarea
                    className="w-full min-h-[120px] rounded-lg bg-transparent text-gray-100 p-3 outline-none"
                    placeholder="Add a note... Use @ to mention colleagues (e.g. @john.doe)"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={addNote}
                className="px-4 py-3 rounded-md border bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700 self-end md:self-start"
              >
                Add Note
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {notes.length === 0 && <div className="text-gray-400">No notes yet.</div>}
              {notes.map((n) => (
                <div key={n.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-700/30 text-yellow-300 flex items-center justify-center font-semibold">
                    {n.author?.[0] || "N"}
                  </div>
                  <div className="flex-1">
                    <div className="text-yellow-300 font-semibold">
                      {n.author || "HR"}{" "}
                      <span className="text-gray-400 font-normal">
                        {new Date(n.ts).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-gray-200">{n.text}</div>
                  </div>
                  <div className="text-gray-500 text-sm">{timeAgo(n.ts)}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
