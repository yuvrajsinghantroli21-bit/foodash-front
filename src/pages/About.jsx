import { motion } from "framer-motion";

function About() {
  return (
    <div className="min-h-screen text-gray-800 bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-gray-200">
      <div className="max-w-5xl px-6 py-16 mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight">
            The White House ☕
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400">
            Khatipura, Near Lal Mandir Road — Jaipur
          </p>
        </motion.div>

        {/* HERO CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 mb-12 bg-white border shadow-2xl dark:bg-slate-900 rounded-3xl dark:border-slate-800"
        >
          <h2 className="mb-4 text-2xl font-bold text-emerald-500">
            Welcome to FoodDash Experience 🚀
          </h2>

          <p className="mb-4 leading-relaxed text-gray-600 dark:text-gray-400">
            At{" "}
            <span className="font-semibold text-black dark:text-white">
              The White House Café
            </span>
            , we blend great food with smart technology. Our QR-based ordering
            system lets you explore the menu, customize your food, and place
            orders instantly — all from your table.
          </p>

          <p className="leading-relaxed text-gray-600 dark:text-gray-400">
            No waiting, no confusion — just smooth dining powered by FoodDash.
          </p>
        </motion.div>

        {/* FEATURES */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Scan & Order 📱",
              desc: "Simply scan the QR code and start ordering instantly from your table.",
            },
            {
              title: "Customize Food 🍔",
              desc: "Add notes like ‘extra spicy’ or ‘less sugar’ for a personalized meal.",
            },
            {
              title: "Fast Service ⚡",
              desc: "Orders go directly to the kitchen for quick preparation and delivery.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-6 transition bg-white border shadow-lg dark:bg-slate-900 rounded-2xl hover:shadow-2xl dark:border-slate-800"
            >
              <h3 className="mb-2 text-lg font-bold text-emerald-500">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* FOOTER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built with ❤️ using FoodDash • Smart Dining Experience
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default About;
