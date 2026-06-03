import { useEffect, useState } from "react";
import { Copy, Gift, ArrowRight, BadgePercent } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";

function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/coupons/public")
      .then((res) => {
        setCoupons(res.data || []);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to load coupons");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon copied!");
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] px-4 py-14 text-[#2b1609]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#8f561a]">
            Special Café Offers
          </p>

          <h1
            className="mt-3 text-[clamp(3rem,8vw,5.5rem)] font-bold leading-[0.9] tracking-[-0.06em]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Available Coupons
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm font-semibold leading-7 text-[#3d2412]/60">
            Copy a coupon and use it while placing your order from the menu.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center font-bold text-[#3d2412]/50">
            Loading coupons...
          </div>
        ) : coupons.length === 0 ? (
          <div className="rounded-[2rem] border border-[#eadfcd] bg-white/75 p-10 text-center shadow-sm">
            <Gift className="mx-auto mb-4 text-[#8f561a]" size={42} />
            <h2 className="text-xl font-black">No active coupons right now</h2>
            <p className="mt-2 text-sm font-semibold text-[#3d2412]/55">
              Please check again later.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className="relative overflow-hidden rounded-[2rem] border border-[#eadfcd] bg-white/80 p-6 shadow-[0_18px_48px_rgba(61,36,18,0.08)]"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#e7c474]/25 blur-2xl" />

                <div className="relative">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3d2412] text-[#e7c474]">
                    <BadgePercent size={28} />
                  </div>

                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8f561a]">
                    Coupon Code
                  </p>

                  <h2 className="mt-2 text-3xl font-black tracking-tight text-[#3d2412]">
                    {coupon.code}
                  </h2>

                  <p className="mt-4 text-sm font-semibold leading-7 text-[#3d2412]/60">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} OFF`}
                    {coupon.minOrderAmount
                      ? ` on orders above ₹${coupon.minOrderAmount}`
                      : ""}
                  </p>

                  {coupon.expiryDate && (
                    <p className="mt-2 text-xs font-bold text-red-500">
                      Valid till{" "}
                      {new Date(coupon.expiryDate).toLocaleDateString("en-IN")}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      onClick={() => copyCode(coupon.code)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#eadfcd] bg-[#fffaf1] px-4 py-3 text-xs font-black text-[#3d2412]"
                    >
                      <Copy size={15} />
                      Copy
                    </button>

                    <button
                      onClick={() => navigate("/order")}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#3d2412] px-4 py-3 text-xs font-black text-white"
                    >
                      Use
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Coupons;
