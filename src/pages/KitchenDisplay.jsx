import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/api";
import socket from "../socket/socket";
import { Link } from "react-router-dom";

import {
  Bell,
  BellOff,
  ChefHat,
  CheckCircle2,
  Clock,
  Flame,
  RefreshCw,
  Utensils,
  QrCode,
  History,
  Activity,
} from "lucide-react";

/* ───────────────── HELPERS ───────────────── */

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const elapsed = (d) => {
  const mins = Math.floor((Date.now() - new Date(d)) / 60000);
  return mins < 1 ? "< 1 min" : `${mins} min`;
};

const isDelayed = (d, threshold = 10) =>
  Math.floor((Date.now() - new Date(d)) / 60000) >= threshold;

const getItemImage = (item) => {
  if (!item?.image) return "";

  if (item.image.startsWith("http")) return item.image;

  return `https://fooadash.onrender.com/uploads/${item.image}`;
};

const getBatchTotalItems = (items = []) =>
  items.reduce((sum, item) => sum + Number(item.qty || 1), 0);

/* ───────────────── STATUS PILL ───────────────── */

function StatusPill({ status }) {
  if (status === "served") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold">
        <CheckCircle2 size={13} />
        Served
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[11px] font-extrabold">
      <ChefHat size={13} />
      Preparing
    </span>
  );
}

/* ───────────────── KITCHEN CARD ───────────────── */

function KitchenOrderCard({ order, batchNo, updateStatus, serveOrder }) {
  const delayed = isDelayed(order.createdAt);
  const totalItems = getBatchTotalItems(order.items);

  return (
    <article
      className={`overflow-hidden bg-white border shadow-[0_10px_28px_rgba(15,23,42,0.08)] rounded-2xl ${
        delayed ? "border-red-200" : "border-gray-100"
      }`}
    >
      {/* TOP STRIP */}
      <div
        className={`h-1.5 ${
          order.status === "served"
            ? "bg-emerald-500"
            : delayed
              ? "bg-red-500"
              : "bg-orange-400"
        }`}
      />

      {/* HEADER */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h2
                className="text-2xl font-black text-[#111936]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Table {order.table || "N/A"}
              </h2>

              <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-600 text-[12px] font-extrabold">
                Batch #{batchNo}
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-500">
              Order #{order._id?.slice(-5).toUpperCase()}
            </p>
          </div>

          <StatusPill status={order.status || "preparing"} />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-slate-50">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Received
            </p>
            <p className="mt-1 text-sm font-extrabold text-slate-700">
              {fmtTime(order.createdAt)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Elapsed
            </p>
            <p
              className={`mt-1 text-sm font-extrabold ${
                delayed ? "text-red-500" : "text-slate-700"
              }`}
            >
              {elapsed(order.createdAt)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Items
            </p>
            <p className="mt-1 text-sm font-extrabold text-slate-700">
              {totalItems}
            </p>
          </div>
        </div>

        {delayed && order.status !== "served" && (
          <div className="flex items-center gap-2 px-3 py-2 mt-4 text-xs font-bold text-red-600 rounded-xl bg-red-50">
            <Flame size={15} />
            This batch is delayed. Please prioritize.
          </div>
        )}
      </div>

      {/* ITEMS */}
      <div className="px-5 py-4 space-y-3">
        {order.items.map((item, index) => {
          const image = getItemImage(item);

          return (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-xl bg-[#fbfaf8] border border-gray-100"
            >
              <div className="flex items-center justify-center overflow-hidden bg-white border border-gray-100 w-14 h-14 rounded-xl shrink-0">
                {image ? (
                  <img
                    src={image}
                    alt={item.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.innerHTML =
                        '<span style="font-size:24px">🍽</span>';
                    }}
                  />
                ) : (
                  <span className="text-2xl">🍽</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base font-extrabold text-slate-800">
                    {item.name}
                  </p>

                  <span className="px-3 py-1 text-sm font-black text-white rounded-full bg-[#071832] shrink-0">
                    × {item.qty}
                  </span>
                </div>

                {item.note && item.note.trim() !== "" && (
                  <p className="mt-2 text-xs italic font-semibold text-amber-600">
                    📝 {item.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2">
        <button
          onClick={() => updateStatus(order._id, "preparing")}
          disabled={order.status === "preparing"}
          className={`flex items-center justify-center gap-2 py-3 text-sm font-extrabold border rounded-xl transition ${
            order.status === "preparing" || !order.status
              ? "bg-orange-50 text-orange-600 border-orange-200 cursor-not-allowed"
              : "bg-white text-orange-600 border-orange-200 hover:bg-orange-50"
          }`}
        >
          <ChefHat size={17} />
          Preparing
        </button>

        <button
          onClick={() => serveOrder(order._id)}
          disabled={order.status === "served"}
          className={`flex items-center justify-center gap-2 py-3 text-sm font-extrabold border rounded-xl transition ${
            order.status === "served"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-not-allowed"
              : "bg-[#071832] text-white border-[#071832] hover:opacity-90"
          }`}
        >
          <CheckCircle2 size={17} />
          Mark Served
        </button>
      </div>
    </article>
  );
}

/* ───────────────── MAIN PAGE ───────────────── */

export default function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [tick, setTick] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");

      const activeKitchenOrders = res.data
        .filter(
          (order) => order.status !== "completed" && order.status !== "served",
        )
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setOrders(activeKitchenOrders);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleNewOrder = (order) => {
      if (order.status !== "completed" && order.status !== "served") {
        setOrders((prev) =>
          [order, ...prev].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
          ),
        );

        if (soundEnabled && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      }
    };

    const handleOrderUpdated = (updated) => {
      setOrders((prev) => {
        if (updated.status === "completed" || updated.status === "served") {
          return prev.filter((order) => order._id !== updated._id);
        }

        const exists = prev.some((order) => order._id === updated._id);

        const next = exists
          ? prev.map((order) => (order._id === updated._id ? updated : order))
          : [...prev, updated];

        return next.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );
      });
    };

    const handleOrderDeleted = (id) => {
      setOrders((prev) => prev.filter((order) => order._id !== id));
    };

    socket.on("new-order", handleNewOrder);
    socket.on("orderUpdated", handleOrderUpdated);
    socket.on("order-updated", handleOrderUpdated);
    socket.on("order-deleted", handleOrderDeleted);

    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("orderUpdated", handleOrderUpdated);
      socket.off("order-updated", handleOrderUpdated);
      socket.off("order-deleted", handleOrderDeleted);
    };
  }, [soundEnabled]);

  const groupedByTable = useMemo(() => {
    const grouped = {};

    orders.forEach((order) => {
      const key = order.table || "Unknown";

      if (!grouped[key]) grouped[key] = [];

      grouped[key].push(order);
    });

    Object.keys(grouped).forEach((table) => {
      grouped[table].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
    });

    return grouped;
  }, [orders]);

  const orderedKitchenCards = useMemo(() => {
    const cards = [];

    Object.entries(groupedByTable).forEach(([table, tableOrders]) => {
      tableOrders.forEach((order, index) => {
        cards.push({
          order,
          batchNo: index + 1,
        });
      });
    });

    return cards.sort(
      (a, b) => new Date(a.order.createdAt) - new Date(b.order.createdAt),
    );
  }, [groupedByTable]);

  const preparingCount = orders.filter(
    (order) =>
      order.status === "preparing" ||
      order.status === "pending" ||
      !order.status,
  ).length;

  const delayedCount = orders.filter((order) =>
    isDelayed(order.createdAt),
  ).length;

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/order/${id}`, { status });

      setOrders((prev) =>
        prev.map((order) => (order._id === id ? res.data : order)),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const serveOrder = async (id) => {
    try {
      await api.put(`/orders/${id}/serve`);

      setOrders((prev) => prev.filter((order) => order._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const toggleSound = () => {
    if (!soundEnabled && audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setSoundEnabled(true);
        })
        .catch(() => {
          setSoundEnabled(true);
        });
    } else {
      setSoundEnabled(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#fbfaf8] text-[#111827]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <audio ref={audioRef} src="/sound.mp3" />

      <main className="px-4 py-6 mx-auto max-w-[1800px] sm:px-6">
        {/* TOP */}
        <div className="flex flex-col gap-5 mb-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-extrabold text-orange-700 rounded-full bg-orange-50">
              <Flame size={14} />
              Kitchen Live Display
            </div>

            <h1
              className="text-4xl font-black tracking-tight text-[#111936]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Kitchen Display
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
              Manage active food batches, preparation timers, and serving
              status.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              onClick={() => {
                if (!soundEnabled && audioRef.current) {
                  audioRef.current
                    .play()
                    .then(() => {
                      audioRef.current.pause();
                      audioRef.current.currentTime = 0;
                      setSoundEnabled(true);
                    })
                    .catch(() => {
                      setSoundEnabled(true);
                    });
                } else {
                  setSoundEnabled(false);
                }
              }}
              className={`inline-flex items-center justify-center gap-3 px-5 py-3 text-sm font-bold border rounded shadow-sm transition ${
                soundEnabled
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-white text-slate-600 border-gray-200"
              }`}
            >
              {soundEnabled ? <Bell size={18} /> : <BellOff size={18} />}
              {soundEnabled ? "Sound On" : "Enable Sound"}
            </button>

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
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
          <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_25px_rgba(15,23,42,0.07)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">
                  Active Batches
                </p>
                <h3
                  className="mt-1 text-3xl font-black text-[#111936]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {orders.length}
                </h3>
              </div>

              <div className="flex items-center justify-center text-orange-500 rounded-full w-14 h-14 bg-orange-50">
                <Utensils size={28} />
              </div>
            </div>
          </div>

          <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_25px_rgba(15,23,42,0.07)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">Preparing</p>
                <h3
                  className="mt-1 text-3xl font-black text-[#111936]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {preparingCount}
                </h3>
              </div>

              <div className="flex items-center justify-center text-blue-500 rounded-full w-14 h-14 bg-blue-50">
                <ChefHat size={28} />
              </div>
            </div>
          </div>

          <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_25px_rgba(15,23,42,0.07)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">Delayed</p>
                <h3
                  className="mt-1 text-3xl font-black text-[#111936]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {delayedCount}
                </h3>
              </div>

              <div className="flex items-center justify-center text-red-500 rounded-full w-14 h-14 bg-red-50">
                <Flame size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* CARDS */}
        {orderedKitchenCards.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {orderedKitchenCards.map(({ order, batchNo }) => (
              <KitchenOrderCard
                key={order._id}
                order={order}
                batchNo={batchNo}
                updateStatus={updateStatus}
                serveOrder={serveOrder}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-28 text-slate-400">
            <Utensils size={54} className="mb-4 opacity-30" />
            <p className="text-lg font-bold text-slate-500">
              No active kitchen batches
            </p>
            <p className="mt-1 text-sm text-slate-400">
              New customer orders will appear here automatically.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
