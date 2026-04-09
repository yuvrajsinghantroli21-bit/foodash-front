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
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 p-6">
      <audio ref={audioRef} src="/sound.mp3" />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
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
              className="bg-emerald-500 text-white px-4 py-2 rounded"
            >
              Enable Sound 🔔
            </button>
          )}

          {/* ACTIVE */}
          <Link
            to="/admin/dashboard"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 dark:text-white rounded-lg"
          >
            Active Orders
          </Link>

          <Link to="/admin/history" className="px-4 py-2 bg-gray-300 rounded">
            History
          </Link>
        </div>
      </div>

      {/* TOAST */}
      <div className="fixed top-6 right-6 space-y-3 z-50">
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
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-5"
            >
              <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
                Table {table}
              </h2>

              {tableOrders
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((order, idx) => (
                  <div key={order._id} className="mb-4 border-t pt-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                          Batch #{idx + 1}
                        </span>

                        <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200">
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
                      <div
                        key={i}
                        className="flex justify-between items-center mb-2"
                      >
                        <span className="flex-1">{item.name}</span>

                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateQty(order, i, e.target.value)}
                          className="w-14 text-center border rounded"
                        />

                        <span className="w-20 text-right">
                          ₹{item.price * item.qty}
                        </span>

                        <button
                          onClick={() => deleteItem(order, i)}
                          className="text-red-500 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => updateBatchStatus(order._id, "served")}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Served
                      </button>

                      <button
                        onClick={() => deleteBatch(order._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

              {/* TOTAL */}
              <div className="mt-4 flex justify-between font-bold text-lg">
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
                  className="bg-black text-white px-4 py-2 rounded"
                >
                  Complete
                </button>

                <button
                  onClick={() => deleteTable(tableOrders)}
                  className="bg-red-600 text-white px-4 py-2 rounded"
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
