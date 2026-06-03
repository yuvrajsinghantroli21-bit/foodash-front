import { useEffect, useMemo, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Home,
  Grid2X2,
  Tag,
  Mail,
  Menu,
  X,
  ArrowRight,
  UserRound,
  BriefcaseBusiness,
  LogOut,
} from "lucide-react";

const navLinks = [
  { label: "Home", path: "/", icon: Home },
  { label: "Features", path: "/features", icon: Grid2X2 },
  { label: "Pricing", path: "/pricing", icon: Tag },
  { label: "Contact", path: "/contact", icon: Mail },
];

function WebsiteNavbar() {
  const [open, setOpen] = useState(false);
  const [authTick, setAuthTick] = useState(0);

  const ownerToken = localStorage.getItem("ownerToken");

  const ownerUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("ownerUser") || "null");
    } catch {
      return null;
    }
  }, [authTick]);

  const isLoggedIn = Boolean(ownerToken);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleStorage = () => setAuthTick((prev) => prev + 1);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("ownerAuthChanged", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("ownerAuthChanged", handleStorage);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("ownerToken");
    localStorage.removeItem("ownerUser");
    window.dispatchEvent(new Event("ownerAuthChanged"));
    setOpen(false);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#fffaf3]">
      <nav className="flex w-full items-center justify-between border-b border-amber-200/70 bg-[#fffaf3] px-4 py-3 shadow-[0_12px_35px_rgba(80,45,20,0.06)] sm:px-6 lg:px-10 lg:py-4">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <span className="font-display text-[1.65rem] font-black tracking-[-0.06em] text-[#2d180d] sm:text-[2rem]">
            Q<span className="text-[#d68110]">zora</span>
          </span>
          <span className="hidden rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-amber-700 shadow-sm sm:inline-flex">
            QR SaaS
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="items-center hidden gap-6 lg:flex xl:gap-8">
          {navLinks.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex flex-col items-center justify-center gap-1 text-[14px] font-extrabold transition-all duration-300 ${
                    isActive
                      ? "text-[#df850f]"
                      : "text-[#3b2113] hover:text-[#df850f]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2">
                      <Icon
                        size={20}
                        strokeWidth={isActive ? 2.4 : 2}
                        className="transition-transform duration-300 group-hover:-translate-y-0.5"
                      />
                      <span>{item.label}</span>
                    </div>

                    <span
                      className={`absolute -bottom-3 h-[3px] rounded-full bg-[#df850f] transition-all duration-300 ${
                        isActive
                          ? "w-9 opacity-100"
                          : "w-0 opacity-0 group-hover:w-7 group-hover:opacity-100"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            );
          })}

          {isLoggedIn && (
            <NavLink
              to="/business"
              className={({ isActive }) =>
                `group relative flex flex-col items-center justify-center gap-1 text-[14px] font-extrabold transition-all duration-300 ${
                  isActive
                    ? "text-[#df850f]"
                    : "text-[#3b2113] hover:text-[#df850f]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness
                      size={20}
                      strokeWidth={isActive ? 2.4 : 2}
                      className="transition-transform duration-300 group-hover:-translate-y-0.5"
                    />
                    <span>Business Portal</span>
                  </div>

                  <span
                    className={`absolute -bottom-3 h-[3px] rounded-full bg-[#df850f] transition-all duration-300 ${
                      isActive
                        ? "w-9 opacity-100"
                        : "w-0 opacity-0 group-hover:w-7 group-hover:opacity-100"
                    }`}
                  />
                </>
              )}
            </NavLink>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="items-center hidden gap-5 lg:flex">
          <div className="h-10 w-px bg-gradient-to-b from-transparent via-[#d7a15b] to-transparent" />

          {isLoggedIn ? (
            <>
              <Link
                to="/business"
                className="flex max-w-[220px] items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-[13px] font-extrabold text-[#3b2113] shadow-sm transition-colors duration-300 hover:text-[#df850f]"
                title={
                  ownerUser?.restaurantName ||
                  ownerUser?.name ||
                  "Business Portal"
                }
              >
                <BriefcaseBusiness size={18} />
                <span className="truncate">
                  {ownerUser?.restaurantName || "Business Portal"}
                </span>
              </Link>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-[1.2rem] border border-red-200 bg-red-50 px-5 py-3 text-[14px] font-black text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 text-[14px] font-extrabold text-[#3b2113] transition-colors duration-300 hover:text-[#df850f]"
              >
                <UserRound size={19} />
                Login
              </Link>

              <Link
                to="/register"
                className="group flex items-center gap-3 rounded-[1.35rem] bg-gradient-to-r from-[#e99b1c] to-[#d57908] px-6 py-3 text-[14px] font-black text-white shadow-[0_14px_30px_rgba(213,121,8,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(213,121,8,0.3)]"
              >
                Get Started
                <ArrowRight
                  size={19}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200 bg-white text-[#3b2113] shadow-sm lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </nav>

      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-[#2d180d]/35 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="ml-auto flex h-full w-[86vw] max-w-[380px] flex-col bg-[#fffaf3] p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="font-display text-3xl font-black tracking-[-0.06em] text-[#2d180d]"
              >
                Q<span className="text-[#d68110]">zora</span>
              </Link>

              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-white text-[#3b2113]"
                aria-label="Close menu"
              >
                <X size={21} />
              </button>
            </div>

            {isLoggedIn && (
              <div className="p-4 mb-5 bg-white border shadow-sm rounded-3xl border-amber-100">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-700">
                  Signed in
                </p>
                <p className="mt-1 truncate text-sm font-black text-[#2d180d]">
                  {ownerUser?.restaurantName ||
                    ownerUser?.name ||
                    "Business Owner"}
                </p>
                <p className="mt-1 truncate text-xs font-semibold text-[#7a5a40]">
                  {ownerUser?.email || "Qzora account"}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-black transition-all duration-300 ${
                        isActive
                          ? "bg-amber-100 text-[#d57908]"
                          : "text-[#3b2113] hover:bg-amber-50"
                      }`
                    }
                  >
                    <Icon size={21} />
                    {item.label}
                  </NavLink>
                );
              })}

              {isLoggedIn && (
                <NavLink
                  to="/business"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-black transition-all duration-300 ${
                      isActive
                        ? "bg-amber-100 text-[#d57908]"
                        : "text-[#3b2113] hover:bg-amber-50"
                    }`
                  }
                >
                  <BriefcaseBusiness size={21} />
                  Business Portal
                </NavLink>
              )}
            </div>

            <div className="grid gap-3 pt-8 mt-auto">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-black text-red-600 shadow-sm rounded-2xl bg-red-50"
                >
                  <LogOut size={19} />
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-white px-5 py-3 text-sm font-black text-[#3b2113]"
                  >
                    <UserRound size={19} />
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#e99b1c] to-[#d57908] px-5 py-3 text-sm font-black text-white shadow-lg shadow-amber-900/15"
                  >
                    Get Started
                    <ArrowRight size={19} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default WebsiteNavbar;
