import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import socket from "../socket/socket";
import toast from "react-hot-toast";
import {
  Clock,
  ChefHat,
  CheckCircle2,
  ShoppingBag,
  Utensils,
  ReceiptText,
  ArrowLeft,
  Sparkles,
  Timer,
  X,
  TicketPercent,
  CreditCard,
  Wallet,
} from "lucide-react";

const Divider = () => (
  <div className="flex items-center justify-center my-3" style={{ height: 18 }}>
    <svg width="190" height="18" viewBox="0 0 190 18" fill="none">
      <line x1="0" y1="9" x2="60" y2="9" stroke="#e8c97a" strokeWidth="0.8" />
      <path
        d="M60 9 Q66 4 72 7"
        stroke="#c9a55a"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M64 9 Q67 13 73 11"
        stroke="#c9a55a"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M69 9 Q73 5 78 8"
        stroke="#c9a55a"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="95" cy="9" r="3.5" fill="#e8c97a" />
      <circle cx="95" cy="9" r="1.8" fill="#b45309" />
      <path
        d="M130 9 Q124 4 118 7"
        stroke="#c9a55a"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M126 9 Q123 13 117 11"
        stroke="#c9a55a"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M121 9 Q117 5 112 8"
        stroke="#c9a55a"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <line
        x1="130"
        y1="9"
        x2="190"
        y2="9"
        stroke="#e8c97a"
        strokeWidth="0.8"
      />
    </svg>
  </div>
);

const StatusBanner = ({ status }) => {
  const safeStatus = status || "pending";

  if (safeStatus === "pending") {
    return (
      <div className="px-4 py-3 mt-4 border rounded-2xl border-amber-200 bg-amber-50/80">
        <div className="flex items-center justify-center gap-2 text-sm font-black text-amber-800">
          <Timer size={16} />
          Pending
        </div>
        <p className="mt-1 text-xs font-medium text-center text-amber-700/70">
          Your order has been received and is waiting for kitchen confirmation.
        </p>
      </div>
    );
  }

  if (safeStatus === "preparing") {
    return (
      <div className="px-4 py-3 mt-4 border border-orange-200 rounded-2xl bg-orange-50/80">
        <div className="flex items-center justify-center gap-2 text-sm font-black text-orange-700">
          <ChefHat size={16} />
          Preparing
        </div>
        <p className="mt-1 text-xs font-medium text-center text-orange-600/70">
          The kitchen is preparing your food.
        </p>
      </div>
    );
  }

  if (safeStatus === "served") {
    return (
      <div className="px-4 py-3 mt-4 border rounded-2xl border-emerald-200 bg-emerald-50/80">
        <div className="flex items-center justify-center gap-2 text-sm font-black text-emerald-700">
          <CheckCircle2 size={16} />
          Served
        </div>
        <p className="mt-1 text-xs font-medium text-center text-emerald-600/70">
          Enjoy your meal!
        </p>
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
  const [selectedBill, setSelectedBill] = useState(null);

  const table = localStorage.getItem("table");
  const token = localStorage.getItem("token");

  const getImage = (item) => {
    const directImage = item?.image;

    if (directImage) {
      if (directImage.startsWith("http")) return directImage;
      return `https://fooadash.onrender.com/uploads/${directImage}`;
    }

    const found = menu.find(
      (m) => m.name?.toLowerCase() === item.name?.toLowerCase(),
    );

    if (!found?.image) return null;
    if (found.image.startsWith("http")) return found.image;

    return `https://fooadash.onrender.com/uploads/${found.image}`;
  };

  const getOrderSubtotal = (order) =>
    Number(
      order?.subtotal ||
        (order?.items || []).reduce(
          (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
          0,
        ),
    );

  const getOrderDiscount = (order) =>
    Number(order?.discountAmount || order?.coupon?.discountAmount || 0);

  const getOrderFinalTotal = (order) =>
    Number(order?.finalTotal || order?.total || getOrderSubtotal(order));

  const getPaymentMode = (order) => {
    const mode = String(order?.paymentMode || "counter").toLowerCase();

    if (["online", "razorpay", "upi", "card"].includes(mode)) return "Online";
    return "Pay at Counter";
  };

  const getPaymentStatus = (order) => {
    const status = String(order?.paymentStatus || "due").toLowerCase();
    return status === "paid" ? "Paid" : "Due";
  };

  useEffect(() => {
    api
      .get("/menu")
      .then((res) => setMenu(res.data))
      .catch(() => {});
  }, []);

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

  useEffect(() => {
    fetchOrders();

    const handleUpdate = (updatedOrder) => {
      if (updatedOrder.token === token || updatedOrder.sessionId === token) {
        setOrders((prev) => {
          const exists = prev.find((o) => o._id === updatedOrder._id);

          const next = exists
            ? prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
            : [...prev, updatedOrder];

          return next.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
          );
        });

        if (updatedOrder.status === "served") {
          toast.success("One batch is served! 🍽️");
        }
      }
    };

    socket.on("orderUpdated", handleUpdate);
    socket.on("order-updated", handleUpdate);

    socket.on("session-expired", (data) => {
      if (data.token === token) {
        toast.success("Session expired. Thank you! 🙏");
        localStorage.removeItem("token");
        localStorage.removeItem("table");

        setTimeout(() => navigate("/thank-you"), 1200);
      }
    });

    return () => {
      socket.off("orderUpdated", handleUpdate);
      socket.off("order-updated", handleUpdate);
      socket.off("session-expired");
    };
  }, [token, navigate]);

  useEffect(() => {
    if (orders.length > 0 && orders.every((o) => o.status === "completed")) {
      setTimeout(() => {
        localStorage.removeItem("token");
        setOrders([]);
        toast.success("Dining completed 🍽️ Thank you!");
        navigate("/thank-you");
      }, 3000);
    }
  }, [orders, navigate]);

  const grandSubtotal = orders.reduce((sum, o) => sum + getOrderSubtotal(o), 0);
  const grandDiscount = orders.reduce((sum, o) => sum + getOrderDiscount(o), 0);
  const grandTotal = orders.reduce((sum, o) => sum + getOrderFinalTotal(o), 0);

  const totalItems = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0),
    0,
  );

  const totalBatches = orders.length;

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#f5f0e8]">
        <div className="w-12 h-12 border-4 rounded-full border-amber-500 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-[#7b5b42]">
          Loading your order…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#f5f0e8] pb-16 text-[#241309]">
      <div className="pointer-events-none fixed inset-0 opacity-[0.12] bg-[linear-gradient(rgba(65,35,14,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(65,35,14,0.06)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="fixed rounded-full pointer-events-none -left-24 top-10 h-72 w-72 bg-amber-200/30 blur-3xl" />
      <div className="fixed rounded-full pointer-events-none -right-24 bottom-20 h-80 w-80 bg-orange-200/25 blur-3xl" />

      <div className="relative max-w-5xl px-4 pt-8 mx-auto sm:px-6">
        <div className="rounded-[2rem] border border-amber-100/70 bg-[#fffaf1]/80 px-5 py-7 text-center shadow-[0_24px_70px_rgba(61,36,18,0.10)] backdrop-blur-xl sm:px-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/60 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-amber-800 shadow-sm">
            <Sparkles size={14} />
            Live Order Tracking
          </div>

          <h1
            className="text-4xl font-black leading-[0.95] tracking-[-0.05em] text-[#241309] sm:text-5xl"
            style={{
              fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif",
            }}
          >
            My
            <span className="block bg-gradient-to-r from-[#7b3817] via-[#d2954f] to-[#35190a] bg-clip-text text-transparent">
              Orders
            </span>
          </h1>

          <Divider />

          <p className="mx-auto max-w-md text-sm leading-6 text-[#7b5b42]">
            Track every batch from pending to preparation and served — live from
            The White House Café kitchen.
          </p>

          <button
            onClick={() => navigate("/order")}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-5 py-2.5 text-sm font-black text-amber-800 shadow-sm transition hover:-translate-y-1 hover:bg-amber-50"
          >
            <ArrowLeft size={16} />
            Back to Menu
          </button>
        </div>

        {!token && (
          <div className="mt-8 rounded-[2rem] border border-amber-100/70 bg-white/80 p-10 text-center shadow-xl backdrop-blur-xl">
            <p className="mb-4 text-sm text-gray-500">
              No session found. Please scan QR.
            </p>

            <button
              onClick={() => navigate("/scan")}
              className="px-6 py-3 text-sm font-black text-white transition rounded-full shadow-lg bg-amber-600 hover:bg-amber-700"
            >
              Scan QR
            </button>
          </div>
        )}

        {token && orders.length === 0 && (
          <div className="mt-8 rounded-[2rem] border border-amber-100/70 bg-white/80 p-12 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-amber-50 text-4xl shadow-inner">
              🍽️
            </div>

            <h2
              className="mt-5 text-3xl font-black text-[#241309]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              No active orders yet
            </h2>

            <p className="max-w-sm mx-auto mt-3 text-sm leading-6 text-gray-500">
              Choose something delicious from the menu and your order will
              appear here.
            </p>

            <button
              onClick={() => navigate("/order")}
              className="py-3 text-sm font-black text-white transition rounded-full shadow-lg mt-7 bg-amber-600 px-7 hover:-translate-y-1 hover:bg-amber-700 active:scale-95"
            >
              Go to Menu
            </button>
          </div>
        )}

        {token && orders.length > 0 && (
          <div className="mt-8 space-y-5">
            {orders.map((order, index) => {
              const safeStatus = order.status || "pending";
              const batchSubtotal = getOrderSubtotal(order);
              const batchDiscount = getOrderDiscount(order);
              const batchTotal = getOrderFinalTotal(order);
              const paymentStatus = getPaymentStatus(order);
              const paymentMode = getPaymentMode(order);

              const time = new Date(order.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              const orderId = "#WHC-" + order._id.slice(-5).toUpperCase();

              return (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-[2rem] border border-amber-100/70 bg-white shadow-[0_14px_40px_rgba(59,33,24,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(180,83,9,0.13)]"
                >
                  <div className="bg-gradient-to-br from-[#3d2412] to-[#7b3817] px-5 py-5 text-white">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-[#3d2412]">
                            Batch {index + 1}
                          </span>

                          <span className="text-xs font-bold text-amber-100/70">
                            {orderId}
                          </span>

                          {order.coupon?.code && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-black rounded-full bg-emerald-100 text-emerald-800">
                              <TicketPercent size={13} />
                              {order.coupon.code}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/60">
                          Table {table || "…"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-100/80">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={14} />
                          Today, {time}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
                            paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 divide-y divide-amber-100/70">
                    {order.items.map((item, i) => {
                      const image = getImage(item);

                      return (
                        <div key={i} className="flex items-center gap-3 py-4">
                          <div className="flex items-center justify-center w-16 h-16 overflow-hidden shadow-inner shrink-0 rounded-2xl bg-amber-50">
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
                              <span className="text-2xl">🍽</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className="truncate text-sm font-black text-[#241309]"
                              style={{ fontFamily: "Georgia, serif" }}
                            >
                              {item.name}
                            </p>

                            <div className="flex items-center gap-2 mt-1">
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">
                                Qty × {item.qty}
                              </span>

                              {item.note && (
                                <span className="truncate text-[11px] italic text-gray-400">
                                  “{item.note}”
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="shrink-0 text-sm font-black text-[#241309]">
                            ₹{item.price * item.qty}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-amber-100 bg-[#fffaf1] px-4 py-4">
                    {order.coupon?.code && batchDiscount > 0 && (
                      <div className="px-4 py-3 mb-3 border rounded-2xl border-emerald-100 bg-emerald-50">
                        <div className="flex items-center justify-between gap-3 text-xs font-black text-emerald-700">
                          <span>Coupon Applied: {order.coupon.code}</span>
                          <span>-₹{Math.round(batchDiscount)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                          <span>Subtotal ₹{Math.round(batchSubtotal)}</span>
                          <span>Final ₹{Math.round(batchTotal)}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[#241309]">
                        Batch Total
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedBill({
                            orders: [order],
                            title: `Batch ${index + 1}`,
                          })
                        }
                        className="rounded-2xl border border-amber-200 bg-white px-4 py-2 text-xl font-black shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-50"
                        style={{
                          fontFamily: "Georgia, serif",
                          color: "#b45309",
                        }}
                      >
                        ₹{Math.round(batchTotal)}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-bold">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[#7b5b42]">
                        {paymentMode === "Online" ? (
                          <CreditCard size={14} />
                        ) : (
                          <Wallet size={14} />
                        )}
                        {paymentMode}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 ${
                          paymentStatus === "Paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {paymentStatus}
                      </span>
                    </div>

                    <StatusBanner status={safeStatus} />
                  </div>
                </div>
              );
            })}

            <div className="relative overflow-hidden rounded-[2rem] border border-amber-100 bg-white p-5 shadow-[0_14px_40px_rgba(59,33,24,0.08)]">
              <div className="pointer-events-none absolute -right-3 bottom-0 text-[90px] opacity-10">
                🍽
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-2xl bg-amber-50/80">
                  <div className="flex items-center gap-2 mb-1 text-amber-700">
                    <ShoppingBag size={15} />
                    <span className="text-xs font-bold text-gray-500">
                      Total Batches
                    </span>
                  </div>
                  <p className="text-3xl font-black text-[#241309]">
                    {totalBatches}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/80">
                  <div className="flex items-center gap-2 mb-1 text-amber-700">
                    <Utensils size={15} />
                    <span className="text-xs font-bold text-gray-500">
                      Items Ordered
                    </span>
                  </div>
                  <p className="text-3xl font-black text-[#241309]">
                    {totalItems}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#3d2412] p-4 text-white">
                  <div className="flex items-center gap-2 mb-1 text-amber-200">
                    <ReceiptText size={15} />
                    <span className="text-xs font-bold text-amber-100/70">
                      Grand Total
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedBill({
                        orders,
                        title: "Full Bill",
                      })
                    }
                    className="text-3xl font-black text-left transition text-amber-100 hover:scale-105"
                  >
                    ₹{Math.round(grandTotal)}
                  </button>

                  {grandDiscount > 0 && (
                    <p className="mt-1 text-xs font-bold text-emerald-200">
                      Saved ₹{Math.round(grandDiscount)} on ₹
                      {Math.round(grandSubtotal)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <p className="flex items-center justify-center gap-1.5 pt-2 pb-4 text-xs font-medium text-gray-500">
              <span className="text-amber-500">🤍</span>
              Thank you for dining with us!
            </p>
          </div>
        )}
      </div>

      {selectedBill && (
        <CustomerBillMiniBox
          data={selectedBill}
          table={table}
          getImage={getImage}
          onClose={() => setSelectedBill(null)}
          getOrderSubtotal={getOrderSubtotal}
          getOrderDiscount={getOrderDiscount}
          getOrderFinalTotal={getOrderFinalTotal}
          getPaymentMode={getPaymentMode}
          getPaymentStatus={getPaymentStatus}
        />
      )}
    </div>
  );
}

function CustomerBillMiniBox({
  data,
  table,
  getImage,
  onClose,
  getOrderSubtotal,
  getOrderDiscount,
  getOrderFinalTotal,
  getPaymentMode,
  getPaymentStatus,
}) {
  const orders = data.orders || [];

  const subtotal = orders.reduce((sum, o) => sum + getOrderSubtotal(o), 0);
  const discount = orders.reduce((sum, o) => sum + getOrderDiscount(o), 0);
  const finalTotal = orders.reduce((sum, o) => sum + getOrderFinalTotal(o), 0);

  const paymentStatus = orders.some((o) => getPaymentStatus(o) === "Due")
    ? "Due"
    : "Paid";

  const paymentMode = orders.some((o) => getPaymentMode(o) === "Online")
    ? "Online"
    : "Pay at Counter";

  const coupon = orders.find((o) => o.coupon?.code)?.coupon;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <div className="flex items-start justify-between gap-4 border-b border-amber-100 bg-[#fffaf1] px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              Bill Summary
            </p>

            <h2
              className="mt-1 text-2xl font-black tracking-tight text-[#241309]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {data.title}
            </h2>

            <p className="mt-1 text-xs font-semibold text-slate-400">
              Table {table || "—"} · {orders.length} batch
              {orders.length !== 1 ? "es" : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 transition bg-white rounded-full shadow-sm text-slate-500 hover:bg-red-50 hover:text-red-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto px-5 py-4">
          <div className="space-y-5">
            {orders.map((order, batchIndex) => (
              <div
                key={order._id || batchIndex}
                className="p-4 bg-white border shadow-sm rounded-3xl border-amber-100"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-black text-[#241309]">
                      Batch #{batchIndex + 1}
                    </h3>
                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                      {getPaymentMode(order)} · {getPaymentStatus(order)}
                    </p>
                  </div>

                  {order.coupon?.code && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                      <TicketPercent size={13} />
                      {order.coupon.code}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {(order.items || []).map((item, index) => {
                    const image = getImage(item);
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
                          <p className="truncate text-sm font-black text-[#241309]">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            ₹{Number(item.price || 0)} × {Number(item.qty || 1)}
                          </p>

                          {item.note && (
                            <p className="mt-1 truncate text-[11px] font-semibold text-amber-700">
                              Note: {item.note}
                            </p>
                          )}
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
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#241309]">
                Final Payable
              </span>

              <span className="text-3xl font-black tracking-tight text-emerald-700">
                ₹{Math.round(finalTotal)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 mt-4 text-xs font-black bg-white rounded-2xl">
            <span className="inline-flex items-center gap-2 text-[#7b5b42]">
              {paymentMode === "Online" ? (
                <CreditCard size={15} />
              ) : (
                <Wallet size={15} />
              )}
              {paymentMode}
            </span>

            <span
              className={`rounded-full px-3 py-1 ${
                paymentStatus === "Paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {paymentStatus}
            </span>
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

      <span className={discount ? "text-emerald-600" : "text-[#241309]"}>
        {value < 0 ? "-" : ""}₹{Math.abs(Number(value || 0))}
      </span>
    </div>
  );
}
