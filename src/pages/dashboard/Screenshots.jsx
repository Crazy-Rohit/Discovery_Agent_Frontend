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
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

import PageHeader from "../../components/ui/PageHeader";
import ChartCard from "../../components/charts/ChartCard";

import { getScreenshots } from "../../services/data.api";
import { defaultRangeLast7Days } from "../../utils/dateRange";
import { useUserSelection } from "../../app/providers/UserSelectionProvider";

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

function keyForShot(s) {
  return String(s?.screenshot_url || s?.file_path || s?.ts || Math.random());
}

const QUICK_TAGS = [
  "Email",
  "Chat",
  "Browser",
  "Code",
  "Meeting",
  "Document",
  "Finance",
  "Sensitive",
];

function TagEditor({ tags = [], onAdd, onRemove }) {
  const [draft, setDraft] = useState("");

  return (
    <Box>
      <Typography sx={{ fontWeight: 950, display: "flex", alignItems: "center", gap: 1 }}>
        <LocalOfferOutlinedIcon sx={{ fontSize: 18, opacity: 0.9 }} />
        OCR-ready tags
      </Typography>
      <Typography className="muted" sx={{ fontSize: 12, mt: 0.25 }}>
        These tags are stored in the UI for now (ready to wire with OCR later).
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
        {tags.map((t) => (
          <Chip
            key={t}
            size="small"
            label={t}
            onDelete={() => onRemove(t)}
            sx={{ fontWeight: 900, mb: 0.6 }}
          />
        ))}
        {tags.length === 0 ? (
          <Chip size="small" variant="outlined" label="No tags yet" sx={{ opacity: 0.75 }} />
        ) : null}
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1 }}>
        <TextField
          size="small"
          label="Add tag"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const t = draft.trim();
              if (!t) return;
              onAdd(t);
              setDraft("");
            }
          }}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={() => {
            const t = draft.trim();
            if (!t) return;
            onAdd(t);
            setDraft("");
          }}
          sx={{ fontWeight: 950 }}
        >
          Add
        </Button>
      </Stack>

      <Typography className="muted" sx={{ fontSize: 12, mt: 1 }}>
        Quick tags
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 0.6, flexWrap: "wrap" }}>
        {QUICK_TAGS.map((t) => (
          <Chip
            key={t}
            size="small"
            label={t}
            onClick={() => onAdd(t)}
            variant="outlined"
            sx={{ fontWeight: 900, mb: 0.6, cursor: "pointer" }}
          />
        ))}
      </Stack>
    </Box>
  );
}

export default function Screenshots() {
  const { selectedUser } = useUserSelection();
  const selectedUserKey = selectedUser?.company_username_norm || selectedUser?.company_username || "";

  const defRange = useMemo(() => defaultRangeLast7Days(), []);
  const LIMIT = 120;

  // Filters
  const [from, setFrom] = useState(defRange.from);
  const [to, setTo] = useState(defRange.to);

  const [loading, setLoading] = useState(true);
  const [busyMore, setBusyMore] = useState(false);
  const [err, setErr] = useState("");

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [openShot, setOpenShot] = useState(null);

  // Local (UI-only) OCR tag map: { key -> string[] }
  const [tagMap, setTagMap] = useState({});

  const query = useMemo(
    () => ({
      from,
      to,
      page: 1,
      limit: LIMIT,
      user: selectedUserKey || undefined,
    }),
    [from, to, selectedUserKey]
  );

  async function loadFirst() {
    setLoading(true);
    setErr("");

    if (!selectedUserKey) {
      setLoading(false);
      setErr("Select a user to view screenshots.");
      setItems([]);
      setTotal(0);
      setPage(1);
      return;
    }

    try {
      const data = await getScreenshots(query);
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
    if (!selectedUserKey) return;

    setBusyMore(true);
    setErr("");
    try {
      const nextPage = page + 1;
      const data = await getScreenshots({
        from,
        to,
        page: nextPage,
        limit: LIMIT,
        user: selectedUserKey || undefined,
      });
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
  }, [selectedUserKey]);

  const canMore = items.length < total;
  const openUrl = openShot ? toSafeUrl(openShot.screenshot_url) : null;
  const openKey = openShot ? keyForShot(openShot) : null;
  const openTags = openKey ? tagMap[openKey] || [] : [];

  return (
    <Box>
      <PageHeader
        title="Screenshots Explorer"
        subtitle={selectedUserKey ? `Selected user: ${selectedUserKey}` : "Select a user to begin"}
        right={
          <Chip
            label={`Loaded: ${items.length}/${total}`}
            variant="outlined"
            sx={{
              borderColor: "rgba(79,209,196,0.22)",
              backgroundColor: "rgba(79,209,196,0.06)",
              color: "var(--text)",
              fontWeight: 900,
            }}
          />
        }
      />

      {/* Filters */}
      <Paper className="glass" elevation={0} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              type="date"
              label="From"
              size="small"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              type="date"
              label="To"
              size="small"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => {
                  setFrom(defRange.from);
                  setTo(defRange.to);
                }}
                sx={{ fontWeight: 900 }}
              >
                Reset
              </Button>
              <Button variant="contained" onClick={loadFirst} sx={{ fontWeight: 950 }}>
                Apply
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {err ? (
        <Paper className="glass" elevation={0} sx={{ p: 2, borderColor: "rgba(255,107,107,0.25)", mb: 2 }}>
          <Typography sx={{ fontWeight: 900, color: "rgba(255,107,107,0.95)" }}>{err}</Typography>
        </Paper>
      ) : null}

      <ChartCard title="Thumbnail grid" subtitle="Click a tile to open details and add OCR-ready tags">
        {loading ? (
          <Box sx={{ py: 6, display: "grid", placeItems: "center" }}>
            <CircularProgress />
            <Typography className="muted" sx={{ mt: 2 }}>
              Loading screenshots...
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {items.map((s) => {
                const k = keyForShot(s);
                const url = toSafeUrl(s?.screenshot_url);
                const isHttp = !!url && (url.startsWith("http://") || url.startsWith("https://"));
                const tags = tagMap[k] || [];

                return (
                  <Grid key={k} item xs={12} sm={6} md={4} lg={3}>
                    <Paper
                      className="glass glass-hover"
                      elevation={0}
                      onClick={() => setOpenShot(s)}
                      sx={{
                        p: 1.3,
                        cursor: "pointer",
                        borderRadius: 3,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        minHeight: 260,
                      }}
                    >
                      <Paper
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          overflow: "hidden",
                          height: 150,
                          display: "grid",
                          placeItems: "center",
                          borderColor: "var(--border-2)",
                          background: "rgba(255,255,255,0.03)",
                        }}
                      >
                        {isHttp ? (
                          <img
                            src={url}
                            alt="thumbnail"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <Box sx={{ textAlign: "center", p: 1 }}>
                            <ImageOutlinedIcon sx={{ opacity: 0.75, fontSize: 38 }} />
                            <Typography className="muted" sx={{ fontSize: 12, mt: 0.5 }}>
                              No web preview
                            </Typography>
                          </Box>
                        )}
                      </Paper>

                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 950, fontSize: 13 }}>
                          {truncate(s?.window_title, 40)}
                        </Typography>
                        <Typography className="muted" sx={{ fontSize: 12, mt: 0.25 }}>
                          {toText(s?.application)} • {toText(s?.ts)}
                        </Typography>

                        <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: "wrap" }}>
                          {(tags.length ? tags : ["No tags"]).slice(0, 3).map((t) => (
                            <Chip
                              key={t}
                              size="small"
                              label={t}
                              variant={t === "No tags" ? "outlined" : "filled"}
                              sx={{ fontWeight: 900, mb: 0.6, opacity: t === "No tags" ? 0.75 : 1 }}
                            />
                          ))}
                          {tags.length > 3 ? (
                            <Chip size="small" label={`+${tags.length - 3}`} variant="outlined" sx={{ fontWeight: 900 }} />
                          ) : null}
                        </Stack>
                      </Box>

                      <Divider sx={{ borderColor: "var(--border-2)" }} />
                      <Typography className="muted" sx={{ fontSize: 12 }}>
                        {truncate(s?.screenshot_url || s?.file_path, 44)}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}

              {items.length === 0 ? (
                <Grid item xs={12}>
                  <Paper className="glass" elevation={0} sx={{ p: 2 }}>
                    <Typography className="muted">No screenshots found for this range.</Typography>
                  </Paper>
                </Grid>
              ) : null}
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button variant="contained" onClick={loadMore} disabled={!canMore || busyMore} sx={{ fontWeight: 950 }}>
                {busyMore ? "Loading..." : canMore ? "View more" : "No more"}
              </Button>
            </Box>
          </>
        )}
      </ChartCard>

      {/* Details modal */}
      <Dialog
        open={!!openShot}
        onClose={() => setOpenShot(null)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 950 }}>
          Screenshot details
          <IconButton onClick={() => setOpenShot(null)} sx={{ position: "absolute", right: 10, top: 10 }} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {openShot ? (
            <>
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

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2, borderColor: "var(--border-2)" }}>
                <Typography sx={{ fontWeight: 900, mb: 0.5 }}>File Path</Typography>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>{toText(openShot?.file_path)}</Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2, borderColor: "var(--border-2)" }}>
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
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, borderColor: "var(--border-2)" }}>
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
                    Preview needs a reachable http(s) URL. (Your current screenshot_url is a local path.)
                  </Typography>
                )}
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "var(--border-2)" }}>
                <TagEditor
                  tags={openTags}
                  onAdd={(t) => {
                    const tag = String(t || "").trim();
                    if (!tag) return;

                    setTagMap((prev) => {
                      const next = { ...prev };
                      const existing = new Set(next[openKey] || []);
                      existing.add(tag);
                      next[openKey] = Array.from(existing);
                      return next;
                    });
                  }}
                  onRemove={(t) => {
                    setTagMap((prev) => {
                      const next = { ...prev };
                      next[openKey] = (next[openKey] || []).filter((x) => x !== t);
                      return next;
                    });
                  }}
                />

                <Divider sx={{ my: 1.5, borderColor: "var(--border-2)" }} />

                <Tooltip title="OCR extraction will be wired in Phase 9 backend. UI is ready.">
                  <span>
                    <Button disabled variant="contained" sx={{ fontWeight: 950 }}>
                      Extract text (OCR) — coming soon
                    </Button>
                  </span>
                </Tooltip>
              </Paper>
            </>
          ) : null}
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
