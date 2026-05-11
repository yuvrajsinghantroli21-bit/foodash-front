import { useState } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  Home,
  Info,
  Phone,
  Utensils,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import img from "../../public/whitehouse_profile.jpg";
import foodashLogo from "../../public/foodash_logo.png";

function Navbar({ totalItems = 0 }) {
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const table = localStorage.getItem("table");
  const token = localStorage.getItem("token");

  const hasSession = Boolean(token);

  const handleMenuClick = () => {
    if (hasSession) {
      navigate("/order");
    } else {
      navigate("/menu-preview");
    }

    setOpen(false);
  };

  const navItems = [
    { name: "Home", path: "/", icon: <Home size={16} /> },
    { name: "Menu", action: handleMenuClick, icon: <Utensils size={16} /> },
    { name: "About", path: "/about", icon: <Info size={16} /> },
    { name: "Contact", path: "/contact", icon: <Phone size={16} /> },
  ];

  const isActive = (item) => {
    if (item.name === "Menu") {
      return ["/menu", "/menu-preview", "/order"].includes(location.pathname);
    }

    return location.pathname === item.path;
  };

  const desktopLinkClass = (active) =>
    `inline-flex items-center gap-2 px-4 py-2 text-[14px] font-semibold rounded-xl transition-all duration-300 whitespace-nowrap ${
      active
        ? "bg-[#d97707] text-white shadow-sm shadow-orange-200"
        : "text-[#514739] hover:text-[#d97707] hover:bg-orange-50"
    }`;

  const mobileLinkClass = (active) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
      active
        ? "bg-[#d97707] text-white shadow-sm shadow-orange-200"
        : "text-[#514739] hover:text-[#d97707] hover:bg-orange-50"
    }`;

  return (
    <header
      className="sticky top-0 z-50 w-full bg-[#fbf7ef]/95 border-b border-orange-100 shadow-sm backdrop-blur-md"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex items-center justify-between min-h-[76px] px-3 py-3 mx-auto max-w-7xl sm:px-5 lg:px-8">
        {/* LEFT BRAND */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="flex items-center justify-center w-12 h-12 overflow-hidden bg-white border border-orange-200 rounded-full shadow-sm sm:w-14 sm:h-14">
            <img
              src={img}
              alt="White House Cafe"
              className="object-cover w-full h-full"
            />
          </div>

          <div className="leading-none">
            <h1
              className="text-[16px] sm:text-xl font-bold tracking-tight text-[#2d2416] whitespace-nowrap"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              The White House
            </h1>

            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.24em] text-[#d97707] uppercase">
                Café
              </p>

              {hasSession && table && (
                <>
                  <span className="hidden w-1 h-1 bg-orange-200 rounded-full sm:block" />

                  <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-white rounded-full bg-[#d97707]">
                    Table {table}
                  </span>
                </>
              )}
            </div>
          </div>
        </Link>

        {/* CENTER LINKS */}
        <nav className="absolute items-center hidden gap-2 -translate-x-1/2 lg:flex left-1/2">
          {navItems.map((item) => {
            const active = isActive(item);

            return item.action ? (
              <button
                key={item.name}
                onClick={item.action}
                className={desktopLinkClass(active)}
              >
                {item.icon}
                {item.name}
              </button>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                className={desktopLinkClass(active)}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-2 shrink-0">
          {/* FOODASH LOGO */}

          {hasSession && (
            <>
              <Link
                to="/cart"
                className="flex items-center gap-1.5 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-orange-200 text-[#4b3b25] text-[11px] sm:text-sm bg-white hover:bg-orange-50 hover:text-[#d97707] transition-all duration-300 shadow-sm whitespace-nowrap"
              >
                <ShoppingCart size={15} />

                <span className="hidden font-semibold sm:inline">Cart</span>

                <span className="font-semibold">({totalItems})</span>
              </Link>

              <Link
                to="/my-order"
                className="hidden sm:flex px-4 py-2.5 text-xs sm:text-sm font-semibold text-white rounded-xl bg-[#d97707] shadow-sm shadow-orange-200 hover:bg-[#b86405] transition-all duration-300 whitespace-nowrap"
              >
                My Order →
              </Link>
            </>
          )}

          {/* FOODASH LOGO */}
          <div className="relative items-center justify-center hidden group lg:flex">
            <img
              src={foodashLogo}
              alt="FoodDash"
              className="object-contain w-auto h-16 pt-2 transition-all duration-300 opacity-85 hover:opacity-100 hover:scale-105"
            />

            {/* TOOLTIP */}
            {/* <div className="pointer-events-none absolute right-0 top-full mt-3 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-amber-700 opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              Powered by FoodDash
            </div> */}
          </div>

          <button
            className="flex items-center justify-center w-10 h-10 transition-all duration-300 bg-white border border-orange-100 shadow-sm rounded-xl lg:hidden text-[#5b4b36] hover:text-[#d97707] hover:bg-orange-50"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="px-4 pb-5 border-t lg:hidden bg-[#fbf7ef] border-orange-100 shadow-lg">
          <div className="flex flex-col gap-2 pt-4">
            {/* MOBILE FOODASH LOGO */}

            {navItems.map((item) => {
              const active = isActive(item);

              return item.action ? (
                <button
                  key={item.name}
                  onClick={item.action}
                  className={mobileLinkClass(active)}
                >
                  {item.icon}
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={mobileLinkClass(active)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}

            {hasSession && (
              <div className="grid grid-cols-1 gap-2 pt-2 sm:hidden">
                <Link
                  to="/cart"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition bg-white border border-orange-100 rounded-xl text-[#4b3b25] hover:text-[#d97707] hover:bg-orange-50"
                >
                  <ShoppingCart size={16} />
                  Cart ({totalItems})
                </Link>

                <Link
                  to="/my-order"
                  onClick={() => setOpen(false)}
                  className="flex justify-center px-4 py-3 text-sm font-semibold text-white rounded-xl bg-[#d97707] hover:bg-[#b86405] transition"
                >
                  My Order →
                </Link>
              </div>
            )}

            <div className="">
              {/* <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b66a08]">
                Powered by
              </span> */}

              <img
                src={foodashLogo}
                alt="Foodash"
                className="object-contain w-auto h-16"
              />
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#d97707] via-[#e6b85c] to-[#d97707]" />
    </header>
  );
}

export default Navbar;
