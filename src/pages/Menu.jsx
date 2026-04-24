import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext.jsx";
import ExpandableText from "../components/ExpandableText";
import socket from "../socket/socket";
import toast from "react-hot-toast";
import img from "../../public/plate.png";
import {
  Filter,
  X,
  UtensilsCrossed,
  Coffee,
  CakeSlice,
  LayoutGrid,
  ChevronUp,
  ShoppingCart,
  QrCode,
} from "lucide-react";

/* ── Thin decorative divider used inside cards ── */
const Divider = () => (
  <div className="flex items-center justify-center gap-2 my-1">
    <div className="w-6 h-[1px] bg-amber-400" />
    <span className="text-sm text-amber-500">🌿</span>
    <div className="w-6 h-[1px] bg-amber-400" />
  </div>
);

/* ── Category icon helper ── */
const getIcon = (cat) => {
  const c = cat.toLowerCase();
  if (c === "all") return <LayoutGrid size={15} />;
  if (c.includes("drink") || c.includes("beverage"))
    return <Coffee size={15} />;
  if (c.includes("dessert")) return <CakeSlice size={15} />;
  return <UtensilsCrossed size={15} />;
};

function Menu() {
  const [menu, setMenu] = useState([]);
  const [table, setTable] = useState(null);
  const [category, setCategory] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [renderFilter, setRenderFilter] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  const { cart, addToCart, removeItem, clearCart } = useContext(CartContext);
  const { token: tokenFromUrl } = useParams();
  const navigate = useNavigate();

  const token = tokenFromUrl || localStorage.getItem("token");

  /* ── Scroll-to-top visibility ── */
  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Verify session ── */
  useEffect(() => {
    if (!token) {
      toast.error("FoodDash: Please scan QR first");
      setTimeout(() => navigate("/thank-you"), 1200);
      return;
    }
    axios
      .get(`https://fooadash.onrender.com/api/session/${token}`)
      .then((res) => {
        setTable(res.data.table);
        if (tokenFromUrl) {
          localStorage.setItem("table", res.data.table);
          localStorage.setItem("token", token);
        }
      })
      .catch(() => {
        toast.error("Session expired. Please scan again.");
        localStorage.removeItem("token");
        localStorage.removeItem("table");
        clearCart();
        navigate("/thank-you");
      });
  }, [token]);

  /* ── Real-time session expiry ── */
  useEffect(() => {
    const currentTable = localStorage.getItem("table");
    socket.on("session-expired", (data) => {
      if (data.table == currentTable) {
        toast.error("Session expired. Please scan again.");
        localStorage.removeItem("token");
        localStorage.removeItem("table");
        clearCart();
        setTimeout(() => navigate("/thank-you"), 1200);
      }
    });
    return () => socket.off("session-expired");
  }, []);

  /* ── Fetch menu ── */
  useEffect(() => {
    axios.get("https://fooadash.onrender.com/api/menu").then((res) => {
      setMenu(res.data);
    });
  }, []);

  /* ── Derived state ── */
  const categories = [
    "all",
    ...new Set(
      menu
        .map((item) => item.category)
        .filter((cat) => cat && cat.trim() !== ""),
    ),
  ];

  const countByCategory = (cat) =>
    cat === "all" ? menu.length : menu.filter((i) => i.category === cat).length;

  const filteredMenu =
    category === "all"
      ? menu
      : menu.filter((item) => item.category === category);

  const getQty = (id) => {
    const item = cart.find((i) => i._id === id);
    return item ? item.qty : 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  /* ── Filter drawer ── */
  const openFilter = () => {
    setRenderFilter(true);
    setTimeout(() => setShowFilter(true), 10);
  };
  const closeFilter = () => {
    setShowFilter(false);
    setTimeout(() => setRenderFilter(false), 400);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f0e8" }}>
      {/* ══════════════ STICKY HEADER ══════════════ */}
      <div className="sticky top-0 z-40" style={{ backgroundColor: "#f5f0e8" }}>
        {/* Thin gold accent line at top */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          {/* LEFT — Brand + Table badge */}
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full shadow-md bg-emerald-500 shrink-0">
              <span className="text-sm leading-none">🍽</span>
            </div>

            <div className="flex flex-col leading-tight">
              <span
                className="text-[11px] text-gray-400 tracking-[0.18em] uppercase hidden sm:block"
                style={{ fontFamily: "Georgia, serif" }}
              >
                White House Café
              </span>
              <span className="text-xs font-semibold tracking-wide text-emerald-700">
                Table&nbsp;
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-bold text-white rounded-full bg-emerald-500 shadow-sm">
                  {table || "—"}
                </span>
              </span>
            </div>
          </div>

          {/* RIGHT — Filter + Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Filter pill — visible on mobile only */}
            <button
              onClick={openFilter}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-full border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all duration-200 md:hidden"
            >
              <Filter size={13} />
              <span>Filter</span>
            </button>

            {/* Desktop filter pill */}
            <button
              onClick={openFilter}
              className="items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all duration-200 hidden md:flex"
            >
              <Filter size={14} />
              Filter
            </button>

            {/* Cart button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 rounded-full shadow-md sm:px-5 sm:text-sm bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg active:scale-95"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <ShoppingCart size={15} />
              <span className="hidden sm:inline">Cart</span>

              {/* Animated badge */}
              {totalItems > 0 && (
                <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-emerald-700 bg-white rounded-full shadow-inner">
                  {totalItems}
                </span>
              )}

              {/* On mobile, show count inline when no badge space */}
              {totalItems === 0 && (
                <span className="text-xs sm:hidden text-white/80">(0)</span>
              )}
            </Link>

            <Link to="/my-order">
              <button className="px-4 py-2 text-white bg-orange-500 rounded-full">
                View My Order
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom separator — subtle warm shadow line */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
      </div>

      {/* ══════════════ HERO SECTION ══════════════ */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: "#f5f0e8" }}
      >
        <div className="flex flex-col items-center max-w-6xl gap-6 px-4 py-10 mx-auto md:flex-row sm:px-6 lg:px-8">
          {/* Image — first on mobile */}
          <div className="flex-1 order-1 md:order-2 flex items-center justify-center relative select-none min-h-[220px] sm:min-h-[280px] md:min-h-[320px] px-1">
            <img
              src={img}
              alt="Cafe Menu"
              className="w-[220px] sm:w-[280px] md:w-[340px] lg:w-[400px] xl:w-[440px] h-auto object-contain drop-shadow-xl"
            />
          </div>

          {/* Text — second on mobile */}
          <div className="flex-1 order-2 text-center md:order-1 md:text-left">
            <p className="text-emerald-600 text-xs tracking-[0.3em] uppercase font-semibold">
              • Table {table || "..."} •
            </p>

            <h1
              className="mt-2 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Cafe Menu
            </h1>

            {/* Gold divider */}
            <div className="flex items-center justify-center gap-3 mt-3 md:justify-start">
              <div className="w-10 h-[1px] bg-amber-400" />
              <span className="text-lg text-amber-500">🌿</span>
              <div className="w-10 h-[1px] bg-amber-400" />
            </div>

            <p className="max-w-xs mx-auto mt-4 text-sm leading-relaxed text-gray-500 sm:max-w-sm md:mx-0">
              Browse our menu, add items to your cart, and place your order —
              all from your table.
            </p>

            {/* View cart CTA */}
            {totalItems > 0 && (
              <div className="flex flex-col items-center gap-3 mt-6 sm:flex-row sm:justify-center md:justify-start">
                <Link
                  to="/cart"
                  className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 rounded-full shadow-md bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg active:scale-95"
                >
                  <ShoppingCart size={18} />
                  View Cart ({totalItems})
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════ MENU SECTION ══════════════ */}
      <div className="px-4 py-6 pb-24 mx-auto max-w-7xl">
        <div className="p-5 bg-white shadow-xl rounded-3xl">
          {/* ── Category Tabs + Filter Button ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            {/* Desktop tabs */}
            <div className="flex-wrap hidden gap-2 md:flex">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${
                      category === cat
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {getIcon(cat)}
                  <span className="capitalize">{cat}</span>
                </button>
              ))}
            </div>

            {/* Desktop filter button */}
            <button
              onClick={openFilter}
              className="items-center hidden gap-2 px-5 py-2 text-sm transition border rounded-full md:flex hover:bg-gray-50 text-emerald-700 border-emerald-400"
            >
              <Filter size={15} /> Filter
            </button>
          </div>

          {/* ── Drawer Filter (mobile + desktop) ── */}
          {renderFilter && (
            <div
              className="fixed inset-0 z-50 flex bg-black/40"
              onClick={closeFilter}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className={`w-72 h-full bg-white p-5 overflow-y-auto shadow-2xl transform transition-transform duration-300
                  ${showFilter ? "translate-x-0" : "-translate-x-full"}`}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold">Categories</h2>
                  <button
                    onClick={closeFilter}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        closeFilter();
                      }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl capitalize text-sm transition
                        ${
                          category === cat
                            ? "bg-emerald-500 text-white font-medium"
                            : "hover:bg-gray-100 text-gray-600"
                        }`}
                    >
                      {getIcon(cat)}
                      <span>{cat}</span>
                      <span className="ml-auto text-xs opacity-60">
                        ({countByCategory(cat)})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Menu Grid ── */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredMenu.map((item) => {
              const qty = getQty(item._id);
              const image = `https://fooadash.onrender.com/uploads/${item.image}`;
              const isVeg = item.isVeg ?? true;

              return (
                <div
                  key={item._id}
                  className="flex flex-col overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-md rounded-2xl hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-44">
                    <img
                      src={image}
                      alt={item.name}
                      className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    />
                    {/* Veg / Non-veg dot */}
                    <span
                      className="absolute flex items-center justify-center w-5 h-5 border-2 border-white rounded-sm top-2 right-2"
                      style={{ background: "white" }}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${isVeg ? "bg-emerald-500" : "bg-red-500"}`}
                      />
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col items-center flex-1 gap-1 p-4 text-center">
                    <h2 className="text-sm font-bold leading-snug text-gray-800">
                      {item.name}
                    </h2>

                    <p className="text-xs leading-relaxed text-gray-400 line-clamp-2">
                      {item.description ||
                        "A delicious item crafted with care."}
                    </p>

                    <Divider />

                    <p className="mt-1 text-base font-bold text-emerald-500">
                      ₹{item.price}
                    </p>

                    {/* Add / Qty control */}
                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full py-2 mt-2 text-sm font-semibold text-white transition-all rounded-full shadow-sm bg-emerald-500 hover:bg-emerald-600 active:scale-95"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center justify-between w-full mt-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                        <button
                          onClick={() => removeItem(item._id)}
                          className="flex items-center justify-center text-lg font-bold leading-none text-white transition rounded-full w-7 h-7 bg-emerald-500 hover:bg-emerald-600"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold text-emerald-700">
                          {qty}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="flex items-center justify-center text-lg font-bold leading-none text-white transition rounded-full w-7 h-7 bg-emerald-500 hover:bg-emerald-600"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {filteredMenu.length === 0 && (
            <div className="py-24 text-center text-gray-400">
              <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-30" />
              <p>No items found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ FLOATING CART PILL ══════════════ */}
      {cart.length > 0 && (
        <Link
          to="/cart"
          className="fixed z-50 flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-full shadow-lg bottom-6 right-6 bg-emerald-500 hover:bg-emerald-600 active:scale-95"
        >
          <ShoppingCart size={18} />
          View Cart ({totalItems})
        </Link>
      )}

      {/* ══════════════ SCROLL TO TOP ══════════════ */}
      {showScroll && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed z-50 flex items-center justify-center text-white transition-all duration-200 rounded-full shadow-lg bottom-6 left-6 w-11 h-11 bg-emerald-500 hover:bg-emerald-600"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
}

export default Menu;
