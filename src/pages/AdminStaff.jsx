import { useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import {
  Plus,
  RefreshCw,
  ShieldCheck,
  UserCog,
  Lock,
  Power,
} from "lucide-react";

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier",
  });

  const fetchStaff = () => {
    setLoading(true);

    api
      .get("/auth/staff")
      .then((res) => setStaff(res.data || []))
      .catch((err) => {
        console.log(err);
        toast.error("Failed to fetch staff");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const createStaff = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.role) {
      toast.error("Fill all fields");
      return;
    }

    setCreating(true);

    api
      .post("/auth/staff", form)
      .then(() => {
        toast.success("Staff created");
        setForm({
          name: "",
          email: "",
          password: "",
          role: "cashier",
        });
        fetchStaff();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to create staff");
      })
      .finally(() => setCreating(false));
  };

  const resetPassword = (id) => {
    const newPassword = window.prompt("Enter new password");

    if (!newPassword) return;

    api
      .put(`/auth/staff/${id}/reset-password`, {
        password: newPassword,
      })
      .then(() => toast.success("Password reset"))
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to reset password");
      });
  };

  const toggleStatus = (member) => {
    api
      .put(`/auth/staff/${member._id}/status`, {
        active: !member.active,
      })
      .then(() => {
        toast.success(!member.active ? "Staff enabled" : "Staff disabled");
        fetchStaff();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to update status");
      });
  };

  return (
    <div
      className="min-h-screen bg-[#fbfaf8] text-[#111827]"
      style={{ fontFamily: "'Inter', 'DM Sans', sans-serif" }}
    >
      <main className="px-4 py-7 mx-auto max-w-[1400px] sm:px-6">
        <div className="flex flex-col gap-5 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-extrabold text-blue-700 rounded-full bg-blue-50">
              <UserCog size={14} />
              Staff Access Control
            </div>

            <h1 className="text-4xl font-extrabold tracking-[-0.04em] text-[#111936] sm:text-5xl">
              Staff Management
            </h1>

            <p className="max-w-2xl mt-2 text-sm font-semibold leading-relaxed text-slate-500 sm:text-base">
              Create cashier and kitchen staff accounts, manage access roles,
              reset passwords, and control staff permissions securely.
            </p>
          </div>

          <button
            onClick={fetchStaff}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-extrabold bg-white border border-gray-200 shadow-sm rounded-xl text-slate-600 hover:bg-gray-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="p-5 bg-white border border-gray-100 shadow-[0_8px_26px_rgba(15,23,42,0.07)] rounded-2xl">
            <h2 className="flex items-center gap-2 mb-5 text-xl font-extrabold tracking-tight text-[#111936]">
              <Plus size={20} />
              Add Staff
            </h2>

            <form onSubmit={createStaff} className="space-y-4">
              <div>
                <label className="block mb-2 text-[13px] font-extrabold tracking-wide text-slate-600">
                  Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-[15px] font-semibold text-slate-800 placeholder:text-slate-400 bg-white border border-gray-200 outline-none rounded-xl focus:border-[#d97707] focus:ring-4 focus:ring-orange-100 transition"
                  placeholder="Kitchen Staff"
                />
              </div>

              <div>
                <label className="block mb-2 text-[13px] font-extrabold tracking-wide text-slate-600">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-[15px] font-semibold text-slate-800 placeholder:text-slate-400 bg-white border border-gray-200 outline-none rounded-xl focus:border-[#d97707] focus:ring-4 focus:ring-orange-100 transition"
                  placeholder="staff@foodash.com"
                />
              </div>

              <div>
                <label className="block mb-2 text-[13px] font-extrabold tracking-wide text-slate-600">
                  Password
                </label>
                <input
                  name="password"
                  type="text"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-[15px] font-semibold text-slate-800 placeholder:text-slate-400 bg-white border border-gray-200 outline-none rounded-xl focus:border-[#d97707] focus:ring-4 focus:ring-orange-100 transition"
                  placeholder="123456"
                />
              </div>

              <div>
                <label className="block mb-2 text-[13px] font-extrabold tracking-wide text-slate-600">
                  Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-[15px] font-extrabold text-slate-800 bg-white border border-gray-200 outline-none rounded-xl focus:border-[#d97707] focus:ring-4 focus:ring-orange-100 transition"
                >
                  <option value="cashier">Cashier</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                disabled={creating}
                className="w-full py-3.5 text-sm font-extrabold tracking-wide text-white bg-[#071832] rounded-xl shadow-[0_10px_20px_rgba(7,24,50,0.18)] transition hover:opacity-95 active:scale-[0.99] disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create Staff"}
              </button>
            </form>
          </section>

          <section className="p-5 bg-white border border-gray-100 shadow-[0_8px_26px_rgba(15,23,42,0.07)] rounded-2xl">
            <h2 className="flex items-center gap-2 mb-5 text-xl font-extrabold tracking-tight text-[#111936]">
              <ShieldCheck size={20} />
              Staff List
            </h2>

            {loading ? (
              <div className="py-20 text-center text-slate-400">
                Loading staff...
              </div>
            ) : staff.length > 0 ? (
              <div className="space-y-3">
                {staff.map((member) => (
                  <div
                    key={member._id}
                    className="flex flex-col gap-4 p-4 border border-gray-100 rounded-xl sm:flex-row sm:items-center sm:justify-between bg-[#fbfaf8]"
                  >
                    <div>
                      <h3 className="text-base font-extrabold tracking-tight text-slate-900">
                        {member.name}
                      </h3>
                      <p className="mt-0.5 text-sm font-medium text-slate-500">
                        {member.email}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-extrabold capitalize">
                          {member.role}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${
                            member.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {member.active ? "Active" : "Disabled"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => resetPassword(member._id)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-extrabold bg-white border border-gray-200 rounded-lg text-slate-600"
                      >
                        <Lock size={14} />
                        Reset
                      </button>

                      <button
                        onClick={() => toggleStatus(member)}
                        className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-extrabold border rounded-lg ${
                          member.active
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}
                      >
                        <Power size={14} />
                        {member.active ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400">
                No staff found.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
