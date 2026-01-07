import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useAuth } from "../../app/providers/AuthProvider";

const ROLE_C_SUITE = "C_SUITE";
const ROLE_DEPT_HEAD = "DEPARTMENT_HEAD";

export default function Users() {
  const { me } = useAuth();
  const role = String(me?.role_key || me?.role || "").toUpperCase();
  const allowed = role === ROLE_C_SUITE || role === ROLE_DEPT_HEAD;

  if (!allowed) {
    return (
      <Box>
        <Paper className="glass" elevation={0} sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 950, fontSize: 18 }}>Access denied</Typography>
          <Typography className="muted" sx={{ mt: 0.5 }}>
            Users management is only available for Department Heads and C-Suite.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Paper className="glass" elevation={0} sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 950 }}>Users page</Typography>
        <Typography className="muted">
          (Keep your existing Users table here — this phase only enforces visibility.)
        </Typography>
      </Paper>
    </Box>
  );
}
