import { Link } from "react-router-dom";
import { Clock3, Crown, RefreshCw, Mail } from "lucide-react";

export default function SubscriptionExpired() {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#fbfaf8] px-4 py-14">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-red-100 bg-white shadow-xl">
        <div className="relative bg-[#2b160c] px-6 py-10 text-center text-[#fff5da]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-red-100 text-red-700">
            <Clock3 size={36} />
          </div>

          <p className="mt-5 text-xs font-black uppercase tracking-[0.28em] text-red-200">
            Subscription Expired
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">
            Your FoodDash access is paused
          </h1>

          <p className="max-w-xl mx-auto mt-4 text-sm font-semibold leading-7 text-amber-50/70">
            Your restaurant subscription has expired. Renew your plan to
            continue using admin features and QR ordering.
          </p>
        </div>

        <div className="px-6 py-7">
          <div className="p-5 border border-red-100 rounded-3xl bg-red-50">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
              Current Account
            </p>

            <h2 className="mt-3 text-2xl font-black text-[#2b160c]">
              {adminUser?.name || "Restaurant Admin"}
            </h2>

            <p className="mt-2 text-sm font-bold text-stone-500">
              Plan: {adminUser?.plan || "Unknown"}
            </p>
          </div>

          <div className="grid gap-3 mt-6 sm:grid-cols-2">
            <a
              href={`${import.meta.env.VITE_FOODASH_WEBSITE}/pricing`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2b160c] px-5 py-4 text-sm font-black text-amber-100 transition hover:bg-[#3b2114]"
            >
              <RefreshCw size={17} />
              Renew Plan
            </a>

            <a
              href={`${import.meta.env.VITE_FOODASH_WEBSITE || "http://localhost:5173"}/contact`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-4 text-sm font-black transition bg-white border rounded-2xl border-amber-200 text-stone-700 hover:bg-amber-50"
            >
              <Mail size={17} />
              Contact FoodDash
            </a>
          </div>

          <div className="mt-6 rounded-3xl border border-amber-100 bg-[#fffaf2] p-5">
            <div className="flex items-center gap-3">
              <Crown size={20} className="text-amber-700" />
              <p className="text-sm font-black text-[#2b160c]">
                After renewal, your restaurant will be activated again by the
                FoodDash team.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
