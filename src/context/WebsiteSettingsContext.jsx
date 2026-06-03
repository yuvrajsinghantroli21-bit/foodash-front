import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";
import { useParams } from "react-router-dom";

const WebsiteSettingsContext = createContext(null);

const getSlugFromHost = () => {
  const host = window.location.hostname;

  if (host.endsWith(".localhost") && host !== "localhost") {
    return host.replace(".localhost", "");
  }

  if (
    host.endsWith(".qzora.in") &&
    host !== "qzora.in" &&
    host !== "www.qzora.in"
  ) {
    return host.replace(".qzora.in", "");
  }

  if (
    host.endsWith(".foodash.com") &&
    host !== "foodash.com" &&
    host !== "www.foodash.com"
  ) {
    return host.replace(".foodash.com", "");
  }

  return "";
};

export function WebsiteSettingsProvider({ children }) {
  const { restaurantSlug } = useParams();

  const [settings, setSettings] = useState({});
  const [loadingSettings, setLoadingSettings] = useState(true);

  const getSlug = () => {
    const fromUrl = restaurantSlug;
    const fromHost = getSlugFromHost();
    const fromStorage = localStorage.getItem("restaurantSlug");

    return fromUrl || fromHost || fromStorage || "white-house-cafe";
  };

  useEffect(() => {
    if (!settings) return;

    const host = window.location.hostname;
    const path = window.location.pathname;

    const isSuperAdmin = path.startsWith("/superadmin");

    const isQzoraMainWebsite =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "qzora.in" ||
      host === "www.qzora.in";

    const isFoodDashMainWebsite =
      host === "foodash.com" || host === "www.foodash.com";

    const isMainWebsite = isQzoraMainWebsite || isFoodDashMainWebsite;

    const isRestaurantPage =
      path.startsWith("/r/") ||
      path.startsWith("/admin") ||
      (!isMainWebsite && !isSuperAdmin);

    if (!isRestaurantPage || isSuperAdmin) {
      document.title = "Qzora - Restaurant QR Ordering Platform";

      let favicon = document.querySelector("link[rel='icon']");
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }

      favicon.href = "/qzora_logo.png";
      return;
    }

    document.title =
      settings.browserTitle ||
      settings.cafeName ||
      "Restaurant Website - Qzora";

    let favicon = document.querySelector("link[rel='icon']");

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    favicon.href = settings.favicon || "/favicon.ico";
  }, [settings]);

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

    const handleManualUpdate = () => {
      fetchPublicSettings();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("websiteSettingsUpdated", handleManualUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("websiteSettingsUpdated", handleManualUpdate);
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
