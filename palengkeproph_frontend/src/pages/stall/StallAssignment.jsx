import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Add as AddIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";

export default function StallAssignment() {
  const [assignments, setAssignments] = useState([
    {
      stallId: "ST-001",
      tenantId: "TEN-1001",
      leaseId: "LEASE-2001",
      leaseStart: "2025-01-10",
      leaseEnd: "2025-12-31",
      assignedDate: "2025-01-09",
      history: [
        {
          tenantId: "TEN-0990",
          leaseId: "LEASE-1999",
          leaseStart: "2024-01-01",
          leaseEnd: "2024-12-31",
        },
      ],
      status: "Occupied",
    },
  ]);

  const [openModal, setOpenModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [form, setForm] = useState({
    stallId: "",
    tenantId: "",
    leaseId: "",
    leaseStart: "",
    leaseEnd: "",
  });

  // --- Handle field changes ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- Add Stall Assignment ---
  const handleAssign = () => {
    if (!form.stallId || !form.tenantId || !form.leaseStart || !form.leaseEnd) {
      alert("Please fill all required fields.");
      return;
    }

    const startDate = new Date(form.leaseStart);
    if (startDate < new Date()) {
      alert("Lease start date cannot be in the past.");
      return;
    }

    const isOccupied = assignments.some(
      (a) => a.stallId === form.stallId && a.status === "Occupied"
    );
    if (isOccupied) {
      alert("This stall is already occupied.");
      return;
    }

    const newAssignment = {
      ...form,
      assignedDate: new Date().toISOString(),
      status: "Occupied",
      history: [],
    };

    setAssignments((prev) => [...prev, newAssignment]);
    setOpenModal(false);
    setForm({
      stallId: "",
      tenantId: "",
      leaseId: "",
      leaseStart: "",
      leaseEnd: "",
    });
  };

  // --- View History ---
  const handleViewHistory = (history) => {
    setSelectedHistory(history);
    setHistoryModal(true);
  };

  // --- End Lease / Delete ---
  const handleEndLease = (stallId) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.stallId === stallId
          ? {
              ...a,
              status: "Available",
              history: [
                ...a.history,
                {
                  tenantId: a.tenantId,
                  leaseId: a.leaseId,
                  leaseStart: a.leaseStart,
                  leaseEnd: a.leaseEnd,
                },
              ],
              tenantId: "",
              leaseId: "",
              leaseStart: "",
              leaseEnd: "",
            }
          : a
      )
    );
  };

  return (
    <MainLayout>
      <Box>
        {/* === Breadcrumbs === */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/dashboard"
            sx={{ display: "flex", alignItems: "center", gap: 0.5,'&:hover': {
                color: '#D32F2F'
              } }}
          >
            <HomeIcon fontSize="small" /> Dashboard
          </Link>
          <Link underline="hover" color="inherit" href="#" sx={{'&:hover': {
                color: '#D32F2F'
              }}}>
            Stall Management
          </Link>
          <Typography color="text.primary">Stall Assignment</Typography>
        </Breadcrumbs>

        {/* === Page Header === */}
        <Typography variant="h4" fontWeight={700} color="black" gutterBottom>
          Stall Assignment
        </Typography>
        <Typography mb={3} color="text.secondary">
          Manage and track tenant assignments, leases, and stall occupancy.
        </Typography>

        {/* === Toolbar === */}
        <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
            onClick={() => setOpenModal(true)}
          >
            Assign Stall
          </Button>
        </Box>

        {/* === Assignment Table === */}
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell><b>Stall ID</b></TableCell>
                <TableCell><b>Tenant ID</b></TableCell>
                <TableCell><b>Lease ID</b></TableCell>
                <TableCell><b>Lease Start</b></TableCell>
                <TableCell><b>Lease End</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell align="center"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((a, index) => (
                <TableRow key={index} hover>
                  <TableCell>{a.stallId}</TableCell>
                  <TableCell>{a.tenantId || "-"}</TableCell>
                  <TableCell>{a.leaseId || "-"}</TableCell>
                  <TableCell>{a.leaseStart || "-"}</TableCell>
                  <TableCell>{a.leaseEnd || "-"}</TableCell>
                  <TableCell
                    sx={{
                      color: a.status === "Occupied" ? "#1976D2" : "#4CAF50",
                      fontWeight: 600,
                    }}
                  >
                    {a.status}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View History">
                      <IconButton onClick={() => handleViewHistory(a.history)}>
                        <HistoryIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                    {a.status === "Occupied" && (
                      <Tooltip title="End Lease">
                        <IconButton
                          onClick={() => handleEndLease(a.stallId)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {assignments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No stall assignments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* === Add Assignment Modal === */}
        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: "#D32F2F", color: "white" }}>
            Assign Stall to Tenant
          </DialogTitle>
          <DialogContent dividers>
            <TextField
              fullWidth
              label="Stall ID"
              name="stallId"
              value={form.stallId}
              onChange={handleChange}
              margin="dense"
            />
            <TextField
              fullWidth
              label="Tenant ID"
              name="tenantId"
              value={form.tenantId}
              onChange={handleChange}
              margin="dense"
            />
            <TextField
              fullWidth
              label="Lease Agreement ID"
              name="leaseId"
              value={form.leaseId}
              onChange={handleChange}
              margin="dense"
            />
            <TextField
              fullWidth
              label="Lease Start Date"
              name="leaseStart"
              value={form.leaseStart}
              onChange={handleChange}
              margin="dense"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Lease End Date"
              name="leaseEnd"
              value={form.leaseEnd}
              onChange={handleChange}
              margin="dense"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button
              onClick={handleAssign}
              variant="contained"
              color="primary"
              sx={{ bgcolor: "#D32F2F" }}
            >
              Assign
            </Button>
          </DialogActions>
        </Dialog>

        {/* === History Modal === */}
        <Dialog
          open={historyModal}
          onClose={() => setHistoryModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Stall Assignment History</DialogTitle>
          <DialogContent dividers>
            {selectedHistory.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><b>Tenant ID</b></TableCell>
                    <TableCell><b>Lease ID</b></TableCell>
                    <TableCell><b>Start</b></TableCell>
                    <TableCell><b>End</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedHistory.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell>{h.tenantId}</TableCell>
                      <TableCell>{h.leaseId}</TableCell>
                      <TableCell>{h.leaseStart}</TableCell>
                      <TableCell>{h.leaseEnd}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography>No previous assignments found.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHistoryModal(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}
