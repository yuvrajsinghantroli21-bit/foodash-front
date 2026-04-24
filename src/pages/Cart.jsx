import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import socket from "../socket/socket";
import StickyHeader from "../components/StickyHeader";
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
} from "lucide-react";

/* ── Decorative divider matching the menu page ── */
const Divider = () => (
  <div className="flex items-center justify-center gap-2 my-2">
    <div className="w-8 h-[1px] bg-amber-400" />
    <span className="text-sm text-amber-500">🌿</span>
    <div className="w-8 h-[1px] bg-amber-400" />
  </div>
);

const TRUST_BADGES = [
  {
    icon: <Leaf size={20} />,
    title: "Fresh Ingredients",
    sub: "Always fresh & healthy",
  },
  {
    icon: <ChefHat size={20} />,
    title: "Expertly Cooked",
    sub: "By our top chefs",
  },
  {
    icon: <Clock size={20} />,
    title: "Fast & Hot",
    sub: "Delivered to your table",
  },
  {
    icon: <Star size={20} />,
    title: "Best Quality",
    sub: "Premium taste guarantee",
  },
];

function Cart() {
  const [notes, setNotes] = useState({});
  const [placing, setPlacing] = useState(false);

  const { cart, addToCart, removeItem, deleteItem, clearCart } =
    useContext(CartContext);

  const table = localStorage.getItem("table");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  /* ── Socket: session expire ── */
  useEffect(() => {
    const handleSessionExpired = (data) => {
      const currentToken = localStorage.getItem("token"); // ✅ always fresh

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
    const currentToken = localStorage.getItem("token"); // ✅ always fresh

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
      sessionId: currentToken, // ✅ FIXED
      total: subtotal,
      items: cart.map((item) => ({
        name: item.name,
        price: item.price,
        qty: item.qty,
        note: notes[item._id] || "",
      })),
      status: "pending",
    };

    api
      .post("/orders", order)
      .then(() => {
        toast.success("Order placed successfully! 🎉");
        clearCart();
        setNotes({});

        setTimeout(() => {
          navigate(`/order/${currentToken}`); // ✅ FIXED
        }, 1200);
      })
      .catch((err) => {
        // ✅ HANDLE EXPIRED SESSION FROM BACKEND
        if (err.response?.status === 401) {
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
    <>
      <div
        className="min-h-screen pb-16"
        style={{ backgroundColor: "#f5f0e8" }}
      >
        <StickyHeader table={table} totalItems={cart.length} />
        {/* ══ Gold top accent ══ */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* ══ PAGE HEADER ══ */}
        <div className="max-w-6xl px-4 pt-8 pb-4 mx-auto sm:px-6">
          {/* <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 mb-4 text-xs text-gray-400 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Menu
          </button> */}

          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-600 text-[11px] tracking-[0.25em] uppercase font-semibold mb-1">
                • Your Order •
              </p>
              <h1
                className="text-3xl font-bold text-gray-900 sm:text-4xl"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Cart — Table {table || "…"}
              </h1>
              <Divider />
            </div>

            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-md transition-all active:scale-95 shrink-0 mt-1"
            >
              <Plus size={15} /> Add Items
            </button>
          </div>
        </div>

        {/* ══ MAIN CONTENT ══ */}
        <div className="px-4 mx-auto max-w-7xl sm:px-6">
          {/* Empty state */}
          {cart.length === 0 && (
            <div className="py-24 text-center">
              <p className="mb-3 text-4xl">🛒</p>
              <p className="text-sm text-gray-400">
                Your cart is empty. Add something delicious!
              </p>
              <button
                onClick={() => navigate(-1)}
                className="mt-5 px-6 py-2.5 bg-emerald-500 text-white rounded-full text-sm font-semibold hover:bg-emerald-600 transition"
              >
                Browse Menu
              </button>
            </div>
          )}

          {cart.length > 0 && (
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              {/* ── LEFT: Cart Items ── */}
              <div className="flex-1 space-y-4">
                {cart.map((item) => {
                  const image = `https://fooadash.onrender.com/uploads/${item.image}`;
                  const isVeg = item.isVeg ?? true;

                  return (
                    <div
                      key={item._id}
                      className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-2xl"
                    >
                      <div className="p-4">
                        {/* TOP ROW: thumbnail + name/price */}
                        <div className="flex gap-3">
                          {/* Thumbnail */}
                          <div className="relative w-16 h-16 shrink-0 sm:w-20 sm:h-20">
                            <img
                              src={image}
                              alt={item.name}
                              className="object-cover w-full h-full rounded-xl"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            <span className="absolute flex items-center justify-center w-4 h-4 bg-white border border-gray-200 rounded-sm shadow-sm top-1 right-1">
                              <span
                                className={`w-2 h-2 rounded-full ${isVeg ? "bg-emerald-500" : "bg-red-500"}`}
                              />
                            </span>
                          </div>

                          {/* Name + price */}
                          <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-bold leading-snug text-gray-800 line-clamp-2">
                              {item.name}
                            </h2>
                            <p className="mt-0.5 text-sm font-semibold text-emerald-500">
                              ₹{item.price}
                            </p>
                          </div>
                        </div>

                        {/* BOTTOM ROW: qty stepper + delete — always on its own row */}
                        <div className="flex items-center justify-between mt-3">
                          {/* Qty stepper */}
                          <div className="flex items-center overflow-hidden border border-gray-200 rounded-full">
                            <button
                              onClick={() => removeItem(item._id)}
                              className="flex items-center justify-center w-8 h-8 text-gray-600 transition hover:bg-gray-100"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-8 text-sm font-semibold text-center text-gray-800">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="flex items-center justify-center w-8 h-8 text-gray-600 transition hover:bg-gray-100"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          {/* Item subtotal */}
                          <span className="text-xs font-medium text-gray-400">
                            ₹{item.price * item.qty}
                          </span>

                          {/* Delete */}
                          <button
                            onClick={() => deleteItem(item._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 rounded-full hover:bg-red-50 transition"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Note input */}
                      <div className="px-4 pb-4">
                        <input
                          type="text"
                          placeholder="Add instruction (e.g. less spicy)"
                          value={notes[item._id] || ""}
                          onChange={(e) =>
                            handleNoteChange(item._id, e.target.value)
                          }
                          className="w-full px-4 py-2.5 text-xs text-gray-500 placeholder-gray-300 border border-gray-100 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition"
                        />
                        <Divider />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── RIGHT: Order Summary ── */}
              <div className="w-full lg:w-80 xl:w-96 shrink-0">
                <div className="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-2xl">
                  <div className="px-6 pt-6 pb-4">
                    <h2
                      className="text-lg font-bold text-center text-gray-900"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      Order Summary
                    </h2>
                    <Divider />
                  </div>

                  {/* Line items */}
                  <div className="px-6 space-y-2.5">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between text-sm text-gray-600"
                      >
                        <span className="truncate max-w-[60%]">
                          {item.name} × {item.qty}
                        </span>
                        <span className="font-medium text-gray-800">
                          ₹{item.price * item.qty}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Subtotal / Tax rows */}
                  <div className="px-6 pt-4 mt-4 space-y-2 border-t border-gray-100">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        Service Charge
                        <span className="text-[10px] text-gray-300 border border-gray-200 rounded-full px-1">
                          i
                        </span>
                      </span>
                      <span>₹0</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        Taxes
                        <span className="text-[10px] text-gray-300 border border-gray-200 rounded-full px-1">
                          i
                        </span>
                      </span>
                      <span>₹0</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between px-6 pt-4 pb-2 mt-3 border-t border-gray-100">
                    <span className="text-base font-bold text-gray-900">
                      Total
                    </span>
                    <span
                      className="text-2xl font-bold text-emerald-500"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      ₹{subtotal}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="px-6 pt-3 pb-5">
                    <button
                      onClick={placeOrder}
                      disabled={placing}
                      className="w-full py-3.5 font-semibold text-white rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {placing ? "Placing Order…" : "Place Order 🚀"}
                    </button>

                    {/* Secure badge */}
                    <div className="flex items-center justify-center gap-2 py-2 mt-3 border border-gray-100 rounded-xl bg-gray-50">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span className="text-[11px] text-gray-400">
                        Secure checkout • Your data is safe with us
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ TRUST BADGES ══ */}
          <div className="grid grid-cols-2 gap-3 mt-10 sm:grid-cols-4">
            {TRUST_BADGES.map((b) => (
              <div
                key={b.title}
                className="flex items-center gap-3 px-5 py-4 bg-white border border-gray-100 shadow-sm rounded-2xl"
              >
                <div className="flex items-center justify-center rounded-full w-9 h-9 bg-amber-50 text-amber-500 shrink-0">
                  {b.icon}
                </div>
                <div>
                  <p className="my-1 text-xs font-semibold text-gray-700">
                    {b.title}
                  </p>
                  <p className="text-[11px] text-gray-400 leading-tight">
                    {b.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Cart;
