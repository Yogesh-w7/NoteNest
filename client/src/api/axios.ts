import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response.data, // always return just the backend response JSON
  (error) => Promise.reject(error)
);

export default api;
