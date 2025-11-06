import axios from "axios";

export const env =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8081/api/v1";

export const api = axios.create({
  baseURL: env,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    try {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const url = err?.config?.url;
      const method = err?.config?.method?.toUpperCase?.() || "REQ";
      console.warn(`[API] ${status || "ERR"} ${method} ${url}`, data || err?.message);
    } catch {}
    return Promise.reject(err);
  }
);