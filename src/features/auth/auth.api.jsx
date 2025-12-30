import { http } from "../../services/http/client";

export async function loginApi({ username, password }) {
  const res = await http.post("/api/auth/login", { username, password });
  // backend: { ok: true, data: { token, profile } }
  return res.data?.data;
}

export async function meApi() {
  const res = await http.get("/api/auth/me");
  // backend: { ok: true, data: user }
  return res.data?.data;
}

export async function registerApi({ username, email, password }) {
  const res = await http.post("/api/auth/register", { username, email, password });
  return res.data?.data;
}

export async function forgotPasswordApi({ username }) {
  const res = await http.post("/api/auth/forgot-password", { username });
  return res.data?.data;
}
