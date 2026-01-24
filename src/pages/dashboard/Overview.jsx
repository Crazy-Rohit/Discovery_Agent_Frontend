import React, { useEffect, useMemo, useState } from "react";
import { Box, Grid, Typography, Paper, Chip, CircularProgress } from "@mui/material";

import ChartCard from "../../components/charts/ChartCard";
import ActivityTrendLine from "../../components/charts/ActivityTrendLine";
import TopBarChart from "../../components/charts/TopBarChart";
import PageHeader from "../../components/ui/PageHeader";

import { getInsightsSummary, getInsightsTimeseries, getInsightsTop } from "../../services/analytics";

import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import DesktopWindowsRoundedIcon from "@mui/icons-material/DesktopWindowsRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

function KpiCard({ title, value, icon }) {
  return (
    <Paper className="glass glass-hover" elevation={0} sx={{ p: 2, position: "relative", overflow: "hidden" }}>
      <Box
        sx={{
          position: "absolute",
          inset: "-60px -70px auto auto",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle at 30% 30%, rgba(79,209,196,0.18), transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              "radial-gradient(18px 18px at 30% 30%, rgba(79,209,196,0.95), rgba(79,209,196,0.10))",
            display: "grid",
            placeItems: "center",
          }}
        >
          {icon}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" className="muted">
            {title}
          </Typography>
          <Typography sx={{ fontWeight: 950, fontSize: 22, mt: 0.2 }}>{value}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function formatNumber(n) {
  const x = Number(n || 0);
  return x.toLocaleString();
}

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState({ labels: [], series: [] });
  const [topSignals, setTopSignals] = useState([]);
  const [error, setError] = useState("");

  const queryParams = useMemo(() => ({}), []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [s, t, top] = await Promise.all([
          getInsightsSummary(queryParams),
          getInsightsTimeseries(queryParams),
          getInsightsTop({ ...queryParams, by: "category", limit: 10 }),
        ]);

        if (!mounted) return;

        setSummary(s || null);
        setTrend({
          labels: Array.isArray(t?.labels) ? t.labels : [],
          series: Array.isArray(t?.series) ? t.series : [],
        });
        setTopSignals(Array.isArray(top?.items) ? top.items : []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load analytics.");
        setSummary(null);
        setTrend({ labels: [], series: [] });
        setTopSignals([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [queryParams]);

  const totals = summary?.totals || {};
  const range = summary?.range || {};

  const kpis = [
    { title: "Active Users", value: formatNumber(totals.unique_users), icon: <PeopleAltRoundedIcon /> },
    { title: "Logs", value: formatNumber(totals.logs), icon: <ArticleRoundedIcon /> },
    { title: "Screenshots", value: formatNumber(totals.screenshots), icon: <DesktopWindowsRoundedIcon /> },
    { title: "Alerts", value: formatNumber(0), icon: <WarningAmberRoundedIcon /> },
  ];

  return (
    <Box>
      <PageHeader
        title="System Overview"
        subtitle={`Range: ${range.from || "—"} to ${range.to || "—"}`}
        right={
          loading ? (
            <Chip
              label="Loading..."
              variant="outlined"
              icon={<CircularProgress size={14} />}
              sx={{
                borderColor: "rgba(79,209,196,0.22)",
                backgroundColor: "rgba(79,209,196,0.06)",
                color: "rgba(255,255,255,0.78)",
                fontWeight: 900,
              }}
            />
          ) : (
            <Chip
              label="Live"
              variant="outlined"
              sx={{
                borderColor: "rgba(79,209,196,0.22)",
                backgroundColor: "rgba(79,209,196,0.06)",
                color: "rgba(255,255,255,0.78)",
                fontWeight: 900,
              }}
            />
          )
        }
      />

      {error ? (
        <Paper className="glass" elevation={0} sx={{ p: 2, borderColor: "rgba(255,107,107,0.25)" }}>
          <Typography sx={{ fontWeight: 900, color: "rgba(255,107,107,0.95)" }}>{error}</Typography>
        </Paper>
      ) : null}

      {/* KPI Row */}
      <Grid container spacing={2}>
        {kpis.map((k) => (
          <Grid key={k.title} item xs={12} sm={6} lg={3}>
            <KpiCard {...k} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <ChartCard title="Activity Trend" subtitle="Logs per day">
            <ActivityTrendLine labels={trend.labels} series={trend.series} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <ChartCard title="Top Categories" subtitle="Most frequent categories">
            <TopBarChart items={topSignals} />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
