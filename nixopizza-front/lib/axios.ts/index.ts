// import axios from "axios";
// import handleRetryLogic from "./retry";

// const baseURL = process.env.NEXT_PUBLIC_BASE_URL; // This's in the dev;

// // Handle the retrying logic
// const axiosAPI = handleRetryLogic(
//   axios.create({
//     // base URL
//     baseURL: baseURL,
//     // timeout
//     timeout: 5000,
//     // timeout error
//     timeoutErrorMessage: "ERR_TIMEOUT",
//     // credentials
//     withCredentials: true,
//   })
// );

// // verify the user before the req
// axiosAPI.interceptors.request.use((config) => {
//   return config;
// });

// export default axiosAPI;

//api.ts - Combined version for React + Vite
import axios from "axios";
import { getAccessToken, setAccessToken, logout } from "@/hooks/useAuth";
import handleRetryLogic from "./retry";

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL + "/api" || "",
  timeout: 5000,
  timeoutErrorMessage: "ERR_TIMEOUT",
  withCredentials: true,
});

// Apply retry logic first
handleRetryLogic(api);

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const access_token = getAccessToken();
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor variables
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Response interceptor for handling 401 errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors for token refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      // Disable retry for the token refresh process to avoid conflicts
      originalRequest.shouldRetry = false;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            // Re-enable retry for the retried request
            delete originalRequest.shouldRetry;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const res = await api.post("/auth/refresh", {}, { shouldRetry: false });

        const access_token = res.data.accessToken;
        setAccessToken(access_token);
        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        // Re-enable retry for the retried request
        delete originalRequest.shouldRetry;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        logout();
        window.location.href = "/auth/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors, let the retry logic handle them
    return Promise.reject(error);
  }
);

export default api;
