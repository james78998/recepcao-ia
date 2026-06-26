import axios from "axios";
import { getToken, setToken, clearToken } from "./tokenStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = [];

function processQueue(error, token = null) {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  queue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const is401 = error.response?.status === 401;
    const isAuthRoute = original.url?.includes('/auth/');

    if (!is401 || isAuthRoute || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post('/auth/refresh');
      setToken(data.accessToken);
      processQueue(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError);
      clearToken();
      window.location.replace('/#/login');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
