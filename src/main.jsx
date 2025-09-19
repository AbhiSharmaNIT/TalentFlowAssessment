import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { makeServer } from "./api/server";
import ToastProvider from "./components/ToastProvider.jsx";
import { getAllJobStatusOverrides } from "./lib/storage.js";

import { api } from "./lib/api.js";

const THEME_KEY = "tf_theme2"; // "light" | "dark"
(function ensureThemeEarly() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    const mode = saved === "light" || saved === "dark" ? saved : "dark"; // your default
    const root = document.documentElement;
    const isDark = mode === "dark";
    root.classList.toggle("dark", isDark);
    root.setAttribute("data-theme", isDark ? "dark" : "light");
  } catch {
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

makeServer({ environment: import.meta.env.MODE });

// Top-level await is supported by Vite ESM
async function hydrateMirageFromLocal() {
  const overrides = await getAllJobStatusOverrides(); // { "12": {status:"active"}, ... }
  const idsActive = [];
  const idsArchived = [];
  for (const [id, val] of Object.entries(overrides)) {
    if (val?.status === "active") idsActive.push(Number(id));
    else if (val?.status === "archived") idsArchived.push(Number(id));
  }
  // Apply in batches (fast). Ignore failures silently so app still boots.
  if (idsActive.length) {
    try {
      await api.post("/jobs/bulk-status", { ids: idsActive, status: "active" });
    } catch {}
  }
  if (idsArchived.length) {
    try {
      await api.post("/jobs/bulk-status", {
        ids: idsArchived,
        status: "archived",
      });
    } catch {}
  }
}

await hydrateMirageFromLocal();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
