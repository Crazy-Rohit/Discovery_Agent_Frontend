import { http } from "../../services/http/client";

export async function loginApi({ username, password }) {
  const res = await http.post("/api/auth/login", { username, password });
  return res.data; // expects { token: "..." } (or similar)
}

export async function meApi() {
  const res = await http.get("/api/auth/me");
  return res.data;
}
