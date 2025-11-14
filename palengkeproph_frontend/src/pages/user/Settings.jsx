// src/pages/administration/SystemSettings.jsx
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
  Switch,
  FormControlLabel,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Backup as BackupIcon,
  Security as SecurityIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Storage as StorageIcon,  // Use Storage icon instead of Database
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Lock as LockIcon,
  VpnKey as VpnKeyIcon,
} from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";

// System settings structure
const initialSettings = {
  general: {
    marketName: "PalengkePro.Ph",
    marketAddress: "123 Market Street, City, Philippines",
    currency: "PHP",
    timezone: "Asia/Manila",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    fiscalYearStart: "January",
    autoBackup: true,
    backupFrequency: "daily",
  },
  financial: {
    taxRate: 12.0,
    latePaymentFee: 500.00,
    securityDepositRate: 2000.00,
    paymentGracePeriod: 5,
    autoCalculateTax: true,
    receiptPrefix: "PP",
    receiptSequence: 1001,
    defaultPaymentMethod: "cash",
  },
  security: {
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    twoFactorAuth: false,
    auditLogRetention: 365,
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    paymentReminders: true,
    leaseExpiryAlerts: true,
    securityIncidents: true,
    systemMaintenance: true,
    dailyReports: false,
    weeklyReports: true,
  },
  appearance: {
    theme: "light",
    primaryColor: "#D32F2F",
    sidebarCollapsed: false,
    dashboardLayout: "grid",
    showCharts: true,
    compactMode: false,
  }
};

// Backup history mock data
const backupHistory = [
  { id: 1, date: "2024-01-15 02:00", type: "Auto", size: "45.2 MB", status: "completed" },
  { id: 2, date: "2024-01-14 02:00", type: "Auto", size: "44.8 MB", status: "completed" },
  { id: 3, date: "2024-01-13 14:30", type: "Manual", size: "45.1 MB", status: "completed" },
  { id: 4, date: "2024-01-12 02:00", type: "Auto", size: "43.9 MB", status: "failed" },
];

// System information
const systemInfo = {
  version: "2.1.0",
  lastUpdate: "2024-01-10",
  databaseSize: "156.7 MB",
  totalUsers: 24,
  totalTransactions: 12547,
  serverUptime: "15 days, 6 hours",
  phpVersion: "8.1.12",
  databaseVersion: "MySQL 8.0",
};

export default function SystemSettings() {
  const [tab, setTab] = useState(0);
  const [settings, setSettings] = useState(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [backupDialog, setBackupDialog] = useState(false);
  const [restoreDialog, setRestoreDialog] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("palengke_settings"));
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem("palengke_settings", JSON.stringify(settings));
    setHasChanges(false);
    alert("Settings saved successfully!");
  };

  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleBackup = () => {
    // Simulate backup process
    alert("System backup initiated...");
    setBackupDialog(false);
  };

  const handleRestore = () => {
    // Simulate restore process
    alert("System restore initiated...");
    setRestoreDialog(false);
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setHasChanges(true);
    setResetDialog(false);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `palengke-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          setHasChanges(true);
          alert("Settings imported successfully!");
        } catch (error) {
          alert("Error importing settings: Invalid file format");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <MainLayout>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/dashboard" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <HomeIcon fontSize="small" /> Dashboard
          </Link>
          <Typography color="text.primary">System Settings</Typography>
        </Breadcrumbs>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>System Settings</Typography>
        <Stack direction="row" spacing={1}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={() => setSettings(initialSettings)}
          >
            Reset Changes
          </Button>
          <Button 
            variant="contained" 
            sx={{ bgcolor: "#D32F2F" }}
            startIcon={<SaveIcon />}
            onClick={saveSettings}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </Stack>
      </Stack>

      {/* System Status Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography color="text.secondary">System Version</Typography>
              <Typography variant="h4" sx={{ color: "#000", fontWeight: 700 }}>v{systemInfo.version}</Typography>
              <Typography variant="body2" color="text.secondary">Last update: {systemInfo.lastUpdate}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography color="text.secondary">Database Size</Typography>
              <Typography variant="h4" sx={{ color: "#D32F2F", fontWeight: 700 }}>{systemInfo.databaseSize}</Typography>
              <Typography variant="body2" color="text.secondary">Total transactions: {systemInfo.totalTransactions.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography color="text.secondary">Server Uptime</Typography>
              <Typography variant="h6" sx={{ color: "#000", fontWeight: 700 }}>{systemInfo.serverUptime}</Typography>
              <Typography variant="body2" color="text.secondary">System running smoothly</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography color="text.secondary">Active Users</Typography>
              <Typography variant="h4" sx={{ color: "#D32F2F", fontWeight: 700 }}>{systemInfo.totalUsers}</Typography>
              <Typography variant="body2" color="text.secondary">Registered system users</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)} 
          aria-label="settings-tabs"
          sx={{ 
            mb: 2,
            '& .MuiTab-root': {
              fontWeight: 600,
            }
          }}
        >
          <Tab icon={<SettingsIcon />} label="General" />
          <Tab icon={<AccountBalanceIcon />} label="Financial" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<PaletteIcon />} label="Appearance" />
          <Tab icon={<StorageIcon />} label="Backup & Restore" />
        </Tabs>

        <Divider sx={{ mb: 3 }} />

        {/* General Settings Tab */}
        {tab === 0 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>General System Settings</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Market Name"
                  value={settings.general.marketName}
                  onChange={(e) => handleSettingChange('general', 'marketName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Market Address"
                  value={settings.general.marketAddress}
                  onChange={(e) => handleSettingChange('general', 'marketAddress', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={settings.general.currency}
                    label="Currency"
                    onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                  >
                    <MenuItem value="PHP">Philippine Peso (₱)</MenuItem>
                    <MenuItem value="USD">US Dollar ($)</MenuItem>
                    <MenuItem value="EUR">Euro (€)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={settings.general.timezone}
                    label="Timezone"
                    onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                  >
                    <MenuItem value="Asia/Manila">Philippine Time (PHT)</MenuItem>
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">Eastern Time</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.general.language}
                    label="Language"
                    onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="fil">Filipino</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={settings.general.dateFormat}
                    label="Date Format"
                    onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                  >
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Fiscal Year Start</InputLabel>
                  <Select
                    value={settings.general.fiscalYearStart}
                    label="Fiscal Year Start"
                    onChange={(e) => handleSettingChange('general', 'fiscalYearStart', e.target.value)}
                  >
                    <MenuItem value="January">January</MenuItem>
                    <MenuItem value="April">April</MenuItem>
                    <MenuItem value="July">July</MenuItem>
                    <MenuItem value="October">October</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.general.autoBackup}
                      onChange={(e) => handleSettingChange('general', 'autoBackup', e.target.checked)}
                    />
                  }
                  label="Enable Automatic Backups"
                />
              </Grid>

              {settings.general.autoBackup && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Backup Frequency</InputLabel>
                    <Select
                      value={settings.general.backupFrequency}
                      label="Backup Frequency"
                      onChange={(e) => handleSettingChange('general', 'backupFrequency', e.target.value)}
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Financial Settings Tab */}
        {tab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Financial Settings</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax Rate (%)"
                  type="number"
                  value={settings.financial.taxRate}
                  onChange={(e) => handleSettingChange('financial', 'taxRate', parseFloat(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Late Payment Fee"
                  type="number"
                  value={settings.financial.latePaymentFee}
                  onChange={(e) => handleSettingChange('financial', 'latePaymentFee', parseFloat(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Security Deposit Rate"
                  type="number"
                  value={settings.financial.securityDepositRate}
                  onChange={(e) => handleSettingChange('financial', 'securityDepositRate', parseFloat(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Payment Grace Period (days)"
                  type="number"
                  value={settings.financial.paymentGracePeriod}
                  onChange={(e) => handleSettingChange('financial', 'paymentGracePeriod', parseInt(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">days</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Receipt Prefix"
                  value={settings.financial.receiptPrefix}
                  onChange={(e) => handleSettingChange('financial', 'receiptPrefix', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Receipt Starting Sequence"
                  type="number"
                  value={settings.financial.receiptSequence}
                  onChange={(e) => handleSettingChange('financial', 'receiptSequence', parseInt(e.target.value))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Default Payment Method</InputLabel>
                  <Select
                    value={settings.financial.defaultPaymentMethod}
                    label="Default Payment Method"
                    onChange={(e) => handleSettingChange('financial', 'defaultPaymentMethod', e.target.value)}
                  >
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="gcash">GCash</MenuItem>
                    <MenuItem value="bank">Bank Transfer</MenuItem>
                    <MenuItem value="card">Credit/Debit Card</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.financial.autoCalculateTax}
                      onChange={(e) => handleSettingChange('financial', 'autoCalculateTax', e.target.checked)}
                    />
                  }
                  label="Automatically Calculate Tax on Payments"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Security Settings Tab */}
        {tab === 2 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Security Settings</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Session Timeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password Minimum Length"
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Login Attempts"
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Lockout Duration"
                  type="number"
                  value={settings.security.lockoutDuration}
                  onChange={(e) => handleSettingChange('security', 'lockoutDuration', parseInt(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Audit Log Retention"
                  type="number"
                  value={settings.security.auditLogRetention}
                  onChange={(e) => handleSettingChange('security', 'auditLogRetention', parseInt(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">days</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Password Requirements</Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.requireSpecialChars}
                        onChange={(e) => handleSettingChange('security', 'requireSpecialChars', e.target.checked)}
                      />
                    }
                    label="Require Special Characters"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.requireNumbers}
                        onChange={(e) => handleSettingChange('security', 'requireNumbers', e.target.checked)}
                      />
                    }
                    label="Require Numbers"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.requireUppercase}
                        onChange={(e) => handleSettingChange('security', 'requireUppercase', e.target.checked)}
                      />
                    }
                    label="Require Uppercase Letters"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                      />
                    }
                    label="Enable Two-Factor Authentication"
                  />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Notifications Settings Tab */}
        {tab === 3 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Notification Settings</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Notification Methods</Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                      />
                    }
                    label="SMS Notifications"
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Notification Types</Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.paymentReminders}
                        onChange={(e) => handleSettingChange('notifications', 'paymentReminders', e.target.checked)}
                      />
                    }
                    label="Payment Reminders"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.leaseExpiryAlerts}
                        onChange={(e) => handleSettingChange('notifications', 'leaseExpiryAlerts', e.target.checked)}
                      />
                    }
                    label="Lease Expiry Alerts"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.securityIncidents}
                        onChange={(e) => handleSettingChange('notifications', 'securityIncidents', e.target.checked)}
                      />
                    }
                    label="Security Incident Alerts"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.systemMaintenance}
                        onChange={(e) => handleSettingChange('notifications', 'systemMaintenance', e.target.checked)}
                      />
                    }
                    label="System Maintenance Notifications"
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Reports</Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.dailyReports}
                        onChange={(e) => handleSettingChange('notifications', 'dailyReports', e.target.checked)}
                      />
                    }
                    label="Daily Summary Reports"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.weeklyReports}
                        onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                      />
                    }
                    label="Weekly Summary Reports"
                  />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Backup & Restore Tab */}
        {tab === 5 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Backup & Restore</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>System Backup</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Create a backup of all system data including transactions, user accounts, and settings.
                    </Typography>
                    <Stack spacing={2}>
                      <Button 
                        variant="contained" 
                        startIcon={<BackupIcon />}
                        onClick={() => setBackupDialog(true)}
                        sx={{ bgcolor: "#D32F2F" }}
                      >
                        Create Backup
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<DownloadIcon />}
                        onClick={exportSettings}
                      >
                        Export Settings
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>System Restore</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Restore system data from a previous backup or import settings from a file.
                    </Typography>
                    <Stack spacing={2}>
                      <Button 
                        variant="outlined" 
                        startIcon={<UploadIcon />}
                        onClick={() => setRestoreDialog(true)}
                      >
                        Restore Backup
                      </Button>
                      <Button 
                        variant="outlined" 
                        component="label"
                        startIcon={<UploadIcon />}
                      >
                        Import Settings
                        <input
                          type="file"
                          hidden
                          accept=".json"
                          onChange={importSettings}
                        />
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Backup History</Typography>
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                          <TableRow>
                            <TableCell><b>Date & Time</b></TableCell>
                            <TableCell><b>Type</b></TableCell>
                            <TableCell><b>Size</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {backupHistory.map((backup) => (
                            <TableRow key={backup.id}>
                              <TableCell>{backup.date}</TableCell>
                              <TableCell>{backup.type}</TableCell>
                              <TableCell>{backup.size}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={backup.status} 
                                  color={backup.status === 'completed' ? 'success' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2, borderColor: 'error.main' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'error.main' }}>
                      <LockIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Danger Zone
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Reset all system settings to their default values. This action cannot be undone.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="error"
                      startIcon={<VpnKeyIcon />}
                      onClick={() => setResetDialog(true)}
                    >
                      Reset to Defaults
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Backup Dialog */}
      <Dialog open={backupDialog} onClose={() => setBackupDialog(false)}>
        <DialogTitle>Create System Backup</DialogTitle>
        <DialogContent>
          <Typography>
            This will create a complete backup of all system data including:
          </Typography>
          <List dense>
            <ListItem>• User accounts and permissions</ListItem>
            <ListItem>• Tenant and stall information</ListItem>
            <ListItem>• Financial transactions and payments</ListItem>
            <ListItem>• System settings and configurations</ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 2 }}>
            Estimated backup size: ~45 MB. This process may take a few minutes.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialog(false)}>Cancel</Button>
          <Button onClick={handleBackup} variant="contained" sx={{ bgcolor: "#D32F2F" }}>
            Start Backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={restoreDialog} onClose={() => setRestoreDialog(false)}>
        <DialogTitle>Restore System Backup</DialogTitle>
        <DialogContent>
          <Typography>
            Select a backup file to restore system data. This will overwrite all current data.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Warning: This action cannot be undone. All current data will be replaced with the backup data.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialog(false)}>Cancel</Button>
          <Button onClick={handleRestore} variant="contained" color="error">
            Restore Backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Dialog */}
      <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
        <DialogTitle>Reset System Settings</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all system settings to their default values?
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            This action cannot be undone. All custom settings will be lost.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)}>Cancel</Button>
          <Button onClick={handleReset} variant="contained" color="error">
            Reset Settings
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}