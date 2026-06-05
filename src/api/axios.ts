import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url ?? "";

    const isPublicEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/me");

    if (error.response?.status === 401 && !isPublicEndpoint) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
