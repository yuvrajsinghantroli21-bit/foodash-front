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

function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();

  const profileRef = useRef(null);
  const moreRef = useRef(null);

  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  const role = adminUser?.role || "";

  const roleLabel =
    role === "admin"
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
      main: true,
    },
    {
      label: "Orders",
      path: "/admin/history",
      roles: ["admin", "cashier"],
      icon: <History size={17} />,
      main: true,
    },
    {
      label: "Kitchen",
      path: "/admin/kitchen",
      roles: ["admin", "kitchen"],
      icon: <Flame size={17} />,
      main: true,
    },
    {
      label: "Analytics",
      path: "/admin/analytics",
      roles: ["admin"],
      icon: <BarChart3 size={17} />,
      main: true,
    },
    {
      label: "Menu",
      path: "/admin/menu",
      roles: ["admin"],
      icon: <MenuIcon size={17} />,
    },
    {
      label: "QR Tables",
      path: "/admin/tables/manage",
      roles: ["admin"],
      icon: <QrCode size={17} />,
    },
    {
      label: "Current Tables",
      path: "/admin/tables/current",
      roles: ["admin", "cashier"],
      icon: <Activity size={17} />,
    },
    {
      label: "Staff",
      path: "/admin/staff",
      roles: ["admin"],
      icon: <UserCog size={17} />,
    },
    {
      label: "Enquiries",
      path: "/admin/enquiries",
      roles: ["admin", "cashier"],
      icon: <Inbox size={17} />,
    },
    {
      label: "Feedback",
      path: "/admin/feedback",
      roles: ["admin", "cashier"],
      icon: <Star size={17} />,
    },
    {
      label: "Settings",
      path: "/admin/settings",
      roles: ["admin"],
      icon: <Settings size={17} />,
    },
    {
      label: "Coupons",
      path: "/admin/coupons",
      roles: ["admin"],
      icon: <TicketPercent size={17} />,
    },
  ];

  const visibleLinks = navLinks.filter((link) => link.roles.includes(role));
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
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold rounded-xl transition-all duration-300 whitespace-nowrap ${
      isActive
        ? "bg-[#d97707] text-white shadow-sm shadow-orange-200"
        : "text-gray-600 hover:text-[#d97707] hover:bg-orange-50"
    }`;

  const dropdownLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
      isActive
        ? "bg-[#d97707] text-white shadow-sm shadow-orange-200"
        : "text-gray-700 hover:text-[#d97707] hover:bg-orange-50"
    }`;

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-[1800px] px-4 mx-auto sm:px-6">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* LEFT BRAND */}
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
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[#d97707] text-white font-extrabold border-4 border-orange-100 shadow-sm">
                W
              </div>

              <div className="hidden leading-none sm:block">
                <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
                  The White House
                </h1>

                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#d97707]">
                    Café
                  </p>

                  <span className="w-1 h-1 bg-gray-300 rounded-full" />

                  <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-gray-400">
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
              <div className="absolute left-0 z-50 w-[260px] max-w-[calc(100vw-24px)] pt-3 top-full">
                <div className="p-3 bg-white border border-gray-100 shadow-[0_14px_35px_rgba(15,23,42,0.12)] rounded-2xl">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#d97707] text-white font-extrabold">
                      {role === "kitchen"
                        ? "K"
                        : role === "cashier"
                          ? "C"
                          : "A"}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-gray-900 truncate">
                        {adminUser?.name || roleLabel}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1">
                        <ShieldCheck size={12} className="text-[#d97707]" />
                        <p className="text-[11px] font-bold text-[#d97707] capitalize">
                          {roleLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 px-3 py-3 mt-2">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400">
                        Signed in as
                      </p>
                      <p className="text-xs font-semibold text-gray-600 truncate max-w-[135px]">
                        {adminUser?.email || "staff@foodash.com"}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-red-500 hover:text-red-600"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DESKTOP NAV */}
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
                  className={`inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold rounded-xl transition-all duration-300 whitespace-nowrap ${
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
                    <div className="grid gap-1 p-3 bg-white border border-gray-100 shadow-[0_14px_35px_rgba(15,23,42,0.12)] rounded-2xl">
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

          {/* MOBILE HAMBURGER */}
          <button
            onClick={() => {
              setIsOpen(!isOpen);
              setProfileOpen(false);
              setMoreOpen(false);
            }}
            className="inline-flex items-center justify-center w-11 h-11 transition border border-gray-200 shadow-sm rounded-2xl lg:hidden text-gray-700 hover:text-[#d97707] hover:bg-orange-50"
          >
            {isOpen ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="bg-white border-t border-gray-100 shadow-lg lg:hidden">
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
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 transition-all duration-300 rounded-xl hover:bg-red-50"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#d97707] via-[#e6b85c] to-[#d97707]" />
    </header>
  );
}

export default AdminNavbar;
