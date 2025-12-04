import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  NavigateNext,
  Home as HomeIcon,
  Visibility,
  CheckCircle,
  Cancel,
  Person,
  Business,
  Delete,
  RestoreFromTrash,
  Archive,
} from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function LeaseApprovalList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [leaseRequests, setLeaseRequests] = useState([]);
  const [rejectedLeases, setRejectedLeases] = useState([]);
  const [selectedLease, setSelectedLease] = useState(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Load lease requests
  useEffect(() => {
    const loadLeaseData = () => {
      const storedRequests = JSON.parse(localStorage.getItem("leaseRequests")) || [];
      
      // Filter pending requests
      const pendingRequests = storedRequests.filter(
        request => request.status === "Pending Approval"
      );
      
      // Filter rejected requests (for archive)
      const rejectedRequests = storedRequests.filter(
        request => request.status === "Rejected"
      );
      
      setLeaseRequests(pendingRequests);
      setRejectedLeases(rejectedRequests);
    };

    loadLeaseData();
    // Refresh every 5 seconds
    const interval = setInterval(loadLeaseData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (leaseId) => {
    navigate(`/lease-approval/${leaseId}`);
  };

  const handleApproveClick = (lease) => {
    setSelectedLease(lease);
    setApprovalDialogOpen(true);
  };

  const handleRejectClick = (lease) => {
    setSelectedLease(lease);
    setRejectionDialogOpen(true);
  };

  const handleDeleteClick = (lease) => {
    setSelectedLease(lease);
    setDeleteDialogOpen(true);
  };

  const handleRestoreClick = (lease) => {
    setSelectedLease(lease);
    setRestoreDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedLease) return;
    navigate(`/lease-approval/${selectedLease.id}`);
    setApprovalDialogOpen(false);
  };

  const handleReject = () => {
    if (!selectedLease || !rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    const leaseRequests = JSON.parse(localStorage.getItem("leaseRequests")) || [];
    const updatedRequests = leaseRequests.map(lease => {
      if (lease.id === selectedLease.id) {
        return {
          ...lease,
          status: "Rejected",
          rejectionReason: rejectionReason,
          rejectedDate: new Date().toISOString(),
          rejectedBy: "Admin",
          archived: false, // Not archived yet
        };
      }
      return lease;
    });

    localStorage.setItem("leaseRequests", JSON.stringify(updatedRequests));

    // Update all leases
    const allLeases = JSON.parse(localStorage.getItem("leases")) || [];
    const updatedAllLeases = allLeases.map(lease => {
      if (lease.id === selectedLease.id) {
        return {
          ...lease,
          status: "Rejected",
          rejectionReason: rejectionReason,
        };
      }
      return lease;
    });
    localStorage.setItem("leases", JSON.stringify(updatedAllLeases));

    // Add to rejected archive
    const rejectedArchive = JSON.parse(localStorage.getItem("rejectedLeasesArchive")) || [];
    const rejectedLease = updatedRequests.find(lease => lease.id === selectedLease.id);
    const updatedArchive = [...rejectedArchive, rejectedLease];
    localStorage.setItem("rejectedLeasesArchive", JSON.stringify(updatedArchive));

    // Update state
    setLeaseRequests(prev => prev.filter(lease => lease.id !== selectedLease.id));
    setRejectedLeases(prev => [...prev, rejectedLease]);
    setRejectionDialogOpen(false);
    setRejectionReason("");
    setSelectedLease(null);

    alert("Lease request rejected and moved to archive.");
  };

  const handleDeletePermanently = () => {
    if (!selectedLease) return;

    // Remove from leaseRequests
    const leaseRequests = JSON.parse(localStorage.getItem("leaseRequests")) || [];
    const updatedRequests = leaseRequests.filter(lease => lease.id !== selectedLease.id);
    localStorage.setItem("leaseRequests", JSON.stringify(updatedRequests));

    // Remove from all leases
    const allLeases = JSON.parse(localStorage.getItem("leases")) || [];
    const updatedAllLeases = allLeases.filter(lease => lease.id !== selectedLease.id);
    localStorage.setItem("leases", JSON.stringify(updatedAllLeases));

    // Remove from rejected archive
    const rejectedArchive = JSON.parse(localStorage.getItem("rejectedLeasesArchive")) || [];
    const updatedArchive = rejectedArchive.filter(lease => lease.id !== selectedLease.id);
    localStorage.setItem("rejectedLeasesArchive", JSON.stringify(updatedArchive));

    // Update state
    setRejectedLeases(prev => prev.filter(lease => lease.id !== selectedLease.id));
    setDeleteDialogOpen(false);
    setSelectedLease(null);

    alert("Lease request permanently deleted from archive.");
  };

  const handleRestoreLease = () => {
    if (!selectedLease) return;

    // Update lease status back to Pending Approval
    const leaseRequests = JSON.parse(localStorage.getItem("leaseRequests")) || [];
    const updatedRequests = leaseRequests.map(lease => {
      if (lease.id === selectedLease.id) {
        return {
          ...lease,
          status: "Pending Approval",
          rejectionReason: "",
          rejectedDate: null,
          rejectedBy: null,
        };
      }
      return lease;
    });

    localStorage.setItem("leaseRequests", JSON.stringify(updatedRequests));

    // Update all leases
    const allLeases = JSON.parse(localStorage.getItem("leases")) || [];
    const updatedAllLeases = allLeases.map(lease => {
      if (lease.id === selectedLease.id) {
        return {
          ...lease,
          status: "Pending Approval",
          rejectionReason: "",
        };
      }
      return lease;
    });
    localStorage.setItem("leases", JSON.stringify(updatedAllLeases));

    // Remove from rejected archive
    const rejectedArchive = JSON.parse(localStorage.getItem("rejectedLeasesArchive")) || [];
    const updatedArchive = rejectedArchive.filter(lease => lease.id !== selectedLease.id);
    localStorage.setItem("rejectedLeasesArchive", JSON.stringify(updatedArchive));

    // Update state
    const restoredLease = updatedRequests.find(lease => lease.id === selectedLease.id);
    setRejectedLeases(prev => prev.filter(lease => lease.id !== selectedLease.id));
    setLeaseRequests(prev => [...prev, restoredLease]);
    setRestoreDialogOpen(false);
    setSelectedLease(null);

    alert("Lease request restored to pending approvals.");
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Pending Approval": return "warning";
      case "Approved": return "success";
      case "Rejected": return "error";
      default: return "default";
    }
  };

  const tabStyles = {
    fontWeight: 600,
    textTransform: 'none',
  };

  return (
    <MainLayout>
      <Box sx={{ p: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" href="/dashboard">
            <HomeIcon sx={{ mr: 0.5 }} /> Dashboard
          </Link>
          <Typography color="text.primary">Lease Approval</Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight={700} gutterBottom>
          Lease Approval Requests
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Review and approve pending lease requests
        </Typography>

        {/* Tabs */}
        <Paper sx={{ mb: 3, borderRadius: .5 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle fontSize="small" />
                  Pending Approval ({leaseRequests.length})
                </Box>
              }
              sx={tabStyles}
            />
            {/* <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Archive fontSize="small" />
                  Rejected Archive ({rejectedLeases.length})
                </Box>
              }
              sx={tabStyles}
            /> */}
          </Tabs>
        </Paper>

        {/* Pending Approval Tab */}
        {activeTab === 0 && (
          <>
            {leaseRequests.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Typography color="text.secondary">
                  No pending lease approval requests.
                </Typography>
              </Paper>
            ) : (
              <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                      <TableRow>
                        <TableCell><b>Lease ID</b></TableCell>
                        <TableCell><b>Tenant Name</b></TableCell>
                        <TableCell><b>Stall</b></TableCell>
                        <TableCell><b>Request Date</b></TableCell>
                        <TableCell><b>Monthly Rate</b></TableCell>
                        <TableCell><b>Status</b></TableCell>
                        <TableCell><b>Actions</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaseRequests.map((lease) => (
                        <TableRow key={lease.id}>
                          <TableCell>{lease.id}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Person sx={{ mr: 1, fontSize: 18, color: '#666' }} />
                              {lease.tenantName}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Business sx={{ mr: 1, fontSize: 18, color: '#666' }} />
                              {lease.stallId}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {dayjs(lease.dateRequested).format('MMM DD, YYYY')}
                          </TableCell>
                          <TableCell>₱{lease.monthlyRate}</TableCell>
                          <TableCell>
                            <Chip 
                              label={lease.status} 
                              color={getStatusColor(lease.status)}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Details">
                                <Button
                                  size="small"
                                  variant="transparent"
                                  startIcon={<Visibility />}
                                  onClick={() => handleViewDetails(lease.id)}
                                  sx={{ color: '#1976d2' }}
                                >
                                  View
                                </Button>
                              </Tooltip>
                              <Tooltip title="Approve Lease">
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={<CheckCircle />}
                                  onClick={() => handleApproveClick(lease)}
                                >
                                  Approve
                                </Button>
                              </Tooltip>
                              <Tooltip title="Reject Lease">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<Cancel />}
                                  onClick={() => handleRejectClick(lease)}
                                >
                                  Reject
                                </Button>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </>
        )}

        {/* Rejected Archive Tab */}
        {activeTab === 1 && (
          <>
            {rejectedLeases.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Typography color="text.secondary">
                  No rejected lease requests in archive.
                </Typography>
              </Paper>
            ) : (
              <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                      <TableRow>
                        <TableCell><b>Lease ID</b></TableCell>
                        <TableCell><b>Tenant Name</b></TableCell>
                        <TableCell><b>Stall</b></TableCell>
                        <TableCell><b>Request Date</b></TableCell>
                        <TableCell><b>Rejected Date</b></TableCell>
                        <TableCell><b>Rejection Reason</b></TableCell>
                        <TableCell><b>Actions</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rejectedLeases.map((lease) => (
                        <TableRow key={lease.id} sx={{ bgcolor: '#fff5f5' }}>
                          <TableCell>{lease.id}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Person sx={{ mr: 1, fontSize: 18, color: '#666' }} />
                              {lease.tenantName}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Business sx={{ mr: 1, fontSize: 18, color: '#666' }} />
                              {lease.stallId}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {dayjs(lease.dateRequested).format('MMM DD, YYYY')}
                          </TableCell>
                          <TableCell>
                            {lease.rejectedDate ? dayjs(lease.rejectedDate).format('MMM DD, YYYY') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ 
                              fontStyle: 'italic',
                              color: '#d32f2f',
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {lease.rejectionReason || 'No reason provided'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(lease.id)}
                                  sx={{ color: '#1976d2' }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Restore to Pending">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleRestoreClick(lease)}
                                >
                                  <RestoreFromTrash />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Permanently">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteClick(lease)}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </>
        )}
      </Box>

      {/* Approve Confirmation Dialog */}
      <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)}>
        <DialogTitle>Approve Lease Request</DialogTitle>
        <DialogContent>
          {selectedLease && (
            <Box sx={{ mb: 2 }}>
              <Typography><strong>Lease ID:</strong> {selectedLease.id}</Typography>
              <Typography><strong>Tenant:</strong> {selectedLease.tenantName}</Typography>
              <Typography><strong>Stall:</strong> {selectedLease.stallId}</Typography>
              <Typography><strong>Monthly Rate:</strong> ₱{selectedLease.monthlyRate}</Typography>
            </Box>
          )}
          <Alert severity="info" sx={{ mb: 2 }}>
            You will be redirected to the approval page where you can:
            1. Upload required documents (Valid ID)
            2. Review lease details
            3. Generate Tenant ID upon approval
          </Alert>
          <Typography>
            Continue to approval process?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleApprove}
          >
            Continue to Approval
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectionDialogOpen} onClose={() => setRejectionDialogOpen(false)}>
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
            sx={{ mt: 2 }}
          />
          <Alert severity="warning" sx={{ mt: 2 }}>
            Rejected requests will be moved to the archive and can be restored later if needed.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleReject}
          >
            Reject & Archive
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Permanently Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Lease Request Permanently</DialogTitle>
        <DialogContent>
          {selectedLease && (
            <Box sx={{ mb: 2 }}>
              <Typography><strong>Lease ID:</strong> {selectedLease.id}</Typography>
              <Typography><strong>Tenant:</strong> {selectedLease.tenantName}</Typography>
              <Typography><strong>Stall:</strong> {selectedLease.stallId}</Typography>
              <Typography><strong>Rejection Reason:</strong> {selectedLease.rejectionReason || 'N/A'}</Typography>
            </Box>
          )}
          <Alert severity="error" sx={{ mb: 2 }}>
            Warning: This action cannot be undone. The lease request will be permanently deleted from the system.
          </Alert>
          <Typography>
            Are you sure you want to permanently delete this rejected lease request?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDeletePermanently}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
        <DialogTitle>Restore Lease Request</DialogTitle>
        <DialogContent>
          {selectedLease && (
            <Box sx={{ mb: 2 }}>
              <Typography><strong>Lease ID:</strong> {selectedLease.id}</Typography>
              <Typography><strong>Tenant:</strong> {selectedLease.tenantName}</Typography>
              <Typography><strong>Stall:</strong> {selectedLease.stallId}</Typography>
              <Typography><strong>Rejection Reason:</strong> {selectedLease.rejectionReason || 'N/A'}</Typography>
            </Box>
          )}
          <Alert severity="info" sx={{ mb: 2 }}>
            This lease request will be restored to the pending approval list with status set to "Pending Approval".
          </Alert>
          <Typography>
            Are you sure you want to restore this lease request?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleRestoreLease}
          >
            Restore to Pending
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}