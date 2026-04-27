import { useEffect, useState } from "react";
import axios from "axios";
import img from "../../public/plate.png";
import { QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ExpandableText from "../components/ExpandableText";
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
        <div className="flex flex-col items-center max-w-6xl gap-6 px-4 py-10 mx-auto md:flex-row sm:px-6 lg:px-8">
          {/* Image FIRST on mobile */}
          <div
            className="flex-1 order-1 md:order-2 flex items-center justify-center relative select-none 
      min-h-[220px] sm:min-h-[280px] md:min-h-[320px] px-1"
          >
            <img
              src={img} // or "/whitehouse_profile.jpg"
              alt="The White House Cafe"
              className="
          w-[220px] 
          sm:w-[280px] 
          md:w-[340px] 
          lg:w-[400px]
          xl:w-[440px]
          h-auto 
          object-contain 
          drop-shadow-xl
        "
            />
          </div>

          {/* Text SECOND on mobile */}
          <div className="flex-1 order-2 text-center md:order-1 md:text-left">
            <p className="text-emerald-600 text-xs tracking-[0.3em] uppercase font-semibold">
              • Explore Our •
            </p>

            <h1
              className="mt-2 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl"
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

            <p className="max-w-xs mx-auto mt-4 text-sm leading-relaxed text-gray-500 sm:max-w-sm md:mx-0">
              You're viewing our menu. To place an order, please scan your table
              QR code.
            </p>

            {/* Buttons */}
            <div className="flex flex-col items-center gap-3 mt-6 sm:flex-row sm:justify-center md:justify-start">
              {/* Scan QR */}
              <button
                onClick={() => navigate("/scan")}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 rounded-full shadow-md bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg active:scale-95"
              >
                <QrCode size={18} />
                Scan QR
              </button>

              {/* Optional button (kept commented as you had) */}
              {/*
        <button
          onClick={() => setShowHowModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-200 border-2 rounded-full border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white"
        >
          <Eye size={16} />
          How Ordering Works
        </button>
        */}
            </div>
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
                  className="group flex flex-col overflow-hidden rounded-[26px] bg-white border border-[#ece7df] shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >
                  {/* IMAGE */}
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={image}
                      alt={item.name}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                    {/* veg / nonveg */}
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center justify-center w-7 h-7 bg-white/95 backdrop-blur-md border border-white rounded-md shadow">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            isVeg ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                      </span>
                    </div>

                    {/* badge */}
                    {item.badge && (
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-3 py-1 text-[10px] font-bold rounded-full shadow-md backdrop-blur-md border ${
                            item.badge === "Chef's Pick"
                              ? "bg-amber-100/95 text-amber-700 border-amber-200"
                              : item.badge === "Best Seller"
                                ? "bg-rose-100/95 text-rose-700 border-rose-200"
                                : "bg-emerald-100/95 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-col flex-1 p-5 text-center">
                    {/* title */}
                    <h2
                      className="text-[17px] sm:text-[18px] font-extrabold text-gray-900 leading-snug"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {item.name}
                    </h2>

                    {/* desc */}
                    <div className="mt-2">
                      <ExpandableText
                        text={
                          item.description ||
                          "A delicious item crafted with care."
                        }
                        className="text-[13px] leading-relaxed text-gray-500"
                      />
                    </div>

                    {/* divider */}
                    <div className="my-3">
                      <Divider />
                    </div>

                    {/* price */}
                    <div className="mt-auto">
                      {item.originalPrice && item.originalPrice > item.price ? (
                        <div className="space-y-1">
                          <div className="text-sm text-gray-400 line-through">
                            ₹{item.originalPrice}
                          </div>

                          <div className="text-2xl font-extrabold text-emerald-600">
                            ₹{item.price}
                          </div>

                          <div className="inline-block px-2 py-1 mt-1 text-[10px] font-bold text-red-600 bg-red-50 rounded-full">
                            SAVE ₹{item.originalPrice - item.price}
                          </div>
                        </div>
                      ) : (
                        <div className="text-2xl font-extrabold text-emerald-600">
                          ₹{item.price}
                        </div>
                      )}
                    </div>
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
