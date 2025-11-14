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
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  Home as HomeIcon,
  Report as ReportIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  CameraAlt as CameraIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";

/**
 * SecurityManagement page
 * - Single page with Tabs representing the 8 sub-pages from the Functional spec
 * - Theme & style matches your FinancialReporting / PaymentRecording components
 * - All data is mocked / localStorage-based for demo
 */

const SEVERITY = ["Low", "Medium", "High"];
const INCIDENT_STATUS = ["Reported", "Investigating", "Resolved", "Closed"];

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9).toUpperCase();
}

export default function SecurityManagement() {
  const [tab, setTab] = useState(0);

  /** Incident Reporting state */
  const [incidents, setIncidents] = useState([]);
  const [form, setForm] = useState({ date: "", time: "", location: "", description: "", reportedBy: "", contact: "", severity: "Medium", photos: [] });
  const [openIncidentDialog, setOpenIncidentDialog] = useState(false);

  /** Incident management / selected */
  const [selectedIncident, setSelectedIncident] = useState(null);

  /** CCTV mock list */
  const [cameras] = useState([
    { id: "CAM-01", name: "Entrance - North" },
    { id: "CAM-02", name: "Wet Section - East" },
    { id: "CAM-03", name: "Dry Section - South" },
  ]);

  /** Personnel management */
  const [personnel, setPersonnel] = useState([]);
  const [personForm, setPersonForm] = useState({ id: "", name: "", shift: "", contact: "" });

  /** Notifications settings */
  const [notifSettings, setNotifSettings] = useState({ low: ["app"], medium: ["app"], high: ["app", "sms", "email"] });

  /** Retention policy */
  const [retention, setRetention] = useState({ lowDays: 7, mediumDays: 30, highDays: 90 });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("incidents")) || [];
    setIncidents(stored);
    const p = JSON.parse(localStorage.getItem("security_personnel")) || [
      { id: "SEC-001", name: "Officer A", shift: "Day", contact: "0917-000-0001" },
      { id: "SEC-002", name: "Officer B", shift: "Night", contact: "0917-000-0002" },
    ];
    setPersonnel(p);
  }, []);

  useEffect(() => {
    localStorage.setItem("incidents", JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem("security_personnel", JSON.stringify(personnel));
  }, [personnel]);

  // Incident reporting handlers
  const handleReportIncident = () => {
    if (!form.date || !form.time || !form.location || !form.description) {
      alert("Please fill required fields (date, time, location, description).");
      return;
    }
    const inc = {
      id: uid("INC-"),
      date: form.date,
      time: form.time,
      location: form.location,
      description: form.description,
      reportedBy: form.reportedBy || "Anonymous",
      contact: form.contact || "",
      photos: form.photos || [],
      severity: form.severity,
      status: "Reported",
      notes: [],
      assignedTo: null,
      createdAt: new Date().toISOString(),
    };
    setIncidents((s) => [inc, ...s]);
    setForm({ date: "", time: "", location: "", description: "", reportedBy: "", contact: "", severity: "Medium", photos: [] });
    setOpenIncidentDialog(false);
    alert(`Incident reported (ID: ${inc.id})`);
  };

  const handleUpdateIncident = (id, patch) => {
    setIncidents((prev) => prev.map((inc) => (inc.id === id ? { ...inc, ...patch, updatedAt: new Date().toISOString() } : inc)));
  };

  const handleAssign = (id, personnelId) => {
    const person = personnel.find((p) => p.id === personnelId);
    handleUpdateIncident(id, { assignedTo: person ? person.id : null, status: "Investigating" });
  };

  // Personnel management
  const handleAddPersonnel = () => {
    if (!personForm.name) { alert("Enter name"); return; }
    const p = { id: personForm.id || uid("SEC-"), name: personForm.name, shift: personForm.shift || "Day", contact: personForm.contact || "" };
    setPersonnel((s) => [p, ...s]);
    setPersonForm({ id: "", name: "", shift: "", contact: "" });
  };

  const handleDeletePersonnel = (id) => {
    if (!window.confirm("Delete personnel?")) return;
    setPersonnel((s) => s.filter((p) => p.id !== id));
  };

  // Reporting/analytics (simple counts)
  const analytics = {
    totalIncidents: incidents.length,
    bySeverity: incidents.reduce((acc, i) => { acc[i.severity] = (acc[i.severity] || 0) + 1; return acc; }, {}),
    byStatus: incidents.reduce((acc, i) => { acc[i.status] = (acc[i.status] || 0) + 1; return acc; }, {}),
  };

  // Notifications preview
  const sendNotificationPreview = (inc) => {
    // simple mock behavior
    const methods = notifSettings[inc.severity.toLowerCase()] || [];
    alert(`Would send ${methods.join(", ")} for incident ${inc.id} (severity ${inc.severity})`);
  };

  return (
    <MainLayout>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/dashboard" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <HomeIcon fontSize="small" /> Dashboard
          </Link>
          <Typography color="text.primary">Security Management</Typography>
        </Breadcrumbs>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Security Management</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<ReportIcon />} onClick={() => setTab(0)}>Incidents</Button>
          <Button variant="contained" startIcon={<CameraIcon />} onClick={() => setTab(2)} sx={{ bgcolor: "#D32F2F" }}>CCTV</Button>
        </Stack>
      </Stack>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography color="text.secondary">Total Incidents</Typography>
              <Typography variant="h4" sx={{ color: "#000", fontWeight: 700 }}>{analytics.totalIncidents}</Typography>
              <Typography variant="body2" color="text.secondary">All reported incidents</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography color="text.secondary">Open / Investigating</Typography>
              <Typography variant="h4" sx={{ color: "#D32F2F", fontWeight: 700 }}>{analytics.byStatus['Investigating'] || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Active responses</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} aria-label="security-tabs" sx={{ mb: 2 }}>
          <Tab label="Incident Reporting" />
          <Tab label="Incident Management" />
          <Tab label="CCTV Integration" />
          <Tab label="Security Personnel" />
          <Tab label="Reporting & Analytics" />
          <Tab label="Notification Mgmt" />
          <Tab label="Data Retention" />
          <Tab label="Privacy" />
        </Tabs>

        <Divider sx={{ mb: 3 }} />

        {/* Incident Reporting */}
        {tab === 0 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Report Security Incident</Typography>
              <Button startIcon={<AddIcon />} onClick={() => setOpenIncidentDialog(true)}>New Incident</Button>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell><b>Incident ID</b></TableCell>
                    <TableCell><b>Date / Time</b></TableCell>
                    <TableCell><b>Location</b></TableCell>
                    <TableCell><b>Severity</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                    <TableCell><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {incidents.map((inc) => (
                    <TableRow key={inc.id} hover>
                      <TableCell>{inc.id}</TableCell>
                      <TableCell>{inc.date} {inc.time}</TableCell>
                      <TableCell>{inc.location}</TableCell>
                      <TableCell><Chip label={inc.severity} color={inc.severity === 'High' ? 'error' : inc.severity === 'Medium' ? 'warning' : 'default'} size="small" /></TableCell>
                      <TableCell>{inc.status}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => { setSelectedIncident(inc); setTab(1); }}>Manage</Button>
                        <Button size="small" onClick={() => sendNotificationPreview(inc)}>Notify</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {incidents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>No incidents reported yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* New Incident Dialog */}
            <Dialog open={openIncidentDialog} onClose={() => setOpenIncidentDialog(false)} fullWidth maxWidth="sm">
              <DialogTitle>Report Security Incident</DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}><TextField label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></Grid>
                  <Grid item xs={6}><TextField label="Time" type="time" fullWidth InputLabelProps={{ shrink: true }} value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} /></Grid>
                  <Grid item xs={12}><TextField label="Location" fullWidth value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} /></Grid>
                  <Grid item xs={12}><TextField label="Description" fullWidth multiline minRows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Grid>
                  <Grid item xs={6}><TextField label="Reported By" fullWidth value={form.reportedBy} onChange={(e) => setForm((f) => ({ ...f, reportedBy: e.target.value }))} /></Grid>
                  <Grid item xs={6}><TextField label="Contact" fullWidth value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} /></Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Severity</InputLabel>
                      <Select value={form.severity} label="Severity" onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}>
                        {SEVERITY.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenIncidentDialog(false)}>Cancel</Button>
                <Button variant="contained" sx={{ bgcolor: "#D32F2F" }} onClick={handleReportIncident}>Submit</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {/* Incident Management */}
        {tab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Incident Management</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>Selected Incident</Typography>
                  <Divider sx={{ my: 1 }} />
                  {!selectedIncident ? (
                    <Typography color="text.secondary">Select an incident from the Incident Reporting tab to manage it.</Typography>
                  ) : (
                    <Box>
                      <Typography><b>ID:</b> {selectedIncident.id}</Typography>
                      <Typography><b>Date:</b> {selectedIncident.date} {selectedIncident.time}</Typography>
                      <Typography><b>Location:</b> {selectedIncident.location}</Typography>
                      <Typography><b>Severity:</b> {selectedIncident.severity}</Typography>
                      <Typography sx={{ mt: 1 }}><b>Description:</b></Typography>
                      <Typography variant="body2">{selectedIncident.description}</Typography>

                      <Divider sx={{ my: 2 }} />

                      <FormControl fullWidth sx={{ mb: 1 }}>
                        <InputLabel>Status</InputLabel>
                        <Select value={selectedIncident.status} label="Status" onChange={(e) => handleUpdateIncident(selectedIncident.id, { status: e.target.value })}>
                          {INCIDENT_STATUS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth sx={{ mb: 1 }}>
                        <InputLabel>Assign To</InputLabel>
                        <Select value={selectedIncident.assignedTo || ""} label="Assign To" onChange={(e) => handleAssign(selectedIncident.id, e.target.value)}>
                          <MenuItem value="">-- Unassigned --</MenuItem>
                          {personnel.map((p) => <MenuItem key={p.id} value={p.id}>{p.name} ({p.shift})</MenuItem>)}
                        </Select>
                      </FormControl>

                      <Button onClick={() => sendNotificationPreview(selectedIncident)}>Send Notification</Button>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>Activity / Notes</Typography>
                  <Divider sx={{ my: 1 }} />
                  {selectedIncident?.notes?.length ? selectedIncident.notes.map((n, i) => (
                    <Box key={i} sx={{ mb: 1 }}>
                      <Typography variant="body2"><b>{n.author}</b> <small>• {new Date(n.ts).toLocaleString()}</small></Typography>
                      <Typography variant="body2">{n.text}</Typography>
                    </Box>
                  )) : (
                    <Typography color="text.secondary">No notes yet.</Typography>
                  )}
                  {selectedIncident && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <TextField fullWidth placeholder="Add note" size="small" onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const text = e.target.value.trim();
                          if (!text) return;
                          handleUpdateIncident(selectedIncident.id, { notes: [...(selectedIncident.notes||[]), { author: 'You', text, ts: new Date().toISOString() }] });
                          // refresh selectedIncident reference
                          setSelectedIncident((prev) => ({ ...prev, notes: [...(prev.notes||[]), { author: 'You', text, ts: new Date().toISOString() }] }));
                          e.target.value = '';
                        }
                      }} />
                      <Button onClick={() => sendNotificationPreview(selectedIncident)}><NotificationsIcon /></Button>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* CCTV Integration */}
        {tab === 2 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>CCTV Integration (Mock)</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>Cameras</Typography>
                  <Divider sx={{ my: 1 }} />
                  {cameras.map((c) => (
                    <Box key={c.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography>{c.name}</Typography>
                      <Button size="small" onClick={() => alert(`Open live feed (mock) for ${c.id}`)}>View</Button>
                    </Box>
                  ))}
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>Footage / Link to Incidents</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography color="text.secondary">This area would show embedded live feeds or recorded footage and allow linking to incident reports. In this demo it's a mock placeholder.</Typography>
                  <Box sx={{ mt: 2, height: 240, bgcolor: '#fafafa', border: '1px dashed rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">Video Player Placeholder</Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Security Personnel */}
        {tab === 3 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Security Personnel Management</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>Add / Edit Personnel</Typography>
                  <Divider sx={{ my: 1 }} />
                  <TextField label="Name" fullWidth value={personForm.name} onChange={(e) => setPersonForm((p) => ({ ...p, name: e.target.value }))} sx={{ mb: 1 }} />
                  <TextField label="Shift" fullWidth value={personForm.shift} onChange={(e) => setPersonForm((p) => ({ ...p, shift: e.target.value }))} sx={{ mb: 1 }} />
                  <TextField label="Contact" fullWidth value={personForm.contact} onChange={(e) => setPersonForm((p) => ({ ...p, contact: e.target.value }))} sx={{ mb: 1 }} />
                  <Button variant="contained" sx={{ bgcolor: '#D32F2F' }} onClick={handleAddPersonnel}>Save</Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>Personnel List</Typography>
                  <Divider sx={{ my: 1 }} />
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Shift</TableCell>
                          <TableCell>Contact</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {personnel.map((p) => (
                          <TableRow key={p.id} hover>
                            <TableCell>{p.id}</TableCell>
                            <TableCell>{p.name}</TableCell>
                            <TableCell>{p.shift}</TableCell>
                            <TableCell>{p.contact}</TableCell>
                            <TableCell>
                              <IconButton onClick={() => { setPersonForm(p); }}><SaveIcon /></IconButton>
                              <IconButton color="error" onClick={() => handleDeletePersonnel(p.id)}><DeleteIcon /></IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Reporting & Analytics */}
        {tab === 4 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Reporting & Analytics</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2 }}>
                  <Typography color="text.secondary">Incidents by Severity</Typography>
                  {SEVERITY.map((s) => (
                    <Box key={s} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography>{s}</Typography>
                      <Typography>{analytics.bySeverity[s] || 0}</Typography>
                    </Box>
                  ))}
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>Reports</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" spacing={1}>
                    <Button onClick={() => alert('Generate Daily Incident Report (mock)')}>Daily</Button>
                    <Button onClick={() => alert('Generate Monthly Incident Report (mock)')}>Monthly</Button>
                    <Button onClick={() => alert('Export CSV (mock)')}>Export CSV</Button>
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Typography color="text.secondary">Quick list of recent incidents</Typography>
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                          <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Severity</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {incidents.slice(0, 8).map((inc) => (
                            <TableRow key={inc.id} hover>
                              <TableCell>{inc.id}</TableCell>
                              <TableCell>{inc.date}</TableCell>
                              <TableCell>{inc.location}</TableCell>
                              <TableCell>{inc.severity}</TableCell>
                              <TableCell>{inc.status}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Notification Management */}
        {tab === 5 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Notification Management</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>Methods by Severity</Typography>
                  <Divider sx={{ my: 1 }} />
                  {['low', 'medium', 'high'].map((lvl) => (
                    <Box key={lvl} sx={{ mb: 2 }}>
                      <Typography sx={{ textTransform: 'capitalize' }}>{lvl}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip label="App" clickable color={notifSettings[lvl].includes('app') ? 'primary' : 'default'} onClick={() => {
                          setNotifSettings((s) => ({ ...s, [lvl]: s[lvl].includes('app') ? s[lvl].filter(x=>x!=='app') : [...s[lvl],'app'] }));
                        }} />
                        <Chip label="SMS" clickable color={notifSettings[lvl].includes('sms') ? 'primary' : 'default'} onClick={() => {
                          setNotifSettings((s) => ({ ...s, [lvl]: s[lvl].includes('sms') ? s[lvl].filter(x=>x!=='sms') : [...s[lvl],'sms'] }));
                        }} />
                        <Chip label="Email" clickable color={notifSettings[lvl].includes('email') ? 'primary' : 'default'} onClick={() => {
                          setNotifSettings((s) => ({ ...s, [lvl]: s[lvl].includes('email') ? s[lvl].filter(x=>x!=='email') : [...s[lvl],'email'] }));
                        }} />
                      </Stack>
                    </Box>
                  ))}
                  <Button onClick={() => { localStorage.setItem('security_notif', JSON.stringify(notifSettings)); alert('Notification settings saved (mock)'); }}>Save Settings</Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>Send Test Notification</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography color="text.secondary">Pick an incident to preview notification behavior.</Typography>
                  <Box sx={{ mt: 2 }}>
                    {incidents.slice(0, 5).map((inc) => (
                      <Box key={inc.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography>{inc.id} • {inc.location}</Typography>
                        <Button size="small" onClick={() => sendNotificationPreview(inc)}>Send Preview</Button>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Data Retention */}
        {tab === 6 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Data Retention</Typography>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}><TextField label="Low severity retention (days)" type="number" fullWidth value={retention.lowDays} onChange={(e) => setRetention((r) => ({ ...r, lowDays: Number(e.target.value) }))} /></Grid>
                <Grid item xs={12} md={4}><TextField label="Medium retention (days)" type="number" fullWidth value={retention.mediumDays} onChange={(e) => setRetention((r) => ({ ...r, mediumDays: Number(e.target.value) }))} /></Grid>
                <Grid item xs={12} md={4}><TextField label="High retention (days)" type="number" fullWidth value={retention.highDays} onChange={(e) => setRetention((r) => ({ ...r, highDays: Number(e.target.value) }))} /></Grid>
                <Grid item xs={12}><Button variant="contained" sx={{ bgcolor: '#D32F2F' }} onClick={() => { localStorage.setItem('security_retention', JSON.stringify(retention)); alert('Retention policy saved (mock)'); }}>Save Policy</Button></Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Typography color="text.secondary">Retention will be enforced by a background job in production. This demo only saves policy to localStorage.</Typography>
            </Paper>
          </Box>
        )}

        {/* Privacy Management */}
        {tab === 7 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Privacy Management</Typography>
            <Paper sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 700 }}>Access Controls & Masking</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography color="text.secondary">This section configures who can view full incident details versus masked views. In production you'd map roles & permissions to the auth system (Admin, Auditor, Security, Market Master).</Typography>
              <Box sx={{ mt: 2 }}>
                <Button onClick={() => alert('Configure roles (mock)')}>Configure Roles</Button>
                <Button sx={{ ml: 1 }} onClick={() => alert('Run privacy audit (mock)')}>Run Privacy Audit</Button>
              </Box>
            </Paper>

            <Divider sx={{ my: 2 }} />

            <Paper sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 700 }}>Data Masking Rules</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography color="text.secondary">Define which fields are masked for non-authorized viewers (e.g., contact numbers, names of involved parties). This demo shows placeholders only.</Typography>
              <Box sx={{ mt: 2 }}>
                <Button onClick={() => alert('Edit masking rules (mock)')}>Edit Masking Rules</Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>
    </MainLayout>
  );
}
