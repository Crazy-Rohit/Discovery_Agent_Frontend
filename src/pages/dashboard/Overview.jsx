import React, { useEffect, useMemo, useState } from "react";
import { Grid, Stack, Typography } from "@mui/material";

import DateRangeBar from "../../components/filters/DateRangeBar";
import SummaryCards from "../../components/widgets/SummaryCards";

import ChartCard from "../../components/charts/ChartCard";
import ActivityTrendLine from "../../components/charts/ActivityTrendLine";
import TopBarChart from "../../components/charts/TopBarChart";
import CategoryPie from "../../components/charts/CategoryPie";
import HourlyHeatmap from "../../components/charts/HourlyHeatmap";

import RecentLogsTable from "../../components/widgets/RecentLogsTable";
import RecentScreenshots from "../../components/widgets/RecentScreenshots";

import { getTop, getTimeseries, getHourly } from "../../features/insights/insights.api";

function isoToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Overview() {
  const today = useMemo(() => isoToday(), []);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);

  const [trend, setTrend] = useState(null);
  const [topApps, setTopApps] = useState(null);
  const [topCats, setTopCats] = useState(null);
  const [hourly, setHourly] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [t, a, c, h] = await Promise.all([
          getTimeseries({ from, to }),
          getTop({ from, to, by: "application", limit: 8 }),
          getTop({ from, to, by: "category", limit: 6 }),
          getHourly({ from, to }),
        ]);

        if (!mounted) return;
        setTrend(t);
        setTopApps(a);
        setTopCats(c);
        setHourly(h);
      } catch (e) {
        if (!mounted) return;
        setTrend(null);
        setTopApps(null);
        setTopCats(null);
        setHourly(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [from, to]);

  return (
    <Stack spacing={2.5}>
      <Typography variant="h5" sx={{ fontWeight: 900 }}>
        Dashboard Overview
      </Typography>

      <DateRangeBar from={from} to={to} setFrom={setFrom} setTo={setTo} />
      <SummaryCards from={from} to={to} />

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <ChartCard title="Activity Trend" subtitle="Logs per day">
            <ActivityTrendLine
              labels={trend?.labels || []}
              series={trend?.series || []}
            />
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <ChartCard title="Category Breakdown" subtitle="Distribution by category">
            <CategoryPie items={topCats?.items || []} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <ChartCard title="Top Applications" subtitle="Most active apps">
            <TopBarChart items={topApps?.items || []} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <ChartCard title="Hourly Activity" subtitle="Heatmap (local parsing)">
            <HourlyHeatmap hourly={hourly?.hourly || {}} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <ChartCard title="Recent Activity" subtitle="Latest captured logs">
            <RecentLogsTable from={from} to={to} limit={12} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <ChartCard title="Recent Screenshots" subtitle="Latest captured screenshots">
            <RecentScreenshots from={from} to={to} limit={8} />
          </ChartCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
