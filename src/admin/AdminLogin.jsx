import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";
import { Lock, Mail, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const login = (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Enter email and password");
      return;
    }

    setLoading(true);

    api
      .post("/auth/login", form)
      .then((res) => {
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminUser", JSON.stringify(res.data.staff));

        toast.success("Login successful");

        const staff = res.data.staff;

        const role = staff.role;
        const plan = staff.plan || staff.subscriptionPlan || "website";

        if (role === "kitchen") {
          navigate("/admin/kitchen");
          return;
        }

        if (plan === "website") {
          navigate("/admin/menu");
          return;
        }

        navigate("/admin/dashboard");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Login failed");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-white border border-gray-100 shadow-[0_12px_35px_rgba(15,23,42,0.08)] rounded-3xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#071832] text-amber-300">
            <ShieldCheck size={30} />
          </div>

          <h1
            className="text-3xl font-black text-[#111936]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Admin Login
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Sign in to manage FoodDash
          </p>
        </div>

        <form onSubmit={login} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-bold text-slate-600">
              Email
            </label>

            <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl">
              <Mail size={18} className="text-slate-400" />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@foodash.com"
                className="w-full text-sm font-semibold bg-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-slate-600">
              Password
            </label>

            <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl">
              <Lock size={18} className="text-slate-400" />

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full text-sm font-semibold bg-transparent outline-none"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full py-3 mt-2 text-sm font-extrabold text-white bg-[#071832] rounded-xl disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            onClick={() =>
              toast("Ask the main admin to reset your password.", {
                icon: "🔐",
              })
            }
            className="w-full mt-3 text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            Forgot password?
          </button>
        </form>
      </div>
    </div>
  );
}
