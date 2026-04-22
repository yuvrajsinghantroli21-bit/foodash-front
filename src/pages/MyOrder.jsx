import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import socket from "../socket";
import toast from "react-hot-toast";

export default function MyOrder() {
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ===============================
  // 📡 Fetch Order
  // ===============================
  const fetchOrder = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await api.get(`/orders/${token}`);
      setOrder(res.data);
    } catch (err) {
      console.log(err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ⚡ Effects
  // ===============================
  useEffect(() => {
    fetchOrder();

    // 🔴 Real-time update
    socket.on("orderUpdated", (updatedOrder) => {
      if (updatedOrder.token === token) {
        setOrder(updatedOrder);

        if (updatedOrder.status === "completed") {
          toast.success("Your order is ready! 🎉");
        }
      }
    });

    return () => {
      socket.off("orderUpdated");
    };
  }, []);

  // ===============================
  // 🧹 Clear session on complete
  // ===============================
  useEffect(() => {
    if (order?.status === "completed") {
      setTimeout(() => {
        localStorage.removeItem("token");
        setOrder(null);
      }, 3000);
    }
  }, [order]);

  // ===============================
  // 🎨 UI
  // ===============================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading your order...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-2xl p-6 mx-auto bg-white shadow-xl rounded-2xl">
        <h2 className="mb-6 text-2xl font-bold text-center">🧾 My Order</h2>

        {/* ❌ No Token */}
        {!token ? (
          <div className="text-center">
            <p className="mb-4 text-gray-500">
              No session found. Please scan QR.
            </p>
            <button
              onClick={() => navigate("/scan")}
              className="px-6 py-2 text-white bg-orange-500 rounded-full"
            >
              Scan QR
            </button>
          </div>
        ) : !order ? (
          /* ❌ No Order */
          <div className="text-center">
            <p className="mb-4 text-gray-500">No active order</p>
            <button
              onClick={() => navigate("/menu")}
              className="px-6 py-2 text-white bg-orange-500 rounded-full"
            >
              Go to Menu
            </button>
          </div>
        ) : (
          <>
            {/* 🛒 Items */}
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between pb-2 border-b">
                  <div>
                    <p className="font-medium">
                      {item.name} × {item.qty}
                    </p>
                    {item.note && (
                      <p className="text-sm text-gray-500">Note: {item.note}</p>
                    )}
                  </div>

                  <p className="font-semibold">₹{item.price * item.qty}</p>
                </div>
              ))}
            </div>

            {/* 💰 Total */}
            <div className="flex justify-between mt-6 text-lg font-bold">
              <span>Total</span>
              <span>₹{order.total}</span>
            </div>

            {/* 📊 Status */}
            <div className="mt-6 text-center">
              <p className="mb-2 text-lg font-semibold">Status</p>

              {order.status === "pending" && (
                <span className="px-4 py-2 text-yellow-800 bg-yellow-200 rounded-full">
                  ⏳ Preparing...
                </span>
              )}

              {order.status === "completed" && (
                <span className="px-4 py-2 text-green-800 bg-green-200 rounded-full">
                  ✅ Completed
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
