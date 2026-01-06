import { http } from "../../services/http/client";

export async function getSummary({ from, to } = {}) {
  const res = await http.get("/api/insights/summary", { params: { from, to } });
  return res.data.data;
}

export async function getTop({ from, to, by = "application", limit = 10 } = {}) {
  const res = await http.get("/api/insights/top", {
    params: { from, to, by, limit },
  });
  return res.data.data;
}

export async function getTimeseries({ from, to } = {}) {
  const res = await http.get("/api/insights/timeseries", { params: { from, to } });
  return res.data.data;
}

export async function getHourly({ from, to } = {}) {
  const res = await http.get("/api/insights/hourly", { params: { from, to } });
  return res.data.data;
}
