import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function FrontPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-slate-900">
      {/* animated pastel blobs */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-300/40 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-16 left-1/3 h-72 w-72 rounded-full bg-pink-300/40 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 25, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.div
          className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-emerald-300/40 blur-3xl"
          animate={{ x: [0, -35, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
      </div>

      {/* content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur">
            ✨ Welcome
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            TalentFlow
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Hire smarter with a clean, modern workspace
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-600 sm:text-lg">
            Manage jobs, track candidates, and run assessments—all in one place.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/dashboard")}
              className="group relative overflow-hidden rounded-xl bg-slate-900 px-6 py-3 text-white shadow-lg"
            >
              <span className="relative z-10 text-lg font-medium">
                Explore Dashboard
              </span>
              {/* subtle sheen */}
              <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-white/0 via-white/40 to-white/0 group-hover:translate-x-[120%] transition-transform duration-700" />
            </motion.button>

            <a
              href="#features"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Learn more
            </a>
          </div>
        </motion.div>

        {/* floating preview cards */}
        <div
          id="features"
          className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-4 px-2 sm:grid-cols-3"
        >
          {[
            { title: "Jobs", desc: "Create & publish openings" },
            { title: "Candidates", desc: "Track stages & notes" },
            { title: "Assessments", desc: "Share tests & review" },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="text-sm font-semibold text-slate-800">
                {card.title}
              </div>
              <div className="mt-1 text-sm text-slate-600">{card.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* top nav placeholder (optional, light) */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-20 bg-gradient-to-b from-white to-transparent" />
    </div>
  );
}
