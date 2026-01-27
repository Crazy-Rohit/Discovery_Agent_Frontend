import React, { useEffect, useMemo, useState } from "react";
import { Box, Grid, Typography, Paper, Chip, CircularProgress, Divider } from "@mui/material";

import PageHeader from "../../components/ui/PageHeader";
import ChartCard from "../../components/charts/ChartCard";
import ActivityTrendLine from "../../components/charts/ActivityTrendLine";
import TopBarChart from "../../components/charts/TopBarChart";
import CategoryPie from "../../components/charts/CategoryPie";
import WeekHourHeatmap from "../../components/charts/WeekHourHeatmap";
import StackedAreaTrend from "../../components/charts/StackedAreaTrend";
import SimpleBarSeries from "../../components/charts/SimpleBarSeries";

import { getInsightsDashboard } from "../../services/analytics";
import { useUserSelection } from "../../app/providers/UserSelectionProvider";

function formatNumber(n) {
  const x = Number(n || 0);
  return x.toLocaleString();
}

function Narrative({ range, scope, kpis }) {
  const from = range?.from || "—";
  const to = range?.to || "—";

  const logs = formatNumber(kpis?.logs);
  const shots = formatNumber(kpis?.screenshots);
  const users = formatNumber(kpis?.unique_users);
  const activeMin = formatNumber(kpis?.total_active_minutes);
  const app = kpis?.most_used_app || "—";
  const cat = kpis?.top_category || "—";

  return (
    <Paper className="glass" elevation={0} sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography sx={{ fontWeight: 950, fontSize: 18 }}>Narrative summary</Typography>
          <Typography className="muted" sx={{ mt: 0.5 }}>
            Range: <span style={{ color: "var(--text)", fontWeight: 800 }}>{from}</span> →{" "}
            <span style={{ color: "var(--text)", fontWeight: 800 }}>{to}</span>
            {scope?.label ? (
              <>
                {" "}
                • Scope: <span style={{ color: "var(--text)", fontWeight: 800 }}>{scope.label}</span>
              </>
            ) : null}
          </Typography>
        </Box>

        {kpis?.last_updated ? (
          <Chip
            size="small"
            label={`Last updated: ${kpis.last_updated}`}
            variant="outlined"
            sx={{
              borderColor: "var(--border-2)",
              color: "var(--muted)",
              fontWeight: 900,
            }}
          />
        ) : null}
      </Box>

      <Divider sx={{ my: 1.5, borderColor: "var(--border-2)" }} />

      <Typography sx={{ lineHeight: 1.7 }}>
        In this period, the system captured{" "}
        <span style={{ fontWeight: 950 }}>{logs}</span> logs and{" "}
        <span style={{ fontWeight: 950 }}>{shots}</span> screenshots across{" "}
        <span style={{ fontWeight: 950 }}>{users}</span> active user(s). Total active time is{" "}
        <span style={{ fontWeight: 950 }}>{activeMin}</span> minutes. The most used application is{" "}
        <span style={{ fontWeight: 950 }}>{app}</span>, and the top activity category is{" "}
        <span style={{ fontWeight: 950 }}>{cat}</span>.
      </Typography>
    </Paper>
  );
}

export default function Overview() {
  const { selectedUser } = useUserSelection();
  const selectedUserKey = selectedUser?.company_username_norm || selectedUser?.company_username || "";

  const [loading, setLoading] = useState(true);
  const [dash, setDash] = useState(null);
  const [error, setError] = useState("");

  const queryParams = useMemo(() => ({ user: selectedUserKey || undefined }), [selectedUserKey]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      // Overview is intended to be user-scoped in the new flow
      if (!selectedUserKey) {
        setDash(null);
        setLoading(false);
        setError("Select a user to view overview analytics.");
        return;
      }

      try {
        const d = await getInsightsDashboard(queryParams);
        if (!mounted) return;
        setDash(d || null);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load analytics.");
        setDash(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [queryParams, selectedUserKey]);

  const range = dash?.range || {};
  const scope = dash?.scope || {};
  const kpis = dash?.kpis || {};
  const charts = dash?.charts || {};

  return (
    <Box>
      <PageHeader
        title={selectedUserKey ? "User Overview" : "Overview"}
        //subtitle={selectedUserKey ? `Selected user: ${selectedUserKey}` : "Select a user to begin"}
        right={
          loading ? (
            <Chip
              label="Loading..."
              variant="outlined"
              icon={<CircularProgress size={14} />}
              sx={{
                borderColor: "rgba(79,209,196,0.22)",
                backgroundColor: "rgba(79,209,196,0.06)",
                color: "var(--text)",
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
                color: "var(--text)",
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

      {!error && dash ? <Narrative range={range} scope={scope} kpis={kpis} /> : null}

      {/* Charts grid: 2-per-row on large screens */}
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid item xs={12} lg={6}>
          <ChartCard title="Activity Over Time" subtitle="Active minutes per day">
            <ActivityTrendLine
              labels={Array.isArray(charts?.activity_over_time?.labels) ? charts.activity_over_time.labels : []}
              series={Array.isArray(charts?.activity_over_time?.series) ? charts.activity_over_time.series : []}
            />
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <ChartCard title="Screenshots Over Time" subtitle="Screenshots per day">
            <ActivityTrendLine
              labels={Array.isArray(charts?.screenshots_over_time?.labels) ? charts.screenshots_over_time.labels : []}
              series={Array.isArray(charts?.screenshots_over_time?.series) ? charts.screenshots_over_time.series : []}
            />
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <ChartCard title="Top Applications" subtitle="Most used apps">
            <TopBarChart items={Array.isArray(charts?.top_apps?.items) ? charts.top_apps.items : []} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <ChartCard title="Top Categories" subtitle="Most frequent categories">
            <TopBarChart items={Array.isArray(charts?.top_categories?.items) ? charts.top_categories.items : []} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <ChartCard title="Category Distribution" subtitle="Share of activity by category">
            <CategoryPie items={Array.isArray(charts?.category_distribution?.items) ? charts.category_distribution.items : []} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <ChartCard title="Week × Hour Heatmap" subtitle="When activity happens (weekday vs hour)">
            <WeekHourHeatmap weekHour={charts?.hourly_heatmap?.week_hour || {}} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <ChartCard title="Apps Trend" subtitle="Daily app activity (stacked)">
            <StackedAreaTrend rows={Array.isArray(charts?.apps_trend?.rows) ? charts.apps_trend.rows : []} keys={Array.isArray(charts?.apps_trend?.keys) ? charts.apps_trend.keys : []} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <ChartCard title="Active by Weekday" subtitle="Total active minutes by weekday">
            <SimpleBarSeries
              labels={Array.isArray(charts?.active_by_weekday?.labels) ? charts.active_by_weekday.labels : []}
              data={Array.isArray(charts?.active_by_weekday?.data) ? charts.active_by_weekday.data : []}
              valueName="Active Minutes"
              unit="min"
            />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
