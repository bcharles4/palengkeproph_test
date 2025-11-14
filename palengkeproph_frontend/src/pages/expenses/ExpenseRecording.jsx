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
} from "@mui/material";
import {
  Home as HomeIcon,
  AttachFile,
  Visibility,
  CloudUpload,
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
  });

  const [receipt, setReceipt] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewExpense, setViewExpense] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const expenseCategories = [
    "Supplies",
    "Security Agencies",
    "Land Lease Rent",
    "Cleaning Equipment",
    "Building Maintenance",
    "Payroll (Full-time employees)",
    "Payroll (Part-time employees)",
    "Consultants",
    "Auditors",
    "Capital Equipment",
    "Outside Labor",
    "Materials",
    "Utilities (Water)",
    "Utilities (Cell Phone)",
    "Utilities (Electricity)",
    "Lease Rentals",
    "Other",
  ];

  const paymentMethods = [
    "Cash",
    "Check",
    "Bank Transfer",
    "Credit Card",
    "Digital Payment",
  ];
  const chargedToOptions = ["Tenant", "Sister Company", "Assigned Project"];
  const approvalStatuses = ["Pending", "Approved", "Rejected", "Under Review"];
  const currencies = ["PhP", "USD", "EUR", "GBP", "AUD", "Other"];

  useEffect(() => {
    const storedExpenses = JSON.parse(localStorage.getItem("expenses"));
    if (storedExpenses && storedExpenses.length > 0) {
      setExpenses(storedExpenses);
    } else {
      setExpenses([]);
    }
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      });
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const required = [
      "expenseDate",
      "expenseCategory",
      "expenseAmount",
      "expenseDescription",
    ];
    const missing = required.filter((f) => !formData[f]);
    if (missing.length > 0) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields",
        severity: "warning",
      });
      return false;
    }
    if (formData.currency !== "PhP" && !formData.exchangeRate) {
      setSnackbar({
        open: true,
        message: "Exchange rate is required for non-PhP currencies",
        severity: "warning",
      });
      return false;
    }
    return true;
  };

  const handleSaveExpense = () => {
    if (!validateForm()) return;

    const newExpense = {
      id: `EXP-${Date.now()}`,
      ...formData,
      receipt,
      createdAt: new Date().toISOString(),
      expenseAmount: parseFloat(formData.expenseAmount) || 0,
      exchangeRate: parseFloat(formData.exchangeRate) || 1,
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

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
    });
    setReceipt(null);

    setSnackbar({
      open: true,
      message: "Expense recorded successfully!",
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

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + (parseFloat(expense?.expenseAmount) || 0),
    0
  );

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
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
            <Typography color="text.primary">Expense Recording</Typography>
          </Breadcrumbs>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Expense Recording
            </Typography>
            <Typography color="text.secondary">
              Record and categorize expenses with detailed information
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* ✅ LEFT COLUMN - Expense Form (Wider & Centered) */}
          <Grid item xs={12} md={4} lg={2}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                backgroundColor: "white",
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Record New Expense
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Fill in all required fields (*) to record a new expense
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 2, color: "#D32F2F" }}
                  >
                    Basic Information
                  </Typography>

                  <TextField
                    label="Expense Date *"
                    type="date"
                    fullWidth
                    value={formData.expenseDate}
                    onChange={(e) =>
                      handleInputChange("expenseDate", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                  />

                  <TextField
                    select
                    label="Expense Category *"
                    fullWidth
                    value={formData.expenseCategory}
                    onChange={(e) =>
                      handleInputChange("expenseCategory", e.target.value)
                    }
                    margin="normal"
                  >
                    {expenseCategories.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Amount *"
                    type="number"
                    fullWidth
                    value={formData.expenseAmount}
                    onChange={(e) =>
                      handleInputChange("expenseAmount", e.target.value)
                    }
                    margin="normal"
                  />

                  <TextField
                    select
                    label="Currency"
                    fullWidth
                    value={formData.currency}
                    onChange={(e) =>
                      handleInputChange("currency", e.target.value)
                    }
                    margin="normal"
                  >
                    {currencies.map((cur) => (
                      <MenuItem key={cur} value={cur}>
                        {cur}
                      </MenuItem>
                    ))}
                  </TextField>

                  {formData.currency !== "PhP" && (
                    <TextField
                      label="Exchange Rate"
                      type="number"
                      fullWidth
                      value={formData.exchangeRate}
                      onChange={(e) =>
                        handleInputChange("exchangeRate", e.target.value)
                      }
                      margin="normal"
                    />
                  )}

                  <TextField
                    label="Expense Description *"
                    multiline
                    rows={3}
                    fullWidth
                    value={formData.expenseDescription}
                    onChange={(e) =>
                      handleInputChange("expenseDescription", e.target.value)
                    }
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 2, color: "#D32F2F" }}
                  >
                    Payment & Approval
                  </Typography>

                  <TextField
                    select
                    label="Payment Method"
                    fullWidth
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      handleInputChange("paymentMethod", e.target.value)
                    }
                    margin="normal"
                  >
                    {paymentMethods.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Payment Status"
                    fullWidth
                    value={formData.paymentStatus}
                    onChange={(e) =>
                      handleInputChange("paymentStatus", e.target.value)
                    }
                    margin="normal"
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Overdue">Overdue</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Charged To"
                    fullWidth
                    value={formData.chargedTo}
                    onChange={(e) =>
                      handleInputChange("chargedTo", e.target.value)
                    }
                    margin="normal"
                  >
                    {chargedToOptions.map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Project Code"
                    fullWidth
                    value={formData.projectCode}
                    onChange={(e) =>
                      handleInputChange("projectCode", e.target.value)
                    }
                    margin="normal"
                  />

                  <TextField
                    select
                    label="Approval Status"
                    fullWidth
                    value={formData.approvalStatus}
                    onChange={(e) =>
                      handleInputChange("approvalStatus", e.target.value)
                    }
                    margin="normal"
                  >
                    {approvalStatuses.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Approver"
                    fullWidth
                    value={formData.approver}
                    onChange={(e) =>
                      handleInputChange("approver", e.target.value)
                    }
                    margin="normal"
                  />

                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mt: 2, mb: 1, color: "#D32F2F" }}
                  >
                    Additional Details
                  </Typography>

                  <TextField
                    label="Due Date"
                    type="date"
                    fullWidth
                    value={formData.dueDate}
                    onChange={(e) =>
                      handleInputChange("dueDate", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                  />

                  <TextField
                    label="Supplier ID"
                    fullWidth
                    value={formData.supplierId}
                    onChange={(e) =>
                      handleInputChange("supplierId", e.target.value)
                    }
                    margin="normal"
                  />

                  <TextField
                    label="Check Request Date"
                    type="date"
                    fullWidth
                    value={formData.checkRequestDate}
                    onChange={(e) =>
                      handleInputChange("checkRequestDate", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                  />

                  <TextField
                    label="Check Release Date"
                    type="date"
                    fullWidth
                    value={formData.checkReleaseDate}
                    onChange={(e) =>
                      handleInputChange("checkReleaseDate", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
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
                    Record Expense
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* ✅ RIGHT COLUMN - Recent Expenses */}
          <Grid item xs={12} md={8} lg={10}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                height: "fit-content",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Recent Expenses
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Latest 5 expense records
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {expenses.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  No expenses recorded yet
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>Date</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Category</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Amount</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Status</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Actions</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses.slice(0, 5).map((expense) => (
                        <TableRow key={expense.id} hover>
                          <TableCell>
                            {expense.expenseDate
                              ? new Date(
                                  expense.expenseDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ maxWidth: 120 }}
                            >
                              {expense.expenseCategory || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={600}>
                              {formatAmount(expense.expenseAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={expense.approvalStatus || "Pending"}
                              size="small"
                              color={
                                expense.approvalStatus === "Approved"
                                  ? "success"
                                  : expense.approvalStatus === "Rejected"
                                  ? "error"
                                  : "warning"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => handleViewExpense(expense)}
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

              <Divider sx={{ mt: 3, mb: 2 }} />
              <Typography variant="subtitle2" align="right" fontWeight={700}>
                Total: {formatAmount(totalExpenses)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* ✅ VIEW DIALOG */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: "#D32F2F", color: "white" }}>
            Expense Details
          </DialogTitle>
          <DialogContent dividers>
            {viewExpense ? (
              <Box>
                <Typography>
                  <strong>Category:</strong> {viewExpense.expenseCategory}
                </Typography>
                <Typography>
                  <strong>Amount:</strong> {formatAmount(viewExpense.expenseAmount)}
                </Typography>
                <Typography>
                  <strong>Description:</strong> {viewExpense.expenseDescription}
                </Typography>
                <Typography>
                  <strong>Payment Method:</strong> {viewExpense.paymentMethod}
                </Typography>
                <Typography>
                  <strong>Approval Status:</strong> {viewExpense.approvalStatus}
                </Typography>
                {viewExpense.receipt && (
                  <Box mt={2}>
                    <Typography fontWeight={600}>Attached Receipt:</Typography>
                    <Button
                      href={viewExpense.receipt.data}
                      target="_blank"
                      startIcon={<AttachFile />}
                      sx={{ textTransform: "none" }}
                    >
                      {viewExpense.receipt.fileName}
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography>No data available</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* ✅ SNACKBAR ALERT */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}
