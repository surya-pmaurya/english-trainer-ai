import axios from "axios";

const api = axios.create({ baseURL: "/api", withCredentials: true });
let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (
      error.response?.status !== 401 ||
      request?._retried ||
      request?.url?.includes("/auth/refresh")
    )
      throw error;
    request._retried = true;
    try {
      refreshPromise ??= api
        .post("/auth/refresh")
        .then(({ data }) => {
          setAccessToken(data.data.accessToken);
          return data.data.accessToken;
        })
        .finally(() => {
          refreshPromise = null;
        });
      const token = await refreshPromise;
      request.headers.Authorization = `Bearer ${token}`;
      return api(request);
    } catch (refreshError) {
      setAccessToken(null);
      throw refreshError;
    }
  },
);

export const getErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => error.response?.data?.message || fallback;

export default api;
