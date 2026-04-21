// import { useState, useContext } from "react";
// import { Menu, X, Moon } from "lucide-react";
// import { Link } from "react-router-dom";
// import { ThemeContext } from "../context/ThemeContext";
// import ThemeToggle from "./ThemeToggle";

// function Navbar() {
//   const [open, setOpen] = useState(false);

//   const { toggleTheme } = useContext(ThemeContext);

//   return (
//     <header className="text-white shadow-lg bg-gradient-to-r from-slate-900 to-slate-800">
//       <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
//         <h1 className="text-xl font-bold tracking-wide">🍽 FoodDash</h1>

//         <nav className="hidden gap-8 text-gray-300 md:flex">
//           <Link className="transition hover:text-white hover:scale-105" to="/">
//             Home
//           </Link>

//           <Link
//             className="transition hover:text-white hover:scale-105"
//             to="/order"
//           >
//             Order
//           </Link>

//           <Link
//             className="transition hover:text-white hover:scale-105"
//             to="/about"
//           >
//             About
//           </Link>

//           <Link
//             className="transition hover:text-white hover:scale-105"
//             to="/contact"
//           >
//             Contact
//           </Link>
//         </nav>

//         <div className="flex items-center gap-4">
//           {/* THEME BUTTON */}
//           <button onClick={toggleTheme} className="transition hover:rotate-45">
//             {/* <Moon size={18} /> */}
//           </button>

//           {/* <button className="md:hidden" onClick={() => setOpen(!open)}>
//             {open ? <X /> : <Menu />}
//           </button> */}

//           <ThemeToggle />

//           <button className="md:hidden" onClick={() => setOpen(!open)}>
//             {open ? <X /> : <Menu />}
//           </button>
//         </div>
//       </div>

//       {open && (
//         <div className="flex flex-col gap-4 px-6 pb-6 md:hidden bg-slate-900">
//           <Link to="/">Home</Link>
//           <Link to="/order">Order</Link>
//           <Link to="/about">About</Link>
//           <Link to="/contact">Contact</Link>
//         </div>
//       )}
//     </header>
//   );
// }

// export default Navbar;

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { motion } from "framer-motion";
import img from "../../public/whitehouse_profile.jpg";

function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const table = localStorage.getItem("table");

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Order", path: "/order" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="w-full border-b shadow-md bg-gradient-to-r from-slate-950 to-slate-900">
      <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        {/* LOGO + BRAND */}
        <div className="flex items-center gap-3">
          <img
            src={img}
            alt="White House Cafe"
            className="object-cover w-10 h-10 border rounded-full "
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
            const active = location.pathname === item.path;

            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.08 }}
                className="relative"
              >
                <Link
                  to={item.path}
                  className={`transition ${
                    active ? "text-emerald-400" : "hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>

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

          {/* THEME BUTTON (FIXED) */}
          <div className="relative group">
            <div className="p-2 transition rounded-full bg-white/10 hover:bg-white/20">
              <ThemeToggle />
            </div>

            <span className="absolute right-0 px-2 py-1 text-xs text-white transition bg-black rounded opacity-0 -bottom-8 group-hover:opacity-100">
              Switch theme
            </span>
          </div>

          {/* MOBILE MENU */}
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
          {navItems.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              onClick={() => setOpen(false)}
              className="hover:text-white"
            >
              {item.name}
            </Link>
          ))}

          {table && (
            <div className="text-sm text-emerald-400">Table {table}</div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
