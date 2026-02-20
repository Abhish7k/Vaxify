import axios from "axios";

// a central axios instance to use for all api calls with a base config and auth headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

// intercept every req and attach jwt token to it
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // dont send token for auth endpoints (login/signup)
  const isAuthPath = config.url?.includes("/auth/");

  if (token && !isAuthPath) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
