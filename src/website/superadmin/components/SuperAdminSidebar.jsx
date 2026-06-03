import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Users,
  Crown,
  Settings,
  ClipboardList,
  Zap,
} from "lucide-react";

const links = [
  { label: "Dashboard", path: "/superadmin/dashboard", icon: LayoutDashboard },
  { label: "Restaurants", path: "/superadmin/restaurants", icon: Store },
  { label: "Enquiries", path: "/superadmin/enquiries", icon: CreditCard },
  {
    label: "Plan Requests",
    path: "/superadmin/plan-requests",
    icon: ClipboardList,
  },
];

function SuperAdminSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 lg:flex flex-col bg-white border-r border-slate-100 shadow-[4px_0_24px_rgba(15,23,42,0.06)] px-4 py-6">
      {/* Logo / Brand */}
      <div className="px-3 mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex items-center justify-center w-8 h-8 shadow-md rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-blue-200">
            <Zap size={15} className="text-white" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">
            FoodDash
          </span>
        </div>
        <h2 className="mt-2 text-xl font-black leading-tight tracking-tight text-slate-950">
          Super Admin
        </h2>
        <p className="text-xs font-medium text-slate-400 mt-0.5">
          Owner control center
        </p>
      </div>

      {/* Nav label */}
      <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
        Navigation
      </p>

      {/* Nav links */}
      <nav className="flex-1 space-y-0.5">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
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
                    className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                      isActive
                        ? "bg-white/20"
                        : "bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600"
                    }`}
                  >
                    <Icon size={16} className={isActive ? "text-white" : ""} />
                  </span>
                  <span className="font-black tracking-tight">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mx-1 mt-4">
        <div className="p-4 border border-blue-100 rounded-2xl bg-blue-50">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
              Platform Live
            </span>
          </div>
          <p className="text-xs font-medium leading-relaxed text-slate-400">
            FoodDash command center is active and monitoring all enterprises.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default SuperAdminSidebar;
