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

    return categoryMatch && vegMatch;
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
        className="relative overflow-hidden"
        style={{ backgroundColor: "#f5f0e8" }}
      >
        <div className="flex flex-col items-center max-w-6xl gap-6 px-4 py-10 mx-auto md:flex-row sm:px-6 lg:px-8">
          <div
            className="flex-1 order-1 md:order-2 flex items-center justify-center relative select-none 
      min-h-[220px] sm:min-h-[280px] md:min-h-[320px] px-1"
          >
            <img
              src={img}
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

            <div className="flex items-center justify-center gap-3 mt-3 md:justify-start">
              <div className="w-10 h-[1px] bg-amber-400" />
              <span className="text-lg text-amber-500">🌿</span>
              <div className="w-10 h-[1px] bg-amber-400" />
            </div>

            <p className="max-w-xs mx-auto mt-4 text-sm leading-relaxed text-gray-500 sm:max-w-sm md:mx-0">
              You're viewing our menu. To place an order, please scan your table
              QR code.
            </p>

            <div className="flex flex-col items-center gap-3 mt-6 sm:flex-row sm:justify-center md:justify-start">
              <button
                onClick={() => navigate("/scan")}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 rounded-full shadow-md bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg active:scale-95"
              >
                <QrCode size={18} />
                Scan QR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ MENU SECTION ══════════════ */}
      <div className="px-4 py-6 pb-20 mx-auto max-w-7xl">
        <div className="p-5 bg-white shadow-xl rounded-3xl">
          {/* ── Category Tabs + Filter Button ── */}
          <div className="flex items-center justify-center mb-6 md:justify-between">
            {/* Desktop categories */}
            <div className="flex-wrap hidden gap-2 md:flex">
              {categoryTabs.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setCategory(cat.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${
                    category === cat.name
                      ? "bg-emerald-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                  ? "bg-emerald-500 border-emerald-500"
                  : "bg-white border-gray-200"
              }`}
              >
                <span
                  className={`absolute top-1 left-1 w-[54px] h-[32px] rounded-full shadow transition-all duration-500
                ${
                  vegOnly
                    ? "translate-x-[56px] bg-white"
                    : "translate-x-0 bg-emerald-500"
                }`}
                />

                <span className="relative z-10 flex items-center justify-between h-full px-3 text-xs font-semibold">
                  <span className={!vegOnly ? "text-white" : "text-white/80"}>
                    All
                  </span>

                  <span
                    className={vegOnly ? "text-emerald-600" : "text-gray-500"}
                  >
                    Veg
                  </span>
                </span>
              </button>
            </div>

            {/* Filter button */}
            <button
              onClick={openFilter}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-300 border rounded-full shadow-sm hover:shadow-md hover:bg-emerald-50 text-emerald-700 border-emerald-300"
            >
              <Filter size={16} />
              Filter
            </button>
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
                    className="p-1 rounded-full hover:bg-gray-100"
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
                                    ? "bg-emerald-500 text-white font-medium"
                                    : "hover:bg-gray-100 text-gray-600"
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
                  ? "bg-emerald-500 border-emerald-500"
                  : "bg-white border-gray-200"
              }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-[54px] h-[32px] rounded-full shadow transition-all duration-500
                ${
                  vegOnly
                    ? "translate-x-[56px] bg-white"
                    : "translate-x-0 bg-emerald-500"
                }`}
                    />

                    <span className="relative z-10 flex items-center justify-between h-full px-3 text-xs font-semibold">
                      <span
                        className={!vegOnly ? "text-white" : "text-white/80"}
                      >
                        All
                      </span>

                      <span
                        className={
                          vegOnly ? "text-emerald-600" : "text-gray-500"
                        }
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
                  className={`group flex flex-col overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-md rounded-2xl hover:shadow-xl hover:-translate-y-1 ${
                    isAvailable
                      ? "hover:-translate-y-2 hover:shadow-2xl"
                      : "opacity-70 grayscale"
                  }`}
                >
                  {/* IMAGE */}
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                      src={image}
                      alt={item.name}
                      className={`object-cover w-full h-full transition-transform duration-700 group-hover:scale-110 ${
                        !isAvailable ? "opacity-50 grayscale" : ""
                      }`}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />

                    {/* BADGE */}
                    {badge &&
                      badge !== "none" &&
                      isAvailable &&
                      (() => {
                        const configs = {
                          bestseller: {
                            bg: "#7b1c1c",
                            text: "#ffd4d4",
                            iconBg: "#ffd4d4",
                            iconColor: "#7b1c1c",
                            icon: "★",
                            label: "Best Seller",
                          },
                          chef: {
                            bg: "#3d1f00",
                            text: "#ffd280",
                            iconBg: "#ffd280",
                            iconColor: "#3d1f00",
                            icon: "✦",
                            label: "Chef's Pick",
                          },
                          musttry: {
                            bg: "#6b2200",
                            text: "#ffb399",
                            iconBg: "#ffb399",
                            iconColor: "#6b2200",
                            icon: "▲",
                            label: "Must Try",
                          },
                          new: {
                            bg: "#0a3d1f",
                            text: "#86efac",
                            iconBg: "#86efac",
                            iconColor: "#0a3d1f",
                            icon: "◆",
                            label: "New Arrival",
                          },
                          limited: {
                            bg: "#2d1563",
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
                            className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full"
                            style={{
                              background: c.bg,
                              color: c.text,
                              padding: "5px 10px 5px 6px",
                              fontSize: 10,
                              fontWeight: 500,
                              letterSpacing: "0.03em",
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
                                    background: "#86efac",
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

                    {/* SOLD OUT overlay */}
                    {!isAvailable && (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="px-5 py-1.5 bg-gray-900/80 backdrop-blur-sm border border-white/20 rounded-full shadow-xl"
                            style={{ transform: "rotate(-12deg)" }}
                          >
                            <span className="text-xs font-black tracking-widest text-white uppercase">
                              Sold Out
                            </span>
                          </div>
                        </div>

                        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 text-[10px] font-bold text-white rounded-full bg-gray-900/80 backdrop-blur-md border border-white/10 shadow">
                          Sold Out
                        </span>
                      </>
                    )}

                    {/* VEG / NON-VEG indicator */}
                    {/* PREMIUM VEG / NON-VEG */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-2 z-10">
                      {/* TEXT BADGE */}
                      <span
                        className={`
      hidden sm:flex
      items-center
      overflow-hidden
      backdrop-blur-xl
      border
      shadow-lg
      rounded-full
      px-0
      max-w-0
      opacity-0
      group-hover:max-w-[90px]
      group-hover:px-2.5
      group-hover:opacity-100
      transition-all
      duration-500
      ease-[cubic-bezier(0.22,1,0.36,1)]
      text-[9px]
      font-bold
      tracking-[0.12em]
      whitespace-nowrap
      ${
        isVeg
          ? "bg-emerald-50/95 text-emerald-700 border-emerald-200/80"
          : "bg-red-50/95 text-red-600 border-red-200/80"
      }
    `}
                      >
                        <span
                          className={`mr-1.5 h-1.5 w-1.5 rounded-full animate-pulse ${
                            isVeg ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />

                        {isVeg ? "VEG" : "NON VEG"}
                      </span>

                      {/* MAIN ICON */}
                      <div
                        className={`
      relative
      flex items-center justify-center
      w-7 h-7
      rounded-xl
      border
      shadow-xl
      backdrop-blur-xl
      transition-all
      duration-500
      group-hover:scale-110
      group-hover:rotate-3
      ${isVeg ? "bg-white/95 border-emerald-300" : "bg-white/95 border-red-300"}
    `}
                      >
                        {/* Glow */}
                        <div
                          className={`
        absolute inset-0 rounded-xl blur-[10px] opacity-0
        group-hover:opacity-40 transition duration-500
        ${isVeg ? "bg-emerald-400" : "bg-red-400"}
      `}
                        />

                        {/* Inner border */}
                        <div
                          className={`
        relative flex items-center justify-center
        w-4 h-4 rounded-md border
        ${isVeg ? "border-emerald-500" : "border-red-500"}
      `}
                        >
                          <span
                            className={`
          w-2 h-2 rounded-full
          transition-all duration-300
          group-hover:scale-125
          ${isVeg ? "bg-emerald-500" : "bg-red-500"}
        `}
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

                  {/* CONTENT */}
                  <div className="flex flex-col flex-1 p-5 text-center">
                    <h2
                      className="text-[17px] sm:text-[18px] font-extrabold text-gray-900 leading-snug"
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
                        className="text-[13px] leading-relaxed text-gray-500"
                      />
                    </div>

                    <div className="my-3">
                      <Divider />
                    </div>

                    <div className="flex flex-col items-center justify-end pt-3 mt-auto">
                      {item.salePrice ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-400 line-through">
                              ₹{item.price}
                            </span>

                            <span className="px-2 py-0.5 text-[10px] font-bold text-red-600 bg-red-50 rounded-full">
                              SAVE ₹{item.price - item.salePrice}
                            </span>
                          </div>

                          <div className="text-2xl font-extrabold leading-none text-emerald-600">
                            ₹{item.salePrice}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="invisible mb-2 text-sm">
                            placeholder
                          </div>

                          <div className="text-2xl font-extrabold leading-none text-emerald-600">
                            ₹{item.price}
                          </div>
                        </>
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
