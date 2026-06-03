import { Link } from "react-router-dom";
import { Coffee, Home, ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  const isAdmin = window.location.pathname.startsWith("/admin");
  const isSuperAdmin = window.location.pathname.startsWith("/superadmin");

  const homePath = isSuperAdmin
    ? "/superadmin/dashboard"
    : isAdmin
      ? "/admin/menu"
      : "/";

  return (
    <main className="min-h-screen bg-[#fbfaf8] px-4 py-14 text-[#2b160c]">
      <section className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-amber-100 bg-white p-8 shadow-xl">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2b160c] text-amber-200">
            <Compass size={30} />
          </div>

          <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-700">
            404 Not Found
          </p>

          <h1 className="mt-3 text-5xl font-black tracking-[-0.06em]">
            This page wandered away.
          </h1>

          <p className="max-w-xl mt-4 text-sm font-semibold leading-7 text-stone-500">
            The page you are looking for does not exist, has been moved, or is
            not available for this account.
          </p>

          <div className="flex flex-wrap gap-3 mt-7">
            <Link
              to={homePath}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#2b160c] px-5 py-3 text-sm font-black text-amber-100 transition hover:bg-[#3b2114]"
            >
              <Home size={17} />
              Go Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-black transition bg-white border rounded-2xl border-amber-200 text-stone-700 hover:bg-amber-50"
            >
              <ArrowLeft size={17} />
              Go Back
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.4rem] bg-[#2b160c] p-8 text-center text-[#fff5da] shadow-2xl">
          <div className="absolute w-64 h-64 rounded-full -right-20 -top-20 bg-amber-300/20 blur-3xl" />
          <div className="absolute w-64 h-64 rounded-full -bottom-20 -left-20 bg-orange-300/10 blur-3xl" />

          <div className="relative z-10 mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white/10 text-amber-200 ring-1 ring-white/10">
            <Coffee size={52} />
          </div>

          <h2 className="relative z-10 mt-8 text-8xl font-black tracking-[-0.08em] text-amber-200">
            404
          </h2>

          <p className="relative z-10 mt-4 text-sm font-black uppercase tracking-[0.24em] text-amber-100/70">
            FoodDash Route Missing
          </p>
        </div>
      </section>
    </main>
  );
}
