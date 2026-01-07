import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import ChartCard from "../../components/charts/ChartCard";
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
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "end" }} sx={{ mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 950, fontSize: 22 }}>Screenshots</Typography>
          <Typography variant="caption" className="muted">
            Default range: {range.from} → {range.to}
          </Typography>
        </Box>

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
      </Stack>

      {err ? (
        <Paper className="glass" elevation={0} sx={{ p: 2, mb: 2, borderColor: "rgba(255,107,107,0.25)" }}>
          <Typography sx={{ fontWeight: 900, color: "rgba(255,107,107,0.95)" }}>{err}</Typography>
        </Paper>
      ) : null}

      <ChartCard title="Top Screenshots" subtitle="Top 100 per page (View more loads next 100)">
        {loading ? (
          <Box sx={{ py: 6, display: "grid", placeItems: "center" }}>
            <CircularProgress />
            <Typography className="muted" sx={{ mt: 2 }}>Loading screenshots...</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "rgba(255,255,255,0.72)", fontWeight: 900 }}>TS</TableCell>
                    <TableCell sx={{ color: "rgba(255,255,255,0.72)", fontWeight: 900 }}>Email</TableCell>
                    <TableCell sx={{ color: "rgba(255,255,255,0.72)", fontWeight: 900 }}>Dept</TableCell>
                    <TableCell sx={{ color: "rgba(255,255,255,0.72)", fontWeight: 900 }}>MAC</TableCell>
                    <TableCell sx={{ color: "rgba(255,255,255,0.72)", fontWeight: 900 }}>App</TableCell>
                    <TableCell sx={{ color: "rgba(255,255,255,0.72)", fontWeight: 900 }}>Path</TableCell>
                    <TableCell sx={{ color: "rgba(255,255,255,0.72)", fontWeight: 900 }}>Caption</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((r, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ color: "rgba(255,255,255,0.80)" }}>{r.ts || "-"}</TableCell>
                      <TableCell sx={{ color: "rgba(255,255,255,0.90)", fontWeight: 800 }}>{r.company_username || "-"}</TableCell>
                      <TableCell sx={{ color: "rgba(255,255,255,0.78)" }}>{r.department || "-"}</TableCell>
                      <TableCell sx={{ color: "rgba(255,255,255,0.78)" }}>{r.user_mac_id || "-"}</TableCell>
                      <TableCell sx={{ color: "rgba(255,255,255,0.78)" }}>{r.application || "-"}</TableCell>
                      <TableCell sx={{ color: "rgba(255,255,255,0.78)" }}>{r.path || "-"}</TableCell>
                      <TableCell sx={{ color: "rgba(255,255,255,0.78)" }}>{r.caption || "-"}</TableCell>
                    </TableRow>
                  ))}

                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ color: "rgba(255,255,255,0.70)", py: 4 }}>
                        No screenshots found for this range.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                onClick={loadMore}
                disabled={!canMore || busyMore}
                sx={{ fontWeight: 950 }}
              >
                {busyMore ? "Loading..." : canMore ? "View more" : "No more"}
              </Button>
            </Box>
          </>
        )}
      </ChartCard>
    </Box>
  );
}
