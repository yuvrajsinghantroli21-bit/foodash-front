import { useEffect, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";

function AdminHistory() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [page, setPage] = useState(1);

  const ORDERS_PER_PAGE = 20;

  const fetchOrders = () => {
    api.get("/orders").then((res) => {
      const history = res.data.filter((o) => o.status === "completed");

      // ✅ SORT OLDEST → NEWEST (IMPORTANT FOR BATCH ORDER)
      history.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setOrders(history);
      setFilteredOrders(history);
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const applyFilter = () => {
    if (!fromDate || !toDate) return;

    const start = new Date(fromDate);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });

    setFilteredOrders(filtered);
    setPage(1);
  };

  const handleQuickFilter = (value) => {
    setQuickFilter(value);
    let filtered = [];

    if (value === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      filtered = orders.filter((o) => new Date(o.createdAt) >= start);
    } else if (value === "yesterday") {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);

      filtered = orders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= start && d <= end;
      });
    } else if (value === "7days") {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      filtered = orders.filter((o) => new Date(o.createdAt) >= start);
    } else if (value === "month") {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      filtered = orders.filter((o) => new Date(o.createdAt) >= start);
    } else {
      filtered = orders;
    }

    setFilteredOrders(filtered);
    setPage(1);
  };

  /* ================= 🔥 GROUP BY SESSION ================= */
  const grouped = filteredOrders.reduce((acc, order) => {
    // ✅ FINAL FIX: USE table + first order time as fallback session
    const key =
      order.sessionId ||
      order.token ||
      `${order.table}-${new Date(order.createdAt).toDateString()}`;

    if (!acc[key]) acc[key] = [];
    acc[key].push(order);

    return acc;
  }, {});

  const groupedArray = Object.values(grouped);

  const revenue = filteredOrders.reduce((sum, order) => {
    const orderTotal = order.items.reduce(
      (s, item) => s + item.price * item.qty,
      0,
    );
    return sum + orderTotal;
  }, 0);

  const start = (page - 1) * ORDERS_PER_PAGE;
  const paginatedSessions = groupedArray.slice(start, start + ORDERS_PER_PAGE);
  const totalPages = Math.ceil(groupedArray.length / ORDERS_PER_PAGE);

  const deleteOrder = (id) => {
    const confirm = window.confirm("Delete this order?");
    if (confirm) {
      api.delete(`/order/${id}`).then(() => fetchOrders());
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 text-gray-900 dark:text-gray-200">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 p-6 flex justify-between items-center shadow-lg">
        <h1 className="text-3xl font-bold">Order History</h1>
        <div className="flex gap-4">
          <Link
            to="/admin/dashboard"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 dark:text-white rounded-lg"
          >
            Active Orders
          </Link>
          <Link
            to="/admin/history"
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 dark:text-white rounded-lg"
          >
            History
          </Link>
        </div>
      </div>

      {/* FILTER + REVENUE */}
      <div className="p-8 flex flex-wrap gap-6 items-end">
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-2 rounded text-gray-900 dark:text-gray-200"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-2 rounded text-gray-900 dark:text-gray-200"
          />
        </div>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={applyFilter}
        >
          Apply
        </button>

        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            Quick Filter
          </label>
          <select
            value={quickFilter}
            onChange={(e) => handleQuickFilter(e.target.value)}
            className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-2 rounded text-gray-900 dark:text-gray-200"
          >
            <option value="all">All Orders</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="ml-auto text-right">
          <p className="text-gray-700 dark:text-gray-300 text-sm">Revenue</p>
          <p className="text-2xl font-bold text-green-500">₹{revenue}</p>
        </div>
      </div>

      {/* ORDERS */}
      <div className="px-8 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {paginatedSessions.map((sessionOrders, sessionIndex) => {
          const total = sessionOrders.reduce(
            (sum, order) =>
              sum +
              order.items.reduce((s, item) => s + item.price * item.qty, 0),
            0,
          );

          return (
            <div
              key={sessionIndex}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-xl overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                  Table {sessionOrders[0]?.table}
                </h2>

                <p className="text-xs text-gray-400 mb-4">
                  Session #{sessionIndex + 1}
                </p>

                {sessionOrders.map((order, idx) => (
                  <div key={order._id} className="mb-3 border-t pt-2">
                    <p className="text-xs font-semibold mb-1">
                      Batch #{idx + 1}
                    </p>

                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>
                          {item.name} × {item.qty}
                        </span>
                        <span>₹{item.price * item.qty}</span>
                      </div>
                    ))}

                    <button
                      onClick={() => deleteOrder(order._id)}
                      className="mt-2 bg-red-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Delete Batch
                    </button>
                  </div>
                ))}

                <div className="border-t mt-4 pt-3 flex justify-between font-semibold text-gray-900 dark:text-gray-100">
                  <span>Total</span>
                  <span className="text-green-500">₹{total}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-4 p-10">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="bg-gray-300 dark:bg-gray-700 px-4 py-2 rounded disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-gray-700 dark:text-gray-300">
          Page {page} / {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="bg-gray-300 dark:bg-gray-700 px-4 py-2 rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminHistory;
