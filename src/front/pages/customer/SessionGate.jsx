import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function SessionGate() {
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#fafafa] overflow-hidden">
      {/* SOFT BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100" />

      {/* DECOR LINES */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 800"
        fill="none"
      >
        <motion.path
          d="M0 700 C300 500, 500 300, 720 0"
          stroke="#10b981"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.path
          d="M1440 700 C1100 500, 900 300, 720 0"
          stroke="#f59e0b"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </svg>

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl p-10 text-center bg-white shadow-2xl rounded-3xl"
      >
        {/* TITLE */}
        <h1 className="mb-3 text-3xl font-semibold text-gray-900">
          Welcome to The White House Café
        </h1>

        {/* SUBTEXT */}
        <p className="mb-8 text-gray-600">
          To place an order, please scan your table QR code. You can still
          explore our menu without ordering.
        </p>

        {/* BUTTONS */}
        <div className="flex flex-col gap-4">
          {/* VIEW MENU */}
          <button
            onClick={() => navigate("/menu-preview")}
            className="w-full py-3 transition border border-gray-300 rounded-xl hover:bg-gray-100"
          >
            👀 View Menu
          </button>

          {/* SCAN QR */}
          <button
            onClick={() => navigate("/scan")}
            className="w-full py-3 font-semibold text-white transition rounded-xl bg-emerald-500 hover:bg-emerald-600"
          >
            📱 Scan QR to Order
          </button>
        </div>

        {/* FOOT NOTE */}
        <p className="mt-6 text-xs text-gray-400">
          Orders are only accepted through verified table sessions
        </p>
      </motion.div>
    </div>
  );
}

export default SessionGate;
