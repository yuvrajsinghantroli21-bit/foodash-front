import { useEffect } from "react";
import { X } from "lucide-react";

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed z-50 top-6 right-6">
      <div
        className={`w-80 p-4 rounded-xl shadow-2xl text-white relative overflow-hidden
        animate-slideIn ${type === "delete" ? "bg-red-500" : "bg-emerald-500"}`}
      >
        {/* CLOSE BUTTON */}
        <button onClick={onClose} className="absolute top-2 right-2">
          <X size={18} />
        </button>

        {/* MESSAGE */}
        <p className="pr-6">{message}</p>

        {/* TIMER BAR */}
        <div
          className={`absolute bottom-0 left-0 h-1 ${
            type === "delete" ? "bg-red-300" : "bg-emerald-300"
          } animate-progress`}
        />
      </div>
    </div>
  );
}

export default Toast;
