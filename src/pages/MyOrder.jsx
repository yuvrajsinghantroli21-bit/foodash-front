import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import socket from "../socket/socket";
import toast from "react-hot-toast";
import StickyHeader from "../components/StickyHeader";
import {
  Clock,
  ChefHat,
  CheckCircle2,
  ShoppingBag,
  Utensils,
} from "lucide-react";

/* ── Decorative divider ── */
const Divider = () => (
  <div className="flex items-center justify-center gap-2 my-2">
    <div className="w-8 h-[1px] bg-amber-400" />
    <span className="text-sm text-amber-500">🌿</span>
    <div className="w-8 h-[1px] bg-amber-400" />
  </div>
);

/* ── Status banner ── */
const StatusBanner = ({ status }) => {
  if (status === "preparing" || status === "pending") {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-3 mt-4 rounded-xl bg-blue-50 animate-pulse">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
          <ChefHat size={16} />
          Preparing
        </div>
        <p className="text-xs text-blue-400">We're getting your food ready</p>
      </div>
    );
  }
  if (status === "served") {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-3 mt-4 rounded-xl bg-emerald-50">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={16} />
          Served
        </div>
        <p className="text-xs text-emerald-400">Enjoy your meal!</p>
      </div>
    );
  }
  return null;
};

export default function MyOrder() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const table = localStorage.getItem("table");
  const token = localStorage.getItem("token");

  /* ── Look up image from menu by item name ── */
  const getImage = (itemName) => {
    const found = menu.find((m) => m.name === itemName);
    return found?.image ? `item.image` : null;
  };

  /* ── Fetch menu (for images) ── */
  useEffect(() => {
    api
      .get("/menu")
      .then((res) => setMenu(res.data))
      .catch(() => {});
  }, []);

  /* ── Fetch orders ── */
  const fetchOrders = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await api.get(`/orders/${token}`);
      const sorted = (Array.isArray(res.data) ? res.data : []).sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
      setOrders(sorted);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  /* ── Socket + initial fetch ── */
  useEffect(() => {
    fetchOrders();

    socket.on("orderUpdated", (updatedOrder) => {
      if (updatedOrder.token === token) {
        setOrders((prev) => {
          const exists = prev.find((o) => o._id === updatedOrder._id);
          const next = exists
            ? prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
            : [...prev, updatedOrder];
          return next.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
          );
        });
        if (updatedOrder.status === "served")
          toast.success("One batch is served! 🍽️");
      }
    });

    socket.on("session-expired", (data) => {
      if (data.token === token) {
        toast.success("Session expired. Thank you! 🙏");
        localStorage.removeItem("token");
        localStorage.removeItem("table");
        setTimeout(() => navigate("/thank-you"), 1200);
      }
    });

    return () => {
      socket.off("orderUpdated");
      socket.off("session-expired");
    };
  }, []);

  /* ── Auto-redirect when all completed ── */
  useEffect(() => {
    if (orders.length > 0 && orders.every((o) => o.status === "completed")) {
      setTimeout(() => {
        localStorage.removeItem("token");
        setOrders([]);
        toast.success("Dining completed 🍽️ Thank you!");
        navigate("/thank-you");
      }, 3000);
    }
  }, [orders]);

  /* ── Derived stats ── */
  const grandTotal = orders.reduce(
    (sum, o) =>
      sum + (o.total ?? o.items.reduce((s, i) => s + i.price * i.qty, 0)),
    0,
  );
  const totalItems = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0),
    0,
  );
  const totalBatches = orders.length;

  /* ── Loading ── */
  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen gap-3"
        style={{ backgroundColor: "#f5f0e8" }}
      >
        <div className="w-8 h-8 border-4 rounded-full border-emerald-400 border-t-transparent animate-spin" />
        <p className="text-sm text-gray-400">Loading your order…</p>
      </div>
    );
  }

  return (
    <>
      {/* <StickyHeader
        table={table}
        showCart={false}
        actionLabel="Go to Menu"
        actionLink="/order"
      /> */}

      <div
        className="min-h-screen pb-16"
        style={{ backgroundColor: "#f5f0e8" }}
      >
        <div className="" />

        <div className="max-w-2xl px-4 pt-8 pb-4 mx-auto sm:px-6">
          {/* ── Page Title ── */}
          <div className="mb-8 text-center">
            <h1
              className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-900 sm:text-4xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              <span className="text-2xl">🧾</span> My Orders
            </h1>
            <Divider />
            <p className="text-sm text-gray-400">
              Track the status of your orders in real-time
            </p>
          </div>

          {/* ── No session ── */}
          {!token && (
            <div className="p-10 text-center bg-white shadow-md rounded-2xl">
              <p className="mb-4 text-gray-400">
                No session found. Please scan QR.
              </p>
              <button
                onClick={() => navigate("/scan")}
                className="px-6 py-2.5 text-white text-sm font-semibold bg-emerald-500 rounded-full hover:bg-emerald-600 transition"
              >
                Scan QR
              </button>
            </div>
          )}

          {/* ── Empty orders ── */}
          {token && orders.length === 0 && (
            <div className="p-10 text-center bg-white shadow-md rounded-2xl">
              <p className="mb-3 text-4xl">🍽️</p>
              <p className="mb-4 text-gray-400">No active orders yet.</p>
              <button
                onClick={() => navigate("/order")}
                className="px-6 py-2.5 text-white text-sm font-semibold bg-emerald-500 rounded-full hover:bg-emerald-600 transition"
              >
                Go to Menu
              </button>
            </div>
          )}

          {/* ── Order Batches ── */}
          {token && orders.length > 0 && (
            <div className="space-y-5">
              {orders.map((order, index) => {
                const batchTotal =
                  order.total ??
                  order.items.reduce((s, i) => s + i.price * i.qty, 0);
                const time = new Date(order.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const dateLabel = "Today, " + time;
                const orderId = "#WHC-" + order._id.slice(-5).toUpperCase();

                return (
                  <div
                    key={order._id}
                    className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-2xl"
                  >
                    {/* Batch header */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 text-xs font-bold text-white rounded-full bg-emerald-600">
                          Batch {index + 1}
                        </span>
                        <span className="text-xs text-gray-400">{orderId}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        {dateLabel}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="px-4 divide-y divide-gray-100">
                      {order.items.map((item, i) => {
                        const image = getImage(item.name);
                        return (
                          <div key={i} className="flex items-center gap-3 py-3">
                            {/* Thumbnail */}
                            <div className="flex items-center justify-center overflow-hidden bg-gray-100 w-14 h-14 rounded-xl shrink-0">
                              {image ? (
                                <img
                                  src={image}
                                  alt={item.name}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <span className="text-2xl">🍽</span>
                              )}
                            </div>

                            {/* Name + veg dot + qty */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold leading-snug text-gray-800 truncate">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-xs text-gray-400">
                                  × {item.qty}
                                </span>
                              </div>
                              {item.note && (
                                <p className="text-[11px] text-gray-400 mt-0.5 italic">
                                  "{item.note}"
                                </p>
                              )}
                            </div>

                            {/* Price */}
                            <p className="text-sm font-semibold text-gray-800 shrink-0">
                              ₹{item.price * item.qty}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Batch total */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                      <span className="text-sm font-bold text-gray-800">
                        Batch Total
                      </span>
                      <span
                        className="text-base font-bold text-gray-900"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        ₹{batchTotal}
                      </span>
                    </div>

                    {/* Status banner */}
                    <div className="px-4 pb-4">
                      <StatusBanner status={order.status} />
                    </div>
                  </div>
                );
              })}

              {/* ── Grand Summary Card ── */}
              <div className="relative px-5 py-5 overflow-hidden bg-white border shadow-md rounded-2xl border-amber-100">
                <div className="absolute right-4 bottom-2 opacity-10 text-amber-400 pointer-events-none select-none text-[80px]">
                  🍽
                </div>
                <div className="relative z-10 grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                      <ShoppingBag size={14} />
                      <span className="text-xs text-gray-400">
                        Total Batches
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalBatches}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                      <Utensils size={14} />
                      <span className="text-xs text-gray-400">
                        Items Ordered
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalItems}
                    </p>
                  </div>
                  <div>
                    <div className="mb-1">
                      <span className="text-xs font-semibold text-emerald-600">
                        Grand Total
                      </span>
                    </div>
                    <p
                      className="text-2xl font-bold text-emerald-600"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      ₹{grandTotal}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Thank you note ── */}
              <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-2 pb-4">
                <span className="text-red-400">🤍</span>
                Thank you for dining with us!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
