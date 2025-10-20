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
  Chip,
  Alert,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Store as StoreIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(parseInt(searchParams.get('tab')) || 0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Update URL without page reload
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', newValue.toString());
    navigate({ search: newSearchParams.toString() }, { replace: true });
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Please login to access your dashboard.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Welcome back, {user.firstName || user.username}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your TechCycle experience
          </Typography>
        </Box>
        <Chip 
          label={user.role === 'admin' ? 'Admin' : 'User'} 
          color={user.role === 'admin' ? 'primary' : 'default'}
          variant="outlined"
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Orders" />
          <Tab label="Profile" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>Dashboard Overview</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StoreIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6">Browse Products</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Discover amazing second-hand devices at great prices
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/products')}
                  >
                    Shop Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CartIcon sx={{ mr: 2, color: 'success.main' }} />
                    <Typography variant="h6">Shopping Cart</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Review items in your cart and proceed to checkout
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/cart')}
                  >
                    View Cart
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HistoryIcon sx={{ mr: 2, color: 'info.main' }} />
                    <Typography variant="h6">Order History</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Track your orders and view purchase history
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleTabChange(null, 1)}
                  >
                    View Orders
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Stats
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          0
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Orders
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          ₱0
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Spent
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">
                          0
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Items in Cart
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                          0
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Wishlist Items
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Orders Tab */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>Order History</Typography>
          <Alert severity="info">
            Your order history will appear here once you make your first purchase.
          </Alert>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<StoreIcon />}
              onClick={() => navigate('/products')}
            >
              Start Shopping
            </Button>
          </Box>
        </Box>
      )}

      {/* Profile Tab */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>Profile Information</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Account Details
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">
                      {user.firstName} {user.lastName}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {user.email}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Username
                    </Typography>
                    <Typography variant="body1">
                      {user.username}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Role
                    </Typography>
                    <Chip 
                      label={user.role === 'admin' ? 'Administrator' : 'Customer'} 
                      color={user.role === 'admin' ? 'primary' : 'default'}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Account Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<SettingsIcon />}
                      onClick={() => navigate('/profile')}
                    >
                      Edit Profile
                    </Button>
                    {user.role === 'admin' && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/admin')}
                      >
                        Admin Dashboard
                      </Button>
                    )}
                  </Box>
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
