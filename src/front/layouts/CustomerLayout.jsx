import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import api from "../../website/superadmin/api/superAdminApi";
import RestaurantNotFound from "../pages/public/RestaurantNotFound";

function CustomerLayout() {
  const { restaurantSlug } = useParams();
  const [checkingRestaurant, setCheckingRestaurant] = useState(true);
  const [restaurantNotFound, setRestaurantNotFound] = useState(false);

  useEffect(() => {
    if (!restaurantSlug) {
      setCheckingRestaurant(false);
      return;
    }

    setCheckingRestaurant(true);

    api
      .get(`/settings/public`, {
        headers: {
          "x-restaurant-slug": restaurantSlug,
        },
      })
      .then(() => {
        setRestaurantNotFound(false);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setRestaurantNotFound(true);
        }
      })
      .finally(() => {
        setCheckingRestaurant(false);
      });
  }, [restaurantSlug]);

  if (checkingRestaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8ec]">
        <p className="text-sm font-black text-amber-800">
          Checking restaurant...
        </p>
      </div>
    );
  }

  if (restaurantNotFound) {
    return <RestaurantNotFound />;
  }
  return (
    <div className="flex flex-col min-h-screen text-black bg-white dark:bg-slate-950 dark:text-white">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default CustomerLayout;
