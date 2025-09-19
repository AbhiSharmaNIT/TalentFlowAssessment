// src/api/server.js
import { createServer, Model, Response } from "miragejs";

function slugify(s = "") {
  return s.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

/* ---------- helpers for candidate seeds ---------- */
const FIRST = [
  "Lisa", "David", "Sophia", "Ethan", "Ava", "Noah", "Mia", "Liam", "Olivia", "Isabella",
  "Mason", "Lucas", "Emma", "Amelia", "James", "Henry", "Ella", "Benjamin", "Harper", "Michael",
];
const LAST = [
  "Thompson", "Kim", "Rodriguez", "Patel", "Nguyen", "Garcia", "Johnson", "Brown", "Davis", "Wilson",
  "Lee", "Clark", "Lewis", "Walker", "Young", "King", "Wright", "Scott", "Green", "Baker",
];
const CITIES = [
  "Seattle, WA", "Austin, TX", "New York, NY", "San Francisco, CA", "London, UK",
  "Toronto, ON", "Berlin, DE", "Bengaluru, IN", "Delhi, IN", "Remote",
];
const SKILL_BANK = [
  "Python", "Machine Learning", "SQL", "TensorFlow", "PyTorch", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
  "React", "Node.js", "TypeScript", "Java", "Spring", "Django", "Flask", "Pandas", "NumPy", "scikit-learn",
  "Terraform", "Spark", "REST", "GraphQL",
];
const STAGES = ["applied", "screening", "technical", "offer", "hired", "rejected"];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pickMany(arr, nMin = 3, nMax = 6) {
  const n = randInt(nMin, nMax);
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  return out;
}
function formatDate(d) {
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Simple unique id generator (keeps us independent of Mirage's auto-ids) */
function genId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function makeServer({ environment = "development" } = {}) {
  const titles = [
    "Senior Frontend Developer",
    "Backend Engineer",
    "Full Stack Developer",
    "Data Analyst",
    "ML Engineer",
    "QA Engineer",
    "DevOps Engineer",
    "Product Designer",
    "Mobile Engineer",
    "Security Engineer",
    "SRE",
    "Platform Engineer",
  ];

  return createServer({
    environment,
    models: {
      job: Model,
      candidate: Model,
      assessment: Model, // <-- assessments model
    },

    seeds(server) {
      // ---- Jobs ----
      for (let i = 1; i <= 100; i++) {
        const title = titles[i % titles.length];
        const slug = slugify(`${title}-${i}`);
        server.create("job", {
          id: i,
          title,
          slug,
          status: i % 3 === 0 ? "archived" : "active",
          department: ["Engineering", "Design", "Marketing", "Sales"][i % 4],
          location: ["Remote", "San Francisco, CA", "New York, NY", "London, UK"][i % 4],
          candidates: Math.floor(Math.random() * 8),
          candidateAvatars: Array.from({ length: 3 }, (_, k) => `https://i.pravatar.cc/150?img=${i + k}`),
          description:
            "We are looking for an experienced engineer to join the team and help build modern web applications.",
          type: ["full-time", "contract", "part-time", "internship"][i % 4],
          level: ["junior", "mid", "senior", "lead"][i % 4],
          minSalary: 90000 + (i % 5) * 5000,
          maxSalary: 140000 + (i % 5) * 5000,
          requirements: [
            "Solid JavaScript/TypeScript",
            "Experience with modern frameworks",
            "Understanding of testing and CI/CD",
          ],
          tags: ["react", "node", "aws", "docker", "typescript"].filter(() => Math.random() < 0.35),
          order: i,
        });
      }

      // ---- Candidates ----
      const allJobs = server.schema.jobs.all().models;
      const jobCount = allJobs.length;

      for (let i = 1; i <= 1200; i++) {
        const first = rand(FIRST);
        const last = rand(LAST);
        const name = `${first} ${last}`;
        const email = `${slugify(first)}.${slugify(last)}${i}@email.com`;
        const phone = `+1 (${randInt(200, 989)}) ${randInt(200, 989)}-${String(randInt(0, 9999)).padStart(4, "0")}`;
        const location = rand(CITIES);
        const experienceYears = randInt(0, 12);

        const appliedDate = new Date(Date.now() - randInt(5, 900) * 24 * 3600 * 1000);
        const appliedAt = formatDate(appliedDate);
        const appliedAtTS = appliedDate.getTime();

        const stage = (() => {
          const r = Math.random();
          if (r < 0.25) return "applied";
          if (r < 0.45) return "screening";
          if (r < 0.70) return "technical";
          if (r < 0.85) return "offer";
          if (r < 0.93) return "hired";
          return "rejected";
        })();

        const job = allJobs[randInt(0, jobCount - 1)];
        const jobId = job.id;
        const jobTitle = job.title;

        server.create("candidate", {
          id: i,
          name,
          email,
          phone,
          location,
          initials: (first[0] + last[0]).toUpperCase(),

          stage,
          appliedAt,
          appliedAtTS,

          jobId,
          jobTitle,

          experienceYears,
          skills: pickMany(SKILL_BANK, 4, 8),

          resumeUrl: "",
          notes: "",
        });
      }

      // ---- Assessments (seed: 3 live sets, 20 Q each) ----
      function mkQMC(prompt, options, correct) {
        return { id: genId(), type: "mcq", prompt, options, correct };
      }
      function mkQNum(prompt, min, max, correct) {
        return { id: genId(), type: "numeric", prompt, min, max, correct };
      }
      function mkQText(prompt, correct, maxLength = 200) {
        return { id: genId(), type: "text", prompt, correct, maxLength };
      }

      const liveSeeds = [
        {
          title: "Frontend Screening (React/JS) — Set A",
          jobTitle: "Frontend Engineer",
          description: "20-question quick screen covering React, JS, and browser basics.",
          status: "live",
          sections: [
            {
              id: genId(),
              title: "React & State",
              questions: [
                mkQMC("React state updates are:", ["Synchronous", "Always synchronous in StrictMode", "Asynchronous/batched", "Blocking"], 2),
                mkQMC("Best way to avoid prop-drilling:", ["Global var", "Context API", "Multiple setStates", "Inline CSS"], 1),
                mkQMC("Key prop helps React to:", ["Style elements", "Track identity across renders", "Bind events", "Improve CSS specificity"], 1),
                mkQMC("Controlled input means:", ["DOM owns value", "React state owns value", "Cannot be validated", "No onChange needed"], 1),
                mkQMC("useMemo is for:", ["Replacing all vars", "Avoid all re-renders", "Memoizing expensive calc", "Side-effects"], 2),
                mkQMC("Updates batched in React 18:", ["Only in events", "Many cases incl. async", "Never batched", "Only class comps"], 1),
                mkQMC("NOT a hook rule:", ["Top-level only", "Call conditionally", "Only in React funcs", "Custom hooks start with use"], 1),
                mkQMC("useEffect cleanup runs:", ["On mount", "Before next run & on unmount", "On setState", "On keypress"], 1),
                mkQText("Hook to keep a mutable value without re-renders:", "useRef", 40),
                mkQText("Name the hook for memoizing callbacks.", "useCallback", 40),
              ],
            },
            {
              id: genId(),
              title: "JavaScript & Browser",
              questions: [
                mkQMC("Strict equality === checks:", ["Value only", "Type only", "Value & type", "Reference only"], 2),
                mkQMC("Which is NOT truthy?", ["[]", "{}", "0", "\"0\""], 2),
                mkQMC("let vs var:", ["Same scope", "let is block-scoped", "var is block-scoped", "var can’t hoist"], 1),
                mkQMC("Promise.all rejects when:", ["Any rejects", "All resolve", "First resolves", "Timeout"], 0),
                mkQMC("Debounce does:", ["Group calls after wait", "Immediate run", "Retry failures", "Parallelize"], 0),
                mkQMC("Offline large structured store:", ["localStorage", "sessionStorage", "IndexedDB", "Cookies"], 2),
                mkQMC("CORS controls:", ["Styling", "Cross-origin HTTP access", "Animations", "SW scope"], 1),
                mkQNum("What status code indicates Created?", 100, 600, 201),
                mkQText("Event loop queue for Promise callbacks (two words):", "microtask queue", 40),
                mkQMC("CSS specificity (highest → lowest):", ["Inline > ID > Class > Element", "ID > Inline > Class > Element", "Class > ID > Inline > Element", "Inline > Class > ID > Element"], 0),
              ],
            },
          ],
        },

        {
          title: "Data Structures & Algorithms — Set B",
          jobTitle: "Software Engineer",
          description: "20-question check on DS, complexity, and patterns.",
          status: "live",
          sections: [
            {
              id: genId(),
              title: "Complexity & Arrays",
              questions: [
                mkQMC("Binary search (average):", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], 1),
                mkQMC("Merge sort space:", ["O(1)", "O(log n)", "O(n)", "O(n^2)"], 2),
                mkQMC("Kadane’s solves:", ["Longest subseq", "Min path sum", "Max subarray sum", "Edit distance"], 2),
                mkQMC("Two-pointer works best on:", ["Unordered arrays", "Graphs", "Sorted/semi-sorted data", "Trees"], 2),
                mkQMC("Stable sort:", ["Quick", "Heap", "Merge", "Selection"], 2),
                mkQMC("Hash map avg lookup:", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], 0),
                mkQMC("Sliding window is for:", ["DP tables", "Subarray constraints", "Graph traversal", "Backtracking"], 1),
                mkQMC("Binary heap extract-min:", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], 1),
                mkQText("Data structure used for BFS frontier:", "queue", 20),
                mkQNum("Complete binary tree with 63 nodes has height (edges):", 0, 20, 5),
              ],
            },
            {
              id: genId(),
              title: "Graphs, Trees & Strings",
              questions: [
                mkQMC("Dijkstra requires:", ["No cycles", "Non-negative weights", "Directed only", "Negative cycles"], 1),
                mkQMC("Union-Find used for:", ["Topo sort", "SCC", "Connectivity/cycle detection", "Min cut"], 2),
                mkQMC("Trie best for:", ["Sorting numbers", "Prefix search", "Graph coloring", "Matrix expo"], 1),
                mkQMC("KMP improves:", ["Matrix mult", "String search via prefix function", "Sorting", "Compression"], 1),
                mkQMC("BST inorder yields:", ["Random", "Descending", "Ascending", "Level order"], 2),
                mkQMC("Topo sort applies to:", ["Cyclic graphs", "DAGs", "Trees only", "Complete graphs"], 1),
                mkQMC("Balanced BST height:", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], 1),
                mkQText("Algorithm for MST (three letters):", "kruskal", 20),
                mkQNum("Edit distance between 'kitten' and 'sitting':", 0, 10, 3),
                mkQMC("Manacher finds:", ["All anagrams", "Longest palindromic substring O(n)", "Max subarray", "Z-function"], 1),
              ],
            },
          ],
        },

        {
          title: "Core CS & Web Basics — Set C",
          jobTitle: "Generalist SWE",
          description: "20 questions on OS, DB, Networking, HTTP, and web security.",
          status: "live",
          sections: [
            {
              id: genId(),
              title: "OS & Databases",
              questions: [
                mkQMC("Context switch happens when:", ["User clicks", "CPU switches proc/threads", "Disk spins", "GPU renders"], 1),
                mkQMC("Mutex ensures:", ["Non-blocking IO", "Mutual exclusion", "Fair scheduling", "No deadlocks"], 1),
                mkQMC("ACID: I =", ["Isolation", "Indexing", "Integrity", "Inversion"], 0),
                mkQMC("Normalization reduces:", ["Indexes", "Redundancy & anomalies", "Transactions", "Joins"], 1),
                mkQMC("Join returning rows with non-matches on right too:", ["INNER", "LEFT", "RIGHT", "FULL OUTER"], 3),
                mkQText("Two-letter acronym for Write-Ahead Logging:", "wal", 10),
                mkQMC("Index for range queries:", ["Hash", "B+-Tree", "Bitmap only", "Heap"], 1),
                mkQNum("Page size 4KB equals how many bytes?", 1000, 10000, 4096),
                mkQMC("Star schema common in:", ["OLTP", "OLAP / warehousing", "Transactions", "3NF"], 1),
                mkQMC("In MVCC, readers:", ["Block writers always", "See snapshot without blocking writers", "Must lock rows", "Use triggers"], 1),
              ],
            },
            {
              id: genId(),
              title: "Networking & Web Security",
              questions: [
                mkQMC("TLS works at layer:", ["Link", "Network", "Transport/session boundary", "Application only"], 2),
                mkQMC("HTTP/2 adds:", ["UDP", "Multiplexed streams over one TCP", "No header compression", "Mandatory TLS"], 1),
                mkQMC("CSRF mitigated by:", ["SameSite & anti-CSRF tokens", "CSP img-src", "ETags", "ETL"], 0),
                mkQMC("CSP primarily defends against:", ["DDoS", "XSS", "CSRF", "SQLi"], 1),
                mkQMC("JWT should be:", ["Unsigned", "Kept secret & validated", "Only in localStorage", "Never rotated"], 1),
                mkQNum("Default HTTPS port:", 1, 65535, 443),
                mkQMC("HSTS helps to:", ["Force HTTPS", "Cache images", "Compress JS", "Prevent CSRF"], 0),
                mkQText("Header that controlled framing (now CSP):", "x-frame-options", 40),
                mkQMC("SameSite=Lax cookies:", ["Sent on all cross-site", "Not sent on top-level GET", "Sent on top-level GET but not most cross-site POSTs", "Never sent"], 2),
                mkQMC("HTTP 304 means:", ["Permanent redirect", "Not Modified", "Partial content", "Precondition failed"], 1),
              ],
            },
          ],
        },
      ];

      liveSeeds.forEach((a, i) => {
        server.create("assessment", {
          id: String(genId()),
          ...a,
          createdAt: Date.now() - (i + 1) * 1000, // small staggering
        });
      });
    },

    routes() {
      this.namespace = "api";
      this.timing = 300;

      /* =========================
         JOB ROUTES (unchanged)
      ==========================*/
      this.get("/jobs", (schema, request) => {
        const page = Number(request.queryParams.page) || 1;
        const limit = Number(request.queryParams.limit || request.queryParams.pageSize) || 10;
        const search = (request.queryParams.search || "").toLowerCase();
        const status = (request.queryParams.status || "").toLowerCase();

        let list = schema.jobs.all().models;

        if (search) {
          list = list.filter((j) => {
            const hay =
              (j.title || "") +
              " " +
              (j.slug || "") +
              " " +
              (j.department || "") +
              " " +
              (j.location || "") +
              " " +
              ((j.tags || []).join(" ") || "");
            return hay.toLowerCase().includes(search);
          });
        }

        if (status) {
          list = list.filter((j) => (j.status || "").toLowerCase() === status);
        }

        list = list.sort((a, b) => {
          const ao = a.order ?? Number.POSITIVE_INFINITY;
          const bo = b.order ?? Number.POSITIVE_INFINITY;
          return ao - bo;
        });

        const start = (page - 1) * limit;
        const end = page * limit;

        return {
          jobs: list.slice(start, end).map((m) => m.attrs),
          meta: { total: list.length, page, limit },
        };
      });

      this.get("/jobs/:id", (schema, request) => {
        const job = schema.jobs.find(request.params.id);
        if (!job) return new Response(404, {}, { message: "Not found" });
        return job.attrs;
      });

      this.post("/jobs", (schema, request) => {
        const attrs = JSON.parse(request.requestBody || "{}");
        const title = (attrs.title || "").trim();
        if (!title) return new Response(400, {}, { message: "Title is required" });

        let slug = slugify(attrs.slug || title) || `job-${Date.now()}`;
        let candidate = slug;
        let n = 2;
        while (schema.jobs.findBy({ slug: candidate })) candidate = `${slug}-${n++}`;
        slug = candidate;

        const orders = schema.jobs.all().models.map((j) => j.order).filter((o) => typeof o === "number");
        const minOrder = orders.length ? Math.min(...orders) : 1;

        const job = schema.jobs.create({
          status: attrs.status || "active",
          department: attrs.department || "",
          location: attrs.location || "Remote",
          candidates: 0,
          candidateAvatars: [],
          description: attrs.description || "",
          type: attrs.type || "full-time",
          level: attrs.level || "mid",
          minSalary: attrs.minSalary ?? null,
          maxSalary: attrs.maxSalary ?? null,
          requirements: Array.isArray(attrs.requirements) ? attrs.requirements : [],
          tags: Array.isArray(attrs.tags) ? attrs.tags : [],
          ...attrs,
          id: String(genId()),
          slug,
          order: minOrder - 1,
        });

        return job.attrs;
      });

      this.patch("/jobs/:id", (schema, request) => {
        const id = request.params.id;
        const job = schema.jobs.find(id);
        if (!job) return new Response(404, {}, { message: "Not found" });

        const attrs = JSON.parse(request.requestBody || "{}");

        if (typeof attrs.slug === "string") {
          attrs.slug = slugify(attrs.slug);
          if (!attrs.slug) delete attrs.slug;
        }
        if (attrs.slug) {
          const existing = schema.jobs.findBy({ slug: attrs.slug });
          if (existing && String(existing.id) !== String(id)) {
            return new Response(409, {}, { message: "Slug must be unique" });
          }
        }

        job.update(attrs);
        return job.attrs;
      });

      /* =========================
         CANDIDATE ROUTES
      ==========================*/
      this.get("/candidates", (schema, request) => {
        const page = Number(request.queryParams.page) || 1;
        const limit = Number(request.queryParams.limit || request.queryParams.pageSize) || 12;

        const search = (request.queryParams.search || "").toLowerCase();
        const stage = (request.queryParams.stage || "").toLowerCase();
        const jobParam = request.queryParams.job || "";

        let list = schema.candidates.all().models;

        if (search) {
          list = list.filter((c) => {
            const hay = [
              c.name, c.email, c.phone, c.location, c.jobTitle,
              ...(Array.isArray(c.skills) ? c.skills : []),
            ]
              .join(" ")
              .toLowerCase();
            return hay.includes(search);
          });
        }

        if (stage) {
          list = list.filter((c) => (c.stage || "").toLowerCase() === stage);
        }

        if (jobParam && jobParam !== "All Jobs") {
          list = list.filter((c) => {
            const byTitle = String(c.jobTitle || "") === String(jobParam);
            const byId = String(c.jobId || "") === String(jobParam);
            return byTitle || byId;
          });
        }

        list = list.sort((a, b) => (b.appliedAtTS ?? 0) - (a.appliedAtTS ?? 0));

        const start = (page - 1) * limit;
        const end = page * limit;

        return {
          candidates: list.slice(start, end).map((m) => m.attrs),
          meta: { total: list.length, page, limit },
        };
      });

      this.get("/candidates/:id", (schema, request) => {
        const c = schema.candidates.find(request.params.id);
        if (!c) return new Response(404, {}, { message: "Not found" });
        return c.attrs;
      });

      this.patch("/candidates/:id", (schema, request) => {
        const id = request.params.id;
        const c = schema.candidates.find(id);
        if (!c) return new Response(404, {}, { message: "Not found" });

        const attrs = JSON.parse(request.requestBody || "{}");
        if (typeof attrs.stage === "string") {
          const s = attrs.stage.toLowerCase();
          if (!STAGES.includes(s)) {
            return new Response(400, {}, { message: "Invalid stage" });
          }
          attrs.stage = s;
        }

        if (attrs.jobId != null) {
          const job = schema.jobs.find(attrs.jobId);
          if (job) attrs.jobTitle = job.title;
        }

        attrs.updatedAtTS = Date.now();

        c.update(attrs);
        return c.attrs;
      });

      this.get("/candidates/stats", (schema) => {
        const models = schema.candidates.all().models;
        const out = { applied: 0, screening: 0, technical: 0, offer: 0, hired: 0, rejected: 0 };
        models.forEach((m) => {
          const s = (m.stage || "").toLowerCase();
          if (out[s] != null) out[s] += 1;
        });
        return out;
      });

      /* =========================
         ASSESSMENT ROUTES
      ==========================*/
      // GET /assessments?search=
      this.get("/assessments", (schema, request) => {
        const search = (request.queryParams.search || "").toLowerCase();
        let list = schema.assessments.all().models;

        if (search) {
          list = list.filter((a) => {
            const hay = `${a.title} ${a.jobTitle} ${a.description}`;
            return hay.toLowerCase().includes(search);
          });
        }

        list = list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        return { assessments: list.map((m) => m.attrs) };
      });

      // GET /assessments/:id
      this.get("/assessments/:id", (schema, request) => {
        const m = schema.assessments.find(request.params.id);
        if (!m) return new Response(404, {}, { message: "Not found" });
        return m.attrs;
      });

      // POST /assessments  (now persists status; defaults to "live")
      this.post("/assessments", (schema, request) => {
        const attrs = JSON.parse(request.requestBody || "{}");
        if (!attrs.title?.trim()) {
          return new Response(400, {}, { message: "Title is required" });
        }

        const created = schema.assessments.create({
          id: genId(), // ensure a unique id is returned
          title: attrs.title.trim(),
          jobTitle: attrs.jobTitle?.trim() || "Unknown Job",
          description: attrs.description?.trim() || "",
          sections: Array.isArray(attrs.sections) ? attrs.sections : [],
          status: (attrs.status || "live").toLowerCase(),  // keep "live" as default
          createdAt: Date.now(),
        });

        return created.attrs; // must return {id,...} so client can persist in IndexedDB
      });

      // PATCH /assessments/:id
      this.patch("/assessments/:id", (schema, request) => {
        const m = schema.assessments.find(request.params.id);
        if (!m) return new Response(404, {}, { message: "Not found" });
        const attrs = JSON.parse(request.requestBody || "{}");
        m.update(attrs);
        return m.attrs;
      });

      // DELETE /assessments/:id
      this.delete("/assessments/:id", (schema, request) => {
        const m = schema.assessments.find(request.params.id);
        if (!m) return new Response(404, {}, { message: "Not found" });
        m.destroy();
        return new Response(204);
      });
    },
  });
}

export default makeServer;
