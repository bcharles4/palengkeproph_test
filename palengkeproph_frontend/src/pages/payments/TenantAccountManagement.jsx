import React, { useState } from "react";
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
} from "@mui/material";
import {
  Receipt,
  FileSpreadsheet,
  Trash2,
  PlusCircle,
  AlertTriangle,
  Users,
  Eye,
} from "lucide-react";
import MainLayout from "../../layouts/MainLayout";

export default function TenantAccountManagement() {
  // Mock user data - replace with actual data from your API
  const [users] = useState([
    {
      id: "TEN-001",
      name: "Juan Dela Cruz",
      stallId: "STALL-101",
      email: "juan.delacruz@email.com",
      phone: "+63 912 345 6789",
      joinDate: "2023-01-15",
      status: "Active"
    },
    {
      id: "TEN-002",
      name: "Maria Santos",
      stallId: "STALL-102",
      email: "maria.santos@email.com",
      phone: "+63 917 654 3210",
      joinDate: "2023-02-20",
      status: "Active"
    },
    {
      id: "TEN-003",
      name: "Pedro Reyes",
      stallId: "STALL-103",
      email: "pedro.reyes@email.com",
      phone: "+63 918 777 8888",
      joinDate: "2023-03-10",
      status: "Inactive"
    },
    {
      id: "TEN-004",
      name: "Ana Lim",
      stallId: "STALL-104",
      email: "ana.lim@email.com",
      phone: "+63 919 555 6666",
      joinDate: "2023-01-25",
      status: "Active"
    }
  ]);

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
  const [userPaymentsOpen, setUserPaymentsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleRecordPayment = () => {
    if (!tenantId || !stallId || !amount || !paymentType || !collectorId || !receiptNo) {
      setAlert({ open: true, message: "Please fill in all fields.", severity: "warning" });
      return;
    }

    // Find tenant name for the payment record
    const tenant = users.find(user => user.id === tenantId);
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
    const charges = 5000; // demo charge
    const balance = charges - totalPaid;
    return { totalPaid, charges, balance, tenantPayments };
  };

  const handleViewUserPayments = (user) => {
    setSelectedUser(user);
    setUserPaymentsOpen(true);
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

        {/* Section 1: Users List */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Users size={20} /> Tenant List
          </Typography>

          <Grid container spacing={2}>
            {users.map((user) => {
              const userPaymentCount = getUserPayments(user.id).length;
              const totalPaid = getUserPayments(user.id).reduce((sum, p) => sum + p.amount, 0);
              
              return (
                <Grid item xs={12} sm={6} md={3} key={user.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { 
                        boxShadow: 2, 
                        borderColor: '#D32F2F' 
                      } 
                    }}
                    onClick={() => handleViewUserPayments(user)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#D32F2F', width: 40, height: 40 }}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="h6" fontSize="1rem">
                            {user.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.id}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Stall:</strong> {user.stallId}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Status:</strong> 
                        <span style={{ 
                          color: user.status === 'Active' ? 'green' : 'red',
                          marginLeft: 4
                        }}>
                          {user.status}
                        </span>
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
                          handleViewUserPayments(user);
                        }}
                      >
                        View Payments
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
                  const selectedUser = users.find(user => user.id === e.target.value);
                  if (selectedUser) {
                    setStallId(selectedUser.stallId);
                  }
                }}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.id})
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
                  <TableCell colSpan={9} align="center">
                    No payment transactions yet.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.receiptNo}</TableCell>
                    <TableCell>{p.tenantId}</TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* User Payments Dialog */}
        <Dialog open={userPaymentsOpen} onClose={() => setUserPaymentsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Payment History - {selectedUser?.name}
          </DialogTitle>
          <DialogContent dividers>
            {selectedUser && (
              <Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Tenant ID:</strong> {selectedUser.id}</Typography>
                    <Typography><strong>Stall ID:</strong> {selectedUser.stallId}</Typography>
                    <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Phone:</strong> {selectedUser.phone}</Typography>
                    <Typography><strong>Join Date:</strong> {selectedUser.joinDate}</Typography>
                    <Typography>
                      <strong>Status:</strong> 
                      <span style={{ 
                        color: selectedUser.status === 'Active' ? 'green' : 'red',
                        marginLeft: 4
                      }}>
                        {selectedUser.status}
                      </span>
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Payment Transactions
                </Typography>
                
                {getUserPayments(selectedUser.id).length === 0 ? (
                  <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                    No payment records found for this user.
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Receipt No.</TableCell>
                        <TableCell>Payment Type</TableCell>
                        <TableCell>Amount (₱)</TableCell>
                        <TableCell>Collector ID</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getUserPayments(selectedUser.id).map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell>{payment.receiptNo}</TableCell>
                          <TableCell>{payment.paymentType}</TableCell>
                          <TableCell>₱{payment.amount.toLocaleString()}</TableCell>
                          <TableCell>{payment.collectorId}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserPaymentsOpen(false)}>Close</Button>
            {selectedUser && (
              <Button
                sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
                variant="contained"
                onClick={() => {
                  setUserPaymentsOpen(false);
                  setSelectedTenant(selectedUser.id);
                  setStatementOpen(true);
                }}
              >
                View Full Statement
              </Button>
            )}
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
                const tenant = users.find(user => user.id === selectedTenant);
                return (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {tenant?.name || selectedTenant}
                    </Typography>
                    <Typography><strong>Tenant ID:</strong> {selectedTenant}</Typography>
                    <Typography><strong>Stall ID:</strong> {tenant?.stallId || 'N/A'}</Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography><strong>Total Charges:</strong> ₱{statement.charges.toLocaleString()}</Typography>
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