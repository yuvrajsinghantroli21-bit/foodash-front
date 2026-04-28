import { useState } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import img from "../../public/whitehouse_profile.jpg";

function Navbar({ totalItems = 0 }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const table = localStorage.getItem("table");
  const token = localStorage.getItem("token");
  const hasSession = Boolean(token);

  const handleMenuClick = () => {
    if (hasSession) {
      navigate("/menu");
    } else {
      navigate("/menu-preview");
    }
    setOpen(false);
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Menu", action: handleMenuClick },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (item) => {
    if (item.name === "Menu") {
      return ["/menu", "/menu-preview", "/order"].includes(location.pathname);
    }
    return location.pathname === item.path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#d4a84b33] bg-[#faf6ee] shadow-[0_1px_10px_0_#d4a84b18]">
      <div className="flex items-center justify-between min-h-[72px] px-3 py-3 mx-auto max-w-7xl sm:px-5 lg:px-8">
        {/* LEFT */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* LOGO IMAGE PLACE */}
          <div className="flex items-center justify-center w-12 h-12 overflow-hidden rounded-full border-[1.5px] border-[#c9952a] bg-white sm:w-14 sm:h-14">
            <img
              src={img}
              alt="White House Cafe"
              className="object-cover w-full h-full"
            />
          </div>

          <div className="leading-tight">
            <h1
              className="text-[15px] sm:text-lg font-bold text-[#2d2416] whitespace-nowrap"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              The White House
            </h1>

            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] sm:text-xs tracking-[0.22em] text-[#c9952a]">
                CAFÉ
              </p>

              {hasSession && table && (
                <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white rounded-full bg-[#c9952a]">
                  Table {table}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* CENTER LINKS - hide before lg to avoid collision */}
        <nav className="absolute items-center hidden gap-9 text-sm font-medium -translate-x-1/2 lg:flex left-1/2 text-[#4b4438]">
          {navItems.map((item) => {
            const active = isActive(item);

            return item.action ? (
              <button
                key={item.name}
                onClick={item.action}
                className={`relative transition ${
                  active ? "text-[#c9952a]" : "hover:text-[#c9952a]"
                }`}
              >
                {item.name}
                {active && (
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-6 h-[2px] bg-[#c9952a] rounded-full" />
                )}
              </button>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                className={`relative transition ${
                  active ? "text-[#c9952a]" : "hover:text-[#c9952a]"
                }`}
              >
                {item.name}
                {active && (
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-6 h-[2px] bg-[#c9952a] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-2 shrink-0">
          {/* show outside hamburger on small screen also */}
          {hasSession && (
            <>
              <Link
                to="/cart"
                className="flex items-center gap-1.5 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-[#c9952a55] text-[#3f3526] text-[11px] sm:text-sm bg-[#faf6ee] hover:bg-[#fffaf0] transition"
              >
                <ShoppingCart size={15} />
                <span className="hidden xs:inline">Cart</span>
                <span>({totalItems})</span>
              </Link>

              <Link
                to="/my-order"
                className="hidden sm:flex px-4 py-2.5 text-xs sm:text-sm font-semibold text-white rounded-xl bg-gradient-to-br from-[#d4a030] via-[#c9952a] to-[#a87420] shadow-md hover:shadow-lg transition whitespace-nowrap"
              >
                My Order →
              </Link>
            </>
          )}

          {/* MOBILE MENU BUTTON */}
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#c9952a55] text-[#7a5520] lg:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE/TABLET MENU */}
      {open && (
        <div className="px-4 pb-5 lg:hidden bg-[#faf6ee] border-t border-[#d4a84b33]">
          <div className="flex flex-col gap-2 pt-4">
            {navItems.map((item) =>
              item.action ? (
                <button
                  key={item.name}
                  onClick={item.action}
                  className={`px-4 py-3 text-left rounded-xl ${
                    isActive(item)
                      ? "bg-[#c9952a12] text-[#c9952a]"
                      : "text-[#4b4438] hover:bg-[#c9952a12]"
                  }`}
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 rounded-xl ${
                    isActive(item)
                      ? "bg-[#c9952a12] text-[#c9952a]"
                      : "text-[#4b4438] hover:bg-[#c9952a12]"
                  }`}
                >
                  {item.name}
                </Link>
              ),
            )}

            {/* My order visible in menu only on very small screens */}
            {hasSession && (
              <Link
                to="/my-order"
                onClick={() => setOpen(false)}
                className="flex sm:hidden justify-center px-4 py-3 mt-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-br from-[#d4a030] via-[#c9952a] to-[#a87420]"
              >
                My Order →
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
