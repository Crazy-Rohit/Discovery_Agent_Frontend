import { http } from "../../services/http/client";

export async function getSummary({ from, to, scope_user, scope_department }) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;

  // optional: pass scope if your backend supports it (safe to keep)
  if (scope_user) params.user = scope_user;
  if (scope_department) params.department = scope_department;

  const res = await http.get("/api/insights/summary", { params });
return res.data?.data;

}
