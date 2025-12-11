// src/components/NotFound.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  Paper,
  Fade
} from '@mui/material';
import { 
  Home as HomeIcon,
  SearchOff as SearchOffIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const suggestions = [
    "Check the URL for typos",
    "Use the navigation menu to find your way",
    "Go back to the previous page",
    "Return to the dashboard"
  ];

  return (
      <Fade in={true} timeout={800}>
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 'calc(100vh - 200px)',
              py: 8,
              px: 2,
            }}
          >
            {/* Animated 404 Number */}
            <Box
              sx={{
                position: 'relative',
                mb: 4,
              }}
            >
              <Box
                sx={{
                  fontSize: { xs: '120px', sm: '160px', md: '200px' },
                  fontWeight: 900,
                  color: 'primary.main',
                  opacity: 0.1,
                  position: 'absolute',
                  top: '-40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 0,
                }}
              >
                404
              </Box>
              
              <SearchOffIcon
                sx={{
                  fontSize: { xs: '80px', sm: '120px', md: '160px' },
                  color: 'error.main',
                  position: 'relative',
                  zIndex: 1,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1.1)' },
                    '50%': { transform: 'scale(1.3)' },
                    '100%': { transform: 'scale(1.5)' },
                  },
                }}
              />
            </Box>

            {/* Main Message */}
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                textAlign: 'center',
                mb: 2,
                position: 'relative',
                zIndex: 1,
              }}
            >
              Page Not Found
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                textAlign: 'center',
                mb: 4,
                maxWidth: '600px',
              }}
            >
              Oops! The page you're looking for doesn't exist or has been moved.
            </Typography>

            {/* Path Information */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 2,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
                width: '100%',
                maxWidth: '500px',
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontWeight: 600 }}
              >
                Attempted to access:
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'monospace',
                  bgcolor: 'background.paper',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.300',
                  wordBreak: 'break-all',
                }}
              >
                {location.pathname}
              </Typography>
            </Paper>

            {/* Suggestions Card */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 2,
                bgcolor: 'white',
                width: '100%',
                maxWidth: '500px',
              }}
            >
             <Typography
                                variant="h"
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



              <Typography
                variant="h6"
                color="black"
                sx={{ mb: 2, fontWeight: 600 }}
              >
                <Box component="span" sx={{ mr: 1 }}>💡</Box>
                What you can do next:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {suggestions.map((suggestion, index) => (
                  <Typography
                    key={index}
                    component="li"
                    variant="body2"
                    color="black"
                    sx={{ mb: 1 }}
                  >
                    {suggestion}
                  </Typography>
                ))}
              </Box>
            </Paper>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'center',
                mt: 2,
              }}
            >


              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/')}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: 'grey.400',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'grey.600',
                    bgcolor: 'grey.50',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Go Back
              </Button>

              <Button
                variant="text"
                size="large"
                onClick={() => navigate('/stall-inventory')}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.50',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Browse Stalls
              </Button>
            </Box>

            {/* Contact Support */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 6, textAlign: 'center' }}
            >
              Still having trouble?{' '}
              <Box
                component="span"
                sx={{
                  color: 'primary.main',
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                onClick={() => navigate('/support')}
              >
                Contact Support
              </Box>
            </Typography>
          </Box>
        </Container>
      </Fade>
  );
}