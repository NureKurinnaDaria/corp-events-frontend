import api from "./axios";

export const categoriesApi = {
  getAll: () => api.get("/categories").then((r) => r.data),
};
