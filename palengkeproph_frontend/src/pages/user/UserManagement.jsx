// src/pages/administration/UserManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
  Button,
  Stack,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Alert,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Home as HomeIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";
import axios from "axios";

// Create axios instance with proper configuration
const api = axios.create({
  baseURL:'https://palengkeprophtest-production.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userInfo');
      // Redirect to login page
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// User roles data structure
const userRoles = [
  {
    id: "market_manager",
    name: "Market Manager",
    description: "Has broad administrative control over all market operations",
  },
  {
    id: "leasing_officer", 
    name: "Leasing Officer",
    description: "Manages stall leasing activities and tenant relationships",
  },
  {
    id: "collector",
    name: "Collector",
    description: "Records payments in the field using mobile app",
  },
  {
    id: "cashier",
    name: "Cashier",
    description: "Manages cash transactions and deposits",
  },
  {
    id: "finance_head",
    name: "Finance Head",
    description: "Manages financial operations and reporting",
  },
  {
    id: "admin_staff",
    name: "Admin Staff",
    description: "Handles administrative tasks and purchase orders",
  },
  {
    id: "security_officer",
    name: "Security Officer",
    description: "Manages security incidents and surveillance",
  }
];

// Module permissions structure (for display only)
const modules = [
  {
    id: "stall_management",
    name: "Stall Management",
    description: "Manage market stalls and allocations"
  },
  {
    id: "tenant_management",
    name: "Tenant Management",
    description: "Manage tenant information and records"
  },
  {
    id: "lease_management",
    name: "Lease Management",
    description: "Handle lease agreements and renewals"
  },
  {
    id: "payment_processing",
    name: "Payment Processing",
    description: "Process payments and financial transactions"
  },
  {
    id: "expense_management",
    name: "Expense Management",
    description: "Manage market expenses and disbursements"
  },
  {
    id: "inventory_management",
    name: "Inventory Management",
    description: "Manage product catalog and purchasing"
  },
  {
    id: "financial_reporting",
    name: "Financial Reporting",
    description: "Generate financial reports and statements"
  },
  {
    id: "loan_management",
    name: "Loan Management",
    description: "Handle tenant loans and repayments"
  },
  {
    id: "security_management",
    name: "Security Management",
    description: "Manage security incidents and surveillance"
  },
  {
    id: "user_management",
    name: "User Management",
    description: "Manage system users and permissions"
  }
];

// Permission types (for display only)
const permissionTypes = [
  { id: "create", label: "Create", color: "success" },
  { id: "read", label: "View", color: "info" },
  { id: "update", label: "Edit", color: "warning" },
  { id: "delete", label: "Delete", color: "error" },
  { id: "approve", label: "Approve", color: "primary" },
  { id: "report", label: "Report", color: "secondary" },
  { id: "export", label: "Export", color: "success" }
];

// Mock data for development
const mockUsers = [
  {
    id: 1,
    username: "admin",
    email: "admin@palengkepro.ph",
    first_name: "System",
    last_name: "Administrator",
    role: "market_manager",
    is_active: true,
    phone: "+1234567890",
    department: "Management",
    last_login: "2024-01-15T10:30:00Z",
    date_joined: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    username: "leasing1",
    email: "leasing@market.com",
    first_name: "John",
    last_name: "Leasing Officer",
    role: "leasing_officer",
    is_active: true,
    phone: "+1234567891",
    department: "Leasing",
    last_login: "2024-01-14T15:20:00Z",
    date_joined: "2024-01-01T00:00:00Z"
  }
];

// Helper function to ensure users is always an array
const ensureArray = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object') {
    // If it's an object with a results property (common in DRF pagination)
    if (Array.isArray(data.results)) {
      return data.results;
    }
    // If it's an object with a data property
    if (Array.isArray(data.data)) {
      return data.data;
    }
    // If it's a single user object, wrap it in an array
    if (data.id) {
      return [data];
    }
  }
  return [];
};

export default function UserManagement() {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useMockData, setUseMockData] = useState(false);
  
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: "",
    role: "",
    is_active: true,
    phone: "",
    department: ""
  });

  // Check authentication on component mount
  useEffect(() => {
    checkAuthentication();
    fetchUsers();
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/';
      return;
    }
  };

  // Load users from API
  const fetchUsers = async () => {
  setLoading(true);
  setError("");
  try {
    // Check if we have a token
    const token = localStorage.getItem('authToken');
    console.log("Auth Token exists:", !!token);
    
    if (!token) {
      setError("No authentication token found. Please login again.");
      setUseMockData(true);
      const savedUsers = JSON.parse(localStorage.getItem("palengke_users")) || mockUsers;
      setUsers(ensureArray(savedUsers));
      setLoading(false);
      return;
    }

    const response = await api.get("/api/users/");
    console.log("API Response:", response.data);
    
    const usersArray = ensureArray(response.data);
    
    // Debug each user's last_login field
    usersArray.forEach((user, index) => {
      console.log(`User ${index}:`, {
        username: user.username,
        last_login: user.last_login,
        last_login_type: typeof user.last_login,
        is_active: user.is_active
      });
    });
    
    setUsers(usersArray);
    setUseMockData(false);
  } catch (error) {
    console.error("Failed to fetch users from API:", error);
    console.error("Error status:", error.response?.status);
    console.error("Error data:", error.response?.data);
    
    if (error.response?.status === 401) {
      setError("Authentication failed. Please login again.");
      // Clear invalid token
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userInfo');
    } else if (error.response?.status === 403) {
      setError("You don't have permission to view users.");
    } else {
      setError("Cannot connect to server. Using demo data.");
    }
    
    // Load mock users from localStorage as fallback
    const savedUsers = JSON.parse(localStorage.getItem("palengke_users")) || mockUsers;
    setUsers(ensureArray(savedUsers));
    setUseMockData(true);
  } finally {
    setLoading(false);
  }
};

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        password: "",
        confirmPassword: "",
        role: user.role || "",
        is_active: user.is_active !== undefined ? user.is_active : true,
        phone: user.phone || "",
        department: user.department || ""
      });
      setSelectedRole(user.role || "");
    } else {
      setEditingUser(null);
      setUserForm({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        confirmPassword: "",
        role: "",
        is_active: true,
        phone: "",
        department: ""
      });
      setSelectedRole("");
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setUserForm({
      username: "",                                                                                                             
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      confirmPassword: "",
      role: "",
      is_active: true,
      phone: "",
      department: ""
    });
    setSelectedRole("");
    setFormErrors({});
  };
                
  const validateForm = () => {
    const errors = {};

    if (!userForm.username.trim()) {
      errors.username = "Username is required";
    } else if (userForm.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!userForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userForm.email)) {
      errors.email = "Email is invalid";
    }

    if (!userForm.first_name.trim()) {
      errors.first_name = "First name is required";
    }

    if (!userForm.last_name.trim()) {
      errors.last_name = "Last name is required";
    }

    if (!editingUser && !userForm.password) {
      errors.password = "Password is required";
    } else if (!editingUser && userForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!editingUser && userForm.password !== userForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!selectedRole) {
      errors.role = "Role is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

const handleSaveUser = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    const userData = {
      username: userForm.username,
      email: userForm.email,
      first_name: userForm.first_name,
      last_name: userForm.last_name,
      role: selectedRole,
      is_active: userForm.is_active,
      phone: userForm.phone,
      department: userForm.department
    };

    // Only include password for new users
    if (!editingUser) {
      userData.password = userForm.password;
    }

    console.log("Saving user data:", userData);

    if (useMockData) {
      // Handle mock data operations
      const mockUser = {
        id: editingUser ? editingUser.id : Date.now(),
        ...userData,
        date_joined: editingUser ? editingUser.date_joined : new Date().toISOString(),
        last_login: editingUser ? editingUser.last_login : null
      };

      const updatedUsers = editingUser
        ? users.map(u => u.id === editingUser.id ? mockUser : u)
        : [...users, mockUser];

      setUsers(updatedUsers);
      localStorage.setItem("palengke_users", JSON.stringify(updatedUsers));
      handleCloseDialog();
    } else {
      // Real API operations
      let response;
      if (editingUser) {
        // Update existing user
        console.log(`Updating user ${editingUser.id} at: /api/users/${editingUser.id}/`);
        response = await api.put(`/api/users/${editingUser.id}/`, userData);
      } else {
        // Create new user - use register endpoint
        console.log("Creating user at: /api/register/");
        console.log("Request payload:", JSON.stringify(userData, null, 2));
        response = await api.post("/api/register/", userData);
      }
      
      console.log("✅ Save successful:", response.data);
      fetchUsers(); // Refresh the list
      handleCloseDialog();
    }
  } catch (error) {
    console.error("❌ Failed to save user", error);
    
    // Safe error logging without circular references
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
    };
    
    console.error("Error details:", errorDetails);
    console.error("Full error response:", error.response);
    console.error("Backend validation errors:", error.response?.data);
    
    if (error.response?.status === 401) {
      setError("Authentication failed. Please login again.");
      return;
    }
    
    // Handle backend validation errors
    if (error.response?.data) {
      const backendErrors = error.response.data;
      console.log("Raw backend errors:", backendErrors);
      
      const formattedErrors = {};
      
      // Handle different error response formats
      if (typeof backendErrors === 'string') {
        setError(backendErrors);
      } else if (Array.isArray(backendErrors)) {
        // If errors come as an array
        setError(backendErrors[0] || "Validation error");
      } else if (typeof backendErrors === 'object') {
        // Handle object with field errors
        Object.keys(backendErrors).forEach(key => {
          if (Array.isArray(backendErrors[key])) {
            formattedErrors[key] = backendErrors[key][0];
          } else if (typeof backendErrors[key] === 'string') {
            formattedErrors[key] = backendErrors[key];
          } else if (backendErrors[key] && typeof backendErrors[key] === 'object') {
            // Handle nested objects
            try {
              formattedErrors[key] = JSON.stringify(backendErrors[key]);
            } catch {
              formattedErrors[key] = 'Invalid input';
            }
          }
        });
        
        setFormErrors(formattedErrors);
        
        // Show general error if no specific field errors but we have a detail message
        if (Object.keys(formattedErrors).length === 0) {
          if (backendErrors.detail) {
            setError(backendErrors.detail);
          } else if (backendErrors.non_field_errors) {
            setError(Array.isArray(backendErrors.non_field_errors) 
              ? backendErrors.non_field_errors[0] 
              : backendErrors.non_field_errors
            );
          } else {
            setError("Please check the form for errors.");
          }
        }
      }
    } else if (error.message) {
      setError(`Failed to save user: ${error.message}`);
    } else {
      setError("Failed to save user. Please try again.");
    }
  }
};
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        if (useMockData) {
          const updatedUsers = users.filter(u => u.id !== userId);
          setUsers(updatedUsers);
          localStorage.setItem("palengke_users", JSON.stringify(updatedUsers));
        } else {
          await api.delete(`/api/users/${userId}/`);
          fetchUsers();
        }
      } catch (error) {
        console.error("Failed to delete user", error);
        if (error.response?.status === 401) {
          setError("Authentication failed. Please login again.");
        } else {
          setError("Failed to delete user. Please try again.");
        }
      }
    }
  };

  const getRolePermissions = (roleId) => {
    // Mock permissions for display
    const mockPermissions = {
      market_manager: { 
        stall_management: ["create", "read", "update", "delete", "approve"],
        user_management: ["create", "read", "update", "delete"]
      },
      leasing_officer: { 
        stall_management: ["read", "update"],
        tenant_management: ["create", "read", "update"]
      },
      collector: { 
        payment_processing: ["create", "read"]
      },
      cashier: { 
        payment_processing: ["create", "read", "update"]
      },
      finance_head: { 
        financial_reporting: ["create", "read", "update", "export"]
      },
      admin_staff: { 
        inventory_management: ["create", "read", "update"]
      },
      security_officer: { 
        security_management: ["create", "read", "update"]
      }
    };
    
    return mockPermissions[roleId] || {};
  };

  const getPermissionColor = (permission) => {
    const perm = permissionTypes.find(p => p.id === permission);
    return perm ? perm.color : "default";
  };

  const getPermissionLabel = (permission) => {
    const perm = permissionTypes.find(p => p.id === permission);
    return perm ? perm.label : permission;
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getFullName = (user) => {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
  };

  // Safe array operations
  const safeUsers = Array.isArray(users) ? users : [];
  const activeUsersCount = safeUsers.filter(u => u.is_active).length;

  return (
    <MainLayout>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/dashboard" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <HomeIcon fontSize="small" /> Dashboard
          </Link>
          <Typography color="text.primary">User Management</Typography>
        </Breadcrumbs>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>User Management</Typography>
        <Button 
          variant="contained" 
          sx={{ bgcolor: "#D32F2F" }} 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Stack>

      {error && (
        <Alert 
          severity={useMockData ? "warning" : "error"} 
          sx={{ mb: 3 }}
          action={
            useMockData && (
              <Button 
                color="inherit" 
                size="small" 
                onClick={fetchUsers}
              >
                Retry API
              </Button>
            )
          }
        >
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography color="text.secondary">Total Users</Typography>
            <Typography variant="h4" sx={{ color: "#000", fontWeight: 700 }}>
              {loading ? <CircularProgress size={24} /> : safeUsers.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {useMockData ? "Demo data" : "Active system users"}
            </Typography>
          </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography color="text.secondary">Active Users</Typography>
              <Typography variant="h4" sx={{ color: "#D32F2F", fontWeight: 700 }}>
                {loading ? <CircularProgress size={24} /> : activeUsersCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">Currently active</Typography>
            </CardContent>
          </Card>
            
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography color="text.secondary">User Roles</Typography>
            <Typography variant="h4" sx={{ color: "#000", fontWeight: 700 }}>{userRoles.length}</Typography>
            <Typography variant="body2" color="text.secondary">Defined roles</Typography>
          </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography color="text.secondary">System Modules</Typography>
            <Typography variant="h4" sx={{ color: "#D32F2F", fontWeight: 700 }}>{modules.length}</Typography>
            <Typography variant="body2" color="text.secondary">Managed modules</Typography>
          </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Tabs 
            value={tab} 
            onChange={(e, v) => setTab(v)} 
            aria-label="user-management-tabs"
            sx={{ 
          mb: 2,
          '& .MuiTab-root': {
            fontWeight: 600,
          }
            }}
          >
            <Tab icon={<PeopleIcon />} label="User Accounts" />
            <Tab icon={<SecurityIcon />} label="Role Permissions" />
            <Tab icon={<AssignmentIcon />} label="System Modules" />
          </Tabs>

          <Divider sx={{ mb: 3 }} />

            {tab === 0 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>User Accounts</Typography>
              <Typography color="text.secondary">
          {loading ? "Loading..." : `Showing ${safeUsers.length} user${safeUsers.length !== 1 ? 's' : ''}`}
          {useMockData && " (Demo Data)"}
              </Typography>
            </Stack>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
            <TableCell><b>User</b></TableCell>
            <TableCell><b>Role</b></TableCell>
            <TableCell><b>Department</b></TableCell>
            <TableCell><b>Status</b></TableCell>
            <TableCell><b>Last Login (PH)</b></TableCell>
            <TableCell align="center"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {safeUsers.length > 0 ? safeUsers.map((user) => (
            <TableRow key={user.id}>
            <TableCell>
              <Box>
            <Typography sx={{ fontWeight: 600 }}>{getFullName(user)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user.username} • {user.email}
            </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Chip 
            label={userRoles.find(r => r.id === user.role)?.name || user.role} 
            size="small"
            color="primary"
            variant="outlined"
              />
            </TableCell>
            <TableCell>{user.department || "-"}</TableCell>
            <TableCell>
              <Chip 
            label={user.is_active ? 'Active' : 'Inactive'} 
            color={user.is_active ? 'success' : 'default'}
            size="small"
              />
            </TableCell>
            <TableCell>
              {user.last_login ? (() => {
            try {
              let s = user.last_login;
              // If numeric timestamp provided
              if (typeof s === 'number') {
                s = new Date(s).toISOString();
              }
              // If string without timezone info, assume it's UTC by appending 'Z'
              if (typeof s === 'string' && !(/[zZ]|[+\-]\d{2}:\d{2}$/.test(s))) {
                s = s.endsWith('Z') ? s : s + 'Z';
              }
              const d = new Date(s);
              if (isNaN(d.getTime())) return String(user.last_login);
              return d.toLocaleString('en-PH', {
                timeZone: 'Asia/Manila',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              });
            } catch (err) {
              return String(user.last_login);
            }
              })() : 'Never'}
            </TableCell>
            <TableCell align="center">
              <Stack direction="row" spacing={1} justifyContent="center">
            <IconButton 
              size="small" 
              onClick={() => handleOpenDialog(user)}
              sx={{ color: "#D32F2F" }}
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleDeleteUser(user.id)}
            >
              <DeleteIcon />
            </IconButton>
              </Stack>
            </TableCell>
            </TableRow>
              )) : (
            <TableRow>
            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
              <Typography color="text.secondary">No users found. Create your first user account.</Typography>
            </TableCell>
            </TableRow>
              )}
            </TableBody>
          </Table>
              </TableContainer>
            )}
          </Box>
            )}

            {/* Role Permissions Tab */}
          {tab === 1 && (
            <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Role Permissions Matrix</Typography>
          
          <Grid container spacing={3}>
            {userRoles.map((role) => (
              <Grid item xs={12} md={6} key={role.id}>
            <Card sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{role.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {role.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Module Permissions:
                </Typography>
                
                <List dense>
              {modules.map((module) => (
                <ListItem key={module.id} sx={{ py: 0.5 }}>
                  <ListItemText 
                primary={module.name}
                secondary={module.description}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {getRolePermissions(role.id)[module.id]?.map((permission) => (
                  <Chip
                    key={permission}
                    label={getPermissionLabel(permission)}
                    size="small"
                    color={getPermissionColor(permission)}
                    variant="outlined"
                  />
                ))}
                  </Box>
                </ListItem>
              ))}
                </List>
              </CardContent>
            </Card>
              </Grid>
            ))}
          </Grid>
            </Box>
          )}

          {/* System Modules Tab */}
        {tab === 2 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>System Modules Overview</Typography>
            
            <Grid container spacing={3}>
              {modules.map((module) => (
                <Grid item xs={12} md={6} lg={4} key={module.id}>
                  <Card sx={{ borderRadius: 2, height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{module.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {module.description}
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Role Access:
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {userRoles.map((role) => (
                          <Chip
                            key={role.id}
                            label={role.name}
                            size="small"
                            color={getRolePermissions(role.id)[module.id]?.length > 0 ? "primary" : "default"}
                            variant={getRolePermissions(role.id)[module.id]?.length > 0 ? "filled" : "outlined"}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Add/Edit User Dialog - Same as before */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingUser ? 'Edit User' : 'Create New User Account'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                error={!!formErrors.username}
                helperText={formErrors.username}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={userForm.first_name}
                onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
                error={!!formErrors.first_name}
                helperText={formErrors.first_name}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={userForm.last_name}
                onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
                error={!!formErrors.last_name}
                helperText={formErrors.last_name}
                required
              />
            </Grid>

            {/* Password Fields - Only show for new users */}
            {!editingUser && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                    required={!editingUser}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={userForm.confirmPassword}
                    onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                    error={!!formErrors.confirmPassword}
                    helperText={formErrors.confirmPassword}
                    required={!editingUser}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleToggleConfirmPassword}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                value={userForm.department}
                onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!formErrors.role}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedRole}
                  label="Role"
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  {userRoles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.role && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {formErrors.role}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userForm.is_active}
                    onChange={(e) => setUserForm({ 
                      ...userForm, 
                      is_active: e.target.checked
                    })}
                  />
                }
                label="Active User"
              />
            </Grid>

            {/* Role Permissions Preview */}
            {selectedRole && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Role Permissions Preview: {userRoles.find(r => r.id === selectedRole)?.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {modules.map((module) => (
                        <Box key={module.id} sx={{ mb: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                            {module.name}:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {getRolePermissions(selectedRole)[module.id]?.map((permission) => (
                              <Chip
                                key={permission}
                                label={getPermissionLabel(permission)}
                                size="small"
                                color={getPermissionColor(permission)}
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained" 
            sx={{ bgcolor: "#D32F2F" }}
            startIcon={<SaveIcon />}
          >
            {editingUser ? 'Update User' : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}