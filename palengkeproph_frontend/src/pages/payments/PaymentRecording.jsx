import React, { useState, useEffect } from "react";
import HomeIcon from "@mui/icons-material/Home";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ReceiptIcon from "@mui/icons-material/Receipt";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
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
  Stack,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import MainLayout from "../../layouts/MainLayout";

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9).toUpperCase();
}

export default function PaymentRecording() {
  const [tenants, setTenants] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [selectedStall, setSelectedStall] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [collectorId, setCollectorId] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [openReceipt, setOpenReceipt] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [patronName, setPatronName] = useState(""); // For public payments

  // Payment types based on requirements
  const paymentTypes = [
    { value: "rent", label: "Rent Payment", category: "tenant", requiresTenant: true },
    { value: "electricity", label: "Electricity Bill", category: "tenant", requiresTenant: true },
    { value: "water", label: "Water Bill", category: "tenant", requiresTenant: true },
    { value: "other_fees", label: "Other Fees", category: "tenant", requiresTenant: true },
    { value: "restroom", label: "Restroom Fee", category: "public", requiresTenant: false },
    { value: "parking", label: "Parking Fee", category: "public", requiresTenant: false },
    { value: "loan_repayment", label: "Loan Repayment", category: "loan", requiresTenant: true },
    { value: "special_event", label: "Special Event Fee", category: "event", requiresTenant: false },
  ];

  useEffect(() => {
    // Load tenants and stalls from localStorage
    const storedTenants = JSON.parse(localStorage.getItem("tenants")) || [
      { id: "TNT-001", name: "Juan Dela Cruz", stallId: "STL-001" },
      { id: "TNT-002", name: "Maria Santos", stallId: "STL-002" },
      { id: "TNT-003", name: "Pedro Reyes", stallId: "STL-003" },
    ];

    const storedStalls = JSON.parse(localStorage.getItem("stalls")) || [
      { id: "STL-001", name: "Stall 1 - Food Section" },
      { id: "STL-002", name: "Stall 2 - Clothing Section" },
      { id: "STL-003", name: "Stall 3 - Electronics Section" },
    ];

    // Load collectors from localStorage or use defaults
    const storedCollectors = JSON.parse(localStorage.getItem("collectors")) || [
      { id: "C-001", name: "Juan Dela Cruz", area: "Stall Area A" },
      { id: "C-002", name: "Maria Santos", area: "Parking Zone 1" },
    ];

    setTenants(storedTenants);
    setStalls(storedStalls);
    setCollectors(storedCollectors);

    // Load payment history
    const storedPayments = JSON.parse(localStorage.getItem("paymentHistory")) || [];
    setPaymentHistory(storedPayments);

    // Generate receipt number
    setReceiptNumber(`RCP-${String(storedPayments.length + 1).padStart(5, "0")}`);
    
    // Set default collector ID (use first collector as default)
    setCollectorId(storedCollectors[0]?.id || "C-001");
  }, []);

  const currentTenant = tenants.find((t) => t.id === selectedTenant);
  const currentStall = stalls.find((s) => s.id === selectedStall);
  const currentCollector = collectors.find((c) => c.id === collectorId);

  // Check if current payment type requires tenant selection
  const currentPaymentType = paymentTypes.find(pt => pt.value === paymentType);
  const requiresTenant = currentPaymentType?.requiresTenant || false;

  const handleRecordPayment = () => {
    if (!paymentType || !amount || !method || !collectorId) {
      alert("Please fill in all required fields.");
      return;
    }

    // For tenant payments, require tenant selection
    if (requiresTenant && !selectedTenant) {
      alert("Please select a tenant for this payment type.");
      return;
    }

    // For public payments, require patron name if provided
    if (!requiresTenant && !patronName) {
      // Allow public payments without patron name, but use "Walk-in Customer" as default
      setPatronName("Walk-in Customer");
    }

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const newPayment = {
      id: `PAY-${String(paymentHistory.length + 1).padStart(5, "0")}`,
      receiptNumber: receiptNumber,
      tenantId: requiresTenant ? selectedTenant : "N/A",
      tenantName: requiresTenant ? currentTenant?.name : patronName || "Walk-in Customer",
      stallId: requiresTenant ? (selectedStall || currentTenant?.stallId) : "N/A",
      stallName: requiresTenant ? (currentStall?.name || stalls.find(s => s.id === selectedStall)?.name) : "Public Facility",
      paymentType: paymentType,
      paymentTypeLabel: paymentTypes.find(pt => pt.value === paymentType)?.label || paymentType,
      date: new Date().toISOString(),
      displayDate: new Date().toLocaleString(),
      amount: paymentAmount.toFixed(2),
      method: method,
      collectorId: collectorId,
      collectorName: currentCollector?.name || "Unknown Collector",
      collectorArea: currentCollector?.area || "Unknown Area",
      status: "completed",
      category: currentPaymentType?.category || "other",
    };

    const updatedHistory = [newPayment, ...paymentHistory];
    setPaymentHistory(updatedHistory);
    localStorage.setItem("paymentHistory", JSON.stringify(updatedHistory));

    // Generate next receipt number
    setReceiptNumber(`RCP-${String(updatedHistory.length + 1).padStart(5, "0")}`);

    setReceipt(newPayment);
    setOpenReceipt(true);
    
    // Reset form
    setAmount("");
    setSelectedTenant("");
    setSelectedStall("");
    setPaymentType("");
    setPatronName("");
  };

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(receipt, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${receipt.receiptNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all payment data?")) {
      setPaymentHistory([]);
      setReceiptNumber("RCP-00001");
      localStorage.removeItem("paymentHistory");
      alert("All payment data has been reset successfully!");
    }
  };

  // Filter payment history
  const filteredHistory = paymentHistory.filter((payment) => {
    if (filterType !== "all" && payment.paymentType !== filterType) return false;
    if (filterDate && !payment.displayDate.includes(filterDate)) return false;
    return true;
  });

  // Calculate today's total collections
  const todayTotal = paymentHistory
    .filter(payment => new Date(payment.date).toDateString() === new Date().toDateString())
    .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

  const getPaymentTypeColor = (type) => {
    const colors = {
      rent: "primary",
      electricity: "warning",
      water: "info",
      other_fees: "secondary",
      restroom: "success",
      parking: "success",
      loan_repayment: "error",
      special_event: "warning",
    };
    return colors[type] || "default";
  };

  // Reset tenant fields when payment type changes to non-tenant type
  useEffect(() => {
    if (paymentType && !requiresTenant) {
      setSelectedTenant("");
      setSelectedStall("");
    }
  }, [paymentType, requiresTenant]);

  return (
    <MainLayout>
      {/* 🧭 Breadcrumbs */}
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
            color="inherit"
            underline="hover"
            href="/payments"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              "&:hover": { color: "#D32F2F" },
            }}
          >
            Payment Records
          </Link>
          <Typography color="text.primary">Payment Recording</Typography>
        </Breadcrumbs>
      </Box>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight={700} color="black">
          Payment Recording
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<RestartAltIcon />}
          onClick={handleResetData}
        >
          Reset Data
        </Button>
      </Stack>

      <Typography mb={3} color="text.secondary">
        Record payments from various revenue streams including tenant payments, restroom fees, parking fees, loan repayments, and special event fees.
      </Typography>

      {/* 📊 Today's Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Today's Collections
              </Typography>
              <Typography variant="h4" component="div" color="#D32F2F" sx={{fontWeight: "700"}}>
                ₱{todayTotal.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total payments today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Payments
              </Typography>
              <Typography variant="h4" component="div" sx={{fontWeight:"700"}}>
                {paymentHistory.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All-time records
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Collectors
              </Typography>
              <Typography variant="h4" component="div" sx={{fontWeight:"700"}}>
                {collectors.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available collectors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 🧾 PAYMENT FORM */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 5 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          Payment Recording Form
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Payment Type</InputLabel>
              <Select
                value={paymentType}
                label="Payment Type"
                onChange={(e) => setPaymentType(e.target.value)}
              >
                {paymentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Receipt Number"
              fullWidth
              value={receiptNumber}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          {/* Tenant and Stall Selection - Show only for tenant-related payments */}
          {requiresTenant && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Select Tenant"
                  fullWidth
                  value={selectedTenant}
                  onChange={(e) => {
                    setSelectedTenant(e.target.value);
                    const tenant = tenants.find(t => t.id === e.target.value);
                    if (tenant) setSelectedStall(tenant.stallId);
                  }}
                  required
                >
                  <MenuItem value="">-- Select Tenant --</MenuItem>
                  {tenants.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name} ({t.id})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Assigned Stall"
                  fullWidth
                  value={currentStall?.name || stalls.find(s => s.id === selectedStall)?.name || "No stall assigned"}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </>
          )}

          {/* Patron Name for public payments */}
          {!requiresTenant && paymentType && (
            <Grid item xs={12} md={6}>
              <TextField
                label="Patron Name (Optional)"
                fullWidth
                value={patronName}
                onChange={(e) => setPatronName(e.target.value)}
                placeholder="Walk-in Customer"
                helperText="Leave blank for anonymous payments"
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              label="Payment Amount (₱) *"
              fullWidth
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Payment Method *"
              fullWidth
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              required
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="GCash">GCash</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Collector"
              fullWidth
              value={collectorId}
              onChange={(e) => setCollectorId(e.target.value)}
              required
            >
              {collectors.map((collector) => (
                <MenuItem key={collector.id} value={collector.id}>
                  {collector.name} ({collector.id}) - {collector.area}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<ReceiptIcon />}
          sx={{ mt: 3, bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
          onClick={handleRecordPayment}
        >
          Record Payment
        </Button>
      </Paper>

      {/* 📋 PAYMENT HISTORY */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5"sx={{ fontWeight: 700 }}>Payment History</Typography>
          <Box display="flex" gap={2}>
            <TextField
              select
              size="small"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Types</MenuItem>
              {paymentTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell><b>Receipt No.</b></TableCell>
                <TableCell><b>Date & Time</b></TableCell>
                <TableCell><b>Type</b></TableCell>
                <TableCell><b>Tenant/Patron</b></TableCell>
                <TableCell><b>Stall/Facility</b></TableCell>
                <TableCell><b>Amount (₱)</b></TableCell>
                <TableCell><b>Method</b></TableCell>
                <TableCell><b>Collector</b></TableCell>
                <TableCell><b>Area</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>{payment.receiptNumber}</TableCell>
                    <TableCell>{payment.displayDate}</TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.paymentTypeLabel} 
                        color={getPaymentTypeColor(payment.paymentType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {payment.tenantName}
                    </TableCell>
                    <TableCell>
                      {payment.stallName}
                    </TableCell>
                    <TableCell>₱{payment.amount}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{payment.collectorName}</TableCell>
                    <TableCell>{payment.collectorArea}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No payment records found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 🧾 RECEIPT DIALOG */}
      <Dialog open={openReceipt} onClose={() => setOpenReceipt(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#D32F2F", color: "white", display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon /> Payment Receipt
        </DialogTitle>
        <DialogContent dividers>
          {receipt && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom align="center">
                OFFICIAL RECEIPT
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography><b>Receipt No:</b></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>{receipt.receiptNumber}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography><b>Date:</b></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>{receipt.displayDate}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography><b>Payment Type:</b></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>{receipt.paymentTypeLabel}</Typography>
                </Grid>
                
                {/* Show tenant info only for tenant payments */}
                {requiresTenant && receipt.tenantId !== "N/A" && (
                  <>
                    <Grid item xs={6}>
                      <Typography><b>Tenant:</b></Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>{receipt.tenantName}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography><b>Stall:</b></Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>{receipt.stallName}</Typography>
                    </Grid>
                  </>
                )}
                
                {/* Show patron info for public payments */}
                {!requiresTenant && (
                  <>
                    <Grid item xs={6}>
                      <Typography><b>Patron:</b></Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>{receipt.tenantName}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography><b>Facility:</b></Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>{receipt.stallName}</Typography>
                    </Grid>
                  </>
                )}
                
                <Grid item xs={6}>
                  <Typography><b>Amount Paid:</b></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" color="primary.main">
                    ₱{receipt.amount}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography><b>Payment Method:</b></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>{receipt.method}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography><b>Collector:</b></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>{receipt.collectorName} ({receipt.collectorId})</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography><b>Area:</b></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>{receipt.collectorArea}</Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                Thank you for your payment!
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePrint}>Print Receipt</Button>
          <Button onClick={handleDownload}>Download</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#D32F2F" }}
            onClick={() => setOpenReceipt(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}