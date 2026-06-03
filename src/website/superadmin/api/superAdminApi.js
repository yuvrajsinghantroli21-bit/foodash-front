import axios from "axios";

const superAdminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

superAdminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("superAdminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default superAdminApi;
