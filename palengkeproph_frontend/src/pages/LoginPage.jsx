// src/pages/LoginPage.jsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Fade,
  Zoom,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Store,
  Security,
  TrendingUp,
  Group,
  Assignment,
} from "@mui/icons-material";
import axios from "axios";

// Create axios instance for login
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://palengkeprophtest-production.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "", // Changed from email to username
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = "Username is required"; // Changed from email to username
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Real API login call - using username instead of email
      const response = await api.post("api/auth/token/", {
        username: formData.username, // Changed from email to username
        password: formData.password,
      });

      // Handle successful login
      if (response.data.access) {
        // Store tokens and user data
        localStorage.setItem("authToken", response.data.access);
        localStorage.setItem("userEmail", formData.username); // Using username as identifier
        
        // Store refresh token if available
        if (response.data.refresh) {
          localStorage.setItem("refreshToken", response.data.refresh);
        }
        
        // Store user info if available
        if (response.data.user) {
          localStorage.setItem("userInfo", JSON.stringify(response.data.user));
        }
        
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        setErrors({ submit: "Invalid response from server" });
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle different error scenarios
      if (error.response?.status === 401) {
        setErrors({ submit: "Invalid username or password" }); // Updated error message
      } else if (error.response?.status === 400) {
        setErrors({ submit: error.response.data?.message || "Invalid request" });
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setErrors({ submit: "Network error. Please check if the server is running." });
      } else if (error.response?.status >= 500) {
        setErrors({ submit: "Server error. Please try again later." });
      } else {
        setErrors({ submit: "Login failed. Please try again." });
      }
      
      // Fallback to demo mode if API is not available
      if (error.code === 'NETWORK_ERROR' || error.response?.status === 404) {
        // Use demo login as fallback
        handleDemoLogin();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login function for when API is not available
  const handleDemoLogin = () => {
    // Check if it's the demo credentials or any credentials when API is down
    const isDemoCredentials = 
      formData.username === "admin" && // Changed from email to username
      formData.password === "demo123";
    
    if (isDemoCredentials || formData.username && formData.password.length >= 6) {
      localStorage.setItem("authToken", "demo-token");
      localStorage.setItem("userEmail", formData.username);
      localStorage.setItem("userInfo", JSON.stringify({
        name: formData.username,
        username: formData.username,
        role: "market_manager"
      }));
      
      window.location.href = "/dashboard";
    } else {
      setErrors({ submit: "Using demo mode. Please use demo credentials: admin / demo123" }); // Updated demo message
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const fillDemoCredentials = () => {
    setFormData({
      username: "admin", // Changed from email to username
      password: "demo123",
    });
    setErrors({});
  };

  const features = [
    { icon: <Store />, text: "Stall Management", color: "#D32F2F" },
    { icon: <Group />, text: "Tenant Onboarding", color: "#1976d2" },
    { icon: <Assignment />, text: "Lease Management", color: "#2e7d32" },
    { icon: <TrendingUp />, text: "Revenue Tracking", color: "#ed6c02" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #222 0%, #D32F2F 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 2,
        px: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 30% 20%, rgba(211, 47, 47, 0.1) 0%, transparent 50%)",
        },
      }}
    >
      <Container component="main" maxWidth="lg">
        <Zoom in={true} timeout={800}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: 4,
              minHeight: "80vh",
            }}
          >
            {/* Left Side - Features */}
            <Paper
              elevation={8}
              sx={{
                flex: 1,
                p: 1,
                pl: 3,
                pr: 3,
                borderRadius: 3,
                background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)",
                backdropFilter: "blur(10px)",
                display: { xs: "none", md: "block" },
                minHeight: 300,
                sx: { height: "50vh" },
              }}
            >
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                  <Store
                    sx={{
                      fontSize: 40,
                      color: "#D32F2F",
                      mr: 2,
                    }}
                  />
                  <Typography
                    variant="h3"
                    component="h1"
                    fontWeight={800}
                    sx={{
                      background: "linear-gradient(45deg, #b41010 30%, #241a1a 90%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      "& span.override": {
                        color: "black",
                        WebkitTextFillColor: "black",
                      },
                    }}
                  >
                    Palengke<span className="override">Pro.PH</span>
                  </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary" fontWeight={500}>
                  Modern Market Management
                </Typography>
              </Box>

              <Box sx={{ mt: 6 }}>
                <Typography variant="h5" fontWeight={700} color="#222" gutterBottom>
                  Everything You Need to Manage Your Market
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Streamline your market operations with our comprehensive management platform
                </Typography>

                <Box sx={{ display: "grid", gap: 2 }}>
                  {features.map((feature, index) => (
                    <Fade in={true} timeout={1000} key={feature.text} style={{ transitionDelay: `${index * 200}ms` }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "rgba(211, 47, 47, 0.05)",
                          border: "1px solid rgba(211, 47, 47, 0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateX(8px)",
                            bgcolor: "rgba(211, 47, 47, 0.08)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            bgcolor: feature.color,
                            color: "white",
                            mr: 2,
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="body1" fontWeight={600}>
                          {feature.text}
                        </Typography>
                      </Box>
                    </Fade>
                  ))}
                </Box>
              </Box>

              <Box sx={{ mt: 4, p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                  Trusted by market administrators nationwide
                </Typography>
              </Box>
            </Paper>

            {/* Right Side - Login Form */}
            <Paper
              elevation={16}
              sx={{
                flex: { xs: 1, md: 0.6 },
                p: { xs: 3, sm: 4 },
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                maxWidth: 450,
                width: "100%",
              }}
            >
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", justifyContent: "center", mb: 2 }}>
                  <Store
                    sx={{
                      fontSize: 32,
                      color: "#D32F2F",
                      mr: 1.5,
                    }}
                  />
                  <Typography
                    variant="h5"
                    component="h1"
                    fontWeight={800}
                    sx={{
                      background: "linear-gradient(45deg, #b41010 30%, #241a1a 90%)",
                      backgroundClip: "text", 
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    PalengkePro.PH
                  </Typography>
                </Box>
                <Typography
                  component="h2"
                  variant="h5"
                  fontWeight={700}
                  gutterBottom
                  color="#222"
                >
                  Welcome Back
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Sign in to access your dashboard
                </Typography>
              </Box>

              {errors.submit && (
                <Alert 
                  severity={errors.submit.includes("demo mode") ? "warning" : "error"} 
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    "& .MuiAlert-icon": {
                      color: errors.submit.includes("demo mode") ? "#ed6c02" : "#D32F2F"
                    }
                  }}
                >
                  {errors.submit}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={formData.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: "#D32F2F", fontSize: 20 }} /> {/* Changed icon */}
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "#D32F2F",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#D32F2F",
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "#D32F2F", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePassword}
                          edge="end"
                          size="small"
                          sx={{ color: "#666" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "#D32F2F",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#D32F2F",
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  startIcon={<Security />}
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    bgcolor: "#D32F2F",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "#B71C1C",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(211, 47, 47, 0.4)",
                    },
                    "&:disabled": {
                      bgcolor: "#f5f5f5",
                      color: "#999",
                      transform: "none",
                    },
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
                  }}
                >
                  {isLoading ? "Signing In..." : "Sign In to Dashboard"}
                </Button>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    QUICK ACCESS
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={fillDemoCredentials}
                  sx={{
                    py: 1,
                    borderRadius: 2,
                    borderColor: "#D32F2F",
                    color: "#D32F2F",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "#fdecea",
                      borderColor: "#B71C1C",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Use Demo Credentials
                </Button>
              </Box>

              {/* Demo Info */}
              <Box
                sx={{
                  mt: 3,
                  p: 1.5,
                  bgcolor: "#f8f9fa",
                  borderRadius: 2,
                  border: "1px solid #e9ecef",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  align="center"
                  display="block"
                  fontWeight={500}
                >
                  Demo: admin / demo123 {/* Updated demo credentials */}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  align="center"
                  display="block"
                  sx={{ mt: 0.5, fontSize: '0.7rem' }}
                >
                  Works in demo mode when API is unavailable
                </Typography>
              </Box>

              {/* Footer */}
              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  © {new Date().getFullYear()} PalengkePro.PH
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ opacity: 0.7 }}>
                  Secure • Reliable • Efficient
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Zoom>
      </Container>
    </Box>
  );
}