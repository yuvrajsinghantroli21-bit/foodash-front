import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import socket from "../socket/socket";

function Cart() {
  const [toast, setToast] = useState(null);
  const [notes, setNotes] = useState({}); // ✅ NEW (for instructions)

  const { cart, addToCart, removeItem, deleteItem, clearCart } =
    useContext(CartContext);

  const table = localStorage.getItem("table");
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => {
    return sum + item.price * item.qty;
  }, 0);

  useEffect(() => {
    socket.on("session-expired", (data) => {
      if (data.table === table) {
        setToast("Session expired. Please scan QR again.");

        localStorage.removeItem("token");
        localStorage.removeItem("table");
        clearCart();

        navigate("/");
      }
    });

    return () => {
      socket.off("session-expired");
    };
  }, []);

  // ✅ HANDLE NOTE CHANGE
  const handleNoteChange = (id, value) => {
    setNotes((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const placeOrder = () => {
    if (!token) {
      setToast("Session expired. Scan QR again.");
      navigate("/");
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
        note: notes[item._id] || "", // ✅ include note
      })),
      status: "pending",
    };

    api
      .post("/orders", order)
      .then(() => {
        setToast("Order placed successfully!");
        clearCart();
        setNotes({});
        navigate(`/order/${token}`);
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setToast("Session expired. Please scan again");

          localStorage.removeItem("token");
          localStorage.removeItem("table");
          clearCart();

          setTimeout(() => {
            navigate("/scan");
          }, 1200);
        } else {
          setToast("Error placing order");
        }
      });
  };

  return (
    <>
      <div className="min-h-screen px-4 py-8 bg-gray-100 dark:bg-slate-950 dark:text-gray-200">
        <div className="max-w-3xl mx-auto">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Cart — Table {table}</h1>

            {/* ✅ ADD MORE ITEMS BUTTON */}
            <button
              onClick={() => navigate("/menu")}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              + Add More Items
            </button>
          </div>

          {cart.length === 0 && (
            <p className="text-gray-400">Your cart is empty</p>
          )}

          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="p-4 bg-white shadow-md rounded-2xl dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p className="text-gray-400">₹{item.price}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => removeItem(item._id)}
                      className="px-3 py-1 bg-gray-200 rounded dark:bg-slate-700"
                    >
                      -
                    </button>

                    <span>{item.qty}</span>

                    <button
                      onClick={() => addToCart(item)}
                      className="px-3 py-1 bg-gray-200 rounded dark:bg-slate-700"
                    >
                      +
                    </button>

                    <button
                      onClick={() => deleteItem(item._id)}
                      className="px-3 py-1 text-white bg-red-500 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* ✅ SPECIAL INSTRUCTION INPUT */}
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Add instructions (e.g. extra spicy)"
                    value={notes[item._id] || ""}
                    onChange={(e) => handleNoteChange(item._id, e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL + CTA */}
          {cart.length > 0 && (
            <div className="p-6 mt-8 bg-white shadow-lg rounded-2xl dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Total</h2>
                <span className="text-2xl font-bold text-emerald-500">
                  ₹{total}
                </span>
              </div>

              <button
                onClick={placeOrder}
                className="w-full py-3 font-semibold text-white transition bg-emerald-500 rounded-xl hover:bg-emerald-600"
              >
                Place Order 🚀
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed z-50 px-6 py-3 text-white bg-red-500 shadow-lg top-5 right-5 rounded-xl animate-bounce">
          <div className="flex items-center gap-4">
            <span>{toast}</span>

            <button onClick={() => setToast(null)} className="font-bold">
              ✖
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Cart;
