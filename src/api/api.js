import axios from "axios";

const api = axios.create({
  baseURL: "https://fooadash.onrender.com/api",
});

export default api;
