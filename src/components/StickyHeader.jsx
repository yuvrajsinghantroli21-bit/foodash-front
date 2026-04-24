import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

function StickyHeader({ table, totalItems = 0, showCart = true }) {
  return (
    <div className="sticky top-0 z-40" style={{ backgroundColor: "#f5f0e8" }}>
      {/* Top gold line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full shadow-md bg-emerald-500">
            🍽
          </div>

          <div className="flex flex-col leading-tight">
            <span
              className="text-[11px] text-gray-400 tracking-[0.18em] uppercase hidden sm:block"
              style={{ fontFamily: "Georgia, serif" }}
            >
              White House Café
            </span>

            <span className="text-xs font-semibold tracking-wide text-emerald-700">
              Table{" "}
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-bold text-white rounded-full bg-emerald-500 shadow-sm">
                {table || "—"}
              </span>
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* CART */}
          {showCart && (
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-full shadow-md sm:px-5 sm:text-sm bg-emerald-500 hover:bg-emerald-600"
            >
              <ShoppingCart size={15} />
              <span className="hidden sm:inline">Cart</span>

              {totalItems > 0 ? (
                <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-emerald-700 bg-white rounded-full">
                  {totalItems}
                </span>
              ) : (
                <span className="text-xs sm:hidden text-white/80">(0)</span>
              )}
            </Link>
          )}

          {/* MY ORDER */}
          <Link to="/my-order">
            <button className="px-4 py-2 text-white bg-orange-500 rounded-full">
              View My Order
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
