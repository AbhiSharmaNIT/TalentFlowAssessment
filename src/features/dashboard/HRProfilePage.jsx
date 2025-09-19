// src/features/dashboard/HRProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CalendarDays,
  Building2,
  Edit3,
  X,
  Save,
  Image as ImageIcon,
  AtSign,
  User2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LS_KEY = "tf_hr_profile_v1";

/** Utility: format YYYY-MM-DD -> "Mar 12, 2023" */
function fmtPrettyDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso; // fall back
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
/** Utility: coerce "Mar 12, 2023" -> YYYY-MM-DD when possible */
function toISODateMaybe(s) {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d)) return s;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function HRProfilePage() {
  const navigate = useNavigate();

  // Default profile (example values)
  const defaults = useMemo(
    () => ({
      name: "Anna Vitcent",
      role: "HR / Talent Acquisition",
      email: "anna.vitcent@brightflow.example",
      phone: "+91-98765-43210",
      location: "Bengaluru, IN",
      department: "People Operations",
      company: "BrightFlow Labs",
      joinedISO: toISODateMaybe("Mar 12, 2023"), // ISO for date input
      avatar: "https://i.pravatar.cc/200?img=47",
      about:
        "Talent partner focused on building diverse, high-performing teams across Engineering and Product.",
    }),
    []
  );

  const [profile, setProfile] = useState(defaults);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setProfile((p) => ({ ...p, ...parsed }));
      }
    } catch {}
  }, []);

  // Modal + draft state
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(profile);

  function openEditor() {
    setDraft(profile);
    setOpen(true);
  }
  function cancelEdit() {
    setOpen(false);
  }
  function saveEdit(e) {
    e?.preventDefault?.();
    const next = {
      ...draft,
      joinedISO: draft.joinedISO || "",
    };
    setProfile(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {}
    setOpen(false);
  }

  function handleUpdateClick(e) {
    // For now, same as saveEdit; can be extended for API call or toast
    saveEdit(e);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Candidates
        </button>
      </div>

      {/* Cover banner */}
      <div className="h-36 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 shadow-lg ring-1 ring-white/10" />

      {/* Profile card */}
      <div className="-mt-12 rounded-2xl bg-[#121826] border border-white/10 shadow-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-24 w-24 rounded-2xl object-cover ring-2 ring-white/20"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <p className="text-white/80">
                {profile.role} — {profile.company}
              </p>
              <p className="text-sm text-gray-400">{profile.department}</p>
            </div>
          </div>

          <button
            onClick={openEditor}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm"
            title="Edit profile"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        </div>

        {/* Info grid */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <InfoRow icon={<AtSign className="w-4 h-4" />} label="Name" value={profile.name} />
          <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Role" value={profile.role} />
          <InfoRow icon={<Building2 className="w-4 h-4" />} label="Company" value={profile.company} />

          <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={profile.email} />
          <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={profile.phone} />
          <InfoRow icon={<MapPin className="w-4 h-4" />} label="Location" value={profile.location} />

          <InfoRow icon={<User2 className="w-4 h-4" />} label="Department" value={profile.department} />
          <InfoRow
            icon={<CalendarDays className="w-4 h-4" />}
            label="Joined"
            value={fmtPrettyDate(profile.joinedISO)}
          />
          <InfoRow icon={<ImageIcon className="w-4 h-4" />} label="Avatar URL" value={profile.avatar} />
        </div>

        {/* About */}
        <div className="mt-6">
          <h2 className="text-white font-semibold mb-2">About</h2>
          <p className="text-white/80 leading-6 whitespace-pre-wrap">{profile.about}</p>
        </div>
      </div>

      {/* Edit Modal */}
      {open && (
        <div
          className="fixed inset-0 z-40 grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={cancelEdit}
          />
          {/* Panel */}
          <form
            onSubmit={saveEdit}
            className="
              relative z-10 w-full max-w-3xl
              rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl
              flex flex-col max-h-[90vh]
            "
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <h3 className="text-white font-semibold">Edit HR Profile</h3>
              <button
                type="button"
                onClick={cancelEdit}
                className="p-2 rounded-lg hover:bg-white/10 text-white/80"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="px-5 py-4 space-y-5 overflow-y-auto flex-1">
              {/* Avatar preview */}
              <div className="flex items-center gap-4">
                <img
                  src={draft.avatar}
                  alt="Avatar preview"
                  className="h-16 w-16 rounded-xl object-cover ring-2 ring-white/20"
                />
                <div className="text-sm text-gray-300">
                  <div className="font-medium">Avatar Preview</div>
                  <div className="text-gray-400">
                    Paste an image URL below to change.
                  </div>
                </div>
              </div>

              {/* Fields grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <Field
                  id="name"
                  label="Full Name"
                  value={draft.name}
                  onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
                  icon={<AtSign className="w-4 h-4" />}
                />
                <Field
                  id="role"
                  label="Role / Title"
                  value={draft.role}
                  onChange={(v) => setDraft((d) => ({ ...d, role: v }))}
                  icon={<Briefcase className="w-4 h-4" />}
                />
                <Field
                  id="company"
                  label="Company"
                  value={draft.company}
                  onChange={(v) => setDraft((d) => ({ ...d, company: v }))}
                  icon={<Building2 className="w-4 h-4" />}
                />
                <Field
                  id="department"
                  label="Department"
                  value={draft.department}
                  onChange={(v) => setDraft((d) => ({ ...d, department: v }))}
                  icon={<User2 className="w-4 h-4" />}
                />
                <Field
                  id="email"
                  type="email"
                  label="Email"
                  value={draft.email}
                  onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
                  icon={<Mail className="w-4 h-4" />}
                />
                <Field
                  id="phone"
                  label="Phone"
                  value={draft.phone}
                  onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
                  icon={<Phone className="w-4 h-4" />}
                />
                <Field
                  id="location"
                  label="Location"
                  value={draft.location}
                  onChange={(v) => setDraft((d) => ({ ...d, location: v }))}
                  icon={<MapPin className="w-4 h-4" />}
                />
                <Field
                  id="joinedISO"
                  type="date"
                  label="Joined"
                  value={draft.joinedISO || ""}
                  onChange={(v) => setDraft((d) => ({ ...d, joinedISO: v }))}
                  icon={<CalendarDays className="w-4 h-4" />}
                />
                <Field
                  id="avatar"
                  label="Avatar Image URL"
                  value={draft.avatar}
                  onChange={(v) => setDraft((d) => ({ ...d, avatar: v }))}
                  icon={<ImageIcon className="w-4 h-4" />}
                  placeholder="https://…"
                />
              </div>

              {/* About */}
              <div>
                <label
                  htmlFor="about"
                  className="block text-sm text-gray-300 mb-2"
                >
                  About
                </label>
                <textarea
                  id="about"
                  value={draft.about}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, about: e.target.value }))
                  }
                  rows={6}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Write a short summary about the HR…"
                />
                <p className="mt-2 text-xs text-gray-400">
                  Use multiple lines—this field supports paragraphs.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex items-center justify-end gap-3 border-t border-white/10 bg-[#0f172a] shrink-0">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-3 py-2 rounded-lg border border-white/10 text-white/80 hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Save className="w-4 h-4" /> Save
              </button>

              <button
                type="button"
                onClick={handleUpdateClick}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <CheckCircle2 className="w-4 h-4" /> Update
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-sm text-gray-300">
        {icon} <span className="uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-1 text-white break-words">{value || "—"}</div>
    </div>
  );
}

function Field({ id, label, value, onChange, icon, type = "text", placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-gray-300 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
        {icon}
        <input
          id={id}
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-white placeholder:text-gray-400 outline-none"
        />
      </div>
    </div>
  );
}
