import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Crown,
  IndianRupee,
  Layers3,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  WalletCards,
  XCircle,
  ChevronRight,
  Zap,
  BarChart3,
  Users,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/superAdminApi";

const PLAN_PRICE = {
  website: 499,
  basic: 499,
  starter: 999,
  growth: 1299,
  pro: 1299,
  premium: 1499,
};

const PLAN_COLORS = {
  website: "bg-sky-50 text-sky-700 border-sky-100",
  basic: "bg-slate-50 text-slate-600 border-slate-100",
  starter: "bg-violet-50 text-violet-700 border-violet-100",
  growth: "bg-emerald-50 text-emerald-700 border-emerald-100",
  pro: "bg-blue-50 text-blue-700 border-blue-100",
  premium: "bg-indigo-50 text-indigo-700 border-indigo-100",
  free: "bg-slate-50 text-slate-400 border-slate-100",
};

function SuperAdminDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueFilter, setRevenueFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");

  const token = localStorage.getItem("superAdminToken");

  const money = (value = 0) =>
    `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const getRestaurantRevenue = (restaurant) =>
    Number(
      restaurant?.totalRevenue ||
        restaurant?.revenue ||
        restaurant?.amountPaid ||
        restaurant?.paidAmount ||
        restaurant?.subscriptionAmount ||
        PLAN_PRICE[String(restaurant?.subscriptionPlan || "").toLowerCase()] ||
        0,
    );

  const isInsidePeriod = (restaurant, filter) => {
    if (filter === "all") return true;
    const rawDate =
      restaurant?.paidAt ||
      restaurant?.subscriptionStartedAt ||
      restaurant?.activatedAt ||
      restaurant?.createdAt;
    if (!rawDate) return false;
    const date = new Date(rawDate);
    const now = new Date();
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);
    if (filter === "today") return date.toDateString() === now.toDateString();
    if (filter === "7d") return diffDays <= 7;
    if (filter === "30d") return diffDays <= 30;
    if (filter === "year") return date.getFullYear() === now.getFullYear();
    return true;
  };

  const fetchRestaurants = () => {
    setLoading(true);
    api
      .get("/superadmin/restaurants", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRestaurants(res.data.restaurants || []))
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to load dashboard"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    return restaurants.filter((r) => {
      const plan = String(r.subscriptionPlan || "free").toLowerCase();
      const currentStatus = r.active ? "active" : "blocked";
      const matchesSearch =
        !text ||
        r.name?.toLowerCase().includes(text) ||
        r.slug?.toLowerCase().includes(text) ||
        r.ownerEmail?.toLowerCase().includes(text);
      return (
        matchesSearch &&
        (planFilter === "all" || plan === planFilter) &&
        (statusFilter === "all" || currentStatus === statusFilter) &&
        isInsidePeriod(r, revenueFilter)
      );
    });
  }, [restaurants, searchText, planFilter, statusFilter, revenueFilter]);

  const stats = useMemo(() => {
    const total = restaurants.length;
    const active = restaurants.filter((r) => r.active).length;
    const blocked = restaurants.filter((r) => !r.active).length;
    const trial = restaurants.filter(
      (r) => r.subscriptionStatus === "trial",
    ).length;
    const paid = restaurants.filter((r) =>
      ["website", "starter", "growth", "pro", "premium"].includes(
        String(r.subscriptionPlan || "").toLowerCase(),
      ),
    ).length;
    const totalRevenue = filteredRestaurants.reduce(
      (sum, r) => sum + getRestaurantRevenue(r),
      0,
    );
    const activeRevenue = filteredRestaurants
      .filter((r) => r.active)
      .reduce((sum, r) => sum + getRestaurantRevenue(r), 0);
    const averageRevenue = filteredRestaurants.length
      ? totalRevenue / filteredRestaurants.length
      : 0;
    return {
      total,
      active,
      blocked,
      trial,
      paid,
      totalRevenue,
      activeRevenue,
      averageRevenue,
    };
  }, [restaurants, filteredRestaurants]);

  const planRevenue = useMemo(() => {
    const plans = {};
    filteredRestaurants.forEach((r) => {
      const plan = r.subscriptionPlan || "free";
      plans[plan] = (plans[plan] || 0) + getRestaurantRevenue(r);
    });
    return Object.entries(plans)
      .map(([plan, revenue]) => ({ plan, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredRestaurants]);

  const statCards = [
    {
      label: "Total Enterprises",
      value: stats.total,
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      trend: null,
    },
    {
      label: "Active Now",
      value: stats.active,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      trend: stats.total
        ? `${Math.round((stats.active / stats.total) * 100)}%`
        : "0%",
    },
    {
      label: "Trial Accounts",
      value: stats.trial,
      icon: Clock,
      color: "text-sky-600",
      bg: "bg-sky-50",
      border: "border-sky-100",
      trend: null,
    },
    {
      label: "Paid Plans",
      value: stats.paid,
      icon: Crown,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
      trend: null,
    },
    {
      label: "Blocked",
      value: stats.blocked,
      icon: XCircle,
      color: "text-rose-500",
      bg: "bg-rose-50",
      border: "border-rose-100",
      trend: null,
    },
    {
      label: "Filtered Revenue",
      value: money(stats.totalRevenue),
      icon: IndianRupee,
      color: "text-blue-700",
      bg: "bg-blue-600",
      border: "border-blue-500",
      isRevenue: true,
      trend: null,
    },
  ];

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
              <p className="text-sm font-bold tracking-tight text-slate-800">
                Loading Command Center
              </p>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Fetching enterprise data…
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f5ff] relative overflow-x-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-300/20 blur-[80px]" />
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-cyan-200/30 blur-[80px]" />
        <div className="absolute bottom-0 left-1/3 w-[450px] h-[450px] rounded-full bg-indigo-200/20 blur-[80px]" />
      </div>

      <div className="relative z-10 px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-10">
        {/* ── Hero Header ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_40px_rgba(37,99,235,0.08)] rounded-3xl p-6 sm:p-8 lg:p-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 pointer-events-none w-72 h-72 bg-gradient-to-bl from-blue-100/60 to-transparent rounded-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none bg-gradient-to-tr from-cyan-50/80 to-transparent rounded-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-4">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[11px] font-bold tracking-widest uppercase text-blue-600">
                    SuperAdmin
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-[-0.04em] leading-[1.1]">
                  FoodDash
                  <br className="hidden sm:block" />
                  <span className="text-blue-600"> Command Center</span>
                </h1>
                <p className="max-w-lg mt-3 text-sm font-medium leading-relaxed text-slate-500 sm:text-base">
                  Manage restaurants, subscriptions, revenue, and activation
                  across all connected enterprises.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[220px]">
                <div className="flex-1 p-5 text-white shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <WalletCards size={14} className="text-blue-200" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-blue-200">
                      Revenue
                    </span>
                  </div>
                  <p className="text-2xl font-black tracking-tight">
                    {money(stats.totalRevenue)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-blue-300">
                    All filtered enterprises
                  </p>
                </div>
                <div className="flex-1 p-5 bg-white border shadow-sm border-slate-100 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity size={14} className="text-emerald-500" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Live
                    </span>
                  </div>
                  <p className="text-2xl font-black tracking-tight text-slate-900">
                    {stats.active}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    Active accounts
                  </p>
                </div>
              </div>
            </div>

            {/* Pill stats */}
            <div className="relative flex flex-wrap gap-2 pt-5 mt-6 border-t border-slate-100">
              {[
                {
                  icon: Building2,
                  label: "Total",
                  value: stats.total,
                  color: "text-blue-600 bg-blue-50 border-blue-100",
                },
                {
                  icon: CheckCircle2,
                  label: "Active",
                  value: stats.active,
                  color: "text-emerald-600 bg-emerald-50 border-emerald-100",
                },
                {
                  icon: Clock,
                  label: "Trial",
                  value: stats.trial,
                  color: "text-sky-600 bg-sky-50 border-sky-100",
                },
                {
                  icon: Crown,
                  label: "Paid",
                  value: stats.paid,
                  color: "text-violet-600 bg-violet-50 border-violet-100",
                },
                {
                  icon: XCircle,
                  label: "Blocked",
                  value: stats.blocked,
                  color: "text-rose-500 bg-rose-50 border-rose-100",
                },
              ].map((pill) => (
                <div
                  key={pill.label}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${pill.color}`}
                >
                  <pill.icon size={13} />
                  <span>{pill.label}</span>
                  <span className="font-black">{pill.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Stat Cards ────────────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-3 xl:grid-cols-6"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        >
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.97 },
                  show: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`rounded-2xl border p-4 ${
                  card.isRevenue
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 text-white shadow-lg shadow-blue-200"
                    : "bg-white/90 backdrop-blur-xl border-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                    card.isRevenue
                      ? "bg-white/20"
                      : `${card.bg} border ${card.border}`
                  }`}
                >
                  <Icon
                    size={17}
                    className={card.isRevenue ? "text-white" : card.color}
                  />
                </div>
                <p
                  className={`text-xs font-bold mb-1 ${card.isRevenue ? "text-blue-200" : "text-slate-400"}`}
                >
                  {card.label}
                </p>
                <p
                  className={`text-xl font-black tracking-tight ${card.isRevenue ? "text-white" : "text-slate-900"}`}
                >
                  {card.value}
                </p>
                {card.trend && (
                  <p
                    className={`text-xs font-bold mt-1 ${card.isRevenue ? "text-blue-200" : "text-emerald-500"}`}
                  >
                    {card.trend} rate
                  </p>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Revenue + SaaS Pulse ──────────────────────────────────── */}
        <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-5 mb-8">
          {/* Revenue Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_40px_rgba(15,23,42,0.06)]"
          >
            <div className="flex flex-col gap-4 mb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-1">
                  Revenue Control
                </p>
                <h2 className="text-xl font-black tracking-tight text-slate-950">
                  Enterprise Revenue
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: "Period",
                    value: revenueFilter,
                    onChange: setRevenueFilter,
                    options: [
                      ["all", "All time"],
                      ["today", "Today"],
                      ["7d", "7 days"],
                      ["30d", "30 days"],
                      ["year", "This year"],
                    ],
                  },
                  {
                    label: "Plan",
                    value: planFilter,
                    onChange: setPlanFilter,
                    options: [
                      ["all", "All plans"],
                      ["website", "Website"],
                      ["starter", "Starter"],
                      ["growth", "Growth"],
                      ["pro", "Pro"],
                      ["premium", "Premium"],
                    ],
                  },
                  {
                    label: "Status",
                    value: statusFilter,
                    onChange: setStatusFilter,
                    options: [
                      ["all", "All status"],
                      ["active", "Active"],
                      ["blocked", "Blocked"],
                    ],
                  },
                ].map((sel) => (
                  <select
                    key={sel.label}
                    value={sel.value}
                    onChange={(e) => sel.onChange(e.target.value)}
                    className="px-3 py-2 text-xs font-bold border border-blue-100 outline-none cursor-pointer rounded-xl bg-blue-50/70 text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    {sel.options.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>

            {/* Revenue Metrics */}
            <div className="grid gap-3 mb-5 sm:grid-cols-3">
              <div className="p-4 text-white shadow-md bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-blue-100">
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-100 mb-2">
                  Total Revenue
                </p>
                <p className="text-2xl font-black">
                  {money(stats.totalRevenue)}
                </p>
                <p className="mt-1 text-xs text-blue-200">
                  From {filteredRestaurants.length} enterprises
                </p>
              </div>
              <div className="p-4 border border-blue-100 bg-blue-50 rounded-2xl">
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-500 mb-2">
                  Active Revenue
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {money(stats.activeRevenue)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Live accounts only
                </p>
              </div>
              <div className="p-4 border bg-slate-50 border-slate-100 rounded-2xl">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Avg. Per Enterprise
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {money(stats.averageRevenue)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Across filtered set
                </p>
              </div>
            </div>

            {/* Plan Revenue Bars */}
            <div className="space-y-2">
              {planRevenue.length > 0 ? (
                planRevenue.map((item) => {
                  const max = Math.max(...planRevenue.map((p) => p.revenue), 1);
                  const pct = Math.max((item.revenue / max) * 100, 6);
                  return (
                    <div
                      key={item.plan}
                      className="bg-slate-50 border border-slate-100 rounded-xl p-3.5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black capitalize text-slate-800">
                          {item.plan} Plan
                        </span>
                        <span className="text-sm font-black text-blue-600">
                          {money(item.revenue)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: 0.9,
                            ease: "easeOut",
                            delay: 0.1,
                          }}
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center border border-blue-200 border-dashed rounded-xl bg-blue-50">
                  <BarChart3 size={22} className="mx-auto mb-2 text-blue-300" />
                  <p className="text-sm font-bold text-slate-400">
                    No revenue data for selected filters
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* SaaS Pulse */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5 }}
            className="bg-slate-950 rounded-3xl p-5 sm:p-6 text-white shadow-[0_8px_40px_rgba(15,23,42,0.20)]"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-blue-400 mb-1">
                  Platform
                </p>
                <h2 className="text-xl font-black tracking-tight">
                  SaaS Pulse
                </h2>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/10">
                <ShieldCheck size={18} className="text-cyan-300" />
              </div>
            </div>

            {/* Activation Rate */}
            <div className="p-4 mb-3 border bg-white/5 border-white/10 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-300">
                  Activation Rate
                </span>
                <span className="text-sm font-black text-cyan-300">
                  {stats.total
                    ? Math.round((stats.active / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${stats.total ? (stats.active / stats.total) * 100 : 0}%`,
                  }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                />
              </div>
            </div>

            {/* Paid Rate */}
            <div className="p-4 mb-3 border bg-white/5 border-white/10 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-300">
                  Paid Conversion
                </span>
                <span className="text-sm font-black text-violet-300">
                  {stats.total
                    ? Math.round((stats.paid / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${stats.total ? (stats.paid / stats.total) * 100 : 0}%`,
                  }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.45 }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-blue-500"
                />
              </div>
            </div>

            {/* Mini grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <Layers3 size={16} className="mb-2 text-blue-300" />
                <p className="text-xl font-black">
                  {filteredRestaurants.length}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">
                  Filtered
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <TrendingUp size={16} className="mb-2 text-emerald-400" />
                <p className="text-xl font-black">
                  {money(stats.averageRevenue)}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">
                  Average
                </p>
              </div>
            </div>

            {/* Revenue note */}
            <div className="p-4 border bg-blue-500/10 border-blue-400/20 rounded-2xl">
              <div className="flex items-start gap-3">
                <CalendarDays
                  size={16}
                  className="text-cyan-300 mt-0.5 shrink-0"
                />
                <p className="text-xs font-medium leading-relaxed text-slate-400">
                  Revenue is read from{" "}
                  <span className="text-slate-300">
                    totalRevenue, amountPaid,
                  </span>{" "}
                  or <span className="text-slate-300">subscriptionAmount</span>.
                  Falls back to plan price if missing.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Restaurant Table ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5 }}
          className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl shadow-[0_8px_40px_rgba(15,23,42,0.06)] overflow-hidden"
        >
          {/* Table Header */}
          <div className="flex flex-col gap-4 px-5 py-5 border-b sm:px-6 border-slate-100 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-0.5">
                Enterprises
              </p>
              <h2 className="text-xl font-black tracking-tight text-slate-950">
                Connected Restaurants
              </h2>
            </div>
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search name, slug, email…"
                className="w-full pl-10 pr-4 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none placeholder:text-slate-400 text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-[1.6fr_0.8fr_0.7fr_0.7fr_0.5fr] gap-4 px-6 py-3 bg-slate-50/80 border-b border-slate-100">
              {["Restaurant", "Plan", "Status", "Revenue", ""].map((h) => (
                <span
                  key={h}
                  className="text-[11px] font-black uppercase tracking-widest text-slate-400"
                >
                  {h}
                </span>
              ))}
            </div>
            <div className="divide-y divide-slate-50">
              <AnimatePresence>
                {filteredRestaurants.slice(0, 10).map((r, i) => (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="grid grid-cols-[1.6fr_0.8fr_0.7fr_0.7fr_0.5fr] gap-4 px-6 py-4 items-center hover:bg-blue-50/40 transition-colors group"
                  >
                    <div className="flex items-center min-w-0 gap-3">
                      <div className="flex items-center justify-center w-10 h-10 text-white shadow-md rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-blue-100 shrink-0">
                        <Store size={17} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black truncate text-slate-900">
                          {r.name}
                        </p>
                        <p className="text-xs font-medium truncate text-slate-400">
                          /r/{r.slug} · {r.ownerEmail}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`w-fit text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${PLAN_COLORS[String(r.subscriptionPlan || "free").toLowerCase()] || PLAN_COLORS.free}`}
                    >
                      {r.subscriptionPlan || "free"}
                    </span>
                    <span
                      className={`w-fit text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                        r.active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-rose-50 text-rose-600 border-rose-100"
                      }`}
                    >
                      {r.active ? "Active" : "Blocked"}
                    </span>
                    <span className="text-sm font-black text-slate-800">
                      {money(getRestaurantRevenue(r))}
                    </span>
                    <a
                      href={`/r/${r.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-100 hover:border-blue-600 px-3 py-1.5 rounded-xl transition-all duration-150 w-fit"
                    >
                      View <ArrowUpRight size={13} />
                    </a>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="p-4 space-y-3 lg:hidden">
            <AnimatePresence>
              {filteredRestaurants.slice(0, 10).map((r, i) => (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="p-4 bg-white border shadow-sm border-slate-100 rounded-2xl"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center min-w-0 gap-3">
                      <div className="flex items-center justify-center w-10 h-10 text-white rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shrink-0">
                        <Store size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black truncate text-slate-900">
                          {r.name}
                        </p>
                        <p className="text-xs font-medium truncate text-slate-400">
                          /r/{r.slug}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`/r/${r.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center w-8 h-8 text-blue-600 transition border border-blue-100 shrink-0 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white"
                    >
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                  <p className="mb-3 text-xs font-medium truncate text-slate-400">
                    {r.ownerEmail}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${PLAN_COLORS[String(r.subscriptionPlan || "free").toLowerCase()] || PLAN_COLORS.free}`}
                    >
                      {r.subscriptionPlan || "free"}
                    </span>
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                        r.active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-rose-50 text-rose-600 border-rose-100"
                      }`}
                    >
                      {r.active ? "Active" : "Blocked"}
                    </span>
                    <span className="ml-auto text-xs font-black text-slate-700">
                      {money(getRestaurantRevenue(r))}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredRestaurants.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex items-center justify-center mb-4 border border-blue-100 w-14 h-14 rounded-2xl bg-blue-50">
                <Building2 size={24} className="text-blue-300" />
              </div>
              <p className="mb-1 font-black text-slate-700">
                No enterprises found
              </p>
              <p className="text-sm font-medium text-slate-400">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          {filteredRestaurants.length > 10 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400">
                Showing 10 of{" "}
                <span className="text-slate-600">
                  {filteredRestaurants.length}
                </span>{" "}
                enterprises
              </p>
              <button className="flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700">
                View all <ChevronRight size={14} />
              </button>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs font-bold text-slate-400">
            FoodDash SuperAdmin ·{" "}
            <span className="text-blue-500">Command Center</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
