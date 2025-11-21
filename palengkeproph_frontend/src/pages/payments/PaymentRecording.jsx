import React, { useState, useEffect } from "react";
import HomeIcon from "@mui/icons-material/Home";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Tabs,
  Tab,
  Snackbar,
} from "@mui/material";
import MainLayout from "../../layouts/MainLayout";
import * as XLSX from 'xlsx';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
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
  const [patronName, setPatronName] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [dailyBreakdown, setDailyBreakdown] = useState({
    rent: 0,
    rights: 0,
    electricity: 0,
    water: 0,
    other: 0,
    total: 0
  });
  const [receiptType, setReceiptType] = useState("AR");
  const [breakdown, setBreakdown] = useState({
    electric: "",
    water: "",
    rent: "",
    rights: "",
    others: ""
  });
  const [tabValue, setTabValue] = useState(0);
  const [uploadedData, setUploadedData] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Payment types based on requirements
  const paymentTypes = [
    { value: "rent", label: "Rent Payment", category: "tenant", requiresTenant: true },
    { value: "rights", label: "Rights Payment", category: "tenant", requiresTenant: true },
    { value: "electricity", label: "Electricity Bill", category: "tenant", requiresTenant: true },
    { value: "water", label: "Water Bill", category: "tenant", requiresTenant: true },
    { value: "other_fees", label: "Other Fees", category: "tenant", requiresTenant: true },
    { value: "restroom", label: "Restroom Fee", category: "public", requiresTenant: false },
    { value: "parking", label: "Parking Fee", category: "public", requiresTenant: false },
    { value: "loan_repayment", label: "Loan Repayment", category: "loan", requiresTenant: true },
    { value: "special_event", label: "Special Event Fee", category: "event", requiresTenant: false },
  ];

  const steps = [
    {
      label: 'Receipt Preparation',
      description: 'Prepare collection receipts with exact amounts for rent, rights, electricity, and water',
    },
    {
      label: 'Field Collection',
      description: 'Collect payments and issue official receipts to tenants',
    },
    {
      label: 'Additional Payments',
      description: 'Handle other payments not pre-listed (past due, special fees)',
    },
    {
      label: 'Daily Reconciliation',
      description: 'Verify amounts and prepare for remittance',
    },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
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
    setReceiptNumber(`AR-${String(storedPayments.length + 1).padStart(5, "0")}`);
    
    // Set default collector ID
    setCollectorId(storedCollectors[0]?.id || "C-001");

    // Calculate daily breakdown
    calculateDailyBreakdown(storedPayments);
  };

  const calculateDailyBreakdown = (payments) => {
    const today = new Date().toDateString();
    const todayPayments = payments.filter(payment => 
      new Date(payment.date).toDateString() === today
    );

    const breakdown = {
      rent: 0,
      rights: 0,
      electricity: 0,
      water: 0,
      other: 0,
      total: 0
    };

    todayPayments.forEach(payment => {
      const amount = parseFloat(payment.amount);
      breakdown.total += amount;
      
      switch(payment.paymentType) {
        case 'rent':
          breakdown.rent += amount;
          break;
        case 'rights':
          breakdown.rights += amount;
          break;
        case 'electricity':
          breakdown.electricity += amount;
          break;
        case 'water':
          breakdown.water += amount;
          break;
        default:
          breakdown.other += amount;
      }
    });

    setDailyBreakdown(breakdown);
  };

  const currentTenant = tenants.find((t) => t.id === selectedTenant);
  const currentStall = stalls.find((s) => s.id === selectedStall);
  const currentCollector = collectors.find((c) => c.id === collectorId);

  // Check if current payment type requires tenant selection
  const currentPaymentType = paymentTypes.find(pt => pt.value === paymentType);
  const requiresTenant = currentPaymentType?.requiresTenant || false;

  const handleBreakdownChange = (field, value) => {
    setBreakdown(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotal = () => {
    const electric = parseFloat(breakdown.electric) || 0;
    const water = parseFloat(breakdown.water) || 0;
    const rent = parseFloat(breakdown.rent) || 0;
    const rights = parseFloat(breakdown.rights) || 0;
    const others = parseFloat(breakdown.others) || 0;
    return electric + water + rent + rights + others;
  };

  // AUTO ISSUANCE - Single Payment Recording
  const handleRecordPayment = () => {
    if (!paymentType || !collectorId) {
      showSnackbar("Please fill in all required fields.", "warning");
      return;
    }

    // For tenant payments, require tenant selection
    if (requiresTenant && !selectedTenant) {
      showSnackbar("Please select a tenant for this payment type.", "warning");
      return;
    }

    // Calculate total amount from breakdown
    const totalAmount = calculateTotal();
    if (totalAmount <= 0) {
      showSnackbar("Please enter valid payment amounts.", "warning");
      return;
    }

    // For public payments, set default patron name
    if (!requiresTenant && !patronName) {
      setPatronName("Walk-in Customer");
    }

    const newPayment = createPaymentRecord(totalAmount);
    const updatedHistory = [newPayment, ...paymentHistory];
    setPaymentHistory(updatedHistory);
    localStorage.setItem("paymentHistory", JSON.stringify(updatedHistory));

    // Generate next receipt number
    const nextNumber = updatedHistory.length + 1;
    setReceiptNumber(`${receiptType}-${String(nextNumber).padStart(5, "0")}`);

    setReceipt(newPayment);
    setOpenReceipt(true);
    
    // Update daily breakdown
    calculateDailyBreakdown(updatedHistory);
    
    // Reset form
    setBreakdown({ electric: "", water: "", rent: "", rights: "", others: "" });
    setSelectedTenant("");
    setSelectedStall("");
    setPaymentType("");
    setPatronName("");
    setActiveStep(3);

    showSnackbar("Payment recorded successfully!", "success");
  };

  // MANUAL ENTRY - Multiple payments without receipts
  const handleManualEntry = () => {
    if (uploadedData.length === 0) {
      showSnackbar("Please upload or enter payment data first.", "warning");
      return;
    }

    const newPayments = uploadedData.map((data, index) => {
      const totalAmount = parseFloat(data.amount) || 0;
      return createPaymentRecord(totalAmount, data, true);
    });

    const updatedHistory = [...newPayments, ...paymentHistory];
    setPaymentHistory(updatedHistory);
    localStorage.setItem("paymentHistory", JSON.stringify(updatedHistory));

    const nextNumber = updatedHistory.length + 1;
    setReceiptNumber(`${receiptType}-${String(nextNumber).padStart(5, "0")}`);

    setUploadedData([]);
    calculateDailyBreakdown(updatedHistory);
    showSnackbar(`${newPayments.length} payments added manually!`, "success");
  };

  const createPaymentRecord = (totalAmount, manualData = null, isManual = false) => {
    const baseData = manualData || {};
    
    return {
      id: `PAY-${String(paymentHistory.length + 1).padStart(5, "0")}`,
      receiptNumber: isManual ? "MANUAL" : receiptNumber,
      receiptType: isManual ? "MANUAL" : receiptType,
      tenantId: requiresTenant ? selectedTenant : "N/A",
      tenantName: baseData.tenantName || (requiresTenant ? currentTenant?.name : patronName || "Walk-in Customer"),
      stallId: requiresTenant ? (selectedStall || currentTenant?.stallId) : "N/A",
      stallName: baseData.stallName || (requiresTenant ? (currentStall?.name || stalls.find(s => s.id === selectedStall)?.name) : "Public Facility"),
      paymentType: baseData.paymentType || paymentType,
      paymentTypeLabel: paymentTypes.find(pt => pt.value === (baseData.paymentType || paymentType))?.label || paymentType,
      date: new Date().toISOString(),
      displayDate: new Date().toLocaleString(),
      amount: totalAmount.toFixed(2),
      breakdown: manualData ? {
        electric: manualData.electric || "0",
        water: manualData.water || "0",
        rent: manualData.rent || "0",
        rights: manualData.rights || "0",
        others: manualData.others || "0"
      } : { ...breakdown },
      method: baseData.method || method,
      collectorId: baseData.collectorId || collectorId,
      collectorName: collectors.find(c => c.id === (baseData.collectorId || collectorId))?.name || "Unknown Collector",
      collectorArea: collectors.find(c => c.id === (baseData.collectorId || collectorId))?.area || "Unknown Area",
      status: "completed",
      category: currentPaymentType?.category || "other",
      isManual: isManual
    };
  };

  // EXCEL UPLOAD FUNCTIONALITY
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel columns to our data structure
        const mappedData = jsonData.map((row, index) => ({
          id: `UPL-${index + 1}`,
          tenantName: row['Tenant Name'] || row['tenantName'] || row['Tenant'] || 'Unknown',
          stallName: row['Stall'] || row['stallName'] || row['Stall Name'] || 'N/A',
          paymentType: mapPaymentType(row['Payment Type'] || row['paymentType'] || row['Type']),
          amount: row['Amount'] || row['amount'] || row['Total'] || '0',
          electric: row['Electric'] || row['electric'] || row['ELECTRIC'] || '0',
          water: row['Water'] || row['water'] || row['WATER'] || '0',
          rent: row['Rent'] || row['rent'] || row['RENT'] || '0',
          rights: row['Rights'] || row['rights'] || row['RIGHTS'] || '0',
          others: row['Others'] || row['others'] || row['OTHERS'] || '0',
          method: mapPaymentMethod(row['Method'] || row['method'] || row['Payment Method'] || 'Cash'),
          collectorId: row['Collector ID'] || row['collectorId'] || row['Collector'] || collectorId,
        }));

        setUploadedData(mappedData);
        showSnackbar(`Successfully loaded ${mappedData.length} records from Excel`, "success");
      } catch (error) {
        showSnackbar("Error reading Excel file. Please check the format.", "error");
        console.error("Excel read error:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const mapPaymentType = (type) => {
    if (!type) return 'other_fees';
    
    const typeMap = {
      'rent': 'rent',
      'Rent': 'rent',
      'RENT': 'rent',
      'electricity': 'electricity',
      'Electricity': 'electricity',
      'ELECTRICITY': 'electricity',
      'electric': 'electricity',
      'water': 'water',
      'Water': 'water',
      'WATER': 'water',
      'rights': 'rights',
      'Rights': 'rights',
      'RIGHTS': 'rights',
      'parking': 'parking',
      'Parking': 'parking',
      'PARKING': 'parking',
      'restroom': 'restroom',
      'Restroom': 'restroom',
      'RESTROOM': 'restroom',
      'loan': 'loan_repayment',
      'Loan': 'loan_repayment',
      'special': 'special_event',
      'Special': 'special_event'
    };
    return typeMap[type.toString().toLowerCase()] || 'other_fees';
  };

  const mapPaymentMethod = (method) => {
    if (!method) return 'Cash';
    
    const methodMap = {
      'cash': 'Cash',
      'Cash': 'Cash',
      'CASH': 'Cash',
      'gcash': 'GCash',
      'Gcash': 'GCash',
      'GCash': 'GCash',
      'GCASH': 'GCash'
    };
    return methodMap[method.toString().toLowerCase()] || 'Cash';
  };

  const handleBulkImport = () => {
    if (uploadedData.length === 0) {
      showSnackbar("No data to import. Please upload an Excel file first.", "warning");
      return;
    }

    const newPayments = uploadedData.map((data, index) => {
      const totalAmount = parseFloat(data.amount) || calculateBreakdownTotal(data);
      return createPaymentRecord(totalAmount, data, true);
    });

    const updatedHistory = [...newPayments, ...paymentHistory];
    setPaymentHistory(updatedHistory);
    localStorage.setItem("paymentHistory", JSON.stringify(updatedHistory));

    const nextNumber = updatedHistory.length + 1;
    setReceiptNumber(`${receiptType}-${String(nextNumber).padStart(5, "0")}`);

    setUploadedData([]);
    calculateDailyBreakdown(updatedHistory);
    showSnackbar(`Successfully imported ${newPayments.length} payments!`, "success");
  };

  const calculateBreakdownTotal = (data) => {
    const electric = parseFloat(data.electric) || 0;
    const water = parseFloat(data.water) || 0;
    const rent = parseFloat(data.rent) || 0;
    const rights = parseFloat(data.rights) || 0;
    const others = parseFloat(data.others) || 0;
    return electric + water + rent + rights + others;
  };

  const handlePrint = () => {
    const receiptContent = document.getElementById('receipt-content');
    if (receiptContent) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Receipt</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .receipt { border: 2px solid #000; padding: 20px; max-width: 300px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 20px; }
              .divider { border-top: 1px solid #000; margin: 10px 0; }
              .field { margin: 5px 0; }
              .total { font-weight: bold; font-size: 1.2em; margin-top: 10px; }
              .signature { margin-top: 30px; text-align: center; }
            </style>
          </head>
          <body>${receiptContent.innerHTML}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all payment data?")) {
      setPaymentHistory([]);
      setReceiptNumber("AR-00001");
      localStorage.removeItem("paymentHistory");
      setDailyBreakdown({ rent: 0, rights: 0, electricity: 0, water: 0, other: 0, total: 0 });
      setUploadedData([]);
      showSnackbar("All payment data has been reset successfully!", "success");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Filter payment history
  const filteredHistory = paymentHistory.filter((payment) => {
    if (filterType !== "all" && payment.paymentType !== filterType) return false;
    if (filterDate && !payment.displayDate.includes(filterDate)) return false;
    return true;
  });

  const getPaymentTypeColor = (type) => {
    const colors = {
      rent: "primary",
      rights: "secondary",
      electricity: "warning",
      water: "info",
      other_fees: "default",
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

  // Update receipt number when receipt type changes
  useEffect(() => {
    const nextNumber = paymentHistory.length + 1;
    setReceiptNumber(`${receiptType}-${String(nextNumber).padStart(5, "0")}`);
  }, [receiptType, paymentHistory.length]);

  const handlePrepareReceipts = () => {
    setActiveStep(1);
    showSnackbar("Receipts prepared for daily collection. Ready for field collection.", "info");
  };

  const handleCompleteCollection = () => {
    setActiveStep(2);
    showSnackbar("Field collection completed. Ready for additional payments.", "info");
  };

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

      {/* SOP Process Stepper */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptIcon /> Area Collector Daily Operations
        </Typography>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Typography>{step.description}</Typography>
                {index === 0 && (
                  <Button variant="contained" onClick={handlePrepareReceipts} sx={{ mt: 2 }}>
                    Prepare Daily Receipts
                  </Button>
                )}
                {index === 1 && (
                  <Button variant="contained" onClick={handleCompleteCollection} sx={{ mt: 2 }}>
                    Complete Field Collection
                  </Button>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* 📊 Today's Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Rent
              </Typography>
              <Typography variant="h6" component="div" color="primary.main" sx={{fontWeight: "700"}}>
                ₱{dailyBreakdown.rent.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Rights
              </Typography>
              <Typography variant="h6" component="div" color="secondary.main" sx={{fontWeight:"700"}}>
                ₱{dailyBreakdown.rights.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Electricity
              </Typography>
              <Typography variant="h6" component="div" color="warning.main" sx={{fontWeight:"700"}}>
                ₱{dailyBreakdown.electricity.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Water
              </Typography>
              <Typography variant="h6" component="div" color="info.main" sx={{fontWeight:"700"}}>
                ₱{dailyBreakdown.water.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Other
              </Typography>
              <Typography variant="h6" component="div" sx={{fontWeight:"700"}}>
                ₱{dailyBreakdown.other.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", bgcolor: "#D32F2F", color: "white" }}>
            <CardContent>
              <Typography gutterBottom variant="body2" sx={{ color: "white" }}>
                Total Today
              </Typography>
              <Typography variant="h6" component="div" sx={{fontWeight:"700"}}>
                ₱{dailyBreakdown.total.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SOP Guidance Alert */}
      {activeStep < 3 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            SOP Reminder: 
          </Typography>
          <Typography variant="body2">
            {activeStep === 0 && "Prepare receipts with exact amounts for rent, rights, electricity, and water. Double-check all figures."}
            {activeStep === 1 && "Ensure collected amount exactly matches the receipt amount. Issue official receipt immediately."}
            {activeStep === 2 && "For additional payments not pre-listed, create separate receipts with clear purpose indication."}
            {activeStep === 3 && "Verify all amounts match physical cash. Prepare for reconciliation and remittance."}
          </Typography>
        </Alert>
      )}

      {/* Tabs for different entry methods */}
      <Paper sx={{ width: '100%', mb: 5, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)} 
          centered
          sx={{
            '& .MuiTab-root': { fontWeight: 600 },
            '& .Mui-selected': { color: '#D32F2F' }
          }}
        >
          <Tab label="Auto Issuance" />
          <Tab label="Manual Entry" />
          <Tab label="Excel Upload" />
        </Tabs>

        {/* AUTO ISSUANCE TAB */}
        <TabPanel value={tabValue} index={0}>
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>Auto Issuance - Single Payment</Typography>
            <Typography color="text.secondary" mb={3}>Record individual payments with automatic receipt generation</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Receipt Type</FormLabel>
                  <RadioGroup
                    row
                    value={receiptType}
                    onChange={(e) => setReceiptType(e.target.value)}
                  >
                    <FormControlLabel value="AR" control={<Radio />} label="Acknowledgement Receipt (AR)" />
                    <FormControlLabel value="OR" control={<Radio />} label="Official Receipt (OR)" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label={`${receiptType} Number`}
                  fullWidth
                  value={receiptNumber}
                  InputProps={{ readOnly: true }}
                  helperText={`${receiptType} Number`}
                />
              </Grid>

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

              {/* Tenant and Stall Selection */}
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
                    helperText="For public facility payments"
                  />
                </Grid>
              )}

              {/* Payment Breakdown */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Payment Breakdown
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="ELECTRIC (₱)"
                      fullWidth
                      type="number"
                      value={breakdown.electric}
                      onChange={(e) => handleBreakdownChange('electric', e.target.value)}
                      placeholder="0.00"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="WATER (₱)"
                      fullWidth
                      type="number"
                      value={breakdown.water}
                      onChange={(e) => handleBreakdownChange('water', e.target.value)}
                      placeholder="0.00"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="RENT (₱)"
                      fullWidth
                      type="number"
                      value={breakdown.rent}
                      onChange={(e) => handleBreakdownChange('rent', e.target.value)}
                      placeholder="0.00"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="RIGHTS (₱)"
                      fullWidth
                      type="number"
                      value={breakdown.rights}
                      onChange={(e) => handleBreakdownChange('rights', e.target.value)}
                      placeholder="0.00"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="OTHERS (₱)"
                      fullWidth
                      type="number"
                      value={breakdown.others}
                      onChange={(e) => handleBreakdownChange('others', e.target.value)}
                      placeholder="0.00"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="TOTAL (₱)"
                      fullWidth
                      value={calculateTotal().toFixed(2)}
                      InputProps={{ readOnly: true }}
                      sx={{ fontWeight: 'bold', '& .MuiInputBase-input': { fontWeight: 'bold' } }}
                    />
                  </Grid>
                </Grid>
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
              Issue {receiptType === 'AR' ? 'Acknowledgement Receipt' : 'Official Receipt'}
            </Button>
          </Box>
        </TabPanel>

        {/* MANUAL ENTRY TAB */}
        <TabPanel value={tabValue} index={1}>
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>Manual Entry - Bulk Payments</Typography>
            <Typography color="text.secondary" mb={3}>Add multiple payments without generating individual receipts</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info">
                  Use this for recording historical payments or bulk entries where individual receipts are not needed.
                  Payments will be marked as "MANUAL" in the history.
                </Alert>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField 
                  label="Number of Payments" 
                  type="number" 
                  fullWidth 
                  value={uploadedData.length} 
                  InputProps={{ readOnly: true }} 
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField 
                  label="Total Amount" 
                  fullWidth 
                  value={uploadedData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2)} 
                  InputProps={{ readOnly: true }} 
                />
              </Grid>

              <Grid item xs={12}>
                <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth>
                  Upload Excel File for Manual Entry
                  <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Upload an Excel file with payment data. No receipts will be generated.
                </Typography>
              </Grid>

              {uploadedData.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Preview ({uploadedData.length} records)</Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Tenant</TableCell>
                          <TableCell>Stall</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Method</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {uploadedData.slice(0, 10).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.tenantName}</TableCell>
                            <TableCell>{row.stallName}</TableCell>
                            <TableCell>
                              <Chip label={row.paymentType} color={getPaymentTypeColor(row.paymentType)} size="small" />
                            </TableCell>
                            <TableCell>₱{parseFloat(row.amount).toFixed(2)}</TableCell>
                            <TableCell>{row.method}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {uploadedData.length > 10 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Showing first 10 of {uploadedData.length} records
                    </Typography>
                  )}
                </Grid>
              )}

              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={handleManualEntry} 
                  disabled={uploadedData.length === 0}
                  sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
                >
                  Add {uploadedData.length} Payments to History
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* EXCEL UPLOAD TAB */}
        <TabPanel value={tabValue} index={2}>
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>Excel Bulk Import</Typography>
            <Typography color="text.secondary" mb={3}>Upload Excel file to import multiple payments at once</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="subtitle2" gutterBottom>Excel Format Requirements:</Typography>
                  <Typography variant="body2">
                    • Required Columns: Tenant Name, Payment Type, Amount<br/>
                    • Optional Columns: Stall, Electric, Water, Rent, Rights, Others, Method, Collector ID<br/>
                    • Payment Types: rent, electricity, water, rights, parking, restroom, loan_repayment, special_event<br/>
                    • Methods: Cash, GCash
                  </Typography>
                </Alert>
              </Grid>

              <Grid item xs={12}>
                <Button variant="contained" component="label" startIcon={<CloudUploadIcon />} fullWidth size="large">
                  Upload Excel File
                  <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                </Button>
              </Grid>

              {uploadedData.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Data Preview ({uploadedData.length} records)</Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Tenant</TableCell>
                            <TableCell>Stall</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Method</TableCell>
                            <TableCell>Collector</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {uploadedData.slice(0, 5).map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>{row.tenantName}</TableCell>
                              <TableCell>{row.stallName}</TableCell>
                              <TableCell>
                                <Chip label={row.paymentType} color={getPaymentTypeColor(row.paymentType)} size="small" />
                              </TableCell>
                              <TableCell>₱{parseFloat(row.amount).toFixed(2)}</TableCell>
                              <TableCell>{row.method}</TableCell>
                              <TableCell>{row.collectorId}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {uploadedData.length > 5 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Showing first 5 of {uploadedData.length} records
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      size="large" 
                      onClick={handleBulkImport} 
                      sx={{ bgcolor: "green", "&:hover": { bgcolor: "darkgreen" } }}
                    >
                      Import {uploadedData.length} Payments
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </TabPanel>
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
                <TableCell><b>Type</b></TableCell>
                <TableCell><b>Date & Time</b></TableCell>
                <TableCell><b>Payment Type</b></TableCell>
                <TableCell><b>Tenant/Patron</b></TableCell>
                <TableCell><b>Stall/Facility</b></TableCell>
                <TableCell><b>Amount (₱)</b></TableCell>
                <TableCell><b>Method</b></TableCell>
                <TableCell><b>Collector</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      <Chip 
                        label={payment.receiptNumber} 
                        color={payment.receiptType === 'AR' ? 'primary' : payment.receiptType === 'OR' ? 'secondary' : 'default'}
                        size="small"
                        variant={payment.isManual ? "outlined" : "filled"}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.receiptType} 
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{payment.displayDate}</TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.paymentTypeLabel} 
                        color={getPaymentTypeColor(payment.paymentType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{payment.tenantName}</TableCell>
                    <TableCell>{payment.stallName}</TableCell>
                    <TableCell>₱{payment.amount}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{payment.collectorName}</TableCell>
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

      {/* 🧾 VERTICAL RECEIPT DIALOG */}
      <Dialog open={openReceipt} onClose={() => setOpenReceipt(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: "#D32F2F", color: "white", textAlign: 'center' }}>
          {receiptType === 'AR' ? 'ACKNOWLEDGEMENT RECEIPT' : 'OFFICIAL RECEIPT'}
        </DialogTitle>
        <DialogContent dividers>
          {receipt && (
            <Box id="receipt-content" sx={{ p: 2, maxWidth: 300, margin: '0 auto' }}>
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Wet and Dry Market
                </Typography>
                <Typography variant="body2">
                  El Camino Real, Sto. Niño
                </Typography>
                <Typography variant="body2">
                  Camalig, Meycauayan City, Bulacan
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Receipt Title */}
              <Typography variant="h6" fontWeight="bold" align="center" sx={{ mb: 2 }}>
                {receiptType === 'AR' ? 'ACKNOWLEDGEMENT RECEIPT' : 'OFFICIAL RECEIPT'}
              </Typography>

              {/* Date */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Date:</strong> {new Date(receipt.date).toLocaleDateString()}
                </Typography>
              </Box>

              {/* Received From */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Received from <strong>{receipt.tenantName}</strong> the sum of
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 1, fontWeight: 'bold' }}>
                  ₱{receipt.amount}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Pesos */}
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Pesos (Php):</strong> {receipt.amount} in payment for account described herein.
              </Typography>

              {/* Stall and ID */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>STALL #:</strong> {receipt.stallName}
                </Typography>
                <Typography variant="body2">
                  <strong>ID #:</strong> {receipt.tenantId}
                </Typography>
              </Box>

              {/* Breakdown */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>ELECTRIC:</strong> ₱{(parseFloat(receipt.breakdown.electric) || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  <strong>WATER:</strong> ₱{(parseFloat(receipt.breakdown.water) || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  <strong>RENT:</strong> ₱{(parseFloat(receipt.breakdown.rent) || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  <strong>RIGHTS:</strong> ₱{(parseFloat(receipt.breakdown.rights) || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  <strong>OTHERS:</strong> ₱{(parseFloat(receipt.breakdown.others) || 0).toFixed(2)}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Total */}
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  TOTAL
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="#D32F2F">
                  Php {receipt.amount}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Signature */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" sx={{ borderTop: '1px solid #000', width: '60%', margin: '0 auto', pt: 1 }}>
                  {receipt.collectorName}
                </Typography>
                <Typography variant="caption">
                  <strong>Nº {receiptType}</strong>
                </Typography>
                <Typography variant="caption" display="block">
                  Authorized Signature
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePrint}>Print Receipt</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#D32F2F" }}
            onClick={() => setOpenReceipt(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}