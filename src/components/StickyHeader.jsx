import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

function StickyHeader({
  table,
  totalItems = 0,
  showCart = true,
  actionLabel = "My Order",
  actionLink = "/my-order",
}) {
  return (
    <div className="sticky top-0 z-40 bg-[#f5f0e8]">
      {/* Top gold line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

      <div className="flex items-center justify-between px-3 py-2 sm:px-6 sm:py-3">
        {/* LEFT */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-md bg-emerald-500 shrink-0">
            🍽
          </div>

          <div className="flex flex-col leading-tight truncate">
            {/* Hide big title on mobile */}
            <span
              className="hidden text-[11px] text-gray-400 tracking-[0.18em] uppercase sm:block"
              style={{ fontFamily: "Georgia, serif" }}
            >
              White House Café
            </span>

            <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-emerald-700">
              Table{" "}
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-white rounded-full bg-emerald-500 shadow-sm">
                {table || "—"}
              </span>
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 shrink-0">
          {/* CART */}
          {showCart && (
            <Link
              to="/cart"
              className="
                flex items-center gap-1 sm:gap-2
                px-3 py-1.5 sm:px-4 sm:py-2
                text-xs sm:text-sm
                text-white bg-emerald-500 rounded-full
                whitespace-nowrap
              "
            >
              <ShoppingCart size={14} />
              {/* Hide text on very small screens */}
              <span className="hidden sm:inline">Cart ({totalItems})</span>
              <span className="sm:hidden">({totalItems})</span>
            </Link>
          )}

          {/* MAIN BUTTON */}
          <Link to={actionLink}>
            <button
              className="
                px-3 py-1.5 sm:px-4 sm:py-2
                text-xs sm:text-sm
                text-white bg-orange-500 rounded-full
                whitespace-nowrap
              "
            >
              {actionLabel}
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom line */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
    </div>
  );
}

export default StickyHeader;
