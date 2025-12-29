import React from "react";
import { Card, CardContent, Typography, Stack } from "@mui/material";

export default function StatCard({ title, value, subtitle }) {
  return (
    <Card elevation={0} sx={{ border: "1px solid rgba(0,0,0,0.06)" }}>
      <CardContent>
        <Stack spacing={0.5}>
          <Typography sx={{ color: "text.secondary", fontWeight: 700, fontSize: 12, textTransform: "uppercase" }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            {value ?? "—"}
          </Typography>
          {subtitle ? (
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{subtitle}</Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
