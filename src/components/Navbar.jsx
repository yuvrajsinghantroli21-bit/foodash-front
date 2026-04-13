import { useState, useContext } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { toggleTheme } = useContext(ThemeContext);

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b backdrop-blur-lg bg-white/10 dark:bg-black/30 border-white/10">
      <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        {/* 🔥 LOGO SECTION */}
        <div className="flex items-center gap-3">
          {/* 👉 Replace with your logo path */}
          <img
            src="/public/whitehouse_profile.jpg"
            alt="White House Cafe"
            className="object-contain w-10 h-10 rounded-full"
          />

          <h1 className="text-lg font-bold tracking-wide text-white">
            FoodDash
          </h1>
        </div>

        {/* DESKTOP NAV */}
        <nav className="items-center hidden gap-8 text-gray-200 md:flex">
          {["Home", "Order", "About", "Contact"].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1 }}
              className="relative group"
            >
              <Link
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="transition"
              >
                {item}
              </Link>

              {/* UNDERLINE ANIMATION */}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-emerald-400 transition-all group-hover:w-full"></span>
            </motion.div>
          ))}
        </nav>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-4">
          {/* 🌙 THEME BUTTON WITH TOOLTIP */}
          <div className="relative group">
            <button
              onClick={toggleTheme}
              className="p-2 transition rounded-full bg-white/10 hover:bg-white/20"
            >
              <ThemeToggle />
            </button>

            {/* TOOLTIP */}
            <span className="absolute px-3 py-1 text-xs text-white transition -translate-x-1/2 bg-black rounded opacity-0 -bottom-10 left-1/2 whitespace-nowrap group-hover:opacity-100">
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
        <div className="flex flex-col gap-4 px-6 pb-6 text-white md:hidden bg-black/80 backdrop-blur-lg">
          <Link to="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link to="/order" onClick={() => setOpen(false)}>
            Order
          </Link>
          <Link to="/about" onClick={() => setOpen(false)}>
            About
          </Link>
          <Link to="/contact" onClick={() => setOpen(false)}>
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}

export default Navbar;
