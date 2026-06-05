import { useEffect, useState, useRef } from "react";
import api from "../../api/api";
import socket from "../../socket/socket";
import toast from "react-hot-toast";
import OrderToast from "../components/OrderToast";
import { printBill } from "../components/PrintBill";
import {
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
  Bell,
  BellOff,
  BellRing,
  Printer,
  Wallet,
  TicketPercent,
  MessageCircle,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ───────────────── CONSTANTS ───────────────── */

const PER_PAGE = 9;

/* ───────────────── HELPERS ───────────────── */

const money = (value) => Math.round(Number(value || 0)).toLocaleString("en-IN");

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
  return `${import.meta.env.VITE_BACKEND_URL}/uploads/${item.image}`;
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
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-[0_8px_26px_rgba(15,23,42,0.08)] sm:gap-5 sm:px-6 sm:py-5">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full sm:h-14 sm:w-14 ${t.bg} ${t.text}`}
      >
        {icon}
      </div>

      <div>
        <h3 className="text-xl font-black leading-none tracking-tight text-[#101936] sm:text-2xl">
          {value}
        </h3>

        <p className="mt-1 text-xs font-bold text-slate-500 sm:text-sm">
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
      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-black whitespace-nowrap ${
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
      <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-black whitespace-nowrap text-red-500">
        Delayed
      </span>
    );
  }

  if (anyPreparing) {
    return (
      <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-black whitespace-nowrap text-orange-500">
        Preparing
      </span>
    );
  }

  return (
    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black whitespace-nowrap text-emerald-600">
      On Time
    </span>
  );
}

/* ───────────────── MAIN COMPONENT ───────────────── */

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [sessionBills, setSessionBills] = useState({});
  const [orderToasts, setOrderToasts] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [tick, setTick] = useState(0);
  const [settings, setSettings] = useState(null);
  const [page, setPage] = useState(1);
  const [assistanceRequests, setAssistanceRequests] = useState([]);

  const audioRef = useRef(null);
  const assistanceSeenRef = useRef(new Set());

  const getTokenFromOrders = (tableOrders = []) =>
    tableOrders[0]?.token ||
    tableOrders[0]?.sessionId ||
    tableOrders[0]?.tableSessionToken ||
    "";

  const getTableSubtotal = (tableOrders = []) =>
    tableOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);

  const getTableBill = (tableOrders = []) => {
    const token = getTokenFromOrders(tableOrders);
    const bill = sessionBills[token];

    const subtotal =
      bill?.subtotal !== undefined && bill?.subtotal !== null
        ? Number(bill.subtotal || 0)
        : getTableSubtotal(tableOrders);

    const billChargesSnapshot = Array.isArray(bill?.billChargesSnapshot)
      ? bill.billChargesSnapshot
      : [];

    const chargesTotal =
      bill?.chargesTotal !== undefined && bill?.chargesTotal !== null
        ? Number(bill.chargesTotal || 0)
        : billChargesSnapshot.reduce(
            (sum, charge) => sum + Number(charge?.amount || 0),
            0,
          );

    const discountAmount = Number(bill?.discountAmount || 0);

    const finalTotal =
      bill?.finalTotal !== undefined && bill?.finalTotal !== null
        ? Number(bill.finalTotal || 0)
        : Math.max(0, subtotal + chargesTotal - discountAmount);

    const sessionPaymentStatus = String(
      bill?.paymentStatus || "due",
    ).toLowerCase();

    const sessionPaidAmount =
      sessionPaymentStatus === "paid"
        ? Number(bill?.paidAmount || finalTotal || 0)
        : Number(bill?.paidAmount || 0);

    return {
      subtotal,
      chargesTotal,
      billChargesSnapshot,
      discountAmount,
      finalTotal,
      paidAmount: sessionPaidAmount,
      dueAmount: Math.max(0, finalTotal - sessionPaidAmount),

      coupon: bill?.coupon || null,

      paymentMode: bill?.paymentMode || "counter",
      paymentStatus: bill?.paymentStatus || "due",

      checkoutStatus: bill?.checkoutStatus || "open",
      checkoutPaymentMode: bill?.checkoutPaymentMode || null,
      checkoutRequestedAt: bill?.checkoutRequestedAt || null,
      billToken: bill?.billToken || "",
      customerPhone: bill?.customerPhone || "",

      razorpayPaymentId: bill?.razorpayPaymentId || "",
      razorpayOrderId: bill?.razorpayOrderId || "",
    };
  };

  const getOrderPaymentStatus = (order, sessionBill) => {
    return String(
      order?.paymentStatus || sessionBill?.paymentStatus || "due",
    ).toLowerCase();
  };

  const getOrderPaymentMode = (order, sessionBill) => {
    return String(
      order?.paymentMode || sessionBill?.paymentMode || "counter",
    ).toLowerCase();
  };

  const getPaymentModeText = (mode) => {
    const clean = String(mode || "counter").toLowerCase();

    if (["online", "razorpay", "upi", "card"].includes(clean)) {
      return "Online";
    }

    return "Pay at Table";
  };

  const fetchSessionBills = (activeOrders = []) => {
    const tokens = [
      ...new Set(
        activeOrders
          .map((o) => o?.token || o?.sessionId || o?.tableSessionToken)
          .filter(Boolean),
      ),
    ];

    tokens.forEach((token) => {
      api
        .get(`/session/${token}/bill`)
        .then((res) => {
          const data = res.data || {};
          setSessionBills((prev) => ({
            ...prev,
            [token]: {
              ...(data.bill || {}),
              token,
              table: data.table,
              active: data.active,
              hasOrder: data.hasOrder,
              checkoutStatus: data.checkoutStatus || "open",
              checkoutPaymentMode: data.checkoutPaymentMode || null,
              checkoutRequestedAt: data.checkoutRequestedAt || null,
              billToken: data.billToken || data.bill?.billToken || "",
              customerPhone:
                data.customerPhone || data.bill?.customerPhone || "",
            },
          }));
        })
        .catch((err) => console.log(err));
    });
  };

  const fetchOrders = () => {
    api
      .get("/orders")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];

        const activeData = data
          .filter(Boolean)
          .filter(
            (o) => !o.status || String(o.status).toLowerCase() !== "completed",
          );

        setOrders(activeData);
        fetchSessionBills(activeData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    api
      .get("/admin/settings")
      .then((res) => setSettings(res.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

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

        const next = [order, ...cleanPrev];
        fetchSessionBills(next);
        return next;
      });

      setOrderToasts((prev) => [...prev, order]);

      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    };

    const handleOrderUpdated = (updated) => {
      if (!updated) return;

      if (!updated._id) {
        fetchOrders();
        return;
      }

      setOrders((prev) => {
        const cleanPrev = prev.filter(Boolean);

        let next;

        if (String(updated.status || "").toLowerCase() === "completed") {
          next = cleanPrev.filter((o) => o?._id !== updated._id);
        } else {
          const exists = cleanPrev.some((o) => o?._id === updated._id);

          if (!exists) {
            next = [updated, ...cleanPrev];
          } else {
            next = cleanPrev.map((o) => (o?._id === updated._id ? updated : o));
          }
        }

        fetchSessionBills(next);
        return next;
      });
    };

    const handleOrderDeleted = (payload) => {
      const deleteId =
        typeof payload === "object" ? payload?._id || payload?.id : payload;

      if (!deleteId) return;

      setOrders((prev) => {
        const next = prev.filter(Boolean).filter((o) => o?._id !== deleteId);
        fetchSessionBills(next);
        return next;
      });
    };

    const handleSessionBillUpdate = () => {
      fetchOrders();
    };

    const handleCheckoutRequest = () => {
      fetchOrders();

      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    };

    const handleAssistanceRequested = (payload = {}) => {
      const token =
        payload.token || payload.sessionId || payload.tableSessionToken || "";

      if (!token) return;

      const requestKey = payload._id || payload.id || token;

      setAssistanceRequests((prev) => {
        const cleanPrev = prev.filter(Boolean);
        const exists = cleanPrev.some(
          (item) =>
            (item._id || item.id || item.token) === requestKey ||
            item.token === token,
        );

        if (exists) {
          return cleanPrev.map((item) =>
            (item._id || item.id || item.token) === requestKey ||
            item.token === token
              ? {
                  ...item,
                  ...payload,
                  token,
                  status: payload.status || "active",
                  requestedAt:
                    payload.requestedAt ||
                    payload.createdAt ||
                    item.requestedAt ||
                    new Date().toISOString(),
                }
              : item,
          );
        }

        return [
          {
            ...payload,
            token,
            table:
              payload.table ||
              payload.tableNumber ||
              payload.tableKey ||
              "Unknown",
            status: payload.status || "active",
            requestedAt:
              payload.requestedAt ||
              payload.createdAt ||
              new Date().toISOString(),
          },
          ...cleanPrev,
        ];
      });

      if (!assistanceSeenRef.current.has(requestKey)) {
        assistanceSeenRef.current.add(requestKey);
        toast.success(
          `Table ${payload.table || payload.tableNumber || "—"} called assistance 🔔`,
        );

        if (soundEnabled && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      }
    };

    const handleAssistanceCompleted = (payload = {}) => {
      const token = payload.token || payload.sessionId || "";
      const requestId = payload._id || payload.id || "";

      setAssistanceRequests((prev) =>
        prev.filter((item) => {
          if (requestId && (item._id === requestId || item.id === requestId)) {
            return false;
          }

          if (token && item.token === token) {
            return false;
          }

          return true;
        }),
      );
    };

    const handleCustomerPhoneUpdated = (payload = {}) => {
      const token = payload.token || payload.sessionId || "";

      if (!token) {
        fetchOrders();
        return;
      }

      setSessionBills((prev) => ({
        ...prev,
        [token]: {
          ...(prev[token] || {}),
          customerPhone: payload.customerPhone || "",
        },
      }));
    };

    socket.on("new-order", handleNewOrder);
    socket.on("orderUpdated", handleOrderUpdated);
    socket.on("order-updated", handleOrderUpdated);
    socket.on("order-deleted", handleOrderDeleted);
    socket.on("tables-current-updated", handleSessionBillUpdate);
    socket.on("checkout-requested", handleCheckoutRequest);
    socket.on("checkout-payment-method-selected", handleCheckoutRequest);
    socket.on("payment-paid", handleCheckoutRequest);
    socket.on("assistance-requested", handleAssistanceRequested);
    socket.on("assistance-completed", handleAssistanceCompleted);
    socket.on("customer-phone-updated", handleCustomerPhoneUpdated);

    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("orderUpdated", handleOrderUpdated);
      socket.off("order-updated", handleOrderUpdated);
      socket.off("order-deleted", handleOrderDeleted);
      socket.off("tables-current-updated", handleSessionBillUpdate);
      socket.off("checkout-requested", handleCheckoutRequest);
      socket.off("checkout-payment-method-selected", handleCheckoutRequest);
      socket.off("payment-paid", handleCheckoutRequest);
      socket.off("assistance-requested", handleAssistanceRequested);
      socket.off("assistance-completed", handleAssistanceCompleted);
      socket.off("customer-phone-updated", handleCustomerPhoneUpdated);
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

  const totalPages = Math.ceil(tableKeys.length / PER_PAGE) || 1;
  const pageTableKeys = tableKeys.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [tableKeys.length, page, totalPages]);

  const activeTables = tableKeys.length;
  const activeOrders = orders.filter(Boolean).length;

  const preparing = orders.filter(
    (o) => o?.status === "preparing" || o?.status === "pending" || !o?.status,
  ).length;

  const served = orders.filter((o) => o?.status === "served").length;

  const delayed = orders.filter((o) => isDelayed(o?.createdAt)).length;

  const checkoutRequests = tableKeys
    .map((tableKey) => {
      const tableOrders = (grouped[tableKey] || [])
        .filter(Boolean)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      const bill = getTableBill(tableOrders);
      const status = String(bill.checkoutStatus || "open").toLowerCase();
      const paymentStatus = String(bill.paymentStatus || "due").toLowerCase();

      if (status !== "checkout_requested" || paymentStatus === "paid") {
        return null;
      }

      return {
        tableKey,
        tableOrders,
        bill,
        token: getTokenFromOrders(tableOrders),
      };
    })
    .filter(Boolean);

  const checkoutRequestCount = checkoutRequests.length;

  const activeAssistanceRequests = assistanceRequests
    .filter(Boolean)
    .filter(
      (item) => String(item.status || "active").toLowerCase() !== "completed",
    );

  const assistanceRequestCount = activeAssistanceRequests.length;

  const completeAssistance = (request) => {
    if (!request?.token) return;

    const optimisticKey = request._id || request.id || request.token;

    setAssistanceRequests((prev) =>
      prev.filter(
        (item) =>
          (item._id || item.id || item.token) !== optimisticKey &&
          item.token !== request.token,
      ),
    );

    api
      .put(`/session/${request.token}/assistance/complete`, {
        requestId: request._id || request.id || "",
      })
      .then(() => {
        toast.success(`Assistance completed for Table ${request.table || "—"}`);
      })
      .catch((err) => {
        console.log(err);
        toast.error(
          err.response?.data?.message ||
            "Backend assistance complete route will be connected next.",
        );

        setAssistanceRequests((prev) => [request, ...prev]);
      });
  };

  const updateBatchStatus = (id, status) => {
    if (!id) return;

    api
      .put(`/order/${id}`, { status })
      .then((res) => {
        const updated = res.data;

        if (!updated || !updated._id) return;

        setOrders((prev) => {
          const cleanPrev = prev.filter(Boolean);

          let next;

          if (String(updated.status || "").toLowerCase() === "completed") {
            next = cleanPrev.filter((o) => o?._id !== updated._id);
          } else {
            next = cleanPrev.map((o) => (o?._id === id ? updated : o));
          }

          fetchSessionBills(next);
          return next;
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

        setOrders((prev) => {
          const next = prev
            .filter(Boolean)
            .map((o) => (o?._id === updated._id ? updated : o));

          fetchSessionBills(next);
          return next;
        });
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
        setOrders((prev) => {
          const next = prev.filter(Boolean).filter((o) => o?._id !== id);
          fetchSessionBills(next);
          return next;
        });
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

        setOrders((prev) => {
          const next = prev
            .filter(Boolean)
            .map((o) => (o?._id === order._id ? updated : o));

          fetchSessionBills(next);
          return next;
        });
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

        setOrders((prev) => {
          const next = prev
            .filter(Boolean)
            .map((o) => (o?._id === order._id ? updated : o));

          fetchSessionBills(next);
          return next;
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateTablePaymentStatus = (tableOrders = [], paymentStatus) => {
    const token = getTokenFromOrders(tableOrders);

    if (!token) return;

    api
      .put(`/session/${token}/payment`, {
        paymentMode: paymentStatus === "paid" ? "cash" : "counter",
        paymentStatus,
      })
      .then((res) => {
        setSessionBills((prev) => ({
          ...prev,
          [token]: {
            ...(prev[token] || {}),
            ...(res.data || {}),
            paymentMode: paymentStatus === "paid" ? "cash" : "counter",
            paymentStatus,
            checkoutStatus:
              paymentStatus === "paid"
                ? "paid"
                : prev[token]?.checkoutStatus || "open",
          },
        }));

        toast.success(
          paymentStatus === "paid"
            ? "Payment marked paid"
            : "Payment marked due",
        );
        fetchOrders();
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response?.data?.message || "Failed to update payment");
      });
  };

  const markCashPaid = (tableOrders = []) => {
    const token = getTokenFromOrders(tableOrders);

    if (!token) return;

    api
      .put(`/session/${token}/mark-cash-paid`)
      .then((res) => {
        const data = res.data || {};

        setSessionBills((prev) => ({
          ...prev,
          [token]: {
            ...(prev[token] || {}),
            ...(data.bill || {}),
            token,
            table: data.table,
            billToken: data.billToken,
            paymentMode: data.paymentMode || "cash",
            paymentStatus: data.paymentStatus || "paid",
            checkoutStatus: data.checkoutStatus || "paid",
            checkoutPaymentMode: data.checkoutPaymentMode || "cash",
            paidAmount: data.paidAmount || data.bill?.finalTotal || 0,
            paidAt: data.paidAt || new Date().toISOString(),
          },
        }));

        toast.success("Cash payment marked paid ✅");
        fetchOrders();
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response?.data?.message || "Failed to mark cash paid");
      });
  };

  const completeTable = (tableOrders = []) => {
    const safeTableOrders = tableOrders.filter(Boolean);

    const token =
      safeTableOrders[0]?.token ||
      safeTableOrders[0]?.sessionId ||
      safeTableOrders[0]?.tableSessionToken;

    if (!token) return;

    const bill = sessionBills[token];
    if (String(bill?.paymentStatus || "due").toLowerCase() !== "paid") {
      toast.error(
        "Payment pending. Mark payment as paid before completing table.",
      );
      return;
    }

    api
      .put(`/table/complete/${token}`)
      .then(() => {
        fetchOrders();
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response?.data?.message || "Failed to complete table");
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

  const getNextHistoryOrderNo = () => {
    return api.get("/orders").then((res) => {
      const completedSessions = {};

      res.data
        .filter((o) => o.status === "completed")
        .forEach((order) => {
          const key =
            order.sessionId ||
            order.token ||
            `${order.table}-${new Date(order.createdAt).toDateString()}`;

          if (!completedSessions[key]) {
            completedSessions[key] = [];
          }

          completedSessions[key].push(order);
        });

      const nextNo = Object.keys(completedSessions).length + 1;

      return String(nextNo).padStart(4, "0");
    });
  };

  const getCustomerPhone = (bill = {}) => {
    const rawPhone = String(bill?.customerPhone || "").replace(/\D/g, "");

    if (!rawPhone) return "";

    return rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
  };

  const getBillShareUrl = (bill = {}) => {
    const billToken = bill?.billToken || "";

    if (!billToken) return "";

    const host = window.location.host;
    const protocol = window.location.protocol;

    return `${protocol}//${host}/bill/${billToken}`;
  };

  const sendBillOnWhatsApp = ({ tableKey, bill }) => {
    const phone = getCustomerPhone(bill);

    if (!phone) {
      toast.error("Customer WhatsApp number is not saved yet.");
      return;
    }

    const billUrl = getBillShareUrl(bill);

    if (!billUrl) {
      toast.error("Bill link is not ready yet.");
      return;
    }

    const cafeName = settings?.cafeName || "The White House Café";

    const message = `Hello 👋

Thank you for visiting ${cafeName}.

Your table ${tableKey} bill amount is ₹${money(bill.finalTotal)}.

View your bill here:
${billUrl}

We hope to see you again soon.`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const toggleCollapse = (key) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div
      className="min-h-screen bg-[#fbfaf8] text-[#111827]"
      style={{ fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif" }}
    >
      <audio ref={audioRef} src="/sound.mp3" />

      <main className="mx-auto max-w-[1800px] px-3 py-5 sm:px-5 sm:py-6">
        {/* PAGE TITLE + ACTIONS */}
        <div className="flex flex-col gap-5 mb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-[-0.05em] text-[#111936] sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500 sm:text-base">
              Monitor tables, orders, billing, and kitchen status in real time.
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
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 mb-5 sm:grid-cols-2 lg:grid-cols-7 lg:gap-6">
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

          <StatCard
            icon={<Bell size={28} />}
            value={checkoutRequestCount}
            label="Checkout Requests"
            tone="orange"
          />

          <StatCard
            icon={<BellRing size={28} />}
            value={assistanceRequestCount}
            label="Assistance Calls"
            tone={assistanceRequestCount > 0 ? "red" : "green"}
          />
        </div>

        {activeAssistanceRequests.length > 0 && (
          <div className="mb-5 overflow-hidden rounded-2xl border border-red-200 bg-red-50/80 shadow-[0_10px_32px_rgba(239,68,68,0.12)]">
            <div className="flex flex-col gap-2 px-5 py-4 border-b border-red-200/70 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black text-red-900">
                  <BellRing size={20} />
                  Assistance Calls
                </h2>
                <p className="mt-1 text-sm font-semibold text-red-800/70">
                  Customers need help at their table. Mark assisted after staff
                  reaches the table.
                </p>
              </div>

              <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-red-700 shadow-sm">
                {activeAssistanceRequests.length} Active
              </span>
            </div>

            <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
              {activeAssistanceRequests.map((request) => (
                <div
                  key={request._id || request.id || request.token}
                  className="p-4 bg-white border border-red-200 shadow-sm rounded-2xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">
                        Customer Assistance
                      </p>

                      <h3 className="mt-1 text-2xl font-black text-[#111936]">
                        Table {request.table || request.tableNumber || "—"}
                      </h3>
                    </div>

                    <span className="px-3 py-1 text-xs font-black text-red-600 rounded-full bg-red-50">
                      Help Needed
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                    {request.message ||
                      "Customer requested assistance at the table."}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 rounded-2xl bg-slate-50">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Requested
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-700">
                        {fmt(request.requestedAt || request.createdAt)}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Waiting
                      </p>
                      <p className="mt-1 text-sm font-black text-red-500">
                        {elapsed(request.requestedAt || request.createdAt)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => completeAssistance(request)}
                    className="mt-4 flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    <CheckCircle2 size={16} />
                    Mark Assisted
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {checkoutRequests.length > 0 && (
          <div className="mb-5 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/80 shadow-[0_10px_32px_rgba(217,119,6,0.12)]">
            <div className="flex flex-col gap-2 px-5 py-4 border-b border-amber-200/70 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black text-amber-900">
                  <Bell size={20} />
                  Checkout Requests
                </h2>
                <p className="mt-1 text-sm font-semibold text-amber-800/70">
                  Customers are ready to settle their bill. Collect cash or wait
                  for online payment.
                </p>
              </div>

              <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-amber-700 shadow-sm">
                {checkoutRequests.length} Active
              </span>
            </div>

            <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
              {checkoutRequests.map(
                ({ tableKey, tableOrders, bill, token }) => {
                  const isCash =
                    bill.checkoutPaymentMode === "cash" ||
                    bill.paymentMode === "cash";
                  const isOnline =
                    bill.checkoutPaymentMode === "online" ||
                    bill.paymentMode === "online";

                  return (
                    <div
                      key={token || tableKey}
                      className="p-4 bg-white border shadow-sm rounded-2xl border-amber-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
                            Table Checkout
                          </p>
                          <h3 className="mt-1 text-2xl font-black text-[#111936]">
                            Table {tableKey}
                          </h3>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            isOnline
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isOnline
                            ? "Online"
                            : isCash
                              ? "Pay at Table"
                              : "Method Pending"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="p-3 rounded-2xl bg-slate-50">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                            Amount
                          </p>
                          <p className="mt-1 text-xl font-black text-emerald-700">
                            ₹{money(bill.finalTotal)}
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                            Status
                          </p>
                          <p className="mt-1 text-sm font-black text-red-500">
                            Due
                          </p>
                        </div>
                      </div>

                      {bill.customerPhone && (
                        <div className="p-3 mt-4 border rounded-2xl border-emerald-100 bg-emerald-50">
                          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-700">
                            <MessageCircle size={13} />
                            WhatsApp Bill
                          </p>
                          <p className="mt-1 text-sm font-black text-slate-700">
                            +{getCustomerPhone(bill)}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-2 mt-4 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedBill({
                              tableOrders,
                              tableKey,
                              sessionBill: bill,
                            })
                          }
                          className="min-h-[42px] rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-black text-amber-800 transition hover:bg-amber-50"
                        >
                          View Bill
                        </button>

                        {bill.customerPhone && bill.billToken && (
                          <button
                            type="button"
                            onClick={() =>
                              sendBillOnWhatsApp({ tableKey, bill })
                            }
                            className="min-h-[42px] rounded-xl bg-emerald-600 px-3 py-2 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 sm:col-span-2"
                          >
                            <span className="inline-flex items-center justify-center gap-2">
                              <Send size={15} />
                              Send Bill on WhatsApp
                            </span>
                          </button>
                        )}

                        {isCash ? (
                          <button
                            type="button"
                            onClick={() => markCashPaid(tableOrders)}
                            className="min-h-[42px] rounded-xl bg-emerald-600 px-3 py-2 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
                          >
                            Mark Cash Paid
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="min-h-[42px] cursor-not-allowed rounded-xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-400"
                          >
                            Waiting Payment
                          </button>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

        {tableKeys.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-slate-400">
            <ClipboardList size={48} className="mb-3 opacity-30" />
            <p className="text-sm font-semibold">No active orders right now.</p>
          </div>
        )}

        {/* TABLE GRID */}
        <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {pageTableKeys.map((tableKey, index) => {
            const originalIndex = (page - 1) * PER_PAGE + index;

            const tableOrders = (grouped[tableKey] || [])
              .filter(Boolean)
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            const tableBill = getTableBill(tableOrders);

            const total = tableBill.finalTotal;
            const batchCount = tableOrders.length;

            const isCollapsed =
              collapsed[tableKey] === undefined
                ? originalIndex > 2
                : collapsed[tableKey];

            const firstReceived = fmt(tableOrders[0]?.createdAt);

            const paymentMode = getPaymentModeText(tableBill.paymentMode);
            const paymentStatus = String(
              tableBill.paymentStatus || "due",
            ).toLowerCase();
            const paidTable = paymentStatus === "paid";
            const checkoutStatus = String(
              tableBill.checkoutStatus || "open",
            ).toLowerCase();
            const checkoutPaymentMode = String(
              tableBill.checkoutPaymentMode || tableBill.paymentMode || "",
            ).toLowerCase();
            const checkoutRequested =
              checkoutStatus === "checkout_requested" && !paidTable;
            const cashCheckoutRequested =
              checkoutRequested &&
              (checkoutPaymentMode === "cash" ||
                tableBill.paymentMode === "cash");

            const tableAssistanceRequests = activeAssistanceRequests.filter(
              (request) =>
                String(request.table || request.tableNumber || "") ===
                String(tableKey),
            );

            const hasAssistanceRequest = tableAssistanceRequests.length > 0;

            return (
              <section
                key={tableKey}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
              >
                {/* TABLE HEADER */}
                <button
                  type="button"
                  onClick={() => toggleCollapse(tableKey)}
                  className="flex flex-col w-full gap-3 px-4 py-4 text-left bg-white border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h2 className="text-lg font-black tracking-tight text-[#111936] sm:text-xl">
                      Table {tableKey === "Unknown" ? "N/A" : tableKey}
                    </h2>

                    <span className="rounded-md bg-slate-100 px-3 py-1 text-[12px] font-black text-slate-600">
                      {batchCount} {batchCount === 1 ? "Batch" : "Batches"}
                    </span>

                    {tableBill.coupon?.code && tableBill.discountAmount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
                        <TicketPercent size={13} />
                        {tableBill.coupon.code}
                      </span>
                    )}

                    {checkoutRequested && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-700">
                        <Bell size={13} />
                        Checkout Requested
                      </span>
                    )}

                    {paidTable && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
                        <CheckCircle2 size={13} />
                        Paid
                      </span>
                    )}

                    {hasAssistanceRequest && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1 text-[11px] font-black text-red-600">
                        <BellRing size={13} />
                        Assistance
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBill({
                          tableOrders,
                          tableKey,
                          sessionBill: tableBill,
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          setSelectedBill({
                            tableOrders,
                            tableKey,
                            sessionBill: tableBill,
                          });
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3.5 py-2 text-sm font-black text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-100"
                    >
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">
                        Total
                      </span>
                      ₹{money(total)}
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
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 sm:gap-6">
                      <span>
                        <strong className="font-black text-slate-600">
                          Total
                        </strong>{" "}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedBill({
                              tableOrders,
                              tableKey,
                              sessionBill: tableBill,
                            })
                          }
                          className="text-2xl font-black transition text-emerald-700 hover:scale-105 hover:text-emerald-800"
                        >
                          ₹{money(tableBill.finalTotal)}
                        </button>
                      </span>

                      {tableBill.discountAmount > 0 && (
                        <span className="font-bold text-emerald-600">
                          Saved ₹{money(tableBill.discountAmount)}
                        </span>
                      )}

                      <span className="hidden w-px h-5 bg-gray-200 sm:inline-block" />

                      <span>
                        <strong className="font-black text-slate-600">
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
                              <span className="text-base font-black text-[#111936]">
                                Batch #{idx + 1}
                              </span>

                              <span className="rounded-md bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-500">
                                Order #{order._id?.slice(-5).toUpperCase()}
                              </span>

                              <span
                                className={`rounded-md px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${
                                  order.status === "served"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : order.status === "preparing"
                                      ? "bg-orange-50 text-orange-500"
                                      : "bg-amber-50 text-amber-600"
                                }`}
                              >
                                {order.status === "served"
                                  ? "Served"
                                  : order.status === "preparing"
                                    ? "Preparing"
                                    : "Pending"}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex lg:items-center lg:gap-5">
                              <div>
                                <p className="text-[11px] font-bold text-slate-400">
                                  Received
                                </p>

                                <p className="text-xs font-black text-slate-700">
                                  {fmt(order.createdAt)}
                                </p>
                              </div>

                              <div>
                                <p className="text-[11px] font-bold text-slate-400">
                                  Est. Prep Time
                                </p>

                                <select className="h-8 w-full min-w-[88px] rounded-md border border-gray-200 bg-white px-2 text-xs font-black text-slate-700 outline-none">
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

                                <p className="text-xs font-black text-slate-700">
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

                                      <p className="text-sm font-bold truncate text-slate-700">
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

                                        <span className="w-10 text-sm font-black text-center text-slate-700">
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

                                      <span className="min-w-[70px] text-right text-sm font-black text-slate-700">
                                        ₹
                                        {money(
                                          Number(item.price || 0) *
                                            Number(item.qty || 1),
                                        )}
                                      </span>

                                      <button
                                        onClick={() => deleteItem(order, i)}
                                        className="flex items-center justify-center text-red-400 rounded-md h-9 w-9 hover:bg-red-50"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  </div>

                                  {item.note && item.note.trim() !== "" && (
                                    <p className="mt-1 ml-0 text-xs italic font-medium text-amber-500 sm:ml-12">
                                      📝 {item.note}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* RESPONSIVE BATCH ACTIONS */}
                          <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-4">
                            <button
                              disabled
                              className={`flex min-h-[42px] items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-black ${
                                order.status === "pending" || !order.status
                                  ? "border-amber-200 bg-amber-50 text-amber-600"
                                  : "border-gray-200 bg-gray-50 text-gray-400"
                              }`}
                            >
                              <Clock size={15} />
                              <span className="whitespace-nowrap">Pending</span>
                            </button>

                            <button
                              onClick={() =>
                                updateBatchStatus(order._id, "preparing")
                              }
                              className={`flex min-h-[42px] items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-black ${
                                order.status === "preparing"
                                  ? "border-orange-200 bg-orange-50 text-orange-500"
                                  : "border-orange-200 bg-white text-orange-500"
                              }`}
                            >
                              <ChefHat size={15} />
                              <span className="whitespace-nowrap">
                                Preparing
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                serveOrder(order._id);
                              }}
                              className={`flex min-h-[42px] items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-black ${
                                order.status === "served"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                                  : "border-emerald-200 bg-white text-emerald-600"
                              }`}
                            >
                              <CheckCircle2 size={15} />
                              <span className="whitespace-nowrap">Served</span>
                            </button>

                            <button
                              onClick={() => deleteBatch(order._id)}
                              className="flex min-h-[42px] items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-black text-red-500"
                            >
                              <Trash2 size={15} />
                              <span className="whitespace-nowrap">Delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {hasAssistanceRequest && (
                      <div className="p-4 mb-4 border border-red-200 rounded-2xl bg-red-50">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="flex items-center gap-2 text-sm font-black text-red-900">
                              <BellRing size={16} />
                              Customer called assistance
                            </p>
                            <p className="mt-1 text-xs font-semibold text-red-800/70">
                              Requested{" "}
                              {elapsed(
                                tableAssistanceRequests[0]?.requestedAt ||
                                  tableAssistanceRequests[0]?.createdAt,
                              )}{" "}
                              ago. Please assist the table.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              completeAssistance(tableAssistanceRequests[0])
                            }
                            className="min-h-[42px] rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
                          >
                            Mark Assisted
                          </button>
                        </div>
                      </div>
                    )}

                    {checkoutRequested && (
                      <div className="p-4 mb-4 border rounded-2xl border-amber-200 bg-amber-50">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="flex items-center gap-2 text-sm font-black text-amber-900">
                              <Bell size={16} />
                              Checkout requested by customer
                            </p>
                            <p className="mt-1 text-xs font-semibold text-amber-800/70">
                              {cashCheckoutRequested
                                ? "Customer selected Pay at Table. Collect cash/payment at the table and mark paid."
                                : checkoutPaymentMode === "online"
                                  ? "Customer selected online payment. Wait for successful payment before completing the table."
                                  : "Customer requested checkout but has not selected a payment method yet."}
                            </p>
                          </div>

                          {cashCheckoutRequested && (
                            <button
                              type="button"
                              onClick={() => markCashPaid(tableOrders)}
                              className="min-h-[42px] rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
                            >
                              Mark Cash Paid
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SESSION BILL ROW */}
                    <div className="grid grid-cols-1 gap-4 py-4 border-b border-gray-100 md:grid-cols-2">
                      <div className="space-y-2 rounded-2xl bg-[#fffaf1] p-4">
                        <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                          <span>Subtotal</span>
                          <span>₹{money(tableBill.subtotal)}</span>
                        </div>

                        {(tableBill.billChargesSnapshot || []).map(
                          (charge, index) => {
                            const amount = Number(charge?.amount || 0);

                            return (
                              <div
                                key={`${charge?.name || "charge"}-${index}`}
                                className={`flex items-center justify-between text-sm font-black ${
                                  amount < 0
                                    ? "text-emerald-600"
                                    : "text-slate-600"
                                }`}
                              >
                                <span>{charge?.name || "Charge"}</span>
                                <span>
                                  {amount < 0 ? "-" : "+"}₹
                                  {money(Math.abs(amount))}
                                </span>
                              </div>
                            );
                          },
                        )}

                        {(tableBill.billChargesSnapshot || []).length > 0 && (
                          <div className="flex items-center justify-between text-sm font-black text-slate-700">
                            <span>Total Charges</span>
                            <span>₹{money(tableBill.chargesTotal)}</span>
                          </div>
                        )}

                        {tableBill.discountAmount > 0 && (
                          <div className="flex items-center justify-between text-sm font-black text-emerald-600">
                            <span>
                              Coupon{" "}
                              {tableBill.coupon?.code
                                ? `(${tableBill.coupon.code})`
                                : ""}
                            </span>
                            <span>-₹{money(tableBill.discountAmount)}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-dashed border-amber-200" />

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-[#111936]">
                            Final Payable
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedBill({
                                tableOrders,
                                tableKey,
                                sessionBill: tableBill,
                              })
                            }
                            className="text-2xl font-black transition text-emerald-700 hover:scale-105"
                          >
                            ₹{money(tableBill.finalTotal)}
                          </button>
                        </div>
                      </div>

                      <div className="p-4 space-y-3 bg-white rounded-2xl">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <span className="text-sm font-bold text-slate-500">
                            Payment Mode:
                          </span>

                          <div className="flex items-center gap-2 text-sm font-black text-slate-600">
                            {paymentMode === "Online" ? (
                              <CreditCard
                                size={17}
                                className="text-slate-500"
                              />
                            ) : (
                              <Wallet size={17} className="text-slate-500" />
                            )}
                            <span>{paymentMode}</span>
                          </div>
                        </div>

                        {tableBill.customerPhone && (
                          <div className="p-3 border rounded-2xl border-emerald-100 bg-emerald-50">
                            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-700">
                              <MessageCircle size={13} />
                              Customer WhatsApp
                            </p>

                            <div className="flex flex-col gap-2 mt-2 sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-sm font-black text-slate-700">
                                +{getCustomerPhone(tableBill)}
                              </span>

                              {tableBill.billToken && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    sendBillOnWhatsApp({
                                      tableKey,
                                      bill: tableBill,
                                    })
                                  }
                                  className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-700"
                                >
                                  <Send size={14} />
                                  Send Bill
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-bold text-slate-500">
                            Payment Status:
                          </span>

                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                paidTable ? "bg-emerald-500" : "bg-red-500"
                              }`}
                            />

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black ${
                                paidTable
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {paidTable ? "Paid" : "Due"}
                            </span>

                            {!paidTable && cashCheckoutRequested && (
                              <button
                                type="button"
                                onClick={() => markCashPaid(tableOrders)}
                                className="px-3 py-2 text-xs font-black text-white transition rounded-md bg-emerald-600 hover:bg-emerald-700"
                              >
                                Mark Cash Paid
                              </button>
                            )}

                            {!paidTable && !cashCheckoutRequested && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateTablePaymentStatus(tableOrders, "paid")
                                }
                                className="px-3 py-2 text-xs font-black transition bg-white border rounded-md border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </div>
                        {tableBill.razorpayPaymentId && (
                          <div className="p-3 mt-2 rounded-xl bg-emerald-50">
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-700">
                              Razorpay Payment
                            </p>

                            <p className="mt-1 text-xs font-bold break-all text-slate-600">
                              {tableBill.razorpayPaymentId}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* TABLE ACTIONS */}
                    <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
                      <button
                        disabled={!paidTable}
                        onClick={() => {
                          if (!paidTable) {
                            toast.error(
                              "Payment pending. Mark payment paid first.",
                            );
                            return;
                          }

                          getNextHistoryOrderNo().then((nextOrderNo) => {
                            printBill({
                              tableOrders,
                              tableKey,
                              orderNo: nextOrderNo,
                              settings,
                              sessionBill: tableBill,
                            });

                            setTimeout(() => {
                              completeTable(tableOrders);
                            }, 800);
                          });
                        }}
                        className={`flex min-h-[46px] items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm font-black ${
                          paidTable
                            ? "border-gray-200 bg-white text-slate-700"
                            : "cursor-not-allowed border-amber-200 bg-amber-50 text-amber-600"
                        }`}
                      >
                        <Printer size={17} />
                        {paidTable ? "Print & Complete" : "Payment Pending"}
                      </button>

                      <button
                        disabled={!paidTable}
                        onClick={() => completeTable(tableOrders)}
                        className={`flex min-h-[46px] items-center justify-center gap-2 rounded-md px-3 py-3 text-sm font-black shadow-[0_8px_18px_rgba(7,24,50,0.18)] ${
                          paidTable
                            ? "bg-[#071832] text-white"
                            : "cursor-not-allowed bg-slate-100 text-slate-400 shadow-none"
                        }`}
                      >
                        <CheckCircle2 size={17} />
                        {paidTable ? "Complete Table" : "Cannot Complete"}
                      </button>

                      <button
                        onClick={() => deleteTable(tableOrders)}
                        className="flex min-h-[46px] items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 py-3 text-sm font-black text-red-500"
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

        {/* PAGINATION */}
        {/* {tableKeys.length > PER_PAGE && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-black bg-white border border-gray-200 rounded-xl text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={17} />
              Prev
            </button>

            <span className="px-5 py-3 text-sm font-black bg-white shadow-sm rounded-xl text-slate-600">
              Page {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-black bg-white border border-gray-200 rounded-xl text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        )} */}
      </main>

      {/* FOOTER */}
      <footer className="mt-5 flex flex-col gap-3 border-t border-gray-200 bg-[#fbfaf8] px-5 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
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
      <div className="fixed z-50 space-y-3 right-6 top-6">
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
          tableOrders={selectedBill.tableOrders}
          tableKey={selectedBill.tableKey}
          sessionBill={selectedBill.sessionBill}
          menu={[]}
          settings={settings}
          onClose={() => setSelectedBill(null)}
          printBill={printBill}
          sendBillOnWhatsApp={sendBillOnWhatsApp}
        />
      )}
    </div>
  );
}

function BillSummaryModal({
  tableOrders,
  tableKey,
  sessionBill,
  menu = [],
  settings,
  onClose,
  printBill,
  sendBillOnWhatsApp,
}) {
  const table =
    tableKey || tableOrders[0]?.table || tableOrders[0]?.tableId || "—";

  const subtotal =
    sessionBill?.subtotal ??
    tableOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);

  const discount = Number(sessionBill?.discountAmount || 0);

  const charges = Array.isArray(sessionBill?.billChargesSnapshot)
    ? sessionBill.billChargesSnapshot
    : [];

  const chargesTotal = Number(sessionBill?.chargesTotal || 0);

  const finalTotal =
    sessionBill?.finalTotal !== undefined && sessionBill?.finalTotal !== null
      ? Number(sessionBill.finalTotal || 0)
      : Math.max(0, Number(subtotal || 0) + chargesTotal - discount);

  const paidAmount =
    String(sessionBill?.paymentStatus || "due").toLowerCase() === "paid"
      ? Number(sessionBill?.paidAmount || finalTotal || 0)
      : Number(sessionBill?.paidAmount || 0);
  const dueAmount = Math.max(0, finalTotal - paidAmount);

  const coupon = sessionBill?.coupon || null;

  const paymentMode = String(
    sessionBill?.paymentMode || "counter",
  ).toLowerCase();
  const paymentStatus = String(
    sessionBill?.paymentStatus || "due",
  ).toLowerCase();

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
      return `${import.meta.env.VITE_BACKEND_URL}/uploads/${item.image}`;
    }

    const found = menu.find(
      (m) => m.name?.toLowerCase() === item.name?.toLowerCase(),
    );

    if (!found?.image) return "";

    if (found.image.startsWith("http")) return found.image;

    return `${import.meta.env.VITE_BACKEND_URL}/uploads/${found.image}`;
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-amber-100 bg-[#fffaf1] px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              Bill Summary
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#111936]">
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

        <div className="flex-1 px-5 py-4 overflow-y-auto">
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
                    ₹{money(getOrderTotal(order))}
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
                key={`${charge?.name || "charge"}-${index}`}
                label={charge?.name || "Charge"}
                value={Number(charge?.amount || 0)}
                discount={Number(charge?.amount || 0) < 0}
              />
            ))}

            {charges.length > 0 && (
              <PriceRow label="Total Charges" value={chargesTotal} />
            )}

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

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="p-3 rounded-2xl bg-emerald-50">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
                    Paid
                  </p>
                  <p className="mt-1 text-xl font-black text-emerald-700">
                    ₹{money(paidAmount)}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-red-50">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-600">
                    Due
                  </p>
                  <p className="mt-1 text-xl font-black text-red-600">
                    ₹{money(dueAmount)}
                  </p>
                </div>
              </div>

              <span className="text-3xl font-black tracking-tight text-emerald-700">
                ₹{money(finalTotal)}
              </span>
            </div>
          </div>

          <div className="px-4 py-3 mt-4 bg-white rounded-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-black">
              <span className="inline-flex items-center gap-2 text-[#7b5b42]">
                {paymentMode === "online" ? (
                  <CreditCard size={15} />
                ) : (
                  <Wallet size={15} />
                )}
                {paymentMode === "online" ? "Online" : "Pay at Counter"}
              </span>

              <span
                className={`rounded-full px-3 py-1 ${
                  paymentStatus === "paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {paymentStatus === "paid" ? "Paid" : "Due"}
              </span>
            </div>

            {sessionBill?.razorpayPaymentId && (
              <div className="pt-3 mt-3 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Payment ID
                </p>

                <p className="mt-1 text-xs font-bold break-all text-slate-600">
                  {sessionBill.razorpayPaymentId}
                </p>
              </div>
            )}
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
              onClick={() =>
                printBill({
                  tableOrders,
                  tableKey,
                  orderNo: `T${table}`,
                  settings,
                  sessionBill,
                })
              }
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
  const numericValue = Number(value || 0);
  const isNegative = numericValue < 0;

  return (
    <div className="flex items-center justify-between text-sm font-bold">
      <span className="text-slate-500">{label}</span>

      <span
        className={
          discount || isNegative ? "text-emerald-600" : "text-[#111936]"
        }
      >
        {isNegative ? "-" : ""}₹{money(Math.abs(numericValue))}
      </span>
    </div>
  );
}
