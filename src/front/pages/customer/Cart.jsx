import { useContext, useEffect, useState } from "react";
import { CartContext } from "../../../context/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";
import socket from "../../../socket/socket";
import toast from "react-hot-toast";
import {
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Leaf,
  ChefHat,
  Clock,
  Star,
  ArrowLeft,
  ShoppingBag,
  ReceiptText,
  Sparkles,
  TicketPercent,
  Loader2,
} from "lucide-react";

const Divider = () => (
  <div className="flex items-center justify-center my-3" style={{ height: 18 }}>
    <svg
      width="190"
      height="18"
      viewBox="0 0 190 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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

const TRUST_BADGES = [
  {
    icon: <Leaf size={19} />,
    title: "Fresh Ingredients",
    sub: "Prepared with care",
  },
  {
    icon: <ChefHat size={19} />,
    title: "Kitchen Fresh",
    sub: "Sent to café kitchen",
  },
  {
    icon: <Clock size={19} />,
    title: "Table Service",
    sub: "Served warm at table",
  },
  {
    icon: <Star size={19} />,
    title: "Café Quality",
    sub: "Premium casual taste",
  },
];

function Cart() {
  const [notes, setNotes] = useState({});
  const [placing, setPlacing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const { cart, addToCart, removeItem, deleteItem, clearCart } =
    useContext(CartContext);

  const table = localStorage.getItem("table");
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0,
  );

  useEffect(() => {
    setFinalTotal(total - discountAmount);
  }, [total, discountAmount]);

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Enter coupon code");
      return;
    }

    setCouponLoading(true);

    api
      .post("/coupons/validate", {
        code: couponCode,
        total,
      })
      .then((res) => {
        setAppliedCoupon(res.data.coupon);

        setDiscountAmount(Number(res.data.discount || 0));

        setFinalTotal(Number(res.data.finalTotal || total));

        toast.success(
          `Coupon applied • Saved ₹${Math.round(
            Number(res.data.discount || 0),
          )}`,
        );
      })
      .catch((err) => {
        console.log(err);

        setAppliedCoupon(null);
        setDiscountAmount(0);
        setFinalTotal(total);

        toast.error(err.response?.data?.message || "Invalid coupon");
      })
      .finally(() => {
        setCouponLoading(false);
      });
  };

  useEffect(() => {
    const handleSessionExpired = (data) => {
      const currentToken = localStorage.getItem("token");

      if (data.token === currentToken) {
        toast.error("Session expired");
        clearCart();
        localStorage.removeItem("token");
        localStorage.removeItem("table");

        setTimeout(() => {
          navigate("/thank-you");
        }, 1200);
      }
    };

    socket.on("session-expired", handleSessionExpired);

    return () => {
      socket.off("session-expired", handleSessionExpired);
    };
  }, [navigate, clearCart]);

  const handleNoteChange = (id, value) =>
    setNotes((prev) => ({ ...prev, [id]: value }));

  const placeOrder = () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      toast.error("pls scan the qr code to acces this page");
      navigate("/thank-you");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setPlacing(true);

    const order = {
      table,
      sessionId: currentToken,
      token: currentToken,

      subtotal: total,
      discountAmount: discountAmount,
      finalTotal: finalTotal,
      total: finalTotal,

      items: cart.map((item) => ({
        name: item.name,
        price: Number(item.price || 0),
        qty: Number(item.qty || 1),
        note: notes[item._id] || "",
        image: item.image || "",
      })),

      paymentMode: "counter",
      paymentStatus: "due",
      status: "pending",
    };

    api
      .post("/orders", order)
      .then(() => {
        toast.success("Order placed successfully! 🎉");
        clearCart();
        setNotes({});
        setFinalTotal(0);

        setTimeout(() => {
          navigate("/my-order");
        }, 1200);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          if (err.response?.data?.orderLocked) {
            toast.error(
              "Payment already completed. Please ask staff to reopen the table.",
            );
            navigate("/my-order");
            return;
          }
          toast.error("Session expired");
          localStorage.removeItem("token");
          localStorage.removeItem("table");
          clearCart();
          navigate("/thank-you");
        } else {
          toast.error("Error placing order. Try again.");
        }
      })
      .finally(() => setPlacing(false));
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f5f0e8] pb-16 text-[#241309]">
      <div className="pointer-events-none fixed inset-0 opacity-[0.12] bg-[linear-gradient(rgba(65,35,14,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(65,35,14,0.06)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="fixed rounded-full pointer-events-none -left-24 top-10 h-72 w-72 bg-amber-200/30 blur-3xl" />
      <div className="fixed rounded-full pointer-events-none -right-24 bottom-20 h-80 w-80 bg-orange-200/25 blur-3xl" />

      <div className="relative px-4 pt-8 mx-auto max-w-7xl sm:px-6">
        <div className="rounded-[2rem] border border-amber-100/70 bg-[#fffaf1]/75 px-5 py-7 shadow-[0_24px_70px_rgba(61,36,18,0.10)] backdrop-blur-xl sm:px-8">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/60 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-amber-800 shadow-sm">
                <Sparkles size={14} />
                Your Order
              </div>

              <h1
                className="text-4xl font-black leading-[0.95] tracking-[-0.05em] text-[#241309] sm:text-5xl"
                style={{
                  fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif",
                }}
              >
                Cart
                <span className="block bg-gradient-to-r from-[#7b3817] via-[#d2954f] to-[#35190a] bg-clip-text text-transparent">
                  Table {table || "…"}
                </span>
              </h1>

              <Divider />

              <p className="mx-auto max-w-md text-sm leading-6 text-[#7b5b42] sm:mx-0">
                Review your café favourites, add small instructions, and send
                your order directly to the kitchen.
              </p>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-white/80 px-6 py-3 text-sm font-black text-amber-800 shadow-[0_12px_30px_rgba(120,72,20,0.10)] transition-all hover:-translate-y-1 hover:bg-amber-50 active:scale-95"
            >
              <ArrowLeft
                size={17}
                className="transition group-hover:-translate-x-1"
              />
              Add More Items
            </button>
          </div>
        </div>

        {cart.length === 0 && (
          <div className="relative mt-8 rounded-[2rem] border border-amber-100/70 bg-white/80 px-6 py-20 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-amber-50 text-4xl shadow-inner">
              🛒
            </div>

            <h2
              className="mt-5 text-3xl font-black text-[#241309]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Your cart feels light
            </h2>

            <p className="max-w-sm mx-auto mt-3 text-sm leading-6 text-gray-500">
              Add something warm, fresh, and delicious from the menu.
            </p>

            <button
              onClick={() => navigate("/order")}
              className="py-3 text-sm font-black text-white transition rounded-full shadow-lg mt-7 bg-amber-600 px-7 hover:-translate-y-1 hover:bg-amber-700 active:scale-95"
            >
              Browse Menu
            </button>
          </div>
        )}

        {cart.length > 0 && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
            <div className="space-y-4">
              {cart.map((item, index) => {
                const image = item.image;
                const isVeg = item.isVeg ?? item.foodType !== "nonveg";

                return (
                  <div
                    key={item._id}
                    className="group overflow-hidden rounded-[1.7rem] border border-amber-100/70 bg-white shadow-[0_10px_30px_rgba(59,33,24,0.07)] transition-all duration-500 hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_24px_60px_rgba(180,83,9,0.13)]"
                  >
                    <div className="grid gap-4 p-4 sm:grid-cols-[96px_1fr] sm:p-5">
                      <div className="relative h-24 w-full overflow-hidden rounded-[1.25rem] bg-amber-50 sm:h-24 sm:w-24">
                        <img
                          src={image}
                          alt={item.name}
                          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                        <span className="absolute flex items-center justify-center border shadow-lg right-2 top-2 h-7 w-7 rounded-xl bg-white/95 backdrop-blur-xl">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              isVeg ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-700">
                              Item {index + 1}
                            </p>

                            <h2
                              className="mt-1 text-lg font-black leading-tight text-[#241309]"
                              style={{ fontFamily: "Georgia, serif" }}
                            >
                              {item.name}
                            </h2>

                            <p className="mt-1 text-sm font-bold text-amber-700">
                              ₹{item.price} each
                            </p>
                          </div>

                          <button
                            onClick={() => deleteItem(item._id)}
                            className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-100"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                          <div className="flex items-center overflow-hidden rounded-full border border-amber-100 bg-[#fffaf1] shadow-inner">
                            <button
                              onClick={() => removeItem(item._id)}
                              className="flex h-9 w-9 items-center justify-center text-[#7b5b42] transition hover:bg-amber-100"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="w-10 text-center text-sm font-black text-[#241309]">
                              {item.qty}
                            </span>

                            <button
                              onClick={() => addToCart(item)}
                              className="flex h-9 w-9 items-center justify-center text-[#7b5b42] transition hover:bg-amber-100"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="px-4 py-2 text-sm font-black rounded-full bg-amber-50 text-amber-800">
                            ₹{item.price * item.qty}
                          </div>
                        </div>

                        <div className="mt-4">
                          <input
                            type="text"
                            placeholder="Add instruction e.g. less spicy, no onion"
                            value={notes[item._id] || ""}
                            onChange={(e) =>
                              handleNoteChange(item._id, e.target.value)
                            }
                            className="w-full rounded-2xl border border-amber-100 bg-[#fffaf1] px-4 py-3 text-xs font-medium text-gray-600 placeholder:text-gray-400 outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:sticky lg:top-6">
              <div className="overflow-hidden rounded-[2rem] border border-amber-100/70 bg-white shadow-[0_24px_70px_rgba(61,36,18,0.13)]">
                <div className="bg-gradient-to-br from-[#3d2412] to-[#7b3817] px-6 py-6 text-white">
                  <div className="flex items-center justify-center mx-auto h-13 w-13 rounded-2xl bg-white/10 text-amber-200 backdrop-blur-xl">
                    <ReceiptText size={25} />
                  </div>

                  <h2
                    className="mt-4 text-2xl font-black text-center"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  >
                    Order Summary
                  </h2>

                  <p className="mt-1 text-center text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/65">
                    Table {table || "…"} • Counter Payment
                  </p>
                </div>

                <div className="px-6 py-5">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="max-w-[68%] truncate text-gray-500">
                          {item.name} × {item.qty}
                        </span>
                        <span className="font-black text-[#241309]">
                          ₹{item.price * item.qty}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="my-5 border-t border-dashed border-amber-200" />

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>

                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Service Charge</span>
                      <span>₹0</span>
                    </div>

                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Taxes</span>
                      <span>₹0</span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-[#fff7e8] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-[#241309]">
                        Total
                      </span>

                      <span
                        className="text-3xl font-black"
                        style={{
                          fontFamily: "Georgia, serif",
                          background: "linear-gradient(135deg,#b45309,#d97706)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        ₹{subtotal}
                      </span>
                    </div>
                  </div>

                  {/* apply coupon code  */}
                  {/* <div className="w-full p-4 mt-5 overflow-hidden bg-white border shadow-sm rounded-3xl border-amber-100 sm:p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-amber-50 text-amber-700">
                        <TicketPercent size={18} />
                      </div>

                      <div>
                        <h3 className="text-[15px] font-extrabold tracking-tight text-[#111936]">
                          Apply Coupon
                        </h3>
                        <p className="text-xs font-medium text-slate-400">
                          Add a valid offer code to unlock savings
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_110px]">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter code"
                        className="w-full min-w-0 h-12 rounded-2xl border border-amber-100 bg-[#fffaf1] px-4 text-[13px] font-extrabold uppercase tracking-[0.14em] text-[#111936] outline-none transition placeholder:font-semibold placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-300 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                      />

                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={couponLoading}
                        className="flex items-center justify-center w-full h-12 gap-2 px-4 rounded-2xl bg-[#111936] text-[13px] font-extrabold text-amber-300 transition hover:bg-[#1c274f] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {couponLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Wait</span>
                          </>
                        ) : (
                          <>
                            <TicketPercent size={16} />
                            <span>Apply</span>
                          </>
                        )}
                      </button>
                    </div>

                    {appliedCoupon && (
                      <div className="p-4 mt-4 border rounded-2xl border-emerald-100 bg-emerald-50">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">
                              Coupon Applied
                            </p>

                            <h4 className="mt-1 truncate text-lg font-black tracking-tight text-[#111936]">
                              {appliedCoupon.code}
                            </h4>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-[11px] font-bold text-slate-400">
                              Discount
                            </p>

                            <h4 className="text-2xl font-black tracking-tight text-emerald-600">
                              -₹{Math.round(discountAmount)}
                            </h4>
                          </div>
                        </div>
                      </div>
                    )}
                  </div> */}

                  <button
                    onClick={placeOrder}
                    disabled={placing}
                    className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#3d2412] via-[#7b3817] to-[#3d2412] py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_18px_40px_rgba(61,36,18,0.25)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {placing ? "Placing Order…" : "Place Order"}
                  </button>

                  <div className="flex items-center justify-center gap-2 px-4 py-3 mt-4 border rounded-2xl border-amber-100 bg-amber-50/70">
                    <ShieldCheck size={15} className="text-amber-700" />
                    <span className="text-[11px] font-semibold text-gray-500">
                      Your order goes directly to the café kitchen
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-3 min-[401px]:grid-cols-2 lg:grid-cols-4">
          {TRUST_BADGES.map((b) => (
            <div
              key={b.title}
              className="flex flex-col items-center gap-3 px-4 py-5 text-center transition-all border shadow-sm rounded-2xl border-amber-100/70 bg-white/80 hover:-translate-y-1 hover:shadow-md sm:flex-row sm:text-left"
            >
              <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-2xl bg-amber-50 text-amber-700">
                {b.icon}
              </div>

              <div>
                <p className="text-sm font-black text-[#241309]">{b.title}</p>
                <p className="text-xs text-gray-500">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Cart;
