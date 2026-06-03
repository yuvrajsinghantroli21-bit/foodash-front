import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  Coffee,
  Copy,
  Gift,
  Home,
  Loader2,
  MessageSquareText,
  Sparkles,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../api/api";

function ThankYou() {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [rewardCoupon, setRewardCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const table = useMemo(() => localStorage.getItem("table") || "", []);
  const token = useMemo(() => localStorage.getItem("token") || "", []);

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("table");
    localStorage.removeItem("cart");
  }, []);

  const activeRating = hoverRating || rating;

  const fetchRewardCoupon = () => {
    setCouponLoading(true);

    api
      .get("/coupons/feedback-reward")
      .then((res) => {
        if (res.data) {
          setRewardCoupon(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setCouponLoading(false);
      });
  };

  const submitFeedback = (e) => {
    e.preventDefault();

    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    setSending(true);

    api
      .post("/feedback", {
        table,
        token,
        customerName,
        rating,
        message,
      })
      .then(() => {
        setSubmitted(true);
        toast.success("Thank you for your feedback");
        fetchRewardCoupon();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Feedback failed");
      })
      .finally(() => {
        setSending(false);
      });
  };

  const copyCoupon = () => {
    if (!rewardCoupon?.code) return;

    navigator.clipboard.writeText(rewardCoupon.code);
    toast.success("Coupon copied!");
  };

  const getCouponText = (coupon) => {
    if (!coupon) return "";

    const discount =
      coupon.discountType === "percentage"
        ? `${coupon.discountValue}% OFF`
        : `₹${coupon.discountValue} OFF`;

    const minOrder = coupon.minOrderAmount
      ? ` on orders above ₹${coupon.minOrderAmount}`
      : "";

    return `${discount}${minOrder}`;
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#f6efe3] text-[#2f1d12]"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

        .whc-display {
          font-family: 'Fraunces', Georgia, serif;
          font-variation-settings: "SOFT" 35, "WONK" 0.2;
        }

        .whc-gold-text {
          background: linear-gradient(110deg, #7a3f16 0%, #c28a3c 42%, #8b5727 78%, #f1d694 100%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(231,196,116,0.34),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(61,36,18,0.18),transparent_38%)]" />

      <div className="absolute left-[-120px] top-24 h-80 w-80 rounded-full bg-[#e7c474]/25 blur-3xl" />
      <div className="absolute bottom-[-140px] right-[-90px] h-96 w-96 rounded-full bg-[#8b5a2b]/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 0.22, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute left-1/2 top-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c9a55a]"
      />

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

              <h1 className="whc-display max-w-xl text-[clamp(3rem,8vw,5.8rem)] font-[650] leading-[0.88] tracking-[-0.065em] text-[#2f1d12]">
                Thank you for dining with us.
              </h1>

              <div className="flex items-center gap-3 my-7">
                <div className="h-px w-16 bg-[#c9a55a]" />
                <Coffee className="text-[#b45309]" size={19} />
                <div className="h-px w-16 bg-[#c9a55a]" />
              </div>

              <p className="max-w-xl text-base font-semibold leading-8 text-[#6f5544] sm:text-lg">
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

                    <h2 className="whc-display text-4xl font-[620] leading-[0.95] tracking-[-0.055em] text-[#2f1d12]">
                      How was your experience?
                    </h2>

                    <p className="mt-3 text-sm font-semibold leading-7 text-[#7a6252]">
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
                    className="mb-4 w-full rounded-2xl border border-[#eadfcd] bg-[#fffaf1] px-5 py-3 text-sm font-bold text-[#3d2412] outline-none transition placeholder:text-[#a98d78] focus:border-[#c9a55a] focus:ring-4 focus:ring-[#e7c474]/20"
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
                  className="flex min-h-[420px] flex-col justify-center"
                >
                  <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={42} />
                  </div>

                  <div className="mt-6 text-center">
                    <h2 className="whc-display text-4xl font-[620] leading-[0.95] tracking-[-0.055em] text-[#2f1d12]">
                      Feedback received
                    </h2>

                    <p className="mx-auto mt-4 max-w-sm text-sm font-semibold leading-7 text-[#7a6252]">
                      Thank you for helping us make The White House Café better.
                      We hope to serve you again soon.
                    </p>
                  </div>

                  {couponLoading && (
                    <div className="mt-7 rounded-[1.7rem] border border-[#eadfcd] bg-[#fffaf1] p-5 text-center">
                      <Loader2
                        size={22}
                        className="mx-auto mb-2 animate-spin text-[#b45309]"
                      />
                      <p className="text-sm font-bold text-[#7a6252]">
                        Checking your thank-you reward...
                      </p>
                    </div>
                  )}

                  {!couponLoading && rewardCoupon && (
                    <motion.div
                      initial={{ opacity: 0, y: 18, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.45 }}
                      className="mt-7 overflow-hidden rounded-[1.8rem] border border-[#e7c474]/80 bg-[#fffaf1] shadow-[0_18px_48px_rgba(61,36,18,0.12)]"
                    >
                      <div className="bg-[#3d2412] px-5 py-4 text-[#f8e7b0]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8e7b0] text-[#3d2412]">
                            <Gift size={23} />
                          </div>

                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#e7c474]">
                              Thank you reward
                            </p>

                            <h3 className="whc-display text-2xl font-[620] tracking-[-0.04em] text-[#fffaf1]">
                              You unlocked a coupon!
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="rounded-2xl border border-dashed border-[#c98b3f] bg-white/75 p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#8f561a]">
                                <BadgePercent size={14} />
                                Coupon Code
                              </p>

                              <p className="mt-2 text-3xl font-black tracking-wide text-[#3d2412]">
                                {rewardCoupon.code}
                              </p>

                              <p className="mt-1 text-xs font-bold leading-6 text-[#3d2412]/58">
                                {getCouponText(rewardCoupon)}
                              </p>

                              {rewardCoupon.expiryDate && (
                                <p className="mt-1 text-[11px] font-black text-red-500">
                                  Valid till{" "}
                                  {new Date(
                                    rewardCoupon.expiryDate,
                                  ).toLocaleDateString("en-IN")}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={copyCoupon}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3d2412] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5"
                            >
                              <Copy size={15} />
                              Copy Code
                            </button>
                          </div>
                        </div>

                        <p className="mt-3 text-center text-[11px] font-bold text-[#7a6252]/70">
                          Use this coupon on your next order from the cart.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {!couponLoading && !rewardCoupon && (
                    <div className="mt-7 rounded-[1.7rem] border border-[#eadfcd] bg-[#fffaf1]/80 p-5 text-center">
                      <p className="text-sm font-bold text-[#7a6252]">
                        No reward coupon is active right now.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 mt-8 sm:flex-row">
                    <Link
                      to="/"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#3d2412] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#f8e7b0] transition hover:-translate-y-0.5"
                    >
                      Go to Home
                      <ArrowRight size={17} />
                    </Link>

                    <Link
                      to="/coupons"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#eadfcd] bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#3d2412] transition hover:-translate-y-0.5"
                    >
                      View Offers
                      <BadgePercent size={17} />
                    </Link>
                  </div>
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
