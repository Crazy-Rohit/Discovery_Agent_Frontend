import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Link,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";

import { registerApi } from "../../features/auth/auth.api";
import WavyBackground from "../../components/ui/WavyBackground";

export default function Register() {
  const nav = useNavigate();

  const [fullName, setFullName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [licenseAccepted, setLicenseAccepted] = useState(true);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [showPass, setShowPass] = useState(false);

  const canSubmit = useMemo(() => {
    if (!fullName.trim() || !contactNo.trim() || !department.trim() || !email.trim() || !password.trim()) return false;
    return true;
  }, [fullName, contactNo, department, email, password]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // ✅ Phase 4.7: registration is for DEPARTMENT_MEMBER only
      const payload = {
        email: cleanEmail,
        company_username: cleanEmail,
        password,

        department: department.trim(),
        full_name: fullName.trim(),
        contact_no: contactNo.trim(),

        license_accepted: !!licenseAccepted,
        license_version: "1.3",
      };

      const data = await registerApi(payload);
      setMsg(data?.message || "Registration successful. You can now sign in.");
      setTimeout(() => nav("/login"), 800);
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box className="login-shell" sx={{ position: "relative" }}>
      <WavyBackground />

      <Box sx={{ position: "relative" }}>
        <div className="login-glow" aria-hidden="true" />

        <Paper
          className="glass login-card"
          elevation={0}
          sx={{
            position: "relative",
            p: 3,
            width: 520,
            maxWidth: "92vw",
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.10)",
            zIndex: 1,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Create account
          </Typography>

          <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
            This registration is for <b>Department Users</b> (data capture only).
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 3 }}>
            Managers/Admins are created by C-Suite from the dashboard.
          </Typography>

          <form onSubmit={onSubmit}>
            <Stack spacing={2.2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField fullWidth label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <TextField fullWidth label="Contact No" value={contactNo} onChange={(e) => setContactNo(e.target.value)} required />
              </Stack>

              <TextField
                label="Department (string)"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="IT / HR / Sales"
                required
              />

              <TextField label="Company Email" value={email} onChange={(e) => setEmail(e.target.value)} required />

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

              <FormControlLabel
                control={<Checkbox checked={licenseAccepted} onChange={(e) => setLicenseAccepted(e.target.checked)} />}
                label="I accept the license"
              />

              {err ? <Typography color="error">{err}</Typography> : null}
              {msg ? <Typography sx={{ color: "success.main" }}>{msg}</Typography> : null}

              <Button type="submit" variant="contained" size="large" disabled={busy || !canSubmit}>
                {busy ? "Creating..." : "Create account"}
              </Button>

              <Link component="button" type="button" underline="hover" onClick={() => nav("/login")} sx={{ fontSize: 14 }}>
                Already registered? Sign in
              </Link>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}
