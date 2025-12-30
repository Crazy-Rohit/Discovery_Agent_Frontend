import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Link,
  MenuItem,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { registerApi } from "../../features/auth/auth.api";

export default function Register() {
  const nav = useNavigate();

  // required by your schema
  const [userMacId, setUserMacId] = useState("");
  const [companyUsername, setCompanyUsername] = useState(""); // email
  const [password, setPassword] = useState("");

  // optional but in your schema
  const [department, setDepartment] = useState("");
  const [pcUsername, setPcUsername] = useState("");
  const [roleKey, setRoleKey] = useState("DEPARTMENT_MEMBER");

  // license fields
  const [licenseAccepted, setLicenseAccepted] = useState(true);
  const [licenseVersion, setLicenseVersion] = useState("1.0");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // password eye
  const [showPass, setShowPass] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      userMacId.trim() &&
      companyUsername.trim() &&
      password.trim() &&
      licenseVersion.trim()
    );
  }, [userMacId, companyUsername, password, licenseVersion]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      const payload = {
        user_mac_id: userMacId.trim(),
        company_username: companyUsername.trim().toLowerCase(),
        password,
        department: department.trim(),
        pc_username: pcUsername.trim(),
        role_key: roleKey,
        license_accepted: !!licenseAccepted,
        license_version: licenseVersion.trim(),
      };

      const data = await registerApi(payload);
      setMsg(data?.message || "Registration successful. You can now sign in.");
      setTimeout(() => nav("/login"), 700);
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
      <Paper sx={{ width: "100%", maxWidth: 520, p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Create account
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 3 }}>
          Register with your device MAC, company email, and password.
        </Typography>

        <form onSubmit={onSubmit}>
          <Stack spacing={2.2}>
            <TextField
              label="Device MAC (user_mac_id)"
              value={userMacId}
              onChange={(e) => setUserMacId(e.target.value)}
              placeholder="84-69-93-98-45-5D"
              required
            />

            <TextField
              label="Company Email (company_username)"
              value={companyUsername}
              onChange={(e) => setCompanyUsername(e.target.value)}
              placeholder="name@company.com"
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

            <TextField
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="IT"
            />

            <TextField
              label="PC Username"
              value={pcUsername}
              onChange={(e) => setPcUsername(e.target.value)}
              placeholder="HP"
            />

            <TextField
              select
              label="Role"
              value={roleKey}
              onChange={(e) => setRoleKey(e.target.value)}
            >
              <MenuItem value="DEPARTMENT_MEMBER">DEPARTMENT_MEMBER</MenuItem>
              <MenuItem value="DEPARTMENT_HEAD">DEPARTMENT_HEAD</MenuItem>
              <MenuItem value="C_SUITE">C_SUITE</MenuItem>
            </TextField>

            <TextField
              label="License Version"
              value={licenseVersion}
              onChange={(e) => setLicenseVersion(e.target.value)}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={licenseAccepted}
                  onChange={(e) => setLicenseAccepted(e.target.checked)}
                />
              }
              label="I accept the license"
            />

            {err ? <Typography color="error">{err}</Typography> : null}
            {msg ? <Typography color="success.main">{msg}</Typography> : null}

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
  );
}
