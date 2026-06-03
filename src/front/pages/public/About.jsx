import { motion } from "framer-motion";
import {
  ArrowRight,
  Coffee,
  Heart,
  MapPin,
  QrCode,
  ScanLine,
  Utensils,
} from "lucide-react";
import { useWebsiteSettings } from "../../../context/WebsiteSettingsContext";

const DEFAULT_VALUES = [
  { number: "500+", label: "Happy Diners" },
  { number: "40+", label: "Menu Items" },
  { number: "5★", label: "Avg. Rating" },
  { number: "2min", label: "Avg. Order Time" },
];

const DEFAULT_FEATURES = [
  {
    icon: <ScanLine size={22} />,
    title: "Scan from table",
    desc: "Customers open the menu instantly through the QR placed on their table.",
  },
  {
    icon: <Utensils size={22} />,
    title: "Order clearly",
    desc: "Item notes, table number and order details reach the kitchen cleanly.",
  },
  {
    icon: <QrCode size={22} />,
    title: "Relax and enjoy",
    desc: "No waiting for a menu. Guests can browse, choose and enjoy calmly.",
  },
];

const fadeUp = (delay = 0, animationOn = true) => {
  if (!animationOn) {
    return {
      initial: false,
      whileInView: undefined,
      viewport: undefined,
      transition: undefined,
    };
  }

  return {
    initial: { opacity: 0, y: 26 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] },
  };
};

function DynamicDivider({ settings }) {
  const style = settings?.dividerStyle || "goldLine";

  const svgCode =
    settings?.dividerSvg ||
    settings?.customSvgCode ||
    settings?.dividerSvgCode ||
    settings?.customDividerSvg ||
    "";

  const color = settings?.dividerColor || "#D4A853";
  const height = Number(settings?.dividerHeight) || 2;
  const width = Number(settings?.dividerWidth) || 100;

  if (svgCode && svgCode.includes("<svg")) {
    return (
      <div
        className="flex justify-center my-6 [&_svg]:block [&_svg]:max-w-full [&_svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svgCode }}
      />
    );
  }

  if (style === "minimalLine") {
    return (
      <div
        className="mx-auto my-6 rounded-full"
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
      <div className="my-6 text-2xl font-black text-center" style={{ color }}>
        ~ ~ ~
      </div>
    );
  }

  if (style === "floralCafe") {
    return (
      <div className="flex items-center justify-center gap-3 my-6">
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
    <div className="flex items-center justify-center gap-3 my-6">
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#c98b3f]" />
      <span className="text-sm" style={{ color }}>
        ✦
      </span>
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#c98b3f]" />
    </div>
  );
}

function About() {
  const websiteContext = useWebsiteSettings() || {};
  const settings = websiteContext.settings || {};

  const settingsReady =
    websiteContext.settings && Object.keys(websiteContext.settings).length > 0;

  if (!settingsReady) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: settings?.aboutBgColor || "#f5f0e8" }}
      />
    );
  }

  const cafeName = settings?.cafeName || "The White House Café";

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

  const animationOn = settings?.aboutAnimation !== false;

  const bgColor = settings?.aboutBgColor || settings?.bgColor || "#f5f0e8";
  const textColor =
    settings?.aboutTextColor || settings?.textColor || "#2b1609";
  const mutedTextColor = settings?.aboutMutedTextColor || "rgba(61,36,18,0.62)";
  const accentColor = settings?.accentColor || "#c98b3f";
  const primaryColor = settings?.primaryColor || "#3d2412";
  const cardBg = settings?.aboutCardBg || "#fffaf1";
  const fontSize = Number(settings?.aboutFontSize) || 16;

  const aboutEyebrow = settings?.aboutEyebrow || `About ${cafeName}`;
  const aboutHeading = settings?.aboutHeading || "Our Story";
  const aboutHighlight = settings?.aboutHighlight || "in the heart of Jaipur.";
  const aboutContent =
    settings?.aboutContent ||
    `${cafeName} is made for slow conversations, warm plates, rich coffee and a simple table ordering experience powered by FoodDash.`;
  const storySection =
    settings?.storySection ||
    `At ${cafeName}, we believe a café should feel calm, warm and effortless. Whether someone comes for coffee, snacks, a family visit or a quiet meeting, the experience should feel smooth from the moment they sit.`;
  const founderMessage =
    settings?.founderMessage ||
    "Our goal is simple: make every guest feel welcomed, served clearly, and remembered warmly.";
  const aboutImage = settings?.aboutImage || "";

  const TEAM = [
    {
      icon: <Coffee size={24} />,
      role: settings?.aboutChefRole || "Head Chef",
      name: settings?.aboutChefName || "Chef xyz",
      note: settings?.aboutChefNote || "Crafting warm café plates with care.",
    },
    {
      icon: <Heart size={24} />,
      role: settings?.aboutOwnerRole || "Café Owner",
      name: settings?.aboutOwnerName || "Yuvraj Singh",
      note: settings?.aboutOwnerNote || "Keeping the table experience smooth.",
    },
    {
      icon: <QrCode size={24} />,
      role: settings?.aboutPoweredRole || "Powered by",
      name: settings?.aboutPoweredName || "FoodDash",
      note: settings?.aboutPoweredNote || "Smart dining made simple.",
    },
  ];

  const locationText =
    settings?.address ||
    settings?.aboutLocation ||
    settings?.contactAddressTitle ||
    "Khatipura, Near Lal Mandir Road, Jaipur, Rajasthan";

  const mapDirectionUrl =
    settings?.mapDirectionUrl ||
    settings?.mapUrl ||
    `https://maps.google.com/?q=${encodeURIComponent(
      locationText || "Jaipur Rajasthan",
    )}`;
  // const mapQuery = encodeURIComponent(locationText || "Jaipur Rajasthan");

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: `'${bodyFont}', system-ui, sans-serif`,
        fontSize: `${fontSize}px`,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

        .whc-about-display {
          font-family: '${headingFont}', 'Fraunces', Georgia, serif;
          font-optical-sizing: none;
          font-variation-settings: "opsz" 9, "wght" 700, "SOFT" 34, "WONK" 0.2;
        }

        .whc-about-grid {
          background-image:
            linear-gradient(rgba(61,36,18,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61,36,18,0.04) 1px, transparent 1px);
          background-size: 54px 54px;
        }

        .whc-about-gold-text {
          background: linear-gradient(110deg, #7a3f16 0%, ${accentColor} 42%, #8b5727 78%, #f1d694 100%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* HEADER */}
      <section className="relative px-5 pt-16 overflow-hidden pb-14 sm:px-6 lg:pb-20 lg:pt-20">
        <div className="absolute inset-0 whc-about-grid opacity-60" />
        <div className="absolute -left-32 top-20 hidden h-72 w-72 rounded-full bg-[#e7c474]/20 blur-3xl md:block" />
        <div className="absolute -right-32 bottom-10 hidden h-80 w-80 rounded-full bg-[#d97706]/10 blur-3xl md:block" />

        <motion.div
          {...fadeUp(0, animationOn)}
          className="relative max-w-4xl mx-auto text-center"
        >
          <p
            className="text-[11px] font-black uppercase tracking-[0.32em]"
            style={{ color: accentColor }}
          >
            {aboutEyebrow}
          </p>

          <h1
            className="whc-about-display mx-auto mt-5 max-w-4xl text-[clamp(3rem,10vw,6.5rem)] font-[620] leading-[0.9] tracking-[-0.065em]"
            style={{ color: primaryColor }}
          >
            {aboutHeading}
            <span className="block italic whc-about-gold-text">
              {aboutHighlight}
            </span>
          </h1>

          <DynamicDivider settings={settings} />

          <p
            className="max-w-2xl mx-auto text-base font-semibold leading-8 sm:text-lg"
            style={{ color: mutedTextColor }}
          >
            {aboutContent}
          </p>
        </motion.div>
      </section>

      {/* STORY */}
      <section className="px-5 pb-16 sm:px-6 lg:pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            {...fadeUp(0.05, animationOn)}
            className="rounded-[2rem] border p-7 shadow-[0_18px_50px_rgba(61,36,18,0.07)] backdrop-blur-md sm:p-10 lg:p-12"
            style={{ borderColor: "#eadfcd", background: `${cardBg}d9` }}
          >
            <div
              className={`grid gap-8 ${aboutImage ? "lg:grid-cols-[0.85fr_1.15fr]" : "lg:grid-cols-[0.75fr_1.25fr]"} lg:items-start`}
            >
              <div>
                <p
                  className="text-[11px] font-black uppercase tracking-[0.28em]"
                  style={{ color: accentColor }}
                >
                  Our Story
                </p>

                <h2
                  className="whc-about-display mt-4 text-4xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-5xl"
                  style={{ color: primaryColor }}
                >
                  Good food,
                  <span className="block italic whc-about-gold-text">
                    less waiting.
                  </span>
                </h2>

                {aboutImage && (
                  <div className="mt-7 overflow-hidden rounded-[1.6rem] border border-[#eadfcd] bg-white shadow-[0_16px_42px_rgba(61,36,18,0.08)]">
                    <img
                      src={aboutImage}
                      alt={cafeName}
                      loading="lazy"
                      decoding="async"
                      className="h-64 w-full object-cover transition duration-700 hover:scale-[1.03]"
                    />
                  </div>
                )}
              </div>

              <div
                className="space-y-5 text-sm font-semibold leading-8 sm:text-base"
                style={{ color: mutedTextColor }}
              >
                <p>{storySection}</p>

                <p>
                  Our QR ordering system, powered by{" "}
                  <span className="font-black text-emerald-700">FoodDash</span>,
                  helps customers browse the menu, add notes and place orders
                  directly from their table — while the kitchen receives
                  everything clearly.
                </p>

                <div className="rounded-[1.5rem] border border-amber-200/70 bg-white/60 p-5 shadow-[0_12px_34px_rgba(61,36,18,0.05)]">
                  <p
                    className="text-[10px] font-black uppercase tracking-[0.22em]"
                    style={{ color: accentColor }}
                  >
                    Founder Message
                  </p>
                  <p
                    className="mt-3 font-semibold leading-8"
                    style={{ color: textColor }}
                  >
                    “{founderMessage}”
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-5 pb-16 sm:px-6 lg:pb-24">
        <div className="grid max-w-5xl grid-cols-2 gap-4 mx-auto sm:grid-cols-4">
          {DEFAULT_VALUES.map((item, index) => (
            <motion.div
              key={item.label}
              {...fadeUp(index * 0.05, animationOn)}
              className="rounded-[1.6rem] border border-[#eadfcd] bg-white/72 p-5 text-center shadow-[0_14px_36px_rgba(61,36,18,0.06)]"
            >
              <p
                className="text-4xl font-bold leading-none whc-about-display"
                style={{ color: accentColor }}
              >
                {item.number}
              </p>
              <p
                className="mt-3 text-[10px] font-black uppercase tracking-[0.2em]"
                style={{ color: `${primaryColor}80` }}
              >
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* EXPERIENCE */}
      <section
        className="px-5 py-16 sm:px-6 lg:py-24"
        style={{ background: settings?.aboutSectionBg || "#fffaf1" }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp(0, animationOn)} className="mb-10 text-center">
            <p
              className="text-[11px] font-black uppercase tracking-[0.28em]"
              style={{ color: accentColor }}
            >
              The experience
            </p>

            <h2
              className="whc-about-display mt-3 text-[clamp(2.5rem,6vw,4.8rem)] font-[580] leading-[0.95] tracking-[-0.055em]"
              style={{ color: primaryColor }}
            >
              Simple for guests,
              <span className="block italic whc-about-gold-text">
                clear for the kitchen.
              </span>
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-3">
            {DEFAULT_FEATURES.map((item, index) => (
              <motion.div
                key={item.title}
                {...fadeUp(index * 0.08, animationOn)}
                className="rounded-[1.8rem] border border-[#eadfcd] bg-white/78 p-6 shadow-[0_16px_42px_rgba(61,36,18,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_56px_rgba(61,36,18,0.1)]"
              >
                <div
                  className="flex items-center justify-center w-12 h-12 mb-5 rounded-2xl"
                  style={{ background: primaryColor, color: "#e7c474" }}
                >
                  {item.icon}
                </div>

                <p
                  className="text-[10px] font-black uppercase tracking-[0.22em]"
                  style={{ color: accentColor }}
                >
                  0{index + 1}
                </p>

                <h3
                  className="whc-about-display mt-2 text-2xl font-semibold tracking-[-0.04em]"
                  style={{ color: primaryColor }}
                >
                  {item.title}
                </h3>

                <p
                  className="mt-3 text-sm font-semibold leading-7"
                  style={{ color: mutedTextColor }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="px-5 py-16 sm:px-6 lg:py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp(0, animationOn)} className="mb-10 text-center">
            <p
              className="text-[11px] font-black uppercase tracking-[0.28em]"
              style={{ color: accentColor }}
            >
              {settings?.aboutTeamEyebrow || "People behind it"}
            </p>

            <h2
              className="whc-about-display mt-3 text-[clamp(2.4rem,5.5vw,4.5rem)] font-[580] leading-[0.95] tracking-[-0.055em]"
              style={{ color: primaryColor }}
            >
              {settings?.aboutTeamHeading || "Made with care."}
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-3">
            {TEAM.map((person, index) => (
              <motion.div
                key={`${person.role}-${person.name}`}
                {...fadeUp(index * 0.08, animationOn)}
                className="rounded-[1.8rem] border border-[#eadfcd] p-6 text-center shadow-[0_16px_42px_rgba(61,36,18,0.06)]"
                style={{ background: `${cardBg}d9` }}
              >
                <div
                  className="flex items-center justify-center mx-auto h-14 w-14 rounded-2xl"
                  style={{ background: primaryColor, color: "#e7c474" }}
                >
                  {person.icon}
                </div>

                <p
                  className="mt-5 text-[10px] font-black uppercase tracking-[0.24em]"
                  style={{ color: accentColor }}
                >
                  {person.role}
                </p>

                <h3
                  className="whc-about-display mt-2 text-2xl font-semibold tracking-[-0.04em]"
                  style={{ color: primaryColor }}
                >
                  {person.name}
                </h3>

                <p
                  className="mt-3 text-sm font-semibold leading-7"
                  style={{ color: mutedTextColor }}
                >
                  {person.note}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="px-5 pb-20 sm:px-6 lg:pb-28">
        <motion.div
          {...fadeUp(0, animationOn)}
          className="mx-auto max-w-5xl rounded-[2rem] border border-[#eadfcd] p-7 text-[#fffaf1] shadow-[0_24px_70px_rgba(61,36,18,0.16)] sm:p-9"
          style={{ background: settings?.aboutLocationBg || "#2b1609" }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fffaf1] text-[#3d2412]">
              <MapPin size={25} />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#e7c474]">
                Find us
              </p>

              <h3 className="whc-about-display mt-2 text-3xl font-semibold tracking-[-0.04em]">
                {cafeName}
              </h3>

              <p className="mt-2 text-sm font-semibold leading-7 text-white/60">
                {locationText}
              </p>
            </div>

            <a
              href={mapDirectionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fffaf1] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#3d2412] transition duration-300 hover:-translate-y-1 md:ml-auto"
            >
              Get Directions
              <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.2, animationOn)} className="text-center mt-14">
          <DynamicDivider settings={settings} />
          <p className="mt-2 text-xs" style={{ color: mutedTextColor }}>
            {settings?.contactFooterNote || (
              <>
                Built with 🤍 using{" "}
                <span className="font-semibold" style={{ color: accentColor }}>
                  FoodDash
                </span>{" "}
                • Smart Dining Experience
              </>
            )}
          </p>
        </motion.div>
      </section>
    </div>
  );
}

export default About;
