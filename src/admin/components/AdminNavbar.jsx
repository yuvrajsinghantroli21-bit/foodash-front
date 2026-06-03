import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  Flame,
  History,
  Menu as MenuIcon,
  QrCode,
  X,
  LayoutDashboard,
  ChevronDown,
  UserCog,
  LogOut,
  ShieldCheck,
  Inbox,
  Star,
  Settings,
  MoreHorizontal,
  TicketPercent,
} from "lucide-react";

import foodashLogo from "../../../public/foodash_logo.png";
import { hasFeature } from "../../config/planFeatures";

function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const navigate = useNavigate();

  const profileRef = useRef(null);
  const moreRef = useRef(null);

  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  const role = adminUser?.role || "";
  const isImpersonating = adminUser?.isImpersonating === true;

  const plan =
    adminUser?.plan ||
    adminUser?.restaurantPlan ||
    adminUser?.subscription?.plan ||
    adminUser?.subscriptionPlan ||
    "website";

  const roleLabel = isImpersonating
    ? "SuperAdmin Support"
    : role === "admin"
      ? "Admin"
      : role === "cashier"
        ? "Cashier"
        : role === "kitchen"
          ? "Kitchen Staff"
          : "Staff";

  const navLinks = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      roles: ["admin", "cashier"],
      icon: <LayoutDashboard size={17} />,
      feature: "dashboard",
      main: true,
    },
    {
      label: "Orders",
      path: "/admin/history",
      roles: ["admin", "cashier"],
      icon: <History size={17} />,
      feature: "history",
      main: true,
    },
    {
      label: "Kitchen",
      path: "/admin/kitchen",
      roles: ["admin", "kitchen"],
      icon: <Flame size={17} />,
      feature: "kitchen",
      main: true,
    },
    {
      label: "Analytics",
      path: "/admin/analytics",
      roles: ["admin"],
      icon: <BarChart3 size={17} />,
      feature: "analytics",
      main: true,
    },
    {
      label: "Menu",
      path: "/admin/menu",
      roles: ["admin"],
      icon: <MenuIcon size={17} />,
      feature: "menu",
    },
    {
      label: "QR Tables",
      path: "/admin/tables/manage",
      roles: ["admin"],
      icon: <QrCode size={17} />,
      feature: "qrTables",
    },
    {
      label: "Current Tables",
      path: "/admin/tables/current",
      roles: ["admin", "cashier"],
      icon: <Activity size={17} />,
      feature: "currentTables",
    },
    {
      label: "Staff",
      path: "/admin/staff",
      roles: ["admin"],
      icon: <UserCog size={17} />,
      feature: "staff",
    },
    {
      label: "Enquiries",
      path: "/admin/enquiries",
      roles: ["admin", "cashier"],
      icon: <Inbox size={17} />,
      feature: "enquiries",
    },
    {
      label: "Feedback",
      path: "/admin/feedback",
      roles: ["admin", "cashier"],
      icon: <Star size={17} />,
      feature: "feedback",
    },
    {
      label: "Settings",
      path: "/admin/settings",
      roles: ["admin"],
      icon: <Settings size={17} />,
      feature: "settings",
    },
    {
      label: "Coupons",
      path: "/admin/coupons",
      roles: ["admin"],
      icon: <TicketPercent size={17} />,
      feature: "coupons",
    },
    {
      label: "Basic Settings",
      path: "/admin/basic-settings",
      roles: ["admin"],
      icon: <Settings size={17} />,
      alwaysVisible: true,
    },
  ];

  const visibleLinks = navLinks.filter((link) => {
    const roleAllowed = isImpersonating ? true : link.roles.includes(role);

    const featureAllowed = isImpersonating
      ? true
      : link.alwaysVisible
        ? true
        : link.feature
          ? hasFeature(plan, link.feature)
          : true;

    return roleAllowed && featureAllowed;
  });

  const mainLinks = visibleLinks.filter((link) => link.main);
  const moreLinks = visibleLinks.filter((link) => !link.main);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }

      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const logout = () => {
    const supportMode =
      JSON.parse(localStorage.getItem("adminUser") || "{}")?.isImpersonating ===
      true;

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    if (supportMode) {
      window.location.href = "http://localhost:5173/superadmin/restaurants";
      return;
    }

    navigate("/admin/login", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-bold rounded-xl transition-all duration-300 whitespace-nowrap ${
      isActive
        ? "bg-[#d97707] text-white shadow-sm shadow-orange-200"
        : "text-gray-600 hover:text-[#d97707] hover:bg-orange-50"
    }`;

  const dropdownLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
      isActive
        ? "bg-[#d97707] text-white shadow-sm shadow-orange-200"
        : "text-gray-700 hover:text-[#d97707] hover:bg-orange-50"
    }`;

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-orange-100 shadow-sm"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      {isImpersonating && (
        <div className="bg-red-600 px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.22em] text-white">
          SuperAdmin Support Mode — Accessing{" "}
          {adminUser?.restaurantName || "Restaurant Admin"}
        </div>
      )}

      <div className="max-w-[1800px] px-4 mx-auto sm:px-6">
        <div className="flex items-center justify-between h-20 gap-4">
          <div ref={profileRef} className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setProfileOpen((prev) => !prev);
                setMoreOpen(false);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 text-left"
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#3d2412] text-[#f5d27a] font-black border border-[#e8c97a]/60 shadow-sm">
                {isImpersonating
                  ? "S"
                  : role === "kitchen"
                    ? "K"
                    : role === "cashier"
                      ? "C"
                      : "A"}
              </div>

              <div className="hidden leading-none sm:block">
                <h1
                  className="text-[22px] font-black tracking-[-0.04em] text-[#3d2412]"
                  style={{ fontFamily: "'Fraunces', 'DM Sans', serif" }}
                >
                  {adminUser?.restaurantName || "The White House"}
                </h1>

                <div className="flex items-center gap-2 mt-1.5">
                  <p className="text-[10px] font-black tracking-[0.24em] uppercase text-[#b45309]">
                    {isImpersonating ? "Support Mode" : "Café"}
                  </p>

                  <span className="w-1 h-1 bg-orange-200 rounded-full" />

                  <p className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">
                    Admin Panel
                  </p>

                  <ChevronDown
                    size={13}
                    className={`text-gray-400 transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute left-0 z-50 w-[280px] max-w-[calc(100vw-24px)] pt-3 top-full">
                <div className="p-3 bg-white border border-orange-100 shadow-[0_14px_35px_rgba(61,36,18,0.14)] rounded-2xl">
                  <div
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      isImpersonating ? "bg-red-50" : "bg-orange-50"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-xl font-black ${
                        isImpersonating
                          ? "bg-red-600 text-white"
                          : "bg-[#3d2412] text-[#f5d27a]"
                      }`}
                    >
                      {isImpersonating
                        ? "S"
                        : role === "kitchen"
                          ? "K"
                          : role === "cashier"
                            ? "C"
                            : "A"}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-black text-gray-900 truncate">
                        {adminUser?.name || roleLabel}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1">
                        <ShieldCheck
                          size={12}
                          className={
                            isImpersonating ? "text-red-600" : "text-[#d97707]"
                          }
                        />
                        <p
                          className={`text-[11px] font-black capitalize ${
                            isImpersonating ? "text-red-600" : "text-[#d97707]"
                          }`}
                        >
                          {roleLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-3 py-3 mt-2">
                    <p className="text-[11px] font-bold text-gray-400">
                      Signed in as
                    </p>
                    <p className="text-xs font-semibold text-gray-600 truncate">
                      {adminUser?.email || "staff@foodash.com"}
                    </p>

                    {isImpersonating && (
                      <p className="mt-2 text-[11px] font-bold leading-relaxed text-red-500">
                        You are accessing this restaurant as SuperAdmin support.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="flex items-center justify-center w-full gap-2 px-4 py-3 mt-1 text-xs font-black text-red-500 transition rounded-xl hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut size={14} />
                    {isImpersonating ? "Exit Support Mode" : "Logout"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <nav className="items-center justify-center hidden gap-2 lg:flex">
            {mainLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className={linkClass}>
                {link.icon}
                {link.label}
              </NavLink>
            ))}

            {moreLinks.length > 0 && (
              <div ref={moreRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen((prev) => !prev);
                    setProfileOpen(false);
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-bold rounded-xl transition-all duration-300 whitespace-nowrap ${
                    moreOpen
                      ? "bg-orange-50 text-[#d97707]"
                      : "text-gray-600 hover:text-[#d97707] hover:bg-orange-50"
                  }`}
                >
                  <MoreHorizontal size={17} />
                  More
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      moreOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {moreOpen && (
                  <div className="absolute right-0 z-50 w-[260px] pt-3 top-full">
                    <div className="grid gap-1 p-3 bg-white border border-orange-100 shadow-[0_14px_35px_rgba(61,36,18,0.14)] rounded-2xl">
                      {moreLinks.map((link) => (
                        <NavLink
                          key={link.path}
                          to={link.path}
                          onClick={() => setMoreOpen(false)}
                          className={dropdownLinkClass}
                        >
                          {link.icon}
                          {link.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="items-center justify-end hidden min-w-[110px] lg:flex">
            <div className="relative flex items-center justify-center group">
              <img
                src={foodashLogo}
                alt="FoodDash"
                className="object-contain w-auto h-16 transition-all duration-300 opacity-85 group-hover:opacity-100 group-hover:scale-105"
              />

              <div className="pointer-events-none absolute right-0 top-full mt-3 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-amber-700 opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100">
                Powered by FoodDash
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsOpen(!isOpen);
              setProfileOpen(false);
              setMoreOpen(false);
            }}
            className="inline-flex items-center justify-center w-11 h-11 transition border border-orange-100 shadow-sm rounded-2xl lg:hidden text-gray-700 hover:text-[#d97707] hover:bg-orange-50"
          >
            {isOpen ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="bg-white border-t border-orange-100 shadow-lg lg:hidden">
          <div className="max-w-[1800px] px-4 py-4 mx-auto sm:px-6">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {visibleLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={dropdownLinkClass}
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}

              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 transition-all duration-300 rounded-xl hover:bg-red-50"
              >
                <LogOut size={17} />
                {isImpersonating ? "Exit Support Mode" : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#3d2412] via-[#e6b85c] to-[#3d2412]" />
    </header>
  );
}

export default AdminNavbar;
