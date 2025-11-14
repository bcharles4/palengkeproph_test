import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogActions,
  Chip,
} from "@mui/material";
import MainLayout from "../../layouts/MainLayout";

export default function CheckRequestAndRelease() {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [dialog, setDialog] = useState({ open: false, action: "", id: null });

  const [requests, setRequests] = useState([
    { id: 1, date: "2025-10-25", payee: "Market Supply Co.", amount: 15000, purpose: "Stall Maintenance", status: "Pending" },
    { id: 2, date: "2025-10-26", payee: "Waterworks Inc.", amount: 8200, purpose: "Water Bill", status: "Approved" },
  ]);

  const [releases, setReleases] = useState([
    { id: 1, releaseDate: "2025-10-27", checkNo: "000123", payee: "Market Supply Co.", releasedBy: "Admin1", amount: "₱15,000" },
  ]);

  const [formData, setFormData] = useState({
    payee: "",
    amount: "",
    purpose: "",
  });

  const formatAmount = (amount) => `₱${amount.toLocaleString()}`;

  // Submit New Request
  const handleSubmit = () => {
    if (!formData.payee || !formData.amount || !formData.purpose) {
      setSnackbar({ open: true, message: "Please fill out all fields.", severity: "warning" });
      return;
    }

    const newRequest = {
      id: requests.length + 1,
      date: new Date().toISOString().split("T")[0],
      payee: formData.payee,
      amount: parseFloat(formData.amount),
      purpose: formData.purpose,
      status: "Pending",
    };

    setRequests([...requests, newRequest]);
    setFormData({ payee: "", amount: "", purpose: "" });
    setSnackbar({ open: true, message: "Check request submitted successfully!", severity: "success" });
  };

  // Handle Dialog Open
  const openDialog = (id, action) => {
    setDialog({ open: true, id, action });
  };

  const closeDialog = () => {
    setDialog({ open: false, id: null, action: "" });
  };

  // Handle Approve/Reject/Release
  const handleAction = () => {
    const { id, action } = dialog;
    const updatedRequests = [...requests];
    const target = updatedRequests.find((r) => r.id === id);

    if (action === "approve") {
      target.status = "Approved";
      setSnackbar({ open: true, message: "Request approved successfully.", severity: "success" });
    } else if (action === "reject") {
      target.status = "Rejected";
      setSnackbar({ open: true, message: "Request rejected.", severity: "info" });
    } else if (action === "release") {
      target.status = "Released";
      const newRelease = {
        id: releases.length + 1,
        releaseDate: new Date().toISOString().split("T")[0],
        checkNo: "000" + (123 + releases.length),
        payee: target.payee,
        releasedBy: "Executive",
        amount: formatAmount(target.amount),
      };
      setReleases([...releases, newRelease]);
      setSnackbar({ open: true, message: "Check released successfully.", severity: "success" });
    }

    setRequests(updatedRequests);
    closeDialog();
  };

  return (
    <MainLayout>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#D32F2F", mb: 2 }}>
          Check Request and Release
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              borderBottom: "1px solid #ddd",
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
              "& .Mui-selected": { color: "#D32F2F" },
              mb: 2,
            }}
          >
            <Tab label="Check Requests" />
            <Tab label="Check Releases" />
          </Tabs>

          {/* === Check Request Tab === */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                New Check Request
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Payee"
                    fullWidth
                    value={formData.payee}
                    onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Amount"
                    type="number"
                    fullWidth
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Purpose"
                    fullWidth
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <Button
                    variant="contained"
                    sx={{ height: "100%", bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
                    fullWidth
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>

              {/* Pending Request Table */}
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Check Request List
              </Typography>

              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8f8f8" }}>
                      <TableCell>Date</TableCell>
                      <TableCell>Payee</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Purpose</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.payee}</TableCell>
                        <TableCell>{formatAmount(row.amount)}</TableCell>
                        <TableCell>{row.purpose}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.status}
                            color={
                              row.status === "Approved"
                                ? "success"
                                : row.status === "Rejected"
                                ? "default"
                                : row.status === "Released"
                                ? "primary"
                                : "warning"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {row.status === "Pending" && (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                onClick={() => openDialog(row.id, "approve")}
                                sx={{ mr: 1 }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => openDialog(row.id, "reject")}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {row.status === "Approved" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => openDialog(row.id, "release")}
                            >
                              Release
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* === Released Checks Tab === */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Released Checks
              </Typography>

              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8f8f8" }}>
                      <TableCell>Release Date</TableCell>
                      <TableCell>Check No.</TableCell>
                      <TableCell>Payee</TableCell>
                      <TableCell>Released By</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {releases.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.releaseDate}</TableCell>
                        <TableCell>{row.checkNo}</TableCell>
                        <TableCell>{row.payee}</TableCell>
                        <TableCell>{row.releasedBy}</TableCell>
                        <TableCell>{row.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>

        {/* Confirmation Dialog */}
        <Dialog open={dialog.open} onClose={closeDialog}>
          <DialogTitle>
            {dialog.action === "approve"
              ? "Approve this check request?"
              : dialog.action === "reject"
              ? "Reject this check request?"
              : "Release this check?"}
          </DialogTitle>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleAction} variant="contained" color="error">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

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
