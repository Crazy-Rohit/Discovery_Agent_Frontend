import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { getLogs } from "../../features/data/data.api";

export default function RecentLogsTable({ from, to, limit = 10 }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const res = await getLogs({ from, to, page: 1, limit });
      if (mounted) setData(res);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [from, to, limit]);

  const items = data?.items || [];
  if (!items.length) {
    return (
      <Typography variant="body2" sx={{ opacity: 0.7 }}>
        No logs in this date range.
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>User</TableCell>
            <TableCell>App</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Operation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((r, idx) => (
            <TableRow key={`${r.ts}-${idx}`} hover>
              <TableCell>{String(r.ts || "").replace("Z", "")}</TableCell>
              <TableCell>{r.company_username || "—"}</TableCell>
              <TableCell>{r.application || "—"}</TableCell>
              <TableCell>{r.category || "—"}</TableCell>
              <TableCell>{r.operation || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
