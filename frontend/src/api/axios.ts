import axios from "axios";
import {
  clearSession,
  emitAuthLogout,
  getStoredToken,
  isAuthRequestUrl,
} from "@/lib/auth-session";
import { beginSlowRequestWatch, endSlowRequestWatch } from "./slow-request-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token && !isAuthRequestUrl(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  beginSlowRequestWatch(config);
  return config;
});

api.interceptors.response.use(
  (response) => {
    endSlowRequestWatch(response.config, true);
    return response;
  },
  (error) => {
    endSlowRequestWatch(error.config, false);

    const status = error.response?.status;
    const url = error.config?.url as string | undefined;

    if (status === 401 && !isAuthRequestUrl(url)) {
      clearSession();
      emitAuthLogout();
    }

    return Promise.reject(error);
  },
);

export default api;
