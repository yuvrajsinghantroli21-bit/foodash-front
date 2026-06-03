import { useContext } from "react";
import { Sun, Moon } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";

function ThemeToggle() {
  const { dark, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-10 h-10 transition-all duration-500 rounded-full shadow-md bg-slate-200 dark:bg-slate-800 hover:scale-110"
    >
      {/* SUN */}
      <Sun
        size={18}
        className={`absolute transition-all duration-500 ${
          dark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100 text-yellow-500"
        }`}
      />

      {/* MOON */}
      <Moon
        size={18}
        className={`absolute transition-all duration-500 ${
          dark
            ? "rotate-0 scale-100 opacity-100 text-blue-400"
            : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </button>
  );
}

export default ThemeToggle;
