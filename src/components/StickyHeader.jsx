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
    <div className="sticky top-0 z-40 bg-[#faf6ee]">
      <div className="mx-2 border rounded-full border-[#d4a84b55] bg-[#faf6ee] shadow-[0_1px_8px_0_#d4a84b18] sm:mx-4">
        <div className="flex items-center justify-between px-2 py-2 sm:px-3 sm:py-2 min-h-[56px]">
          {/* LEFT */}
          <div className="flex items-center min-w-0 gap-2">
            <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#c9952a]">
              <span className="absolute -top-1 -right-1 rotate-[30deg] text-[9px] leading-none text-[#c9952a]">
                🌿
              </span>
              <span
                className="text-[15px] sm:text-[17px] font-bold leading-none text-[#c9952a]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                W
              </span>
            </div>

            <div className="flex flex-col leading-tight">
              {/* ❌ Hidden on small screen */}
              <span
                className="hidden sm:block text-[11px] font-bold uppercase tracking-[0.11em] text-[#5a3e1b]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                White House Café
              </span>

              {/* ✅ Always visible */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-[11px] text-[#a07840]">
                  Table
                </span>
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#c9952a] text-white text-[10px] font-bold">
                  {table || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* CENTER (unchanged) */}
          <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 select-none items-center gap-2 md:flex">
            <span className="text-[13px] text-[#c9952a]">🌿</span>
            <span
              className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.22em] text-[#a07840]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Good Food · Good Mood
            </span>
            <span className="text-[13px] text-[#c9952a]">🌿</span>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {showCart && (
              <Link
                to="/cart"
                className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-full border border-[#c9952a55] text-[#7a5520] text-[10px] sm:text-xs whitespace-nowrap"
              >
                <ShoppingCart size={13} color="#c9952a" />
                {/* Hide word on very small screens */}
                <span className="hidden xs:inline">Cart</span>
                <span>({totalItems})</span>
              </Link>
            )}

            <Link
              to={actionLink}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-white text-[10px] sm:text-xs bg-gradient-to-br from-[#d4a030] via-[#c9952a] to-[#a87420] whitespace-nowrap"
            >
              <span>{actionLabel}</span>
              <span className="text-[12px]">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StickyHeader;
