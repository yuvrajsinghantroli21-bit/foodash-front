import { useEffect, useRef, useState } from "react";
import axios from "axios";
import img from "../../public/plate.png";
import { QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ExpandableText from "../components/ExpandableText";
import { motion, AnimatePresence } from "framer-motion";
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

function MenuPreviewTitle({ softShadow = true, glow = true }) {
  return (
    <div
      className="relative text-center leading-[0.82] tracking-[-0.07em] text-[#241309]"
      style={{
        fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif",
        fontSize: "clamp(2.9rem, 10vw, 5.8rem)",
        fontWeight: 850,
        fontVariationSettings: '"SOFT" 42, "WONK" 1',
        textShadow: softShadow
          ? "0 18px 48px rgba(73,35,12,0.24), 0 2px 0 rgba(255,246,220,0.45)"
          : "none",
        transform: "translateZ(0)",
        WebkitFontSmoothing: "antialiased",
        backfaceVisibility: "hidden",
      }}
    >
      {glow && (
        <>
          <span className="pointer-events-none absolute -left-5 top-2 -z-10 h-28 w-28 rounded-full bg-[#c8843f]/20 blur-3xl" />
          <span className="pointer-events-none absolute -right-4 bottom-2 -z-10 h-24 w-24 rounded-full bg-[#ffe2a3]/24 blur-3xl" />
        </>
      )}

      <span className="block whitespace-nowrap text-[#241309]">Menu</span>

      <span
        className="relative block whitespace-nowrap"
        style={{
          background:
            "linear-gradient(92deg, #7b3817 0%, #d2954f 42%, #8a4218 70%, #35190a 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: softShadow
            ? "drop-shadow(0 12px 22px rgba(128,67,24,0.18))"
            : "none",
        }}
      >
        Preview
      </span>
    </div>
  );
}

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

  const [showIntro, setShowIntro] = useState(true);
  const [titleFlight, setTitleFlight] = useState(false);
  const [titleLanded, setTitleLanded] = useState(false);
  const [hideFlyingTitle, setHideFlyingTitle] = useState(false);
  const [titleTarget, setTitleTarget] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const heroTitleRef = useRef(null);
  const navigate = useNavigate();

  const measureHeroTitle = () => {
    if (!heroTitleRef.current) return;

    const rect = heroTitleRef.current.getBoundingClientRect();

    setTitleTarget({
      left: rect.left,
      top: rect.top,
    });
  };

  useEffect(() => {
    axios.get(`${API_URL}/menu`).then((res) => {
      setMenu(res.data);
    });

    axios.get(`${API_URL}/categories`).then((res) => {
      setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    measureHeroTitle();

    const onResize = () => {
      measureHeroTitle();
    };

    window.addEventListener("resize", onResize);

    const flyTimer = setTimeout(() => {
      measureHeroTitle();
      setTitleFlight(true);
    }, 2200);

    const landTimer = setTimeout(() => {
      setTitleLanded(true);
    }, 3260);

    const hideFlyTimer = setTimeout(() => {
      setHideFlyingTitle(true);
    }, 3310);

    const finishTimer = setTimeout(() => {
      setShowIntro(false);
      setLoaded(true);
    }, 3650);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(flyTimer);
      clearTimeout(landTimer);
      clearTimeout(hideFlyTimer);
      clearTimeout(finishTimer);
    };
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..800,0..100,0..1&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

        .whc-preview-paint {
          position: relative;
        }

        .whc-preview-paint::before {
          content: "";
          position: absolute;
          inset: -12px -24px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.48), transparent);
          transform: translateX(-125%) rotate(10deg);
          filter: blur(13px);
          animation: whcPreviewBrush 1.35s cubic-bezier(0.16,1,0.3,1) 0.72s forwards;
          pointer-events: none;
        }

        @keyframes whcPreviewBrush {
          0% {
            transform: translateX(-125%) rotate(10deg);
            opacity: 0;
          }
          18% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateX(125%) rotate(10deg);
            opacity: 0;
          }
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(4deg);
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

        @media (max-width: 640px) {
          .whc-preview-flying-label {
            display: none;
          }
        }
      `}</style>

      {/* INTRO CURTAIN */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: titleFlight ? "-108%" : 0 }}
            exit={{ y: "-108%" }}
            transition={{
              delay: titleFlight ? 0.05 : 0,
              duration: 1.08,
              ease: [0.76, 0, 0.24, 1],
            }}
            className="fixed inset-0 z-[9998] flex items-center justify-center overflow-hidden bg-[#2b1609]"
          >
            {/* BACKGROUND */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.35),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.16),transparent_35%),linear-gradient(135deg,#2b1609_0%,#7c3f11_52%,#f3d7a8_100%)]" />

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-1/2 z-0 h-44 w-full origin-left -translate-y-1/2 bg-[#fff4dc]/20 blur-3xl"
            />

            {/* TOP CAFE NAME */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{
                opacity: titleFlight ? 0 : 1,
                y: titleFlight ? -14 : 0,
              }}
              transition={{
                delay: titleFlight ? 0 : 0.25,
                duration: 0.65,
              }}
              className="absolute top-[34%] z-10 px-4 text-center text-[10px] font-black uppercase tracking-[0.42em] text-amber-100/75 sm:text-xs"
            >
              The White House Café
            </motion.p>

            {/* SMALL MOOD TEXT */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{
                opacity: titleFlight ? 0 : 1,
                y: titleFlight ? -12 : 0,
              }}
              transition={{ delay: titleFlight ? 0 : 0.75, duration: 0.65 }}
              className="absolute top-[24%] z-10 text-center text-[9px] font-black uppercase tracking-[0.38em] text-amber-100/55 sm:text-[10px]"
            >
              Painting the menu mood
            </motion.p>

            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: titleFlight ? 0 : 1,
                opacity: titleFlight ? 0 : 1,
              }}
              transition={{ delay: titleFlight ? 0 : 1.25, duration: 0.8 }}
              className="absolute top-[70%] z-10 h-[3px] w-72 origin-left rounded-full bg-gradient-to-r from-transparent via-amber-200 to-transparent"
            />

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{
                opacity: titleFlight ? 0 : 1,
                y: titleFlight ? 18 : 0,
              }}
              transition={{ delay: titleFlight ? 0 : 1.45, duration: 0.7 }}
              className="absolute top-[74%] z-10 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-amber-50 shadow-2xl backdrop-blur-xl"
            >
              <span className="text-lg">☕</span>
              <span className="text-xs font-black uppercase tracking-[0.25em]">
                Fresh plates. Warm café mood.
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ONE REAL MOVING TITLE */}
      <AnimatePresence>
        {!hideFlyingTitle && (
          <motion.div
            initial={{
              left: "50%",
              top: "50%",
              x: "-50%",
              y: "-50%",
              opacity: 0,
              scale: 1,
              rotate: -2,
              filter: "none",
            }}
            animate={
              titleFlight && titleTarget
                ? {
                    left: titleTarget.left,
                    top: titleTarget.top,
                    x: "0%",
                    y: "0%",
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                    filter: "none",
                  }
                : {
                    left: "50%",
                    top: "50%",
                    x: "-50%",
                    y: "-50%",
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                    filter: "blur(0px)",
                  }
            }
            exit={{
              opacity: 0,
              transition: { duration: 0.01 },
            }}
            transition={{
              opacity: { delay: 0.45, duration: 0.85 },
              filter: { delay: 0.45, duration: 0.85 },
              rotate: { duration: 0.8 },
              left: {
                duration: 1.05,
                ease: [0.18, 1, 0.25, 1],
              },
              top: {
                duration: 1.05,
                ease: [0.18, 1, 0.25, 1],
              },
              x: {
                duration: 1.05,
                ease: [0.18, 1, 0.25, 1],
              },
              y: {
                duration: 1.05,
                ease: [0.18, 1, 0.25, 1],
              },
            }}
            className="fixed z-[10000] w-max max-w-none pointer-events-none"
          >
            <div className="whc-preview-paint">
              {/* <p className="whc-preview-flying-label mb-4 text-center text-[10px] font-black uppercase tracking-[0.42em] text-[#e7c474]/80">
                The White House Café
              </p> */}
              <MenuPreviewTitle softShadow={false} glow={false} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════ HERO SECTION ══════════════ */}
      <div
        className="relative overflow-hidden border-t border-amber-300/50"
        style={{ backgroundColor: "#f5f0e8" }}
      >
        <div className="absolute w-48 h-48 rounded-full pointer-events-none -top-24 -left-20 bg-amber-200/20 blur-3xl" />
        <div className="absolute w-56 h-56 rounded-full pointer-events-none -bottom-32 -right-20 bg-orange-200/20 blur-3xl" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.12] bg-[linear-gradient(rgba(65,35,14,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(65,35,14,0.06)_1px,transparent_1px)] bg-[size:42px_42px]" />

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

        <div className="relative max-w-6xl px-4 mx-auto text-center py-7 sm:px-6 lg:px-8 sm:py-8 md:py-10">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 14 }}
            transition={{ duration: 0.55 }}
            className="text-amber-700 text-[10px] sm:text-xs tracking-[0.35em] uppercase font-bold"
          >
            • Explore Our •
          </motion.p>

          <motion.div
            ref={heroTitleRef}
            initial={false}
            animate={{
              opacity: titleLanded ? 1 : 0,
            }}
            transition={{ duration: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto mt-2 w-fit"
            style={{
              visibility: titleLanded ? "visible" : "hidden",
            }}
          >
            <MenuPreviewTitle softShadow={false} glow={false} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 14 }}
            transition={{ delay: 0.15, duration: 0.55 }}
            className="flex items-center justify-center gap-3 mt-7"
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
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 14 }}
            transition={{ delay: 0.26, duration: 0.55 }}
            className="max-w-lg mx-auto mt-3 text-xs leading-relaxed text-gray-500 sm:text-sm"
          >
            Browse our curated café menu, explore categories, and discover
            freshly prepared dishes before you dine.
          </motion.p>
        </div>
      </div>

      {/* KEEP YOUR MENU SECTION SAME FROM HERE */}
      {/* ══════════════ MENU SECTION ══════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 42 }}
        animate={{
          opacity: loaded ? 1 : 0,
          y: loaded ? 0 : 42,
        }}
        transition={{
          delay: 0.18,
          duration: 0.85,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="px-4 py-6 pb-20 mx-auto max-w-7xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{
            opacity: loaded ? 1 : 0,
            scale: loaded ? 1 : 0.985,
          }}
          transition={{
            delay: 0.3,
            duration: 0.75,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="p-5 bg-white shadow-xl rounded-3xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{
              opacity: loaded ? 1 : 0,
              y: loaded ? 0 : 24,
            }}
            transition={{
              delay: 0.42,
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex items-center justify-center gap-4 mb-6 md:justify-between"
          >
            <div className="flex-wrap hidden gap-2 md:flex">
              {categoryTabs.map((cat, index) => (
                <motion.button
                  key={cat._id}
                  initial={{ opacity: 0, y: 16, scale: 0.94 }}
                  animate={{
                    opacity: loaded ? 1 : 0,
                    y: loaded ? 0 : 16,
                    scale: loaded ? 1 : 0.94,
                  }}
                  transition={{
                    delay: 0.5 + index * 0.04,
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ y: -3, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setCategory(cat.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    category === cat.name
                      ? "bg-amber-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-amber-50"
                  }`}
                >
                  {renderCategoryIcon(cat)}
                  <span className="capitalize">{cat.name}</span>
                </motion.button>
              ))}

              <motion.button
                initial={{ opacity: 0, y: 16, scale: 0.94 }}
                animate={{
                  opacity: loaded ? 1 : 0,
                  y: loaded ? 0 : 16,
                  scale: loaded ? 1 : 0.94,
                }}
                transition={{
                  delay: 0.5 + categoryTabs.length * 0.04,
                  duration: 0.45,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -3, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setVegOnly(!vegOnly)}
                className={`relative w-[120px] h-[42px] rounded-full p-1 border shadow-sm transition-all duration-500 ${
                  vegOnly
                    ? "bg-amber-600 border-amber-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-[54px] h-[32px] rounded-full shadow transition-all duration-500 ${
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
              </motion.button>
            </div>

            <div className="flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: loaded ? 1 : 0,
                  x: loaded ? 0 : 20,
                }}
                transition={{
                  delay: 0.56,
                  duration: 0.55,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative hidden md:block"
              >
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
              </motion.div>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: loaded ? 1 : 0,
                  x: loaded ? 0 : 20,
                }}
                transition={{
                  delay: 0.62,
                  duration: 0.55,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -3, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={openFilter}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-300 border rounded-full shadow-sm hover:shadow-md hover:bg-amber-50 text-amber-700 border-amber-300"
              >
                <Filter size={16} />
                Filter
              </motion.button>
            </div>
          </motion.div>

          <AnimatePresence>
            {renderFilter && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[9999] flex bg-black/40"
                onClick={closeFilter}
                style={{
                  position: "fixed",
                  inset: 0,
                }}
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  initial={{ x: "-100%" }}
                  animate={{ x: showFilter ? 0 : "-100%" }}
                  exit={{ x: "-100%" }}
                  transition={{
                    duration: 0.36,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="h-screen p-5 overflow-y-auto bg-white shadow-2xl w-72"
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
                    {categoryTabs.map((cat, index) => (
                      <motion.button
                        key={cat._id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.08 + index * 0.035,
                          duration: 0.32,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          setCategory(cat.name);
                          closeFilter();
                        }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl capitalize text-sm transition ${
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
                      </motion.button>
                    ))}

                    <motion.button
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.08 + categoryTabs.length * 0.035,
                        duration: 0.32,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setVegOnly(!vegOnly)}
                      className={`relative w-[120px] h-[42px] rounded-full p-1 border shadow-sm transition-all duration-500 ${
                        vegOnly
                          ? "bg-amber-600 border-amber-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-[54px] h-[32px] rounded-full shadow transition-all duration-500 ${
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
                          className={
                            vegOnly ? "text-amber-700" : "text-gray-500"
                          }
                        >
                          Veg
                        </span>
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            key={`${category}-${vegOnly}-${search}`}
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.055,
                  delayChildren: 0.08,
                },
              },
            }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {filteredMenu.map((item, index) => {
              const image = item.image;
              const isVeg = item.foodType === "veg";
              const isAvailable = item.available !== false;
              const badge = item.badge;
              const itemCategoryIconSvg = getItemCategoryIcon(item);

              return (
                <motion.div
                  key={item._id}
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 36,
                      scale: 0.965,
                      filter: "blur(12px)",
                    },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "none",
                      transition: {
                        duration: 0.62,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    },
                  }}
                  whileHover={{
                    y: -10,
                    scale: 1.012,
                    transition: {
                      duration: 0.28,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  }}
                  className={`group relative isolate flex flex-col overflow-hidden rounded-[20px] bg-white border border-amber-100/60 shadow-[0_4px_16px_rgba(59,33,24,0.07),0_1px_3px_rgba(59,33,24,0.04)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-amber-300/60 hover:shadow-[0_28px_60px_rgba(180,83,9,0.18),0_6px_20px_rgba(180,83,9,0.10)] ${
                    isAvailable ? "" : "opacity-65 grayscale"
                  }`}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-[20px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100 z-10" />

                  <div className="absolute z-0 w-24 h-24 transition-opacity duration-500 rounded-full opacity-0 pointer-events-none -right-8 -top-8 bg-amber-300/20 blur-2xl group-hover:opacity-100" />

                  <div className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-inset ring-amber-300/0 transition-all duration-500 group-hover:ring-amber-300/25 z-10" />

                  <div className="relative overflow-hidden aspect-[4/3] bg-amber-50 rounded-t-[20px] flex-shrink-0">
                    <div className="pointer-events-none absolute inset-0 z-10 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/22 to-transparent transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[130%]" />

                    <img
                      src={image}
                      alt={item.name}
                      className={`object-cover w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.09] ${
                        !isAvailable ? "opacity-50 grayscale" : ""
                      }`}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/[0.04] to-transparent" />

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

                    {!isAvailable && (
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
                    )}

                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-30">
                      <span
                        className={`hidden sm:flex items-center gap-1.5 overflow-hidden backdrop-blur-xl border shadow-md rounded-full max-w-0 opacity-0 px-0 group-hover:max-w-[90px] group-hover:opacity-100 group-hover:px-2.5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] text-[8.5px] font-bold tracking-[0.12em] whitespace-nowrap ${
                          isVeg
                            ? "bg-emerald-50/95 text-emerald-700 border-emerald-200/80"
                            : "bg-red-50/95 text-red-600 border-red-200/80"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            isVeg ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />

                        {isVeg ? "VEG" : "NON VEG"}
                      </span>

                      <div
                        className={`relative flex items-center justify-center w-7 h-7 rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:rotate-3 bg-white/95 ${
                          isVeg ? "border-emerald-300" : "border-red-300"
                        }`}
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

                  <div className="relative flex flex-col flex-1 px-5 pt-4 pb-5 bg-white transition-colors duration-400 group-hover:bg-[#fffbf4]">
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
                </motion.div>
              );
            })}
          </motion.div>

          {filteredMenu.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="py-24 text-center text-gray-400"
            >
              <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-30" />
              <p>No items found in this category.</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {showScroll && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed z-50 flex items-center justify-center text-white transition-all duration-200 rounded-full shadow-lg bottom-6 right-6 w-11 h-11 bg-amber-700 hover:bg-amber-800"
        >
          <ChevronUp size={20} />
        </button>
      )}

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
