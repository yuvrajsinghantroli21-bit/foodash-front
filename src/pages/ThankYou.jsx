import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function ThankYou() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/"); // go home after 5 sec
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen text-white bg-gradient-to-br from-emerald-500 to-emerald-700">
      <div className="text-center">
        {/* ANIMATION */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-6xl"
        >
          🍽️
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-4xl font-bold"
        >
          Thank You!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg"
        >
          Thanks for ordering with us ❤️ <br />
          Hope you enjoyed your meal!
        </motion.p>

        {/* LOADING DOTS */}
        <motion.div
          className="flex justify-center gap-2 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 delay-150 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 delay-300 bg-white rounded-full animate-bounce"></div>
        </motion.div>
      </div>
    </div>
  );
}

export default ThankYou;
