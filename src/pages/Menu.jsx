import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext.jsx";
import ExpandableText from "../components/ExpandableText";
import socket from "../socket/socket";
import toast from "react-hot-toast";
import AddToCartButton from "../components/AddToCartButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  X,
  UtensilsCrossed,
  LayoutGrid,
  ChevronUp,
  ShoppingCart,
  Search,
} from "lucide-react";

const API = "https://fooadash.onrender.com/api";
const INTRO_KEY = "whc_menu_intro_played";

const CategoryIcon = ({
  cat,
  categoryIcons,
  active = false,
  small = false,
}) => {
  if (cat === "all") return <LayoutGrid size={small ? 13 : 15} />;

  const iconSvg = categoryIcons[cat?.toLowerCase()];

  if (!iconSvg) return <UtensilsCrossed size={small ? 13 : 15} />;

  return (
    <span
      className={`flex items-center justify-center shrink-0 ${
        small ? "w-4 h-4" : "w-5 h-5"
      } ${active ? "text-white" : "text-current"}`}
      dangerouslySetInnerHTML={{ __html: iconSvg }}
    />
  );
};

function CurtainLetters({ text }) {
  const words = text.split(" ");

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
      {words.map((word, wordIndex) => {
        const isCafe = word.toLowerCase().includes("café");

        return (
          <span
            key={`${word}-${wordIndex}`}
            className={`inline-flex items-center justify-center ${
              isCafe ? "basis-full sm:basis-auto" : ""
            }`}
          >
            {word.split("").map((letter, letterIndex) => {
              const absoluteIndex =
                words.slice(0, wordIndex).join("").length +
                wordIndex +
                letterIndex;

              return (
                <motion.span
                  key={`${word}-${letter}-${letterIndex}`}
                  initial={{ opacity: 0, y: 16, rotate: -2 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{
                    delay: 0.28 + absoluteIndex * 0.04,
                    duration: 0.42,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}

function MenuTitle({ large = false }) {
  return (
    <div
      className="relative text-center md:text-left leading-[0.78] tracking-[-0.075em]"
      style={{
        fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif",
        fontSize: large
          ? "clamp(4.8rem, 18vw, 9.4rem)"
          : "clamp(4rem, 14vw, 7.4rem)",
        fontWeight: 900,
        fontVariationSettings: '"SOFT" 18, "WONK" 0',
        textShadow: "none",
        filter: "none",
        WebkitFontSmoothing: "antialiased",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }}
    >
      <span
        className="relative block whitespace-nowrap"
        style={{
          color: "#b45309",
          WebkitTextStroke: "0px transparent",
          WebkitTextFillColor: "#b45309",
          filter: "none",
          textShadow: "none",
        }}
      >
        Menu
      </span>

      <span className="absolute -bottom-4 left-1/2 h-[2px] w-[76%] -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-[#d97706] to-transparent md:left-1 md:translate-x-0" />
    </div>
  );
}

function Menu() {
  const [menu, setMenu] = useState([]);
  const [table, setTable] = useState(null);
  const [category, setCategory] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [renderFilter, setRenderFilter] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);
  const [dbCategories, setDbCategories] = useState([]);

  const [showIntro, setShowIntro] = useState(true);
  const [curtainStep, setCurtainStep] = useState("welcome");
  const [curtainLeaving, setCurtainLeaving] = useState(false);
  const [titleFlight, setTitleFlight] = useState(false);
  const [titleLanded, setTitleLanded] = useState(false);
  const [hideFlyingTitle, setHideFlyingTitle] = useState(false);
  const [titleTarget, setTitleTarget] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [searchText, setSearchText] = useState("");
  // const [search, setSearch] = useState("");

  const heroTitleRef = useRef(null);
  const sessionCheckedRef = useRef(false);

  const { cart, addToCart, removeItem, clearCart } = useContext(CartContext);
  const { token: tokenFromUrl } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const queryToken = new URLSearchParams(location.search).get("token");
  const storedToken = localStorage.getItem("token");
  const token = tokenFromUrl || queryToken || storedToken;

  const isPageReload = () => {
    const navEntry = performance.getEntriesByType?.("navigation")?.[0];
    return navEntry?.type === "reload";
  };

  const measureHeroTitle = () => {
    if (!heroTitleRef.current) return;

    const rect = heroTitleRef.current.getBoundingClientRect();

    setTitleTarget({
      left: rect.left,
      top: rect.top,
    });
  };

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // useEffect(() => {
  //   if (sessionCheckedRef.current) return;
  //   sessionCheckedRef.current = true;

  //   if (!token) {
  //     toast.error("Please scan QR first");
  //     localStorage.removeItem("token");
  //     localStorage.removeItem("table");
  //     clearCart();
  //     navigate("/scan", { replace: true });
  //     return;
  //   }

  //   axios
  //     .get(`${API}/session/${token}`)
  //     .then((res) => {
  //       setTable(res.data.table);
  //       localStorage.setItem("table", res.data.table);
  //       localStorage.setItem("token", token);

  //       if (tokenFromUrl || queryToken) {
  //         navigate("/order", { replace: true });
  //       }
  //     })
  //     .catch(() => {
  //       toast.error("Session expired. Please scan again.");
  //       localStorage.removeItem("token");
  //       localStorage.removeItem("table");
  //       clearCart();
  //       navigate("/thank-you", { replace: true });
  //     });
  // }, [token, tokenFromUrl, queryToken, navigate, clearCart]);

  useEffect(() => {
    const handleSessionExpire = (data) => {
      const currentToken = localStorage.getItem("token");

      if (data?.token && data.token === currentToken) {
        toast.error("Session expired");

        clearCart();
        localStorage.removeItem("token");
        localStorage.removeItem("table");

        setTimeout(() => {
          navigate("/thank-you", { replace: true });
        }, 900);
      }
    };

    socket.on("session-expired", handleSessionExpire);

    return () => {
      socket.off("session-expired", handleSessionExpire);
    };
  }, [clearCart, navigate]);

  useEffect(() => {
    axios.get(`${API}/menu`).then((res) => {
      setMenu(res.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get(`${API}/categories`)
      .then((res) => {
        setDbCategories(res.data || []);
      })
      .catch(() => {
        console.log("Could not fetch categories");
      });
  }, []);

  useEffect(() => {
    const shouldReplayOnRefresh = isPageReload();
    const alreadyPlayed = sessionStorage.getItem(INTRO_KEY);

    const measureTimer = setTimeout(() => {
      measureHeroTitle();
    }, 120);

    const onResize = () => {
      measureHeroTitle();
    };

    window.addEventListener("resize", onResize);

    if (alreadyPlayed && !shouldReplayOnRefresh) {
      setShowIntro(false);
      setHideFlyingTitle(true);
      setTitleLanded(true);
      setLoaded(true);

      return () => {
        clearTimeout(measureTimer);
        window.removeEventListener("resize", onResize);
      };
    }

    sessionStorage.setItem(INTRO_KEY, "true");

    const stepTimer = setTimeout(() => {
      setCurtainStep("menu");
    }, 1750);

    const startFlightTimer = setTimeout(() => {
      measureHeroTitle();
      setTitleFlight(true);
      setCurtainLeaving(true);
    }, 3300);

    const landTimer = setTimeout(() => {
      setTitleLanded(true);
    }, 4380);

    const hideFlyTimer = setTimeout(() => {
      setHideFlyingTitle(true);
    }, 4480);

    const removeCurtainTimer = setTimeout(() => {
      setShowIntro(false);
    }, 4500);

    const loadTimer = setTimeout(() => {
      setLoaded(true);
    }, 4550);

    return () => {
      clearTimeout(measureTimer);
      clearTimeout(stepTimer);
      clearTimeout(startFlightTimer);
      clearTimeout(landTimer);
      clearTimeout(hideFlyTimer);
      clearTimeout(removeCurtainTimer);
      clearTimeout(loadTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const categoryIcons = dbCategories.reduce((acc, cat) => {
    acc[cat.name?.toLowerCase()] = cat.iconSvg;
    return acc;
  }, {});

  const menuCategories = [
    ...new Set(
      menu
        .map((item) => item.category)
        .filter((cat) => cat && cat.trim() !== ""),
    ),
  ];

  const dbCategoryNames = dbCategories.map((cat) => cat.name);

  const categories = [
    "all",
    ...new Set([...dbCategoryNames, ...menuCategories]),
  ];

  const getItemCategoryIcon = (item) => {
    if (item.categoryIconSvg) return item.categoryIconSvg;

    const matched = dbCategories.find((cat) => cat.name === item.category);
    return matched?.iconSvg || "";
  };

  const countByCategory = (cat) =>
    cat === "all" ? menu.length : menu.filter((i) => i.category === cat).length;

  const filteredMenu = menu.filter((item) => {
    const categoryMatch = category === "all" || item.category === category;
    const vegMatch = !vegOnly || item.foodType === "veg";

    const searchMatch =
      searchText.trim() === "" ||
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchText.toLowerCase());

    return categoryMatch && vegMatch && searchMatch;
  });

  const getQty = (id) => {
    const item = cart.find((i) => i._id === id);
    return item ? item.qty : 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const openFilter = () => {
    setRenderFilter(true);
    setTimeout(() => setShowFilter(true), 10);
  };

  const closeFilter = () => {
    setShowFilter(false);
    setTimeout(() => setRenderFilter(false), 400);
  };

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{ backgroundColor: "#f5f0e8" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

        .whc-display {
          font-family: 'Fraunces', Georgia, serif;
          font-variation-settings: "SOFT" 38, "WONK" 0.4;
        }

        .whc-graffiti {
          font-family: 'Caveat', cursive;
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(4deg);
          }
        }

        @media (max-width: 767px) {
          .mobile-card-soft {
            box-shadow: 0 10px 26px rgba(59,33,24,0.08) !important;
          }

          .mobile-card-soft .mobile-shine {
            display: none !important;
          }

          .mobile-card-soft .mobile-glow {
            display: none !important;
          }

          .mobile-card-soft .mobile-ring {
            display: none !important;
          }

          .mobile-card-soft .mobile-hover-name {
            transform: none !important;
          }

          .mobile-card-soft img {
            transition-duration: 260ms !important;
          }
        }
      `}</style>

      {/* INTRO CURTAIN */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: curtainLeaving ? "-100%" : 0 }}
            exit={{ y: "-100%" }}
            transition={{
              duration: 1.05,
              ease: [0.76, 0, 0.24, 1],
            }}
            className="fixed inset-0 z-[9998] flex items-center justify-center overflow-hidden bg-[#2b1609]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#2b1609_0%,#74370f_52%,#e0b875_100%)]" />
            <div className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(rgba(255,250,241,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,250,241,0.05)_1px,transparent_1px)] bg-[size:52px_52px]" />
            <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100/12 blur-3xl" />

            <AnimatePresence mode="wait">
              {curtainStep === "welcome" && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative z-10 w-full px-5 text-center"
                >
                  <p className="mb-5 text-[10px] font-black uppercase tracking-[0.42em] text-amber-100/65">
                    Welcome to
                  </p>

                  <div className="whc-graffiti mx-auto max-w-[92vw] text-center text-[clamp(2.2rem,10vw,5.2rem)] font-bold leading-none text-[#fff4cf]">
                    <CurtainLetters text="The White House Café" />
                  </div>

                  <div className="mx-auto mt-5 h-px w-64 max-w-[70vw] origin-center bg-gradient-to-r from-transparent via-amber-100/85 to-transparent" />

                  <p className="mx-auto mt-5 max-w-xl text-xs font-black uppercase tracking-[0.22em] text-amber-50/78 sm:text-sm">
                    Coffee • Plates • Quiet Talks
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SINGLE FLYING MENU TITLE */}
      <AnimatePresence>
        {!hideFlyingTitle && curtainStep === "menu" && (
          <motion.div
            initial={{
              left: "50%",
              top: "50%",
              x: "-50%",
              y: "-50%",
              opacity: 0,
              scale: 1,
              rotate: -2,
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
                  }
                : {
                    left: "50%",
                    top: "50%",
                    x: "-50%",
                    y: "-50%",
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                  }
            }
            exit={{
              opacity: 0,
              transition: { duration: 0.08 },
            }}
            transition={{
              opacity: { duration: 0.25 },
              rotate: { duration: 0.8 },
              left: { duration: 1.05, ease: [0.18, 1, 0.25, 1] },
              top: { duration: 1.05, ease: [0.18, 1, 0.25, 1] },
              x: { duration: 1.05, ease: [0.18, 1, 0.25, 1] },
              y: { duration: 1.05, ease: [0.18, 1, 0.25, 1] },
            }}
            className="fixed z-[10000] w-max max-w-none pointer-events-none"
          >
            <MenuTitle large={!titleFlight} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
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

        <div className="relative max-w-6xl px-4 py-10 mx-auto text-center sm:px-6 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 14 }}
            transition={{ duration: 0.55 }}
            className="text-amber-700 text-[10px] sm:text-xs tracking-[0.35em] uppercase font-bold"
          >
            • Table {table || "..."} •
          </motion.p>

          <motion.div
            ref={heroTitleRef}
            initial={false}
            animate={{ opacity: titleLanded ? 1 : 0 }}
            transition={{ duration: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto mt-2 w-fit"
            style={{ visibility: titleLanded ? "visible" : "hidden" }}
          >
            <MenuTitle />
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
            className="max-w-md mx-auto mt-4 text-sm leading-relaxed text-gray-500"
          >
            Browse our menu, add items to your cart, and place your order — all
            from your table.
          </motion.p>
        </div>
      </div>

      {/* MENU SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 28 }}
        transition={{ delay: 0.18, duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
        className="px-4 py-6 pb-24 mx-auto max-w-7xl"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ delay: 0.25, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="p-4 bg-white shadow-xl rounded-3xl sm:p-5"
        >
          {/* FILTER HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 18 }}
            transition={{
              delay: 0.36,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex items-center justify-center mb-6 md:justify-between"
          >
            <div className="flex-wrap hidden gap-2 md:flex">
              {categories.map((cat) => {
                const active = category === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-amber-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-amber-50"
                    }`}
                  >
                    <CategoryIcon
                      cat={cat}
                      categoryIcons={categoryIcons}
                      active={active}
                    />
                    <span className="capitalize">{cat}</span>
                  </button>
                );
              })}

              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`relative w-[120px] h-[42px] rounded-full p-1 border shadow-sm transition-all duration-300 ${
                  vegOnly
                    ? "bg-amber-600 border-amber-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-[54px] h-[32px] rounded-full shadow transition-transform duration-300 ${
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
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
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

          {/* DRAWER FILTER */}
          <AnimatePresence>
            {renderFilter && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[9999] flex bg-black/40"
                onClick={closeFilter}
                style={{ position: "fixed", inset: 0 }}
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  initial={{ x: "-100%" }}
                  animate={{ x: showFilter ? 0 : "-100%" }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                  className="h-screen p-5 overflow-y-auto bg-white shadow-2xl w-72"
                >
                  <div className="mb-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold">Categories</h2>

                      <button
                        onClick={closeFilter}
                        className="p-1 rounded-full hover:bg-amber-50"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Search food..."
                      className="w-full px-4 py-3 mt-4 text-sm font-semibold text-gray-700 transition border outline-none rounded-2xl border-amber-200 bg-amber-50/50 focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    {categories.map((cat) => {
                      const active = category === cat;

                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            setCategory(cat);
                            closeFilter();
                          }}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl capitalize text-sm transition ${
                            active
                              ? "bg-amber-600 text-white font-medium"
                              : "hover:bg-amber-50 text-gray-600"
                          }`}
                        >
                          <CategoryIcon
                            cat={cat}
                            categoryIcons={categoryIcons}
                            active={active}
                          />
                          <span>{cat}</span>
                          <span className="ml-auto text-xs opacity-60">
                            ({countByCategory(cat)})
                          </span>
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setVegOnly(!vegOnly)}
                      className={`relative w-[120px] h-[42px] rounded-full p-1 border shadow-sm transition-all duration-300 mt-3 ${
                        vegOnly
                          ? "bg-amber-600 border-amber-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-[54px] h-[32px] rounded-full shadow transition-transform duration-300 ${
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
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SMOOTHER MENU GRID */}
          <motion.div
            key={`${category}-${vegOnly}`}
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: window.innerWidth < 768 ? 0.015 : 0.045,
                  delayChildren: 0.04,
                },
              },
            }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {filteredMenu.map((item) => {
              const qty = getQty(item._id);
              const image = item.image;
              const itemCategoryIconSvg = getItemCategoryIcon(item);
              const isVeg = item.foodType !== "nonveg";
              const badge = item.badge;
              const isAvailable = item.available !== false;

              return (
                <motion.div
                  key={item._id}
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 22,
                      scale: 0.985,
                    },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        duration: 0.42,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    },
                  }}
                  className={`mobile-card-soft group relative isolate flex flex-col overflow-hidden rounded-[20px] bg-white
            border border-amber-100/60
            shadow-[0_4px_16px_rgba(59,33,24,0.07),0_1px_3px_rgba(59,33,24,0.04)]
            transition-colors duration-300
            md:transition-all md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)]
            md:hover:-translate-y-2 md:hover:scale-[1.01]
            md:hover:border-amber-300/60
            md:hover:shadow-[0_28px_60px_rgba(180,83,9,0.18),0_6px_20px_rgba(180,83,9,0.10)]
            ${isAvailable ? "" : "opacity-65 grayscale"}`}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-[20px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 transition-opacity duration-300 md:group-hover:opacity-100 z-10" />

                  <div className="absolute z-0 w-24 h-24 transition-opacity duration-500 rounded-full opacity-0 pointer-events-none mobile-glow -right-8 -top-8 bg-amber-300/20 blur-2xl md:group-hover:opacity-100" />

                  <div className="mobile-ring pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-inset ring-amber-300/0 transition-all duration-500 md:group-hover:ring-amber-300/25 z-10" />

                  <div className="relative overflow-hidden aspect-[4/3] bg-amber-50 rounded-t-[20px] flex-shrink-0">
                    <div className="mobile-shine pointer-events-none absolute inset-0 z-10 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/22 to-transparent transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:translate-x-[130%]" />

                    <img
                      src={image}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className={`object-cover w-full h-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:duration-700 md:group-hover:scale-[1.07] ${
                        !isAvailable ? "opacity-50 grayscale" : ""
                      }`}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-black/[0.03] to-transparent" />

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
                            className="absolute top-2.5 left-2.5 z-20 inline-flex items-center gap-1.5 rounded-full shadow-md backdrop-blur-md"
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
                          className={`w-1.5 h-1.5 rounded-full ${
                            isVeg ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                        {isVeg ? "VEG" : "NON VEG"}
                      </span>

                      <div
                        className={`relative flex items-center justify-center w-7 h-7 rounded-xl border shadow-md backdrop-blur-xl transition-transform duration-300 bg-white/95 md:group-hover:scale-110 md:group-hover:rotate-3 ${
                          isVeg ? "border-emerald-300" : "border-red-300"
                        }`}
                      >
                        <div
                          className={`relative flex items-center justify-center w-4 h-4 rounded-[4px] border ${
                            isVeg ? "border-emerald-500" : "border-red-500"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
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

                  <div className="relative flex flex-col flex-1 px-5 pt-4 pb-5 bg-white transition-colors duration-300 md:group-hover:bg-[#fffbf4]">
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
                            className="text-[26px] font-extrabold leading-none"
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
                          className="text-[26px] font-extrabold leading-none"
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

                    <div className="relative z-20 mt-4">
                      <AddToCartButton
                        item={item}
                        qty={qty}
                        isAvailable={isAvailable}
                        addToCart={addToCart}
                        removeItem={removeItem}
                      />
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

      {cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-50 bottom-6 right-6"
        >
          <Link
            to="/cart"
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-full shadow-lg bg-amber-600 hover:bg-amber-700 active:scale-95"
          >
            <ShoppingCart size={18} />
            View Cart ({totalItems})
          </Link>
        </motion.div>
      )}

      {showScroll && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed z-50 flex items-center justify-center text-white transition-all duration-200 rounded-full shadow-lg bottom-6 left-6 w-11 h-11 bg-amber-600 hover:bg-amber-700"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
}

export default Menu;
