import axios from "axios";

const TOKEN_KEY = "eta_access_token";

const api = axios.create({ baseURL: "/api", withCredentials: true });

let accessToken =
  typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
let refreshPromise = null;
const authFailureListeners = new Set();

export const setAccessToken = (token) => {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
};

export const onAuthFailure = (callback) => {
  authFailureListeners.add(callback);
  return () => authFailureListeners.delete(callback);
};

export const notifyAuthFailure = () => {
  setAccessToken(null);
  authFailureListeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error(e);
    }
  });
};

export const refreshAuth = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = api
    .post("/auth/refresh")
    .then(({ data }) => {
      const newToken = data.data.accessToken;
      setAccessToken(newToken);
      return newToken;
    })
    .catch((err) => {
      notifyAuthFailure();
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (
      error.response?.status !== 401 ||
      request?._retried ||
      request?.url?.includes("/auth/refresh") ||
      request?.url?.includes("/auth/login") ||
      request?.url?.includes("/auth/register")
    ) {
      throw error;
    }
    request._retried = true;
    const token = await refreshAuth();
    request.headers.Authorization = `Bearer ${token}`;
    return api(request);
  },
);

export const getErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => error.response?.data?.message || fallback;

export default api;
