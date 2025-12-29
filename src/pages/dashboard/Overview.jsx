import React, { useMemo, useState } from "react";
import { Stack, Typography } from "@mui/material";
import DateRangeBar from "../../components/filters/DateRangeBar";
import SummaryCards from "../../components/widgets/SummaryCards";

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

  return (
    <Stack spacing={2.5}>
      <Typography variant="h5" sx={{ fontWeight: 900 }}>
        Dashboard Overview
      </Typography>

      <DateRangeBar from={from} to={to} setFrom={setFrom} setTo={setTo} />
      <SummaryCards from={from} to={to} />

      {/* Phase 2 will add: Timeseries, Top-N, Heatmap widgets below */}
    </Stack>
  );
}
