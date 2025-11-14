import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Snackbar,
  Alert,
  MenuItem,
  LinearProgress,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import MainLayout from "../../layouts/MainLayout";

export default function Budgeting() {
  const [budgets, setBudgets] = useState([
    {
      id: 1,
      category: "Office Supplies",
      period: "Monthly",
      budgetAmount: 10000,
      actualExpenses: 9500,
    },
    {
      id: 2,
      category: "Utilities",
      period: "Monthly",
      budgetAmount: 8000,
      actualExpenses: 9200,
    },
    {
      id: 3,
      category: "Maintenance",
      period: "Quarterly",
      budgetAmount: 20000,
      actualExpenses: 12000,
    },
  ]);

  const [formData, setFormData] = useState({
    category: "",
    period: "",
    budgetAmount: "",
  });

  const [filterPeriod, setFilterPeriod] = useState("All");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const budgetPeriods = ["Monthly", "Quarterly", "Annually"];

  const handleAddBudget = () => {
    if (!formData.category || !formData.period || !formData.budgetAmount) {
      setSnackbar({ open: true, message: "Please complete all fields.", severity: "warning" });
      return;
    }

    const newBudget = {
      id: budgets.length + 1,
      category: formData.category,
      period: formData.period,
      budgetAmount: parseFloat(formData.budgetAmount),
      actualExpenses: 0,
    };

    setBudgets([...budgets, newBudget]);
    setFormData({ category: "", period: "", budgetAmount: "" });
    setSnackbar({ open: true, message: "Budget created successfully!", severity: "success" });
  };

  const handleSimulateExpense = (id) => {
    const updated = budgets.map((b) => {
      if (b.id === id) {
        const randomExpense = Math.floor(Math.random() * 3000 + 500);
        return {
          ...b,
          actualExpenses: Math.min(b.actualExpenses + randomExpense, b.budgetAmount * 1.5),
        };
      }
      return b;
    });
    setBudgets(updated);
  };

  const formatAmount = (val) => `₱${val.toLocaleString()}`;

  const getStatus = (b) => {
    const ratio = b.actualExpenses / b.budgetAmount;
    if (ratio >= 1) return { label: "Overrun", color: "error" };
    if (ratio >= 0.9) return { label: "Approaching Limit", color: "warning" };
    return { label: "Within Budget", color: "success" };
  };

  const filteredBudgets =
    filterPeriod === "All" ? budgets : budgets.filter((b) => b.period === filterPeriod);

  const totalBudget = filteredBudgets.reduce((a, b) => a + b.budgetAmount, 0);
  const totalExpenses = filteredBudgets.reduce((a, b) => a + b.actualExpenses, 0);
  const remaining = totalBudget - totalExpenses;

  return (
    <MainLayout>
      <Box>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" href="#">
            Finance Management
          </Link>
          <Typography color="text.primary">Budgeting</Typography>
        </Breadcrumbs>

        <Typography variant="h5" sx={{ fontWeight: 700, color: "#D32F2F", mb: 2 }}>
          Budgeting and Expense Tracking
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: "#fce4ec", borderLeft: "6px solid #D32F2F" }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Budget
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatAmount(totalBudget)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: "#fff3e0", borderLeft: "6px solid #FB8C00" }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Expenses
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatAmount(totalExpenses)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: "#e8f5e9", borderLeft: "6px solid #388E3C" }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Remaining Budget
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatAmount(remaining)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Create Budget Section */}
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Create New Budget
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Expense Category"
                fullWidth
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Budget Period"
                fullWidth
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              >
                {budgetPeriods.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Budget Amount"
                type="number"
                fullWidth
                value={formData.budgetAmount}
                onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                sx={{ height: "100%", bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
                onClick={handleAddBudget}
              >
                Create
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Filter Section */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <TextField
            select
            label="Filter by Period"
            size="small"
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="All">All</MenuItem>
            {budgetPeriods.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Table Section */}
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Track Actual Expenses vs. Budget
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8f8f8" }}>
                  <TableCell>Expense Category</TableCell>
                  <TableCell>Budget Period</TableCell>
                  <TableCell>Budget Amount</TableCell>
                  <TableCell>Actual Expenses</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBudgets.map((row) => {
                  const percentage = Math.min((row.actualExpenses / row.budgetAmount) * 100, 100);
                  const status = getStatus(row);

                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{row.period}</TableCell>
                      <TableCell>{formatAmount(row.budgetAmount)}</TableCell>
                      <TableCell>{formatAmount(row.actualExpenses)}</TableCell>
                      <TableCell sx={{ width: 200 }}>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          color={status.color}
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={status.label} color={status.color} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleSimulateExpense(row.id)}
                          sx={{
                            color: "#D32F2F",
                            borderColor: "#D32F2F",
                            "&:hover": { bgcolor: "#fdecea" },
                          }}
                        >
                          Add Expense
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Bar Chart */}
        <Paper sx={{ mt: 3, p: 3, borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Budget vs Actual Overview
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredBudgets}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budgetAmount" fill="#D32F2F" name="Budget" />
              <Bar dataKey="actualExpenses" fill="#FB8C00" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}
