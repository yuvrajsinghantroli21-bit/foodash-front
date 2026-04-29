import { motion } from "framer-motion";

/* ── Shared decorative divider ── */
const Divider = () => (
  <div className="flex items-center justify-center gap-3 my-4">
    <div className="w-12 h-[1px] bg-amber-400" />
    <span className="text-lg text-amber-500">🌿</span>
    <div className="w-12 h-[1px] bg-amber-400" />
  </div>
);

const FEATURES = [
  {
    emoji: "📱",
    title: "Scan & Order",
    desc: "Simply scan the QR code on your table and start ordering instantly — no app download needed.",
    accent: "emerald",
  },
  {
    emoji: "🍔",
    title: "Customize Your Meal",
    desc: "Add personal notes like 'extra spicy' or 'less sugar' for a meal that's made just for you.",
    accent: "amber",
  },
  {
    emoji: "⚡",
    title: "Fast Kitchen Service",
    desc: "Your order goes directly to the kitchen display for speedy preparation and table delivery.",
    accent: "emerald",
  },
];

const VALUES = [
  { number: "500+", label: "Happy Diners" },
  { number: "40+", label: "Menu Items" },
  { number: "5★", label: "Avg. Rating" },
  { number: "2min", label: "Avg. Order Time" },
];

const TEAM = [
  {
    emoji: "👨‍🍳",
    role: "Head Chef",
    name: "Chef xyz",
    note: "10 years of culinary craft",
  },
  {
    emoji: "🧑‍💼",
    role: "Café Manager",
    name: "yuvraj Singh",
    note: "Ensuring a seamless experience",
  },
  {
    emoji: "💻",
    role: "Tech by",
    name: "FoodDash",
    note: "Smart dining, simplified",
  },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

function About() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f0e8" }}>
      {/* Gold top accent */}
      <div className="" />

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden">
        {/* Subtle grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px",
          }}
        />

        <div className="relative z-10 max-w-4xl px-6 pt-16 pb-12 mx-auto text-center">
          <motion.div {...fadeUp(0)}>
            <p className="text-emerald-600 text-[11px] tracking-[0.3em] uppercase font-semibold mb-3">
              • Est. 2020 • Jaipur •
            </p>
            <h1
              className="text-5xl font-bold leading-tight text-gray-900 sm:text-6xl md:text-7xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              The White House
              <br />
              <span className="text-emerald-600">Café</span>
            </h1>
            <Divider />
            <p className="max-w-xl mx-auto text-sm leading-relaxed text-gray-500 sm:text-base">
              Khatipura, Near Lal Mandir Road — Jaipur, Rajasthan
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl px-4 pb-20 mx-auto space-y-10 sm:px-6">
        {/* ══════════ STORY CARD ══════════ */}
        <motion.div {...fadeUp(0.1)}>
          <div className="relative overflow-hidden bg-white border shadow-xl rounded-3xl border-amber-100/60">
            {/* Left green accent bar */}
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-400 rounded-l-3xl" />

            <div className="px-8 py-10 sm:px-12 sm:py-12 md:flex md:items-center md:gap-12">
              {/* Big decorative letter */}
              <div className="items-center justify-center hidden w-32 h-32 text-6xl border-2 rounded-full select-none md:flex bg-emerald-50 border-emerald-100 shrink-0">
                ☕
              </div>

              <div>
                <p className="text-emerald-600 text-[11px] tracking-[0.25em] uppercase font-semibold mb-2">
                  Our Story
                </p>
                <h2
                  className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Where Good Food Meets Smart Dining
                </h2>
                <p className="mb-3 text-sm leading-relaxed text-gray-500">
                  At{" "}
                  <span className="font-semibold text-gray-800">
                    The White House Café
                  </span>
                  , we believe dining should be effortless. We blend fresh,
                  lovingly prepared food with the power of modern technology —
                  so you spend less time waiting and more time enjoying.
                </p>
                <p className="text-sm leading-relaxed text-gray-500">
                  Our QR-based ordering system, powered by{" "}
                  <span className="font-semibold text-emerald-600">
                    FoodDash
                  </span>
                  , lets you explore the full menu, personalise your order, and
                  track it live — all from your table, without flagging down a
                  waiter.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════════ STATS STRIP ══════════ */}
        <motion.div {...fadeUp(0.15)}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {VALUES.map((v, i) => (
              <div
                key={i}
                className="px-5 py-6 text-center bg-white border border-gray-100 shadow-md rounded-2xl"
              >
                <p
                  className="mb-1 text-3xl font-bold text-emerald-600"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {v.number}
                </p>
                <p className="text-xs tracking-wide text-gray-400">{v.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ══════════ FEATURES ══════════ */}
        <div>
          <motion.div {...fadeUp(0.1)} className="mb-8 text-center">
            <p className="text-emerald-600 text-[11px] tracking-[0.25em] uppercase font-semibold mb-2">
              How It Works
            </p>
            <h2
              className="text-2xl font-bold text-gray-900 sm:text-3xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              The FoodDash Experience
            </h2>
            <Divider />
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.12)}
                className="relative p-6 overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-md group rounded-2xl hover:shadow-xl hover:-translate-y-1"
              >
                {/* Step number */}
                <span
                  className="absolute top-4 right-4 text-[10px] font-bold text-gray-200 tracking-widest"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  0{i + 1}
                </span>

                {/* Emoji icon in circle */}
                <div className="flex items-center justify-center w-12 h-12 mb-4 text-2xl border rounded-full bg-emerald-50 border-emerald-100">
                  {f.emoji}
                </div>

                <h3
                  className="mb-2 text-base font-bold text-gray-900"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {f.title}
                </h3>
                <p className="text-xs leading-relaxed text-gray-500">
                  {f.desc}
                </p>

                {/* Bottom accent line on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 to-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ══════════ TEAM ══════════ */}
        <div>
          <motion.div {...fadeUp(0.1)} className="mb-8 text-center">
            <p className="text-emerald-600 text-[11px] tracking-[0.25em] uppercase font-semibold mb-2">
              The People Behind It
            </p>
            <h2
              className="text-2xl font-bold text-gray-900 sm:text-3xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Meet Our Team
            </h2>
            <Divider />
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-3">
            {TEAM.map((t, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.12)}
                className="p-6 text-center transition-all duration-300 bg-white border border-gray-100 shadow-md rounded-2xl hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl border-2 rounded-full bg-amber-50 border-amber-100">
                  {t.emoji}
                </div>
                <p className="text-[10px] text-amber-500 tracking-widest uppercase font-semibold mb-1">
                  {t.role}
                </p>
                <h3
                  className="mb-1 text-base font-bold text-gray-900"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {t.name}
                </h3>
                <p className="text-xs text-gray-400">{t.note}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ══════════ LOCATION CARD ══════════ */}
        <motion.div {...fadeUp(0.1)}>
          <div className="overflow-hidden bg-white border shadow-xl rounded-3xl border-amber-100/60">
            <div className="flex flex-col items-center gap-6 px-8 py-8 sm:px-12 sm:py-10 sm:flex-row">
              <div className="flex items-center justify-center w-16 h-16 text-3xl border-2 rounded-full bg-emerald-50 border-emerald-100 shrink-0">
                📍
              </div>
              <div>
                <p className="text-[11px] text-emerald-600 tracking-[0.25em] uppercase font-semibold mb-1">
                  Find Us
                </p>
                <h3
                  className="mb-1 text-xl font-bold text-gray-900"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  The White House Café
                </h3>
                <p className="text-sm text-gray-500">
                  Khatipura, Near Lal Mandir Road, Jaipur, Rajasthan
                </p>
              </div>
              <div className="sm:ml-auto shrink-0">
                <a
                  href="https://maps.google.com/?q=Khatipura+Jaipur"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-md transition-all active:scale-95"
                >
                  Get Directions →
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════════ FOOTER NOTE ══════════ */}
        <motion.div {...fadeUp(0.1)} className="pt-4 pb-2 text-center">
          <Divider />
          <p className="mt-2 text-xs text-gray-400">
            Built with 🤍 using{" "}
            <span className="font-semibold text-emerald-600">FoodDash</span> •
            Smart Dining Experience
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default About;
