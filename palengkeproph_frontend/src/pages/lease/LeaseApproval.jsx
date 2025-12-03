import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
  Chip,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Home as HomeIcon,
  NavigateNext,
  Person,
  Business,
  CalendarToday,
  AttachMoney,
  CheckCircle,
  Cancel,
  FileCopy,
  Email,
  Phone,
  LocationOn,
  ArrowBack,
  Delete,
  Visibility,
} from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";
import { useParams, useNavigate } from "react-router-dom";

export default function LeaseApproval() {
  const { leaseId } = useParams();
  const navigate = useNavigate();
  const [leaseRequest, setLeaseRequest] = useState(null);
  const [validId, setValidId] = useState(null);
  const [businessPermit, setBusinessPermit] = useState(null);
  const [barangayPermit, setBarangayPermit] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [generatedTenantId, setGeneratedTenantId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaseRequest = () => {
      setLoading(true);
      const leaseRequests = JSON.parse(localStorage.getItem("leaseRequests")) || [];
      const foundLease = leaseRequests.find(lease => lease.id === leaseId);
      
      if (foundLease) {
        setLeaseRequest(foundLease);
        // Load existing documents if any
        if (foundLease.documents) {
          setValidId(foundLease.documents.validId || null);
          setBusinessPermit(foundLease.documents.businessPermit || null);
          setBarangayPermit(foundLease.documents.barangayPermit || null);
        }
      } else {
        navigate("/lease-approval-list");
      }
      setLoading(false);
    };

    loadLeaseRequest();
  }, [leaseId, navigate]);

  const generateTenantId = () => {
    const currentYear = new Date().getFullYear();
    // Get existing tenant IDs to ensure uniqueness
    const tenants = JSON.parse(localStorage.getItem("tenants")) || [];
    let newTenantId;
    let isUnique = false;
    
    while (!isUnique) {
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      newTenantId = `TEN-${currentYear}-${randomNum}`;
      isUnique = !tenants.some(tenant => tenant.id === newTenantId);
    }
    
    setGeneratedTenantId(newTenantId);
    return newTenantId;
  };

  const handleFileUpload = (setter, event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload only JPG, PNG, or PDF files");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setter({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        content: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (setter) => {
    setter(null);
  };

  const handleApprove = () => {
    if (!validId) {
      alert("Valid ID is required for approval.");
      return;
    }

    // Generate Tenant ID
    const tenantId = generateTenantId();
    
    // Create tenant record
    const newTenant = {
      id: tenantId,
      name: leaseRequest.tenantName,
      contact: leaseRequest.tenantContact || "",
      email: leaseRequest.tenantEmail || "",
      address: leaseRequest.tenantAddress || "",
      dateRegistered: new Date().toISOString(),
      status: "Active",
      stallId: leaseRequest.stallId,
      leaseStart: leaseRequest.leaseStart,
      leaseEnd: leaseRequest.leaseEnd,
      monthlyRate: leaseRequest.monthlyRate,
      documents: {
        validId: validId,
        businessPermit: businessPermit,
        barangayPermit: barangayPermit,
      }
    };

    // Save tenant to database
    const tenants = JSON.parse(localStorage.getItem("tenants")) || [];
    const updatedTenants = [...tenants, newTenant];
    localStorage.setItem("tenants", JSON.stringify(updatedTenants));

    // Update lease request with tenant ID and status
    const leaseRequests = JSON.parse(localStorage.getItem("leaseRequests")) || [];
    const updatedRequests = leaseRequests.map(lease => {
      if (lease.id === leaseId) {
        return {
          ...lease,
          status: "Approved",
          tenantId: tenantId,
          approvedBy: "Admin",
          approvedDate: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          documents: {
            validId: validId,
            businessPermit: businessPermit,
            barangayPermit: barangayPermit,
          }
        };
      }
      return lease;
    });

    // Save updated lease requests
    localStorage.setItem("leaseRequests", JSON.stringify(updatedRequests));

    // Add to approved leases
    const approvedLease = updatedRequests.find(lease => lease.id === leaseId);
    const approvedLeases = JSON.parse(localStorage.getItem("approvedLeases")) || [];
    const updatedApprovedLeases = [...approvedLeases, approvedLease];
    localStorage.setItem("approvedLeases", JSON.stringify(updatedApprovedLeases));

    // Update all leases
    const allLeases = JSON.parse(localStorage.getItem("leases")) || [];
    const updatedAllLeases = allLeases.map(lease => {
      if (lease.id === leaseId) {
        return {
          ...lease,
          status: "Active",
          tenantId: tenantId,
          approvedBy: "Admin",
          approvedDate: new Date().toISOString(),
        };
      }
      return lease;
    });
    localStorage.setItem("leases", JSON.stringify(updatedAllLeases));

    setApproveDialogOpen(false);
    setLeaseRequest(prev => ({ 
      ...prev, 
      status: "Approved",
      tenantId: tenantId 
    }));

    alert(`Lease approved! Tenant ID generated: ${tenantId}`);
    
    // Redirect after 2 seconds
    setTimeout(() => {
      navigate("/lease-approval-list");
    }, 2000);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    const leaseRequests = JSON.parse(localStorage.getItem("leaseRequests")) || [];
    const updatedRequests = leaseRequests.map(lease => {
      if (lease.id === leaseId) {
        return {
          ...lease,
          status: "Rejected",
          rejectionReason: rejectionReason,
          rejectedDate: new Date().toISOString(),
          rejectedBy: "Admin"
        };
      }
      return lease;
    });

    localStorage.setItem("leaseRequests", JSON.stringify(updatedRequests));

    // Update all leases
    const allLeases = JSON.parse(localStorage.getItem("leases")) || [];
    const updatedAllLeases = allLeases.map(lease => {
      if (lease.id === leaseId) {
        return {
          ...lease,
          status: "Rejected",
          rejectionReason: rejectionReason,
        };
      }
      return lease;
    });
    localStorage.setItem("leases", JSON.stringify(updatedAllLeases));

    setLeaseRequest(prev => ({ 
      ...prev, 
      status: "Rejected",
      rejectionReason: rejectionReason
    }));
    setRejectDialogOpen(false);
    setRejectionReason("");
    
    alert("Lease request rejected.");
    
    // Redirect after 2 seconds
    setTimeout(() => {
      navigate("/lease-approval-list");
    }, 2000);
  };

  const handleViewDocument = (file) => {
    if (!file) return;
    
    if (file.fileType === "application/pdf") {
      // For PDF, open in new tab
      const pdfWindow = window.open();
      pdfWindow.document.write(`
        <iframe width="100%" height="100%" src="${file.content}" style="border: none;"></iframe>
      `);
    } else {
      // For images, open in new tab
      const imageWindow = window.open();
      imageWindow.document.write(`
        <img src="${file.content}" style="max-width: 100%; max-height: 100%;" />
      `);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!leaseRequest) {
    return (
      <MainLayout>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Lease request not found.
          </Alert>
          <Button variant="outlined" onClick={() => navigate("/lease-approval-list")}>
            Back to Approval List
          </Button>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" href="/dashboard">
            <HomeIcon sx={{ mr: 0.5 }} /> Dashboard
          </Link>
          <Link underline="hover" color="inherit" href="/lease-approval-list">
            Lease Approval
          </Link>
          <Typography color="text.primary">{leaseId}</Typography>
        </Breadcrumbs>

        {/* Header with back button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <IconButton onClick={() => navigate("/lease-approval-list")}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Lease Approval
            </Typography>
            <Typography color="text.secondary">
              Review and process lease request
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column - Lease Details */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Lease Request Details
                </Typography>
                <Chip 
                  label={leaseRequest.status} 
                  color={
                    leaseRequest.status === "Pending Approval" ? "warning" :
                    leaseRequest.status === "Approved" ? "success" :
                    leaseRequest.status === "Rejected" ? "error" : "default"
                  }
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Typography variant="subtitle1" gutterBottom sx={{ color: '#D32F2F' }}>
                Tenant Information
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person sx={{ mr: 1, color: '#D32F2F' }} />
                    <Typography variant="h6">{leaseRequest.tenantName}</Typography>
                  </Box>
                </Grid>
                {leaseRequest.tenantContact && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone sx={{ mr: 1, fontSize: 16 }} />
                      <Typography>{leaseRequest.tenantContact}</Typography>
                    </Box>
                  </Grid>
                )}
                {leaseRequest.tenantEmail && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ mr: 1, fontSize: 16 }} />
                      <Typography>{leaseRequest.tenantEmail}</Typography>
                    </Box>
                  </Grid>
                )}
                {leaseRequest.tenantAddress && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <LocationOn sx={{ mr: 1, mt: 0.5, fontSize: 16 }} />
                      <Typography>{leaseRequest.tenantAddress}</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              <Typography variant="subtitle1" gutterBottom sx={{ color: '#D32F2F' }}>
                Lease Terms
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Lease ID</Typography>
                  <Typography fontWeight={500}>{leaseRequest.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Stall</Typography>
                  <Typography fontWeight={500}>{leaseRequest.stallId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Start Date</Typography>
                  <Typography fontWeight={500}>{leaseRequest.leaseStart}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">End Date</Typography>
                  <Typography fontWeight={500}>{leaseRequest.leaseEnd}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Monthly Rate</Typography>
                  <Typography fontWeight={500}>₱{parseFloat(leaseRequest.monthlyRate).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Security Deposit</Typography>
                  <Typography fontWeight={500}>₱{parseFloat(leaseRequest.securityDeposit || 0).toLocaleString()}</Typography>
                </Grid>
                {leaseRequest.paymentTerms && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Payment Terms</Typography>
                    <Typography>{leaseRequest.paymentTerms}</Typography>
                  </Grid>
                )}
                {leaseRequest.remarks && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Remarks</Typography>
                    <Typography sx={{ fontStyle: 'italic' }}>"{leaseRequest.remarks}"</Typography>
                  </Grid>
                )}
              </Grid>

              {leaseRequest.status === "Approved" && leaseRequest.tenantId && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    <strong>Approved!</strong> Tenant ID: {leaseRequest.tenantId}<br />
                    <strong>Approved on:</strong> {new Date(leaseRequest.approvedDate).toLocaleDateString()}
                  </Typography>
                </Alert>
              )}

              {leaseRequest.rejectionReason && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    <strong>Rejected:</strong> {leaseRequest.rejectionReason}<br />
                    <strong>Rejected on:</strong> {new Date(leaseRequest.rejectedDate).toLocaleDateString()}
                  </Typography>
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Right Column - Document Upload */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom>
                Required Documents
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload documents for lease approval
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* Valid ID - REQUIRED */}
              <Card variant="outlined" sx={{ mb: 2, bgcolor: validId ? '#f0f9f0' : '#fff' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Valid ID (Required) *
                    </Typography>
                    {validId && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => handleViewDocument(validId)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleRemoveFile(setValidId)}>
                          <Delete fontSize="small" color="error" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Government-issued ID (Passport, Driver's License, etc.)
                  </Typography>
                  
                  {validId ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileCopy fontSize="small" />
                      <Typography variant="caption">
                        {validId.fileName} ({formatFileSize(validId.fileSize)})
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <input
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        style={{ display: 'none' }}
                        id="validId-upload"
                        type="file"
                        onChange={(e) => handleFileUpload(setValidId, e)}
                      />
                      <label htmlFor="validId-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          size="small"
                        >
                          Upload Valid ID
                        </Button>
                      </label>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Business Permit - OPTIONAL */}
              <Card variant="outlined" sx={{ mb: 2, bgcolor: businessPermit ? '#f0f9f0' : '#fff' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Business Permit (Optional)
                    </Typography>
                    {businessPermit && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => handleViewDocument(businessPermit)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleRemoveFile(setBusinessPermit)}>
                          <Delete fontSize="small" color="error" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    DTI/SEC Registration
                  </Typography>
                  
                  {businessPermit ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileCopy fontSize="small" />
                      <Typography variant="caption">
                        {businessPermit.fileName} ({formatFileSize(businessPermit.fileSize)})
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <input
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        style={{ display: 'none' }}
                        id="businessPermit-upload"
                        type="file"
                        onChange={(e) => handleFileUpload(setBusinessPermit, e)}
                      />
                      <label htmlFor="businessPermit-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          size="small"
                        >
                          Upload Business Permit
                        </Button>
                      </label>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Barangay Permit - OPTIONAL */}
              <Card variant="outlined" sx={{ mb: 3, bgcolor: barangayPermit ? '#f0f9f0' : '#fff' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Barangay Permit (Optional)
                    </Typography>
                    {barangayPermit && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => handleViewDocument(barangayPermit)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleRemoveFile(setBarangayPermit)}>
                          <Delete fontSize="small" color="error" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Barangay Clearance/Business Permit
                  </Typography>
                  
                  {barangayPermit ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileCopy fontSize="small" />
                      <Typography variant="caption">
                        {barangayPermit.fileName} ({formatFileSize(barangayPermit.fileSize)})
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <input
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        style={{ display: 'none' }}
                        id="barangayPermit-upload"
                        type="file"
                        onChange={(e) => handleFileUpload(setBarangayPermit, e)}
                      />
                      <label htmlFor="barangayPermit-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          size="small"
                        >
                          Upload Barangay Permit
                        </Button>
                      </label>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              {leaseRequest.status === "Pending Approval" && (
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => setApproveDialogOpen(true)}
                    sx={{ flex: 1 }}
                    disabled={!validId}
                  >
                    Approve Lease
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => setRejectDialogOpen(true)}
                    sx={{ flex: 1 }}
                  >
                    Reject Lease
                  </Button>
                </Box>
              )}

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Valid ID is required for approval. 
                  Tenant ID will be automatically generated upon approval.
                </Typography>
              </Alert>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Approve Confirmation Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
        <DialogTitle>Approve Lease Request</DialogTitle>
        <DialogContent>
          {generatedTenantId ? (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                Tenant ID generated: <strong>{generatedTenantId}</strong>
              </Alert>
              <Typography>
                Are you sure you want to approve this lease request with the generated Tenant ID?
              </Typography>
            </>
          ) : (
            <>
              <Typography gutterBottom>
                Are you sure you want to approve this lease request?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A Tenant ID will be automatically generated upon approval.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleApprove}
          >
            {generatedTenantId ? 'Confirm Approval' : 'Approve & Generate Tenant ID'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Lease Request</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Please provide a reason for rejecting this lease request:
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleReject}
          >
            Reject Lease
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}