import { useEffect, useMemo, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  ChefHat,
  Check,
  Clock3,
  Coffee,
  MenuSquare,
  Play,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Tags,
  TrendingUp,
  Utensils,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

function useCountUp(target, duration = 1300) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame;
    let startTime;
    const numericTarget = Number(target) || 0;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(numericTarget * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function StatPill({ icon, value, suffix = "", label }) {
  const count = useCountUp(value, 1350);

  return (
    <motion.div
      variants={fadeUp}
      className="flex min-w-0 flex-col items-center justify-center gap-3 border-b border-[#ead8c2] px-5 py-5 text-center last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:flex-row lg:gap-4 lg:px-6 lg:text-left"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#eadac4] bg-[#fff7eb] text-[#dd8505] shadow-[0_12px_24px_rgba(120,69,18,0.08)]">
        {icon}
      </div>

      <div className="min-w-0">
        <div className="font-display text-[1.55rem] font-black leading-none tracking-[-0.05em] text-[#2a1408]">
          {count}
          {suffix}
        </div>
        <div className="mt-1 text-[0.8rem] font-semibold leading-tight text-[#6b5947]">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

function DashboardPreview() {
  const cards = [
    { label: "Total Orders", value: "486", trend: "+12.5%" },
    { label: "Revenue", value: "₹12,840", trend: "+8.2%" },
    { label: "Active Tables", value: "24", trend: "+6.1%" },
    { label: "New Customers", value: "120", trend: "+15.3%" },
  ];

  const orders = [
    { table: "Table 5", text: "2 items", status: "Preparing" },
    { table: "Table 2", text: "4 items", status: "Ready" },
    { table: "Table 8", text: "3 items", status: "Preparing" },
    { table: "Table 1", text: "5 items", status: "New" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, rotate: -2.2, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, rotate: -2.2, scale: 1 }}
      transition={{ duration: 1.05, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-[min(47vw,735px)] origin-center translate-x-8 -translate-y-5 xl:translate-x-12"
    >
      <div className="absolute -inset-10 rounded-[3rem] bg-[#d98205]/25 blur-3xl" />

      <div className="relative overflow-hidden rounded-[2.15rem] border border-[#50341c] bg-[#0d0704] p-5 shadow-[0_58px_130px_rgba(28,12,3,0.66)] ring-1 ring-[#f2b44b]/18">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(238,150,16,0.18),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.075),transparent_25%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.04),transparent_43%)]" />

        <div className="relative flex items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d98205]/22 text-[#f0a21a]">
              <Utensils size={21} />
            </div>

            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.32em] text-[#f0a21a]">
                FoodDash
              </p>
              <h3 className="font-display mt-1 text-[1.55rem] font-black tracking-[-0.055em] text-[#fff5da]">
                Overview
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/14 bg-white/6 px-4 py-2 text-xs font-bold text-[#f3dfbf]">
              <CalendarDays size={13} /> Today, 24 May
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/14 bg-white/6 text-[#f3dfbf]">
              <Bell size={15} />
            </div>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-[0.66fr_1.58fr] gap-4">
          <aside className="rounded-[1.55rem] border border-white/8 bg-white/[0.03] p-4">
            {[
              "Overview",
              "Orders",
              "Menu",
              "Tables",
              "Kitchen",
              "Analytics",
              "Customers",
              "Settings",
            ].map((item, index) => (
              <div
                key={item}
                className={`mb-1.5 flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[0.78rem] font-black ${
                  index === 0
                    ? "bg-[#d98205]/24 text-[#f0a21a]"
                    : "text-[#b59774]"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" /> {item}
              </div>
            ))}
          </aside>

          <main>
            <div className="grid grid-cols-4 gap-3">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[1.35rem] border border-white/8 bg-white/[0.055] p-3.5"
                >
                  <p className="text-[0.6rem] font-extrabold leading-tight text-[#aa8a62]">
                    {card.label}
                  </p>
                  <h4 className="font-display mt-3 text-[1.18rem] font-black leading-none text-[#fff5da]">
                    {card.value}
                  </h4>
                  <p className="mt-2 text-[0.64rem] font-black text-[#f0a21a]">
                    ↑ {card.trend}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-[1.18fr_0.82fr] gap-4">
              <div className="rounded-[1.45rem] border border-white/8 bg-white/[0.055] p-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-[1.05rem] font-black text-[#fff5da]">
                    Revenue Overview
                  </h4>
                  <span className="rounded-full bg-white/7 px-3 py-1 text-xs font-bold text-[#b59774]">
                    Today
                  </span>
                </div>

                <div className="relative mt-6 h-32 overflow-hidden rounded-2xl bg-[#070403] p-4">
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[length:100%_32px]" />
                  <svg
                    className="relative w-full h-full"
                    viewBox="0 0 360 140"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M5 115 C45 105, 55 50, 88 65 C120 78, 122 35, 158 50 C195 65, 200 98, 236 72 C270 48, 282 62, 306 38 C328 16, 340 26, 355 12"
                      fill="none"
                      stroke="#f0a21a"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M5 115 C45 105, 55 50, 88 65 C120 78, 122 35, 158 50 C195 65, 200 98, 236 72 C270 48, 282 62, 306 38 C328 16, 340 26, 355 12 L355 140 L5 140 Z"
                      fill="url(#goldFadeHero)"
                    />
                    <defs>
                      <linearGradient
                        id="goldFadeHero"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#f0a21a"
                          stopOpacity="0.34"
                        />
                        <stop
                          offset="100%"
                          stopColor="#f0a21a"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <div className="rounded-[1.45rem] border border-white/8 bg-white/[0.055] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display text-[1.05rem] font-black text-[#fff5da]">
                    Live Orders
                  </h4>
                  <span className="text-xs font-black text-[#f0a21a]">
                    View All
                  </span>
                </div>

                <div className="space-y-2.5">
                  {orders.map((order, index) => (
                    <div
                      key={order.table}
                      className="flex items-center justify-between rounded-2xl bg-black/22 p-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#d98205]/22 text-xs font-black text-[#f0a21a]">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-[0.78rem] font-black text-[#fff5da]">
                            {order.table}
                          </p>
                          <p className="text-[0.68rem] font-semibold text-[#957750]">
                            {order.text}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[0.65rem] font-black ${
                          order.status === "Ready"
                            ? "text-emerald-400"
                            : "text-[#f0a21a]"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -10, 0], rotate: [6, 8, 6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-8 top-[49%] w-28 rotate-6 rounded-3xl border border-[#eda22b]/35 bg-[#100704] p-3 text-center shadow-[0_24px_48px_rgba(40,18,4,0.35)]"
      >
        <p className="text-[0.62rem] font-black text-[#f0a21a]">
          Scan to order
        </p>
        <div className="mt-2 flex aspect-square items-center justify-center rounded-2xl bg-[#fff6e6] text-[#1b0f07]">
          <QrCode size={58} strokeWidth={2.5} />
        </div>
        <p className="mt-2 text-xs font-black text-[#f0a21a]">Table 7</p>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0], rotate: [-8, -5, -8] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-8 -left-24 w-64 -rotate-6 rounded-[1.7rem] border border-white/14 bg-[#251407]/78 p-5 text-[#fff3d5] shadow-[0_24px_48px_rgba(40,18,4,0.32)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eda22b] text-[#2a1609]">
            <Bell size={18} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#eda22b]">
              New Order
            </p>
            <p className="text-xl font-black font-display">Table 7</p>
          </div>
        </div>
        <p className="text-sm font-semibold text-[#c6a985]">
          3 items received in kitchen
        </p>
      </motion.div>
    </motion.div>
  );
}

function MobileHeroIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 34, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 mx-auto mt-10 w-full max-w-[360px] md:mt-0 md:max-w-[330px] lg:hidden"
    >
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 1.2, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative overflow-hidden rounded-[2.1rem] border border-white/80 bg-white/28 p-2 shadow-[0_28px_70px_rgba(86,45,12,0.20)] backdrop-blur-sm"
      >
        <div className="pointer-events-none absolute inset-0 rounded-[2.1rem] bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.94),transparent_34%),linear-gradient(135deg,rgba(240,162,26,0.15),transparent_42%)]" />
        <img
          src="/qzora-flat-vector1.png"
          alt="Qzora QR restaurant ordering illustration"
          className="relative z-10 h-auto w-full object-contain drop-shadow-[0_20px_35px_rgba(61,31,11,0.16)]"
          loading="eager"
          decoding="async"
        />
      </motion.div>
    </motion.div>
  );
}

function FlyingHeroTitle() {
  const words = [
    {
      text: "Your",
      className: "text-[#2a1408]",
      from: { x: -90, y: 22, rotate: -5 },
    },
    {
      text: "Restaurant.",
      className: "text-[#2a1408]",
      from: { x: 90, y: 28, rotate: 4 },
    },
    {
      text: "Smarter",
      className: "text-[#e99411]",
      from: { x: -70, y: -30, rotate: 3 },
    },
    {
      text: "Ordering.",
      className: "text-[#2a1408]",
      from: { x: 80, y: -22, rotate: -4 },
    },
  ];

  return (
    <h1 className="font-display max-w-[15.75ch] text-[clamp(3.25rem,4.55vw,5.2rem)] font-black leading-[1.02] tracking-[-0.075em] text-[#2a1408] drop-shadow-[0_12px_34px_rgba(74,37,9,0.08)] max-sm:max-w-[9ch] max-sm:text-[3.1rem]">
      {words.map((word, index) => (
        <motion.span
          key={word.text}
          initial={{ opacity: 0, filter: "blur(10px)", ...word.from }}
          animate={{ opacity: 1, x: 0, y: 0, rotate: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.95,
            delay: 0.18 + index * 0.13,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`mr-[0.18em] inline-block will-change-transform ${word.className}`}
        >
          {word.text}
        </motion.span>
      ))}
    </h1>
  );
}

function HeroSection() {
  return (
    <section className="font-body relative min-h-[calc(100svh-90px)] overflow-hidden bg-black text-[#2a1408]">
      <div
        className="absolute inset-0 bg-center bg-cover opacity-100"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=2400&q=85')",
        }}
      />

      <div
        className="absolute inset-0 bg-[linear-gradient(
90deg,
rgba(247,239,228,0.65)_0%,
rgba(247,239,228,0.48)_34%,
rgba(247,239,228,0.12)_58%,
rgba(37,18,7,0.55)_100%
)]"
      />

      <div className="absolute hidden w-64 h-64 rounded-full pointer-events-none -bottom-12 -left-16 bg-emerald-900/24 blur-3xl lg:block" />

      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.1 }}
        className="relative z-10 mx-auto grid min-h-[calc(100svh-90px)] w-full max-w-[96rem] grid-cols-1 items-center gap-8 px-6 pb-12 pt-10 md:grid-cols-[minmax(0,1fr)_minmax(270px,0.82fr)] md:pb-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:px-14 lg:pb-44 lg:pt-12 xl:px-20"
      >
        <div className="relative z-20 max-w-[720px] pt-4 lg:pt-10">
          <motion.div
            variants={fadeUp}
            className="mb-7 inline-flex items-center gap-2 rounded-full bg-[#efe3d4]/82 px-4 py-2 text-[0.78rem] font-bold text-[#5f3519] shadow-[0_12px_35px_rgba(86,45,12,0.06)] backdrop-blur-xl"
          >
            <span className="h-2 w-2 rounded-full bg-[#e28a05]" />
            All-in-One Restaurant Management Platform
          </motion.div>

          <FlyingHeroTitle />

          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-[570px] text-[clamp(1rem,1.15vw,1.13rem)] font-medium leading-[1.7] text-[#fff8ed] drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)]"
          >
            QR ordering, digital menu, kitchen management and analytics —
            everything you need to run your restaurant smarter.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center gap-5 mt-9"
          >
            <a
              href="/register"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#f0a21a] to-[#d98205] px-8 py-4 text-[0.98rem] font-black text-white shadow-[0_20px_42px_rgba(217,130,5,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_55px_rgba(217,130,5,0.42)]"
            >
              Start Free Trial
              <ArrowRight
                size={19}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>

            <a
              href="/demo"
              className="group inline-flex items-center justify-center gap-3 rounded-full border border-[#e3d0b6] bg-[#fff8ed]/60 px-8 py-4 text-[0.98rem] font-black text-[#3b2111] shadow-[0_15px_34px_rgba(70,35,10,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#dfa248]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d9b47a] text-[#d98205]">
                <Play size={14} fill="currentColor" />
              </span>
              Watch Demo
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center gap-4 mt-9"
          >
            <div className="flex -space-x-3">
              {["R", "C", "B", "M"].map((item) => (
                <div
                  key={item}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#f6efe4] bg-gradient-to-br from-[#fff5e2] to-[#e2a440] text-sm font-black text-[#3a1d0a] shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center gap-1 text-[#f0a21a]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="mt-1 text-sm font-bold text-[#5f4d3e]">
                Trusted by 500+ restaurants
              </p>
            </div>
          </motion.div>
        </div>

        <MobileHeroIllustration />

        <div className="relative items-center justify-end hidden h-full lg:flex">
          <DashboardPreview />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        transition={{ duration: 0.8, delay: 0.85 }}
        className="hidden lg:absolute lg:bottom-8 lg:left-1/2 lg:z-10 lg:grid lg:w-[min(100%-2rem,70rem)] lg:-translate-x-1/2 lg:grid-cols-4 lg:overflow-hidden lg:rounded-[1.65rem] lg:border lg:border-[#e7d5bc] lg:bg-[#fff8ed] lg:px-5 lg:py-5 lg:shadow-[0_28px_70px_rgba(66,33,10,0.13)]"
      >
        <StatPill
          icon={<Coffee size={21} />}
          value={500}
          suffix="+"
          label="Restaurants"
        />
        <StatPill
          icon={<ChefHat size={21} />}
          value={20}
          suffix="K+"
          label="Orders Served Daily"
        />
        <StatPill
          icon={<TrendingUp size={21} />}
          value={0}
          suffix="%"
          label="Commission"
        />
        <StatPill
          icon={<ShieldCheck size={21} />}
          value={99}
          suffix=".9%"
          label="Uptime Guaranteed"
        />
      </motion.div>
    </section>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -8 }}
      className="group rounded-[2rem] border border-[#ecdcc4] bg-[#fffaf2] p-7 shadow-[0_24px_70px_rgba(81,42,15,0.08)] transition-all duration-300 hover:border-[#e7b765]"
    >
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5e5cc] text-[#d98205] transition-all duration-300 group-hover:bg-[#d98205] group-hover:text-white">
        {icon}
      </div>
      <h3 className="font-display text-2xl font-black tracking-[-0.05em] text-[#2a1408]">
        {title}
      </h3>
      <p className="mt-3 text-[0.98rem] font-medium leading-7 text-[#715b47]">
        {desc}
      </p>
    </motion.div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  sub,
  titleColor = "#241006",
  subColor = "#705a46",
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
      transition={{ staggerChildren: 0.1 }}
      className="max-w-3xl mx-auto text-center mb-14"
    >
      <motion.p
        variants={fadeUp}
        className="text-xs font-black uppercase tracking-[0.22em] text-[#d98205]"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        variants={fadeUp}
        style={{ color: titleColor }}
        className="font-display mt-4 text-[clamp(2.4rem,4.7vw,4.8rem)] font-black leading-[0.98] tracking-[-0.075em]"
      >
        {title}
      </motion.h2>
      <motion.p
        variants={fadeUp}
        style={{ color: subColor }}
        className="max-w-2xl mx-auto mt-5 text-lg font-medium leading-8"
      >
        {sub}
      </motion.p>
    </motion.div>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <QrCode size={26} />,
      title: "QR Table Ordering",
      desc: "Customers scan, browse, customize, and place orders from their own phone without downloading any app.",
    },
    {
      icon: <MenuSquare size={26} />,
      title: "Premium Digital Menu",
      desc: "Show dishes beautifully with photos, categories, badges, availability, veg/non-veg labels, and offers.",
    },
    {
      icon: <Bell size={26} />,
      title: "Live Admin Dashboard",
      desc: "New orders, table status, payment status, and kitchen updates appear instantly with real-time alerts.",
    },
    {
      icon: <ChefHat size={26} />,
      title: "Kitchen Display",
      desc: "Kitchen staff get a clean batch-wise order screen with table number, notes, timing, and serving status.",
    },
    {
      icon: <BarChart3 size={26} />,
      title: "Analytics & Growth",
      desc: "Track revenue, top-selling dishes, peak hours, active tables, and business performance in one place.",
    },
    {
      icon: <Tags size={26} />,
      title: "Coupons & Feedback",
      desc: "Create offers, reward customers after feedback, and understand what guests love about your restaurant.",
    },
  ];

  return (
    <section className="bg-[#f7efe4] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Everything inside one system"
          title="Built for modern cafés and restaurants."
          sub="FoodDash combines the customer experience, staff operations, and owner dashboard into one simple platform."
        />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          transition={{ staggerChildren: 0.08 }}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    [
      "01",
      "Register Restaurant",
      "Create your FoodDash account and add your restaurant details.",
    ],
    [
      "02",
      "Setup Menu & QR",
      "Upload menu items, choose branding, and generate table-wise QR codes.",
    ],
    [
      "03",
      "Customers Order",
      "Guests scan from the table, browse your menu, and place orders instantly.",
    ],
    [
      "04",
      "Staff Manages Live",
      "Admin and kitchen screens update in real time with order and table status.",
    ],
  ];

  return (
    <section className="relative overflow-hidden bg-[#160b05] px-6 py-24 text-[#fff4dc]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(240,162,26,0.16),transparent_34%),radial-gradient(circle_at_80%_70%,rgba(240,162,26,0.12),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Simple workflow"
          title="From QR scan to kitchen in seconds."
          sub="The full workflow is designed for small and mid-size restaurants, without adding operational complexity."
          titleColor="#FFF5DA"
          subColor="#c5a983"
        />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map(([num, title, desc]) => (
            <motion.div
              variants={fadeUp}
              key={num}
              className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-7 backdrop-blur-xl"
            >
              <div className="font-display text-5xl font-black tracking-[-0.08em] text-[#f0a21a]">
                {num}
              </div>
              <h3 className="mt-7 text-xl font-black text-[#fff5da]">
                {title}
              </h3>
              <p className="mt-3 text-sm font-medium leading-7 text-[#c5a983]">
                {desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: "Public Website",
      price: "499",
      desc: "For restaurants that need a premium online presence.",
      features: [
        "Website pages",
        "Digital menu listing",
        "Contact & map",
        "Mobile responsive",
      ],
    },
    {
      name: "Starter QR",
      price: "999",
      desc: "Best for cafés starting QR ordering.",
      featured: true,
      features: [
        "QR table ordering",
        "Admin dashboard",
        "Kitchen display",
        "Live order updates",
      ],
    },
    {
      name: "Growth",
      price: "1299",
      desc: "For restaurants that want analytics and growth tools.",
      features: [
        "Everything in Starter",
        "Analytics",
        "Coupons",
        "Feedback rewards",
      ],
    },
  ];

  return (
    <section className="bg-[#f7efe4] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Simple pricing"
          title="Zero commission. Fixed monthly plans."
          sub="Restaurants keep their full revenue while FoodDash handles ordering, menu, kitchen and management."
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`rounded-[2rem] p-7 shadow-[0_24px_70px_rgba(81,42,15,0.08)] ${
                plan.featured
                  ? "bg-[#160b05] text-[#fff5da] ring-2 ring-[#f0a21a]"
                  : "border border-[#ecdcc4] bg-[#fffaf2] text-[#2a1408]"
              }`}
            >
              {plan.featured && (
                <div className="mb-5 inline-flex rounded-full bg-[#f0a21a] px-4 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#261005]">
                  Most Popular
                </div>
              )}
              <h3 className="font-display text-3xl font-black tracking-[-0.06em]">
                {plan.name}
              </h3>
              <p
                className={`mt-3 min-h-[56px] text-sm font-medium leading-7 ${plan.featured ? "text-[#c5a983]" : "text-[#705a46]"}`}
              >
                {plan.desc}
              </p>
              <div className="flex items-end gap-2 mt-8">
                <span className="font-display text-5xl font-black tracking-[-0.08em]">
                  ₹{plan.price}
                </span>
                <span
                  className={`mb-2 text-sm font-bold ${plan.featured ? "text-[#c5a983]" : "text-[#705a46]"}`}
                >
                  /month
                </span>
              </div>
              <div className="mt-8 space-y-4">
                {plan.features.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm font-bold"
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${plan.featured ? "bg-[#f0a21a] text-[#241006]" : "bg-[#f5e5cc] text-[#d98205]"}`}
                    >
                      <Check size={14} />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseSection() {
  return (
    <section className="bg-[#f7efe4] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Why restaurants choose FoodDash"
          title="Designed to feel premium for both owners and customers."
          sub="FoodDash is not just QR ordering. It becomes the digital operating system of your restaurant."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <FeatureCard
            icon={<Clock3 size={26} />}
            title="Faster Service"
            desc="Reduce waiting time and send orders from table to kitchen instantly."
          />

          <FeatureCard
            icon={<Store size={26} />}
            title="Premium Brand Feel"
            desc="Give your café a modern digital experience that feels polished and memorable."
          />

          <FeatureCard
            icon={<TrendingUp size={26} />}
            title="Better Growth"
            desc="Track best-selling items, peak hours, feedback, and revenue trends."
          />
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-[#f7efe4] px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-6xl overflow-hidden rounded-[2.6rem] bg-[#160b05] px-8 py-16 text-center text-[#fff5da] shadow-[0_32px_90px_rgba(45,20,6,0.25)]"
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0a21a] text-[#241006]">
          <Sparkles size={26} />
        </div>
        <h2 className="font-display mx-auto max-w-3xl text-[clamp(2.4rem,5vw,4.8rem)] font-black leading-[0.95] tracking-[-0.075em]">
          Launch your restaurant’s digital ordering experience.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-[#c5a983]">
          Start with your website, menu, QR ordering, kitchen display and
          analytics — all under one FoodDash system.
        </p>
        <div className="flex justify-center mt-9">
          <a
            href="/register"
            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#f0a21a] to-[#d98205] px-8 py-4 font-black text-white shadow-[0_20px_42px_rgba(217,130,5,0.32)] transition-all duration-300 hover:-translate-y-1"
          >
            Get Started <ArrowRight size={19} />
          </a>
        </div>
      </motion.div>
    </section>
  );
}

export default function FoodDashHome() {
  return (
    <main className="min-h-screen bg-[#f7efe4] font-body text-[#2a1408]">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhyChooseSection />
      <FinalCTA />
    </main>
  );
}
