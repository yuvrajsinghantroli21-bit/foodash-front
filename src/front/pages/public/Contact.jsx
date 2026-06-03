import React, { useState } from "react";
import { motion } from "framer-motion";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { useWebsiteSettings } from "../../../context/WebsiteSettingsContext";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  Instagram,
  Facebook,
  MessageCircle,
  Send,
  User,
  Tag,
  Lock,
  Navigation as NavigationIcon,
  ChevronRight,
  Utensils,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
};

const onlyDigits = (value) => value.replace(/\D/g, "");

const validateField = (name, value) => {
  const trimmed = String(value || "").trim();

  if (name === "name") {
    if (!trimmed) return "Name is required.";
    if (trimmed.length < 3) return "Name must be at least 3 characters.";
    if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
      return "Name should contain only letters and spaces.";
    }
    return "";
  }

  if (name === "phone") {
    if (!trimmed) return "";
    const digits = onlyDigits(trimmed);
    if (digits.length !== 10) return "Phone number must be 10 digits.";
    if (!/^[6-9]/.test(digits)) return "Enter a valid Indian mobile number.";
    return "";
  }

  if (name === "email") {
    if (!trimmed) return "Email address is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmed)) return "Enter a valid email address.";
    return "";
  }

  if (name === "subject") {
    if (!trimmed) return "";
    if (trimmed.length < 4) return "Subject should be at least 4 characters.";
    if (trimmed.length > 80) return "Subject should be under 80 characters.";
    return "";
  }

  if (name === "message") {
    if (!trimmed) return "Message is required.";
    if (trimmed.length < 15) return "Message should be at least 15 characters.";
    if (trimmed.length > 600) return "Message should be under 600 characters.";
    return "";
  }

  return "";
};

const validateForm = (formData) => {
  const errors = {};
  Object.keys(formData).forEach((key) => {
    const error = validateField(key, formData[key]);
    if (error) errors[key] = error;
  });
  return errors;
};

const fadeUp = (delay = 0, active = true) => {
  if (!active) {
    return {
      initial: false,
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.22 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  };
};

const slideIn = (x = 40, delay = 0, active = true) => {
  if (!active) {
    return {
      initial: false,
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, x },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, amount: 0.18 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  };
};

function DynamicDivider({ settings }) {
  const style = settings?.dividerStyle || "goldLine";
  const svgCode =
    settings?.dividerSvg ||
    settings?.customSvgCode ||
    settings?.dividerSvgCode ||
    settings?.customDividerSvg ||
    settings?.contactDividerSvg ||
    "";

  const color = settings?.dividerColor || "#D4A853";
  const height = Number(settings?.dividerHeight) || 2;
  const width = Number(settings?.dividerWidth) || 100;

  if (svgCode && svgCode.includes("<svg")) {
    return (
      <div
        className="flex items-center justify-center my-3 [&_svg]:block [&_svg]:max-w-full [&_svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svgCode }}
      />
    );
  }

  if (style === "minimalLine") {
    return (
      <div
        className="mx-auto my-3 rounded-full"
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
      <div className="my-3 text-2xl font-black text-center" style={{ color }}>
        ~ ~ ~
      </div>
    );
  }

  if (style === "floralCafe") {
    return (
      <div className="flex items-center justify-center gap-3 my-3">
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
    <div className="flex items-center justify-center gap-3 my-3">
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#c98b3f]" />
      <span className="text-sm" style={{ color }}>
        ✦
      </span>
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#c98b3f]" />
    </div>
  );
}

function FieldHint({ error, touched, successText }) {
  if (error && touched) {
    return (
      <p className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-red-500">
        <AlertCircle size={12} />
        {error}
      </p>
    );
  }

  if (!error && touched && successText) {
    return (
      <p className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-emerald-600">
        <CheckCircle2 size={12} />
        {successText}
      </p>
    );
  }

  return null;
}

export default function Contact() {
  const websiteContext = useWebsiteSettings() || {};
  const settings = websiteContext.settings || {};

  const settingsReady =
    websiteContext.settings && Object.keys(websiteContext.settings).length > 0;

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

  const animationOn = settingsReady
    ? settings?.contactAnimation !== false
    : false;

  const bgColor = settings?.contactBgColor || "#f5f0e8";
  const primaryColor =
    settings?.contactTextColor || settings?.textColor || "#1f2937";
  const accentColor =
    settings?.contactAccentColor ||
    settings?.navbarActiveLinkColor ||
    settings?.activeLinkColor ||
    "#b87524";
  const mutedTextColor =
    settings?.contactMutedTextColor || settings?.bodyTextColor || "#64748b";
  const cardBg = settings?.contactCardBg || "#ffffff";

  const mapEmbedUrl =
    settings?.mapEmbedUrl ||
    "https://www.google.com/maps?q=Khatipura,Jaipur&output=embed";

  const mapDirectionUrl =
    settings?.mapDirectionUrl ||
    settings?.mapUrl ||
    "https://www.google.com/maps?q=Khatipura,Jaipur";

  const whatsappDigits = (settings?.whatsapp || "").replace(/\D/g, "");

  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  if (!settingsReady) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: bgColor }} />
    );
  }

  const getFieldError = (field) => errors[field];
  const isTouched = (field) => touched[field];

  const fieldWrapClass = (field) =>
    `flex items-center gap-3 px-4 py-3 bg-white border rounded-xl transition ${
      getFieldError(field) && isTouched(field)
        ? "border-red-300 ring-4 ring-red-50"
        : !getFieldError(field) && isTouched(field) && formData[field]?.trim()
          ? "border-emerald-300 ring-4 ring-emerald-50"
          : "border-[#eadfcd] focus-within:border-[#d6a84f] focus-within:ring-4 focus-within:ring-amber-100"
    }`;

  const messageWrapClass = (field) =>
    `flex items-start gap-3 px-4 py-3 bg-white border rounded-xl transition ${
      getFieldError(field) && isTouched(field)
        ? "border-red-300 ring-4 ring-red-50"
        : !getFieldError(field) && isTouched(field) && formData[field]?.trim()
          ? "border-emerald-300 ring-4 ring-emerald-50"
          : "border-[#eadfcd] focus-within:border-[#d6a84f] focus-within:ring-4 focus-within:ring-amber-100"
    }`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === "phone") finalValue = value.replace(/[^\d+\s-]/g, "");

    const updatedForm = { ...formData, [name]: finalValue };
    setFormData(updatedForm);

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, finalValue),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    setTouched({
      name: true,
      phone: true,
      email: true,
      subject: true,
      message: true,
    });

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSending(true);
    api
      .post("/enquiries", {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim() || "General Enquiry",
        message: formData.message.trim(),
      })
      .then(() => {
        toast.success("Message sent successfully!");
        setSent(true);
        setFormData(initialForm);
        setErrors({});
        setTouched({});
        setTimeout(() => setSent(false), 3000);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to send message.");
      })
      .finally(() => setSending(false));
  };

  const messageCount = formData.message.length;

  // console.log("MAP EMBED:", settings?.mapEmbedUrl);
  // console.log("MAP DIRECTION:", settings?.mapDirectionUrl);

  const infoCards = [
    {
      icon: <MapPin size={25} strokeWidth={1.8} />,
      label: "Address",
      title: settings?.contactAddressTitle || "Khatipura, Near Lal Mandir Road",
      desc:
        settings?.contactAddressSubtitle || "Jaipur, Rajasthan 302012, India",
      delay: 0,
    },
    {
      icon: <Phone size={24} strokeWidth={1.8} />,
      label: "Call Us",
      title: settings?.contactPhone || "+91 98765 43210",
      desc: settings?.contactTiming || "Mon – Sun, 9:00 AM – 10:00 PM",
      delay: 0.08,
    },
    {
      icon: <Mail size={24} strokeWidth={1.8} />,
      label: "Email Us",
      title: settings?.contactEmail || "whitehousecafe@gmail.com",
      desc: settings?.contactEmailNote || "We reply within 24 hours",
      delay: 0.16,
    },
    {
      icon: <Clock size={24} strokeWidth={1.8} />,
      label: "Opening Hours",
      title: settings?.contactHours || "Daily · 9:00 AM – 10:00 PM",
      desc:
        settings?.contactHoursNote || "Come by for coffee, meals & memories.",
      delay: 0.24,
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: bgColor,
        fontFamily: `var(--contact-body-font), '${bodyFont}', system-ui, sans-serif`,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        .whc-contact-display {
          font-family: '${headingFont}', 'Fraunces', Georgia, serif;
          font-optical-sizing: none;
          font-variation-settings: "opsz" 9, "wght" 720, "SOFT" 28, "WONK" 0;
        }
      `}</style>

      <div className="max-w-6xl px-4 mx-auto py-14 sm:px-6 lg:px-8">
        <motion.div {...fadeUp(0, animationOn)} className="mb-12 text-center">
          <p
            className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.3em]"
            style={{ color: accentColor }}
          >
            {settings?.contactEyebrow || "• Get In Touch •"}
          </p>

          <h1
            className="text-4xl font-bold whc-contact-display sm:text-5xl md:text-6xl"
            style={{ color: primaryColor }}
          >
            {settings?.contactHeading || "Contact Us"}
          </h1>

          <DynamicDivider settings={settings} />

          <p
            className="max-w-xl mx-auto text-sm font-medium leading-relaxed"
            style={{ color: mutedTextColor }}
          >
            {settings?.contactSubtitle ||
              "We'd love to hear from you. Visit us at Khatipura or drop us a message and we'll get back to you shortly."}
          </p>
        </motion.div>

        <div
          className="relative grid items-start grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr]"
          style={{
            fontFamily: `'${bodyFont}', 'Inter', 'DM Sans', sans-serif`,
          }}
        >
          <div className="absolute pointer-events-none -left-24 top-20 text-[#d6b36a]/10 text-[180px] select-none hidden xl:block">
            ❧
          </div>
          <div className="absolute pointer-events-none -right-20 bottom-10 text-[#d6b36a]/10 text-[180px] select-none hidden xl:block">
            ❧
          </div>

          <motion.div
            {...slideIn(-40, 0, animationOn)}
            className="flex flex-col gap-4"
          >
            {infoCards.map((card) => (
              <motion.div
                key={card.label}
                {...fadeUp(card.delay, animationOn)}
                className="group flex items-center gap-5 rounded-2xl border px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)]"
                style={{ background: `${cardBg}e6`, borderColor: "#efe5d4" }}
              >
                <div
                  className="flex items-center justify-center border rounded-full shadow-sm w-14 h-14 shrink-0"
                  style={{
                    background: "#fff7ea",
                    borderColor: "#f1dfbd",
                    color: accentColor,
                  }}
                >
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.18em]"
                    style={{ color: accentColor }}
                  >
                    {card.label}
                  </p>
                  <p
                    className="text-base font-bold leading-snug break-words"
                    style={{
                      color: primaryColor,
                      fontFamily: `'${headingFont}', Georgia, serif`,
                    }}
                  >
                    {card.title}
                  </p>
                  <p
                    className="mt-0.5 text-sm font-medium"
                    style={{ color: mutedTextColor }}
                  >
                    {card.desc}
                  </p>
                </div>
                <ChevronRight
                  size={22}
                  className="transition group-hover:translate-x-1"
                  style={{ color: accentColor }}
                />
              </motion.div>
            ))}

            <motion.div
              {...fadeUp(0.3, animationOn)}
              className="flex flex-col gap-4 px-5 py-5 border shadow-[0_10px_30px_rgba(15,23,42,0.07)] rounded-2xl sm:flex-row sm:items-center sm:justify-between"
              style={{ background: `${cardBg}e6`, borderColor: "#efe5d4" }}
            >
              <div className="flex items-center gap-5">
                <div
                  className="flex items-center justify-center border rounded-full shadow-sm w-14 h-14 shrink-0"
                  style={{
                    background: "#fff7ea",
                    borderColor: "#f1dfbd",
                    color: accentColor,
                  }}
                >
                  <Users size={24} strokeWidth={1.8} />
                </div>
                <div>
                  <p
                    className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.18em]"
                    style={{ color: accentColor }}
                  >
                    Stay Connected
                  </p>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: mutedTextColor }}
                  >
                    {settings?.contactSocialNote ||
                      "Follow us for updates, offers & more"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={settings?.instagram || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center w-10 h-10 transition border rounded-full bg-white border-[#f1dfbd] hover:bg-[#fff7ea]"
                  style={{ color: accentColor }}
                >
                  <Instagram size={18} />
                </a>
                <a
                  href={settings?.facebook || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center w-10 h-10 transition border rounded-full bg-white border-[#f1dfbd] hover:bg-[#fff7ea]"
                  style={{ color: accentColor }}
                >
                  <Facebook size={18} />
                </a>
                <a
                  href={
                    whatsappDigits ? `https://wa.me/${whatsappDigits}` : "#"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center w-10 h-10 transition border rounded-full bg-white border-[#f1dfbd] hover:bg-[#fff7ea]"
                  style={{ color: accentColor }}
                >
                  <MessageCircle size={18} />
                </a>
              </div>
            </motion.div>

            <motion.div
              {...fadeUp(0.36, animationOn)}
              className="relative overflow-hidden border shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl bg-white"
              style={{ borderColor: "#efe5d4" }}
            >
              <iframe
                src={mapEmbedUrl}
                className="block w-full border-0 grayscale-[10%] sepia-[8%]"
                height="250"
                loading="lazy"
                title="Google Map"
              />
              <a
                href={mapDirectionUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute inline-flex items-center gap-2 px-4 py-2 text-sm font-bold transition bg-white border rounded-full shadow-md left-4 bottom-4 hover:bg-[#fff7ea]"
                style={{ color: primaryColor, borderColor: "#efe5d4" }}
              >
                Open in Maps
                <NavigationIcon size={15} style={{ color: accentColor }} />
              </a>
            </motion.div>
          </motion.div>

          <motion.div {...slideIn(40, 0.15, animationOn)}>
            <div
              className="relative overflow-hidden border shadow-[0_16px_45px_rgba(15,23,42,0.09)] rounded-3xl"
              style={{ background: `${cardBg}f2`, borderColor: "#efe5d4" }}
            >
              <div className="absolute top-8 right-8 text-[#d6a84f] opacity-80 hidden sm:block">
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <path
                    d="M12 38C24 30 28 18 23 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M23 8C17 10 14 14 13 20C18 19 22 15 23 8Z"
                    fill="currentColor"
                    opacity="0.35"
                  />
                  <path
                    d="M21 25C14 25 9 29 7 35C14 36 19 32 21 25Z"
                    fill="currentColor"
                    opacity="0.35"
                  />
                  <path
                    d="M28 32C36 27 41 20 41 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M41 12C35 13 31 17 30 23C36 23 40 18 41 12Z"
                    fill="currentColor"
                    opacity="0.35"
                  />
                </svg>
              </div>

              <div className="px-6 py-8 sm:px-9 sm:py-10">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <p
                      className="text-[11px] font-extrabold uppercase tracking-[0.32em]"
                      style={{ color: accentColor }}
                    >
                      {settings?.contactFormEyebrow || "Send a Message"}
                    </p>
                    <div
                      className="w-12 h-[1px]"
                      style={{ background: accentColor }}
                    />
                  </div>

                  <h2
                    className="max-w-xl text-3xl font-bold leading-tight whc-contact-display sm:text-4xl"
                    style={{ color: primaryColor }}
                  >
                    {settings?.contactFormHeading ||
                      "We’d Love to Hear From You"}
                  </h2>

                  <p
                    className="max-w-xl mt-3 text-sm font-medium leading-relaxed sm:text-base"
                    style={{ color: mutedTextColor }}
                  >
                    {settings?.contactFormSubtitle ||
                      "Have a question, feedback, or special request? Send us a message and our team will get back to you as soon as possible."}
                  </p>

                  <div className="scale-110 sm:scale-150">
                    <DynamicDivider settings={settings} />
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        className="block mb-2 text-[13px] font-extrabold"
                        style={{ color: primaryColor }}
                      >
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <div className={fieldWrapClass("name")}>
                        <User size={17} style={{ color: accentColor }} />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full text-sm font-semibold bg-transparent outline-none text-slate-700 placeholder:text-slate-300"
                        />
                      </div>
                      <FieldHint
                        error={errors.name}
                        touched={touched.name}
                        successText="Name looks good."
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-2 text-[13px] font-extrabold"
                        style={{ color: primaryColor }}
                      >
                        Phone Number
                      </label>
                      <div className={fieldWrapClass("phone")}>
                        <Phone size={17} style={{ color: accentColor }} />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="+91 98765 43210"
                          className="w-full text-sm font-semibold bg-transparent outline-none text-slate-700 placeholder:text-slate-300"
                        />
                      </div>
                      <FieldHint
                        error={errors.phone}
                        touched={touched.phone}
                        successText={
                          formData.phone.trim()
                            ? "Phone number looks valid."
                            : ""
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block mb-2 text-[13px] font-extrabold"
                      style={{ color: primaryColor }}
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className={fieldWrapClass("email")}>
                      <Mail size={17} style={{ color: accentColor }} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="you@example.com"
                        className="w-full text-sm font-semibold bg-transparent outline-none text-slate-700 placeholder:text-slate-300"
                      />
                    </div>
                    <FieldHint
                      error={errors.email}
                      touched={touched.email}
                      successText="Email looks valid."
                    />
                  </div>

                  <div>
                    <label
                      className="block mb-2 text-[13px] font-extrabold"
                      style={{ color: primaryColor }}
                    >
                      Subject
                    </label>
                    <div className={fieldWrapClass("subject")}>
                      <Tag size={17} style={{ color: accentColor }} />
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Reservation, Feedback, Partnership"
                        className="w-full text-sm font-semibold bg-transparent outline-none text-slate-700 placeholder:text-slate-300"
                      />
                    </div>
                    <FieldHint
                      error={errors.subject}
                      touched={touched.subject}
                      successText={
                        formData.subject.trim() ? "Subject looks good." : ""
                      }
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <label
                        className="block text-[13px] font-extrabold"
                        style={{ color: primaryColor }}
                      >
                        Message <span className="text-red-500">*</span>
                      </label>
                      <span
                        className={`text-[11px] font-bold ${messageCount > 600 ? "text-red-500" : messageCount >= 15 ? "text-emerald-600" : "text-slate-400"}`}
                      >
                        {messageCount}/600
                      </span>
                    </div>
                    <div className={messageWrapClass("message")}>
                      <MessageCircle
                        size={17}
                        className="mt-0.5"
                        style={{ color: accentColor }}
                      />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={5}
                        placeholder="Write your message here..."
                        className="w-full text-sm font-semibold bg-transparent outline-none resize-none text-slate-700 placeholder:text-slate-300"
                      />
                    </div>
                    <FieldHint
                      error={errors.message}
                      touched={touched.message}
                      successText="Message length looks good."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="flex items-center justify-center w-full gap-3 py-3.5 text-base font-bold text-white transition-all duration-300 shadow-[0_10px_24px_rgba(180,83,9,0.25)] rounded-xl hover:shadow-[0_14px_30px_rgba(180,83,9,0.34)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: `'${headingFont}', Georgia, serif`,
                      background:
                        settings?.contactButtonGradient ||
                        "linear-gradient(90deg,#d97706,#e6a526,#b87524)",
                    }}
                  >
                    {sending
                      ? "Sending..."
                      : sent
                        ? "Message Sent!"
                        : settings?.contactButtonText || "Send Message"}
                    <Send size={17} />
                  </button>

                  <p className="flex items-center justify-center gap-2 pt-1 text-[12px] font-medium text-slate-400">
                    <Lock size={13} style={{ color: accentColor }} />
                    {settings?.contactPrivacyText ||
                      "Your information is safe and never shared."}
                  </p>
                </form>
              </div>
            </div>

            <motion.div
              {...fadeUp(0.4, animationOn)}
              className="grid grid-cols-1 gap-4 px-6 py-5 mt-5 border shadow-[0_10px_30px_rgba(15,23,42,0.07)] rounded-2xl sm:grid-cols-2"
              style={{ background: `${cardBg}e6`, borderColor: "#efe5d4" }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center w-12 h-12 border rounded-full"
                  style={{
                    background: "#fff7ea",
                    borderColor: "#f1dfbd",
                    color: accentColor,
                  }}
                >
                  <Utensils size={22} />
                </div>
                <div>
                  <p className="font-bold" style={{ color: primaryColor }}>
                    {settings?.contactNoteTitle || "Planning a special visit?"}
                  </p>
                  <p
                    className="text-xs font-medium leading-relaxed"
                    style={{ color: mutedTextColor }}
                  >
                    {settings?.contactNoteText ||
                      "For reservations, events or large groups, please call us directly."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:border-l sm:border-[#eadfcd] sm:pl-5">
                <div
                  className="flex items-center justify-center w-12 h-12 border rounded-full"
                  style={{
                    background: "#fff7ea",
                    borderColor: "#f1dfbd",
                    color: accentColor,
                  }}
                >
                  <Clock size={22} />
                </div>
                <div>
                  <p className="font-bold" style={{ color: primaryColor }}>
                    {settings?.contactResponseTitle || "We typically respond"}
                  </p>
                  <p
                    className="text-xs font-medium leading-relaxed"
                    style={{ color: mutedTextColor }}
                  >
                    {settings?.contactResponseText || "within 24 hours"}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

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
      </div>
    </div>
  );
}
