import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import ChartCard from "../../components/charts/ChartCard";
import PageHeader from "../../components/ui/PageHeader";
import { useUserSelection } from "../../app/providers/UserSelectionProvider";

import { getLogs } from "../../services/data.api";
import { defaultRangeLast7Days } from "../../utils/dateRange";

function toText(v) {
  if (v === null || v === undefined) return "-";
  if (typeof v === "string") return v.trim() ? v : "-";
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function getDetails(r) {
  const v =
    r?.details ??
    r?.detail ??
    r?.meta?.details ??
    r?.meta?.detail ??
    r?.description ??
    r?.message;
  return toText(v);
}

function truncate(s, n = 70) {
  const t = toText(s);
  if (t.length <= n) return t;
  return t.slice(0, n) + "…";
}

export default function Logs() {
  const { selectedUser } = useUserSelection();
  const selectedUserKey =
    selectedUser?.company_username_norm || selectedUser?.company_username || "";

  const range = useMemo(() => defaultRangeLast7Days(), []);
  const LIMIT = 100;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [busyMore, setBusyMore] = useState(false);
  const [err, setErr] = useState("");

  const [openRow, setOpenRow] = useState(null);

  async function loadFirst() {
    setLoading(true);
    setErr("");
    try {
      const data = await getLogs({ ...range, page: 1, limit: LIMIT, user: selectedUserKey || undefined });
      setItems(data?.items || []);
      setPage(data?.page || 1);
      setTotal(data?.total || 0);
    } catch (e) {
      setErr(e?.message || "Failed to load logs");
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
      const data = await getLogs({ ...range, page: nextPage, limit: LIMIT, user: selectedUserKey || undefined });
      setItems((prev) => [...prev, ...(data?.items || [])]);
      setPage(data?.page || nextPage);
      setTotal(data?.total || total);
    } catch (e) {
      setErr(e?.message || "Failed to load more logs");
    } finally {
      setBusyMore(false);
    }
  }

  useEffect(() => {
    if (!selectedUserKey) {
      setLoading(false);
      setErr("Select a user to view logs");
      setItems([]);
      setTotal(0);
      setPage(1);
      return;
    }
    loadFirst();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserKey]);
const canMore = items.length < total;
  const detailsText = openRow ? getDetails(openRow) : "-";

  return (
    <Box>
      <PageHeader
        title="Logs"
        subtitle={`Showing newest first • Default range: ${range.from} → ${range.to}`}
        right={
          <Stack direction="row" spacing={1} alignItems="center">
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
        }
      />

      {err ? (
        <Paper className="glass" elevation={0} sx={{ p: 2, borderColor: "rgba(255,107,107,0.25)" }}>
          <Typography sx={{ fontWeight: 900, color: "rgba(255,107,107,0.95)" }}>{err}</Typography>
        </Paper>
      ) : null}

      <ChartCard title="Logs" subtitle="Click Details to expand" right={<Chip label="RBAC" size="small" />}>
        {loading ? (
          <Box sx={{ py: 6, display: "grid", placeItems: "center" }}>
            <CircularProgress />
            <Typography className="muted" sx={{ mt: 2 }}>
              Loading logs...
            </Typography>
          </Box>
        ) : (
          <>
            <div className="iw-tableWrap">
              <table className="iw-table">
                <thead>
                  <tr>
                    <th>TS</th>
                    <th>Category</th>
                    <th>Operation</th>
                    <th>Application</th>
                    <th>Window Title</th>
                    <th>Details</th>
                    <th>User</th>
                    <th>Dept</th>
                    <th>MAC</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r, idx) => (
                    <tr key={idx}>
                      <td>{toText(r.ts)}</td>
                      <td>{toText(r.category)}</td>
                      <td>{toText(r.operation)}</td>
                      <td>{toText(r.application)}</td>
                      <td title={toText(r.window_title)}>{truncate(r.window_title, 60)}</td>
                      <td>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setOpenRow(r)}
                          sx={{ textTransform: "none", fontWeight: 900, px: 0 }}
                        >
                          {truncate(getDetails(r), 70)}
                          <Tooltip title="Open full details">
                            <OpenInNewIcon sx={{ ml: 0.5, fontSize: 16, opacity: 0.85 }} />
                          </Tooltip>
                        </Button>
                      </td>
                      <td style={{ fontWeight: 900 }}>{toText(r.company_username)}</td>
                      <td>{toText(r.department)}</td>
                      <td>{toText(r.user_mac_id)}</td>
                    </tr>
                  ))}

                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: 16, color: "rgba(255,255,255,0.70)" }}>
                        No logs found for this range.
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

      <Dialog open={!!openRow} onClose={() => setOpenRow(null)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 950 }}>
          Log Details
          <IconButton onClick={() => setOpenRow(null)} sx={{ position: "absolute", right: 10, top: 10 }} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={0.75} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              <b>TS:</b> {toText(openRow?.ts)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              <b>Category:</b> {toText(openRow?.category)} &nbsp;•&nbsp; <b>Operation:</b> {toText(openRow?.operation)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              <b>App:</b> {toText(openRow?.application)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              <b>Window Title:</b> {toText(openRow?.window_title)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              <b>User:</b> {toText(openRow?.company_username)} &nbsp;•&nbsp; <b>Dept:</b> {toText(openRow?.department)} &nbsp;•&nbsp; <b>MAC:</b>{" "}
              {toText(openRow?.user_mac_id)}
            </Typography>
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography
              sx={{
                whiteSpace: "pre-wrap",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              }}
            >
              {detailsText}
            </Typography>
          </Paper>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(detailsText);
              } catch {}
            }}
            variant="outlined"
            sx={{ fontWeight: 900 }}
          >
            Copy
          </Button>
          <Button onClick={() => setOpenRow(null)} variant="contained" sx={{ fontWeight: 950 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
