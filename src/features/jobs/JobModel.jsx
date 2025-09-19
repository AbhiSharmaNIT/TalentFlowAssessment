import React from "react";
import { X } from "lucide-react";

export default function JobModal({
  open,
  mode = "create",         // "create" | "edit"
  saving,
  form,
  errors,
  setForm,
  setOpen,
  submit,
}) {
  if (!open) return null;

  const titleText = mode === "edit" ? "Edit Job" : "Create New Job";
  const buttonText = mode === "edit" ? "Save Changes" : "Create Job";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-2xl rounded-xl bg-gray-900 border border-gray-700 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">{titleText}</h3>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded hover:bg-gray-800 text-gray-300"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {errors?.form && <div className="text-sm text-red-400">{errors.form}</div>}

          {/* Title & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Job Title *</label>
              <input
                className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                value={form.title || ""}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Senior Frontend Engineer"
              />
              {errors?.title && <p className="text-xs text-red-400">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Department</label>
              <input
                className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                value={form.department || ""}
                onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))}
                placeholder="e.g., Engineering"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Job Description</label>
            <textarea
              className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
              rows={3}
              value={form.description || ""}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Type, Level, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Type</label>
              <select
                className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                value={form.type || "Full Time"}
                onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
              >
                <option>Full Time</option>
                <option>Part Time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Level</label>
              <select
                className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                value={form.level || "Mid"}
                onChange={(e) => setForm(f => ({ ...f, level: e.target.value }))}
              >
                <option>Junior</option>
                <option>Mid</option>
                <option>Senior</option>
                <option>Lead</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Status</label>
              <select
                className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                value={form.status || "active"}
                onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Location + Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Location</label>
              <input
                className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                value={form.location || ""}
                onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g., Remote"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Min Salary</label>
              <input
                type="number"
                className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                value={form.minSalary ?? ""}
                onChange={(e) => setForm(f => ({ ...f, minSalary: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Max Salary</label>
              <input
                type="number"
                className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                value={form.maxSalary ?? ""}
                onChange={(e) => setForm(f => ({ ...f, maxSalary: e.target.value }))}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Tags</label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                placeholder="Add tag and press Enter..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val) {
                      setForm(f => ({ ...f, tags: [...(f.tags || []), val] }));
                      e.currentTarget.value = "";
                    }
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(form.tags || []).map((tag, i) => (
                <span key={i} className="px-2 py-1 text-sm bg-blue-600 text-white rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Requirements</label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                placeholder="Add requirement and press Enter..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val) {
                      setForm(f => ({ ...f, requirements: [...(f.requirements || []), val] }));
                      e.currentTarget.value = "";
                    }
                  }
                }}
              />
            </div>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              {(form.requirements || []).map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-700 flex items-center justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-800 text-gray-200 border border-gray-700"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
            onClick={submit}
            disabled={saving}
          >
            {saving ? "Saving..." : buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
