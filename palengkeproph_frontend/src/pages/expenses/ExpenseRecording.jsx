import React, { useState, useEffect } from "react";
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
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Home as HomeIcon,
  AttachFile,
  Visibility,
  CloudUpload,
  Add,
  Receipt,
  PriorityHigh,
  Person,
  CheckCircle,
  Schedule,
  PendingActions,
  Cancel,
  AttachMoney,
  Security,
  AdminPanelSettings,
} from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";

export default function ExpenseRecording() {
  const [formData, setFormData] = useState({
    expenseDate: "",
    expenseCategory: "",
    expenseAmount: "",
    expenseDescription: "",
    paymentMethod: "",
    paymentStatus: "Pending",
    chargedTo: "",
    approvalStatus: "Pending",
    approver: "",
    dueDate: "",
    checkRequestDate: "",
    checkReleaseDate: "",
    supplierId: "",
    currency: "PhP",
    exchangeRate: "1.00",
    projectCode: "",
    priority: "Medium",
  });

  const [formErrors, setFormErrors] = useState({});
  const [receipt, setReceipt] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewExpense, setViewExpense] = useState(null);
  const [currentUser] = useState({
    role: "Employee",
    name: "John Doe",
    id: "EMP-001",
    department: "Operations"
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Enhanced expense categories with icons
  const expenseCategories = [
    { value: "Supplies", label: "Office Supplies", icon: "📦" },
    { value: "Security Agencies", label: "Security Services", icon: "🛡️" },
    { value: "Land Lease Rent", label: "Land Lease Rent", icon: "🏢" },
    { value: "Cleaning Equipment", label: "Cleaning Equipment", icon: "🧹" },
    { value: "Building Maintenance", label: "Building Maintenance", icon: "🔧" },
    { value: "Payroll (Full-time employees)", label: "Full-time Payroll", icon: "👨‍💼" },
    { value: "Payroll (Part-time employees)", label: "Part-time Payroll", icon: "👩‍💼" },
    { value: "Consultants", label: "Consultant Fees", icon: "💼" },
    { value: "Auditors", label: "Audit Fees", icon: "📊" },
    { value: "Capital Equipment", label: "Capital Equipment", icon: "💻" },
    { value: "Outside Labor", label: "Outside Labor", icon: "👷" },
    { value: "Materials", label: "Materials", icon: "📦" },
    { value: "Utilities (Water)", label: "Water Utilities", icon: "💧" },
    { value: "Utilities (Cell Phone)", label: "Phone Utilities", icon: "📱" },
    { value: "Utilities (Electricity)", label: "Electricity", icon: "⚡" },
    { value: "Lease Rentals", label: "Lease Rentals", icon: "🏠" },
    { value: "Other", label: "Other Expenses", icon: "💰" },
  ];

  const paymentMethods = [
    "Cash", "Check", "Bank Transfer", "Credit Card", "Digital Payment"
  ];
  
  const chargedToOptions = ["Tenant", "Sister Company", "Assigned Project"];
  const currencies = ["PhP", "USD", "EUR", "GBP", "AUD", "Other"];
  const priorities = [
    { value: "Low", label: "Low", color: "success" },
    { value: "Medium", label: "Medium", color: "warning" },
    { value: "High", label: "High", color: "error" },
    { value: "Urgent", label: "Urgent", color: "error" },
  ];

  // Role-based approvers
  const approvers = [
    { id: "MGR-001", name: "Maria Santos", role: "Manager", department: "Finance", threshold: Infinity },
    { id: "MM-001", name: "Juan Dela Cruz", role: "Market Master", department: "Operations", threshold: 50000 },
    { id: "EXEC-001", name: "Anna Reyes", role: "Executive", department: "Management", threshold: Infinity },
  ];

  // Approval thresholds based on role
  const approvalThresholds = {
    Manager: Infinity,       // Up to ₱10,000
    MarketMaster: 50000,  // Up to ₱50,000
    Executive: Infinity   // No threshold
  };

  useEffect(() => {
    const storedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(storedExpenses);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: "File size must be less than 5MB",
        severity: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () =>
      setReceipt({
        fileName: file.name,
        fileType: file.type,
        data: reader.result,
        uploadedAt: new Date().toISOString(),
      });
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const errors = {};
    const required = [
      "expenseDate",
      "expenseCategory",
      "expenseAmount",
      "expenseDescription",
    ];

    required.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        errors[field] = "This field is required";
      }
    });

    // Additional validation for amount
    if (formData.expenseAmount && (parseFloat(formData.expenseAmount) <= 0 || isNaN(parseFloat(formData.expenseAmount)))) {
      errors.expenseAmount = "Amount must be greater than 0";
    }

    if (formData.currency !== "PhP" && (!formData.exchangeRate || parseFloat(formData.exchangeRate) <= 0)) {
      errors.exchangeRate = "Exchange rate is required for non-PhP currencies";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getApproverForAmount = (amount) => {
    const sortedApprovers = approvers.sort((a, b) => a.threshold - b.threshold);
    return sortedApprovers.find(approver => amount <= approver.threshold) || sortedApprovers[sortedApprovers.length - 1];
  };

  const handleSaveExpense = () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields correctly",
        severity: "warning",
      });
      return;
    }

    const expenseAmount = parseFloat(formData.expenseAmount) || 0;
    const autoApprover = getApproverForAmount(expenseAmount);

    const newExpense = {
      id: `EXP-${Date.now()}`,
      ...formData,
      receipt,
      createdAt: new Date().toISOString(),
      expenseAmount: expenseAmount,
      exchangeRate: parseFloat(formData.exchangeRate) || 1,
      submittedBy: currentUser.name,
      submittedById: currentUser.id,
      department: currentUser.department,
      approvalHistory: [{
        action: "Submitted",
        status: "Pending",
        timestamp: new Date().toISOString(),
        user: currentUser.name,
        note: "Expense submitted for approval"
      }],
      currentApprover: formData.approver || autoApprover.id,
      autoAssignedApprover: !formData.approver ? autoApprover.name : null,
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

    // Reset form
    setFormData({
      expenseDate: "",
      expenseCategory: "",
      expenseAmount: "",
      expenseDescription: "",
      paymentMethod: "",
      paymentStatus: "Pending",
      chargedTo: "",
      approvalStatus: "Pending",
      approver: "",
      dueDate: "",
      checkRequestDate: "",
      checkReleaseDate: "",
      supplierId: "",
      currency: "PhP",
      exchangeRate: "1.00",
      projectCode: "",
      priority: "Medium",
    });
    setReceipt(null);
    setFormErrors({});

    setSnackbar({
      open: true,
      message: `Expense recorded successfully! Assigned to ${autoApprover.name} for approval.`,
      severity: "success",
    });
  };

  const handleViewExpense = (expense) => {
    setViewExpense(expense);
    setOpenDialog(true);
  };

  const formatAmount = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return `₱${numAmount.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "success";
      case "Rejected": return "error";
      case "Pending": return "warning";
      case "Under Review": return "info";
      default: return "default";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Urgent": return "error";
      case "High": return "warning";
      case "Medium": return "info";
      case "Low": return "success";
      default: return "default";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Manager": return <Security fontSize="small" />;
      case "MarketMaster": return <AdminPanelSettings fontSize="small" />;
      case "Executive": return <AttachMoney fontSize="small" />;
      default: return <Security fontSize="small" />;
    }
  };

  const pendingExpenses = expenses.filter(exp => exp.approvalStatus === "Pending");
  const approvedExpenses = expenses.filter(exp => exp.approvalStatus === "Approved");
  const totalAmount = expenses.reduce((sum, exp) => sum + (parseFloat(exp.expenseAmount) || 0), 0);

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
            <Typography color="text.primary">Expense Recording</Typography>
          </Breadcrumbs>
        </Box>

        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom color="black">
              Expense Recording
            </Typography>
            <Typography color="text.secondary">
              Submit and track expenses through approval workflow
            </Typography>
          </Box>
          <Card sx={{ bgcolor: "#FFF5F5", border: "1px solid #D32F2F", borderRadius: 2 }}>
            <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {getRoleIcon(currentUser.role)}
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {currentUser.role}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {currentUser.department}
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

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ textAlign: "center", bgcolor: "#ffff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", borderRadius: 3  }}>
              <CardContent>
                <Typography variant="h4" color="#D32F2F" fontWeight={700}>
                  {expenses.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Expenses
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ textAlign: "center", bgcolor: "#ffff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h4" color="#D32F2F" fontWeight={700}>
                  {pendingExpenses.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ textAlign: "center", bgcolor: "#ffff",boxShadow: "0 2px 8px rgba(0,0,0,0.2)", borderRadius: 3  }}>
              <CardContent>
                <Typography variant="h4" color="#2E7D32" fontWeight={700}>
                  {approvedExpenses.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved
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

        <Grid container spacing={3}>
          {/* Expense Form Section */}
          <Grid item xs={12} lg={5}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", backgroundColor: "white" }}>
              <Typography variant="h6" gutterBottom color="black">
                New Expense Form
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Fill in all required fields (*) to record a new expense
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ maxHeight: '70vh', overflowY: 'auto', pr: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Expense Date *"
                      type="date"
                      fullWidth
                      value={formData.expenseDate}
                      onChange={(e) => handleInputChange("expenseDate", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      margin="normal"
                      error={!!formErrors.expenseDate}
                      helperText={formErrors.expenseDate}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Priority *"
                      fullWidth
                      value={formData.priority}
                      onChange={(e) => handleInputChange("priority", e.target.value)}
                      margin="normal"
                    >
                      {priorities.map((p) => (
                        <MenuItem key={p.value} value={p.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PriorityHigh fontSize="small" color={p.color} />
                            {p.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      select
                      label="Expense Category *"
                      fullWidth
                      value={formData.expenseCategory}
                      onChange={(e) => handleInputChange("expenseCategory", e.target.value)}
                      margin="normal"
                      error={!!formErrors.expenseCategory}
                      helperText={formErrors.expenseCategory}
                    >
                      {expenseCategories.map((c) => (
                        <MenuItem key={c.value} value={c.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{c.icon}</span>
                            {c.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Amount (₱) *"
                      type="number"
                      fullWidth
                      value={formData.expenseAmount}
                      onChange={(e) => handleInputChange("expenseAmount", e.target.value)}
                      margin="normal"
                      error={!!formErrors.expenseAmount}
                      helperText={formErrors.expenseAmount}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₱</Typography>,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Currency"
                      fullWidth
                      value={formData.currency}
                      onChange={(e) => handleInputChange("currency", e.target.value)}
                      margin="normal"
                    >
                      {currencies.map((cur) => (
                        <MenuItem key={cur} value={cur}>{cur}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {formData.currency !== "PhP" && (
                    <Grid item xs={12}>
                      <TextField
                        label="Exchange Rate to PhP *"
                        type="number"
                        fullWidth
                        value={formData.exchangeRate}
                        onChange={(e) => handleInputChange("exchangeRate", e.target.value)}
                        margin="normal"
                        error={!!formErrors.exchangeRate}
                        helperText={formErrors.exchangeRate}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <TextField
                      label="Expense Description *"
                      multiline
                      rows={3}
                      fullWidth
                      value={formData.expenseDescription}
                      onChange={(e) => handleInputChange("expenseDescription", e.target.value)}
                      margin="normal"
                      error={!!formErrors.expenseDescription}
                      helperText={formErrors.expenseDescription}
                      placeholder="Provide detailed description of the expense..."
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Payment Method"
                      fullWidth
                      value={formData.paymentMethod}
                      onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                      margin="normal"
                    >
                      {paymentMethods.map((m) => (
                        <MenuItem key={m} value={m}>{m}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Charged To"
                      fullWidth
                      value={formData.chargedTo}
                      onChange={(e) => handleInputChange("chargedTo", e.target.value)}
                      margin="normal"
                    >
                      {chargedToOptions.map((o) => (
                        <MenuItem key={o} value={o}>{o}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Project Code"
                      fullWidth
                      value={formData.projectCode}
                      onChange={(e) => handleInputChange("projectCode", e.target.value)}
                      margin="normal"
                      placeholder="e.g., PROJ-2024-001"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Supplier ID"
                      fullWidth
                      value={formData.supplierId}
                      onChange={(e) => handleInputChange("supplierId", e.target.value)}
                      margin="normal"
                      placeholder="e.g., SUP-001"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        border: "1px dashed",
                        borderColor: "divider",
                        p: 2,
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" gutterBottom>
                        Upload Receipt/Invoice
                      </Typography>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUpload />}
                        sx={{ textTransform: "none" }}
                      >
                        Choose File
                        <input
                          type="file"
                          hidden
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={handleFileUpload}
                        />
                      </Button>
                      {receipt && (
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <AttachFile fontSize="small" />
                          <Typography variant="body2">
                            {receipt.fileName}
                          </Typography>
                          <Chip label="Uploaded" size="small" color="success" />
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      sx={{
                        mt: 2,
                        bgcolor: "#D32F2F",
                        "&:hover": { bgcolor: "#B71C1C" },
                        py: 1.5,
                        fontSize: "1.1rem",
                      }}
                      onClick={handleSaveExpense}
                    >
                      Submit for Approval
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Recent Expenses Section */}
          <Grid item xs={12} lg={7}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", height: "fit-content" }}>
              <Typography variant="h6" gutterBottom color="black">
                Recent Expenses
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Latest expense records
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {expenses.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Receipt sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No expenses recorded yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Submit your first expense using the form on the left
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell><strong>Amount</strong></TableCell>
                        <TableCell><strong>Priority</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Approver</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses.slice(0, 8).map((expense) => (
                        <TableRow key={expense.id} hover>
                          <TableCell>
                            <Typography variant="body2">
                              {expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                              {expense.expenseCategory}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} color="#D32F2F">
                              {formatAmount(expense.expenseAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={expense.priority} 
                              size="small" 
                              color={getPriorityColor(expense.priority)}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={expense.approvalStatus || "Pending"} 
                              size="small" 
                              color={getStatusColor(expense.approvalStatus)}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title={expense.autoAssignedApprover || approvers.find(a => a.id === expense.approver)?.name || "Unassigned"}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: "#D32F2F", fontSize: '0.8rem' }}>
                                <Person />
                              </Avatar>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              onClick={() => handleViewExpense(expense)}
                              size="small"
                              sx={{ 
                                color: "#D32F2F",
                                "&:hover": { bgcolor: "#FFF5F5" }
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* View Expense Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: "#FFF5F5", borderBottom: 1, borderColor: "#D32F2F" }}>
            <Typography variant="h6" color="#D32F2F">
              Expense Details - {viewExpense?.id}
            </Typography>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            {viewExpense && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Expense ID</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{viewExpense.id}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{viewExpense.expenseCategory}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                  <Typography variant="h6" color="#D32F2F" sx={{ mb: 2 }}>
                    {formatAmount(viewExpense.expenseAmount)}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {viewExpense.expenseDate ? new Date(viewExpense.expenseDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Approval Status</Typography>
                  <Chip
                    label={viewExpense.approvalStatus || "Pending"}
                    color={getStatusColor(viewExpense.approvalStatus)}
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                  <Chip
                    label={viewExpense.priority}
                    color={getPriorityColor(viewExpense.priority)}
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="subtitle2" color="text.secondary">Assigned Approver</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {viewExpense.autoAssignedApprover || approvers.find(a => a.id === viewExpense.approver)?.name || "Unassigned"}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Submitted By</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{viewExpense.submittedBy}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1" sx={{ mb: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
                    {viewExpense.expenseDescription}
                  </Typography>
                </Grid>

                {viewExpense.receipt && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Receipt</Typography>
                    <Box sx={{ mt: 1, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                      <img
                        src={viewExpense.receipt.data}
                        alt="Receipt"
                        style={{
                          width: "100%",
                          maxHeight: 300,
                          objectFit: "contain",
                          borderRadius: 8,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {viewExpense.receipt.fileName}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              sx={{ 
                borderColor: "#D32F2F", 
                color: "#D32F2F",
                "&:hover": { bgcolor: "#FFF5F5" }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

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