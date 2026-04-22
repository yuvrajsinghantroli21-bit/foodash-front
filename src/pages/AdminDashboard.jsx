import { useEffect, useState, useRef } from "react";
import api from "../api/api";
import socket from "../socket/socket";
import { Link } from "react-router-dom";
import OrderToast from "../components/OrderToast";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [orderToasts, setOrderToasts] = useState([]);
  // const [confirmId, setConfirmId] = useState(null);

  const audioRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  /* ================= FETCH ================= */
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");

      const active = res.data.filter(
        (o) => !o.status || o.status.toLowerCase() !== "completed",
      );

      setOrders([...active]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const serveOrder = async (id) => {
    try {
      await api.put(`/orders/${id}/serve`);
    } catch (err) {
      console.log("Error serving order:", err);
    }
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    socket.on("new-order", (order) => {
      setOrders((prev) => [order, ...prev]);
      setOrderToasts((prev) => [...prev, order]);

      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    });

    socket.on("order-updated", (updated) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o)),
      );
    });

    socket.on("order-deleted", (id) => {
      setOrders((prev) => prev.filter((o) => o._id !== id));
    });

    return () => {
      socket.off("new-order");
      socket.off("order-updated");
      socket.off("order-deleted");
    };
  }, [soundEnabled]);

  /* ================= GROUP BY TABLE ================= */
  const grouped = orders.reduce((acc, order) => {
    if (!acc[order.table]) acc[order.table] = [];
    acc[order.table].push(order);
    return acc;
  }, {});

  /* ================= ACTIONS ================= */

  const updateBatchStatus = async (id, status) => {
    try {
      const res = await api.put(`/order/${id}`, { status });

      setOrders((prev) => prev.map((o) => (o._id === id ? res.data : o)));
    } catch (err) {
      console.log(err);
    }
  };

  const deleteBatch = async (id) => {
    try {
      await api.delete(`/order/${id}`);
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const deleteItem = async (order, index) => {
    const newItems = [...order.items];
    newItems.splice(index, 1);

    const res = await api.put(`/order/${order._id}`, {
      items: newItems,
    });

    setOrders((prev) => prev.map((o) => (o._id === order._id ? res.data : o)));
  };

  const updateQty = async (order, index, qty) => {
    const newItems = [...order.items];
    newItems[index].qty = Number(qty);

    const res = await api.put(`/order/${order._id}`, {
      items: newItems,
    });

    setOrders((prev) => prev.map((o) => (o._id === order._id ? res.data : o)));
  };

  const completeTable = async (tableOrders) => {
    for (let o of tableOrders) {
      await api.put(`/order/${o._id}`, { status: "completed" });
    }
    fetchOrders();
  };

  const deleteTable = async (tableOrders) => {
    for (let o of tableOrders) {
      await api.delete(`/order/${o._id}`);
    }
    fetchOrders();
  };

  const removeToast = (i) => {
    setOrderToasts((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-slate-950">
      <audio ref={audioRef} src="/sound.mp3" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>

        <div className="flex gap-4">
          {!soundEnabled && (
            <button
              onClick={() => {
                audioRef.current.play().then(() => {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                  setSoundEnabled(true);
                });
              }}
              className="px-4 py-2 text-white rounded bg-emerald-500"
            >
              Enable Sound 🔔
            </button>
          )}

          <Link
            to="/admin/dashboard"
            className="px-4 py-2 bg-gray-200 rounded-lg dark:bg-gray-800 dark:text-white"
          >
            Active Orders
          </Link>

          <Link to="/admin/history" className="px-4 py-2 bg-gray-300 rounded">
            History
          </Link>
        </div>
      </div>

      {/* TOAST */}
      <div className="fixed z-50 space-y-3 top-6 right-6">
        {orderToasts.map((t, i) => (
          <OrderToast key={i} order={t} onClose={() => removeToast(i)} />
        ))}
      </div>

      {/* TABLE CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.keys(grouped).map((table) => {
          const tableOrders = grouped[table];

          const total = tableOrders.reduce(
            (sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.qty, 0),
            0,
          );

          return (
            <div
              key={table}
              className="p-5 bg-white shadow-xl dark:bg-slate-900 rounded-2xl"
            >
              <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                Table {table}
              </h2>

              {tableOrders
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((order, idx) => (
                  <div key={order._id} className="pt-3 mb-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                          Batch #{idx + 1}
                        </span>

                        <span className="px-2 py-1 text-xs text-gray-800 bg-gray-200 rounded dark:bg-slate-700 dark:text-gray-200">
                          Order #{order._id.slice(-5).toUpperCase()}
                        </span>
                      </div>

                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          order.status === "served"
                            ? "bg-green-500/20 text-green-600 dark:text-green-400"
                            : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {order.status || "pending"}
                      </span>
                    </div>

                    {order.items.map((item, i) => (
                      <div key={i} className="flex flex-col mb-2">
                        {/* EXISTING ROW */}
                        <div className="flex items-center justify-between">
                          <span className="flex-1">{item.name}</span>

                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) =>
                              updateQty(order, i, e.target.value)
                            }
                            className="text-center border rounded w-14"
                          />

                          <span className="w-20 text-right">
                            ₹{item.price * item.qty}
                          </span>

                          <button
                            onClick={() => deleteItem(order, i)}
                            className="ml-2 text-red-500"
                          >
                            ✕
                          </button>
                        </div>

                        {/* ✅ ADDED NOTE DISPLAY */}
                        {item.note && item.note.trim() !== "" && (
                          <p className="mt-1 ml-1 text-xs italic text-emerald-500">
                            📝 {item.note}
                          </p>
                        )}
                      </div>
                    ))}

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          updateBatchStatus(order._id, "served");
                          serveOrder(order._id);
                        }}
                        className="px-3 py-1 text-white bg-green-500 rounded"
                      >
                        Served
                      </button>

                      <button
                        onClick={() => deleteBatch(order._id)}
                        className="px-3 py-1 text-white bg-red-500 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

              {/* TOTAL */}
              <div className="flex justify-between mt-4 text-lg font-bold">
                <span>Total</span>
                <input
                  value={total}
                  readOnly
                  className="w-24 text-right bg-transparent"
                />
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => completeTable(tableOrders)}
                  className="px-4 py-2 text-white bg-black rounded"
                >
                  Complete
                </button>

                <button
                  onClick={() => deleteTable(tableOrders)}
                  className="px-4 py-2 text-white bg-red-600 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminDashboard;
