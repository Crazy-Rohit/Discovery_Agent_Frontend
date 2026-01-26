import { http } from "../../services/http/client";

export async function listUsersApi(params = {}) {
  const res = await http.get("/api/users", { params });
  return res.data?.data || [];
}

export async function createUserApi(payload) {
  const res = await http.post("/api/users", payload);
  return res.data?.data;
}

export async function updateUserApi(company_username, payload) {
  const res = await http.patch(`/api/users/${encodeURIComponent(company_username)}`, payload);
  return res.data?.data;
}
