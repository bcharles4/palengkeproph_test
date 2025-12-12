import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  Avatar,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Receipt,
  FileSpreadsheet,
  Trash2,
  PlusCircle,
  AlertTriangle,
  Users,
  Eye,
  X,
  Download,
  FileText,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Shield,
  Building,
  Home,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  UserCheck,
  UserX,
  FileCheck,
} from "lucide-react";
import MainLayout from "../../layouts/MainLayout";

export default function TenantAccountManagement() {
  // Tenant status statistics
  const [tenantStats, setTenantStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    overdue: 0
  });

  // Mock tenant data with documents
  const [tenants, setTenants] = useState([
    {
      id: "TEN-001",
      leaseId: "LEASE-001",
      name: "Juan Dela Cruz",
      stallId: "STALL-101",
      email: "juan.delacruz@email.com",
      phone: "+63 912 345 6789",
      joinDate: "2023-01-15",
      status: "Active",
      business: "Dela Cruz Eatery",
      address: "123 Main St, Quezon City",
      period: "2023-01-15 to 2024-01-14",
      paymentTerms: "Monthly",
      monthlyRent: 5000,
      securityDeposit: 10000,
      documents: {
        validId: { uploaded: true, date: "2023-01-10", file: "juan_delacruz_id.pdf" },
        businessPermit: { uploaded: true, date: "2023-01-12", file: "delacruz_eatery_permit.pdf" },
        barangayPermit: { uploaded: true, date: "2023-01-12", file: "delacruz_barangay_permit.pdf" },
        leaseContract: { uploaded: true, date: "2023-01-14", file: "lease_contract_001.pdf" }
      }
    },
    {
      id: "TEN-002",
      leaseId: "LEASE-002",
      name: "Maria Santos",
      stallId: "STALL-102",
      email: "maria.santos@email.com",
      phone: "+63 917 654 3210",
      joinDate: "2023-02-20",
      status: "Active",
      business: "Maria's General Store",
      address: "456 Elm St, Makati City",
      period: "2023-02-20 to 2024-02-19",
      paymentTerms: "Weekly",
      monthlyRent: 2000,
      securityDeposit: 4000,
      documents: {
        validId: { uploaded: true, date: "2023-02-15", file: "maria_santos_id.pdf" },
        businessPermit: { uploaded: false, date: null, file: null },
        barangayPermit: { uploaded: true, date: "2023-02-18", file: "santos_barangay_permit.pdf" },
        leaseContract: { uploaded: true, date: "2023-02-19", file: "lease_contract_002.pdf" }
      }
    },
    {
      id: "TEN-003",
      leaseId: "LEASE-003",
      name: "Pedro Reyes",
      stallId: "STALL-103",
      email: "pedro.reyes@email.com",
      phone: "+63 918 777 8888",
      joinDate: "2023-03-10",
      status: "Inactive",
      business: "Reyes Auto Repair",
      address: "789 Oak St, Manila",
      period: "2023-03-10 to 2024-03-09",
      paymentTerms: "Monthly",
      monthlyRent: 6000,
      securityDeposit: 12000,
      documents: {
        validId: { uploaded: true, date: "2023-03-05", file: "pedro_reyes_id.pdf" },
        businessPermit: { uploaded: true, date: "2023-03-08", file: "reyes_auto_permit.pdf" },
        barangayPermit: { uploaded: false, date: null, file: null },
        leaseContract: { uploaded: true, date: "2023-03-09", file: "lease_contract_003.pdf" }
      }
    },
    {
      id: "TEN-004",
      leaseId: "LEASE-004",
      name: "Ana Lim",
      stallId: "STALL-104",
      email: "ana.lim@email.com",
      phone: "+63 919 555 6666",
      joinDate: "2023-01-25",
      status: "Active",
      business: "Lim's Electronics",
      address: "321 Pine St, Taguig",
      period: "2023-01-25 to 2024-01-24",
      paymentTerms: "Monthly",
      monthlyRent: 4500,
      securityDeposit: 9000,
      documents: {
        validId: { uploaded: true, date: "2023-01-20", file: "ana_lim_id.pdf" },
        businessPermit: { uploaded: true, date: "2023-01-22", file: "lim_electronics_permit.pdf" },
        barangayPermit: { uploaded: true, date: "2023-01-23", file: "lim_barangay_permit.pdf" },
        leaseContract: { uploaded: true, date: "2023-01-24", file: "lease_contract_004.pdf" }
      }
    },
    {
      id: "TEN-005",
      leaseId: "LEASE-005",
      name: "Carlos Garcia",
      stallId: "STALL-105",
      email: "carlos.garcia@email.com",
      phone: "+63 920 111 2222",
      joinDate: "2023-04-01",
      status: "Pending",
      business: "Garcia Pharmacy",
      address: "555 Maple St, Pasig",
      period: "2023-04-01 to 2024-03-31",
      paymentTerms: "Monthly",
      monthlyRent: 5500,
      securityDeposit: 11000,
      documents: {
        validId: { uploaded: true, date: "2023-03-28", file: "carlos_garcia_id.pdf" },
        businessPermit: { uploaded: false, date: null, file: null },
        barangayPermit: { uploaded: false, date: null, file: null },
        leaseContract: { uploaded: false, date: null, file: null }
      }
    }
  ]);

  // Calculate tenant statistics
  useEffect(() => {
    const total = tenants.length;
    const active = tenants.filter(t => t.status === "Active").length;
    const inactive = tenants.filter(t => t.status === "Inactive").length;
    const pending = tenants.filter(t => t.status === "Pending").length;
    const overdue = tenants.filter(t => t.status === "Overdue").length;
    
    setTenantStats({
      total,
      active,
      inactive,
      pending,
      overdue
    });
  }, [tenants]);

  const [payments, setPayments] = useState([
    {
      id: "PAY-001",
      tenantId: "TEN-001",
      tenantName: "Juan Dela Cruz",
      stallId: "STALL-101",
      date: "2024-01-15",
      amount: 5000,
      paymentType: "Rent",
      collectorId: "COL-001",
      receiptNo: "RCPT-001"
    },
    {
      id: "PAY-002",
      tenantId: "TEN-001",
      tenantName: "Juan Dela Cruz",
      stallId: "STALL-101",
      date: "2024-02-15",
      amount: 5000,
      paymentType: "Rent",
      collectorId: "COL-001",
      receiptNo: "RCPT-002"
    },
    {
      id: "PAY-003",
      tenantId: "TEN-002",
      tenantName: "Maria Santos",
      stallId: "STALL-102",
      date: "2024-01-20",
      amount: 2000,
      paymentType: "Rent",
      collectorId: "COL-001",
      receiptNo: "RCPT-003"
    }
  ]);

  const [tenantId, setTenantId] = useState("");
  const [stallId, setStallId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [collectorId, setCollectorId] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [statementOpen, setStatementOpen] = useState(false);
  const [tenantDrawerOpen, setTenantDrawerOpen] = useState(false);
  const [selectedTenantForDrawer, setSelectedTenantForDrawer] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    leaseId: "",
    name: "",
    stallId: "",
    email: "",
    phone: "",
    status: "Active",
    business: "",
    address: "",
    period: "",
    paymentTerms: "Monthly",
    monthlyRent: "",
    securityDeposit: "",
  });

  // Document types
  const documentTypes = [
    { id: "validId", name: "Valid ID", icon: <Shield size={20} />, color: "#1976d2" },
    { id: "businessPermit", name: "Business Permit", icon: <Building size={20} />, color: "#2e7d32" },
    { id: "barangayPermit", name: "Barangay Permit", icon: <Home size={20} />, color: "#ed6c02" },
    { id: "leaseContract", name: "Lease Contract", icon: <FileCheck size={20} />, color: "#7b1fa2" },
  ];

  // Status options for edit form
  const statusOptions = ["Active", "Inactive", "Pending", "Overdue"];

  // Payment terms options
  const paymentTermsOptions = ["Daily", "Weekly", "Monthly", "Quarterly", "Annual"];

  const handleRecordPayment = () => {
    if (!tenantId || !stallId || !amount || !paymentType || !collectorId || !receiptNo) {
      setAlert({ open: true, message: "Please fill in all fields.", severity: "warning" });
      return;
    }

    // Find tenant name for the payment record
    const tenant = tenants.find(user => user.id === tenantId);
    const tenantName = tenant ? tenant.name : "Unknown";

    const newPayment = {
      id: `PAY-${Date.now()}`,
      tenantId,
      tenantName,
      stallId,
      date: new Date().toLocaleDateString(),
      amount: parseFloat(amount),
      paymentType,
      collectorId,
      receiptNo,
    };

    setPayments((prev) => [...prev, newPayment]);
    setTenantId("");
    setStallId("");
    setAmount("");
    setPaymentType("");
    setCollectorId("");
    setReceiptNo("");
    setAlert({ open: true, message: "Payment recorded successfully.", severity: "success" });
  };

  const handleDelete = () => {
    if (!deleteReason) {
      setAlert({ open: true, message: "Please enter a reason for deletion.", severity: "warning" });
      return;
    }

    setPayments((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteDialog(false);
    setDeleteReason("");
    setAlert({ open: true, message: "Payment transaction deleted.", severity: "info" });
  };

  const calculateTenantStatement = (tenantId) => {
    const tenantPayments = payments.filter((p) => p.tenantId === tenantId);
    const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0);
    const tenant = tenants.find(t => t.id === tenantId);
    const charges = tenant?.monthlyRent || 5000; // Use tenant's actual rent
    const balance = charges - totalPaid;
    return { totalPaid, charges, balance, tenantPayments };
  };

  const handleViewTenantDetails = (tenant) => {
    setSelectedTenantForDrawer(tenant);
    setTenantDrawerOpen(true);
  };

  const handleDownloadDocument = (documentType) => {
    if (selectedTenantForDrawer?.documents?.[documentType]?.uploaded) {
      const doc = selectedTenantForDrawer.documents[documentType];
      alert(`Downloading ${doc.file}...`);
      // In a real app, you would initiate a download here
    }
  };

  const handleEditTenant = (tenant) => {
    setEditForm({
      id: tenant.id,
      leaseId: tenant.leaseId,
      name: tenant.name,
      stallId: tenant.stallId,
      email: tenant.email,
      phone: tenant.phone,
      status: tenant.status,
      business: tenant.business,
      address: tenant.address,
      period: tenant.period,
      paymentTerms: tenant.paymentTerms,
      monthlyRent: tenant.monthlyRent,
      securityDeposit: tenant.securityDeposit,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    // Validate required fields
    if (!editForm.name || !editForm.stallId || !editForm.business || !editForm.phone) {
      setAlert({ open: true, message: "Please fill in all required fields.", severity: "warning" });
      return;
    }

    // Update tenant in the array
    const updatedTenants = tenants.map(tenant => {
      if (tenant.id === editForm.id) {
        return {
          ...tenant,
          ...editForm,
          documents: tenant.documents // Preserve existing documents
        };
      }
      return tenant;
    });

    setTenants(updatedTenants);
    setEditDialogOpen(false);
    
    // If the drawer is open for this tenant, update it too
    if (selectedTenantForDrawer && selectedTenantForDrawer.id === editForm.id) {
      setSelectedTenantForDrawer({
        ...selectedTenantForDrawer,
        ...editForm
      });
    }
    
    setAlert({ open: true, message: "Tenant information updated successfully.", severity: "success" });
  };

  const getUserPayments = (userId) => {
    return payments.filter(payment => payment.tenantId === userId);
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Tenant Account Management
        </Typography>
        <Typography color="text.secondary" mb={2}>
          Log and manage tenant payments, generate statements of account, and correct entries.
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* Tenant Status Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Tenants */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Users size={32} color="#1976d2" style={{ marginRight: 12 }} />
                  <Box>
                    <Typography variant="h6" color="text.secondary">Total Tenants</Typography>
                    <Typography variant="h4" fontWeight={700}>{tenantStats.total}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Tenants */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <UserCheck size={32} color="#2e7d32" style={{ marginRight: 12 }} />
                  <Box>
                    <Typography variant="h6" color="text.secondary">Active</Typography>
                    <Typography variant="h4" fontWeight={700}>{tenantStats.active}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Inactive Tenants */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <UserX size={32} color="#d32f2f" style={{ marginRight: 12 }} />
                  <Box>
                    <Typography variant="h6" color="text.secondary">Inactive</Typography>
                    <Typography variant="h4" fontWeight={700}>{tenantStats.inactive}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Tenants */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Clock size={32} color="#ed6c02" style={{ marginRight: 12 }} />
                  <Box>
                    <Typography variant="h6" color="text.secondary">Pending</Typography>
                    <Typography variant="h4" fontWeight={700}>{tenantStats.pending}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Overdue Tenants */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DollarSign size={32} color="#9c27b0" style={{ marginRight: 12 }} />
                  <Box>
                    <Typography variant="h6" color="text.secondary">Overdue</Typography>
                    <Typography variant="h4" fontWeight={700}>{tenantStats.overdue}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Section 1: Tenants List */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Users size={20} /> Tenant List
          </Typography>

          <Grid container spacing={2}>
            {tenants.map((tenant) => {
              const userPaymentCount = getUserPayments(tenant.id).length;
              const totalPaid = getUserPayments(tenant.id).reduce((sum, p) => sum + p.amount, 0);
              
              return (
                <Grid item xs={12} sm={6} md={3} key={tenant.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { 
                        boxShadow: 2, 
                        borderColor: '#D32F2F' 
                      } 
                    }}
                    onClick={() => handleViewTenantDetails(tenant)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#D32F2F', width: 40, height: 40 }}>
                          {tenant.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="h6" fontSize="1rem">
                            {tenant.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {tenant.id}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Lease ID:</strong> {tenant.leaseId}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Business:</strong> {tenant.business}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Stall:</strong> {tenant.stallId}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Status:</strong> 
                        <Chip 
                          label={tenant.status}
                          size="small"
                          color={
                            tenant.status === 'Active' ? 'success' :
                            tenant.status === 'Inactive' ? 'error' :
                            tenant.status === 'Pending' ? 'warning' : 'secondary'
                          }
                          sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                        />
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Payments:</strong> {userPaymentCount}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total Paid:</strong> ₱{totalPaid.toLocaleString()}
                      </Typography>
                      
                      <Button 
                        fullWidth 
                        variant="contained" 
                        size="small" 
                        startIcon={<Eye size={16} />}
                        sx={{ mt: 2, bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTenantDetails(tenant);
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

        {/* Section 2: Log Payment */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
          <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PlusCircle size={20} /> Log Payment Transaction
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField 
                select 
                label="Tenant" 
                fullWidth 
                value={tenantId} 
                onChange={(e) => {
                  setTenantId(e.target.value);
                  // Auto-fill stall ID when tenant is selected
                  const selectedTenant = tenants.find(tenant => tenant.id === e.target.value);
                  if (selectedTenant) {
                    setStallId(selectedTenant.stallId);
                  }
                }}
              >
                {tenants.map((tenant) => (
                  <MenuItem key={tenant.id} value={tenant.id}>
                    {tenant.name} ({tenant.id})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField 
                label="Stall ID" 
                fullWidth 
                value={stallId} 
                onChange={(e) => setStallId(e.target.value)} 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField 
                label="Amount (₱)" 
                type="number" 
                fullWidth 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Payment Type"
                fullWidth
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <MenuItem value="Rent">Rent</MenuItem>
                <MenuItem value="Utilities">Utilities</MenuItem>
                <MenuItem value="Back Rental">Back Rental</MenuItem>
                <MenuItem value="Security Deposit">Security Deposit</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField 
                label="Collector ID" 
                fullWidth 
                value={collectorId} 
                onChange={(e) => setCollectorId(e.target.value)} 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField 
                label="Receipt No." 
                fullWidth 
                value={receiptNo} 
                onChange={(e) => setReceiptNo(e.target.value)} 
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
              onClick={handleRecordPayment}
            >
              Record Payment
            </Button>
          </Box>
        </Paper>

        {/* Section 3: Payment History */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Receipt size={20} /> Payment History
          </Typography>

          <Table size="small" sx={{ mt: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>Receipt No.</TableCell>
                <TableCell>Tenant ID</TableCell>
                <TableCell>Lease ID</TableCell>
                <TableCell>Tenant Name</TableCell>
                <TableCell>Stall ID</TableCell>
                <TableCell>Payment Type</TableCell>
                <TableCell>Amount (₱)</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Collector ID</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No payment transactions yet.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => {
                  const tenant = tenants.find(t => t.id === p.tenantId);
                  const leaseId = tenant ? tenant.leaseId : "N/A";
                  
                  return (
                    <TableRow key={p.id}>
                      <TableCell>{p.receiptNo}</TableCell>
                      <TableCell>{p.tenantId}</TableCell>
                      <TableCell>{leaseId}</TableCell>
                      <TableCell>{p.tenantName}</TableCell>
                      <TableCell>{p.stallId}</TableCell>
                      <TableCell>{p.paymentType}</TableCell>
                      <TableCell>₱{p.amount.toLocaleString()}</TableCell>
                      <TableCell>{p.date}</TableCell>
                      <TableCell>{p.collectorId}</TableCell>
                      <TableCell align="right">
                        <Button 
                          size="small" 
                          sx={{ color: "black" }} 
                          onClick={() => { 
                            setSelectedTenant(p.tenantId); 
                            setStatementOpen(true); 
                          }}
                        >
                          Statement
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Trash2 size={14} />}
                          onClick={() => { 
                            setDeleteDialog(true); 
                            setDeleteTarget(p); 
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* Tenant Details Drawer */}
        <Drawer
          anchor="right"
          open={tenantDrawerOpen}
          onClose={() => setTenantDrawerOpen(false)}
          PaperProps={{
            sx: { width: { xs: '100%', sm: 500 } }
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight={600}>
                Tenant Details
              </Typography>
              <Box>
                <IconButton 
                  onClick={() => {
                    if (selectedTenantForDrawer) {
                      handleEditTenant(selectedTenantForDrawer);
                    }
                  }}
                  color="primary"
                  sx={{ mr: 1 }}
                >
                  <Edit size={20} />
                </IconButton>
                <IconButton onClick={() => setTenantDrawerOpen(false)}>
                  <X size={20} />
                </IconButton>
              </Box>
            </Box>

            {selectedTenantForDrawer && (
              <>
                {/* Tenant Information */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                    <FileText size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Tenant Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <CreditCard size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Tenant ID
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedTenantForDrawer.id}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <FileCheck size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Lease ID
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedTenantForDrawer.leaseId}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedTenantForDrawer.name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Business</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedTenantForDrawer.business}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <Phone size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Contact
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedTenantForDrawer.phone}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        <Mail size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Email
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedTenantForDrawer.email}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        <MapPin size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Address
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedTenantForDrawer.address}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Stall</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedTenantForDrawer.stallId}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <Calendar size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Period
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedTenantForDrawer.period}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Payment Terms</Typography>
                      <Chip 
                        label={selectedTenantForDrawer.paymentTerms} 
                        size="small"
                        sx={{ mt: 0.5 }}
                        variant="outlined"
                        color={
                          selectedTenantForDrawer.paymentTerms === "Daily" ? "error" :
                          selectedTenantForDrawer.paymentTerms === "Weekly" ? "warning" : "primary"
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={selectedTenantForDrawer.status}
                        color={
                          selectedTenantForDrawer.status === 'Active' ? 'success' :
                          selectedTenantForDrawer.status === 'Inactive' ? 'error' :
                          selectedTenantForDrawer.status === 'Pending' ? 'warning' : 'secondary'
                        }
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Monthly Rent</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        ₱{selectedTenantForDrawer.monthlyRent?.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Security Deposit</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        ₱{selectedTenantForDrawer.securityDeposit?.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Documents Section */}
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                    <FileSpreadsheet size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Tenant Documents
                  </Typography>
                  <List>
                    {documentTypes.map((doc) => {
                      const document = selectedTenantForDrawer.documents?.[doc.id];
                      const isUploaded = document?.uploaded;
                      
                      return (
                        <Box key={doc.id}>
                          <ListItem 
                            secondaryAction={
                              isUploaded ? (
                                <IconButton 
                                  edge="end" 
                                  onClick={() => handleDownloadDocument(doc.id)}
                                  color="primary"
                                  size="small"
                                >
                                  <Download size={18} />
                                </IconButton>
                              ) : (
                                <Chip label="Missing" size="small" color="error" />
                              )
                            }
                          >
                            <ListItemIcon>
                              <Box sx={{ bgcolor: doc.color, borderRadius: '50%', p: 1, color: 'white' }}>
                                {doc.icon}
                              </Box>
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
                          <Divider />
                        </Box>
                      );
                    })}
                  </List>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<FileSpreadsheet size={20} />}
                    sx={{ mt: 2 }}
                    onClick={() => {
                      alert(`Upload documents for ${selectedTenantForDrawer.name}`);
                    }}
                  >
                    Upload Missing Documents
                  </Button>
                </Paper>
              </>
            )}
          </Box>
        </Drawer>

        {/* Edit Tenant Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: "#D32F2F", color: "white" }}>
            <Edit size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Edit Tenant Information
          </DialogTitle>
          <DialogContent dividers sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Tenant ID" 
                  name="id" 
                  value={editForm.id} 
                  disabled
                  margin="dense" 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Lease ID" 
                  name="leaseId" 
                  value={editForm.leaseId} 
                  onChange={(e) => setEditForm({...editForm, leaseId: e.target.value})}
                  margin="dense" 
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Name *" 
                  name="name" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  margin="dense" 
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Business Name *" 
                  name="business" 
                  value={editForm.business} 
                  onChange={(e) => setEditForm({...editForm, business: e.target.value})}
                  margin="dense" 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Contact Number *" 
                  name="phone" 
                  value={editForm.phone} 
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  margin="dense" 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Email" 
                  name="email" 
                  value={editForm.email} 
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  margin="dense" 
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Address" 
                  name="address" 
                  value={editForm.address} 
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  margin="dense" 
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Stall ID *" 
                  name="stallId" 
                  value={editForm.stallId} 
                  onChange={(e) => setEditForm({...editForm, stallId: e.target.value})}
                  margin="dense" 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Lease Period" 
                  name="period" 
                  value={editForm.period} 
                  onChange={(e) => setEditForm({...editForm, period: e.target.value})}
                  margin="dense" 
                  placeholder="e.g., 2023-01-01 to 2024-01-01"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Payment Terms</InputLabel>
                  <Select
                    name="paymentTerms"
                    value={editForm.paymentTerms}
                    onChange={(e) => setEditForm({...editForm, paymentTerms: e.target.value})}
                    label="Payment Terms"
                  >
                    {paymentTermsOptions.map((term) => (
                      <MenuItem key={term} value={term}>{term}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    label="Status"
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Monthly Rent (₱)" 
                  name="monthlyRent" 
                  type="number"
                  value={editForm.monthlyRent} 
                  onChange={(e) => setEditForm({...editForm, monthlyRent: e.target.value})}
                  margin="dense" 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Security Deposit (₱)" 
                  name="securityDeposit" 
                  type="number"
                  value={editForm.securityDeposit} 
                  onChange={(e) => setEditForm({...editForm, securityDeposit: e.target.value})}
                  margin="dense" 
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              sx={{ backgroundColor: "#D32F2F", color: "#fff" }} 
              onClick={handleSaveEdit}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AlertTriangle size={18} color="#D32F2F" /> Confirm Deletion
          </DialogTitle>
          <DialogContent dividers>
            <Typography mb={2}>
              Are you sure you want to delete this payment transaction?
            </Typography>
            <TextField
              label="Reason for Deletion"
              fullWidth
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Statement Dialog */}
        <Dialog open={statementOpen} onClose={() => setStatementOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Statement of Account</DialogTitle>
          <DialogContent dividers>
            {selectedTenant && (
              (() => {
                const statement = calculateTenantStatement(selectedTenant);
                const tenant = tenants.find(tenant => tenant.id === selectedTenant);
                return (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {tenant?.name || selectedTenant}
                    </Typography>
                    <Typography><strong>Tenant ID:</strong> {selectedTenant}</Typography>
                    <Typography><strong>Lease ID:</strong> {tenant?.leaseId || 'N/A'}</Typography>
                    <Typography><strong>Stall ID:</strong> {tenant?.stallId || 'N/A'}</Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography><strong>Monthly Rent:</strong> ₱{statement.charges.toLocaleString()}</Typography>
                    <Typography><strong>Total Paid:</strong> ₱{statement.totalPaid.toLocaleString()}</Typography>
                    <Typography color={statement.balance <= 0 ? "green" : "error"}>
                      <strong>Balance:</strong> ₱{statement.balance.toLocaleString()}
                    </Typography>

                    <Table size="small" sx={{ mt: 2 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Receipt No.</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Amount (₱)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statement.tenantPayments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>{p.date}</TableCell>
                            <TableCell>{p.receiptNo}</TableCell>
                            <TableCell>{p.paymentType}</TableCell>
                            <TableCell>₱{p.amount.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                );
              })()
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatementOpen(false)}>Close</Button>
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
      </Box>
    </MainLayout>
  );
}