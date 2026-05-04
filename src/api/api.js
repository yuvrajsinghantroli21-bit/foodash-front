import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:5000/api",
  // production:
  baseURL: "https://fooadash.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("token");

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }

  return config;
});

export default api;
