import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Button,
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
  Card,
  CardContent,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Home as HomeIcon,
  Receipt,
  CheckCircle,
  PendingActions,
} from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";

export default function CheckRequestAndRelease() {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [dialog, setDialog] = useState({ open: false, action: "", id: null });
  const [currentUser] = useState({
    role: "FinanceHead",
    name: "Finance Manager",
    id: "FIN-001"
  });

  // State for all data
  const [expenses, setExpenses] = useState([]);
  const [checkRequests, setCheckRequests] = useState([]);
  const [checkReleases, setCheckReleases] = useState([]);

  // Load all data from localStorage on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    try {
      const storedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
      const storedRequests = JSON.parse(localStorage.getItem("checkRequests")) || [];
      const storedReleases = JSON.parse(localStorage.getItem("checkReleases")) || [];
      
      console.log("Loaded expenses:", storedExpenses);
      console.log("Loaded requests:", storedRequests);
      console.log("Loaded releases:", storedReleases);

      setExpenses(storedExpenses);
      setCheckRequests(storedRequests);
      setCheckReleases(storedReleases);
    } catch (error) {
      console.error("Error loading data:", error);
      setSnackbar({ open: true, message: "Error loading data", severity: "error" });
    }
  };

  // Get expenses ready for payment (approved but payment not processed)
  const expensesReadyForPayment = expenses.filter(exp => {
    const isApproved = exp.approvalStatus === "Approved";
    const paymentNotProcessed = !exp.paymentStatus || 
                               exp.paymentStatus === "Pending" || 
                               exp.paymentStatus === "Ready for Payment";
    const hasNoCheckRequest = !checkRequests.find(req => req.expenseId === exp.id);
    
    return isApproved && paymentNotProcessed && hasNoCheckRequest;
  });

  const formatAmount = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return `₱${numAmount.toLocaleString()}`;
  };

  // Generate Check Request from Approved Expense
  const handleGenerateRequest = (expenseId) => {
    const expense = expenses.find(exp => exp.id === expenseId);
    if (!expense) {
      setSnackbar({ open: true, message: "Expense not found", severity: "error" });
      return;
    }

    // Create new check request
    const newRequest = {
      id: `CHK-${Date.now()}`,
      expenseId: expense.id,
      date: new Date().toISOString().split("T")[0],
      payee: expense.submittedBy || "Vendor",
      amount: parseFloat(expense.expenseAmount) || 0,
      purpose: expense.expenseDescription || "Expense Payment",
      category: expense.expenseCategory,
      status: "Pending",
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    // Update check requests
    const updatedRequests = [...checkRequests, newRequest];
    setCheckRequests(updatedRequests);
    localStorage.setItem("checkRequests", JSON.stringify(updatedRequests));

    // Update expense payment status
    const updatedExpenses = expenses.map(exp =>
      exp.id === expenseId ? { 
        ...exp, 
        paymentStatus: "Ready for Payment",
        checkRequestDate: new Date().toISOString().split('T')[0],
        financeHead: currentUser.name
      } : exp
    );
    setExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

    setSnackbar({ 
      open: true, 
      message: "Check request generated successfully!", 
      severity: "success" 
    });
  };

  // Handle Approve/Reject/Release actions
  const handleAction = () => {
    const { id, action } = dialog;
    
    if (action === "approve") {
      const updatedRequests = checkRequests.map(req =>
        req.id === id ? { ...req, status: "Approved" } : req
      );
      setCheckRequests(updatedRequests);
      localStorage.setItem("checkRequests", JSON.stringify(updatedRequests));
      setSnackbar({ open: true, message: "Check request approved.", severity: "success" });
    } 
    else if (action === "reject") {
      const updatedRequests = checkRequests.map(req =>
        req.id === id ? { ...req, status: "Rejected" } : req
      );
      setCheckRequests(updatedRequests);
      localStorage.setItem("checkRequests", JSON.stringify(updatedRequests));
      setSnackbar({ open: true, message: "Check request rejected.", severity: "info" });
    } 
    else if (action === "release") {
      const request = checkRequests.find(req => req.id === id);
      if (request) {
        // Create release record
        const newRelease = {
          id: `REL-${Date.now()}`,
          requestId: request.id,
          expenseId: request.expenseId,
          releaseDate: new Date().toISOString().split("T")[0],
          checkNo: `CHK${String(checkReleases.length + 1).padStart(6, '0')}`,
          payee: request.payee,
          amount: request.amount,
          purpose: request.purpose,
          releasedBy: currentUser.name,
          releasedAt: new Date().toISOString(),
        };

        // Update releases
        const updatedReleases = [...checkReleases, newRelease];
        setCheckReleases(updatedReleases);
        localStorage.setItem("checkReleases", JSON.stringify(updatedReleases));

        // Update request status
        const updatedRequests = checkRequests.map(req =>
          req.id === id ? { ...req, status: "Released" } : req
        );
        setCheckRequests(updatedRequests);
        localStorage.setItem("checkRequests", JSON.stringify(updatedRequests));

        // Update expense payment status
        const updatedExpenses = expenses.map(exp =>
          exp.id === request.expenseId ? { 
            ...exp, 
            paymentStatus: "Paid",
            checkReleaseDate: new Date().toISOString().split('T')[0],
            releasedBy: currentUser.name
          } : exp
        );
        setExpenses(updatedExpenses);
        localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

        setSnackbar({ open: true, message: "Check released successfully!", severity: "success" });
      }
    }

    closeDialog();
  };

  // Handle Dialog Open
  const openDialog = (id, action) => {
    setDialog({ open: true, id, action });
  };

  const closeDialog = () => {
    setDialog({ open: false, id: null, action: "" });
  };

  // Refresh data
  const handleRefresh = () => {
    loadAllData();
    setSnackbar({ open: true, message: "Data refreshed", severity: "info" });
  };

  // Statistics
  const pendingRequests = checkRequests.filter(req => req.status === "Pending").length;
  const approvedRequests = checkRequests.filter(req => req.status === "Approved").length;
  const totalReleased = checkReleases.reduce((sum, rel) => sum + (parseFloat(rel.amount) || 0), 0);

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
            <Typography color="text.primary">Check Management</Typography>
          </Breadcrumbs>
        </Box>

        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom color="black">
              Check Request & Release
            </Typography>
            <Typography color="text.secondary">
              Manage check requests and releases with integrated expense tracking
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleRefresh}
              sx={{ borderColor: "#D32F2F", color: "#D32F2F" }}
            >
              Refresh Data
            </Button>
            <Card sx={{ bgcolor: "#FFF5F5", border: "1px solid #D32F2F" }}>
              <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Receipt fontSize="small" />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {currentUser.role}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {currentUser.name}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: "center", bgcolor: "#ffff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h4" color="#D32F2F" fontWeight={700}>
                  {expensesReadyForPayment.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ready for Payment
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: "center", bgcolor: "#ffff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h4" color="#D32F2F" fontWeight={700}>
                  {pendingRequests}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Requests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: "center", bgcolor: "#ffff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h4" color="#2E7D32" fontWeight={700}>
                  {approvedRequests}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: "center", bgcolor: "#ffff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h4" color="#2E7D32" fontWeight={700}>
                  {formatAmount(totalReleased)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Released
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              borderBottom: "1px solid #ddd",
              "& .MuiTab-root": { 
                textTransform: "none", 
                fontWeight: 600,
                fontSize: "1rem"
              },
              "& .Mui-selected": { color: "#D32F2F" },
              mb: 3,
            }}
          >
            <Tab label={`Approved Expenses (${expensesReadyForPayment.length})`} />
            <Tab label={`Check Requests (${checkRequests.length})`} />
            <Tab label={`Released Checks (${checkReleases.length})`} />
          </Tabs>

          {/* === Approved Expenses Tab === */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Approved Expenses Ready for Payment
              </Typography>

              {expensesReadyForPayment.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircle sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                  <Typography color="text.secondary">
                    No approved expenses ready for payment
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Approved expenses will appear here automatically
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                        <TableCell><b>Expense ID</b></TableCell>
                        <TableCell><b>Category</b></TableCell>
                        <TableCell><b>Amount</b></TableCell>
                        <TableCell><b>Date</b></TableCell>
                        <TableCell><b>Submitted By</b></TableCell>
                        <TableCell align="center"><b>Action</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expensesReadyForPayment.map((expense) => (
                        <TableRow key={expense.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {expense.id}
                            </Typography>
                          </TableCell>
                          <TableCell>{expense.expenseCategory}</TableCell>
                          <TableCell>
                            <Typography fontWeight={600} color="#D32F2F">
                              {formatAmount(expense.expenseAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>{expense.submittedBy || "N/A"}</TableCell>
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleGenerateRequest(expense.id)}
                              sx={{ 
                                bgcolor: "#D32F2F",
                                "&:hover": { bgcolor: "#B71C1C" }
                              }}
                            >
                              Generate Check Request
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* === Check Requests Tab === */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Check Request Management
              </Typography>

              {checkRequests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PendingActions sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                  <Typography color="text.secondary">
                    No check requests found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Generate check requests from approved expenses
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                        <TableCell><b>Request ID</b></TableCell>
                        <TableCell><b>Expense ID</b></TableCell>
                        <TableCell><b>Payee</b></TableCell>
                        <TableCell><b>Amount</b></TableCell>
                        <TableCell><b>Purpose</b></TableCell>
                        <TableCell><b>Status</b></TableCell>
                        <TableCell align="center"><b>Action</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {checkRequests.map((request) => (
                        <TableRow key={request.id} hover>
                          <TableCell>{request.id}</TableCell>
                          <TableCell>{request.expenseId}</TableCell>
                          <TableCell>{request.payee}</TableCell>
                          <TableCell>{formatAmount(request.amount)}</TableCell>
                          <TableCell>{request.purpose}</TableCell>
                          <TableCell>
                            <Chip
                              label={request.status}
                              color={
                                request.status === "Approved"
                                  ? "success"
                                  : request.status === "Rejected"
                                  ? "error"
                                  : request.status === "Released"
                                  ? "primary"
                                  : "warning"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {request.status === "Pending" && (
                              <>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  onClick={() => openDialog(request.id, "approve")}
                                  sx={{ mr: 1 }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => openDialog(request.id, "reject")}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {request.status === "Approved" && (
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => openDialog(request.id, "release")}
                              >
                                Release Check
                              </Button>
                            )}
                            {(request.status === "Rejected" || request.status === "Released") && (
                              <Typography variant="body2" color="text.secondary">
                                No actions available
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* === Released Checks Tab === */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Released Checks History
              </Typography>

              {checkReleases.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Receipt sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                  <Typography color="text.secondary">
                    No checks released yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Released checks will appear here
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                        <TableCell><b>Release Date</b></TableCell>
                        <TableCell><b>Check No.</b></TableCell>
                        <TableCell><b>Payee</b></TableCell>
                        <TableCell><b>Amount</b></TableCell>
                        <TableCell><b>Purpose</b></TableCell>
                        <TableCell><b>Released By</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {checkReleases.map((release) => (
                        <TableRow key={release.id} hover>
                          <TableCell>{release.releaseDate}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {release.checkNo}
                            </Typography>
                          </TableCell>
                          <TableCell>{release.payee}</TableCell>
                          <TableCell>{formatAmount(release.amount)}</TableCell>
                          <TableCell>{release.purpose}</TableCell>
                          <TableCell>{release.releasedBy}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
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
            <Button 
              onClick={handleAction} 
              variant="contained" 
              color={dialog.action === "reject" ? "error" : "primary"}
            >
              Confirm
            </Button>
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