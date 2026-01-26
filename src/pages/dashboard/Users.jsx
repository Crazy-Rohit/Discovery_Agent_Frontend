import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useAuth } from "../../app/providers/AuthProvider";
import PageHeader from "../../components/ui/PageHeader";
import { listUsersApi, createUserApi, updateUserApi } from "../../features/users/users.api";
import { listDepartmentsApi, createDepartmentApi } from "../../features/departments/departments.api";

const ROLE_C_SUITE = "C_SUITE";
const ROLE_DEPT_HEAD = "DEPARTMENT_HEAD";
const ROLE_DEPT_MEMBER = "DEPARTMENT_MEMBER";

function roleLabel(role) {
  const r = String(role || "").toUpperCase();
  if (r === ROLE_C_SUITE) return "C-Suite";
  if (r === ROLE_DEPT_HEAD) return "Department Head";
  if (r === ROLE_DEPT_MEMBER) return "Department Member";
  return r || "(unknown)";
}

function RoleChip({ role }) {
  const r = String(role || "").toUpperCase();
  const variant = r === ROLE_C_SUITE ? "filled" : "outlined";
  return <Chip size="small" variant={variant} label={roleLabel(r)} />;
}

export default function Users() {
  const { me } = useAuth();
  const role = String(me?.role_key || me?.role || "").toUpperCase();
  const canAccess = role === ROLE_C_SUITE || role === ROLE_DEPT_HEAD;
  const canWrite = role === ROLE_C_SUITE;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Admin filter: view by department
  const [deptFilter, setDeptFilter] = useState("");

  // Create / Edit dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Department create dialog
  const [deptOpen, setDeptOpen] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptBusy, setDeptBusy] = useState(false);
  const [deptErr, setDeptErr] = useState("");

  const [form, setForm] = useState({
    user_mac_id: "",
    company_username: "",
    password: "",
    full_name: "",
    contact_no: "",
    pc_username: "",
    department: "",
    role_key: ROLE_DEPT_MEMBER,
    is_active: true,
  });

  const filteredUsers = useMemo(() => {
    if (!deptFilter) return users;
    return users.filter((u) => String(u.department || "").toLowerCase() === String(deptFilter).toLowerCase());
  }, [users, deptFilter]);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [deps, us] = await Promise.all([listDepartmentsApi(), listUsersApi()]);
      setDepartments(Array.isArray(deps) ? deps : []);
      setUsers(Array.isArray(us) ? us : []);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canAccess) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccess]);

  function resetForm() {
    setForm({
      user_mac_id: "",
      company_username: "",
      password: "",
      full_name: "",
      contact_no: "",
      pc_username: "",
      department: "",
      role_key: ROLE_DEPT_MEMBER,
      is_active: true,
    });
  }

  function openCreate() {
    resetForm();
    setCreateOpen(true);
  }

  function openEdit(u) {
    setEditing(u);
    setForm({
      user_mac_id: u?.user_mac_id || "",
      company_username: u?.company_username_norm || u?.company_username || "",
      password: "",
      full_name: u?.full_name || "",
      contact_no: u?.contact_no || "",
      pc_username: u?.pc_username || "",
      department: u?.department || "",
      role_key: String(u?.role_key || ROLE_DEPT_MEMBER).toUpperCase(),
      is_active: Boolean(u?.is_active ?? true),
    });
    setEditOpen(true);
  }

  async function handleCreate() {
    setError("");
    if (!form.user_mac_id || !form.company_username || !form.password) {
      setError("user_mac_id, company email, and password are required.");
      return;
    }
    try {
      setLoading(true);
      await createUserApi({
        user_mac_id: form.user_mac_id,
        company_username: form.company_username,
        password: form.password,
        full_name: form.full_name,
        contact_no: form.contact_no,
        pc_username: form.pc_username,
        department: form.department,
        role_key: form.role_key,
        is_active: form.is_active,
      });
      setCreateOpen(false);
      await loadAll();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    setError("");
    if (!editing) return;
    try {
      setLoading(true);
      const payload = {
        full_name: form.full_name,
        contact_no: form.contact_no,
        pc_username: form.pc_username,
        department: form.department,
        role_key: form.role_key,
        is_active: form.is_active,
      };
      if (form.password) payload.password = form.password;

      await updateUserApi(editing.company_username_norm || editing.company_username, payload);
      setEditOpen(false);
      setEditing(null);
      await loadAll();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to update user.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDepartment() {
    setDeptErr("");
    const name = (deptName || "").trim();
    if (!name) {
      setDeptErr("Department name is required.");
      return;
    }
    try {
      setDeptBusy(true);
      await createDepartmentApi(name);
      setDeptName("");
      setDeptOpen(false);
      await loadAll();
    } catch (e) {
      setDeptErr(e?.response?.data?.error || e?.message || "Failed to create department.");
    } finally {
      setDeptBusy(false);
    }
  }

  if (!canAccess) {
    return (
      <Box className="dash-page">
        <PageHeader title="Users" subtitle="Users management is restricted by RBAC." />
        <Paper className="glass" elevation={0} sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 950, fontSize: 18 }}>Access denied</Typography>
          <Typography className="muted" sx={{ mt: 0.5 }}>
            This section is only available for Department Heads and C-Suite.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="dash-page">
      <PageHeader
        title="Users"
        subtitle={canWrite ? "Create and manage users, departments, and roles (RBAC)." : "Monitor your department users (read-only)."}
      />

      <Paper className="glass" elevation={0} sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
            {role === ROLE_C_SUITE ? (
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Department filter</InputLabel>
                <Select value={deptFilter} label="Department filter" onChange={(e) => setDeptFilter(e.target.value)}>
                  <MenuItem value="">All departments</MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Chip size="small" label={`Department: ${me?.department || "(not set)"}`} />
            )}

            <Chip size="small" variant="outlined" label={`Total: ${filteredUsers.length}`} />
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" onClick={loadAll} disabled={loading}>Refresh</Button>
            {canWrite ? (
              <>
                <Button variant="outlined" onClick={() => setDeptOpen(true)}>Add department</Button>
                <Button variant="contained" onClick={openCreate}>Add user</Button>
              </>
            ) : null}
          </Stack>
        </Stack>

        {error ? (
          <Typography color="error" sx={{ mt: 1.5 }}>{error}</Typography>
        ) : null}

        <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.08)" }} />

        <Box className="iw-tableWrap">
          <table className="iw-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Role</th>
                <th>Active</th>
                <th>MAC ID</th>
                {canWrite ? <th /> : null}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={canWrite ? 7 : 6} className="muted">Loading…</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={canWrite ? 7 : 6} className="muted">No users found.</td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id || u.user_mac_id || u.company_username_norm}>
                    <td>{u.full_name || "—"}</td>
                    <td>{u.company_username_norm || u.company_username || "—"}</td>
                    <td>{u.department || "—"}</td>
                    <td><RoleChip role={u.role_key} /></td>
                    <td>{u.is_active ? "Yes" : "No"}</td>
                    <td>{u.user_mac_id || "—"}</td>
                    {canWrite ? (
                      <td style={{ textAlign: "right" }}>
                        <Button size="small" variant="outlined" onClick={() => openEdit(u)}>Edit</Button>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
      </Paper>

      {/* Create user */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create user (Admin only)</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="User MAC ID" value={form.user_mac_id} onChange={(e) => setForm((s) => ({ ...s, user_mac_id: e.target.value }))} required />
            <TextField label="Company Email" value={form.company_username} onChange={(e) => setForm((s) => ({ ...s, company_username: e.target.value }))} required />
            <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} required />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField fullWidth label="Full name" value={form.full_name} onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))} />
              <TextField fullWidth label="Contact no" value={form.contact_no} onChange={(e) => setForm((s) => ({ ...s, contact_no: e.target.value }))} />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField fullWidth label="PC Username" value={form.pc_username} onChange={(e) => setForm((s) => ({ ...s, pc_username: e.target.value }))} />
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select value={form.department} label="Department" onChange={(e) => setForm((s) => ({ ...s, department: e.target.value }))}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <FormControl>
              <InputLabel>Role</InputLabel>
              <Select value={form.role_key} label="Role" onChange={(e) => setForm((s) => ({ ...s, role_key: e.target.value }))}>
                <MenuItem value={ROLE_DEPT_MEMBER}>Department Member</MenuItem>
                <MenuItem value={ROLE_DEPT_HEAD}>Department Head</MenuItem>
                <MenuItem value={ROLE_C_SUITE}>C-Suite</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={loading}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit user */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit user (Admin only)</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Company Email" value={form.company_username} disabled />
            <TextField label="New Password (optional)" type="password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField fullWidth label="Full name" value={form.full_name} onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))} />
              <TextField fullWidth label="Contact no" value={form.contact_no} onChange={(e) => setForm((s) => ({ ...s, contact_no: e.target.value }))} />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField fullWidth label="PC Username" value={form.pc_username} onChange={(e) => setForm((s) => ({ ...s, pc_username: e.target.value }))} />
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select value={form.department} label="Department" onChange={(e) => setForm((s) => ({ ...s, department: e.target.value }))}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <FormControl>
              <InputLabel>Role</InputLabel>
              <Select value={form.role_key} label="Role" onChange={(e) => setForm((s) => ({ ...s, role_key: e.target.value }))}>
                <MenuItem value={ROLE_DEPT_MEMBER}>Department Member</MenuItem>
                <MenuItem value={ROLE_DEPT_HEAD}>Department Head</MenuItem>
                <MenuItem value={ROLE_C_SUITE}>C-Suite</MenuItem>
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Active</InputLabel>
              <Select value={form.is_active ? "yes" : "no"} label="Active" onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.value === "yes" }))}>
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={loading}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* Create department */}
      <Dialog open={deptOpen} onClose={() => !deptBusy && setDeptOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add department (Admin only)</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Department name" value={deptName} onChange={(e) => setDeptName(e.target.value)} />
            {deptErr ? <Typography color="error">{deptErr}</Typography> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeptOpen(false)} disabled={deptBusy}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateDepartment} disabled={deptBusy}>
            {deptBusy ? "Adding…" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
