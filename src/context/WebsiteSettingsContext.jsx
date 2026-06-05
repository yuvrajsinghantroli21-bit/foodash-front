import { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../api/api";
import { useParams } from "react-router-dom";

const WebsiteSettingsContext = createContext(null);

const MAIN_TITLE = "Qzora - Restaurant QR Ordering Platform";

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

const isRestaurantRoute = () => {
  const host = window.location.hostname;
  const path = window.location.pathname;

  const isSuperAdmin = path.startsWith("/superadmin");

  const isMainWebsite =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "qzora.in" ||
    host === "www.qzora.in" ||
    host === "foodash.com" ||
    host === "www.foodash.com";

  return (
    !isSuperAdmin &&
    (path.startsWith("/r/") || path.startsWith("/admin") || !isMainWebsite)
  );
};

export function WebsiteSettingsProvider({ children }) {
  const { restaurantSlug } = useParams();

  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const requestIdRef = useRef(0);

  const getSlug = () => {
    const fromUrl = restaurantSlug;
    const fromHost = getSlugFromHost();
    const fromStorage = localStorage.getItem("restaurantSlug");

    return fromUrl || fromHost || fromStorage || "white-house-cafe";
  };

  const setFavicon = (href) => {
    let favicon = document.querySelector("link[rel='icon']");

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    favicon.href = href;
  };

  useEffect(() => {
    if (loadingSettings) return;

    if (!isRestaurantRoute()) {
      document.title = MAIN_TITLE;
      setFavicon("/qzoralogo1.png");
      return;
    }

    document.title =
      settings?.browserTitle ||
      settings?.cafeName ||
      "Restaurant Website - Qzora";

    setFavicon(settings?.favicon || "/favicon.ico");
  }, [settings, loadingSettings]);

  const fetchPublicSettings = () => {
    const slug = getSlug();
    const currentRequestId = requestIdRef.current + 1;

    requestIdRef.current = currentRequestId;
    localStorage.setItem("restaurantSlug", slug);
    setLoadingSettings(true);

    const start = Date.now();
    const MIN_LOADING_MS = 100;
    const MAX_LOADING_MS = 1200;

    return api
      .get(`/settings/public?slug=${slug}`)
      .then((res) => {
        if (requestIdRef.current !== currentRequestId) return;
        setSettings(res.data || {});
      })
      .catch((err) => {
        console.log(err);
        if (requestIdRef.current !== currentRequestId) return;
        setSettings({});
      })
      .finally(() => {
        if (requestIdRef.current !== currentRequestId) return;

        const elapsed = Date.now() - start;
        const delay = Math.max(0, MIN_LOADING_MS - elapsed);

        setTimeout(
          () => {
            if (requestIdRef.current === currentRequestId) {
              setLoadingSettings(false);
            }
          },
          Math.min(delay, MAX_LOADING_MS),
        );
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
        settings: settings || {},
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
