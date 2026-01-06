import React from "react";
import { Box, Typography } from "@mui/material";

export default function HourlyHeatmap({ hourly = {} }) {
  const max = Math.max(...Object.values(hourly || {}), 1);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: 1,
      }}
    >
      {Array.from({ length: 24 }).map((_, h) => {
        const value = hourly[String(h)] || 0;
        const intensity = value / max;

        return (
          <Box
            key={h}
            title={`${h}:00 → ${value}`}
            sx={{
              height: 40,
              borderRadius: 2,
              background: `rgba(99,102,241,${0.15 + intensity * 0.7})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              {h.toString().padStart(2, "0")}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
