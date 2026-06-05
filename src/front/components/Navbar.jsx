import { useState } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  Home,
  Info,
  Phone,
  Utensils,
  ReceiptText,
  BadgePercent,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import defaultImg from "../../../public/whitehouse_profile.jpg";
import foodashLogo from "../../../public/foodash_logo.png";
import { useWebsiteSettings } from "../../context/WebsiteSettingsContext";

function Navbar({ totalItems = 0 }) {
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { settings = {}, loadingSettings } = useWebsiteSettings();

  if (loadingSettings) {
    return null;
  }

  const table = localStorage.getItem("table");
  const token = localStorage.getItem("token");
  const hasSession = Boolean(token);

  const cafeName = settings?.cafeName || "The White House Café";
  const logo = settings?.logo || defaultImg;

  const navbarLayout = settings?.navbarLayout || "logoLeft";
  const logoPosition = settings?.logoPosition || "left";

  const stickyNavbar = settings?.stickyNavbar !== false;
  const transparentNavbar = settings?.transparentNavbar === true;

  const navbarBg = settings?.navbarBgColor || "#fbf7ef";
  const navbarText = settings?.navbarTextColor || "#2d2416";
  const activeColor = settings?.navbarActiveLinkColor || "#d97707";
  const accentColor = settings?.accentColor || activeColor;

  const buttonColor = settings?.buttonColor || activeColor;
  const buttonTextColor = settings?.buttonTextColor || "#ffffff";
  const navbarButtonStyle = settings?.navbarButtonStyle || "filled";

  const mobileMenuStyle = settings?.mobileMenuStyle || "slide";

  const navHeight = Number(settings?.navbarHeight || 76);
  const navRadius = Number(settings?.navRounded || 14);

  const myOrderText = settings?.myOrderButtonText || "My Order";
  const cartButtonText = settings?.cartButtonText || "Cart";

  const showFoodDashLogo = settings?.showFoodDashLogo !== false;

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
    { name: "Coupons", path: "/coupons", icon: <BadgePercent size={16} /> },
  ];

  const isActive = (item) => {
    if (item.name === "Menu") {
      return ["/menu", "/menu-preview", "/order"].includes(location.pathname);
    }

    return location.pathname === item.path;
  };

  const brandParts = cafeName.trim().split(" ");
  const lastWord =
    brandParts.length > 1 ? brandParts[brandParts.length - 1] : "Café";
  const mainName =
    brandParts.length > 1 ? brandParts.slice(0, -1).join(" ") : cafeName;

  const getNavButtonStyle = () => {
    if (navbarButtonStyle === "outline") {
      return {
        background: "transparent",
        color: buttonColor,
        border: `1px solid ${buttonColor}`,
        borderRadius: navbarButtonStyle === "pill" ? "999px" : `${navRadius}px`,
      };
    }

    if (navbarButtonStyle === "ghost") {
      return {
        background: "transparent",
        color: navbarText,
        border: `1px solid transparent`,
        borderRadius: navbarButtonStyle === "pill" ? "999px" : `${navRadius}px`,
      };
    }

    return {
      background: buttonColor,
      color: buttonTextColor,
      border: `1px solid ${buttonColor}`,
      borderRadius: navbarButtonStyle === "pill" ? "999px" : `${navRadius}px`,
    };
  };

  const desktopLinkStyle = (active) => ({
    background: active ? activeColor : "transparent",
    color: active ? "#ffffff" : navbarText,
    borderRadius: `${navRadius}px`,
  });

  const mobileLinkStyle = (active) => ({
    background: active ? activeColor : "transparent",
    color: active ? "#ffffff" : navbarText,
    borderRadius: `${navRadius}px`,
  });

  const headerPositionClass = stickyNavbar ? "sticky top-0" : "relative";

  const headerBg = transparentNavbar
    ? "rgba(255,255,255,0.18)"
    : `${navbarBg}F2`;

  const layoutClass =
    navbarLayout === "logoRight" || logoPosition === "right"
      ? "justify-between flex-row-reverse"
      : navbarLayout === "logoCentered" || logoPosition === "center"
        ? "justify-center"
        : "justify-between";

  const navPositionClass =
    navbarLayout === "logoCentered" || logoPosition === "center"
      ? "hidden"
      : "absolute items-center hidden gap-2 -translate-x-1/2 lg:flex left-1/2";

  const mobileMenuClass =
    mobileMenuStyle === "fullscreen"
      ? "fixed inset-x-0 top-[76px] min-h-[calc(100vh-76px)] px-4 pb-5 border-t shadow-lg lg:hidden"
      : mobileMenuStyle === "dropdown"
        ? "absolute left-3 right-3 top-full px-4 pb-5 border rounded-2xl shadow-xl lg:hidden"
        : "px-4 pb-5 border-t shadow-lg lg:hidden";

  return (
    <header
      className={`${headerPositionClass} z-50 w-full border-b shadow-sm backdrop-blur-md`}
      style={{
        background: headerBg,
        borderColor: `${accentColor}26`,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className={`relative flex items-center px-3 py-3 mx-auto max-w-7xl sm:px-5 lg:px-8 ${layoutClass}`}
        style={{ minHeight: `${navHeight}px` }}
      >
        {/* BRAND */}
        <Link to="/" className="flex items-center min-w-0 gap-3 shrink">
          <div
            className="flex items-center justify-center w-12 h-12 overflow-hidden bg-white border rounded-full shadow-sm sm:w-14 sm:h-14 shrink-0"
            style={{ borderColor: `${accentColor}55` }}
          >
            <img
              src={logo}
              alt={cafeName}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="object-cover w-full h-full"
            />
          </div>

          <div className="min-w-0 leading-none">
            <h1
              className="text-[15px] sm:text-xl font-bold tracking-tight whitespace-nowrap"
              style={{
                color: navbarText,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              {mainName}
            </h1>

            <div className="flex items-center gap-2 mt-1.5">
              <p
                className="text-[10px] sm:text-[11px] font-semibold tracking-[0.24em] uppercase"
                style={{ color: activeColor }}
              >
                {lastWord}
              </p>

              {hasSession && table && (
                <>
                  <span
                    className="hidden w-1 h-1 rounded-full sm:block"
                    style={{ background: `${accentColor}66` }}
                  />

                  <span
                    className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold text-white rounded-full"
                    style={{ background: activeColor }}
                  >
                    Table {table}
                  </span>
                </>
              )}
            </div>
          </div>
        </Link>

        {/* CENTER LINKS */}
        <nav className={navPositionClass}>
          {navItems.map((item) => {
            const active = isActive(item);

            const commonProps = {
              className:
                "inline-flex items-center gap-2 px-4 py-2 text-[14px] font-semibold transition-all duration-300 whitespace-nowrap hover:shadow-sm",
              style: desktopLinkStyle(active),
              onMouseEnter: (e) => {
                if (!active) {
                  e.currentTarget.style.background = `${accentColor}14`;
                  e.currentTarget.style.color = activeColor;
                }
              },
              onMouseLeave: (e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = navbarText;
                }
              },
            };

            return item.action ? (
              <button key={item.name} onClick={item.action} {...commonProps}>
                {item.icon}
                {item.name}
              </button>
            ) : (
              <Link key={item.name} to={item.path} {...commonProps}>
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* CENTERED LAYOUT LINKS */}
        {(navbarLayout === "logoCentered" || logoPosition === "center") && (
          <nav className="items-center hidden gap-2 ml-6 lg:flex">
            {navItems.slice(0, 4).map((item) => {
              const active = isActive(item);

              return item.action ? (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="inline-flex items-center gap-2 px-3 py-2 text-[13px] font-semibold transition-all"
                  style={desktopLinkStyle(active)}
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  className="inline-flex items-center gap-2 px-3 py-2 text-[13px] font-semibold transition-all"
                  style={desktopLinkStyle(active)}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}

        {/* RIGHT */}
        <div className="flex items-center gap-2 shrink-0">
          {hasSession && (
            <>
              <Link
                to="/cart"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 text-sm bg-white transition-all duration-300 shadow-sm whitespace-nowrap"
                style={{
                  border: `1px solid ${accentColor}44`,
                  color: navbarText,
                  borderRadius: `${navRadius}px`,
                }}
              >
                <ShoppingCart size={15} />
                <span className="font-semibold">{cartButtonText}</span>
                <span className="font-semibold">({totalItems})</span>
              </Link>

              <Link
                to="/my-order"
                className="flex sm:hidden items-center gap-1.5 px-3 py-2 text-[11px] font-semibold shadow-sm transition-all duration-300 whitespace-nowrap"
                style={getNavButtonStyle()}
              >
                <ReceiptText size={14} />
                {myOrderText}
              </Link>

              <Link
                to="/my-order"
                className="hidden sm:flex px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap"
                style={getNavButtonStyle()}
              >
                {myOrderText} →
              </Link>
            </>
          )}

          {showFoodDashLogo && (
            <div className="relative items-center justify-center hidden group lg:flex shrink-0">
              <img
                src={foodashLogo}
                alt="FoodDash"
                loading="lazy"
                decoding="async"
                className="object-contain w-auto h-16 pt-2 transition-all duration-300 opacity-85 hover:opacity-100 hover:scale-105"
              />

              <div className="absolute right-0 top-full mt-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-amber-700 opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100">
                Powered by FoodDash
              </div>
            </div>
          )}

          <button
            className="flex items-center justify-center w-10 h-10 transition-all duration-300 bg-white border shadow-sm lg:hidden"
            style={{
              borderColor: `${accentColor}33`,
              color: navbarText,
              borderRadius: `${navRadius}px`,
            }}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div
          className={mobileMenuClass}
          style={{
            background: navbarBg,
            borderColor: `${accentColor}26`,
          }}
        >
          <div className="flex flex-col gap-2 pt-4">
            {navItems.map((item) => {
              const active = isActive(item);

              return item.action ? (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-300"
                  style={mobileLinkStyle(active)}
                >
                  {item.icon}
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-300"
                  style={mobileLinkStyle(active)}
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
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition bg-white border"
                  style={{
                    borderColor: `${accentColor}33`,
                    color: navbarText,
                    borderRadius: `${navRadius}px`,
                  }}
                >
                  <ShoppingCart size={16} />
                  {cartButtonText} ({totalItems})
                </Link>
              </div>
            )}

            {showFoodDashLogo && (
              <div
                className="flex justify-center pt-3 mt-2 border-t"
                style={{ borderColor: `${accentColor}26` }}
              >
                <img
                  src={foodashLogo}
                  alt="FoodDash"
                  loading="lazy"
                  decoding="async"
                  className="object-contain w-auto h-16"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {settings?.navbarBottomLine !== false && (
        <div
          className="absolute bottom-0 left-0 w-full"
          style={{
            height: `${settings?.navbarBottomLineHeight || 2}px`,
            background:
              settings?.navbarBottomLineStyle === "solid"
                ? settings?.navbarBottomLineColor1 || activeColor
                : `linear-gradient(to right, ${
                    settings?.navbarBottomLineColor1 || activeColor
                  }, ${settings?.navbarBottomLineColor2 || accentColor}, ${
                    settings?.navbarBottomLineColor3 || activeColor
                  })`,
            boxShadow:
              settings?.navbarBottomLineStyle === "soft"
                ? `0 0 18px ${settings?.navbarBottomLineColor2 || accentColor}`
                : "none",
          }}
        />
      )}
    </header>
  );
}

export default Navbar;
