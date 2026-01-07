import React from "react";
import { Box, Typography, Paper } from "@mui/material";

export default function Settings() {
  return (
    <Box>
      <Typography sx={{ fontWeight: 800, fontSize: 22, mb: 2 }}>Settings</Typography>

      <Paper className="glass" sx={{ p: 2 }}>
        <Typography className="muted">
          Phase 2 will add: organization settings, departments, roles overview, API base URL tips.
        </Typography>
      </Paper>
    </Box>
  );
}
