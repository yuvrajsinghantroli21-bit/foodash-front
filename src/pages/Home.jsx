import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
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

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const MOMENTS = [
  {
    icon: <Coffee size={24} />,
    title: "Coffee after class",
    text: "A calm spot for study breaks, friends and slow conversations.",
  },
  {
    icon: <Utensils size={24} />,
    title: "Evening cravings",
    text: "Warm snacks, pizzas, burgers and café favourites without waiting.",
  },
  {
    icon: <QrCode size={24} />,
    title: "Table QR ordering",
    text: "Scan, browse and order from your table in a smooth digital flow.",
  },
  {
    icon: <Heart size={24} />,
    title: "Premium casual vibe",
    text: "Refined, warm and welcoming without feeling too expensive.",
  },
];

const JOURNEY = [
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

const SPECIALS = [
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

const MARQUEE_ITEMS = [
  "Fresh coffee",
  "Warm plates",
  "Table QR ordering",
  "Soft conversations",
  "The White House Café",
  "Jaipur café mood",
];

/* ─────────────────────────────────────────────
   SMALL UTILITIES
───────────────────────────────────────────── */

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

function SplitHeading({ children, className = "" }) {
  const ref = useRef(null);
  const visible = useInView(ref, 0.2);
  const text = String(children);

  return (
    <h2 ref={ref} className={className} aria-label={text}>
      {text.split("").map((char, index) => (
        <span
          key={`${char}-${index}`}
          aria-hidden="true"
          className="whc-letter"
          style={{
            display: char === " " ? "inline" : "inline-block",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0px)" : "translateY(18px)",
            transition: `opacity 520ms cubic-bezier(.16,1,.3,1) ${
              index * 0.01
            }s, transform 520ms cubic-bezier(.16,1,.3,1) ${index * 0.01}s`,
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
      {text.split("").map((letter, index) => (
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

function BrandTitle() {
  return (
    <div
      className="relative text-left tracking-[-0.065em]"
      style={{
        fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif",
        fontSize: "clamp(3.45rem, 7.8vw, 7.8rem)",
        fontWeight: 900,
        lineHeight: 0.78,
        fontVariationSettings: '"SOFT" 18, "WONK" 0',
        textShadow: "none",
        filter: "none",
        WebkitFontSmoothing: "antialiased",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }}
    >
      <span
        className="block whitespace-nowrap"
        style={{
          color: "#1f1007",
          WebkitTextStroke: "0px transparent",
          WebkitTextFillColor: "#1f1007",
          filter: "none",
          textShadow: "none",
        }}
      >
        The White
      </span>

      <span
        className="block whitespace-nowrap"
        style={{
          color: "#4a220e",
          WebkitTextStroke: "0px transparent",
          WebkitTextFillColor: "#4a220e",
          filter: "none",
          textShadow: "none",
        }}
      >
        House
      </span>

      <span
        className="block whitespace-nowrap"
        style={{
          color: "#7a330f",
          WebkitTextStroke: "0px transparent",
          WebkitTextFillColor: "#7a330f",
          filter: "none",
          textShadow: "none",
        }}
      >
        Café
      </span>

      <span className="absolute -bottom-5 left-1 h-[2px] w-[76%] rounded-full bg-gradient-to-r from-[#5a260d] via-[#c98b3f] to-transparent" />

      <span className="absolute -bottom-9 left-1 mb-5 text-[9px] font-black uppercase tracking-[0.28em] text-[#5a260d]">
        Coffee • Plates • Quiet Talks
      </span>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const sessionHandledRef = useRef(false);
  const heroTitleRef = useRef(null);

  const [loaded, setLoaded] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [curtainLeaving, setCurtainLeaving] = useState(false);
  const [titleStart, setTitleStart] = useState({ x: 0, y: 0 });
  const [titleMeasured, setTitleMeasured] = useState(false);

  const marqueeItems = useMemo(() => [...MARQUEE_ITEMS, ...MARQUEE_ITEMS], []);

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

    const centerX = window.innerWidth / 2 - rect.width / 2;
    const centerY = window.innerHeight / 2 - rect.height / 2;

    const moveX = centerX - rect.left;
    const moveY = centerY - rect.top;

    setTitleStart({ x: moveX, y: moveY });
    setTitleMeasured(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");

    if (!urlToken || sessionHandledRef.current) return;

    sessionHandledRef.current = true;

    axios
      .get(`https://fooadash.onrender.com/api/session/${urlToken}`)
      .then((res) => {
        localStorage.setItem("token", urlToken);
        localStorage.setItem("table", res.data.table);

        toast.success("The White House Café: Table session started 🍽️");

        navigate("/order", { replace: true });
      })
      .catch(() => {
        toast.error("Session expired. Please scan QR again.");
        navigate("/scan", { replace: true });
      });
  }, [location.search, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");

    if (urlToken) {
      setShowIntro(false);
      setLoaded(true);
      setTitleMeasured(true);
      return;
    }

    const measureTimer = setTimeout(() => {
      measureTitleStart();
    }, 120);

    const onResize = () => {
      measureTitleStart();
    };

    window.addEventListener("resize", onResize);

    const leaveCurtainTimer = setTimeout(() => {
      setCurtainLeaving(true);
    }, 2650);

    const removeCurtainTimer = setTimeout(() => {
      setShowIntro(false);
    }, 3550);

    const landTitleTimer = setTimeout(() => {
      setLoaded(true);
    }, 3950);

    return () => {
      clearTimeout(measureTimer);
      clearTimeout(leaveCurtainTimer);
      clearTimeout(removeCurtainTimer);
      clearTimeout(landTitleTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [location.search]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Cormorant+Garamond:wght@600;700&family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

        .whc-display {
          font-family: 'Fraunces', Georgia, serif;
          font-variation-settings: "SOFT" 40, "WONK" 0.5;
        }

        .whc-graffiti {
          font-family: 'Caveat', cursive;
        }

        .whc-grid {
          background-image:
            linear-gradient(rgba(61,36,18,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61,36,18,0.045) 1px, transparent 1px);
          background-size: 54px 54px;
        }

        .whc-gold-text {
          background: linear-gradient(110deg, #7a3f16 0%, #c28a3c 38%, #8b5727 72%, #f1d694 100%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: whc-shimmer 8s linear infinite;
        }

        @keyframes whc-shimmer {
          0% { background-position: -160% center; }
          100% { background-position: 160% center; }
        }

        @keyframes whc-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes whc-float-soft {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .whc-marquee-track {
          animation: whc-marquee 34s linear infinite;
        }

        .whc-hero-card-float {
          animation: whc-float-soft 7s ease-in-out infinite;
        }

        .whc-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          min-width: 190px;
          padding: 1rem 1.35rem;
          border-radius: 999px;
          border: 1px solid rgba(231, 196, 116, 0.58);
          color: #1c120a;
          font-weight: 900;
          letter-spacing: 0.055em;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.96), rgba(231,196,116,0.94)),
            linear-gradient(135deg, #d97706, #e7c474);
          box-shadow:
            0 18px 42px rgba(199, 155, 66, 0.22),
            inset 0 1px 0 rgba(255,255,255,0.74);
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .whc-btn:hover {
          transform: translateY(-3px);
          box-shadow:
            0 22px 52px rgba(199, 155, 66, 0.30),
            inset 0 1px 0 rgba(255,255,255,0.8);
        }

        .whc-ghost-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.7rem;
          min-width: 170px;
          padding: 1rem 1.25rem;
          border-radius: 999px;
          border: 1px solid rgba(61, 36, 18, 0.14);
          color: #3d2412;
          background: rgba(255, 250, 241, 0.72);
          font-weight: 900;
          transition: all 0.25s ease;
          box-shadow: 0 12px 30px rgba(61,36,18,0.07);
        }

        .whc-ghost-btn:hover {
          background: rgba(255, 250, 241, 0.95);
          border-color: rgba(199, 155, 66, 0.5);
          transform: translateY(-3px);
        }

        .whc-dark-ghost {
          color: rgba(255,250,241,0.88);
          border-color: rgba(255,250,241,0.14);
          background: rgba(255,250,241,0.07);
          box-shadow: none;
        }

        .whc-dark-ghost:hover {
          color: #fffaf1;
          background: rgba(255,250,241,0.12);
          border-color: rgba(231,196,116,0.45);
        }

        .whc-orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(34px);
          pointer-events: none;
        }

        .whc-menu-strip {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding: 0.25rem 0.25rem 1.25rem;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
        }

        .whc-menu-strip::-webkit-scrollbar {
          display: none;
        }

        .whc-menu-item {
          flex: 0 0 min(82vw, 340px);
          scroll-snap-align: center;
        }

        .whc-menu-card:hover .whc-menu-emoji {
          transform: translateY(-7px) scale(1.08);
        }

        .whc-menu-emoji {
          transition: transform 0.32s cubic-bezier(.16,1,.3,1);
        }

        @media (min-width: 768px) {
          .whc-menu-strip {
            display: grid;
            grid-template-columns: repeat(6, minmax(0, 1fr));
            align-items: stretch;
            overflow: visible;
            padding: 0;
          }

          .whc-menu-item {
            flex: initial;
          }

          .whc-menu-item:nth-child(1),
          .whc-menu-item:nth-child(2),
          .whc-menu-item:nth-child(3) {
            grid-column: span 2;
          }

          .whc-menu-item:nth-child(4),
          .whc-menu-item:nth-child(5) {
            grid-column: span 3;
          }

          .whc-menu-item:nth-child(2) {
            transform: translateY(28px);
          }

          .whc-menu-item:nth-child(4) {
            transform: translateY(18px);
          }
        }

        @media (max-width: 768px) {
          .whc-btn,
          .whc-ghost-btn {
            width: 100%;
            max-width: 320px;
          }

          .whc-letter {
            transition-delay: 0s !important;
          }

          .whc-hero-card-float {
            animation: none;
          }

          .whc-marquee-track {
            animation-duration: 42s;
          }
        }
      `}</style>

      <div
        className="min-h-screen overflow-hidden bg-[#f5ead7] text-[#241309]"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
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

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{
                  opacity: curtainLeaving ? 0 : 1,
                  y: curtainLeaving ? -22 : 0,
                  scale: curtainLeaving ? 0.98 : 1,
                }}
                transition={{
                  duration: 0.65,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative z-10 w-full px-5 text-center"
              >
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.55 }}
                  className="mb-5 text-[10px] font-black uppercase tracking-[0.42em] text-amber-100/65"
                >
                  Welcome to
                </motion.p>

                <div
                  className="whc-graffiti mx-auto max-w-[92vw] text-center text-[clamp(2rem,9vw,4.8rem)] font-bold leading-none text-[#fff4cf]"
                  style={{
                    textShadow: "none",
                    filter: "none",
                  }}
                >
                  <CurtainLetterTitle text="The White House Café" />
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
                  Elegance.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.05, duration: 0.55 }}
                  className="mx-auto mt-5 max-w-xl text-xs font-black uppercase tracking-[0.22em] text-amber-50/78 sm:text-sm"
                >
                  Coffee • Plates • Quiet Talks
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO */}
        <section className="relative min-h-[100svh] overflow-hidden pb-16 lg:min-h-[112vh]">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(120,53,15,0.22),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(5,150,105,0.10),transparent_30%),linear-gradient(135deg,#fff8e8_0%,#efd6aa_48%,#9b5b26_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,248,232,0.16)_42%,rgba(45,23,8,0.32)_100%)]" />
            <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(rgba(65,35,14,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(65,35,14,0.07)_1px,transparent_1px)] bg-[size:44px_44px]" />
          </div>

          <div className="absolute -right-40 -top-44 hidden h-[480px] w-[480px] rounded-full bg-amber-300/25 blur-[90px] md:block" />
          <div className="absolute -bottom-40 -left-44 hidden h-[440px] w-[440px] rounded-full bg-emerald-300/16 blur-[90px] md:block" />

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: loaded ? 0.06 : 0, y: loaded ? 0 : 50 }}
            transition={{ delay: 0.25, duration: 0.9 }}
            className="pointer-events-none absolute left-1/2 top-[15%] hidden -translate-x-1/2 whitespace-nowrap text-[15rem] font-black leading-none tracking-[-0.12em] text-stone-950 lg:block"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            CAFÉ
          </motion.div>

          <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-14 pt-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-8 lg:pb-28">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 18 }}
                transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-3 px-4 py-2 border rounded-full shadow-xl mb-7 border-white/70 bg-white/60 backdrop-blur-md"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2b1609] text-amber-100">
                  <Sparkles size={16} />
                </span>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-800">
                  Jaipur’s warm café corner
                </p>
              </motion.div>

              {/* REAL CENTER TO PLACE HEADER ANIMATION */}
              <motion.div
                ref={heroTitleRef}
                initial={{
                  opacity: 1,
                  x: titleStart.x,
                  y: titleStart.y,
                  scale: 1.06,
                }}
                animate={{
                  opacity: 1,
                  x: loaded ? 0 : titleStart.x,
                  y: loaded ? 0 : titleStart.y,
                  scale: loaded ? 1 : 1.06,
                }}
                transition={{
                  duration: 1.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="origin-left will-change-transform"
              >
                <BrandTitle />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 22 }}
                animate={{
                  opacity: loaded ? 1 : 0,
                  y: loaded ? 0 : 22,
                }}
                transition={{ delay: 0.18, duration: 0.65 }}
                className="max-w-xl mt-8 text-base leading-8 text-stone-700 sm:text-lg"
              >
                A premium café space for rich coffee, warm plates, quiet talks,
                and a smooth QR menu experience from every table.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 22 }}
                transition={{ delay: 0.3, duration: 0.65 }}
                className="flex flex-col gap-4 mt-9 sm:flex-row"
              >
                <button
                  onClick={handleExplore}
                  className="group relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-900 via-emerald-600 to-emerald-900 px-8 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_20px_52px_rgba(20,83,45,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(20,83,45,0.30)]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Explore Café Menu
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </button>

                <div className="flex items-center justify-center gap-3 px-6 py-4 border rounded-full shadow-lg border-white/80 bg-white/65 backdrop-blur-md">
                  <ScanLine size={19} className="text-emerald-700" />
                  <span className="text-sm font-black text-stone-700">
                    Scan. Choose. Relax.
                  </span>
                </div>
              </motion.div>
            </div>

            {/* LIGHTER HERO CARD */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: 18 }}
              animate={{
                opacity: loaded ? 1 : 0,
                x: loaded ? 0 : 40,
                y: loaded ? 0 : 18,
              }}
              transition={{
                delay: 0.2,
                duration: 0.72,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="whc-hero-card-float relative mx-auto w-full max-w-[620px]"
            >
              <div className="absolute -inset-6 hidden rounded-[4rem] bg-amber-200/28 blur-3xl md:block" />

              <div className="relative overflow-hidden rounded-[2.4rem] border border-white/80 bg-[#fffaf0] p-2.5 shadow-[0_35px_95px_rgba(78,42,12,0.24)] sm:rounded-[3rem] sm:p-3">
                <div className="relative overflow-hidden rounded-[2rem] bg-[#2a170b] sm:rounded-[2.55rem]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(245,158,11,0.34),transparent_34%),radial-gradient(circle_at_90%_20%,rgba(16,185,129,0.14),transparent_28%),linear-gradient(145deg,#2b1609_0%,#4a250c_50%,#1c1008_100%)]" />
                  <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:34px_34px]" />

                  <div className="relative px-5 pt-6 pb-5 text-white sm:px-6 sm:pt-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.32em] text-amber-200 sm:text-[10px]">
                          The White House Café
                        </p>

                        <h3
                          className="mt-3 text-3xl font-black leading-none sm:text-5xl"
                          style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                          }}
                        >
                          Your Table
                          <span className="block text-amber-200">Awaits.</span>
                        </h3>
                      </div>

                      <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-amber-100 text-[#2b1609] shadow-inner sm:h-16 sm:w-16 sm:rounded-[1.5rem]">
                        <ChefHat size={26} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-5 sm:gap-3">
                      {[
                        ["Open", "10 AM"],
                        ["Mood", "Warm"],
                        ["Table", "QR"],
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
                    <div className="absolute left-1/2 top-12 h-32 w-[72%] -translate-x-1/2 rounded-full bg-amber-200/28 blur-3xl" />

                    <div className="relative overflow-hidden rounded-[1.9rem] border border-amber-200/70 bg-white p-3.5 shadow-xl sm:rounded-[2.15rem] sm:p-4">
                      <div className="grid gap-4 sm:grid-cols-[145px_1fr] sm:items-center">
                        <div className="relative h-[136px] overflow-hidden rounded-[1.55rem] bg-[radial-gradient(circle,#fff7cc_0%,#f59e0b_36%,#7c2d12_78%)] shadow-inner sm:h-36">
                          <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[11px] border-white/90 bg-amber-100 text-5xl shadow-2xl">
                            🍝
                          </div>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700">
                              Signature
                            </span>
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-amber-800">
                              Today special
                            </span>
                          </div>

                          <h4
                            className="mt-3 text-2xl font-black leading-tight"
                            style={{
                              fontFamily: "'Playfair Display', Georgia, serif",
                            }}
                          >
                            Creamy Alfredo Bowl
                          </h4>

                          <p className="mt-2 text-sm leading-6 text-stone-600">
                            Rich, soft, warm, and made for long café
                            conversations.
                          </p>

                          <div className="flex items-center justify-between mt-4">
                            <p className="text-2xl font-black text-emerald-700">
                              ₹249
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

                    <div className="relative mt-4 overflow-hidden rounded-[1.8rem] border border-dashed border-emerald-300 bg-emerald-50 p-4">
                      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.26em] text-emerald-700">
                            Smooth QR ordering
                          </p>
                          <h5
                            className="mt-1 text-lg font-black text-stone-950"
                            style={{
                              fontFamily: "'Playfair Display', Georgia, serif",
                            }}
                          >
                            Scan from table. Order without rush.
                          </h5>
                          <p className="mt-1 text-xs leading-5 text-stone-600">
                            Browse, add items, and send the order directly.
                          </p>
                        </div>

                        <div className="grid h-[72px] w-[72px] shrink-0 grid-cols-3 gap-1 rounded-2xl bg-stone-950 p-2.5 shadow-xl sm:h-20 sm:w-20 sm:p-3">
                          {[...Array(9)].map((_, i) => (
                            <span
                              key={i}
                              className={`rounded-[4px] ${
                                i % 2 === 0 ? "bg-white" : "bg-amber-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* MOMENTS */}
        <section className="relative overflow-hidden bg-[#fffaf1] px-4 py-20 sm:px-6 lg:py-28">
          <div className="absolute inset-0 whc-grid opacity-60" />
          <div className="whc-orb left-[-140px] top-16 hidden h-[320px] w-[320px] bg-[#e7c474]/18 md:block" />
          <div className="whc-orb bottom-[-140px] right-[-120px] hidden h-[380px] w-[380px] bg-[#d97706]/08 md:block" />

          <div className="relative max-w-6xl mx-auto">
            <Reveal>
              <div className="max-w-4xl mx-auto text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#8f561a]">
                  More than a place to eat
                </p>

                <SplitHeading className="whc-display mt-4 text-[clamp(2.5rem,6vw,5.4rem)] font-[560] leading-[0.92] tracking-[-0.06em] text-[#3d2412]">
                  A café that feels slow, warm and memorable.
                </SplitHeading>

                <p className="mx-auto mt-6 max-w-2xl text-base font-semibold leading-8 text-[#3d2412]/62 sm:text-lg">
                  Made for coffee after class, evening snacks, casual meetings,
                  family time and quiet table conversations.
                </p>
              </div>
            </Reveal>

            <div className="grid gap-5 mt-14 sm:grid-cols-2 lg:grid-cols-4">
              {MOMENTS.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.06}>
                  <SoftCard className="h-full rounded-[2rem] border border-[#eadfcd] bg-white/82 p-6 shadow-[0_16px_42px_rgba(61,36,18,0.07)]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3d2412] text-[#e7c474]">
                      {item.icon}
                    </div>

                    <h3 className="whc-display mt-6 text-2xl font-semibold tracking-[-0.03em] text-[#3d2412]">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm font-semibold leading-7 text-[#3d2412]/58">
                      {item.text}
                    </p>
                  </SoftCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* JOURNEY */}
        <section className="relative overflow-hidden bg-[#120d08] px-4 py-20 text-[#fffaf1] sm:px-6 lg:py-24">
          <div className="absolute left-1/2 top-24 hidden h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-[#e7c474]/12 blur-3xl md:block" />
          <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(255,250,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,250,241,0.05)_1px,transparent_1px)] bg-[size:58px_58px]" />

          <div className="relative max-w-6xl mx-auto">
            <Reveal>
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#e7c474]">
                  The table journey
                </p>

                <h2 className="whc-display mt-4 text-[clamp(2.45rem,5vw,5rem)] font-[560] leading-[0.93] tracking-[-0.06em] text-[#fffaf1]">
                  From first scan
                  <span className="block italic whc-gold-text">
                    to last sip.
                  </span>
                </h2>

                <p className="mx-auto mt-5 max-w-xl text-base font-semibold leading-8 text-[#fffaf1]/58">
                  A smooth café flow where customers scan, order, relax, and
                  enjoy — while the kitchen receives everything clearly.
                </p>
              </div>
            </Reveal>

            <div className="relative mt-16">
              <div className="absolute top-0 hidden w-px h-full -translate-x-1/2 left-1/2 bg-white/10 lg:block" />

              <div className="grid gap-6 lg:grid-cols-4">
                {JOURNEY.map((step, index) => (
                  <Reveal key={step.no} delay={index * 0.06}>
                    <SoftCard
                      className={`relative h-full rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-sm ${
                        index % 2 === 1 ? "lg:mt-14" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <span className="rounded-full border border-[#e7c474]/25 bg-[#e7c474]/10 px-3 py-1 text-[11px] font-black tracking-[0.22em] text-[#e7c474]">
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

                      <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[#e7c474]/50 to-transparent" />
                    </SoftCard>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={0.1}>
              <div className="mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-[0_24px_65px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <div className="rounded-[1.5rem] bg-[#fffaf1] p-5 text-[#3d2412]">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8f561a]">
                      Customer side
                    </p>
                    <h3 className="whc-display mt-2 text-3xl font-semibold tracking-[-0.04em]">
                      Scan and order softly.
                    </h3>
                    <p className="mt-3 text-sm font-semibold leading-7 text-[#3d2412]/60">
                      No waiting for a menu. Customers browse, add notes, and
                      place the order directly from their table.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#e7c474]/30 bg-[#e7c474]/10 text-[#e7c474]">
                      <QrCode size={28} />
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] bg-[#3d2412] p-5 text-[#fffaf1]">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#e7c474]">
                      Kitchen side
                    </p>
                    <h3 className="whc-display mt-2 text-3xl font-semibold tracking-[-0.04em]">
                      Clear orders instantly.
                    </h3>
                    <p className="mt-3 text-sm font-semibold leading-7 text-[#fffaf1]/60">
                      Table, batch, item notes and order status stay clean,
                      helping the café serve faster.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* MARQUEE */}
        <section className="overflow-hidden border-y border-[#eadfcd] bg-[#fffaf1] py-5">
          <div className="flex items-center gap-8 whc-marquee-track w-max">
            {marqueeItems.map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="inline-flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.22em] text-[#8f561a]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#d97706]" />
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* MENU */}
        <section className="relative overflow-hidden bg-[#f5f0e8] px-4 py-20 sm:px-6 lg:py-28">
          <div className="absolute inset-0 whc-grid opacity-70" />
          <div className="whc-orb left-[-130px] top-16 hidden h-[320px] w-[320px] bg-[#d97706]/10 md:block" />
          <div className="whc-orb bottom-[-110px] right-[-100px] hidden h-[380px] w-[380px] bg-[#e7c474]/18 md:block" />

          <div className="relative max-w-6xl mx-auto">
            <Reveal>
              <div className="flex flex-col gap-6 mb-12 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#8f561a]">
                    Café favourites
                  </p>

                  <SplitHeading className="whc-display mt-4 text-[clamp(2.5rem,5.5vw,5rem)] font-[560] leading-[0.92] tracking-[-0.06em] text-[#3d2412]">
                    Golden bites, warm coffee.
                  </SplitHeading>
                </div>

                <button onClick={handleExplore} className="whc-btn">
                  <span>Open Full Menu</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </Reveal>

            <div className="whc-menu-strip">
              {SPECIALS.map((dish, index) => (
                <div className="h-full whc-menu-item" key={dish.name}>
                  <Reveal delay={index * 0.05} className="h-full">
                    <DishCard dish={dish} />
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EDITORIAL */}
        <section className="relative overflow-hidden bg-[#fffaf1] px-4 py-20 sm:px-6 lg:py-28">
          <div className="absolute left-[76%] top-20 hidden h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-[#e7c474]/16 blur-3xl md:block" />

          <div className="relative max-w-6xl mx-auto">
            <Reveal>
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#8f561a]">
                  The feeling
                </p>

                <SplitHeading className="whc-display mt-4 text-[clamp(2.5rem,5.5vw,5rem)] font-[560] leading-[0.92] tracking-[-0.06em] text-[#3d2412]">
                  Designed for the moments between meals.
                </SplitHeading>
              </div>
            </Reveal>

            <div className="grid gap-5 mt-14 lg:grid-cols-12">
              <Reveal className="lg:col-span-7">
                <SoftCard className="relative min-h-[350px] overflow-hidden rounded-[2.4rem] border border-[#eadfcd] bg-[#120d08] p-7 text-[#fffaf1] shadow-[0_24px_70px_rgba(61,36,18,0.12)]">
                  <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#e7c474]/12 blur-3xl" />
                  <div className="absolute -bottom-24 left-12 h-72 w-72 rounded-full bg-[#d97706]/10 blur-3xl" />

                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7c474]/14 text-[#e7c474]">
                      <Sparkles size={26} />
                    </div>

                    <h3 className="whc-display mt-14 max-w-xl text-[clamp(2.6rem,5vw,4.9rem)] font-semibold leading-[0.92] tracking-[-0.06em]">
                      Premium café mood without feeling too expensive.
                    </h3>

                    <p className="mt-6 max-w-lg text-sm font-semibold leading-7 text-[#fffaf1]/55">
                      The White House Café should feel warm, polished and
                      welcoming — a place where students, friends, families and
                      casual visitors all feel comfortable.
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
                    <div className="mb-12 inline-flex rounded-full bg-[#3d2412] px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#e7c474]">
                      Café corner
                    </div>

                    <h3 className="whc-display text-4xl font-semibold tracking-[-0.05em] text-[#3d2412]">
                      A Jaipur café corner.
                    </h3>

                    <p className="mt-5 text-sm font-semibold leading-7 text-[#3d2412]/58">
                      Built for everyday visits: a snack after college, a calm
                      meet-up, a quick coffee, or a cozy evening plan.
                    </p>
                  </div>
                </SoftCard>
              </Reveal>

              <Reveal delay={0.08} className="lg:col-span-4">
                <MiniBento
                  icon={<Leaf size={25} />}
                  title="Fresh & simple"
                  text="Clean menu, warm food and less confusion at the table."
                />
              </Reveal>

              <Reveal delay={0.1} className="lg:col-span-4">
                <MiniBento
                  icon={<ChefHat size={23} />}
                  title="Kitchen friendly"
                  text="Orders reach the kitchen clearly with item notes."
                />
              </Reveal>

              <Reveal delay={0.12} className="lg:col-span-4">
                <MiniBento
                  icon={<Heart size={23} />}
                  title="Made to return"
                  text="A smooth experience makes customers remember the place."
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-[#120d08] px-4 py-20 text-center text-[#fffaf1] sm:px-6 lg:py-28">
          <div className="absolute inset-0 opacity-[0.13] bg-[linear-gradient(rgba(255,250,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,250,241,0.05)_1px,transparent_1px)] bg-[size:58px_58px]" />
          <div className="absolute left-1/2 top-1/2 hidden h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e7c474]/12 blur-3xl md:block" />

          <div className="relative max-w-4xl mx-auto">
            <Reveal>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#e7c474]">
                Ready for a warm table?
              </p>

              <h2 className="whc-display mt-4 text-[clamp(2.7rem,6vw,5.8rem)] font-[560] leading-[0.92] tracking-[-0.06em]">
                Browse the café menu
                <span className="block italic whc-gold-text">
                  before your first sip.
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-base font-semibold leading-8 text-[#fffaf1]/58">
                Explore our menu or scan your table QR when you visit to place
                your order directly.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 mt-9 sm:flex-row">
                <button onClick={handleExplore} className="whc-btn">
                  <span>Explore Menu</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => navigate("/contact")}
                  className="whc-ghost-btn whc-dark-ghost"
                >
                  <MapPin size={18} />
                  <span>Visit Café</span>
                </button>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}

function DishCard({ dish }) {
  return (
    <SoftCard className="whc-menu-card relative flex h-[390px] flex-col overflow-hidden rounded-[2rem] border border-[#eadfcd] bg-[#fffaf1]/92 p-6 text-center shadow-[0_18px_48px_rgba(61,36,18,0.08)] sm:h-full">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#e7c474]/18 blur-2xl" />

      <div className="absolute left-5 top-5 rounded-full bg-[#3d2412] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#e7c474]">
        {dish.tag}
      </div>

      <div className="whc-menu-emoji relative mx-auto mb-5 mt-8 flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-[#eadfcd] bg-white text-5xl shadow-[0_14px_35px_rgba(61,36,18,0.07)]">
        {dish.emoji}
      </div>

      <div className="flex flex-col flex-1">
        <h3 className="whc-display text-2xl font-semibold tracking-[-0.03em] text-[#3d2412]">
          {dish.name}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-[#3d2412]/55">
          {dish.desc}
        </p>

        <div className="mt-auto">
          <div className="mx-auto my-4 h-px w-12 bg-[#c79b42]/42" />

          <p className="text-lg font-black text-[#8f561a]">{dish.price}</p>

          <div className="flex items-center justify-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                className="fill-[#c79b42] text-[#c79b42]"
              />
            ))}
          </div>
        </div>
      </div>
    </SoftCard>
  );
}

function MiniBento({ icon, title, text }) {
  return (
    <SoftCard className="h-full rounded-[2rem] border border-[#eadfcd] bg-white/82 p-6 shadow-[0_16px_48px_rgba(61,36,18,0.08)]">
      <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-[#3d2412] text-[#e7c474]">
        {icon}
      </div>

      <h3 className="whc-display mt-6 text-2xl font-semibold tracking-[-0.03em] text-[#3d2412]">
        {title}
      </h3>

      <p className="mt-3 text-sm font-semibold leading-7 text-[#3d2412]/58">
        {text}
      </p>
    </SoftCard>
  );
}

export default Home;
