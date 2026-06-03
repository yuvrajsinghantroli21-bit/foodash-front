import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../api/api";
import socket from "../../socket/socket";

import {
  Bell,
  BellOff,
  ChefHat,
  CheckCircle2,
  Flame,
  Utensils,
  Timer,
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
  return `${import.meta.env.VITE_BACKEND_URL}/uploads/${item.image}`;
};

const getBatchTotalItems = (items = []) =>
  items.reduce((sum, item) => sum + Number(item.qty || 1), 0);

/* ───────────────── STATUS PILL ───────────────── */

function StatusPill({ status }) {
  if (status === "served") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
        <CheckCircle2 size={13} />
        Served
      </span>
    );
  }

  if (status === "preparing") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-black text-orange-600">
        <ChefHat size={13} />
        Preparing
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-700">
      <Timer size={13} />
      Pending
    </span>
  );
}

/* ───────────────── ITEM STATUS PILL ───────────────── */

function ItemStatusPill({ status }) {
  if (status === "served") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
        Served
      </span>
    );
  }

  if (status === "preparing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-orange-600">
        Preparing
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
      Pending
    </span>
  );
}

/* ───────────────── KITCHEN CARD ───────────────── */

function KitchenOrderCard({ order, batchNo, updateStatus, updateItemStatus }) {
  const delayed = isDelayed(order.createdAt);
  const totalItems = getBatchTotalItems(order.items);
  const status = order.status || "pending";

  return (
    <article
      className={`overflow-hidden rounded-[1.7rem] border bg-white shadow-[0_14px_40px_rgba(59,33,24,0.08)] transition hover:-translate-y-1 ${
        delayed && status !== "served" ? "border-red-200" : "border-amber-100"
      }`}
    >
      <div
        className={`h-1.5 ${
          status === "served"
            ? "bg-emerald-500"
            : delayed
              ? "bg-red-500"
              : status === "preparing"
                ? "bg-orange-400"
                : "bg-amber-400"
        }`}
      />

      <div className="px-5 pt-5 pb-4 border-b border-amber-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h2 className="text-2xl font-black tracking-[-0.04em] text-[#241309]">
                Table {order.table || "N/A"}
              </h2>

              <span className="rounded-md bg-slate-100 px-3 py-1 text-[12px] font-black text-slate-600">
                Batch #{batchNo}
              </span>
            </div>

            <p className="text-xs font-bold text-slate-500">
              Order #{order._id?.slice(-5).toUpperCase()}
            </p>
          </div>

          <StatusPill status={status} />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-2xl bg-[#fffaf1] p-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Received
            </p>
            <p className="mt-1 text-sm font-black text-slate-700">
              {fmtTime(order.createdAt)}
            </p>
          </div>

          <div className="rounded-2xl bg-[#fffaf1] p-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Elapsed
            </p>
            <p
              className={`mt-1 text-sm font-black ${
                delayed ? "text-red-500" : "text-slate-700"
              }`}
            >
              {elapsed(order.createdAt)}
            </p>
          </div>

          <div className="rounded-2xl bg-[#fffaf1] p-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Items
            </p>
            <p className="mt-1 text-sm font-black text-slate-700">
              {totalItems}
            </p>
          </div>
        </div>

        {delayed && status !== "served" && (
          <div className="flex items-center gap-2 px-3 py-2 mt-4 text-xs font-black text-red-600 rounded-2xl bg-red-50">
            <Flame size={15} />
            This batch is delayed. Please prioritize.
          </div>
        )}
      </div>

      <div className="px-5 py-4 space-y-3">
        {(order.items || []).map((item, index) => {
          const image = getItemImage(item);
          const itemStatus = item.status || "pending";

          return (
            <div
              key={index}
              className="rounded-2xl border border-amber-100 bg-[#fbfaf8] p-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center overflow-hidden bg-white border border-gray-100 h-14 w-14 shrink-0 rounded-2xl">
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
                    <div>
                      <p className="text-base font-black tracking-tight text-slate-800">
                        {item.name}
                      </p>

                      <div className="mt-1">
                        <ItemStatusPill status={itemStatus} />
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-[#3d2412] px-3 py-1 text-sm font-black text-amber-100">
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

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => updateItemStatus(order, index, "preparing")}
                  disabled={
                    itemStatus === "preparing" || itemStatus === "served"
                  }
                  className={`rounded-xl border px-3 py-2 text-xs font-black transition ${
                    itemStatus === "preparing"
                      ? "cursor-not-allowed border-orange-200 bg-orange-50 text-orange-600"
                      : itemStatus === "served"
                        ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                        : "border-orange-200 bg-white text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  Preparing
                </button>

                <button
                  onClick={() => updateItemStatus(order, index, "served")}
                  disabled={itemStatus === "served"}
                  className={`rounded-xl border px-3 py-2 text-xs font-black transition ${
                    itemStatus === "served"
                      ? "cursor-not-allowed border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  Served
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-3">
        <button
          disabled
          className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-black ${
            status === "pending"
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-gray-200 bg-gray-50 text-gray-400"
          }`}
        >
          <Timer size={17} />
          Pending
        </button>

        <button
          onClick={() => updateStatus(order._id, "preparing")}
          disabled={status === "preparing" || status === "served"}
          className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-black transition ${
            status === "preparing"
              ? "cursor-not-allowed border-orange-200 bg-orange-50 text-orange-600"
              : status === "served"
                ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                : "border-orange-200 bg-white text-orange-600 hover:bg-orange-50"
          }`}
        >
          <ChefHat size={17} />
          Preparing
        </button>

        <button
          onClick={() => updateStatus(order._id, "served")}
          disabled={status === "served"}
          className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-black transition ${
            status === "served"
              ? "cursor-not-allowed border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-emerald-700 bg-emerald-700 text-white hover:opacity-90"
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

  const fetchOrders = () => {
    api
      .get("/orders")
      .then((res) => {
        const activeKitchenOrders = res.data
          .filter(
            (order) =>
              order.status !== "completed" && order.status !== "served",
          )
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        setOrders(activeKitchenOrders);
      })
      .catch((err) => console.log(err));
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
      if (!updated?._id) return;

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

    const handleOrderDeleted = (payload) => {
      const deleteId =
        typeof payload === "object" ? payload?._id || payload?.id : payload;

      setOrders((prev) => prev.filter((order) => order._id !== deleteId));
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

  const pendingCount = orders.filter(
    (order) => order.status === "pending" || !order.status,
  ).length;

  const preparingCount = orders.filter(
    (order) => order.status === "preparing",
  ).length;

  const delayedCount = orders.filter((order) =>
    isDelayed(order.createdAt),
  ).length;

  const updateStatus = (id, status) => {
    api
      .put(`/order/${id}`, { status })
      .then((res) => {
        setOrders((prev) => {
          if (res.data.status === "served" || res.data.status === "completed") {
            return prev.filter((order) => order._id !== id);
          }

          return prev.map((order) => (order._id === id ? res.data : order));
        });
      })
      .catch((err) => console.log(err));
  };

  const updateItemStatus = (order, itemIndex, itemStatus) => {
    const updatedItems = (order.items || []).map((item, index) =>
      index === itemIndex ? { ...item, status: itemStatus } : item,
    );

    api
      .put(`/order/${order._id}`, { items: updatedItems })
      .then((res) => {
        setOrders((prev) =>
          prev.map((o) => (o._id === order._id ? res.data : o)),
        );
      })
      .catch((err) => console.log(err));
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
      style={{ fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif" }}
    >
      <audio ref={audioRef} src="/sound.mp3" />

      <main className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-5 mb-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-black text-orange-700 rounded-full bg-orange-50">
              <Flame size={14} />
              Kitchen Live Display
            </div>

            <h1 className="text-4xl font-black tracking-[-0.05em] text-[#111936]">
              Kitchen Display
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
              Kitchen handles simple cooking flow: pending, preparing, and
              served.
            </p>
          </div>

          <button
            onClick={toggleSound}
            className={`inline-flex items-center justify-center gap-3 rounded-xl border px-5 py-3 text-sm font-black shadow-sm transition ${
              soundEnabled
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-gray-200 bg-white text-slate-600"
            }`}
          >
            {soundEnabled ? <Bell size={18} /> : <BellOff size={18} />}
            {soundEnabled ? "Sound On" : "Enable Sound"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-4">
          <StatCard
            label="Active Batches"
            value={orders.length}
            icon={<Utensils size={28} />}
            tone="orange"
          />
          <StatCard
            label="Pending"
            value={pendingCount}
            icon={<Timer size={28} />}
            tone="amber"
          />
          <StatCard
            label="Preparing"
            value={preparingCount}
            icon={<ChefHat size={28} />}
            tone="blue"
          />
          <StatCard
            label="Delayed"
            value={delayedCount}
            icon={<Flame size={28} />}
            tone="red"
          />
        </div>

        {orderedKitchenCards.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {orderedKitchenCards.map(({ order, batchNo }) => (
              <KitchenOrderCard
                key={order._id}
                order={order}
                batchNo={batchNo}
                updateStatus={updateStatus}
                updateItemStatus={updateItemStatus}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-28 text-slate-400">
            <Utensils size={54} className="mb-4 opacity-30" />
            <p className="text-lg font-black text-slate-500">
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

function StatCard({ icon, label, value, tone }) {
  const tones = {
    orange: "bg-orange-50 text-orange-500",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-500",
    red: "bg-red-50 text-red-500",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_8px_25px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <h3 className="mt-1 text-3xl font-black tracking-tight text-[#111936]">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full ${
            tones[tone] || tones.orange
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
