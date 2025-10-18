import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireSeller = false, requireAdmin = false }) => {
  const { user, isSeller, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if seller verification is required
  if (requireSeller && !isSeller()) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#2D3748', fontWeight: 600 }}>
            Seller Verification Required
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#718096', fontSize: '1.1rem' }}>
            You need to be verified as a seller to access this page. Please complete the seller verification process first.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/verify-seller')}
            sx={{
              bgcolor: '#2D3748',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 500,
              '&:hover': {
                bgcolor: '#1A202C',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(45, 55, 72, 0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Become a Seller
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            sx={{
              borderColor: '#2D3748',
              color: '#2D3748',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 500,
              '&:hover': {
                borderColor: '#1A202C',
                bgcolor: 'rgba(45, 55, 72, 0.04)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Go Home
          </Button>
        </Box>
      </Container>
    );
  }

  // Check if admin access is required
  if (requireAdmin && !isAdmin()) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#2D3748', fontWeight: 600 }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#718096', fontSize: '1.1rem' }}>
            You don't have permission to access this page. Admin privileges are required.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{
            bgcolor: '#2D3748',
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 500,
            '&:hover': {
              bgcolor: '#1A202C',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(45, 55, 72, 0.3)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Go Home
        </Button>
      </Container>
    );
  }

  return children;
};

export default ProtectedRoute;
