import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from "@mui/material";

import PageHeader from "../../components/ui/PageHeader";
import { getScreenshots } from "../../services/data.api";
import { defaultRangeLast7Days } from "../../utils/dateRange";
import { useUserSelection } from "../../app/providers/UserSelectionProvider";

function toText(v) {
  if (v === null || v === undefined) return "-";
  if (typeof v === "string") return v || "-";
  return String(v);
}

export default function Screenshots() {
  const { selectedUser } = useUserSelection();
  const userKey =
    selectedUser?.company_username_norm || selectedUser?.company_username || "";

  const range = useMemo(() => defaultRangeLast7Days(), []);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!userKey) {
      setErr("Select a user to view screenshots.");
      setRows([]);
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setLoading(true);
        const data = await getScreenshots({
          ...range,
          page: 1,
          limit: 100,
          user: userKey,
        });
        setRows(data?.items || []);
        setErr("");
      } catch (e) {
        setErr(e?.message || "Failed to load screenshots");
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userKey, range]);

  return (
    <Box>
      <PageHeader title="Screenshots" />

      {err ? (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography color="error">{err}</Typography>
        </Paper>
      ) : null}

      <Paper>
        {loading ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading screenshots...</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ts</TableCell>
                  <TableCell>application</TableCell>
                  <TableCell>window_title</TableCell>
                  <TableCell>label</TableCell>
                  <TableCell>screenshot_url</TableCell>
                  <TableCell>tags (OCR)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{toText(r.ts)}</TableCell>
                    <TableCell>{toText(r.application)}</TableCell>
                    <TableCell>{toText(r.window_title)}</TableCell>
                    <TableCell>{toText(r.label)}</TableCell>
                    <TableCell>
                      <Typography sx={{ maxWidth: 240 }} noWrap>
                        {toText(r.screenshot_url)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label="UI only" />
                    </TableCell>
                  </TableRow>
                ))}

                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No data
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
