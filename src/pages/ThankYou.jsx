import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function ThankYou() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#fafafa] overflow-hidden">
      {/* 🔥 SOFT BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100" />

      {/* 🍽️ PLATE OUTLINE */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute w-[320px] h-[320px] rounded-full border-[3px] border-gray-200"
      />

      {/* 🍴 CUTLERY LINES (LEFT & RIGHT) */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 800"
        fill="none"
      >
        {/* LEFT LINE */}
        <motion.path
          d="M300 800 C250 600, 250 200, 400 0"
          stroke="#10b981"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2 }}
        />

        {/* RIGHT LINE */}
        <motion.path
          d="M1100 800 C1150 600, 1150 200, 1000 0"
          stroke="#f59e0b"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        />
      </svg>

      {/* 🔥 MAIN CONTENT */}
      <div className="relative z-10 max-w-xl px-6 text-center">
        {/* TOP SMALL TEXT */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm tracking-widest text-gray-400 uppercase"
        >
          The White House Café
        </motion.p>

        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-4xl font-semibold text-gray-900 md:text-5xl"
        >
          Thank You for Dining
        </motion.h1>

        {/* DIVIDER */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "80px" }}
          transition={{ delay: 0.6 }}
          className="h-[2px] bg-emerald-500 mx-auto my-6"
        />

        {/* SUBTEXT */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="leading-relaxed text-gray-600"
        >
          We hope you enjoyed your meal. Your experience matters to us, and we
          look forward to serving you again.
        </motion.p>

        {/* TAGLINE */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-sm italic text-gray-500"
        >
          “Good food. Good mood. Great moments.”
        </motion.p>

        {/* PROGRESS BAR */}
        <div className="mt-8">
          <div className="w-full h-[4px] bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 5 }}
              className="h-full bg-emerald-500"
            />
          </div>

          <p className="mt-2 text-xs text-gray-400">Redirecting to home...</p>
        </div>
      </div>
    </div>
  );
}

export default ThankYou;
