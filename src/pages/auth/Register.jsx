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

  const [fullName, setFullName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [roleKey, setRoleKey] = useState("DEPARTMENT_MEMBER");
  const [department, setDepartment] = useState("");

  const [licenseAccepted, setLicenseAccepted] = useState(true);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [showPass, setShowPass] = useState(false);

  const needsDepartment = useMemo(() => roleKey !== "C_SUITE", [roleKey]);

  const canSubmit = useMemo(() => {
    if (!fullName.trim() || !contactNo.trim() || !email.trim() || !password.trim()) return false;
    if (needsDepartment && !department.trim()) return false;
    return true;
  }, [fullName, contactNo, email, password, needsDepartment, department]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      const payload = {
        email: cleanEmail,
        company_username: cleanEmail,
        password,

        role_key: roleKey,
        department: needsDepartment ? department.trim() : "",

        full_name: fullName.trim(),
        contact_no: contactNo.trim(),

        license_accepted: !!licenseAccepted,
        license_version: "1.3",
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
          Register with your name, company email, and password.
        </Typography>

        <form onSubmit={onSubmit}>
          <Stack spacing={2.2}>
            <TextField label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <TextField label="Contact No" value={contactNo} onChange={(e) => setContactNo(e.target.value)} required />
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

            <TextField select label="Role" value={roleKey} onChange={(e) => setRoleKey(e.target.value)}>
              <MenuItem value="DEPARTMENT_MEMBER">DEPARTMENT_MEMBER</MenuItem>
              <MenuItem value="DEPARTMENT_HEAD">DEPARTMENT_HEAD</MenuItem>
              <MenuItem value="C_SUITE">C_SUITE</MenuItem>
            </TextField>

            {needsDepartment ? (
              <TextField
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="IT"
                required
              />
            ) : null}

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
  );
}
