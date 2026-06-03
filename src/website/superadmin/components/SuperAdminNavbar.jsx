import { useMemo, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardList,
  CreditCard,
  Crown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Store,
  Users,
  X,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

const links = [
  { label: "Dashboard", path: "/superadmin/dashboard", icon: LayoutDashboard },
  { label: "Restaurants", path: "/superadmin/restaurants", icon: Store },
  { label: "Plans", path: "/superadmin/plans", icon: Crown },
  { label: "Leads", path: "/superadmin/leads", icon: Users },
  { label: "Payments", path: "/superadmin/payments", icon: CreditCard },
  {
    label: "Plan Requests",
    path: "/superadmin/plan-requests",
    icon: ClipboardList,
  },
  { label: "Settings", path: "/superadmin/settings", icon: Settings },
];

function SuperAdminNavbar() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("superAdminUser")) || null;
    } catch {
      return null;
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("superAdminToken");
    localStorage.removeItem("superAdminUser");
    toast.success("Logged out");
    navigate("/superadmin/login");
  };

  return (
    <>
      {/* ── Top Navbar ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-[0_2px_16px_rgba(15,23,42,0.06)] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left — hamburger (mobile) + brand */}
          <div className="flex items-center gap-3">
            {/* Hamburger — only on mobile */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center justify-center transition border lg:hidden w-9 h-9 rounded-xl bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600"
            >
              <Menu size={18} />
            </button>

            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 shadow-md rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-blue-200">
                <Zap size={14} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-600 leading-none">
                  FoodDash
                </p>
                <p className="text-sm font-black leading-tight tracking-tight text-slate-950">
                  Super Admin
                </p>
              </div>
            </div>
          </div>

          {/* Center — page label (mobile only) */}
          <p className="text-sm font-black tracking-tight truncate sm:hidden text-slate-950">
            Control Center
          </p>

          {/* Right — admin info + logout */}
          <div className="flex items-center gap-2">
            {/* Admin info pill — hidden on small screens */}
            <div className="items-center hidden gap-3 px-3 py-2 border sm:flex rounded-2xl bg-slate-50 border-slate-200">
              <div className="flex items-center justify-center w-8 h-8 shadow-sm rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-blue-200">
                <ShieldCheck size={15} className="text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-black leading-tight text-slate-900">
                  {admin?.name || "Super Admin"}
                </p>
                <p className="text-xs font-medium leading-tight text-slate-400">
                  {admin?.email || "owner@fooddash.com"}
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-slate-950 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all hover:-translate-y-0.5 shadow-md shadow-slate-900/10"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer Overlay ────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-white border-r border-slate-100 shadow-[4px_0_32px_rgba(15,23,42,0.12)] flex flex-col px-4 py-6 lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-start justify-between px-1 mb-7">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center shadow-md w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-blue-200">
                    <Zap size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-600 leading-none">
                      FoodDash
                    </p>
                    <p className="text-lg font-black leading-tight tracking-tight text-slate-950">
                      Super Admin
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                      Owner control center
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition mt-0.5"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Admin info inside drawer */}
              <div className="flex items-center gap-3 px-3 py-3 mb-5 border border-blue-100 rounded-2xl bg-blue-50">
                <div className="flex items-center justify-center shadow-sm w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shrink-0 shadow-blue-200">
                  <ShieldCheck size={16} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black truncate text-slate-900">
                    {admin?.name || "Super Admin"}
                  </p>
                  <p className="text-xs font-medium truncate text-slate-400">
                    {admin?.email || "owner@fooddash.com"}
                  </p>
                </div>
              </div>

              {/* Nav label */}
              <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                Navigation
              </p>

              {/* Nav links */}
              <nav className="flex-1 space-y-0.5 overflow-y-auto">
                {links.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition-all duration-150 ${
                          isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all shrink-0 ${
                              isActive
                                ? "bg-white/20"
                                : "bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600"
                            }`}
                          >
                            <Icon
                              size={16}
                              className={isActive ? "text-white" : ""}
                            />
                          </span>
                          <span className="font-black tracking-tight">
                            {item.label}
                          </span>
                          {isActive && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Drawer footer */}
              <div className="mt-4">
                <button
                  onClick={logout}
                  className="flex items-center justify-center w-full gap-2 px-4 py-3 text-xs font-black tracking-widest text-white uppercase transition-all shadow-lg rounded-2xl bg-slate-950 hover:bg-rose-600 shadow-slate-900/10"
                >
                  <LogOut size={15} />
                  Log Out
                </button>
                <div className="mt-3 rounded-2xl bg-blue-50 border border-blue-100 p-3.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                      Platform Live
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed text-slate-400">
                    FoodDash command center is active and monitoring all
                    enterprises.
                  </p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default SuperAdminNavbar;
