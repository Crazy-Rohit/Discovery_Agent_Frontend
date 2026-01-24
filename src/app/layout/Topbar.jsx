import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Chip,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

function titleFromPath(pathname) {
  const p = pathname.toLowerCase();
  if (p.includes("/overview")) return "Overview";
  if (p.includes("/logs")) return "Logs";
  if (p.includes("/screenshots")) return "Screenshots";
  if (p.includes("/insights")) return "Insights";
  if (p.includes("/users")) return "Users";
  if (p.includes("/settings")) return "Settings";
  return "Dashboard";
}

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle = useMemo(() => titleFromPath(location.pathname), [location.pathname]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const onLogout = () => {
  try {
    localStorage.removeItem("token");
  } catch (_) {}

  // Replace history so back button won't work
  window.location.replace("/login");
};


  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        px: { xs: 2, md: 3 },
        py: 2,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(7,10,18,0.55)",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box sx={{ minWidth: 180 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{pageTitle}</Typography>
          <Typography variant="caption" className="muted">
            Innerwall-style monitoring dashboard
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <TextField
          size="small"
          placeholder="Search logs, users, devices..."
          sx={{
            width: { xs: 220, md: 380 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
            },
            "& fieldset": { border: "none" },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            ),
          }}
        />

        <Chip
          icon={<TuneRoundedIcon />}
          label="Filters"
          variant="outlined"
          sx={{
            borderColor: "rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.78)",
            backgroundColor: "rgba(255,255,255,0.04)",
            "& .MuiChip-icon": { color: "rgba(255,255,255,0.75)" },
          }}
        />

        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <AccountCircleRoundedIcon />
        </IconButton>

        <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate("/dashboard/settings");
            }}
          >
            Settings
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onLogout();
            }}
          >
            <LogoutRoundedIcon fontSize="small" style={{ marginRight: 10 }} />
            Logout
          </MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
}
