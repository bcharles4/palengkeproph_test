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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  UploadFile as UploadFileIcon,
  Visibility as VisibilityIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

export default function TenantManagement() {
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    id: "",
    name: "",
    business: "",
    contact: "",
    startDate: "",
    verification: "Pending",
  });
  const [tenants, setTenants] = useState([]);

  const verificationColors = {
    Verified: "success",
    Pending: "warning",
    Rejected: "error",
  };

  // Load tenants from localStorage (or seed demo data)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tenants")) || [];
    if (stored.length > 0) {
      setTenants(stored);
    } else {
      setTenants([
        {
          id: "TNT-001",
          name: "Juan Dela Cruz",
          business: "Dela Cruz Eatery",
          contact: "0917-123-4567",
          startDate: "2024-09-12",
          verification: "Verified",
          lastUpdated: "2024-12-01",
        },
        {
          id: "TNT-002",
          name: "Maria Santos",
          business: "Maria’s General Store",
          contact: "0998-765-4321",
          startDate: "2024-10-01",
          verification: "Pending",
          lastUpdated: "2024-12-02",
        },
      ]);
    }
  }, []);

  // Persist tenants to localStorage when they change
  useEffect(() => {
    localStorage.setItem("tenants", JSON.stringify(tenants));
  }, [tenants]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!form.name || !form.business || !form.contact) {
      alert("Please fill in all required fields.");
      return;
    }

    if (editMode) {
      const updated = tenants.map((t) =>
        t.id === form.id ? { ...form, lastUpdated: new Date().toISOString() } : t
      );
      setTenants(updated);
    } else {
      const newTenant = {
        ...form,
        id: `TNT-${String(tenants.length + 1).padStart(3, "0")}`,
        lastUpdated: new Date().toISOString(),
      };
      setTenants((prev) => [...prev, newTenant]);
    }

    setOpenModal(false);
    setEditMode(false);
    setForm({ id: "", name: "", business: "", contact: "", startDate: "", verification: "Pending" });
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

  const handleView = (tenant) => {
    // Save selected to session (so onboarding page can pick it up)
    sessionStorage.setItem("selectedTenant", JSON.stringify(tenant));
    // navigate (use SPA routing)
    window.location.href = "/tenant-onboarding";
  };

  const filtered = tenants.filter((t) =>
    Object.values(t).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <Box>
        {/* Breadcrumbs */}
        <Box sx={{ mb: 2 }}>
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
            <Typography color="text.primary">Tenant List</Typography>
          </Breadcrumbs>
        </Box>

        {/* Page header */}
        <Typography variant="h4" fontWeight={700} color="black" gutterBottom>
          Tenant List
        </Typography>
        <Typography mb={3} color="text.secondary">
          Manage tenant onboarding, information, verification and documents.
        </Typography>

        {/* Actions */}
        <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
            onClick={() => {
              setForm({ id: "", name: "", business: "", contact: "", startDate: "", verification: "Pending" });
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

        {/* Tenant table */}
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell><b>Tenant ID</b></TableCell>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Business</b></TableCell>
                <TableCell><b>Contact</b></TableCell>
                <TableCell><b>Start Date</b></TableCell>
                <TableCell><b>Verification</b></TableCell>
                <TableCell><b>Last Updated</b></TableCell>
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
                  <TableCell>
                    {tenant.startDate ? new Date(tenant.startDate).toLocaleDateString() : ""}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tenant.verification}
                      color={verificationColors[tenant.verification]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {tenant.lastUpdated ? new Date(tenant.lastUpdated).toLocaleDateString() : ""}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View">
                      <IconButton color="primary" onClick={() => handleView(tenant)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit">
                      <IconButton color="secondary" onClick={() => handleEdit(tenant)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Upload Documents">
                      <IconButton color="info">
                        <UploadFileIcon fontSize="small" />
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
                  <TableCell colSpan={8} align="center">
                    No tenants found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Tenant Modal */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: "#D32F2F", color: "white" }}>
            {editMode ? "Edit Tenant Information" : "Add New Tenant"}
          </DialogTitle>
          <DialogContent dividers>
            <TextField fullWidth label="Tenant Name" name="name" value={form.name} onChange={handleChange} margin="dense" />
            <TextField fullWidth label="Business Name" name="business" value={form.business} onChange={handleChange} margin="dense" />
            <TextField fullWidth label="Contact Number" name="contact" value={form.contact} onChange={handleChange} margin="dense" />
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
