import React from "react";
import { Card, CardContent, CardHeader, Typography } from "@mui/material";

export default function ChartCard({ title, subtitle, children }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        background: "rgba(255,255,255,0.03)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <CardHeader
        title={<Typography sx={{ fontWeight: 900 }}>{title}</Typography>}
        subheader={
          subtitle ? (
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              {subtitle}
            </Typography>
          ) : null
        }
      />
      <CardContent>{children}</CardContent>
    </Card>
  );
}
