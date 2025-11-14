// src/pages/management/LoanManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
  Button,
  Stack,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from "@mui/material";
import {
  Home as HomeIcon,
  RequestQuote as LoanIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";

// Mock data
const initialApplications = [
  {
    id: "APP-001",
    applicantName: "Juan Dela Cruz",
    stallNumber: "S-101",
    loanAmount: 50000,
    purpose: "Business Expansion",
    repaymentMonths: 12,
    status: "pending",
    applicationDate: "2024-01-15",
    monthlyIncome: 25000,
  },
  {
    id: "APP-002",
    applicantName: "Maria Santos",
    stallNumber: "F-205",
    loanAmount: 30000,
    purpose: "Equipment Purchase",
    repaymentMonths: 6,
    status: "approved",
    applicationDate: "2024-01-10",
    monthlyIncome: 18000,
  },
  {
    id: "APP-003",
    applicantName: "Pedro Reyes",
    stallNumber: "V-156",
    loanAmount: 75000,
    purpose: "Inventory Restock",
    repaymentMonths: 18,
    status: "rejected",
    applicationDate: "2024-01-08",
    monthlyIncome: 22000,
  },
];

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9).toUpperCase();
}

export default function LoanManagement() {
  const [tab, setTab] = useState(0);
  const [applications, setApplications] = useState(initialApplications);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);

  // Loan Application Form State
  const [applicationForm, setApplicationForm] = useState({
    applicantName: "",
    stallNumber: "",
    monthlyIncome: "",
    loanAmount: "",
    purpose: "",
    repaymentMonths: 12,
    termsAgreed: false,
  });

  // Load from localStorage
  useEffect(() => {
    const savedApps = JSON.parse(localStorage.getItem("loanApplications")) || initialApplications;
    setApplications(savedApps);
  }, []);

  // Save to localStorage
  const saveApplications = (apps) => {
    setApplications(apps);
    localStorage.setItem("loanApplications", JSON.stringify(apps));
  };

  const handleApplicationSubmit = (e) => {
    e.preventDefault();
    const newApplication = {
      id: uid("APP-"),
      ...applicationForm,
      status: "pending",
      applicationDate: new Date().toISOString().split('T')[0],
      monthlyIncome: parseFloat(applicationForm.monthlyIncome),
      loanAmount: parseFloat(applicationForm.loanAmount),
    };

    const updatedApplications = [newApplication, ...applications];
    saveApplications(updatedApplications);

    // Reset form
    setApplicationForm({
      applicantName: "",
      stallNumber: "",
      monthlyIncome: "",
      loanAmount: "",
      purpose: "",
      repaymentMonths: 12,
      termsAgreed: false,
    });

    alert("Loan application submitted successfully!");
  };

  const handleApplicationChange = (field, value) => {
    setApplicationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApproveReject = (applicationId, status) => {
    const updatedApplications = applications.map(app =>
      app.id === applicationId ? { ...app, status } : app
    );
    saveApplications(updatedApplications);
    setApprovalDialogOpen(false);
    alert(`Application ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
  };

  const openApprovalDialog = (application) => {
    setSelectedApplication(application);
    setApprovalDialogOpen(true);
  };

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  return (
    <MainLayout>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/dashboard" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <HomeIcon fontSize="small" /> Dashboard
          </Link>
          <Typography color="text.primary">Loan Management</Typography>
        </Breadcrumbs>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Loan Management</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export Data
          </Button>
          <Button variant="contained" sx={{ bgcolor: "#D32F2F" }} startIcon={<PrintIcon />}>
            Print
          </Button>
        </Stack>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography color="text.secondary">Total Applications</Typography>
              <Typography variant="h4" sx={{ color: "#000", fontWeight: 700 }}>{applications.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography color="text.secondary">Pending Review</Typography>
              <Typography variant="h4" sx={{ color: "#D32F2F", fontWeight: 700 }}>{pendingApplications.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography color="text.secondary">Approved</Typography>
              <Typography variant="h4" sx={{ color: "#2E7D32", fontWeight: 700 }}>{approvedApplications.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography color="text.secondary">Rejected</Typography>
              <Typography variant="h4" sx={{ color: "#D32F2F", fontWeight: 700 }}>{rejectedApplications.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)} 
          aria-label="loan-management-tabs"
          sx={{ 
            mb: 2,
            '& .MuiTab-root': {
              fontWeight: 600,
            }
          }}
        >
          <Tab icon={<AddIcon />} label="Loan Application" />
          <Tab icon={<ViewIcon />} label="Approval Dashboard" />
          <Tab icon={<BusinessIcon />} label="Approved Loans" />
        </Tabs>

        <Divider sx={{ mb: 3 }} />

        {/* Loan Application Tab */}
        {tab === 0 && (
          <Box component="form" onSubmit={handleApplicationSubmit}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>New Loan Application</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Applicant Name"
                  value={applicationForm.applicantName}
                  onChange={(e) => handleApplicationChange('applicantName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Stall Number"
                  value={applicationForm.stallNumber}
                  onChange={(e) => handleApplicationChange('stallNumber', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Monthly Income (₱)"
                  type="number"
                  value={applicationForm.monthlyIncome}
                  onChange={(e) => handleApplicationChange('monthlyIncome', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Loan Amount (₱)"
                  type="number"
                  value={applicationForm.loanAmount}
                  onChange={(e) => handleApplicationChange('loanAmount', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Loan Purpose"
                  value={applicationForm.purpose}
                  onChange={(e) => handleApplicationChange('purpose', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Repayment Period</InputLabel>
                  <Select
                    value={applicationForm.repaymentMonths}
                    label="Repayment Period"
                    onChange={(e) => handleApplicationChange('repaymentMonths', e.target.value)}
                  >
                    <MenuItem value={6}>6 Months</MenuItem>
                    <MenuItem value={12}>12 Months</MenuItem>
                    <MenuItem value={18}>18 Months</MenuItem>
                    <MenuItem value={24}>24 Months</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={applicationForm.termsAgreed}
                        onChange={(e) => handleApplicationChange('termsAgreed', e.target.checked)}
                      />
                    }
                    label="I agree to the terms and conditions of the loan agreement"
                  />
                </FormGroup>
              </Grid>
              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  sx={{ bgcolor: "#D32F2F" }}
                  disabled={!applicationForm.termsAgreed}
                >
                  Submit Application
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Approval Dashboard Tab */}
        {tab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Pending Loan Applications</Typography>
            
            {pendingApplications.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No pending applications
              </Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell><b>Application ID</b></TableCell>
                      <TableCell><b>Applicant</b></TableCell>
                      <TableCell><b>Stall</b></TableCell>
                      <TableCell align="right"><b>Amount (₱)</b></TableCell>
                      <TableCell><b>Purpose</b></TableCell>
                      <TableCell><b>Application Date</b></TableCell>
                      <TableCell><b>Actions</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.id}</TableCell>
                        <TableCell>{app.applicantName}</TableCell>
                        <TableCell>{app.stallNumber}</TableCell>
                        <TableCell align="right">{app.loanAmount.toLocaleString()}</TableCell>
                        <TableCell>{app.purpose}</TableCell>
                        <TableCell>{app.applicationDate}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => openApprovalDialog(app)}
                            >
                              Review
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Approved Loans Tab */}
        {tab === 2 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Approved Loans</Typography>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell><b>Application ID</b></TableCell>
                    <TableCell><b>Applicant</b></TableCell>
                    <TableCell><b>Stall</b></TableCell>
                    <TableCell align="right"><b>Amount (₱)</b></TableCell>
                    <TableCell><b>Purpose</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>{app.id}</TableCell>
                      <TableCell>{app.applicantName}</TableCell>
                      <TableCell>{app.stallNumber}</TableCell>
                      <TableCell align="right">{app.loanAmount.toLocaleString()}</TableCell>
                      <TableCell>{app.purpose}</TableCell>
                      <TableCell>
                        <Chip
                          label={app.status}
                          color={
                            app.status === 'approved' ? 'success' :
                            app.status === 'rejected' ? 'error' : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Review Loan Application</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Application ID</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedApplication.id}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Applicant</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedApplication.applicantName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Stall Number</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedApplication.stallNumber}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Monthly Income</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>₱{selectedApplication.monthlyIncome.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Loan Amount</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: "#D32F2F" }}>
                  ₱{selectedApplication.loanAmount.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Repayment Period</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedApplication.repaymentMonths} months</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Purpose</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedApplication.purpose}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => handleApproveReject(selectedApplication?.id, 'rejected')}
            color="error"
            startIcon={<RejectIcon />}
          >
            Reject
          </Button>
          <Button 
            onClick={() => handleApproveReject(selectedApplication?.id, 'approved')}
            variant="contained"
            sx={{ bgcolor: "#2E7D32" }}
            startIcon={<ApproveIcon />}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}