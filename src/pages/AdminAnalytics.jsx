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

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

const getOrderTotal = (order) => {
  if (order?.total !== undefined && order?.total !== null) {
    return Number(order.total || 0);
  }

  return (order?.items || []).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0,
  );
};

const getItemsCount = (order) =>
  (order?.items || []).reduce((sum, item) => sum + Number(item.qty || 1), 0);

const normalize = (v) => String(v || "").toLowerCase();

const isPaid = (order) => normalize(order?.paymentStatus) === "paid";

const isOnline = (order) =>
  ["online", "razorpay", "upi", "card"].includes(normalize(order?.paymentMode));

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
  orange: "#f59e0b",
  slate: "#64748b",
};

/* ───────────────── TOOLTIP ───────────────── */

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-amber-100 bg-white px-4 py-3 text-xs font-bold shadow-[0_12px_32px_rgba(15,23,42,0.14)]">
      {label && (
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
      )}

      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#111936" }}>
          {p.name}: {p.name?.toLowerCase().includes("revenue") ? "₹" : ""}
          {Number(p.value || 0).toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
}

/* ───────────────── KPI CARD ───────────────── */

function KPI({ icon, label, value, sub, accent = "#d4a74f" }) {
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-[22px] border border-amber-100 bg-white p-4 shadow-[0_8px_26px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(15,23,42,0.09)] sm:p-5">
      <div
        className="flex items-center justify-center w-12 h-12 shrink-0 rounded-2xl"
        style={{
          background: `${accent}18`,
          color: accent,
        }}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-2xl font-bold leading-tight tracking-tight text-[#111936] sm:text-[25px]">
          {value}
        </p>

        {sub && (
          <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
/* ───────────────── PANEL ───────────────── */

function Panel({ title, sub, icon, children, accent = "#d4a74f" }) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-amber-100 bg-white shadow-[0_10px_34px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-3 px-4 py-4 border-b border-amber-100 bg-gradient-to-r from-white via-amber-50/70 to-white sm:px-5">
        <div
          className="flex items-center justify-center w-10 h-10 shrink-0 rounded-2xl"
          style={{
            background: `${accent}18`,
            color: accent,
          }}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <h2
            className="truncate text-base font-black text-[#111936]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {title}
          </h2>

          {sub && (
            <p className="mt-1 text-xs font-semibold text-slate-400">{sub}</p>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function Empty({ text = "No data for this period" }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-3xl border border-dashed border-amber-200 bg-amber-50/40 px-4 text-center text-sm font-bold text-slate-400">
      {text}
    </div>
  );
}

/* ───────────────── MAIN ───────────────── */

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
        setOrders(Array.isArray(res.data) ? res.data.filter(Boolean) : []);
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

  const filtered = useMemo(() => {
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

    filtered.forEach((order) => {
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
  }, [filtered]);

  /* ───────────────── ACTIVE ANALYTICS ORDERS ───────────────── */

  const analyticsOrders = useMemo(() => {
    if (selectedTable === "all") return filtered;

    return filtered.filter((order) => {
      const table = String(order.table || order.tableId || "Unknown");
      return table === selectedTable;
    });
  }, [filtered, selectedTable]);

  const currentView =
    selectedTable === "all" ? "All Tables" : `Table ${selectedTable}`;

  /* ───────────────── KPI DATA ───────────────── */

  const kpi = useMemo(() => {
    const totalRevenue = analyticsOrders.reduce(
      (sum, order) => sum + getOrderTotal(order),
      0,
    );

    const completedOrders = analyticsOrders.filter(
      (order) => normalize(order.status) === "completed",
    );

    const completedRevenue = completedOrders.reduce(
      (sum, order) => sum + getOrderTotal(order),
      0,
    );

    const totalItems = analyticsOrders.reduce(
      (sum, order) => sum + getItemsCount(order),
      0,
    );

    const paid = analyticsOrders.filter((order) => isPaid(order)).length;
    const due = analyticsOrders.filter((order) => !isPaid(order)).length;

    const online = analyticsOrders.filter((order) => isOnline(order)).length;
    const counter = analyticsOrders.filter((order) => !isOnline(order)).length;

    const preparing = analyticsOrders.filter(
      (order) =>
        normalize(order.status) === "preparing" ||
        normalize(order.status) === "pending" ||
        !order.status,
    ).length;

    const served = analyticsOrders.filter(
      (order) => normalize(order.status) === "served",
    ).length;

    const active = analyticsOrders.filter(
      (order) => normalize(order.status) !== "completed",
    ).length;

    const avgOrder =
      analyticsOrders.length > 0
        ? Math.round(totalRevenue / analyticsOrders.length)
        : 0;

    return {
      totalRevenue,
      completedRevenue,
      totalItems,
      paid,
      due,
      online,
      counter,
      preparing,
      served,
      active,
      avgOrder,
      totalOrders: analyticsOrders.length,
      completedCount: completedOrders.length,
    };
  }, [analyticsOrders]);

  /* ───────────────── SESSION ANALYTICS ───────────────── */

  const sessionStats = useMemo(() => {
    const map = {};

    analyticsOrders.forEach((order) => {
      const key =
        order.sessionId ||
        order.token ||
        `${order.table || "unknown"}-${order._id}`;

      if (!map[key]) {
        map[key] = {
          session: key,
          table: order.table || order.tableId || "Unknown",
          orders: [],
          revenue: 0,
          items: 0,
        };
      }

      map[key].orders.push(order);
      map[key].revenue += getOrderTotal(order);
      map[key].items += getItemsCount(order);
    });

    const sessions = Object.values(map).map((session, index) => {
      const sorted = [...session.orders].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );

      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      const start = new Date(first?.createdAt);
      const end = new Date(
        last?.completedAt || last?.updatedAt || last?.createdAt,
      );

      const durationMinutes = Math.max(
        0,
        Math.round((end - start) / 1000 / 60),
      );

      return {
        name:
          selectedTable === "all"
            ? `T${session.table}`
            : `Session ${index + 1}`,
        session: session.session,
        table: session.table,
        orders: session.orders.length,
        revenue: session.revenue,
        items: session.items,
        durationMinutes,
        durationText: formatDuration(durationMinutes),
      };
    });

    const avgMinutes =
      sessions.length > 0
        ? Math.round(
            sessions.reduce(
              (sum, session) => sum + session.durationMinutes,
              0,
            ) / sessions.length,
          )
        : 0;

    const longest =
      sessions.length > 0
        ? Math.max(...sessions.map((session) => session.durationMinutes))
        : 0;

    return {
      sessions: sessions.slice(-10),
      count: sessions.length,
      avgMinutes,
      avgText: formatDuration(avgMinutes),
      longestText: formatDuration(longest),
    };
  }, [analyticsOrders, selectedTable]);

  /* ───────────────── CHART DATA ───────────────── */

  const revenueByDay = useMemo(() => {
    const map = {};

    analyticsOrders.forEach((order) => {
      const rawDate = new Date(order.createdAt);
      const sortKey = rawDate.toISOString().split("T")[0];

      if (!map[sortKey]) {
        map[sortKey] = {
          sortKey,
          date: fmtDate(order.createdAt),
          revenue: 0,
          orders: 0,
        };
      }

      map[sortKey].revenue += getOrderTotal(order);
      map[sortKey].orders += 1;
    });

    return Object.values(map)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-14);
  }, [analyticsOrders]);

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

  const tableStats = useMemo(() => {
    const map = {};

    filtered.forEach((order) => {
      const table = order.table || order.tableId || "Unknown";

      if (!map[table]) {
        map[table] = {
          table: `T${table}`,
          orders: 0,
          revenue: 0,
        };
      }

      map[table].orders += 1;
      map[table].revenue += getOrderTotal(order);
    });

    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [filtered]);

  const paymentPie = useMemo(
    () => [
      { name: "Paid", value: kpi.paid, color: chartColors.emerald },
      { name: "Due", value: kpi.due, color: chartColors.red },
    ],
    [kpi.paid, kpi.due],
  );

  const modePie = useMemo(
    () => [
      { name: "Counter", value: kpi.counter, color: chartColors.gold },
      { name: "Online", value: kpi.online, color: chartColors.blue },
    ],
    [kpi.counter, kpi.online],
  );

  const statusBar = useMemo(
    () => [
      { name: "Preparing", value: kpi.preparing, fill: chartColors.orange },
      { name: "Served", value: kpi.served, fill: chartColors.blue },
      {
        name: "Completed",
        value: kpi.completedCount,
        fill: chartColors.emerald,
      },
    ],
    [kpi.preparing, kpi.served, kpi.completedCount],
  );

  const QUICK_OPTS = [
    { value: "today", label: "Today" },
    { value: "week", label: "7 Days" },
    { value: "month", label: "Month" },
    { value: "all", label: "All Time" },
  ];

  return (
    <div
      className="min-h-screen bg-[#f8f5ef] text-[#111936]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <main className="mx-auto max-w-[1600px] px-3 py-5 sm:px-5 lg:px-6">
        {/* FILTER BAR - NO HEADER */}
        <div className="mb-5 rounded-[26px] border border-amber-100 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.06)] sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#111936] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-400">
                <BarChart3 size={12} />
                Business Analytics
              </div>

              <p className="mt-3 text-sm font-bold text-slate-500">
                Showing data for{" "}
                <span className="font-black text-amber-700">{currentView}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:items-end">
              {/* TABLE SELECT */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Table
                </label>

                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="h-11 min-w-[190px] rounded-2xl border border-amber-200 bg-white px-4 text-sm font-black text-[#111936] outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                >
                  <option value="all">All Tables</option>

                  {tableOptions.map((table) => (
                    <option key={table} value={table}>
                      Table {table}
                    </option>
                  ))}
                </select>
              </div>

              {/* QUICK FILTER */}
              <div className="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Period
                </label>

                <div className="grid grid-cols-2 overflow-hidden bg-white border rounded-2xl border-amber-200 sm:flex">
                  {QUICK_OPTS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setQuick(option.value)}
                      className={`h-11 px-4 text-xs font-black transition ${
                        quick === option.value
                          ? "bg-[#111936] text-amber-400"
                          : "bg-white text-slate-500 hover:bg-amber-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* REFRESH BUTTON */}
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 text-sm font-black transition bg-white border h-11 rounded-2xl border-amber-200 text-slate-600 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 xl:col-span-1"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-[260px] items-center justify-center rounded-[26px] border border-amber-100 bg-white text-sm font-bold text-slate-400 shadow-sm">
            Loading analytics...
          </div>
        ) : (
          <>
            {/* KPI ROW 1 */}
            <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 xl:grid-cols-5">
              <KPI
                icon={<IndianRupee size={22} />}
                label={
                  selectedTable === "all" ? "Total Revenue" : "Table Revenue"
                }
                value={`₹${kpi.totalRevenue.toLocaleString("en-IN")}`}
                sub={`Completed ₹${kpi.completedRevenue.toLocaleString("en-IN")}`}
                accent={chartColors.gold}
              />

              <KPI
                icon={<ShoppingBag size={22} />}
                label={
                  selectedTable === "all" ? "Total Orders" : "Table Orders"
                }
                value={kpi.totalOrders}
                sub={`${kpi.active} active now`}
                accent={chartColors.blue}
              />

              <KPI
                icon={<Utensils size={22} />}
                label="Items Sold"
                value={kpi.totalItems}
                sub="Total qty ordered"
                accent={chartColors.emerald}
              />

              <KPI
                icon={<Clock size={22} />}
                label="Avg Session"
                value={sessionStats.avgText}
                sub={`${sessionStats.count} sessions`}
                accent={chartColors.purple}
              />

              <KPI
                icon={<CreditCard size={22} />}
                label="Avg Order Value"
                value={`₹${kpi.avgOrder.toLocaleString("en-IN")}`}
                sub={`${kpi.paid} paid · ${kpi.due} due`}
                accent={kpi.due > 0 ? chartColors.red : chartColors.emerald}
              />
            </div>

            {/* KPI ROW 2 */}
            <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-4">
              <KPI
                icon={<CheckCircle2 size={20} />}
                label="Completed"
                value={kpi.completedCount}
                sub="Finished orders"
                accent={chartColors.emerald}
              />

              <KPI
                icon={<Activity size={20} />}
                label="Serving Now"
                value={kpi.served}
                sub="Served, not completed"
                accent={chartColors.blue}
              />

              <KPI
                icon={<Wallet size={20} />}
                label="Counter Pay"
                value={kpi.counter}
                sub={`${kpi.online} online`}
                accent={chartColors.slate}
              />

              <KPI
                icon={<Trophy size={20} />}
                label="Top Item"
                value={topItems[0]?.name || "—"}
                sub={topItems[0] ? `${topItems[0].qty} sold` : "No item data"}
                accent={chartColors.gold}
              />
            </div>

            {/* CHARTS ROW 1 */}
            <div className="grid grid-cols-1 gap-5 mb-5 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <Panel
                  title={
                    selectedTable === "all"
                      ? "Revenue Over Time"
                      : `Revenue Over Time - Table ${selectedTable}`
                  }
                  sub="Daily revenue trend"
                  icon={<BarChart3 size={16} />}
                  accent={chartColors.gold}
                >
                  {revenueByDay.length > 0 ? (
                    <div className="h-[280px] sm:h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={revenueByDay}
                          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="rev"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={chartColors.gold}
                                stopOpacity={0.35}
                              />
                              <stop
                                offset="95%"
                                stopColor={chartColors.gold}
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f0ece3"
                          />

                          <XAxis
                            dataKey="date"
                            tick={{ fill: "#9ca3af", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            tick={{ fill: "#9ca3af", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <Tooltip content={<ChartTip />} />

                          <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke={chartColors.goldDark}
                            strokeWidth={2.8}
                            fill="url(#rev)"
                            dot={false}
                            activeDot={{
                              r: 5,
                              fill: chartColors.goldDark,
                              stroke: "#fff",
                              strokeWidth: 2,
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <Empty />
                  )}
                </Panel>
              </div>

              <div className="xl:col-span-1">
                <Panel
                  title={
                    selectedTable === "all"
                      ? "Payment Status"
                      : `Payment Status - Table ${selectedTable}`
                  }
                  sub="Paid vs due"
                  icon={<CreditCard size={16} />}
                  accent={chartColors.emerald}
                >
                  {kpi.totalOrders > 0 ? (
                    <div className="h-[280px] sm:h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentPie}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={95}
                            paddingAngle={4}
                          >
                            {paymentPie.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>

                          <Tooltip content={<ChartTip />} />

                          <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <Empty />
                  )}
                </Panel>
              </div>
            </div>

            {/* CHARTS ROW 2 */}
            <div className="grid grid-cols-1 gap-5 mb-5 xl:grid-cols-2">
              <Panel
                title={
                  selectedTable === "all"
                    ? "Top Selling Items"
                    : `Top Items - Table ${selectedTable}`
                }
                sub="By quantity ordered"
                icon={<Trophy size={16} />}
                accent={chartColors.gold}
              >
                {topItems.length > 0 ? (
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topItems}
                        layout="vertical"
                        margin={{ left: 0, right: 12, top: 4, bottom: 4 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="#f0ece3"
                        />

                        <XAxis
                          type="number"
                          tick={{ fill: "#9ca3af", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          dataKey="name"
                          type="category"
                          width={105}
                          tick={{ fill: "#374151", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip content={<ChartTip />} />

                        <Bar
                          dataKey="qty"
                          name="Sold"
                          radius={[0, 10, 10, 0]}
                          fill={chartColors.gold}
                          barSize={16}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <Empty />
                )}
              </Panel>

              {selectedTable === "all" ? (
                <Panel
                  title="Table Performance"
                  sub="Revenue by table"
                  icon={<Table2 size={16} />}
                  accent={chartColors.navy}
                >
                  {tableStats.length > 0 ? (
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={tableStats}
                          margin={{ top: 4, right: 12, left: -12, bottom: 4 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f0ece3"
                          />

                          <XAxis
                            dataKey="table"
                            tick={{ fill: "#9ca3af", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            tick={{ fill: "#9ca3af", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <Tooltip content={<ChartTip />} />

                          <Bar
                            dataKey="revenue"
                            name="Revenue"
                            radius={[10, 10, 0, 0]}
                            fill={chartColors.navy}
                            barSize={28}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <Empty />
                  )}
                </Panel>
              ) : (
                <Panel
                  title={`Session Time - Table ${selectedTable}`}
                  sub={`Avg ${sessionStats.avgText} · Longest ${sessionStats.longestText}`}
                  icon={<Clock size={16} />}
                  accent={chartColors.purple}
                >
                  {sessionStats.sessions.length > 0 ? (
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={sessionStats.sessions}
                          margin={{ top: 4, right: 12, left: -12, bottom: 4 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f0ece3"
                          />

                          <XAxis
                            dataKey="name"
                            tick={{ fill: "#9ca3af", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            tick={{ fill: "#9ca3af", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                          />

                          <Tooltip content={<ChartTip />} />

                          <Bar
                            dataKey="durationMinutes"
                            name="Session Minutes"
                            radius={[10, 10, 0, 0]}
                            fill={chartColors.purple}
                            barSize={28}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <Empty text="No session time found for this table" />
                  )}
                </Panel>
              )}
            </div>

            {/* CHARTS ROW 3 */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <Panel
                title="Daily Orders Volume"
                sub="Number of orders per day"
                icon={<ShoppingBag size={16} />}
                accent={chartColors.slate}
              >
                {revenueByDay.length > 0 ? (
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={revenueByDay}
                        margin={{ top: 4, right: 12, left: -12, bottom: 4 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f0ece3"
                        />

                        <XAxis
                          dataKey="date"
                          tick={{ fill: "#9ca3af", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          tick={{ fill: "#9ca3af", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />

                        <Tooltip content={<ChartTip />} />

                        <Bar
                          dataKey="orders"
                          name="Orders"
                          radius={[8, 8, 0, 0]}
                          fill={chartColors.slate}
                          barSize={24}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <Empty />
                )}
              </Panel>

              <Panel
                title="Payment Mode Split"
                sub="Counter vs online payments"
                icon={<Wallet size={16} />}
                accent={chartColors.blue}
              >
                {kpi.totalOrders > 0 ? (
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={modePie}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {modePie.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>

                        <Tooltip content={<ChartTip />} />

                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <Empty />
                )}
              </Panel>

              <Panel
                title={
                  selectedTable === "all"
                    ? "Order Status Breakdown"
                    : `Order Status - Table ${selectedTable}`
                }
                sub="Preparing · Served · Completed"
                icon={<Activity size={16} />}
                accent={chartColors.orange}
              >
                {kpi.totalOrders > 0 ? (
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statusBar}
                        margin={{ top: 4, right: 12, left: -12, bottom: 4 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f0ece3"
                        />

                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#9ca3af", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          tick={{ fill: "#9ca3af", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />

                        <Tooltip content={<ChartTip />} />

                        <Bar
                          dataKey="value"
                          name="Orders"
                          radius={[8, 8, 0, 0]}
                          barSize={30}
                        >
                          {statusBar.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <Empty />
                )}
              </Panel>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
