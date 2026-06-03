import { Link } from "react-router-dom";
import { LockKeyhole, Crown, ArrowLeft, Sparkles } from "lucide-react";

export default function UpgradeRequired() {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const plan = adminUser?.plan || "website";

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#fbfaf8] px-4 py-14">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-amber-100 bg-white shadow-xl">
        <div className="relative bg-[#2b160c] px-6 py-10 text-center text-[#fff5da]">
          <div className="absolute w-40 h-40 rounded-full -right-10 -top-10 bg-amber-300/20 blur-3xl" />

          <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-amber-100 text-[#2b160c]">
            <LockKeyhole size={36} />
          </div>

          <p className="relative z-10 mt-5 text-xs font-black uppercase tracking-[0.28em] text-amber-300">
            Premium Feature
          </p>

          <h1 className="relative z-10 mt-3 text-4xl font-black tracking-[-0.05em]">
            Upgrade required
          </h1>

          <p className="relative z-10 max-w-xl mx-auto mt-4 text-sm font-semibold leading-7 text-amber-50/70">
            This page is not included in your current FoodDash plan.
          </p>
        </div>

        <div className="px-6 py-7">
          <div className="rounded-3xl border border-amber-100 bg-[#fffaf2] p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
              Current Plan
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-3">
              <h2 className="text-3xl font-black capitalize text-[#2b160c]">
                {plan} Plan
              </h2>

              <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black tracking-widest uppercase rounded-full bg-amber-100 text-amber-800">
                <Crown size={15} />
                Locked
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold leading-6 text-stone-500">
              Upgrade to a higher plan to unlock advanced operations like
              history, analytics, coupons, feedback, staff, settings and more.
            </p>
          </div>

          <div className="grid gap-3 mt-6 sm:grid-cols-2">
            <Link
              to="/admin/menu"
              className="inline-flex items-center justify-center gap-2 px-5 py-4 text-sm font-black transition bg-white border rounded-2xl border-amber-200 text-stone-700 hover:bg-amber-50"
            >
              <ArrowLeft size={17} />
              Go to Menu
            </Link>

            <a
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2b160c] px-5 py-4 text-sm font-black text-amber-100 transition hover:bg-[#3b2114]"
            >
              <Sparkles size={17} />
              View Plans
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
