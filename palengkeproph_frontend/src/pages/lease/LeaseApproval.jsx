import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
  Chip,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  Switch,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Checkbox,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Home as HomeIcon,
  NavigateNext,
  Person,
  Business,
  CalendarToday,
  AttachMoney,
  CheckCircle,
  Cancel,
  FileCopy,
  Email,
  Phone,
  LocationOn,
  ArrowBack,
  Delete,
  Visibility,
  CameraAlt,
  PhotoCamera,
  Upload,
  MoreVert,
  CameraFront,
  CameraRear,
  Cameraswitch,
  CreditCard,
  Fingerprint,
  CardMembership,
  LocalAtm,
  Warning,
  GppMaybe,
  Badge,
  ContactPage,
} from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";
import { useParams, useNavigate } from "react-router-dom";

export default function LeaseApproval() {
  const { leaseId } = useParams();
  const navigate = useNavigate();
  const [leaseRequest, setLeaseRequest] = useState(null);
  const [validId, setValidId] = useState(null);
  const [businessPermit, setBusinessPermit] = useState(null);
  const [barangayPermit, setBarangayPermit] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [generatedTenantId, setGeneratedTenantId] = useState("");
  const [loading, setLoading] = useState(true);
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [validIdSource, setValidIdSource] = useState("upload");
  const [anchorEl, setAnchorEl] = useState(null);
  const [cameraMode, setCameraMode] = useState("environment");
  const [flashOn, setFlashOn] = useState(false);
  const [showCameraControls, setShowCameraControls] = useState(true);
  
  // New state for ID verification
  const [cardType, setCardType] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [idVerified, setIdVerified] = useState(false);
  const [hasValidId, setHasValidId] = useState(true); // Default to having valid ID
  const [noIdReason, setNoIdReason] = useState("");
  const [verificationMethod, setVerificationMethod] = useState("id"); // "id" or "alternative"
  const [alternativeVerification, setAlternativeVerification] = useState({
    takenPhoto: false,
    additionalDocs: false,
    guarantorInfo: false,
    specialApproval: false,
  });
  const [tabValue, setTabValue] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Card type options with icons
  const cardTypes = [
    { value: "drivers_license", label: "Driver's License", icon: <CardMembership /> },
    { value: "passport", label: "Passport", icon: <Fingerprint /> },
    { value: "voters_id", label: "Voter's ID", icon: <CreditCard /> },
    { value: "philhealth_id", label: "PhilHealth ID", icon: <LocalAtm /> },
    { value: "sss_id", label: "SSS ID", icon: <CreditCard /> },
    { value: "prc_id", label: "PRC ID", icon: <CardMembership /> },
    { value: "postal_id", label: "Postal ID", icon: <LocalAtm /> },
    { value: "tin_id", label: "TIN ID", icon: <CreditCard /> },
    { value: "umid", label: "UMID", icon: <Fingerprint /> },
    { value: "company_id", label: "Company ID", icon: <Business /> },
    { value: "school_id", label: "School ID", icon: <CardMembership /> },
  ];

  // Steps for ID verification
  const idVerificationSteps = [
    'Select ID Type',
    'Enter ID Details',
    'Upload/Verify ID',
    'Review & Approve'
  ];

  // Steps for no ID alternative verification
  const alternativeVerificationSteps = [
    'Document Reason',
    'Alternative Verification',
    'Upload Tenant Photo',
    'Review & Approve'
  ];

  // No ID reasons
  const noIdReasons = [
    { value: "lost", label: "Lost ID" },
    { value: "expired", label: "Expired ID" },
    { value: "applied", label: "Applied for ID but not yet received" },
    { value: "no_government_id", label: "No government-issued ID available" },
    { value: "minor", label: "Minor without ID" },
    { value: "foreigner", label: "Foreign national without local ID" },
    { value: "other", label: "Other (specify in remarks)" },
  ];

  useEffect(() => {
    const loadLeaseRequest = () => {
      setLoading(true);
      const leaseRequests = JSON.parse(localStorage.getItem("leaseRequests")) || [];
      const foundLease = leaseRequests.find(lease => lease.id === leaseId);
      
      if (foundLease) {
        setLeaseRequest(foundLease);
        if (foundLease.documents) {
          setValidId(foundLease.documents.validId || null);
          setBusinessPermit(foundLease.documents.businessPermit || null);
          setBarangayPermit(foundLease.documents.barangayPermit || null);
        }
        // Load existing verification info if any
        if (foundLease.verification) {
          setHasValidId(foundLease.verification.hasValidId !== false);
          setCardType(foundLease.verification.cardType || "");
          setCardNumber(foundLease.verification.cardNumber || "");
          setIdVerified(foundLease.verification.idVerified || false);
          setNoIdReason(foundLease.verification.noIdReason || "");
          setAlternativeVerification(foundLease.verification.alternativeVerification || {
            takenPhoto: false,
            additionalDocs: false,
            guarantorInfo: false,
            specialApproval: false,
          });
          
          // Set initial tab based on verification method
          if (foundLease.verification.hasValidId === false) {
            setVerificationMethod("alternative");
            setTabValue(1);
          }
        }
      } else {
        navigate("/lease-approval-list");
      }
      setLoading(false);
    };

    loadLeaseRequest();
  }, [leaseId, navigate]);

  // Start camera when dialog opens
  useEffect(() => {
    if (cameraDialogOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [cameraDialogOpen, cameraMode]);

  const startCamera = async () => {
    try {
      stopCamera();
      
      const constraints = {
        video: { 
          facingMode: cameraMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      
      try {
        const fallbackConstraints = {
          video: true
        };
        const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (fallbackErr) {
        alert("Unable to access camera. Please check permissions and make sure a camera is available.");
        setCameraDialogOpen(false);
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const switchCamera = () => {
    setCameraMode(prevMode => prevMode === "environment" ? "user" : "environment");
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (cameraMode === "user") {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      if (cameraMode === "user") {
        context.setTransform(1, 0, 0, 1, 0, 0);
      }
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageDataUrl);
      
      stopCamera();
      setShowCameraControls(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowCameraControls(true);
    startCamera();
  };

  const saveCapturedPhoto = () => {
    if (capturedImage) {
      const fileData = {
        fileName: verificationMethod === "alternative" ? `tenant-photo-${Date.now()}.jpg` : `captured-id-${Date.now()}.jpg`,
        fileType: 'image/jpeg',
        fileSize: Math.floor(capturedImage.length * 0.75),
        uploadDate: new Date().toISOString(),
        content: capturedImage,
        source: 'camera',
        cameraMode: cameraMode,
        isTenantPhoto: verificationMethod === "alternative"
      };
      
      setValidId(fileData);
      setValidIdSource("camera");
      setCameraDialogOpen(false);
      setCapturedImage(null);
      setShowCameraControls(true);
      setIdVerified(true);
    }
  };

  const handleFileUpload = (setter, event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload only JPG, PNG, or PDF files");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const fileData = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        content: reader.result,
        source: 'upload',
        isTenantPhoto: verificationMethod === "alternative"
      };
      setter(fileData);
      if (setter === setValidId) {
        setValidIdSource("upload");
        setIdVerified(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (setter) => {
    setter(null);
    if (setter === setValidId) {
      setValidIdSource("upload");
      setIdVerified(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCaptureOption = () => {
    handleMenuClose();
    setCameraDialogOpen(true);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setVerificationMethod(newValue === 0 ? "id" : "alternative");
    setHasValidId(newValue === 0);
    
    // Reset states when switching tabs
    if (newValue === 1) {
      setCardType("");
      setCardNumber("");
      setValidId(null);
      setActiveStep(0);
    } else {
      setNoIdReason("");
      setAlternativeVerification({
        takenPhoto: false,
        additionalDocs: false,
        guarantorInfo: false,
        specialApproval: false,
      });
    }
  };

  const handleNext = () => {
    if (verificationMethod === "id") {
      if (activeStep === 0 && !cardType) {
        alert("Please select an ID type");
        return;
      }
      if (activeStep === 1 && !cardNumber.trim()) {
        alert("Please enter the ID number");
        return;
      }
      if (activeStep === 2 && (!validId || !idVerified)) {
        alert("Please upload and verify the ID");
        return;
      }
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      // Alternative verification steps
      if (activeStep === 0 && !noIdReason) {
        alert("Please select a reason for not having a valid ID");
        return;
      }
      if (activeStep === 1 && !Object.values(alternativeVerification).some(v => v === true)) {
        alert("Please select at least one alternative verification method");
        return;
      }
      if (activeStep === 2 && !validId) {
        alert("Please take a photo of the tenant");
        return;
      }
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(0, prevStep - 1));
  };

  const saveVerificationInfo = () => {
    // Save verification info to lease request
    const leaseRequests = JSON.parse(localStorage.getItem("leaseRequests")) || [];
    const updatedRequests = leaseRequests.map(lease => {
      if (lease.id === leaseId) {
        return {
          ...lease,
          verification: {
            hasValidId: hasValidId,
            cardType: cardType,
            cardNumber: cardNumber,
            idVerified: idVerified,
            noIdReason: noIdReason,
            alternativeVerification: alternativeVerification,
            verifiedDate: new Date().toISOString()
          },
          documents: {
            ...lease.documents,
            validId: validId,
            businessPermit: businessPermit,
            barangayPermit: barangayPermit,
          }
        };
      }
      return lease;
    });

    localStorage.setItem("leaseRequests", JSON.stringify(updatedRequests));
    
    // Update local state
    setLeaseRequest(prev => ({
      ...prev,
      verification: {
        hasValidId: hasValidId,
        cardType: cardType,
        cardNumber: cardNumber,
        idVerified: idVerified,
        noIdReason: noIdReason,
        alternativeVerification: alternativeVerification,
        verifiedDate: new Date().toISOString()
      }
    }));
    
    alert("Verification information saved successfully");
    setActiveStep(3);
  };

  const generateTenantId = () => {
    const currentYear = new Date().getFullYear();
    const tenants = JSON.parse(localStorage.getItem("tenants")) || [];
    let newTenantId;
    let isUnique = false;
    
    while (!isUnique) {
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      newTenantId = `TEN-${currentYear}-${randomNum}`;
      isUnique = !tenants.some(tenant => tenant.id === newTenantId);
    }
    
    setGeneratedTenantId(newTenantId);
    return newTenantId;
  };

  const handleApprove = () => {
    if (verificationMethod === "id" && (!cardType || !cardNumber || !validId)) {
      alert("Please complete ID verification before approval.");
      return;
    }
    
    if (verificationMethod === "alternative" && (!noIdReason || !validId)) {
      alert("Please complete alternative verification before approval.");
      return;
    }

    const tenantId = generateTenantId();
    
    const newTenant = {
      id: tenantId,
      name: leaseRequest.tenantName,
      contact: leaseRequest.tenantContact || "",
      email: leaseRequest.tenantEmail || "",
      address: leaseRequest.tenantAddress || "",
      dateRegistered: new Date().toISOString(),
      status: "Active",
      stallId: leaseRequest.stallId,
      leaseStart: leaseRequest.leaseStart,
      leaseEnd: leaseRequest.leaseEnd,
      monthlyRate: leaseRequest.monthlyRate,
      verification: {
        hasValidId: hasValidId,
        cardType: cardType,
        cardNumber: cardNumber,
        idVerified: idVerified,
        noIdReason: noIdReason,
        alternativeVerification: alternativeVerification,
        verifiedDate: new Date().toISOString()
      },
      documents: {
        validId: {
          ...validId,
          source: validIdSource,
          isTenantPhoto: verificationMethod === "alternative"
        },
        businessPermit: businessPermit,
        barangayPermit: barangayPermit,
      }
    };

    const tenants = JSON.parse(localStorage.getItem("tenants")) || [];
    const updatedTenants = [...tenants, newTenant];
    localStorage.setItem("tenants", JSON.stringify(updatedTenants));

    const leaseRequests = JSON.parse(localStorage.getItem("leaseRequests")) || [];
    const updatedRequests = leaseRequests.map(lease => {
      if (lease.id === leaseId) {
        return {
          ...lease,
          status: "Approved",
          tenantId: tenantId,
          approvedBy: "Admin",
          approvedDate: new Date().toISOString(),
          verification: {
            hasValidId: hasValidId,
            cardType: cardType,
            cardNumber: cardNumber,
            idVerified: idVerified,
            noIdReason: noIdReason,
            alternativeVerification: alternativeVerification,
            verifiedDate: new Date().toISOString()
          },
          documents: {
            validId: {
              ...validId,
              source: validIdSource,
              isTenantPhoto: verificationMethod === "alternative"
            },
            businessPermit: businessPermit,
            barangayPermit: barangayPermit,
          }
        };
      }
      return lease;
    });

    localStorage.setItem("leaseRequests", JSON.stringify(updatedRequests));

    const approvedLease = updatedRequests.find(lease => lease.id === leaseId);
    const approvedLeases = JSON.parse(localStorage.getItem("approvedLeases")) || [];
    const updatedApprovedLeases = [...approvedLeases, approvedLease];
    localStorage.setItem("approvedLeases", JSON.stringify(updatedApprovedLeases));

    const allLeases = JSON.parse(localStorage.getItem("leases")) || [];
    const updatedAllLeases = allLeases.map(lease => {
      if (lease.id === leaseId) {
        return {
          ...lease,
          status: "Active",
          tenantId: tenantId,
          approvedBy: "Admin",
          approvedDate: new Date().toISOString(),
          verification: {
            hasValidId: hasValidId,
            cardType: cardType,
            cardNumber: cardNumber,
            idVerified: idVerified,
            noIdReason: noIdReason,
            alternativeVerification: alternativeVerification,
            verifiedDate: new Date().toISOString()
          }
        };
      }
      return lease;
    });
    localStorage.setItem("leases", JSON.stringify(updatedAllLeases));

    setApproveDialogOpen(false);
    setLeaseRequest(prev => ({ 
      ...prev, 
      status: "Approved",
      tenantId: tenantId 
    }));

    alert(`Lease approved! Tenant ID generated: ${tenantId}`);
    
    setTimeout(() => {
      navigate("/lease-approval-list");
    }, 2000);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    const leaseRequests = JSON.parse(localStorage.getItem("leaseRequests")) || [];
    const updatedRequests = leaseRequests.map(lease => {
      if (lease.id === leaseId) {
        return {
          ...lease,
          status: "Rejected",
          rejectionReason: rejectionReason,
          rejectedDate: new Date().toISOString(),
          rejectedBy: "Admin"
        };
      }
      return lease;
    });

    localStorage.setItem("leaseRequests", JSON.stringify(updatedRequests));

    const allLeases = JSON.parse(localStorage.getItem("leases")) || [];
    const updatedAllLeases = allLeases.map(lease => {
      if (lease.id === leaseId) {
        return {
          ...lease,
          status: "Rejected",
          rejectionReason: rejectionReason,
        };
      }
      return lease;
    });
    localStorage.setItem("leases", JSON.stringify(updatedAllLeases));

    setLeaseRequest(prev => ({ 
      ...prev, 
      status: "Rejected",
      rejectionReason: rejectionReason
    }));
    setRejectDialogOpen(false);
    setRejectionReason("");
    
    alert("Lease request rejected.");
    
    setTimeout(() => {
      navigate("/lease-approval-list");
    }, 2000);
  };

  const handleViewDocument = (file) => {
    if (!file) return;
    
    if (file.fileType === "application/pdf") {
      const pdfWindow = window.open();
      pdfWindow.document.write(`
        <iframe width="100%" height="100%" src="${file.content}" style="border: none;"></iframe>
      `);
    } else {
      const imageWindow = window.open();
      imageWindow.document.write(`
        <img src="${file.content}" style="max-width: 100%; max-height: 100%;" />
      `);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSelectedCardTypeLabel = () => {
    const selected = cardTypes.find(type => type.value === cardType);
    return selected ? selected.label : "";
  };

  const getNoIdReasonLabel = () => {
    const selected = noIdReasons.find(reason => reason.value === noIdReason);
    return selected ? selected.label : "";
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!leaseRequest) {
    return (
      <MainLayout>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Lease request not found.
          </Alert>
          <Button variant="outlined" onClick={() => navigate("/lease-approval-list")}>
            Back to Approval List
          </Button>
        </Box>
      </MainLayout>
    );
  }

  const renderIDVerificationStep = () => {
    const steps = verificationMethod === "id" ? idVerificationSteps : alternativeVerificationSteps;
    
    switch (activeStep) {
      case 0:
        if (verificationMethod === "id") {
          return (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Select the type of ID the tenant is presenting:
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  aria-label="card-type"
                  name="card-type"
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                >
                  <Grid container spacing={2}>
                    {cardTypes.map((card) => (
                      <Grid item xs={12} sm={6} key={card.value}>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            cursor: 'pointer',
                            borderColor: cardType === card.value ? '#D32F2F' : '',
                            bgcolor: cardType === card.value ? '#fff5f5' : '',
                            '&:hover': {
                              borderColor: '#D32F2F',
                              bgcolor: '#fff5f5'
                            }
                          }}
                          onClick={() => setCardType(card.value)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Radio 
                              checked={cardType === card.value}
                              value={card.value}
                              color="primary"
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {card.icon}
                              <Typography>{card.label}</Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </RadioGroup>
              </FormControl>
            </Box>
          );
        } else {
          return (
            <Box>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> Tenant does not have a valid government-issued ID. 
                  You must complete alternative verification methods.
                </Typography>
              </Alert>
              <Typography variant="subtitle1" gutterBottom>
                Why doesn't the tenant have a valid ID? *
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  aria-label="no-id-reason"
                  name="no-id-reason"
                  value={noIdReason}
                  onChange={(e) => setNoIdReason(e.target.value)}
                >
                  <Grid container spacing={2}>
                    {noIdReasons.map((reason) => (
                      <Grid item xs={12} sm={6} key={reason.value}>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            cursor: 'pointer',
                            borderColor: noIdReason === reason.value ? '#D32F2F' : '',
                            bgcolor: noIdReason === reason.value ? '#fff5f5' : '',
                            '&:hover': {
                              borderColor: '#D32F2F',
                              bgcolor: '#fff5f5'
                            }
                          }}
                          onClick={() => setNoIdReason(reason.value)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Radio 
                              checked={noIdReason === reason.value}
                              value={reason.value}
                              color="primary"
                            />
                            <Typography>{reason.label}</Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </RadioGroup>
              </FormControl>
            </Box>
          );
        }

      case 1:
        if (verificationMethod === "id") {
          return (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Enter the ID number for <strong>{getSelectedCardTypeLabel()}</strong>:
              </Typography>
              <Box sx={{ maxWidth: 400, mt: 3 }}>
                <TextField
                  fullWidth
                  label="ID Number *"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Enter ID number exactly as shown"
                  helperText="Enter the complete ID number as it appears on the document"
                  required
                />
              </Box>
            </Box>
          );
        } else {
          return (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Select alternative verification methods:
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  You must select at least one verification method.
                </Typography>
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={alternativeVerification.takenPhoto}
                        onChange={(e) => setAlternativeVerification(prev => ({
                          ...prev,
                          takenPhoto: e.target.checked
                        }))}
                      />
                    }
                    label={
                      <Box>
                        <Typography>Take tenant's photo *</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Required - Take a clear photo of the tenant's face
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={alternativeVerification.additionalDocs}
                        onChange={(e) => setAlternativeVerification(prev => ({
                          ...prev,
                          additionalDocs: e.target.checked
                        }))}
                      />
                    }
                    label={
                      <Box>
                        <Typography>Additional supporting documents</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Birth certificate, barangay clearance, utility bills, etc.
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={alternativeVerification.guarantorInfo}
                        onChange={(e) => setAlternativeVerification(prev => ({
                          ...prev,
                          guarantorInfo: e.target.checked
                        }))}
                      />
                    }
                    label={
                      <Box>
                        <Typography>Guarantor information</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Someone who can vouch for the tenant's identity
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={alternativeVerification.specialApproval}
                        onChange={(e) => setAlternativeVerification(prev => ({
                          ...prev,
                          specialApproval: e.target.checked
                        }))}
                      />
                    }
                    label={
                      <Box>
                        <Typography>Special approval required</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Requires supervisor/manager approval
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          );
        }

      case 2:
        if (verificationMethod === "id") {
          return (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Upload or capture the {getSelectedCardTypeLabel()} (Number: {cardNumber})
              </Typography>
              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">
                      ID Document (Required)
                    </Typography>
                    {validId && (
                      <Chip 
                        label="Uploaded"
                        color="success"
                        size="small"
                      />
                    )}
                  </Box>
                  
                  {validId ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <FileCopy />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">
                          {validId.fileName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {new Date(validId.uploadDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => handleViewDocument(validId)}>
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleRemoveFile(setValidId)}>
                        <Delete color="error" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <input
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        style={{ display: 'none' }}
                        id="validId-upload-step"
                        type="file"
                        onChange={(e) => handleFileUpload(setValidId, e)}
                      />
                      <label htmlFor="validId-upload-step">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<Upload />}
                        >
                          Upload ID Document
                        </Button>
                      </label>
                      <Button
                        variant="outlined"
                        startIcon={<CameraAlt />}
                        onClick={handleCaptureOption}
                      >
                        Capture with Camera
                      </Button>
                    </Box>
                  )}

                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Verify ID matches tenant
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={idVerified}
                          onChange={(e) => setIdVerified(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="I verify that the uploaded ID belongs to the tenant and matches the information provided"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          );
        } else {
          return (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Take a photo of the tenant *
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  This photo is required for tenants without valid ID. Use front camera for clear face photo.
                </Typography>
              </Alert>
              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">
                      Tenant Photo (Required)
                    </Typography>
                    {validId && (
                      <Chip 
                        label="Photo Taken"
                        color="success"
                        size="small"
                      />
                    )}
                  </Box>
                  
                  {validId ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <CameraAlt />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">
                          {validId.fileName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tenant photo taken
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => handleViewDocument(validId)}>
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleRemoveFile(setValidId)}>
                        <Delete color="error" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <CameraAlt sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        No tenant photo taken yet
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<CameraAlt />}
                        onClick={handleCaptureOption}
                        sx={{ mt: 2 }}
                      >
                        Take Tenant Photo
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          );
        }

      case 3:
        return (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography>
                Verification Complete! Ready for lease approval.
              </Typography>
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Verification Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {verificationMethod === "id" ? (
                      <>
                        <Typography><strong>Method:</strong> Valid ID Verification</Typography>
                        <Typography><strong>ID Type:</strong> {getSelectedCardTypeLabel()}</Typography>
                        <Typography><strong>ID Number:</strong> {cardNumber}</Typography>
                        <Typography><strong>Status:</strong> Verified ✓</Typography>
                      </>
                    ) : (
                      <>
                        <Typography><strong>Method:</strong> Alternative Verification</Typography>
                        <Typography><strong>No ID Reason:</strong> {getNoIdReasonLabel()}</Typography>
                        <Typography><strong>Methods Used:</strong></Typography>
                        {alternativeVerification.takenPhoto && <Typography>• Tenant photo taken ✓</Typography>}
                        {alternativeVerification.additionalDocs && <Typography>• Additional documents ✓</Typography>}
                        {alternativeVerification.guarantorInfo && <Typography>• Guarantor information ✓</Typography>}
                        {alternativeVerification.specialApproval && <Typography>• Special approval required ✓</Typography>}
                      </>
                    )}
                    <Typography><strong>Verified On:</strong> {new Date().toLocaleDateString()}</Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
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
            href="/lease-approval-list"
            sx={{ 
              '&:hover': {
                color: '#D32F2F'
              }
            }}
          >
            Lease Approval
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 500 }}>
            {leaseId}
          </Typography>
        </Breadcrumbs>

        {/* Header with back button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <IconButton onClick={() => navigate("/lease-approval-list")}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Lease Approval
            </Typography>
            <Typography color="text.secondary">
              Review and process lease request
            </Typography>
          </Box>
        </Box>

        {/* Verification Method Tabs */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              aria-label="ID verification method tabs"
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge />
                    <Typography>Has Valid ID</Typography>
                  </Box>
                }
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning />
                    <Typography>No Valid ID (Required)</Typography>
                  </Box>
                }
              />
            </Tabs>
          </Box>

          {/* ID Verification Stepper */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              {verificationMethod === "id" ? "ID Verification Process" : "Alternative Verification Process (Required for No ID)"}
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {(verificationMethod === "id" ? idVerificationSteps : alternativeVerificationSteps).map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step Content */}
            <Box sx={{ mt: 3 }}>
              {renderIDVerificationStep()}

              {/* Stepper Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                >
                  Back
                </Button>
                
                {activeStep < (verificationMethod === "id" ? idVerificationSteps : alternativeVerificationSteps).length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
                  >
                    {activeStep === (verificationMethod === "id" ? 2 : 2) ? 'Complete Verification' : 'Next'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={saveVerificationInfo}
                  >
                    Save Verification Information
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Left Column - Lease Details */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Lease Request Details
                </Typography>
                <Chip 
                  label={leaseRequest.status} 
                  color={
                    leaseRequest.status === "Pending Approval" ? "warning" :
                    leaseRequest.status === "Approved" ? "success" :
                    leaseRequest.status === "Rejected" ? "error" : "default"
                  }
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Typography variant="subtitle1" gutterBottom sx={{ color: '#D32F2F' }}>
                Tenant Information
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person sx={{ mr: 1, color: '#D32F2F' }} />
                    <Typography variant="h6">{leaseRequest.tenantName}</Typography>
                  </Box>
                </Grid>
                {leaseRequest.tenantContact && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone sx={{ mr: 1, fontSize: 16 }} />
                      <Typography>{leaseRequest.tenantContact}</Typography>
                    </Box>
                  </Grid>
                )}
                {leaseRequest.tenantEmail && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ mr: 1, fontSize: 16 }} />
                      <Typography>{leaseRequest.tenantEmail}</Typography>
                    </Box>
                  </Grid>
                )}
                {leaseRequest.tenantAddress && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <LocationOn sx={{ mr: 1, mt: 0.5, fontSize: 16 }} />
                      <Typography>{leaseRequest.tenantAddress}</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              <Typography variant="subtitle1" gutterBottom sx={{ color: '#D32F2F' }}>
                Lease Terms
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Lease ID</Typography>
                  <Typography fontWeight={500}>{leaseRequest.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Stall</Typography>
                  <Typography fontWeight={500}>{leaseRequest.stallId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Start Date</Typography>
                  <Typography fontWeight={500}>{leaseRequest.leaseStart}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">End Date</Typography>
                  <Typography fontWeight={500}>{leaseRequest.leaseEnd}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Monthly Rate</Typography>
                  <Typography fontWeight={500}>₱{parseFloat(leaseRequest.monthlyRate).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Security Deposit</Typography>
                  <Typography fontWeight={500}>₱{parseFloat(leaseRequest.securityDeposit || 0).toLocaleString()}</Typography>
                </Grid>
                {leaseRequest.paymentTerms && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Payment Terms</Typography>
                    <Typography>{leaseRequest.paymentTerms}</Typography>
                  </Grid>
                )}
                {leaseRequest.remarks && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Remarks</Typography>
                    <Typography sx={{ fontStyle: 'italic' }}>"{leaseRequest.remarks}"</Typography>
                  </Grid>
                )}
              </Grid>

              {leaseRequest.status === "Approved" && leaseRequest.tenantId && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    <strong>Approved!</strong> Tenant ID: {leaseRequest.tenantId}<br />
                    <strong>Approved on:</strong> {leaseRequest.approvedDate ? new Date(leaseRequest.approvedDate).toLocaleDateString() : 'N/A'}<br />
                    <strong>Approved by:</strong> {leaseRequest.approvedBy || 'Admin'}
                  </Typography>
                </Alert>
              )}

              {leaseRequest.rejectionReason && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    <strong>Rejected:</strong> {leaseRequest.rejectionReason}<br />
                    <strong>Rejected on:</strong> {leaseRequest.rejectedDate ? new Date(leaseRequest.rejectedDate).toLocaleDateString() : 'N/A'}<br />
                    <strong>Rejected by:</strong> {leaseRequest.rejectedBy || 'Admin'}
                  </Typography>
                </Alert>
              )}

              {leaseRequest.appliedDate && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                  <Typography variant="caption" color="text.secondary">
                    Applied on: {new Date(leaseRequest.appliedDate).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Column - Additional Documents */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom>
                Additional Documents
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload additional supporting documents
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* Business Permit - OPTIONAL */}
              <Card variant="outlined" sx={{ mb: 2, bgcolor: businessPermit ? '#f0f9f0' : '#fff' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Business Permit (Optional)
                    </Typography>
                    {businessPermit && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => handleViewDocument(businessPermit)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleRemoveFile(setBusinessPermit)}>
                          <Delete fontSize="small" color="error" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    DTI/SEC Registration
                  </Typography>
                  
                  {businessPermit ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileCopy fontSize="small" />
                      <Typography variant="caption">
                        {businessPermit.fileName} ({formatFileSize(businessPermit.fileSize)})
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <input
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        style={{ display: 'none' }}
                        id="businessPermit-upload"
                        type="file"
                        onChange={(e) => handleFileUpload(setBusinessPermit, e)}
                      />
                      <label htmlFor="businessPermit-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          size="small"
                        >
                          Upload Business Permit
                        </Button>
                      </label>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Barangay Permit - OPTIONAL */}
              <Card variant="outlined" sx={{ mb: 3, bgcolor: barangayPermit ? '#f0f9f0' : '#fff' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Barangay Permit (Optional)
                    </Typography>
                    {barangayPermit && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => handleViewDocument(barangayPermit)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleRemoveFile(setBarangayPermit)}>
                          <Delete fontSize="small" color="error" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Barangay Clearance/Business Permit
                  </Typography>
                  
                  {barangayPermit ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileCopy fontSize="small" />
                      <Typography variant="caption">
                        {barangayPermit.fileName} ({formatFileSize(barangayPermit.fileSize)})
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <input
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        style={{ display: 'none' }}
                        id="barangayPermit-upload"
                        type="file"
                        onChange={(e) => handleFileUpload(setBarangayPermit, e)}
                      />
                      <label htmlFor="barangayPermit-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          size="small"
                        >
                          Upload Barangay Permit
                        </Button>
                      </label>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Final Approval Buttons */}
              {leaseRequest.status === "Pending Approval" && (
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => setApproveDialogOpen(true)}
                    sx={{ flex: 1 }}
                    disabled={
                      (verificationMethod === "id" && (!cardType || !cardNumber || !validId || !idVerified)) ||
                      (verificationMethod === "alternative" && (!noIdReason || !validId || !alternativeVerification.takenPhoto))
                    }
                  >
                    Approve Lease
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => setRejectDialogOpen(true)}
                    sx={{ flex: 1 }}
                  >
                    Reject Lease
                  </Button>
                </Box>
              )}

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Complete the ID verification process above before approving the lease.
                  {verificationMethod === "alternative" && " For tenants without valid ID, tenant photo is REQUIRED."}
                </Typography>
              </Alert>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Camera Capture Dialog */}
      <Dialog 
        open={cameraDialogOpen} 
        onClose={() => {
          setCameraDialogOpen(false);
          setCapturedImage(null);
          setShowCameraControls(true);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {verificationMethod === "alternative" ? "Take Tenant Photo" : "Capture ID Document"}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <ToggleButtonGroup
              value={cameraMode}
              exclusive
              onChange={(e, newMode) => {
                if (newMode) {
                  setCameraMode(newMode);
                }
              }}
              size="small"
            >
              <ToggleButton value="environment" aria-label="rear camera">
                <CameraRear fontSize="small" sx={{ mr: 1 }} />
                Rear
              </ToggleButton>
              <ToggleButton value="user" aria-label="front camera">
                <CameraFront fontSize="small" sx={{ mr: 1 }} />
                Front
              </ToggleButton>
            </ToggleButtonGroup>
            
            <FormControlLabel
              control={
                <Switch
                  checked={flashOn}
                  onChange={toggleFlash}
                  size="small"
                  disabled
                />
              }
              label="Flash"
              labelPlacement="start"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {verificationMethod === "alternative" 
              ? "Use front camera to take a clear photo of the tenant's face" 
              : cameraMode === "environment" 
                ? "Use rear camera to capture documents or IDs" 
                : "Use front camera to capture tenant's photo"}
          </Typography>
          
          <Box sx={{ position: 'relative', width: '100%', height: 400, mb: 2 }}>
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    backgroundColor: '#000',
                    transform: cameraMode === "user" ? 'scaleX(-1)' : 'none'
                  }}
                />
                <canvas
                  ref={canvasRef}
                  style={{ display: 'none' }}
                />
                
                {/* Camera overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    border: '2px dashed #fff',
                    borderRadius: '8px',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {verificationMethod === "alternative" ? (
                    <Box
                      sx={{
                        width: '60%',
                        height: '70%',
                        border: '2px solid #fff',
                        borderRadius: '50%',
                        opacity: 0.5
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '80%',
                        height: '60%',
                        border: '2px solid #fff',
                        borderRadius: '4px',
                        opacity: 0.5
                      }}
                    />
                  )}
                </Box>

                {/* Camera controls overlay */}
                {showCameraControls && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      left: 0,
                      right: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={switchCamera}
                      startIcon={<Cameraswitch />}
                      sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        }
                      }}
                    >
                      Switch Camera
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <img
                src={capturedImage}
                alt={verificationMethod === "alternative" ? "Tenant Photo" : "Captured ID"}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            )}
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Tip:</strong> 
              {verificationMethod === "alternative" 
                ? " Ensure the tenant's face is clearly visible and well-lit."
                : cameraMode === "environment" 
                  ? " Ensure the document is well-lit and all details are clearly visible."
                  : " Ensure good lighting for clear photos."}
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          {capturedImage ? (
            <>
              <Button onClick={retakePhoto} startIcon={<Cancel />}>
                Retake
              </Button>
              <Button 
                variant="contained" 
                onClick={saveCapturedPhoto}
                startIcon={<CheckCircle />}
                sx={{
                  bgcolor: "#D32F2F",
                  "&:hover": { bgcolor: "#B71C1C" }
                }}
              >
                Use This Photo
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => {
                setCameraDialogOpen(false);
                setCapturedImage(null);
                setShowCameraControls(true);
              }}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={capturePhoto}
                startIcon={<PhotoCamera />}
                sx={{
                  backgroundColor: '#D32F2F',
                  '&:hover': {
                    backgroundColor: '#B71C1C',
                  }
                }}
              >
                Capture Photo
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
        <DialogTitle>Approve Lease Request</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to approve this lease request?
          </Typography>
          {(cardType || noIdReason) && (
            <Paper variant="outlined" sx={{ p: 2, my: 2 }}>
              <Typography variant="body2">
                <strong>Verification Method:</strong> {verificationMethod === "id" ? "Valid ID" : "Alternative"}
                {cardType && <><br /><strong>ID Type:</strong> {getSelectedCardTypeLabel()} ({cardNumber})</>}
                {noIdReason && <><br /><strong>No ID Reason:</strong> {getNoIdReasonLabel()}</>}
              </Typography>
            </Paper>
          )}
          <Typography variant="body2" color="text.secondary">
            A Tenant ID will be automatically generated upon approval.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleApprove}
            sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
          >
            Approve & Generate Tenant ID
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Lease Request</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Please provide a reason for rejecting this lease request:
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleReject}
          >
            Reject Lease
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}