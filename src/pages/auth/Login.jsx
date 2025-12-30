import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../../app/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { forgotPasswordApi } from "../../features/auth/auth.api";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // password eye
  const [showPass, setShowPass] = useState(false);

  // forgot password modal
  const [fpOpen, setFpOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpBusy, setFpBusy] = useState(false);
  const [fpMsg, setFpMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login(email, password); // email-only login
      nav("/dashboard", { replace: true });
    } catch (e2) {
      const msg =
        e2?.response?.data?.error ||
        e2?.message ||
        "Login failed. Please check email/password.";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  async function onForgotPassword() {
    setFpMsg("");
    setFpBusy(true);
    try {
      const data = await forgotPasswordApi({ email: fpEmail });
      setFpMsg(data?.message || "If the account exists, reset instructions were initiated.");
    } catch (e) {
      setFpMsg(e?.response?.data?.error || "Could not start password reset.");
    } finally {
      setFpBusy(false);
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
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Sign in
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 3 }}>
            Use your company email and password.
          </Typography>

          <form onSubmit={onSubmit}>
            <Stack spacing={2.2}>
              <TextField
                label="Company Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <TextField
                label="Password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass((s) => !s)} edge="end">
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => {
                    setFpEmail(email || "");
                    setFpMsg("");
                    setFpOpen(true);
                  }}
                  sx={{ fontSize: 14 }}
                >
                  Forgot password?
                </Link>

                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => nav("/register")}
                  sx={{ fontSize: 14 }}
                >
                  Not registered yet? Create account
                </Link>
              </Box>

              {err ? <Typography color="error">{err}</Typography> : null}

              <Button type="submit" variant="contained" size="large" disabled={busy}>
                {busy ? "Signing in..." : "Sign in"}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>

      <Dialog open={fpOpen} onClose={() => setFpOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Reset password</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.secondary", mb: 2 }}>
            Enter your company email. If the account exists, we’ll initiate a reset.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Company Email"
            value={fpEmail}
            onChange={(e) => setFpEmail(e.target.value)}
          />
          {fpMsg ? (
            <Typography sx={{ mt: 2 }} color={fpMsg.toLowerCase().includes("could not") ? "error" : "success.main"}>
              {fpMsg}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFpOpen(false)}>Close</Button>
          <Button variant="contained" onClick={onForgotPassword} disabled={fpBusy || !fpEmail.trim()}>
            {fpBusy ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
