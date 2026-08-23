import axios from "axios";
import { ENDPOINTS_AUTH } from "./endpoints/Auth";
import { useAlertStore } from "../context/alertStore";
import { globalLogout } from "../context/AuthContext";
import { globalNavigate } from "../utils/NavigationHandler";

// Routes that should never trigger the token refresh flow
const AUTH_ROUTES = [
  ENDPOINTS_AUTH.LOGIN,
  ENDPOINTS_AUTH.SIGNUP,
  ENDPOINTS_AUTH.VERIFY_EMAIL,
  ENDPOINTS_AUTH.RESEND_VERIFICATION_EMAIL,
  ENDPOINTS_AUTH.REFRESH_TOKEN,
];

const isAuthRoute = (url = "") =>
  AUTH_ROUTES.some((route) => url.includes(route));

// Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Only attempt refresh for 401s on protected (non-auth) routes
    // and only once per request (prevent infinite loops)
    if (
      status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute(originalRequest.url)
    ) {
      originalRequest._retry = true;

      console.log("Access token expired. Attempting refresh...");

      try {
        // Call the refresh endpoint
        // No need to send data, cookies are handled automatically by withCredentials: true
        await api.post(ENDPOINTS_AUTH.REFRESH_TOKEN);

        console.log("Access token refreshed successfully.");

        // Retry the original failed request
        // The browser will now have the new access_token cookie
        return api(originalRequest);
      } catch (refreshError) {
        console.error(
          "Token refresh failed:",
          refreshError.response?.data?.message || refreshError.message,
        );

        // Show session-expired message
        useAlertStore
          .getState()
          .showAlert("Your session has expired. Please log in again.");

        // Clear auth state and redirect
        if (globalLogout) globalLogout();

        if (globalNavigate) {
          globalNavigate("/login");
        } else {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // For auth routes (login, signup, etc.) or already-retried requests,
    // just pass the error through so the calling component handles it normally
    return Promise.reject(error);
  },
);

export default api;
