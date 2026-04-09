import { useContext, useEffect, useState } from "react"; // ✅ added useState
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import socket from "../socket/socket";

function Cart() {
  const [toast, setToast] = useState(null); // ✅ moved inside component

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
      if (data.token === token) {
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
        if (err.response?.status === 403) {
          toast.error("Session expired. Please scan again");

          localStorage.removeItem("token");
          localStorage.removeItem("table");
          clearCart();

          setTimeout(() => {
            navigate("/scan");
          }, 1200);
        } else {
          toast.error("Error placing order");
        }
      });
  };

  return (
    <>
      {/* ✅ MAIN UI */}
      <div className="min-h-screen p-8 text-gray-900 bg-gray-100 dark:bg-slate-950 dark:text-gray-200">
        <h1 className="mb-6 text-3xl font-bold">Cart — Table {table}</h1>

        {cart.length === 0 && (
          <p className="text-gray-400">Your cart is empty</p>
        )}

        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-4 bg-white rounded-xl dark:bg-slate-900"
            >
              <div>
                <h2 className="font-semibold">{item.name}</h2>
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
          ))}
        </div>

        {cart.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-xl">Total: ₹{total}</h2>

            <button
              onClick={placeOrder}
              className="px-6 py-3 font-semibold text-white bg-emerald-500 rounded-xl"
            >
              Place Order
            </button>
          </div>
        )}
      </div>

      {/* ✅ TOAST (inside fragment) */}
      {toast && (
        <div className="fixed top-5 right-5 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center gap-4">
            <span>FoodDash: {toast}</span>

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
