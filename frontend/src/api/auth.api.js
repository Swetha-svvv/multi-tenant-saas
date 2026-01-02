import api from "./axios";

export const loginApi = (data) =>
  api.post("/auth/login", data);

export const getMeApi = () =>
  api.get("/auth/me");

export const logoutApi = () =>
  api.post("/auth/logout");
