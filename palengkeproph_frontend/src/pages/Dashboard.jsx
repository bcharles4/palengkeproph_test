 import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import MainLayout from "../layouts/MainLayout";

export default function Dashboard() {
  return (
    <MainLayout>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Overview
      </Typography>

      <Grid container spacing={2}>
        {[ 
          { title: "Revenue", value: "$528,976.82", change: "-7.9%" },
          { title: "Best Deal", value: "$42,300", change: "+8.5%" },
          { title: "Leads", value: "256", change: "+12%" },
        ].map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              <CardContent>
                <Typography color="text.secondary">{card.title}</Typography>
                <Typography variant="h6" fontWeight={700}>
                  {card.value}
                </Typography>
                <Typography
                  variant="body2"
                  color={card.change.includes("-") ? "error.main" : "success.main"}
                >
                  {card.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={4}>
        <Card sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <Typography variant="h6" mb={2}>
            Sales Overview
          </Typography>
          <Typography color="text.secondary">
            You can integrate charts here using Recharts or Chart.js
          </Typography>
        </Card>
      </Box>
    </MainLayout>
  );
}
