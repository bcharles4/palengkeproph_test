import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
  Alert,
  Divider,
  Card,
  CardContent,
  InputAdornment,
} from "@mui/material";
import {
  NavigateNext,
  Home as HomeIcon,
  Person,
  Business,
  CalendarToday,
  Phone,
  Email,
  LocationOn,
  AttachMoney,
  Description,
  ReceiptLong,
} from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";

export default function LeaseCreation() {
  const navigate = useNavigate();
  const [leaseData, setLeaseData] = useState({
    tenantName: "",
    tenantBusinessName: "",
    tenantContact: "",
    tenantEmail: "",
    tenantAddress: "",
    stallId: "",
    leaseStart: "",
    leaseEnd: "",
    monthlyRate: "",
    securityDeposit: "",
    paymentTerms: "Monthly",
    remarks: "",
  });

  const [stalls, setStalls] = useState([]);
  const [availableStalls, setAvailableStalls] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load available stalls
  useEffect(() => {
    const loadStalls = () => {
      const storedStalls = JSON.parse(localStorage.getItem("stalls")) || [];
      const existingLeases = JSON.parse(localStorage.getItem("leases")) || [];
      
      // Filter out stalls that are already leased (active leases only)
      const leasedStallIds = existingLeases
        .filter(lease => lease.status === "Active")
        .map(lease => lease.stallId);
      
      const available = storedStalls.filter(stall => 
        !leasedStallIds.includes(stall.id)
      );
      
      setStalls(storedStalls);
      setAvailableStalls(available);
    };

    loadStalls();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-calculate end date when start date is selected
    if (name === "leaseStart" && value) {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1); // Default 1 year lease
      
      setLeaseData(prev => ({
        ...prev,
        leaseStart: value,
        leaseEnd: endDate.toISOString().split('T')[0]
      }));
    } else {
      setLeaseData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const requiredFields = [
      'tenantName', 'tenantBusinessName', 'stallId', 'leaseStart', 
      'leaseEnd', 'monthlyRate'
    ];
    
    const missingFields = requiredFields.filter(field => !leaseData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    setPreviewOpen(true);
  };

  const handleConfirmLease = () => {
    // Generate unique lease ID
    const leaseId = `LEASE-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const newLease = {
      ...leaseData,
      id: leaseId,
      status: "Pending Approval",
      dateCreated: new Date().toISOString(),
      dateRequested: new Date().toISOString(),
      createdBy: "Staff",
      tenantId: "",
      
      // Tenant information
      tenantInfo: {
        name: leaseData.tenantName,
        business: leaseData.tenantBusinessName,
        contact: leaseData.tenantContact,
        email: leaseData.tenantEmail,
        address: leaseData.tenantAddress,
      },
      
      // Payment info
      paymentStatus: "Pending",
      balance: leaseData.monthlyRate,
    };

    // Save to pending leases
    const pendingLeases = JSON.parse(localStorage.getItem("leaseRequests")) || [];
    const updatedPending = [...pendingLeases, newLease];
    localStorage.setItem("leaseRequests", JSON.stringify(updatedPending));
    
    // Also save to all leases for tracking
    const allLeases = JSON.parse(localStorage.getItem("leases")) || [];
    const updatedAllLeases = [...allLeases, newLease];
    localStorage.setItem("leases", JSON.stringify(updatedAllLeases));
    
    setPreviewOpen(false);
    
    alert("Lease request submitted successfully! Awaiting approval.");
    
    // Reset form
    setLeaseData({
      tenantName: "",
      tenantBusinessName: "",
      tenantContact: "",
      tenantEmail: "",
      tenantAddress: "",
      stallId: "",
      leaseStart: "",
      leaseEnd: "",
      monthlyRate: "",
      securityDeposit: "",
      paymentTerms: "Monthly",
      remarks: "",
    });
    
    navigate("/lease-approval-list");
  };

  const selectedStall = stalls.find(s => s.id === leaseData.stallId);

  return (
    <MainLayout>
      <Box sx={{ p: 4 }}>
        {/* Breadcrumbs Section */}
        <Breadcrumbs 
          separator={<NavigateNext fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 3 }}
        >
          <Link
            underline="hover"
            color="inherit"
            href="/dashboard"
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              '&:hover': {
                color: '#D32F2F'
              }
            }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/lease-records"
            sx={{ 
              '&:hover': {
                color: '#D32F2F'
              }
            }}
          >
            Lease Records
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 500 }}>
            Create New Lease
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight={700} gutterBottom>
          Create New Lease
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Enter tenant information and lease details. Tenant ID will be generated upon approval.
        </Typography>

        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
          <form onSubmit={handleSubmit}>
            
            {/* SECTION 1: Tenant Information */}
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, color: '#D32F2F', display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1 }} />
                  Tenant Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tenant Name *"
                      name="tenantName"
                      value={leaseData.tenantName}
                      onChange={handleChange}
                      size="small"
                      required
                      placeholder="Enter full name"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Business Name *"
                      name="tenantBusinessName"
                      value={leaseData.tenantBusinessName}
                      onChange={handleChange}
                      size="small"
                      required
                      placeholder="Enter Business Name"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact Number"
                      name="tenantContact"
                      value={leaseData.tenantContact}
                      onChange={handleChange}
                      size="small"
                      placeholder="09XXXXXXXXX"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="tenantEmail"
                      value={leaseData.tenantEmail}
                      onChange={handleChange}
                      size="small"
                      type="email"
                      placeholder="email@example.com"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="tenantAddress"
                      value={leaseData.tenantAddress}
                      onChange={handleChange}
                      size="small"
                      placeholder="Complete address"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* SECTION 2: Stall Information */}
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, color: '#D32F2F', display: 'flex', alignItems: 'center' }}>
                  <Business sx={{ mr: 1 }} />
                  Stall Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Select Stall *"
                      name="stallId"
                      value={leaseData.stallId}
                      onChange={handleChange}
                      size="small"
                      required
                    >
                      <MenuItem value="">
                        <em>Select a stall</em>
                      </MenuItem>
                      {availableStalls.map((stall) => (
                        <MenuItem key={stall.id} value={stall.id}>
                          {stall.id} - {stall.type || 'Stall'} (₱{stall.rate || '0'}/month)
                        </MenuItem>
                      ))}
                    </TextField>
                    {availableStalls.length === 0 && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        No available stalls. Please add stalls first.
                      </Alert>
                    )}
                  </Grid>
                  
                  {selectedStall && (
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', height: '100%' }}>
                        <Typography variant="subtitle2" gutterBottom color="primary">
                          Selected Stall Details:
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2">
                            <strong>Type:</strong> {selectedStall.type || 'Standard'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Size:</strong> {selectedStall.size || 'N/A'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Location:</strong> {selectedStall.location || 'N/A'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Base Rate:</strong> ₱{selectedStall.rate || '0'}/month
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* SECTION 3: Lease Terms */}
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, color: '#D32F2F', display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ mr: 1 }} />
                  Lease Terms
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Lease Start Date *"
                      type="date"
                      name="leaseStart"
                      value={leaseData.leaseStart}
                      onChange={handleChange}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Lease End Date *"
                      type="date"
                      name="leaseEnd"
                      value={leaseData.leaseEnd}
                      onChange={handleChange}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Monthly Rate (₱) *"
                      name="monthlyRate"
                      value={leaseData.monthlyRate}
                      onChange={handleChange}
                      size="small"
                      type="number"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Security Deposit (₱)"
                      name="securityDeposit"
                      value={leaseData.securityDeposit}
                      onChange={handleChange}
                      size="small"
                      type="number"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ReceiptLong fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Payment Terms"
                      name="paymentTerms"
                      value={leaseData.paymentTerms}
                      onChange={handleChange}
                      size="small"
                    >
                      <MenuItem value="Daily">Daily</MenuItem>
                      <MenuItem value="Weekly">Weekly</MenuItem>
                      <MenuItem value="Monthly">Monthly</MenuItem>
                      <MenuItem value="Quarterly">Quarterly</MenuItem>
                      <MenuItem value="Semi-Annual">Semi-Annual</MenuItem>
                      <MenuItem value="Annual">Annual</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* SECTION 4: Additional Information */}
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, color: '#D32F2F', display: 'flex', alignItems: 'center' }}>
                  <Description sx={{ mr: 1 }} />
                  Additional Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Remarks / Special Conditions"
                      name="remarks"
                      value={leaseData.remarks}
                      onChange={handleChange}
                      size="small"
                      multiline
                      rows={4}
                      placeholder="Any special terms, conditions, or notes..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Submit Section */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/lease-approval")}
                size="large"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "#D32F2F",
                  "&:hover": { bgcolor: "#B71C1C" },
                  minWidth: '200px'
                }}
              >
                Submit for Approval
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: "#D32F2F", color: "white" }}>
          Lease Request Preview
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            New Lease Request
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Tenant Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography><strong>Name:</strong> {leaseData.tenantName}</Typography>
                  <Typography><strong>Business:</strong> {leaseData.tenantBusinessName}</Typography>
                  {leaseData.tenantContact && (
                    <Typography><strong>Contact:</strong> {leaseData.tenantContact}</Typography>
                  )}
                  {leaseData.tenantEmail && (
                    <Typography><strong>Email:</strong> {leaseData.tenantEmail}</Typography>
                  )}
                  {leaseData.tenantAddress && (
                    <Typography><strong>Address:</strong> {leaseData.tenantAddress}</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Lease Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography><strong>Stall:</strong> {leaseData.stallId}</Typography>
                  <Typography><strong>Start:</strong> {leaseData.leaseStart}</Typography>
                  <Typography><strong>End:</strong> {leaseData.leaseEnd}</Typography>
                  <Typography><strong>Monthly Rate:</strong> ₱{leaseData.monthlyRate}</Typography>
                  {leaseData.securityDeposit && (
                    <Typography><strong>Security Deposit:</strong> ₱{leaseData.securityDeposit}</Typography>
                  )}
                  <Typography><strong>Payment Terms:</strong> {leaseData.paymentTerms}</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          {leaseData.remarks && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Remarks
              </Typography>
              <Typography>{leaseData.remarks}</Typography>
            </Paper>
          )}
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> This lease request will be submitted for approval. 
              After approval, a Tenant ID will be automatically generated for this tenant.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPreviewOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
            onClick={handleConfirmLease}
          >
            Submit for Approval
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}