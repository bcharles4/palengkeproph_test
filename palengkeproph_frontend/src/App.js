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
import LeaseCreation from './pages/tenant/LeaseCreation';
import LeaseRenewal from './pages/tenant/LeaseRenewal';
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
  typography: {
    fontFamily: "'Graphik', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
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
          <Route path="/stall-inventory" element={<StallInventory />} />
          <Route path="/stall-assignment" element={<StallAssignment />} />
          <Route path="/tenant-list" element={<TenantList />} />
          <Route path="/tenant-information" element={<TenantInformation />} />
          <Route path="/lease-creation" element={<LeaseCreation />} />
          <Route path="/lease-renewal" element={<LeaseRenewal />} />
          <Route path="/payment-recording" element={<PaymentRecording />} />
          <Route path="/expense-recording" element={<ExpenseRecording />} />
          <Route path="/expense-approval" element={<ExpenseApproval />} />
          <Route path="/inventory-tracking" element={<InventoryTracking />} />
          <Route path="/purchase-order" element={<PurchaseOrderCreation />} />
          <Route path="/collection-management" element={<CollectionManagement />} />
          <Route path="/tenant-account-management" element={<TenantAccountManagement />} />
          <Route path="/check-request-and-release" element={<CheckRequestAndRelease />} />
          <Route path="/budgeting" element={<Budgeting />} />
          <Route path="/financial-reporting" element={<FinancialReporting />} />
          <Route path="/loan-management" element={<LoanManagement />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/security-management" element={<SecurityManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
export default App;
