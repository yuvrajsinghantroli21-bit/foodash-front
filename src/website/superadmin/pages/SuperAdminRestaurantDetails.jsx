import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  Banknote,
  BarChart3,
  CheckCircle2,
  Clock,
  CalendarDays,
  Crown,
  ExternalLink,
  Globe2,
  IndianRupee,
  Layers3,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  User,
  WalletCards,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/superAdminApi";

const ranges = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7days" },
  { label: "30 Days", value: "30days" },
  { label: "All Time", value: "all" },
];

const billingCycles = [
  { label: "Monthly", value: "monthly", days: 30 },
  { label: "Quarterly", value: "quarterly", days: 90 },
  { label: "6 Months", value: "halfyearly", days: 180 },
  { label: "1 Year", value: "yearly", days: 365 },
];

const planOptions = [
  { label: "Website", value: "website" },
  { label: "Starter", value: "starter" },
  { label: "Pro", value: "pro" },
];

const formatDate = (date) => {
  if (!date) return "Not Set";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function SuperAdminRestaurantDetails() {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [range, setRange] = useState("today");
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const normalizedPlan =
    restaurant?.plan || restaurant?.subscriptionPlan || "website";

  const daysLeft = useMemo(() => {
    if (!restaurant?.subscriptionExpiryDate) return 0;

    const diff =
      new Date(restaurant.subscriptionExpiryDate).getTime() - Date.now();

    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [restaurant]);

  const fetchRestaurant = () => {
    setLoading(true);

    api
      .get(`/superadmin/restaurants/${id}`)
      .then((res) => {
        setRestaurant(res.data.restaurant);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to load restaurant");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchAnalytics = () => {
    setAnalyticsLoading(true);

    api
      .get(`/superadmin/restaurants/${id}/analytics?range=${range}`)
      .then((res) => {
        setAnalytics(res.data.analytics || null);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to load analytics");
      })
      .finally(() => {
        setAnalyticsLoading(false);
      });
  };

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  useEffect(() => {
    fetchAnalytics();
  }, [id, range]);

  const toggleActive = () => {
    if (!restaurant) return;

    api
      .put(`/superadmin/restaurants/${restaurant._id}/active`, {
        active: !restaurant.active,
      })
      .then(() => {
        toast.success(
          restaurant.active ? "Restaurant blocked" : "Restaurant activated",
        );
        fetchRestaurant();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to update status");
      });
  };

  const updateSubscription = (field, value) => {
    if (!restaurant) return;

    api
      .put(`/superadmin/restaurants/${restaurant._id}/subscription`, {
        subscriptionPlan: normalizedPlan,
        subscriptionStatus: restaurant.subscriptionStatus,
        billingCycle: restaurant.billingCycle || "monthly",
        subscriptionExpiryDate: restaurant.subscriptionExpiryDate,
        [field]: value,
      })
      .then(() => {
        toast.success("Subscription updated");
        fetchRestaurant();
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message || "Failed to update subscription",
        );
      });
  };

  const extendPlan = (days) => {
    if (!restaurant) return;

    const ok = window.confirm(
      `Add ${days} days to this restaurant subscription?`,
    );
    if (!ok) return;

    api
      .put(`/superadmin/restaurants/${restaurant._id}/extend`, { days })
      .then(() => {
        toast.success(`${days} days added`);
        fetchRestaurant();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to extend plan");
      });
  };

  const extendByBillingCycle = () => {
    const currentCycle = restaurant?.billingCycle || "monthly";
    const matched = billingCycles.find((cycle) => cycle.value === currentCycle);

    extendPlan(matched?.days || 30);
  };

  const refreshAll = () => {
    fetchRestaurant();
    fetchAnalytics();
  };

  const moneyStats = useMemo(() => {
    const safe = analytics || {};

    return [
      {
        title: "Total Order Flow",
        value: formatMoney(safe.totalRevenue),
        sub: "Total value of orders processed",
        icon: IndianRupee,
        tone: "dark",
      },
      {
        title: "Cash Received",
        value: formatMoney(safe.cashRevenue),
        sub: "Orders paid at counter / cash",
        icon: Banknote,
        tone: "amber",
      },
      {
        title: "Online Received",
        value: formatMoney(safe.onlineRevenue),
        sub: "Orders marked as online payment",
        icon: WalletCards,
        tone: "blue",
      },
      {
        title: "Paid Amount",
        value: formatMoney(safe.paidRevenue),
        sub: "Orders marked as paid",
        icon: CheckCircle2,
        tone: "green",
      },
      {
        title: "Due Amount",
        value: formatMoney(safe.dueRevenue),
        sub: "Orders still marked due",
        icon: Clock,
        tone: "red",
      },
      {
        title: "Total Orders",
        value: safe.totalOrders || 0,
        sub: "Number of orders in selected range",
        icon: Layers3,
        tone: "stone",
      },
    ];
  }, [analytics]);

  const orderStats = useMemo(() => {
    const safe = analytics || {};

    return [
      {
        label: "Preparing",
        value: safe.preparingOrders || 0,
        className: "bg-amber-50 text-amber-800 border-amber-100",
      },
      {
        label: "Served",
        value: safe.servedOrders || 0,
        className: "bg-emerald-50 text-emerald-800 border-emerald-100",
      },
      {
        label: "Completed",
        value: safe.completedOrders || 0,
        className: "bg-stone-100 text-stone-800 border-stone-200",
      },
    ];
  }, [analytics]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-[2rem] border border-amber-100 bg-white px-8 py-7 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-amber-700" size={34} />
          <p className="mt-4 text-sm font-black uppercase tracking-[0.22em] text-stone-400">
            Loading Restaurant
          </p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="rounded-[2rem] border border-red-100 bg-red-50 p-8 text-center shadow-sm">
        <h2 className="text-xl font-black text-red-700">
          Restaurant not found
        </h2>

        <Link
          to="/superadmin/restaurants"
          className="inline-flex px-5 py-3 mt-5 text-sm font-black text-white bg-red-700 rounded-2xl"
        >
          Back to Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="flex flex-col justify-between gap-3 mb-6 sm:flex-row sm:items-center">
        <Link
          to="/superadmin/restaurants"
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-amber-100 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-amber-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <button
          onClick={refreshAll}
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-amber-100 bg-[#fff8ec] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-stone-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <section className="relative overflow-hidden rounded-[2.3rem] border border-amber-100 bg-[#201108] p-6 shadow-xl shadow-stone-900/10 sm:p-8">
        <div className="absolute w-64 h-64 rounded-full -right-16 -top-20 bg-amber-300/20 blur-3xl" />
        <div className="absolute rounded-full -bottom-24 left-1/3 h-72 w-72 bg-orange-200/10 blur-3xl" />

        <div className="relative z-10 grid gap-8 xl:grid-cols-[1.35fr_0.65fr] xl:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-amber-200 backdrop-blur-xl">
              <Sparkles size={15} />
              Restaurant Command Center
            </div>

            <h1 className="max-w-4xl text-4xl font-black tracking-[-0.05em] text-[#fff5da] sm:text-5xl lg:text-6xl">
              {restaurant.name}
            </h1>

            <p className="max-w-2xl mt-4 text-sm font-semibold leading-7 text-amber-50/65 sm:text-base">
              Track this restaurant’s order flow, owner information,
              subscription health, payment split and future SaaS controls from
              one premium Super Admin view.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <StatusPill
                label={restaurant.active ? "Active Account" : "Blocked Account"}
                active={restaurant.active}
              />
              <InfoPill label={`Plan: ${normalizedPlan}`} />
              <InfoPill label={`Status: ${restaurant.subscriptionStatus}`} />
              <InfoPill
                label={`Billing: ${restaurant.billingCycle || "monthly"}`}
              />
              <InfoPill
                label={`Expires: ${formatDate(restaurant.subscriptionExpiryDate)}`}
              />
              <InfoPill label={`/r/${restaurant.slug}`} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-amber-200/20 bg-[#fff8ec] p-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3b2114] text-amber-200">
                <Store size={25} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">
                  Tenant URL
                </p>
                <p className="mt-1 text-lg font-black text-[#2b160c]">
                  /r/{restaurant.slug}
                </p>
              </div>
            </div>

            <div className="grid gap-3 mt-5">
              <MiniInfo
                icon={User}
                label="Owner"
                value={restaurant.ownerName}
              />
              <MiniInfo
                icon={Mail}
                label="Email"
                value={restaurant.ownerEmail}
              />
              <MiniInfo icon={Phone} label="Phone" value={restaurant.phone} />
            </div>

            <Link
              to={`/r/${restaurant.slug}`}
              target="_blank"
              className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-[#3b2114] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-amber-100 transition hover:bg-[#2b160c]"
            >
              Open Website
              <ExternalLink size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-amber-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-700">
              Money Flow Analytics
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#241309]">
              Orders, cash, online and due amount
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl border border-amber-100 bg-[#fff8ec] p-1.5">
            {ranges.map((item) => (
              <button
                key={item.value}
                onClick={() => setRange(item.value)}
                className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
                  range === item.value
                    ? "bg-[#3b2114] text-amber-100 shadow-md"
                    : "text-stone-500 hover:bg-white hover:text-stone-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {analyticsLoading ? (
          <div className="mt-8 flex min-h-40 items-center justify-center rounded-[2rem] bg-amber-50">
            <Loader2 className="animate-spin text-amber-700" size={30} />
          </div>
        ) : (
          <>
            <div className="grid gap-4 mt-6 md:grid-cols-2 2xl:grid-cols-3">
              {moneyStats.map((stat) => (
                <MoneyCard key={stat.title} {...stat} />
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <div className="rounded-[1.8rem] border border-amber-100 bg-[#fffaf2] p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center h-11 w-11 rounded-2xl bg-amber-100 text-amber-800">
                    <BarChart3 size={21} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#2b160c]">
                      Order Status Split
                    </h3>
                    <p className="text-xs font-bold text-stone-400">
                      Based on selected filter
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {orderStats.map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-2xl border p-4 text-center ${item.className}`}
                    >
                      <p className="text-2xl font-black">{item.value}</p>
                      <p className="mt-1 text-xs font-black uppercase tracking-[0.16em]">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-amber-100 bg-[#2b160c] p-5 text-amber-50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
                      SaaS Note
                    </p>
                    <h3 className="mt-2 text-xl font-black tracking-tight text-[#fff5da]">
                      Analytics depends on restaurantId in orders
                    </h3>
                    <p className="mt-3 text-sm font-semibold leading-6 text-amber-50/60">
                      If old orders do not have restaurantId, they will not show
                      here. New SaaS orders should save restaurantId with every
                      order, table session, menu item and setting.
                    </p>
                  </div>

                  <TrendingUp className="shrink-0 text-amber-300" size={28} />
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] border border-amber-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-100 text-amber-800">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">
                Owner Details
              </p>
              <h3 className="text-xl font-black text-[#2b160c]">
                Contact Information
              </h3>
            </div>
          </div>

          <InfoRow
            icon={User}
            label="Owner Name"
            value={restaurant.ownerName}
          />
          <InfoRow
            icon={Mail}
            label="Owner Email"
            value={restaurant.ownerEmail}
          />
          <InfoRow icon={Phone} label="Phone" value={restaurant.phone} />
          <InfoRow icon={Globe2} label="Slug" value={restaurant.slug} />
        </div>

        <div className="rounded-[2rem] border border-amber-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3b2114] text-amber-200">
              <Crown size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">
                Subscription
              </p>
              <h3 className="text-xl font-black text-[#2b160c]">
                Plan Control
              </h3>
            </div>
          </div>

          <div className="mb-5 rounded-[1.7rem] border border-amber-100 bg-[#fffaf2] p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-11 w-11 shrink-0 rounded-2xl bg-amber-100 text-amber-800">
                <CalendarDays size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                  Expiry Date
                </p>
                <p className="mt-1 text-xl font-black text-[#2b160c]">
                  {formatDate(restaurant.subscriptionExpiryDate)}
                </p>
                <p
                  className={`mt-1 text-sm font-black ${
                    daysLeft <= 7 ? "text-red-600" : "text-emerald-700"
                  }`}
                >
                  {restaurant.subscriptionExpiryDate
                    ? `${daysLeft} days remaining`
                    : "No expiry date set"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                Plan
              </label>

              <select
                value={normalizedPlan}
                onChange={(e) =>
                  updateSubscription("subscriptionPlan", e.target.value)
                }
                className="w-full rounded-2xl border border-amber-100 bg-[#fffaf2] px-4 py-3 text-sm font-bold text-stone-800 outline-none transition focus:border-amber-400 focus:bg-white"
              >
                {planOptions.map((plan) => (
                  <option key={plan.value} value={plan.value}>
                    {plan.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                Billing Cycle
              </label>

              <select
                value={restaurant.billingCycle || "monthly"}
                onChange={(e) =>
                  updateSubscription("billingCycle", e.target.value)
                }
                className="w-full rounded-2xl border border-amber-100 bg-[#fffaf2] px-4 py-3 text-sm font-bold text-stone-800 outline-none transition focus:border-amber-400 focus:bg-white"
              >
                {billingCycles.map((cycle) => (
                  <option key={cycle.value} value={cycle.value}>
                    {cycle.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                Status
              </label>

              <select
                value={restaurant.subscriptionStatus || "trial"}
                onChange={(e) =>
                  updateSubscription("subscriptionStatus", e.target.value)
                }
                className="w-full rounded-2xl border border-amber-100 bg-[#fffaf2] px-4 py-3 text-sm font-bold text-stone-800 outline-none transition focus:border-amber-400 focus:bg-white"
              >
                <option value="trial">trial</option>
                <option value="active">active</option>
                <option value="expired">expired</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                Active
              </label>

              <button
                onClick={toggleActive}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${
                  restaurant.active
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              >
                {restaurant.active ? (
                  <Ban size={17} />
                ) : (
                  <CheckCircle2 size={17} />
                )}
                {restaurant.active ? "Block" : "Activate"}
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-[1.7rem] border border-amber-100 bg-[#fffaf2] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
              Extend Subscription
            </p>

            <div className="grid gap-3 mt-3 sm:grid-cols-2">
              <button
                onClick={() => extendPlan(30)}
                className="rounded-2xl bg-amber-100 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-amber-800 transition hover:bg-amber-200"
              >
                +30 Days
              </button>

              <button
                onClick={() => extendPlan(90)}
                className="rounded-2xl bg-amber-100 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-amber-800 transition hover:bg-amber-200"
              >
                +90 Days
              </button>

              <button
                onClick={() => extendPlan(180)}
                className="rounded-2xl bg-amber-100 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-amber-800 transition hover:bg-amber-200"
              >
                +6 Months
              </button>

              <button
                onClick={() => extendPlan(365)}
                className="rounded-2xl bg-amber-100 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-amber-800 transition hover:bg-amber-200"
              >
                +1 Year
              </button>

              <button
                className="rounded-2xl bg-amber-100 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-amber-800 transition hover:bg-amber-200"
                onClick={() => extendPlan(-30)}
              >
                −30 Days
              </button>
              <button
                className="rounded-2xl bg-amber-100 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-amber-800 transition hover:bg-amber-200"
                onClick={() => extendPlan(-90)}
              >
                −90 Days
              </button>
            </div>

            <button
              onClick={extendByBillingCycle}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3b2114] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-amber-100 transition hover:bg-[#2b160c]"
            >
              Extend by Selected Billing Cycle
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-amber-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">
              Coming Next
            </p>
            <h3 className="mt-2 text-xl font-black text-[#2b160c]">
              Advanced Restaurant Controls
            </h3>
          </div>
          <Sparkles className="text-amber-700" />
        </div>

        <div className="grid gap-4 mt-5 md:grid-cols-3">
          <FutureCard
            title="Website Overrides"
            sub="Custom CSS and typography"
          />
          <FutureCard title="Custom Domain" sub="whitehouse.foodash.com" />
          <FutureCard
            title="Payment History"
            sub="Plan invoices and renewals"
          />
        </div>
      </section>
    </div>
  );
}

function MoneyCard({ title, value, sub, icon: Icon, tone }) {
  const toneClass = {
    dark: "bg-[#2b160c] text-amber-100 border-[#2b160c]",
    amber: "bg-amber-50 text-amber-800 border-amber-100",
    blue: "bg-sky-50 text-sky-800 border-sky-100",
    green: "bg-emerald-50 text-emerald-800 border-emerald-100",
    red: "bg-red-50 text-red-800 border-red-100",
    stone: "bg-stone-50 text-stone-800 border-stone-100",
  };

  return (
    <div
      className={`rounded-[1.8rem] border p-5 shadow-sm ${
        toneClass[tone] || toneClass.stone
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] opacity-70">
            {title}
          </p>
          <h3 className="mt-3 text-3xl font-black tracking-tight">{value}</h3>
          <p className="mt-2 text-sm font-semibold opacity-65">{sub}</p>
        </div>

        <div className="flex items-center justify-center w-12 h-12 shadow-sm shrink-0 rounded-2xl bg-white/65">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ label, active }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${
        active
          ? "bg-emerald-300/15 text-emerald-200 ring-1 ring-emerald-200/20"
          : "bg-red-300/15 text-red-200 ring-1 ring-red-200/20"
      }`}
    >
      {active ? <CheckCircle2 size={15} /> : <Ban size={15} />}
      {label}
    </span>
  );
}

function InfoPill({ label }) {
  return (
    <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-amber-50/75 ring-1 ring-white/10">
      {label}
    </span>
  );
}

function MiniInfo({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border rounded-2xl border-amber-100">
      <Icon size={17} className="text-amber-700" />
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-400">
          {label}
        </p>
        <p className="text-sm font-black truncate text-stone-800">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-100 bg-[#fffaf2] p-4">
      <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-amber-100 text-amber-800">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-black truncate text-stone-800">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

function FutureCard({ title, sub }) {
  return (
    <div className="p-5 border border-dashed rounded-2xl border-amber-200 bg-amber-50">
      <p className="text-sm font-black text-amber-800">{title}</p>
      <p className="mt-1 text-xs font-semibold text-stone-400">{sub}</p>
    </div>
  );
}

function formatMoney(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default SuperAdminRestaurantDetails;
