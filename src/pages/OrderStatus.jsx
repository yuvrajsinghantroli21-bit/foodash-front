import { useEffect, useState } from "react";
import api from "../api/api";
import socket from "../socket/socket";

function OrderStatus({ orderId }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/order/${orderId}`).then((res) => setOrder(res.data));

    socket.on("order-updated", (updated) => {
      if (updated._id === orderId) {
        setOrder(updated);
      }
    });
  }, []);

  if (!order) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-[400px]">
        <h1 className="text-2xl font-bold mb-4">Order Status</h1>

        <p>Table: {order.table}</p>
        <p>Status: {order.status}</p>
      </div>
    </div>
  );
}

export default OrderStatus;
