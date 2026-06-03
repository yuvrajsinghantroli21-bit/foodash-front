import {
  useEffect,
  useState,
  useContext,
  useRef,
  useMemo,
  useCallback,
  memo,
} from "react";
import api from "../../../api/api";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../../../context/CartContext.jsx";
import { useWebsiteSettings } from "../../../context/WebsiteSettingsContext";
import ExpandableText from "../../../admin/components/ExpandableText.jsx";
import socket from "../../../socket/socket.js";
import toast from "react-hot-toast";
import AddToCartButton from "../../components/AddToCartButton.jsx";
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

/* ───────────────── CATEGORY ICON ───────────────── */

const CategoryIcon = memo(function CategoryIcon({
  cat,
  categoryIcons,
  active = false,
  small = false,
}) {
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
});

/* ───────────────── DYNAMIC DIVIDER ───────────────── */

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

/* ───────────────── CURTAIN LETTERS ───────────────── */

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

/* ───────────────── MENU TITLE ───────────────── */

function MenuTitle({ large = false, settings = {}, headingFont = "Fraunces" }) {
  const title = settings?.menuTitle || "Menu";
  const titleColor = settings?.menuTitleColor || "#b45309";

  return (
    <div
      className="relative text-center md:text-left"
      style={{
        fontFamily: `'${headingFont}', 'Fraunces', 'Playfair Display', Georgia, serif`,
        fontSize: large
          ? "clamp(4.3rem, 16vw, 8.2rem)"
          : "clamp(3.9rem, 13vw, 6.9rem)",

        fontWeight: headingFont === "Fraunces" ? 720 : 740,

        fontVariationSettings:
          headingFont === "Fraunces"
            ? '"opsz" 9, "wght" 720, "SOFT" 28, "WONK" 0'
            : "normal",

        letterSpacing: "-0.095em",
        lineHeight: "0.78",
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
          color: titleColor,
          WebkitTextStroke: "0px transparent",
          WebkitTextFillColor: titleColor,
          filter: "none",
          textShadow: "none",
        }}
      >
        {title}
      </span>

      {/* <span
        className="absolute -bottom-4 left-1/2 h-[2px] w-[76%] -translate-x-1/2 rounded-full md:left-1 md:translate-x-0"
        style={{
          background:
            settings?.menuTitleUnderline ||
            "linear-gradient(90deg, transparent, #d97706, transparent)",
        }}
      /> */}
    </div>
  );
}

/* ───────────────── PREMIUM BADGE ───────────────── */

function PremiumBadge({ badge }) {
  if (!badge || badge === "none") return null;

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
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.45)",
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
}

/* ───────────────── MENU CARD ───────────────── */

const MenuCard = memo(function MenuCard({
  item,
  qty,
  isAvailable,
  isVeg,
  badge,
  itemCategoryIconSvg,
  addToCart,
  removeItem,
  settings,
  headingFont,
}) {
  const image = item.image;

  const cardBg =
    settings?.menuCardBg || settings?.menuPreviewCardBg || "#ffffff";
  const cardHoverBg = settings?.menuCardHoverBg || "#fffbf4";
  const cardRadius = Number(settings?.menuCardRadius) || 20;
  const cardBorderColor =
    settings?.menuCardBorderColor || "rgba(253, 230, 138, 0.6)";
  const priceGradient =
    settings?.menuPriceGradient || "linear-gradient(135deg,#b45309,#d97706)";

  return (
    <motion.div
      layout={false}
      initial={{ opacity: 0, y: 14, scale: 0.99 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "80px" }}
      transition={{
        duration: 0.28,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`mobile-card-soft group relative isolate flex flex-col overflow-hidden bg-white
      shadow-[0_4px_16px_rgba(59,33,24,0.07),0_1px_3px_rgba(59,33,24,0.04)]
      transition-colors duration-300
      md:transition-all md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)]
      md:hover:-translate-y-2 md:hover:scale-[1.01]
      md:hover:shadow-[0_28px_60px_rgba(180,83,9,0.18),0_6px_20px_rgba(180,83,9,0.10)]
      ${isAvailable ? "" : "opacity-65 grayscale"}`}
      style={{
        background: cardBg,
        borderRadius: `${cardRadius}px`,
        border: `1px solid ${cardBorderColor}`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] opacity-0 transition-opacity duration-300 md:group-hover:opacity-100"
        style={{
          borderTopLeftRadius: `${cardRadius}px`,
          borderTopRightRadius: `${cardRadius}px`,
          background:
            settings?.menuCardTopLine ||
            "linear-gradient(90deg, transparent, #f59e0b, transparent)",
        }}
      />

      <div className="absolute z-0 w-24 h-24 transition-opacity duration-500 rounded-full opacity-0 pointer-events-none mobile-glow -right-8 -top-8 bg-amber-300/20 blur-2xl md:group-hover:opacity-100" />

      <div
        className="absolute inset-0 z-10 transition-all duration-500 pointer-events-none mobile-ring ring-1 ring-inset ring-amber-300/0 md:group-hover:ring-amber-300/25"
        style={{ borderRadius: `${cardRadius}px` }}
      />

      <div
        className="relative overflow-hidden aspect-[4/3] bg-amber-50 flex-shrink-0"
        style={{
          borderTopLeftRadius: `${cardRadius}px`,
          borderTopRightRadius: `${cardRadius}px`,
        }}
      >
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

        {isAvailable && <PremiumBadge badge={badge} />}

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

      <div
        className="relative flex flex-col flex-1 px-5 pt-4 pb-5 transition-colors duration-300"
        style={{
          background: cardBg,
        }}
      >
        <style>{`
          .menu-card-hover:hover .menu-card-content {
            background: ${cardHoverBg};
          }
        `}</style>

        <h2
          className="text-[17px] sm:text-[18px] font-extrabold text-gray-900 leading-snug text-center"
          style={{
            fontFamily: `'${headingFont}', Georgia, serif`,
            color: settings?.menuItemTitleColor || "#111827",
          }}
        >
          {item.name}
        </h2>

        <div className="mt-2">
          <ExpandableText
            text={item.description || "A delicious item crafted with care."}
            className="text-[12.5px] leading-relaxed text-gray-400 text-center"
          />
        </div>

        <div className="flex items-center justify-center my-3">
          <DynamicDivider settings={settings} />
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
                    background: "linear-gradient(135deg,#fef3c7,#fde68a)",
                    boxShadow: "0 1px 4px rgba(251,191,36,0.2)",
                  }}
                >
                  SAVE ₹{Number(item.price || 0) - Number(item.salePrice || 0)}
                </span>
              </div>

              <div
                className="text-[26px] font-extrabold leading-none"
                style={{
                  fontFamily: `'${headingFont}', Georgia, serif`,
                  background: priceGradient,
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
                background: priceGradient,
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
});

/* ───────────────── MAIN MENU ───────────────── */

function Menu() {
  const websiteContext = useWebsiteSettings() || {};
  const settings = websiteContext.settings || {};

  const settingsReady =
    websiteContext.settings && Object.keys(websiteContext.settings).length > 0;

  const animationOn = settingsReady ? settings?.menuAnimation !== false : false;

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

  const cafeName = settings?.cafeName || "The White House Café";
  const bgColor = settings?.menuBgColor || settings?.bgColor || "#f5f0e8";
  const cardBg = settings?.menuSectionCardBg || "#ffffff";
  const activeColor =
    settings?.navbarActiveLinkColor || settings?.activeLinkColor || "#d97706";
  const mutedTextColor = settings?.bodyTextColor || "#6b7280";

  const [menu, setMenu] = useState([]);
  const [table, setTable] = useState(null);
  const [category, setCategory] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [renderFilter, setRenderFilter] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);
  const [dbCategories, setDbCategories] = useState([]);

  const [showIntro, setShowIntro] = useState(false);
  const [curtainStep, setCurtainStep] = useState("welcome");
  const [curtainLeaving, setCurtainLeaving] = useState(false);
  const [titleFlight, setTitleFlight] = useState(false);
  const [titleLanded, setTitleLanded] = useState(false);
  const [hideFlyingTitle, setHideFlyingTitle] = useState(false);
  const [titleTarget, setTitleTarget] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const heroTitleRef = useRef(null);
  const sessionCheckedRef = useRef(false);

  const { cart, addToCart, removeItem, clearCart } = useContext(CartContext);
  const { token: tokenFromUrl } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const queryToken = queryParams.get("token");
  const queryRestaurant = queryParams.get("restaurant");
  const storedToken = localStorage.getItem("token");
  const token = tokenFromUrl || queryToken || storedToken;

  // const storedToken = localStorage.getItem("token");

  // ✅ Keep false in real QR/session flow
  const DEV_MENU_TEST = false;

  // const token = DEV_MENU_TEST
  //   ? null
  //   : tokenFromUrl || queryToken || storedToken;

  useEffect(() => {
    if (queryRestaurant) {
      localStorage.setItem("restaurantSlug", queryRestaurant);
    }
  }, [queryRestaurant]);

  useEffect(() => {
    const cleanHeading = headingFont || "Fraunces";
    const cleanBody = bodyFont || "DM Sans";

    const fontUrl = `https://fonts.googleapis.com/css2?family=${cleanHeading
      .trim()
      .replaceAll(" ", "+")}:wght@300;400;500;600;700;800;900&family=${cleanBody
      .trim()
      .replaceAll(" ", "+")}:wght@300;400;500;600;700;800;900&display=swap`;

    let link = document.getElementById("menu-dynamic-fonts");

    if (!link) {
      link = document.createElement("link");
      link.id = "menu-dynamic-fonts";
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

  const measureHeroTitle = useCallback(() => {
    if (!heroTitleRef.current) return;

    const rect = heroTitleRef.current.getBoundingClientRect();

    setTitleTarget({
      left: rect.left,
      top: rect.top,
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim().toLowerCase());
    }, 180);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (sessionCheckedRef.current) return;
    sessionCheckedRef.current = true;

    if (!token) {
      setSessionReady(true);
      toast.error("Please scan QR first");
      localStorage.removeItem("token");
      localStorage.removeItem("table");
      clearCart();
      navigate("/scan", { replace: true });
      return;
    }

    // if (!token) {
    //   setTable("TEST");
    //   setSessionReady(true);
    //   return;
    // }

    api
      .get(`/session/${token}`)
      .then((res) => {
        setTable(res.data.table);
        localStorage.setItem("table", res.data.table);
        localStorage.setItem("token", token);
        setSessionReady(true);

        if (tokenFromUrl || queryToken) {
          navigate("/order", { replace: true });
        }
      })
      .catch(() => {
        setSessionReady(true);
        toast.error("Session expired. Please scan again.");
        localStorage.removeItem("token");
        localStorage.removeItem("table");
        clearCart();
        navigate("/thank-you", { replace: true });
      });
  }, [token, tokenFromUrl, queryToken, navigate, clearCart]);

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
    let cancelled = false;

    Promise.all([
      api.get(`/menu`),
      api.get(`/categories`).catch(() => ({ data: [] })),
    ])
      .then(([menuRes, categoryRes]) => {
        if (cancelled) return;

        const menuData = menuRes.data;
        const categoryData = categoryRes.data;

        if (Array.isArray(menuData)) {
          setMenu(menuData);
        } else if (Array.isArray(menuData.menu)) {
          setMenu(menuData.menu);
        } else if (Array.isArray(menuData.items)) {
          setMenu(menuData.items);
        } else if (Array.isArray(menuData.data)) {
          setMenu(menuData.data);
        } else {
          setMenu([]);
        }

        if (Array.isArray(categoryData)) {
          setDbCategories(categoryData);
        } else if (Array.isArray(categoryData.categories)) {
          setDbCategories(categoryData.categories);
        } else if (Array.isArray(categoryData.data)) {
          setDbCategories(categoryData.data);
        } else {
          setDbCategories([]);
        }
      })
      .catch((err) => {
        console.log(err);
        setMenu([]);
        setDbCategories([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!settingsReady || !sessionReady) return;

    // ✅ If menu animation is off from Admin Settings,
    // do not show curtain, flying title, or delayed page reveal.
    if (!animationOn) {
      setShowIntro(false);
      setCurtainStep("menu");
      setCurtainLeaving(false);
      setTitleFlight(false);
      setTitleLanded(true);
      setHideFlyingTitle(true);
      setLoaded(true);
      setTitleTarget(null);
      return;
    }

    // ✅ Full cinematic animation every time the Menu page opens.
    setShowIntro(true);
    setCurtainStep("welcome");
    setCurtainLeaving(false);
    setTitleFlight(false);
    setTitleLanded(false);
    setHideFlyingTitle(false);
    setLoaded(false);
    setTitleTarget(null);

    const measureTimer = setTimeout(() => {
      measureHeroTitle();
    }, 250);

    const onResize = () => {
      measureHeroTitle();
    };

    window.addEventListener("resize", onResize);

    const stepTimer = setTimeout(() => {
      setCurtainStep("menu");
    }, 1850);

    const startFlightTimer = setTimeout(() => {
      measureHeroTitle();
      setTitleFlight(true);
      setCurtainLeaving(true);
    }, 3500);

    const landTimer = setTimeout(() => {
      setTitleLanded(true);
    }, 4620);

    const hideFlyTimer = setTimeout(() => {
      setHideFlyingTitle(true);
    }, 4720);

    const removeCurtainTimer = setTimeout(() => {
      setShowIntro(false);
    }, 4780);

    const loadTimer = setTimeout(() => {
      setLoaded(true);
    }, 4880);

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
  }, [settingsReady, sessionReady, animationOn, measureHeroTitle]);

  const categoryIcons = useMemo(() => {
    return dbCategories.reduce((acc, cat) => {
      acc[cat.name?.toLowerCase()] = cat.iconSvg;
      return acc;
    }, {});
  }, [dbCategories]);

  const categories = useMemo(() => {
    const safeMenu = Array.isArray(menu) ? menu : [];
    const safeDbCategories = Array.isArray(dbCategories) ? dbCategories : [];

    const menuCategories = [
      ...new Set(
        safeMenu
          .map((item) => item.category)
          .filter((cat) => cat && cat.trim() !== ""),
      ),
    ];

    const dbCategoryNames = safeDbCategories.map((cat) => cat.name);

    return ["all", ...new Set([...dbCategoryNames, ...menuCategories])];
  }, [menu, dbCategories]);

  const getItemCategoryIcon = useCallback(
    (item) => {
      if (item.categoryIconSvg) return item.categoryIconSvg;

      const matched = dbCategories.find((cat) => cat.name === item.category);
      return matched?.iconSvg || "";
    },
    [dbCategories],
  );

  const countByCategory = useCallback(
    (cat) => {
      const safeMenu = Array.isArray(menu) ? menu : [];

      return cat === "all"
        ? safeMenu.length
        : safeMenu.filter((i) => i.category === cat).length;
    },
    [menu],
  );

  const filteredMenu = useMemo(() => {
    const safeMenu = Array.isArray(menu) ? menu : [];

    return safeMenu.filter((item) => {
      const categoryMatch = category === "all" || item.category === category;
      const vegMatch = !vegOnly || item.foodType === "veg";

      const searchMatch =
        debouncedSearch === "" ||
        item.name?.toLowerCase().includes(debouncedSearch) ||
        item.category?.toLowerCase().includes(debouncedSearch) ||
        item.description?.toLowerCase().includes(debouncedSearch);

      return categoryMatch && vegMatch && searchMatch;
    });
  }, [menu, category, vegOnly, debouncedSearch]);

  const getQty = useCallback(
    (id) => {
      const item = cart.find((i) => i._id === id);
      return item ? item.qty : 0;
    },
    [cart],
  );

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart],
  );

  const openFilter = () => {
    setRenderFilter(true);
    requestAnimationFrame(() => setShowFilter(true));
  };

  const closeFilter = () => {
    setShowFilter(false);
    setTimeout(() => setRenderFilter(false), 280);
  };

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        backgroundColor: bgColor,
        fontFamily: `var(--menu-body-font), '${bodyFont}', sans-serif`,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

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

          .mobile-card-soft img {
            transition-duration: 220ms !important;
          }
        }
      `}</style>

      <AnimatePresence>
        {animationOn && showIntro && (
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
            <div
              className="absolute inset-0"
              style={{
                background:
                  settings?.menuIntroBg ||
                  "linear-gradient(135deg,#2b1609 0%,#74370f 52%,#e0b875 100%)",
              }}
            />
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
                    <CurtainLetters text={cafeName} />
                  </div>

                  <div className="mx-auto mt-5 h-px w-64 max-w-[70vw] origin-center bg-gradient-to-r from-transparent via-amber-100/85 to-transparent" />

                  <p className="mx-auto mt-5 max-w-xl text-xs font-black uppercase tracking-[0.22em] text-amber-50/78 sm:text-sm">
                    {settings?.menuIntroTagline ||
                      "Coffee • Plates • Quiet Talks"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {animationOn && !hideFlyingTitle && curtainStep === "menu" && (
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
              opacity: { duration: 0.18 },
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
            <MenuTitle
              large={!titleFlight}
              settings={settings}
              headingFont={headingFont}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative overflow-hidden border-t border-amber-300/50"
        style={{ backgroundColor: bgColor }}
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
            initial={false}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 10 }}
            transition={{ duration: 0.32 }}
            className="text-[10px] sm:text-xs tracking-[0.35em] uppercase font-bold"
            style={{ color: activeColor }}
          >
            • Table {table || "..."} •
          </motion.p>

          <motion.div
            ref={heroTitleRef}
            initial={false}
            animate={{ opacity: titleLanded ? 1 : 0 }}
            transition={{ duration: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto mt-2 w-fit"
            style={{ visibility: titleLanded ? "visible" : "hidden" }}
          >
            <MenuTitle settings={settings} headingFont={headingFont} />
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 10 }}
            transition={{ delay: 0.08, duration: 0.32 }}
            className="flex items-center justify-center mt-7"
          >
            <DynamicDivider settings={settings} />
          </motion.div>

          <motion.p
            initial={false}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 10 }}
            transition={{ delay: 0.12, duration: 0.32 }}
            className="max-w-md mx-auto mt-4 text-sm leading-relaxed"
            style={{ color: mutedTextColor }}
          >
            {settings?.menuSubtitle ||
              "Browse our menu, add items to your cart, and place your order — all from your table."}
          </motion.p>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 18 }}
        transition={{ delay: 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="px-4 py-6 pb-24 mx-auto max-w-7xl"
      >
        <div
          className="p-4 shadow-xl rounded-3xl sm:p-5"
          style={{ background: cardBg }}
        >
          <div className="flex items-center justify-center mb-6 md:justify-between">
            <div className="flex-wrap hidden gap-2 md:flex">
              {categories.map((cat) => {
                const active = category === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      active
                        ? "text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-amber-50"
                    }`}
                    style={{
                      backgroundColor: active ? activeColor : undefined,
                    }}
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
                className="relative w-[120px] h-[42px] rounded-full p-1 border shadow-sm transition-all duration-300"
                style={{
                  backgroundColor: vegOnly ? activeColor : "#ffffff",
                  borderColor: vegOnly ? activeColor : "#e5e7eb",
                }}
              >
                <span
                  className={`absolute top-1 left-1 w-[54px] h-[32px] rounded-full shadow transition-transform duration-300 ${
                    vegOnly ? "translate-x-[56px]" : "translate-x-0"
                  }`}
                  style={{
                    backgroundColor: vegOnly ? "#ffffff" : activeColor,
                  }}
                />

                <span className="relative z-10 flex items-center justify-between h-full px-3 text-xs font-semibold">
                  <span className={!vegOnly ? "text-white" : "text-white/80"}>
                    All
                  </span>

                  <span style={{ color: vegOnly ? activeColor : "#6b7280" }}>
                    Veg
                  </span>
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search
                  size={17}
                  className="absolute -translate-y-1/2 left-4 top-1/2"
                  style={{ color: activeColor }}
                />

                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search menu..."
                  className="h-11 w-[240px] lg:w-[300px] rounded-full border border-amber-200 bg-white pl-11 pr-4 text-sm font-medium text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                />
              </div>

              <button
                onClick={openFilter}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-300 border rounded-full shadow-sm hover:shadow-md hover:bg-amber-50"
                style={{
                  color: activeColor,
                  borderColor: activeColor,
                }}
              >
                <Filter size={16} />
                Filter
              </button>
            </div>
          </div>

          <AnimatePresence>
            {renderFilter && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9999] flex bg-black/40"
                onClick={closeFilter}
                style={{ position: "fixed", inset: 0 }}
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  initial={{ x: "-100%" }}
                  animate={{ x: showFilter ? 0 : "-100%" }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                  className="h-screen w-[88vw] max-w-[360px] p-5 overflow-y-auto bg-white shadow-2xl"
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
                        className="absolute -translate-y-1/2 left-4 top-1/2"
                        style={{ color: activeColor }}
                      />

                      <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search food..."
                        className="w-full py-3 pr-4 text-sm font-semibold text-gray-700 transition border outline-none rounded-2xl border-amber-200 bg-amber-50/50 pl-11 focus:border-amber-500 focus:bg-white"
                      />
                    </div>
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
                              ? "text-white font-medium"
                              : "hover:bg-amber-50 text-gray-600"
                          }`}
                          style={{
                            backgroundColor: active ? activeColor : undefined,
                          }}
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
                      className="relative w-[120px] h-[42px] rounded-full p-1 border shadow-sm transition-all duration-300 mt-3"
                      style={{
                        backgroundColor: vegOnly ? activeColor : "#ffffff",
                        borderColor: vegOnly ? activeColor : "#e5e7eb",
                      }}
                    >
                      <span
                        className={`absolute top-1 left-1 w-[54px] h-[32px] rounded-full shadow transition-transform duration-300 ${
                          vegOnly ? "translate-x-[56px]" : "translate-x-0"
                        }`}
                        style={{
                          backgroundColor: vegOnly ? "#ffffff" : activeColor,
                        }}
                      />

                      <span className="relative z-10 flex items-center justify-between h-full px-3 text-xs font-semibold">
                        <span
                          className={!vegOnly ? "text-white" : "text-white/80"}
                        >
                          All
                        </span>

                        <span
                          style={{ color: vegOnly ? activeColor : "#6b7280" }}
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredMenu.map((item) => {
              const qty = getQty(item._id);
              const itemCategoryIconSvg = getItemCategoryIcon(item);
              const isVeg = item.foodType !== "nonveg";
              const badge = item.badge;
              const isAvailable = item.available !== false;

              return (
                <MenuCard
                  key={item._id}
                  item={item}
                  qty={qty}
                  isAvailable={isAvailable}
                  isVeg={isVeg}
                  badge={badge}
                  itemCategoryIconSvg={itemCategoryIconSvg}
                  addToCart={addToCart}
                  removeItem={removeItem}
                  settings={settings}
                  headingFont={headingFont}
                />
              );
            })}
          </div>

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
        </div>
      </motion.div>

      {cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-50 bottom-6 right-6"
        >
          <Link
            to="/cart"
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-full shadow-lg active:scale-95"
            style={{
              backgroundColor: activeColor,
            }}
          >
            <ShoppingCart size={18} />
            View Cart ({totalItems})
          </Link>
        </motion.div>
      )}

      {showScroll && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed z-50 flex items-center justify-center text-white transition-all duration-200 rounded-full shadow-lg bottom-6 left-6 w-11 h-11"
          style={{
            backgroundColor: activeColor,
          }}
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
}

export default Menu;
