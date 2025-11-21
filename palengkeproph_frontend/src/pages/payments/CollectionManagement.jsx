import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  Stack,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { Monitor, Receipt, RefreshCw, FileText, CheckCircle, Upload, Calculator } from "lucide-react";
import MainLayout from "../../layouts/MainLayout";

const CollectionManagement = () => {
  const [collectors, setCollectors] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [reconciliationResult, setReconciliationResult] = useState(null);
  const [openAuditDialog, setOpenAuditDialog] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [activeStep, setActiveStep] = useState(0);
  const [receipts, setReceipts] = useState([]);
  const [dailyReport, setDailyReport] = useState({
    totalCash: 0,
    encodedTotal: 0,
    balanceStatus: "pending"
  });

  const steps = [
    {
      label: 'Preparation & Receipt Management',
      description: 'Obtain ARs from AR Keeper and prepare collection receipts',
    },
    {
      label: 'Field Collection Activities',
      description: 'Collect payments and issue official receipts to tenants',
    },
    {
      label: 'Post-Collection & Reconciliation',
      description: 'Cancel unused receipts, count cash, and encode DCR',
    },
    {
      label: 'Cash Remittance',
      description: 'Remit cash to Cashier and obtain acknowledgment',
    },
  ];

  useEffect(() => {
    refreshData();
    initializeReceipts();
  }, []);

  const refreshData = () => {
    // Load transactions from payment history
    const storedPayments = JSON.parse(localStorage.getItem("paymentHistory")) || [];
    
    // Transform payment data to transaction format
    const paymentTransactions = storedPayments.map(payment => ({
      id: payment.id,
      collectorId: payment.collectorId,
      collectorName: payment.collectorName,
      payer: payment.tenantName,
      amount: parseFloat(payment.amount),
      receiptNo: payment.receiptNumber,
      date: payment.date.split('T')[0],
      paymentType: payment.paymentTypeLabel,
      method: payment.method,
      stallName: payment.stallName,
      rent: payment.rent || 0,
      rights: payment.rights || 0,
      electricity: payment.electricity || 0,
      water: payment.water || 0
    }));

    setTransactions(paymentTransactions);

    // Load collectors
    const storedCollectors = JSON.parse(localStorage.getItem("collectors")) || [
      { id: "C-001", name: "Juan Dela Cruz", area: "Stall Area A" },
      { id: "C-002", name: "Maria Santos", area: "Parking Zone 1" },
    ];
    setCollectors(storedCollectors);
    
    setAlert({
      open: true,
      message: "Data refreshed successfully",
      severity: "success",
    });
  };

  const initializeReceipts = () => {
    // Simulate receipt management
    const sampleReceipts = [
      { id: "AR-001", status: "assigned", tenant: "Tenant A", amount: 1500, reason: "" },
      { id: "AR-002", status: "assigned", tenant: "Tenant B", amount: 2000, reason: "" },
      { id: "AR-003", status: "unused", tenant: "", amount: 0, reason: "" },
      { id: "AR-004", status: "unused", tenant: "", amount: 0, reason: "" },
    ];
    setReceipts(sampleReceipts);
  };

  const handleAssignCollector = (id, area) => {
    const updated = collectors.map((c) => (c.id === id ? { ...c, area } : c));
    setCollectors(updated);
    localStorage.setItem("collectors", JSON.stringify(updated));
    setAlert({
      open: true,
      message: `Collector ${id} assigned to ${area}`,
      severity: "success",
    });
  };

  const handleObtainReceipts = () => {
    setAlert({
      open: true,
      message: "Acknowledgement Receipts obtained from AR Keeper",
      severity: "success",
    });
    setActiveStep(1);
  };

  const handleCancelUnusedReceipts = () => {
    const updatedReceipts = receipts.map(receipt => 
      receipt.status === "unused" ? { ...receipt, status: "cancelled", reason: "Stall Closed" } : receipt
    );
    setReceipts(updatedReceipts);
    setAlert({
      open: true,
      message: "Unused receipts cancelled with remarks",
      severity: "success",
    });
  };

  const handleEncodeDCR = () => {
    const totalCollected = transactions
      .filter(t => t.collectorId === selectedCollector)
      .reduce((sum, t) => sum + t.amount, 0);

    setDailyReport({
      totalCash: parseFloat(cashReceived) || 0,
      encodedTotal: totalCollected,
      balanceStatus: totalCollected === parseFloat(cashReceived) ? "balanced" : "discrepancy"
    });

    setAlert({
      open: true,
      message: "Daily Collection Report encoded successfully",
      severity: "success",
    });
    setActiveStep(3);
  };

  const handleRemitCash = () => {
    setAlert({
      open: true,
      message: "Cash remitted to Cashier with acknowledgment",
      severity: "success",
    });
    setActiveStep(4);
  };

  const handleReconcile = () => {
    if (!selectedCollector || !cashReceived) {
      setAlert({
        open: true,
        message: "Please select a collector and enter cash amount.",
        severity: "warning",
      });
      return;
    }

    const totalCollected = transactions
      .filter((t) => t.collectorId === selectedCollector)
      .reduce((sum, t) => sum + t.amount, 0);

    const diff = cashReceived - totalCollected;
    setReconciliationResult({ totalCollected, diff });
    setAlert({
      open: true,
      message:
        diff === 0
          ? "Reconciliation complete. All amounts match."
          : `Reconciliation discrepancy detected. Difference: ₱${diff.toLocaleString()}`,
      severity: diff === 0 ? "success" : "error",
    });
  };

  const handleGenerateAudit = () => {
    if (transactions.length === 0) {
      setAlert({
        open: true,
        message: "No transactions available for audit.",
        severity: "warning",
      });
      return;
    }

    const random = transactions[Math.floor(Math.random() * transactions.length)];
    if (random) {
      const newAudit = {
        id: `AUD-${Date.now()}`,
        collectorId: random.collectorId,
        collectorName: random.collectorName,
        receiptNo: random.receiptNo,
        amount: random.amount,
        payer: random.payer,
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toLocaleString(),
      };
      setAuditLogs((prev) => [...prev, newAudit]);
      setOpenAuditDialog(true);
      
      setAlert({
        open: true,
        message: "Audit request generated successfully",
        severity: "success",
      });
    }
  };

  // Calculate total collections across all collectors
  const totalCollections = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <MainLayout>
      {/* 🧭 Breadcrumbs */}
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            href="/dashboard"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <HomeIcon fontSize="small" /> Dashboard
          </Link>
          <Typography color="text.primary">Collection Management</Typography>
        </Breadcrumbs>
      </Box>

      {/* 🔖 Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight={700}>
          Collection Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshCw size={20} />}
          onClick={refreshData}
        >
          Refresh Data
        </Button>
      </Stack>

      {/* SOP Process Stepper */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FileText size={20} /> Area Collector Daily Operations
        </Typography>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Typography>{step.description}</Typography>
                {index === 0 && (
                  <Button variant="contained" onClick={handleObtainReceipts} sx={{ mt: 2 }}>
                    Obtain ARs from Keeper
                  </Button>
                )}
                {index === 2 && (
                  <Box sx={{ mt: 2 }}>
                    <Button variant="outlined" onClick={handleCancelUnusedReceipts} sx={{ mr: 2 }}>
                      Cancel Unused Receipts
                    </Button>
                    <Button variant="contained" onClick={handleEncodeDCR}>
                      Encode DCR
                    </Button>
                  </Box>
                )}
                {index === 3 && (
                  <Button variant="contained" onClick={handleRemitCash} sx={{ mt: 2 }}>
                    Remit Cash to Cashier
                  </Button>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <Typography color="text.secondary" gutterBottom>
              Total Collectors
            </Typography>
            <Typography variant="h4" component="div" color="#D32F2F" sx={{fontWeight: "700"}}>
              {collectors.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <Typography color="text.secondary" gutterBottom>
              Active Receipts
            </Typography>
            <Typography variant="h4" component="div" sx={{fontWeight:"700"}}>
              {receipts.filter(r => r.status === "assigned").length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <Typography color="text.secondary" gutterBottom>
              Total Collections
            </Typography>
            <Typography variant="h4" component="div" sx={{fontWeight:"700"}}>
              ₱{totalCollections.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <Typography color="text.secondary" gutterBottom>
              Balance Status
            </Typography>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{
                fontWeight: "700",
                color: dailyReport.balanceStatus === "balanced" ? "green" : 
                       dailyReport.balanceStatus === "discrepancy" ? "red" : "orange"
              }}
            >
              {dailyReport.balanceStatus === "balanced" ? "Balanced" : 
               dailyReport.balanceStatus === "discrepancy" ? "Discrepancy" : "Pending"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* SECTION 1: Collector Assignment */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
        >
          <AssignmentIndIcon fontSize="small" /> Collector Assignment
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Table>
          <TableHead sx={{ bgcolor: "#f9f9f9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Collector ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Assigned Area</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Reassign</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collectors.map((col) => (
              <TableRow key={col.id}>
                <TableCell>{col.id}</TableCell>
                <TableCell>{col.name}</TableCell>
                <TableCell>{col.area}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    placeholder="Enter new area"
                    onBlur={(e) => handleAssignCollector(col.id, e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* SECTION 2: Receipt Management */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Receipt size={20} /> Receipt Management
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Receipt Status</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Receipt No</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>{receipt.id}</TableCell>
                    <TableCell>
                      <Typography 
                        sx={{ 
                          color: receipt.status === "assigned" ? "green" : 
                                receipt.status === "cancelled" ? "red" : "orange" 
                        }}
                      >
                        {receipt.status}
                      </Typography>
                    </TableCell>
                    <TableCell>{receipt.tenant || "-"}</TableCell>
                    <TableCell>₱{receipt.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Daily Reconciliation</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Select Collector"
                  value={selectedCollector}
                  onChange={(e) => setSelectedCollector(e.target.value)}
                >
                  {collectors.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cash Received (₱)"
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(parseFloat(e.target.value))}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
                  onClick={handleReconcile}
                  startIcon={<Calculator size={20} />}
                >
                  Reconcile Collections
                </Button>
              </Grid>
            </Grid>

            {reconciliationResult && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: reconciliationResult.diff === 0 ? "#f0f9f0" : "#fef6f6",
                  borderRadius: 2,
                  border: reconciliationResult.diff === 0 ? "1px solid #c8e6c9" : "1px solid #ffcdd2",
                }}
              >
                <Typography>
                  <strong>Total Collected (from records):</strong> ₱
                  {reconciliationResult.totalCollected.toLocaleString()}
                </Typography>
                <Typography>
                  <strong>Cash Received:</strong> ₱
                  {cashReceived.toLocaleString()}
                </Typography>
                <Typography
                  sx={{
                    color: reconciliationResult.diff === 0 ? "green" : "red",
                    fontWeight: 500,
                    fontSize: "1.1rem",
                  }}
                >
                  <strong>Difference:</strong> ₱{reconciliationResult.diff.toLocaleString()}
                </Typography>
                {reconciliationResult.diff !== 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {reconciliationResult.diff > 0 
                      ? "Cash received is more than recorded amount." 
                      : "Cash received is less than recorded amount."}
                  </Typography>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* SECTION 3: Collector Activity Dashboard */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Monitor size={20} /> Collector Activity Dashboard
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Table>
          <TableHead sx={{ bgcolor: "#f9f9f9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Collector</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Area</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Transactions</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Total Collected (₱)</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Last Activity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collectors.map((c) => {
              const collectorTransactions = transactions.filter((t) => t.collectorId === c.id);
              const total = collectorTransactions.reduce((sum, t) => sum + t.amount, 0);
              const count = collectorTransactions.length;
              const lastTransaction = collectorTransactions[0];
              
              return (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.area}</TableCell>
                  <TableCell>{count}</TableCell>
                  <TableCell>₱{total.toLocaleString()}</TableCell>
                  <TableCell>
                    {lastTransaction ? new Date(lastTransaction.date).toLocaleDateString() : 'No activity'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Button
          sx={{
            mt: 2,
            color: "#D32F2F",
            borderColor: "#D32F2F",
            "&:hover": { bgcolor: "#fdecea", borderColor: "#B71C1C" },
          }}
          variant="outlined"
          startIcon={<RefreshCw size={16} />}
          onClick={handleGenerateAudit}
        >
          Generate Audit Request
        </Button>
      </Paper>

      {/* Audit Dialog */}
      <Dialog
        open={openAuditDialog}
        onClose={() => setOpenAuditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#D32F2F", color: "white" }}>
          Audit Request Generated
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>
            Recent Audit Logs
          </Typography>
          {auditLogs.length > 0 ? (
            auditLogs.slice(-5).reverse().map((a) => (
              <Box
                key={a.id}
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: "#f9f9f9",
                  borderRadius: 2,
                  border: "1px solid #eee",
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography><b>Audit ID:</b> {a.id}</Typography>
                    <Typography><b>Collector:</b> {a.collectorName} ({a.collectorId})</Typography>
                    <Typography><b>Receipt:</b> {a.receiptNo}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><b>Amount:</b> ₱{a.amount.toLocaleString()}</Typography>
                    <Typography><b>Payer:</b> {a.payer}</Typography>
                    <Typography><b>Date:</b> {a.timestamp}</Typography>
                  </Grid>
                </Grid>
              </Box>
            ))
          ) : (
            <Typography>No audit logs yet.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAuditDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default CollectionManagement;