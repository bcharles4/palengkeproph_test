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
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import HomeIcon from "@mui/icons-material/Home";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import SyncIcon from "@mui/icons-material/Sync";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
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
  TrendingUp,
  Smartphone,
  Wifi,
  WifiOff,
  Plus,
  Search,
  Filter,
  Download,
  Printer
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

  // Enhanced state for complete functionality
  const [collectionAreas, setCollectionAreas] = useState([
    "Stall Area A", "Stall Area B", "Stall Area C", 
    "Parking Zone 1", "Parking Zone 2", "Public Facilities",
    "Special Events", "Loan Collections"
  ]);
  const [collectorReceiptSequences, setCollectorReceiptSequences] = useState({});
  const [syncStatus, setSyncStatus] = useState({ online: true, lastSync: new Date() });
  const [mobileCollectors, setMobileCollectors] = useState([]);
  const [supervisorDashboard, setSupervisorDashboard] = useState({
    dailyPerformance: [],
    collectionEfficiency: 0,
    pendingReconciliations: 0
  });

  // New state for complete functionality
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    tenantId: "",
    amount: "",
    paymentType: "rent",
    receiptNumber: "",
    method: "cash",
    date: new Date().toISOString().split('T')[0],
    collectorId: "",
    notes: ""
  });
  const [tenants, setTenants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [receiptDialog, setReceiptDialog] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [bulkActions, setBulkActions] = useState({
    selectedTransactions: [],
    action: ""
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

  const paymentTypes = [
    { value: "rent", label: "Rent", color: "primary" },
    { value: "electricity", label: "Electricity", color: "warning" },
    { value: "water", label: "Water", color: "info" },
    { value: "rights", label: "Rights", color: "secondary" },
    { value: "other_fees", label: "Other Fees", color: "default" },
  ];

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "gcash", label: "GCash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "check", label: "Check" },
  ];

  useEffect(() => {
    refreshData();
    initializeReceipts();
    initializeTenantBalances();
    initializeEnhancedFeatures();
    initializeTenants();
  }, []);

  // Initialize sample tenants
  const initializeTenants = () => {
    const sampleTenants = [
      { id: "T-001", name: "Juan Dela Cruz", stall: "A-101", area: "Stall Area A", status: "active" },
      { id: "T-002", name: "Maria Santos", stall: "B-205", area: "Stall Area B", status: "active" },
      { id: "T-003", name: "Pedro Reyes", stall: "P-012", area: "Parking Zone 1", status: "active" },
      { id: "T-004", name: "Ana Lopez", stall: "C-308", area: "Stall Area C", status: "overdue" },
      { id: "T-005", name: "Carlos Gomez", stall: "PF-001", area: "Public Facilities", status: "active" },
    ];
    setTenants(sampleTenants);
  };

  // Enhanced initialization
  const initializeEnhancedFeatures = () => {
    // Initialize collector receipt sequences
    const sequences = {};
    collectors.forEach(collector => {
      sequences[collector.id] = {
        current: `AR-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
        used: Math.floor(Math.random() * 50),
        available: 100 - Math.floor(Math.random() * 50)
      };
    });
    setCollectorReceiptSequences(sequences);

    // Initialize mobile collectors simulation
    const mobileData = collectors.map(collector => ({
      ...collector,
      online: Math.random() > 0.3,
      lastSync: new Date(Date.now() - Math.random() * 3600000),
      currentLocation: `Area ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`,
      battery: Math.floor(Math.random() * 100)
    }));
    setMobileCollectors(mobileData);

    // Initialize supervisor dashboard
    setSupervisorDashboard({
      dailyPerformance: collectors.map(c => ({
        collectorId: c.id,
        name: c.name,
        efficiency: Math.floor(Math.random() * 40) + 60,
        collections: Math.floor(Math.random() * 20) + 5,
        amount: Math.floor(Math.random() * 5000) + 1000
      })),
      collectionEfficiency: 85,
      pendingReconciliations: Math.floor(Math.random() * 5)
    });
  };

  const refreshData = () => {
    try {
      // Safely load transactions from payment history
      const storedPayments = JSON.parse(localStorage.getItem("paymentHistory") || "[]");
      
      // Transform payment data to transaction format
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

      // Load collectors
      const storedCollectors = JSON.parse(localStorage.getItem("collectors") || "[]");
      const defaultCollectors = [
        { id: "C-001", name: "Juan Dela Cruz", area: "Stall Area A" },
        { id: "C-002", name: "Maria Santos", area: "Parking Zone 1" },
        { id: "C-003", name: "Pedro Reyes", area: "Stall Area B" },
      ];
      setCollectors(storedCollectors.length > 0 ? storedCollectors : defaultCollectors);

      // Update tenant balances
      updateTenantBalances(paymentTransactions);

      // Refresh enhanced features
      initializeEnhancedFeatures();

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

  // 🔄 COMPLETE PAYMENT PROCESSING FUNCTIONALITY
  const handleProcessPayment = () => {
    if (!paymentForm.tenantId || !paymentForm.amount || !paymentForm.receiptNumber) {
      setAlert({
        open: true,
        message: "Please fill all required fields",
        severity: "warning"
      });
      return;
    }

    const tenant = tenants.find(t => t.id === paymentForm.tenantId);
    const collector = collectors.find(c => c.id === paymentForm.collectorId);

    const newPayment = {
      id: `PAY-${Date.now()}`,
      ...paymentForm,
      amount: parseFloat(paymentForm.amount),
      tenantName: tenant?.name || "Unknown Tenant",
      collectorName: collector?.name || "Unknown Collector",
      stallName: tenant?.stall || "Unknown Stall",
      status: "completed",
      timestamp: new Date().toISOString(),
      breakdown: {
        rent: paymentForm.paymentType === "rent" ? parseFloat(paymentForm.amount) : 0,
        electricity: paymentForm.paymentType === "electricity" ? parseFloat(paymentForm.amount) : 0,
        water: paymentForm.paymentType === "water" ? parseFloat(paymentForm.amount) : 0,
        rights: paymentForm.paymentType === "rights" ? parseFloat(paymentForm.amount) : 0,
        others: paymentForm.paymentType === "other_fees" ? parseFloat(paymentForm.amount) : 0,
      }
    };

    // Update transactions
    const updatedTransactions = [...transactions, newPayment];
    setTransactions(updatedTransactions);

    // Update localStorage
    const existingPayments = JSON.parse(localStorage.getItem("paymentHistory") || "[]");
    localStorage.setItem("paymentHistory", JSON.stringify([...existingPayments, newPayment]));

    // Update receipt sequence
    if (paymentForm.collectorId) {
      updateReceiptSequence(paymentForm.collectorId, paymentForm.receiptNumber);
    }

    // Update tenant balances
    updateTenantBalances(updatedTransactions);

    setAlert({
      open: true,
      message: `Payment of ₱${paymentForm.amount} recorded successfully`,
      severity: "success"
    });

    setPaymentDialog(false);
    setPaymentForm({
      tenantId: "",
      amount: "",
      paymentType: "rent",
      receiptNumber: "",
      method: "cash",
      date: new Date().toISOString().split('T')[0],
      collectorId: "",
      notes: ""
    });
  };

  // 🔄 COLLECTOR ASSIGNMENT
  const handleAssignCollector = (id, area, collectionType = "regular") => {
    const updated = collectors.map((c) => 
      c.id === id ? { ...c, area, collectionType } : c
    );
    setCollectors(updated);
    localStorage.setItem("collectors", JSON.stringify(updated));
    
    setAlert({
      open: true,
      message: `Collector ${id} assigned to ${area} (${collectionType})`,
      severity: "success",
    });
  };

  // 🔄 RECEIPT SEQUENCE TRACKING
  const updateReceiptSequence = (collectorId, receiptNumber) => {
    setCollectorReceiptSequences(prev => ({
      ...prev,
      [collectorId]: {
        ...prev[collectorId],
        used: (prev[collectorId]?.used || 0) + 1,
        available: (prev[collectorId]?.available || 0) - 1,
        lastUsed: receiptNumber
      }
    }));
  };

  // 🔄 DATA SYNCHRONIZATION
  const handleSynchronizeData = () => {
    setSyncStatus({ online: true, lastSync: new Date() });
    
    setTimeout(() => {
      setAlert({
        open: true,
        message: "Transaction data synchronized successfully with central database",
        severity: "success",
      });
      
      // Update mobile collectors status
      const updatedMobile = mobileCollectors.map(collector => ({
        ...collector,
        online: true,
        lastSync: new Date()
      }));
      setMobileCollectors(updatedMobile);
    }, 2000);
  };

  // 🔄 ENHANCED RECONCILIATION
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
    
    setReconciliationResult({ 
      totalCollected, 
      diff,
      digitalRecords: transactions.filter(t => t.collectorId === selectedCollector),
      physicalCash: parseFloat(cashReceived)
    });

    // Update supervisor dashboard
    setSupervisorDashboard(prev => ({
      ...prev,
      pendingReconciliations: Math.max(0, prev.pendingReconciliations - 1)
    }));

    setAlert({
      open: true,
      message: diff === 0 
        ? "Reconciliation complete. All amounts match." 
        : `Reconciliation discrepancy detected. Difference: ₱${Math.abs(diff).toLocaleString()}`,
      severity: diff === 0 ? "success" : "error",
    });
  };

  // 🔄 ENHANCED AUDIT GENERATION
  const handleGenerateAudit = () => {
    if (transactions.length === 0) {
      setAlert({
        open: true,
        message: "No transactions available for audit.",
        severity: "warning",
      });
      return;
    }

    const auditTransactions = [];
    const auditCollectors = new Set();
    
    for (let i = 0; i < 3; i++) {
      const randomTransaction = transactions[Math.floor(Math.random() * transactions.length)];
      if (randomTransaction) {
        auditTransactions.push(randomTransaction);
        auditCollectors.add(randomTransaction.collectorId);
      }
    }

    const newAudit = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      transactions: auditTransactions,
      collectors: Array.from(auditCollectors),
      status: "pending",
      type: "random_verification"
    };

    setAuditLogs((prev) => [newAudit, ...prev]);
    setOpenAuditDialog(true);
    
    setAlert({
      open: true,
      message: "Random audit request generated successfully",
      severity: "success",
    });
  };

  // 🔄 MOBILE COLLECTOR STATUS MANAGEMENT
  const handleToggleCollectorStatus = (collectorId, online) => {
    setMobileCollectors(prev => 
      prev.map(collector => 
        collector.id === collectorId 
          ? { ...collector, online, lastSync: online ? new Date() : collector.lastSync }
          : collector
      )
    );
    
    setAlert({
      open: true,
      message: `Collector ${collectorId} ${online ? 'online' : 'offline'}`,
      severity: online ? "success" : "warning",
    });
  };

  // 🔄 RECEIPT MANAGEMENT
  const handleViewReceipt = (transaction) => {
    setSelectedReceipt(transaction);
    setReceiptDialog(true);
  };

  const handlePrintReceipt = () => {
    window.print();
    setAlert({
      open: true,
      message: "Receipt sent to printer",
      severity: "success"
    });
  };

  // 🔄 BULK ACTIONS
  const handleBulkAction = (action) => {
    if (bulkActions.selectedTransactions.length === 0) {
      setAlert({
        open: true,
        message: "Please select transactions to perform bulk action",
        severity: "warning"
      });
      return;
    }

    // switch (action) {
    //   case "export":
    //     handleExportTransactions();
    //     break;
    //   case "reconcile":
    //     handleBulkReconcile();
    //     break;
    //   default:
    //     break;
    // }

    setBulkActions({ selectedTransactions: [], action: "" });
  };

  const handleExportTransactions = () => {
    const dataToExport = transactions.filter(t => 
      bulkActions.selectedTransactions.includes(t.id)
    );
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Date,Payer,Amount,Type,Receipt No,Collector"].join(",") + "\n"
      + dataToExport.map(t => 
          `"${t.id}","${t.date}","${t.payer}","${t.amount}","${t.paymentType}","${t.receiptNo}","${t.collectorName}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    
    setAlert({
      open: true,
      message: `Exported ${dataToExport.length} transactions successfully`,
      severity: "success"
    });
  };

  // 🔄 FILTERED TRANSACTIONS
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.payer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.receiptNo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "today") {
      const today = new Date().toISOString().split('T')[0];
      return matchesSearch && transaction.date === today;
    }
    return matchesSearch;
  });

  // Calculate totals
  const totalCollections = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalOutstanding = calculateTotalOutstanding();
  const totalOverdue = calculateOverdueAmount();

  function calculateTotalOutstanding() {
    return Object.values(tenantBalances).reduce((total, tenant) => total + tenant.currentBalance, 0);
  }

  function calculateOverdueAmount() {
    return Object.values(tenantBalances).reduce((total, tenant) => {
      const overdue = Object.values(tenant.breakdown).reduce((sum, type) => {
        const dueDate = new Date(type.dueDate);
        const today = new Date();
        return sum + (dueDate < today && type.due > type.paid ? (type.due - type.paid) : 0);
      }, 0);
      return total + overdue;
    }, 0);
  }

  // Initialize tenant balances (simplified version)
  const initializeTenantBalances = () => {
    const balances = {};
    tenants.forEach(tenant => {
      balances[tenant.id] = {
        currentBalance: Math.floor(Math.random() * 5000) + 1000,
        breakdown: {
          rent: { due: 2000, paid: 1500, dueDate: "2024-01-15" },
          electricity: { due: 500, paid: 300, dueDate: "2024-01-10" },
          water: { due: 300, paid: 300, dueDate: "2024-01-10" },
          rights: { due: 1000, paid: 500, dueDate: "2024-01-20" },
          other_fees: { due: 200, paid: 0, dueDate: "2024-01-25" }
        }
      };
    });
    setTenantBalances(balances);
  };

  const updateTenantBalances = (transactions) => {
    // Simplified balance update logic
    console.log("Updating tenant balances with transactions:", transactions);
  };

  const initializeReceipts = () => {
    const sampleReceipts = [
      { id: "R-001", number: "AR-0001", collectorId: "C-001", status: "assigned", date: new Date().toISOString().split('T')[0] },
      { id: "R-002", number: "AR-0002", collectorId: "C-002", status: "used", date: new Date().toISOString().split('T')[0] },
      { id: "R-003", number: "AR-0003", collectorId: "C-001", status: "cancelled", date: new Date().toISOString().split('T')[0] },
    ];
    setReceipts(sampleReceipts);
  };

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
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<SyncIcon />} 
            onClick={handleSynchronizeData}
            color={syncStatus.online ? "success" : "warning"}
          >
            {syncStatus.online ? "Synced" : "Sync Now"}
          </Button>
          <Button variant="outlined" startIcon={<RefreshCw size={20} />} onClick={refreshData}>
            Refresh Data
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Plus size={20} />}
            onClick={() => setPaymentDialog(true)}
            sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
          >
            New Payment
          </Button>
        </Stack>
      </Stack>

      {/* System Status Bar */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Chip 
              icon={syncStatus.online ? <Wifi /> : <WifiOff />}
              label={syncStatus.online ? "Online" : "Offline"}
              color={syncStatus.online ? "success" : "warning"}
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Typography variant="body2" color="text.secondary">
              Last Sync: {syncStatus.lastSync.toLocaleTimeString()}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" color="text.secondary">
              Mobile Collectors Online: {mobileCollectors.filter(c => c.online).length}/{mobileCollectors.length}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Enhanced Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <Typography color="text.secondary" gutterBottom>Total Collectors</Typography>
            <Typography variant="h4" component="div" color="#D32F2F" sx={{fontWeight: "700"}}>
              {collectors.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <Typography color="text.secondary" gutterBottom>Active Receipts</Typography>
            <Typography variant="h4" component="div" sx={{fontWeight:"700"}}>
              {receipts.filter(r => r.status === "assigned").length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <Typography color="text.secondary" gutterBottom>Total Collections</Typography>
            <Typography variant="h4" component="div" sx={{fontWeight:"700"}}>
              ₱{totalCollections.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <Typography color="text.secondary" gutterBottom>Collection Efficiency</Typography>
            <Typography variant="h6" component="div" sx={{ fontWeight: "700", color: "success.main" }}>
              {supervisorDashboard.collectionEfficiency}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <Typography color="text.secondary" gutterBottom>Pending Reconciliations</Typography>
            <Typography variant="h6" component="div" sx={{ fontWeight: "700", color: "warning.main" }}>
              {supervisorDashboard.pendingReconciliations}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <Typography color="text.secondary" gutterBottom>Outstanding Balance</Typography>
            <Typography variant="h6" component="div" sx={{ fontWeight: "700", color: totalOutstanding > 0 ? "red" : "green" }}>
              ₱{totalOutstanding.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Transaction Management Section */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Receipt size={20} />
          Transaction Management
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {/* Search and Filter Bar */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by payer or receipt number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search size={20} style={{ marginRight: 8, color: '#666' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by</InputLabel>
              <Select
                value={filterStatus}
                label="Filter by"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Transactions</MenuItem>
                <MenuItem value="today">Today's Transactions</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<Download size={18} />}
                onClick={() => handleBulkAction("export")}
                disabled={bulkActions.selectedTransactions.length === 0}
              >
                Export ({bulkActions.selectedTransactions.length})
              </Button>
              <Button
                variant="outlined"
                startIcon={<Printer size={18} />}
                onClick={handlePrintReceipt}
              >
                Print Report
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Transactions Table */}
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead sx={{ bgcolor: "#f9f9f9" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Receipt No</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Payer</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Collector</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Method</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.receiptNo} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{transaction.payer}</TableCell>
                  <TableCell>
                    <Typography fontWeight="500">
                      ₱{transaction.amount?.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.paymentType} 
                      size="small"
                      color={
                        transaction.paymentType === "rent" ? "primary" :
                        transaction.paymentType === "electricity" ? "warning" :
                        transaction.paymentType === "water" ? "info" : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>{transaction.collectorName}</TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.method} 
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Receipt">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewReceipt(transaction)}
                          color="primary"
                        >
                          <FileText size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Select for Bulk Action">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            const isSelected = bulkActions.selectedTransactions.includes(transaction.id);
                            setBulkActions(prev => ({
                              ...prev,
                              selectedTransactions: isSelected
                                ? prev.selectedTransactions.filter(id => id !== transaction.id)
                                : [...prev.selectedTransactions, transaction.id]
                            }));
                          }}
                          color={bulkActions.selectedTransactions.includes(transaction.id) ? "primary" : "default"}
                        >
                          <CheckCircle size={16} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      No transactions found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Mobile Collector Status Section */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Smartphone size={20} />
          Mobile Collector Status
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          {mobileCollectors.map((collector) => (
            <Grid item xs={12} sm={6} md={4} key={collector.id}>
              <Card variant="outlined" sx={{ borderColor: collector.online ? 'success.main' : 'grey.400' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6">{collector.name}</Typography>
                    <Chip 
                      label={collector.online ? "Online" : "Offline"} 
                      size="small" 
                      color={collector.online ? "success" : "default"}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    ID: {collector.id}
                  </Typography>
                  <Typography variant="body2">
                    Area: {collector.area}
                  </Typography>
                  <Typography variant="body2">
                    Location: {collector.currentLocation}
                  </Typography>
                  <Typography variant="body2">
                    Battery: {collector.battery}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last Sync: {collector.lastSync.toLocaleTimeString()}
                  </Typography>
                  <Box mt={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={collector.online}
                          onChange={(e) => handleToggleCollectorStatus(collector.id, e.target.checked)}
                          size="small"
                        />
                      }
                      label="Online Status"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Enhanced Collector Assignment Section */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <AssignmentIndIcon fontSize="small" />
          Collector Assignment & Areas
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Table>
              <TableHead sx={{ bgcolor: "#f9f9f9" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Collector ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Assigned Area</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Collection Type</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collectors.map((col) => (
                  <TableRow key={col.id}>
                    <TableCell>{col.id}</TableCell>
                    <TableCell>{col.name}</TableCell>
                    <TableCell>
                      <TextField 
                        size="small" 
                        value={col.area}
                        onChange={(e) => handleAssignCollector(col.id, e.target.value, col.collectionType)}
                        select
                        fullWidth
                      >
                        {collectionAreas.map(area => (
                          <MenuItem key={area} value={area}>{area}</MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField 
                        size="small" 
                        value={col.collectionType || "regular"}
                        onChange={(e) => handleAssignCollector(col.id, col.area, e.target.value)}
                        select
                        fullWidth
                      >
                        <MenuItem value="regular">Regular Collection</MenuItem>
                        <MenuItem value="special">Special Events</MenuItem>
                        <MenuItem value="parking">Parking Fees</MenuItem>
                        <MenuItem value="public">Public Facilities</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => updateReceiptSequence(col.id, `AR-${Date.now()}`)}>
                        Update Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Receipt Sequence Tracking</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Collector</TableCell>
                  <TableCell>Current Receipt</TableCell>
                  <TableCell>Used</TableCell>
                  <TableCell>Available</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collectors.map(collector => {
                  const sequence = collectorReceiptSequences[collector.id];
                  return (
                    <TableRow key={collector.id}>
                      <TableCell>{collector.name}</TableCell>
                      <TableCell>
                        <Chip label={sequence?.current || "AR-0000"} size="small" />
                      </TableCell>
                      <TableCell>{sequence?.used || 0}</TableCell>
                      <TableCell>
                        <Chip 
                          label={sequence?.available || 0} 
                          color={sequence?.available > 20 ? "success" : "warning"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </Paper>

      {/* Enhanced Supervisor Dashboard */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Monitor size={20} />
          Supervisor Dashboard - Collector Activity & Performance
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>Daily Performance</Typography>
            <Table>
              <TableHead sx={{ bgcolor: "#f9f9f9" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Collector</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Efficiency</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Collections</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {supervisorDashboard.dailyPerformance.map((perf) => (
                  <TableRow key={perf.collectorId}>
                    <TableCell>{perf.name}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography>{perf.efficiency}%</Typography>
                        <Box 
                          sx={{ 
                            width: 60, 
                            height: 8, 
                            bgcolor: 'grey.200', 
                            borderRadius: 4,
                            overflow: 'hidden'
                          }}
                        >
                          <Box 
                            sx={{ 
                              width: `${perf.efficiency}%`, 
                              height: '100%', 
                              bgcolor: perf.efficiency > 80 ? 'success.main' : perf.efficiency > 60 ? 'warning.main' : 'error.main'
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{perf.collections}</TableCell>
                    <TableCell>₱{perf.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={mobileCollectors.find(c => c.id === perf.collectorId)?.online ? "Active" : "Offline"} 
                        size="small"
                        color={mobileCollectors.find(c => c.id === perf.collectorId)?.online ? "success" : "default"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Stack spacing={2}>
              <Button
                variant="contained"
                startIcon={<ReceiptLongIcon />}
                onClick={handleGenerateAudit}
                fullWidth
              >
                Generate Audit Request
              </Button>
              <Button
                variant="outlined"
                startIcon={<SyncIcon />}
                onClick={handleSynchronizeData}
                fullWidth
              >
                Force Sync All
              </Button>
              <Button
                variant="outlined"
                startIcon={<TrendingUp />}
                fullWidth
              >
                Performance Report
              </Button>
            </Stack>
            
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>System Overview</Typography>
              <Card sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                <Typography variant="body2">
                  <strong>Total Transactions:</strong> {transactions.length}
                </Typography>
                <Typography variant="body2">
                  <strong>Active Collectors:</strong> {mobileCollectors.filter(c => c.online).length}
                </Typography>
                <Typography variant="body2">
                  <strong>Receipts Used:</strong> {Object.values(collectorReceiptSequences).reduce((sum, seq) => sum + (seq.used || 0), 0)}
                </Typography>
                <Typography variant="body2">
                  <strong>Sync Status:</strong> {syncStatus.online ? 'Connected' : 'Disconnected'}
                </Typography>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Enhanced Reconciliation Section */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Calculator size={20} />
          Cash Reconciliation & Digital Records
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
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
                      {c.name} ({c.id}) - {c.area}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Physical Cash Received (₱)"
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  helperText="Enter the actual cash received from collector"
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
                  Reconcile Digital vs Physical
                </Button>
              </Grid>
            </Grid>
            
            {reconciliationResult && (
              <Box sx={{ mt: 3, p: 2, bgcolor: reconciliationResult.diff === 0 ? "#f0f9f0" : "#fef6f6", borderRadius: 2, border: reconciliationResult.diff === 0 ? "1px solid #c8e6c9" : "1px solid #ffcdd2" }}>
                <Typography variant="h6" gutterBottom>
                  Reconciliation Results
                </Typography>
                <Typography>
                  <strong>Digital Records Total:</strong> ₱ {reconciliationResult.totalCollected.toLocaleString()}
                </Typography>
                <Typography>
                  <strong>Physical Cash Received:</strong> ₱ {reconciliationResult.physicalCash.toLocaleString()}
                </Typography>
                <Typography sx={{ color: reconciliationResult.diff === 0 ? "green" : "red", fontWeight: 500, fontSize: "1.1rem" }}>
                  <strong>Difference:</strong> ₱{Math.abs(reconciliationResult.diff).toLocaleString()}
                </Typography>
                {reconciliationResult.diff !== 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {reconciliationResult.diff > 0 ? 
                      "Physical cash exceeds digital records. Check for unrecorded transactions." : 
                      "Digital records exceed physical cash. Verify cash handling procedures."
                    }
                  </Typography>
                )}
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Digital Transaction Records</Typography>
            {selectedCollector && (
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Receipt No</TableCell>
                      <TableCell>Payer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions
                      .filter(t => t.collectorId === selectedCollector)
                      .slice(0, 10)
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.receiptNo}</TableCell>
                          <TableCell>{transaction.payer}</TableCell>
                          <TableCell>₱{transaction.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip label={transaction.paymentType} size="small" variant="outlined" />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#D32F2F", color: "white" }}>
          <Box display="flex" alignItems="center" gap={1}>
            <DollarSign size={20} />
            Record New Payment
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Select Tenant"
                value={paymentForm.tenantId}
                onChange={(e) => setPaymentForm({ ...paymentForm, tenantId: e.target.value })}
                required
              >
                {tenants.map((tenant) => (
                  <MenuItem key={tenant.id} value={tenant.id}>
                    {tenant.name} - {tenant.stall}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Collector"
                value={paymentForm.collectorId}
                onChange={(e) => setPaymentForm({ ...paymentForm, collectorId: e.target.value })}
                required
              >
                {collectors.map((collector) => (
                  <MenuItem key={collector.id} value={collector.id}>
                    {collector.name} - {collector.area}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount (₱)"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Payment Type"
                value={paymentForm.paymentType}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}
              >
                {paymentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Receipt Number"
                value={paymentForm.receiptNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, receiptNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Payment Method"
                value={paymentForm.method}
                onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={paymentForm.date}
                onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleProcessPayment}
            sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
          >
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt View Dialog */}
      <Dialog open={receiptDialog} onClose={() => setReceiptDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Receipt size={20} />
            Payment Receipt
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedReceipt && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom align="center">
                OFFICIAL RECEIPT
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2"><strong>Receipt No:</strong></Typography>
                  <Typography>{selectedReceipt.receiptNo}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2"><strong>Date:</strong></Typography>
                  <Typography>{selectedReceipt.date}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Payer:</strong></Typography>
                  <Typography>{selectedReceipt.payer}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Amount:</strong></Typography>
                  <Typography variant="h6" color="primary">
                    ₱{selectedReceipt.amount?.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2"><strong>Type:</strong></Typography>
                  <Typography>{selectedReceipt.paymentType}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2"><strong>Method:</strong></Typography>
                  <Typography>{selectedReceipt.method}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Collector:</strong></Typography>
                  <Typography>{selectedReceipt.collectorName}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptDialog(false)}>Close</Button>
          <Button variant="contained" onClick={handlePrintReceipt}>
            Print Receipt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Audit Dialog */}
      <Dialog open={openAuditDialog} onClose={() => setOpenAuditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#D32F2F", color: "white" }}>
          <Box display="flex" alignItems="center" gap={1}>
            <ReceiptLongIcon />
            Audit Request Generated
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>Recent Audit Activities</Typography>
          {auditLogs.length > 0 ? (
            auditLogs.slice(0, 5).map((audit) => (
              <Box key={audit.id} sx={{ mb: 3, p: 2, bgcolor: "#f9f9f9", borderRadius: 2, border: "1px solid #eee" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography><b>Audit ID:</b> {audit.id}</Typography>
                    <Typography><b>Type:</b> {audit.type}</Typography>
                    <Typography><b>Status:</b> 
                      <Chip label={audit.status} size="small" color="primary" sx={{ ml: 1 }} />
                    </Typography>
                    <Typography><b>Timestamp:</b> {audit.timestamp}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Selected Transactions:</Typography>
                    {audit.transactions.map((t, index) => (
                      <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                        • {t.receiptNo} - {t.payer} - ₱{t.amount} ({t.collectorName})
                      </Typography>
                    ))}
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
          <Button variant="contained" onClick={handleGenerateAudit}>
            Generate New Audit
          </Button>
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