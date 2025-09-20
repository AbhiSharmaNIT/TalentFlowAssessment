# TalentFlow – A Mini Hiring Platform (Front-End Only)

TalentFlow is a front-end React application built as part of the ENTNT technical assessment.  
It simulates a **mini hiring platform for HR teams**, enabling them to manage jobs, candidates, and assessments without a real backend. All data is persisted locally using IndexedDB (via Dexie/localForage) and served through a mocked REST API using MirageJS.

---

## 🚀 Features

### 1. Jobs Management
- Create, edit, archive/unarchive jobs.  
- Server-like pagination & filtering (title, status, tags).  
- Drag-and-drop job reordering with optimistic updates and rollback on failure.  
- Deep-link support: `/jobs/:jobId`.

### 2. Candidate Management
- Virtualized list of **1000+ seeded candidates** with fast search & stage filtering.  
- Candidate profile route: `/candidates/:id` with timeline of status changes.  
- Kanban board to move candidates across stages (applied → screen → tech → offer → hired → rejected).  
- Notes with simple `@mentions` (local suggestion list).

### 3. Assessments
- Assessment builder per job: add sections & multiple question types (single/multi-choice, text, numeric with range, file upload stub).  
- Real-time preview of the assessment as a fillable form.  
- Form runtime supports validation & conditional questions.  
- Candidate responses saved locally and restored on refresh.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [React Router v7](https://reactrouter.com/)  
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) + custom dark mode  
- **Animations**: [Framer Motion](https://www.framer.com/motion/)  
- **Mock API**: [MirageJS](https://miragejs.com/) (with artificial latency & error rate)  
- **Persistence**: IndexedDB via [localForage](https://github.com/localForage/localForage)  
- **DnD**: [dnd-kit](https://dndkit.com/) for drag-and-drop  
- **UI Icons**: [Lucide](https://lucide.dev/), [Heroicons](https://heroicons.com/)  
- **Notifications**: Radix Toasts  

---

## 📂 Project Structure

```
src/
 ├── api/              # Mirage server & API helpers
 ├── assets/           # Logo & icons
 ├── components/       # Reusable UI components
 ├── features/
 │    ├── jobs/        # Job board, job forms
 │    ├── candidates/  # Candidate list, profile, kanban
 │    ├── assessments/ # Assessment builder & preview
 │    └── dashboard/   # Dashboard, HR profile, header
 ├── lib/              # IndexedDB/local storage helpers
 ├── pages/            # Top-level route pages
 ├── App.jsx           # Routing setup
 ├── main.jsx          # Entry point (Mirage + theme init)
 └── index.css         # Tailwind setup
```

---

## ⚙️ Setup & Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/talentflow.git
   cd talentflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

---

## 🌐 Deployment

The app is optimized for deployment on **Vercel** or **Netlify**.  
No backend configuration is required; MirageJS + IndexedDB handle all data persistence.

---

## ⚖️ Technical Decisions

- **Why MirageJS?** → Provides a realistic REST-like API with artificial latency & error injection to mimic server conditions.  
- **Why IndexedDB/localForage?** → Ensures state persistence across refreshes without needing a backend.  
- **Optimistic Updates** → Improves UX by updating UI instantly; rollback restores consistency if API fails.  
- **Virtualization** → Required for handling 1000+ candidates efficiently.  
- **Dark Mode First** → App defaults to dark mode with theme toggle stored in `localStorage`.

---

## 🧪 Known Issues / Trade-offs

- No backend integration (per assignment requirement).  
- File upload in assessments is a stub (non-functional).  
- Limited authentication/authorization (all HR actions are open).  
- Artificial error rate may occasionally prevent job/candidate updates (intended for testing rollback UX).  

---

## 📸 Screenshots

(Add your screenshots here with your own captions later.)

---

## 📑 Assignment Compliance

This project fulfills the ENTNT technical assignment requirements:  
✔ Jobs CRUD + reorder  
✔ Candidate management with kanban + profile timeline  
✔ Assessment builder & preview with validation  
✔ Local persistence (IndexedDB + MirageJS)  
✔ Responsive UI with Tailwind & animations  
✔ Deployed link & repository provided  

---

## 👨‍💻 Author

Developed by **Abhishek Kumar** as part of the ENTNT Technical Assessment – September 2025.
