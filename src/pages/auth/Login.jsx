import React, { useContext, useState, useEffect } from "react";

import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../app/providers/AuthProvider";
import { forgotPasswordApi } from "../../features/auth/auth.api";

export default function Login() {
  const nav = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Forgot password dialog state
  const [fpOpen, setFpOpen] = useState(false);
  const [fpPass, setFpPass] = useState("");
  const [fpPass2, setFpPass2] = useState("");
  const [fpMsg, setFpMsg] = useState("");
  const [fpErr, setFpErr] = useState("");
  const [fpBusy, setFpBusy] = useState(false);
  const [fpShowPass, setFpShowPass] = useState(false);
  const [fpShowPass2, setFpShowPass2] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login(email.trim().toLowerCase(), password);
      nav("/dashboard");
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotSubmit() {
    setFpErr("");
    setFpMsg("");

    const emailValue = (email || "").trim().toLowerCase();
    if (!emailValue) return setFpErr("Please type your company email on the login screen first.");
    if (!fpPass) return setFpErr("New password is required.");
    if (fpPass.length < 4) return setFpErr("Password must be at least 4 characters.");
    if (fpPass !== fpPass2) return setFpErr("Passwords do not match.");

    try {
      setFpBusy(true);
      const data = await forgotPasswordApi({ email: emailValue, new_password: fpPass });
      setFpMsg(data?.message || "Password updated. Please login.");
      setTimeout(() => setFpOpen(false), 900);
    } catch (e) {
      setFpErr(e?.response?.data?.error || "Failed to update password.");
    } finally {
      setFpBusy(false);
    }
  }




useEffect(() => {
  window.history.pushState(null, "", window.location.href);
  window.onpopstate = () => {
    window.history.pushState(null, "", window.location.href);
  };
}, []);






  return (
    <Box sx={{
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background:
      "radial-gradient(900px 600px at 20% 10%, rgba(79,209,196,0.18), transparent 55%)," +
      "linear-gradient(180deg, #050810, #070d18)",
  }}>
      <Paper className="glass"
  elevation={0}
  sx={{
    p: 3,
    width: 420,
    borderRadius: 4,
    border: "1px solid rgba(255,255,255,0.10)",
  }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Sign in
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 3 }}>
          Login with your company email.
        </Typography>

        <form onSubmit={onSubmit}>
          <Stack spacing={2.2}>
            <TextField label="Company Email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {err ? <Typography color="error">{err}</Typography> : null}

            <Button type="submit" variant="contained" size="large" disabled={busy}>
              {busy ? "Signing in..." : "Sign in"}
            </Button>

            <Stack direction="row" justifyContent="space-between">
              <Link
                component="button"
                type="button"
                underline="hover"
                onClick={() => {
                  setFpErr("");
                  setFpMsg("");
                  setFpPass("");
                  setFpPass2("");
                  setFpOpen(true);
                }}
                sx={{ fontSize: 14 }}
              >
                Forgot password?
              </Link>

              <Link component="button" type="button" underline="hover" onClick={() => nav("/register")} sx={{ fontSize: 14 }}>
                Create account
              </Link>
            </Stack>
          </Stack>
        </form>
      </Paper>

      <Dialog open={fpOpen} onClose={() => !fpBusy && setFpOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Reset Password</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Password will be updated for the email you typed on the login screen.
            </Typography>

            <TextField
              label="New Password"
              type={fpShowPass ? "text" : "password"}
              value={fpPass}
              onChange={(e) => setFpPass(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setFpShowPass((s) => !s)}>
                      {fpShowPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirm New Password"
              type={fpShowPass2 ? "text" : "password"}
              value={fpPass2}
              onChange={(e) => setFpPass2(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setFpShowPass2((s) => !s)}>
                      {fpShowPass2 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {fpErr ? <Typography color="error">{fpErr}</Typography> : null}
            {fpMsg ? <Typography sx={{ color: "success.main" }}>{fpMsg}</Typography> : null}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setFpOpen(false)} disabled={fpBusy}>Cancel</Button>
          <Button variant="contained" onClick={handleForgotSubmit} disabled={fpBusy}>
            {fpBusy ? "Updating..." : "Update Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
