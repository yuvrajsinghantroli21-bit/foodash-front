import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");

    /* ================= SCAN FLOW ================= */
    if (urlToken) {
      axios
        .get(`https://fooadash.onrender.com/api/session/${urlToken}`)
        .then((res) => {
          localStorage.setItem("token", urlToken);
          localStorage.setItem("table", res.data.table);

          toast.success("FoodDash: Session started 🍽️");

          navigate("/home", { replace: true });
        })
        .catch(() => {
          toast.error("FoodDash: Session expired. Please scan QR again.");
          navigate("/scan");
        });

      return;
    }
  }, []);

  return (
    <div className="relative flex items-center justify-center min-h-screen text-white">
      {/* 🔥 BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1559925393-8be0ec4767c8')",
        }}
      />

      {/* 🔥 DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm" />

      {/* 🔥 CONTENT */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-4 text-4xl font-extrabold md:text-6xl"
        >
          Welcome to <span className="text-emerald-400">FoodDash</span> 🍽️
        </motion.h1>

        {/* SUBTEXT */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-xl mb-8 text-lg text-gray-200"
        >
          Experience seamless dining at{" "}
          <span className="font-semibold text-white">The White House Café</span>
          . Scan, order, and enjoy — all from your table.
        </motion.p>

        {/* BUTTON */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate("/order")}
          className="px-8 py-4 text-lg font-semibold text-white transition rounded-full shadow-lg bg-emerald-500 hover:bg-emerald-600 hover:scale-105"
        >
          Explore Menu 🚀
        </motion.button>

        {/* OPTIONAL SMALL TEXT */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-sm text-gray-300"
        >
          Fast • Smart • Contactless Dining
        </motion.p>
      </div>
    </div>
  );
}

export default Home;
