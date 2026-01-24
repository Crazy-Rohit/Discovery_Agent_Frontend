import React, { useEffect, useState } from "react";
import { Grid, Card, CardActionArea, CardContent, Typography, Box } from "@mui/material";
import { getScreenshots } from "../../features/data/data.api";

function toSafeUrl(path) {
  if (!path) return null;
  // If backend stores full URLs, keep as-is
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // If it stores relative paths, try to load relative to same origin
  // (You can improve later by adding a backend /static route)
  return path;
}

export default function RecentScreenshots({ from, to, limit = 8 }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const res = await getScreenshots({ from, to, page: 1, limit });
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
        No screenshots in this date range.
      </Typography>
    );
  }

  return (
    <Grid container spacing={2}>
      {items.map((s, idx) => {
        const url = toSafeUrl(s.path);
        return (
          <Grid key={`${s.ts}-${idx}`} item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
              <CardActionArea
                onClick={() => url && window.open(url, "_blank", "noopener,noreferrer")}
                disabled={!url}
              >
                <Box
                  sx={{
                    height: 120,
                    background: "rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {url ? (
                    <img
                      src={url}
                      alt="screenshot"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        // hide broken images gracefully
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      No preview
                    </Typography>
                  )}
                </Box>

                <CardContent sx={{ py: 1.25 }}>
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>
                    {String(s.ts || "").replace("Z", "")} • {s.company_username || "—"}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                    {s.application || "unknown"}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
