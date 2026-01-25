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

import { getScreenshots } from "../../services/data.api";
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

function truncate(s, n = 70) {
  const t = toText(s);
  if (t.length <= n) return t;
  return t.slice(0, n) + "…";
}

function toSafeUrl(path) {
  if (!path) return null;
  const p = String(path);
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return p; // keep local paths visible + copyable
}

export default function Screenshots() {
  const range = useMemo(() => defaultRangeLast7Days(), []);
  const LIMIT = 100;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [busyMore, setBusyMore] = useState(false);
  const [err, setErr] = useState("");

  const [openShot, setOpenShot] = useState(null);

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
  const openUrl = openShot ? toSafeUrl(openShot.screenshot_url) : null;

  return (
    <Box>
      <PageHeader
        title="Screenshots"
        subtitle={`Default range: ${range.from} → ${range.to} (click screenshot_url to open modal)`}
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

      <ChartCard title="Screenshots" subtitle="Shows file_path + screenshot_url + label + window_title">
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
                    <th>Application</th>
                    <th>Window Title</th>
                    <th>Label</th>
                    <th>File Path</th>
                    <th>Screenshot URL</th>
                    <th>User</th>
                    <th>Dept</th>
                    <th>MAC</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r, idx) => (
                    <tr key={idx}>
                      <td>{toText(r.ts)}</td>
                      <td>{toText(r.application)}</td>
                      <td title={toText(r.window_title)}>{truncate(r.window_title, 60)}</td>
                      <td>{toText(r.label)}</td>
                      <td title={toText(r.file_path)}>{truncate(r.file_path, 60)}</td>

                      <td>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setOpenShot(r)}
                          sx={{ textTransform: "none", fontWeight: 900, px: 0 }}
                        >
                          {truncate(r.screenshot_url, 60)}
                          <Tooltip title="Open screenshot modal">
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

      <Dialog open={!!openShot} onClose={() => setOpenShot(null)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 950 }}>
          Screenshot
          <IconButton onClick={() => setOpenShot(null)} sx={{ position: "absolute", right: 10, top: 10 }} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={0.75} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              <b>TS:</b> {toText(openShot?.ts)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              <b>App:</b> {toText(openShot?.application)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              <b>Window Title:</b> {toText(openShot?.window_title)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              <b>Label:</b> {toText(openShot?.label)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              <b>User:</b> {toText(openShot?.company_username)} &nbsp;•&nbsp; <b>Dept:</b> {toText(openShot?.department)} &nbsp;•&nbsp; <b>MAC:</b>{" "}
              {toText(openShot?.user_mac_id)}
            </Typography>
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
            <Typography sx={{ fontWeight: 900, mb: 0.5 }}>File Path</Typography>
            <Typography sx={{ whiteSpace: "pre-wrap" }}>{toText(openShot?.file_path)}</Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography sx={{ fontWeight: 900, mb: 0.5 }}>Screenshot URL</Typography>
            <Typography sx={{ whiteSpace: "pre-wrap" }}>{toText(openShot?.screenshot_url)}</Typography>

            {openUrl ? (
              <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => window.open(openUrl, "_blank", "noopener,noreferrer")}
                  startIcon={<OpenInNewIcon />}
                  sx={{ fontWeight: 900 }}
                >
                  Open link
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(toText(openShot?.screenshot_url));
                    } catch {}
                  }}
                  sx={{ fontWeight: 900 }}
                >
                  Copy URL
                </Button>
              </Box>
            ) : null}

            {openUrl && (openUrl.startsWith("http://") || openUrl.startsWith("https://")) ? (
              <Box sx={{ mt: 2 }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <img
                    src={openUrl}
                    alt="screenshot"
                    style={{ width: "100%", height: "auto", borderRadius: 8 }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <Typography variant="caption" sx={{ display: "block", opacity: 0.7, mt: 1 }}>
                    Preview works only if screenshot_url is a reachable http(s) URL.
                  </Typography>
                </Paper>
              </Box>
            ) : (
              <Typography variant="caption" sx={{ display: "block", opacity: 0.7, mt: 2 }}>
                Preview needs a reachable http(s) URL. (Your current screenshot_url is a Windows local path.)
              </Typography>
            )}
          </Paper>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenShot(null)} variant="contained" sx={{ fontWeight: 950 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
