import { useEffect, useRef, useState } from "react";
import api from "../../../api/api";
import { useNavigate } from "react-router-dom";
import ExpandableText from "../../../admin/components/ExpandableText";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  X,
  UtensilsCrossed,
  LayoutGrid,
  ChevronUp,
  Search,
  ScanLine,
} from "lucide-react";
import { useWebsiteSettings } from "../../../context/WebsiteSettingsContext";

// const API_URL = import.meta.env.VITE_API_URL;

function MenuPreviewTitle({
  softShadow = true,
  glow = true,
  settings = {},
  headingFont = "Fraunces",
}) {
  const titleTop = settings?.menuPreviewTitleTop || "Menu";
  const titleBottom = settings?.menuPreviewTitleBottom || "Preview";

  return (
    <div
      className="relative text-center leading-[0.85] tracking-[-0.09em] text-[#241309]"
      style={{
        fontFamily: `'${headingFont}', 'Fraunces', 'Playfair Display', Georgia, serif`,
        fontSize: "clamp(2.9rem, 8.6vw, 5.35rem)",
        fontWeight: headingFont === "Fraunces" ? 850 : 800,
        fontOpticalSizing: "none",
        fontVariationSettings:
          headingFont === "Fraunces"
            ? '"opsz" 9, "wght" 850, "SOFT" 42, "WONK" 1'
            : "normal",

        transform: "scaleY(1.06)",

        textShadow: softShadow
          ? "0 18px 48px rgba(73,35,12,0.24), 0 2px 0 rgba(255,246,220,0.45)"
          : "none",

        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      {glow && (
        <>
          <span className="pointer-events-none absolute -left-5 top-2 -z-10 h-28 w-28 rounded-full bg-[#c8843f]/20 blur-3xl" />
          <span className="pointer-events-none absolute -right-4 bottom-2 -z-10 h-24 w-24 rounded-full bg-[#ffe2a3]/24 blur-3xl" />
        </>
      )}

      <span
        className="block whitespace-nowrap"
        style={{ color: settings?.menuPreviewTitleColor || "#241309" }}
      >
        {titleTop}
      </span>

      <span
        className="relative block px-3 w-max whitespace-nowrap"
        style={{
          background:
            settings?.menuPreviewTitleGradient ||
            "linear-gradient(92deg, #7b3817 0%, #d2954f 42%, #8a4218 70%, #35190a 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: softShadow
            ? "drop-shadow(0 12px 22px rgba(128,67,24,0.18))"
            : "none",
        }}
      >
        {titleBottom}
      </span>
    </div>
  );
}

function MenuPreview({ previewSettings = null }) {
  const websiteContext = useWebsiteSettings() || {};
  const settings = previewSettings || websiteContext.settings || {};

  const headingFont =
    settings?.headingFont ||
    settings?.headingFontFamily ||
    settings?.titleFont ||
    settings?.fontHeading ||
    "Fraunces";

  const bodyFont =
    settings?.bodyFont ||
    settings?.bodyFontFamily ||
    settings?.fontBody ||
    "DM Sans";

  useEffect(() => {
    const cleanHeading = headingFont || "Fraunces";
    const cleanBody = bodyFont || "DM Sans";

    const fontUrl = `https://fonts.googleapis.com/css2?family=${cleanHeading
      .trim()
      .replaceAll(" ", "+")}:wght@300;400;500;600;700;800;900&family=${cleanBody
      .trim()
      .replaceAll(" ", "+")}:wght@300;400;500;600;700;800;900&display=swap`;

    let link = document.getElementById("menu-preview-dynamic-fonts");

    if (!link) {
      link = document.createElement("link");
      link.id = "menu-preview-dynamic-fonts";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    link.href = fontUrl;

    document.documentElement.style.setProperty(
      "--menu-heading-font",
      cleanHeading,
    );
    document.documentElement.style.setProperty("--menu-body-font", cleanBody);
  }, [headingFont, bodyFont]);

  const settingsReady =
    !!previewSettings ||
    (websiteContext.settings &&
      Object.keys(websiteContext.settings).length > 0);

  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [renderFilter, setRenderFilter] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [showHowModal, setShowHowModal] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);
  const [search, setSearch] = useState("");

  const animationOn = settingsReady
    ? settings?.menuPreviewAnimation === true
    : false;

  const [showIntro, setShowIntro] = useState(animationOn);
  const [titleFlight, setTitleFlight] = useState(false);
  const [titleLanded, setTitleLanded] = useState(false);
  const [hideFlyingTitle, setHideFlyingTitle] = useState(false);
  const [titleTarget, setTitleTarget] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const heroTitleRef = useRef(null);
  const navigate = useNavigate();

  const cafeName = settings?.cafeName || "The White House Café";
  const bgColor =
    settings?.menuPreviewBgColor || settings?.bgColor || "#f5f0e8";
  const cardBg = settings?.menuPreviewCardBg || settings?.cardBg || "#ffffff";
  const primaryColor = settings?.primaryColor || "#3d2412";
  const accentColor = settings?.accentColor || "#d97706";

  const activeLinkColor =
    settings?.navbarActiveLinkColor || settings?.activeLinkColor || "#d97706";
  const textColor = settings?.textColor || "#241309";
  const mutedTextColor = settings?.bodyTextColor || "#6b7280";

  const heroEyebrow = settings?.menuPreviewEyebrow || "• Explore Our •";
  const heroSubtitle =
    settings?.menuPreviewSubtitle ||
    "Browse our curated café menu, explore categories, and discover freshly prepared dishes before you dine.";

  const introSmallText =
    settings?.menuPreviewIntroSmallText || "Painting the menu mood";
  const introBottomText =
    settings?.menuPreviewIntroBottomText || "Fresh plates. Warm café mood.";

  const measureHeroTitle = () => {
    if (!heroTitleRef.current) return;

    const rect = heroTitleRef.current.getBoundingClientRect();

    setTitleTarget({
      left: rect.left,
      top: rect.top,
    });
  };

  useEffect(() => {
    api
      .get("/menu")
      .then((res) => {
        const data = res.data;

        if (Array.isArray(data)) {
          setMenu(data);
        } else if (Array.isArray(data.menu)) {
          setMenu(data.menu);
        } else if (Array.isArray(data.items)) {
          setMenu(data.items);
        } else if (Array.isArray(data.data)) {
          setMenu(data.data);
        } else {
          setMenu([]);
        }
      })
      .catch(() => setMenu([]));

    api
      .get("/categories")
      .then((res) => {
        const data = res.data;

        if (Array.isArray(data)) {
          setCategories(data);
        } else if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else if (Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          setCategories([]);
        }
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!settingsReady) return;

    if (!animationOn) {
      setShowIntro(false);
      setTitleFlight(false);
      setTitleLanded(true);
      setHideFlyingTitle(true);
      setLoaded(true);
      setTitleTarget(null);
      return;
    }

    setShowIntro(true);
    setTitleFlight(false);
    setTitleLanded(false);
    setHideFlyingTitle(false);
    setLoaded(false);

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
  }, [animationOn, settingsReady]);

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

  function DynamicDivider({ settings }) {
    const style = settings?.dividerStyle || "goldLine";

    const svgCode =
      settings?.dividerSvg ||
      settings?.customSvgCode ||
      settings?.dividerSvgCode ||
      settings?.customDividerSvg ||
      settings?.menuDividerSvg ||
      "";

    const color = settings?.dividerColor || "#D4A853";
    const height = Number(settings?.dividerHeight) || 2;
    const width = Number(settings?.dividerWidth) || 100;

    // ✅ Show custom SVG if SVG exists, even if dividerStyle was not saved correctly
    if (svgCode && svgCode.includes("<svg")) {
      return (
        <div
          className="flex justify-center  [&_svg]:block [&_svg]:max-w-full [&_svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svgCode }}
        />
      );
    }

    if (style === "minimalLine") {
      return (
        <div
          className="mx-auto rounded-full"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            background: color,
          }}
        />
      );
    }

    if (style === "modernWave") {
      return (
        <div className="text-2xl font-black text-center " style={{ color }}>
          ~ ~ ~
        </div>
      );
    }

    if (style === "floralCafe") {
      return (
        <div className="flex items-center justify-center gap-3 ">
          <span
            className="rounded-full"
            style={{ width, height, background: color }}
          />
          <span style={{ color }}>🌿</span>
          <span
            className="rounded-full"
            style={{ width, height, background: color }}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-3 ">
        <span
          className="rounded-full"
          style={{ width, height, background: color }}
        />
        <span style={{ color }}>✦</span>
        <span
          className="rounded-full"
          style={{ width, height, background: color }}
        />
      </div>
    );
  }

  const safeMenu = Array.isArray(menu) ? menu : [];

  const filteredMenu = safeMenu.filter((item) => {
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
    if (cat === "all") return safeMenu.length;
    return safeMenu.filter((i) => i.category === cat).length;
  };

  const renderCategoryIcon = (cat) => {
    if (cat.name === "all") {
      return <LayoutGrid size={15} />;
    }

    if (cat.iconSvg) {
      return (
        <span
          className="flex h-4 w-4 items-center justify-center [&_svg]:h-4 [&_svg]:w-4"
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

  if (!settingsReady) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: bgColor }} />
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: bgColor,
        fontFamily: `var(--menu-body-font), '${bodyFont}', sans-serif`,
      }}
    >
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
      0% { transform: translateX(-125%) rotate(10deg); opacity: 0; }
      18% { opacity: 1; }
      80% { opacity: 1; }
      100% { transform: translateX(125%) rotate(10deg); opacity: 0; }
    }

    @keyframes floatSlow {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(4deg); }
    }

    @media (max-width: 640px) {
      .whc-preview-flying-label {
        display: none;
      }
    }
  `}</style>

      {/* INTRO CURTAIN */}
      <AnimatePresence>
        {showIntro && animationOn && (
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
            <div
              className="absolute inset-0"
              style={{
                background:
                  settings?.menuPreviewIntroBg ||
                  "radial-gradient(circle at 20% 20%, rgba(245,158,11,0.35), transparent 35%), radial-gradient(circle at 80% 70%, rgba(16,185,129,0.16), transparent 35%), linear-gradient(135deg,#2b1609 0%,#7c3f11 52%,#f3d7a8 100%)",
              }}
            />

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-1/2 z-0 h-44 w-full origin-left -translate-y-1/2 bg-[#fff4dc]/20 blur-3xl"
            />

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
              {cafeName}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{
                opacity: titleFlight ? 0 : 1,
                y: titleFlight ? -12 : 0,
              }}
              transition={{ delay: titleFlight ? 0 : 0.75, duration: 0.65 }}
              className="absolute top-[24%] z-10 text-center text-[9px] font-black uppercase tracking-[0.38em] text-amber-100/55 sm:text-[10px]"
            >
              {introSmallText}
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
                {introBottomText}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ONE REAL MOVING TITLE */}
      <AnimatePresence>
        {!hideFlyingTitle && animationOn && (
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
              left: { duration: 1.05, ease: [0.18, 1, 0.25, 1] },
              top: { duration: 1.05, ease: [0.18, 1, 0.25, 1] },
              x: { duration: 1.05, ease: [0.18, 1, 0.25, 1] },
              y: { duration: 1.05, ease: [0.18, 1, 0.25, 1] },
            }}
            className="pointer-events-none fixed z-[10000] w-max max-w-none"
          >
            <div className="whc-preview-paint">
              <MenuPreviewTitle
                softShadow={false}
                glow={false}
                settings={settings}
                headingFont={headingFont}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <div
        className="relative overflow-hidden border-t border-amber-300/50"
        style={{
          backgroundColor: bgColor,
          fontFamily: `var(--menu-body-font), '${bodyFont}', sans-serif`,
        }}
      >
        <div className="absolute w-48 h-48 rounded-full pointer-events-none -left-20 -top-24 bg-amber-200/20 blur-3xl" />
        <div className="absolute w-56 h-56 rounded-full pointer-events-none -bottom-32 -right-20 bg-orange-200/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(65,35,14,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(65,35,14,0.06)_1px,transparent_1px)] bg-[size:42px_42px]" />

        <div className="pointer-events-none absolute left-12 top-12 hidden select-none text-2xl opacity-20 md:block animate-[floatSlow_5s_ease-in-out_infinite]">
          ☕
        </div>

        <div className="pointer-events-none absolute right-16 top-12 hidden select-none text-xl opacity-25 md:block animate-[floatSlow_6s_ease-in-out_infinite]">
          🌿
        </div>

        <div className="pointer-events-none absolute bottom-8 left-[18%] hidden select-none text-lg opacity-20 md:block animate-[floatSlow_7s_ease-in-out_infinite]">
          ✦
        </div>

        <div className="pointer-events-none absolute bottom-8 right-[20%] hidden select-none text-xl opacity-20 md:block animate-[floatSlow_5.5s_ease-in-out_infinite]">
          🍃
        </div>

        <div className="relative max-w-6xl px-4 mx-auto text-center pb-14 pt-7 sm:px-6 md:pb-16 md:pt-8 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 14 }}
            transition={{ duration: 0.55 }}
            className="text-[11px] font-black uppercase tracking-[0.48em] sm:text-xs"
            style={{ color: activeLinkColor || accentColor }}
          >
            {heroEyebrow}
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
            <MenuPreviewTitle
              softShadow={false}
              glow={false}
              settings={settings}
              headingFont={headingFont}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 14 }}
            transition={{ delay: 0.15, duration: 0.55 }}
            className="flex items-center justify-center mt-7"
          >
            <DynamicDivider settings={settings} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 14 }}
            transition={{ delay: 0.26, duration: 0.55 }}
            className="mx-auto mt-3 max-w-lg text-[13px] font-medium leading-relaxed sm:text-sm"
            style={{ color: mutedTextColor }}
          >
            {heroSubtitle}
          </motion.p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{
          opacity: loaded ? 1 : 0,
          y: loaded ? 0 : 26,
        }}
        transition={{
          delay: 0.12,
          duration: 0.55,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="px-4 pb-20 mx-auto max-w-7xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{
            opacity: loaded ? 1 : 0,
            scale: loaded ? 1 : 0.99,
          }}
          transition={{
            delay: 0.2,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="p-5 shadow-xl rounded-3xl"
          style={{ background: cardBg }}
        >
          {/* FILTER TOP */}
          <div className="flex items-center justify-center gap-4 mb-6 md:justify-between">
            <div className="flex-wrap hidden gap-2 md:flex">
              {categoryTabs.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setCategory(cat.name)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    category === cat.name
                      ? "!text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-amber-50"
                  }`}
                  style={{
                    backgroundColor:
                      category === cat.name ? activeLinkColor : undefined,
                  }}
                >
                  {renderCategoryIcon(cat)}
                  <span className="capitalize">{cat.name}</span>
                </button>
              ))}

              {/* VEG BTN */}
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className="relative h-[42px] w-[120px] rounded-full border p-1 shadow-sm transition-all duration-300"
                style={{
                  backgroundColor: vegOnly ? activeLinkColor : "#ffffff",
                  borderColor: vegOnly ? activeLinkColor : "#e5e7eb",
                }}
              >
                <span
                  className={`absolute left-1 top-1 h-[32px] w-[54px] rounded-full shadow transition-transform duration-300 ${
                    vegOnly ? "translate-x-[56px]" : "translate-x-0"
                  }`}
                  style={{
                    backgroundColor: vegOnly ? "#ffffff" : activeLinkColor,
                  }}
                />

                <span className="relative z-10 flex items-center justify-between h-full px-3 text-xs font-semibold">
                  <span className={!vegOnly ? "text-white" : "text-white/80"}>
                    All
                  </span>

                  <span
                    style={{
                      color: vegOnly ? activeLinkColor : "#6b7280",
                    }}
                  >
                    Veg
                  </span>
                </span>
              </button>
            </div>

            {/* SEARCH */}
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
                  className="h-11 w-[240px] rounded-full border border-amber-200 bg-white pl-11 pr-4 text-sm font-medium text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 lg:w-[300px]"
                />
              </div>

              <button
                onClick={openFilter}
                className="flex items-center gap-2 rounded-full border border-amber-300 px-5 py-2.5 text-sm font-medium text-amber-700 shadow-sm transition-all duration-300 hover:bg-amber-50 hover:shadow-md"
              >
                <Filter size={16} />
                Filter
              </button>
            </div>
          </div>

          {/* MOBILE FILTER */}
          <AnimatePresence>
            {renderFilter && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9999] flex bg-black/40"
                onClick={closeFilter}
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  initial={{ x: "-100%" }}
                  animate={{ x: showFilter ? 0 : "-100%" }}
                  exit={{ x: "-100%" }}
                  transition={{
                    duration: 0.28,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="h-screen w-[88vw] max-w-[360px] overflow-y-auto bg-white p-5 shadow-2xl"
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

                    <div className="relative mt-4">
                      <Search
                        size={16}
                        className="absolute -translate-y-1/2 left-4 top-1/2 text-amber-700"
                      />

                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search food..."
                        className="w-full py-3 pr-4 text-sm font-semibold text-gray-700 transition border outline-none rounded-2xl border-amber-200 bg-amber-50/50 pl-11 placeholder:text-gray-400 focus:border-amber-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {categoryTabs.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => {
                          setCategory(cat.name);
                          closeFilter();
                        }}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm capitalize transition ${
                          category === cat.name
                            ? "font-medium text-white"
                            : "text-gray-600 hover:bg-amber-50"
                        }`}
                        style={{
                          backgroundColor:
                            category === cat.name ? activeLinkColor : undefined,
                        }}
                      >
                        {renderCategoryIcon(cat)}
                        <span>{cat.name}</span>

                        <span className="ml-auto text-xs opacity-60">
                          ({countByCategory(cat.name)})
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* GRID */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredMenu.map((item) => {
              const image = item.image;
              const isVeg = item.foodType === "veg";
              const isAvailable = item.available !== false;
              const badge = item.badge;
              const itemCategoryIconSvg = getItemCategoryIcon(item);

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 18, scale: 0.99 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "80px" }}
                  transition={{
                    duration: 0.28,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`mobile-card-soft group relative isolate flex flex-col overflow-hidden rounded-[20px] border border-amber-100/60 bg-white
            shadow-[0_4px_16px_rgba(59,33,24,0.07),0_1px_3px_rgba(59,33,24,0.04)]
            transition-colors duration-300
            md:transition-all md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)]
            md:hover:-translate-y-2 md:hover:scale-[1.01]
            md:hover:border-amber-300/60
            md:hover:shadow-[0_28px_60px_rgba(180,83,9,0.18),0_6px_20px_rgba(180,83,9,0.10)]
            ${isAvailable ? "" : "opacity-65 grayscale"}`}
                >
                  {/* TOP LINE */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] rounded-t-[20px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 transition-opacity duration-300 md:group-hover:opacity-100" />

                  {/* GLOW */}
                  <div className="absolute z-0 w-24 h-24 transition-opacity duration-500 rounded-full opacity-0 pointer-events-none mobile-glow -right-8 -top-8 bg-amber-300/20 blur-2xl md:group-hover:opacity-100" />

                  {/* RING */}
                  <div className="mobile-ring pointer-events-none absolute inset-0 z-10 rounded-[20px] ring-1 ring-inset ring-amber-300/0 transition-all duration-500 md:group-hover:ring-amber-300/25" />

                  {/* IMAGE */}
                  <div className="relative aspect-[4/3] flex-shrink-0 overflow-hidden rounded-t-[20px] bg-amber-50">
                    <div className="mobile-shine pointer-events-none absolute inset-0 z-10 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/22 to-transparent transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:translate-x-[130%]" />

                    <img
                      src={image}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className={`h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:duration-700 md:group-hover:scale-[1.07] ${
                        !isAvailable ? "opacity-50 grayscale" : ""
                      }`}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-black/[0.03] to-transparent" />

                    {/* BADGE */}
                    {badge &&
                      badge !== "none" &&
                      isAvailable &&
                      (() => {
                        const normalizedBadge = String(badge)
                          .toLowerCase()
                          .trim()
                          .replaceAll(" ", "")
                          .replaceAll("'", "");

                        const configs = {
                          bestseller: {
                            bg: "linear-gradient(135deg, rgba(127,29,29,0.96), rgba(220,38,38,0.94), rgba(251,146,60,0.94))",
                            text: "#fff7ed",
                            iconBg: "#fff1d6",
                            iconColor: "#991b1b",
                            icon: "★",
                            label: "Best Seller",
                            glow: "0 12px 28px rgba(220,38,38,0.28)",
                          },
                          chef: {
                            bg: "linear-gradient(135deg, rgba(61,31,0,0.96), rgba(120,63,4,0.94), rgba(217,119,6,0.92))",
                            text: "#fff3c4",
                            iconBg: "#ffe7a3",
                            iconColor: "#3d1f00",
                            icon: "✦",
                            label: "Chef's Pick",
                            glow: "0 12px 28px rgba(180,83,9,0.32)",
                          },
                          chefspick: {
                            bg: "linear-gradient(135deg, rgba(61,31,0,0.96), rgba(120,63,4,0.94), rgba(217,119,6,0.92))",
                            text: "#fff3c4",
                            iconBg: "#ffe7a3",
                            iconColor: "#3d1f00",
                            icon: "✦",
                            label: "Chef's Pick",
                            glow: "0 12px 28px rgba(180,83,9,0.32)",
                          },
                          musttry: {
                            bg: "linear-gradient(135deg, rgba(136,19,55,0.96), rgba(225,29,72,0.94), rgba(249,115,22,0.9))",
                            text: "#fff1f2",
                            iconBg: "#ffe4e6",
                            iconColor: "#9f1239",
                            icon: "▲",
                            label: "Must Try",
                            glow: "0 12px 28px rgba(225,29,72,0.28)",
                          },
                          new: {
                            bg: "linear-gradient(135deg, rgba(6,78,59,0.96), rgba(5,150,105,0.94), rgba(45,212,191,0.9))",
                            text: "#ecfdf5",
                            iconBg: "#ccfbf1",
                            iconColor: "#065f46",
                            icon: "◆",
                            label: "New Arrival",
                            glow: "0 12px 28px rgba(5,150,105,0.28)",
                          },
                          limited: {
                            bg: "linear-gradient(135deg, rgba(45,21,99,0.96), rgba(109,40,217,0.94), rgba(217,70,239,0.9))",
                            text: "#faf5ff",
                            iconBg: "#ede9fe",
                            iconColor: "#4c1d95",
                            icon: "⬡",
                            label: "Limited",
                            glow: "0 12px 28px rgba(109,40,217,0.3)",
                          },
                        };

                        const c = configs[normalizedBadge];
                        if (!c) return null;

                        return (
                          <span
                            className="absolute left-2.5 top-2.5 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/20 backdrop-blur-md"
                            style={{
                              background: c.bg,
                              color: c.text,
                              padding: "5px 11px 5px 5px",
                              fontSize: 9,
                              fontWeight: 900,
                              letterSpacing: "0.08em",
                              whiteSpace: "nowrap",
                              boxShadow: c.glow,
                              textTransform: "uppercase",
                            }}
                          >
                            <span
                              className="relative flex items-center justify-center rounded-full shrink-0"
                              style={{
                                width: 19,
                                height: 19,
                                background: c.iconBg,
                                color: c.iconColor,
                                fontSize: 10,
                                boxShadow:
                                  "inset 0 1px 2px rgba(255,255,255,0.45)",
                              }}
                            >
                              {normalizedBadge === "new" && (
                                <span
                                  className="absolute inset-0 rounded-full animate-ping"
                                  style={{
                                    background: c.iconBg,
                                    opacity: 0.45,
                                  }}
                                />
                              )}

                              <span className="relative z-10">{c.icon}</span>
                            </span>

                            {c.label}
                          </span>
                        );
                      })()}

                    {/* SOLD OUT */}
                    {!isAvailable && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <div
                          className="rounded-full border border-white/20 bg-gray-900/82 px-5 py-1.5 shadow-xl backdrop-blur-sm"
                          style={{ transform: "rotate(-12deg)" }}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">
                            Unavailable
                          </span>
                        </div>
                      </div>
                    )}

                    {/* VEG/NONVEG */}
                    <div className="absolute right-2.5 top-2.5 z-30 flex items-center gap-1.5">
                      {/* SLIDE LABEL */}
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

                      {/* DOT */}
                      <div
                        className={`relative flex h-7 w-7 items-center justify-center rounded-xl border bg-white/95 shadow-md backdrop-blur-xl transition-transform duration-300 md:group-hover:scale-110 md:group-hover:rotate-3 ${
                          isVeg ? "border-emerald-300" : "border-red-300"
                        }`}
                      >
                        <div
                          className={`relative flex h-4 w-4 items-center justify-center rounded-[4px] border ${
                            isVeg ? "border-emerald-500" : "border-red-500"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isVeg ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* CATEGORY */}
                    {item.category && isAvailable && (
                      <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
                        {itemCategoryIconSvg && (
                          <span
                            className="flex h-3.5 w-3.5 items-center justify-center [&_svg]:h-3.5 [&_svg]:w-3.5"
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
                  <div className="relative flex flex-1 flex-col bg-white px-5 pb-5 pt-4 transition-colors duration-300 md:group-hover:bg-[#fffbf4]">
                    <h2
                      className="text-center text-[17px] font-extrabold leading-snug text-gray-900 sm:text-[18px]"
                      style={{
                        fontFamily: `'${headingFont}', Georgia, serif`,
                      }}
                    >
                      {item.name}
                    </h2>

                    <div className="mt-2">
                      <ExpandableText
                        text={
                          item.description ||
                          "A delicious item crafted with care."
                        }
                        className="text-center text-[12.5px] leading-relaxed text-gray-400"
                      />
                    </div>

                    <div className="flex items-center justify-center my-3">
                      <DynamicDivider settings={settings} />
                    </div>

                    {/* PRICE */}
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

                            <span className="rounded-full border border-amber-300/40 bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800">
                              SAVE ₹
                              {Number(item.price || 0) -
                                Number(item.salePrice || 0)}
                            </span>
                          </div>

                          <div
                            className="text-[26px] font-extrabold leading-none"
                            style={{
                              fontFamily: `'${headingFont}', Georgia, serif`,
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
                            fontFamily: `'${headingFont}', Georgia, serif`,
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
          </div>

          {/* EMPTY */}
          {filteredMenu.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
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
          className="fixed z-50 flex items-center justify-center text-white transition-all duration-200 rounded-full shadow-lg bottom-6 right-6 h-11 w-11 bg-amber-700 hover:bg-amber-800"
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
              style={{ fontFamily: `'${headingFont}', Georgia, serif` }}
            >
              How Ordering Works
            </h2>

            <ol className="mt-4 space-y-3 text-sm text-left text-gray-500">
              {[
                "Scan the QR code on your table.",
                "Browse our full menu and explore categories.",
                "Your server will take your order at the table.",
                "Sit back, relax and enjoy your meal! 🍽️",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-700 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <button
              onClick={() => setShowHowModal(false)}
              className="mt-6 w-full rounded-full bg-amber-700 py-2.5 text-sm font-medium text-white transition hover:bg-amber-800"
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
