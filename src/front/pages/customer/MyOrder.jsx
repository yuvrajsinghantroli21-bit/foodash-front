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
  IndianRupee,
  Smartphone,
  ShieldCheck,
  BellRing,
  LockKeyhole,
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
  const [checkoutMeta, setCheckoutMeta] = useState(null);

  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);

  const [selectedBill, setSelectedBill] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const [assistanceLoading, setAssistanceLoading] = useState(false);
  const [assistanceRequested, setAssistanceRequested] = useState(false);
  const [assistanceInfo, setAssistanceInfo] = useState(null);

  const completedRedirectStarted = useRef(false);
  const sessionExpiredHandled = useRef(false);
  const billTokenRef = useRef("");
  const servedShownRef = useRef(new Set());

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
    Number(order?.total || order?.finalTotal || getOrderSubtotal(order));

  const getPaymentModeText = (mode) => {
    const clean = String(mode || "counter").toLowerCase();
    if (["online", "razorpay", "upi", "card"].includes(clean)) return "Online";
    if (["cash", "counter"].includes(clean)) return "Pay at Table";
    return "Pay at Table";
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

        const meta = {
          active: res.data.active,
          hasOrder: res.data.hasOrder,
          checkoutStatus: res.data.checkoutStatus || "open",
          checkoutPaymentMode: res.data.checkoutPaymentMode || null,
          checkoutRequestedAt: res.data.checkoutRequestedAt || null,
          billToken: res.data.billToken || "",
          customerPhone: res.data.customerPhone || "",
        };

        const phoneFromSession = res.data.customerPhone || "";
        setCustomerPhone(phoneFromSession);
        setPhoneSaved(Boolean(phoneFromSession));

        setCheckoutMeta(meta);

        if (meta.billToken) {
          billTokenRef.current = meta.billToken;
        }

        if (res.data.bill?.coupon?.code) {
          setCouponCode(res.data.bill.coupon.code);
        }
      })
      .catch(() => {
        setOrders([]);
        setSessionBill(null);
        setCheckoutMeta(null);
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

      if (
        updatedOrder?.status === "served" &&
        updatedOrder?._id &&
        !servedShownRef.current.has(updatedOrder._id)
      ) {
        servedShownRef.current.add(updatedOrder._id);
        toast.success("One batch is served! 🍽️");
      }
    };

    const handleTableUpdate = () => {
      fetchSessionBill();
    };

    const handlePaymentPaid = (data) => {
      if (data?.token !== token) return;

      if (data?.billToken) {
        billTokenRef.current = data.billToken;
      }

      toast.success("Payment received ✅ Your paid bill is ready.");
      fetchSessionBill();
    };

    const handleAssistanceCompleted = (data) => {
      if (data?.token !== token) return;

      setAssistanceRequested(false);
      setAssistanceInfo(null);
      toast.success("Assistance completed. Thank you for waiting 🤍");
    };

    const handleCustomerPhoneUpdated = (data) => {
      if (data?.token !== token) return;

      const phone = data?.customerPhone || "";
      setCustomerPhone(phone);
      setPhoneSaved(Boolean(phone));
    };

    const handleSessionExpired = (data) => {
      if (data?.token !== token) return;
      if (sessionExpiredHandled.current) return;

      sessionExpiredHandled.current = true;
      completedRedirectStarted.current = true;

      const finalBillToken =
        data?.billToken ||
        billTokenRef.current ||
        checkoutMeta?.billToken ||
        "";

      toast.success("Session completed. Thank you! 🙏");
      localStorage.removeItem("token");
      localStorage.removeItem("table");

      setTimeout(() => {
        navigate(
          finalBillToken ? `/thank-you?bill=${finalBillToken}` : "/thank-you",
        );
      }, 1200);
    };

    socket.on("orderUpdated", handleUpdate);
    socket.on("order-updated", handleUpdate);
    socket.on("tables-current-updated", handleTableUpdate);
    socket.on("payment-paid", handlePaymentPaid);
    socket.on("assistance-completed", handleAssistanceCompleted);
    socket.on("customer-phone-updated", handleCustomerPhoneUpdated);
    socket.on("session-expired", handleSessionExpired);

    return () => {
      socket.off("orderUpdated", handleUpdate);
      socket.off("order-updated", handleUpdate);
      socket.off("tables-current-updated", handleTableUpdate);
      socket.off("payment-paid", handlePaymentPaid);
      socket.off("assistance-completed", handleAssistanceCompleted);
      socket.off("customer-phone-updated", handleCustomerPhoneUpdated);
      socket.off("session-expired", handleSessionExpired);
    };
  }, [token, navigate, checkoutMeta?.billToken]);

  useEffect(() => {
    if (completedRedirectStarted.current) return;

    const allCompleted =
      orders.length > 0 && orders.every((o) => o.status === "completed");

    if (!allCompleted) return;

    completedRedirectStarted.current = true;

    const timer = setTimeout(() => {
      const finalBillToken =
        billTokenRef.current || checkoutMeta?.billToken || "";

      localStorage.removeItem("token");
      localStorage.removeItem("table");
      setOrders([]);
      toast.success("Dining completed 🍽️ Thank you!");

      navigate(
        finalBillToken ? `/thank-you?bill=${finalBillToken}` : "/thank-you",
      );
    }, 3000);

    return () => clearTimeout(timer);
  }, [orders, navigate, checkoutMeta?.billToken]);

  const saveCustomerPhone = () => {
    if (!token) {
      toast.error("Session not found. Please scan QR again.");
      return;
    }

    const cleanPhone = String(customerPhone || "").replace(/\D/g, "");

    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Please enter a valid WhatsApp number");
      return;
    }

    setPhoneSaving(true);

    api
      .put(`/session/${token}/customer-phone`, {
        phone: cleanPhone,
      })
      .then((res) => {
        const phone = res.data?.customerPhone || cleanPhone;

        setCustomerPhone(phone);
        setPhoneSaved(true);

        toast.success(
          "WhatsApp number saved. Your final bill can be sent after table completion.",
        );
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message || "Failed to save WhatsApp number",
        );
      })
      .finally(() => {
        setPhoneSaving(false);
      });
  };

  const requestAssistance = () => {
    if (!token) {
      toast.error("Session not found. Please scan QR again.");
      return;
    }

    if (assistanceRequested) {
      toast.success("Assistance is already on the way.");
      return;
    }

    setAssistanceLoading(true);

    api
      .post(`/session/${token}/assistance`, {
        table,
        message: "Customer requested assistance at the table.",
      })
      .then((res) => {
        const data = res.data || {};

        setAssistanceRequested(true);
        setAssistanceInfo({
          requestedAt: data.requestedAt || new Date().toISOString(),
          message:
            data.message ||
            "Assistance requested. A staff member will arrive shortly.",
        });

        toast.success("Assistance requested. Staff is on the way 🤍");
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message ||
            "Assistance request is not active yet. Backend will be connected next.",
        );
      })
      .finally(() => {
        setAssistanceLoading(false);
      });
  };

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

  const requestCheckout = () => {
    if (!token) {
      toast.error("Session not found");
      return;
    }

    setCheckoutLoading(true);

    api
      .post(`/session/${token}/request-checkout`)
      .then((res) => {
        const data = res.data;

        if (data?.billToken) {
          billTokenRef.current = data.billToken;
        }

        setCheckoutMeta((prev) => ({
          ...(prev || {}),
          checkoutStatus: data.checkoutStatus || "checkout_requested",
          checkoutPaymentMode: data.checkoutPaymentMode || null,
          billToken: data.billToken || prev?.billToken || "",
        }));

        if (data?.bill) {
          setSessionBill((prev) => ({
            ...(prev || {}),
            ...data.bill,
            paymentStatus: data.paymentStatus || prev?.paymentStatus || "due",
          }));
        }

        setCheckoutModalOpen(true);
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message || "Failed to request checkout",
        );
      })
      .finally(() => {
        setCheckoutLoading(false);
      });
  };

  const selectPaymentMethod = async (mode) => {
    const res = await api.put(`/session/${token}/select-payment-method`, {
      mode,
    });

    const data = res.data;

    if (data?.billToken) {
      billTokenRef.current = data.billToken;
    }

    setCheckoutMeta((prev) => ({
      ...(prev || {}),
      checkoutStatus: data.checkoutStatus || "checkout_requested",
      checkoutPaymentMode: data.checkoutPaymentMode || mode,
      billToken: data.billToken || prev?.billToken || "",
    }));

    setSessionBill((prev) => ({
      ...(prev || {}),
      ...(data.bill || {}),
      paymentMode: data.paymentMode || mode,
      paymentStatus: data.paymentStatus || "due",
    }));

    return data;
  };

  const choosePayAtTable = () => {
    if (paymentStatus === "Paid") {
      toast.success("Payment is already completed");
      return;
    }

    setPaymentLoading(true);

    selectPaymentMethod("cash")
      .then(() => {
        setCheckoutModalOpen(false);
        toast.success("Staff has been notified for payment collection.");
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message || "Failed to select cash payment",
        );
      })
      .finally(() => {
        setPaymentLoading(false);
      });
  };

  const payOnline = async () => {
    if (!token) {
      toast.error("Session not found");
      return;
    }

    if (paymentStatus === "Paid") {
      toast.success("Payment is already completed");
      return;
    }

    setPaymentLoading(true);

    try {
      await selectPaymentMethod("online");

      const loaded = await loadRazorpayScript();

      if (!loaded) {
        toast.error("Razorpay failed to load. Please check your internet.");
        return;
      }

      const res = await api.post(`/session/${token}/create-payment`);
      const data = res.data;

      const options = {
        key: data.keyId,
        amount: Math.round(Number(data.amount || 0) * 100),
        currency: data.currency || "INR",
        name: data.restaurantName || "Qzora",
        description: "Table Order Payment",
        order_id: data.razorpayOrderId,

        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay using UPI",
                instruments: [{ method: "upi" }],
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

              setCheckoutModalOpen(false);

              setSessionBill((prev) => ({
                ...(prev || {}),
                paymentMode: "online",
                paymentStatus: "paid",
              }));

              setCheckoutMeta((prev) => ({
                ...(prev || {}),
                checkoutStatus: "paid",
                checkoutPaymentMode: "online",
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
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  const subtotal =
    sessionBill?.subtotal ??
    orders.reduce((sum, order) => sum + getOrderTotal(order), 0);

  const discountAmount = Number(sessionBill?.discountAmount || 0);

  const charges = Array.isArray(sessionBill?.billChargesSnapshot)
    ? sessionBill.billChargesSnapshot
    : [];

  const chargesTotal = charges.reduce(
    (sum, charge) => sum + Number(charge.amount || 0),
    0,
  );

  const finalTotal =
    sessionBill?.finalTotal !== undefined && sessionBill?.finalTotal !== null
      ? Number(sessionBill.finalTotal)
      : Math.max(0, subtotal + chargesTotal - discountAmount);

  const activeCoupon = sessionBill?.coupon || null;

  const paymentMode = getPaymentModeText(sessionBill?.paymentMode);
  const paymentStatus = getPaymentStatusText(sessionBill?.paymentStatus);

  const checkoutStatus = checkoutMeta?.checkoutStatus || "open";
  const checkoutPaymentMode = checkoutMeta?.checkoutPaymentMode || null;
  const billToken = checkoutMeta?.billToken || billTokenRef.current || "";

  const checkoutStarted = ["checkout_requested", "paid", "completed"].includes(
    checkoutStatus,
  );

  const isPaid = paymentStatus === "Paid" || checkoutStatus === "paid";

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
            Track your batches, view your bill, and request checkout when you
            are ready to leave.
          </p>

          {checkoutStarted && (
            <div
              className={`mx-auto mt-5 max-w-xl rounded-[1.4rem] border px-4 py-3 text-left ${
                isPaid
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl ${
                    isPaid
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {isPaid ? (
                    <ShieldCheck size={18} />
                  ) : (
                    <LockKeyhole size={18} />
                  )}
                </div>

                <div>
                  <p
                    className={`text-sm font-black ${
                      isPaid ? "text-emerald-800" : "text-amber-800"
                    }`}
                  >
                    {isPaid
                      ? "Payment received. Your paid bill is ready."
                      : "Checkout mode is active."}
                  </p>

                  <p
                    className={`mt-1 text-xs font-semibold leading-5 ${
                      isPaid ? "text-emerald-700/75" : "text-amber-800/70"
                    }`}
                  >
                    {isPaid
                      ? "You can view or download your paid bill. Staff will complete your table shortly."
                      : checkoutPaymentMode === "cash"
                        ? "A staff member has been notified and will arrive at your table for payment collection."
                        : checkoutPaymentMode === "online"
                          ? "Online payment is selected. Please complete payment to close your bill."
                          : "New orders cannot be placed after checkout has started."}
                  </p>
                </div>
              </div>
            </div>
          )}

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
              charges={charges}
              chargesTotal={chargesTotal}
              finalTotal={finalTotal}
              activeCoupon={activeCoupon}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              applyCoupon={applyCoupon}
              removeCoupon={removeCoupon}
              couponLoading={couponLoading}
              customerPhone={customerPhone}
              setCustomerPhone={(value) => {
                setCustomerPhone(value);
                setPhoneSaved(false);
              }}
              phoneSaving={phoneSaving}
              phoneSaved={phoneSaved}
              saveCustomerPhone={saveCustomerPhone}
              paymentMode={paymentMode}
              paymentStatus={paymentStatus}
              paymentLoading={paymentLoading}
              checkoutLoading={checkoutLoading}
              checkoutStarted={checkoutStarted}
              checkoutPaymentMode={checkoutPaymentMode}
              isPaid={isPaid}
              requestCheckout={requestCheckout}
              payOnline={payOnline}
              choosePayAtTable={choosePayAtTable}
              totalBatches={totalBatches}
              totalItems={totalItems}
              billToken={billToken}
              assistanceLoading={assistanceLoading}
              assistanceRequested={assistanceRequested}
              assistanceInfo={assistanceInfo}
              requestAssistance={requestAssistance}
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

      {checkoutModalOpen && (
        <CheckoutModal
          finalTotal={finalTotal}
          paymentLoading={paymentLoading}
          onClose={() => setCheckoutModalOpen(false)}
          onPayOnline={payOnline}
          onPayAtTable={choosePayAtTable}
        />
      )}
    </div>
  );
}

function SessionBillCard({
  subtotal,
  discountAmount,
  charges = [],
  chargesTotal = 0,
  finalTotal,
  activeCoupon,
  couponCode,
  setCouponCode,
  applyCoupon,
  removeCoupon,
  couponLoading,
  customerPhone,
  setCustomerPhone,
  phoneSaving,
  phoneSaved,
  saveCustomerPhone,
  paymentMode,
  paymentStatus,
  paymentLoading,
  checkoutLoading,
  checkoutStarted,
  checkoutPaymentMode,
  isPaid,
  requestCheckout,
  payOnline,
  choosePayAtTable,
  totalBatches,
  totalItems,
  billToken,
  assistanceLoading,
  assistanceRequested,
  assistanceInfo,
  requestAssistance,
  onOpenBill,
}) {
  const couponLocked = checkoutStarted || isPaid;

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
              View your bill and request checkout when you are ready.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenBill}
            className="group inline-flex items-center justify-center gap-2 rounded-[1.3rem] border border-amber-200 bg-[#fffaf1] px-5 py-3 text-left text-sm font-black text-[#3d2412] shadow-[0_12px_28px_rgba(61,36,18,0.10)] transition hover:-translate-y-1 hover:bg-amber-50"
          >
            <ReceiptText size={17} className="text-amber-700" />
            <span>
              Click me to see
              <span className="block text-[11px] font-black uppercase tracking-[0.16em] text-amber-700">
                full bill summary
              </span>
            </span>
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
            className="group relative overflow-hidden rounded-2xl bg-[#3d2412] p-4 text-left text-white transition hover:-translate-y-1"
          >
            <div className="absolute w-24 h-24 transition rounded-full -right-8 -top-8 bg-amber-300/10 blur-2xl group-hover:bg-amber-300/20" />

            <div className="relative flex items-center gap-2 mb-1 text-amber-200">
              <BadgeIndianRupee size={16} />
              <span className="text-xs font-bold text-amber-100/70">
                Final Payable
              </span>
            </div>

            <p className="relative text-3xl font-black tracking-tight text-amber-100">
              ₹{money(finalTotal)}
            </p>

            <p className="relative mt-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-100">
              Click to view full bill
            </p>

            {discountAmount > 0 && (
              <p className="relative mt-2 text-xs font-bold text-emerald-200">
                Saved ₹{money(discountAmount)} on ₹{money(subtotal)}
              </p>
            )}
          </button>
        </div>

        <div className="mt-5 rounded-[1.7rem] border border-amber-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                  assistanceRequested
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {assistanceRequested ? (
                  <ShieldCheck size={20} />
                ) : (
                  <BellRing size={20} />
                )}
              </div>

              <div>
                <p className="text-sm font-black text-[#241309]">
                  {assistanceRequested
                    ? "Assistance is on the way"
                    : "Need help at your table?"}
                </p>

                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  {assistanceRequested
                    ? "Please stay seated. A staff member will arrive shortly."
                    : "Call staff for water, cutlery, payment help, or any quick request."}
                </p>

                {assistanceInfo?.requestedAt && (
                  <p className="mt-1 text-[11px] font-bold text-emerald-700">
                    Requested at{" "}
                    {new Date(assistanceInfo.requestedAt).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={requestAssistance}
              disabled={assistanceLoading || assistanceRequested}
              className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${
                assistanceRequested
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-[#3d2412] text-amber-100"
              }`}
            >
              {assistanceLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : assistanceRequested ? (
                <ShieldCheck size={17} />
              ) : (
                <BellRing size={17} />
              )}
              {assistanceRequested ? "Staff Notified" : "Call Assistance"}
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-[1.7rem] border border-amber-100 bg-[#fffaf1] p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm font-black text-[#241309]">
              <TicketPercent size={17} className="text-amber-700" />
              Apply Coupon
            </div>

            {couponLocked && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                Locked
              </span>
            )}
          </div>

          {couponLocked && (
            <p className="mb-3 text-xs font-semibold text-slate-500">
              Coupon cannot be changed after checkout has started.
            </p>
          )}

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
                  disabled={couponLoading || couponLocked}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-black text-red-500 transition bg-white shadow-sm rounded-2xl hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                disabled={couponLocked}
                className="h-12 rounded-2xl border border-amber-200 bg-white px-4 text-sm font-black uppercase tracking-[0.12em] text-[#241309] outline-none transition placeholder:text-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              />

              <button
                type="button"
                onClick={applyCoupon}
                disabled={couponLoading || couponLocked}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-amber-600 px-6 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {couponLoading && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Apply
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 rounded-[1.7rem] border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center bg-white shadow-sm h-11 w-11 shrink-0 rounded-2xl text-emerald-700">
                <Smartphone size={20} />
              </div>

              <div>
                <p className="text-sm font-black text-[#241309]">
                  Get your bill on WhatsApp
                </p>

                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  Share your WhatsApp number and your final bill can be sent
                  after the table is completed.
                </p>

                {phoneSaved && (
                  <p className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-black text-emerald-700">
                    Number saved. You’ll receive the final bill on WhatsApp
                    after completion.
                  </p>
                )}
              </div>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-[1fr_auto] lg:max-w-md">
              <input
                type="tel"
                inputMode="numeric"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter WhatsApp number"
                className="h-12 rounded-2xl border border-emerald-100 bg-white px-4 text-sm font-black text-[#241309] outline-none transition placeholder:font-semibold placeholder:text-slate-300 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
              />

              <button
                type="button"
                onClick={saveCustomerPhone}
                disabled={phoneSaving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {phoneSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ShieldCheck size={16} />
                )}
                {phoneSaved ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[1.7rem] border border-amber-100 bg-white p-4">
          <PriceRow label="Subtotal" value={subtotal} />

          {charges.map((charge, index) => (
            <PriceRow
              key={`${charge.name || "charge"}-${index}`}
              label={charge.name || "Charge"}
              value={Number(charge.amount || 0)}
            />
          ))}

          {charges.length > 0 && (
            <PriceRow label="Total Charges" value={chargesTotal} />
          )}

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

        <div className="mt-5 rounded-[1.7rem] border border-amber-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                  assistanceRequested
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {assistanceRequested ? (
                  <ShieldCheck size={20} />
                ) : (
                  <BellRing size={20} />
                )}
              </div>

              <div>
                <p className="text-sm font-black text-[#241309]">
                  {assistanceRequested
                    ? "Assistance is on the way"
                    : "Need help at your table?"}
                </p>

                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  {assistanceRequested
                    ? "Please stay seated. A staff member will arrive shortly."
                    : "Call staff for water, cutlery, payment help, or any quick request."}
                </p>

                {assistanceInfo?.requestedAt && (
                  <p className="mt-1 text-[11px] font-bold text-emerald-700">
                    Requested at{" "}
                    {new Date(assistanceInfo.requestedAt).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={requestAssistance}
              disabled={assistanceLoading || assistanceRequested}
              className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${
                assistanceRequested
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-[#3d2412] text-amber-100"
              }`}
            >
              {assistanceLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : assistanceRequested ? (
                <ShieldCheck size={17} />
              ) : (
                <BellRing size={17} />
              )}
              {assistanceRequested ? "Staff Notified" : "Call Assistance"}
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-[1.7rem] border border-amber-100 bg-[#fffaf1] p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-black text-[#241309]">Checkout</p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {paymentMode} · {paymentStatus}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                isPaid
                  ? "bg-emerald-100 text-emerald-700"
                  : checkoutStarted
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-600"
              }`}
            >
              {isPaid ? "Paid" : checkoutStarted ? "Checkout" : "Due"}
            </span>
          </div>

          {!checkoutStarted && (
            <button
              type="button"
              onClick={requestCheckout}
              disabled={checkoutLoading}
              className="inline-flex h-13 min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#3d2412] px-5 text-sm font-black text-amber-100 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#2c190d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkoutLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <ReceiptText size={17} />
              )}
              Request Checkout
            </button>
          )}

          {checkoutStarted && !isPaid && (
            <div className="space-y-3">
              <div className="px-4 py-3 bg-white border rounded-2xl border-amber-100">
                <p className="flex items-center gap-2 text-sm font-black text-amber-800">
                  <BellRing size={16} />
                  {checkoutPaymentMode === "cash"
                    ? "Staff has been notified."
                    : checkoutPaymentMode === "online"
                      ? "Online payment selected."
                      : "Checkout requested."}
                </p>

                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  {checkoutPaymentMode === "cash"
                    ? "Please remain seated. A staff member will arrive at your table for payment collection."
                    : checkoutPaymentMode === "online"
                      ? "Complete your online payment using UPI, cards, wallets, or net banking."
                      : "Choose a payment method to continue."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={payOnline}
                  disabled={paymentLoading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paymentLoading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <CreditCard size={17} />
                  )}
                  {checkoutPaymentMode === "online"
                    ? "Pay Online Now"
                    : "Change to Online"}
                </button>

                <button
                  type="button"
                  onClick={choosePayAtTable}
                  disabled={paymentLoading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#3d2412] px-5 text-sm font-black text-amber-100 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#2c190d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paymentLoading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Wallet size={17} />
                  )}
                  {checkoutPaymentMode === "cash"
                    ? "Pay at Table Selected"
                    : "Change to Pay at Table"}
                </button>
              </div>
            </div>
          )}

          {isPaid && (
            <div className="px-4 py-4 border rounded-2xl border-emerald-100 bg-emerald-50">
              <p className="flex items-center gap-2 text-sm font-black text-emerald-800">
                <ShieldCheck size={17} />
                Payment received successfully.
              </p>

              <p className="mt-1 text-xs font-semibold leading-5 text-emerald-700/75">
                Your paid bill is ready. Staff will complete your table shortly.
              </p>

              <div className="flex flex-col gap-2 mt-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onOpenBill}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-emerald-700 shadow-sm transition hover:-translate-y-0.5"
                >
                  <ReceiptText size={16} />
                  View Paid Bill
                </button>

                {billToken && (
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(billToken)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-100 px-4 text-sm font-black text-emerald-800 transition hover:-translate-y-0.5"
                  >
                    <ShieldCheck size={16} />
                    Bill Ready
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckoutModal({
  finalTotal,
  paymentLoading,
  onClose,
  onPayOnline,
  onPayAtTable,
}) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 px-4 backdrop-blur-md">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2.4rem] bg-[#fffaf1] shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
        <div className="relative px-5 py-5 text-center border-b border-amber-100 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute flex items-center justify-center w-10 h-10 transition bg-white rounded-full shadow-sm right-4 top-4 text-slate-500 hover:bg-red-50 hover:text-red-500"
          >
            <X size={18} />
          </button>

          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-700">
            Request Checkout
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#241309] sm:text-4xl">
            Choose Payment Method
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-[#7b5b42]">
            Your table will be locked for checkout. New items cannot be added
            after this step.
          </p>

          <div className="inline-flex items-center gap-2 px-5 py-2 mx-auto mt-4 text-sm font-black bg-white rounded-full shadow-sm text-emerald-700">
            <IndianRupee size={16} />
            Payable ₹{money(finalTotal)}
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <button
            type="button"
            onClick={onPayOnline}
            disabled={paymentLoading}
            className="group rounded-[2rem] border border-emerald-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-emerald-50 text-emerald-700 transition group-hover:scale-105">
              {paymentLoading ? (
                <Loader2 size={26} className="animate-spin" />
              ) : (
                <Smartphone size={28} />
              )}
            </div>

            <h3 className="text-2xl font-black tracking-[-0.04em] text-[#241309]">
              Pay Online
            </h3>

            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Pay instantly using UPI, cards, wallets, or net banking. Your bill
              will be marked paid after successful payment.
            </p>

            <div className="flex flex-wrap gap-2 mt-5">
              {["UPI", "Cards", "Wallets"].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </button>

          <button
            type="button"
            onClick={onPayAtTable}
            disabled={paymentLoading}
            className="group rounded-[2rem] border border-amber-100 bg-[#3d2412] p-5 text-left text-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-amber-100 text-[#3d2412] transition group-hover:scale-105">
              {paymentLoading ? (
                <Loader2 size={26} className="animate-spin" />
              ) : (
                <Wallet size={28} />
              )}
            </div>

            <h3 className="text-2xl font-black tracking-[-0.04em] text-amber-50">
              Pay at Table
            </h3>

            <p className="mt-2 text-sm font-semibold leading-6 text-amber-100/75">
              A staff member will be notified and will arrive at your table to
              collect payment. Please keep your bill amount ready.
            </p>

            <div className="flex flex-wrap gap-2 mt-5">
              {["Cash", "UPI to Staff", "Card Machine"].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-100"
                >
                  {item}
                </span>
              ))}
            </div>
          </button>
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

  const charges = isFullBill ? sessionBill?.billChargesSnapshot || [] : [];

  const chargesTotal = isFullBill
    ? charges.reduce((sum, charge) => sum + Number(charge.amount || 0), 0)
    : 0;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/45 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-8">
      <div className="flex items-start justify-center w-full max-w-2xl min-h-full mx-auto sm:items-center">
        <div className="relative my-auto flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-[1.6rem] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)] sm:rounded-[2rem]">
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

          <div className="flex-1 min-h-0 px-5 py-4 overflow-y-auto">
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
                              ₹{Number(item.price || 0)} ×{" "}
                              {Number(item.qty || 1)}
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
              {charges.map((charge, index) => (
                <PriceRow
                  key={index}
                  label={charge.name}
                  value={Number(charge.amount || 0)}
                />
              ))}

              {charges.length > 0 && (
                <PriceRow label="Total Charges" value={chargesTotal} />
              )}

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
    </div>
  );
}

function PriceRow({ label, value, discount }) {
  const numericValue = Number(value || 0);
  const isNegative = numericValue < 0;

  return (
    <div className="flex items-center justify-between text-sm font-bold">
      <span className="text-slate-500">{label}</span>

      <span
        className={
          discount || isNegative ? "text-emerald-600" : "text-[#241309]"
        }
      >
        {isNegative ? "-" : ""}₹{money(Math.abs(numericValue))}
      </span>
    </div>
  );
}
