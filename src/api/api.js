import axios from "axios";
import { getRestaurantSlug } from "../utils/getRestaurantSlug";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

const getSlugFromPath = () => {
  const parts = window.location.pathname.split("/");

  if (parts[1] === "r" && parts[2]) {
    return parts[2];
  }

  return "";
};

const getSlugFromHost = () => {
  const host = window.location.hostname;

  if (host.endsWith(".localhost")) {
    return host.replace(".localhost", "");
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

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  const ownerToken = localStorage.getItem("ownerToken");
  const userToken = localStorage.getItem("token");

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (ownerToken) {
    config.headers.Authorization = `Bearer ${ownerToken}`;
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }

  const slugFromPath = getSlugFromPath();
  const slugFromUtil = getRestaurantSlug();
  const slugFromHost = getSlugFromHost();

  const restaurantSlug = slugFromPath || slugFromUtil || slugFromHost;

  if (restaurantSlug) {
    config.headers["x-restaurant-slug"] = restaurantSlug;
  }

  return config;
});

export default api;
