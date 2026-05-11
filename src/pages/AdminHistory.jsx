import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { printBill } from "../components/PrintBill";

import {
  Download,
  Search,
  Calendar,
  Clock,
  ShoppingBag,
  Users,
  Crown,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Home,
  IndianRupee,
  Armchair,
  Package,
  List,
  CreditCard,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Utensils,
  Flame,
  QrCode,
  Activity,
  History,
} from "lucide-react";

/* ───────────────── HELPERS ───────────────── */

const fmt = (d) =>
  new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const getItemImage = (item, menu = []) => {
  // 1. New orders: image saved inside order item
  if (item?.image) {
    if (item.image.startsWith("http")) return item.image;
    return `https://fooadash.onrender.com/uploads/${item.image}`;
  }

  // 2. Old orders: find image from menu by item name
  const found = menu.find(
    (m) => m.name?.toLowerCase() === item.name?.toLowerCase(),
  );

  if (!found?.image) return "";

  if (found.image.startsWith("http")) return found.image;

  return `https://fooadash.onrender.com/uploads/${found.image}`;
};

const getOrderTotal = (order) =>
  order.items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0,
  );

const getSessionTotal = (sessionOrders) =>
  sessionOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
const getOrderSubtotal = (order) => Number(order.subtotal || order.total || 0);

const getOrderDiscount = (order) =>
  Number(order.discountAmount || order.coupon?.discountAmount || 0);

const getOrderFinalTotal = (order) =>
  Number(order.finalTotal || order.total || 0);

const getSessionSubtotal = (sessionOrders) =>
  sessionOrders.reduce((sum, order) => sum + getOrderSubtotal(order), 0);

const getSessionDiscount = (sessionOrders) =>
  sessionOrders.reduce((sum, order) => sum + getOrderDiscount(order), 0);

const getSessionFinalTotal = (sessionOrders) =>
  sessionOrders.reduce((sum, order) => sum + getOrderFinalTotal(order), 0);

const getSessionCoupon = (sessionOrders) =>
  sessionOrders.find((order) => order.coupon?.code)?.coupon || null;

const getSessionItemCount = (sessionOrders) =>
  sessionOrders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce((itemSum, item) => itemSum + Number(item.qty || 1), 0),
    0,
  );

const getSessionKey = (order) =>
  order.sessionId ||
  order.token ||
  `${order.table}-${new Date(order.createdAt).toDateString()}`;

const getCompletionMinutes = (sessionOrders) => {
  const first = new Date(sessionOrders[0]?.createdAt).getTime();
  const last = new Date(
    sessionOrders[sessionOrders.length - 1]?.updatedAt ||
      sessionOrders[sessionOrders.length - 1]?.createdAt,
  ).getTime();

  const mins = Math.max(1, Math.round((last - first) / 60000));
  return mins > 0 ? mins : 14;
};

const normalize = (v) =>
  String(v || "")
    .toLowerCase()
    .trim();

const getPaymentMode = (sessionOrders) => {
  const order = sessionOrders?.[0];

  const mode =
    order?.paymentMode ||
    order?.payment?.mode ||
    order?.paymentType ||
    order?.paymentMethod ||
    "counter";

  const cleanMode = normalize(mode);

  if (
    cleanMode === "online" ||
    cleanMode === "razorpay" ||
    cleanMode === "upi" ||
    cleanMode === "card"
  ) {
    return "Online";
  }

  return "Pay at Counter";
};

const getPaymentStatus = (sessionOrders) => {
  const order = sessionOrders?.[0];

  const status =
    order?.paymentStatus ||
    order?.payment?.status ||
    order?.statusPayment ||
    "due";

  const cleanStatus = normalize(status);

  if (
    cleanStatus === "paid" ||
    cleanStatus === "success" ||
    cleanStatus === "completed"
  ) {
    return "Paid";
  }

  return "Due";
};

const QUICK = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

const PER_PAGE = 8;

/* ───────────────── STAT CARD ───────────────── */

function StatCard({ icon, label, value, sub, tone }) {
  const tones = {
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    purple: {
      bg: "bg-violet-100",
      text: "text-violet-600",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-500",
    },
  };

  const t = tones[tone] || tones.green;

  return (
    <div className="flex items-center gap-5 px-5 py-5 bg-white border border-gray-100 shadow-[0_8px_25px_rgba(15,23,42,0.07)] rounded-xl">
      <div
        className={`flex items-center justify-center w-16 h-16 rounded-2xl ${t.bg} ${t.text}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="mb-1 text-sm font-semibold text-slate-500">{label}</p>

        <h3
          className="text-2xl font-extrabold leading-tight text-[#111936] truncate"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {value}
        </h3>

        {sub && (
          <p className="mt-1 text-xs font-semibold text-slate-500">{sub}</p>
        )}
      </div>
    </div>
  );
}

/* ───────────────── ORDER CARD ───────────────── */

function OrderHistoryCard({
  sessionOrders,
  orderNo,
  deleteOrder,
  menu,
  printBill,
  setSelectedBill,
  settings,
}) {
  const table = sessionOrders[0]?.table || sessionOrders[0]?.tableId || "—";
  const totalBatches = sessionOrders.length;
  const totalItemCount = getSessionItemCount(sessionOrders);
  const sessionSubtotal = getSessionSubtotal(sessionOrders);
  const sessionDiscount = getSessionDiscount(sessionOrders);
  const sessionFinalTotal = getSessionFinalTotal(sessionOrders);
  const sessionCoupon = getSessionCoupon(sessionOrders);

  const sessionTotal = sessionFinalTotal;

  const completedMins = getCompletionMinutes(sessionOrders);

  const paymentMode = getPaymentMode(sessionOrders);
  const paymentStatus = getPaymentStatus(sessionOrders);
  const isPaid = paymentStatus === "Paid";

  const sessionText =
    sessionOrders[0]?.sessionId?.slice(-4)?.toUpperCase() ||
    sessionOrders[0]?.token?.slice(-4)?.toUpperCase() ||
    sessionOrders[0]?._id?.slice(-4)?.toUpperCase();

  return (
    <article className="flex flex-col overflow-hidden bg-white border border-gray-100 shadow-[0_8px_26px_rgba(15,23,42,0.08)] rounded-xl">
      {/* CARD TOP */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between gap-4 mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[12px] font-extrabold">
            Completed
          </span>

          <h3 className="text-lg font-extrabold text-[#111936]">
            Cafe Order{" "}
            <span
              className="text-2xl text-[#b87524]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              #{orderNo}
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <span>Table {table}</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-semibold text-slate-500">
            Session #{sessionText}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Calendar size={15} />
            {fmtDate(sessionOrders[0]?.createdAt)},{" "}
            {fmtTime(sessionOrders[0]?.createdAt)}
          </span>

          <span className="inline-flex items-center gap-2">
            <Clock size={15} />
            Completed in {completedMins} min
          </span>
        </div>
      </div>

      {/* BATCHES */}
      <div className="flex-1 px-5 py-4 space-y-4">
        {sessionOrders.map((order, idx) => (
          <div key={order._id}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h4 className="text-sm font-extrabold text-[#111936]">
                  Batch #{idx + 1}
                </h4>

                {/* ✅ DIFFERENT TIME FOR EACH BATCH */}
                <p className="inline-flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-slate-500">
                  <Clock size={12} />
                  Received: {fmt(order.createdAt)}
                </p>
              </div>

              <span className="px-3 py-1 rounded-md bg-[#fff7ea] text-slate-600 text-[11px] font-bold">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-2">
              {order.items.map((item, i) => {
                const img = getItemImage(item, menu);

                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-lg shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-lg shrink-0">
                        {img ? (
                          <img
                            src={img}
                            alt={item.name}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement.innerHTML =
                                '<span style="font-size:20px">🍽</span>';
                            }}
                          />
                        ) : (
                          <span className="text-xl">🍽</span>
                        )}
                      </div>
                    </div>

                    <p className="flex-1 text-sm font-semibold truncate text-slate-700">
                      {item.name}{" "}
                      <span className="font-bold text-slate-400">
                        × {item.qty}
                      </span>
                    </p>

                    <span className="text-sm font-extrabold text-slate-700">
                      ₹{Number(item.price || 0) * Number(item.qty || 1)}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => deleteOrder(order._id)}
              className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-red-400 transition hover:text-red-600"
            >
              <Trash2 size={12} />
              Delete Batch
            </button>
          </div>
        ))}
      </div>

      {/* ✅ PAYMENT ROW */}
      <div className="px-5 py-3 border-t border-gray-100 bg-[#fffdfa]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            {paymentMode === "Online" ? (
              <CreditCard size={16} className="text-slate-500" />
            ) : (
              <Wallet size={16} className="text-slate-500" />
            )}

            <span className="text-slate-400">Payment Mode:</span>

            <span className="text-slate-700">{paymentMode}</span>
          </div>

          {/* <div className="flex items-center gap-2 text-xs font-bold sm:justify-end">
            {isPaid ? (
              <CheckCircle2 size={16} className="text-emerald-600" />
            ) : (
              <AlertCircle size={16} className="text-red-500" />
            )}

            <span className="text-slate-400">Status:</span>

            <span className={isPaid ? "text-emerald-600" : "text-red-500"}>
              {paymentStatus}
            </span>
          </div> */}
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-5 py-4 border-t border-gray-100">
        <div className="flex items-end justify-between gap-4">
          {sessionCoupon && sessionDiscount > 0 && (
            <div className="px-4 py-3 mb-4 border rounded-xl border-emerald-100 bg-emerald-50">
              <div className="flex items-center justify-between gap-3 text-xs font-bold">
                <span className="text-emerald-700">
                  Coupon Applied: {sessionCoupon.code}
                </span>

                <span className="text-emerald-700">
                  -₹{Math.round(sessionDiscount)}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Subtotal: ₹{Math.round(sessionSubtotal)}</span>
                <span>Final: ₹{Math.round(sessionFinalTotal)}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
            <span className="inline-flex items-center gap-2">
              <Package size={17} />
              {totalBatches} {totalBatches === 1 ? "Batch" : "Batches"}
            </span>

            <span className="inline-flex items-center gap-2">
              <List size={17} />
              {totalItemCount} Items
            </span>
          </div>

          <div className="text-right">
            <p className="mb-1 text-[11px] font-bold text-slate-400">
              Total Amount
            </p>
            <button
              type="button"
              onClick={() =>
                setSelectedBill({
                  tableOrders: sessionOrders,
                  orderNo,
                })
              }
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-2xl font-black text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-100"
              style={{ fontFamily: "Georgia, serif" }}
            >
              ₹{sessionTotal}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            printBill({
              tableOrders: sessionOrders,
              tableKey: sessionOrders[0]?.table,
              orderNo: orderNo,
              settings: settings,
            })
          }
          className="flex items-center justify-center w-full gap-2 py-2.5 mt-4 text-sm font-extrabold text-white bg-[#071832] rounded-lg shadow-[0_8px_18px_rgba(7,24,50,0.18)]"
        >
          Print Bill
        </button>
      </div>

      <div className="h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
    </article>
  );
}

/* ───────────────── MAIN COMPONENT ───────────────── */

export default function AdminHistory() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [quick, setQuick] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [settings, setSettings] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");

      const history = res.data
        .filter((o) => o.status === "completed")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setOrders(history);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    api
      .get("/admin/settings")
      .then((res) => {
        setSettings(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    fetchOrders();
  }, []);

  useEffect(() => {
    api
      .get("/menu")
      .then((res) => setMenu(res.data))
      .catch((err) => console.log(err));
  }, []);

  const allSessionsOldestFirst = useMemo(() => {
    const grouped = orders.reduce((acc, order) => {
      const key = getSessionKey(order);
      if (!acc[key]) acc[key] = [];
      acc[key].push(order);
      return acc;
    }, {});

    return Object.values(grouped)
      .map((sessionOrders) =>
        sessionOrders.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        ),
      )
      .sort((a, b) => new Date(a[0].createdAt) - new Date(b[0].createdAt));
  }, [orders]);

  const filteredSessions = useMemo(() => {
    let result = [...allSessionsOldestFirst];

    const now = new Date();

    if (quick === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);

      result = result.filter(
        (session) => new Date(session[0].createdAt) >= start,
      );
    }

    if (quick === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);

      result = result.filter(
        (session) => new Date(session[0].createdAt) >= start,
      );
    }

    if (quick === "month") {
      const start = new Date(now);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      result = result.filter(
        (session) => new Date(session[0].createdAt) >= start,
      );
    }

    if (fromDate) {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);

      result = result.filter(
        (session) => new Date(session[0].createdAt) >= start,
      );
    }

    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);

      result = result.filter(
        (session) => new Date(session[0].createdAt) <= end,
      );
    }

    if (search.trim()) {
      const raw = normalize(search);

      const tableSearch = raw.replace("table", "").replace("#", "").trim();

      result = result.filter((session) => {
        const orderNo = String(
          allSessionsOldestFirst.findIndex(
            (s) => getSessionKey(s[0]) === getSessionKey(session[0]),
          ) + 1,
        ).padStart(4, "0");

        const paymentMode = normalize(getPaymentMode(session));
        const paymentStatus = normalize(getPaymentStatus(session));

        return session.some((order) => {
          const table = normalize(order.table || order.tableId);
          const id = normalize(order._id);
          const token = normalize(order.token);
          const sessionId = normalize(order.sessionId);

          const itemMatch = order.items.some((item) =>
            normalize(item.name).includes(raw),
          );

          const tableMatch =
            table.includes(raw) ||
            table === tableSearch ||
            `table ${table}`.includes(raw);

          const orderNoMatch =
            orderNo.includes(raw.replace("#", "")) ||
            `#${orderNo}`.includes(raw);

          const batchTimeMatch =
            normalize(fmt(order.createdAt)).includes(raw) ||
            normalize(fmtDate(order.createdAt)).includes(raw) ||
            normalize(fmtTime(order.createdAt)).includes(raw);

          const paymentMatch =
            paymentMode.includes(raw) ||
            paymentStatus.includes(raw) ||
            raw.includes(paymentMode) ||
            raw.includes(paymentStatus);

          return (
            tableMatch ||
            orderNoMatch ||
            id.includes(raw) ||
            token.includes(raw) ||
            sessionId.includes(raw) ||
            itemMatch ||
            batchTimeMatch ||
            paymentMatch
          );
        });
      });
    }

    return result.sort(
      (a, b) => new Date(b[0].createdAt) - new Date(a[0].createdAt),
    );
  }, [allSessionsOldestFirst, quick, fromDate, toDate, search]);

  useEffect(() => {
    setPage(1);
  }, [quick, fromDate, toDate, search]);

  /* ───────────────── STATS ───────────────── */

  const totalRevenue = filteredSessions.reduce(
    (sum, session) => sum + getSessionTotal(session),
    0,
  );

  const totalOrders = filteredSessions.length;

  const itemCount = {};
  filteredSessions.forEach((session) => {
    session.forEach((order) => {
      order.items.forEach((item) => {
        itemCount[item.name] =
          (itemCount[item.name] || 0) + Number(item.qty || 1);
      });
    });
  });

  const topItem = Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const activeTodaySet = new Set(
    orders
      .filter((o) => new Date(o.createdAt) >= todayStart)
      .map((o) => o.table || o.tableId),
  );

  const avgPrepTime =
    filteredSessions.length > 0
      ? Math.round(
          filteredSessions.reduce(
            (sum, session) => sum + getCompletionMinutes(session),
            0,
          ) / filteredSessions.length,
        )
      : 0;

  /* ───────────────── PAGINATION ───────────────── */

  const totalPages = Math.ceil(filteredSessions.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const pageSessions = filteredSessions.slice(start, start + PER_PAGE);

  const getOrderNumber = (session) => {
    const index = allSessionsOldestFirst.findIndex(
      (s) => getSessionKey(s[0]) === getSessionKey(session[0]),
    );

    return String(index + 1).padStart(4, "0");
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this batch?")) return;

    try {
      await api.delete(`/order/${id}`);
      fetchOrders();
    } catch (err) {
      console.log(err);
    }
  };

  const exportCSV = () => {
    const rows = [
      [
        "Order No",
        "Session",
        "Table",
        "Batch",
        "Batch Received Time",
        "Payment Mode",
        "Payment Status",
        "Item",
        "Qty",
        "Price",
        "Total",
        "Date",
      ],
    ];

    filteredSessions.forEach((session) => {
      const orderNo = getOrderNumber(session);
      const sessionId =
        session[0]?.sessionId ||
        session[0]?.token ||
        session[0]?._id?.slice(-6)?.toUpperCase();

      const paymentMode = getPaymentMode(session);
      const paymentStatus = getPaymentStatus(session);

      session.forEach((order, batchIndex) => {
        order.items.forEach((item) => {
          rows.push([
            `#${orderNo}`,
            sessionId,
            order.table || order.tableId || "",
            `Batch ${batchIndex + 1}`,
            fmt(order.createdAt),
            paymentMode,
            paymentStatus,
            item.name,
            item.qty,
            item.price,
            Number(item.price || 0) * Number(item.qty || 1),
            fmt(order.createdAt),
          ]);
        });
      });
    });

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);
    a.download = "order_history.csv";
    a.click();
  };

  return (
    <div
      className="min-h-screen bg-[#fbfaf8] text-[#111827]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <main className="px-5 py-7 mx-auto max-w-[1800px]">
        {/* TITLE */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1
              className="text-4xl font-bold tracking-tight text-[#111936]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Order History
            </h1>

            <p className="mt-2 text-base font-medium text-slate-500">
              Browse and manage all completed cafe orders
            </p>
          </div>

          {/* <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center justify-center gap-3 px-5 py-3 text-sm font-bold text-white bg-[#071832] shadow-[0_8px_20px_rgba(7,24,50,0.20)] rounded"
            >
              <Utensils size={18} />
              Active Orders
            </Link>

            <Link
              to="/admin/history"
              className="inline-flex items-center justify-center gap-3 px-5 py-3 text-sm font-bold bg-white border border-gray-200 rounded shadow-sm text-slate-600"
            >
              <History size={18} />
              History
            </Link>

            <Link
              to="/admin/kitchen"
              className="inline-flex items-center justify-center gap-3 px-5 py-3 text-sm font-bold bg-white border border-gray-200 rounded shadow-sm text-slate-600"
            >
              <Flame size={18} />
              Kitchen
            </Link>

            <Link
              to="/admin/tables/manage"
              className="inline-flex items-center justify-center gap-3 px-5 py-3 text-sm font-bold bg-white border border-gray-200 rounded shadow-sm text-slate-600"
            >
              <QrCode size={18} />
              Tables
            </Link>

            <Link
              to="/admin/tables/current"
              className="inline-flex items-center justify-center gap-3 px-5 py-3 text-sm font-bold bg-white border border-gray-200 rounded shadow-sm text-slate-600"
            >
              <Activity size={18} />
              Current Tables
            </Link>
          </div> */}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-5 mb-6 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            icon={<ShoppingBag size={30} />}
            label="Total Orders"
            value={totalOrders}
            sub="↑ 16.8% vs last 30 days"
            tone="green"
          />

          <StatCard
            icon={<IndianRupee size={32} />}
            label="Total Revenue"
            value={`₹ ${totalRevenue.toLocaleString("en-IN")}`}
            sub="↑ 18.4% vs last 30 days"
            tone="green"
          />

          <StatCard
            icon={<Clock size={31} />}
            label="Avg. Prep Time"
            value={`${avgPrepTime || 0} min`}
            sub="↓ 2 min vs last 30 days"
            tone="amber"
          />

          <StatCard
            icon={<Crown size={33} />}
            label="Most Ordered Item"
            value={topItem?.[0] || "—"}
            sub={topItem ? `${topItem[1]} orders` : "No orders"}
            tone="purple"
          />

          <StatCard
            icon={<Armchair size={33} />}
            label="Active Tables Today"
            value={activeTodaySet.size}
            sub="Across all sessions"
            tone="blue"
          />
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col gap-5 px-6 py-5 mb-6 bg-white border border-gray-100 shadow-[0_8px_26px_rgba(15,23,42,0.07)] rounded-2xl xl:flex-row xl:items-end">
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:max-w-[430px]">
            <div>
              <label className="block mb-2 text-sm font-bold text-slate-500">
                From Date
              </label>

              <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
                <Calendar size={17} className="text-slate-500" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full text-sm font-semibold bg-transparent outline-none text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold text-slate-500">
                To Date
              </label>

              <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
                <Calendar size={17} className="text-slate-500" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full text-sm font-semibold bg-transparent outline-none text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="hidden w-px h-12 bg-gray-200 xl:block" />

          <div>
            <label className="block mb-2 text-sm font-bold text-slate-500">
              Quick Filters
            </label>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              {QUICK.map((q) => (
                <button
                  key={q.value}
                  onClick={() => setQuick(q.value)}
                  className={`px-7 py-3 text-sm font-bold border rounded-lg transition ${
                    quick === q.value
                      ? "bg-[#fff3df] text-[#9a5f16] border-[#f3d3a4]"
                      : "bg-white text-slate-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden w-px h-12 bg-gray-200 xl:block" />

          <div className="flex-1">
            <label className="block mb-2 text-sm font-bold text-transparent">
              Search
            </label>

            <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
              <Search size={19} className="text-slate-500" />

              <input
                type="text"
                placeholder="Search by order no., table no., item, payment or batch time..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm font-semibold bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-3 px-8 py-3 text-sm font-extrabold text-white bg-[#071832] rounded-lg shadow-[0_8px_20px_rgba(7,24,50,0.20)]"
          >
            <Download size={19} />
            Export Report
          </button>
        </div>

        {/* ORDER CARDS */}
        {pageSessions.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {pageSessions.map((sessionOrders) => (
              <OrderHistoryCard
                key={getSessionKey(sessionOrders[0])}
                sessionOrders={sessionOrders}
                orderNo={getOrderNumber(sessionOrders)}
                deleteOrder={deleteOrder}
                menu={menu}
                printBill={printBill}
                setSelectedBill={setSelectedBill}
                settings={settings}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <ShoppingBag size={48} className="mb-3 opacity-30" />
            <p className="text-sm font-semibold">No completed orders found.</p>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold border border-gray-200 rounded-lg text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
            >
              <ChevronLeft size={17} />
              Prev
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 5) return true;
                  if (page <= 3) return p <= 5;
                  if (page >= totalPages - 2) return p >= totalPages - 4;
                  return p >= page - 2 && p <= page + 2;
                })
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg text-sm font-extrabold transition ${
                      p === page
                        ? "bg-[#071832] text-white"
                        : "bg-white text-slate-600 border border-gray-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold border border-gray-200 rounded-lg text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        )}
      </main>
      {selectedBill && (
        <BillSummaryModal
          tableOrders={selectedBill.tableOrders}
          orderNo={selectedBill.orderNo}
          menu={menu}
          settings={settings}
          printBill={printBill}
          onClose={() => setSelectedBill(null)}
        />
      )}
    </div>
  );
}

function BillSummaryModal({
  tableOrders,
  orderNo,
  menu = [],
  settings,
  onClose,
  printBill,
}) {
  const table = tableOrders[0]?.table || tableOrders[0]?.tableId || "—";

  const subtotal = tableOrders.reduce(
    (sum, order) => sum + Number(order.subtotal || order.total || 0),
    0,
  );

  const discount = tableOrders.reduce(
    (sum, order) =>
      sum + Number(order.discountAmount || order.coupon?.discountAmount || 0),
    0,
  );

  const finalTotal = tableOrders.reduce(
    (sum, order) => sum + Number(order.finalTotal || order.total || 0),
    0,
  );

  const coupon = tableOrders.find((order) => order.coupon?.code)?.coupon;

  const totalItems = tableOrders.reduce(
    (sum, order) =>
      sum +
      (order.items || []).reduce(
        (itemSum, item) => itemSum + Number(item.qty || 1),
        0,
      ),
    0,
  );

  const getItemImage = (item) => {
    if (item?.image) {
      if (item.image.startsWith("http")) return item.image;
      return `https://fooadash.onrender.com/uploads/${item.image}`;
    }

    const found = menu.find(
      (m) => m.name?.toLowerCase() === item.name?.toLowerCase(),
    );

    if (!found?.image) return "";

    if (found.image.startsWith("http")) return found.image;

    return `https://fooadash.onrender.com/uploads/${found.image}`;
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <div className="flex items-start justify-between gap-4 border-b border-amber-100 bg-[#fffaf1] px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              Bill Summary
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-[#111936]">
              Table {table}
            </h2>

            <p className="mt-1 text-xs font-semibold text-slate-400">
              {tableOrders.length} batch{tableOrders.length !== 1 ? "es" : ""} ·{" "}
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 transition bg-white rounded-full shadow-sm text-slate-500 hover:bg-red-50 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto px-5 py-4">
          <div className="space-y-5">
            {tableOrders.map((order, batchIndex) => (
              <div
                key={order._id || batchIndex}
                className="p-4 bg-white border shadow-sm rounded-3xl border-amber-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-[#111936]">
                    Batch #{batchIndex + 1}
                  </h3>

                  <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-700">
                    ₹
                    {(order.finalTotal || order.total || 0).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>

                <div className="space-y-3">
                  {(order.items || []).map((item, index) => {
                    const image = getItemImage(item);
                    const itemTotal =
                      Number(item.price || 0) * Number(item.qty || 1);

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-2xl bg-[#fbfaf8] p-3"
                      >
                        <div className="flex items-center justify-center w-12 h-12 overflow-hidden bg-white shrink-0 rounded-2xl">
                          {image ? (
                            <img
                              src={image}
                              alt={item.name}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="text-xl">🍽</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-black text-[#111936]">
                            {item.name}
                          </p>

                          {item.note && (
                            <p className="mt-1 truncate text-[11px] font-semibold text-amber-700">
                              Note: {item.note}
                            </p>
                          )}

                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            ₹{Number(item.price || 0)} × {Number(item.qty || 1)}
                          </p>
                        </div>

                        <p className="text-sm font-black text-slate-700">
                          ₹{itemTotal}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-amber-100 bg-[#fffaf1] px-5 py-4">
          <div className="p-4 space-y-2 bg-white rounded-3xl">
            <PriceRow label="Subtotal" value={subtotal} />

            {coupon && discount > 0 && (
              <PriceRow
                label={`Coupon ${coupon.code}`}
                value={-Math.round(discount)}
                discount
              />
            )}

            <div className="my-3 border-t border-dashed border-slate-200" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#111936]">
                Final Payable
              </span>

              <span className="text-3xl font-black tracking-tight text-emerald-700">
                ₹{Math.round(finalTotal)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-12 text-sm font-black transition bg-white border rounded-2xl border-amber-200 text-slate-600 hover:bg-amber-50"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() =>
                printBill({
                  tableOrders,
                  tableKey: table,
                  orderNo,
                  settings,
                })
              }
              className="h-12 rounded-2xl bg-[#111936] text-sm font-black text-amber-300 transition hover:bg-[#1d2a56]"
            >
              Print Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceRow({ label, value, discount }) {
  return (
    <div className="flex items-center justify-between text-sm font-bold">
      <span className="text-slate-500">{label}</span>

      <span className={discount ? "text-emerald-600" : "text-[#111936]"}>
        {value < 0 ? "-" : ""}₹{Math.abs(Number(value || 0))}
      </span>
    </div>
  );
}
