import React, { useState, useMemo } from "react";
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
  Chip,
  Tabs,
  Tab,
  Alert,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";

export default function StallAssignment() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([
    {
      stallId: "ST-001",
      originalOwner: "John Smith",
      recentOwner: "Sarah Johnson",
      type: "Food Stall",
      section: "A",
      utilities: {
        electricity: "Metered",
        water: "No",
        drainage: "No",
        ventilation: "Yes",
        structure: "Fixed"
      },
      status: "Available",
      history: [
        {
          tenantId: "TEN-0990",
          tenantName: "Alice Garcia",
          leaseId: "LEASE-1999",
          leaseStart: "2024-01-01",
          leaseEnd: "2024-12-31",
        },
      ],
    },

    {
      stallId: "ST-003",
      originalOwner: "Robert Chen",
      recentOwner: "Robert Chen",
      type: "Service Stall",
      section: "C",
      utilities: {
        electricity: "Metered",
        water: "No",
        drainage: "No",
        ventilation: "No",
        structure: "Fixed"
      },
      status: "Available",
      history: [],
    },
    {
      stallId: "ST-004",
      originalOwner: "Lisa Wong",
      recentOwner: "Michael Brown",
      type: "Kiosk",
      section: "D",
      utilities: {
        electricity: "Metered",
        water: "Yes",
        drainage: "Yes",
        ventilation: "Yes",
        structure: "Mobile"
      },
      status: "Under Maintenance",
      history: [],
    },
    {
      stallId: "ST-005",
      originalOwner: "David Kim",
      recentOwner: "Emma Davis",
      type: "Food Stall",
      section: "A",
      utilities: {
        electricity: "Metered",
        water: "Yes",
        drainage: "No",
        ventilation: "Yes",
        structure: "Fixed"
      },
      status: "Available",
      history: [],
    },
  ]);

  const [openModal, setOpenModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [form, setForm] = useState({
    stallId: "",
    originalOwner: "",
    recentOwner: "",
    type: "",
    section: "",
    utilities: {
      electricity: "Metered",
      water: "No",
      drainage: "No",
      ventilation: "Yes",
      structure: "Fixed"
    },
  });

  // --- Filter available stalls ---
  const availableStalls = useMemo(() => {
    return assignments.filter(stall => stall.status === "Available");
  }, [assignments]);

  // --- Handle field changes ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('utilities.')) {
      const utilityKey = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        utilities: {
          ...prev.utilities,
          [utilityKey]: value
        }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // --- Add New Stall ---
  const handleAddStall = () => {
    if (!form.stallId || !form.type || !form.section) {
      alert("Please fill all required fields.");
      return;
    }

    const stallExists = assignments.some((a) => a.stallId === form.stallId);
    if (stallExists) {
      alert("This Stall ID already exists.");
      return;
    }

    const newStall = {
      ...form,
      status: "Available", // Set as Available by default
      history: [],
    };

    setAssignments((prev) => [...prev, newStall]);
    setOpenModal(false);
    setForm({
      stallId: "",
      originalOwner: "",
      recentOwner: "",
      type: "",
      section: "",
      utilities: {
        electricity: "Metered",
        water: "No",
        drainage: "No",
        ventilation: "Yes",
        structure: "Fixed"
      },
    });
  };

  // --- View History ---
  const handleViewHistory = (history) => {
    setSelectedHistory(history);
    setHistoryModal(true);
  };

  // --- Ready for Leasing Button Handler ---
  const handleReadyForLeasing = (stallId) => {
    // Navigate to lease creation page with stall ID
    navigate(`/lease-creation?stallId=${stallId}`);
  };

  // --- Delete Stall ---
  const handleDeleteStall = (stallId) => {
    if (window.confirm(`Are you sure you want to delete stall ${stallId}?`)) {
      setAssignments((prev) => prev.filter((a) => a.stallId !== stallId));
    }
  };

  // --- Get Status Chip Color ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Occupied": return "warning";
      case "Available": return "success";
      case "Under Maintenance": return "error";
      default: return "default";
    }
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
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 0.5,
              '&:hover': { color: '#D32F2F' }
            }}
          >
            <HomeIcon fontSize="small" /> Dashboard
          </Link>
          <Link 
            underline="hover" 
            color="inherit" 
            href="#"
            sx={{'&:hover': { color: '#D32F2F' }}}
          >
            Stall Management
          </Link>
          <Typography color="text.primary">Available Stalls</Typography>
        </Breadcrumbs>

        {/* === Page Header === */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="black" gutterBottom>
              Available Stalls
            </Typography>
            <Typography color="text.secondary">
              List of all available stalls ready for leasing.
            </Typography>
          </Box>
          
          {/* Stats Summary */}
          <Stack direction="row" spacing={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main" fontWeight={700}>
                {availableStalls.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available
              </Typography>
            </Box>

          </Stack>
        </Box>

        {/* === Information Alert === */}
        {availableStalls.length === 0 ? (
          <Alert 
            severity="info" 
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small"
                onClick={() => setOpenModal(true)}
              >
                ADD STALL
              </Button>
            }
          >
            No available stalls found. Add a new stall to get started.
          </Alert>
        ) : (
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: 2 }}
            icon={<FilterIcon />}
          >
            Showing {availableStalls.length} available stall{availableStalls.length !== 1 ? 's' : ''} ready for leasing.
          </Alert>
        )}

        {/* === Toolbar === */}
        <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ 
              bgcolor: "#D32F2F", 
              "&:hover": { bgcolor: "#B71C1C" } 
            }}
            onClick={() => setOpenModal(true)}
          >
            Add New Stall
          </Button>
        </Box>

        {/* === Available Stalls Table === */}
        {availableStalls.length > 0 && (
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: 3,
              maxHeight: 600,
              overflow: 'auto'
            }}
          >
            <Table stickyHeader>
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell><b>Stall ID</b></TableCell>
                  <TableCell><b>Original Owner</b></TableCell>
                  <TableCell><b>Recent Owner</b></TableCell>
                  <TableCell><b>Type</b></TableCell>
                  <TableCell><b>Section</b></TableCell>
                  <TableCell><b>Utilities</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell align="center"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availableStalls.map((stall, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{stall.stallId}</TableCell>
                    <TableCell>{stall.originalOwner || "-"}</TableCell>
                    <TableCell>{stall.recentOwner || "-"}</TableCell>
                    <TableCell>{stall.type}</TableCell>
                    <TableCell>{stall.section}</TableCell>
                    <TableCell>
                      <Box sx={{ fontSize: '0.875rem' }}>
                        <div><strong>Electricity:</strong> {stall.utilities.electricity}</div>
                        <div><strong>Water:</strong> {stall.utilities.water}</div>
                        <div><strong>Drainage:</strong> {stall.utilities.drainage}</div>
                        <div><strong>Ventilation:</strong> {stall.utilities.ventilation}</div>
                        <div><strong>Structure:</strong> {stall.utilities.structure}</div>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={stall.status}
                        color={getStatusColor(stall.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {/* View History Button */}
                      <Tooltip title="View History">
                        <IconButton 
                          onClick={() => handleViewHistory(stall.history)}
                          size="small"
                        >
                          <HistoryIcon fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>
                      
                      {/* Ready for Leasing Button */}
                      <Tooltip title="Ready for Leasing">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AssignmentIcon />}
                          sx={{ 
                            ml: 1,
                            bgcolor: "#4CAF50",
                            '&:hover': { bgcolor: "#388E3C" }
                          }}
                          onClick={() => handleReadyForLeasing(stall.stallId)}
                        >
                          Ready for Leasing
                        </Button>
                      </Tooltip>
                      
                      {/* Delete Button */}
                      <Tooltip title="Delete Stall">
                        <IconButton
                          onClick={() => handleDeleteStall(stall.stallId)}
                          color="error"
                          size="small"
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* === Add Stall Modal === */}
        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: "#D32F2F", color: "white" }}>
            Add New Stall
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              {/* Basic Information */}
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Stall ID *"
                  name="stallId"
                  value={form.stallId}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  label="Type *"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  select
                  required
                >
                  <MenuItem value="Food Stall">Food Stall</MenuItem>
                  <MenuItem value="Retail Stall">Retail Stall</MenuItem>
                  <MenuItem value="Service Stall">Service Stall</MenuItem>
                  <MenuItem value="Kiosk">Kiosk</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Original Owner"
                  name="originalOwner"
                  value={form.originalOwner}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="Recent Owner"
                  name="recentOwner"
                  value={form.recentOwner}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="Section *"
                  name="section"
                  value={form.section}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="A">Section A</MenuItem>
                  <MenuItem value="B">Section B</MenuItem>
                  <MenuItem value="C">Section C</MenuItem>
                  <MenuItem value="D">Section D</MenuItem>
                </TextField>
              </Box>

              {/* Utilities Section */}
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Utilities</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Electricity"
                  name="utilities.electricity"
                  value={form.utilities.electricity}
                  onChange={handleChange}
                  select
                >
                  <MenuItem value="Metered">Metered</MenuItem>
                  <MenuItem value="Unmetered">Unmetered</MenuItem>
                  <MenuItem value="None">None</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Water"
                  name="utilities.water"
                  value={form.utilities.water}
                  onChange={handleChange}
                  select
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Drainage"
                  name="utilities.drainage"
                  value={form.utilities.drainage}
                  onChange={handleChange}
                  select
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Ventilation"
                  name="utilities.ventilation"
                  value={form.utilities.ventilation}
                  onChange={handleChange}
                  select
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Structure"
                  name="utilities.structure"
                  value={form.utilities.structure}
                  onChange={handleChange}
                  select
                >
                  <MenuItem value="Fixed">Fixed</MenuItem>
                  <MenuItem value="Temporary">Temporary</MenuItem>
                  <MenuItem value="Mobile">Mobile</MenuItem>
                </TextField>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button
              onClick={handleAddStall}
              variant="contained"
              sx={{ bgcolor: "#D32F2F", '&:hover': { bgcolor: "#B71C1C" } }}
            >
              Add Stall
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
                    <TableCell><b>Tenant Name</b></TableCell>
                    <TableCell><b>Lease ID</b></TableCell>
                    <TableCell><b>Start</b></TableCell>
                    <TableCell><b>End</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedHistory.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell>{h.tenantName}</TableCell>
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