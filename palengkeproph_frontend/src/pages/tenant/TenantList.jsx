import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link as MuiLink,
  Grid,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Badge,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Description as DescriptionIcon,
  PermIdentity as IDIcon,
  Assignment as PermitIcon,
  LocationCity as BarangayIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

export default function TenantManagement() {
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [form, setForm] = useState({
    id: "",
    name: "",
    business: "",
    contact: "",
    address: "",
    period: "",
    stall: "",
    paymentTerms: "Monthly",
    status: "Active",
    startDate: "",
  });
  
  const [tenants, setTenants] = useState([]);

  // Payment terms options
  const paymentTermsOptions = ["Daily", "Weekly", "Monthly"];
  
  // Status options and colors
  const statusOptions = ["Active", "Pending", "Inactive", "Overdue"];
  const statusColors = {
    Active: "success",
    Pending: "warning",
    Inactive: "error",
    Overdue: "error",
  };

  // Document types
  const documentTypes = [
    { id: "validId", name: "Valid ID", icon: <IDIcon />, color: "#1976d2" },
    { id: "businessPermit", name: "Business Permit", icon: <PermitIcon />, color: "#2e7d32" },
    { id: "barangayPermit", name: "Barangay Permit", icon: <BarangayIcon />, color: "#ed6c02" },
  ];

  // Calculate overview metrics
  const overviewStats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === "Active").length,
    pending: tenants.filter(t => t.status === "Pending").length,
    overdue: tenants.filter(t => t.status === "Overdue").length,
  };

  // Load tenants from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tenants")) || [];
    if (stored.length > 0) {
      setTenants(stored);
    } else {
      // Seed demo data with documents
      const demoTenants = [
        {
          id: "TNT-001",
          name: "Juan Dela Cruz",
          business: "Dela Cruz Eatery",
          contact: "0917-123-4567",
          address: "123 Main St, Quezon City",
          period: "2024-09-12 to 2025-09-11",
          stall: "Stall A-01",
          paymentTerms: "Monthly",
          status: "Active",
          startDate: "2024-09-12",
          lastUpdated: "2024-12-01",
          documents: {
            validId: { uploaded: true, date: "2024-09-10", file: "juan_delacruz_id.pdf" },
            businessPermit: { uploaded: true, date: "2024-09-11", file: "delacruz_eatery_permit.pdf" },
            barangayPermit: { uploaded: true, date: "2024-09-11", file: "delacruz_barangay_permit.pdf" }
          }
        },
        {
          id: "TNT-002",
          name: "Maria Santos",
          business: "Maria's General Store",
          contact: "0998-765-4321",
          address: "456 Elm St, Makati City",
          period: "2024-10-01 to 2025-09-30",
          stall: "Stall B-03",
          paymentTerms: "Weekly",
          status: "Pending",
          startDate: "2024-10-01",
          lastUpdated: "2024-12-02",
          documents: {
            validId: { uploaded: true, date: "2024-09-28", file: "maria_santos_id.pdf" },
            businessPermit: { uploaded: false, date: null, file: null },
            barangayPermit: { uploaded: true, date: "2024-09-29", file: "santos_barangay_permit.pdf" }
          }
        },
        {
          id: "TNT-003",
          name: "Robert Lim",
          business: "Lim's Electronics",
          contact: "0923-456-7890",
          address: "789 Oak St, Manila",
          period: "2024-11-15 to 2025-11-14",
          stall: "Stall C-05",
          paymentTerms: "Daily",
          status: "Overdue",
          startDate: "2024-11-15",
          lastUpdated: "2024-12-03",
          documents: {
            validId: { uploaded: true, date: "2024-11-10", file: "robert_lim_id.pdf" },
            businessPermit: { uploaded: true, date: "2024-11-12", file: "lim_electronics_permit.pdf" },
            barangayPermit: { uploaded: false, date: null, file: null }
          }
        },
      ];
      setTenants(demoTenants);
    }
  }, []);

  // Persist tenants to localStorage
  useEffect(() => {
    localStorage.setItem("tenants", JSON.stringify(tenants));
  }, [tenants]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Validate required fields
    const requiredFields = ['name', 'business', 'contact', 'address', 'period', 'stall'];
    const missingFields = requiredFields.filter(field => !form[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (editMode) {
      // Update existing tenant
      const updated = tenants.map((t) =>
        t.id === form.id ? { 
          ...form, 
          documents: t.documents || {}, // Preserve existing documents
          lastUpdated: new Date().toISOString() 
        } : t
      );
      setTenants(updated);
    } else {
      // Add new tenant with empty documents
      const newTenant = {
        ...form,
        id: `TNT-${String(tenants.length + 1).padStart(3, "0")}`,
        documents: {},
        lastUpdated: new Date().toISOString(),
      };
      setTenants((prev) => [...prev, newTenant]);
    }

    // Reset form and close modal
    setOpenModal(false);
    setEditMode(false);
    setForm({
      id: "",
      name: "",
      business: "",
      contact: "",
      address: "",
      period: "",
      stall: "",
      paymentTerms: "Monthly",
      status: "Active",
      startDate: "",
    });
  };

  const handleEdit = (tenant) => {
    setForm(tenant);
    setEditMode(true);
    setOpenModal(true);
  };

  const handleDelete = (tenantId) => {
    if (window.confirm("Are you sure you want to remove this tenant?")) {
      const updated = tenants.filter((t) => t.id !== tenantId);
      setTenants(updated);
    }
  };

  const handleViewDocuments = (tenant) => {
    setSelectedTenant(tenant);
    setDrawerOpen(true);
  };

  const handleDownloadDocument = (documentType) => {
    if (selectedTenant?.documents?.[documentType]?.uploaded) {
      const doc = selectedTenant.documents[documentType];
      alert(`Downloading ${doc.file}...`);
      // In a real app, you would initiate a download here
    }
  };

  // Filter tenants based on search
  const filtered = tenants.filter((t) =>
    Object.values(t).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Breadcrumbs */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs aria-label="breadcrumb" separator="›">
            <MuiLink
              component={RouterLink}
              to="/dashboard"
              underline="hover"
              color="inherit"
              sx={{
                display: "flex",
                alignItems: "center",
                '&:hover': {
                  color: '#D32F2F'
                }
              }}
            >
              <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
              Dashboard
            </MuiLink>
            <Typography color="text.primary">Tenant Management</Typography>
          </Breadcrumbs>
        </Box>

        {/* Page header */}
        <Typography variant="h4" fontWeight={700} color="black" gutterBottom>
          Tenant Management
        </Typography>
        <Typography mb={4} color="text.secondary">
          Manage tenant information, leases, and payment terms.
        </Typography>

        {/* Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" color="text.secondary">Total Tenants</Typography>
                    <Typography variant="h4" fontWeight={700}>{overviewStats.total}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: '#2e7d32', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" color="text.secondary">Active</Typography>
                    <Typography variant="h4" fontWeight={700}>{overviewStats.active}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PendingIcon sx={{ fontSize: 40, color: '#ed6c02', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" color="text.secondary">Pending</Typography>
                    <Typography variant="h4" fontWeight={700}>{overviewStats.pending}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon sx={{ fontSize: 40, color: '#d32f2f', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" color="text.secondary">Overdue</Typography>
                    <Typography variant="h4" fontWeight={700}>{overviewStats.overdue}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Actions and Search */}
        <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
            onClick={() => {
              setForm({
                id: "",
                name: "",
                business: "",
                contact: "",
                address: "",
                period: "",
                stall: "",
                paymentTerms: "Monthly",
                status: "Active",
                startDate: "",
              });
              setEditMode(false);
              setOpenModal(true);
            }}
          >
            Add New Tenant
          </Button>

          <TextField
            size="small"
            placeholder="Search tenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, maxWidth: 360 }}
          />
        </Box>

        {/* Tenant Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell><b>Tenant ID</b></TableCell>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Business Name</b></TableCell>
                <TableCell><b>Contact</b></TableCell>
                <TableCell><b>Address</b></TableCell>
                <TableCell><b>Period</b></TableCell>
                <TableCell><b>Stall</b></TableCell>
                <TableCell><b>Payment Terms</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell align="center"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((tenant) => (
                <TableRow key={tenant.id} hover>
                  <TableCell>{tenant.id}</TableCell>
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell>{tenant.business}</TableCell>
                  <TableCell>{tenant.contact}</TableCell>
                  <TableCell>{tenant.address}</TableCell>
                  <TableCell>{tenant.period}</TableCell>
                  <TableCell>{tenant.stall}</TableCell>
                  <TableCell>
                    <Chip 
                      label={tenant.paymentTerms} 
                      size="small"
                      variant="outlined"
                      color={
                        tenant.paymentTerms === "Daily" ? "error" :
                        tenant.paymentTerms === "Weekly" ? "warning" : "primary"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tenant.status}
                      color={statusColors[tenant.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Documents">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleViewDocuments(tenant)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit">
                      <IconButton color="secondary" onClick={() => handleEdit(tenant)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(tenant.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No tenants found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Tenant Details Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: { width: { xs: '100%', sm: 500 } }
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight={600}>
                Tenant Details
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            {selectedTenant && (
              <>
                {/* Tenant Information */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                    Tenant Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Tenant ID</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedTenant.id}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedTenant.name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Business</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedTenant.business}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Contact</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedTenant.contact}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Address</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedTenant.address}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Stall</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedTenant.stall}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Period</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedTenant.period}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Payment Terms</Typography>
                      <Chip 
                        label={selectedTenant.paymentTerms} 
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={selectedTenant.status}
                        color={statusColors[selectedTenant.status]}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Documents Section */}
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                    Tenant Documents
                  </Typography>
                  <List>
                    {documentTypes.map((doc) => {
                      const document = selectedTenant.documents?.[doc.id];
                      const isUploaded = document?.uploaded;
                      
                      return (
                        <React.Fragment key={doc.id}>
                          <ListItem 
                            secondaryAction={
                              isUploaded ? (
                                <IconButton 
                                  edge="end" 
                                  onClick={() => handleDownloadDocument(doc.id)}
                                  color="primary"
                                >
                                  <DownloadIcon />
                                </IconButton>
                              ) : (
                                <Chip label="Missing" size="small" color="error" />
                              )
                            }
                          >
                            <ListItemIcon>
                              <Avatar sx={{ bgcolor: doc.color }}>
                                {doc.icon}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={doc.name}
                              secondary={
                                isUploaded ? (
                                  <>
                                    Uploaded: {new Date(document.date).toLocaleDateString()}
                                    <br />
                                    File: {document.file}
                                  </>
                                ) : (
                                  "Document not uploaded yet"
                                )
                              }
                            />
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      );
                    })}
                  </List>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<DescriptionIcon />}
                    sx={{ mt: 2 }}
                    onClick={() => {
                      // Handle document upload for this tenant
                      alert(`Upload documents for ${selectedTenant.name}`);
                    }}
                  >
                    Upload Missing Documents
                  </Button>
                </Paper>
              </>
            )}
          </Box>
        </Drawer>

        {/* Add/Edit Tenant Modal */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: "#D32F2F", color: "white" }}>
            {editMode ? "Edit Tenant Information" : "Add New Tenant"}
          </DialogTitle>
          <DialogContent dividers sx={{ pt: 2 }}>
            <TextField 
              fullWidth 
              label="Tenant Name *" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              margin="dense" 
            />
            <TextField 
              fullWidth 
              label="Business Name *" 
              name="business" 
              value={form.business} 
              onChange={handleChange} 
              margin="dense" 
            />
            <TextField 
              fullWidth 
              label="Contact Number *" 
              name="contact" 
              value={form.contact} 
              onChange={handleChange} 
              margin="dense" 
            />
            <TextField 
              fullWidth 
              label="Address *" 
              name="address" 
              value={form.address} 
              onChange={handleChange} 
              margin="dense" 
              multiline
              rows={2}
            />
            <TextField 
              fullWidth 
              label="Lease Period *" 
              name="period" 
              value={form.period} 
              onChange={handleChange} 
              margin="dense" 
              placeholder="e.g., 2024-01-01 to 2024-12-31"
            />
            <TextField 
              fullWidth 
              label="Stall Number/Location *" 
              name="stall" 
              value={form.stall} 
              onChange={handleChange} 
              margin="dense" 
            />
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Payment Terms</InputLabel>
              <Select
                name="paymentTerms"
                value={form.paymentTerms}
                onChange={handleChange}
                label="Payment Terms"
              >
                {paymentTermsOptions.map((term) => (
                  <MenuItem key={term} value={term}>{term}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={form.status}
                onChange={handleChange}
                label="Status"
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Start Date"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button variant="contained" sx={{ backgroundColor: "#D32F2F", color: "#fff" }} onClick={handleSave}>
              {editMode ? "Save Changes" : "Add Tenant"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}