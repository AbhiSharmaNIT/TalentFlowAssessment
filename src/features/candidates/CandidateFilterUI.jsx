// src/features/candidates/components/CandidateFilterUI.jsx
import { Search } from "lucide-react";
import { useMemo } from "react";

const STAGE_OPTIONS = [
  "All Stages",
  "Applied",
  "Screening",
  "Technical",
  "Offer",
  "Hired",
  "Rejected",
];

export default function CandidateFilterUI({ value, onChange, jobOptions = ["All Jobs"] }) {
  const jobs = useMemo(() => jobOptions, [jobOptions]);

  return (
    <div className="bg-[#2b272673] border border-gray-700 rounded-xl p-3">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-300/70" />
          <input
            type="text"
            placeholder="Search candidates by name or email..."
            className="w-full pl-9 pr-3 py-2 rounded-md bg-[#444343] text-pink-200 placeholder-gray-300/60 border border-[#79706b] focus:outline-none"
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
          />
        </div>

        <select
          className="sm:w-52 px-3 py-2 rounded-md bg-[#444343]  text-gray-300 border border-gray-700"
          value={value.stage}
          onChange={(e) => onChange({ ...value, stage: e.target.value })}
        >
          {STAGE_OPTIONS.map((op) => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>

        <select
          className="sm:w-52 px-3 py-2 rounded-md bg-[#444343]  text-gray-300 border border-gray-700"
          value={value.job}
          onChange={(e) => onChange({ ...value, job: e.target.value })}
        >
          {jobs.map((op) => (
            <option key={op} value={op} className="bg-[#444343] text-gray-300 ">{op}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
