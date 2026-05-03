import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  IndianRupee,
  RefreshCw,
  ShoppingBag,
  Table2,
  Trophy,
  Utensils,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* ───────────────── HELPERS ───────────────── */

const fmtDateTime = (d) =>
  new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const getOrderTotal = (order) => {
  if (order.total !== undefined && order.total !== null) {
    return Number(order.total || 0);
  }

  return (order.items || []).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0,
  );
};

const getItemsCount = (order) =>
  (order.items || []).reduce((sum, item) => sum + Number(item.qty || 1), 0);

const normalize = (v) => String(v || "").toLowerCase();

const isPaid = (order) => normalize(order.paymentStatus) === "paid";

const isOnline = (order) => {
  const mode = normalize(order.paymentMode);

  return (
    mode === "online" ||
    mode === "razorpay" ||
    mode === "upi" ||
    mode === "card"
  );
};

const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return "—";

  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hrs <= 0) return `${mins} min`;
  return `${hrs}h ${mins}m`;
};

const chartColors = {
  gold: "#d4a74f",
  goldDark: "#b68120",
  navy: "#111936",
  emerald: "#10b981",
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  orange: "#f97316",
  slate: "#64748b",
};

/* ───────────────── CUSTOM TOOLTIP ───────────────── */

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-2xl border border-amber-100 bg-white px-4 py-3 shadow-[0_14px_34px_rgba(15,23,42,0.14)]">
      {label && (
        <p className="mb-1 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
      )}

      {payload.map((item, index) => (
        <p
          key={index}
          className="text-sm font-extrabold"
          style={{ color: item.color }}
        >
          {item.name}: {item.name?.toLowerCase().includes("revenue") ? "₹" : ""}
          {Number(item.value || 0).toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
}

/* ───────────────── STAT CARD ───────────────── */

function StatCard({ icon, label, value, sub, tone = "gold" }) {
  const tones = {
    gold: "from-amber-50 to-white text-amber-700 border-amber-100",
    green: "from-emerald-50 to-white text-emerald-700 border-emerald-100",
    blue: "from-blue-50 to-white text-blue-700 border-blue-100",
    red: "from-red-50 to-white text-red-600 border-red-100",
    purple: "from-violet-50 to-white text-violet-700 border-violet-100",
    slate: "from-slate-50 to-white text-slate-700 border-slate-100",
  };

  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-amber-100 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(15,23,42,0.11)]">
      <div className="absolute rounded-full -right-10 -top-10 h-28 w-28 bg-amber-100/50 blur-2xl" />

      <div className="relative flex items-center gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border bg-gradient-to-br shadow-sm ${
            tones[tone] || tones.gold
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-[0.08em] text-slate-400">
            {label}
          </p>

          <h3
            className="mt-1 truncate text-3xl font-black text-[#111936]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {value}
          </h3>

          {sub && (
            <p className="mt-1 text-xs font-bold text-slate-400">{sub}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────── PANEL ───────────────── */

function Panel({ title, subtitle, icon, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-[28px] border border-amber-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.07)] ${className}`}
    >
      <div className="flex items-start justify-between gap-4 px-5 py-5 border-b border-amber-100/70 bg-gradient-to-r from-white via-amber-50/60 to-white">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111936] text-amber-300 shadow-lg shadow-slate-900/10">
            {icon}
          </div>

          <div>
            <h2
              className="text-xl font-black text-[#111936]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-sm font-semibold text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

/* ───────────────── EMPTY ───────────────── */

function EmptyChart({ text }) {
  return (
    <div className="flex h-[280px] items-center justify-center rounded-3xl border border-dashed border-amber-200 bg-amber-50/40 text-sm font-bold text-slate-400">
      {text}
    </div>
  );
}

/* ───────────────── MAIN PAGE ───────────────── */

export default function AdminAnalytics() {
  const [orders, setOrders] = useState([]);
  const [quick, setQuick] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState("all");

  const fetchOrders = () => {
    setLoading(true);

    api
      .get("/orders")
      .then((res) => {
        setOrders(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to fetch analytics");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ───────────────── DATE FILTER ───────────────── */

  const filteredOrders = useMemo(() => {
    const now = new Date();
    let result = [...orders];

    if (quick === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);

      result = result.filter((order) => new Date(order.createdAt) >= start);
    }

    if (quick === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);

      result = result.filter((order) => new Date(order.createdAt) >= start);
    }

    if (quick === "month") {
      const start = new Date(now);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      result = result.filter((order) => new Date(order.createdAt) >= start);
    }

    return result;
  }, [orders, quick]);

  /* ───────────────── TABLE OPTIONS ───────────────── */

  const tableOptions = useMemo(() => {
    const tables = new Set();

    filteredOrders.forEach((order) => {
      const table = order.table || order.tableId || "Unknown";
      tables.add(String(table));
    });

    return Array.from(tables).sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;

      const numA = Number(a);
      const numB = Number(b);

      if (Number.isNaN(numA) || Number.isNaN(numB)) {
        return String(a).localeCompare(String(b));
      }

      return numA - numB;
    });
  }, [filteredOrders]);

  /* ───────────────── MAIN ANALYTICS FILTER ───────────────── */

  const analyticsOrders = useMemo(() => {
    if (selectedTable === "all") return filteredOrders;

    return filteredOrders.filter((order) => {
      const table = String(order.table || order.tableId || "Unknown");
      return table === selectedTable;
    });
  }, [filteredOrders, selectedTable]);

  const analyticsTitle =
    selectedTable === "all" ? "All Tables" : `Table ${selectedTable}`;

  /* ───────────────── MAIN ANALYTICS ───────────────── */

  const analytics = useMemo(() => {
    const totalOrders = analyticsOrders.length;

    const completedOrders = analyticsOrders.filter(
      (order) => order.status === "completed",
    );

    const activeOrders = analyticsOrders.filter(
      (order) => order.status !== "completed",
    );

    const totalRevenue = analyticsOrders.reduce(
      (sum, order) => sum + getOrderTotal(order),
      0,
    );

    const completedRevenue = completedOrders.reduce(
      (sum, order) => sum + getOrderTotal(order),
      0,
    );

    const totalItems = analyticsOrders.reduce(
      (sum, order) => sum + getItemsCount(order),
      0,
    );

    const paidOrders = analyticsOrders.filter((order) => isPaid(order)).length;

    const dueOrders = analyticsOrders.filter((order) => !isPaid(order)).length;

    const onlineOrders = analyticsOrders.filter((order) =>
      isOnline(order),
    ).length;

    const counterOrders = analyticsOrders.filter(
      (order) => !isOnline(order),
    ).length;

    const preparingOrders = analyticsOrders.filter(
      (order) => order.status === "preparing" || order.status === "pending",
    ).length;

    const servedOrders = analyticsOrders.filter(
      (order) => order.status === "served",
    ).length;

    const averageOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return {
      totalOrders,
      completedOrders: completedOrders.length,
      activeOrders: activeOrders.length,
      totalRevenue,
      completedRevenue,
      totalItems,
      paidOrders,
      dueOrders,
      onlineOrders,
      counterOrders,
      preparingOrders,
      servedOrders,
      averageOrderValue,
    };
  }, [analyticsOrders]);

  /* ───────────────── TOP ITEMS ───────────────── */

  const topItems = useMemo(() => {
    const map = {};

    analyticsOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = item.name || "Unknown Item";

        if (!map[name]) {
          map[name] = {
            name,
            qty: 0,
            revenue: 0,
          };
        }

        map[name].qty += Number(item.qty || 1);
        map[name].revenue += Number(item.price || 0) * Number(item.qty || 1);
      });
    });

    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);
  }, [analyticsOrders]);

  /* ───────────────── TABLE PERFORMANCE ONLY FOR ALL TABLES ───────────────── */

  const tableStats = useMemo(() => {
    const map = {};

    filteredOrders.forEach((order) => {
      const table = order.table || order.tableId || "Unknown";

      if (!map[table]) {
        map[table] = {
          table: `Table ${table}`,
          orders: 0,
          revenue: 0,
          items: 0,
        };
      }

      map[table].orders += 1;
      map[table].revenue += getOrderTotal(order);
      map[table].items += getItemsCount(order);
    });

    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [filteredOrders]);

  /* ───────────────── REVENUE BY DAY ───────────────── */

  const revenueByDay = useMemo(() => {
    const map = {};

    analyticsOrders.forEach((order) => {
      const rawDate = new Date(order.createdAt);
      const sortKey = rawDate.toISOString().split("T")[0];

      const displayDate = rawDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

      if (!map[sortKey]) {
        map[sortKey] = {
          sortKey,
          date: displayDate,
          revenue: 0,
          orders: 0,
          items: 0,
        };
      }

      map[sortKey].revenue += getOrderTotal(order);
      map[sortKey].orders += 1;
      map[sortKey].items += getItemsCount(order);
    });

    return Object.values(map)
      .sort((a, b) => new Date(a.sortKey) - new Date(b.sortKey))
      .slice(-10);
  }, [analyticsOrders]);

  /* ───────────────── SESSION STATS ───────────────── */

  const sessionStats = useMemo(() => {
    const map = {};

    analyticsOrders.forEach((order) => {
      const sessionKey =
        order.sessionId ||
        order.token ||
        `${order.table || "unknown"}-${order._id}`;

      if (!map[sessionKey]) {
        map[sessionKey] = {
          session: sessionKey,
          orders: [],
          revenue: 0,
          items: 0,
        };
      }

      map[sessionKey].orders.push(order);
      map[sessionKey].revenue += getOrderTotal(order);
      map[sessionKey].items += getItemsCount(order);
    });

    const sessions = Object.values(map).map((session, index) => {
      const sortedOrders = [...session.orders].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );

      const firstOrder = sortedOrders[0];
      const lastOrder = sortedOrders[sortedOrders.length - 1];

      const startTime = new Date(firstOrder?.createdAt);

      const endTime = new Date(
        lastOrder?.completedAt ||
          lastOrder?.updatedAt ||
          lastOrder?.createdAt ||
          firstOrder?.createdAt,
      );

      const durationMinutes = Math.max(
        0,
        Math.round((endTime - startTime) / 1000 / 60),
      );

      return {
        name: `Session ${index + 1}`,
        session: session.session,
        orders: session.orders.length,
        revenue: session.revenue,
        items: session.items,
        durationMinutes,
        durationText: formatDuration(durationMinutes),
      };
    });

    const avgSessionMinutes =
      sessions.length > 0
        ? Math.round(
            sessions.reduce(
              (sum, session) => sum + session.durationMinutes,
              0,
            ) / sessions.length,
          )
        : 0;

    return {
      sessions: sessions.slice(-8),
      totalSessions: sessions.length,
      avgSessionMinutes,
      avgSessionText: formatDuration(avgSessionMinutes),
    };
  }, [analyticsOrders]);

  /* ───────────────── CHART DATA ───────────────── */

  const paymentChart = useMemo(
    () => [
      {
        name: "Paid",
        value: analytics.paidOrders,
        color: chartColors.emerald,
      },
      {
        name: "Due",
        value: analytics.dueOrders,
        color: chartColors.red,
      },
    ],
    [analytics],
  );

  const paymentModeChart = useMemo(
    () => [
      {
        name: "Counter",
        value: analytics.counterOrders,
        color: chartColors.gold,
      },
      {
        name: "Online",
        value: analytics.onlineOrders,
        color: chartColors.blue,
      },
    ],
    [analytics],
  );

  const orderStatusChart = useMemo(
    () => [
      {
        name: "Preparing",
        value: analytics.preparingOrders,
      },
      {
        name: "Served",
        value: analytics.servedOrders,
      },
      {
        name: "Completed",
        value: analytics.completedOrders,
      },
    ],
    [analytics],
  );

  const recentCompleted = useMemo(() => {
    return analyticsOrders
      .filter((order) => order.status === "completed")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);
  }, [analyticsOrders]);

  return (
    <div
      className="min-h-screen bg-[#f8f3e7] text-[#111827]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <main className="mx-auto max-w-[1800px] px-4 py-7 sm:px-6">
        {/* HERO */}
        <div className="relative mb-7 overflow-hidden rounded-[34px] border border-amber-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="absolute rounded-full -right-20 -top-20 h-72 w-72 bg-amber-200/50 blur-3xl" />
          <div className="absolute bg-yellow-100 rounded-full -bottom-24 -left-16 h-72 w-72 blur-3xl" />

          <div className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-700">
                <BarChart3 size={15} />
                Premium Business Insights
              </div>

              <h1
                className="text-4xl font-black tracking-tight text-[#111936] sm:text-5xl"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Analytics Dashboard
              </h1>

              <p className="max-w-2xl mt-3 text-sm font-semibold leading-6 text-slate-500 sm:text-base">
                Currently showing analytics for{" "}
                <span className="font-black text-amber-700">
                  {analyticsTitle}
                </span>
                . Change table selection to see revenue, orders, payments,
                items, and session activity for a specific table.
              </p>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                  View Analytics For
                </label>

                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="min-w-[220px] rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-black text-[#111936] outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                >
                  <option value="all">All Tables</option>

                  {tableOptions.map((table) => (
                    <option key={table} value={table}>
                      Table {table}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex">
                {[
                  { value: "today", label: "Today" },
                  { value: "week", label: "7 Days" },
                  { value: "month", label: "This Month" },
                  { value: "all", label: "All Time" },
                ].map((q) => (
                  <button
                    key={q.value}
                    onClick={() => setQuick(q.value)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                      quick === q.value
                        ? "border-[#111936] bg-[#111936] text-amber-300 shadow-lg shadow-slate-900/15"
                        : "border-amber-100 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50"
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchOrders}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-black transition bg-white border shadow-sm rounded-2xl border-amber-100 text-slate-600 hover:border-amber-300 hover:bg-amber-50"
              >
                <RefreshCw size={17} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex items-center justify-center rounded-[30px] border border-amber-100 bg-white py-28 text-sm font-bold text-slate-400 shadow-sm">
            Loading analytics...
          </div>
        ) : (
          <>
            {/* MAIN STATS */}
            <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<IndianRupee size={28} />}
                label={
                  selectedTable === "all" ? "Total Revenue" : "Table Revenue"
                }
                value={`₹${analytics.totalRevenue.toLocaleString("en-IN")}`}
                sub={`Completed: ₹${analytics.completedRevenue.toLocaleString(
                  "en-IN",
                )}`}
                tone="gold"
              />

              <StatCard
                icon={<ShoppingBag size={28} />}
                label={
                  selectedTable === "all" ? "Total Orders" : "Table Orders"
                }
                value={analytics.totalOrders}
                sub={`${analytics.activeOrders} active now`}
                tone="blue"
              />

              <StatCard
                icon={<Utensils size={28} />}
                label="Items Sold"
                value={analytics.totalItems}
                sub={
                  selectedTable === "all"
                    ? "All ordered items"
                    : `From Table ${selectedTable}`
                }
                tone="green"
              />

              <StatCard
                icon={<Clock size={28} />}
                label="Avg Session Time"
                value={sessionStats.avgSessionText}
                sub={`${sessionStats.totalSessions} sessions tracked`}
                tone="purple"
              />
            </div>

            {/* SECONDARY STATS */}
            <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<CreditCard size={28} />}
                label="Average Order"
                value={`₹${analytics.averageOrderValue.toLocaleString(
                  "en-IN",
                )}`}
                sub={`${analytics.paidOrders} paid • ${analytics.dueOrders} due`}
                tone={analytics.dueOrders > 0 ? "red" : "green"}
              />

              <StatCard
                icon={<CheckCircle2 size={28} />}
                label="Completed"
                value={analytics.completedOrders}
                sub="Finished orders"
                tone="green"
              />

              <StatCard
                icon={<Wallet size={28} />}
                label="Counter Payments"
                value={analytics.counterOrders}
                sub={`${analytics.onlineOrders} online`}
                tone="slate"
              />

              <StatCard
                icon={<Activity size={28} />}
                label="Served"
                value={analytics.servedOrders}
                sub="Served but not completed"
                tone="purple"
              />
            </div>

            {/* TOP CHARTS */}
            <div className="grid gap-6 mb-6 xl:grid-cols-3">
              {/* REVENUE AREA CHART */}
              <Panel
                title={
                  selectedTable === "all"
                    ? "Revenue Growth"
                    : `Table ${selectedTable} Revenue Growth`
                }
                subtitle="Daily revenue and order movement"
                icon={<BarChart3 size={20} />}
                className="xl:col-span-2"
              >
                {revenueByDay.length > 0 ? (
                  <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueByDay}>
                        <defs>
                          <linearGradient
                            id="goldRevenue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={chartColors.gold}
                              stopOpacity={0.75}
                            />

                            <stop
                              offset="95%"
                              stopColor={chartColors.gold}
                              stopOpacity={0.04}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1e4c7"
                        />

                        <XAxis
                          dataKey="date"
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke={chartColors.goldDark}
                          strokeWidth={4}
                          fill="url(#goldRevenue)"
                          activeDot={{
                            r: 7,
                            fill: chartColors.goldDark,
                            stroke: "#fff",
                            strokeWidth: 3,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChart text="No revenue data found." />
                )}
              </Panel>

              {/* PAYMENT STATUS PIE */}
              <Panel
                title={
                  selectedTable === "all"
                    ? "Payment Status"
                    : `Payment Status - Table ${selectedTable}`
                }
                subtitle="Paid vs due orders"
                icon={<CreditCard size={20} />}
              >
                {analytics.totalOrders > 0 ? (
                  <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentChart}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={105}
                          paddingAngle={5}
                        >
                          {paymentChart.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>

                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChart text="No payment data found." />
                )}
              </Panel>
            </div>

            {/* MIDDLE CHARTS */}
            <div className="grid gap-6 mb-6 xl:grid-cols-2">
              {/* TOP ITEMS */}
              <Panel
                title={
                  selectedTable === "all"
                    ? "Top Selling Items"
                    : `Top Items - Table ${selectedTable}`
                }
                subtitle="Most ordered menu items by quantity"
                icon={<Trophy size={20} />}
              >
                {topItems.length > 0 ? (
                  <div className="h-[390px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topItems} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="#f1e4c7"
                        />

                        <XAxis
                          type="number"
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          dataKey="name"
                          type="category"
                          width={120}
                          tick={{ fill: "#334155", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Bar
                          dataKey="qty"
                          name="Sold"
                          radius={[0, 14, 14, 0]}
                          fill={chartColors.gold}
                          barSize={18}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChart text="No item data found." />
                )}
              </Panel>

              {/* TABLE PERFORMANCE OR SESSION DURATION */}
              <Panel
                title={
                  selectedTable === "all"
                    ? "Table Performance"
                    : "Session Duration"
                }
                subtitle={
                  selectedTable === "all"
                    ? "Revenue generated by each table"
                    : `Approx active session time for Table ${selectedTable}`
                }
                icon={
                  selectedTable === "all" ? (
                    <Table2 size={20} />
                  ) : (
                    <Clock size={20} />
                  )
                }
              >
                {selectedTable === "all" ? (
                  tableStats.length > 0 ? (
                    <div className="h-[390px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tableStats}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1e4c7"
                          />

                          <XAxis
                            dataKey="table"
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <Tooltip content={<CustomTooltip />} />

                          <Bar
                            dataKey="revenue"
                            name="Revenue"
                            radius={[14, 14, 0, 0]}
                            fill={chartColors.navy}
                            barSize={32}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart text="No table data found." />
                  )
                ) : sessionStats.sessions.length > 0 ? (
                  <div className="h-[390px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sessionStats.sessions}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1e4c7"
                        />

                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Bar
                          dataKey="durationMinutes"
                          name="Session Minutes"
                          radius={[14, 14, 0, 0]}
                          fill={chartColors.purple}
                          barSize={32}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChart text="No session data found for this table." />
                )}
              </Panel>
            </div>

            {/* SMALL CHARTS */}
            <div className="grid gap-6 mb-6 xl:grid-cols-2">
              {/* ORDER STATUS */}
              <Panel
                title={
                  selectedTable === "all"
                    ? "Order Status Breakdown"
                    : `Order Status - Table ${selectedTable}`
                }
                subtitle="Preparing, served, and completed orders"
                icon={<Activity size={20} />}
              >
                {analytics.totalOrders > 0 ? (
                  <div className="h-[330px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={orderStatusChart}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1e4c7"
                        />

                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Bar
                          dataKey="value"
                          name="Orders"
                          radius={[16, 16, 0, 0]}
                          barSize={44}
                        >
                          <Cell fill={chartColors.orange} />
                          <Cell fill={chartColors.blue} />
                          <Cell fill={chartColors.emerald} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChart text="No order status data found." />
                )}
              </Panel>

              {/* PAYMENT MODE */}
              <Panel
                title={
                  selectedTable === "all"
                    ? "Payment Mode"
                    : `Payment Mode - Table ${selectedTable}`
                }
                subtitle="Counter vs online payments"
                icon={<Wallet size={20} />}
              >
                {analytics.totalOrders > 0 ? (
                  <div className="h-[330px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentModeChart}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={105}
                          label
                        >
                          {paymentModeChart.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>

                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChart text="No payment mode data found." />
                )}
              </Panel>
            </div>

            {/* RECENT COMPLETED */}
            {/* <Panel
              title={
                selectedTable === "all"
                  ? "Recent Completed Orders"
                  : `Recent Completed Orders - Table ${selectedTable}`
              }
              subtitle="Latest completed bills from order history"
              icon={<CheckCircle2 size={20} />}
            >
              {recentCompleted.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-sm">
                    <thead>
                      <tr className="text-left border-b border-amber-100 text-slate-400">
                        <th className="py-4 pr-4 font-black uppercase tracking-[0.08em]">
                          Order
                        </th>

                        <th className="py-4 pr-4 font-black uppercase tracking-[0.08em]">
                          Table
                        </th>

                        <th className="py-4 pr-4 font-black uppercase tracking-[0.08em]">
                          Items
                        </th>

                        <th className="py-4 pr-4 font-black uppercase tracking-[0.08em]">
                          Payment
                        </th>

                        <th className="py-4 pr-4 font-black uppercase tracking-[0.08em]">
                          Total
                        </th>

                        <th className="py-4 pr-4 font-black uppercase tracking-[0.08em]">
                          Time
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentCompleted.map((order) => (
                        <tr
                          key={order._id}
                          className="transition border-b border-amber-50 text-slate-700 hover:bg-amber-50/50"
                        >
                          <td className="py-4 pr-4 font-black text-[#111936]">
                            #{order._id?.slice(-5).toUpperCase()}
                          </td>

                          <td className="py-4 pr-4 font-bold">
                            Table {order.table || "—"}
                          </td>

                          <td className="py-4 pr-4 font-semibold">
                            {getItemsCount(order)}
                          </td>

                          <td className="py-4 pr-4">
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] ${
                                isPaid(order)
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {isPaid(order) ? "Paid" : "Due"}
                            </span>
                          </td>

                          <td className="py-4 pr-4 font-black text-amber-700">
                            ₹{getOrderTotal(order).toLocaleString("en-IN")}
                          </td>

                          <td className="py-4 pr-4 text-xs font-bold text-slate-400">
                            {fmtDateTime(order.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-10 text-sm font-bold text-center text-slate-400">
                  No completed orders found.
                </p>
              )}
            </Panel> */}
          </>
        )}
      </main>
    </div>
  );
}
