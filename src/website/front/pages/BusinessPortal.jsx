import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Globe2,
  Loader2,
  LogOut,
  Mail,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Store,
  WalletCards,
  XCircle,
  Crown,
  TimerReset,
  CalendarDays,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/ownerApi";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

const FOODASH_WEBSITE =
  import.meta.env.VITE_FOODASH_WEBSITE || "http://localhost:5173";

function BusinessPortal() {
  const [latestRequest, setLatestRequest] = useState(null);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [showSuccessNotice, setShowSuccessNotice] = useState(
    sessionStorage.getItem("foodash_payment_success_notice") === "true",
  );

  const ownerUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("ownerUser")) || {};
    } catch {
      return {};
    }
  }, []);

  const [freshOwner, setFreshOwner] = useState(null);

  const activeOwner = freshOwner || ownerUser;

  const ownerEmail = activeOwner.email || "owner@foodash.com";
  const ownerName = activeOwner.name || "Restaurant Owner";
  const restaurantName =
    activeOwner.restaurantName ||
    activeOwner.restaurant?.name ||
    "Your Restaurant";

  useEffect(() => {
    setLoadingRequest(true);

    api
      .get("/owner/my-plan-requests", {
        params: { email: ownerEmail },
      })
      .then((res) => {
        const requests = res.data.requests || [];
        setLatestRequest(requests[0] || null);
      })
      .catch(() => {
        setLatestRequest(null);
      })
      .finally(() => {
        setLoadingRequest(false);
      });
  }, [ownerEmail]);

  const fetchOwner = () => {
    api.get("/owner/me").then((res) => {
      const nextOwner = res.data.owner;
      setFreshOwner(nextOwner);
      localStorage.setItem("ownerUser", JSON.stringify(nextOwner));
    });
  };

  useEffect(() => {
    fetchOwner();
  }, []);

  const latestStatus = latestRequest?.status || "";
  const hasApprovedRequest = latestStatus === "approved";
  const hasPendingRequest = latestStatus === "paid_pending_review";
  const hasRejectedRequest =
    latestStatus === "refund_pending" ||
    latestStatus === "rejected" ||
    latestStatus === "refunded";

  const approvedSlug =
    activeOwner.restaurantSlug ||
    activeOwner.slug ||
    activeOwner.restaurant?.slug ||
    createSlug(restaurantName);

  const status = activeOwner.subscriptionStatus || latestStatus || "";
  const isActive = status === "active" || hasApprovedRequest;
  const isExpired = status === "expired";
  const hasAccess = isActive;

  const subscriptionStartDate =
    activeOwner.subscriptionStartDate ||
    activeOwner.restaurant?.subscriptionStartDate;

  const subscriptionExpiryDate =
    activeOwner.subscriptionExpiryDate ||
    activeOwner.restaurant?.subscriptionExpiryDate;

  const billingCycle =
    activeOwner.billingCycle ||
    activeOwner.restaurant?.billingCycle ||
    "monthly";

  const daysRemaining = getDaysRemaining(subscriptionExpiryDate);
  const expiryLabel = formatDate(subscriptionExpiryDate);
  const startLabel = formatDate(subscriptionStartDate);

  const currentPlanKey =
    activeOwner.plan ||
    activeOwner.restaurant?.plan ||
    normalizePlan(activeOwner.subscriptionPlan || latestRequest?.selectedPlan);

  const planName = isActive
    ? `${formatPlanName(currentPlanKey || activeOwner.subscriptionPlan)} Plan`
    : latestRequest
      ? `${formatPlanName(latestRequest.selectedPlan)} Plan`
      : "No Active Plan";

  const planPrice = latestRequest
    ? `₹${latestRequest.amount}`
    : isActive
      ? activeOwner.planPrice || "Plan price not added"
      : "No payment active";

  const activationText = isActive
    ? "Active now"
    : hasPendingRequest
      ? "Within 7 working days"
      : hasRejectedRequest
        ? "Paused"
        : "Available after approval";

  const statusInfo = getStatusInfo(status || latestStatus);
  const urls = getBusinessUrls(approvedSlug, hasAccess);

  const logout = () => {
    localStorage.removeItem("ownerToken");
    localStorage.removeItem("ownerUser");
    window.location.href = "/login";
  };

  const copyText = (text) => {
    if (!text || text === "Available after approval") return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const closeNotice = () => {
    sessionStorage.removeItem("foodash_payment_success_notice");
    setShowSuccessNotice(false);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7efe3] text-[#2b170d]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.06, 1], x: [0, 18, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute rounded-full -top-32 left-10 h-80 w-80 bg-amber-300/20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.05, 1, 1.05], y: [0, 22, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-0 top-40 h-96 w-96 rounded-full bg-[#5b2b12]/10 blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(91,43,18,0.08)_1px,transparent_0)] [background-size:26px_26px]" />
      </div>

      <main className="relative w-full px-3 py-4 mx-auto max-w-7xl sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex flex-col gap-4 rounded-[1.6rem] border border-white/70 bg-white/70 p-4 shadow-[0_20px_70px_rgba(70,36,14,0.08)] backdrop-blur-xl sm:mb-8 sm:rounded-[2rem] sm:p-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-amber-700">
              FoodDash Business
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#2b170d] sm:text-3xl">
              Business Portal
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-start lg:justify-end">
            <div
              className={`flex items-center gap-3 px-4 py-2 text-sm font-black border rounded-full ${statusInfo.pill}`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-black text-red-600 transition border border-red-100 rounded-full bg-red-50 hover:bg-red-100"
            >
              <LogOut size={16} />
              Logout
            </button>

            <button
              type="button"
              onClick={fetchOwner}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-50 hover:shadow-md active:translate-y-0"
            >
              <RefreshCw size={15} />
              Refresh Status
            </button>
          </div>
        </motion.header>

        {showSuccessNotice && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-[1.6rem] border border-sky-100 bg-gradient-to-r from-sky-600 to-blue-700 p-4 text-white shadow-[0_22px_70px_rgba(37,99,235,0.22)] sm:mb-8 sm:rounded-[2rem] sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-100">
                  Payment Received
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                  Thank you. Your request is under FoodDash review.
                </h2>
                <p className="max-w-3xl mt-2 text-sm font-semibold leading-6 text-white/80">
                  Our team will review your restaurant details and update you
                  within 7 working days. This message disappears after reload.
                </p>
              </div>

              <button
                onClick={closeNotice}
                className="rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:gap-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.55 }}
            className="relative overflow-hidden rounded-[2rem] bg-[#241207] p-5 text-white shadow-[0_35px_100px_rgba(36,18,7,0.35)] sm:rounded-[2.5rem] sm:p-8 lg:p-9"
          >
            <div className="absolute rounded-full -right-24 -top-24 h-72 w-72 bg-amber-400/25 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-orange-300/15 blur-3xl" />

            <div className="relative">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-amber-100">
                <Sparkles size={14} />
                {hasAccess ? "Your restaurant is live" : "Welcome to FoodDash"}
              </div>

              <h2 className="max-w-3xl break-words text-4xl font-black tracking-[-0.075em] text-white sm:text-5xl lg:text-6xl">
                {restaurantName}
              </h2>

              <p className="max-w-2xl mt-5 text-sm leading-6 text-white/65 sm:text-base sm:leading-7 lg:text-lg">
                {hasAccess
                  ? "Your FoodDash workspace is active. Open your live website, manage your admin dashboard, and track subscription status from one place."
                  : hasPendingRequest
                    ? "Your payment is received. The FoodDash team is reviewing your restaurant before activating the complete system."
                    : isExpired
                      ? "Your subscription has expired. Renew your plan to continue using FoodDash admin features and QR ordering."
                      : "Choose a FoodDash plan from the pricing page to activate your restaurant website, admin dashboard, QR ordering and analytics."}
              </p>

              <div className="grid gap-3 mt-7 sm:grid-cols-2">
                {hasAccess ? (
                  <>
                    <a
                      href={urls.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-black text-[#241207] shadow-[0_18px_45px_rgba(245,158,11,0.28)] transition hover:-translate-y-0.5 hover:bg-amber-300"
                    >
                      Open Live Website
                      <ExternalLink size={17} />
                    </a>

                    <a
                      href={urls.admin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-black text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15"
                    >
                      Open Admin Login
                      <ExternalLink size={17} />
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href={`${FOODASH_WEBSITE}/pricing`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-black text-[#241207] shadow-[0_18px_45px_rgba(245,158,11,0.28)] transition hover:-translate-y-0.5 hover:bg-amber-300"
                    >
                      {isExpired ? "Renew Your Plan" : "Choose Your Plan"}
                      <ArrowRight size={17} />
                    </a>

                    <a
                      href={`${FOODASH_WEBSITE}/contact`}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-black text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15"
                    >
                      Contact Support
                      <Mail size={17} />
                    </a>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.55, delay: 0.08 }}
            className="rounded-[2rem] border border-amber-100 bg-white/85 p-5 shadow-[0_25px_80px_rgba(70,36,14,0.12)] backdrop-blur-xl sm:rounded-[2.5rem] sm:p-6"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2b170d] text-amber-300 shadow-lg">
              <WalletCards size={25} />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">
              Current Plan
            </p>

            <h3 className="mt-2 text-3xl font-black tracking-[-0.05em] capitalize">
              {planName}
            </h3>

            <p className="mt-1 text-sm font-bold text-[#6b4a32]">{planPrice}</p>

            <div className="mt-5 rounded-[1.6rem] border border-amber-100 bg-[#fffaf2] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-700">
                    Days Remaining
                  </p>
                  <h4 className="mt-1 text-4xl font-black tracking-[-0.06em] text-[#2b170d]">
                    {subscriptionExpiryDate ? daysRemaining : "—"}
                  </h4>
                </div>
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                    daysRemaining <= 7 && subscriptionExpiryDate
                      ? "bg-red-100 text-red-600"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {daysRemaining <= 7 && subscriptionExpiryDate ? (
                    <AlertTriangle size={28} />
                  ) : (
                    <TimerReset size={28} />
                  )}
                </div>
              </div>

              {subscriptionExpiryDate && daysRemaining <= 7 && (
                <p className="mt-3 text-xs font-bold leading-5 text-red-600">
                  Your plan is close to expiry. Renew early to avoid
                  interruption.
                </p>
              )}
            </div>

            <div className="h-px my-6 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

            <div className="space-y-4">
              <InfoLine
                icon={<BadgeCheck size={18} />}
                label="Status"
                value={statusInfo.label}
              />
              <InfoLine
                icon={<Crown size={18} />}
                label="Plan Type"
                value={formatPlanName(currentPlanKey)}
              />
              <InfoLine
                icon={<CalendarClock size={18} />}
                label="Activated On"
                value={startLabel}
              />
              <InfoLine
                icon={<CalendarDays size={18} />}
                label="Expires On"
                value={expiryLabel}
              />
              <InfoLine
                icon={<RefreshCw size={18} />}
                label="Billing Cycle"
                value={formatPlanName(billingCycle)}
              />
              <InfoLine
                icon={<ReceiptText size={18} />}
                label="Billing"
                value={
                  latestRequest?.paymentId
                    ? "Payment verified"
                    : isActive
                      ? "Active subscription"
                      : "No payment yet"
                }
              />
            </div>
          </motion.div>
        </section>

        <section className="mt-5 grid gap-5 lg:mt-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.12 }}
            className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_22px_65px_rgba(70,36,14,0.09)] backdrop-blur-xl sm:rounded-[2.3rem] sm:p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2b170d] text-amber-300">
                <ShieldCheck size={25} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
                  Review Progress
                </p>
                <h3 className="text-2xl font-black tracking-[-0.05em]">
                  Current Status
                </h3>
              </div>
            </div>

            {loadingRequest ? (
              <div className="flex items-center justify-center min-h-40">
                <Loader2 className="animate-spin text-amber-700" size={28} />
              </div>
            ) : (
              <div>
                <div
                  className={`rounded-[1.5rem] border p-5 ${statusInfo.box}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${statusInfo.iconBg}`}
                    >
                      <statusInfo.icon size={22} />
                    </div>

                    <div>
                      <h4 className="text-xl font-black">
                        {statusInfo.heading}
                      </h4>
                      <p className="mt-2 text-sm font-semibold leading-6 opacity-75">
                        {statusInfo.description}
                      </p>
                    </div>
                  </div>
                </div>

                {latestRequest && (
                  <div className="mt-4 space-y-3">
                    <DetailRow
                      label="Requested Plan"
                      value={`${formatPlanName(latestRequest.selectedPlan)} Plan`}
                    />
                    <DetailRow
                      label="Amount Paid"
                      value={`₹${latestRequest.amount}`}
                    />
                    <DetailRow
                      label="Payment ID"
                      value={latestRequest.paymentId}
                    />
                    <DetailRow
                      label="Requested On"
                      value={new Date(latestRequest.createdAt).toLocaleString()}
                    />
                  </div>
                )}
              </div>
            )}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.16 }}
            className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_22px_65px_rgba(70,36,14,0.09)] backdrop-blur-xl sm:rounded-[2.3rem] sm:p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-100 text-amber-800">
                <Store size={25} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
                  Restaurant Access
                </p>
                <h3 className="text-2xl font-black tracking-[-0.05em]">
                  Links & Setup
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              <DetailRow label="Restaurant" value={restaurantName} />

              {hasAccess ? (
                <>
                  <LinkRow
                    label="Live Website"
                    value={urls.displayWebsite}
                    href={urls.website}
                    onCopy={() => copyText(urls.displayWebsite)}
                  />
                  <LinkRow
                    label="Admin Login"
                    value={urls.displayAdmin}
                    href={urls.admin}
                    onCopy={() => copyText(urls.displayAdmin)}
                  />
                </>
              ) : (
                <>
                  <DetailRow
                    label="Live Website"
                    value="Available after approval"
                  />
                  <DetailRow
                    label="Admin Login"
                    value="Available after approval"
                  />
                </>
              )}

              <DetailRow label="Owner Email" value={ownerEmail} />
              <DetailRow label="Owner Name" value={ownerName} />
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-amber-100 bg-[#fffaf2] p-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">
                {hasAccess
                  ? "System Ready"
                  : isExpired
                    ? "Renewal Needed"
                    : "Need a plan?"}
              </p>
              <h4 className="mt-2 text-xl font-black">
                {hasAccess
                  ? "Your FoodDash workspace is active"
                  : isExpired
                    ? "Renew to restart your workspace"
                    : "Start your FoodDash activation"}
              </h4>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#6b4a32]">
                {hasAccess
                  ? "You can now use the restaurant website and admin system. Features available depend on your current plan."
                  : isExpired
                    ? "Your restaurant website may stay visible, but admin and QR ordering access can be paused until renewal."
                    : "Plans are managed from the pricing page. Choose a plan, complete Razorpay payment, and wait for FoodDash review."}
              </p>

              {hasAccess ? (
                <a
                  href={urls.admin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#2b170d] px-5 py-3 text-sm font-black text-amber-100"
                >
                  Open Admin
                  <ExternalLink size={16} />
                </a>
              ) : (
                <a
                  href={`${FOODASH_WEBSITE}/pricing`}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#2b170d] px-5 py-3 text-sm font-black text-amber-100"
                >
                  {isExpired ? "Renew Plan" : "View Pricing"}
                  <ArrowRight size={16} />
                </a>
              )}
            </div>
          </motion.div>
        </section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.22 }}
          className={`mt-5 overflow-hidden rounded-[2rem] border p-5 shadow-[0_30px_85px_rgba(36,18,7,0.2)] sm:mt-7 sm:rounded-[2.3rem] sm:p-6 ${
            hasAccess
              ? "border-emerald-200 bg-gradient-to-r from-emerald-900 to-[#163427] text-white"
              : "border-[#3b2112] bg-[#2b170d] text-white"
          }`}
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200">
                FoodDash Support
              </p>

              <h3 className="mt-2 text-3xl font-black tracking-[-0.06em]">
                {hasAccess
                  ? "Your restaurant system is live and ready."
                  : isExpired
                    ? "Renew your FoodDash plan to continue."
                    : "Your restaurant will be activated after verification."}
              </h3>

              <p className="max-w-3xl mt-3 text-sm leading-6 text-white/65 sm:mt-4">
                {hasAccess
                  ? "Approved businesses can access their website and admin system based on the purchased plan. For setup help, contact FoodDash support."
                  : isExpired
                    ? "Renew from the pricing page or contact FoodDash support if you need manual extension."
                    : "Approved businesses get access to their selected FoodDash plan after review."}
              </p>
            </div>

            <div className="grid gap-3 sm:flex sm:flex-row lg:justify-end">
              {hasAccess && (
                <a
                  href={urls.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[#173528]"
                >
                  Open Website
                  <Globe2 size={16} />
                </a>
              )}

              <a
                href={`${FOODASH_WEBSITE}/contact`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-black text-white border rounded-full border-white/15 bg-white/10"
              >
                Contact Support
                <Mail size={16} />
              </a>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

function getBusinessUrls(slug, hasAccess) {
  if (!hasAccess || !slug) {
    return {
      website: "",
      admin: "",
      displayWebsite: "Available after approval",
      displayAdmin: "Available after approval",
    };
  }

  const { protocol, hostname, port } = window.location;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  if (isLocalhost) {
    const base = `${protocol}//${slug}.localhost${port ? `:${port}` : ""}`;
    return {
      website: base,
      admin: `${base}/admin/login`,
      displayWebsite: `${slug}.localhost${port ? `:${port}` : ""}`,
      displayAdmin: `${slug}.localhost${port ? `:${port}` : ""}/admin/login`,
    };
  }

  if (hostname.endsWith(".localhost")) {
    const rootBase = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
    return {
      website: rootBase,
      admin: `${rootBase}/admin/login`,
      displayWebsite: `${hostname}${port ? `:${port}` : ""}`,
      displayAdmin: `${hostname}${port ? `:${port}` : ""}/admin/login`,
    };
  }

  const productionBase = `${protocol}//${slug}.foodash.com`;
  return {
    website: productionBase,
    admin: `${productionBase}/admin/login`,
    displayWebsite: `${slug}.foodash.com`,
    displayAdmin: `${slug}.foodash.com/admin/login`,
  };
}

function getStatusInfo(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "paid_pending_review") {
    return {
      label: "Under Review",
      heading: "Payment received. Review pending.",
      description:
        "Your request is with the FoodDash team. You will get an update within 7 working days.",
      icon: Clock3,
      supportEmail: "support@foodash.com",
      pill: "border-sky-200 bg-sky-50 text-sky-700",
      dot: "bg-sky-500 shadow-[0_0_0_6px_rgba(14,165,233,0.14)]",
      box: "border-sky-100 bg-sky-50 text-sky-900",
      iconBg: "bg-sky-100 text-sky-700",
    };
  }

  if (normalized === "approved" || normalized === "active") {
    return {
      label: "Active",
      heading: "Your FoodDash system is active.",
      description:
        "Your restaurant setup has been approved. Website and admin access are enabled according to your plan.",
      icon: CheckCircle2,
      supportEmail: "support@foodash.com",
      pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.14)]",
      box: "border-emerald-100 bg-emerald-50 text-emerald-900",
      iconBg: "bg-emerald-100 text-emerald-700",
    };
  }

  if (normalized === "expired") {
    return {
      label: "Expired",
      heading: "Your subscription has expired.",
      description:
        "Renew your FoodDash plan to continue admin features and QR ordering access.",
      icon: AlertTriangle,
      supportEmail: "support@foodash.com",
      pill: "border-red-200 bg-red-50 text-red-700",
      dot: "bg-red-500 shadow-[0_0_0_6px_rgba(239,68,68,0.14)]",
      box: "border-red-100 bg-red-50 text-red-900",
      iconBg: "bg-red-100 text-red-700",
    };
  }

  if (normalized === "refund_pending" || normalized === "rejected") {
    return {
      label: "Refund Pending",
      heading: "Request rejected. Refund is pending.",
      description:
        "FoodDash has not approved this request. Refund will be processed according to policy.",
      icon: XCircle,
      supportEmail: "support@foodash.com",
      pill: "border-red-200 bg-red-50 text-red-700",
      dot: "bg-red-500 shadow-[0_0_0_6px_rgba(239,68,68,0.14)]",
      box: "border-red-100 bg-red-50 text-red-900",
      iconBg: "bg-red-100 text-red-700",
    };
  }

  if (normalized === "refunded") {
    return {
      label: "Refunded",
      heading: "Refund completed.",
      description:
        "This request has been refunded. You can choose another plan anytime.",
      icon: CheckCircle2,
      supportEmail: "support@foodash.com",
      pill: "border-stone-200 bg-stone-50 text-stone-700",
      dot: "bg-stone-500",
      box: "border-stone-100 bg-stone-50 text-stone-900",
      iconBg: "bg-stone-100 text-stone-700",
    };
  }

  return {
    label: "No Plan",
    heading: "No active plan yet.",
    description:
      "Choose a FoodDash plan from the pricing page to start your activation request.",
    icon: WalletCards,
    supportEmail: "support@foodash.com",
    pill: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500 shadow-[0_0_0_6px_rgba(245,158,11,0.14)]",
    box: "border-amber-100 bg-amber-50 text-amber-900",
    iconBg: "bg-amber-100 text-amber-800",
  };
}

function normalizePlan(plan) {
  const text = String(plan || "").toLowerCase();
  if (text.includes("starter")) return "starter";
  if (text.includes("pro") || text.includes("premium")) return "pro";
  if (text.includes("website") || text.includes("public")) return "website";
  return text || "website";
}

function formatPlanName(plan) {
  if (!plan) return "No Active";
  return String(plan)
    .replace(/-/g, " ")
    .replace(/halfyearly/gi, "Half-Yearly")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date) {
  if (!date) return "Not Set";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDaysRemaining(date) {
  if (!date) return 0;
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function createSlug(text) {
  return String(text || "restaurant")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function InfoLine({ icon, label, value }) {
  return (
    <div className="grid gap-2 rounded-2xl border border-amber-100 bg-[#fffaf2] p-3 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-4">
      <div className="flex items-center min-w-0 gap-3">
        <span className="text-amber-700">{icon}</span>
        <span className="text-sm font-black text-[#4b2c19]">{label}</span>
      </div>
      <span className="break-words text-left text-sm font-black text-[#2b170d] sm:text-right">
        {value}
      </span>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="grid gap-1 rounded-2xl border border-amber-100 bg-[#fffaf2] px-4 py-3 sm:flex sm:items-start sm:justify-between sm:gap-4">
      <span className="text-sm font-bold text-[#7a5a40]">{label}</span>
      <span className="min-w-0 break-words text-left text-sm font-black text-[#2b170d] sm:text-right">
        {value || "N/A"}
      </span>
    </div>
  );
}

function LinkRow({ label, value, href, onCopy }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-amber-100 bg-[#fffaf2] px-4 py-3 transition hover:border-amber-300 hover:bg-white sm:flex sm:items-center">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="grid flex-1 min-w-0 gap-1 sm:flex sm:items-center sm:justify-between sm:gap-4"
      >
        <span className="text-sm font-bold text-[#7a5a40]">{label}</span>
        <span className="min-w-0 text-sm font-black text-left break-all text-amber-800 sm:text-right">
          {value}
        </span>
      </a>

      <button
        type="button"
        onClick={onCopy}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-white text-xs font-black uppercase tracking-[0.12em] text-amber-700 shadow-sm transition hover:bg-amber-100 sm:h-9 sm:w-9 sm:shrink-0"
      >
        <Copy size={15} />
        <span className="sm:hidden">Copy</span>
      </button>
    </div>
  );
}

export default BusinessPortal;
