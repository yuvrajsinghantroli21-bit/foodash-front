import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  IndianRupee,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
  X,
  XCircle,
  CalendarDays,
  Activity,
  BadgeCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/superAdminApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Pending Review", value: "paid_pending_review" },
  { label: "Approved", value: "approved" },
  { label: "Refund Pending", value: "refund_pending" },
  { label: "Refunded", value: "refunded" },
];

const STATUS_STYLES = {
  paid_pending_review: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    label: "Pending Review",
  },
  approved: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
    label: "Approved",
  },
  rejected: {
    badge: "bg-rose-50 text-rose-600 border-rose-100",
    dot: "bg-rose-500",
    label: "Rejected",
  },
  refund_pending: {
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-400",
    label: "Refund Pending",
  },
  refunded: {
    badge: "bg-sky-50 text-sky-700 border-sky-100",
    dot: "bg-sky-500",
    label: "Refunded",
  },
};

const PLAN_BADGE = {
  free: "bg-slate-50 text-slate-500 border-slate-200",
  website: "bg-sky-50 text-sky-700 border-sky-100",
  starter: "bg-violet-50 text-violet-700 border-violet-100",
  growth: "bg-teal-50 text-teal-700 border-teal-100",
  pro: "bg-blue-50 text-blue-700 border-blue-100",
  premium: "bg-indigo-50 text-indigo-700 border-indigo-100",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const money = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Animation variants ───────────────────────────────────────────────────────

const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

// ─── Main Component ───────────────────────────────────────────────────────────

function SuperAdminPlanRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");

  const fetchRequests = () => {
    setLoading(true);
    api
      .get("/superadmin/plan-requests")
      .then((res) => setRequests(res.data.requests || []))
      .catch((err) =>
        toast.error(
          err.response?.data?.message || "Failed to load plan requests",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(
      (r) => r.status === "paid_pending_review",
    ).length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const refundPending = requests.filter(
      (r) => r.status === "refund_pending",
    ).length;
    const refunded = requests.filter((r) => r.status === "refunded").length;
    const paidValue = requests.reduce(
      (sum, r) => sum + Number(r.amount || 0),
      0,
    );
    return { total, pending, approved, refundPending, refunded, paidValue };
  }, [requests]);

  // ── Filtered ───────────────────────────────────────────────────────────────

  const filteredRequests = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return requests.filter((r) => {
      const matchesTab = activeTab === "all" || r.status === activeTab;
      const matchesSearch =
        !query ||
        r.name?.toLowerCase().includes(query) ||
        r.email?.toLowerCase().includes(query) ||
        r.phone?.toLowerCase().includes(query) ||
        r.restaurantName?.toLowerCase().includes(query) ||
        r.selectedPlan?.toLowerCase().includes(query) ||
        r.paymentId?.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
  }, [requests, activeTab, searchText]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const approveRequest = (request) => {
    if (
      !window.confirm(
        `Approve ${request.restaurantName}? This will create restaurant + admin access.`,
      )
    )
      return;
    setActionLoadingId(request._id);
    api
      .put(`/superadmin/plan-requests/${request._id}/approve`)
      .then((res) => {
        toast.success(res.data.message || "Plan request approved");
        fetchRequests();
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to approve request"),
      )
      .finally(() => setActionLoadingId(null));
  };

  const rejectRequest = (request) => {
    const reviewNote = window.prompt(
      "Reason for rejection/refund note",
      "Request rejected by FoodDash team. Refund will be processed within 7 working days.",
    );
    if (reviewNote === null) return;
    setActionLoadingId(request._id);
    api
      .put(`/superadmin/plan-requests/${request._id}/reject`, { reviewNote })
      .then((res) => {
        toast.success(res.data.message || "Request moved to refund pending");
        fetchRequests();
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to reject request"),
      )
      .finally(() => setActionLoadingId(null));
  };

  const markRefunded = (request) => {
    if (!window.confirm(`Mark refund completed for ${request.restaurantName}?`))
      return;
    setActionLoadingId(request._id);
    api
      .put(`/superadmin/plan-requests/${request._id}/refunded`)
      .then((res) => {
        toast.success(res.data.message || "Marked as refunded");
        fetchRequests();
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to mark refunded"),
      )
      .finally(() => setActionLoadingId(null));
  };

  // ── Loading screen ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f5ff] flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 scale-150 rounded-3xl bg-blue-400/20 blur-2xl" />
          <div className="relative flex flex-col items-center gap-4 px-10 py-8 border border-blue-100 shadow-xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-blue-100/60">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500">
              <Loader2 className="text-white animate-spin" size={22} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-800">
                Loading Plan Requests
              </p>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Fetching payment data…
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="relative min-h-screen bg-[#f0f5ff] overflow-x-hidden"
    >
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-blue-300/20 blur-[90px]" />
        <div className="absolute top-1/2 -right-32 w-[420px] h-[420px] rounded-full bg-cyan-200/25 blur-[80px]" />
        <div className="absolute -bottom-24 left-1/3 w-[460px] h-[460px] rounded-full bg-indigo-200/20 blur-[80px]" />
      </div>

      <div className="relative z-10 px-4 py-6 mx-auto space-y-5 max-w-7xl sm:px-6 lg:px-8 lg:py-10">
        {/* ── Hero Header ──────────────────────────────────────────────────── */}
        <motion.div variants={cardVariants}>
          <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_40px_rgba(37,99,235,0.08)] rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 pointer-events-none w-80 h-80 bg-gradient-to-bl from-blue-50/80 to-transparent rounded-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-4">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[11px] font-bold tracking-widest uppercase text-blue-600">
                    Payment Review Center
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-[-0.04em] leading-[1.1]">
                  Plan
                  <span className="text-blue-600"> Requests</span>
                </h1>
                <p className="max-w-lg mt-3 text-sm font-medium leading-relaxed sm:text-base text-slate-500">
                  Review paid plan requests before activating a restaurant
                  workspace. Approve to create access, reject to initiate a
                  refund.
                </p>
              </div>

              <button
                onClick={fetchRequests}
                className="self-start lg:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-900/10"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>

            {/* Stat pills */}
            <div className="relative flex flex-wrap gap-2 pt-5 mt-6 border-t border-slate-100">
              {[
                {
                  icon: CreditCard,
                  label: "Total",
                  value: stats.total,
                  cls: "text-blue-600 bg-blue-50 border-blue-100",
                },
                {
                  icon: Clock3,
                  label: "Pending",
                  value: stats.pending,
                  cls: "text-amber-600 bg-amber-50 border-amber-100",
                },
                {
                  icon: CheckCircle2,
                  label: "Approved",
                  value: stats.approved,
                  cls: "text-emerald-600 bg-emerald-50 border-emerald-100",
                },
                {
                  icon: XCircle,
                  label: "Refund Pending",
                  value: stats.refundPending,
                  cls: "text-orange-600 bg-orange-50 border-orange-100",
                },
                {
                  icon: RotateCcw,
                  label: "Refunded",
                  value: stats.refunded,
                  cls: "text-sky-600 bg-sky-50 border-sky-100",
                },
                {
                  icon: IndianRupee,
                  label: "Paid Value",
                  value: money(stats.paidValue),
                  cls: "text-blue-700 bg-blue-50 border-blue-100",
                },
              ].map((p) => (
                <div
                  key={p.label}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${p.cls}`}
                >
                  <p.icon size={13} />
                  <span>{p.label}</span>
                  <span className="font-black">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Stat Cards ───────────────────────────────────────────────────── */}
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
        >
          {[
            {
              title: "Total",
              value: stats.total,
              icon: CreditCard,
              cls: "text-blue-600 bg-blue-50 border-blue-100",
              isBlue: false,
            },
            {
              title: "Pending",
              value: stats.pending,
              icon: Clock3,
              cls: "text-amber-600 bg-amber-50 border-amber-100",
              isBlue: false,
            },
            {
              title: "Approved",
              value: stats.approved,
              icon: CheckCircle2,
              cls: "text-emerald-600 bg-emerald-50 border-emerald-100",
              isBlue: false,
            },
            {
              title: "Refund Pending",
              value: stats.refundPending,
              icon: XCircle,
              cls: "text-orange-600 bg-orange-50 border-orange-100",
              isBlue: false,
            },
            {
              title: "Refunded",
              value: stats.refunded,
              icon: RotateCcw,
              cls: "text-sky-600 bg-sky-50 border-sky-100",
              isBlue: false,
            },
            {
              title: "Paid Value",
              value: money(stats.paidValue),
              icon: IndianRupee,
              cls: null,
              isBlue: true,
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                variants={{
                  hidden: { opacity: 0, y: 18, scale: 0.97 },
                  show: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                className={`rounded-2xl border p-4 ${
                  card.isBlue
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 shadow-lg shadow-blue-200"
                    : "bg-white/90 backdrop-blur-xl border-white shadow-[0_4px_20px_rgba(15,23,42,0.05)]"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                    card.isBlue
                      ? "bg-white/20"
                      : card.cls.split(" ").slice(1).join(" ") +
                        " border " +
                        card.cls.split(" ")[2]
                  }`}
                >
                  <Icon
                    size={17}
                    className={
                      card.isBlue ? "text-white" : card.cls.split(" ")[0]
                    }
                  />
                </div>
                <p
                  className={`text-xs font-bold mb-1 ${card.isBlue ? "text-blue-200" : "text-slate-400"}`}
                >
                  {card.title}
                </p>
                <p
                  className={`text-xl font-black tracking-tight ${card.isBlue ? "text-white" : "text-slate-900"}`}
                >
                  {card.value}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Tabs + Search ─────────────────────────────────────────────────── */}
        <motion.div variants={cardVariants}>
          <div className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-4 sm:p-5 shadow-[0_8px_40px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                      activeTab === tab.value
                        ? "bg-slate-950 text-white shadow-md"
                        : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                    {tab.value !== "all" && (
                      <span
                        className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                          activeTab === tab.value
                            ? "bg-white/20"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {tab.value === "paid_pending_review" && stats.pending}
                        {tab.value === "approved" && stats.approved}
                        {tab.value === "refund_pending" && stats.refundPending}
                        {tab.value === "refunded" && stats.refunded}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full xl:w-80">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search name, email, payment ID…"
                  className="w-full pl-9 pr-8 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText("")}
                    className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Request Cards ────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((request, i) => (
              <RequestCard
                key={request._id}
                request={request}
                index={i}
                isBusy={actionLoadingId === request._id}
                approveRequest={approveRequest}
                rejectRequest={rejectRequest}
                markRefunded={markRefunded}
              />
            ))}
          </AnimatePresence>

          {/* Empty state */}
          {filteredRequests.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl py-16 px-6 text-center shadow-[0_8px_40px_rgba(15,23,42,0.05)]"
            >
              <div className="flex items-center justify-center mx-auto mb-4 border border-blue-100 w-14 h-14 rounded-2xl bg-blue-50">
                <CreditCard size={24} className="text-blue-300" />
              </div>
              <p className="mb-1 font-black text-slate-700">
                No plan requests found
              </p>
              <p className="max-w-sm mx-auto text-sm font-medium text-slate-400">
                Paid plan requests appear here after users complete payment. Try
                adjusting your filters.
              </p>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="pb-4 text-center">
          <p className="text-xs font-bold text-slate-400">
            FoodDash SuperAdmin ·{" "}
            <span className="text-blue-500">Plan Request Manager</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Request Card ─────────────────────────────────────────────────────────────

function RequestCard({
  request,
  index,
  isBusy,
  approveRequest,
  rejectRequest,
  markRefunded,
}) {
  const statusInfo = STATUS_STYLES[request.status] || {
    badge: "bg-slate-50 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
    label: request.status,
  };
  const planBadge =
    PLAN_BADGE[request.selectedPlan] ||
    "bg-slate-50 text-slate-500 border-slate-200";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: index * 0.03, duration: 0.35, ease: "easeOut" }}
      className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl shadow-[0_8px_40px_rgba(15,23,42,0.05)] overflow-hidden"
    >
      {/* Card Header */}
      <div className="px-5 py-5 border-b sm:px-6 border-slate-100 bg-slate-50/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 text-white shadow-md rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-blue-100 shrink-0">
              <Store size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-black leading-tight text-slate-950">
                {request.restaurantName}
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {request.name}
                {request.email && (
                  <span className="text-slate-400"> · {request.email}</span>
                )}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <CalendarDays size={12} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-400">
                  {formatDate(request.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider ${planBadge}`}
            >
              {request.selectedPlan}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider ${statusInfo.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 p-5 lg:grid-cols-4 sm:p-6">
        <InfoBox
          icon={IndianRupee}
          label="Paid Amount"
          value={money(request.amount)}
          highlight
        />
        <InfoBox
          icon={CreditCard}
          label="Payment ID"
          value={request.paymentId}
          mono
        />
        <InfoBox
          icon={UserRound}
          label="Phone"
          value={request.phone || "N/A"}
        />
        <InfoBox
          icon={ShieldCheck}
          label="Reviewed At"
          value={formatDate(request.reviewedAt)}
        />
      </div>

      {/* Review Note */}
      {request.reviewNote && (
        <div className="mx-5 mb-4 sm:mx-6">
          <div className="p-4 border bg-slate-50 border-slate-200 rounded-2xl">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Review Note
            </p>
            <p className="text-sm font-medium leading-relaxed text-slate-600">
              {request.reviewNote}
            </p>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col gap-2 px-5 py-4 border-t sm:px-6 border-slate-100 bg-slate-50/50 sm:flex-row sm:items-center sm:justify-end">
        {request.status === "paid_pending_review" && (
          <>
            <button
              onClick={() => rejectRequest(request)}
              disabled={isBusy}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black uppercase tracking-wider hover:bg-rose-100 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isBusy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <XCircle size={14} />
              )}
              Reject & Refund
            </button>
            <button
              onClick={() => approveRequest(request)}
              disabled={isBusy}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-slate-900/10"
            >
              {isBusy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              Approve & Create
            </button>
          </>
        )}

        {request.status === "refund_pending" && (
          <button
            onClick={() => markRefunded(request)}
            disabled={isBusy}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 text-xs font-black uppercase tracking-wider hover:bg-sky-100 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isBusy ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RotateCcw size={14} />
            )}
            Mark as Refunded
          </button>
        )}

        {request.status === "approved" && (
          <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider">
            <BadgeCheck size={14} />
            System Activated
          </span>
        )}

        {request.status === "refunded" && (
          <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 text-xs font-black uppercase tracking-wider">
            <RotateCcw size={14} />
            Refund Completed
          </span>
        )}
      </div>
    </motion.article>
  );
}

// ─── Info Box ─────────────────────────────────────────────────────────────────

function InfoBox({ icon: Icon, label, value, highlight, mono }) {
  return (
    <div
      className={`rounded-2xl p-4 border ${
        highlight
          ? "bg-blue-50 border-blue-100"
          : "bg-slate-50 border-slate-100"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${
          highlight ? "bg-blue-100" : "bg-white border border-slate-200"
        }`}
      >
        <Icon
          size={15}
          className={highlight ? "text-blue-600" : "text-slate-500"}
        />
      </div>
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </p>
      <p
        className={`text-sm font-black break-all leading-snug ${
          highlight
            ? "text-blue-700"
            : mono
              ? "text-slate-600 font-mono text-xs"
              : "text-slate-800"
        }`}
      >
        {value || "N/A"}
      </p>
    </div>
  );
}

export default SuperAdminPlanRequests;
