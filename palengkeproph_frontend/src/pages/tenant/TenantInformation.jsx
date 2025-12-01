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
  MenuItem,
  IconButton,
} from "@mui/material";
import { UploadFile as UploadFileIcon, Home as HomeIcon, Delete as DeleteIcon } from "@mui/icons-material";
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

const idTypes = [
  "Driver's License",
  "Passport",
  "SSS ID",
  "GSIS ID",
  "PRC ID",
  "Voter's ID",
  "Postal ID",
  "PhilHealth ID",
  "UMID",
  "Company ID",
  "School ID",
  "TIN ID",
  "Barangay ID",
  "Police Clearance",
  "NBI Clearance",
  "Other"
];

export default function TenantInformation() {
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
    // New fields for ID type and number
    idType: "",
    idNumber: "",
    idImage: null,
  });

  const [fileList, setFileList] = useState([]);
  const [idImagePreview, setIdImagePreview] = useState(null);

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
        idType: data.idType || "",
        idNumber: data.idNumber || "",
      }));
      
      // Load ID image preview if exists
      if (data.idImage) {
        setIdImagePreview(data.idImage);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleIdImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPEG, JPG, PNG, GIF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      setForm((prev) => ({
        ...prev,
        idImage: file,
      }));

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setIdImagePreview(previewUrl);
    }
  };

  const handleRemoveIdImage = () => {
    setForm((prev) => ({
      ...prev,
      idImage: null,
    }));
    if (idImagePreview) {
      URL.revokeObjectURL(idImagePreview);
    }
    setIdImagePreview(null);
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
    if (!form.tenantName || !form.address || !form.idType || !form.idNumber) {
      alert("Please fill in all mandatory fields including ID Type and ID Number.");
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
      idType: form.idType,
      idNumber: form.idNumber,
      idImage: idImagePreview, // Store the preview URL or you can store the file separately
    };

    const existing = JSON.parse(localStorage.getItem("tenants")) || [];
    existing.push(newTenant);
    localStorage.setItem("tenants", JSON.stringify(existing));

    // Clean up URL object if created
    if (idImagePreview && idImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(idImagePreview);
    }

    alert("Tenant registered successfully!");
    window.location.href = "/tenant-list"; // redirect to tenant list
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (idImagePreview && idImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(idImagePreview);
      }
    };
  }, [idImagePreview]);

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
            Tenant Information
          </Typography>
          <Typography mb={3} color="text.secondary">
            Add and record new tenant information for leasing.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Tenant Name *" name="tenantName" value={form.tenantName} onChange={handleChange} margin="dense" />
              <TextField fullWidth label="Address *" name="address" value={form.address} onChange={handleChange} margin="dense" />
              
              {/* ID Type and Number Section */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="ID Type *"
                    name="idType"
                    value={form.idType}
                    onChange={handleChange}
                    margin="dense"
                  >
                    {idTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ID Number *"
                    name="idNumber"
                    value={form.idNumber}
                    onChange={handleChange}
                    margin="dense"
                  />
                </Grid>
              </Grid>

              {/* ID Image Upload */}
              <Box sx={{ mt: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Upload ID Image *
                </Typography>
                <Button 
                  variant="outlined" 
                  component="label" 
                  startIcon={<UploadFileIcon />}
                  size="small"
                >
                  Upload ID Image
                  <input 
                    hidden 
                    accept=".jpg,.jpeg,.png,.gif" 
                    type="file" 
                    onChange={handleIdImageUpload} 
                  />
                </Button>
                
                {/* ID Image Preview */}
                {idImagePreview && (
                  <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={idImagePreview} 
                      alt="ID Preview" 
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '150px', 
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }} 
                    />
                    <IconButton
                      size="small"
                      onClick={handleRemoveIdImage}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: 'white',
                        '&:hover': {
                          backgroundColor: 'grey.100',
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                
                {!form.idImage && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    No ID image uploaded
                  </Typography>
                )}
              </Box>

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