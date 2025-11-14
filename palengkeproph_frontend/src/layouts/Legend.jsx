// Legend.jsx (MUI version — reliable and works inside your MUI layout)
import React from "react";
import { Box, Typography, Stack } from "@mui/material";

const legendItems = [
  { color: "#4CAF50", label: "Available – Ready for Leasing" }, // green
  { color: "#1976D2", label: "Occupied – Tenant Active" },       // blue
  { color: "#FFB300", label: "Reserved – Pending Allocation" },  // orange
  { color: "#E64A19", label: "Under Maintenance – Temporary Repair" }, // yellow
  { color: "#9E9E9E", label: "Inactive – Closed / Admin Disabled" },   // gray
];

export default function Legend({ sx = {}, itemGap = 3 }) {
  return (
    <Box sx={{ ...sx }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
      </Typography>

      {/* Inline / wrap layout */}
      <Stack direction="row" flexWrap="wrap" spacing={itemGap} alignItems="center">
        {legendItems.map((it, idx) => (
          <Stack
            key={idx}
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mr: 2, mb: 1 }}
          >
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: 1,
                bgcolor: it.color,
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset",
                flexShrink: 0,
              }}
            />
            <Typography sx={{ fontSize: 13, whiteSpace: "nowrap" }}>{it.label}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
