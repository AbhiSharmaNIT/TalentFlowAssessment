# TalentFlow — HR Hiring Platform (Frontend-Only)

> **TalentFlow** is a modern, HR-focused hiring tool built fully on the frontend. It allows recruiters to manage **jobs, candidates, assessments, and notifications** through a polished UI. Instead of a backend, the system uses **MirageJS** to simulate REST APIs and **IndexedDB** for persistent storage across sessions.

🔗 **Live Demo**: [https://talent-flow-assessment.vercel.app/](https://talent-flow-assessment.vercel.app/)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8?logo=tailwindcss)
![MirageJS](https://img.shields.io/badge/MirageJS-Mock_API-orange)
![Dexie](https://img.shields.io/badge/IndexedDB-Dexie%2FlocalForage-blue)

---

## ✨ Highlights

- **Dashboard** → Stats on jobs, candidates, assessments, hiring rate, activity timeline, and urgent tasks  
- **Jobs** → Create, edit, archive/unarchive, reorder with drag-and-drop (optimistic UI + rollback), deep link support  
- **Candidates** → 1000+ seeded records, search + stage filter, virtualized list, candidate profile with status timeline, Kanban board for stage transitions, notes with `@mentions`  
- **Assessments** → Per-job builder with multiple question types, live preview, runtime validation, conditional fields, and local persistence  
- **Notifications** → Central feed of HR actions and updates  
- **Persistence** → State stored in IndexedDB (Dexie/localForage) and restored on refresh  
- **API Simulation** → MirageJS provides latency & error injection to mimic real network conditions  

---

## 📚 Table of Contents

- [Tech Stack](#-tech-stack)
- [App Flows](#-app-flows)
- [Routing](#-routing)
- [Mock API](#-mock-api)
- [Persistence](#-persistence)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Known Issues](#-known-issues)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🧰 Tech Stack

- **React 19** + **React Router v7**
- **Vite** for build and dev server
- **TailwindCSS v4** (dark mode included)
- **Framer Motion** for smooth animations
- **MirageJS** for mock APIs
- **Dexie / localForage** for IndexedDB persistence
- **DnD Kit** for drag-and-drop features
- **react-window** for virtualization (large candidate lists)
- **Lucide/Heroicons** for icons
- **Radix Toasts** for notifications

---

## 🔄 App Flows

### Jobs
- Paginated list with filters (status, title, tags)
- Job creation & editing (slug uniqueness enforced)
- Archive/unarchive functionality
- Drag-and-drop reordering with optimistic UI + rollback on error
- Direct access to jobs via `/jobs/:jobId`

### Candidates
- 1000+ generated candidate records
- Virtualized scrolling for performance
- Search & stage filtering
- Kanban board for moving between stages (applied → screen → tech → offer → hired/rejected)
- Candidate profile pages with activity timelines
- Notes feature with `@mentions`

### Assessments
- Build per-job assessments with multiple question types
- Real-time preview alongside builder
- Validation (required fields, numeric ranges, max length)
- Conditional visibility for questions
- Submissions & drafts stored in IndexedDB

### Notifications
- Unified activity feed for system & user actions (job edits, candidate updates, submissions)

---

## 🗺 Routing

Base URL → **[TalentFlow Live](https://talent-flow-assessment.vercel.app/)**

- `/` → Landing page (FrontPage)
- `/dashboard` → HR Dashboard (metrics, recent activity, urgent tasks)
- `/jobs` → Jobs board
- `/candidates` → Candidates list (virtualized + filters)
- `/candidates/:id` → Candidate profile with timeline
- `/assessments` → Assessment overview & builder
- `/hr` → HR Profile page
- `*` → Fallback → redirects to `/`

---

## 🔌 Mock API

All endpoints simulated via MirageJS with:  
⏱ latency: **200–1200ms**  
⚠️ error rate: **5–10%** (to test rollback UX)

**Endpoints include:**

- `GET /jobs`, `POST /jobs`, `PATCH /jobs/:id`, `PATCH /jobs/:id/reorder`
- `GET /candidates`, `POST /candidates`, `PATCH /candidates/:id`, `GET /candidates/:id/timeline`
- `GET /assessments/:jobId`, `PUT /assessments/:jobId`, `POST /assessments/:jobId/submit`

---

## 💾 Persistence

- All entities (jobs, candidates, assessments, notes, reorder state) stored in **IndexedDB**  
- Data restored from DB on refresh  
- To reset → Clear browser storage → reload

---

## 📂 Project Structure

```
src/
 ├── api/         # Mirage server & API helpers
 ├── components/  # Sidebar, Header, Toasts, reusable UI
 ├── features/    # jobs, candidates, assessments, dashboard, notifications
 ├── lib/         # Dexie/localForage adapters & utilities
 ├── pages/       # Route-level pages
 ├── App.jsx      # Route configuration
 ├── main.jsx     # App entry point
 └── index.css    # Tailwind setup
```

---

## 🚀 Getting Started

```bash
# Clone repository
git clone https://github.com/your-username/talentflow.git
cd talentflow

# Install dependencies
npm install

# Run dev server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```

---

## ⚙ Configuration

- **MirageJS** → latency/error rates adjustable in `src/api/server.js`
- **Dexie** → DB name = `talentflow-db`
- **React Query (if enabled)** → query keys by resource

---

## 🧪 Known Issues

- File upload in assessments is a stub only (non-functional)
- No authentication (all HR actions are open by default)
- Random error injection may occasionally block updates (intended for testing rollback)

---

## 🛣 Roadmap

- Multi-tenant support + role-based access
- Bulk candidate operations & imports
- Assessment scoring & analytics dashboards
- Notification webhooks (mock)
- Theming & branding customization
- Accessibility improvements for DnD interactions

---

## 📜 License

Open-source for **educational/demo purposes**.  
Use freely with attribution.  
© 2025 TalentFlow — HR Hiring Platform

---

🙌 Built with ❤️ using React, Vite, Tailwind, MirageJS, Dexie/localForage, DnD Kit, react-window, and lucide-react.
