import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Paper,
  Breadcrumbs,
  Link,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";
import { UploadFile as UploadFileIcon, Home as HomeIcon } from "@mui/icons-material";
import { NavigateNext } from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";

const steps = [
  {
    label: 'Add New Tenant',
    description: 'Access the Tenant Onboarding form. System will automatically generate a unique Tenant ID.',
  },
  {
    label: 'Record Tenant Information',
    description: 'Complete all mandatory fields including Tenant Name, Address, and Government ID.',
  },
  {
    label: 'Upload Required Documents',
    description: 'Upload necessary tenant documents in supported formats (PDF, JPG, JPEG, PNG).',
  },
  {
    label: 'Verify Tenant Information',
    description: 'Review all entered information for accuracy and mark verification as complete.',
  },
  {
    label: 'Submit Tenant Record',
    description: 'System validates all mandatory fields and creates the tenant record in the database.',
  },
];

export default function TenantOnboarding() {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    tenantName: "",
    address: "",
    governmentId: "",
    contactPerson: "",
    contactPhone: "",
    mobilePhone: "",
    email: "",
    socialMedia: "",
    businessName: "",
    barangayPermit: "",
    startDate: "",
    photograph: "",
    emergencyContact: "",
    verificationDetails: "",
    isVerified: false,
    uploadedDocs: [],
  });

  const [fileList, setFileList] = useState([]);

  // ✅ Load tenant data if opened via "View" from Tenant List
  useEffect(() => {
    const storedTenant = sessionStorage.getItem("selectedTenant");
    if (storedTenant) {
      const data = JSON.parse(storedTenant);
      setForm((prev) => ({
        ...prev,
        tenantName: data.name || "",
        businessName: data.business || "",
        contactPhone: data.contact || "",
        startDate: data.startDate || "",
        isVerified: data.verification === "Verified",
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFileList((prev) => [...prev, ...files]);
    setForm((prev) => ({
      ...prev,
      uploadedDocs: [...prev.uploadedDocs, ...files.map((f) => f.name)],
    }));
  };

  const handleSubmit = () => {
    if (!form.tenantName || !form.address || !form.governmentId) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    const newTenant = {
      id: `TNT-${String(Date.now()).slice(-4)}`,
      name: form.tenantName,
      business: form.businessName,
      contact: form.contactPhone || form.mobilePhone,
      startDate: form.startDate,
      verification: form.isVerified ? "Verified" : "Pending",
      lastUpdated: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("tenants")) || [];
    existing.push(newTenant);
    localStorage.setItem("tenants", JSON.stringify(existing));

    alert("Tenant registered successfully!");
    window.location.href = "/tenant-list"; // redirect to tenant list
  };

  return (
    <MainLayout>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          mt: 4,
          mb: 6,
        }}
      >
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            width: "100%",
            maxWidth: "800px",
            boxShadow: 3,
          }}
        >
          {/* Breadcrumbs Section */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs 
              separator={<NavigateNext fontSize="small" />} 
              aria-label="breadcrumb"
            >
          <Link
            underline="hover"
            color="inherit"
            href="/dashboard"
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              '&:hover': {
                color: '#D32F2F'
              }
            }}
          >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Dashboard
              </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/tenant-list"
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              '&:hover': {
                color: '#D32F2F'
              }
            }}
          >
                Tenant List
              </Link>
              <Typography color="text.primary">
                {form.tenantName ? `${form.tenantName}` : 'New Tenant'}
              </Typography>
            </Breadcrumbs>
          </Box>

          <Typography variant="h4" fontWeight={700} color="black" gutterBottom>
            Tenant Onboarding
          </Typography>
          <Typography mb={3} color="text.secondary">
            Add and record new tenant information for leasing.
          </Typography>

          {/* Onboarding Steps */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Tenant Onboarding Process
            </Typography>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    optional={
                      index === 4 ? (
                        <Typography variant="caption">Final step</Typography>
                      ) : null
                    }
                  >
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Typography>{step.description}</Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Tenant Name *" name="tenantName" value={form.tenantName} onChange={handleChange} margin="dense" />
              <TextField fullWidth label="Address *" name="address" value={form.address} onChange={handleChange} margin="dense" />
              <TextField fullWidth label="Government ID *" name="governmentId" value={form.governmentId} onChange={handleChange} margin="dense" />
              <TextField fullWidth label="Contact Person" name="contactPerson" value={form.contactPerson} onChange={handleChange} margin="dense" />
              <TextField fullWidth label="Contact Phone Number" name="contactPhone" value={form.contactPhone} onChange={handleChange} margin="dense" />
              <TextField fullWidth label="Mobile Phone" name="mobilePhone" value={form.mobilePhone} onChange={handleChange} margin="dense" />
              <TextField fullWidth label="Email Address (optional)" name="email" value={form.email} onChange={handleChange} margin="dense" />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Social Media Account (optional)" name="socialMedia" value={form.socialMedia} onChange={handleChange} margin="dense" />
              <TextField fullWidth label="Business Name" name="businessName" value={form.businessName} onChange={handleChange} margin="dense" />
              <TextField fullWidth label="Barangay Permit Number" name="barangayPermit" value={form.barangayPermit} onChange={handleChange} margin="dense" />
              <TextField fullWidth label="Start Date" name="startDate" type="date" value={form.startDate} onChange={handleChange} margin="dense" InputLabelProps={{ shrink: true }} />
              <TextField fullWidth label="Emergency Contact Information" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} margin="dense" />
              <TextField fullWidth label="Verification Details" name="verificationDetails" multiline rows={3} value={form.verificationDetails} onChange={handleChange} margin="dense" />
              <FormControlLabel
                control={<Checkbox checked={form.isVerified} onChange={handleChange} name="isVerified" />}
                label="Verification Complete"
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                Upload Tenant Documents
                <input hidden accept=".pdf,.jpg,.jpeg,.png" multiple type="file" onChange={handleFileUpload} />
              </Button>

              <Box sx={{ mt: 1 }}>
                {fileList.length > 0 ? (
                  fileList.map((file, index) => (
                    <Typography key={index} variant="body2">
                      • {file.name}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No files uploaded yet.
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sx={{ textAlign: "right" }}>
              <Button onClick={() => window.history.back()} sx={{ mr: 2 }}>
                Cancel
              </Button>
              <Button variant="contained" sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }} onClick={handleSubmit}>
                Submit Tenant
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </MainLayout>
  );
}