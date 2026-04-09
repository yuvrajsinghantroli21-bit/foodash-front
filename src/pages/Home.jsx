import { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedToken = localStorage.getItem("token"); // ✅ renamed

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token"); // ✅ renamed

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

          setTimeout(() => {
            navigate("/scan"); // ✅ FIXED
          }, 800);
        });

      return; // ✅ stop further execution
    }

    /* ================= NO TOKEN CASE ================= */
    if (!storedToken) {
      toast.error("FoodDash: No active session. Please scan QR");

      navigate("/scan");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <h1 className="text-3xl font-bold">Welcome to FoodDash 🍽️</h1>

      <button
        onClick={() => {
          const token = localStorage.getItem("token");

          if (!token) {
            toast.error("FoodDash: Please scan QR first 📷");
            setTimeout(() => {
              navigate("/scan");
            }, 1200);
          } else {
            navigate("/order");
          }
        }}
        className="px-6 py-3 text-white rounded-lg bg-emerald-500"
      >
        Explore Menu
      </button>

      {/* ✅ Hide scan button if session exists
      {!storedToken && (
        <Link
          to="/scan"
          className="bg-emerald-500 text-white px-6 py-3 rounded-lg"
        >
          Scan QR
        </Link>
      )} */}
    </div>
  );
}

export default Home;
