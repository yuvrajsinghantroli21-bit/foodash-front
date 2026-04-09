import { useEffect, useRef } from "react";
import { X } from "lucide-react";

function OrderToast({ order, onClose, soundEnabled }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {
        console.log("🔇 Still blocked");
      });
    }

    const timer = setTimeout(() => {
      onClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed z-50 top-6 right-6">
      <div className="relative p-4 text-white shadow-2xl w-80 bg-emerald-500 rounded-xl animate-slideIn">
        <button onClick={onClose} className="absolute top-2 right-2">
          <X size={18} />
        </button>

        <h2 className="font-bold">New Order 🚀</h2>
        <p className="text-sm">Table: {order.table}</p>
        <p className="text-sm">Items: {order.items.length}</p>

        {/* TIMER BAR */}
        <div className="absolute bottom-0 left-0 h-1 bg-emerald-300 animate-progress" />

        {/* AUDIO */}
        <audio ref={audioRef} src="/sound.mp3" />
      </div>
    </div>
  );
}

export default OrderToast;
