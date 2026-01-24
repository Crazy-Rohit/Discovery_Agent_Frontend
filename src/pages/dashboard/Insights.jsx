import React, { useEffect, useMemo, useState } from "react";
import { Box, Grid, Paper, Chip, CircularProgress, Typography } from "@mui/material";

import ChartCard from "../../components/charts/ChartCard";
import CategoryPie from "../../components/charts/CategoryPie";
import HourlyHeatmap from "../../components/charts/HourlyHeatmap";
import ActivityTrendLine from "../../components/charts/ActivityTrendLine";
import TopBarChart from "../../components/charts/TopBarChart";
import PageHeader from "../../components/ui/PageHeader";

import { getInsightsTimeseries, getInsightsTop, getInsightsHourly } from "../../services/analytics";

export default function Insights() {
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState({ labels: [], series: [] });
  const [categoryItems, setCategoryItems] = useState([]);
  const [topApps, setTopApps] = useState([]);
  const [hourly, setHourly] = useState({});
  const [error, setError] = useState("");

  const queryParams = useMemo(() => ({}), []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [t, cats, apps, h] = await Promise.all([
          getInsightsTimeseries(queryParams),
          getInsightsTop({ ...queryParams, by: "category", limit: 10 }),
          getInsightsTop({ ...queryParams, by: "application", limit: 10 }),
          getInsightsHourly(queryParams),
        ]);

        if (!mounted) return;

        setTrend({
          labels: Array.isArray(t?.labels) ? t.labels : [],
          series: Array.isArray(t?.series) ? t.series : [],
        });

        setCategoryItems(Array.isArray(cats?.items) ? cats.items : []);
        setTopApps(Array.isArray(apps?.items) ? apps.items : []);
        setHourly(h?.hourly && typeof h.hourly === "object" ? h.hourly : {});
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load insights.");
        setTrend({ labels: [], series: [] });
        setCategoryItems([]);
        setTopApps([]);
        setHourly({});
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

  return (
    <Box>
      <PageHeader
        title="Insights"
        subtitle="Live analytics (default last 7 days)"
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

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <ChartCard title="Trend" subtitle="Logs per day">
            <ActivityTrendLine labels={trend.labels} series={trend.series} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <ChartCard title="Category Distribution" subtitle="Top categories">
            <CategoryPie items={categoryItems} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <ChartCard title="Hourly Heatmap" subtitle="Activity by hour (0–23)">
            <HourlyHeatmap hourly={hourly} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <ChartCard title="Top Applications" subtitle="Most active apps">
            <TopBarChart items={topApps} />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
