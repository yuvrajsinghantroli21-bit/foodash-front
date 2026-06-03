import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/superAdminApi";

function SuperAdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);

    api
      .post("/superadmin/login", form)
      .then((res) => {
        if (!res.data.token) {
          toast.error("Token not received from server");
          return;
        }

        localStorage.setItem("superAdminToken", res.data.token);
        localStorage.setItem("superAdminUser", JSON.stringify(res.data.admin));

        toast.success("Super admin login successful");
        navigate("/superadmin/dashboard");
      })
      .catch((err) => {
        console.log("SUPER ADMIN LOGIN ERROR:", err);
        toast.error(err.response?.data?.message || "Login failed");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-[#160d08] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-amber-200/20 bg-[#fff8ec] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3b2114] text-amber-300">
            <ShieldCheck size={28} />
          </div>

          <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-700">
            FoodDash Owner
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#2b160c]">
            Super Admin
          </h1>

          <p className="mt-2 text-sm font-medium text-stone-500">
            Login to manage restaurants, plans and subscriptions.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500">
              Email
            </label>

            <div className="flex items-center gap-3 px-4 py-3 bg-white border shadow-sm rounded-2xl border-amber-100">
              <Mail size={18} className="text-amber-700" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@foodash.com"
                className="w-full text-sm font-bold bg-transparent outline-none text-stone-800 placeholder:text-stone-300"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500">
              Password
            </label>

            <div className="flex items-center gap-3 px-4 py-3 bg-white border shadow-sm rounded-2xl border-amber-100">
              <Lock size={18} className="text-amber-700" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full text-sm font-bold bg-transparent outline-none text-stone-800 placeholder:text-stone-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3b2114] px-5 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-amber-100 shadow-xl shadow-stone-900/20 transition hover:bg-[#2b160c] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SuperAdminLogin;
