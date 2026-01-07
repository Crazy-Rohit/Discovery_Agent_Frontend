import React from "react";
import { Box, Typography } from "@mui/material";
import GlassCard from "./GlassCard";

export default function StatCard({ label, value, delta, icon }) {
  const up = typeof delta === "string" ? delta.trim().startsWith("+") : delta > 0;

  return (
    <GlassCard
      className="glass-hover"
      sx={{
        p: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: "-40px -60px auto auto",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle at 30% 30%, rgba(79,209,196,0.22), transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.3 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 14,
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
            {label}
          </Typography>
          <Typography sx={{ fontWeight: 900, fontSize: 22, mt: 0.2 }}>{value}</Typography>
        </Box>

        {delta != null ? (
          <Box
            sx={{
              px: 1.2,
              py: 0.4,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: up ? "rgba(34,197,94,0.10)" : "rgba(255,107,107,0.10)",
              color: up ? "rgba(34,197,94,0.95)" : "rgba(255,107,107,0.95)",
              fontWeight: 900,
              fontSize: 12,
            }}
          >
            {typeof delta === "string" ? delta : `${delta > 0 ? "+" : ""}${delta}%`}
          </Box>
        ) : null}
      </Box>
    </GlassCard>
  );
}
