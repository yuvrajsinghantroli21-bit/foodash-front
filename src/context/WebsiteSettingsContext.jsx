import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";
import { useParams } from "react-router-dom";

const WebsiteSettingsContext = createContext(null);

export function WebsiteSettingsProvider({ children }) {
  const { restaurantSlug } = useParams();

  const [settings, setSettings] = useState({});

  useEffect(() => {
    if (!settings) return;

    const host = window.location.hostname;
    const path = window.location.pathname;

    const isSuperAdmin = path.startsWith("/superadmin");
    const isFoodDashMainWebsite =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "foodash.com" ||
      host === "www.foodash.com";

    const isRestaurantPage =
      path.startsWith("/r/") ||
      path.startsWith("/admin") ||
      (!isFoodDashMainWebsite && !isSuperAdmin);

    if (!isRestaurantPage || isSuperAdmin) {
      document.title = "FoodDash";
      const favicon = document.querySelector("link[rel='icon']");
      if (favicon) favicon.href = "/favicon.ico";
      return;
    }

    document.title = settings.browserTitle || settings.cafeName || "FoodDash";

    let favicon = document.querySelector("link[rel='icon']");

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    favicon.href = settings.favicon || "/favicon.ico";
  }, [settings]);

  const [loadingSettings, setLoadingSettings] = useState(true);

  const getSlug = () => {
    const fromUrl = restaurantSlug;

    const fromStorage = localStorage.getItem("restaurantSlug");

    const host = window.location.hostname;
    const subdomain =
      host.includes(".localhost") && !host.startsWith("www.")
        ? host.split(".")[0]
        : "";

    return fromUrl || fromStorage || subdomain || "white-house-cafe";
  };

  const fetchPublicSettings = () => {
    const slug = getSlug();

    localStorage.setItem("restaurantSlug", slug);

    setLoadingSettings(true);

    return api
      .get(`/settings/public?slug=${slug}`)
      .then((res) => {
        setSettings(res.data || {});
      })
      .catch((err) => {
        console.log(err);
        setSettings({});
      })
      .finally(() => {
        setLoadingSettings(false);
      });
  };

  useEffect(() => {
    fetchPublicSettings();
  }, [restaurantSlug]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "websiteSettingsUpdated") {
        fetchPublicSettings();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [restaurantSlug]);

  return (
    <WebsiteSettingsContext.Provider
      value={{
        settings,
        setSettings,
        loadingSettings,
        fetchPublicSettings,
      }}
    >
      {children}
    </WebsiteSettingsContext.Provider>
  );
}

export function useWebsiteSettings() {
  const context = useContext(WebsiteSettingsContext);

  if (!context) {
    throw new Error(
      "useWebsiteSettings must be used inside WebsiteSettingsProvider",
    );
  }

  return context;
}
