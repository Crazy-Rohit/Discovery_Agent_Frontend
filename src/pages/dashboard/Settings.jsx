import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import PageHeader from "../../components/ui/PageHeader";

export default function Settings() {
  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Organization, departments, RBAC, and system preferences."
      />

      <Paper className="glass" elevation={0} sx={{ p: 2 }}>
        <Typography className="muted">
          Phase 2 will add: organization settings, departments, roles overview, API base URL tips.
        </Typography>
      </Paper>
    </Box>
  );
}
