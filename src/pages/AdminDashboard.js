import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { verificationAPI, adminNotificationAPI } from '../services/api';

// Mock data - replace with actual API calls
const mockPendingProducts = [
  {
    id: 1,
    title: 'Samsung Galaxy S21',
    seller: 'John Doe',
    price: 599,
    category: 'Smartphones',
    condition: 'Good',
    dateSubmitted: '2024-01-15',
    status: 'Pending',
  },
  {
    id: 2,
    title: 'Dell XPS 13',
    seller: 'Jane Smith',
    price: 899,
    category: 'Laptops',
    condition: 'Excellent',
    dateSubmitted: '2024-01-14',
    status: 'Pending',
  },
];

// Using ProductContext for product data


const AdminDashboard = () => {
  const navigate = useNavigate();
  const { getAllProducts } = useProducts();
  const [tabValue, setTabValue] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [verifications, setVerifications] = useState([]);
  const [verificationStats, setVerificationStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [notifications, setNotifications] = useState([]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Load verification data and notifications
  useEffect(() => {
    loadVerifications();
    loadNotifications();
  }, []);

  // Load admin notifications
  const loadNotifications = async () => {
    try {
      const response = await adminNotificationAPI.getNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  const loadVerifications = async () => {
    try {
      const response = await verificationAPI.getAllVerifications();
      const verifications = response.verifications || [];
      console.log('Loaded verifications:', verifications);
      setVerifications(verifications);
      
      // Calculate stats
      const stats = verifications.reduce((acc, verification) => {
        acc[verification.status] = (acc[verification.status] || 0) + 1;
        return acc;
      }, { pending: 0, approved: 0, rejected: 0 });
      
      console.log('Verification stats:', stats);
      setVerificationStats(stats);
    } catch (error) {
      console.error('Error loading verifications:', error);
      // Set empty arrays on error to prevent crashes
      setVerifications([]);
      setVerificationStats({ pending: 0, approved: 0, rejected: 0 });
    }
  };

  const handleApproveProduct = (productId) => {
    // Simulate API call
    console.log('Approving product:', productId);
    // Update product status in real implementation
  };

  const handleRejectProduct = (productId) => {
    // Simulate API call
    console.log('Rejecting product:', productId);
    // Update product status in real implementation
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/edit/${productId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'error';
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Admin Dashboard
          </Typography>
          {notifications.filter(n => !n.read).length > 0 && (
            <Chip
              label={`${notifications.filter(n => !n.read).length} New Verification${notifications.filter(n => !n.read).length > 1 ? 's' : ''}`}
              color="warning"
              variant="filled"
              onClick={() => navigate('/admin/verification')}
              sx={{ cursor: 'pointer' }}
            />
          )}
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage products, seller verifications, and platform analytics
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Reviews
              </Typography>
              <Typography variant="h4">
                {mockPendingProducts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h4">
                {getAllProducts().length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Reviews
              </Typography>
              <Typography variant="h4">
                {mockPendingProducts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">
                $12,450
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Pending Reviews" />
          <Tab label="All Products" />
          <Tab label="Seller Verification" />
          <Tab label="Transactions" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Pending Reviews Tab */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>Products Pending Review</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Seller</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Date Submitted</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockPendingProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.title}</TableCell>
                    <TableCell>{typeof product.seller === 'object' ? product.seller.name : product.seller}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.condition}</TableCell>
                    <TableCell>{product.dateSubmitted}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewProduct(product)}
                        title="View Details"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditProduct(product.id)}
                        title="Edit Product"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => handleApproveProduct(product.id)}
                        title="Approve Product"
                      >
                        <ApproveIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleRejectProduct(product.id)}
                        title="Reject Product"
                      >
                        <RejectIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* All Products Tab */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>All Products</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Seller</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date Submitted</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getAllProducts().map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.title}</TableCell>
                    <TableCell>{typeof product.seller === 'object' ? product.seller.name : product.seller}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.status}
                        color={getStatusColor(product.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{product.dateSubmitted}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small"
                        onClick={() => handleViewProduct(product)}
                        title="View Details"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton 
                        size="small"
                        color="primary"
                        onClick={() => handleEditProduct(product.id)}
                        title="Edit Product"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        title="Delete Product"
                      >
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


      {/* Seller Verification Tab */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Seller Verification Management
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Manage seller verification requests to maintain platform quality and trust.
          </Alert>
          
          {/* Quick Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="warning.main" variant="h4">
                    {verificationStats.pending}
                  </Typography>
                  <Typography variant="body2">Pending</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="success.main" variant="h4">
                    {verificationStats.approved}
                  </Typography>
                  <Typography variant="body2">Approved</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="error.main" variant="h4">
                    {verificationStats.rejected}
                  </Typography>
                  <Typography variant="body2">Rejected</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Verifications */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recent Verification Requests
          </Typography>
          
          {verifications.length === 0 ? (
            <Alert severity="info">
              No verification requests found.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>ID Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {verifications.slice(0, 5).map((verification) => (
                    <TableRow key={verification.id}>
                      <TableCell>
                        {verification.user ? 
                          `${verification.user.firstName || verification.user.username || 'User'} ${verification.user.lastName || ''}` : 
                          'Unknown User'
                        }
                      </TableCell>
                      <TableCell>{verification.user?.email || 'No email'}</TableCell>
                      <TableCell>{verification.idType || verification.validIdType || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={verification.status.toUpperCase()}
                          color={getStatusColor(verification.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(verification.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          onClick={() => navigate('/admin/verification')}
                          title="View Details"
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              startIcon={<SecurityIcon />}
              onClick={() => navigate('/admin/verification')}
              size="large"
            >
              Manage All Seller Verifications
            </Button>
          </Box>
        </Box>
      )}

      {/* Transactions Tab */}
      {tabValue === 3 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Transaction Management
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Manage pending transactions and verify payments. TechCycle holds payments in escrow until verification is complete.
          </Alert>

          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PaymentIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Transaction Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review and verify pending transactions to release payments to sellers.
            </Typography>
            <Button
              variant="contained"
              startIcon={<PaymentIcon />}
              onClick={() => navigate('/admin/transactions')}
              size="large"
            >
              Manage Transactions
            </Button>
          </Box>
        </Box>
      )}

      {/* Analytics Tab */}
      {tabValue === 4 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>Platform Analytics</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Category Distribution
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Smartphones: 45%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Laptops: 30%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Audio: 15%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Other: 10%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New users this week: 12
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Products listed: 8
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Products sold: 5
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Product Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedProduct.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Seller: {typeof selectedProduct.seller === 'object' ? selectedProduct.seller.name : selectedProduct.seller}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Price: ${selectedProduct.price}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Category: {selectedProduct.category}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Condition: {selectedProduct.condition}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date Submitted: {selectedProduct.dateSubmitted}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button 
            color="success" 
            variant="contained"
            onClick={() => {
              handleApproveProduct(selectedProduct?.id);
              setDialogOpen(false);
            }}
          >
            Approve
          </Button>
          <Button 
            color="error" 
            variant="contained"
            onClick={() => {
              handleRejectProduct(selectedProduct?.id);
              setDialogOpen(false);
            }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
