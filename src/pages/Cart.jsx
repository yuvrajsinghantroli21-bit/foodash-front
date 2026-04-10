import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import socket from "../socket/socket";
import { Trash2 } from "lucide-react";

function Cart() {
  const [toast, setToast] = useState(null);

  const { cart, addToCart, removeItem, deleteItem, clearCart } =
    useContext(CartContext);

  const table = localStorage.getItem("table");
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => {
    return sum + item.price * item.qty;
  }, 0);

  /* ================= SESSION EXPIRE ================= */
  useEffect(() => {
    const currentTable = localStorage.getItem("table");

    socket.on("session-expired", (data) => {
      if (data.table == currentTable) {
        setToast("Session expired. Please scan QR again.");

        localStorage.removeItem("token");
        localStorage.removeItem("table");
        clearCart();

        setTimeout(() => navigate("/scan"), 1200);
      }
    });

    return () => {
      socket.off("session-expired");
    };
  }, []);

  /* ================= PLACE ORDER ================= */
  const placeOrder = () => {
    if (!token) {
      setToast("Session expired. Scan QR again.");
      navigate("/scan");
      return;
    }

    if (cart.length === 0) {
      setToast("Cart is empty");
      return;
    }

    const order = {
      table: table,
      sessionId: token,
      items: cart.map((item) => ({
        name: item.name,
        price: item.price,
        qty: item.qty,
      })),
      status: "pending",
    };

    api
      .post("/orders", order)
      .then(() => {
        setToast("Order placed successfully!");
        clearCart();
        navigate(`/order/${token}`);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setToast("Session expired. Please scan again");

          localStorage.removeItem("token");
          localStorage.removeItem("table");
          clearCart();

          setTimeout(() => navigate("/scan"), 1200);
        } else {
          setToast("Error placing order");
        }
      });
  };

  return (
    <>
      <div className="min-h-screen p-6 text-gray-900 bg-gray-100 dark:bg-slate-950 dark:text-gray-200 md:p-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            🛒 Your Cart
            <span className="block mt-1 text-sm text-gray-500">
              Table {table}
            </span>
          </h1>
        </div>

        {/* EMPTY STATE */}
        {cart.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
            <p className="text-xl">Your cart is empty 🍽️</p>
          </div>
        )}

        {/* CART ITEMS */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT: ITEMS */}
          <div className="space-y-5 lg:col-span-2">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-5 transition-all duration-300 bg-white shadow-md rounded-2xl dark:bg-slate-900 hover:shadow-xl"
              >
                {/* LEFT */}
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="mt-1 font-medium text-emerald-500">
                    ₹{item.price}
                  </p>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-4">
                  {/* QTY CONTROLS */}
                  <div className="flex items-center overflow-hidden bg-gray-100 dark:bg-slate-800 rounded-xl">
                    <button
                      onClick={() => removeItem(item._id)}
                      className="px-3 py-1 text-lg hover:bg-gray-200 dark:hover:bg-slate-700"
                    >
                      −
                    </button>

                    <span className="px-4 font-semibold">{item.qty}</span>

                    <button
                      onClick={() => addToCart(item)}
                      className="px-3 py-1 text-lg hover:bg-gray-200 dark:hover:bg-slate-700"
                    >
                      +
                    </button>
                  </div>

                  {/* DELETE */}
                  <button
                    onClick={() => deleteItem(item._id)}
                    className="p-2 text-white transition bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: SUMMARY */}
          {cart.length > 0 && (
            <div className="sticky p-6 bg-white shadow-xl top-24 h-fit dark:bg-slate-900 rounded-2xl">
              <h2 className="mb-4 text-xl font-bold">Order Summary</h2>

              <div className="space-y-3 text-sm">
                {cart.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <span>
                      {item.name} × {item.qty}
                    </span>
                    <span>₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4 mt-4 text-lg font-bold border-t">
                <span>Total</span>
                <span className="text-emerald-500">₹{total}</span>
              </div>

              <button
                onClick={placeOrder}
                className="w-full py-3 mt-6 font-semibold text-white transition bg-emerald-500 hover:bg-emerald-600 rounded-xl"
              >
                🚀 Place Order
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed z-50 px-6 py-3 text-white bg-black shadow-lg top-6 right-6 rounded-xl animate-slide-in">
          <div className="flex items-center gap-4">
            <span>{toast}</span>
            <button onClick={() => setToast(null)}>✖</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Cart;
