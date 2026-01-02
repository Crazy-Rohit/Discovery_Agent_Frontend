import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import StatCard from "../ui/StatCard";
import { getSummary } from "../../features/insights/insights.api";

export default function SummaryCards({ from, to }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const res = await getSummary({ from, to });
      if (mounted) setData(res);
    }
    load();
    return () => { mounted = false; };
  }, [from, to]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Total Logs" value={data?.totals.logs} />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Total Screenshots" value={data?.totals.screenshots} />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Unique Users" value={data?.totals.unique_users} />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Unique Devices" value={data?.totals.unique_devices} />
      </Grid>
    </Grid>
  );
}
