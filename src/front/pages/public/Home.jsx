import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Coffee,
  QrCode,
  Sparkles,
  Star,
  ScanLine,
  ChefHat,
  Heart,
  Leaf,
  MapPin,
  Utensils,
} from "lucide-react";
import { useWebsiteSettings } from "../../../context/WebsiteSettingsContext";

const DEFAULT_MOMENTS = [
  {
    iconType: "coffee",
    title: "Coffee after class",
    text: "A calm spot for study breaks, friends and slow conversations.",
  },
  {
    iconType: "utensils",
    title: "Evening cravings",
    text: "Warm snacks, pizzas, burgers and café favourites without waiting.",
  },
  {
    iconType: "qr",
    title: "Table QR ordering",
    text: "Scan, browse and order from your table in a smooth digital flow.",
  },
  {
    iconType: "heart",
    title: "Premium casual vibe",
    text: "Refined, warm and welcoming without feeling too expensive.",
  },
];

const DEFAULT_JOURNEY = [
  {
    no: "01",
    title: "Arrive",
    text: "Walk into a warm cream-and-coffee space made for comfort.",
    icon: "🚪",
  },
  {
    no: "02",
    title: "Scan",
    text: "Sit at your table and open the digital menu with one QR scan.",
    icon: "📱",
  },
  {
    no: "03",
    title: "Order",
    text: "Choose café favourites, add notes and send the order instantly.",
    icon: "☕",
  },
  {
    no: "04",
    title: "Relax",
    text: "Enjoy the mood while your order moves from kitchen to table.",
    icon: "✨",
  },
];

const DEFAULT_SPECIALS = [
  {
    emoji: "☕",
    tag: "Most Loved",
    name: "Signature Cold Coffee",
    desc: "Chilled coffee, soft cream, chocolate dust and a slow café finish.",
    price: "₹50",
  },
  {
    emoji: "🍕",
    tag: "Chef Pick",
    name: "Golden Cheese Pizza",
    desc: "Soft crust, melted cheese, warm herbs and slow tomato sauce.",
    price: "₹188",
  },
  {
    emoji: "🍔",
    tag: "Popular",
    name: "House Café Burger",
    desc: "Toasted bun, cheese, crisp vegetables and our warm house patty.",
    price: "₹100",
  },
  {
    emoji: "🥐",
    tag: "Fresh",
    name: "Flaky Golden Patties",
    desc: "Crisp layers, mild spices and bakery-style comfort in every bite.",
    price: "₹50",
  },
  {
    emoji: "🍰",
    tag: "Sweet",
    name: "Cream Pastry",
    desc: "Soft sponge, light cream and a gentle café dessert mood.",
    price: "₹80",
  },
];

const DEFAULT_MARQUEE_ITEMS = [
  "Fresh coffee",
  "Warm plates",
  "Table QR ordering",
  "Soft conversations",
  "The White House Café",
  "Jaipur café mood",
];

function getIcon(type, size = 24) {
  const icons = {
    coffee: <Coffee size={size} />,
    utensils: <Utensils size={size} />,
    qr: <QrCode size={size} />,
    heart: <Heart size={size} />,
    chef: <ChefHat size={size} />,
    leaf: <Leaf size={size} />,
    sparkles: <Sparkles size={size} />,
  };
  return icons[type] || icons.coffee;
}

function useInView(ref, threshold = 0.16) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(26px)",
        transition: `opacity 680ms cubic-bezier(.16,1,.3,1) ${delay}s, transform 680ms cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function SplitHeading({ children, className = "", style }) {
  const ref = useRef(null);
  const visible = useInView(ref, 0.2);
  const text = String(children || "");
  return (
    <h2 ref={ref} className={className} style={style} aria-label={text}>
      {text.split("").map((char, index) => (
        <span
          key={`${char}-${index}`}
          aria-hidden="true"
          className="whc-letter"
          style={{
            display: char === " " ? "inline" : "inline-block",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0px)" : "translateY(18px)",
            transition: `opacity 520ms cubic-bezier(.16,1,.3,1) ${index * 0.01}s, transform 520ms cubic-bezier(.16,1,.3,1) ${index * 0.01}s`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </h2>
  );
}

function SoftCard({ children, className = "" }) {
  return (
    <div
      className={`transition-transform duration-300 ease-out hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  );
}

function CurtainLetterTitle({ text }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
      {String(text || "")
        .split("")
        .map((letter, index) => (
          <motion.span
            key={`${letter}-${index}`}
            initial={{ opacity: 0, y: 16, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{
              delay: 0.38 + index * 0.045,
              duration: 0.42,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block"
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
    </div>
  );
}

// ─── New Welcome Hero Title ────────────────────────────────────────────────────
// Renders: "Welcome to" / "[name body]" / "[last word]" in accent
function WelcomeHeroTitle({
  cafeName,
  primaryColor,
  accentColor,
  loaded,
  titleMeasured,
  titleStart,
  heroTitleRef,
  animationOn,
}) {
  const words = String(cafeName || "The White House Café")
    .trim()
    .split(/\s+/);
  const lastWord = words[words.length - 1];
  const bodyWords = words.slice(0, -1).join(" ");

  return (
    <motion.div
      ref={heroTitleRef}
      initial={false}
      style={{
        visibility:
          animationOn && !loaded && !titleMeasured ? "hidden" : "visible",
        fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif",
        WebkitFontSmoothing: "antialiased",
      }}
      animate={{
        opacity: animationOn && !loaded && !titleMeasured ? 0 : 1,
        x: animationOn && !loaded && titleMeasured ? titleStart.x : 0,
        y: animationOn && !loaded && titleMeasured ? titleStart.y : 0,
        scale: animationOn && !loaded && titleMeasured ? 1.06 : 1,
      }}
      transition={{ duration: loaded ? 1.15 : 0, ease: [0.16, 1, 0.3, 1] }}
      className="origin-left will-change-transform"
    >
      {/* "Welcome to" line */}
      <span
        className="block font-[560] leading-[1.05] tracking-[-0.025em]"
        style={{
          color: primaryColor,
          fontSize: "clamp(2.7rem, 12vw, 4.5rem)",
        }}
      >
        Welcome to
      </span>

      {/* Body of café name */}
      {bodyWords && (
        <span
          className="block font-[760] leading-[0.92] tracking-[-0.045em]"
          style={{
            color: primaryColor,
            fontSize: "clamp(2.9rem, 13vw, 5rem)",
          }}
        >
          {bodyWords}
        </span>
      )}

      {/* Last word in accent color */}
      <span
        className="block font-[760] leading-[0.92] tracking-[-0.045em] italic"
        style={{
          color: accentColor,
          fontSize: "clamp(3rem, 14vw, 5.2rem)",
        }}
      >
        {lastWord}
      </span>

      {/* Wheat / leaf decorative divider */}
      <div className="flex items-center gap-3 mt-5 mb-1">
        <span
          className="block h-px flex-1 max-w-[100px] rounded-full"
          style={{
            background: `linear-gradient(to right, transparent, ${accentColor}90)`,
          }}
        />
        <svg
          width="28"
          height="18"
          viewBox="0 0 28 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 9 C10 4, 4 3, 2 9 C4 15, 10 14, 14 9Z"
            fill={accentColor}
            fillOpacity="0.85"
          />
          <path
            d="M14 9 C18 4, 24 3, 26 9 C24 15, 18 14, 14 9Z"
            fill={accentColor}
            fillOpacity="0.85"
          />
          <line
            x1="14"
            y1="1"
            x2="14"
            y2="17"
            stroke={accentColor}
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />
          <circle cx="14" cy="9" r="1.5" fill={accentColor} />
        </svg>
        <span
          className="block h-px flex-1 max-w-[100px] rounded-full"
          style={{
            background: `linear-gradient(to left, transparent, ${accentColor}90)`,
          }}
        />
      </div>
    </motion.div>
  );
}

// Keep original BrandTitle (used nowhere but preserved)
function BrandTitle({
  cafeName,
  primaryColor,
  secondaryColor,
  accentColor,
  subtitle,
}) {
  const parts = String(cafeName || "The White House Café").split(" ");
  const line1 = parts.length >= 3 ? parts.slice(0, 2).join(" ") : cafeName;
  const line2 =
    parts.length >= 3 ? parts.slice(2, -1).join(" ") || "House" : "House";
  const line3 = parts.length >= 2 ? parts[parts.length - 1] : "Café";
  return (
    <div
      className="relative text-left"
      style={{
        fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif",
        fontSize: "clamp(4.35rem, 18vw, 7.8rem)",
        fontWeight: 900,
        lineHeight: 0.76,
        letterSpacing: "-0.07em",
      }}
    >
      <span className="block whitespace-nowrap" style={{ color: primaryColor }}>
        {line1}
      </span>
      <span
        className="block whitespace-nowrap"
        style={{ color: secondaryColor }}
      >
        {line2}
      </span>
      <span className="block whitespace-nowrap" style={{ color: accentColor }}>
        {line3}
      </span>
      <span
        className="absolute -bottom-5 left-1 h-[2px] w-[76%] rounded-full"
        style={{
          background: `linear-gradient(to right, ${primaryColor}, ${accentColor}, transparent)`,
        }}
      />
      <span
        className="absolute -bottom-9 left-1 mb-5 text-[9px] font-black uppercase tracking-[0.28em]"
        style={{ color: primaryColor }}
      >
        {subtitle || "Coffee • Plates • Quiet Talks"}
      </span>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings = {}, loadingSettings } = useWebsiteSettings() || {};

  const sessionHandledRef = useRef(false);
  const heroTitleRef = useRef(null);

  const [loaded, setLoaded] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [curtainLeaving, setCurtainLeaving] = useState(false);
  const [titleStart, setTitleStart] = useState({ x: 0, y: 0 });
  const [titleMeasured, setTitleMeasured] = useState(false);

  const cafeName = settings?.cafeName || "The White House Café";
  const primaryColor = settings?.primaryColor || "#3d2412";
  const secondaryColor = settings?.secondaryColor || "#4a220e";
  const accentColor = settings?.accentColor || "#d97706";
  const bgColor = settings?.bgColor || "#f5ead7";
  const textColor = settings?.textColor || "#241309";
  const cardBg = settings?.cardBg || "#fffaf1";
  const buttonColor = settings?.buttonColor || "#14532d";
  const buttonTextColor = settings?.buttonTextColor || "#ffffff";
  const headingColor = settings?.headingColor || primaryColor;
  const bodyTextColor = settings?.bodyTextColor || "#6b5a48";

  const showHeroSection = settings?.showHeroSection !== false;
  const showMomentsSection = settings?.showMomentsSection !== false;
  const showJourneySection = settings?.showJourneySection !== false;
  const showMarqueeSection = settings?.showMarqueeSection !== false;
  const showSpecialsSection = settings?.showSpecialsSection !== false;
  const showEditorialSection = settings?.showEditorialSection !== false;
  const showCtaSection = settings?.showCtaSection !== false;

  const heroPrimaryColor = settings?.heroPrimaryColor || "#3d2412";
  const heroSecondaryColor = settings?.heroSecondaryColor || "#4a220e";
  const heroAccentColor = settings?.heroAccentColor || "#d97706";
  const heroBgColor = settings?.heroBgColor || "#f5ead7";
  const heroTextColor = settings?.heroTextColor || "#241309";
  const heroMutedTextColor = settings?.heroMutedTextColor || "#6b5a48";
  const heroButtonColor = settings?.heroButtonColor || "#14532d";
  const heroButtonTextColor = settings?.heroButtonTextColor || "#ffffff";
  const heroCardBgColor = settings?.heroCardBgColor || "#fffaf1";
  const [heroReady, setHeroReady] = useState(false);

  const heroEyebrow =
    settings?.heroEyebrow || "Good Food. Good Mood. Great Memories.";
  const heroHeading =
    settings?.heroHeading ||
    "A cozy escape for coffee lovers and food enthusiasts. Made with passion, served with love.";
  const heroSubtitle =
    settings?.heroSubtitle || "Coffee • Plates • Quiet Talks";
  const ctaText = settings?.ctaText || "Explore Our Menu";
  const secondaryCtaText = settings?.secondaryCtaText || "Scan. Choose. Relax.";
  const heroImage = settings?.heroImage || "";

  useEffect(() => {
    if (!heroImage) {
      setHeroReady(true);
      return;
    }

    setHeroReady(false);

    const img = new Image();

    img.src = heroImage;

    img.onload = () => {
      setHeroReady(true);
    };

    img.onerror = () => {
      setHeroReady(true);
    };
  }, [heroImage]);

  const introWelcomeText = settings?.introWelcomeText || "Welcome to";
  const introMainWord = settings?.introMainWord || "Elegance.";
  const introTagline = settings?.introTagline || heroSubtitle;

  const momentsTitle =
    settings?.momentsTitle || "A café that feels slow, warm and memorable.";
  const momentsEyebrow = settings?.momentsEyebrow || "More than a place to eat";
  const momentsSubtitle =
    settings?.momentsSubtitle ||
    "Made for coffee after class, evening snacks, casual meetings, family time and quiet table conversations.";

  const journeyEyebrow = settings?.journeyEyebrow || "The table journey";
  const journeyTitle = settings?.journeyTitle || "From first scan to last sip.";
  const journeySubtitle =
    settings?.journeySubtitle ||
    "A smooth café flow where customers scan, order, relax, and enjoy — while the kitchen receives everything clearly.";

  const specialsEyebrow = settings?.specialsEyebrow || "Café favourites";
  const specialsTitle = settings?.specialsTitle || "Golden bites, warm coffee.";

  const editorialEyebrow = settings?.editorialEyebrow || "The feeling";
  const editorialTitle =
    settings?.editorialTitle || "Designed for the moments between meals.";
  const editorialCardTitle =
    settings?.editorialCardTitle ||
    "Premium café mood without feeling too expensive.";
  const editorialCardText =
    settings?.editorialCardText ||
    "The White House Café should feel warm, polished and welcoming — a place where students, friends, families and casual visitors all feel comfortable.";

  const ctaEyebrow = settings?.homeCtaEyebrow || "Ready for a warm table?";
  const ctaHeading =
    settings?.homeCtaHeading || "Browse the café menu before your first sip.";
  const ctaSubtitle =
    settings?.homeCtaSubtitle ||
    "Explore our menu or scan your table QR when you visit to place your order directly.";

  const moments =
    Array.isArray(settings?.homeMoments) && settings.homeMoments.length
      ? settings.homeMoments
      : DEFAULT_MOMENTS;
  const journey =
    Array.isArray(settings?.homeJourney) && settings.homeJourney.length
      ? settings.homeJourney
      : DEFAULT_JOURNEY;
  const specials =
    Array.isArray(settings?.homeSpecials) && settings.homeSpecials.length
      ? settings.homeSpecials
      : DEFAULT_SPECIALS;
  const marqueeBase =
    Array.isArray(settings?.homeMarqueeItems) &&
    settings.homeMarqueeItems.length
      ? settings.homeMarqueeItems
      : DEFAULT_MARQUEE_ITEMS;
  const marqueeItems = useMemo(
    () => [...marqueeBase, ...marqueeBase],
    [marqueeBase],
  );

  if (loadingSettings || !heroReady) {
    return (
      <div
        className="min-h-screen"
        style={{
          background: "#f5ead7",
        }}
      />
    );
  }

  const handleExplore = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/order");
    } else {
      navigate("/menu-preview");
    }
  };

  const measureTitleStart = () => {
    if (!heroTitleRef.current) return;
    const rect = heroTitleRef.current.getBoundingClientRect();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    setTitleStart({
      x: centerX - (rect.left + rect.width / 2),
      y: centerY - (rect.top + rect.height / 2),
    });
    setTitleMeasured(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");
    if (!urlToken || sessionHandledRef.current) return;
    sessionHandledRef.current = true;
    api
      .get(`/session/${urlToken}`)
      .then((res) => {
        localStorage.setItem("token", urlToken);
        localStorage.setItem("table", res.data.table);
        toast.success(`${cafeName}: Table session started 🍽️`);
        navigate("/order", { replace: true });
      })
      .catch(() => {
        toast.error(
          settings?.sessionExpiryMessage ||
            "Session expired. Please scan QR again.",
        );
        navigate("/scan", { replace: true });
      });
  }, [location.search, navigate, cafeName, settings?.sessionExpiryMessage]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");
    const animationOn = settings?.homepageAnimation === true;

    if (!animationOn || urlToken) {
      setShowIntro(false);
      setCurtainLeaving(false);
      setLoaded(true);
      setTitleMeasured(true);
      setTitleStart({ x: 0, y: 0 });
      return;
    }

    setShowIntro(true);
    setCurtainLeaving(false);
    setLoaded(false);
    setTitleMeasured(false);

    const t1 = setTimeout(() => measureTitleStart(), 180);
    const t2 = setTimeout(() => measureTitleStart(), 450);
    const onResize = () => measureTitleStart();
    window.addEventListener("resize", onResize);
    const t3 = setTimeout(() => setCurtainLeaving(true), 2400);
    const t4 = setTimeout(() => setShowIntro(false), 3200);
    const t5 = setTimeout(() => setLoaded(true), 3400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      window.removeEventListener("resize", onResize);
    };
  }, [location.search, settings?.homepageAnimation]);

  const animationOn = settings?.homepageAnimation === true;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Cormorant+Garamond:wght@600;700&family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        .whc-display { font-family: 'Fraunces', Georgia, serif; font-variation-settings: "SOFT" 40, "WONK" 0.5; }
        .whc-graffiti { font-family: 'Caveat', cursive; }
        .whc-grid { background-image: linear-gradient(rgba(61,36,18,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(61,36,18,0.045) 1px, transparent 1px); background-size: 54px 54px; }
        .whc-gold-text { background: linear-gradient(110deg, ${primaryColor} 0%, ${accentColor} 38%, ${secondaryColor} 72%, #f1d694 100%); background-size: 220% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: whc-shimmer 8s linear infinite; }
        @keyframes whc-shimmer { 0% { background-position: -160% center; } 100% { background-position: 160% center; } }
        @keyframes whc-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes whc-float-soft { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        .whc-marquee-track { animation: whc-marquee 34s linear infinite; }
        .whc-hero-card-float { animation: whc-float-soft 7s ease-in-out infinite; }
        .whc-btn { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 0.75rem; min-width: 190px; padding: 1rem 1.35rem; border-radius: 999px; border: 1px solid rgba(231,196,116,0.58); color: ${buttonTextColor}; font-weight: 900; letter-spacing: 0.055em; background: ${buttonColor}; box-shadow: 0 18px 42px rgba(61,36,18,0.18), inset 0 1px 0 rgba(255,255,255,0.28); overflow: hidden; transition: transform .25s ease, box-shadow .25s ease; }
        .whc-btn:hover { transform: translateY(-3px); box-shadow: 0 22px 52px rgba(61,36,18,0.24), inset 0 1px 0 rgba(255,255,255,0.32); }
        .whc-ghost-btn { display: inline-flex; align-items: center; justify-content: center; gap: .7rem; min-width: 170px; padding: 1rem 1.25rem; border-radius: 999px; border: 1px solid rgba(61,36,18,.14); color: ${primaryColor}; background: rgba(255,250,241,.72); font-weight: 900; transition: all .25s ease; box-shadow: 0 12px 30px rgba(61,36,18,.07); }
        .whc-ghost-btn:hover { background: rgba(255,250,241,.95); border-color: ${accentColor}; transform: translateY(-3px); }
        .whc-dark-ghost { color: rgba(255,250,241,.88); border-color: rgba(255,250,241,.14); background: rgba(255,250,241,.07); box-shadow: none; }
        .whc-dark-ghost:hover { color: #fffaf1; background: rgba(255,250,241,.12); border-color: ${accentColor}; }
        .whc-orb { position: absolute; border-radius: 999px; filter: blur(34px); pointer-events: none; }
        .whc-menu-strip { display: flex; gap: 1rem; overflow-x: auto; padding: .25rem .25rem 1.25rem; scroll-snap-type: x mandatory; scrollbar-width: none; }
        .whc-menu-strip::-webkit-scrollbar { display: none; }
        .whc-menu-item { flex: 0 0 min(82vw, 340px); scroll-snap-align: center; }
        .whc-menu-card:hover .whc-menu-emoji { transform: translateY(-7px) scale(1.08); }
        .whc-menu-emoji { transition: transform .32s cubic-bezier(.16,1,.3,1); }
        @media (min-width: 768px) { .whc-menu-strip { display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); align-items: stretch; overflow: visible; padding: 0; } .whc-menu-item { flex: initial; } .whc-menu-item:nth-child(1), .whc-menu-item:nth-child(2), .whc-menu-item:nth-child(3) { grid-column: span 2; } .whc-menu-item:nth-child(4), .whc-menu-item:nth-child(5) { grid-column: span 3; } .whc-menu-item:nth-child(2) { transform: translateY(28px); } .whc-menu-item:nth-child(4) { transform: translateY(18px); } }
        @media (max-width: 768px) { .whc-btn, .whc-ghost-btn { width: 100%; max-width: 320px; } .whc-letter { transition-delay: 0s !important; } .whc-hero-card-float { animation: none; } .whc-marquee-track { animation-duration: 42s; } }
        .whc-hero-noise { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); opacity: 0.028; mix-blend-mode: overlay; pointer-events: none; }
      `}</style>

      <div
        className="min-h-screen overflow-hidden"
        style={{
          background: bgColor,
          color: textColor,
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        {/* ── Curtain intro animation (preserved exactly) ──────────────────── */}
        <AnimatePresence>
          {showIntro && settings?.homepageAnimation === true && (
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: curtainLeaving ? "-100%" : 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 1.05, ease: [0.76, 0, 0.24, 1] }}
              className="fixed inset-0 z-[9998] flex items-center justify-center overflow-hidden"
              style={{ background: primaryColor }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 55%, ${accentColor} 100%)`,
                }}
              />
              <div className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(rgba(255,250,241,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,250,241,0.05)_1px,transparent_1px)] bg-[size:52px_52px]" />
              <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100/12 blur-3xl" />

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{
                  opacity: curtainLeaving ? 0 : 1,
                  y: curtainLeaving ? -22 : 0,
                  scale: curtainLeaving ? 0.98 : 1,
                }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full px-5 text-center"
              >
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.55 }}
                  className="mb-5 text-[10px] font-black uppercase tracking-[0.42em] text-amber-100/75"
                >
                  {introWelcomeText}
                </motion.p>
                <div className="whc-graffiti mx-auto max-w-[92vw] text-center text-[clamp(2rem,9vw,4.8rem)] font-bold leading-none text-[#fff4cf]">
                  <CurtainLetterTitle text={cafeName} />
                </div>
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 1.35, duration: 0.7 }}
                  className="mx-auto mt-5 h-px w-64 max-w-[70vw] origin-center bg-gradient-to-r from-transparent via-amber-100/85 to-transparent"
                />
                <motion.h1
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 1.62,
                    duration: 0.72,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="whc-display mx-auto mt-6 text-[clamp(3.7rem,15vw,9rem)] font-[780] leading-[0.82] tracking-[-0.075em] text-[#fff8df]"
                >
                  {introMainWord}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.05, duration: 0.55 }}
                  className="mx-auto mt-5 max-w-xl text-xs font-black uppercase tracking-[0.22em] text-amber-50/78 sm:text-sm"
                >
                  {introTagline}
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Hero Section ─────────────────────────────────────────────────── */}
        {showHeroSection && (
          <section className="relative h-[calc(100svh-76px)] min-h-[650px] overflow-hidden flex items-center">
            {/* Full-bleed background */}
            <div className="absolute inset-0">
              {heroImage ? (
                <>
                  <picture>
                    <img
                      src={heroImage}
                      alt={cafeName}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-full object-cover object-[58%_center] md:object-center"
                    />
                  </picture>
                  {/* Left-to-right gradient overlay — creamy on left for text, fading right */}
                  {/* <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(255,248,235,0.52) 0%, rgba(255,248,235,0.32) 30%, rgba(255,248,235,0.08) 55%, rgba(255,248,235,0) 100%)",
                    }}
                  /> */}
                  {/* Subtle vignette */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,transparent_40%,rgba(25,12,4,0.18)_100%)]" />
                </>
              ) : (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at 12% 16%, ${heroAccentColor}36, transparent 28%), radial-gradient(circle at 85% 20%, rgba(5,150,105,.10), transparent 30%), linear-gradient(135deg, ${heroBgColor} 0%, #efd6aa 48%, ${heroSecondaryColor} 100%)`,
                    }}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,248,232,0.16)_42%,rgba(45,23,8,0.26)_100%)]" />
                  <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(rgba(65,35,14,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(65,35,14,0.07)_1px,transparent_1px)] bg-[size:44px_44px]" />
                </>
              )}
              {/* Noise texture */}
              <div className="absolute inset-0 whc-hero-noise" />
            </div>

            {/* Faint "CAFÉ" watermark */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: loaded ? 0.045 : 0, y: loaded ? 0 : 50 }}
              transition={{ delay: 0.25, duration: 0.9 }}
              className="pointer-events-none absolute left-1/2 top-[12%] hidden -translate-x-1/2 whitespace-nowrap text-[16rem] font-black leading-none tracking-[-0.12em] text-stone-950 lg:block"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              CAFÉ
            </motion.div>

            {/* <div className="pointer-events-none absolute right-[14.2%] top-[30.5%] z-[3] hidden w-[430px] text-center lg:block">
              <div
                className="mx-auto mb-5 h-[46px] w-[58px]"
                style={{ color: "rgba(145, 91, 35, 0.78)" }}
              >
                <svg viewBox="0 0 80 58" fill="none" className="w-full h-full">
                  <path
                    d="M14 30L40 10L66 30"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 28V50H58V28"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M35 50V36H45V50"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path d="M30 20V10" stroke="currentColor" strokeWidth="4" />
                  <path d="M50 20V10" stroke="currentColor" strokeWidth="4" />
                </svg>
              </div>

              <p
                className="text-[18px] font-semibold uppercase tracking-[0.38em]"
                style={{
                  color: "rgba(126, 81, 34, 0.78)",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                }}
              >
                THE
              </p>

              <h2
                className="mt-6 text-[40px] font-semibold uppercase tracking-[0.26em]"
                style={{
                  color: "rgba(126, 81, 34, 0.82)",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  textShadow: "0 2px 10px rgba(255,255,255,0.35)",
                }}
              >
                {String(cafeName || "The White House Café")
                  .replace(/café/gi, "")
                  .trim()}
              </h2>

              <div className="mx-auto mt-4 h-px w-[260px] bg-[rgba(126,81,34,0.38)]" />

              <p
                className="mt-4 text-[34px] font-semibold uppercase tracking-[0.34em]"
                style={{
                  color: "rgba(126, 81, 34, 0.78)",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                }}
              >
                CAFÉ
              </p>
            </div> */}

            {/* Content — left-aligned, max ~55% width on desktop */}
            <div className="relative z-10 w-full px-6 mx-auto max-w-[1600px] sm:px-8 lg:px-[11vw]">
              <div className="max-w-[560px] -translate-y-6 sm:-translate-y-4 lg:-translate-y-4">
                {/* Eyebrow */}
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 14 }}
                  transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[11px] font-black uppercase tracking-[0.32em] mb-6"
                  style={{ color: heroAccentColor }}
                >
                  {heroEyebrow}
                </motion.p>

                {/* ── Dynamic "Welcome to [Café Name]" heading ── */}
                <WelcomeHeroTitle
                  cafeName={cafeName}
                  primaryColor={heroPrimaryColor}
                  accentColor={heroAccentColor}
                  loaded={loaded}
                  titleMeasured={titleMeasured}
                  titleStart={titleStart}
                  heroTitleRef={heroTitleRef}
                  animationOn={animationOn}
                />

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 18 }}
                  transition={{ delay: 0.18, duration: 0.62 }}
                  className="mt-5 text-base leading-[1.8] sm:text-[17px] max-w-[440px]"
                  style={{
                    color: heroMutedTextColor,
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}
                >
                  {heroHeading}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
                  transition={{ delay: 0.3, duration: 0.62 }}
                  className="flex flex-col gap-3 mt-8 sm:flex-row sm:items-center"
                >
                  {/* Primary CTA */}
                  <button
                    onClick={handleExplore}
                    className="group relative overflow-hidden inline-flex items-center justify-center gap-3 px-6 py-4 sm:px-8 rounded-full text-sm font-black uppercase tracking-[0.14em] transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_52px_rgba(20,83,45,0.26)]"
                    style={{
                      background: heroButtonColor,
                      color: heroButtonTextColor,
                    }}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {ctaText}
                      <ArrowRight
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                    {/* Shine sweep */}
                    <span className="absolute inset-0 translate-x-[-110%] skew-x-[-20deg] bg-white/15 transition-transform duration-500 group-hover:translate-x-[110%]" />
                  </button>

                  {/* Secondary ghost CTA */}
                  <div
                    className="inline-flex items-center justify-center gap-3 px-6 py-4 text-sm font-black transition-all duration-300 border rounded-full cursor-default hover:-translate-y-1"
                    style={{
                      borderColor: `${heroPrimaryColor}22`,
                      background: "rgba(255,250,241,0.72)",
                      color: heroPrimaryColor,
                      boxShadow: "0 12px 30px rgba(61,36,18,0.07)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <ScanLine size={18} style={{ color: heroButtonColor }} />
                    <span>{secondaryCtaText}</span>
                  </div>
                </motion.div>

                {/* Bottom credibility strip */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: loaded ? 1 : 0 }}
                  transition={{ delay: 0.52, duration: 0.7 }}
                  className="flex items-center gap-5 mt-10"
                >
                  <div className="flex -space-x-2">
                    {["☕", "🍕", "🍔"].map((emoji, i) => (
                      <span
                        key={i}
                        className="flex items-center justify-center w-8 h-8 text-sm border-2 rounded-full shadow-sm"
                        style={{
                          borderColor: heroBgColor,
                          background: "rgba(255,250,241,0.85)",
                        }}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                  <p
                    className="text-xs font-bold"
                    style={{ color: heroMutedTextColor }}
                  >
                    {settings?.heroCredibilityText ||
                      "Fresh menu • Table ordering • Warm space"}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Bottom fade into next section */}
            {/* <div
              className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
              style={{
                background: `linear-gradient(to bottom, transparent, ${cardBg})`,
              }}
            /> */}
          </section>
        )}

        {/* ── All remaining sections (unchanged) ──────────────────────────── */}

        {showMomentsSection && (
          <section
            className="relative px-4 py-20 overflow-hidden sm:px-6 lg:py-28"
            style={{ background: cardBg }}
          >
            <div className="absolute inset-0 whc-grid opacity-60" />
            <div className="relative max-w-6xl mx-auto">
              <Reveal>
                <div className="max-w-4xl mx-auto text-center">
                  <p
                    className="text-[11px] font-black uppercase tracking-[0.28em]"
                    style={{ color: accentColor }}
                  >
                    {momentsEyebrow}
                  </p>
                  <SplitHeading
                    className="whc-display mt-4 text-[clamp(2.5rem,6vw,5.4rem)] font-[560] leading-[0.92] tracking-[-0.06em]"
                    style={{ color: headingColor }}
                  >
                    {momentsTitle}
                  </SplitHeading>
                  <p
                    className="max-w-2xl mx-auto mt-6 text-base font-semibold leading-8 sm:text-lg"
                    style={{ color: bodyTextColor }}
                  >
                    {momentsSubtitle}
                  </p>
                </div>
              </Reveal>
              <div className="grid gap-5 mt-14 sm:grid-cols-2 lg:grid-cols-4">
                {moments.map((item, index) => (
                  <Reveal key={item.title || index} delay={index * 0.06}>
                    <SoftCard className="h-full rounded-[2rem] border border-[#eadfcd] bg-white/82 p-6 shadow-[0_16px_42px_rgba(61,36,18,0.07)]">
                      <div
                        className="flex items-center justify-center h-14 w-14 rounded-2xl"
                        style={{ background: primaryColor, color: accentColor }}
                      >
                        {item.icon || getIcon(item.iconType, 24)}
                      </div>
                      <h3
                        className="whc-display mt-6 text-2xl font-semibold tracking-[-0.03em]"
                        style={{ color: primaryColor }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="mt-3 text-sm font-semibold leading-7"
                        style={{ color: bodyTextColor }}
                      >
                        {item.text}
                      </p>
                    </SoftCard>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {showJourneySection && (
          <section
            className="relative overflow-hidden px-4 py-20 text-[#fffaf1] sm:px-6 lg:py-24"
            style={{ background: settings?.journeyBgColor || "#120d08" }}
          >
            <div className="absolute left-1/2 top-24 hidden h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-[#e7c474]/12 blur-3xl md:block" />
            <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(255,250,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,250,241,0.05)_1px,transparent_1px)] bg-[size:58px_58px]" />
            <div className="relative max-w-6xl mx-auto">
              <Reveal>
                <div className="max-w-3xl mx-auto text-center">
                  <p
                    className="text-[11px] font-black uppercase tracking-[0.28em]"
                    style={{ color: accentColor }}
                  >
                    {journeyEyebrow}
                  </p>
                  <h2 className="whc-display mt-4 text-[clamp(2.45rem,5vw,5rem)] font-[560] leading-[0.93] tracking-[-0.06em] text-[#fffaf1]">
                    {journeyTitle.includes("to")
                      ? journeyTitle.split("to")[0]
                      : journeyTitle}
                    {journeyTitle.includes("to") && (
                      <span className="block italic whc-gold-text">
                        to{journeyTitle.split("to").slice(1).join("to")}
                      </span>
                    )}
                  </h2>
                  <p className="mx-auto mt-5 max-w-xl text-base font-semibold leading-8 text-[#fffaf1]/58">
                    {journeySubtitle}
                  </p>
                </div>
              </Reveal>
              <div className="relative mt-16">
                <div className="absolute top-0 hidden w-px h-full -translate-x-1/2 bg-white/10 lg:left-1/2 lg:block" />
                <div className="grid gap-6 lg:grid-cols-4">
                  {journey.map((step, index) => (
                    <Reveal key={step.no || index} delay={index * 0.06}>
                      <SoftCard
                        className={`relative h-full rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-sm ${index % 2 === 1 ? "lg:mt-14" : ""}`}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <span
                            className="rounded-full border border-[#e7c474]/25 bg-[#e7c474]/10 px-3 py-1 text-[11px] font-black tracking-[0.22em]"
                            style={{ color: accentColor }}
                          >
                            {step.no}
                          </span>
                          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fffaf1] text-3xl shadow-xl">
                            {step.icon}
                          </span>
                        </div>
                        <h3 className="whc-display text-3xl font-semibold tracking-[-0.04em] text-[#fffaf1]">
                          {step.title}
                        </h3>
                        <p className="mt-3 text-sm font-semibold leading-7 text-[#fffaf1]/55">
                          {step.text}
                        </p>
                      </SoftCard>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {showMarqueeSection && (
          <section
            className="overflow-hidden border-y border-[#eadfcd] py-5"
            style={{ background: cardBg }}
          >
            <div className="flex items-center gap-8 whc-marquee-track w-max">
              {marqueeItems.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="inline-flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.22em]"
                  style={{ color: accentColor }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: accentColor }}
                  />
                  {item}
                </span>
              ))}
            </div>
          </section>
        )}

        {showSpecialsSection && (
          <section
            className="relative px-4 py-20 overflow-hidden sm:px-6 lg:py-28"
            style={{ background: settings?.menuSectionBgColor || "#f5f0e8" }}
          >
            <div className="absolute inset-0 whc-grid opacity-70" />
            <div className="relative max-w-6xl mx-auto">
              <Reveal>
                <div className="flex flex-col gap-6 mb-12 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p
                      className="text-[11px] font-black uppercase tracking-[0.28em]"
                      style={{ color: accentColor }}
                    >
                      {specialsEyebrow}
                    </p>
                    <SplitHeading
                      className="whc-display mt-4 text-[clamp(2.5rem,5.5vw,5rem)] font-[560] leading-[0.92] tracking-[-0.06em]"
                      style={{ color: primaryColor }}
                    >
                      {specialsTitle}
                    </SplitHeading>
                  </div>
                  <button onClick={handleExplore} className="whc-btn">
                    <span>
                      {settings?.openFullMenuText || "Open Full Menu"}
                    </span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </Reveal>
              <div className="whc-menu-strip">
                {specials.map((dish, index) => (
                  <div
                    className="h-full whc-menu-item"
                    key={dish.name || index}
                  >
                    <Reveal delay={index * 0.05} className="h-full">
                      <DishCard
                        dish={dish}
                        colors={{
                          primaryColor,
                          accentColor,
                          cardBg,
                          bodyTextColor,
                        }}
                      />
                    </Reveal>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {showEditorialSection && (
          <section
            className="relative px-4 py-20 overflow-hidden sm:px-6 lg:py-28"
            style={{ background: cardBg }}
          >
            <div className="relative max-w-6xl mx-auto">
              <Reveal>
                <div className="max-w-3xl mx-auto text-center">
                  <p
                    className="text-[11px] font-black uppercase tracking-[0.28em]"
                    style={{ color: accentColor }}
                  >
                    {editorialEyebrow}
                  </p>
                  <SplitHeading
                    className="whc-display mt-4 text-[clamp(2.5rem,5.5vw,5rem)] font-[560] leading-[0.92] tracking-[-0.06em]"
                    style={{ color: primaryColor }}
                  >
                    {editorialTitle}
                  </SplitHeading>
                </div>
              </Reveal>
              <div className="grid gap-5 mt-14 lg:grid-cols-12">
                <Reveal className="lg:col-span-7">
                  <SoftCard className="relative min-h-[350px] overflow-hidden rounded-[2.4rem] border border-[#eadfcd] !bg-[#120d08] p-7 text-[#fffaf1] shadow-[0_24px_70px_rgba(61,36,18,0.12)]">
                    <div className="absolute rounded-full -right-20 -top-20 h-72 w-72 bg-black/20 blur-3xl" />
                    <div className="relative">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7c474]/14 text-[#e7c474]">
                        <Sparkles size={26} />
                      </div>
                      <h3 className="whc-display mt-14 max-w-xl text-[clamp(2.6rem,5vw,4.9rem)] font-semibold leading-[0.92] tracking-[-0.06em]">
                        {editorialCardTitle}
                      </h3>
                      <p className="mt-6 max-w-lg text-sm font-semibold leading-7 text-[#fffaf1]/55">
                        {editorialCardText}
                      </p>
                    </div>
                  </SoftCard>
                </Reveal>
                <Reveal delay={0.06} className="lg:col-span-5">
                  <SoftCard className="relative h-full overflow-hidden rounded-[2.4rem] border border-[#eadfcd] bg-white/82 p-7 shadow-[0_20px_60px_rgba(61,36,18,0.08)]">
                    <p className="pointer-events-none absolute -right-3 top-2 whc-display text-[9rem] font-[560] leading-none tracking-[-0.1em] text-[#e7c474]/22 sm:text-[11rem]">
                      01
                    </p>
                    <div className="relative z-10">
                      <div
                        className="mb-12 inline-flex rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em]"
                        style={{ background: primaryColor, color: accentColor }}
                      >
                        {settings?.editorialSmallTag || "Café corner"}
                      </div>
                      <h3
                        className="whc-display text-4xl font-semibold tracking-[-0.05em]"
                        style={{ color: primaryColor }}
                      >
                        {settings?.editorialSmallTitle ||
                          "A Jaipur café corner."}
                      </h3>
                      <p
                        className="mt-5 text-sm font-semibold leading-7"
                        style={{ color: bodyTextColor }}
                      >
                        {settings?.editorialSmallText ||
                          "Built for everyday visits: a snack after college, a calm meet-up, a quick coffee, or a cozy evening plan."}
                      </p>
                    </div>
                  </SoftCard>
                </Reveal>
                <Reveal delay={0.08} className="lg:col-span-4">
                  <MiniBento
                    icon={<Leaf size={25} />}
                    title={settings?.miniBento1Title || "Fresh & simple"}
                    text={
                      settings?.miniBento1Text ||
                      "Clean menu, warm food and less confusion at the table."
                    }
                    colors={{ primaryColor, accentColor, bodyTextColor }}
                  />
                </Reveal>
                <Reveal delay={0.1} className="lg:col-span-4">
                  <MiniBento
                    icon={<ChefHat size={23} />}
                    title={settings?.miniBento2Title || "Kitchen friendly"}
                    text={
                      settings?.miniBento2Text ||
                      "Orders reach the kitchen clearly with item notes."
                    }
                    colors={{ primaryColor, accentColor, bodyTextColor }}
                  />
                </Reveal>
                <Reveal delay={0.12} className="lg:col-span-4">
                  <MiniBento
                    icon={<Heart size={23} />}
                    title={settings?.miniBento3Title || "Made to return"}
                    text={
                      settings?.miniBento3Text ||
                      "A smooth experience makes customers remember the place."
                    }
                    colors={{ primaryColor, accentColor, bodyTextColor }}
                  />
                </Reveal>
              </div>
            </div>
          </section>
        )}

        {showCtaSection && (
          <section
            className="relative overflow-hidden px-4 py-20 text-center text-[#fffaf1] sm:px-6 lg:py-28"
            style={{ background: settings?.homeCtaBgColor || "#120d08" }}
          >
            <div className="absolute inset-0 opacity-[0.13] bg-[linear-gradient(rgba(255,250,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,250,241,0.05)_1px,transparent_1px)] bg-[size:58px_58px]" />
            <div className="relative max-w-4xl mx-auto">
              <Reveal>
                <p
                  className="text-[11px] font-black uppercase tracking-[0.28em]"
                  style={{ color: accentColor }}
                >
                  {ctaEyebrow}
                </p>
                <h2 className="whc-display mt-4 text-[clamp(2.7rem,6vw,5.8rem)] font-[560] leading-[0.92] tracking-[-0.06em]">
                  {ctaHeading.includes("before")
                    ? ctaHeading.split("before")[0]
                    : ctaHeading}
                  {ctaHeading.includes("before") && (
                    <span className="block italic whc-gold-text">
                      before{ctaHeading.split("before").slice(1).join("before")}
                    </span>
                  )}
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-base font-semibold leading-8 text-[#fffaf1]/58">
                  {ctaSubtitle}
                </p>
                <div className="flex flex-col items-center justify-center gap-4 mt-9 sm:flex-row">
                  <button onClick={handleExplore} className="whc-btn">
                    <span>{settings?.ctaMenuButtonText || "Explore Menu"}</span>
                    <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => navigate("/contact")}
                    className="whc-ghost-btn whc-dark-ghost"
                  >
                    <MapPin size={18} />
                    <span>{settings?.ctaVisitButtonText || "Visit Café"}</span>
                  </button>
                </div>
              </Reveal>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

// ─── Sub-components (all preserved) ──────────────────────────────────────────

function HeroCafeCard({
  settings,
  loaded,
  cafeName,
  primaryColor,
  accentColor,
  buttonColor,
  heroCardBgColor,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, y: 18 }}
      animate={{
        opacity: loaded ? 1 : 0,
        x: loaded ? 0 : 40,
        y: loaded ? 0 : 18,
      }}
      transition={{ delay: 0.2, duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      className="whc-hero-card-float relative mx-auto w-full max-w-[620px]"
    >
      <div className="absolute -inset-6 hidden rounded-[4rem] bg-amber-200/28 blur-3xl md:block" />
      <div
        className="relative overflow-hidden rounded-[2.4rem] border border-white/80 p-2.5 shadow-[0_35px_95px_rgba(78,42,12,0.24)] sm:rounded-[3rem] sm:p-3"
        style={{ background: heroCardBgColor || "#fffaf0" }}
      >
        <div className="relative overflow-hidden rounded-[2rem] bg-[#2a170b] sm:rounded-[2.55rem]">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 18% 12%, ${accentColor}55, transparent 34%), linear-gradient(145deg, ${primaryColor} 0%, #4a250c 50%, #1c1008 100%)`,
            }}
          />
          <div className="relative px-5 pt-6 pb-5 text-white sm:px-6 sm:pt-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.32em] text-amber-200 sm:text-[10px]">
                  {cafeName}
                </p>
                <h3
                  className="mt-3 text-3xl font-black leading-none sm:text-5xl"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {settings?.heroCardTitle || "Your Table"}
                  <span className="block text-amber-200">
                    {settings?.heroCardHighlight || "Awaits."}
                  </span>
                </h3>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-amber-100 text-[#2b1609] shadow-inner sm:h-16 sm:w-16 sm:rounded-[1.5rem]">
                <ChefHat size={26} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-5 sm:gap-3">
              {[
                [
                  settings?.heroStat1Label || "Open",
                  settings?.heroStat1Value || "10 AM",
                ],
                [
                  settings?.heroStat2Label || "Mood",
                  settings?.heroStat2Value || "Warm",
                ],
                [
                  settings?.heroStat3Label || "Table",
                  settings?.heroStat3Value || "QR",
                ],
              ].map(([top, bottom]) => (
                <div
                  key={top}
                  className="rounded-2xl border border-white/10 bg-white/10 p-2.5 backdrop-blur-md sm:p-3"
                >
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/45 sm:text-[10px]">
                    {top}
                  </p>
                  <p className="mt-1 text-xs font-black text-white sm:text-sm">
                    {bottom}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-t-[2rem] bg-[#fff7e8] px-4 pb-4 pt-5 text-stone-950 sm:rounded-t-[2.3rem] sm:px-5 sm:pb-5 sm:pt-6">
            <div className="relative overflow-hidden rounded-[1.9rem] border border-amber-200/70 bg-white p-3.5 shadow-xl sm:rounded-[2.15rem] sm:p-4">
              <div className="grid gap-4 sm:grid-cols-[145px_1fr] sm:items-center">
                <div className="relative h-[136px] overflow-hidden rounded-[1.55rem] bg-[radial-gradient(circle,#fff7cc_0%,#f59e0b_36%,#7c2d12_78%)] shadow-inner sm:h-36">
                  <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[11px] border-white/90 bg-amber-100 text-5xl shadow-2xl">
                    {settings?.heroDishEmoji || "🍝"}
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700">
                      {settings?.heroDishTag1 || "Signature"}
                    </span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-amber-800">
                      {settings?.heroDishTag2 || "Today special"}
                    </span>
                  </div>
                  <h4
                    className="mt-3 text-2xl font-black leading-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {settings?.heroDishName || "Creamy Alfredo Bowl"}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {settings?.heroDishDesc ||
                      "Rich, soft, warm, and made for long café conversations."}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <p
                      className="text-2xl font-black"
                      style={{ color: buttonColor }}
                    >
                      {settings?.heroDishPrice || "₹249"}
                    </p>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DishCard({ dish, colors }) {
  const { primaryColor, accentColor, cardBg, bodyTextColor } = colors;
  return (
    <SoftCard
      className="whc-menu-card relative flex h-[390px] flex-col overflow-hidden rounded-[2rem] border border-[#eadfcd] p-6 text-center shadow-[0_18px_48px_rgba(61,36,18,0.08)] sm:h-full"
      style={{ background: `${cardBg}EB` }}
    >
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#e7c474]/18 blur-2xl" />
      <div
        className="absolute left-5 top-5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]"
        style={{ background: primaryColor, color: accentColor }}
      >
        {dish.tag}
      </div>
      <div className="whc-menu-emoji relative mx-auto mb-5 mt-8 flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-[#eadfcd] bg-white text-5xl shadow-[0_14px_35px_rgba(61,36,18,0.07)]">
        {dish.emoji}
      </div>
      <div className="flex flex-col flex-1">
        <h3
          className="whc-display text-2xl font-semibold tracking-[-0.03em]"
          style={{ color: primaryColor }}
        >
          {dish.name}
        </h3>
        <p
          className="mt-2 text-sm font-semibold leading-6 line-clamp-3"
          style={{ color: bodyTextColor }}
        >
          {dish.desc}
        </p>
        <div className="mt-auto">
          <div
            className="w-12 h-px mx-auto my-4"
            style={{ background: `${accentColor}70` }}
          />
          <p className="text-lg font-black" style={{ color: accentColor }}>
            {dish.price}
          </p>
          <div className="flex items-center justify-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                style={{ fill: accentColor, color: accentColor }}
              />
            ))}
          </div>
        </div>
      </div>
    </SoftCard>
  );
}

function MiniBento({ icon, title, text, colors }) {
  return (
    <SoftCard className="h-full rounded-[2rem] border border-[#eadfcd] bg-white/82 p-6 shadow-[0_16px_48px_rgba(61,36,18,0.08)]">
      <div
        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl"
        style={{ background: colors.primaryColor, color: colors.accentColor }}
      >
        {icon}
      </div>
      <h3
        className="whc-display mt-6 text-2xl font-semibold tracking-[-0.03em]"
        style={{ color: colors.primaryColor }}
      >
        {title}
      </h3>
      <p
        className="mt-3 text-sm font-semibold leading-7"
        style={{ color: colors.bodyTextColor }}
      >
        {text}
      </p>
    </SoftCard>
  );
}

export default Home;
