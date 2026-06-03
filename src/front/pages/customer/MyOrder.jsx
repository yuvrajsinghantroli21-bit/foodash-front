import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";
import socket from "../../../socket/socket";
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
  BadgeIndianRupee,
  Trash2,
  Loader2,
} from "lucide-react";

const money = (value) => Math.round(Number(value || 0)).toLocaleString("en-IN");

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Divider = () => (
  <div className="flex items-center justify-center my-4" style={{ height: 18 }}>
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
      <div className="px-4 py-3 mt-4 border rounded-2xl border-amber-200 bg-amber-50/90">
        <div className="flex items-center justify-center gap-2 text-sm font-black text-amber-800">
          <Timer size={16} />
          Pending
        </div>
        <p className="mt-1 text-xs font-semibold text-center text-amber-700/70">
          Your order has been received and is waiting for kitchen confirmation.
        </p>
      </div>
    );
  }

  if (safeStatus === "preparing") {
    return (
      <div className="px-4 py-3 mt-4 border border-orange-200 rounded-2xl bg-orange-50/90">
        <div className="flex items-center justify-center gap-2 text-sm font-black text-orange-700">
          <ChefHat size={16} />
          Preparing
        </div>
        <p className="mt-1 text-xs font-semibold text-center text-orange-600/70">
          The kitchen is preparing your food.
        </p>
      </div>
    );
  }

  if (safeStatus === "served") {
    return (
      <div className="px-4 py-3 mt-4 border rounded-2xl border-emerald-200 bg-emerald-50/90">
        <div className="flex items-center justify-center gap-2 text-sm font-black text-emerald-700">
          <CheckCircle2 size={16} />
          Served
        </div>
        <p className="mt-1 text-xs font-semibold text-center text-emerald-600/70">
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
  const [sessionBill, setSessionBill] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Prevent duplicate thank-you popup/toast/navigation when multiple socket events arrive.
  const completedRedirectStarted = useRef(false);
  const sessionExpiredHandled = useRef(false);

  const table = localStorage.getItem("table");
  const token = localStorage.getItem("token");

  const getImage = (item) => {
    const directImage = item?.image;

    if (directImage) {
      if (directImage.startsWith("http")) return directImage;
      return `${import.meta.env.VITE_BACKEND_URL}/uploads/${directImage}`;
    }

    const found = menu.find(
      (m) => m.name?.toLowerCase() === item.name?.toLowerCase(),
    );

    if (!found?.image) return null;
    if (found.image.startsWith("http")) return found.image;

    return `${import.meta.env.VITE_BACKEND_URL}/uploads/${found.image}`;
  };

  const getOrderSubtotal = (order) =>
    Number(
      (order?.items || []).reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
        0,
      ),
    );

  const getOrderTotal = (order) =>
    Number(order?.total || getOrderSubtotal(order));

  const getPaymentModeText = (mode) => {
    const clean = String(mode || "counter").toLowerCase();
    if (["online", "razorpay", "upi", "card"].includes(clean)) return "Online";
    return "Pay at Counter";
  };

  const getPaymentStatusText = (status) => {
    const clean = String(status || "due").toLowerCase();
    return clean === "paid" ? "Paid" : "Due";
  };

  const fetchSessionBill = () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);

    api
      .get(`/session/${token}/bill`)
      .then((res) => {
        const sorted = (
          Array.isArray(res.data.orders) ? res.data.orders : []
        ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        setOrders(sorted);
        setSessionBill(res.data.bill || null);

        if (res.data.bill?.coupon?.code) {
          setCouponCode(res.data.bill.coupon.code);
        }
      })
      .catch(() => {
        setOrders([]);
        setSessionBill(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    api
      .get("/menu")
      .then((res) => setMenu(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSessionBill();

    const handleUpdate = (updatedOrder) => {
      const isSameSession =
        updatedOrder?.token === token || updatedOrder?.sessionId === token;

      if (!isSameSession) return;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order,
        ),
      );

      if (updatedOrder?.status === "served") {
        toast.success("One batch is served! 🍽️");
      }
    };

    const handleTableUpdate = () => {
      fetchSessionBill();
    };

    const handleSessionExpired = (data) => {
      if (data?.token !== token) return;
      if (sessionExpiredHandled.current) return;

      sessionExpiredHandled.current = true;
      completedRedirectStarted.current = true;

      toast.success("Session expired. Thank you! 🙏");
      localStorage.removeItem("token");
      localStorage.removeItem("table");

      setTimeout(() => navigate("/thank-you"), 1200);
    };

    socket.on("orderUpdated", handleUpdate);
    socket.on("order-updated", handleUpdate);

    // only bill/payment/table updates should refetch bill
    socket.on("tables-current-updated", handleTableUpdate);

    socket.on("session-expired", handleSessionExpired);

    return () => {
      socket.off("orderUpdated", handleUpdate);
      socket.off("order-updated", handleUpdate);
      socket.off("tables-current-updated", handleTableUpdate);
      socket.off("session-expired", handleSessionExpired);
    };
  }, [token, navigate]);

  useEffect(() => {
    if (completedRedirectStarted.current) return;

    const allCompleted =
      orders.length > 0 && orders.every((o) => o.status === "completed");

    if (!allCompleted) return;

    completedRedirectStarted.current = true;

    const timer = setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("table");
      setOrders([]);
      toast.success("Dining completed 🍽️ Thank you!");
      navigate("/thank-you");
    }, 3000);

    return () => clearTimeout(timer);
  }, [orders, navigate]);

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      toast.error("Enter coupon code");
      return;
    }

    setCouponLoading(true);

    api
      .post(`/session/${token}/apply-coupon`, { code })
      .then((res) => {
        setSessionBill(res.data.bill);
        setCouponCode(res.data.bill?.coupon?.code || code);
        toast.success(res.data.message || "Coupon applied successfully");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Coupon not applied");
      })
      .finally(() => {
        setCouponLoading(false);
      });
  };

  const removeCoupon = () => {
    setCouponLoading(true);

    api
      .delete(`/session/${token}/remove-coupon`)
      .then((res) => {
        setSessionBill(res.data.bill);
        setCouponCode("");
        toast.success("Coupon removed");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to remove coupon");
      })
      .finally(() => {
        setCouponLoading(false);
      });
  };

  const markPayAtCounter = () => {
    setPaymentLoading(true);

    api
      .put(`/session/${token}/payment`, {
        paymentMode: "counter",
        paymentStatus: "due",
      })
      .then(() => {
        setSessionBill((prev) => ({
          ...(prev || {}),
          paymentMode: "counter",
          paymentStatus: "due",
        }));

        toast.success("Payment selected: Pay at Counter");
      })
      .catch(() => {
        toast.error("Failed to update payment");
      })
      .finally(() => {
        setPaymentLoading(false);
      });
  };

  const payOnline = () => {
    if (!token) {
      toast.error("Session not found");
      return;
    }

    if (paymentStatus === "Paid") {
      toast.success("Payment is already completed");
      return;
    }

    setPaymentLoading(true);

    loadRazorpayScript()
      .then((loaded) => {
        if (!loaded) {
          toast.error("Razorpay failed to load. Please check your internet.");
          setPaymentLoading(false);
          return null;
        }

        return api.post(`/session/${token}/create-payment`);
      })
      .then((res) => {
        if (!res) return;

        const data = res.data;

        const options = {
          key: data.keyId,
          amount: Math.round(Number(data.amount || 0) * 100),
          currency: data.currency || "INR",
          name: data.restaurantName || "FoodDash",
          description: "Table Order Payment",
          order_id: data.razorpayOrderId,

          config: {
            display: {
              blocks: {
                upi: {
                  name: "Pay using UPI",
                  instruments: [
                    {
                      method: "upi",
                    },
                  ],
                },
              },

              sequence: ["block.upi"],

              preferences: {
                show_default_blocks: true,
              },
            },
          },

          handler: function (response) {
            api
              .post(`/session/${token}/verify-payment`, response)
              .then(() => {
                toast.success("Payment successful ✅");

                setSessionBill((prev) => ({
                  ...(prev || {}),
                  paymentMode: "online",
                  paymentStatus: "paid",
                }));

                fetchSessionBill();
              })
              .catch((err) => {
                toast.error(
                  err.response?.data?.message || "Payment verification failed",
                );
              });
          },

          modal: {
            ondismiss: function () {
              toast.error("Payment cancelled");
            },
          },

          theme: {
            color: "#3d2412",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Payment failed");
      })
      .finally(() => {
        setPaymentLoading(false);
      });
  };

  const subtotal =
    sessionBill?.subtotal ??
    orders.reduce((sum, order) => sum + getOrderTotal(order), 0);

  const discountAmount = Number(sessionBill?.discountAmount || 0);

  const finalTotal =
    sessionBill?.finalTotal !== undefined && sessionBill?.finalTotal !== null
      ? Number(sessionBill.finalTotal)
      : Math.max(0, subtotal - discountAmount);

  const activeCoupon = sessionBill?.coupon || null;

  const paymentMode = getPaymentModeText(sessionBill?.paymentMode);
  const paymentStatus = getPaymentStatusText(sessionBill?.paymentStatus);

  const totalItems = orders.reduce(
    (sum, o) =>
      sum + (o.items || []).reduce((s, i) => s + Number(i.qty || 1), 0),
    0,
  );

  const totalBatches = orders.length;

  if (loading) {
    return (
      <div
        className="flex h-screen flex-col items-center justify-center gap-4 bg-[#f5f0e8]"
        style={{ fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif" }}
      >
        <div className="w-12 h-12 border-4 rounded-full animate-spin border-amber-500 border-t-transparent" />
        <p className="text-sm font-black tracking-wide text-[#7b5b42]">
          Loading your order…
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen overflow-hidden bg-[#f5f0e8] pb-16 text-[#241309]"
      style={{ fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif" }}
    >
      <div className="pointer-events-none fixed inset-0 opacity-[0.12] bg-[linear-gradient(rgba(65,35,14,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(65,35,14,0.06)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="fixed rounded-full pointer-events-none -left-24 top-10 h-72 w-72 bg-amber-200/30 blur-3xl" />
      <div className="fixed rounded-full pointer-events-none -right-24 bottom-20 h-80 w-80 bg-orange-200/25 blur-3xl" />

      <div className="relative max-w-5xl px-4 pt-8 mx-auto sm:px-6">
        <div className="rounded-[2rem] border border-amber-100/70 bg-[#fffaf1]/85 px-5 py-7 text-center shadow-[0_24px_70px_rgba(61,36,18,0.10)] backdrop-blur-xl sm:px-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-amber-800 shadow-sm">
            <Sparkles size={14} />
            Live Table Bill
          </div>

          <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.06em] text-[#241309] sm:text-5xl">
            My
            <span className="block bg-gradient-to-r from-[#7b3817] via-[#d2954f] to-[#35190a] bg-clip-text text-transparent">
              Order
            </span>
          </h1>

          <Divider />

          <p className="mx-auto max-w-md text-sm font-medium leading-6 text-[#7b5b42]">
            Track your batches, apply coupon on the full table bill, and choose
            your payment option.
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
          <div className="mt-8 rounded-[2rem] border border-amber-100/70 bg-white/85 p-10 text-center shadow-xl backdrop-blur-xl">
            <p className="mb-4 text-sm font-semibold text-gray-500">
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
          <div className="mt-8 rounded-[2rem] border border-amber-100/70 bg-white/85 p-12 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-amber-50 text-4xl shadow-inner">
              🍽️
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-[#241309]">
              No active orders yet
            </h2>

            <p className="max-w-sm mx-auto mt-3 text-sm font-medium leading-6 text-gray-500">
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
              const batchTotal = getOrderTotal(order);

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
                        </div>

                        <p className="mt-2 text-xs font-black uppercase tracking-[0.22em] text-amber-100/60">
                          Table {table || "…"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-100/80">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={14} />
                          Today, {time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 divide-y divide-amber-100/70">
                    {(order.items || []).map((item, i) => {
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
                            <p className="truncate text-sm font-black tracking-tight text-[#241309]">
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
                            ₹
                            {money(
                              Number(item.price || 0) * Number(item.qty || 1),
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-amber-100 bg-[#fffaf1] px-4 py-4">
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
                            mode: "batch",
                          })
                        }
                        className="rounded-2xl border border-amber-200 bg-white px-4 py-2 text-xl font-black text-[#b45309] shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-50"
                      >
                        ₹{money(batchTotal)}
                      </button>
                    </div>

                    <StatusBanner status={safeStatus} />
                  </div>
                </div>
              );
            })}

            <SessionBillCard
              subtotal={subtotal}
              discountAmount={discountAmount}
              finalTotal={finalTotal}
              activeCoupon={activeCoupon}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              applyCoupon={applyCoupon}
              removeCoupon={removeCoupon}
              couponLoading={couponLoading}
              paymentMode={paymentMode}
              paymentStatus={paymentStatus}
              paymentLoading={paymentLoading}
              markPayAtCounter={markPayAtCounter}
              payOnline={payOnline}
              totalBatches={totalBatches}
              totalItems={totalItems}
              onOpenBill={() =>
                setSelectedBill({
                  orders,
                  title: "Full Table Bill",
                  mode: "full",
                  bill: sessionBill,
                })
              }
            />

            <p className="flex items-center justify-center gap-1.5 pt-2 pb-4 text-xs font-semibold text-gray-500">
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
          getOrderTotal={getOrderTotal}
          sessionBill={sessionBill}
          paymentMode={paymentMode}
          paymentStatus={paymentStatus}
        />
      )}
    </div>
  );
}

function SessionBillCard({
  subtotal,
  discountAmount,
  finalTotal,
  activeCoupon,
  couponCode,
  setCouponCode,
  applyCoupon,
  removeCoupon,
  couponLoading,
  paymentMode,
  paymentStatus,
  paymentLoading,
  markPayAtCounter,
  payOnline,
  totalBatches,
  totalItems,
  onOpenBill,
}) {
  return (
    <div className="relative overflow-hidden rounded-[2.2rem] border border-amber-100 bg-white p-5 shadow-[0_18px_55px_rgba(59,33,24,0.10)]">
      <div className="pointer-events-none absolute -right-3 bottom-0 text-[110px] opacity-10">
        🍽
      </div>

      <div className="relative z-10">
        <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              <ReceiptText size={14} />
              Table Bill
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#241309]">
              Full Bill Summary
            </h2>

            <p className="mt-1 text-sm font-semibold text-[#7b5b42]">
              Coupon and payment apply on the full table bill.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenBill}
            className="rounded-2xl bg-[#3d2412] px-5 py-3 text-sm font-black text-amber-100 shadow-lg transition hover:-translate-y-1 hover:bg-[#2c190d]"
          >
            View Full Bill
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SmallStat
            icon={<ShoppingBag size={15} />}
            label="Total Batches"
            value={totalBatches}
          />

          <SmallStat
            icon={<Utensils size={15} />}
            label="Items Ordered"
            value={totalItems}
          />

          <button
            type="button"
            onClick={onOpenBill}
            className="rounded-2xl bg-[#3d2412] p-4 text-left text-white transition hover:-translate-y-1"
          >
            <div className="flex items-center gap-2 mb-1 text-amber-200">
              <BadgeIndianRupee size={16} />
              <span className="text-xs font-bold text-amber-100/70">
                Final Payable
              </span>
            </div>

            <p className="text-3xl font-black tracking-tight text-amber-100">
              ₹{money(finalTotal)}
            </p>

            {discountAmount > 0 && (
              <p className="mt-1 text-xs font-bold text-emerald-200">
                Saved ₹{money(discountAmount)} on ₹{money(subtotal)}
              </p>
            )}
          </button>
        </div>

        <div className="mt-5 rounded-[1.7rem] border border-amber-100 bg-[#fffaf1] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#241309]">
            <TicketPercent size={17} className="text-amber-700" />
            Apply Coupon
          </div>

          {activeCoupon?.code ? (
            <div className="p-4 border rounded-2xl border-emerald-100 bg-emerald-50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                    Coupon Applied
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-emerald-800">
                    {activeCoupon.code}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Discount: ₹{money(discountAmount)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={removeCoupon}
                  disabled={couponLoading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-black text-red-500 transition bg-white shadow-sm rounded-2xl hover:bg-red-50 disabled:opacity-60"
                >
                  {couponLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="h-12 rounded-2xl border border-amber-200 bg-white px-4 text-sm font-black uppercase tracking-[0.12em] text-[#241309] outline-none transition placeholder:text-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />

              <button
                type="button"
                onClick={applyCoupon}
                disabled={couponLoading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-amber-600 px-6 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-700 disabled:opacity-60"
              >
                {couponLoading && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Apply
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 rounded-[1.7rem] border border-amber-100 bg-white p-4">
          <PriceRow label="Subtotal" value={subtotal} />

          {discountAmount > 0 && (
            <PriceRow
              label="Coupon Discount"
              value={-discountAmount}
              discount
            />
          )}

          <div className="my-3 border-t border-dashed border-slate-200" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-black uppercase tracking-[0.14em] text-[#241309]">
              Final Payable
            </span>

            <span className="text-3xl font-black tracking-tight text-emerald-700">
              ₹{money(finalTotal)}
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-[1.7rem] border border-amber-100 bg-[#fffaf1] p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-black text-[#241309]">Payment</p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {paymentMode} · {paymentStatus}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                paymentStatus === "Paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {paymentStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={payOnline}
              disabled={paymentLoading || paymentStatus === "Paid"}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paymentLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <CreditCard size={17} />
              )}
              {paymentStatus === "Paid" ? "Already Paid" : "Pay Online"}
            </button>

            <button
              type="button"
              onClick={markPayAtCounter}
              disabled={paymentLoading || paymentStatus === "Paid"}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#3d2412] px-5 text-sm font-black text-amber-100 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#2c190d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paymentLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Wallet size={17} />
              )}
              {paymentStatus === "Paid" ? "Payment Done" : "Pay at Counter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmallStat({ icon, label, value }) {
  return (
    <div className="p-4 rounded-2xl bg-amber-50/80">
      <div className="flex items-center gap-2 mb-1 text-amber-700">
        {icon}
        <span className="text-xs font-bold text-gray-500">{label}</span>
      </div>

      <p className="text-3xl font-black tracking-tight text-[#241309]">
        {value}
      </p>
    </div>
  );
}

function CustomerBillMiniBox({
  data,
  table,
  getImage,
  onClose,
  getOrderSubtotal,
  getOrderTotal,
  sessionBill,
  paymentMode,
  paymentStatus,
}) {
  const orders = data.orders || [];

  const isFullBill = data.mode === "full";

  const subtotal = isFullBill
    ? Number(sessionBill?.subtotal || 0)
    : orders.reduce((sum, o) => sum + getOrderSubtotal(o), 0);

  const discount = isFullBill ? Number(sessionBill?.discountAmount || 0) : 0;

  const finalTotal = isFullBill
    ? Number(sessionBill?.finalTotal || subtotal)
    : orders.reduce((sum, o) => sum + getOrderTotal(o), 0);

  const coupon = isFullBill ? sessionBill?.coupon : null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <div className="flex items-start justify-between gap-4 border-b border-amber-100 bg-[#fffaf1] px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              Bill Summary
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#241309]">
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
                      Batch Total ₹{money(getOrderTotal(order))}
                    </p>
                  </div>
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
                          ₹{money(itemTotal)}
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

            {coupon?.code && discount > 0 && (
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
                ₹{money(finalTotal)}
              </span>
            </div>
          </div>

          {isFullBill && (
            <div className="px-4 py-3 mt-4 bg-white rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-black">
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

              {sessionBill?.razorpayPaymentId && (
                <p className="mt-2 text-[11px] font-bold text-slate-400 break-all">
                  Payment ID: {sessionBill.razorpayPaymentId}
                </p>
              )}

              {sessionBill?.razorpayOrderId && (
                <p className="mt-1 text-[11px] font-bold text-slate-400 break-all">
                  Order ID: {sessionBill.razorpayOrderId}
                </p>
              )}
            </div>
          )}
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
        {value < 0 ? "-" : ""}₹{money(Math.abs(Number(value || 0)))}
      </span>
    </div>
  );
}
