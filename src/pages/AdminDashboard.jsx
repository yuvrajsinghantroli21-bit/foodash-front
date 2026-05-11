import { useEffect, useState, useRef } from "react";
import api from "../api/api";
import socket from "../socket/socket";
import { Link } from "react-router-dom";
import OrderToast from "../components/OrderToast";
import { printBill } from "../components/PrintBill";
import {
  History,
  RefreshCw,
  CheckCircle2,
  Trash2,
  ChefHat,
  Clock,
  Users,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  X,
  CreditCard,
  Utensils,
  Bell,
  BellOff,
  Flame,
  QrCode,
  Activity,
  Printer,
  BarChart3,
} from "lucide-react";

/* ───────────────── HELPERS ───────────────── */

const fmt = (d) => {
  if (!d) return "—";

  return new Date(d).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const elapsed = (d) => {
  if (!d) return "—";

  const mins = Math.floor((Date.now() - new Date(d)) / 60000);
  return mins < 1 ? "< 1 min" : `${mins} min`;
};

const isDelayed = (d, threshold = 10) => {
  if (!d) return false;

  return Math.floor((Date.now() - new Date(d)) / 60000) >= threshold;
};

const getItemImage = (item) => {
  if (!item?.image) return "";
  if (item.image.startsWith("http")) return item.image;
  return `https://fooadash.onrender.com/uploads/${item.image}`;
};

const getTablePaymentMode = (tableOrders = []) => {
  const mode =
    tableOrders?.[0]?.paymentMode ||
    tableOrders?.[0]?.payment?.mode ||
    tableOrders?.[0]?.paymentType ||
    "counter";

  const cleanMode = String(mode).toLowerCase();

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

const getTablePaymentStatus = (tableOrders = []) => {
  const status =
    tableOrders?.[0]?.paymentStatus ||
    tableOrders?.[0]?.payment?.status ||
    "due";

  return String(status).toLowerCase() === "paid" ? "paid" : "due";
};

const getOrderTotal = (order) => {
  return (order?.items || []).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0,
  );
};

/* ───────────────── STAT CARD ───────────────── */

function StatCard({ icon, value, label, tone }) {
  const tones = {
    brown: {
      bg: "bg-[#f5eadb]",
      text: "text-[#b87524]",
    },
    blue: {
      bg: "bg-[#e7e9ff]",
      text: "text-[#5f73ff]",
    },
    orange: {
      bg: "bg-[#fff0df]",
      text: "text-[#ff8a19]",
    },
    green: {
      bg: "bg-[#dcf8e2]",
      text: "text-[#16a34a]",
    },
    red: {
      bg: "bg-[#ffe0e0]",
      text: "text-[#ff3b3b]",
    },
  };

  const t = tones[tone] || tones.brown;

  return (
    <div className="flex items-center gap-4 px-4 py-4 bg-white border border-gray-100 shadow-[0_8px_26px_rgba(15,23,42,0.08)] rounded-2xl sm:gap-5 sm:px-6 sm:py-5">
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-full sm:w-14 sm:h-14 ${t.bg} ${t.text}`}
      >
        {icon}
      </div>

      <div>
        <h3
          className="text-xl font-bold leading-none sm:text-2xl text-[#101936]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {value}
        </h3>

        <p className="mt-1 text-xs font-medium sm:text-sm text-slate-500">
          {label}
        </p>
      </div>
    </div>
  );
}

/* ───────────────── SMALL UI ───────────────── */

function TimeStatusPill({ createdAt }) {
  const delayed = isDelayed(createdAt);

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
        delayed ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
      }`}
    >
      {delayed ? "Delayed" : "On Time"}
    </span>
  );
}

function CollapsedTableStatus({ tableOrders = [] }) {
  const safeOrders = tableOrders.filter(Boolean);

  const anyDelayed = safeOrders.some((o) => isDelayed(o.createdAt));

  const anyPreparing = safeOrders.some(
    (o) => o.status === "preparing" || o.status === "pending" || !o.status,
  );

  if (anyDelayed) {
    return (
      <span className="px-3 py-1 rounded-full bg-red-50 text-red-500 text-[11px] font-bold whitespace-nowrap">
        Delayed
      </span>
    );
  }

  if (anyPreparing) {
    return (
      <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-500 text-[11px] font-bold whitespace-nowrap">
        Preparing
      </span>
    );
  }

  return (
    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold whitespace-nowrap">
      On Time
    </span>
  );
}

/* ───────────────── MAIN COMPONENT ───────────────── */

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [orderToasts, setOrderToasts] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [tick, setTick] = useState(0);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api
      .get("/admin/settings")
      .then((res) => setSettings(res.data))
      .catch((err) => console.log(err));
  }, []);

  const audioRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const fetchOrders = () => {
    api
      .get("/orders")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];

        setOrders(
          data
            .filter(Boolean)
            .filter(
              (o) =>
                !o.status || String(o.status).toLowerCase() !== "completed",
            ),
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleNewOrder = (order) => {
      if (!order || !order._id) return;

      if (String(order.status || "").toLowerCase() === "completed") return;

      setOrders((prev) => {
        const cleanPrev = prev.filter(Boolean);
        const exists = cleanPrev.some((o) => o?._id === order._id);

        if (exists) return cleanPrev;

        return [order, ...cleanPrev];
      });

      setOrderToasts((prev) => [...prev, order]);

      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    };

    const handleOrderUpdated = (updated) => {
      if (!updated || !updated._id) return;

      setOrders((prev) => {
        const cleanPrev = prev.filter(Boolean);

        if (String(updated.status || "").toLowerCase() === "completed") {
          return cleanPrev.filter((o) => o?._id !== updated._id);
        }

        const exists = cleanPrev.some((o) => o?._id === updated._id);

        if (!exists) {
          return [updated, ...cleanPrev];
        }

        return cleanPrev.map((o) => (o?._id === updated._id ? updated : o));
      });
    };

    const handleOrderDeleted = (payload) => {
      const deleteId =
        typeof payload === "object" ? payload?._id || payload?.id : payload;

      if (!deleteId) return;

      setOrders((prev) =>
        prev.filter(Boolean).filter((o) => o?._id !== deleteId),
      );
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

  const grouped = orders.filter(Boolean).reduce((acc, order) => {
    const key = order.table || order.tableId || "Unknown";

    if (!acc[key]) acc[key] = [];

    acc[key].push(order);

    return acc;
  }, {});

  const tableKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "Unknown") return 1;
    if (b === "Unknown") return -1;

    const numA = Number(a);
    const numB = Number(b);

    if (Number.isNaN(numA) || Number.isNaN(numB)) {
      return String(a).localeCompare(String(b));
    }

    return numA - numB;
  });

  const activeTables = tableKeys.length;
  const activeOrders = orders.filter(Boolean).length;

  const preparing = orders.filter(
    (o) => o?.status === "preparing" || o?.status === "pending" || !o?.status,
  ).length;

  const served = orders.filter((o) => o?.status === "served").length;

  const delayed = orders.filter((o) => isDelayed(o?.createdAt)).length;

  const updateBatchStatus = (id, status) => {
    if (!id) return;

    api
      .put(`/order/${id}`, { status })
      .then((res) => {
        const updated = res.data;

        if (!updated || !updated._id) return;

        setOrders((prev) => {
          const cleanPrev = prev.filter(Boolean);

          if (String(updated.status || "").toLowerCase() === "completed") {
            return cleanPrev.filter((o) => o?._id !== updated._id);
          }

          return cleanPrev.map((o) => (o?._id === id ? updated : o));
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const serveOrder = (id) => {
    if (!id) return;

    api
      .put(`/orders/${id}/serve`)
      .then((res) => {
        const updated = res.data;

        if (!updated || !updated._id) return;

        setOrders((prev) =>
          prev
            .filter(Boolean)
            .map((o) => (o?._id === updated._id ? updated : o)),
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteBatch = (id) => {
    if (!id) return;

    api
      .delete(`/order/${id}`)
      .then(() => {
        setOrders((prev) => prev.filter(Boolean).filter((o) => o?._id !== id));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteItem = (order, index) => {
    if (!order || !order._id) return;

    const currentItems = Array.isArray(order.items) ? order.items : [];

    const newItems = [...currentItems];
    newItems.splice(index, 1);

    api
      .put(`/order/${order._id}`, { items: newItems })
      .then((res) => {
        const updated = res.data;

        if (!updated || !updated._id) return;

        setOrders((prev) =>
          prev.filter(Boolean).map((o) => (o?._id === order._id ? updated : o)),
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateQty = (order, index, qty) => {
    if (!order || !order._id) return;

    const currentItems = Array.isArray(order.items) ? order.items : [];

    if (!currentItems[index]) return;

    const newItems = [...currentItems];

    newItems[index] = {
      ...newItems[index],
      qty: Number(qty),
    };

    api
      .put(`/order/${order._id}`, { items: newItems })
      .then((res) => {
        const updated = res.data;

        if (!updated || !updated._id) return;

        setOrders((prev) =>
          prev.filter(Boolean).map((o) => (o?._id === order._id ? updated : o)),
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateTablePaymentStatus = (tableOrders = [], paymentStatus) => {
    const safeTableOrders = tableOrders.filter((order) => order && order._id);

    if (safeTableOrders.length === 0) return;

    Promise.all(
      safeTableOrders.map((order) =>
        api
          .put(`/order/${order._id}`, {
            paymentStatus,
          })
          .then((res) => res.data)
          .catch((err) => {
            console.log(err);
            return null;
          }),
      ),
    )
      .then((updatedOrders) => {
        const validUpdatedOrders = updatedOrders.filter(
          (order) => order && order._id,
        );

        if (validUpdatedOrders.length === 0) return;

        setOrders((prev) =>
          prev.filter(Boolean).map((oldOrder) => {
            if (!oldOrder || !oldOrder._id) return oldOrder;

            const updated = validUpdatedOrders.find(
              (u) => u && u._id === oldOrder._id,
            );

            return updated || oldOrder;
          }),
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const completeTable = (tableOrders = []) => {
    const safeTableOrders = tableOrders.filter(Boolean);

    const token =
      safeTableOrders[0]?.token ||
      safeTableOrders[0]?.sessionId ||
      safeTableOrders[0]?.tableSessionToken;

    if (!token) return;

    api
      .put(`/table/complete/${token}`)
      .then(() => {
        fetchOrders();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteTable = (tableOrders = []) => {
    const safeTableOrders = tableOrders.filter((order) => order && order._id);

    if (safeTableOrders.length === 0) return;

    Promise.all(
      safeTableOrders.map((order) =>
        api.delete(`/order/${order._id}`).catch((err) => {
          console.log(err);
          return null;
        }),
      ),
    )
      .then(() => {
        fetchOrders();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const toggleCollapse = (key) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div
      className="min-h-screen bg-[#fbfaf8] text-[#111827]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <audio ref={audioRef} src="/sound.mp3" />

      <main className="px-3 py-5 mx-auto sm:px-5 sm:py-6 max-w-[1800px]">
        {/* PAGE TITLE + ACTIONS */}
        <div className="flex flex-col gap-5 mb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight text-[#111936] sm:text-4xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm sm:text-base text-slate-500">
              Monitor tables, orders, and kitchen status in real time.
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
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 mb-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          <StatCard
            icon={<Users size={28} />}
            value={activeTables}
            label="Active Tables"
            tone="brown"
          />

          <StatCard
            icon={<ClipboardList size={28} />}
            value={activeOrders}
            label="Active Orders"
            tone="blue"
          />

          <StatCard
            icon={<ChefHat size={28} />}
            value={preparing}
            label="Preparing"
            tone="orange"
          />

          <StatCard
            icon={<CheckCircle2 size={28} />}
            value={served}
            label="Ready"
            tone="green"
          />

          <StatCard
            icon={<Clock size={28} />}
            value={delayed}
            label="Delayed"
            tone="red"
          />
        </div>

        {tableKeys.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-slate-400">
            <ClipboardList size={48} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No active orders right now.</p>
          </div>
        )}

        {/* TABLE GRID */}
        <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {tableKeys.map((tableKey, index) => {
            const tableOrders = (grouped[tableKey] || [])
              .filter(Boolean)
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            const total = tableOrders.reduce(
              (sum, order) => sum + getOrderTotal(order),
              0,
            );

            const batchCount = tableOrders.length;

            const isCollapsed =
              collapsed[tableKey] === undefined
                ? index > 2
                : collapsed[tableKey];

            const firstReceived = fmt(tableOrders[0]?.createdAt);
            const paymentMode = getTablePaymentMode(tableOrders);
            const paymentStatus = getTablePaymentStatus(tableOrders);
            const paidTable = paymentStatus === "paid";

            return (
              <section
                key={tableKey}
                className="overflow-hidden bg-white border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.08)] rounded-xl"
              >
                {/* TABLE HEADER */}
                <button
                  type="button"
                  onClick={() => toggleCollapse(tableKey)}
                  className="flex flex-col w-full gap-3 px-4 py-4 text-left bg-white border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h2
                      className="text-lg font-bold sm:text-xl text-[#111936]"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      Table {tableKey === "Unknown" ? "N/A" : tableKey}
                    </h2>

                    <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-600 text-[12px] font-bold">
                      {batchCount} {batchCount === 1 ? "Batch" : "Batches"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBill(tableOrders);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          setSelectedBill(tableOrders);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3.5 py-2 text-sm font-black text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-100"
                    >
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">
                        Total
                      </span>
                      ₹{total}
                    </span>

                    {isCollapsed ? (
                      <ChevronDown size={18} className="text-[#071832]" />
                    ) : (
                      <ChevronUp size={18} className="text-[#071832]" />
                    )}
                  </div>
                </button>

                {/* COLLAPSED ROW */}
                {isCollapsed && (
                  <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex flex-wrap items-center gap-4 text-sm sm:gap-6 text-slate-500">
                      <span>
                        <strong className="font-bold text-slate-600">
                          Total
                        </strong>{" "}
                        <button
                          type="button"
                          onClick={() => setSelectedBill(tableOrders)}
                          className="text-2xl font-black transition text-emerald-700 hover:scale-105 hover:text-emerald-800"
                        >
                          ₹
                          {tableOrders.reduce(
                            (sum, order) =>
                              sum +
                              Number(order.finalTotal || order.total || 0),
                            0,
                          )}
                        </button>
                      </span>

                      <span className="hidden w-px h-5 bg-gray-200 sm:inline-block" />

                      <span>
                        <strong className="font-bold text-slate-600">
                          Received
                        </strong>{" "}
                        {firstReceived}
                      </span>
                    </div>

                    <CollapsedTableStatus tableOrders={tableOrders} />
                  </div>
                )}

                {/* OPEN TABLE BODY */}
                {!isCollapsed && (
                  <div className="px-4 pb-4 sm:px-5">
                    {tableOrders.map((order, idx) => {
                      if (!order || !order._id) return null;

                      return (
                        <div
                          key={order._id}
                          className={`py-4 ${
                            idx !== tableOrders.length - 1
                              ? "border-b border-gray-100"
                              : ""
                          }`}
                        >
                          {/* BATCH HEADER */}
                          <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-base font-extrabold text-[#111936]">
                                Batch #{idx + 1}
                              </span>

                              <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-500 text-[11px] font-extrabold">
                                Order #{order._id?.slice(-5).toUpperCase()}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex lg:items-center lg:gap-5">
                              <div>
                                <p className="text-[11px] font-bold text-slate-400">
                                  Received
                                </p>

                                <p className="text-xs font-bold text-slate-700">
                                  {fmt(order.createdAt)}
                                </p>
                              </div>

                              <div>
                                <p className="text-[11px] font-bold text-slate-400">
                                  Est. Prep Time
                                </p>

                                <select className="w-full h-8 px-2 text-xs font-bold bg-white border border-gray-200 rounded-md outline-none min-w-[88px] text-slate-700">
                                  <option>10 min</option>
                                  <option>15 min</option>
                                  <option>20 min</option>
                                  <option>25 min</option>
                                  <option>30 min</option>
                                </select>
                              </div>

                              <div>
                                <p className="text-[11px] font-bold text-slate-400">
                                  Elapsed
                                </p>

                                <p className="text-xs font-bold text-slate-700">
                                  {elapsed(order.createdAt)}
                                </p>
                              </div>

                              <div className="flex items-end">
                                <TimeStatusPill createdAt={order.createdAt} />
                              </div>
                            </div>
                          </div>

                          {/* ITEMS */}
                          <div className="space-y-3">
                            {(order.items || []).map((item, i) => {
                              const itemImage = getItemImage(item);

                              return (
                                <div key={`${order._id}-${i}`}>
                                  <div className="flex flex-col gap-3 rounded-lg sm:flex-row sm:items-center">
                                    <div className="flex items-center flex-1 min-w-0 gap-3">
                                      <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-md shrink-0">
                                        {itemImage ? (
                                          <img
                                            src={itemImage}
                                            alt={item.name || "Item"}
                                            className="object-cover w-full h-full"
                                            onError={(e) => {
                                              e.currentTarget.style.display =
                                                "none";

                                              e.currentTarget.parentElement.innerHTML =
                                                '<span style="font-size:20px">🍽</span>';
                                            }}
                                          />
                                        ) : (
                                          <span className="text-xl">🍽</span>
                                        )}
                                      </div>

                                      <p className="text-sm font-semibold truncate text-slate-700">
                                        {item.name || "Item"}
                                      </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                                      <div className="flex items-center overflow-hidden bg-white border border-gray-200 rounded-md">
                                        <button
                                          onClick={() =>
                                            updateQty(
                                              order,
                                              i,
                                              Math.max(
                                                1,
                                                Number(item.qty || 1) - 1,
                                              ),
                                            )
                                          }
                                          className="flex items-center justify-center w-8 h-8 text-slate-500 hover:bg-gray-50"
                                        >
                                          <Minus size={13} />
                                        </button>

                                        <span className="w-10 text-sm font-bold text-center text-slate-700">
                                          {item.qty || 1}
                                        </span>

                                        <button
                                          onClick={() =>
                                            updateQty(
                                              order,
                                              i,
                                              Number(item.qty || 1) + 1,
                                            )
                                          }
                                          className="flex items-center justify-center w-8 h-8 text-slate-500 hover:bg-gray-50"
                                        >
                                          <Plus size={13} />
                                        </button>
                                      </div>

                                      <span className="min-w-[70px] text-sm font-extrabold text-right text-slate-700">
                                        ₹
                                        {Number(item.price || 0) *
                                          Number(item.qty || 1)}
                                      </span>

                                      <button
                                        onClick={() => deleteItem(order, i)}
                                        className="flex items-center justify-center text-red-400 rounded-md w-9 h-9 hover:bg-red-50"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  </div>

                                  {item.note && item.note.trim() !== "" && (
                                    <p className="mt-1 ml-0 text-xs italic font-medium sm:ml-12 text-amber-500">
                                      📝 {item.note}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* RESPONSIVE BATCH ACTIONS */}
                          <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-3">
                            <button
                              onClick={() =>
                                updateBatchStatus(order._id, "preparing")
                              }
                              className={`flex min-h-[42px] items-center justify-center gap-2 px-3 py-2 text-sm font-bold border rounded-md ${
                                order.status === "preparing" ||
                                order.status === "pending" ||
                                !order.status
                                  ? "text-orange-500 border-orange-200 bg-orange-50"
                                  : "text-orange-500 border-orange-200 bg-white"
                              }`}
                            >
                              <ChefHat size={15} />
                              <span className="whitespace-nowrap">
                                Preparing
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                updateBatchStatus(order._id, "served");
                                serveOrder(order._id);
                              }}
                              className={`flex min-h-[42px] items-center justify-center gap-2 px-3 py-2 text-sm font-bold border rounded-md ${
                                order.status === "served"
                                  ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                                  : "text-emerald-600 border-emerald-200 bg-white"
                              }`}
                            >
                              <CheckCircle2 size={15} />
                              <span className="whitespace-nowrap">Served</span>
                            </button>

                            <button
                              onClick={() => deleteBatch(order._id)}
                              className="flex min-h-[42px] items-center justify-center gap-2 px-3 py-2 text-sm font-bold text-red-500 bg-white border border-red-200 rounded-md"
                            >
                              <Trash2 size={15} />
                              <span className="whitespace-nowrap">Delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* PAYMENT ROW */}
                    <div className="grid grid-cols-1 gap-4 py-4 border-b border-gray-100 md:grid-cols-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <span className="text-sm font-bold text-slate-500">
                          Payment Mode:
                        </span>

                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                          <CreditCard size={17} className="text-slate-500" />
                          <span>{paymentMode}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:items-end">
                        <span className="text-sm font-bold text-slate-500">
                          Payment Status:
                        </span>

                        <div className="flex items-center gap-3">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              paidTable ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />

                          <select
                            value={paymentStatus}
                            onChange={(e) =>
                              updateTablePaymentStatus(
                                tableOrders,
                                e.target.value,
                              )
                            }
                            className={`h-9 px-3 text-sm font-extrabold bg-white border rounded-md outline-none ${
                              paidTable
                                ? "text-emerald-600 border-emerald-200"
                                : "text-red-500 border-red-200"
                            }`}
                          >
                            <option value="paid">Paid</option>
                            <option value="due">Due</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* TABLE ACTIONS */}
                    <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
                      <button
                        onClick={() =>
                          printBill({
                            tableOrders: tableOrders,
                            tableKey: tableKey,
                            orderNo: `T${tableKey}`,
                            settings: settings,
                          })
                        }
                        className="flex min-h-[46px] items-center justify-center gap-2 px-3 py-3 text-sm font-extrabold text-slate-700 bg-white border border-gray-200 rounded-md"
                      >
                        <Printer size={17} />
                        Print Bill
                      </button>

                      <button
                        onClick={() => completeTable(tableOrders)}
                        className="flex min-h-[46px] items-center justify-center gap-2 px-3 py-3 text-sm font-extrabold text-white bg-[#071832] rounded-md shadow-[0_8px_18px_rgba(7,24,50,0.18)]"
                      >
                        <CheckCircle2 size={17} />
                        Complete Table
                      </button>

                      <button
                        onClick={() => deleteTable(tableOrders)}
                        className="flex min-h-[46px] items-center justify-center gap-2 px-3 py-3 text-sm font-extrabold text-red-500 bg-white border border-red-200 rounded-md"
                      >
                        <Trash2 size={17} />
                        Delete Table
                      </button>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="flex flex-col gap-3 px-5 py-5 mt-5 text-sm border-t border-gray-200 bg-[#fbfaf8] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>
            Times are updated automatically. Delayed threshold is 10 minutes.
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span>
            Last updated:{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>

          <RefreshCw size={16} className="text-slate-500" />
        </div>
      </footer>

      {/* TOASTS */}
      <div className="fixed z-50 space-y-3 top-6 right-6">
        {orderToasts.filter(Boolean).map((t, i) => (
          <OrderToast
            key={t?._id || i}
            order={t}
            onClose={() =>
              setOrderToasts((prev) => prev.filter((_, idx) => idx !== i))
            }
          />
        ))}
      </div>

      {selectedBill && (
        <BillSummaryModal
          tableOrders={selectedBill}
          menu={[]}
          onClose={() => setSelectedBill(null)}
          printBill={printBill}
        />
      )}
    </div>
  );
}

function BillSummaryModal({ tableOrders, menu = [], onClose, printBill }) {
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
              onClick={() => printBill(tableOrders, `T${table}`)}
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
