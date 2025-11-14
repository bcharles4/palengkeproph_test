import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  Stack,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { Monitor, Receipt, RefreshCw } from "lucide-react";
import MainLayout from "../../layouts/MainLayout";

const CollectionManagement = () => {
  const [collectors, setCollectors] = useState([
    { id: "C-001", name: "Juan Dela Cruz", area: "Stall Area A" },
    { id: "C-002", name: "Maria Santos", area: "Parking Zone 1" },
  ]);
  const [transactions, setTransactions] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [reconciliationResult, setReconciliationResult] = useState(null);
  const [openAuditDialog, setOpenAuditDialog] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    setTransactions([
      {
        id: "TXN-001",
        collectorId: "C-001",
        payer: "Tenant 001",
        amount: 1500,
        receiptNo: "R-1001",
        date: "2025-10-27",
      },
      {
        id: "TXN-002",
        collectorId: "C-002",
        payer: "Parking User",
        amount: 100,
        receiptNo: "R-2001",
        date: "2025-10-28",
      },
    ]);
  }, []);

  const handleAssignCollector = (id, area) => {
    const updated = collectors.map((c) => (c.id === id ? { ...c, area } : c));
    setCollectors(updated);
    setAlert({
      open: true,
      message: `Collector ${id} assigned to ${area}`,
      severity: "success",
    });
  };

  const handleReconcile = () => {
    if (!selectedCollector || !cashReceived) {
      setAlert({
        open: true,
        message: "Please select a collector and enter cash amount.",
        severity: "warning",
      });
      return;
    }

    const totalCollected = transactions
      .filter((t) => t.collectorId === selectedCollector)
      .reduce((sum, t) => sum + t.amount, 0);

    const diff = cashReceived - totalCollected;
    setReconciliationResult({ totalCollected, diff });
    setAlert({
      open: true,
      message:
        diff === 0
          ? "Reconciliation complete. All amounts match."
          : "Reconciliation discrepancy detected.",
      severity: diff === 0 ? "success" : "error",
    });
  };

  const handleGenerateAudit = () => {
    const random = transactions[Math.floor(Math.random() * transactions.length)];
    if (random) {
      const newAudit = {
        id: `AUD-${Date.now()}`,
        collectorId: random.collectorId,
        receiptNo: random.receiptNo,
        amount: random.amount,
        date: new Date().toLocaleDateString(),
      };
      setAuditLogs((prev) => [...prev, newAudit]);
      setOpenAuditDialog(true);
    }
  };

  return (
    <MainLayout>
      {/* 🧭 Breadcrumbs */}
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            href="/dashboard"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <HomeIcon fontSize="small" /> Dashboard
          </Link>
          <Typography color="text.primary">Collection Management</Typography>
        </Breadcrumbs>
      </Box>

      {/* 🔖 Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight={700}>
          Collection Management
        </Typography>
      </Stack>

      {/* SECTION 1: Collector Assignment */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
        >
          <AssignmentIndIcon fontSize="small" /> Collector Assignment
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Table>
          <TableHead sx={{ bgcolor: "#f9f9f9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Collector ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Assigned Area</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Reassign</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collectors.map((col) => (
              <TableRow key={col.id}>
                <TableCell>{col.id}</TableCell>
                <TableCell>{col.name}</TableCell>
                <TableCell>{col.area}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    placeholder="Enter new area"
                    onBlur={(e) => handleAssignCollector(col.id, e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* SECTION 2: Reconciliation */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Receipt size={20} /> Reconciliation
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Select Collector"
              value={selectedCollector}
              onChange={(e) => setSelectedCollector(e.target.value)}
            >
              {collectors.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ({c.id})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Cash Received (₱)"
              type="number"
              value={cashReceived}
              onChange={(e) => setCashReceived(parseFloat(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              fullWidth
              sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
              onClick={handleReconcile}
            >
              Reconcile
            </Button>
          </Grid>
        </Grid>

        {reconciliationResult && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "#fef6f6",
              borderRadius: 2,
              border: "1px solid #ffcdd2",
            }}
          >
            <Typography>
              <strong>Total Collected:</strong> ₱
              {reconciliationResult.totalCollected.toLocaleString()}
            </Typography>
            <Typography
              sx={{
                color: reconciliationResult.diff === 0 ? "green" : "red",
                fontWeight: 500,
              }}
            >
              Difference: ₱{reconciliationResult.diff.toLocaleString()}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* SECTION 3: Collector Activity Dashboard */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)", mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Monitor size={20} /> Collector Activity Dashboard
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Table>
          <TableHead sx={{ bgcolor: "#f9f9f9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Collector</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Transactions</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Total Collected (₱)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collectors.map((c) => {
              const total = transactions
                .filter((t) => t.collectorId === c.id)
                .reduce((sum, t) => sum + t.amount, 0);
              const count = transactions.filter((t) => t.collectorId === c.id).length;
              return (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{count}</TableCell>
                  <TableCell>₱{total.toLocaleString()}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Button
          sx={{
            mt: 2,
            color: "#D32F2F",
            borderColor: "#D32F2F",
            "&:hover": { bgcolor: "#fdecea", borderColor: "#B71C1C" },
          }}
          variant="outlined"
          startIcon={<RefreshCw size={16} />}
          onClick={handleGenerateAudit}
        >
          Generate Audit Request
        </Button>
      </Paper>

      {/* Audit Dialog */}
      <Dialog
        open={openAuditDialog}
        onClose={() => setOpenAuditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#D32F2F", color: "white" }}>
          Audit Request Generated
        </DialogTitle>
        <DialogContent dividers>
          {auditLogs.length > 0 ? (
            auditLogs.map((a) => (
              <Box
                key={a.id}
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: "#f9f9f9",
                  borderRadius: 2,
                  border: "1px solid #eee",
                }}
              >
                <Typography>
                  <b>Audit ID:</b> {a.id}
                </Typography>
                <Typography>
                  <b>Collector:</b> {a.collectorId}
                </Typography>
                <Typography>
                  <b>Receipt:</b> {a.receiptNo}
                </Typography>
                <Typography>
                  <b>Amount:</b> ₱{a.amount.toLocaleString()}
                </Typography>
                <Typography>
                  <b>Date:</b> {a.date}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography>No audit logs yet.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAuditDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default CollectionManagement;
