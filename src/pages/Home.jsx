import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";
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
   SMALL UTILITIES
───────────────────────────────────────────── */

function useInView(ref, threshold = 0.18) {
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
        transform: visible
          ? "translateY(0px) scale(1)"
          : "translateY(42px) scale(0.985)",
        filter: visible ? "blur(0px)" : "blur(12px)",
        transition: `opacity 900ms cubic-bezier(.16,1,.3,1) ${delay}s, transform 900ms cubic-bezier(.16,1,.3,1) ${delay}s, filter 900ms cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function SplitHeading({ children, className = "" }) {
  const ref = useRef(null);
  const visible = useInView(ref, 0.22);
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
            transform: visible
              ? "translateY(0px) rotate(0deg)"
              : "translateY(26px) rotate(4deg)",
            transition: `opacity 620ms cubic-bezier(.16,1,.3,1) ${
              index * 0.015
            }s, transform 620ms cubic-bezier(.16,1,.3,1) ${index * 0.015}s`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </h2>
  );
}

function TiltCard({ children, className = "" }) {
  const ref = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const smoothX = useSpring(rotateX, { stiffness: 230, damping: 20 });
  const smoothY = useSpring(rotateY, { stiffness: 230, damping: 20 });

  const handleMove = (e) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    rotateX.set((0.5 - py) * 8);
    rotateY.set((px - 0.5) * 10);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{
        rotateX: smoothX,
        rotateY: smoothY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const heroRef = useRef(null);
  const heroTitleRef = useRef(null);
  const journeyRef = useRef(null);
  const menuRef = useRef(null);
  const editorialRef = useRef(null);

  const [loaded, setLoaded] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [titleFlight, setTitleFlight] = useState(false);
  const [titleLanded, setTitleLanded] = useState(false);
  const [titleTarget, setTitleTarget] = useState(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 70, damping: 24 });
  const smoothY = useSpring(mouseY, { stiffness: 70, damping: 24 });

  const cardRotateX = useTransform(smoothY, [-320, 320], [9, -9]);
  const cardRotateY = useTransform(smoothX, [-320, 320], [-9, 9]);
  const cardLift = useTransform(smoothY, [-320, 320], [-8, 8]);

  const glowX = useTransform(smoothX, [-450, 450], ["14%", "86%"]);
  const glowY = useTransform(smoothY, [-450, 450], ["18%", "82%"]);
  const [hideFlyingTitle, setHideFlyingTitle] = useState(false);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    mass: 0.35,
  });

  const heroY = useTransform(smoothScroll, [0, 1], [0, -115]);
  const cardY = useTransform(smoothScroll, [0, 1], [0, 45]);
  const heroTextOpacity = useTransform(smoothScroll, [0, 0.55], [1, 0]);
  const bgY = useTransform(smoothScroll, [0, 1], [0, -160]);
  const scrollHintOpacity = useTransform(smoothScroll, [0, 0.25], [1, 0]);

  const { scrollYProgress: journeyProgress } = useScroll({
    target: journeyRef,
    offset: ["start end", "end start"],
  });

  const timelineHeight = useTransform(
    journeyProgress,
    [0.08, 0.82],
    ["0%", "100%"],
  );
  const journeyCardY = useTransform(journeyProgress, [0, 1], [32, -36]);
  const journeyCardRotate = useTransform(journeyProgress, [0, 1], [-5, 5]);
  const journeyGlowX = useTransform(journeyProgress, [0, 1], ["-16%", "18%"]);

  const { scrollYProgress: menuProgress } = useScroll({
    target: menuRef,
    offset: ["start end", "end start"],
  });

  const menuFloat = useTransform(menuProgress, [0, 1], [26, -28]);
  const menuRotate = useTransform(menuProgress, [0, 1], [-1.8, 1.8]);

  const { scrollYProgress: editorialProgress } = useScroll({
    target: editorialRef,
    offset: ["start end", "end start"],
  });

  const editorialGlowX = useTransform(editorialProgress, [0, 1], ["8%", "76%"]);
  const editorialNumberY = useTransform(editorialProgress, [0, 1], [50, -55]);

  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        left: `${(i * 19 + 6) % 100}%`,
        top: `${(i * 31 + 9) % 100}%`,
      })),
    [],
  );

  const handleExplore = () => {
    const token = localStorage.getItem("token");
    if (token) navigate("/order");
    else navigate("/menu-preview");
  };

  const handleMouseMove = (e) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;

    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
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
    }, 3180);

    const hideFlyTimer = setTimeout(() => {
      setHideFlyingTitle(true);
    }, 3320);

    const finishTimer = setTimeout(() => {
      setShowIntro(false);
      setLoaded(true);
    }, 3650);

    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");

    if (urlToken) {
      axios
        .get(`https://fooadash.onrender.com/api/session/${urlToken}`)
        .then((res) => {
          localStorage.setItem("token", urlToken);
          localStorage.setItem("table", res.data.table);
          toast.success("The White House Café: Table session started 🍽️");
          navigate("/home", { replace: true });
        })
        .catch(() => {
          toast.error("Session expired. Please scan QR again.");
          navigate("/scan");
        });
    }

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(flyTimer);
      clearTimeout(landTimer);
      clearTimeout(finishTimer);
      clearTimeout(hideFlyTimer);
    };
  }, [location, navigate]);

  const BrandTitle = () => (
    <div
      className="relative text-left leading-[0.82] tracking-[-0.07em] text-[#241309]"
      style={{
        fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif",
        fontSize: "clamp(3.25rem, 7.2vw, 7.45rem)",
        fontWeight: 700,
        fontVariationSettings: '"SOFT" 20, "WONK" 1',
        textShadow:
          "0 18px 48px rgba(73,35,12,0.26), 0 0 34px rgba(255,241,210,0.25)",
      }}
    >
      <span className="block whitespace-nowrap">The White</span>

      <span
        className="block whitespace-nowrap"
        style={{
          background:
            "linear-gradient(90deg, #241309 0%, #55290f 44%, #8f4f1d 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        House
      </span>

      <span
        className="block whitespace-nowrap"
        style={{
          background:
            "linear-gradient(90deg, #6b3414 0%, #b67832 48%, #3b1d0c 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Café
      </span>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..800,0..100,0..1&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

        .whc-display {
          font-family: 'Fraunces', Georgia, serif;
          font-variation-settings: "SOFT" 52, "WONK" 0.8;
        }

        .whc-grid {
          background-image:
            linear-gradient(rgba(61,36,18,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61,36,18,0.045) 1px, transparent 1px);
          background-size: 54px 54px;
        }

        .whc-gold-text {
          background: linear-gradient(110deg, #7a3f16 0%, #c28a3c 38%, #8b5727 72%, #f1d694 100%);
          background-size: 260% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: whc-shimmer 6.5s linear infinite;
        }

        @keyframes whc-shimmer {
          0% { background-position: -180% center; }
          100% { background-position: 180% center; }
        }

        @keyframes whc-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes whc-ring {
          0% { transform: scale(0.76); opacity: 0.72; }
          100% { transform: scale(1.86); opacity: 0; }
        }

        @keyframes whc-steam {
          0% {
            transform: translateY(16px) scaleX(0.82);
            opacity: 0;
          }
          34% {
            opacity: 0.76;
          }
          100% {
            transform: translateY(-34px) scaleX(1.32);
            opacity: 0;
          }
        }

        @keyframes whc-breathe {
          0%, 100% { transform: scale(1); opacity: 0.46; }
          50% { transform: scale(1.12); opacity: 0.86; }
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
            0 20px 50px rgba(199, 155, 66, 0.31),
            inset 0 1px 0 rgba(255,255,255,0.74);
          overflow: hidden;
          transition: transform 0.28s ease, box-shadow 0.28s ease;
        }

        .whc-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-120%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.72), transparent);
          transition: transform 0.76s ease;
        }

        .whc-btn:hover {
          transform: translateY(-4px);
          box-shadow:
            0 30px 68px rgba(199, 155, 66, 0.42),
            inset 0 1px 0 rgba(255,255,255,0.8);
        }

        .whc-btn:hover::before {
          transform: translateX(120%);
        }

        .whc-btn span,
        .whc-btn svg {
          position: relative;
          z-index: 1;
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
          background: rgba(255, 250, 241, 0.6);
          backdrop-filter: blur(18px);
          font-weight: 900;
          transition: all 0.28s ease;
          box-shadow: 0 14px 36px rgba(61,36,18,0.08);
        }

        .whc-ghost-btn:hover {
          background: rgba(255, 250, 241, 0.92);
          border-color: rgba(199, 155, 66, 0.5);
          transform: translateY(-4px);
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
          filter: blur(36px);
          pointer-events: none;
        }

        .whc-steam span {
          position: absolute;
          left: 50%;
          bottom: 73%;
          width: 18px;
          height: 58px;
          border-radius: 999px;
          border-left: 2px solid rgba(231,196,116,0.48);
          filter: blur(0.4px);
          animation: whc-steam 2.85s ease-in-out infinite;
        }

        .whc-steam span:nth-child(1) {
          transform: translateX(-28px);
          animation-delay: 0s;
        }

        .whc-steam span:nth-child(2) {
          transform: translateX(-2px);
          animation-delay: 0.45s;
        }

        .whc-steam span:nth-child(3) {
          transform: translateX(24px);
          animation-delay: 0.9s;
        }

        .whc-cup-glow::before {
          content: "";
          position: absolute;
          inset: -34px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(231,196,116,0.34), transparent 64%);
          z-index: -1;
          animation: whc-breathe 4.8s ease-in-out infinite;
        }

        .whc-story-section {
          min-height: auto;
        }

        .whc-story-sticky {
          position: relative;
          top: auto;
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
          transform: translateY(-9px) rotate(-7deg) scale(1.14);
        }

        .whc-menu-emoji {
          transition: transform 0.38s cubic-bezier(.16,1,.3,1);
        }

        .whc-editorial-number {
          font-size: clamp(7rem, 17vw, 18rem);
          line-height: 0.72;
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

          .whc-menu-item:nth-child(1) {
            grid-column: span 2;
          }

          .whc-menu-item:nth-child(2) {
            grid-column: span 2;
            transform: translateY(46px);
          }

          .whc-menu-item:nth-child(3) {
            grid-column: span 2;
          }

          .whc-menu-item:nth-child(4) {
            grid-column: span 3;
            transform: translateY(24px);
          }

          .whc-menu-item:nth-child(5) {
            grid-column: span 3;
            transform: translateY(-14px);
          }
        }

        @media (min-width: 1024px) {
          .whc-story-section {
            min-height: 230vh;
          }

          .whc-story-sticky {
            position: sticky;
            top: 88px;
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
              animate={{ y: titleFlight ? "-108%" : 0 }}
              exit={{ y: "-108%" }}
              transition={{
                delay: titleFlight ? 0.05 : 0,
                duration: 1.08,
                ease: [0.76, 0, 0.24, 1],
              }}
              className="fixed inset-0 z-[9998] flex items-center justify-center bg-[#2b1609]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.35),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.18),transparent_35%),linear-gradient(135deg,#2b1609_0%,#7c3f11_52%,#f3d7a8_100%)]" />

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 top-1/2 h-44 w-full origin-left -translate-y-1/2 bg-[#fff4dc]/20 blur-3xl"
              />

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{
                  opacity: titleFlight ? 0 : 1,
                  y: titleFlight ? -12 : 0,
                }}
                transition={{ delay: 0.2, duration: 0.65 }}
                className="absolute top-[18%] text-center text-[10px] font-black uppercase tracking-[0.45em] text-amber-100/70"
              >
                Painting the café mood
              </motion.p>

              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{
                  scaleX: titleFlight ? 0 : 1,
                  opacity: titleFlight ? 0 : 1,
                }}
                transition={{ delay: titleFlight ? 0 : 1.25, duration: 0.8 }}
                className="absolute top-[70%] h-[3px] w-72 origin-left rounded-full bg-gradient-to-r from-transparent via-amber-200 to-transparent"
              />

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{
                  opacity: titleFlight ? 0 : 1,
                  y: titleFlight ? 18 : 0,
                }}
                transition={{ delay: titleFlight ? 0 : 1.45, duration: 0.7 }}
                className="absolute top-[74%] inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-amber-50 shadow-2xl backdrop-blur-xl"
              >
                <Coffee size={17} />
                <span className="text-xs font-black uppercase tracking-[0.25em]">
                  Warm coffee. Soft conversations.
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
                filter: "blur(18px)",
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
                      filter: "blur(0px)",
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
                filter: "blur(1px)",
                transition: { duration: 0.08 },
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
              <BrandTitle />

              {!titleFlight && (
                <motion.div
                  initial={{ x: "-125%", opacity: 0 }}
                  animate={{ x: "125%", opacity: [0, 1, 1, 0] }}
                  transition={{
                    delay: 0.72,
                    duration: 1.35,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-y-0 left-0 pointer-events-none w-28 rotate-12 bg-white/45 blur-xl"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO */}
        <section
          ref={heroRef}
          onMouseMove={handleMouseMove}
          className="relative min-h-[100svh] overflow-hidden pb-16 lg:min-h-[122vh]"
        >
          <motion.div style={{ y: bgY }} className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(120,53,15,0.30),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(5,150,105,0.16),transparent_28%),linear-gradient(135deg,#fff8e8_0%,#efd6aa_43%,#9b5b26_100%)]" />
            <motion.div
              style={{
                background: `radial-gradient(circle at ${glowX} ${glowY}, rgba(255,246,210,0.68), transparent 32%)`,
              }}
              className="absolute inset-0"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,248,232,0.14)_38%,rgba(45,23,8,0.38)_100%)]" />
            <div className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(rgba(65,35,14,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(65,35,14,0.07)_1px,transparent_1px)] bg-[size:44px_44px]" />
          </motion.div>

          <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply bg-[url('data:image/svg+xml,%3Csvg_viewBox=%220_0_200_200%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22n%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%220.75%22_numOctaves=%224%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22200%22_height=%22200%22_filter=%22url(%23n)%22_opacity=%220.6%22/%3E%3C/svg%3E')]" />

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: loaded ? 0.075 : 0, y: loaded ? 0 : 60 }}
            transition={{ delay: 0.6, duration: 1.2 }}
            className="pointer-events-none absolute left-1/2 top-[16%] hidden -translate-x-1/2 whitespace-nowrap text-[15rem] font-black leading-none tracking-[-0.12em] text-stone-950 lg:block"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            CAFÉ
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.16, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-40 -top-44 h-[560px] w-[560px] rounded-full bg-amber-300/45 blur-[130px]"
          />

          <motion.div
            animate={{ scale: [1.08, 1, 1.08], opacity: [0.14, 0.28, 0.14] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-40 -left-44 h-[520px] w-[520px] rounded-full bg-emerald-300/25 blur-[130px]"
          />

          <div className="absolute inset-0 pointer-events-none">
            {particles.map((item, i) => (
              <motion.span
                key={i}
                className="absolute w-1 h-1 rounded-full bg-amber-900/25"
                style={{
                  left: item.left,
                  top: item.top,
                }}
                animate={{
                  y: [0, -32, 0],
                  opacity: [0.12, 0.72, 0.12],
                  scale: [0.7, 1.8, 0.7],
                }}
                transition={{
                  duration: 3.6 + (i % 7),
                  repeat: Infinity,
                  delay: i * 0.11,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-10 px-5 pt-10 pb-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-8 lg:pb-36">
            <motion.div style={{ y: heroY, opacity: heroTextOpacity }}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 24 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-3 px-4 py-2 border rounded-full shadow-xl mb-7 border-white/70 bg-white/60 backdrop-blur-xl"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2b1609] text-amber-100">
                  <Sparkles size={16} />
                </span>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-800">
                  Jaipur’s warm café corner
                </p>
              </motion.div>

              <motion.div
                ref={heroTitleRef}
                initial={false}
                animate={{
                  opacity: titleLanded ? 1 : 0,
                }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="text-left origin-left"
                style={{
                  visibility: titleLanded ? "visible" : "hidden",
                }}
              >
                <BrandTitle />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
                animate={{
                  opacity: loaded ? 1 : 0,
                  y: loaded ? 0 : 30,
                  filter: loaded ? "blur(0px)" : "blur(12px)",
                }}
                transition={{ delay: 0.18, duration: 0.8 }}
                className="max-w-xl text-base leading-8 mt-7 text-stone-700 sm:text-lg"
              >
                A premium café space for rich coffee, warm plates, quiet talks,
                and a smooth QR menu experience from every table.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 28 }}
                transition={{ delay: 0.34, duration: 0.75 }}
                className="flex flex-col gap-4 mt-9 sm:flex-row"
              >
                <motion.button
                  onClick={handleExplore}
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                    boxShadow: "0 28px 90px rgba(20,83,45,0.28)",
                  }}
                  whileTap={{ scale: 0.96 }}
                  className="group relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-900 via-emerald-600 to-emerald-900 px-8 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-2xl"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Explore Café Menu
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>

                  <motion.span
                    animate={{ x: ["-130%", "160%"] }}
                    transition={{
                      duration: 2.1,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-y-0 w-24 rotate-12 bg-white/35 blur-md"
                  />
                </motion.button>

                <motion.div
                  whileHover={{ y: -4, scale: 1.03 }}
                  className="flex items-center gap-3 px-6 py-4 border rounded-full shadow-lg border-white/80 bg-white/65 backdrop-blur-xl"
                >
                  <ScanLine size={19} className="text-emerald-700" />
                  <span className="text-sm font-black text-stone-700">
                    Scan. Choose. Relax.
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              style={{
                y: cardY,
                rotateX: cardRotateX,
                rotateY: cardRotateY,
                translateY: cardLift,
                transformStyle: "preserve-3d",
              }}
              initial={{ opacity: 0, x: 70, rotateY: -18 }}
              animate={{
                opacity: loaded ? 1 : 0,
                x: loaded ? 0 : 70,
                rotateY: loaded ? 0 : -18,
              }}
              whileHover={{
                scale: 1.025,
                rotateX: 4,
                rotateY: -5,
              }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 18,
              }}
              className="group relative mx-auto w-full max-w-[580px] sm:max-w-[640px] lg:max-w-[700px]"
            >
              <motion.div
                style={{
                  background: `radial-gradient(circle at ${glowX} ${glowY}, rgba(255,226,150,0.65), transparent 44%)`,
                }}
                className="absolute -inset-8 rounded-[4rem] blur-2xl transition-transform duration-500 group-hover:scale-110"
              />

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                className="absolute left-1/2 top-1/2 hidden h-[610px] w-[610px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 lg:block"
              />

              <motion.div
                animate={{ y: [0, -14, 0], rotate: [-4, 4, -4] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{
                  x: 115,
                  y: 92,
                  rotate: 9,
                  scale: 1.08,
                }}
                className="absolute -left-1 top-8 z-40 rounded-[1.5rem] border border-white/80 bg-white/90 p-3 shadow-2xl backdrop-blur-xl sm:-left-7 sm:p-4"
              >
                <Coffee size={21} className="text-amber-700" />
                <p className="mt-2 text-[9px] font-black uppercase tracking-[0.22em] text-emerald-700">
                  House brew
                </p>
                <p className="mt-1 text-xs font-black text-stone-950 sm:text-sm">
                  Fresh coffee
                </p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0], rotate: [4, -4, 4] }}
                transition={{
                  duration: 5.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{
                  x: -118,
                  y: -95,
                  rotate: -10,
                  scale: 1.08,
                }}
                className="absolute -right-1 bottom-24 z-40 rounded-[1.5rem] bg-[#2b1609] p-3 text-white shadow-2xl sm:-right-7 sm:p-4"
              >
                <QrCode size={21} className="text-amber-200" />
                <p className="mt-2 text-[9px] font-black uppercase tracking-[0.22em] text-amber-200">
                  Table QR
                </p>
                <p className="mt-1 text-xs font-black sm:text-sm">
                  Order softly
                </p>
              </motion.div>

              <div className="relative z-30 overflow-hidden rounded-[2.4rem] border border-white/80 bg-[#fffaf0] p-2.5 shadow-[0_50px_135px_rgba(78,42,12,0.32)] transition-shadow duration-500 group-hover:shadow-[0_70px_170px_rgba(78,42,12,0.42)] sm:rounded-[3rem] sm:p-3">
                <motion.div
                  animate={{ x: ["-120%", "135%"] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2.2,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-y-0 z-50 w-24 pointer-events-none rotate-12 bg-white/35 blur-md"
                />

                <div className="relative overflow-hidden rounded-[2rem] bg-[#2a170b] sm:rounded-[2.55rem]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(245,158,11,0.42),transparent_34%),radial-gradient(circle_at_90%_20%,rgba(16,185,129,0.20),transparent_28%),linear-gradient(145deg,#2b1609_0%,#4a250c_50%,#1c1008_100%)]" />
                  <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:34px_34px]" />

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

                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0], y: [0, -6, 0] }}
                        transition={{
                          duration: 4.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="flex h-13 w-13 items-center justify-center rounded-[1.25rem] bg-amber-100 text-[#2b1609] shadow-inner sm:h-16 sm:w-16 sm:rounded-[1.5rem]"
                      >
                        <ChefHat size={26} />
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-5 sm:gap-3">
                      {[
                        ["Open", "10 AM"],
                        ["Mood", "Warm"],
                        ["Table", "QR"],
                      ].map(([top, bottom]) => (
                        <motion.div
                          key={top}
                          whileHover={{ y: -4, scale: 1.03 }}
                          className="rounded-2xl border border-white/10 bg-white/10 p-2.5 backdrop-blur-xl sm:p-3"
                        >
                          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/45 sm:text-[10px]">
                            {top}
                          </p>
                          <p className="mt-1 text-xs font-black text-white sm:text-sm">
                            {bottom}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="relative rounded-t-[2rem] bg-[#fff7e8] px-4 pb-4 pt-5 text-stone-950 sm:rounded-t-[2.3rem] sm:px-5 sm:pb-5 sm:pt-6">
                    <div className="absolute left-1/2 top-12 h-36 w-[78%] -translate-x-1/2 rounded-full bg-amber-200/35 blur-3xl" />

                    <motion.div
                      whileHover={{ y: -8, scale: 1.015 }}
                      className="relative overflow-hidden rounded-[1.9rem] border border-amber-200/70 bg-white p-3.5 shadow-xl sm:rounded-[2.15rem] sm:p-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-[145px_1fr] sm:items-center">
                        <div className="relative h-[136px] overflow-hidden rounded-[1.55rem] bg-[radial-gradient(circle,#fff7cc_0%,#f59e0b_36%,#7c2d12_78%)] shadow-inner sm:h-36">
                          <motion.div
                            animate={{ rotate: 360, scale: [1, 1.04, 1] }}
                            transition={{
                              rotate: {
                                duration: 26,
                                repeat: Infinity,
                                ease: "linear",
                              },
                              scale: {
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              },
                            }}
                            className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[11px] border-white/90 bg-amber-100 text-5xl shadow-2xl"
                          >
                            🍝
                          </motion.div>

                          <motion.div
                            animate={{
                              y: [18, -18, 18],
                              opacity: [0, 0.55, 0],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute w-4 h-16 rounded-full left-8 top-10 bg-white/45 blur-md"
                          />
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
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -6 }}
                      className="relative mt-4 overflow-hidden rounded-[1.8rem] border border-dashed border-emerald-300 bg-emerald-50 p-4"
                    >
                      <motion.div
                        animate={{ x: ["-20%", "120%"] }}
                        transition={{
                          duration: 2.4,
                          repeat: Infinity,
                          repeatDelay: 1.8,
                          ease: "easeInOut",
                        }}
                        className="absolute top-0 w-16 h-full rotate-12 bg-white/60 blur-md"
                      />

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

                        <motion.div
                          animate={{
                            scale: [1, 1.08, 1],
                            rotate: [0, 2, -2, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="grid h-[72px] w-[72px] shrink-0 grid-cols-3 gap-1 rounded-2xl bg-stone-950 p-2.5 shadow-xl sm:h-20 sm:w-20 sm:p-3"
                        >
                          {[...Array(9)].map((_, i) => (
                            <motion.span
                              key={i}
                              animate={{
                                opacity:
                                  i % 2 === 0 ? [1, 0.45, 1] : [0.45, 1, 0.45],
                              }}
                              transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                delay: i * 0.07,
                              }}
                              className={`rounded-[4px] ${
                                i % 2 === 0 ? "bg-white" : "bg-amber-300"
                              }`}
                            />
                          ))}
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            style={{ opacity: scrollHintOpacity }}
            className="absolute z-20 flex-col items-center hidden gap-2 -translate-x-1/2 bottom-8 left-1/2 lg:flex"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-stone-700">
              scroll
            </span>
            <motion.div
              animate={{ y: [0, 9, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-8 w-[1px] bg-gradient-to-b from-stone-700 to-transparent"
            />
          </motion.div>
        </section>

        {/* MOMENTS */}
        <section className="relative overflow-hidden bg-[#fffaf1] px-4 py-20 sm:px-6 lg:py-28">
          <div className="absolute inset-0 whc-grid opacity-60" />
          <div className="whc-orb left-[-140px] top-16 h-[360px] w-[360px] bg-[#e7c474]/22" />
          <div className="whc-orb bottom-[-140px] right-[-120px] h-[430px] w-[430px] bg-[#d97706]/10" />

          <div className="relative max-w-6xl mx-auto">
            <Reveal>
              <div className="max-w-4xl mx-auto text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#8f561a]">
                  More than a place to eat
                </p>

                <SplitHeading className="whc-display mt-4 text-[clamp(2.5rem,6vw,5.4rem)] font-[520] leading-[0.92] tracking-[-0.06em] text-[#3d2412]">
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
                <Reveal key={item.title} delay={index * 0.08}>
                  <TiltCard className="h-full rounded-[2rem] border border-[#eadfcd] bg-white/78 p-6 shadow-[0_18px_50px_rgba(61,36,18,0.08)] backdrop-blur-xl">
                    <div style={{ transform: "translateZ(28px)" }}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3d2412] text-[#e7c474]">
                        {item.icon}
                      </div>

                      <h3 className="whc-display mt-6 text-2xl font-semibold tracking-[-0.03em] text-[#3d2412]">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-sm font-semibold leading-7 text-[#3d2412]/58">
                        {item.text}
                      </p>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* JOURNEY */}
        <section
          ref={journeyRef}
          className="relative overflow-hidden bg-[#120d08] px-4 py-20 text-[#fffaf1] sm:px-6 lg:py-24"
        >
          <motion.div
            style={{ x: journeyGlowX }}
            className="absolute left-1/2 top-24 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#e7c474]/14 blur-3xl"
          />

          <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(255,250,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,250,241,0.05)_1px,transparent_1px)] bg-[size:58px_58px]" />

          <div className="relative max-w-6xl mx-auto">
            <Reveal>
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#e7c474]">
                  The table journey
                </p>

                <h2 className="whc-display mt-4 text-[clamp(2.45rem,5vw,5rem)] font-[540] leading-[0.93] tracking-[-0.06em] text-[#fffaf1]">
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
              <motion.div
                style={{ height: timelineHeight }}
                className="absolute left-1/2 top-0 hidden w-px -translate-x-1/2 rounded-full bg-gradient-to-b from-[#e7c474] via-[#d97706] to-transparent lg:block"
              />

              <div className="grid gap-6 lg:grid-cols-4">
                {JOURNEY.map((step, index) => (
                  <Reveal key={step.no} delay={index * 0.08}>
                    <TiltCard
                      className={`relative h-full rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.20)] backdrop-blur-xl ${
                        index % 2 === 1 ? "lg:mt-14" : ""
                      }`}
                    >
                      <div style={{ transform: "translateZ(24px)" }}>
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
                      </div>

                      <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[#e7c474]/50 to-transparent" />
                    </TiltCard>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={0.12}>
              <div className="mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
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

        <MarqueeStrip />

        {/* MENU */}
        <section
          ref={menuRef}
          className="relative overflow-hidden bg-[#f5f0e8] px-4 py-20 sm:px-6 lg:py-28"
        >
          <div className="absolute inset-0 whc-grid opacity-70" />
          <div className="whc-orb left-[-130px] top-16 h-[360px] w-[360px] bg-[#d97706]/12" />
          <div className="whc-orb bottom-[-110px] right-[-100px] h-[460px] w-[460px] bg-[#e7c474]/22" />

          <div className="relative max-w-6xl mx-auto">
            <Reveal>
              <div className="flex flex-col gap-6 mb-12 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#8f561a]">
                    Café favourites
                  </p>

                  <SplitHeading className="whc-display mt-4 text-[clamp(2.5rem,5.5vw,5rem)] font-[520] leading-[0.92] tracking-[-0.06em] text-[#3d2412]">
                    Golden bites, warm coffee.
                  </SplitHeading>
                </div>

                <button onClick={handleExplore} className="whc-btn">
                  <span>Open Full Menu</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </Reveal>

            <motion.div
              style={{ y: menuFloat, rotate: menuRotate }}
              className="whc-menu-strip"
            >
              {SPECIALS.map((dish, index) => (
                <div className="h-full whc-menu-item" key={dish.name}>
                  <Reveal delay={index * 0.06} className="h-full">
                    <DishCard dish={dish} />
                  </Reveal>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* EDITORIAL */}
        <section
          ref={editorialRef}
          className="relative overflow-hidden bg-[#fffaf1] px-4 py-20 sm:px-6 lg:py-28"
        >
          <motion.div
            style={{ left: editorialGlowX }}
            className="absolute top-20 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#e7c474]/18 blur-3xl"
          />

          <div className="relative max-w-6xl mx-auto">
            <Reveal>
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#8f561a]">
                  The feeling
                </p>

                <SplitHeading className="whc-display mt-4 text-[clamp(2.5rem,5.5vw,5rem)] font-[520] leading-[0.92] tracking-[-0.06em] text-[#3d2412]">
                  Designed for the moments between meals.
                </SplitHeading>
              </div>
            </Reveal>

            <div className="grid gap-5 mt-14 lg:grid-cols-12">
              <Reveal className="lg:col-span-7">
                <TiltCard className="relative min-h-[350px] overflow-hidden rounded-[2.4rem] border border-[#eadfcd] bg-[#120d08] p-7 text-[#fffaf1] shadow-[0_28px_80px_rgba(61,36,18,0.14)]">
                  <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#e7c474]/14 blur-3xl" />
                  <div className="absolute -bottom-24 left-12 h-72 w-72 rounded-full bg-[#d97706]/12 blur-3xl" />

                  <div
                    style={{ transform: "translateZ(28px)" }}
                    className="relative"
                  >
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
                </TiltCard>
              </Reveal>

              <Reveal delay={0.08} className="lg:col-span-5">
                <TiltCard className="relative h-full overflow-hidden rounded-[2.4rem] border border-[#eadfcd] bg-white/80 p-7 shadow-[0_24px_70px_rgba(61,36,18,0.10)] backdrop-blur-xl">
                  <motion.p
                    style={{ y: editorialNumberY }}
                    className="pointer-events-none absolute -right-3 top-2 whc-display text-[9rem] font-[520] leading-none tracking-[-0.1em] text-[#e7c474]/24 sm:text-[11rem]"
                  >
                    01
                  </motion.p>

                  <div
                    style={{ transform: "translateZ(28px)" }}
                    className="relative z-10"
                  >
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
                </TiltCard>
              </Reveal>

              <Reveal delay={0.12} className="lg:col-span-4">
                <MiniBento
                  icon={<Leaf size={23} />}
                  title="Fresh & simple"
                  text="Clean menu, warm food and less confusion at the table."
                />
              </Reveal>

              <Reveal delay={0.16} className="lg:col-span-4">
                <MiniBento
                  icon={<ChefHat size={23} />}
                  title="Kitchen friendly"
                  text="Orders reach the kitchen clearly with item notes."
                />
              </Reveal>

              <Reveal delay={0.2} className="lg:col-span-4">
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
          <div className="whc-orb left-1/2 top-[-160px] h-[520px] w-[520px] -translate-x-1/2 bg-[#e7c474]/16" />

          <Reveal>
            <div className="relative max-w-4xl mx-auto">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#e7c474]/25 bg-white/[0.07] text-[#e7c474]">
                <MapPin size={28} />
              </div>

              <h2 className="whc-display text-[clamp(2.8rem,6vw,5.8rem)] font-[540] leading-[0.9] tracking-[-0.065em] text-[#fffaf1]">
                Your table is
                <span className="block italic whc-gold-text">
                  already waiting.
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-xl text-base font-semibold leading-8 text-[#fffaf1]/58">
                Come in, sit down, scan the QR and let The White House Café take
                care of the rest.
              </p>

              <div className="flex flex-col items-center justify-center gap-3 mt-9 sm:flex-row">
                <button onClick={handleExplore} className="whc-btn">
                  <span>Explore Menu</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => navigate("/scan")}
                  className="whc-ghost-btn whc-dark-ghost"
                >
                  <QrCode size={18} />
                  Scan QR
                </button>
              </div>
            </div>
          </Reveal>
        </section>

        <footer className="border-t border-white/10 bg-[#120d08] px-4 py-8 text-center sm:px-6">
          <p className="whc-display text-lg italic text-[#fffaf1]/35">
            © 2026 The White House Café · Crafted with warmth
          </p>
        </footer>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   SUB COMPONENTS
───────────────────────────────────────────── */

function MarqueeStrip() {
  const items = [
    "Fresh Coffee",
    "QR Table Ordering",
    "Warm Snacks",
    "Cozy Seating",
    "Golden Café Mood",
    "Friends & Family",
    "Evening Bites",
    "The White House Café",
  ];

  return (
    <section className="overflow-hidden border-y border-[#eadfcd] bg-[#fffaf1] py-4">
      <div
        className="flex gap-10 whitespace-nowrap"
        style={{
          width: "max-content",
          animation: "whc-marquee 28s linear infinite",
        }}
      >
        {[...items, ...items].map((item, index) => (
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
  );
}

function DishCard({ dish }) {
  return (
    <TiltCard className="whc-menu-card relative flex h-[390px] flex-col overflow-hidden rounded-[2rem] border border-[#eadfcd] bg-[#fffaf1]/90 p-6 text-center shadow-[0_22px_60px_rgba(61,36,18,0.11)] backdrop-blur-xl sm:h-full">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#e7c474]/24 blur-2xl" />

      <div
        style={{ transform: "translateZ(28px)" }}
        className="absolute left-5 top-5 rounded-full bg-[#3d2412] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#e7c474]"
      >
        {dish.tag}
      </div>

      <div
        style={{ transform: "translateZ(34px)" }}
        className="whc-menu-emoji relative mx-auto mb-5 mt-8 flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-[#eadfcd] bg-white text-5xl shadow-[0_18px_45px_rgba(61,36,18,0.08)]"
      >
        {dish.emoji}
      </div>

      <div
        style={{ transform: "translateZ(24px)" }}
        className="flex flex-col flex-1"
      >
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
    </TiltCard>
  );
}

function MiniBento({ icon, title, text }) {
  return (
    <TiltCard className="h-full rounded-[2rem] border border-[#eadfcd] bg-white/80 p-6 shadow-[0_20px_55px_rgba(61,36,18,0.08)] backdrop-blur-xl">
      <div style={{ transform: "translateZ(26px)" }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3d2412] text-[#e7c474]">
          {icon}
        </div>

        <h3 className="whc-display mt-8 text-3xl font-semibold tracking-[-0.045em] text-[#3d2412]">
          {title}
        </h3>

        <p className="mt-4 text-sm font-semibold leading-7 text-[#3d2412]/58">
          {text}
        </p>
      </div>
    </TiltCard>
  );
}

export default Home;
