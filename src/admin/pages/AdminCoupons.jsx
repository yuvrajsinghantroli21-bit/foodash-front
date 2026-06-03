import { useEffect, useState } from "react";
import api from "../../api/api";
import toast from "react-hot-toast";
import {
  BadgePercent,
  Calendar,
  CheckCircle2,
  Clock3,
  Copy,
  Gift,
  Loader2,
  Percent,
  Plus,
  ShieldCheck,
  Tag,
  TicketPercent,
  Trash2,
  Wallet,
  XCircle,
} from "lucide-react";

const initialForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  active: true,
  expiryDate: "",
  usageLimit: "",
  description: "",
  showOnWebsite: true,
  rewardAfterFeedback: false,
};

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = () => {
    setLoading(true);

    api
      .get("/admin/coupons")
      .then((res) => {
        setCoupons(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.log("Coupon fetch error:", err);

        if (err.response?.status === 401) {
          toast.error("Login expired. Please login again.");
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          window.location.href = "/admin/login";
          return;
        }

        toast.error(err.response?.data?.message || "Failed to load coupons");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const createCoupon = (e) => {
    e.preventDefault();

    if (!form.code.trim()) {
      toast.error("Coupon code required");
      return;
    }

    if (!form.discountValue) {
      toast.error("Discount value required");
      return;
    }

    setSaving(true);

    api
      .post("/admin/coupons", {
        ...form,
        code: form.code.toUpperCase(),
        showOnWebsite: form.showOnWebsite,
        rewardAfterFeedback: form.rewardAfterFeedback,
      })
      .then((res) => {
        toast.success("Coupon created");

        setCoupons((prev) => [res.data.coupon, ...prev]);

        setForm(initialForm);
      })
      .catch((err) => {
        console.log(err);

        toast.error(err.response?.data?.message || "Failed to create coupon");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const toggleCoupon = (coupon) => {
    api
      .put(`/admin/coupons/${coupon._id}`, {
        active: !coupon.active,
      })
      .then((res) => {
        setCoupons((prev) =>
          prev.map((item) =>
            item._id === coupon._id ? res.data.coupon : item,
          ),
        );

        toast.success(`Coupon ${coupon.active ? "disabled" : "enabled"}`);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to update coupon");
      });
  };

  const deleteCoupon = (id) => {
    if (!window.confirm("Delete this coupon?")) return;

    api
      .delete(`/admin/coupons/${id}`)
      .then(() => {
        setCoupons((prev) => prev.filter((item) => item._id !== id));

        toast.success("Coupon deleted");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to delete coupon");
      });
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);

    toast.success("Coupon copied");
  };

  const isExpired = (date) => {
    if (!date) return false;

    return new Date(date) < new Date();
  };

  return (
    <div
      className="min-h-screen bg-[#f8f5ef]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <main className="max-w-[1600px] mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[32px] border border-amber-100 bg-[#111936] p-6 text-white shadow-[0_20px_55px_rgba(17,25,54,0.18)] sm:p-7 lg:p-8">
          <div className="absolute rounded-full -right-24 -top-24 h-72 w-72 bg-amber-400/20 blur-3xl" />
          <div className="absolute rounded-full left-20 -bottom-24 h-72 w-72 bg-white/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/10">
                <TicketPercent size={13} />
                Restaurant Offers
              </div>

              <h1
                className="mt-5 text-3xl font-black tracking-[-0.05em] sm:text-4xl lg:text-5xl"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Coupon Management
              </h1>

              <p className="max-w-2xl mt-4 text-sm font-semibold leading-7 text-white/62">
                Create discount campaigns, promotional offers and customer
                rewards for your café.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <HeroMini label="Coupons" value={coupons.length} />

              <HeroMini
                label="Active"
                value={coupons.filter((item) => item.active).length}
              />

              <HeroMini
                label="Expired"
                value={
                  coupons.filter((item) => isExpired(item.expiryDate)).length
                }
              />
            </div>
          </div>
        </section>

        {/* FORM */}
        <section className="mt-6 overflow-hidden rounded-[28px] border border-amber-100 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.06)]">
          <div className="px-5 py-5 border-b border-amber-100 bg-gradient-to-r from-white via-amber-50 to-white">
            <h2
              className="text-2xl font-black tracking-tight text-[#111936]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Create New Coupon
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-400">
              Add percentage or flat discounts for customers.
            </p>
          </div>

          <form
            onSubmit={createCoupon}
            className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3"
          >
            <Input
              label="Coupon Code"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="WELCOME10"
              icon={<Tag size={16} />}
            />

            <Select
              label="Discount Type"
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              icon={<Percent size={16} />}
              options={[
                {
                  label: "Percentage",
                  value: "percentage",
                },
                {
                  label: "Flat",
                  value: "flat",
                },
              ]}
            />

            <Input
              label="Discount Value"
              name="discountValue"
              value={form.discountValue}
              onChange={handleChange}
              type="number"
              placeholder="10"
              icon={<BadgePercent size={16} />}
            />

            <Input
              label="Minimum Order"
              name="minOrderAmount"
              value={form.minOrderAmount}
              onChange={handleChange}
              type="number"
              placeholder="300"
              icon={<Wallet size={16} />}
            />

            <Input
              label="Usage Limit"
              name="usageLimit"
              value={form.usageLimit}
              onChange={handleChange}
              type="number"
              placeholder="100"
              icon={<ShieldCheck size={16} />}
            />

            <Input
              label="Expiry Date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              type="date"
              icon={<Calendar size={16} />}
            />

            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <input
                type="checkbox"
                checked={form.showOnWebsite}
                onChange={(e) =>
                  setForm({
                    ...form,
                    showOnWebsite: e.target.checked,
                  })
                }
              />
              Show on public website
            </label>

            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <input
                type="checkbox"
                checked={form.rewardAfterFeedback}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rewardAfterFeedback: e.target.checked,
                  })
                }
              />
              Give after feedback
            </label>

            <div className="md:col-span-2 xl:col-span-3">
              <Textarea
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Festival offer or special campaign..."
              />
            </div>

            <div className="flex items-center gap-3 md:col-span-2 xl:col-span-3">
              <label className="flex items-center gap-3 text-sm font-bold text-slate-600">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-400"
                />
                Active Coupon
              </label>

              <button
                type="submit"
                disabled={saving}
                className="ml-auto flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#111936] px-6 text-sm font-black text-amber-300 transition hover:bg-[#1b2851] disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Create Coupon
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* LIST */}
        <section className="mt-6">
          {loading ? (
            <div className="flex h-[260px] items-center justify-center rounded-[28px] border border-amber-100 bg-white text-sm font-bold text-slate-400">
              <Loader2 size={18} className="mr-2 animate-spin" />
              Loading coupons...
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex h-[260px] flex-col items-center justify-center rounded-[28px] border border-dashed border-amber-200 bg-white text-center">
              <Gift size={42} className="mb-3 text-amber-300" />

              <h3 className="text-xl font-black text-[#111936]">
                No Coupons Yet
              </h3>

              <p className="mt-2 text-sm font-semibold text-slate-400">
                Create your first promotional offer.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {coupons.map((coupon) => {
                const expired = isExpired(coupon.expiryDate);

                return (
                  <div
                    key={coupon._id}
                    className={`overflow-hidden rounded-[28px] border bg-white shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 ${
                      expired
                        ? "border-red-100"
                        : coupon.active
                          ? "border-emerald-100"
                          : "border-amber-100"
                    }`}
                  >
                    <div
                      className={`p-5 ${
                        expired
                          ? "bg-red-50"
                          : coupon.active
                            ? "bg-emerald-50"
                            : "bg-amber-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-black tracking-tight text-[#111936]">
                              {coupon.code}
                            </h2>

                            <button
                              onClick={() => copyCode(coupon.code)}
                              className="flex items-center justify-center w-8 h-8 transition bg-white rounded-full text-slate-500 hover:text-amber-600"
                            >
                              <Copy size={15} />
                            </button>
                          </div>

                          <p className="mt-2 text-sm font-semibold text-slate-500">
                            {coupon.description || "No description"}
                          </p>
                        </div>

                        {expired ? (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-red-500">
                            Expired
                          </span>
                        ) : coupon.active ? (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-600">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-700">
                            Disabled
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-5">
                        <div className="flex items-center justify-center bg-white h-14 w-14 rounded-2xl text-amber-600">
                          <Gift size={24} />
                        </div>

                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                            Discount
                          </p>

                          <h3 className="mt-1 text-3xl font-black tracking-tight text-[#111936]">
                            {coupon.discountType === "percentage"
                              ? `${coupon.discountValue}%`
                              : `₹${coupon.discountValue}`}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <InfoRow
                        label="Minimum Order"
                        value={`₹${coupon.minOrderAmount || 0}`}
                        icon={<Wallet size={15} />}
                      />

                      <InfoRow
                        label="Usage"
                        value={
                          coupon.usageLimit > 0
                            ? `${coupon.usedCount}/${coupon.usageLimit}`
                            : "Unlimited"
                        }
                        icon={<ShieldCheck size={15} />}
                      />

                      <InfoRow
                        label="Expiry"
                        value={
                          coupon.expiryDate
                            ? new Date(coupon.expiryDate).toLocaleDateString(
                                "en-IN",
                              )
                            : "No expiry"
                        }
                        icon={<Clock3 size={15} />}
                      />

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => toggleCoupon(coupon)}
                          className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-black transition ${
                            coupon.active
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          }`}
                        >
                          {coupon.active ? (
                            <>
                              <XCircle size={16} />
                              Disable
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={16} />
                              Enable
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => deleteCoupon(coupon._id)}
                          className="flex items-center justify-center text-red-500 transition h-11 w-11 rounded-2xl bg-red-50 hover:bg-red-100"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function HeroMini({ label, value }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-300/80">
        {label}
      </p>

      <h3 className="mt-2 text-xl font-black tracking-tight text-white">
        {value}
      </h3>
    </div>
  );
}

function Input({ label, icon, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
        {icon}
        {label}
      </span>

      <input
        {...props}
        className="h-12 w-full rounded-2xl border border-amber-100 bg-[#fffaf1] px-4 text-sm font-bold text-[#111936] outline-none transition placeholder:text-slate-300 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
      />
    </label>
  );
}

function Select({ label, icon, options, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
        {icon}
        {label}
      </span>

      <select
        {...props}
        className="h-12 w-full rounded-2xl border border-amber-100 bg-[#fffaf1] px-4 text-sm font-bold text-[#111936] outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
        <Gift size={16} />
        {label}
      </span>

      <textarea
        {...props}
        rows={4}
        className="w-full resize-none rounded-2xl border border-amber-100 bg-[#fffaf1] px-4 py-3 text-sm font-bold leading-7 text-[#111936] outline-none transition placeholder:text-slate-300 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
      />
    </label>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#faf7f1] px-4 py-3">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-xs font-black uppercase tracking-[0.1em]">
          {label}
        </span>
      </div>

      <span className="text-sm font-black text-[#111936]">{value}</span>
    </div>
  );
}

export default AdminCoupons;
