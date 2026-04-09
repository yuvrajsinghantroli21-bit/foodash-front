import { Link } from "react-router-dom";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="text-white shadow-lg bg-slate-900">
      <div className="flex items-center justify-between max-w-6xl px-6 py-4 mx-auto">
        <h1 className="text-lg font-bold">Admin Panel</h1>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          {/* DESKTOP NAV */}
          <nav className="items-center hidden gap-6 md:flex">
            <Link to="/admin/dashboard" className="hover:text-emerald-400">
              Dashboard
            </Link>

            <Link to="/admin/menu" className="hover:text-emerald-400">
              Menu
            </Link>

            <Link to="/admin/history" className="hover:text-emerald-400">
              History
            </Link>
          </nav>

          {/* THEME TOGGLE (ALWAYS VISIBLE) */}
          <ThemeToggle />

          {/* HAMBURGER BUTTON (MOBILE ONLY) */}
          <button
            className="text-2xl md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU (ONLY LINKS) */}
      {isOpen && (
        <div className="flex flex-col gap-4 px-6 pb-4 md:hidden bg-slate-800">
          <Link
            to="/admin/dashboard"
            onClick={() => setIsOpen(false)}
            className="hover:text-emerald-400"
          >
            Dashboard
          </Link>

          <Link
            to="/admin/menu"
            onClick={() => setIsOpen(false)}
            className="hover:text-emerald-400"
          >
            Menu
          </Link>

          <Link
            to="/admin/history"
            onClick={() => setIsOpen(false)}
            className="hover:text-emerald-400"
          >
            History
          </Link>
        </div>
      )}
    </header>
  );
}

export default AdminNavbar;
