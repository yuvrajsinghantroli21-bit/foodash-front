import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { motion } from "framer-motion";
import img from "../../public/whitehouse_profile.jpg";

function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const table = localStorage.getItem("table");
  const token = localStorage.getItem("token");

  /* ✅ SMART ORDER NAVIGATION */
  const handleOrderClick = () => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/order");
    } else {
      navigate("/menu-preview");
    }

    setOpen(false); // close mobile menu
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Order", path: "/order" }, // will override logic
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="w-full border-b shadow-md bg-gradient-to-r from-slate-950 to-slate-900">
      <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <img
            src={img}
            alt="White House Cafe"
            className="object-cover w-10 h-10 border rounded-full"
          />

          <div>
            <h1 className="text-lg font-bold tracking-wide text-white">
              The White House
            </h1>
            <p className="text-xs tracking-wider text-emerald-400">CAFÉ</p>
          </div>
        </div>

        {/* NAV LINKS */}
        <nav className="items-center hidden gap-8 text-gray-400 md:flex">
          {navItems.map((item, i) => {
            const active =
              item.name === "Order"
                ? location.pathname === "/order" ||
                  location.pathname === "/menu-preview"
                : location.pathname === item.path;

            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.08 }}
                className="relative"
              >
                {/* ✅ ORDER BUTTON (SPECIAL CASE) */}
                {item.name === "Order" ? (
                  <button
                    onClick={handleOrderClick}
                    className={`transition ${
                      active ? "text-emerald-400" : "hover:text-white"
                    }`}
                  >
                    {token ? "Order Now 🚀" : "Menu"}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`transition ${
                      active ? "text-emerald-400" : "hover:text-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                )}

                {active && (
                  <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-emerald-400 rounded-full"></span>
                )}
              </motion.div>
            );
          })}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          {/* TABLE */}
          {table && (
            <div className="hidden px-3 py-1 text-sm border rounded-full text-emerald-400 border-emerald-500 md:block">
              Table {table}
            </div>
          )}

          {/* THEME */}
          <div className="relative group">
            <div className="p-2 transition rounded-full bg-white/10 hover:bg-white/20">
              <ThemeToggle />
            </div>

            <span className="absolute right-0 px-2 py-1 text-xs text-white transition bg-black rounded opacity-0 -bottom-8 group-hover:opacity-100">
              Switch theme
            </span>
          </div>

          {/* MOBILE MENU BTN */}
          <button
            className="text-white md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="flex flex-col gap-4 px-6 pb-6 text-gray-300 md:hidden bg-zinc-900">
          {navItems.map((item, i) =>
            item.name === "Order" ? (
              <button
                key={i}
                onClick={handleOrderClick}
                className="text-left hover:text-white"
              >
                {item.name}
              </button>
            ) : (
              <Link
                key={i}
                to={item.path}
                onClick={() => setOpen(false)}
                className="hover:text-white"
              >
                {item.name}
              </Link>
            ),
          )}

          {table && (
            <div className="text-sm text-emerald-400">Table {table}</div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
