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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { NavigateNext, Home as HomeIcon } from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";

export default function LeaseManagement() {
  const [leaseData, setLeaseData] = useState({
    tenantId: "",
    stallId: "",
    leaseStart: "",
    leaseEnd: "",
    monthlyRate: "",
    paymentTerms: "",
    securityDeposit: "",
    remarks: "",
  });

  const [tenants, setTenants] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [leaseAgreements, setLeaseAgreements] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const storedTenants = JSON.parse(localStorage.getItem("tenants")) || [];
    const storedStalls = JSON.parse(localStorage.getItem("stalls")) || [];
    const storedLeases = JSON.parse(localStorage.getItem("leases")) || [];

    setTenants(storedTenants);
    setStalls(storedStalls);
    setLeaseAgreements(storedLeases);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeaseData((prev) => ({ ...prev, [name]: value }));
  };

  const generatePreview = () => {
    const tenant = tenants.find((t) => t.id === leaseData.tenantId);
    const stall = stalls.find((s) => s.id === leaseData.stallId);

    return `
LEASE AGREEMENT

This agreement is made between ${tenant?.name || "Tenant"} (Tenant)
and OCTAL Philippines Inc. (Lessor) for the lease of stall
${stall?.id || "N/A"} effective from ${leaseData.leaseStart} to ${leaseData.leaseEnd}.

Terms:
- Monthly Rate: ₱${leaseData.monthlyRate}
- Payment Terms: ${leaseData.paymentTerms}
- Security Deposit: ₱${leaseData.securityDeposit}

Remarks: ${leaseData.remarks || "N/A"}

Signed on ${new Date().toLocaleDateString()}.
    `;
  };

  const handleSubmit = () => {
    if (
      !leaseData.tenantId ||
      !leaseData.stallId ||
      !leaseData.leaseStart ||
      !leaseData.leaseEnd ||
      !leaseData.monthlyRate
    ) {
      alert("Please fill all required fields.");
      return;
    }

    setPreviewOpen(true);
  };

  const handleConfirmLease = () => {
    const newLease = {
      ...leaseData,
      id: `LEASE-${String(leaseAgreements.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [...leaseAgreements, newLease];
    localStorage.setItem("leases", JSON.stringify(updated));
    setLeaseAgreements(updated);
    setPreviewOpen(false);
    setFormOpen(false);
    setLeaseData({
      tenantId: "",
      stallId: "",
      leaseStart: "",
      leaseEnd: "",
      monthlyRate: "",
      paymentTerms: "",
      securityDeposit: "",
      remarks: "",
    });
    alert("Lease agreement saved successfully!");
  };

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
          <Typography color="text.primary" sx={{ fontWeight: 500 }}>
            Lease Creation
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight={700} gutterBottom>
          Lease Management
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Manage existing lease agreements and create new ones for tenants and stalls.
        </Typography>

        {/* CREATE BUTTON */}
        <Box sx={{ textAlign: "right", mb: 2 }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#D32F2F",
              "&:hover": { bgcolor: "#B71C1C" },
              textTransform: "none",
            }}
            onClick={() => setFormOpen(true)}
          >
            + Create Lease
          </Button>
        </Box>

        {/* LEASE TABLE */}
        <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
          {leaseAgreements.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell><b>Lease ID</b></TableCell>
                    <TableCell><b>Tenant</b></TableCell>
                    <TableCell><b>Stall</b></TableCell>
                    <TableCell><b>Start Date</b></TableCell>
                    <TableCell><b>End Date</b></TableCell>
                    <TableCell><b>Monthly Rate</b></TableCell>
                    <TableCell><b>Created</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaseAgreements.map((lease) => {
                    const tenant = tenants.find((t) => t.id === lease.tenantId);
                    const stall = stalls.find((s) => s.id === lease.stallId);
                    return (
                      <TableRow key={lease.id}>
                        <TableCell>{lease.id}</TableCell>
                        <TableCell>{tenant?.name || lease.tenantId}</TableCell>
                        <TableCell>{stall?.id || lease.stallId}</TableCell>
                        <TableCell>{lease.leaseStart}</TableCell>
                        <TableCell>{lease.leaseEnd}</TableCell>
                        <TableCell>₱{lease.monthlyRate}</TableCell>
                        <TableCell>
                          {new Date(lease.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary" align="center" py={4}>
              No lease agreements found. Click "Create Lease" to add one.
            </Typography>
          )}
        </Paper>
      </Box>

      {/* LEASE CREATION FORM (DIALOG) */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{backgroundColor:"#D32F2F", color:"white"}}>Create New Lease</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} mt={1}>
            {/* LEFT COLUMN */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  select
                  label="Tenant ID"
                  name="tenantId"
                  value={leaseData.tenantId}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                >
                  {tenants.length > 0 ? (
                    tenants.map((tenant) => (
                      <MenuItem key={tenant.id} value={tenant.id}>
                        {tenant.id} — {tenant.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No tenants available</MenuItem>
                  )}
                </TextField>

                <TextField
                      
                  label="Stall ID"
                  name="stallId"
                  value={leaseData.stallId}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                >
                  {stalls.length > 0 ? (
                    stalls.map((stall) => (
                      <MenuItem key={stall.id} value={stall.id}>
                        {stall.id} — {stall.name || stall.type || "Stall"}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No stalls available</MenuItem>
                  )}
                </TextField>

                <TextField
                  label="Lease Start Date"
                  type="date"
                  name="leaseStart"
                  value={leaseData.leaseStart}
                  onChange={handleChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Lease End Date"
                  type="date"
                  name="leaseEnd"
                  value={leaseData.leaseEnd}
                  onChange={handleChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Grid>

            {/* RIGHT COLUMN */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Monthly Rate (₱)"
                  name="monthlyRate"
                  value={leaseData.monthlyRate}
                  onChange={handleChange}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Payment Terms"
                  name="paymentTerms"
                  value={leaseData.paymentTerms}
                  onChange={handleChange}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Security Deposit (₱)"
                  name="securityDeposit"
                  value={leaseData.securityDeposit}
                  onChange={handleChange}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Remarks"
                  name="remarks"
                  multiline
                  rows={3}
                  value={leaseData.remarks}
                  onChange={handleChange}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#D32F2F",
              "&:hover": { bgcolor: "#B71C1C" },
            }}
            onClick={handleSubmit}
          >
            Generate Preview
          </Button>
        </DialogActions>
      </Dialog>

      {/* PREVIEW DIALOG */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Lease Agreement Preview</DialogTitle>
        <DialogContent dividers>
          <Typography
            component="pre"
            sx={{
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
              bgcolor: "#fafafa",
              p: 2,
              borderRadius: 2,
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {generatePreview()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
            onClick={handleConfirmLease}
          >
            Confirm & Save
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}