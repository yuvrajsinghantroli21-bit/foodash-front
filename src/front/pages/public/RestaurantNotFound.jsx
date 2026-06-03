import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

function RestaurantNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fff8ec] px-4">
      <div className="max-w-lg rounded-[2rem] border border-amber-100 bg-white p-8 text-center shadow-xl">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-5 text-red-700 bg-red-100 rounded-2xl">
          <AlertTriangle size={32} />
        </div>

        <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-700">
          FoodDash
        </p>

        <h1 className="mt-3 text-3xl font-black text-[#2b160c]">
          Restaurant Not Found
        </h1>

        <p className="mt-3 text-sm font-semibold leading-6 text-stone-500">
          This restaurant link does not exist or has not been registered on
          FoodDash.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-2xl bg-[#3b2114] px-6 py-3 text-sm font-black text-amber-100"
        >
          Go Back
        </Link>
      </div>
    </div>
  );
}

export default RestaurantNotFound;
