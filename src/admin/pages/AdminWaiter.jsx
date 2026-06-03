import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../api/api";
import socket from "../../socket/socket";
import {
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  Flame,
  HandPlatter,
  Loader2,
  MapPin,
  PackageCheck,
  Utensils,
} from "lucide-react";

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const elapsed = (d) => {
  const mins = Math.floor((Date.now() - new Date(d)) / 60000);
  return mins < 1 ? "< 1 min" : `${mins} min`;
};

const isDelayed = (d, threshold = 7) =>
  Math.floor((Date.now() - new Date(d)) / 60000) >= threshold;

const getItemImage = (item) => {
  if (!item?.image) return "";
  if (item.image.startsWith("http")) return item.image;
  return `${import.meta.env.VITE_BACKEND_URL}/uploads/${item.image}`;
};

const totalItems = (items = []) =>
  items.reduce((sum, item) => sum + Number(item.qty || 1), 0);

function ReadyOrderCard({ order, batchNo, markServed, servingId }) {
  const delayed = isDelayed(order.createdAt);
  const loading = servingId === order._id;

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)] ${
        delayed ? "border-red-200" : "border-emerald-100"
      }`}
    >
      <div className={delayed ? "h-1.5 bg-red-500" : "h-1.5 bg-emerald-500"} />

      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h2 className="text-2xl font-black tracking-[-0.04em] text-[#111936]">
                Table {order.table || "N/A"}
              </h2>

              <span className="rounded-md bg-slate-100 px-3 py-1 text-[12px] font-black text-slate-600">
                Batch #{batchNo}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
                <PackageCheck size={13} />
                Ready
              </span>
            </div>

            <p className="text-xs font-bold text-slate-500">
              Order #{order._id?.slice(-5).toUpperCase()}
            </p>
          </div>

          <div
            className={`rounded-full px-3 py-1 text-[11px] font-black ${
              delayed
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {delayed ? "Waiting" : "Fresh"}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-slate-50">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Ready At
            </p>
            <p className="mt-1 text-sm font-black text-slate-700">
              {fmtTime(order.updatedAt || order.createdAt)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50">
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

          <div className="p-3 rounded-xl bg-slate-50">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Items
            </p>
            <p className="mt-1 text-sm font-black text-slate-700">
              {totalItems(order.items)}
            </p>
          </div>
        </div>

        {delayed && (
          <div className="flex items-center gap-2 px-3 py-2 mt-4 text-xs font-black text-red-600 rounded-xl bg-red-50">
            <Flame size={15} />
            This ready batch is waiting. Please serve it quickly.
          </div>
        )}
      </div>

      <div className="px-5 py-4 space-y-3">
        {(order.items || []).map((item, index) => {
          const image = getItemImage(item);

          return (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border border-gray-100 bg-[#fbfaf8] p-3"
            >
              <div className="flex items-center justify-center overflow-hidden bg-white border border-gray-100 h-14 w-14 shrink-0 rounded-xl">
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
                  <p className="text-base font-black tracking-tight text-slate-800">
                    {item.name}
                  </p>

                  <span className="shrink-0 rounded-full bg-[#071832] px-3 py-1 text-sm font-black text-white">
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

      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={() => markServed(order._id)}
          disabled={loading}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#071832] px-4 py-3 text-sm font-black text-white shadow-[0_8px_18px_rgba(7,24,50,0.18)] transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <CheckCircle2 size={18} />
          )}
          Mark Served
        </button>
      </div>
    </article>
  );
}

export default function AdminWaiter() {
  const [orders, setOrders] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [servingId, setServingId] = useState(null);
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
        const readyOrders = (Array.isArray(res.data) ? res.data : [])
          .filter(
            (order) => String(order.status || "").toLowerCase() === "ready",
          )
          .sort(
            (a, b) =>
              new Date(a.updatedAt || a.createdAt) -
              new Date(b.updatedAt || b.createdAt),
          );

        setOrders(readyOrders);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleOrderUpdate = (order) => {
      if (!order?._id) return;

      const status = String(order.status || "").toLowerCase();

      setOrders((prev) => {
        if (status !== "ready") {
          return prev.filter((o) => o._id !== order._id);
        }

        const exists = prev.some((o) => o._id === order._id);

        const next = exists
          ? prev.map((o) => (o._id === order._id ? order : o))
          : [order, ...prev];

        return next.sort(
          (a, b) =>
            new Date(a.updatedAt || a.createdAt) -
            new Date(b.updatedAt || b.createdAt),
        );
      });

      if (status === "ready" && soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    };

    const handleDelete = (payload) => {
      const id =
        typeof payload === "object" ? payload?._id || payload?.id : payload;
      if (!id) return;
      setOrders((prev) => prev.filter((o) => o._id !== id));
    };

    socket.on("orderUpdated", handleOrderUpdate);
    socket.on("order-updated", handleOrderUpdate);
    socket.on("new-order", handleOrderUpdate);
    socket.on("order-deleted", handleDelete);

    return () => {
      socket.off("orderUpdated", handleOrderUpdate);
      socket.off("order-updated", handleOrderUpdate);
      socket.off("new-order", handleOrderUpdate);
      socket.off("order-deleted", handleDelete);
    };
  }, [soundEnabled]);

  const groupedByTable = useMemo(() => {
    const grouped = {};

    orders.forEach((order) => {
      const table = order.table || "Unknown";

      if (!grouped[table]) grouped[table] = [];
      grouped[table].push(order);
    });

    Object.keys(grouped).forEach((table) => {
      grouped[table].sort(
        (a, b) =>
          new Date(a.updatedAt || a.createdAt) -
          new Date(b.updatedAt || b.createdAt),
      );
    });

    return grouped;
  }, [orders]);

  const readyCards = useMemo(() => {
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
      (a, b) =>
        new Date(a.order.updatedAt || a.order.createdAt) -
        new Date(b.order.updatedAt || b.order.createdAt),
    );
  }, [groupedByTable]);

  const waitingCount = readyCards.filter(({ order }) =>
    isDelayed(order.createdAt),
  ).length;

  const markServed = (id) => {
    setServingId(id);

    api
      .put(`/orders/${id}/serve`)
      .then(() => {
        setOrders((prev) => prev.filter((order) => order._id !== id));
      })
      .catch((err) => console.log(err))
      .finally(() => setServingId(null));
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
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-black rounded-full bg-emerald-50 text-emerald-700">
              <HandPlatter size={14} />
              Waiter Pickup Board
            </div>

            <h1 className="text-4xl font-black tracking-[-0.06em] text-[#111936]">
              Waiter Display
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
              Ready food batches from kitchen appear here for table service.
            </p>
          </div>

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

        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
          <StatBox
            title="Ready Batches"
            value={readyCards.length}
            icon={<PackageCheck size={28} />}
            tone="green"
          />

          <StatBox
            title="Waiting"
            value={waitingCount}
            icon={<Flame size={28} />}
            tone="red"
          />

          <StatBox
            title="Tables"
            value={Object.keys(groupedByTable).length}
            icon={<MapPin size={28} />}
            tone="blue"
          />
        </div>

        {readyCards.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {readyCards.map(({ order, batchNo }) => (
              <ReadyOrderCard
                key={order._id}
                order={order}
                batchNo={batchNo}
                markServed={markServed}
                servingId={servingId}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-28 text-slate-400">
            <Utensils size={54} className="mb-4 opacity-30" />
            <p className="text-lg font-black text-slate-500">
              No ready orders right now
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Kitchen will send batches here after marking them ready.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatBox({ title, value, icon, tone }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-500",
    blue: "bg-blue-50 text-blue-500",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_8px_25px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <h3 className="mt-1 text-3xl font-black tracking-tight text-[#111936]">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full ${
            tones[tone] || tones.green
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
