// src/features/jobs/FilterUI.jsx
import { useEffect, useRef, useState } from "react";

export default function FilterUI({
  value = { search: "", status: "All Status", type: "All Types" },
  onChange,
  debounceMs = 350,
}) {
  const [searchTerm, setSearchTerm] = useState(value.search ?? "");
  const [statusFilter, setStatusFilter] = useState(value.status ?? "All Status");
  const [typeFilter, setTypeFilter] = useState(value.type ?? "All Types");
  const firstRun = useRef(true);

  useEffect(() => {
    const payload = { search: searchTerm, status: statusFilter, type: typeFilter };
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const same =
      (value.search ?? "") === (payload.search ?? "") &&
      (value.status ?? "All Status") === (payload.status ?? "All Status") &&
      (value.type ?? "All Types") === (payload.type ?? "All Types");
    if (same) return;
    const id = setTimeout(() => onChange?.(payload), debounceMs);
    return () => clearTimeout(id);
  }, [searchTerm, statusFilter, typeFilter, debounceMs, onChange, value.search, value.status, value.type]);

  useEffect(() => {
    setSearchTerm(value.search ?? "");
    setStatusFilter(value.status ?? "All Status");
    setTypeFilter(value.type ?? "All Types");
  }, [value.search, value.status, value.type]);

  return (
    <div
      className="
        bg-gray-800 p-4 rounded-lg
        flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4
      "
    >
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search jobs by title, department, or tags..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full sm:flex-1 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
      />

      {/* Status Filter */}
      <div className="relative w-full sm:w-auto">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-[180px] px-4 py-2 pr-8 bg-gray-700 text-white rounded appearance-none focus:outline-none"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Archived</option>
          <option>Closed</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Type Filter */}
      <div className="relative w-full sm:w-auto">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full sm:w-[160px] px-4 py-2 pr-8 bg-gray-700 text-white rounded appearance-none focus:outline-none"
        >
          <option>All Types</option>
          <option>Full Time</option>
          <option>Part Time</option>
          <option>Contract</option>
        </select>
      </div>
    </div>
  );
}
