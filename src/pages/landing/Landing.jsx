import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../app/providers/AuthProvider";
import { useEffect } from "react";

const { token } = useAuth();

useEffect(() => {
  if (token) navigate("/dashboard");
}, [token, navigate]);


export default function Landing() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Stack spacing={3} alignItems="center">
        {/* Logo */}
        <Box
          component="img"
          src="/logo.png"
          alt="Innerwall Logo"
          sx={{
            height: 64,
            mb: 1,
          }}
        />

        {/* Optional tagline */}
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: 14,
            maxWidth: 420,
            textAlign: "center",
          }}
        >
          Monitor user activity, logs, screenshots, and behavioral insights securely.
        </Typography>

        {/* Begin Button */}
        <Button
          variant="contained"
          size="large"
          sx={{
            mt: 2,
            px: 6,
            py: 1.4,
            fontWeight: 700,
            borderRadius: 3,
          }}
          onClick={() => navigate("/login")}
        >
          Begin
        </Button>
      </Stack>
    </Box>
  );
}
