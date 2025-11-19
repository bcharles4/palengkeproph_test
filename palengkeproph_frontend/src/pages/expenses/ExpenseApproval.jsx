import React, { useState, useEffect } from "react";
import HomeIcon from "@mui/icons-material/Home";
import {
  Box,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  PendingActions,
  AttachMoney,
  Security,
  AdminPanelSettings,
} from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";

export default function ExpenseApproval() {
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [currentUser] = useState({
    role: "Manager", // Changed to FinanceHead for payment testing
    name: "John Smith",
    id: "USER-001"
  });

  // Safe amount formatter
  const formatAmount = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return `₱${numAmount.toLocaleString()}`;
  };

  // Approval thresholds based on role
  const approvalThresholds = {
    Manager: 10000,       // Up to ₱10,000
    MarketMaster: 50000,  // Up to ₱50,000
    Executive: Infinity,  // No threshold
    FinanceHead: Infinity // For payment processing
  };

  // Load expenses from localStorage
  useEffect(() => {
    const storedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(storedExpenses);
  }, []);

  // Check if user can approve based on amount and role
  const canApproveExpense = (expenseAmount) => {
    const userThreshold = approvalThresholds[currentUser.role];
    return expenseAmount <= userThreshold;
  };

  // Approve expense handler
  const handleApproveExpense = (expenseId) => {
    const updated = expenses.map((exp) =>
      exp.id === expenseId ? { 
        ...exp, 
        approvalStatus: "Approved",
        approver: currentUser.name,
        approverId: currentUser.id,
        approvedAt: new Date().toISOString()
      } : exp
    );
    setExpenses(updated);
    localStorage.setItem("expenses", JSON.stringify(updated));
    setOpenDialog(false);
    setRejectionReason("");
    setSnackbar({ open: true, message: "Expense approved successfully!", severity: "success" });
  };

  // Reject expense handler
  const handleRejectExpense = (expenseId) => {
    if (!rejectionReason.trim()) {
      setSnackbar({ open: true, message: "Please provide a rejection reason", severity: "warning" });
      return;
    }

    const updated = expenses.map((exp) =>
      exp.id === expenseId ? { 
        ...exp, 
        approvalStatus: "Rejected",
        approver: currentUser.name,
        approverId: currentUser.id,
        rejectionReason: rejectionReason,
        rejectedAt: new Date().toISOString()
      } : exp
    );
    setExpenses(updated);
    localStorage.setItem("expenses", JSON.stringify(updated));
    setOpenDialog(false);
    setRejectionReason("");
    setSnackbar({ open: true, message: "Expense rejected successfully!", severity: "info" });
  };

  // Generate check request (Finance Head only)
  const handleGenerateCheckRequest = (expenseId) => {
    const updated = expenses.map((exp) =>
      exp.id === expenseId ? { 
        ...exp, 
        paymentStatus: "Ready for Payment",
        checkRequestDate: new Date().toISOString().split('T')[0],
        financeHead: currentUser.name
      } : exp
    );
    setExpenses(updated);
    localStorage.setItem("expenses", JSON.stringify(updated));
    setOpenDialog(false);
    setSnackbar({ open: true, message: "Check request generated!", severity: "success" });
  };

  // Authorize check release (Executive only)
  const handleAuthorizeCheckRelease = (expenseId) => {
    const updated = expenses.map((exp) =>
      exp.id === expenseId ? { 
        ...exp, 
        paymentStatus: "Paid",
        checkReleaseDate: new Date().toISOString().split('T')[0],
        releasedBy: currentUser.name
      } : exp
    );
    setExpenses(updated);
    localStorage.setItem("expenses", JSON.stringify(updated));
    setOpenDialog(false);
    setSnackbar({ open: true, message: "Check released and marked as paid!", severity: "success" });
  };

  // Filter expenses based on selected status and user role
  const filteredExpenses = expenses.filter((exp) => {
    if (filterStatus === "Pending") {
      return exp.approvalStatus === "Pending";
    } else if (filterStatus === "Approved") {
      return exp.approvalStatus === "Approved";
    } else if (filterStatus === "Rejected") {
      return exp.approvalStatus === "Rejected";
    } else if (filterStatus === "Ready for Payment") {
      return exp.paymentStatus === "Ready for Payment";
    } else if (filterStatus === "Paid") {
      return exp.paymentStatus === "Paid";
    }
    return true;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "success";
      case "Rejected": return "error";
      case "Paid": return "success";
      case "Ready for Payment": return "warning";
      default: return "warning";
    }
  };

  // Get user role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case "Manager": return <Security fontSize="small" />;
      case "MarketMaster": return <AdminPanelSettings fontSize="small" />;
      case "Executive": return <AttachMoney fontSize="small" />;
      case "FinanceHead": return <AttachMoney fontSize="small" />;
      default: return <Security fontSize="small" />;
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Breadcrumbs */}
        <Box mb={3}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              href="/dashboard"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                "&:hover": { color: "#D32F2F" },
              }}
            >
              <HomeIcon fontSize="small" /> Dashboard
            </Link>
            <Link
              underline="hover"
              color="inherit"
              href="/expenses"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                "&:hover": { color: "#D32F2F" },
              }}
            >
              Expense Management
            </Link>
            <Typography color="text.primary">Expense Approval</Typography>
          </Breadcrumbs>
        </Box>

        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom color="black">
              Expense Approval
            </Typography>
            <Typography color="text.secondary">
              Review, approve, and manage expense payments with role-based authorization
            </Typography>
          </Box>
          <Card sx={{ bgcolor: "#FFF5F5", border: "1px solid #D32F2F" }}>
            <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {getRoleIcon(currentUser.role)}
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {currentUser.role}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Threshold: {approvalThresholds[currentUser.role] === Infinity ? "No limit" : formatAmount(approvalThresholds[currentUser.role])}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Approval Process Stepper */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)",}}>
          <Typography variant="h6" gutterBottom color="black">
            Expense Approval Process
          </Typography>
          <Stepper activeStep={-1} alternativeLabel>
            <Step>
              <StepLabel>Submit Expense</StepLabel>
            </Step>
            <Step>
              <StepLabel>Manager Approval</StepLabel>
            </Step>
            <Step>
              <StepLabel>Market Master Approval</StepLabel>
            </Step>
            <Step>
              <StepLabel>Executive Approval</StepLabel>
            </Step>
            <Step>
              <StepLabel>Check Request</StepLabel>
            </Step>
            <Step>
              <StepLabel>Payment Release</StepLabel>
            </Step>
          </Stepper>
        </Paper>

        {/* Filter Buttons */}
        <Box mb={3} display="flex" gap={1} flexWrap="wrap">
          <Button
            variant={filterStatus === "Pending" ? "contained" : "outlined"}
            startIcon={<PendingActions />}
            onClick={() => setFilterStatus("Pending")}
            sx={{ 
              bgcolor: filterStatus === "Pending" ? "#D32F2F" : "transparent",
              "&:hover": { bgcolor: filterStatus === "Pending" ? "#B71C1C" : "rgba(211, 47, 47, 0.1)" }
            }}
          >
            Pending Approval
          </Button>
          <Button
            variant={filterStatus === "Approved" ? "contained" : "outlined"}
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => setFilterStatus("Approved")}
          >
            Approved
          </Button>
          <Button
            variant={filterStatus === "Rejected" ? "contained" : "outlined"}
            color="error"
            startIcon={<Cancel />}
            onClick={() => setFilterStatus("Rejected")}
          >
            Rejected
          </Button>
          <Button
            variant={filterStatus === "Ready for Payment" ? "contained" : "outlined"}
            color="warning"
            onClick={() => setFilterStatus("Ready for Payment")}
          >
            Ready for Payment
          </Button>
          <Button
            variant={filterStatus === "Paid" ? "contained" : "outlined"}
            color="success"
            onClick={() => setFilterStatus("Paid")}
          >
            Paid
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ textAlign: "center", bgcolor: "#ffff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", borderRadius: 3  }}>
              <CardContent>
                <Typography variant="h4" color="#D32F2F" fontWeight={700}>
                  {expenses.filter(exp => exp.approvalStatus === "Pending").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ textAlign: "center", bgcolor: "#ffff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h4" color="#2E7D32" fontWeight={700}>
                  {expenses.filter(exp => exp.approvalStatus === "Approved").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ textAlign: "center", bgcolor: "#ffff",boxShadow: "0 2px 8px rgba(0,0,0,0.2)", borderRadius: 3  }}>
              <CardContent>
                <Typography variant="h4" color="#D32F2F" fontWeight={700}>
                  {expenses.filter(exp => exp.approvalStatus === "Rejected").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rejected
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ textAlign: "center", bgcolor: "#ffff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", borderRadius: 3  }}>
              <CardContent>
                <Typography variant="h4" color="#EF6C00" fontWeight={700}>
                  {expenses.filter(exp => exp.paymentStatus === "Ready for Payment").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ready for Payment
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ textAlign: "center", bgcolor: "#ffff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", borderRadius: 3  }}>
              <CardContent>
                <Typography variant="h4" color="#2E7D32" fontWeight={700}>
                  {expenses.filter(exp => exp.paymentStatus === "Paid").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Paid
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Table */}
        <TableContainer component={Paper} sx={{boxShadow: "0 2px 8px rgba(0,0,0,0.2)", borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell><b>Expense ID</b></TableCell>
                <TableCell><b>Category</b></TableCell>
                <TableCell><b>Amount (₱)</b></TableCell>
                <TableCell><b>Date</b></TableCell>
                <TableCell><b>Approval Status</b></TableCell>
                <TableCell><b>Payment Status</b></TableCell>
                <TableCell><b>Approver</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <TableRow key={exp.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {exp.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{exp.expenseCategory}</TableCell>
                    <TableCell>
                      <Typography fontWeight={600} color="#D32F2F">
                        {formatAmount(exp.expenseAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={exp.approvalStatus || "Pending"}
                        size="small"
                        color={getStatusColor(exp.approvalStatus)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={exp.paymentStatus || "Pending"}
                        size="small"
                        color={getStatusColor(exp.paymentStatus)}
                        variant={exp.paymentStatus === "Pending" ? "outlined" : "filled"}
                      />
                    </TableCell>
                    <TableCell>{exp.approver || "N/A"}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedExpense(exp);
                          setOpenDialog(true);
                        }}
                        sx={{ 
                          borderColor: "#D32F2F", 
                          color: "#D32F2F",
                          "&:hover": { bgcolor: "#FFF5F5" }
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <PendingActions sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                    <Typography color="text.secondary">
                      No {filterStatus.toLowerCase()} expenses found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Expense Details Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: "#FFF5F5", borderBottom: 1, borderColor: "#D32F2F" }}>
            <Typography variant="h6" color="#D32F2F">
              Expense Details - {selectedExpense?.id}
            </Typography>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            {selectedExpense && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Expense ID</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedExpense.id}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedExpense.expenseCategory}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                  <Typography variant="h6" color="#D32F2F" sx={{ mb: 2 }}>
                    {formatAmount(selectedExpense.expenseAmount)}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedExpense.expenseDate ? new Date(selectedExpense.expenseDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Approval Status</Typography>
                  <Chip
                    label={selectedExpense.approvalStatus || "Pending"}
                    color={getStatusColor(selectedExpense.approvalStatus)}
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="subtitle2" color="text.secondary">Payment Status</Typography>
                  <Chip
                    label={selectedExpense.paymentStatus || "Pending"}
                    color={getStatusColor(selectedExpense.paymentStatus)}
                    variant={selectedExpense.paymentStatus === "Pending" ? "outlined" : "filled"}
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="subtitle2" color="text.secondary">Approver</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedExpense.approver || "N/A"}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Charged To</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedExpense.chargedTo || "N/A"}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1" sx={{ mb: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
                    {selectedExpense.expenseDescription || 'N/A'}
                  </Typography>
                </Grid>

                {/* Check Dates */}
                {(selectedExpense.checkRequestDate || selectedExpense.checkReleaseDate) && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      Payment Information
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedExpense.checkRequestDate && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">Check Request Date</Typography>
                          <Typography variant="body1">{selectedExpense.checkRequestDate}</Typography>
                        </Grid>
                      )}
                      {selectedExpense.checkReleaseDate && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">Check Release Date</Typography>
                          <Typography variant="body1">{selectedExpense.checkReleaseDate}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                )}

                {/* Rejection Reason */}
                {selectedExpense.rejectionReason && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      <Typography variant="subtitle2">Rejection Reason:</Typography>
                      <Typography>{selectedExpense.rejectionReason}</Typography>
                    </Alert>
                  </Grid>
                )}

                {/* Receipt */}
                {selectedExpense.receipt && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Receipt</Typography>
                    <img
                      src={selectedExpense.receipt.data}
                      alt="Receipt"
                      style={{
                        width: "100%",
                        maxHeight: 300,
                        objectFit: "contain",
                        borderRadius: 8,
                        marginTop: 8,
                        border: "1px solid #ddd"
                      }}
                    />
                  </Grid>
                )}

                {/* Rejection Reason Input */}
                {selectedExpense.approvalStatus === "Pending" && (
                  <Grid item xs={12}>
                    <TextField
                      label="Rejection Reason (Required for rejection)"
                      multiline
                      rows={3}
                      fullWidth
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejecting this expense..."
                    />
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            {selectedExpense?.approvalStatus === "Pending" && (
              <>
                <Button
                  onClick={() => handleRejectExpense(selectedExpense.id)}
                  color="error"
                  variant="outlined"
                  startIcon={<Cancel />}
                  disabled={!rejectionReason.trim()}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproveExpense(selectedExpense.id)}
                  variant="contained"
                  startIcon={<CheckCircle />}
                  disabled={!canApproveExpense(selectedExpense.expenseAmount)}
                  sx={{ 
                    bgcolor: "#2E7D32", 
                    "&:hover": { bgcolor: "#1B5E20" },
                    "&.Mui-disabled": { bgcolor: "grey.300" }
                  }}
                >
                  {canApproveExpense(selectedExpense.expenseAmount) ? "Approve" : "Cannot Approve"}
                </Button>
              </>
            )}
            
            {selectedExpense?.approvalStatus === "Approved" && currentUser.role === "FinanceHead" && (
              <Button
                onClick={() => handleGenerateCheckRequest(selectedExpense.id)}
                variant="contained"
                color="warning"
              >
                Generate Check Request
              </Button>
            )}
            
            {selectedExpense?.paymentStatus === "Ready for Payment" && currentUser.role === "Executive" && (
              <Button
                onClick={() => handleAuthorizeCheckRelease(selectedExpense.id)}
                variant="contained"
                color="success"
              >
                Authorize Check Release
              </Button>
            )}
            
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}