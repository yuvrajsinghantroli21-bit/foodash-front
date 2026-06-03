import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ban,
  Building2,
  CheckCircle2,
  ChevronRight,
  Crown,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  Trash2,
  TrendingUp,
  X,
  XCircle,
  Clock,
  BarChart3,
  Wallet,
  CreditCard,
  ReceiptText,
  Activity,
  BadgeIndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/superAdminApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const defaultForm = {
  name: "",
  slug: "",
  ownerName: "",
  ownerEmail: "",
  phone: "",
  subscriptionPlan: "free",
  subscriptionStatus: "trial",
};

const PLAN_LABELS = {
  free: "Free",
  website: "Website",
  basic: "Basic",
  starter: "Starter",
  growth: "Growth",
  pro: "Pro",
  premium: "Premium",
};

const STATUS_LABELS = {
  trial: "Trial",
  active: "Active",
  expired: "Expired",
  cancelled: "Cancelled",
};

// This page shows CUSTOMER ORDER MONEY FLOW.
// It does NOT calculate FoodDash subscription/MRR/plan revenue.

const EMPTY_MONEY_FLOW = {
  totalOrderFlow: 0,
  cashReceived: 0,
  onlineReceived: 0,
  paidAmount: 0,
  dueAmount: 0,
  totalOrders: 0,
  preparing: 0,
  served: 0,
  completed: 0,
  restaurants: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function normalizeMoneyFlow(raw) {
  const data = raw?.data || raw || {};

  return {
    totalOrderFlow: Number(data.totalOrderFlow || 0),
    cashReceived: Number(data.cashReceived || 0),
    onlineReceived: Number(data.onlineReceived || 0),
    paidAmount: Number(data.paidAmount || 0),
    dueAmount: Number(data.dueAmount || 0),
    totalOrders: Number(data.totalOrders || 0),
    preparing: Number(data.preparing || 0),
    served: Number(data.served || 0),
    completed: Number(data.completed || 0),
    restaurants: Array.isArray(data.restaurants) ? data.restaurants : [],
  };
}

function getRestaurantFlow(moneyFlow, restaurant) {
  const restaurantId = String(restaurant?._id || restaurant?.id || "");
  const restaurantSlug = String(restaurant?.slug || "").toLowerCase();
  const restaurantName = String(restaurant?.name || "").toLowerCase();

  const list = Array.isArray(moneyFlow?.restaurants)
    ? moneyFlow.restaurants
    : [];

  const found = list.find((item) => {
    const itemRestaurantId = String(
      item?.restaurantId?._id || item?.restaurantId || item?._id || "",
    );

    const itemSlug = String(
      item?.slug || item?.restaurantSlug || "",
    ).toLowerCase();

    const itemName = String(
      item?.name || item?.restaurantName || item?.restaurant?.name || "",
    ).toLowerCase();

    return (
      (restaurantId && itemRestaurantId === restaurantId) ||
      (restaurantSlug && itemSlug === restaurantSlug) ||
      (restaurantName && itemName === restaurantName)
    );
  });

  return {
    totalOrderFlow: Number(found?.totalOrderFlow || 0),
    cashReceived: Number(found?.cashReceived || 0),
    onlineReceived: Number(found?.onlineReceived || 0),
    paidAmount: Number(found?.paidAmount || 0),
    dueAmount: Number(found?.dueAmount || 0),
    totalOrders: Number(found?.totalOrders || 0),
    preparing: Number(found?.preparing || 0),
    served: Number(found?.served || 0),
    completed: Number(found?.completed || 0),
  };
}

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

function SuperAdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [moneyFlow, setMoneyFlow] = useState(EMPTY_MONEY_FLOW);

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [moneyLoading, setMoneyLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [moneyRange, setMoneyRange] = useState("today");

  const token = localStorage.getItem("superAdminToken");
  const authHeaders = { Authorization: `Bearer ${token}` };

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchRestaurants = () => {
    setLoading(true);

    api
      .get("/superadmin/restaurants", { headers: authHeaders })
      .then((res) => setRestaurants(res.data.restaurants || []))
      .catch((err) =>
        toast.error(
          err.response?.data?.message || "Failed to load restaurants",
        ),
      )
      .finally(() => setLoading(false));
  };

  const fetchMoneyFlow = () => {
    setMoneyLoading(true);

    api
      .get(`/superadmin/money-flow?range=${moneyRange}`, {
        headers: authHeaders,
      })
      .then((res) => {
        setMoneyFlow(normalizeMoneyFlow(res.data));
      })
      .catch((err) => {
        setMoneyFlow(EMPTY_MONEY_FLOW);
        toast.error(
          err.response?.data?.message ||
            "Failed to load customer order money flow",
        );
      })
      .finally(() => setMoneyLoading(false));
  };

  const refreshAll = () => {
    fetchRestaurants();
    fetchMoneyFlow();
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    fetchMoneyFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moneyRange]);

  // ── Form ───────────────────────────────────────────────────────────────────

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const createRestaurant = (e) => {
    e.preventDefault();

    if (!form.name || !form.ownerEmail) {
      toast.error("Restaurant name and owner email are required");
      return;
    }

    setCreating(true);

    api
      .post("/superadmin/restaurants", form, { headers: authHeaders })
      .then(() => {
        toast.success("Restaurant created");
        setForm(defaultForm);
        setFormOpen(false);
        fetchRestaurants();
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to create"),
      )
      .finally(() => setCreating(false));
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const toggleActive = (restaurant) => {
    api
      .put(
        `/superadmin/restaurants/${restaurant._id}/active`,
        { active: !restaurant.active },
        { headers: authHeaders },
      )
      .then(() => {
        toast.success(
          restaurant.active ? "Restaurant blocked" : "Restaurant activated",
        );
        fetchRestaurants();
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to update"),
      );
  };

  const updateSubscription = (restaurant, field, value) => {
    const payload = {
      subscriptionPlan: restaurant.subscriptionPlan,
      subscriptionStatus: restaurant.subscriptionStatus,
      [field]: value,
    };

    api
      .put(`/superadmin/restaurants/${restaurant._id}/subscription`, payload, {
        headers: authHeaders,
      })
      .then(() => {
        toast.success("Subscription updated");
        fetchRestaurants();
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to update"),
      );
  };

  const accessRestaurantAdmin = async (restaurant) => {
    try {
      const res = await api.post(
        `/superadmin/restaurants/${restaurant._id}/impersonate`,
      );

      const { token, restaurant: r } = res.data;

      const encodedToken = encodeURIComponent(token);
      const encodedUser = encodeURIComponent(
        JSON.stringify({
          name: "SuperAdmin Support",
          email: "support@foodash.com",
          role: "admin",
          restaurantId: r._id,
          restaurantName: r.name,
          restaurantSlug: r.slug,
          subscriptionPlan: r.subscriptionPlan,
          subscriptionStatus: r.subscriptionStatus,
          isImpersonating: true,
        }),
      );

      window.location.href = `http://${r.slug}.localhost:5173/admin/impersonate?token=${encodedToken}&user=${encodedUser}`;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to access admin");
    }
  };

  const deleteRestaurant = (restaurant) => {
    if (!window.confirm(`Delete ${restaurant.name}? This cannot be undone.`)) {
      return;
    }

    api
      .delete(`/superadmin/restaurants/${restaurant._id}`, {
        headers: authHeaders,
      })
      .then(() => {
        toast.success("Restaurant deleted");
        fetchRestaurants();
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to delete"),
      );
  };

  // ── Derived data ───────────────────────────────────────────────────────────

  const filteredRestaurants = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return restaurants.filter((r) => {
      const matchesSearch =
        !search ||
        r.name?.toLowerCase().includes(search) ||
        r.slug?.toLowerCase().includes(search) ||
        r.ownerEmail?.toLowerCase().includes(search) ||
        r.ownerName?.toLowerCase().includes(search) ||
        r.phone?.toLowerCase().includes(search);

      const matchesPlan =
        planFilter === "all" || r.subscriptionPlan === planFilter;

      const matchesStatus =
        statusFilter === "all" ||
        r.subscriptionStatus === statusFilter ||
        (statusFilter === "active-access" && r.active) ||
        (statusFilter === "blocked-access" && !r.active);

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [restaurants, searchText, planFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = restaurants.length;
    const active = restaurants.filter((r) => r.active).length;
    const blocked = restaurants.filter((r) => !r.active).length;
    const trial = restaurants.filter(
      (r) => r.subscriptionStatus === "trial",
    ).length;
    const paid = restaurants.filter((r) =>
      ["website", "starter", "growth", "pro", "premium"].includes(
        r.subscriptionPlan,
      ),
    ).length;

    return {
      total,
      active,
      blocked,
      trial,
      paid,
    };
  }, [restaurants]);

  const topRestaurantsByOrderFlow = useMemo(() => {
    return restaurants
      .map((restaurant) => {
        const flow = getRestaurantFlow(moneyFlow, restaurant);

        return {
          restaurant,
          ...flow,
        };
      })
      .sort((a, b) => b.totalOrderFlow - a.totalOrderFlow)
      .slice(0, 6);
  }, [restaurants, moneyFlow]);

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
        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <motion.div variants={cardVariants}>
          <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_40px_rgba(37,99,235,0.08)] rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 pointer-events-none w-80 h-80 bg-gradient-to-bl from-blue-50/80 to-transparent rounded-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-4">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[11px] font-bold tracking-widest uppercase text-blue-600">
                    FoodDash Enterprise Control
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-[-0.04em] leading-[1.1]">
                  Manage
                  <span className="text-blue-600"> Restaurants</span>
                </h1>

                <p className="max-w-xl mt-3 text-sm font-medium leading-relaxed sm:text-base text-slate-500">
                  Create, activate, block, and monitor every restaurant. Money
                  Flow Analytics shows how much all cafés process from customer
                  orders through FoodDash.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                <button
                  onClick={refreshAll}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-900/10"
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>

                <button
                  onClick={() => setFormOpen((p) => !p)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-200"
                >
                  <Plus
                    size={14}
                    className={`transition-transform duration-200 ${
                      formOpen ? "rotate-45" : ""
                    }`}
                  />
                  Add Restaurant
                </button>
              </div>
            </div>

            {/* Stat pills - these are restaurant counts only, not revenue */}
            <div className="relative flex flex-wrap gap-2 pt-5 mt-6 border-t border-slate-100">
              {[
                {
                  icon: Building2,
                  label: "Total",
                  value: stats.total,
                  cls: "text-blue-600 bg-blue-50 border-blue-100",
                },
                {
                  icon: CheckCircle2,
                  label: "Active",
                  value: stats.active,
                  cls: "text-emerald-600 bg-emerald-50 border-emerald-100",
                },
                {
                  icon: XCircle,
                  label: "Blocked",
                  value: stats.blocked,
                  cls: "text-rose-500 bg-rose-50 border-rose-100",
                },
                {
                  icon: Clock,
                  label: "Trial",
                  value: stats.trial,
                  cls: "text-sky-600 bg-sky-50 border-sky-100",
                },
                {
                  icon: Crown,
                  label: "Paid Plans",
                  value: stats.paid,
                  cls: "text-violet-600 bg-violet-50 border-violet-100",
                },
                {
                  icon: ReceiptText,
                  label: "Customer Order Flow",
                  value: formatCurrency(moneyFlow.totalOrderFlow),
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

        {/* ── Add Restaurant Form (collapsible) ───────────────────────────── */}
        <AnimatePresence>
          {formOpen && (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_40px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 text-white shadow-md rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-blue-100">
                      <Plus size={18} />
                    </div>
                    <div>
                      <h2 className="font-black tracking-tight text-slate-950">
                        Add Restaurant
                      </h2>
                      <p className="text-xs font-medium text-slate-400">
                        Create a new FoodDash tenant
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setFormOpen(false)}
                    className="flex items-center justify-center w-8 h-8 transition rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
                  >
                    <X size={15} />
                  </button>
                </div>

                <form
                  onSubmit={createRestaurant}
                  className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                  <FormInput
                    label="Restaurant Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="The White House Café"
                  />

                  <FormInput
                    label="Slug"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="white-house-cafe"
                  />

                  <FormInput
                    label="Owner Name"
                    name="ownerName"
                    value={form.ownerName}
                    onChange={handleChange}
                    placeholder="Yuvraj Singh"
                  />

                  <FormInput
                    label="Owner Email"
                    name="ownerEmail"
                    type="email"
                    value={form.ownerEmail}
                    onChange={handleChange}
                    placeholder="owner@cafe.com"
                  />

                  <FormInput
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                  />

                  <FormSelect
                    label="Plan"
                    name="subscriptionPlan"
                    value={form.subscriptionPlan}
                    onChange={handleChange}
                    options={[
                      "free",
                      "website",
                      "starter",
                      "growth",
                      "pro",
                      "premium",
                    ]}
                    getLabel={(v) => PLAN_LABELS[v] || v}
                  />

                  <FormSelect
                    label="Status"
                    name="subscriptionStatus"
                    value={form.subscriptionStatus}
                    onChange={handleChange}
                    options={["trial", "active", "expired", "cancelled"]}
                    getLabel={(v) => STATUS_LABELS[v] || v}
                  />

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={creating}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-950 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-slate-900/10"
                    >
                      {creating ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Plus size={16} />
                      )}
                      {creating ? "Creating…" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Money Flow Analytics ─────────────────────────────────────────── */}
        <motion.div variants={cardVariants}>
          <div className="grid xl:grid-cols-[1.25fr_0.75fr] gap-5">
            <div className="relative overflow-hidden bg-slate-950 rounded-3xl p-6 sm:p-7 text-white shadow-[0_8px_40px_rgba(15,23,42,0.20)]">
              <div className="absolute w-64 h-64 rounded-full -right-20 -top-20 bg-blue-500/20 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/10 mb-4">
                      <BadgeIndianRupee size={13} className="text-blue-300" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-blue-200">
                        Money Flow Analytics
                      </span>
                    </div>

                    <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                      Orders, cash, online and due amount
                    </h2>

                    <p className="max-w-md mt-2 text-sm font-medium leading-relaxed text-slate-400">
                      Combined customer order flow across all FoodDash
                      restaurants. This is not your FoodDash subscription/MRR
                      earnings.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Today", value: "today" },
                      { label: "7 Days", value: "7d" },
                      { label: "30 Days", value: "30d" },
                      { label: "All Time", value: "all" },
                    ].map((filter) => (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => setMoneyRange(filter.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                          moneyRange === filter.value
                            ? "bg-white text-slate-950 shadow-md"
                            : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {moneyLoading && (
                  <div className="flex items-center gap-2 px-4 py-3 mb-4 text-xs font-bold text-blue-200 border rounded-2xl border-white/10 bg-white/5">
                    <Loader2 size={14} className="animate-spin" />
                    Loading money flow analytics…
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <MoneyMetric
                    icon={<ReceiptText size={16} />}
                    label="Total Order Flow"
                    value={formatCurrency(moneyFlow.totalOrderFlow)}
                    sub="Total value of orders processed"
                    strong
                  />

                  <MoneyMetric
                    icon={<Wallet size={16} />}
                    label="Cash Received"
                    value={formatCurrency(moneyFlow.cashReceived)}
                    sub="Orders paid at counter / cash"
                  />

                  <MoneyMetric
                    icon={<CreditCard size={16} />}
                    label="Online Received"
                    value={formatCurrency(moneyFlow.onlineReceived)}
                    sub="Orders marked as online payment"
                  />

                  <MoneyMetric
                    icon={<CheckCircle2 size={16} />}
                    label="Paid Amount"
                    value={formatCurrency(moneyFlow.paidAmount)}
                    sub="Orders marked as paid"
                  />

                  <MoneyMetric
                    icon={<Clock size={16} />}
                    label="Due Amount"
                    value={formatCurrency(moneyFlow.dueAmount)}
                    sub="Orders still marked due"
                  />

                  <MoneyMetric
                    icon={<BarChart3 size={16} />}
                    label="Total Orders"
                    value={moneyFlow.totalOrders}
                    sub="Number of orders in selected range"
                  />
                </div>

                <div className="grid gap-3 mt-5 md:grid-cols-2">
                  <div className="p-4 border rounded-3xl border-white/10 bg-white/5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-white">
                          Order Status Split
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          Based on selected filter
                        </p>
                      </div>

                      <Activity size={18} className="text-cyan-300" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <StatusCount
                        label="Preparing"
                        value={moneyFlow.preparing}
                      />
                      <StatusCount label="Served" value={moneyFlow.served} />
                      <StatusCount
                        label="Completed"
                        value={moneyFlow.completed}
                      />
                    </div>
                  </div>

                  <div className="p-4 border rounded-3xl border-blue-400/20 bg-blue-500/10">
                    <p className="text-sm font-black text-white">SaaS Note</p>

                    <p className="mt-2 text-xs font-medium leading-relaxed text-slate-400">
                      Analytics depends on{" "}
                      <span className="font-bold text-blue-200">
                        restaurantId
                      </span>{" "}
                      in orders. If old orders do not have restaurantId, they
                      will not show here. New SaaS orders should save
                      restaurantId with every order, table session, menu item
                      and setting.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side shows restaurant-wise customer order flow, not plan split */}
            <div className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_40px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-1">
                    Restaurant Flow
                  </p>
                  <h3 className="text-lg font-black tracking-tight text-slate-950">
                    Top Cafés by Orders
                  </h3>
                </div>

                <div className="flex items-center justify-center w-10 h-10 border border-blue-100 rounded-2xl bg-blue-50">
                  <TrendingUp size={17} className="text-blue-600" />
                </div>
              </div>

              <div className="space-y-3">
                {topRestaurantsByOrderFlow.length > 0 ? (
                  topRestaurantsByOrderFlow.map((item) => {
                    const max = Math.max(
                      ...topRestaurantsByOrderFlow.map((x) => x.totalOrderFlow),
                      1,
                    );

                    const pct =
                      item.totalOrderFlow > 0
                        ? Math.min(
                            100,
                            Math.max(5, (item.totalOrderFlow / max) * 100),
                          )
                        : 0;

                    return (
                      <div
                        key={item.restaurant._id}
                        className="p-3 border rounded-2xl border-slate-100 bg-slate-50/70"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-black truncate text-slate-900">
                              {item.restaurant.name}
                            </p>

                            <p className="mt-0.5 text-xs font-medium text-slate-400">
                              {item.totalOrders} orders ·{" "}
                              {formatCurrency(item.dueAmount)} due
                            </p>
                          </div>

                          <p className="text-sm font-black text-blue-600 shrink-0">
                            {formatCurrency(item.totalOrderFlow)}
                          </p>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center border border-blue-200 border-dashed rounded-3xl bg-blue-50">
                    <BarChart3
                      size={26}
                      className="mx-auto mb-3 text-blue-300"
                    />

                    <p className="text-sm font-black text-slate-700">
                      No order flow yet
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Orders will appear after backend returns restaurants in
                      /superadmin/money-flow.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Restaurants List ─────────────────────────────────────────────── */}
        <motion.div variants={cardVariants}>
          <div className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl shadow-[0_8px_40px_rgba(15,23,42,0.06)] overflow-hidden">
            {/* Table header with search/filters */}
            <div className="px-5 py-5 border-b sm:px-6 border-slate-100">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-0.5">
                    Enterprises
                  </p>

                  <h2 className="text-xl font-black tracking-tight text-slate-950">
                    All Connected Restaurants
                  </h2>

                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    Showing {filteredRestaurants.length} of {restaurants.length}{" "}
                    restaurants
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 xl:items-center">
                  {/* Search */}
                  <div className="relative w-full sm:w-64">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Search name, slug, email…"
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

                  {/* Plan filter */}
                  <div className="relative">
                    <Filter
                      size={13}
                      className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2 text-slate-400"
                    />

                    <select
                      value={planFilter}
                      onChange={(e) => setPlanFilter(e.target.value)}
                      className="pl-8 pr-3 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition"
                    >
                      <option value="all">All Plans</option>
                      <option value="free">Free</option>
                      <option value="website">Website</option>
                      <option value="starter">Starter</option>
                      <option value="growth">Growth</option>
                      <option value="pro">Pro</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>

                  {/* Status filter */}
                  <div className="relative">
                    <ShieldCheck
                      size={13}
                      className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2 text-slate-400"
                    />

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-8 pr-3 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition"
                    >
                      <option value="all">All Status</option>
                      <option value="trial">Trial</option>
                      <option value="active">Subscription Active</option>
                      <option value="expired">Expired</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="active-access">Access Active</option>
                      <option value="blocked-access">Access Blocked</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-50">
                    <Loader2 size={20} className="text-blue-600 animate-spin" />
                  </div>

                  <p className="text-sm font-bold text-slate-400">
                    Loading restaurants…
                  </p>
                </div>
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="flex items-center justify-center mb-4 border border-blue-100 w-14 h-14 rounded-2xl bg-blue-50">
                  <Store size={24} className="text-blue-300" />
                </div>

                <p className="mb-1 font-black text-slate-700">
                  No restaurants found
                </p>

                <p className="max-w-xs text-sm font-medium text-slate-400">
                  Try clearing your search or filters. New restaurants appear
                  here after creation.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden lg:block">
                  <div className="grid grid-cols-[1.45fr_1fr_0.65fr_0.65fr_0.95fr_1.3fr] gap-4 px-6 py-3 bg-slate-50/80 border-b border-slate-100">
                    {[
                      "Restaurant",
                      "Owner",
                      "Plan",
                      "Status",
                      "Customer Order Flow",
                      "Actions",
                    ].map((h) => (
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
                      {filteredRestaurants.map((r, i) => (
                        <RestaurantRow
                          key={r._id}
                          restaurant={r}
                          index={i}
                          moneyFlow={moneyFlow}
                          updateSubscription={updateSubscription}
                          toggleActive={toggleActive}
                          deleteRestaurant={deleteRestaurant}
                          accessRestaurantAdmin={accessRestaurantAdmin}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Mobile cards */}
                <div className="p-4 space-y-3 lg:hidden">
                  <AnimatePresence>
                    {filteredRestaurants.map((r, i) => (
                      <RestaurantMobileCard
                        key={r._id}
                        restaurant={r}
                        index={i}
                        moneyFlow={moneyFlow}
                        updateSubscription={updateSubscription}
                        toggleActive={toggleActive}
                        deleteRestaurant={deleteRestaurant}
                        accessRestaurantAdmin={accessRestaurantAdmin}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* Footer count */}
            {filteredRestaurants.length > 0 && (
              <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/60">
                <p className="text-xs font-bold text-slate-400">
                  {filteredRestaurants.length} enterprise
                  {filteredRestaurants.length !== 1 ? "s" : ""} shown
                  {searchText || planFilter !== "all" || statusFilter !== "all"
                    ? ` · filtered from ${restaurants.length} total`
                    : ""}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="pb-4 text-center">
          <p className="text-xs font-bold text-slate-400">
            FoodDash SuperAdmin ·{" "}
            <span className="text-blue-500">Restaurant Manager</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Small Components ────────────────────────────────────────────────────────

function MoneyMetric({ icon, label, value, sub, strong }) {
  return (
    <div
      className={`rounded-3xl border p-4 ${
        strong
          ? "border-blue-400/30 bg-blue-500/15"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-center gap-2 mb-3 text-blue-200">
        {icon}
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
      </div>

      <p className="text-2xl font-black tracking-tight text-white">{value}</p>

      <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
        {sub}
      </p>
    </div>
  );
}

function StatusCount({ label, value }) {
  return (
    <div className="p-3 text-center border rounded-2xl border-white/10 bg-white/5">
      <p className="text-xl font-black text-white">{value}</p>
      <p className="mt-1 text-[11px] font-bold text-slate-500">{label}</p>
    </div>
  );
}

// ─── Desktop Row ──────────────────────────────────────────────────────────────

function RestaurantRow({
  restaurant: r,
  index,
  moneyFlow,
  updateSubscription,
  toggleActive,
  deleteRestaurant,
  accessRestaurantAdmin,
}) {
  const flow = getRestaurantFlow(moneyFlow, r);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.025, duration: 0.3 }}
      className="grid grid-cols-[1.45fr_1fr_0.65fr_0.65fr_0.95fr_1.3fr] gap-4 px-6 py-4 items-center hover:bg-blue-50/30 transition-colors group"
    >
      {/* Restaurant */}
      <div className="flex items-center min-w-0 gap-3">
        <div className="flex items-center justify-center w-10 h-10 text-white shadow-md rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-blue-100 shrink-0">
          <Store size={16} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-black truncate text-slate-900">{r.name}</p>
          <p className="text-xs font-medium truncate text-slate-400">
            /r/{r.slug}
          </p>
        </div>
      </div>

      {/* Owner */}
      <div className="min-w-0">
        <p className="text-sm font-black truncate text-slate-700">
          {r.ownerName || "—"}
        </p>

        <p className="text-xs font-medium truncate text-slate-400">
          {r.ownerEmail || "No email"}
        </p>

        {r.phone && (
          <p className="text-xs font-medium truncate text-slate-400">
            {r.phone}
          </p>
        )}
      </div>

      {/* Plan select */}
      <select
        value={r.subscriptionPlan}
        onChange={(e) =>
          updateSubscription(r, "subscriptionPlan", e.target.value)
        }
        className="text-xs font-bold px-2.5 py-2 rounded-xl border border-slate-200 bg-white outline-none text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer transition capitalize"
      >
        {["free", "website", "starter", "growth", "pro", "premium"].map((v) => (
          <option key={v} value={v}>
            {PLAN_LABELS[v] || v}
          </option>
        ))}
      </select>

      {/* Status select */}
      <select
        value={r.subscriptionStatus}
        onChange={(e) =>
          updateSubscription(r, "subscriptionStatus", e.target.value)
        }
        className="text-xs font-bold px-2.5 py-2 rounded-xl border border-slate-200 bg-white outline-none text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer transition"
      >
        {["trial", "active", "expired", "cancelled"].map((v) => (
          <option key={v} value={v}>
            {STATUS_LABELS[v] || v}
          </option>
        ))}
      </select>

      {/* Customer order flow */}
      <div>
        <p className="text-sm font-black text-slate-900">
          {formatCurrency(flow.totalOrderFlow)}
        </p>

        <p className="text-[11px] font-medium text-slate-400">
          {flow.totalOrders} orders · due {formatCurrency(flow.dueAmount)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => toggleActive(r)}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition hover:-translate-y-0.5 ${
            r.active
              ? "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100"
              : "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100"
          }`}
        >
          {r.active ? <Ban size={12} /> : <CheckCircle2 size={12} />}
          {r.active ? "Block" : "Activate"}
        </button>

        <Link
          to={`/superadmin/restaurants/${r._id}`}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-600 hover:text-white hover:-translate-y-0.5 transition"
        >
          View <ChevronRight size={12} />
        </Link>

        <button
          target="_blank"
          onClick={() => accessRestaurantAdmin(r)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-slate-950 text-white border border-slate-900 hover:bg-blue-700 hover:-translate-y-0.5 transition"
        >
          Access
        </button>

        <button
          onClick={() => deleteRestaurant(r)}
          className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-rose-600 hover:text-white transition hover:-translate-y-0.5"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Mobile Card ──────────────────────────────────────────────────────────────

function RestaurantMobileCard({
  restaurant: r,
  index,
  moneyFlow,
  updateSubscription,
  toggleActive,
  deleteRestaurant,
  accessRestaurantAdmin,
}) {
  const flow = getRestaurantFlow(moneyFlow, r);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="p-4 bg-white border shadow-sm border-slate-100 rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex items-center justify-center text-white w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shrink-0">
          <Store size={17} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-black truncate text-slate-900">
              {r.name}
            </p>

            <span
              className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full border ${
                r.active
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-rose-50 text-rose-600 border-rose-100"
              }`}
            >
              {r.active ? "Active" : "Blocked"}
            </span>
          </div>

          <p className="text-xs font-medium truncate text-slate-400">
            /r/{r.slug}
          </p>

          <p className="text-xs font-medium truncate text-slate-400">
            {r.ownerEmail}
          </p>

          {r.ownerName && (
            <p className="text-xs font-medium text-slate-500">{r.ownerName}</p>
          )}

          {r.phone && (
            <p className="text-xs font-medium text-slate-400">{r.phone}</p>
          )}
        </div>
      </div>

      {/* Customer order flow */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="px-4 py-3 border bg-slate-50 border-slate-100 rounded-xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
            Order Flow
          </p>

          <p className="text-lg font-black text-slate-900">
            {formatCurrency(flow.totalOrderFlow)}
          </p>
        </div>

        <div className="px-4 py-3 border bg-slate-50 border-slate-100 rounded-xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
            Due
          </p>

          <p className="text-lg font-black text-rose-600">
            {formatCurrency(flow.dueAmount)}
          </p>
        </div>
      </div>

      <p className="px-3 py-2 mb-3 text-xs font-bold text-blue-700 rounded-xl bg-blue-50">
        {flow.totalOrders} orders · Cash {formatCurrency(flow.cashReceived)} ·
        Online {formatCurrency(flow.onlineReceived)}
      </p>

      {/* Selects */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <select
          value={r.subscriptionPlan}
          onChange={(e) =>
            updateSubscription(r, "subscriptionPlan", e.target.value)
          }
          className="text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer"
        >
          {["free", "website", "starter", "growth", "pro", "premium"].map(
            (v) => (
              <option key={v} value={v}>
                {PLAN_LABELS[v] || v}
              </option>
            ),
          )}
        </select>

        <select
          value={r.subscriptionStatus}
          onChange={(e) =>
            updateSubscription(r, "subscriptionStatus", e.target.value)
          }
          className="text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer"
        >
          {["trial", "active", "expired", "cancelled"].map((v) => (
            <option key={v} value={v}>
              {STATUS_LABELS[v] || v}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => toggleActive(r)}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
            r.active
              ? "bg-rose-50 text-rose-600 border border-rose-100"
              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
          }`}
        >
          {r.active ? <Ban size={14} /> : <CheckCircle2 size={14} />}
          {r.active ? "Block" : "Activate"}
        </button>

        <Link
          to={`/superadmin/restaurants/${r._id}`}
          className="flex items-center justify-center py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-600 hover:text-white transition"
        >
          View
        </Link>

        <button
          onClick={() => accessRestaurantAdmin(r)}
          className="flex items-center justify-center py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Access Admin
        </button>

        <button
          onClick={() => deleteRestaurant(r)}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-950 text-white hover:bg-rose-600 transition"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </motion.div>
  );
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

function FormInput({ label, ...props }) {
  return (
    <div>
      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
        {label}
      </label>

      <input
        {...props}
        className="w-full px-4 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-xl outline-none text-slate-800 placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
      />
    </div>
  );
}

function FormSelect({ label, options, getLabel, ...props }) {
  return (
    <div>
      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
        {label}
      </label>

      <select
        {...props}
        className="w-full px-4 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-xl outline-none text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer transition"
      >
        {options.map((v) => (
          <option key={v} value={v}>
            {getLabel ? getLabel(v) : v}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SuperAdminRestaurants;
