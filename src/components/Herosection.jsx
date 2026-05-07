/**
 * WHITE HOUSE CAFÉ — HERO SECTION
 *
 * Drop-in replacement for your existing <section ref={heroRef}…> block.
 * Paste this file and import/use <HeroSection /> inside your Home.jsx,
 * passing the same props your original used (loaded, handleExplore, navigate).
 *
 * Dependencies (already in your project):
 *   framer-motion, lucide-react
 *
 * Images: Unsplash CDN (no API key needed)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { ArrowUpRight, ScanLine, Sparkles } from "lucide-react";

/* ─── Image URLs ─── */
const IMG = {
  bg: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1800&q=85&auto=format&fit=crop",
  coffee:
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80&auto=format&fit=crop",
  pastry:
    "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80&auto=format&fit=crop",
  pizza:
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80&auto=format&fit=crop",
  burger:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80&auto=format&fit=crop",
  interior:
    "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80&auto=format&fit=crop",
};

/* ─── Menu cycling inside card ─── */
const CARD_ITEMS = [
  {
    img: IMG.coffee,
    name: "Signature Cold Coffee",
    price: "₹50",
    tag: "Most Loved",
  },
  {
    img: IMG.pizza,
    name: "Golden Cheese Pizza",
    price: "₹188",
    tag: "Chef's Pick",
  },
  { img: IMG.burger, name: "House Café Burger", price: "₹100", tag: "Popular" },
  {
    img: IMG.pastry,
    name: "Flaky Golden Patties",
    price: "₹50",
    tag: "Bakery Fresh",
  },
];

/* ═══════════════════════════════════════════
   HERO SECTION — main export
═══════════════════════════════════════════ */
export function HeroSection({ loaded, handleExplore, navigate }) {
  const sectionRef = useRef(null);

  /* ── Mouse parallax ── */
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 60, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 60, damping: 20 });

  const handleMouseMove = useCallback(
    (e) => {
      if (!sectionRef.current) return;
      const { left, top, width, height } =
        sectionRef.current.getBoundingClientRect();
      rawX.set(((e.clientX - left) / width - 0.5) * 28);
      rawY.set(((e.clientY - top) / height - 0.5) * 18);
    },
    [rawX, rawY],
  );

  /* ── Scroll fade ── */
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const heroOpacity = Math.max(0, 1 - scrollY / 480);
  const heroBgParallax = scrollY * 0.38;
  const heroTextDrift = scrollY * 0.16;

  /* ── Card active item cycling ── */
  const [activeItem, setActiveItem] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setActiveItem((p) => (p + 1) % CARD_ITEMS.length),
      3200,
    );
    return () => clearInterval(t);
  }, []);

  /* ── Scroll progress ── */
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const h = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      <style>{HERO_CSS}</style>

      {/* ── Scroll progress bar ── */}
      <div className="whc-prog">
        <div style={{ width: `${progress * 100}%` }} />
      </div>

      <section
        ref={sectionRef}
        onMouseMove={handleMouseMove}
        className="whc-hero"
        style={{ opacity: heroOpacity }}
      >
        {/* ── Background image (parallax) ── */}
        <div
          className="whc-hero-bg"
          style={{ transform: `translateY(${heroBgParallax}px) scale(1.1)` }}
        >
          <img
            src={IMG.bg}
            alt=""
            aria-hidden="true"
            className="whc-hero-bg-img"
          />
          <div className="whc-hero-bg-overlay" />
        </div>

        {/* ── Noise grain ── */}
        <div className="whc-noise" aria-hidden="true" />

        {/* ── Art-deco grid lines (mouse parallax) ── */}
        <motion.div
          className="whc-lines"
          style={{
            x: useTransform(springX, (v) => v * 0.2),
            y: useTransform(springY, (v) => v * 0.1),
          }}
          aria-hidden="true"
        >
          {[12, 29, 50, 71, 88].map((l) => (
            <div key={l} className="whc-vline" style={{ left: `${l}%` }} />
          ))}
          {[22, 55, 78].map((t) => (
            <div key={t} className="whc-hline" style={{ top: `${t}%` }} />
          ))}
        </motion.div>

        {/* ── Corner brackets ── */}
        <div className="whc-corner whc-c-tl" aria-hidden="true" />
        <div className="whc-corner whc-c-tr" aria-hidden="true" />
        <div className="whc-corner whc-c-bl" aria-hidden="true" />
        <div className="whc-corner whc-c-br" aria-hidden="true" />

        {/* ── Floating orbs (mouse parallax) ── */}
        <motion.div
          className="whc-orb whc-orb-1"
          style={{
            x: useTransform(springX, (v) => v * -0.6),
            y: useTransform(springY, (v) => v * -0.4),
          }}
          aria-hidden="true"
        />
        <motion.div
          className="whc-orb whc-orb-2"
          style={{
            x: useTransform(springX, (v) => v * 0.8),
            y: useTransform(springY, (v) => v * 0.5),
          }}
          aria-hidden="true"
        />

        {/* ── Vertical side stamp ── */}
        <div className="whc-side-stamp" aria-hidden="true">
          EST. 2024 · JAIPUR · CAFÉ
        </div>

        {/* ─────────────────────────────────
            MAIN CONTENT GRID
        ───────────────────────────────── */}
        <div
          className="whc-hero-content"
          style={{ transform: `translateY(${-heroTextDrift}px)` }}
        >
          <div className="whc-grid">
            {/* ── LEFT COL ── */}
            <div className="whc-left">
              {/* Badge */}
              <motion.div
                className="whc-badge"
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={
                  loaded ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}
                }
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.15,
                }}
              >
                <span className="whc-badge-dot" />
                <span>Premium café · Jaipur · QR table ordering</span>
                <motion.span
                  className="whc-badge-spark"
                  animate={{ rotate: [0, 180, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={11} />
                </motion.span>
              </motion.div>

              {/* Heading — giant editorial stack */}
              <div className="whc-heading-wrap">
                {["The", "White", "House", "Café"].map((word, wi) => (
                  <motion.span
                    key={word}
                    className={`whc-h-word whc-h-${word.toLowerCase()}`}
                    initial={{ opacity: 0, y: 60, filter: "blur(14px)" }}
                    animate={
                      loaded ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}
                    }
                    transition={{
                      duration: 1,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.28 + wi * 0.1,
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>

              {/* Tagline */}
              <motion.p
                className="whc-tagline"
                initial={{ opacity: 0, y: 24 }}
                animate={loaded ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.85,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.72,
                }}
              >
                A warm premium café for coffee, comfort food,
                <br className="whc-tagline-br" />
                conversations and slow golden evenings.
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="whc-ctas"
                initial={{ opacity: 0, y: 24 }}
                animate={loaded ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.88,
                }}
              >
                <motion.button
                  className="whc-btn-primary"
                  onClick={handleExplore}
                  whileHover={{
                    y: -4,
                    boxShadow: "0 24px 60px rgba(184,131,42,.45)",
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>Explore Menu</span>
                  <ArrowUpRight size={17} />
                </motion.button>

                <motion.button
                  className="whc-btn-ghost"
                  onClick={() => navigate?.("/scan")}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ScanLine size={17} />
                  <span>Scan Table QR</span>
                </motion.button>
              </motion.div>

              {/* Stats row */}
              <motion.div
                className="whc-stats"
                initial={{ opacity: 0 }}
                animate={loaded ? { opacity: 1 } : {}}
                transition={{ duration: 0.9, delay: 1.05 }}
              >
                {[
                  { v: "4.9★", l: "Google Rating" },
                  { v: "50+", l: "Menu Items" },
                  { v: "₹50", l: "Starts From" },
                  { v: "QR", l: "Table Order" },
                ].map((s) => (
                  <div key={s.l} className="whc-stat">
                    <span className="whc-stat-val">{s.v}</span>
                    <span className="whc-stat-lbl">{s.l}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── RIGHT COL — ORDER CARD ── */}
            <motion.div
              className="whc-right"
              initial={{ opacity: 0, x: 60, rotateY: -12 }}
              animate={loaded ? { opacity: 1, x: 0, rotateY: 0 } : {}}
              transition={{
                duration: 1.1,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.35,
              }}
              style={{
                rotateX: useTransform(springY, (v) => -v * 0.4),
                rotateY: useTransform(springX, (v) => v * 0.45),
              }}
            >
              <LiveOrderCard activeItem={activeItem} />
            </motion.div>
          </div>
          {/* /whc-grid */}
        </div>
        {/* /whc-hero-content */}

        {/* ── Scroll cue ── */}
        <div className="whc-scroll-cue" aria-hidden="true">
          <motion.div
            className="whc-scroll-line"
            animate={{
              scaleY: [0, 1, 1, 0],
              originY: ["0%", "0%", "100%", "100%"],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span>SCROLL</span>
        </div>
      </section>
    </>
  );
}

/* ═══════════════════════════════════════════
   LIVE ORDER CARD
═══════════════════════════════════════════ */
function LiveOrderCard({ activeItem }) {
  const item = CARD_ITEMS[activeItem];

  /* QR pulse rings */
  const [rings, setRings] = useState([]);
  useEffect(() => {
    const t = setInterval(() => {
      setRings((r) => [...r.slice(-2), Date.now()]);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="card-outer">
      {/* Ambient glow behind card */}
      <div className="card-glow" aria-hidden="true" />

      {/* Steam wisps */}
      <div className="card-steam" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="steam-wisp"
            style={{ left: `${30 + i * 20}%` }}
            animate={{
              y: [-10, -70],
              opacity: [0, 0.6, 0],
              scaleX: [0.8, 1.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.55,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Main card surface */}
      <div className="card-surface">
        {/* ── Card Header (dark band) ── */}
        <div className="card-header">
          <div className="card-header-left">
            <p className="card-eyebrow">THE WHITE HOUSE</p>
            <h3 className="card-title">Table Order</h3>
          </div>
          <motion.div
            className="card-header-icon"
            animate={{ rotate: [0, 6, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            ☕
            <motion.div
              className="card-icon-ring"
              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </motion.div>
        </div>

        {/* ── Live dish showcase ── */}
        <div className="card-dish-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem}
              className="card-dish-wrap"
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="card-dish-img-wrap">
                <img src={item.img} alt={item.name} className="card-dish-img" />
                <div className="card-dish-img-overlay" />
                <span className="card-dish-tag">{item.tag}</span>
              </div>
              <div className="card-dish-meta">
                <p className="card-dish-name">{item.name}</p>
                <p className="card-dish-price">{item.price}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dot pagination */}
          <div className="card-dots" aria-hidden="true">
            {CARD_ITEMS.map((_, i) => (
              <div
                key={i}
                className={`card-dot ${i === activeItem ? "card-dot-active" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* ── Mini order list ── */}
        <div className="card-list">
          {CARD_ITEMS.slice(0, 3).map((it, i) => (
            <motion.div
              key={it.name}
              className={`card-list-item ${i === activeItem ? "card-list-item-active" : ""}`}
              layout
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={it.img} alt={it.name} className="card-list-thumb" />
              <span className="card-list-name">{it.name}</span>
              <span className="card-list-price">{it.price}</span>
            </motion.div>
          ))}
        </div>

        {/* ── QR order bar ── */}
        <div className="card-qr-row">
          <div className="card-qr-text">
            <p className="card-qr-eyebrow">Smart table ordering</p>
            <p className="card-qr-heading">Scan · Browse · Order</p>
          </div>
          <div className="card-qr-box" aria-label="QR code">
            {/* QR pulse rings */}
            <AnimatePresence>
              {rings.map((id) => (
                <motion.div
                  key={id}
                  className="qr-ring"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                />
              ))}
            </AnimatePresence>
            {/* QR visual */}
            <div className="qr-grid" aria-hidden="true">
              {Array.from({ length: 25 }).map((_, i) => {
                const corners = [
                  0, 1, 2, 5, 6, 10, 11, 12, 14, 18, 19, 20, 22, 23, 24,
                ];
                return (
                  <div
                    key={i}
                    className={`qr-cell ${corners.includes(i) ? "qr-cell-on" : "qr-cell-off"}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Order button ── */}
        <motion.button
          className="card-order-btn"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Add to Table Order</span>
          <ArrowUpRight size={16} />
        </motion.button>
      </div>
      {/* /card-surface */}
    </div>
  );
}

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const HERO_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@300;400;500;600;700&display=swap');

/* ── Progress bar ── */
.whc-prog {
  position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 1001;
  background: rgba(184,131,42,.15);
}
.whc-prog > div {
  height: 100%;
  background: linear-gradient(90deg, #7c4a10, #e8c472, #c07820);
  transition: width .12s linear;
}

/* ── Hero container ── */
.whc-hero {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  display: flex;
  align-items: center;
  font-family: 'Outfit', system-ui, sans-serif;
  will-change: opacity;
}

/* ── Background ── */
.whc-hero-bg {
  position: absolute; inset: -10% 0;
  will-change: transform;
  z-index: 0;
}
.whc-hero-bg-img {
  width: 100%; height: 110%; object-fit: cover; object-position: center 30%;
  display: block;
}
.whc-hero-bg-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    135deg,
    rgba(8,4,2,.82) 0%,
    rgba(18,10,4,.72) 38%,
    rgba(30,15,6,.78) 65%,
    rgba(10,5,2,.88) 100%
  );
}

/* ── Noise grain ── */
.whc-noise {
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  opacity: .26; mix-blend-mode: screen;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.68' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E");
  background-size: 200px;
}

/* ── Grid lines ── */
.whc-lines { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
.whc-vline {
  position: absolute; top: 0; bottom: 0; width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(184,131,42,.14) 25%, rgba(184,131,42,.08) 75%, transparent);
}
.whc-hline {
  position: absolute; left: 0; right: 0; height: 1px;
  background: linear-gradient(to right, transparent, rgba(184,131,42,.1) 25%, rgba(184,131,42,.06) 75%, transparent);
}

/* ── Corner brackets ── */
.whc-corner {
  position: absolute; width: 32px; height: 32px;
  z-index: 10; pointer-events: none;
}
.whc-c-tl { top: 20px; left: 20px; border-top: 1.5px solid rgba(184,131,42,.5); border-left: 1.5px solid rgba(184,131,42,.5); }
.whc-c-tr { top: 20px; right: 20px; border-top: 1.5px solid rgba(184,131,42,.5); border-right: 1.5px solid rgba(184,131,42,.5); }
.whc-c-bl { bottom: 20px; left: 20px; border-bottom: 1.5px solid rgba(184,131,42,.5); border-left: 1.5px solid rgba(184,131,42,.5); }
.whc-c-br { bottom: 20px; right: 20px; border-bottom: 1.5px solid rgba(184,131,42,.5); border-right: 1.5px solid rgba(184,131,42,.5); }

/* ── Orbs ── */
.whc-orb {
  position: absolute; border-radius: 50%; pointer-events: none;
  filter: blur(70px);
}
.whc-orb-1 {
  width: 460px; height: 460px;
  background: rgba(180,110,20,.13);
  top: -100px; right: -80px;
}
.whc-orb-2 {
  width: 380px; height: 380px;
  background: rgba(120,70,10,.1);
  bottom: -80px; left: -60px;
}

/* ── Side stamp ── */
.whc-side-stamp {
  position: absolute;
  right: 22px; top: 50%;
  transform: translateY(-50%) rotate(90deg);
  transform-origin: center;
  font-size: .58rem; font-weight: 600; letter-spacing: .38em; text-transform: uppercase;
  color: rgba(255,245,220,.28); z-index: 12; pointer-events: none; white-space: nowrap;
}
@media (max-width: 900px) { .whc-side-stamp { display: none; } }

/* ── Content wrapper ── */
.whc-hero-content {
  position: relative; z-index: 10;
  width: 100%;
  padding: clamp(5rem, 10vh, 7rem) clamp(1.25rem, 5vw, 3.5rem) clamp(4rem, 8vh, 6rem);
  max-width: 1440px; margin: 0 auto;
  will-change: transform;
}

/* ── Two-column grid ── */
.whc-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: center;
}
@media (min-width: 1024px) {
  .whc-grid {
    grid-template-columns: 1.1fr 0.9fr;
    gap: 4rem;
  }
}

/* ── LEFT COL ── */
.whc-left { display: flex; flex-direction: column; gap: 0; }

.whc-badge {
  display: inline-flex; align-items: center; gap: .6rem;
  padding: .45rem .9rem .45rem .6rem;
  border-radius: 999px;
  border: 1px solid rgba(184,131,42,.32);
  background: rgba(255,245,220,.07); backdrop-filter: blur(12px);
  font-size: .66rem; font-weight: 600; letter-spacing: .16em; text-transform: uppercase;
  color: rgba(255,245,220,.7); margin-bottom: 1.6rem;
  width: fit-content;
}
.whc-badge-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #d97706; flex-shrink: 0;
  box-shadow: 0 0 0 0 rgba(217,119,6,.4);
  animation: whc-pulse 2s ease-in-out infinite;
}
@keyframes whc-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(217,119,6,.4); }
  50%      { box-shadow: 0 0 0 7px rgba(217,119,6,0); }
}
.whc-badge-spark { color: rgba(232,196,114,.8); display: flex; }

/* ── Heading ── */
.whc-heading-wrap {
  display: flex;
  flex-direction: column;
  line-height: .86;
  letter-spacing: -.04em;
  margin-bottom: 1.75rem;
}
.whc-h-word {
  font-family: 'Cormorant Garamond', Georgia, serif;
  display: block;
}
.whc-h-the {
  font-size: clamp(1.8rem, 4.5vw, 4rem);
  font-weight: 400; font-style: italic;
  color: rgba(255,245,220,.55);
}
.whc-h-white {
  font-size: clamp(4.5rem, 13vw, 11.5rem);
  font-weight: 600;
  color: rgba(255,245,220,.96);
  line-height: .82;
}
.whc-h-house {
  font-size: clamp(4.5rem, 13vw, 11.5rem);
  font-weight: 600;
  color: rgba(255,245,220,.96);
  line-height: .82;
}
.whc-h-cafe {
  font-size: clamp(2rem, 5vw, 4.5rem);
  font-weight: 500; font-style: italic;
  background: linear-gradient(110deg, #8f561a 0%, #e8c472 35%, #c07820 65%, #f6dea0 100%);
  background-size: 260% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: whc-shimmer 5s linear infinite;
  margin-top: .6rem;
}
@keyframes whc-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}

/* ── Tagline ── */
.whc-tagline {
  font-size: clamp(.95rem, 1.8vw, 1.1rem);
  font-weight: 300; line-height: 1.85;
  color: rgba(255,245,220,.55);
  max-width: 480px; margin-bottom: 2rem;
}
.whc-tagline-br { display: none; }
@media (min-width: 640px) { .whc-tagline-br { display: block; } }

/* ── CTAs ── */
.whc-ctas { display: flex; flex-wrap: wrap; gap: .85rem; margin-bottom: 2.5rem; }

.whc-btn-primary {
  display: inline-flex; align-items: center; gap: .6rem;
  padding: .9rem 1.8rem; border-radius: 999px; border: none;
  background: linear-gradient(120deg, #4a2006, #b8832a);
  color: #fff8e8;
  font-family: 'Outfit', sans-serif; font-size: .82rem; font-weight: 600; letter-spacing: .06em;
  cursor: pointer; position: relative; overflow: hidden;
  box-shadow: 0 10px 36px rgba(184,131,42,.28);
  transition: box-shadow .3s;
}
.whc-btn-primary::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,245,200,.22), transparent);
  transform: translateX(-120%); transition: transform .8s ease;
}
.whc-btn-primary:hover::after { transform: translateX(120%); }

.whc-btn-ghost {
  display: inline-flex; align-items: center; gap: .55rem;
  padding: .9rem 1.5rem; border-radius: 999px;
  border: 1px solid rgba(255,245,220,.22);
  background: rgba(255,245,220,.07); backdrop-filter: blur(12px);
  color: rgba(255,245,220,.82);
  font-family: 'Outfit', sans-serif; font-size: .82rem; font-weight: 600;
  cursor: pointer; transition: border-color .3s, background .3s;
}
.whc-btn-ghost:hover { border-color: rgba(184,131,42,.5); background: rgba(255,245,220,.12); }

/* ── Stats ── */
.whc-stats {
  display: flex; flex-wrap: wrap; gap: 1.5rem 2.5rem;
  padding-top: 1.75rem;
  border-top: 1px solid rgba(255,245,220,.1);
}
.whc-stat { display: flex; flex-direction: column; }
.whc-stat-val {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.55rem; font-weight: 500;
  color: rgba(232,196,114,.95);
  line-height: 1;
}
.whc-stat-lbl {
  font-size: .62rem; font-weight: 600; letter-spacing: .18em; text-transform: uppercase;
  color: rgba(255,245,220,.32); margin-top: .25rem;
}

/* ── RIGHT COL ── */
.whc-right {
  perspective: 1000px;
  display: flex; justify-content: center;
}
@media (min-width: 1024px) { .whc-right { justify-content: flex-end; } }

/* ── Card outer ── */
.card-outer {
  position: relative;
  width: 100%; max-width: 420px;
}
.card-glow {
  position: absolute; inset: -30px;
  border-radius: 3rem;
  background: radial-gradient(circle at 50% 40%, rgba(184,131,42,.22), transparent 65%);
  filter: blur(24px); pointer-events: none; z-index: -1;
  animation: whc-glow-pulse 5s ease-in-out infinite;
}
@keyframes whc-glow-pulse {
  0%,100% { opacity: .7; transform: scale(1); }
  50%      { opacity: 1; transform: scale(1.06); }
}

/* ── Steam ── */
.card-steam {
  position: absolute; bottom: 80%; left: 50%;
  transform: translateX(-50%);
  width: 120px; height: 60px; pointer-events: none; z-index: 20;
}
.steam-wisp {
  position: absolute; bottom: 0;
  width: 3px; border-radius: 999px;
  background: rgba(255,245,220,.28);
  filter: blur(1px);
  height: 50px;
}

/* ── Card surface ── */
.card-surface {
  background: #0f0905;
  border-radius: 2.4rem;
  border: 1px solid rgba(255,245,220,.08);
  box-shadow:
    0 50px 120px rgba(0,0,0,.55),
    inset 0 1px 0 rgba(255,245,220,.07);
  overflow: hidden;
  animation: card-float 6s ease-in-out infinite;
}
@keyframes card-float {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}

/* ── Card header ── */
.card-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 1.5rem 1.5rem .75rem;
}
.card-eyebrow {
  font-size: .6rem; font-weight: 700; letter-spacing: .28em;
  color: rgba(232,196,114,.7); text-transform: uppercase;
  margin-bottom: .3rem;
}
.card-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.7rem; font-weight: 500; color: rgba(255,245,220,.95);
  line-height: 1;
}
.card-header-icon {
  position: relative; font-size: 1.8rem;
  width: 52px; height: 52px; border-radius: 14px;
  background: rgba(184,131,42,.12); border: 1px solid rgba(184,131,42,.2);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.card-icon-ring {
  position: absolute; inset: -6px; border-radius: 20px;
  border: 1px solid rgba(184,131,42,.4);
}

/* ── Dish area ── */
.card-dish-area {
  margin: 0 1rem;
  border-radius: 1.5rem; overflow: hidden;
  border: 1px solid rgba(255,245,220,.07);
  background: rgba(255,245,220,.03);
  position: relative;
}
.card-dish-wrap { display: flex; flex-direction: column; }
.card-dish-img-wrap {
  position: relative; height: 180px; overflow: hidden;
}
.card-dish-img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform .6s ease;
}
.card-dish-img-wrap:hover .card-dish-img { transform: scale(1.04); }
.card-dish-img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(8,4,2,.8) 0%, rgba(8,4,2,.15) 55%, transparent);
}
.card-dish-tag {
  position: absolute; top: .85rem; left: .85rem;
  padding: .28rem .7rem; border-radius: 999px;
  background: rgba(184,131,42,.85); backdrop-filter: blur(8px);
  font-size: .58rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
  color: #fff;
}
.card-dish-meta {
  display: flex; justify-content: space-between; align-items: center;
  padding: .85rem 1rem;
}
.card-dish-name {
  font-size: .9rem; font-weight: 600; color: rgba(255,245,220,.88);
}
.card-dish-price {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.3rem; font-weight: 500; color: rgba(232,196,114,.9);
}

/* ── Dot pagination ── */
.card-dots {
  display: flex; justify-content: center; gap: .45rem;
  padding: .3rem 0 .7rem;
}
.card-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: rgba(255,245,220,.18);
  transition: background .3s, width .3s;
}
.card-dot-active { width: 18px; border-radius: 999px; background: rgba(184,131,42,.8); }

/* ── Mini list ── */
.card-list {
  margin: 0 1rem;
  border-radius: 1.2rem;
  border: 1px solid rgba(255,245,220,.07);
  overflow: hidden; margin-bottom: .85rem;
}
.card-list-item {
  display: flex; align-items: center; gap: .75rem;
  padding: .65rem .85rem;
  border-bottom: 1px solid rgba(255,245,220,.05);
  transition: background .25s;
}
.card-list-item:last-child { border-bottom: none; }
.card-list-item-active { background: rgba(184,131,42,.1); }
.card-list-thumb {
  width: 36px; height: 36px; border-radius: .6rem;
  object-fit: cover; flex-shrink: 0;
}
.card-list-name {
  font-size: .8rem; font-weight: 500; color: rgba(255,245,220,.7); flex: 1;
}
.card-list-price {
  font-size: .82rem; font-weight: 600; color: rgba(232,196,114,.8); flex-shrink: 0;
}

/* ── QR row ── */
.card-qr-row {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  margin: 0 1rem .75rem;
  padding: .9rem 1rem;
  border-radius: 1.2rem;
  border: 1px dashed rgba(184,131,42,.3);
  background: rgba(184,131,42,.06);
}
.card-qr-eyebrow {
  font-size: .6rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
  color: rgba(184,131,42,.8); margin-bottom: .3rem;
}
.card-qr-heading {
  font-size: .88rem; font-weight: 600; color: rgba(255,245,220,.85);
}
.card-qr-box {
  width: 60px; height: 60px; border-radius: .85rem;
  background: rgba(255,245,220,.92); flex-shrink: 0;
  position: relative; display: flex; align-items: center; justify-content: center;
  overflow: visible;
}
.qr-ring {
  position: absolute; inset: -4px; border-radius: 1rem;
  border: 1.5px solid rgba(184,131,42,.6); pointer-events: none;
}
.qr-grid {
  display: grid; grid-template-columns: repeat(5,1fr); gap: 2px;
  padding: 6px; width: 100%; height: 100%;
}
.qr-cell { border-radius: 2px; }
.qr-cell-on  { background: #1a0e04; }
.qr-cell-off { background: rgba(26,14,4,.12); }

/* ── Order button ── */
.card-order-btn {
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  width: calc(100% - 2rem); margin: 0 1rem 1.25rem;
  padding: .85rem; border-radius: 1.1rem; border: none;
  background: linear-gradient(115deg, #4a2006, #b8832a);
  color: #fff8e8;
  font-family: 'Outfit', sans-serif; font-size: .82rem; font-weight: 600; letter-spacing: .04em;
  cursor: pointer; box-shadow: 0 8px 28px rgba(184,131,42,.25);
  transition: box-shadow .3s;
}
.card-order-btn:hover { box-shadow: 0 14px 40px rgba(184,131,42,.4); }

/* ── Scroll cue ── */
.whc-scroll-cue {
  position: absolute; bottom: 1.75rem; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: .45rem;
  z-index: 20;
}
.whc-scroll-cue span {
  font-size: .56rem; font-weight: 700; letter-spacing: .38em; text-transform: uppercase;
  color: rgba(255,245,220,.28);
}
.whc-scroll-line {
  width: 1px; height: 52px;
  background: linear-gradient(to bottom, rgba(184,131,42,.7), transparent);
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .card-dish-img-wrap { height: 150px; }
  .whc-h-white, .whc-h-house { font-size: clamp(3.5rem, 18vw, 5.5rem); }
  .card-surface { border-radius: 1.75rem; }
  .card-dish-area, .card-list, .card-qr-row { margin-left: .75rem; margin-right: .75rem; }
  .card-order-btn { width: calc(100% - 1.5rem); margin: 0 .75rem 1rem; }
  .card-header { padding: 1.25rem 1.25rem .6rem; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
}
`;
