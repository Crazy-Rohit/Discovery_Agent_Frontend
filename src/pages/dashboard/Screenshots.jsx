import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";

import ChartCard from "../../components/charts/ChartCard";
import PageHeader from "../../components/ui/PageHeader";

import { getScreenshots } from "../../services/data.api";
import { defaultRangeLast7Days } from "../../utils/dateRange";

export default function Screenshots() {
  const range = useMemo(() => defaultRangeLast7Days(), []);
  const LIMIT = 100;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [busyMore, setBusyMore] = useState(false);
  const [err, setErr] = useState("");

  async function loadFirst() {
    setLoading(true);
    setErr("");
    try {
      const data = await getScreenshots({ ...range, page: 1, limit: LIMIT });
      setItems(data?.items || []);
      setPage(data?.page || 1);
      setTotal(data?.total || 0);
    } catch (e) {
      setErr(e?.message || "Failed to load screenshots");
      setItems([]);
      setTotal(0);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (busyMore) return;
    setBusyMore(true);
    setErr("");
    try {
      const nextPage = page + 1;
      const data = await getScreenshots({ ...range, page: nextPage, limit: LIMIT });
      setItems((prev) => [...prev, ...(data?.items || [])]);
      setPage(data?.page || nextPage);
      setTotal(data?.total || total);
    } catch (e) {
      setErr(e?.message || "Failed to load more screenshots");
    } finally {
      setBusyMore(false);
    }
  }

  useEffect(() => {
    loadFirst();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canMore = items.length < total;

  return (
    <Box>
      <PageHeader
        title="Screenshots"
        subtitle={`Default range: ${range.from} → ${range.to}`}
        right={
          <Chip
            label={`Loaded: ${items.length}/${total}`}
            variant="outlined"
            sx={{
              borderColor: "rgba(79,209,196,0.22)",
              backgroundColor: "rgba(79,209,196,0.06)",
              color: "rgba(255,255,255,0.78)",
              fontWeight: 900,
            }}
          />
        }
      />

      {err ? (
        <Paper className="glass" elevation={0} sx={{ p: 2, borderColor: "rgba(255,107,107,0.25)" }}>
          <Typography sx={{ fontWeight: 900, color: "rgba(255,107,107,0.95)" }}>{err}</Typography>
        </Paper>
      ) : null}

      <ChartCard
        title="Top Screenshots"
        subtitle="Top 100 per page (View more loads next 100)"
        right={<Chip label="Top 100" size="small" sx={{ fontWeight: 900 }} />}
      >
        {loading ? (
          <Box sx={{ py: 6, display: "grid", placeItems: "center" }}>
            <CircularProgress />
            <Typography className="muted" sx={{ mt: 2 }}>
              Loading screenshots...
            </Typography>
          </Box>
        ) : (
          <>
            <div className="iw-tableWrap">
              <table className="iw-table">
                <thead>
                  <tr>
                    <th>TS</th>
                    <th>Email</th>
                    <th>Dept</th>
                    <th>MAC</th>
                    <th>App</th>
                    <th>Path</th>
                    <th>Caption</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.ts || "-"}</td>
                      <td style={{ fontWeight: 900, color: "rgba(255,255,255,0.92)" }}>
                        {r.company_username || "-"}
                      </td>
                      <td>{r.department || "-"}</td>
                      <td>{r.user_mac_id || "-"}</td>
                      <td>{r.application || "-"}</td>
                      <td>{r.path || "-"}</td>
                      <td>{r.caption || "-"}</td>
                    </tr>
                  ))}

                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 16, color: "rgba(255,255,255,0.70)" }}>
                        No screenshots found for this range.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button variant="contained" onClick={loadMore} disabled={!canMore || busyMore} sx={{ fontWeight: 950 }}>
                {busyMore ? "Loading..." : canMore ? "View more" : "No more"}
              </Button>
            </Box>
          </>
        )}
      </ChartCard>
    </Box>
  );
}
