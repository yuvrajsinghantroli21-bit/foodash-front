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
  LayoutGrid,
  Eye,
  ChevronUp,
  Search,
} from "lucide-react";

const API_URL = "https://fooadash.onrender.com/api";

const Divider = () => (
  <div className="flex items-center justify-center gap-2 my-1">
    <div className="w-6 h-[1px] bg-amber-400" />
    <span className="text-sm text-amber-500">🌿</span>
    <div className="w-6 h-[1px] bg-amber-400" />
  </div>
);

function MenuPreview() {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [renderFilter, setRenderFilter] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [showHowModal, setShowHowModal] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/menu`).then((res) => {
      setMenu(res.data);
    });

    axios.get(`${API_URL}/categories`).then((res) => {
      setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const categoryTabs = [
    {
      _id: "all",
      name: "all",
      iconSvg: "",
    },
    ...categories,
  ];

  const filteredMenu = menu.filter((item) => {
    const categoryMatch = category === "all" || item.category === category;
    const vegMatch = !vegOnly || item.foodType === "veg";

    const searchMatch =
      search.trim() === "" ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());

    return categoryMatch && vegMatch && searchMatch;
  });

  const countByCategory = (cat) => {
    if (cat === "all") return menu.length;
    return menu.filter((i) => i.category === cat).length;
  };

  const renderCategoryIcon = (cat) => {
    if (cat.name === "all") {
      return <LayoutGrid size={15} />;
    }

    if (cat.iconSvg) {
      return (
        <span
          className="flex items-center justify-center w-4 h-4 [&_svg]:w-4 [&_svg]:h-4"
          dangerouslySetInnerHTML={{ __html: cat.iconSvg }}
        />
      );
    }

    return <UtensilsCrossed size={15} />;
  };

  const getItemCategoryIcon = (item) => {
    if (item.categoryIconSvg) return item.categoryIconSvg;

    const matched = categories.find((cat) => cat.name === item.category);
    return matched?.iconSvg || "";
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
    <div className="min-h-screen" style={{ backgroundColor: "#f5f0e8" }}>
      {/* ══════════════ HERO SECTION ══════════════ */}
      <div
        className="relative overflow-hidden border-t border-amber-300/50"
        style={{ backgroundColor: "#f5f0e8" }}
      >
        {/* SOFT BACKGROUND GLOW */}
        <div className="absolute w-48 h-48 rounded-full pointer-events-none -top-24 -left-20 bg-amber-200/20 blur-3xl" />
        <div className="absolute w-56 h-56 rounded-full pointer-events-none -bottom-32 -right-20 bg-orange-200/20 blur-3xl" />

        {/* FLOATING CAFE DECORATIONS */}
        <div className="absolute hidden text-2xl pointer-events-none select-none left-12 top-12 opacity-20 md:block animate-[floatSlow_5s_ease-in-out_infinite]">
          ☕
        </div>

        <div className="absolute hidden text-xl pointer-events-none select-none right-16 top-12 opacity-25 md:block animate-[floatSlow_6s_ease-in-out_infinite]">
          🌿
        </div>

        <div className="absolute hidden text-lg pointer-events-none select-none left-[18%] bottom-8 opacity-20 md:block animate-[floatSlow_7s_ease-in-out_infinite]">
          ✦
        </div>

        <div className="absolute hidden text-xl pointer-events-none select-none right-[20%] bottom-8 opacity-20 md:block animate-[floatSlow_5.5s_ease-in-out_infinite]">
          🍃
        </div>

        {/* HERO CONTENT */}
        <div className="relative max-w-6xl px-4 mx-auto text-center py-7 sm:px-6 lg:px-8 sm:py-8 md:py-10">
          <p className="text-amber-700 text-[10px] sm:text-xs tracking-[0.35em] uppercase font-bold">
            • Explore Our •
          </p>

          <h1
            className="mt-2 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-5xl"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Menu Preview
          </h1>

          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="w-10 h-[1px] bg-amber-400" />
            <span className="text-base text-amber-500 animate-[leafPulse_2.4s_ease-in-out_infinite]">
              🌿
            </span>
            <div className="w-10 h-[1px] bg-amber-400" />
          </div>

          <p className="max-w-lg mx-auto mt-3 text-xs leading-relaxed text-gray-500 sm:text-sm">
            Browse our curated café menu, explore categories, and discover
            freshly prepared dishes before you dine.
          </p>

          {/* COMPACT CAFE CARD */}
          {/* <div className="relative justify-center hidden mt-5 sm:flex">
            <div className="relative flex items-center gap-3 px-4 py-2 bg-white/70 border border-amber-100 shadow-[0_8px_24px_rgba(120,72,20,0.07)] rounded-full backdrop-blur-md">
              <div className="relative flex items-center justify-center rounded-full w-9 h-9 bg-amber-50 text-amber-700">
                <span className="text-lg">☕</span>

                <span className="absolute -top-2 left-3.5 w-[2px] h-2 rounded-full bg-amber-500/40 animate-[steamUp_2s_ease-in-out_infinite]" />
                <span className="absolute -top-3 left-5 w-[2px] h-3 rounded-full bg-amber-500/30 animate-[steamUp_2.4s_ease-in-out_infinite]" />
                <span className="absolute -top-2 left-6.5 w-[2px] h-2 rounded-full bg-amber-500/40 animate-[steamUp_2.2s_ease-in-out_infinite]" />
              </div>

              <div className="text-left">
                <p className="text-xs font-bold text-gray-800">
                  Freshly prepared
                </p>
                <p className="text-[11px] text-gray-400">
                  Preview our café specials
                </p>
              </div>
            </div>
          </div> */}
        </div>

        <style>
          {`
      @keyframes floatSlow {
        0%, 100% {
          transform: translateY(0px) rotate(0deg);
        }
        50% {
          transform: translateY(-10px) rotate(4deg);
        }
      }

      @keyframes steamUp {
        0% {
          transform: translateY(5px);
          opacity: 0;
        }
        40% {
          opacity: 1;
        }
        100% {
          transform: translateY(-8px);
          opacity: 0;
        }
      }

      @keyframes leafPulse {
        0%, 100% {
          transform: scale(1);
          opacity: 0.9;
        }
        50% {
          transform: scale(1.12);
          opacity: 1;
        }
      }
    `}
        </style>
      </div>

      {/* ══════════════ MENU SECTION ══════════════ */}
      <div className="px-4 py-6 pb-20 mx-auto max-w-7xl">
        <div className="p-5 bg-white shadow-xl rounded-3xl">
          {/* ── Category Tabs + Search + Filter Button ── */}
          <div className="flex items-center justify-center gap-4 mb-6 md:justify-between">
            {/* Desktop categories */}
            <div className="flex-wrap hidden gap-2 md:flex">
              {categoryTabs.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setCategory(cat.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${
                    category === cat.name
                      ? "bg-amber-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-amber-50"
                  }`}
                >
                  {renderCategoryIcon(cat)}
                  <span className="capitalize">{cat.name}</span>
                </button>
              ))}

              {/* Veg Filter */}
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`relative w-[120px] h-[42px] rounded-full p-1 border shadow-sm transition-all duration-500
              ${
                vegOnly
                  ? "bg-amber-600 border-amber-600"
                  : "bg-white border-gray-200"
              }`}
              >
                <span
                  className={`absolute top-1 left-1 w-[54px] h-[32px] rounded-full shadow transition-all duration-500
                ${
                  vegOnly
                    ? "translate-x-[56px] bg-white"
                    : "translate-x-0 bg-amber-600"
                }`}
                />

                <span className="relative z-10 flex items-center justify-between h-full px-3 text-xs font-semibold">
                  <span className={!vegOnly ? "text-white" : "text-white/80"}>
                    All
                  </span>

                  <span
                    className={vegOnly ? "text-amber-700" : "text-gray-500"}
                  >
                    Veg
                  </span>
                </span>
              </button>
            </div>

            {/* Search + Filter button */}
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search
                  size={17}
                  className="absolute -translate-y-1/2 left-4 top-1/2 text-amber-700"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search menu..."
                  className="h-11 w-[240px] lg:w-[300px] rounded-full border border-amber-200 bg-white pl-11 pr-4 text-sm font-medium text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                />
              </div>

              {/* Filter button */}
              <button
                onClick={openFilter}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-300 border rounded-full shadow-sm hover:shadow-md hover:bg-amber-50 text-amber-700 border-amber-300"
              >
                <Filter size={16} />
                Filter
              </button>
            </div>
          </div>

          {/* ── Drawer Filter ── */}
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
                    className="p-1 rounded-full hover:bg-amber-50"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {categoryTabs.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => {
                        setCategory(cat.name);
                        closeFilter();
                      }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl capitalize text-sm transition
                                ${
                                  category === cat.name
                                    ? "bg-amber-600 text-white font-medium"
                                    : "hover:bg-amber-50 text-gray-600"
                                }`}
                    >
                      {renderCategoryIcon(cat)}

                      <span>{cat.name}</span>

                      <span className="ml-auto text-xs opacity-60">
                        ({countByCategory(cat.name)})
                      </span>
                    </button>
                  ))}

                  {/* Veg Filter */}
                  <button
                    onClick={() => setVegOnly(!vegOnly)}
                    className={`relative w-[120px] h-[42px] rounded-full p-1 border shadow-sm transition-all duration-500
              ${
                vegOnly
                  ? "bg-amber-600 border-amber-600"
                  : "bg-white border-gray-200"
              }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-[54px] h-[32px] rounded-full shadow transition-all duration-500
                ${
                  vegOnly
                    ? "translate-x-[56px] bg-white"
                    : "translate-x-0 bg-amber-600"
                }`}
                    />

                    <span className="relative z-10 flex items-center justify-between h-full px-3 text-xs font-semibold">
                      <span
                        className={!vegOnly ? "text-white" : "text-white/80"}
                      >
                        All
                      </span>

                      <span
                        className={vegOnly ? "text-amber-700" : "text-gray-500"}
                      >
                        Veg
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Menu Grid ── */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredMenu.map((item) => {
              const image = item.image;
              const isVeg = item.foodType === "veg";
              const isAvailable = item.available !== false;
              const badge = item.badge;
              const itemCategoryIconSvg = getItemCategoryIcon(item);

              return (
                <div
                  key={item._id}
                  className={`group relative isolate flex flex-col overflow-hidden rounded-[20px] bg-white
          border border-amber-100/60
          shadow-[0_4px_16px_rgba(59,33,24,0.07),0_1px_3px_rgba(59,33,24,0.04)]
          transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
          hover:-translate-y-2.5 hover:scale-[1.012]
          hover:border-amber-300/60
          hover:shadow-[0_28px_60px_rgba(180,83,9,0.18),0_6px_20px_rgba(180,83,9,0.10)]
          ${isAvailable ? "" : "opacity-65 grayscale"}`}
                >
                  {/* ── TOP SHIMMER LINE ── */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-[20px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100 z-10" />

                  {/* ── CORNER GLOW ── */}
                  <div className="absolute z-0 w-24 h-24 transition-opacity duration-500 rounded-full opacity-0 pointer-events-none -right-8 -top-8 bg-amber-300/20 blur-2xl group-hover:opacity-100" />

                  {/* ── INNER RING ── */}
                  <div className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-inset ring-amber-300/0 transition-all duration-500 group-hover:ring-amber-300/25 z-10" />

                  {/* ──────────── IMAGE ──────────── */}
                  <div className="relative overflow-hidden aspect-[4/3] bg-amber-50 rounded-t-[20px] flex-shrink-0">
                    {/* Shine sweep */}
                    <div className="pointer-events-none absolute inset-0 z-10 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/22 to-transparent transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[130%]" />

                    <img
                      src={image}
                      alt={item.name}
                      className={`object-cover w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.09] ${
                        !isAvailable ? "opacity-50 grayscale" : ""
                      }`}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/[0.04] to-transparent" />

                    {/* ── BADGE ── */}
                    {badge &&
                      badge !== "none" &&
                      isAvailable &&
                      (() => {
                        const configs = {
                          bestseller: {
                            bg: "rgba(123,28,28,0.92)",
                            text: "#ffd4d4",
                            iconBg: "#ffd4d4",
                            iconColor: "#7b1c1c",
                            icon: "★",
                            label: "Best Seller",
                          },
                          chef: {
                            bg: "rgba(61,31,0,0.92)",
                            text: "#ffd280",
                            iconBg: "#ffd280",
                            iconColor: "#3d1f00",
                            icon: "✦",
                            label: "Chef's Pick",
                          },
                          musttry: {
                            bg: "rgba(107,34,0,0.92)",
                            text: "#ffb399",
                            iconBg: "#ffb399",
                            iconColor: "#6b2200",
                            icon: "▲",
                            label: "Must Try",
                          },
                          new: {
                            bg: "rgba(124,74,3,0.92)",
                            text: "#fde68a",
                            iconBg: "#fde68a",
                            iconColor: "#7c4a03",
                            icon: "◆",
                            label: "New Arrival",
                          },
                          limited: {
                            bg: "rgba(45,21,99,0.92)",
                            text: "#c4b5fd",
                            iconBg: "#c4b5fd",
                            iconColor: "#2d1563",
                            icon: "⬡",
                            label: "Limited",
                          },
                        };

                        const c = configs[badge];
                        if (!c) return null;

                        return (
                          <span
                            className="absolute top-2.5 left-2.5 z-20 inline-flex items-center gap-1.5 rounded-full shadow-lg backdrop-blur-md"
                            style={{
                              background: c.bg,
                              color: c.text,
                              padding: "5px 10px 5px 5px",
                              fontSize: 9.5,
                              fontWeight: 600,
                              letterSpacing: "0.04em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span
                              className="relative flex items-center justify-center rounded-full shrink-0"
                              style={{
                                width: 18,
                                height: 18,
                                background: c.iconBg,
                                color: c.iconColor,
                                fontSize: 10,
                              }}
                            >
                              {badge === "new" && (
                                <span
                                  className="absolute inset-0 rounded-full animate-ping"
                                  style={{
                                    background: "#fde68a",
                                    opacity: 0.5,
                                  }}
                                />
                              )}

                              {c.icon}
                            </span>

                            {c.label}
                          </span>
                        );
                      })()}

                    {/* ── SOLD OUT ── */}
                    {!isAvailable && (
                      <>
                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                          <div
                            className="px-5 py-1.5 bg-gray-900/82 backdrop-blur-sm border border-white/20 rounded-full shadow-xl"
                            style={{ transform: "rotate(-12deg)" }}
                          >
                            <span className="text-[10px] font-black tracking-widest text-white uppercase">
                              Unavailable
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* ── VEG / NON-VEG ── */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-30">
                      <span
                        className={`
                hidden sm:flex items-center gap-1.5 overflow-hidden backdrop-blur-xl border shadow-md rounded-full
                max-w-0 opacity-0 px-0
                group-hover:max-w-[90px] group-hover:opacity-100 group-hover:px-2.5
                transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                text-[8.5px] font-bold tracking-[0.12em] whitespace-nowrap
                ${
                  isVeg
                    ? "bg-emerald-50/95 text-emerald-700 border-emerald-200/80"
                    : "bg-red-50/95 text-red-600 border-red-200/80"
                }
              `}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            isVeg ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />

                        {isVeg ? "VEG" : "NON VEG"}
                      </span>

                      <div
                        className={`
                relative flex items-center justify-center w-7 h-7 rounded-xl border shadow-lg backdrop-blur-xl
                transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]
                group-hover:scale-110 group-hover:rotate-3
                bg-white/95
                ${isVeg ? "border-emerald-300" : "border-red-300"}
              `}
                      >
                        <div
                          className={`absolute inset-0 rounded-xl blur-[10px] opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${
                            isVeg ? "bg-emerald-400" : "bg-red-400"
                          }`}
                        />

                        <div
                          className={`relative flex items-center justify-center w-4 h-4 rounded-[4px] border ${
                            isVeg ? "border-emerald-500" : "border-red-500"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full transition-transform duration-300 group-hover:scale-125 ${
                              isVeg ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category pill with SVG */}
                    {item.category && isAvailable && (
                      <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-semibold tracking-widest uppercase text-white/90 bg-black/30 backdrop-blur-sm rounded-full border border-white/10">
                        {itemCategoryIconSvg && (
                          <span
                            className="flex items-center justify-center w-3.5 h-3.5 [&_svg]:w-3.5 [&_svg]:h-3.5"
                            dangerouslySetInnerHTML={{
                              __html: itemCategoryIconSvg,
                            }}
                          />
                        )}
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* ──────────── CONTENT ──────────── */}
                  <div className="relative flex flex-col flex-1 px-5 pt-4 pb-5 bg-white transition-colors duration-400 group-hover:bg-[#fffbf4]">
                    {/* Subtle radial warmth on hover */}
                    <div
                      className="pointer-events-none absolute inset-0 rounded-b-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background:
                          "radial-gradient(ellipse at 80% 10%, rgba(251,191,36,0.07), transparent 60%)",
                      }}
                    />

                    <h2
                      className="text-[17px] sm:text-[18px] font-extrabold text-gray-900 leading-snug text-center"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {item.name}
                    </h2>

                    <div className="mt-2">
                      <ExpandableText
                        text={
                          item.description ||
                          "A delicious item crafted with care."
                        }
                        className="text-[12.5px] leading-relaxed text-gray-400 text-center"
                      />
                    </div>

                    {/* SVG DIVIDER */}
                    <div
                      className="flex items-center justify-center my-3"
                      style={{ height: 18 }}
                    >
                      <svg
                        width="190"
                        height="18"
                        viewBox="0 0 190 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <line
                          x1="0"
                          y1="9"
                          x2="60"
                          y2="9"
                          stroke="#e8c97a"
                          strokeWidth="0.8"
                        />
                        <path
                          d="M60 9 Q66 4 72 7"
                          stroke="#c9a55a"
                          strokeWidth="1.1"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          d="M64 9 Q67 13 73 11"
                          stroke="#c9a55a"
                          strokeWidth="1.1"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          d="M69 9 Q73 5 78 8"
                          stroke="#c9a55a"
                          strokeWidth="1.1"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <circle cx="95" cy="9" r="3.5" fill="#e8c97a" />
                        <circle cx="95" cy="9" r="1.8" fill="#b45309" />
                        <path
                          d="M95 5.5 Q96.5 7 95 9 Q93.5 7 95 5.5Z"
                          fill="#e8c97a"
                          opacity="0.7"
                        />
                        <path
                          d="M98.5 9 Q97 10.5 95 9 Q97 7.5 98.5 9Z"
                          fill="#e8c97a"
                          opacity="0.7"
                        />
                        <path
                          d="M95 12.5 Q93.5 11 95 9 Q96.5 11 95 12.5Z"
                          fill="#e8c97a"
                          opacity="0.7"
                        />
                        <path
                          d="M91.5 9 Q93 7.5 95 9 Q93 10.5 91.5 9Z"
                          fill="#e8c97a"
                          opacity="0.7"
                        />
                        <path
                          d="M130 9 Q124 4 118 7"
                          stroke="#c9a55a"
                          strokeWidth="1.1"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          d="M126 9 Q123 13 117 11"
                          stroke="#c9a55a"
                          strokeWidth="1.1"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          d="M121 9 Q117 5 112 8"
                          stroke="#c9a55a"
                          strokeWidth="1.1"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <line
                          x1="130"
                          y1="9"
                          x2="190"
                          y2="9"
                          stroke="#e8c97a"
                          strokeWidth="0.8"
                        />
                      </svg>
                    </div>

                    {/* ── PRICE ── */}
                    <div className="mt-auto text-center">
                      {item.salePrice ? (
                        <>
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <span
                              className="text-[12.5px] line-through"
                              style={{ color: "#bba88a" }}
                            >
                              ₹{item.price}
                            </span>

                            <span
                              className="text-[9px] font-bold text-amber-800 rounded-full px-2 py-0.5 border border-amber-300/40"
                              style={{
                                background:
                                  "linear-gradient(135deg,#fef3c7,#fde68a)",
                                boxShadow: "0 1px 4px rgba(251,191,36,0.2)",
                              }}
                            >
                              SAVE ₹
                              {Number(item.price || 0) -
                                Number(item.salePrice || 0)}
                            </span>
                          </div>

                          <div
                            className="text-[26px] font-extrabold leading-none transition-transform duration-300 group-hover:scale-105"
                            style={{
                              fontFamily: "Georgia, serif",
                              background:
                                "linear-gradient(135deg,#b45309,#d97706)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            ₹{item.salePrice}
                          </div>
                        </>
                      ) : (
                        <div
                          className="text-[26px] font-extrabold leading-none transition-transform duration-300 group-hover:scale-105"
                          style={{
                            fontFamily: "Georgia, serif",
                            background:
                              "linear-gradient(135deg,#b45309,#d97706)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          ₹{item.price}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

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
          className="fixed z-50 flex items-center justify-center text-white transition-all duration-200 rounded-full shadow-lg bottom-6 right-6 w-11 h-11 bg-amber-700 hover:bg-amber-800"
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
                  <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <button
              onClick={() => setShowHowModal(false)}
              className="mt-6 w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-full text-sm font-medium transition"
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
