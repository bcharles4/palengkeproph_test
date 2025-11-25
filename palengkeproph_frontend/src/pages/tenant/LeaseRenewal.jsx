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
} from "@mui/material";
import { NavigateNext, Home as HomeIcon } from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";

export default function LeaseRenewal() {
  const [leases, setLeases] = useState([]);
  const [selectedLeaseId, setSelectedLeaseId] = useState("");
  const [renewalData, setRenewalData] = useState({
    leaseStart: "",
    leaseEnd: "",
    monthlyRate: "",
    remarks: "",
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentLease, setCurrentLease] = useState(null);

  // ✅ Load existing leases from localStorage
  useEffect(() => {
    const storedLeases = JSON.parse(localStorage.getItem("leases")) || [];
    setLeases(storedLeases);
  }, []);

  // ✅ Handle selection of lease to renew
  const handleSelectLease = (leaseId) => {
    setSelectedLeaseId(leaseId);
    const lease = leases.find((l) => l.id === leaseId);
    setCurrentLease(lease);
    setRenewalData({
      leaseStart: lease?.leaseStart || "",
      leaseEnd: lease?.leaseEnd || "",
      monthlyRate: lease?.monthlyRate || "",
      remarks: "",
    });
  };

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRenewalData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Generate renewal preview text
  const generatePreview = () => {
    if (!currentLease) return "No lease selected.";
    return `
      LEASE RENEWAL AGREEMENT

      This Renewal Agreement is made between ${
        currentLease.tenantId
      } (Tenant) and OCTAL Philippines Inc. (Lessor).

      Previous Lease Period:
      ${currentLease.leaseStart} to ${currentLease.leaseEnd}

      Renewal Terms:
      - New Lease Period: ${renewalData.leaseStart} to ${renewalData.leaseEnd}
      - Updated Monthly Rate: ₱${renewalData.monthlyRate}
      - Remarks: ${renewalData.remarks || "N/A"}

      This renewal shall take effect upon confirmation by both parties.
      Signed on ${new Date().toLocaleDateString()}.
    `;
  };

  // ✅ Handle renewal submission
  const handleSubmit = () => {
    if (!selectedLeaseId || !renewalData.leaseStart || !renewalData.leaseEnd) {
      alert("Please select a lease and fill in the renewal details.");
      return;
    }
    setPreviewOpen(true);
  };

  // ✅ Confirm and save renewal
  const handleConfirmRenewal = () => {
    const updatedLeases = leases.map((lease) =>
      lease.id === selectedLeaseId
        ? {
            ...lease,
            leaseStart: renewalData.leaseStart,
            leaseEnd: renewalData.leaseEnd,
            monthlyRate: renewalData.monthlyRate,
            remarks: renewalData.remarks,
            renewedAt: new Date().toISOString(),
          }
        : lease
    );

    localStorage.setItem("leases", JSON.stringify(updatedLeases));
    setLeases(updatedLeases);
    setPreviewOpen(false);
    alert("Lease renewed successfully!");
    window.location.href = "/tenant-management";
  };

  return (
    <MainLayout>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          mt: 4,
          minHeight: "80vh",
          p: 2,
        }}
      >
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            width: "100%",
            maxWidth: 750,
            boxShadow: 4,
          }}
        >
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
              href="/lease-management"
              sx={{ 
                '&:hover': {
                  color: '#D32F2F'
                }
              }}
            >
              Lease Creation
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 500 }}>
              Lease Renewal
            </Typography>
          </Breadcrumbs>

          <Typography variant="h4" fontWeight={700} gutterBottom>
            Lease Renewal
          </Typography>
          <Typography mb={3} color="text.secondary">
            Select an existing lease and modify details to renew the agreement.
          </Typography>

          {/* Lease selection */}
          <TextField
            select
            fullWidth
            label="Select Lease to Renew"
            value={selectedLeaseId}
            onChange={(e) => handleSelectLease(e.target.value)}
            margin="normal"
          >
            {leases.length > 0 ? (
              leases.map((lease) => (
                <MenuItem key={lease.id} value={lease.id}>
                  {lease.id} — Tenant {lease.tenantId} (Stall {lease.stallId})
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No leases available</MenuItem>
            )}
          </TextField>

          {currentLease && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Current Lease Details:
              </Typography>
              <Typography variant="body2" sx={{ color: "gray", mb: 2 }}>
                Tenant ID: {currentLease.tenantId} <br />
                Stall ID: {currentLease.stallId} <br />
                Lease Period: {currentLease.leaseStart} →{" "}
                {currentLease.leaseEnd} <br />
                Monthly Rate: ₱{currentLease.monthlyRate}
              </Typography>

              {/* Renewal Form */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Lease Start Date"
                    type="date"
                    name="leaseStart"
                    value={renewalData.leaseStart}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    margin="dense"
                  />
                  <TextField
                    fullWidth
                    label="New Lease End Date"
                    type="date"
                    name="leaseEnd"
                    value={renewalData.leaseEnd}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    margin="dense"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Updated Monthly Rate (₱)"
                    name="monthlyRate"
                    value={renewalData.monthlyRate}
                    onChange={handleChange}
                    margin="dense"
                  />
                  
                  <TextField
                    fullWidth
                    label="Remarks"
                    name="remarks"
                    multiline
                    rows={3}
                    value={renewalData.remarks}
                    onChange={handleChange}
                    margin="dense"
                  />
                </Grid>

                <Grid item xs={12} sx={{ textAlign: "right", mt: 2 }}>
                  <Button onClick={() => window.history.back()} sx={{ mr: 2 }}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "#D32F2F",
                      "&:hover": { bgcolor: "#B71C1C" },
                    }}
                    onClick={handleSubmit}
                  >
                    Generate Renewal Preview
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Renewal Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Lease Renewal Agreement Preview</DialogTitle>
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
            onClick={handleConfirmRenewal}
          >
            Confirm & Renew
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}