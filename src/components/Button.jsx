// src/components/Button.jsx
import React from "react";

export default function Button({ onClick, children = "Add Job", className = "" }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 md:gap-8 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-between text-white rounded-lg text-sm h-10 w-30 pr-5 bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md transition-transform duration-150"
      >
        <div className="h-full flex items-center justify-center px-3">
          <span className="text-lg font-bold">+</span>
        </div>
        <span className="flex-1 text-center font-semibold">{children}</span>
      </button>
    </div>
  );
}
