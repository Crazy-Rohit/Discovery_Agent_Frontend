import React, { useState } from "react";
import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useAuth } from "../../app/providers/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login(username, password);
      nav("/dashboard", { replace: true });
    } catch (e2) {
      setErr("Login failed. Please check username/password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" } }}>
      <Box sx={{ display: { xs: "none", md: "flex" }, p: 6, bgcolor: "background.default", alignItems: "center" }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            Innerwall-style Activity Dashboard
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 520 }}>
            Monitor logs, screenshots, user activity insights, and RBAC-scoped views — all in one place.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Paper sx={{ width: "100%", maxWidth: 420, p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Sign in</Typography>
          <Typography sx={{ color: "text.secondary", mb: 3 }}>Use your assigned credentials.</Typography>

          <form onSubmit={onSubmit}>
            <Stack spacing={2.2}>
              <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {err ? <Typography color="error">{err}</Typography> : null}
              <Button type="submit" variant="contained" size="large" disabled={busy}>
                {busy ? "Signing in..." : "Sign in"}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}
