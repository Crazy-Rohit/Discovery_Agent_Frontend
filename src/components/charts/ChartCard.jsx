import React from "react";
import { Card, CardContent, CardHeader, Typography, Box } from "@mui/material";

/**
 * Phase 3: Innerwall-style glass chart container.
 * Backward compatible:
 * - keeps title, subtitle, children props
 * - adds optional `right` slot without breaking current usage
 */
export default function ChartCard({ title, subtitle, right, children }) {
  return (
    <Card
      variant="outlined"
      className="glass"
      sx={{
        borderRadius: 4,
        background: "rgba(255,255,255,0.055)",
        borderColor: "rgba(255,255,255,0.10)",
        overflow: "hidden",
      }}
    >
      <CardHeader
        sx={{ pb: 0.5 }}
        title={
          <Box sx={{ display: "flex", alignItems: "end", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 950, fontSize: 16, letterSpacing: 0.2 }}>
                {title}
              </Typography>

              {subtitle ? (
                <Typography variant="caption" sx={{ opacity: 0.65 }}>
                  {subtitle}
                </Typography>
              ) : null}
            </Box>

            {right ? <Box sx={{ pb: 0.3 }}>{right}</Box> : null}
          </Box>
        }
      />
      <CardContent sx={{ pt: 1.5 }}>{children}</CardContent>
    </Card>
  );
}
