// const titles = [
//   "Frontend Engineer", "Backend Engineer", "Full Stack Developer",
//   "Data Analyst", "ML Engineer", "QA Engineer", "DevOps Engineer",
//   "Product Designer", "Mobile Engineer", "Support Engineer",
//   "Site Reliability Engineer", "Platform Engineer", "Systems Engineer",
//   "Security Engineer", "Data Engineer", "Engineering Manager",
//   "UI Engineer", "Web Developer", "React Developer", "Node Developer",
//   "Angular Developer", "Vue Developer", "iOS Engineer", "Android Engineer", "Cloud Engineer",
// ];

// const stages = ["applied","screen","tech","offer","hired","rejected"];
// const tagsPool = ["react","node","sql","aws","docker","ui","figma","typescript"];

// function slugify(s) {
//   return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
// }

// function rand(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

// export default function seed(server) {
//   // 25 jobs (mixed active/archived)
//   titles.forEach((t, i) => {
//     server.create("job", {
//       id: i + 1,
//       title: t,
//       slug: `${slugify(t)}-${i+1}`,
//       status: i % 5 === 0 ? "archived" : "active",
//       tags: tagsPool.filter(() => Math.random() < 0.3),
//       order: i + 1,
//     });
//   });

//   // 1000 candidates randomly assigned to jobs and stages
//   for (let i = 1; i <= 1000; i++) {
//     const jobId = rand(1, 25);
//     const stage = stages[rand(0, stages.length-1)];
//     server.create("candidate", {
//       id: i,
//       name: `Candidate ${i}`,
//       email: `candidate${i}@mail.com`,
//       jobId,
//       stage,
//     });
//     // timeline stub
//     server.db.timelines?.insert?.({ id: i, candidateId: i, entries: [
//       { ts: Date.now() - rand(2,10)*86400000, from: null, to: "applied" }
//     ]});
//   }

//   // 3 assessments with 10+ questions each
//   [1, 2, 3].forEach((jobId) => {
//     server.create("assessment", {
//       id: jobId,
//       jobId,
//       sections: [
//         {
//           title: "Basics",
//           questions: [
//             { id: "q1", type: "single", label: "Do you know React?", options: ["Yes","No"], required: true },
//             { id: "q2", type: "multi",  label: "Which tools?", options: ["Vite","Webpack","Rollup","Parcel"] },
//             { id: "q3", type: "short",  label: "Favorite hook?" },
//             { id: "q4", type: "long",   label: "Describe state management approach." },
//             { id: "q5", type: "numeric",label: "Years of experience", min: 0, max: 20, required: true },
//             { id: "q6", type: "file",   label: "Upload portfolio (stub)" },
//             { id: "q7", type: "single", label: "Comfort with tests?", options: ["Low","Medium","High"] },
//             { id: "q8", type: "short",  label: "Preferred UI library?" },
//             { id: "q9", type: "multi",  label: "Cloud platforms", options: ["AWS","GCP","Azure"] },
//             { id: "q10", type: "long",  label: "Biggest frontend challenge you solved." },
//           ],
//         },
//       ],
//     });
//   });
// }
