import { useState, useContext } from "react";
import { Menu, X, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const [open, setOpen] = useState(false);

  const { toggleTheme } = useContext(ThemeContext);

  return (
    <header className="text-white shadow-lg bg-gradient-to-r from-slate-900 to-slate-800">
      <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        <h1 className="text-xl font-bold tracking-wide">🍽 FoodDash</h1>

        <nav className="hidden gap-8 text-gray-300 md:flex">
          <Link className="transition hover:text-white hover:scale-105" to="/">
            Home
          </Link>

          <Link
            className="transition hover:text-white hover:scale-105"
            to="/order"
          >
            Order
          </Link>

          <Link
            className="transition hover:text-white hover:scale-105"
            to="/about"
          >
            About
          </Link>

          <Link
            className="transition hover:text-white hover:scale-105"
            to="/contact"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* THEME BUTTON */}
          <button onClick={toggleTheme} className="transition hover:rotate-45">
            {/* <Moon size={18} /> */}
          </button>

          {/* <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button> */}

          <ThemeToggle />

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-4 px-6 pb-6 md:hidden bg-slate-900">
          <Link to="/">Home</Link>
          <Link to="/order">Order</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
      )}
    </header>
  );
}

export default Navbar;
