import React from "react";
import { X } from "lucide-react";
import AssessmentCandidateView from "./AssessmentCandidateView";

export default function AssessmentPreviewModal({ open, onClose, assessment }) {
  if (!open) return null;

  const sections = Array.isArray(assessment?.sections)
    ? assessment.sections
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl bg-[#0f1623] border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-gray-700 bg-[#0f1623]">
          <div className="text-white font-semibold">Assessment Preview</div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-800 text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (exact WYSIWYG candidate view) */}
        <div className="px-5 py-5">
          <AssessmentCandidateView
            title={assessment?.title || ""}
            jobTitle={assessment?.jobTitle || "Unknown Job"}
            description={assessment?.description || ""}
            sections={sections}
            readOnly
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end px-5 py-4 border-t border-gray-700 bg-[#0f1623]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
