import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verificationAPI } from '../services/api';

// Mock data - replace with actual API calls
const mockUserProducts = [
  {
    id: 1,
    title: 'iPhone 13 Pro',
    price: 899,
    status: 'Active',
    views: 45,
    datePosted: '2024-01-15',
  },
  {
    id: 2,
    title: 'MacBook Air M1',
    price: 999,
    status: 'Sold',
    views: 78,
    datePosted: '2024-01-10',
  },
];

const mockPurchaseHistory = [
  {
    id: 1,
    title: 'Sony WH-1000XM4',
    price: 249,
    seller: 'Mike Johnson',
    datePurchased: '2024-01-12',
    status: 'Delivered',
  },
  {
    id: 2,
    title: 'iPad Pro 11"',
    price: 699,
    seller: 'Sarah Wilson',
    datePurchased: '2024-01-08',
    status: 'Shipped',
  },
];

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState(null);


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Load verification status
  React.useEffect(() => {
    const loadVerificationStatus = async () => {
      try {
        const response = await verificationAPI.getMyVerificationStatus();
        setVerificationStatus(response.verification);
      } catch (error) {
        console.error('Error loading verification status:', error);
      }
    };

    if (user?.id) {
      loadVerificationStatus();
    }
  }, [user?.id]);

  // Handle URL parameter for tab navigation
  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const tabIndex = parseInt(tabParam);
      if (tabIndex >= 0 && tabIndex <= 3) {
        setTabValue(tabIndex);
      }
    }
  }, [searchParams]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Sold':
        return 'default';
      case 'Delivered':
        return 'success';
      case 'Shipped':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your products and track your purchases
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Listings
              </Typography>
              <Typography variant="h4">
                {mockUserProducts.filter(p => p.status === 'Active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Sales
              </Typography>
              <Typography variant="h4">
                ${mockUserProducts.filter(p => p.status === 'Sold').reduce((sum, p) => sum + p.price, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Purchases
              </Typography>
              <Typography variant="h4">
                ${mockPurchaseHistory.reduce((sum, p) => sum + p.price, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Seller Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {user?.role === 'seller' ? (
                  <>
                    <CheckCircleIcon color="success" />
                    <Typography variant="h6" color="success.main">
                      Verified Seller
                    </Typography>
                  </>
                ) : user?.verificationStatus === 'pending' ? (
                  <>
                    <PendingIcon color="warning" />
                    <Typography variant="h6" color="warning.main">
                      Verification Pending
                    </Typography>
                  </>
                ) : (
                  <>
                    <PendingIcon color="warning" />
                    <Typography variant="h6" color="warning.main">
                      Regular User
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Views
              </Typography>
              <Typography variant="h4">
                {mockUserProducts.reduce((sum, p) => sum + p.views, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Seller Verification Prompt */}
      {user?.role === 'user' && user?.verificationStatus !== 'pending' && (
        <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Become a Verified Seller
                </Typography>
                <Typography variant="body2">
                  Start selling your gadgets and earn money! Get verified to unlock premium features and build trust with buyers.
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SecurityIcon />}
                onClick={() => navigate('/verify-seller')}
                sx={{ ml: 2 }}
              >
                Apply Now
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Pending Verification Status */}
      {user?.verificationStatus === 'pending' && (
        <Card sx={{ mb: 4, bgcolor: 'warning.light', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Verification Under Review
                </Typography>
                <Typography variant="body2">
                  Your seller verification request is being reviewed by our admin team. You'll receive a notification once it's processed.
                </Typography>
                {user?.verificationId && (
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    Verification ID: {user.verificationId}
                  </Typography>
                )}
              </Box>
              <PendingIcon sx={{ fontSize: 40, ml: 2 }} />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Verification Status Monitor */}
      {verificationStatus && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Verification Status Monitor
              </Typography>
              <IconButton onClick={() => {
                // Clear old verification data and reload
                localStorage.removeItem('sellerVerifications');
                window.location.reload();
              }}>
                <RefreshIcon />
              </IconButton>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ScheduleIcon color="primary" />
                  <Typography variant="body2">
                    <strong>Status:</strong> 
                    <Chip 
                      label={verificationStatus.status.toUpperCase()} 
                      color={verificationStatus.status === 'approved' ? 'success' : verificationStatus.status === 'rejected' ? 'error' : 'warning'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SecurityIcon color="primary" />
                  <Typography variant="body2">
                    <strong>ID:</strong> {verificationStatus.verificationId}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircleIcon color="primary" />
                  <Typography variant="body2">
                    <strong>Submitted:</strong> {new Date(verificationStatus.submittedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Application Details:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Name: {verificationStatus.fullName || verificationStatus.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID Type: {verificationStatus.idType}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phone: {verificationStatus.phoneNumber}
                </Typography>
                {verificationStatus.reviewedAt && (
                  <Typography variant="body2" color="text.secondary">
                    Reviewed: {new Date(verificationStatus.reviewedAt).toLocaleDateString()}
                  </Typography>
                )}
                {verificationStatus.rejectionReason && (
                  <Typography variant="body2" color="error">
                    Reason: {verificationStatus.rejectionReason}
                  </Typography>
                )}
              </Grid>
            </Grid>
            
            {verificationStatus.status === 'rejected' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                <Typography variant="body2" color="error">
                  Your verification was rejected. You can reapply after addressing the issues mentioned above.
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => navigate('/verify-seller')}
                  sx={{ mt: 1 }}
                >
                  Reapply for Verification
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="My Products" />
          <Tab label="Purchase History" />
          <Tab label="Verification Status" />
          <Tab label="Account Settings" />
        </Tabs>
      </Box>

      {/* My Products Tab */}
      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">My Products</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/sell')}
            >
              Add New Product
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Date Posted</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockUserProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.title}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.status}
                        color={getStatusColor(product.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{product.views}</TableCell>
                    <TableCell>{product.datePosted}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Purchase History Tab */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>Purchase History</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Seller</TableCell>
                  <TableCell>Date Purchased</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockPurchaseHistory.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{purchase.title}</TableCell>
                    <TableCell>${purchase.price}</TableCell>
                    <TableCell>{purchase.seller}</TableCell>
                    <TableCell>{purchase.datePurchased}</TableCell>
                    <TableCell>
                      <Chip
                        label={purchase.status}
                        color={getStatusColor(purchase.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        Track Package
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Verification Status Tab */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>Verification Status</Typography>
          
          {verificationStatus ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Application Details
                  </Typography>
                  <IconButton onClick={() => {
                    // Clear old verification data and reload
                    localStorage.removeItem('sellerVerifications');
                    window.location.reload();
                  }}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Application Status
                      </Typography>
                      <Chip 
                        label={verificationStatus.status.toUpperCase()} 
                        color={verificationStatus.status === 'approved' ? 'success' : verificationStatus.status === 'rejected' ? 'error' : 'warning'}
                        size="large"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Verification ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                        {verificationStatus.verificationId}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Submitted Date
                      </Typography>
                      <Typography variant="body1">
                        {new Date(verificationStatus.submittedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Personal Information
                      </Typography>
                      <Typography variant="body2">Name: {verificationStatus.fullName || verificationStatus.name}</Typography>
                      <Typography variant="body2">Phone: {verificationStatus.phoneNumber}</Typography>
                      <Typography variant="body2">Address: {verificationStatus.address}</Typography>
                      <Typography variant="body2">ID Type: {verificationStatus.idType}</Typography>
                      <Typography variant="body2">ID Number: {verificationStatus.idNumber}</Typography>
                    </Box>
                    
                    {verificationStatus.reviewedAt && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Review Date
                        </Typography>
                        <Typography variant="body1">
                          {new Date(verificationStatus.reviewedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                    )}
                    
                    {verificationStatus.rejectionReason && (
                      <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="error" gutterBottom>
                          Rejection Reason
                        </Typography>
                        <Typography variant="body2" color="error">
                          {verificationStatus.rejectionReason}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
                
                {verificationStatus.status === 'rejected' && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                      Your verification was rejected. Please address the issues mentioned above and reapply.
                    </Typography>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => navigate('/verify-seller')}
                    >
                      Reapply for Verification
                    </Button>
                  </Box>
                )}
                
                {verificationStatus.status === 'pending' && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="warning.dark">
                      Your application is currently under review. Our admin team will process it within 24-48 hours.
                    </Typography>
                  </Box>
                )}
                
                {verificationStatus.status === 'approved' && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="success.dark">
                      🎉 Congratulations! Your seller verification has been approved. You can now list products and access premium features.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <SecurityIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Verification Application Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  You haven't submitted a seller verification application yet.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SecurityIcon />}
                  onClick={() => navigate('/verify-seller')}
                >
                  Apply for Seller Verification
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Account Settings Tab */}
      {tabValue === 3 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>Account Settings</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Profile Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Name: {user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Email: {user?.email}
                  </Typography>
                  <Button variant="outlined" size="small">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Security
                  </Typography>
                  <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                    Change Password
                  </Button>
                  <Button variant="outlined" size="small">
                    Two-Factor Auth
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default UserDashboard;
