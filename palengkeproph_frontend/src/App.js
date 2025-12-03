import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import StallInventory from "./pages/stall/StallInventory";
import StallAssignment from "./pages/stall/StallAssignment";
import TenantList from './pages/tenant/TenantList';  
import TenantInformation from './pages/tenant/TenantInformation';
import LeaseList from './pages/lease/LeaseRecords';
import LeaseCreation from './pages/lease/LeaseCreation';
import LeaseApprovalList from './pages/lease/LeaseApprovalList'; // NEW: List page
import LeaseApproval from './pages/lease/LeaseApproval'; // Individual approval page
import LeaseRenewal from './pages/lease/LeaseRenewal';
import PaymentRecording from './pages/payments/PaymentRecording';
import ExpenseRecording from './pages/expenses/ExpenseRecording';
import ExpenseApproval from './pages/expenses/ExpenseApproval';
import InventoryTracking from './pages/inventory/InventoryTracking';
import PurchaseOrderCreation from './pages/inventory/PurchaseOrderCreation';
import CollectionManagement from './pages/payments/CollectionManagement';
import TenantAccountManagement from './pages/payments/TenantAccountManagement';
import CheckRequestAndRelease from './pages/expenses/CheckRequestAndRelease';
import Budgeting from './pages/expenses/Budgeting';
import FinancialReporting from './pages/finance/FinancialReporting';
import LoanManagement from './pages/loan/LoanManagement';
import UserManagement from './pages/user/UserManagement';
import SecurityManagement from './pages/security/SecurityManagement';
import Settings from './pages/user/Settings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#D32F2F',
      light: '#FF6659',
      dark: '#9A0007',
    },
    secondary: {
      main: '#1976d2',
      light: '#63a4ff',
      dark: '#004ba0',
    },
    background: {
      default: '#f5f6fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Graphik', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Stall Management */}
          <Route path="/stall-inventory" element={<StallInventory />} />
          <Route path="/stall-assignment" element={<StallAssignment />} />
          
          {/* Tenant Management */}
          <Route path="/tenant-list" element={<TenantList />} />
          <Route path="/tenant-information" element={<TenantInformation />} />
          
          {/* Lease Management */}
          <Route path="/lease-list" element={<LeaseList />} />
          <Route path="/lease-creation" element={<LeaseCreation />} />
          <Route path="/lease-approval-list" element={<LeaseApprovalList />} />
          <Route path="/lease-approval/:leaseId" element={<LeaseApproval />} /> 
          <Route path="/lease-renewal" element={<LeaseRenewal />} />
          
          {/* Payments & Collections */}
          <Route path="/payment-recording" element={<PaymentRecording />} />
          <Route path="/collection-management" element={<CollectionManagement />} />
          <Route path="/tenant-account-management" element={<TenantAccountManagement />} />
          
          {/* Expenses */}
          <Route path="/expense-recording" element={<ExpenseRecording />} />
          <Route path="/expense-approval" element={<ExpenseApproval />} />
          <Route path="/check-request-and-release" element={<CheckRequestAndRelease />} />
          <Route path="/budgeting" element={<Budgeting />} />
          
          {/* Inventory & Purchasing */}
          <Route path="/inventory-tracking" element={<InventoryTracking />} />
          <Route path="/purchase-order" element={<PurchaseOrderCreation />} />
          
          {/* Financial */}
          <Route path="/financial-reporting" element={<FinancialReporting />} />
          <Route path="/loan-management" element={<LoanManagement />} />
          
          {/* Administration */}
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/security-management" element={<SecurityManagement />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={
            <div style={{ padding: 20, textAlign: 'center' }}>
              <h2>404: Page Not Found</h2>
              <p>The page you are looking for does not exist.</p>
            </div>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;