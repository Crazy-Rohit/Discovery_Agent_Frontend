import React from "react";
import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import WavyBackground from "../../components/ui/WavyBackground";
import PageTransition from "../../components/ui/PageTransition";

export default function DashboardLayout({ children }) {
  const location = useLocation();

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      <WavyBackground />

      <Box sx={{ position: "relative", zIndex: 1, display: "flex", minHeight: "100vh" }}>
        <Sidebar />

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Topbar />

          <Box sx={{ px: { xs: 2, md: 3 }, py: 3, flex: 1 }}>
            <PageTransition key={location.pathname}>{children}</PageTransition>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
