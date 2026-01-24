import React from "react";
import { NavLink } from "react-router-dom";
import { Box, Typography, Stack, Divider, Tooltip, IconButton } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";

const ROLE_C_SUITE = "C_SUITE";
const ROLE_DEPT_HEAD = "DEPARTMENT_HEAD";

const linkBase = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 14,
  color: "rgba(255,255,255,0.78)",
  border: "1px solid transparent",
  textDecoration: "none",
  transition: "all .15s ease",
};

export default function Sidebar() {
  const { me } = useAuth();
  const role = String(me?.role_key || me?.role || "").toUpperCase();

  const canSeeUsers = role === ROLE_C_SUITE || role === ROLE_DEPT_HEAD;

  const navItems = [
    { label: "Overview", to: "/dashboard/overview", icon: <DashboardRoundedIcon /> },
    { label: "Logs", to: "/dashboard/logs", icon: <ArticleRoundedIcon /> },
    { label: "Screenshots", to: "/dashboard/screenshots", icon: <ImageRoundedIcon /> },
    { label: "Insights", to: "/dashboard/insights", icon: <InsightsRoundedIcon /> },
    ...(canSeeUsers ? [{ label: "Users", to: "/dashboard/users", icon: <PeopleAltRoundedIcon /> }] : []),
    { label: "Settings", to: "/dashboard/settings", icon: <SettingsRoundedIcon /> },
  ];

  return (
    <Box sx={{ width: 280, display: { xs: "none", md: "flex" }, flexDirection: "column", p: 2 }}>
      <Box className="glass" sx={{ height: "100%", p: 2, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ px: 0.5, py: 0.5 }}>
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
            <BoltRoundedIcon />
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 900, letterSpacing: 0.2 }}>Innerwall</Typography>
            <Typography variant="caption" className="muted">
              {me?.department ? `${me.department} • ${role || "—"}` : `${role || "—"}`}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Status: Active">
            <IconButton size="small" sx={{ border: "1px solid rgba(255,255,255,0.10)" }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: "#22c55e",
                  boxShadow: "0 0 0 6px rgba(34,197,94,0.12)",
                }}
              />
            </IconButton>
          </Tooltip>
        </Stack>

        <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.10)" }} />

        <Stack spacing={0.8} sx={{ px: 0.5 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                ...linkBase,
                background: isActive ? "rgba(255,255,255,0.10)" : "transparent",
                borderColor: isActive ? "rgba(79,209,196,0.25)" : "transparent",
                color: isActive ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.76)",
              })}
            >
              <Box sx={{ opacity: 0.95 }}>{item.icon}</Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{item.label}</Typography>
            </NavLink>
          ))}
        </Stack>

        <Box sx={{ flex: 1 }} />

        <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.10)" }} />

        <Box sx={{ px: 0.5 }}>
          <Typography variant="caption" className="muted">
            v1.0 • Teal Theme • RBAC
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
