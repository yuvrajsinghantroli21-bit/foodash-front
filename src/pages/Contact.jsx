import React, { useState } from "react";
import { motion } from "framer-motion";
import api from "../api/api";
import toast from "react-hot-toast";
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
  Navigation,
  ChevronRight,
  Utensils,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const PremiumDivider = () => (
  <div className="flex items-center justify-center my-3" style={{ height: 18 }}>
    <svg
      width="190"
      height="18"
      viewBox="0 0 190 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="0" y1="9" x2="60" y2="9" stroke="#e8c97a" strokeWidth="0.8" />
      <path
        d="M60 9 Q66 4 72 7"
        stroke="#c9a55a"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M64 9 Q67 13 73 11"
        stroke="#c9a55a"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M69 9 Q73 5 78 8"
        stroke="#c9a55a"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="95" cy="9" r="3.5" fill="#e8c97a" />
      <circle cx="95" cy="9" r="1.8" fill="#b45309" />
      <path
        d="M95 5.5 Q96.5 7 95 9 Q93.5 7 95 5.5Z"
        fill="#e8c97a"
        opacity="0.7"
      />
      <path
        d="M98.5 9 Q97 10.5 95 9 Q97 7.5 98.5 9Z"
        fill="#e8c97a"
        opacity="0.7"
      />
      <path
        d="M95 12.5 Q93.5 11 95 9 Q96.5 11 95 12.5Z"
        fill="#e8c97a"
        opacity="0.7"
      />
      <path
        d="M91.5 9 Q93 7.5 95 9 Q93 10.5 91.5 9Z"
        fill="#e8c97a"
        opacity="0.7"
      />
      <path
        d="M130 9 Q124 4 118 7"
        stroke="#c9a55a"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M126 9 Q123 13 117 11"
        stroke="#c9a55a"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M121 9 Q117 5 112 8"
        stroke="#c9a55a"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <line
        x1="130"
        y1="9"
        x2="190"
        y2="9"
        stroke="#e8c97a"
        strokeWidth="0.8"
      />
    </svg>
  </div>
);

const initialForm = {
  name: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
};

const onlyDigits = (value) => value.replace(/\D/g, "");

const validateField = (name, value, formData = initialForm) => {
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

    if (digits.length !== 10) {
      return "Phone number must be 10 digits.";
    }

    if (!/^[6-9]/.test(digits)) {
      return "Enter a valid Indian mobile number.";
    }

    return "";
  }

  if (name === "email") {
    if (!trimmed) return "Email address is required.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(trimmed)) {
      return "Enter a valid email address.";
    }

    return "";
  }

  if (name === "subject") {
    if (!trimmed) return "";

    if (trimmed.length < 4) {
      return "Subject should be at least 4 characters.";
    }

    if (trimmed.length > 80) {
      return "Subject should be under 80 characters.";
    }

    return "";
  }

  if (name === "message") {
    if (!trimmed) return "Message is required.";

    if (trimmed.length < 15) {
      return "Message should be at least 15 characters.";
    }

    if (trimmed.length > 600) {
      return "Message should be under 600 characters.";
    }

    return "";
  }

  return "";
};

const validateForm = (formData) => {
  const errors = {};

  Object.keys(formData).forEach((key) => {
    const error = validateField(key, formData[key], formData);

    if (error) {
      errors[key] = error;
    }
  });

  return errors;
};

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
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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

    if (name === "phone") {
      finalValue = value.replace(/[^\d+\s-]/g, "");
    }

    const updatedForm = {
      ...formData,
      [name]: finalValue,
    };

    setFormData(updatedForm);

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, finalValue, updatedForm),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, formData),
    }));
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

        setTimeout(() => {
          setSent(false);
        }, 3000);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to send message.");
      })
      .finally(() => {
        setSending(false);
      });
  };

  const messageCount = formData.message.length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f0e8" }}>
      <div className="max-w-6xl px-4 mx-auto py-14 sm:px-6 lg:px-8">
        {/* ══ Page Title ══ */}
        <motion.div {...fadeUp(0)} className="mb-12 text-center">
          <p className="text-[#b87524] text-[11px] tracking-[0.3em] uppercase font-extrabold mb-3">
            • Get In Touch •
          </p>

          <h1
            className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Contact Us
          </h1>

          <PremiumDivider />

          <p className="max-w-xl mx-auto text-sm font-medium leading-relaxed text-gray-500">
            We'd love to hear from you. Visit us at Khatipura or drop us a
            message and we'll get back to you shortly.
          </p>
        </motion.div>

        <div
          className="relative grid items-start grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr]"
          style={{ fontFamily: "'Inter', 'DM Sans', sans-serif" }}
        >
          {/* SOFT BACKGROUND DECOR */}
          <div className="absolute pointer-events-none -left-24 top-20 text-[#d6b36a]/10 text-[180px] select-none hidden xl:block">
            ❧
          </div>

          <div className="absolute pointer-events-none -right-20 bottom-10 text-[#d6b36a]/10 text-[180px] select-none hidden xl:block">
            ❧
          </div>

          {/* ══ LEFT — Info + Map ══ */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4"
          >
            {/* ADDRESS */}
            <motion.div
              {...fadeUp(0)}
              className="group flex items-center gap-5 bg-white/90 rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.07)] border border-[#efe5d4] px-5 py-5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#fff7ea] border border-[#f1dfbd] text-[#b87524] shrink-0 shadow-sm">
                <MapPin size={25} strokeWidth={1.8} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="mb-1 text-[11px] font-extrabold tracking-[0.18em] uppercase text-[#b87524]">
                  Address
                </p>
                <p
                  className="text-base font-bold leading-snug text-[#1f2937]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Khatipura, Near Lal Mandir Road
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-500">
                  Jaipur, Rajasthan 302012, India
                </p>
              </div>

              <ChevronRight
                size={22}
                className="text-[#b87524] transition group-hover:translate-x-1"
              />
            </motion.div>

            {/* CALL */}
            <motion.div
              {...fadeUp(0.08)}
              className="group flex items-center gap-5 bg-white/90 rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.07)] border border-[#efe5d4] px-5 py-5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#fff7ea] border border-[#f1dfbd] text-[#b87524] shrink-0 shadow-sm">
                <Phone size={24} strokeWidth={1.8} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="mb-1 text-[11px] font-extrabold tracking-[0.18em] uppercase text-[#b87524]">
                  Call Us
                </p>
                <p
                  className="text-lg font-bold leading-snug text-[#1f2937]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  +91 98765 43210
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-500">
                  Mon – Sun, 9:00 AM – 10:00 PM
                </p>
              </div>

              <ChevronRight
                size={22}
                className="text-[#b87524] transition group-hover:translate-x-1"
              />
            </motion.div>

            {/* EMAIL */}
            <motion.div
              {...fadeUp(0.16)}
              className="group flex items-center gap-5 bg-white/90 rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.07)] border border-[#efe5d4] px-5 py-5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#fff7ea] border border-[#f1dfbd] text-[#b87524] shrink-0 shadow-sm">
                <Mail size={24} strokeWidth={1.8} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="mb-1 text-[11px] font-extrabold tracking-[0.18em] uppercase text-[#b87524]">
                  Email Us
                </p>
                <p
                  className="text-base font-bold leading-snug break-all text-[#1f2937]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  whitehousecafe@gmail.com
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-500">
                  We reply within 24 hours
                </p>
              </div>

              <ChevronRight
                size={22}
                className="text-[#b87524] transition group-hover:translate-x-1"
              />
            </motion.div>

            {/* HOURS */}
            <motion.div
              {...fadeUp(0.24)}
              className="group flex items-center gap-5 bg-white/90 rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.07)] border border-[#efe5d4] px-5 py-5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#fff7ea] border border-[#f1dfbd] text-[#b87524] shrink-0 shadow-sm">
                <Clock size={24} strokeWidth={1.8} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="mb-1 text-[11px] font-extrabold tracking-[0.18em] uppercase text-[#b87524]">
                  Opening Hours
                </p>
                <p
                  className="text-lg font-bold leading-snug text-[#1f2937]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Daily · 9:00 AM – 10:00 PM
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-500">
                  Come by for coffee, meals & memories.
                </p>
              </div>

              <ChevronRight
                size={22}
                className="text-[#b87524] transition group-hover:translate-x-1"
              />
            </motion.div>

            {/* SOCIAL */}
            <motion.div
              {...fadeUp(0.3)}
              className="flex flex-col gap-4 px-5 py-5 bg-white/90 border border-[#efe5d4] shadow-[0_10px_30px_rgba(15,23,42,0.07)] rounded-2xl sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-5">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#fff7ea] border border-[#f1dfbd] text-[#b87524] shrink-0 shadow-sm">
                  <Users size={24} strokeWidth={1.8} />
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-extrabold tracking-[0.18em] uppercase text-[#b87524]">
                    Stay Connected
                  </p>
                  <p className="text-sm font-semibold text-slate-500">
                    Follow us for updates, offers & more
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center w-10 h-10 text-[#8b5e22] transition border rounded-full bg-white border-[#f1dfbd] hover:bg-[#fff7ea]"
                >
                  <Instagram size={18} />
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center w-10 h-10 text-[#8b5e22] transition border rounded-full bg-white border-[#f1dfbd] hover:bg-[#fff7ea]"
                >
                  <Facebook size={18} />
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center w-10 h-10 text-[#8b5e22] transition border rounded-full bg-white border-[#f1dfbd] hover:bg-[#fff7ea]"
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            </motion.div>

            {/* MAP */}
            <motion.div
              {...fadeUp(0.36)}
              className="relative overflow-hidden border border-[#efe5d4] shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl bg-white"
            >
              <iframe
                src="https://www.google.com/maps?q=Khatipura,Jaipur&output=embed"
                className="block w-full border-0 grayscale-[10%] sepia-[8%]"
                height="250"
                loading="lazy"
                title="Google Map"
              />

              <a
                href="https://www.google.com/maps?q=Khatipura,Jaipur"
                target="_blank"
                rel="noreferrer"
                className="absolute inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#1f2937] transition bg-white border border-[#efe5d4] rounded-full shadow-md left-4 bottom-4 hover:bg-[#fff7ea]"
              >
                Open in Maps
                <Navigation size={15} className="text-[#b87524]" />
              </a>
            </motion.div>
          </motion.div>

          {/* ══ RIGHT — Form ══ */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="relative overflow-hidden bg-white/95 border border-[#efe5d4] shadow-[0_16px_45px_rgba(15,23,42,0.09)] rounded-3xl">
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
                    <p className="text-[#b87524] text-[11px] tracking-[0.32em] uppercase font-extrabold">
                      Send a Message
                    </p>
                    <div className="w-12 h-[1px] bg-[#d6a84f]" />
                  </div>

                  <h2
                    className="max-w-xl text-3xl font-bold leading-tight text-[#111936] sm:text-4xl"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    We’d Love to Hear From You
                  </h2>

                  <p className="max-w-xl mt-3 text-sm font-medium leading-relaxed text-slate-500 sm:text-base">
                    Have a question, feedback, or special request? Send us a
                    message and our team will get back to you as soon as
                    possible.
                  </p>

                  <div className="scale-110 sm:scale-150">
                    <PremiumDivider />
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Name + Phone */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-[13px] font-extrabold text-[#3f3f46]">
                        Your Name <span className="text-red-500">*</span>
                      </label>

                      <div className={fieldWrapClass("name")}>
                        <User size={17} className="text-[#b87524]" />
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
                      <label className="block mb-2 text-[13px] font-extrabold text-[#3f3f46]">
                        Phone Number
                      </label>

                      <div className={fieldWrapClass("phone")}>
                        <Phone size={17} className="text-[#b87524]" />
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

                  {/* Email */}
                  <div>
                    <label className="block mb-2 text-[13px] font-extrabold text-[#3f3f46]">
                      Email Address <span className="text-red-500">*</span>
                    </label>

                    <div className={fieldWrapClass("email")}>
                      <Mail size={17} className="text-[#b87524]" />
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

                  {/* Subject */}
                  <div>
                    <label className="block mb-2 text-[13px] font-extrabold text-[#3f3f46]">
                      Subject
                    </label>

                    <div className={fieldWrapClass("subject")}>
                      <Tag size={17} className="text-[#b87524]" />
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

                  {/* Message */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <label className="block text-[13px] font-extrabold text-[#3f3f46]">
                        Message <span className="text-red-500">*</span>
                      </label>

                      <span
                        className={`text-[11px] font-bold ${
                          messageCount > 600
                            ? "text-red-500"
                            : messageCount >= 15
                              ? "text-emerald-600"
                              : "text-slate-400"
                        }`}
                      >
                        {messageCount}/600
                      </span>
                    </div>

                    <div className={messageWrapClass("message")}>
                      <MessageCircle
                        size={17}
                        className="text-[#b87524] mt-0.5"
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

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex items-center justify-center w-full gap-3 py-3.5 text-base font-bold text-white transition-all duration-300 shadow-[0_10px_24px_rgba(180,83,9,0.25)] rounded-xl bg-gradient-to-r from-[#d97706] via-[#e6a526] to-[#b87524] hover:shadow-[0_14px_30px_rgba(180,83,9,0.34)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {sending
                      ? "Sending..."
                      : sent
                        ? "Message Sent!"
                        : "Send Message"}
                    <Send size={17} />
                  </button>

                  <p className="flex items-center justify-center gap-2 pt-1 text-[12px] font-medium text-slate-400">
                    <Lock size={13} className="text-[#b87524]" />
                    Your information is safe and never shared.
                  </p>
                </form>
              </div>
            </div>

            {/* BOTTOM NOTE CARD */}
            <motion.div
              {...fadeUp(0.4)}
              className="grid grid-cols-1 gap-4 px-6 py-5 mt-5 bg-white/90 border border-[#efe5d4] shadow-[0_10px_30px_rgba(15,23,42,0.07)] rounded-2xl sm:grid-cols-2"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#fff7ea] border border-[#f1dfbd] text-[#b87524]">
                  <Utensils size={22} />
                </div>
                <div>
                  <p className="font-bold text-[#1f2937]">
                    Planning a special visit?
                  </p>
                  <p className="text-xs font-medium leading-relaxed text-slate-500">
                    For reservations, events or large groups, please call us
                    directly.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:border-l sm:border-[#eadfcd] sm:pl-5">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#fff7ea] border border-[#f1dfbd] text-[#b87524]">
                  <Clock size={22} />
                </div>
                <div>
                  <p className="font-bold text-[#1f2937]">
                    We typically respond
                  </p>
                  <p className="text-xs font-medium leading-relaxed text-slate-500">
                    within 24 hours
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ══ Footer note ══ */}
        <motion.div {...fadeUp(0.2)} className="text-center mt-14">
          <PremiumDivider />
          <p className="mt-2 text-xs text-gray-400">
            Built with 🤍 using{" "}
            <span className="font-semibold text-[#b87524]">FoodDash</span> •
            Smart Dining Experience
          </p>
        </motion.div>
      </div>
    </div>
  );
}
