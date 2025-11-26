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
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import {
  Monitor,
  Receipt,
  RefreshCw,
  FileText,
  CheckCircle,
  Upload,
  Calculator,
  User,
  DollarSign,
  AlertTriangle,
  Calendar,
  TrendingUp
} from "lucide-react";
import MainLayout from "../../layouts/MainLayout";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`balance-tabpanel-${index}`}
      aria-labelledby={`balance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

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
  const [dailyReport, setDailyReport] = useState({ totalCash: 0, encodedTotal: 0, balanceStatus: "pending" });
  const [tenantBalances, setTenantBalances] = useState({});
  const [balanceTabValue, setBalanceTabValue] = useState(0);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState("rent");

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

  // Payment types for balance tracking
  const paymentTypes = [
    { value: "rent", label: "Rent", color: "primary" },
    { value: "electricity", label: "Electricity", color: "warning" },
    { value: "water", label: "Water", color: "info" },
    { value: "rights", label: "Rights", color: "secondary" },
    { value: "other_fees", label: "Other Fees", color: "default" },
  ];

  useEffect(() => {
    refreshData();
    initializeReceipts();
    initializeTenantBalances();
  }, []);

  const refreshData = () => {
    try {
      // Safely load transactions from payment history
      const storedPayments = JSON.parse(localStorage.getItem("paymentHistory") || "[]");
      
      // Transform payment data to transaction format with comprehensive safety checks
      const paymentTransactions = storedPayments
        .filter(payment => payment && typeof payment === 'object')
        .map(payment => ({
          id: payment.id || `temp-${Date.now()}-${Math.random()}`,
          collectorId: payment.collectorId || '',
          collectorName: payment.collectorName || '',
          payer: payment.tenantName || '',
          amount: parseFloat(payment.amount || 0),
          receiptNo: payment.receiptNumber || '',
          date: payment?.date ? payment.date.split('T')[0] : new Date().toISOString().split('T')[0],
          paymentType: payment.paymentTypeLabel || '',
          method: payment.method || '',
          stallName: payment.stallName || '',
          rent: parseFloat(payment.breakdown?.rent || 0),
          rights: parseFloat(payment.breakdown?.rights || 0),
          electricity: parseFloat(payment.breakdown?.electric || 0),
          water: parseFloat(payment.breakdown?.water || 0),
          others: parseFloat(payment.breakdown?.others || 0)
        }));

      setTransactions(paymentTransactions);

      // Load collectors with safety checks
      const storedCollectors = JSON.parse(localStorage.getItem("collectors") || "[]");
      const defaultCollectors = [
        { id: "C-001", name: "Juan Dela Cruz", area: "Stall Area A" },
        { id: "C-002", name: "Maria Santos", area: "Parking Zone 1" },
      ];
      setCollectors(storedCollectors.length > 0 ? storedCollectors : defaultCollectors);

      // Update tenant balances based on new transactions
      updateTenantBalances(paymentTransactions);

      setAlert({
        open: true,
        message: "Data refreshed successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      setAlert({
        open: true,
        message: "Error refreshing data. Please check your data format.",
        severity: "error",
      });
      setTransactions([]);
      setCollectors([
        { id: "C-001", name: "Juan Dela Cruz", area: "Stall Area A" },
        { id: "C-002", name: "Maria Santos", area: "Parking Zone 1" },
      ]);
    }
  };

  const initializeTenantBalances = () => {
    // Load existing tenant balances or initialize with sample data
    const storedBalances = JSON.parse(localStorage.getItem("tenantBalances") || "{}");
    
    if (Object.keys(storedBalances).length === 0) {
      // Initialize with sample tenant data
      const sampleBalances = {
        "TNT-001": {
          id: "TNT-001",
          name: "Juan Dela Cruz",
          stallId: "STL-001",
          stallName: "Stall 1 - Food Section",
          currentBalance: 2500,
          totalDue: 2500,
          totalPaid: 0,
          lastPaymentDate: null,
          breakdown: {
            rent: { due: 1500, paid: 0, overdue: true, dueDate: "2024-01-05" },
            electricity: { due: 500, paid: 0, overdue: false, dueDate: "2024-01-10" },
            water: { due: 300, paid: 0, overdue: false, dueDate: "2024-01-10" },
            rights: { due: 200, paid: 0, overdue: false, dueDate: "2024-01-15" }
          },
          paymentHistory: []
        },
        "TNT-002": {
          id: "TNT-002",
          name: "Maria Santos",
          stallId: "STL-002",
          stallName: "Stall 2 - Clothing Section",
          currentBalance: 1800,
          totalDue: 1800,
          totalPaid: 0,
          lastPaymentDate: null,
          breakdown: {
            rent: { due: 1200, paid: 0, overdue: true, dueDate: "2024-01-05" },
            electricity: { due: 350, paid: 0, overdue: false, dueDate: "2024-01-10" },
            water: { due: 250, paid: 0, overdue: false, dueDate: "2024-01-10" }
          },
          paymentHistory: []
        },
        "TNT-003": {
          id: "TNT-003",
          name: "Pedro Reyes",
          stallId: "STL-003",
          stallName: "Stall 3 - Electronics Section",
          currentBalance: 0,
          totalDue: 2000,
          totalPaid: 2000,
          lastPaymentDate: "2024-01-02",
          breakdown: {
            rent: { due: 1500, paid: 1500, overdue: false, dueDate: "2024-01-05" },
            electricity: { due: 300, paid: 300, overdue: false, dueDate: "2024-01-10" },
            water: { due: 200, paid: 200, overdue: false, dueDate: "2024-01-10" }
          },
          paymentHistory: [
            {
              id: "PAY-001",
              date: "2024-01-02",
              amount: 2000,
              type: "full_payment",
              receiptNo: "AR-00001"
            }
          ]
        }
      };
      setTenantBalances(sampleBalances);
      localStorage.setItem("tenantBalances", JSON.stringify(sampleBalances));
    } else {
      setTenantBalances(storedBalances);
    }
  };

  const updateTenantBalances = (transactions) => {
    // This function would update tenant balances based on new payments
    // For now, we'll keep the initialized balances
    console.log("Updating tenant balances based on transactions:", transactions);
  };

  const initializeReceipts = () => {
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

  // BALANCE MANAGEMENT FUNCTIONS
  const handleRecordPayment = () => {
    if (!selectedTenant || !paymentAmount || paymentAmount <= 0) {
      setAlert({
        open: true,
        message: "Please select a tenant and enter a valid payment amount.",
        severity: "warning",
      });
      return;
    }

    const tenant = tenantBalances[selectedTenant];
    if (!tenant) return;

    const payment = parseFloat(paymentAmount);
    const updatedBalances = { ...tenantBalances };

    // Update the specific payment type
    if (updatedBalances[selectedTenant].breakdown[paymentType]) {
      const typeBalance = updatedBalances[selectedTenant].breakdown[paymentType];
      const remainingDue = typeBalance.due - typeBalance.paid;
      const paymentApplied = Math.min(payment, remainingDue);

      updatedBalances[selectedTenant].breakdown[paymentType].paid += paymentApplied;
      updatedBalances[selectedTenant].totalPaid += paymentApplied;
      updatedBalances[selectedTenant].currentBalance = Math.max(0, updatedBalances[selectedTenant].totalDue - updatedBalances[selectedTenant].totalPaid);
      updatedBalances[selectedTenant].lastPaymentDate = new Date().toISOString().split('T')[0];

      // Add to payment history
      updatedBalances[selectedTenant].paymentHistory.unshift({
        id: `PAY-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        amount: payment,
        type: paymentType,
        receiptNo: `AR-${String(updatedBalances[selectedTenant].paymentHistory.length + 1).padStart(5, "0")}`,
        appliedAmount: paymentApplied
      });
    }

    setTenantBalances(updatedBalances);
    localStorage.setItem("tenantBalances", JSON.stringify(updatedBalances));

    setAlert({
      open: true,
      message: `Payment of ₱${payment.toLocaleString()} recorded for ${tenant.name}`,
      severity: "success",
    });

    // Reset form
    setPaymentAmount("");
    refreshData();
  };

  const handleAddNewCharge = (tenantId, chargeType, amount) => {
    const updatedBalances = { ...tenantBalances };
    
    if (updatedBalances[tenantId]) {
      if (!updatedBalances[tenantId].breakdown[chargeType]) {
        updatedBalances[tenantId].breakdown[chargeType] = { due: 0, paid: 0, overdue: false, dueDate: new Date().toISOString().split('T')[0] };
      }
      
      updatedBalances[tenantId].breakdown[chargeType].due += amount;
      updatedBalances[tenantId].totalDue += amount;
      updatedBalances[tenantId].currentBalance += amount;

      setTenantBalances(updatedBalances);
      localStorage.setItem("tenantBalances", JSON.stringify(updatedBalances));

      setAlert({
        open: true,
        message: `New charge of ₱${amount} added for ${updatedBalances[tenantId].name}`,
        severity: "success",
      });
    }
  };

  const calculateTotalOutstanding = () => {
    return Object.values(tenantBalances).reduce((total, tenant) => total + tenant.currentBalance, 0);
  };

  const calculateOverdueAmount = () => {
    return Object.values(tenantBalances).reduce((total, tenant) => {
      const overdue = Object.values(tenant.breakdown).reduce((sum, type) => {
        const dueDate = new Date(type.dueDate);
        const today = new Date();
        return sum + (dueDate < today && type.due > type.paid ? (type.due - type.paid) : 0);
      }, 0);
      return total + overdue;
    }, 0);
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
      receipt.status === "unused" 
        ? { ...receipt, status: "cancelled", reason: "Stall Closed" } 
        : receipt 
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
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
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
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const diff = parseFloat(cashReceived) - totalCollected;
    
    setReconciliationResult({ totalCollected, diff });
    setAlert({
      open: true,
      message: diff === 0 
        ? "Reconciliation complete. All amounts match." 
        : `Reconciliation discrepancy detected. Difference: ₱${Math.abs(diff).toLocaleString()}`,
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
        collectorId: random.collectorId || '',
        collectorName: random.collectorName || '',
        receiptNo: random.receiptNo || '',
        amount: random.amount || 0,
        payer: random.payer || '',
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

  // Calculate total collections across all collectors with safety
  const totalCollections = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalOutstanding = calculateTotalOutstanding();
  const totalOverdue = calculateOverdueAmount();

  return (
    <MainLayout>
      {/* 🧭 Breadcrumbs */}
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/dashboard" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <HomeIcon fontSize="small" /> Dashboard
          </Link>
          <Typography color="text.primary">Collection Management</Typography>
        </Breadcrumbs>
      </Box>

      {/* 🔖 Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Collection Management
        </Typography>
        <Button variant="outlined" startIcon={<RefreshCw size={20} />} onClick={refreshData}>
          Refresh Data
        </Button>
      </Stack>

      {/* Enhanced Summary Cards with Balance Tracking */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <Typography color="text.secondary" gutterBottom>Total Collectors</Typography>
            <Typography variant="h4" component="div" color="#D32F2F" sx={{fontWeight: "700"}}>
              {collectors.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <Typography color="text.secondary" gutterBottom>Active Receipts</Typography>
            <Typography variant="h4" component="div" sx={{fontWeight:"700"}}>
              {receipts.filter(r => r.status === "assigned").length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <Typography color="text.secondary" gutterBottom>Total Collections</Typography>
            <Typography variant="h4" component="div" sx={{fontWeight:"700"}}>
              ₱{totalCollections.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <Typography color="text.secondary" gutterBottom>Outstanding Balance</Typography>
            <Typography variant="h6" component="div" sx={{ fontWeight: "700", color: totalOutstanding > 0 ? "red" : "green" }}>
              ₱{totalOutstanding.toLocaleString()}
            </Typography>
            {totalOverdue > 0 && (
              <Typography variant="caption" color="error">
                ₱{totalOverdue.toLocaleString()} Overdue
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* NEW: BALANCE MANAGEMENT SECTION */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <DollarSign size={20} />
          Tenant Balance Management
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Tabs value={balanceTabValue} onChange={(e, newValue) => setBalanceTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Payment Recording" />
          <Tab label="Tenant Balances" />
          <Tab label="Payment History" />
        </Tabs>

        <TabPanel value={balanceTabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Record Payment</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Select Tenant"
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                  >
                    <MenuItem value="">-- Select Tenant --</MenuItem>
                    {Object.values(tenantBalances).map((tenant) => (
                      <MenuItem key={tenant.id} value={tenant.id}>
                        {tenant.name} - {tenant.stallName} (₱{tenant.currentBalance.toLocaleString()})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Payment Type"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                  >
                    {paymentTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Payment Amount (₱)"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
                    onClick={handleRecordPayment}
                    startIcon={<DollarSign size={20} />}
                  >
                    Record Payment
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Quick Stats</Typography>
              <Card sx={{ mb: 2, bgcolor: "#f5f5f5" }}>
                <CardContent>
                  <Typography color="text.secondary">Total Outstanding</Typography>
                  <Typography variant="h5" color="error">
                    ₱{totalOutstanding.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ mb: 2, bgcolor: "#fff3cd" }}>
                <CardContent>
                  <Typography color="text.secondary">Overdue Amount</Typography>
                  <Typography variant="h6" color="warning.main">
                    ₱{totalOverdue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ bgcolor: "#f0f9f0" }}>
                <CardContent>
                  <Typography color="text.secondary">Total Collected Today</Typography>
                  <Typography variant="h6" color="success.main">
                    ₱{totalCollections.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={balanceTabValue} index={1}>
          <Typography variant="h6" gutterBottom>Tenant Account Balances</Typography>
          <Table>
            <TableHead sx={{ bgcolor: "#f9f9f9" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Tenant</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Stall</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Current Balance</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Last Payment</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.values(tenantBalances).map((tenant) => (
                <TableRow key={tenant.id} hover>
                  <TableCell>
                    <Box>
                      <Typography fontWeight="500">{tenant.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tenant.id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{tenant.stallName}</TableCell>
                  <TableCell>
                    <Typography 
                      fontWeight="600" 
                      color={tenant.currentBalance > 0 ? "error" : "success"}
                    >
                      ₱{tenant.currentBalance.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tenant.currentBalance > 0 ? "Has Balance" : "Paid Up"}
                      color={tenant.currentBalance > 0 ? "error" : "success"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {tenant.lastPaymentDate ? (
                      <Typography variant="body2">
                        {new Date(tenant.lastPaymentDate).toLocaleDateString()}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No payments
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      onClick={() => {
                        setSelectedTenant(tenant.id);
                        setBalanceTabValue(0);
                      }}
                    >
                      Record Payment
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabPanel>

        <TabPanel value={balanceTabValue} index={2}>
          <Typography variant="h6" gutterBottom>Recent Payment History</Typography>
          <Table>
            <TableHead sx={{ bgcolor: "#f9f9f9" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Tenant</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Receipt No</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.values(tenantBalances)
                .flatMap(tenant => 
                  tenant.paymentHistory.map(payment => ({ ...payment, tenantName: tenant.name }))
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10)
                .map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell>{payment.tenantName}</TableCell>
                    <TableCell>{payment.receiptNo}</TableCell>
                    <TableCell>
                      <Chip 
                        label={paymentTypes.find(t => t.value === payment.type)?.label || payment.type} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>₱{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label="Completed" 
                        color="success" 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TabPanel>
      </Paper>

      {/* Existing sections remain the same */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <AssignmentIndIcon fontSize="small" />
          Collector Assignment
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

      {/* Rest of your existing components... */}
      {/* SECTION 2: Receipt Management */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Receipt size={20} />
          Receipt Management
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
                      <Typography sx={{ color: receipt.status === "assigned" ? "green" : receipt.status === "cancelled" ? "red" : "orange" }}>
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
                  onChange={(e) => setCashReceived(e.target.value)}
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
              <Box sx={{ mt: 3, p: 2, bgcolor: reconciliationResult.diff === 0 ? "#f0f9f0" : "#fef6f6", borderRadius: 2, border: reconciliationResult.diff === 0 ? "1px solid #c8e6c9" : "1px solid #ffcdd2" }}>
                <Typography>
                  <strong>Total Collected (from records):</strong> ₱ {reconciliationResult.totalCollected.toLocaleString()}
                </Typography>
                <Typography>
                  <strong>Cash Received:</strong> ₱ {parseFloat(cashReceived).toLocaleString()}
                </Typography>
                <Typography sx={{ color: reconciliationResult.diff === 0 ? "green" : "red", fontWeight: 500, fontSize: "1.1rem" }}>
                  <strong>Difference:</strong> ₱{Math.abs(reconciliationResult.diff).toLocaleString()}
                </Typography>
                {reconciliationResult.diff !== 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {reconciliationResult.diff > 0 ? "Cash received is more than recorded amount." : "Cash received is less than recorded amount."}
                  </Typography>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* SECTION 3: Collector Activity Dashboard */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Monitor size={20} />
          Collector Activity Dashboard
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
              const total = collectorTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
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
          sx={{ mt: 2, color: "#D32F2F", borderColor: "#D32F2F", "&:hover": { bgcolor: "#fdecea", borderColor: "#B71C1C" } }}
          variant="outlined"
          startIcon={<RefreshCw size={16} />}
          onClick={handleGenerateAudit}
        >
          Generate Audit Request
        </Button>
      </Paper>

      {/* Audit Dialog */}
      <Dialog open={openAuditDialog} onClose={() => setOpenAuditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#D32F2F", color: "white" }}>Audit Request Generated</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>Recent Audit Logs</Typography>
          {auditLogs.length > 0 ? (
            auditLogs.slice(-5).reverse().map((a) => (
              <Box key={a.id} sx={{ mb: 2, p: 2, bgcolor: "#f9f9f9", borderRadius: 2, border: "1px solid #eee" }}>
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
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default CollectionManagement;