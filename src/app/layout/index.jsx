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
    <Box sx={{ position: "relative", minHeight: "100vh", width: "100%" }}>
      <WavyBackground />

      {/* Main wrapper */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          minHeight: "100vh",
          width: "100%",
          alignItems: "stretch",
        }}
      >
        <Sidebar />

        {/* Content column */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Topbar />

          {/* Page area */}
          <Box sx={{ px: { xs: 2, md: 3 }, py: 2, flex: 1, minWidth: 0 }}>
            <PageTransition key={location.pathname}>
              {/* centered + clean spacing */}
              <div className="dash-page page-enter">{children}</div>
            </PageTransition>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
