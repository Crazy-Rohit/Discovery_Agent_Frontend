import React from "react";
import { Box } from "@mui/material";
//import Sidebar from "./Sidebar";
//import Topbar from "./Topbar";

export default function DashboardLayout({ children }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/*<Sidebar />*/}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/*<Topbar />*/}
        <Box sx={{ p: 3, flex: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
}
