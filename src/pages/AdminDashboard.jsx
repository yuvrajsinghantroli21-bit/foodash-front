import { useEffect, useState, useRef } from "react";
import api from "../api/api";
import socket from "../socket/socket";
import { Link } from "react-router-dom";
import OrderToast from "../components/OrderToast";
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
} from "lucide-react";

/* ───────────────── HELPERS ───────────────── */

const fmt = (d) =>
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

const getTablePaymentMode = (tableOrders) => {
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

const getTablePaymentStatus = (tableOrders) => {
  const status =
    tableOrders?.[0]?.paymentStatus ||
    tableOrders?.[0]?.payment?.status ||
    "due";

  return String(status).toLowerCase() === "paid" ? "paid" : "due";
};

const getOrderTotal = (order) =>
  order.items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0,
  );

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

  const t = tones[tone];

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

function CollapsedTableStatus({ tableOrders }) {
  const anyDelayed = tableOrders.some((o) => isDelayed(o.createdAt));
  const anyPreparing = tableOrders.some(
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
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [tick, setTick] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");

      setOrders(
        res.data.filter(
          (o) => !o.status || o.status.toLowerCase() !== "completed",
        ),
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleNewOrder = (order) => {
      setOrders((prev) => [order, ...prev]);
      setOrderToasts((prev) => [...prev, order]);

      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    };

    const handleOrderUpdated = (updated) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o)),
      );
    };

    const handleOrderDeleted = (id) => {
      setOrders((prev) => prev.filter((o) => o._id !== id));
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

  const grouped = orders.reduce((acc, order) => {
    const key = order.table || order.tableId || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

  const tableKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "Unknown") return 1;
    if (b === "Unknown") return -1;
    return Number(a) - Number(b);
  });

  const activeTables = tableKeys.length;
  const activeOrders = orders.length;

  const preparing = orders.filter(
    (o) => o.status === "preparing" || o.status === "pending" || !o.status,
  ).length;

  const served = orders.filter((o) => o.status === "served").length;
  const delayed = orders.filter((o) => isDelayed(o.createdAt)).length;

  const updateBatchStatus = async (id, status) => {
    try {
      const res = await api.put(`/order/${id}`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? res.data : o)));
    } catch (err) {
      console.log(err);
    }
  };

  const serveOrder = async (id) => {
    try {
      await api.put(`/orders/${id}/serve`);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteBatch = async (id) => {
    try {
      await api.delete(`/order/${id}`);
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const deleteItem = async (order, index) => {
    try {
      const newItems = [...order.items];
      newItems.splice(index, 1);

      const res = await api.put(`/order/${order._id}`, { items: newItems });

      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? res.data : o)),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const updateQty = async (order, index, qty) => {
    try {
      const newItems = [...order.items];
      newItems[index].qty = Number(qty);

      const res = await api.put(`/order/${order._id}`, { items: newItems });

      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? res.data : o)),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const updateTablePaymentStatus = async (tableOrders, paymentStatus) => {
    try {
      const updatedOrders = await Promise.all(
        tableOrders.map(async (order) => {
          const res = await api.put(`/order/${order._id}`, {
            paymentStatus,
          });

          return res.data;
        }),
      );

      setOrders((prev) =>
        prev.map((oldOrder) => {
          const updated = updatedOrders.find((u) => u._id === oldOrder._id);
          return updated || oldOrder;
        }),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const completeTable = async (tableOrders) => {
    try {
      const token = tableOrders[0]?.token;
      if (!token) return;

      await api.put(`/table/complete/${token}`);
      fetchOrders();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteTable = async (tableOrders) => {
    try {
      for (let o of tableOrders) {
        await api.delete(`/order/${o._id}`);
      }

      fetchOrders();
    } catch (err) {
      console.log(err);
    }
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
            const tableOrders = grouped[tableKey].sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            );

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
            const isPaid = paymentStatus === "paid";

            return (
              <section
                key={tableKey}
                className="overflow-hidden bg-white border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.08)] rounded-xl"
              >
                {/* TABLE HEADER */}
                <button
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

                  <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
                    <span className="text-sm font-bold text-slate-500">
                      Total ₹{total}
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
                        ₹{total}
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
                            {order.items.map((item, i) => {
                              const itemImage = getItemImage(item);

                              return (
                                <div key={i}>
                                  <div className="flex flex-col gap-3 rounded-lg sm:flex-row sm:items-center">
                                    <div className="flex items-center flex-1 min-w-0 gap-3">
                                      <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-md shrink-0">
                                        {itemImage ? (
                                          <img
                                            src={itemImage}
                                            alt={item.name}
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
                                        {item.name}
                                      </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                                      <div className="flex items-center overflow-hidden bg-white border border-gray-200 rounded-md">
                                        <button
                                          onClick={() =>
                                            updateQty(
                                              order,
                                              i,
                                              Math.max(1, item.qty - 1),
                                            )
                                          }
                                          className="flex items-center justify-center w-8 h-8 text-slate-500 hover:bg-gray-50"
                                        >
                                          <Minus size={13} />
                                        </button>

                                        <span className="w-10 text-sm font-bold text-center text-slate-700">
                                          {item.qty}
                                        </span>

                                        <button
                                          onClick={() =>
                                            updateQty(order, i, item.qty + 1)
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
                              isPaid ? "bg-emerald-500" : "bg-red-500"
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
                              isPaid
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
                    <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2">
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
        {orderToasts.map((t, i) => (
          <OrderToast
            key={i}
            order={t}
            onClose={() =>
              setOrderToasts((prev) => prev.filter((_, idx) => idx !== i))
            }
          />
        ))}
      </div>
    </div>
  );
}
