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
  Card,
  CardContent,
  Alert,
  InputAdornment,
  Chip,
} from "@mui/material";
import {
  NavigateNext,
  Home as HomeIcon,
  Person,
  Business,
  CalendarToday,
  AttachMoney,
  Description,
  ReceiptLong,
  History,
  Warning,
} from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";

export default function LeaseRenewal() {
  const [leases, setLeases] = useState([]);
  const [selectedLeaseId, setSelectedLeaseId] = useState("");
  const [renewalData, setRenewalData] = useState({
    leaseStart: "",
    leaseEnd: "",
    monthlyRate: "",
    securityDeposit: "",
    paymentTerms: "Monthly",
    remarks: "",
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentLease, setCurrentLease] = useState(null);
  const [availableStalls, setAvailableStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);

  // ✅ Load existing leases and stalls from localStorage
  useEffect(() => {
    const loadData = () => {
      // Load active leases only
      const storedLeases = JSON.parse(localStorage.getItem("leases")) || [];
      const activeLeases = storedLeases.filter(
        (lease) => lease.status === "Active" || lease.status === "Approved"
      );
      setLeases(activeLeases);

      // Load available stalls
      const storedStalls = JSON.parse(localStorage.getItem("stalls")) || [];
      const leasedStallIds = activeLeases.map((lease) => lease.stallId);
      const available = storedStalls.filter(
        (stall) => !leasedStallIds.includes(stall.id)
      );
      setAvailableStalls(available);
    };

    loadData();
  }, []);

  // ✅ Handle selection of lease to renew
  const handleSelectLease = (leaseId) => {
    setSelectedLeaseId(leaseId);
    const lease = leases.find((l) => l.id === leaseId);
    setCurrentLease(lease);

    if (lease) {
      // Auto-calculate renewal dates (1 year from current end date)
      const currentEndDate = new Date(lease.leaseEnd);
      const newStartDate = new Date(currentEndDate);
      newStartDate.setDate(newStartDate.getDate() + 1); // Start day after current lease ends
      const newEndDate = new Date(newStartDate);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1); // 1 year renewal

      // Get current stall details
      const stalls = JSON.parse(localStorage.getItem("stalls")) || [];
      const currentStall = stalls.find((s) => s.id === lease.stallId);
      setSelectedStall(currentStall);

      setRenewalData({
        leaseStart: newStartDate.toISOString().split("T")[0],
        leaseEnd: newEndDate.toISOString().split("T")[0],
        monthlyRate: lease.monthlyRate || "",
        securityDeposit: lease.securityDeposit || "",
        paymentTerms: lease.paymentTerms || "Monthly",
        remarks: "",
      });
    }
  };

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-calculate end date when start date changes
    if (name === "leaseStart" && value) {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      setRenewalData((prev) => ({
        ...prev,
        leaseStart: value,
        leaseEnd: endDate.toISOString().split("T")[0],
      }));
    } else {
      setRenewalData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Handle stall change
  const handleStallChange = (stallId) => {
    const stall = availableStalls.find((s) => s.id === stallId);
    setSelectedStall(stall);
    if (stall && stall.rate) {
      setRenewalData((prev) => ({
        ...prev,
        monthlyRate: stall.rate,
      }));
    }
  };

  // ✅ Calculate lease duration
  const calculateLeaseDuration = () => {
    if (!renewalData.leaseStart || !renewalData.leaseEnd) return "N/A";

    const start = new Date(renewalData.leaseStart);
    const end = new Date(renewalData.leaseEnd);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;

    return `${years > 0 ? `${years} year${years > 1 ? "s" : ""} ` : ""}${
      months > 0 ? `${months} month${months > 1 ? "s" : ""} ` : ""
    }${days > 0 ? `${days} day${days > 1 ? "s" : ""}` : ""}`.trim();
  };

  // ✅ Generate renewal preview text
  const generatePreview = () => {
    if (!currentLease) return "No lease selected.";

    const tenantIdentifier =
      currentLease.tenantId ||
      currentLease.tenantInfo?.name ||
      currentLease.tenantName ||
      "Unknown Tenant";

    const businessName =
      currentLease.tenantInfo?.business ||
      currentLease.tenantBusinessName ||
      "N/A";

    return `
LEASE RENEWAL AGREEMENT

This Renewal Agreement is made between ${tenantIdentifier} (Tenant) representing ${businessName} and OCTAL Philippines Inc. (Lessor).

Previous Lease Information:
- Lease ID: ${currentLease.id}
- Previous Period: ${currentLease.leaseStart} to ${currentLease.leaseEnd}
- Previous Monthly Rate: ₱${currentLease.monthlyRate}
- Stall: ${currentLease.stallId}${selectedStall ? ` (${selectedStall.type || "Stall"})` : ""}

Renewal Terms:
- New Lease Period: ${renewalData.leaseStart} to ${renewalData.leaseEnd}
- Duration: ${calculateLeaseDuration()}
- Updated Monthly Rate: ₱${renewalData.monthlyRate}
- Security Deposit: ${renewalData.securityDeposit ? `₱${renewalData.securityDeposit}` : "N/A"}
- Payment Terms: ${renewalData.paymentTerms}
- Renewal Remarks: ${renewalData.remarks || "Standard renewal with updated terms."}

This renewal shall take effect upon confirmation by both parties.
All other terms and conditions of the original lease agreement remain in full force and effect.

Signed on ${new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}.
    `;
  };

  // ✅ Handle renewal submission
  const handleSubmit = (e) => {
    e?.preventDefault();
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
            // Update lease terms
            leaseStart: renewalData.leaseStart,
            leaseEnd: renewalData.leaseEnd,
            monthlyRate: renewalData.monthlyRate,
            securityDeposit: renewalData.securityDeposit || lease.securityDeposit,
            paymentTerms: renewalData.paymentTerms,

            // Add renewal-specific fields
            remarks: renewalData.remarks || lease.remarks,
            renewedAt: new Date().toISOString(),
            renewalHistory: [
              ...(lease.renewalHistory || []),
              {
                date: new Date().toISOString(),
                previousEnd: lease.leaseEnd,
                newStart: renewalData.leaseStart,
                newEnd: renewalData.leaseEnd,
                rateChange: renewalData.monthlyRate - lease.monthlyRate,
              },
            ],

            // Maintain existing data
            status: "Active",
            tenantId: lease.tenantId || `TENANT-${Date.now()}`,
            tenantInfo: lease.tenantInfo || {
              name: lease.tenantName,
              business: lease.tenantBusinessName,
              contact: lease.tenantContact,
              email: lease.tenantEmail,
              address: lease.tenantAddress,
            },

            // Update stall if changed
            stallId: selectedStall?.id || lease.stallId,
          }
        : lease
    );

    // Save updated leases
    localStorage.setItem("leases", JSON.stringify(updatedLeases));
    
    // Also update in leaseRequests if exists
    const pendingLeases = JSON.parse(localStorage.getItem("leaseRequests")) || [];
    const updatedPending = pendingLeases.map((lease) =>
      lease.id === selectedLeaseId
        ? {
            ...lease,
            leaseStart: renewalData.leaseStart,
            leaseEnd: renewalData.leaseEnd,
            monthlyRate: renewalData.monthlyRate,
            remarks: `Renewed on ${new Date().toLocaleDateString()}. ${renewalData.remarks || ""}`,
          }
        : lease
    );
    localStorage.setItem("leaseRequests", JSON.stringify(updatedPending));

    setLeases(updatedLeases);
    setPreviewOpen(false);

    // Show success and redirect
    alert("Lease renewed successfully!");
    window.location.href = "/lease-records";
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
              display: "flex",
              alignItems: "center",
              "&:hover": {
                color: "#D32F2F",
              },
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
              "&:hover": {
                color: "#D32F2F",
              },
            }}
          >
            Lease Records
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 500 }}>
            Lease Renewal
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight={700} gutterBottom>
          Lease Renewal
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Renew an existing lease agreement with updated terms.
        </Typography>

        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
          <form onSubmit={handleSubmit}>
            {/* SECTION 1: Select Lease */}
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: "#D32F2F",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <History sx={{ mr: 1 }} />
                  Select Lease to Renew
                </Typography>
                <TextField
                  select
                  fullWidth
                  label="Active Lease"
                  value={selectedLeaseId}
                  onChange={(e) => handleSelectLease(e.target.value)}
                  size="small"
                  required
                >
                  <MenuItem value="">
                    <em>Select an active lease</em>
                  </MenuItem>
                  {leases.length > 0 ? (
                    leases.map((lease) => (
                      <MenuItem key={lease.id} value={lease.id}>
                        {lease.id} —{" "}
                        {lease.tenantInfo?.name || lease.tenantName || "Unknown Tenant"} (Stall{" "}
                        {lease.stallId}) • Expires: {lease.leaseEnd}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No active leases available</MenuItem>
                  )}
                </TextField>
                {leases.length === 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No active leases found. Please create a lease first.
                  </Alert>
                )}
              </CardContent>
            </Card>

            {currentLease && (
              <>
                {/* SECTION 2: Current Lease Summary */}
                <Card variant="outlined" sx={{ mb: 4 }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 3,
                        color: "#D32F2F",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <ReceiptLong sx={{ mr: 1 }} />
                      Current Lease Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Tenant Information
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                          <Typography variant="body2">
                            <strong>Name:</strong>{" "}
                            {currentLease.tenantInfo?.name || currentLease.tenantName || "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Business:</strong>{" "}
                            {currentLease.tenantInfo?.business || currentLease.tenantBusinessName || "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Contact:</strong>{" "}
                            {currentLease.tenantInfo?.contact || currentLease.tenantContact || "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Tenant ID:</strong> {currentLease.tenantId || "Pending"}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Current Terms
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                          <Typography variant="body2">
                            <strong>Stall:</strong> {currentLease.stallId}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Period:</strong> {currentLease.leaseStart} to {currentLease.leaseEnd}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Monthly Rate:</strong> ₱{currentLease.monthlyRate}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Payment Terms:</strong> {currentLease.paymentTerms || "Monthly"}
                          </Typography>
                        </Box>
                      </Grid>
                      {currentLease.renewalHistory &&
                        currentLease.renewalHistory.length > 0 && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                              Renewal History
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                              {currentLease.renewalHistory.map((renewal, index) => (
                                <Chip
                                  key={index}
                                  label={`Renewed: ${new Date(renewal.date).toLocaleDateString()}`}
                                  size="small"
                                  color="default"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Grid>
                        )}
                    </Grid>
                  </CardContent>
                </Card>

                {/* SECTION 3: Renewal Terms */}
                <Card variant="outlined" sx={{ mb: 4 }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 3,
                        color: "#D32F2F",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <CalendarToday sx={{ mr: 1 }} />
                      Renewal Terms
                    </Typography>
                    <Grid container spacing={3}>
                      {/* Stall Selection */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          fullWidth
                          label="Stall (Optional Change)"
                          value={selectedStall?.id || currentLease.stallId}
                          onChange={(e) => handleStallChange(e.target.value)}
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Business fontSize="small" color="action" />
                              </InputAdornment>
                            ),
                          }}
                        >
                          <MenuItem value={currentLease.stallId}>
                            Keep current: {currentLease.stallId}
                          </MenuItem>
                          {availableStalls.map((stall) => (
                            <MenuItem key={stall.id} value={stall.id}>
                              {stall.id} - {stall.type || "Stall"} (₱{stall.rate || "0"}/month)
                            </MenuItem>
                          ))}
                        </TextField>
                        {selectedStall && selectedStall.id !== currentLease.stallId && (
                          <Alert severity="info" sx={{ mt: 1 }}>
                            Changing stall from {currentLease.stallId} to {selectedStall.id}
                          </Alert>
                        )}
                      </Grid>

                      {/* Lease Dates */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Renewal Start Date"
                          type="date"
                          name="leaseStart"
                          value={renewalData.leaseStart}
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
                          label="Renewal End Date"
                          type="date"
                          name="leaseEnd"
                          value={renewalData.leaseEnd}
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

                      {/* Financial Terms */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Updated Monthly Rate (₱)"
                          name="monthlyRate"
                          value={renewalData.monthlyRate}
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
                        {renewalData.monthlyRate &&
                          currentLease.monthlyRate && (
                            <Typography
                              variant="caption"
                              color={
                                renewalData.monthlyRate > currentLease.monthlyRate
                                  ? "error"
                                  : renewalData.monthlyRate < currentLease.monthlyRate
                                  ? "success"
                                  : "text.secondary"
                              }
                              sx={{ ml: 1 }}
                            >
                              {renewalData.monthlyRate > currentLease.monthlyRate
                                ? `Increase: ₱${renewalData.monthlyRate - currentLease.monthlyRate}`
                                : renewalData.monthlyRate < currentLease.monthlyRate
                                ? `Decrease: ₱${currentLease.monthlyRate - renewalData.monthlyRate}`
                                : "No change"}
                            </Typography>
                          )}
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Security Deposit (₱)"
                          name="securityDeposit"
                          value={renewalData.securityDeposit}
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
                          value={renewalData.paymentTerms}
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

                      {/* Lease Duration Display */}
                      <Grid item xs={12}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            bgcolor: "#f5f5f5",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>New Lease Duration:</strong> {calculateLeaseDuration()}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* SECTION 4: Additional Information */}
                <Card variant="outlined" sx={{ mb: 4 }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 3,
                        color: "#D32F2F",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Description sx={{ mr: 1 }} />
                      Additional Information
                    </Typography>
                    <TextField
                      fullWidth
                      label="Renewal Remarks / Special Conditions"
                      name="remarks"
                      value={renewalData.remarks}
                      onChange={handleChange}
                      size="small"
                      multiline
                      rows={4}
                      placeholder="Enter any special terms, conditions, or notes for this renewal..."
                    />
                  </CardContent>
                </Card>

                {/* Submit Section */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    pt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => window.history.back()}
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
                      minWidth: "200px",
                    }}
                  >
                    Generate Renewal Preview
                  </Button>
                </Box>
              </>
            )}
          </form>
        </Paper>
      </Box>

      {/* Renewal Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: "#D32F2F", color: "white" }}>
          Lease Renewal Agreement Preview
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Review all renewal terms before confirming. This will
              update the existing lease with new dates and rates.
            </Typography>
          </Alert>

          <Typography
            component="pre"
            sx={{
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
              bgcolor: "#fafafa",
              p: 3,
              borderRadius: 2,
              maxHeight: "400px",
              overflowY: "auto",
              fontSize: "0.875rem",
            }}
          >
            {generatePreview()}
          </Typography>

          {/* Summary Box */}
          <Paper variant="outlined" sx={{ p: 2, mt: 3, bgcolor: "#fff8e1" }}>
            <Typography variant="subtitle2" color="warning.main" gutterBottom>
              <Warning fontSize="small" sx={{ verticalAlign: "middle", mr: 1 }} />
              Important Changes
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  <strong>Previous End Date:</strong> {currentLease?.leaseEnd}
                </Typography>
                <Typography variant="body2">
                  <strong>New End Date:</strong> {renewalData.leaseEnd}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  <strong>Previous Rate:</strong> ₱{currentLease?.monthlyRate}
                </Typography>
                <Typography variant="body2">
                  <strong>New Rate:</strong> ₱{renewalData.monthlyRate}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPreviewOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
            onClick={handleConfirmRenewal}
          >
            Confirm & Renew Lease
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}