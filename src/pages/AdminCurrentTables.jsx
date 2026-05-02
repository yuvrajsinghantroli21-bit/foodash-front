import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import socket from "../socket/socket";
import { Link } from "react-router-dom";

import {
  Activity,
  CheckCircle2,
  Clock,
  CreditCard,
  IndianRupee,
  RefreshCw,
  Table2,
  Utensils,
  XCircle,
  ClipboardList,
  AlertCircle,
  Hash,
  Bell,
  BellOff,
  Flame,
  QrCode,
  History,
} from "lucide-react";
import toast from "react-hot-toast";

/* ───────────────── HELPERS ───────────────── */

const fmtTime = (d) => {
  if (!d) return "—";

  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const fmtDateTime = (d) => {
  if (!d) return "—";

  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const activeFor = (d) => {
  if (!d) return "—";

  const mins = Math.floor((Date.now() - new Date(d)) / 60000);

  if (mins < 1) return "< 1 min";
  if (mins < 60) return `${mins} min`;

  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;

  return `${hrs}h ${rem}m`;
};

const getOrderItemsCount = (orders = []) =>
  orders.reduce(
    (sum, order) =>
      sum +
      (order.items || []).reduce(
        (itemSum, item) => itemSum + Number(item.qty || 1),
        0,
      ),
    0,
  );

const getOrderTotal = (order) => {
  if (order.total !== undefined && order.total !== null) {
    return Number(order.total || 0);
  }

  return (order.items || []).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0,
  );
};

function StatusPill({ status }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold">
        <Activity size={13} />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-extrabold">
      <XCircle size={13} />
      Inactive
    </span>
  );
}

function PaymentPill({ status }) {
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold">
        <CheckCircle2 size={13} />
        Paid
      </span>
    );
  }

  if (status === "due") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-extrabold">
        <AlertCircle size={13} />
        Due
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-extrabold">
      No Orders
    </span>
  );
}

function OrderStatusPill({ status }) {
  if (status === "served") {
    return (
      <span className="inline-flex px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
        Served
      </span>
    );
  }

  if (status === "completed") {
    return (
      <span className="inline-flex px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-extrabold">
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex px-2 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-extrabold">
      Preparing
    </span>
  );
}

/* ───────────────── STAT CARD ───────────────── */

function StatCard({ icon, label, value, tone }) {
  const tones = {
    active: "bg-emerald-50 text-emerald-600",
    inactive: "bg-slate-100 text-slate-500",
    revenue: "bg-amber-50 text-amber-600",
    due: "bg-red-50 text-red-500",
  };

  return (
    <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-[0_8px_26px_rgba(15,23,42,0.07)] rounded-2xl">
      <div
        className={`flex items-center justify-center w-14 h-14 rounded-full ${
          tones[tone] || tones.active
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="text-sm font-bold text-slate-500">{label}</p>

        <h3
          className="mt-1 text-2xl font-black text-[#111936]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {value}
        </h3>
      </div>
    </div>
  );
}

/* ───────────────── ORDER BRIEF ───────────────── */

function OrderBrief({ orders }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="p-4 mb-4 text-center border border-gray-200 border-dashed rounded-xl bg-slate-50">
        <p className="text-sm font-bold text-slate-500">No orders yet</p>
        <p className="mt-1 text-xs text-slate-400">
          Customer has scanned QR but has not placed any order.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold text-slate-700">
          Current Order Brief
        </p>

        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-[11px] font-bold">
          {orders.length} {orders.length === 1 ? "Batch" : "Batches"}
        </span>
      </div>

      {orders.map((order, index) => {
        const batchItems = order.items || [];

        return (
          <div
            key={order._id}
            className="p-3 border border-gray-100 rounded-xl bg-[#fbfaf8]"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-xs font-extrabold text-slate-700">
                  Batch #{index + 1}
                </p>

                <p className="text-[11px] font-semibold text-slate-400">
                  Received: {fmtDateTime(order.createdAt)}
                </p>
              </div>

              <div className="text-right">
                <OrderStatusPill status={order.status || "preparing"} />

                <p className="mt-1 text-xs font-black text-slate-700">
                  ₹{getOrderTotal(order)}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              {batchItems.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex items-start justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold truncate text-slate-700">
                      {item.name}
                    </p>

                    {item.note && item.note.trim() !== "" && (
                      <p className="mt-0.5 italic text-amber-600">
                        📝 {item.note}
                      </p>
                    )}
                  </div>

                  <span className="font-black text-slate-600 shrink-0">
                    × {item.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────── TABLE CARD ───────────────── */

function CurrentTableCard({ table, onComplete }) {
  const isActive = table.status === "active";
  const session = table.session;
  const orders = table.orders || [];
  const totalItems = getOrderItemsCount(orders);

  return (
    <article
      className={`overflow-hidden bg-white border shadow-[0_8px_26px_rgba(15,23,42,0.08)] rounded-2xl ${
        isActive ? "border-emerald-100" : "border-gray-100"
      }`}
    >
      <div
        className={`h-1.5 ${isActive ? "bg-emerald-500" : "bg-slate-200"}`}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-xl ${
              isActive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <Table2 size={24} />
          </div>

          <div>
            <h3
              className="text-2xl font-black text-[#111936]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Table {table.tableNumber}
            </h3>

            <p className="text-xs font-semibold text-slate-400">
              {isActive ? "Customer session running" : "No active session"}
            </p>
          </div>
        </div>

        <StatusPill status={table.status} />
      </div>

      {/* Body */}
      <div className="p-5">
        {isActive ? (
          <>
            {/* Session info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Started
                </p>
                <p className="mt-1 text-sm font-extrabold text-slate-700">
                  {fmtTime(session?.createdAt)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Active For
                </p>
                <p className="mt-1 text-sm font-extrabold text-emerald-600">
                  {activeFor(session?.createdAt)}
                </p>
              </div>
            </div>

            <div className="p-3 mb-4 border border-gray-100 rounded-xl bg-[#fbfaf8]">
              <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
                Session Token
              </p>

              <div className="flex items-center gap-2">
                <Hash size={13} className="text-slate-400 shrink-0" />
                <p className="text-xs font-bold break-all text-slate-600">
                  {session?.token}
                </p>
              </div>
            </div>

            {/* Order summary */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 text-center rounded-xl bg-blue-50">
                <ClipboardList
                  size={18}
                  className="mx-auto mb-1 text-blue-500"
                />
                <p className="text-lg font-black text-blue-700">
                  {table.totalBatches}
                </p>
                <p className="text-[10px] font-bold text-blue-500">Batches</p>
              </div>

              <div className="p-3 text-center rounded-xl bg-amber-50">
                <Utensils size={18} className="mx-auto mb-1 text-amber-500" />
                <p className="text-lg font-black text-amber-700">
                  {totalItems}
                </p>
                <p className="text-[10px] font-bold text-amber-500">Items</p>
              </div>

              <div className="p-3 text-center rounded-xl bg-emerald-50">
                <IndianRupee
                  size={18}
                  className="mx-auto mb-1 text-emerald-600"
                />
                <p className="text-lg font-black text-emerald-700">
                  {table.totalAmount}
                </p>
                <p className="text-[10px] font-bold text-emerald-500">Total</p>
              </div>
            </div>

            {/* Payment */}
            <div className="flex items-center justify-between gap-3 p-3 mb-4 border border-gray-100 rounded-xl">
              <div className="flex items-center gap-2">
                <CreditCard size={17} className="text-slate-500" />
                <span className="text-sm font-bold text-slate-500">
                  Payment Status
                </span>
              </div>

              <PaymentPill status={table.paymentStatus} />
            </div>

            {/* Better Order Brief */}
            <OrderBrief orders={orders} />

            <button
              onClick={() => onComplete(session?.token)}
              className="flex items-center justify-center w-full gap-2 py-3 text-sm font-extrabold text-white bg-[#071832] rounded-xl shadow-[0_8px_18px_rgba(7,24,50,0.18)]"
            >
              <CheckCircle2 size={17} />
              Complete / Expire Table
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-slate-100 text-slate-400">
              <Table2 size={32} />
            </div>

            <p className="text-sm font-bold text-slate-500">
              Table is currently inactive
            </p>

            <p className="mt-1 text-xs text-slate-400">
              When a customer scans the QR, session info will appear here.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

/* ───────────────── MAIN PAGE ───────────────── */

export default function AdminCurrentTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const fetchCurrentTables = (showLoading = true) => {
    if (showLoading) setLoading(true);

    api
      .get("/tables/current")
      .then((res) => {
        setTables(res.data || []);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to fetch current tables");
      })
      .finally(() => {
        if (showLoading) setLoading(false);
      });
  };

  useEffect(() => {
    fetchCurrentTables();
  }, []);

  // ✅ Live socket updates
  useEffect(() => {
    const refreshTables = () => {
      fetchCurrentTables(false);
    };

    socket.on("new-order", refreshTables);
    socket.on("orderUpdated", refreshTables);
    socket.on("order-updated", refreshTables);
    socket.on("order-deleted", refreshTables);
    socket.on("session-expired", refreshTables);
    socket.on("table-session-created", refreshTables);
    socket.on("tables-current-updated", refreshTables);

    return () => {
      socket.off("new-order", refreshTables);
      socket.off("orderUpdated", refreshTables);
      socket.off("order-updated", refreshTables);
      socket.off("order-deleted", refreshTables);
      socket.off("session-expired", refreshTables);
      socket.off("table-session-created", refreshTables);
      socket.off("tables-current-updated", refreshTables);
    };
  }, []);

  const completeTable = (token) => {
    if (!token) {
      toast.error("No active token found");
      return;
    }

    if (!window.confirm("Complete this table and expire session?")) return;

    api
      .put(`/table/complete/${token}`)
      .then(() => {
        toast.success("Table completed and session expired");
        fetchCurrentTables(false);
      })
      .catch((err) => {
        console.log(err);

        toast.error(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to complete table",
        );
      });
  };

  const stats = useMemo(() => {
    const active = tables.filter((t) => t.status === "active").length;
    const inactive = tables.filter((t) => t.status === "inactive").length;
    const totalRevenue = tables.reduce(
      (sum, t) => sum + Number(t.totalAmount || 0),
      0,
    );
    const dueTables = tables.filter((t) => t.paymentStatus === "due").length;

    return {
      active,
      inactive,
      totalRevenue,
      dueTables,
    };
  }, [tables]);

  return (
    <div
      className="min-h-screen bg-[#fbfaf8] text-[#111827]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <main className="px-4 py-7 mx-auto max-w-[1800px] sm:px-6">
        {/* TITLE */}
        <div className="flex flex-col gap-5 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-extrabold rounded-full text-emerald-700 bg-emerald-50">
              <Activity size={14} />
              Live Table Sessions
            </div>

            <h1
              className="text-4xl font-black tracking-tight text-[#111936]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Current Tables
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
              Track active table sessions, running tokens, orders, and payment
              status.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Activity size={28} />}
            label="Active Tables"
            value={stats.active}
            tone="active"
          />

          <StatCard
            icon={<XCircle size={28} />}
            label="Inactive Tables"
            value={stats.inactive}
            tone="inactive"
          />

          <StatCard
            icon={<IndianRupee size={28} />}
            label="Running Revenue"
            value={`₹${stats.totalRevenue}`}
            tone="revenue"
          />

          <StatCard
            icon={<AlertCircle size={28} />}
            label="Due Tables"
            value={stats.dueTables}
            tone="due"
          />
        </div>

        {/* CARDS */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            Loading current tables...
          </div>
        ) : tables.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {tables.map((table) => (
              <CurrentTableCard
                key={table.tableNumber}
                table={table}
                onComplete={completeTable}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-28 text-slate-400">
            <Table2 size={54} className="mb-4 opacity-30" />

            <p className="text-lg font-bold text-slate-500">No tables found</p>

            <p className="mt-1 text-sm text-slate-400">
              Add tables from Table QR Management first.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
