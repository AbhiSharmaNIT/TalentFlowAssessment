// App.js
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

/* UI chrome (only for the app area after Explore) */
import Sidebar from "./components/Sidebar.jsx";
import DashboardHeaderRight from "./features/dashboard/DashboardHeaderRight.jsx";

/* Pages */
import FrontPage from "./pages/FrontPage.jsx";
import DashBoardPage from "./features/dashboard/DashBoardPage.jsx";
import JobsPage from "./features/jobs/JobsPage.jsx";
import CandidatesPage from "./features/candidates/CandidatesPage.jsx";
import CandidateProfile from "./features/candidates/CandidateProfile.jsx";
import AssessmentsPage from "./features/assessments/AssessmentsPage.jsx";
import HRProfilePage from "./features/dashboard/HRProfilePage.jsx";

/* ----- Layout that shows Sidebar + Header (for /dashboard and others) ----- */
function AppLayout() {
  return (
    <div className="bg-[#05080f] text-slate-100 h-screen flex">
      {/* Sidebar (fixed width on desktop, collapsible on mobile) */}
      <Sidebar />

      {/* Right content */}
      <div
        className="
          flex-1 flex flex-col transition-all duration-300
          ml-0 lg:ml-[var(--sidebar-w,16rem)]
        "
      >
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-end px-4 h-14 border-b border-white/10 bg-[#0b1120]/80 backdrop-blur">
          <DashboardHeaderRight />
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}


/* ----- Root Router ----- */
export default function App() {
  return (
    <Routes>
      {/* Public landing (no sidebar/header) */}
      <Route path="/" element={<FrontPage />} />

      {/* App area (with sidebar/header) */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashBoardPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/candidates/:id" element={<CandidateProfile />} />
        <Route path="/assessments" element={<AssessmentsPage />} />
        <Route path="/hr" element={<HRProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
