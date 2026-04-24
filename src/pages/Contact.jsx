import React, { useState } from "react";
import { motion } from "framer-motion";

const Divider = () => (
  <div className="flex items-center justify-center gap-3 my-4">
    <div className="w-12 h-[1px] bg-amber-400" />
    <span className="text-amber-500 text-lg">🌿</span>
    <div className="w-12 h-[1px] bg-amber-400" />
  </div>
);

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const CONTACT_INFO = [
  {
    emoji: "📍",
    label: "Address",
    value: "Khatipura, Near Lal Mandir Road, Jaipur",
    sub: "Rajasthan, India",
  },
  {
    emoji: "📞",
    label: "Call Us",
    value: "+91 98765 xxxxx",
    sub: "Mon – Sun, 9am – 10pm",
  },
  {
    emoji: "✉️",
    label: "Email Us",
    value: "whitehousecafe@gmail.com",
    sub: "We reply within 24 hours",
  },
];

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f0e8" }}>
      {/* Gold top accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

      <div className="max-w-6xl px-4 py-14 mx-auto sm:px-6 lg:px-8">
        {/* ══ Page Title ══ */}
        <motion.div {...fadeUp(0)} className="mb-12 text-center">
          <p className="text-emerald-600 text-[11px] tracking-[0.3em] uppercase font-semibold mb-3">
            • Get In Touch •
          </p>
          <h1
            className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Contact Us
          </h1>
          <Divider />
          <p className="max-w-xl mx-auto text-sm text-gray-500 leading-relaxed">
            We'd love to hear from you. Visit us at Khatipura or drop us a
            message and we'll get back to you shortly.
          </p>
        </motion.div>

        <div className="grid items-start grid-cols-1 gap-6 lg:grid-cols-2">
          {/* ══ LEFT — Info + Map ══ */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5"
          >
            {/* Contact info cards */}
            {CONTACT_INFO.map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                className="group flex items-center gap-5 bg-white rounded-2xl shadow-md border border-gray-100 px-6 py-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-2xl shrink-0">
                  {item.emoji}
                </div>
                <div>
                  <p className="text-[10px] text-amber-500 tracking-widest uppercase font-semibold mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              </motion.div>
            ))}

            {/* Map */}
            <motion.div
              {...fadeUp(0.3)}
              className="overflow-hidden rounded-2xl shadow-md border border-gray-100"
            >
              <iframe
                src="https://www.google.com/maps?q=Khatipura,Jaipur&output=embed"
                className="w-full border-0 block"
                height="240"
                loading="lazy"
                title="Google Map"
              />
            </motion.div>

            {/* Social / hours strip */}
            <motion.div
              {...fadeUp(0.35)}
              className="bg-white rounded-2xl shadow-md border border-gray-100 px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
            >
              <div>
                <p className="text-[10px] text-amber-500 tracking-widest uppercase font-semibold mb-0.5">
                  Opening Hours
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  Daily · 9:00 AM – 10:00 PM
                </p>
              </div>
              <div className="flex items-center gap-3">
                {["📘", "📸", "🐦"].map((icon, i) => (
                  <button
                    key={i}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-lg hover:bg-emerald-100 transition"
                  >
                    {icon}
                  </button>
                ))}
              </div>
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
            <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Top emerald accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-amber-400" />

              <div className="px-7 py-8 sm:px-9 sm:py-10">
                <div className="mb-7">
                  <p className="text-emerald-600 text-[10px] tracking-[0.25em] uppercase font-semibold mb-1">
                    Send a Message
                  </p>
                  <h2
                    className="text-2xl font-bold text-gray-900"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    We'd Love to Hear From You
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name + Phone */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        required
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Reservation, Feedback…"
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Write your message here…"
                      required
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full py-3 text-sm font-semibold text-white rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {sent ? "Message Sent! " : "Send Message "}
                  </button>

                  {/* Secure note */}
                  <p className="text-center text-[11px] text-gray-400 pt-1">
                    🔒 Your information is safe and never shared.
                  </p>
                </form>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ══ Footer note ══ */}
        <motion.div {...fadeUp(0.2)} className="mt-14 text-center">
          <Divider />
          <p className="text-xs text-gray-400 mt-2">
            Built with 🤍 using{" "}
            <span className="font-semibold text-emerald-600">FoodDash</span> •
            Smart Dining Experience
          </p>
        </motion.div>
      </div>
    </div>
  );
}
