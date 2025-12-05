// src/pages/reports/FinancialReporting.jsx
import React, { useState, useEffect, useMemo } from "react";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Home as HomeIcon,
  ReceiptLong as ReportIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalance as AccountBalanceIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Build as BuildIcon,
  Gavel as GavelIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from "@mui/icons-material";


import MainLayout from "../../layouts/MainLayout";

/**
 * FinancialReporting page - Complete module with all requirements
 * 
 * Theme matches PaymentRecording component:
 * - black headings, red primary accents (#D32F2F)
 * - Cards for totals
 * - Tabs for different sections
 */

const statementTypes = [
  { value: "income", label: "Income Statement" },
  { value: "balance", label: "Balance Sheet" },
  { value: "cashflow", label: "Cash Flow Statement" },
];

const accountTypes = [
  { type: 'Assets', color: 'success', examples: ['Cash', 'Accounts Receivable', 'Inventory', 'Bank Accounts'] },
  { type: 'Liabilities', color: 'error', examples: ['Accounts Payable', 'Loans Payable'] },
  { type: 'Equity', color: 'primary', examples: ['Owner\'s Equity'] },
  { type: 'Revenue', color: 'info', examples: ['Stall Rentals', 'Parking Fees'] },
  { type: 'Expenses', color: 'warning', examples: ['Salaries', 'Utilities', 'Supplies'] },
];

const specificReports = [
  { name: 'Bank Reconciliation Report', description: 'Reconcile bank statements with system records' },
  { name: 'Daily Collection Report', description: 'Summarize revenue collected each day' },
  { name: 'Collector Report', description: 'Track collections by individual collectors' },
  { name: 'Cash Collection Balancing Report', description: 'Balance cash collected against transactions' },
  { name: 'Revenue Type Report', description: 'Summarize revenue by specific types' },
  { name: 'Expense Type Report', description: 'Summarize expenses by categories' },
];

const userRoles = [
  {
    role: 'Finance Manager',
    permissions: ['View all reports', 'Generate standard statements', 'Customize reports', 'Bank reconciliation', 'Collector reports']
  },
  {
    role: 'Admin Staff',
    permissions: ['View basic reports', 'Limited customization']
  },
  {
    role: 'Cashier',
    permissions: ['View daily sales reports', 'Limited statement access']
  },
  {
    role: 'Market Master',
    permissions: ['View operational reports', 'Limited customization']
  },
  {
    role: 'Executive',
    permissions: ['Full access to all reports and features']
  }
];

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9).toUpperCase();
}

export default function FinancialReporting() {
  const [tab, setTab] = useState(0);

  // Statement generator state
  const [statementType, setStatementType] = useState("income");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [generatedStatement, setGeneratedStatement] = useState(null);

  // Custom report builder state
  const [selectedFields, setSelectedFields] = useState([
    "date",
    "type",
    "amount",
    "tenantName",
  ]);
  const availableFields = [
    { key: "date", label: "Date" },
    { key: "receiptNumber", label: "Receipt #" },
    { key: "type", label: "Payment Type" },
    { key: "tenantName", label: "Tenant / Patron" },
    { key: "stallName", label: "Stall / Facility" },
    { key: "amount", label: "Amount (₱)" },
    { key: "method", label: "Payment Method" },
    { key: "collectorId", label: "Collector ID" },
  ];
  const [filterType, setFilterType] = useState("all");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [mockData, setMockData] = useState([]);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");

  // load mock payments from localStorage if available
  useEffect(() => {
    const ph = JSON.parse(localStorage.getItem("paymentHistory")) || [];
    setMockData(ph);
    const st = JSON.parse(localStorage.getItem("fr_saved_templates")) || [];
    setSavedTemplates(st);
  }, []);

  // simple totals for top cards
  const totals = useMemo(() => {
    const from = filterFrom ? new Date(filterFrom) : null;
    const to = filterTo ? new Date(filterTo) : null;
    let filtered = mockData;
    if (from) filtered = filtered.filter((r) => new Date(r.date) >= from);
    if (to) filtered = filtered.filter((r) => new Date(r.date) <= to);
    const totalAmount = filtered.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
    return {
      totalRecords: filtered.length,
      totalAmount,
    };
  }, [mockData, filterFrom, filterTo]);

  // Generate mock statement
  const handleGenerateStatement = () => {
    if (!fromDate || !toDate) {
      alert("Please choose a from and to date.");
      return;
    }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const rows = (mockData || []).filter((r) => {
      const d = new Date(r.date);
      return d >= from && d <= to;
    });

    const group = {};
    rows.forEach((r) => {
      const k = r.paymentTypeLabel || r.paymentType || "Other";
      group[k] = (group[k] || 0) + parseFloat(r.amount || 0);
    });

    const statement = {
      id: uid("STM-"),
      type: statementType,
      from: fromDate,
      to: toDate,
      generatedAt: new Date().toISOString(),
      rows: Object.entries(group).map(([label, amt]) => ({ label, amount: amt })),
      total: Object.values(group).reduce((s, v) => s + v, 0),
    };

    setGeneratedStatement(statement);
  };

  // Save custom report template
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert("Enter a template name first.");
      return;
    }
    const tpl = {
      id: uid("TPL-"),
      name: templateName.trim(),
      fields: selectedFields,
      filterType,
    };
    const next = [tpl, ...savedTemplates];
    setSavedTemplates(next);
    localStorage.setItem("fr_saved_templates", JSON.stringify(next));
    setTemplateName("");
    alert("Template saved.");
  };

  const handleRunCustomReport = (template = null) => {
    let fields = selectedFields;
    let type = filterType;
    if (template) {
      fields = template.fields;
      type = template.filterType;
    }

    let results = mockData.slice();
    if (type && type !== "all") {
      results = results.filter((r) => r.paymentType === type);
    }
    if (filterFrom) {
      const f = new Date(filterFrom);
      results = results.filter((r) => new Date(r.date) >= f);
    }
    if (filterTo) {
      const t = new Date(filterTo);
      results = results.filter((r) => new Date(r.date) <= t);
    }

    const rows = results.map((r) =>
      fields.reduce((acc, key) => {
        acc[key] = key === "amount" ? `₱${(parseFloat(r.amount) || 0).toFixed(2)}` : r[key] ?? "-";
        return acc;
      }, {})
    );

    setGeneratedStatement({
      id: uid("CR-"),
      type: "custom",
      name: template ? template.name : "Ad-hoc",
      fields,
      rows,
      total: results.reduce((s, r) => s + parseFloat(r.amount || 0), 0),
    });
  };

  // Export currently generatedStatement as CSV
  const handleExportCSV = () => {
    if (!generatedStatement) {
      alert("Please generate a statement or custom report first.");
      return;
    }
    let csv = "";
    if (generatedStatement.type !== "custom") {
      csv += `Label,Amount\n`;
      generatedStatement.rows.forEach((r) => {
        csv += `"${r.label.replace(/"/g, '""')}",${r.amount}\n`;
      });
      csv += `TOTAL,${generatedStatement.total}\n`;
    } else {
      csv += generatedStatement.fields.map((f) => {
        const header = availableFields.find((a) => a.key === f)?.label || f;
        return `"${header.replace(/"/g, '""')}"`;
      }).join(",") + "\n";
      generatedStatement.rows.forEach((r) => {
        csv += generatedStatement.fields.map((f) => `"${(r[f] || "").toString().replace(/"/g, '""')}"`).join(",") + "\n";
      });
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${generatedStatement.type || "report"}-${(generatedStatement.id || uid()).toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print statement area
  const handlePrint = () => window.print();

  return (
    <MainLayout>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/dashboard" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <HomeIcon fontSize="small" /> Dashboard
          </Link>
          <Typography color="text.primary">Financial Reporting</Typography>
        </Breadcrumbs>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Financial Reporting</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => {
            const blob = new Blob([JSON.stringify(mockData || [], null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `payments-export.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}>Export Payments</Button>
          <Button variant="contained" sx={{ bgcolor: "#D32F2F" }} startIcon={<PrintIcon />} onClick={handlePrint}>Print</Button>
        </Stack>
      </Stack>

      {/* Top summary cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3,  boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <CardContent>
              <Typography color="text.secondary">Total Records</Typography>
              <Typography variant="h4" sx={{ color: "#000", fontWeight: 700 }}>{totals.totalRecords}</Typography>
              <Typography variant="body2" color="text.secondary">Records in selected filter</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3,  boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            <CardContent>
              <Typography color="text.secondary">Total Amount</Typography>
              <Typography variant="h4" sx={{ color: "#D32F2F", fontWeight: 700 }}>₱{totals.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
              <Typography variant="body2" color="text.secondary">Sum of amounts (filtered)</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)} 
          aria-label="financial-reporting-tabs"
          sx={{ 
            mb: 2,
            '& .MuiTab-root': {
              fontWeight: 600,
            }
          }}
        >
          <Tab icon={<AccountBalanceIcon />} label="Chart of Accounts" />
          <Tab icon={<AssessmentIcon />} label="Financial Statements" />
          <Tab icon={<TimelineIcon />} label="Reporting Periods" />
          <Tab icon={<SecurityIcon />} label="Data Integrity" />
          <Tab icon={<BuildIcon />} label="Custom Reports" />
          <Tab icon={<GavelIcon />} label="Standards & Tax" />
<Tab icon={<ReportIcon />} label="Specific Reports" />          <Tab icon={<SecurityIcon />} label="User Roles" />
        </Tabs>

        <Divider sx={{ mb: 3 }} />

        {/* Chart of Accounts Tab */}
        {tab === 0 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Chart of Accounts Management</Typography>
            
            <Grid container spacing={3}>
              {/* Account Types */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Account Types</Typography>
                    <Grid container spacing={2}>
                      {accountTypes.map((accountType, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Paper sx={{ p: 2, border: 1, borderColor: 'grey.200' }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                              <Chip 
                                label={accountType.type} 
                                color={accountType.color}
                                size="small"
                                sx={{ mb: 1 }}
                              />
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Examples:
                            </Typography>
                            <List dense>
                              {accountType.examples.map((example, idx) => (
                                <ListItem key={idx} sx={{ py: 0 }}>
                                  <ListItemText primary={example} />
                                </ListItem>
                              ))}
                            </List>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Features and Use Cases */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Features</Typography>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Define Chart of Accounts"
                          secondary="Predefined account structure for categorizing transactions"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Manage Accounts"
                          secondary="Add, edit, and organize accounts within the structure"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Use Cases</Typography>
                    <List>
                      <ListItem>
                        <ListItemText primary="Finance manager views the Chart of Accounts" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Finance manager adds a new expense account" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Finance manager reorganizes the account structure" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Financial Statements Tab */}
        {tab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Generate Financial Statement</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Statement Type</InputLabel>
                  <Select value={statementType} label="Statement Type" onChange={(e) => setStatementType(e.target.value)}>
                    {statementTypes.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField label="From" type="date" fullWidth InputLabelProps={{ shrink: true }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField label="To" type="date" fullWidth InputLabelProps={{ shrink: true }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </Grid>

              <Grid item xs={12} md={3}>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" sx={{ bgcolor: "#D32F2F" }} onClick={handleGenerateStatement}>Generate</Button>
                  <Button variant="outlined" onClick={() => { setGeneratedStatement(null); setFromDate(""); setToDate(""); }}>Reset</Button>
                </Stack>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Generated statement preview */}
            {generatedStatement ? (
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {statementTypes.find(s => s.value === generatedStatement.type)?.label ?? "Report"}:
                    {" "}
                    <Typography component="span" sx={{ fontWeight: 600, ml: 1 }}>{generatedStatement.from} → {generatedStatement.to}</Typography>
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    <Button startIcon={<SaveIcon />} onClick={() => {
                      const k = `fr_${generatedStatement.id}`;
                      localStorage.setItem(k, JSON.stringify(generatedStatement));
                      alert("Statement snapshot saved to localStorage.");
                    }}>Save Snapshot</Button>
                    <Button startIcon={<DownloadIcon />} onClick={handleExportCSV}>Export CSV</Button>
                    <Button variant="contained" sx={{ bgcolor: "#D32F2F" }} onClick={handlePrint}>Print</Button>
                  </Stack>
                </Stack>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                      <TableRow>
                        <TableCell><b>Label</b></TableCell>
                        <TableCell align="right"><b>Amount (₱)</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {generatedStatement.rows.map((r, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{r.label}</TableCell>
                          <TableCell align="right">{parseFloat(r.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell><b>Total</b></TableCell>
                        <TableCell align="right"><b>{generatedStatement.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Typography color="text.secondary">No statement generated yet. Pick a date range and click Generate.</Typography>
            )}
          </Box>
        )}

        {/* Custom Reports Tab (reusing your existing custom reports functionality) */}
        {tab === 4 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Custom Report Builder</Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Type</InputLabel>
                  <Select value={filterType} label="Filter by Type" onChange={(e) => setFilterType(e.target.value)}>
                    <MenuItem value="all">All Types</MenuItem>
                    {Array.from(new Set((mockData || []).map(m => m.paymentType))).filter(Boolean).map((pt) => (
                      <MenuItem key={pt} value={pt}>{pt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField label="From Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField label="To Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
              </Grid>

              <Grid item xs={12}>
                <Typography sx={{ mb: 1, fontWeight: 600 }}>Select Fields</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {availableFields.map((f) => {
                    const active = selectedFields.includes(f.key);
                    return (
                      <Chip
                        key={f.key}
                        label={f.label}
                        color={active ? "primary" : "default"}
                        onClick={() => {
                          setSelectedFields((prev) =>
                            prev.includes(f.key) ? prev.filter((p) => p !== f.key) : [...prev, f.key]
                          );
                        }}
                        sx={{ cursor: "pointer", mb: 1 }}
                      />
                    );
                  })}
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Template name (optional)" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
              </Grid>

              <Grid item xs={12} md={6} display="flex" alignItems="center" gap={1}>
                <Button variant="contained" sx={{ bgcolor: "#D32F2F" }} onClick={() => handleRunCustomReport(null)}>Run Report</Button>
                <Button variant="outlined" onClick={handleSaveTemplate} startIcon={<SaveIcon />}>Save Template</Button>
                <Button variant="outlined" onClick={() => { setSelectedFields([]); setFilterFrom(""); setFilterTo(""); setFilterType("all"); }}>Reset</Button>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Typography sx={{ fontWeight: 700 }}>Saved Templates</Typography>
              <Box>
                {savedTemplates.length === 0 ? (
                  <Typography color="text.secondary">No templates</Typography>
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {savedTemplates.map((t) => (
                      <Chip key={t.id} label={t.name} onClick={() => handleRunCustomReport(t)} />
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>

            {/* Generated custom report */}
            {generatedStatement && generatedStatement.type === "custom" ? (
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography sx={{ fontWeight: 700 }}>{generatedStatement.name || "Custom Report"}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button onClick={handleExportCSV}>Export CSV</Button>
                    <Button variant="contained" sx={{ bgcolor: "#D32F2F" }} onClick={handlePrint}>Print</Button>
                  </Stack>
                </Stack>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                      <TableRow>
                        {generatedStatement.fields.map((f) => (
                          <TableCell key={f}><b>{availableFields.find(a => a.key === f)?.label || f}</b></TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {generatedStatement.rows.length ? generatedStatement.rows.map((r, idx) => (
                        <TableRow key={idx}>
                          {generatedStatement.fields.map((f) => <TableCell key={f}>{r[f]}</TableCell>)}
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={generatedStatement.fields.length} align="center">No rows</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell colSpan={generatedStatement.fields.length}>
                          <Typography sx={{ fontWeight: 700 }}>Total: ₱{generatedStatement.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Typography color="text.secondary">Run a custom report or select a saved template to view results here.</Typography>
            )}
          </Box>
        )}

        {/* Specific Reports Tab */}
        {tab === 6 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Specific Report Generation</Typography>
            
            <Grid container spacing={3}>
              {specificReports.map((report, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{report.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {report.description}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => {
                          // Simple mock generation for demonstration
                          alert(`Generating ${report.name}...`);
                        }}
                      >
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* User Roles Tab */}
        {tab === 7 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>User Roles and Permissions</Typography>
            
            <Grid container spacing={3}>
              {userRoles.map((role, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>{role.role}</Typography>
                      <Typography variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                        Permissions:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {role.permissions.map((permission, idx) => (
                          <Chip 
                            key={idx}
                            label={permission}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 0.5 }}
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

        {/* Placeholder for other tabs */}
        {[2, 3, 5].includes(tab) && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              {tab === 2 && "Reporting Periods"}
              {tab === 3 && "Data Integrity Management"}
              {tab === 5 && "Accounting Standards & Tax Reporting"}
            </Typography>
            <Typography color="text.secondary">
              This section is under development. Functionality coming soon.
            </Typography>
          </Box>
        )}
      </Paper>
    </MainLayout>
  );
}