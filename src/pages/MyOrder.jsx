import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import socket from "../socket/socket";
import toast from "react-hot-toast";

export default function MyOrder() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]); // 👈 ARRAY now
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ===============================
  // 📡 Fetch Orders (multiple)
  // ===============================
  const fetchOrders = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await api.get(`/orders/${token}`);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ⚡ Effects
  // ===============================
  useEffect(() => {
    fetchOrders();

    socket.on("orderUpdated", (updatedOrder) => {
      if (updatedOrder.token === token) {
        setOrders((prev) => {
          const exists = prev.find((o) => o._id === updatedOrder._id);

          if (exists) {
            return prev.map((o) =>
              o._id === updatedOrder._id ? updatedOrder : o,
            );
          } else {
            // new batch added
            return [...prev, updatedOrder];
          }
        });

        if (updatedOrder.status === "served") {
          toast.success("One batch is served! 🍽️");
        }
      }
    });

    return () => socket.off("orderUpdated");
  }, []);

  // ===============================
  // 🧹 Clear session if all served
  // ===============================
  useEffect(() => {
    if (orders.length > 0 && orders.every((o) => o.status === "completed")) {
      setTimeout(() => {
        localStorage.removeItem("token");
        setOrders([]);
        toast.success("Dining completed 🍽️ Thank you!");
        navigate("/thankyou"); // optional (better UX)
      }, 3000);
    }
  }, [orders]);

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
        ) : orders.length === 0 ? (
          <div className="text-center">
            <p className="mb-4 text-gray-500">No active orders</p>
            <button
              onClick={() => navigate("/menu")}
              className="px-6 py-2 text-white bg-orange-500 rounded-full"
            >
              Go to Menu
            </button>
          </div>
        ) : (
          <>
            {orders.map((order, index) => (
              <div key={order._id} className="mb-6">
                {/* 🟡 Batch Header */}
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">Batch {index + 1}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                {/* 🛒 Items */}
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between pb-2 border-b">
                      <div>
                        <p className="font-medium">
                          {item.name} × {item.qty}
                        </p>
                        {item.note && (
                          <p className="text-sm text-gray-500">
                            Note: {item.note}
                          </p>
                        )}
                      </div>

                      <p className="font-semibold">₹{item.price * item.qty}</p>
                    </div>
                  ))}
                </div>

                {/* 💰 Batch Total */}
                <div className="flex justify-between mt-2 font-semibold">
                  <span>Batch Total</span>
                  <span>
                    ₹
                    {order.total ??
                      order.items.reduce(
                        (sum, item) => sum + item.price * item.qty,
                        0,
                      )}
                  </span>
                </div>

                {/* 📊 Status */}
                <div className="mt-3 text-center">
                  {order.status === "preparing" && (
                    <span className="px-4 py-1 text-blue-800 bg-blue-200 rounded-full animate-pulse">
                      👨‍🍳 Preparing
                    </span>
                  )}

                  {order.status === "served" && (
                    <span className="px-4 py-1 text-green-800 bg-green-200 rounded-full">
                      ✅ Served
                    </span>
                  )}
                </div>

                {/* Divider between batches */}
                {index !== orders.length - 1 && (
                  <hr className="mt-6 border-dashed" />
                )}
              </div>
            ))}

            {/* 🧾 Grand Total */}
            <div className="flex justify-between pt-4 mt-6 text-lg font-bold border-t">
              <span>Total</span>
              <span>
                ₹
                {orders.reduce(
                  (total, order) =>
                    total +
                    (order.total ??
                      order.items.reduce(
                        (sum, item) => sum + item.price * item.qty,
                        0,
                      )),
                  0,
                )}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
