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
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  Alert,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  NavigateNext,
  Home as HomeIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

// Extend dayjs with isBetween plugin
dayjs.extend(isBetween);

export default function LeaseList() {
  const navigate = useNavigate();
  const [leases, setLeases] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLease, setSelectedLease] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    expired: 0,
    rejected: 0,
    upcomingRenewals: 0,
  });

  // Load data
  useEffect(() => {
    const loadData = () => {
      // Load all leases from different sources
      const pendingLeases = JSON.parse(localStorage.getItem("leaseRequests")) || [];
      const approvedLeases = JSON.parse(localStorage.getItem("approvedLeases")) || [];
      const rejectedLeases = JSON.parse(localStorage.getItem("rejectedLeasesArchive")) || [];
      const allLeasesData = JSON.parse(localStorage.getItem("leases")) || [];
      
      // Combine all leases
      const allLeases = [...pendingLeases, ...approvedLeases, ...rejectedLeases, ...allLeasesData];
      
      // Remove duplicates by ID
      const uniqueLeases = Array.from(
        new Map(allLeases.map(lease => [lease.id, lease])).values()
      );
      
      // Sort by date (newest first)
      const sortedLeases = uniqueLeases.sort((a, b) => 
        new Date(b.dateCreated || b.dateRequested || b.createdAt) - 
        new Date(a.dateCreated || a.dateRequested || a.createdAt)
      );
      
      setLeases(sortedLeases);
      
      // Load tenants and stalls for reference
      const storedTenants = JSON.parse(localStorage.getItem("tenants")) || [];
      const storedStalls = JSON.parse(localStorage.getItem("stalls")) || [];
      setTenants(storedTenants);
      setStalls(storedStalls);
      
      // Calculate statistics
      calculateStats(sortedLeases);
    };

    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const calculateStats = (leasesData) => {
    const now = dayjs();
    const thirtyDaysFromNow = dayjs().add(30, 'day');
    
    const statsData = {
      total: leasesData.length,
      active: leasesData.filter(lease => lease.status === "Active").length,
      pending: leasesData.filter(lease => lease.status === "Pending Approval").length,
      expired: leasesData.filter(lease => {
        if (lease.status === "Active" && lease.leaseEnd) {
          return dayjs(lease.leaseEnd).isBefore(now);
        }
        return false;
      }).length,
      rejected: leasesData.filter(lease => lease.status === "Rejected").length,
      upcomingRenewals: leasesData.filter(lease => {
        if (lease.status === "Active" && lease.leaseEnd) {
          const endDate = dayjs(lease.leaseEnd);
          return endDate.isBetween(now, thirtyDaysFromNow, null, '[]');
        }
        return false;
      }).length,
    };
    
    setStats(statsData);
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (status = null) => {
    if (status !== null) {
      setStatusFilter(status);
    }
    setAnchorEl(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewLease = (lease) => {
    setSelectedLease(lease);
    setViewDialogOpen(true);
  };

  const handleEditLease = (leaseId) => {
    navigate(`/lease-creation?edit=${leaseId}`);
  };

  const handleDeleteClick = (lease) => {
    setSelectedLease(lease);
    setDeleteDialogOpen(true);
  };

  const handleDeleteLease = () => {
    if (!selectedLease) return;
    
    // Remove from all lease storages
    const storageKeys = ["leaseRequests", "approvedLeases", "rejectedLeasesArchive", "leases"];
    
    storageKeys.forEach(key => {
      const storedData = JSON.parse(localStorage.getItem(key)) || [];
      const filteredData = storedData.filter(lease => lease.id !== selectedLease.id);
      localStorage.setItem(key, JSON.stringify(filteredData));
    });
    
    // Update state
    setLeases(prev => prev.filter(lease => lease.id !== selectedLease.id));
    calculateStats(leases.filter(lease => lease.id !== selectedLease.id));
    setDeleteDialogOpen(false);
    setSelectedLease(null);
    
    alert("Lease record deleted successfully.");
  };

  const handleExport = () => {
    const exportData = filteredLeases.map(lease => ({
      "Lease ID": lease.id,
      "Tenant Name": lease.tenantName,
      "Tenant ID": lease.tenantId || "N/A",
      "Stall ID": lease.stallId,
      "Start Date": lease.leaseStart,
      "End Date": lease.leaseEnd,
      "Monthly Rate": `₱${lease.monthlyRate}`,
      "Status": lease.status,
      "Payment Status": lease.paymentStatus || "N/A",
      "Date Created": lease.dateCreated || lease.dateRequested || "N/A",
      "Approved Date": lease.approvedDate || "N/A",
      "Approved By": lease.approvedBy || "N/A",
    }));
    
    const csv = convertToCSV(exportData);
    downloadCSV(csv, `lease-records-${dayjs().format('YYYY-MM-DD')}.csv`);
  };

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => JSON.stringify(row[header])).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRefresh = () => {
    const loadData = () => {
      const pendingLeases = JSON.parse(localStorage.getItem("leaseRequests")) || [];
      const approvedLeases = JSON.parse(localStorage.getItem("approvedLeases")) || [];
      const rejectedLeases = JSON.parse(localStorage.getItem("rejectedLeasesArchive")) || [];
      const allLeasesData = JSON.parse(localStorage.getItem("leases")) || [];
      
      const allLeases = [...pendingLeases, ...approvedLeases, ...rejectedLeases, ...allLeasesData];
      const uniqueLeases = Array.from(
        new Map(allLeases.map(lease => [lease.id, lease])).values()
      );
      
      const sortedLeases = uniqueLeases.sort((a, b) => 
        new Date(b.dateCreated || b.dateRequested || b.createdAt) - 
        new Date(a.dateCreated || a.dateRequested || a.createdAt)
      );
      
      setLeases(sortedLeases);
      calculateStats(sortedLeases);
    };
    
    loadData();
    alert("Data refreshed successfully.");
  };

  const getTenantInfo = (tenantId) => {
    if (!tenantId) return null;
    return tenants.find(tenant => tenant.id === tenantId);
  };

  const getStallInfo = (stallId) => {
    if (!stallId) return null;
    return stalls.find(stall => stall.id === stallId);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Active": return "success";
      case "Pending Approval": return "warning";
      case "Rejected": return "error";
      case "Expired": return "default";
      default: return "info";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "Active": return <CheckCircleIcon />;
      case "Pending Approval": return <WarningIcon />;
      case "Rejected": return <CancelIcon />;
      case "Expired": return <ScheduleIcon />;
      default: return <InfoIcon />;
    }
  };

  const isLeaseExpiringSoon = (lease) => {
    if (lease.status !== "Active" || !lease.leaseEnd) return false;
    const endDate = dayjs(lease.leaseEnd);
    const now = dayjs();
    const daysUntilExpiry = endDate.diff(now, 'day');
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isLeaseExpired = (lease) => {
    if (lease.status !== "Active" || !lease.leaseEnd) return false;
    return dayjs(lease.leaseEnd).isBefore(dayjs());
  };

  // Filter leases
  const filteredLeases = leases.filter(lease => {
    // Status filter
    if (statusFilter !== "all" && lease.status !== statusFilter) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (lease.id && lease.id.toLowerCase().includes(searchLower)) ||
        (lease.tenantName && lease.tenantName.toLowerCase().includes(searchLower)) ||
        (lease.tenantId && lease.tenantId.toLowerCase().includes(searchLower)) ||
        (lease.stallId && lease.stallId.toLowerCase().includes(searchLower)) ||
        (lease.status && lease.status.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Set status filter based on tab
    switch(newValue) {
      case 0: setStatusFilter("all"); break;
      case 1: setStatusFilter("Active"); break;
      case 2: setStatusFilter("Pending Approval"); break;
      case 3: setStatusFilter("Rejected"); break;
      case 4: setStatusFilter("all"); // For expired, we'll filter differently
      default: setStatusFilter("all");
    }
  };

  // For expired tab, we need to filter differently
  const tabFilteredLeases = activeTab === 4 
    ? filteredLeases.filter(lease => isLeaseExpired(lease))
    : filteredLeases;

  return (
    <MainLayout>
      <Box sx={{ p: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" href="/dashboard">
            <HomeIcon sx={{ mr: 0.5 }} /> Dashboard
          </Link>
          <Link underline="hover" color="inherit" href="/lease-management">
            Lease Management
          </Link>
          <Typography color="text.primary">Lease Records</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Lease Records
            </Typography>
            <Typography color="text.secondary">
              Track and manage all lease agreements
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ bgcolor: '#1976d2' }}
          >
            Refresh Data
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card sx={{ bgcolor: '#ffffffff', borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={700} color="primary">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Leases
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card sx={{ bgcolor: '#ffffffff', borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={700} color="success.main">
                  {stats.active}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Leases
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card sx={{ bgcolor: '#ffffffff', borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={700} color="warning.main">
                  {stats.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Approval
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card sx={{ bgcolor: '#ffffffff', borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={700} color="error.main">
                  {stats.rejected}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rejected
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card sx={{ 
              bgcolor: stats.upcomingRenewals > 0 ? '#fff3cd' : '#f8f9fa',
              border: stats.upcomingRenewals > 0 ? '2px solid #ffc107' : 'none',
              borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={700} color="warning.dark">
                  {stats.upcomingRenewals}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upcoming Renewals
                </Typography>
                {stats.upcomingRenewals > 0 && (
                  <Typography variant="caption" color="warning.dark" sx={{ display: 'block', mt: 1 }}>
                    <WarningIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Expiring in 30 days
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3, borderRadius: .5 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="All Leases" />
            <Tab label="Active" />
            <Tab label="Pending" />
            <Tab label="Rejected" />
            <Tab label="Expired" />
          </Tabs>
        </Paper>

        {/* Search and Filter Bar */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search by ID, Tenant, Stall..."
            value={searchTerm}
            onChange={handleSearch}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            variant="outlined"
            size="small"
          >
            Filter
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => handleFilterClose(null)}
          >
            <MenuItem onClick={() => handleFilterClose("all")}>All Status</MenuItem>
            <MenuItem onClick={() => handleFilterClose("Active")}>Active</MenuItem>
            <MenuItem onClick={() => handleFilterClose("Pending Approval")}>Pending Approval</MenuItem>
            <MenuItem onClick={() => handleFilterClose("Rejected")}>Rejected</MenuItem>
            <MenuItem onClick={() => handleFilterClose("Expired")}>Expired</MenuItem>
          </Menu>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Export to CSV">
            <IconButton onClick={handleExport} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton onClick={handlePrint} color="primary">
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Paper>

        {/* Leases Table */}
        {tabFilteredLeases.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography color="text.secondary">
              No lease records found.
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell><b>Lease ID</b></TableCell>
                    <TableCell><b>Tenant</b></TableCell>
                    <TableCell><b>Stall</b></TableCell>
                    <TableCell><b>Period</b></TableCell>
                    <TableCell><b>Monthly Rate</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                    <TableCell><b>Created</b></TableCell>
                    <TableCell><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tabFilteredLeases.map((lease) => {
                    const isExpiringSoon = isLeaseExpiringSoon(lease);
                    const isExpired = isLeaseExpired(lease);
                    const tenantInfo = getTenantInfo(lease.tenantId);
                    const stallInfo = getStallInfo(lease.stallId);
                    
                    return (
                      <TableRow 
                        key={lease.id}
                        sx={{ 
                          bgcolor: isExpiringSoon ? '#fff9e6' : isExpired ? '#ffe6e6' : 'inherit',
                          '&:hover': { bgcolor: '#f9f9f9' }
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight={500}>
                            {lease.id}
                          </Typography>
                          {isExpiringSoon && (
                            <Typography variant="caption" color="warning.main" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
                              Expiring soon
                            </Typography>
                          )}
                          {isExpired && (
                            <Typography variant="caption" color="error.main" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <CancelIcon fontSize="small" sx={{ mr: 0.5 }} />
                              Expired
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ mr: 1, fontSize: 18, color: '#666' }} />
                            <Box>
                              <Typography fontWeight={500}>
                                {lease.tenantName}
                              </Typography>
                              {lease.tenantId && (
                                <Typography variant="caption" color="text.secondary">
                                  ID: {lease.tenantId}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BusinessIcon sx={{ mr: 1, fontSize: 18, color: '#666' }} />
                            <Box>
                              <Typography fontWeight={500}>
                                {lease.stallId}
                              </Typography>
                              {stallInfo && (
                                <Typography variant="caption" color="text.secondary">
                                  {stallInfo.type || 'Stall'}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {lease.leaseStart ? dayjs(lease.leaseStart).format('MMM DD, YYYY') : 'N/A'}
                            </Typography>
                            <Typography variant="body2">
                              {lease.leaseEnd ? dayjs(lease.leaseEnd).format('MMM DD, YYYY') : 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <MoneyIcon sx={{ mr: 0.5, fontSize: 16, color: '#666' }} />
                            <Typography fontWeight={500}>
                              ₱{parseFloat(lease.monthlyRate || 0).toLocaleString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(lease.status)}
                            label={lease.status}
                            color={getStatusColor(lease.status)}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          {lease.dateCreated || lease.dateRequested ? (
                            <Typography variant="body2">
                              {dayjs(lease.dateCreated || lease.dateRequested).format('MMM DD, YYYY')}
                            </Typography>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewLease(lease)}
                                sx={{ color: '#1976d2' }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            {lease.status === "Pending Approval" && (
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleEditLease(lease.id)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(lease)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Summary */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {tabFilteredLeases.length} of {leases.length} lease records
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: {dayjs().format('MMM DD, YYYY hh:mm A')}
          </Typography>
        </Box>
      </Box>

      {/* View Lease Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: 1, borderColor: 'divider' }}>
          Lease Details - {selectedLease?.id}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 3 }}>
          {selectedLease && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#D32F2F' }}>
                  Tenant Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography fontWeight={500}>{selectedLease.tenantName}</Typography>
                  </Grid>
                  {selectedLease.tenantId && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Tenant ID</Typography>
                      <Typography fontWeight={500}>{selectedLease.tenantId}</Typography>
                    </Grid>
                  )}
                  {selectedLease.tenantContact && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Contact</Typography>
                      <Typography>{selectedLease.tenantContact}</Typography>
                    </Grid>
                  )}
                  {selectedLease.tenantEmail && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography>{selectedLease.tenantEmail}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#D32F2F' }}>
                  Lease Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Lease ID</Typography>
                    <Typography fontWeight={500}>{selectedLease.id}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Stall ID</Typography>
                    <Typography fontWeight={500}>{selectedLease.stallId}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Start Date</Typography>
                    <Typography>{selectedLease.leaseStart || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">End Date</Typography>
                    <Typography>{selectedLease.leaseEnd || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Monthly Rate</Typography>
                    <Typography fontWeight={500}>₱{parseFloat(selectedLease.monthlyRate || 0).toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Security Deposit</Typography>
                    <Typography>₱{parseFloat(selectedLease.securityDeposit || 0).toLocaleString()}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#D32F2F' }}>
                  Status & Dates
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip
                      icon={getStatusIcon(selectedLease.status)}
                      label={selectedLease.status}
                      color={getStatusColor(selectedLease.status)}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Grid>
                  {selectedLease.dateRequested && (
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Requested Date</Typography>
                      <Typography>{dayjs(selectedLease.dateRequested).format('MMM DD, YYYY')}</Typography>
                    </Grid>
                  )}
                  {selectedLease.approvedDate && (
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Approved Date</Typography>
                      <Typography>{dayjs(selectedLease.approvedDate).format('MMM DD, YYYY')}</Typography>
                    </Grid>
                  )}
                  {selectedLease.rejectionReason && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Rejection Reason</Typography>
                      <Typography color="error.main">{selectedLease.rejectionReason}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>

              {selectedLease.remarks && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#D32F2F' }}>
                    Remarks
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography sx={{ fontStyle: 'italic' }}>{selectedLease.remarks}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => {
              setViewDialogOpen(false);
              if (selectedLease.status === "Pending Approval") {
                navigate(`/lease-approval/${selectedLease.id}`);
              }
            }}
          >
            {selectedLease?.status === "Pending Approval" ? "Go to Approval" : "View Full Details"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Lease Record</DialogTitle>
        <DialogContent>
          {selectedLease && (
            <Box sx={{ mb: 2 }}>
              <Typography><strong>Lease ID:</strong> {selectedLease.id}</Typography>
              <Typography><strong>Tenant:</strong> {selectedLease.tenantName}</Typography>
              <Typography><strong>Stall:</strong> {selectedLease.stallId}</Typography>
              <Typography><strong>Status:</strong> {selectedLease.status}</Typography>
            </Box>
          )}
          <Alert severity="error" sx={{ mb: 2 }}>
            Warning: This action cannot be undone. All data for this lease will be permanently deleted.
          </Alert>
          <Typography>
            Are you sure you want to delete this lease record?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDeleteLease}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}