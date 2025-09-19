import React from "react";
import { X } from "lucide-react";

export default function DeleteConfirmationModal({ open, onClose, assessment, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-xl bg-[#0f1016] border border-[#828181eb] text-white shadow-lg p-6 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mt-4">Confirm Deletion</h2>
        <p className="mt-2 text-gray-300">
          Are you sure you want to delete the assessment{" "}
          <span className="font-medium text-white">
            {assessment?.title || "Untitled"}
          </span>
          ?
        </p>
        <p className="text-sm mt-1 text-rose-300 font-semibold">
          This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-white/10 text-white border border-white/10 hover:bg-white/20"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white border border-red-600 hover:bg-red-700 cursor-pointer"
          >
            Yes, Delete it
          </button>
        </div>
      </div>
    </div>
  );
}
