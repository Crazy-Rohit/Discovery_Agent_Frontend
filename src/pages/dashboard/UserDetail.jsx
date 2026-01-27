import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";

import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import { useUserSelection } from "../../app/providers/UserSelectionProvider";

import ChartCard from "../../components/charts/ChartCard";
import ActivityTrendLine from "../../components/charts/ActivityTrendLine";
import TopBarChart from "../../components/charts/TopBarChart";
import CategoryPie from "../../components/charts/CategoryPie";

import { getUserApi, getUserAnalysisApi } from "../../features/users/users.api";
import { getLogs, getScreenshots } from "../../services/data.api";

function ymdLocal(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function defaultLast7() {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 6);
  return { from: ymdLocal(from), to: ymdLocal(to) };
}

function formatNumber(n) {
  return Number(n || 0).toLocaleString();
}

function formatMinutesToHrs(mins) {
  const m = Math.max(0, Math.floor(Number(mins || 0)));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h <= 0) return `${r}m`;
  return `${h}h ${r}m`;
}

function KpiRow({ analysis }) {
  const k = analysis?.kpis || {};
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1} flexWrap="wrap" useFlexGap>
      <Chip variant="outlined" label={`Active: ${formatMinutesToHrs(k.total_active_minutes)}`} />
      <Chip variant="outlined" label={`Logs: ${formatNumber(k.logs)}`} />
      <Chip variant="outlined" label={`Screenshots: ${formatNumber(k.screenshots)}`} />
      <Chip variant="outlined" label={`Apps: ${formatNumber(k.total_apps)}`} />
      <Chip variant="outlined" label={`Most used: ${k.most_used_app || "—"}`} />
      <Chip variant="outlined" label={`Top category: ${k.top_category || "—"}`} />
      <Chip
        variant="outlined"
        icon={<UpdateRoundedIcon fontSize="small" />}
        label={`Updated: ${k.last_updated || "—"}`}
      />
    </Stack>
  );
}

function LogsTable({ rows = [] }) {
  return (
    <Box className="iw-tableWrap">
      <table className="iw-table">
        <thead>
          <tr>
            <th>ts</th>
            <th>application</th>
            <th>window_title</th>
            <th>category</th>
            <th>operation</th>
            <th>details</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={6} className="muted">No logs.</td></tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={`${r.ts || ""}_${idx}`}>
                <td style={{ whiteSpace: "nowrap" }}>{r.ts || "—"}</td>
                <td>{r.application || "—"}</td>
                <td title={r.window_title || ""}>{r.window_title || "—"}</td>
                <td>{r.category || "—"}</td>
                <td>{r.operation || "—"}</td>
                <td title={r.details || ""}>{r.details || r.detail || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Box>
  );
}

function ScreensTable({ rows = [] }) {
  return (
    <Box className="iw-tableWrap">
      <table className="iw-table">
        <thead>
          <tr>
            <th>ts</th>
            <th>application</th>
            <th>window_title</th>
            <th>label</th>
            <th>file_path</th>
            <th>screenshot_url</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={6} className="muted">No screenshots.</td></tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={`${r.ts || ""}_${idx}`}>
                <td style={{ whiteSpace: "nowrap" }}>{r.ts || "—"}</td>
                <td>{r.application || "—"}</td>
                <td title={r.window_title || ""}>{r.window_title || "—"}</td>
                <td>{r.label || "—"}</td>
                <td title={r.file_path || ""}>{r.file_path || "—"}</td>
                <td title={r.screenshot_url || ""}>{r.screenshot_url || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Box>
  );
}

export default function UserDetail() {
  const nav = useNavigate();
  const { selectedUser, setSelectedUser } = useUserSelection();
  const { company_username } = useParams();

  const def = useMemo(() => defaultLast7(), []);
  const [from, setFrom] = useState(def.from);
  const [to, setTo] = useState(def.to);
  const [applied, setApplied] = useState(def);

  const [tab, setTab] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [logs, setLogs] = useState({ items: [], total: 0 });
  const [shots, setShots] = useState({ items: [], total: 0 });

  const params = useMemo(() => ({ from: applied.from, to: applied.to }), [applied]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const u = await getUserApi(company_username);
        if (!mounted) return;
        setUser(u);

        // keep global selected-user context in sync (enables UserScopedRoute pages)
        setSelectedUser({
          company_username_norm: u?.company_username_norm || u?.company_username || company_username,
          company_username: u?.company_username || u?.company_username_norm || company_username,
          full_name: u?.full_name || "",
          department: u?.department || "",
          user_mac_id: u?.user_mac_id || "",
          role_key: u?.role_key || "",
        });

        const a = await getUserAnalysisApi(company_username, params);
        if (!mounted) return;
        setAnalysis(a);

        // For logs/screenshots we filter by company_username (backend translates + scope checks)
        const [l, s] = await Promise.all([
          getLogs({ ...params, company_username, page: 1, limit: 200 }),
          getScreenshots({ ...params, company_username, page: 1, limit: 200 }),
        ]);

        if (!mounted) return;
        setLogs(l || { items: [], total: 0 });
        setShots(s || { items: [], total: 0 });
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load user detail.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [company_username, params, setSelectedUser]);

  const title = user?.full_name || user?.company_username_norm || user?.company_username || "User";

  const charts = analysis?.charts || {};
  const topAppsItems = charts?.top_apps?.items || [];
  const topCatsItems = charts?.top_categories?.items || [];

  // category distribution for donut: reuse items from top_categories (good enough for user page)
  const catPieItems = topCatsItems.slice(0, 12);

  return (
    <Box className="dash-page">
      <PageHeader
        title={title}
        subtitle={user?.company_username_norm || user?.company_username || "—"}
        right={
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => nav("/dashboard/users")}
          >
            Back
          </Button>
        }
      />

      <Paper className="glass" elevation={0} sx={{ p: 2, mb: 2 }}>
        <Stack spacing={1.2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" variant="outlined" label={`Department: ${user?.department || "—"}`} />
              <Chip size="small" variant="outlined" label={`Role: ${user?.role_key || "—"}`} />
              <Chip size="small" variant="outlined" label={`MAC: ${user?.user_mac_id || user?._id || "—"}`} />
              <Chip size="small" variant="outlined" label={user?.is_active ? "Active" : "Inactive"} />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
              <TextField
                size="small"
                label="From"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                label="To"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="contained"
                onClick={() => setApplied({ from, to })}
                disabled={loading || !from || !to}
                sx={{ fontWeight: 950, borderRadius: 3 }}
              >
                Apply
              </Button>
            </Stack>
          </Stack>

          {error ? (
            <Typography color="error">{error}</Typography>
          ) : null}

          {analysis ? <KpiRow analysis={analysis} /> : null}
        </Stack>
      </Paper>

      <Paper className="glass" elevation={0} sx={{ p: 1 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Analysis" />
          <Tab label={`Logs (${formatNumber(logs?.total || logs?.items?.length || 0)})`} />
          <Tab label={`Screenshots (${formatNumber(shots?.total || shots?.items?.length || 0)})`} />
        </Tabs>
      </Paper>

      <Divider sx={{ my: 2, borderColor: "var(--border-1)" }} />

      {loading ? (
        <Typography className="muted">Loading…</Typography>
      ) : tab === 0 ? (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(12, 1fr)" }}>
          <Box sx={{ gridColumn: { xs: "span 12", lg: "span 7" } }}>
            <ChartCard title="Activity Over Time" subtitle="Active minutes per day">
              <ActivityTrendLine labels={charts.activity_over_time?.labels || []} series={charts.activity_over_time?.series || []} />
            </ChartCard>
          </Box>

          <Box sx={{ gridColumn: { xs: "span 12", lg: "span 5" } }}>
            <ChartCard title="Top Apps" subtitle="Most used apps">
              <TopBarChart items={topAppsItems} />
            </ChartCard>
          </Box>

          <Box sx={{ gridColumn: { xs: "span 12", lg: "span 7" } }}>
            <ChartCard title="Logs Over Time" subtitle="Logs per day">
              <ActivityTrendLine labels={charts.logs_over_time?.labels || []} series={charts.logs_over_time?.series || []} />
            </ChartCard>
          </Box>

          <Box sx={{ gridColumn: { xs: "span 12", lg: "span 5" } }}>
            <ChartCard title="Category Distribution" subtitle="Top categories">
              <CategoryPie items={catPieItems.map((x) => ({ name: x.name, count: x.count }))} />
            </ChartCard>
          </Box>

          <Box sx={{ gridColumn: "span 12" }}>
            <ChartCard title="Screenshots Over Time" subtitle="Screenshots per day">
              <ActivityTrendLine labels={charts.screenshots_over_time?.labels || []} series={charts.screenshots_over_time?.series || []} />
            </ChartCard>
          </Box>
        </Box>
      ) : tab === 1 ? (
        <Paper className="glass" elevation={0} sx={{ p: 2 }}>
          <LogsTable rows={logs?.items || []} />
        </Paper>
      ) : (
        <Paper className="glass" elevation={0} sx={{ p: 2 }}>
          <ScreensTable rows={shots?.items || []} />
        </Paper>
      )}
    </Box>
  );
}
