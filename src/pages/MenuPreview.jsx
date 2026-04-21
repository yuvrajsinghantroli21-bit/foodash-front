import { useEffect, useState } from "react";
import axios from "axios";
import img from "../../public/plate.png";
import { QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  X,
  UtensilsCrossed,
  Coffee,
  CakeSlice,
  LayoutGrid,
  Eye,
  ChevronUp,
} from "lucide-react";

const Divider = () => (
  <div className="flex items-center justify-center gap-2 my-1">
    <div className="w-6 h-[1px] bg-amber-400" />
    <span className="text-sm text-amber-500">🌿</span>
    <div className="w-6 h-[1px] bg-amber-400" />
  </div>
);

function MenuPreview() {
  const [menu, setMenu] = useState([]);
  const [category, setCategory] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [renderFilter, setRenderFilter] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [showHowModal, setShowHowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("https://fooadash.onrender.com/api/menu").then((res) => {
      setMenu(res.data);
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const categories = [
    "all",
    ...new Set(
      menu
        .map((item) => item.category)
        .filter((cat) => cat && cat.trim() !== ""),
    ),
  ];

  const filteredMenu =
    category === "all"
      ? menu
      : menu.filter((item) => item.category === category);

  const countByCategory = (cat) => {
    if (cat === "all") return menu.length;
    return menu.filter((i) => i.category === cat).length;
  };

  const getIcon = (cat) => {
    const c = cat.toLowerCase();
    if (c === "all") return <LayoutGrid size={15} />;
    if (c.includes("drink") || c.includes("beverage"))
      return <Coffee size={15} />;
    if (c.includes("dessert")) return <CakeSlice size={15} />;
    return <UtensilsCrossed size={15} />;
  };

  const openFilter = () => {
    setRenderFilter(true);
    setTimeout(() => setShowFilter(true), 10);
  };

  const closeFilter = () => {
    setShowFilter(false);
    setTimeout(() => setRenderFilter(false), 400);
  };

  return (
    /* ── Entire page: warm creamy background ── */
    <div className="min-h-screen" style={{ backgroundColor: "#f5f0e8" }}>
      {/* ══════════════ HERO SECTION ══════════════ */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: "#f5f0e8" }}
      >
        <div className="flex flex-col items-center max-w-6xl gap-10 px-6 py-10 mx-auto md:flex-row">
          {/* Left: Text */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-emerald-600 text-xs tracking-[0.3em] uppercase font-semibold">
              • Explore Our •
            </p>

            <h1
              className="mt-2 text-5xl font-bold leading-tight text-gray-900 md:text-6xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Menu Preview
            </h1>

            {/* Gold divider */}
            <div className="flex items-center justify-center gap-3 mt-3 md:justify-start">
              <div className="w-10 h-[1px] bg-amber-400" />
              <span className="text-lg text-amber-500">🌿</span>
              <div className="w-10 h-[1px] bg-amber-400" />
            </div>

            <p className="max-w-sm mx-auto mt-4 text-sm leading-relaxed text-gray-500 md:mx-0">
              You're viewing our menu. To place an order, please scan your table
              QR code.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              {/* Scan QR */}
              <button
                onClick={() => navigate("/scan")}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 rounded-full shadow-md bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg active:scale-95"
              >
                <QrCode size={18} />
                Scan QR
              </button>

              {/* How it works */}
              <button
                onClick={() => setShowHowModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-200 border-2 rounded-full border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white"
              >
                <Eye size={16} />
                How Ordering Works
              </button>
            </div>
          </div>

          {/* Right: Plate Scene */}
          <div
            className="flex-1 flex items-center justify-center relative select-none 
  min-h-[220px] sm:min-h-[280px] md:min-h-[320px] px-4"
          >
            <img
              src={img} // 👈 put your image in public folder
              alt="The White House Cafe"
              className="
      w-[260px] 
      sm:w-[320px] 
      md:w-[380px] 
      lg:w-[420px]
      xl:w-[460px]
      h-auto 
      object-contain 
      drop-shadow-xl
    "
            />
          </div>
        </div>
      </div>

      {/* ══════════════ MENU SECTION ══════════════ */}
      {/* Outer wrapper stays creamy; white container wraps menu content only */}
      <div className="px-4 py-6 pb-20 mx-auto max-w-7xl">
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

            {/* Mobile filter button */}
            <button
              onClick={openFilter}
              className="flex items-center gap-2 px-5 py-2 text-sm border rounded-full hover:bg-gray-100 md:hidden"
            >
              <Filter size={16} />
              Filter
            </button>

            {/* Desktop filter button */}
            <button
              onClick={openFilter}
              className="items-center hidden gap-2 px-5 py-2 text-sm transition border rounded-full md:flex hover:bg-gray-50 text-emerald-700 border-emerald-400"
            >
              <Filter size={15} />
              Filter
            </button>
          </div>

          {/* ── Mobile Sidebar Filter ── */}
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
                    {/* Veg/Non-veg indicator */}
                    <span
                      className="absolute flex items-center justify-center w-5 h-5 border-2 border-white rounded-sm top-2 right-2"
                      style={{ background: "white" }}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isVeg ? "bg-emerald-500" : "bg-red-500"
                        }`}
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

      {/* ══════════════ SCROLL TO TOP ══════════════ */}
      {showScroll && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed z-50 flex items-center justify-center text-white transition-all duration-200 rounded-full shadow-lg bottom-6 right-6 w-11 h-11 bg-emerald-500 hover:bg-emerald-600"
        >
          <ChevronUp size={20} />
        </button>
      )}

      {/* ══════════════ HOW ORDERING WORKS MODAL ══════════════ */}
      {showHowModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50"
          onClick={() => setShowHowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm p-8 text-center bg-white shadow-2xl rounded-3xl"
          >
            <span className="text-4xl">📋</span>
            <h2
              className="mt-3 text-2xl font-bold text-gray-800"
              style={{ fontFamily: "Georgia, serif" }}
            >
              How Ordering Works
            </h2>
            <div className="flex items-center justify-center gap-2 my-2">
              <div className="w-8 h-[1px] bg-amber-400" />
              <span className="text-amber-500">🌿</span>
              <div className="w-8 h-[1px] bg-amber-400" />
            </div>
            <ol className="mt-4 space-y-3 text-sm text-left text-gray-500">
              {[
                "Scan the QR code on your table.",
                "Browse our full menu and explore categories.",
                "Your server will take your order at the table.",
                "Sit back, relax and enjoy your meal! 🍽️",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <button
              onClick={() => setShowHowModal(false)}
              className="mt-6 w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm font-medium transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuPreview;
