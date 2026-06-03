import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useWebsiteSettings } from "../../context/WebsiteSettingsContext";
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Coffee,
  ArrowUpRight,
  Clock,
  Zap,
  MessageCircle,
} from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Menu", to: "/menu-preview" },
  { label: "Order", to: "/order" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

function Footer() {
  const websiteContext = useWebsiteSettings() || {};
  const settings = websiteContext.settings || {};

  const settingsReady =
    websiteContext.settings && Object.keys(websiteContext.settings).length > 0;

  if (!settingsReady) return null;

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

  const cafeName =
    settings?.footerBrandName || settings?.cafeName || "The White House Café";

  const footerTagline =
    settings?.footerTagline ||
    "A modern dining experience where craft meets warmth — powered by QR table ordering.";

  const footerBg = settings?.footerBgColor || "#0d0e14";
  const footerText = settings?.footerTextColor || "rgba(255,255,255,0.45)";
  const footerHeading = settings?.footerHeadingColor || "#ffffff";
  const footerAccent =
    settings?.footerAccentColor ||
    settings?.contactAccentColor ||
    settings?.accentColor ||
    "#D4A853";
  const footerCardBg = settings?.footerCardBg || "rgba(255,255,255,0.03)";
  const footerBorder = settings?.footerBorderColor || "rgba(255,255,255,0.08)";

  const address =
    settings?.footerAddress ||
    `${settings?.contactAddressTitle || "Khatipura, Near Lal Mandir Road"}, ${
      settings?.contactAddressSubtitle || "Jaipur, Rajasthan"
    }`;

  const hours =
    settings?.footerHours ||
    settings?.contactHours ||
    "10:00 AM – 11:00 PM · Daily";

  const phone = settings?.contactPhone || "+91 98765 43210";
  const email = settings?.contactEmail || "whitehousecafe@gmail.com";
  const whatsappDigits = (settings?.whatsapp || "").replace(/\D/g, "");

  const copyright =
    settings?.footerCopyright ||
    `© ${new Date().getFullYear()} ${cafeName} · All rights reserved.`;

  const socials = [
    {
      icon: Instagram,
      href: settings?.instagram || "",
      label: "Instagram",
    },
    {
      icon: Facebook,
      href: settings?.facebook || "",
      label: "Facebook",
    },
    {
      icon: Twitter,
      href: settings?.twitter || "",
      label: "Twitter",
    },
    {
      icon: MessageCircle,
      href: whatsappDigits ? `https://wa.me/${whatsappDigits}` : "",
      label: "WhatsApp",
    },
  ].filter((social) => social.href);

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        fontFamily: `'${bodyFont}', 'DM Sans', 'Inter', sans-serif`,
        background: footerBg,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,700&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .footer-display {
          font-family: '${headingFont}', 'Fraunces', Georgia, serif;
          font-optical-sizing: none;
        }

        .footer-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: ${footerText};
          font-size: 14px;
          font-weight: 600;
          transition: color 0.22s ease;
        }

        .footer-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 0;
          height: 1.5px;
          background: ${footerAccent};
          transition: width 0.25s ease;
          border-radius: 2px;
        }

        .footer-link:hover {
          color: ${footerAccent};
        }

        .footer-link:hover::after {
          width: 100%;
        }

        .social-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          border: 1px solid ${footerBorder};
          background: rgba(255,255,255,0.04);
          color: ${footerText};
          transition: all 0.22s ease;
        }

        .social-btn:hover {
          background: rgba(212,168,83,0.15);
          border-color: rgba(212,168,83,0.4);
          color: ${footerAccent};
          transform: translateY(-2px);
        }

        .footer-gold-line {
          background: linear-gradient(to right, transparent, ${footerAccent} 30%, ${footerAccent} 70%, transparent);
        }
      `}</style>

      <div
        className="absolute pointer-events-none"
        style={{
          top: "-80px",
          left: "-80px",
          width: "400px",
          height: "400px",
          background: `radial-gradient(circle, ${footerAccent}12 0%, transparent 70%)`,
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 0,
          right: "-60px",
          width: "300px",
          height: "300px",
          background:
            "radial-gradient(circle, rgba(100,120,200,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="w-full h-px footer-gold-line" />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="max-w-6xl px-6 pt-16 pb-10 mx-auto"
      >
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1.4fr]">
          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-2xl"
                style={{ background: footerAccent }}
              >
                <Coffee size={18} style={{ color: footerBg }} />
              </div>

              <div>
                <h2
                  className="footer-display text-xl font-black leading-tight tracking-[-0.02em]"
                  style={{ color: footerHeading }}
                >
                  {cafeName.replace(" Café", "")}
                </h2>

                <span
                  className="text-[11px] font-bold tracking-[0.18em] uppercase"
                  style={{ color: footerAccent }}
                >
                  {settings?.footerBrandSmall || "Café"}
                </span>
              </div>
            </div>

            <p
              className="max-w-[280px] text-sm leading-7"
              style={{ color: footerText }}
            >
              {footerTagline}
            </p>

            <div className="mt-6 flex items-start gap-2.5">
              <MapPin
                size={14}
                className="shrink-0 mt-0.5"
                style={{ color: footerAccent }}
              />
              <p className="text-sm leading-6" style={{ color: footerText }}>
                {address}
              </p>
            </div>

            <div className="mt-3 flex items-center gap-2.5">
              <Clock
                size={14}
                className="shrink-0"
                style={{ color: footerAccent }}
              />
              <p className="text-sm" style={{ color: footerText }}>
                {hours}
              </p>
            </div>

            {socials.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-7">
                {socials.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="social-btn"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div variants={item}>
            <h3
              className="text-[11px] font-black uppercase tracking-[0.2em] mb-6"
              style={{ color: footerAccent }}
            >
              {settings?.footerNavigateTitle || "Navigate"}
            </h3>

            <nav className="flex flex-col gap-4">
              {navLinks.map(({ label, to }) => (
                <Link key={to} to={to} className="footer-link group">
                  {label}
                  <ArrowUpRight
                    size={12}
                    className="transition-opacity opacity-0 group-hover:opacity-100"
                  />
                </Link>
              ))}
            </nav>
          </motion.div>

          <motion.div variants={item}>
            <h3
              className="text-[11px] font-black uppercase tracking-[0.2em] mb-6"
              style={{ color: footerAccent }}
            >
              {settings?.footerReachTitle || "Reach Us"}
            </h3>

            <div className="flex flex-col gap-4">
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="footer-link group flex items-start gap-2.5"
              >
                <Phone
                  size={14}
                  className="shrink-0 mt-0.5"
                  style={{ color: footerAccent }}
                />
                <span>{phone}</span>
              </a>

              <a
                href={`mailto:${email}`}
                className="footer-link group flex items-start gap-2.5 break-all"
              >
                <Mail
                  size={14}
                  className="shrink-0 mt-0.5"
                  style={{ color: footerAccent }}
                />
                <span>{email}</span>
              </a>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <h3
              className="text-[11px] font-black uppercase tracking-[0.2em] mb-6"
              style={{ color: footerAccent }}
            >
              {settings?.footerNewsletterTitle || "Stay Updated"}
            </h3>

            <div
              className="p-5 border rounded-2xl"
              style={{
                background: footerCardBg,
                borderColor: footerBorder,
              }}
            >
              <p
                className="mb-4 text-sm font-semibold leading-6"
                style={{ color: footerText }}
              >
                {settings?.footerNewsletterText ||
                  "Get notified about our seasonal menus, special events and exclusive offers."}
              </p>

              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder={
                    settings?.footerNewsletterPlaceholder || "your@email.com"
                  }
                  className="w-full px-4 text-sm font-semibold border outline-none h-11 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.8)",
                    caretColor: footerAccent,
                  }}
                />

                <button
                  type="button"
                  className="w-full h-11 rounded-xl text-sm font-black transition hover:opacity-90 active:scale-[0.98]"
                  style={{ background: footerAccent, color: footerBg }}
                >
                  {settings?.footerNewsletterButton || "Subscribe →"}
                </button>
              </div>
            </div>

            <div
              className="flex items-center gap-2 px-4 py-3 mt-4 border rounded-xl"
              style={{
                background: "rgba(212,168,83,0.05)",
                borderColor: "rgba(212,168,83,0.15)",
              }}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-xs font-bold" style={{ color: footerText }}>
                {settings?.footerBadgeText || "Open now · Closes at 11 PM"}
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div variants={item} className="flex items-center gap-4 my-10">
          <div className="flex-1 h-px" style={{ background: footerBorder }} />
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-1 rounded-full"
              style={{ background: footerAccent }}
            />
            <Coffee size={12} style={{ color: footerAccent }} />
            <div
              className="w-1 h-1 rounded-full"
              style={{ background: footerAccent }}
            />
          </div>
          <div className="flex-1 h-px" style={{ background: footerBorder }} />
        </motion.div>

        <motion.div
          variants={item}
          className="flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <p
            className="text-xs font-semibold"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            {copyright}
          </p>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: footerBorder,
              }}
            >
              <Zap size={11} style={{ color: footerAccent }} />
              <span
                className="text-[11px] font-bold"
                style={{ color: footerText }}
              >
                {settings?.footerPoweredText || "Powered by"}{" "}
                <span className="font-black" style={{ color: footerAccent }}>
                  {settings?.footerPoweredBrand || "FoodDash"}
                </span>
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}

export default Footer;
