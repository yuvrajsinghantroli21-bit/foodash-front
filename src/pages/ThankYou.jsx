import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Coffee,
  Home,
  Loader2,
  MessageSquareText,
  Sparkles,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const API = "https://fooadash.onrender.com/api";

function ThankYou() {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const table = useMemo(() => localStorage.getItem("table") || "", []);
  const token = useMemo(() => localStorage.getItem("token") || "", []);

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("table");
    localStorage.removeItem("cart");
  }, []);

  const activeRating = hoverRating || rating;

  const submitFeedback = (e) => {
    e.preventDefault();

    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    setSending(true);

    axios
      .post(`${API}/feedback`, {
        table,
        token,
        customerName,
        rating,
        message,
      })
      .then(() => {
        setSubmitted(true);
        toast.success("Thank you for your feedback");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Feedback failed");
      })
      .finally(() => {
        setSending(false);
      });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6efe3] text-[#2f1d12]">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(231,196,116,0.34),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(61,36,18,0.18),transparent_38%)]" />

      <div className="absolute left-[-120px] top-24 h-80 w-80 rounded-full bg-[#e7c474]/25 blur-3xl" />
      <div className="absolute bottom-[-140px] right-[-90px] h-96 w-96 rounded-full bg-[#8b5a2b]/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 0.22, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute left-1/2 top-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c9a55a]"
      />

      {/* DECORATIVE LINES */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        viewBox="0 0 1440 900"
        fill="none"
      >
        <motion.path
          d="M240 900 C160 630, 210 250, 430 0"
          stroke="#c9a55a"
          strokeWidth="1.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4 }}
        />
        <motion.path
          d="M1210 900 C1280 620, 1230 230, 1010 0"
          stroke="#7a4a24"
          strokeWidth="1.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.15 }}
        />
      </svg>

      <main className="relative z-10 flex items-center justify-center min-h-screen px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 34, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-5xl overflow-hidden rounded-[2.3rem] border border-[#eadfcd] bg-[#fffaf1]/88 shadow-[0_32px_90px_rgba(61,36,18,0.16)] backdrop-blur-2xl"
        >
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            {/* LEFT THANK YOU */}
            <section className="relative overflow-hidden p-7 sm:p-10 lg:p-12">
              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#e7c474]/25 blur-2xl" />

              <motion.div
                initial={{ scale: 0, rotate: -18 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 140 }}
                className="mb-7 flex h-16 w-16 items-center justify-center rounded-full border border-[#e7c474]/70 bg-[#3d2412] text-[#e7c474] shadow-xl"
              >
                <CheckCircle2 size={34} />
              </motion.div>

              <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#b45309]">
                <Sparkles size={14} />
                The White House Café
              </p>

              <h1
                className="max-w-xl text-4xl font-black leading-[0.98] tracking-[-0.05em] text-[#2f1d12] sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Thank you for dining with us.
              </h1>

              <div className="flex items-center gap-3 my-7">
                <div className="h-px w-16 bg-[#c9a55a]" />
                <Coffee className="text-[#b45309]" size={19} />
                <div className="h-px w-16 bg-[#c9a55a]" />
              </div>

              <p className="max-w-xl text-base leading-8 text-[#6f5544] sm:text-lg">
                Your order has been completed. We hope the food, service, and
                café experience made your visit special.
              </p>

              <div className="mt-8 rounded-[1.7rem] border border-[#eadfcd] bg-white/55 p-5">
                <p className="text-sm font-semibold leading-7 text-[#624633]">
                  “Good food becomes memorable when it is served with warmth.
                  Thank you for being part of our table today.”
                </p>

                {table && (
                  <p className="mt-4 inline-flex rounded-full bg-[#3d2412] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#e7c474]">
                    Table {table}
                  </p>
                )}
              </div>

              <Link
                to="/"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#3d2412] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#f8e7b0] shadow-[0_16px_35px_rgba(61,36,18,0.22)] transition hover:-translate-y-0.5 hover:bg-[#2a170d]"
              >
                <Home size={17} />
                Go to Home
                <ArrowRight size={17} />
              </Link>
            </section>

            {/* RIGHT FEEDBACK */}
            <section className="border-t border-[#eadfcd] bg-white/50 p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
              {!submitted ? (
                <form onSubmit={submitFeedback}>
                  <div className="mb-7">
                    <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#b45309]">
                      <MessageSquareText size={15} />
                      Your Feedback
                    </p>

                    <h2 className="text-2xl font-black tracking-[-0.04em] text-[#2f1d12] sm:text-3xl">
                      How was your experience?
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-[#7a6252]">
                      Your review helps us improve the food, service, and café
                      experience.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mb-7">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onMouseEnter={() => setHoverRating(num)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(num)}
                        className="transition hover:-translate-y-1"
                      >
                        <Star
                          size={34}
                          className={
                            num <= activeRating
                              ? "fill-[#d59b22] text-[#d59b22]"
                              : "text-[#d8c7b4]"
                          }
                        />
                      </button>
                    ))}
                  </div>

                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="mb-4 w-full rounded-2xl border border-[#eadfcd] bg-[#fffaf1] px-5 py-3 text-sm font-semibold text-[#3d2412] outline-none transition placeholder:text-[#a98d78] focus:border-[#c9a55a] focus:ring-4 focus:ring-[#e7c474]/20"
                  />

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a short message..."
                    rows="5"
                    maxLength="500"
                    className="w-full resize-none rounded-2xl border border-[#eadfcd] bg-[#fffaf1] px-5 py-4 text-sm font-semibold leading-7 text-[#3d2412] outline-none transition placeholder:text-[#a98d78] focus:border-[#c9a55a] focus:ring-4 focus:ring-[#e7c474]/20"
                  />

                  <div className="mt-2 text-right text-[11px] font-bold text-[#a98d78]">
                    {message.length}/500
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#b45309] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_35px_rgba(180,83,9,0.24)] transition hover:-translate-y-0.5 hover:bg-[#92400e] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Sending
                      </>
                    ) : (
                      <>
                        Submit Feedback
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex h-full min-h-[420px] flex-col items-center justify-center text-center"
                >
                  <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={42} />
                  </div>

                  <h2 className="text-3xl font-black tracking-[-0.04em] text-[#2f1d12]">
                    Feedback received
                  </h2>

                  <p className="mt-4 max-w-sm text-sm leading-7 text-[#7a6252]">
                    Thank you for helping us make The White House Café better.
                    We hope to serve you again soon.
                  </p>

                  <Link
                    to="/"
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#3d2412] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#f8e7b0] transition hover:-translate-y-0.5"
                  >
                    Go to Home
                    <ArrowRight size={17} />
                  </Link>
                </motion.div>
              )}
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default ThankYou;
