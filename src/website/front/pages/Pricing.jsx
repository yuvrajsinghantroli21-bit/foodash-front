import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Crown,
  Globe2,
  Loader2,
  Minus,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../superadmin/api/superAdminApi";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const plans = [
  {
    name: "Website",
    price: 499,
    tag: "Online presence",
    icon: Globe2,
    description:
      "For restaurants that only need a branded website and menu preview.",
    features: [
      "Restaurant website",
      "Menu preview page",
      "About and contact pages",
      "Basic theme setup",
      "No ordering system",
    ],
  },
  {
    name: "Starter",
    price: 999,
    tag: "QR ordering",
    icon: Sparkles,
    description: "Start QR ordering with menu, cart, admin and kitchen flow.",
    features: [
      "QR ordering",
      "Menu management",
      "Admin dashboard",
      "Kitchen display",
      "Basic settings",
    ],
  },
  {
    name: "Pro",
    price: 1299,
    tag: "Most balanced",
    icon: Zap,
    popular: true,
    description: "For restaurants that want analytics, coupons and feedback.",
    features: [
      "Everything in Starter",
      "Analytics",
      "Coupons",
      "Feedback",
      "Premium website",
    ],
  },
];

const comparisonRows = [
  {
    feature: "Restaurant website",
    website: true,
    starter: true,
    pro: true,
  },
  {
    feature: "Menu preview page",
    website: true,
    starter: true,
    pro: true,
  },
  {
    feature: "About and contact pages",
    website: true,
    starter: true,
    pro: true,
  },
  {
    feature: "QR table ordering",
    website: false,
    starter: true,
    pro: true,
  },
  {
    feature: "Cart and order placement",
    website: false,
    starter: true,
    pro: true,
  },
  {
    feature: "Admin order dashboard",
    website: false,
    starter: true,
    pro: true,
  },
  {
    feature: "Kitchen display",
    website: false,
    starter: true,
    pro: true,
  },
  {
    feature: "Table/session management",
    website: false,
    starter: "Basic",
    pro: "Advanced",
  },
  {
    feature: "Coupons",
    website: false,
    starter: false,
    pro: true,
  },
  {
    feature: "Feedback system",
    website: false,
    starter: false,
    pro: true,
  },
  {
    feature: "Analytics dashboard",
    website: false,
    starter: "Basic",
    pro: true,
  },
  {
    feature: "Branding customization",
    website: "Basic",
    starter: "Basic",
    pro: "Premium",
  },
];

function Pricing() {
  const navigate = useNavigate();
  const [buyingPlan, setBuyingPlan] = useState("");

  const ownerLoggedIn = useMemo(() => {
    return Boolean(localStorage.getItem("ownerToken"));
  }, []);

  const getOwner = () => {
    try {
      return JSON.parse(localStorage.getItem("ownerUser")) || null;
    } catch {
      return null;
    }
  };

  const buyPlan = (plan) => {
    const ownerToken = localStorage.getItem("ownerToken");
    const ownerUser = getOwner();

    if (!ownerToken || !ownerUser) {
      toast.error("Please login before buying a plan");
      navigate("/login");
      return;
    }

    setBuyingPlan(plan.name);

    loadRazorpayScript()
      .then((loaded) => {
        if (!loaded) {
          toast.error("Razorpay failed to load");
          setBuyingPlan("");
          return null;
        }

        return api.post("/owner/create-razorpay-order", {
          amount: plan.price,
          selectedPlan: plan.name.toLowerCase(),
        });
      })
      .then((res) => {
        if (!res) return;

        const order = res.data.order;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "FoodDash",
          description: `${plan.name} Plan`,
          order_id: order.id,

          handler: function (response) {
            api
              .post("/owner/verify-razorpay-payment", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,

                ownerId: ownerUser._id || ownerUser.id,
                name: ownerUser.name,
                email: ownerUser.email,
                phone: ownerUser.phone || "",
                restaurantName:
                  ownerUser.restaurantName ||
                  ownerUser.restaurant?.name ||
                  "Your Restaurant",
                selectedPlan: plan.name.toLowerCase(),
                amount: plan.price,
              })
              .then(() => {
                sessionStorage.setItem(
                  "foodash_payment_success_notice",
                  "true",
                );
                toast.success("Payment successful. Request sent for review.");
                navigate("/business");
              })
              .catch((err) => {
                toast.error(
                  err.response?.data?.message || "Payment verification failed",
                );
              })
              .finally(() => {
                setBuyingPlan("");
              });
          },

          prefill: {
            name: ownerUser.name,
            email: ownerUser.email,
            contact: ownerUser.phone || "",
          },

          theme: {
            color: "#2b170d",
          },

          modal: {
            ondismiss: () => setBuyingPlan(""),
          },
        };

        new window.Razorpay(options).open();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Payment failed");
        setBuyingPlan("");
      });
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f8efe3] text-[#2b170d]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.06, 1], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute rounded-full -top-40 left-10 h-96 w-96 bg-amber-300/18 blur-3xl"
        />

        <motion.div
          animate={{ scale: [1.08, 1, 1.08], y: [0, 24, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-0 top-56 h-[28rem] w-[28rem] rounded-full bg-[#5b2b12]/10 blur-3xl"
        />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(91,43,18,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(91,43,18,0.045)_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      <main className="relative px-5 mx-auto max-w-7xl py-14 sm:px-8 lg:px-10">
        <section className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-amber-700 shadow-sm backdrop-blur-xl"
          >
            <Sparkles size={14} />
            FoodDash Pricing
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-5xl font-black tracking-[-0.085em] text-[#241207] sm:text-6xl lg:text-7xl"
          >
            Plans that match your restaurant stage.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-7 text-[#7a5a40]"
          >
            Start with a website-only plan or unlock the full QR ordering
            system. Every paid request is reviewed by the FoodDash team before
            access is granted.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="mx-auto mt-7 flex max-w-xl flex-col gap-3 rounded-[1.5rem] border border-sky-100 bg-white/80 p-4 text-left shadow-[0_18px_55px_rgba(70,36,14,0.08)] backdrop-blur-xl sm:flex-row sm:items-center"
          >
            <div className="flex items-center justify-center h-11 w-11 shrink-0 rounded-2xl bg-sky-100 text-sky-700">
              <ShieldCheck size={20} />
            </div>

            <p className="text-sm font-bold leading-6 text-[#6b4a32]">
              {ownerLoggedIn
                ? "You are logged in. Choose a plan and continue securely with Razorpay."
                : "Login is required before payment. If you click Buy Plan, you will be redirected to login."}
            </p>
          </motion.div>
        </section>

        <section className="grid gap-6 mt-12 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const Icon = plan.icon;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                className={`group relative overflow-hidden rounded-[2.5rem] border p-7 shadow-[0_28px_90px_rgba(70,36,14,0.12)] transition duration-300 hover:-translate-y-2 ${
                  plan.popular
                    ? "border-[#2b170d] bg-[#2b170d] text-white"
                    : "border-white/70 bg-white/85 text-[#2b170d] backdrop-blur-xl"
                }`}
              >
                <div
                  className={`absolute right-0 top-0 h-44 w-44 rounded-full blur-3xl ${
                    plan.popular ? "bg-amber-300/20" : "bg-amber-200/35"
                  }`}
                />

                {plan.popular && (
                  <div className="absolute right-5 top-5 rounded-full bg-amber-300 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#2b170d]">
                    Most Popular
                  </div>
                )}

                <div className="relative">
                  <div
                    className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${
                      plan.popular
                        ? "bg-white/10 text-amber-300"
                        : "bg-[#2b170d] text-amber-300"
                    }`}
                  >
                    <Icon size={24} />
                  </div>

                  <div
                    className={`mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${
                      plan.popular
                        ? "border border-white/15 bg-white/10 text-amber-100"
                        : "border border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {plan.tag}
                  </div>

                  <h2 className="text-3xl font-black tracking-[-0.05em]">
                    {plan.name}
                  </h2>

                  <p
                    className={`mt-3 text-sm leading-6 ${
                      plan.popular ? "text-white/65" : "text-[#7a5a40]"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div className="flex items-end gap-2 mt-7">
                    <span className="text-5xl font-black tracking-[-0.06em]">
                      ₹{plan.price}
                    </span>
                    <span
                      className={`mb-2 text-sm font-bold ${
                        plan.popular ? "text-white/50" : "text-[#7a5a40]"
                      }`}
                    >
                      /month
                    </span>
                  </div>

                  <div className="space-y-3 mt-7">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <CheckCircle2
                          size={18}
                          className={
                            plan.popular ? "text-amber-300" : "text-emerald-600"
                          }
                        />
                        <span className="text-sm font-bold">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    className={`mt-7 rounded-2xl p-4 text-xs font-semibold leading-6 ${
                      plan.popular
                        ? "border border-white/10 bg-white/10 text-white/70"
                        : "border border-amber-100 bg-[#fffaf2] text-[#6b4a32]"
                    }`}
                  >
                    Payment creates a review request. If rejected, refund will
                    be processed within 7 working days.
                  </div>

                  <button
                    onClick={() => buyPlan(plan)}
                    disabled={buyingPlan === plan.name}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black uppercase tracking-[0.16em] transition disabled:opacity-70 ${
                      plan.popular
                        ? "bg-amber-300 text-[#2b170d] hover:bg-amber-200"
                        : "bg-[#2b170d] text-amber-100 hover:bg-[#1b0f08]"
                    }`}
                  >
                    {buyingPlan === plan.name ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Buy Plan
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </section>

        <section className="mt-12 overflow-hidden rounded-[2.5rem] border border-[#eadcc6] bg-[#fffaf2]/90 shadow-[0_28px_95px_rgba(70,36,14,0.10)] backdrop-blur-xl">
          <div className="border-b border-[#eadcc6] px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">
                  Plan Comparison
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[#241207]">
                  Compare without the confusion.
                </h2>

                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#7a5a40]">
                  A minimal breakdown of what each plan unlocks for your
                  restaurant.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#eadcc6] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#6b4a32]">
                <BadgeCheck size={15} />
                Reviewed activation
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[820px]">
              <div className="grid grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr] border-b border-[#eadcc6] bg-white/70">
                <div className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-[#8a6a4d]">
                  Feature
                </div>

                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`px-6 py-5 text-center text-xs font-black uppercase tracking-[0.2em] ${
                      plan.popular
                        ? "bg-[#2b170d] text-amber-200"
                        : "text-[#8a6a4d]"
                    }`}
                  >
                    {plan.name}
                  </div>
                ))}
              </div>

              {comparisonRows.map((row, index) => (
                <motion.div
                  key={row.feature}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.018 }}
                  className="grid grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr] border-b border-[#eadcc6]/80 last:border-b-0 transition hover:bg-white/75"
                >
                  <div className="px-6 py-4 text-sm font-black text-[#2b170d]">
                    {row.feature}
                  </div>

                  <CompareCell value={row.website} />
                  <CompareCell value={row.starter} />
                  <CompareCell value={row.pro} popular />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[2.3rem] border border-sky-100 bg-white/85 p-6 shadow-[0_24px_80px_rgba(70,36,14,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-2xl bg-sky-100 text-sky-700">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h3 className="text-xl font-black text-[#241207]">
                  Manual review after payment
                </h3>

                <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#7a5a40]">
                  Payment creates a paid pending review request. FoodDash checks
                  details before granting system access, so fake or invalid
                  requests do not get dashboards automatically.
                </p>
              </div>
            </div>

            <Link
              to="/business"
              className="inline-flex items-center justify-center rounded-full border border-amber-100 bg-[#fffaf2] px-5 py-3 text-sm font-black text-amber-800 transition hover:bg-white"
            >
              Go to Business Portal
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function CompareCell({ value, popular }) {
  return (
    <div
      className={`flex items-center justify-center px-6 py-4 text-center ${
        popular ? "bg-[#2b170d]/[0.035]" : ""
      }`}
    >
      {value === true ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
          <Check size={14} />
          Included
        </span>
      ) : value === false ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-50 px-3 py-1.5 text-xs font-black text-stone-400 ring-1 ring-stone-100">
          <Minus size={14} />
          Not included
        </span>
      ) : (
        <span
          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ring-1 ${
            popular
              ? "bg-[#2b170d] text-amber-100 ring-[#2b170d]"
              : "bg-white text-[#6b4a32] ring-[#eadcc6]"
          }`}
        >
          {value}
        </span>
      )}
    </div>
  );
}

export default Pricing;
