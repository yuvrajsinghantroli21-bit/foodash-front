import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../../api/api";
import { printBill } from "../../../admin/components/PrintBill";
import {
  ArrowLeft,
  BadgeIndianRupee,
  CheckCircle2,
  Clock,
  CreditCard,
  Home,
  Loader2,
  Printer,
  ReceiptText,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";

const money = (value) => Math.round(Number(value || 0)).toLocaleString("en-IN");

const getOrderTotal = (order) => {
  return (order?.items || []).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0,
  );
};

function BillPage() {
  const { billToken } = useParams();

  const [loading, setLoading] = useState(true);
  const [billData, setBillData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!billToken) {
      setError("Bill token is missing.");
      setLoading(false);
      return;
    }

    Promise.all([
      api.get(`/session/bill/${billToken}`),
      api.get("/settings/public").catch(() => ({ data: null })),
    ])
      .then(([billRes, settingsRes]) => {
        setBillData(billRes.data);
        setSettings(settingsRes.data || null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Bill not found.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [billToken]);

  const orders = Array.isArray(billData?.orders) ? billData.orders : [];
  const bill = billData?.bill || {};

  const subtotal = Number(bill.subtotal || 0);
  const discountAmount = Number(bill.discountAmount || 0);
  const chargesTotal = Number(bill.chargesTotal || 0);
  const finalTotal = Number(bill.finalTotal || 0);
  const paidAmount = Number(bill.paidAmount || 0);

  const paymentMode = String(bill.paymentMode || "counter").toLowerCase();
  const paymentStatus = String(bill.paymentStatus || "due").toLowerCase();
  const isPaid = paymentStatus === "paid";

  const totalItems = orders.reduce(
    (sum, order) =>
      sum +
      (order.items || []).reduce(
        (itemSum, item) => itemSum + Number(item.qty || 1),
        0,
      ),
    0,
  );

  const handlePrint = () => {
    if (!orders.length) return;

    printBill({
      tableOrders: orders,
      tableKey: billData?.table || "N/A",
      orderNo: billToken?.slice(-6)?.toUpperCase() || "FINAL",
      settings,
      sessionBill: bill,
    });
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6efe3] text-[#2f1d12]"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        <Loader2 size={42} className="animate-spin text-amber-700" />
        <p className="text-sm font-black tracking-[0.18em] uppercase text-amber-800">
          Loading bill
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#f6efe3] px-4 text-[#2f1d12]"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        <div className="w-full max-w-md rounded-[2rem] border border-red-100 bg-white p-8 text-center shadow-xl">
          <div className="flex items-center justify-center w-16 h-16 mx-auto text-red-500 rounded-full bg-red-50">
            <XCircle size={34} />
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-[-0.04em]">
            Bill not found
          </h1>

          <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
            {error}
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#3d2412] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-amber-100"
          >
            <Home size={16} />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#f6efe3] pb-12 text-[#2f1d12]"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        .bill-display {
          font-family: 'Fraunces', Georgia, serif;
          font-variation-settings: "SOFT" 35, "WONK" 0.2;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(231,196,116,0.32),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(61,36,18,0.16),transparent_38%)]" />
      <div className="absolute rounded-full pointer-events-none -left-24 top-20 h-72 w-72 bg-amber-200/30 blur-3xl" />
      <div className="absolute rounded-full pointer-events-none -right-24 bottom-10 h-80 w-80 bg-orange-200/25 blur-3xl" />

      <main className="relative z-10 max-w-5xl px-4 py-8 mx-auto sm:px-6">
        <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-5 py-2.5 text-sm font-black text-amber-800 shadow-sm transition hover:-translate-y-0.5"
          >
            <ArrowLeft size={16} />
            Back Home
          </Link>

          <button
            type="button"
            onClick={handlePrint}
            disabled={!orders.length}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-[#3d2412] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-amber-100 shadow-[0_16px_35px_rgba(61,36,18,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Printer size={17} />
            Print / Download
          </button>
        </div>

        <section className="overflow-hidden rounded-[2.4rem] border border-[#eadfcd] bg-[#fffaf1]/90 shadow-[0_32px_90px_rgba(61,36,18,0.16)] backdrop-blur-2xl">
          <div className="bg-gradient-to-br from-[#3d2412] via-[#7b3817] to-[#2a170d] px-6 py-8 text-center text-white sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-[#3d2412] shadow-xl">
              {isPaid ? <ShieldCheck size={34} /> : <ReceiptText size={34} />}
            </div>

            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.3em] text-amber-100/70">
              Digital Receipt
            </p>

            <h1 className="bill-display mx-auto mt-3 max-w-2xl text-[clamp(3rem,8vw,5.7rem)] font-[650] leading-[0.88] tracking-[-0.065em] text-amber-50">
              Final Table Bill
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-100">
                Table {billData?.table || "—"}
              </span>

              <span
                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${
                  isPaid
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {isPaid ? "Paid" : "Due"}
              </span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-100">
                #{billToken?.slice(-6)?.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid gap-4 px-5 py-5 sm:grid-cols-4 sm:px-8">
            <InfoCard
              label="Batches"
              value={orders.length}
              icon={<ReceiptText size={17} />}
            />
            <InfoCard
              label="Items"
              value={totalItems}
              icon={<BadgeIndianRupee size={17} />}
            />
            <InfoCard
              label="Mode"
              value={paymentMode === "online" ? "Online" : "At Table"}
              icon={
                paymentMode === "online" ? (
                  <CreditCard size={17} />
                ) : (
                  <Wallet size={17} />
                )
              }
            />
            <InfoCard
              label="Amount"
              value={`₹${money(finalTotal)}`}
              icon={<CheckCircle2 size={17} />}
              dark
            />
          </div>

          <div className="px-5 pb-6 sm:px-8">
            <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
              <div className="space-y-4">
                {orders.map((order, batchIndex) => (
                  <div
                    key={order._id || batchIndex}
                    className="rounded-[1.6rem] border border-amber-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div>
                        <h3 className="text-base font-black text-[#241309]">
                          Batch #{batchIndex + 1}
                        </h3>

                        <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                          <Clock size={13} />
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "—"}
                        </p>
                      </div>

                      <span className="px-3 py-1 text-xs font-black rounded-full bg-amber-50 text-amber-700">
                        ₹{money(getOrderTotal(order))}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(order.items || []).map((item, index) => {
                        const itemTotal =
                          Number(item.price || 0) * Number(item.qty || 1);

                        return (
                          <div
                            key={`${order._id}-${index}`}
                            className="flex items-center justify-between gap-3 rounded-2xl bg-[#fbfaf8] p-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-[#241309]">
                                {item.name || "Item"}
                              </p>

                              <p className="mt-1 text-xs font-semibold text-slate-400">
                                ₹{Number(item.price || 0)} ×{" "}
                                {Number(item.qty || 1)}
                              </p>

                              {item.note && (
                                <p className="mt-1 text-[11px] font-semibold text-amber-700">
                                  Note: {item.note}
                                </p>
                              )}
                            </div>

                            <p className="text-sm font-black shrink-0 text-slate-700">
                              ₹{money(itemTotal)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <aside className="h-fit rounded-[1.8rem] border border-amber-100 bg-white p-5 shadow-sm lg:sticky lg:top-6">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
                  <ReceiptText size={14} />
                  Payment Summary
                </p>

                <div className="space-y-3">
                  <PriceRow label="Subtotal" value={subtotal} />

                  {chargesTotal > 0 && (
                    <PriceRow label="Charges" value={chargesTotal} />
                  )}

                  {(bill.billChargesSnapshot || []).map((charge, index) => (
                    <PriceRow
                      key={`${charge.name}-${index}`}
                      label={charge.name || "Charge"}
                      value={
                        charge.mode === "deduct"
                          ? -charge.amount
                          : charge.amount
                      }
                      discount={charge.mode === "deduct"}
                    />
                  ))}

                  {discountAmount > 0 && (
                    <PriceRow
                      label={
                        bill.coupon?.code
                          ? `Coupon ${bill.coupon.code}`
                          : "Discount"
                      }
                      value={-discountAmount}
                      discount
                    />
                  )}

                  <div className="my-4 border-t border-dashed border-slate-200" />

                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Final Total
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {paymentMode === "online" ? "Online" : "Pay at Table"} ·{" "}
                        {isPaid ? "Paid" : "Due"}
                      </p>
                    </div>

                    <p className="text-4xl font-black tracking-[-0.05em] text-emerald-700">
                      ₹{money(finalTotal)}
                    </p>
                  </div>

                  {isPaid && (
                    <div className="p-4 mt-4 border rounded-2xl border-emerald-100 bg-emerald-50">
                      <p className="flex items-center gap-2 text-sm font-black text-emerald-800">
                        <ShieldCheck size={16} />
                        Payment completed
                      </p>
                      <p className="mt-1 text-xs font-semibold text-emerald-700/75">
                        Paid amount ₹{money(paidAmount || finalTotal)}
                      </p>
                    </div>
                  )}

                  {bill.razorpayPaymentId && (
                    <div className="p-4 mt-4 rounded-2xl bg-slate-50">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Razorpay Payment ID
                      </p>
                      <p className="mt-1 text-xs font-bold break-all text-slate-600">
                        {bill.razorpayPaymentId}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#3d2412] px-5 text-sm font-black uppercase tracking-[0.14em] text-amber-100 shadow-lg transition hover:-translate-y-0.5"
                  >
                    <Printer size={17} />
                    Print / Download
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoCard({ icon, label, value, dark = false }) {
  return (
    <div
      className={`rounded-[1.4rem] border p-4 ${
        dark
          ? "border-[#3d2412] bg-[#3d2412] text-amber-100"
          : "border-amber-100 bg-white text-[#241309]"
      }`}
    >
      <div className={dark ? "text-amber-200" : "text-amber-700"}>{icon}</div>
      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] opacity-60">
        {label}
      </p>
      <p className="mt-1 text-xl font-black tracking-tight">{value}</p>
    </div>
  );
}

function PriceRow({ label, value, discount = false }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm font-bold">
      <span className="text-slate-500">{label}</span>
      <span className={discount ? "text-emerald-600" : "text-[#241309]"}>
        {value < 0 ? "-" : ""}₹{money(Math.abs(Number(value || 0)))}
      </span>
    </div>
  );
}

export default BillPage;
