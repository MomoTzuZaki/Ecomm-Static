import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Grid,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Breadcrumbs,
  Link,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Visibility as ViewIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api_b2c';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrders();
      setOrders(response.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading orders...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          Home
        </Link>
        <Typography color="text.primary">My Orders</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>

      {orders.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No orders found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You haven't placed any orders yet.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/products')}
          >
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Order #{order.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={order.status?.toUpperCase()}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                      <Chip
                        label={order.paymentStatus?.toUpperCase()}
                        color={getPaymentStatusColor(order.paymentStatus)}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="subtitle2" gutterBottom>
                        Items ({order.items?.length})
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Product</TableCell>
                              <TableCell align="center">Qty</TableCell>
                              <TableCell align="right">Price</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {order.items?.slice(0, 3).map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box
                                      component="img"
                                      src={item.image || 'https://via.placeholder.com/40x40?text=No+Image'}
                                      alt={item.name}
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        objectFit: 'cover',
                                        borderRadius: 1,
                                        mr: 2
                                      }}
                                    />
                                    <Typography variant="body2">
                                      {item.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">{item.quantity}</TableCell>
                                <TableCell align="right">₱{item.price.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {order.items?.length > 3 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          +{order.items.length - 3} more items
                        </Typography>
                      )}
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Subtotal:</Typography>
                          <Typography variant="body2">₱{order.subtotal?.toLocaleString()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Shipping:</Typography>
                          <Typography variant="body2">
                            {order.shippingFee === 0 ? 'FREE' : `₱${order.shippingFee?.toLocaleString()}`}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Commission:</Typography>
                          <Typography variant="body2">₱{order.techCycleCommission?.toLocaleString()}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary">
                            ₱{order.total?.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PaymentIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          {order.paymentMethod?.toUpperCase()}
                        </Typography>
                      </Box>
                      {order.trackingNumber && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ShippingIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            Tracking: {order.trackingNumber}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewOrder(order)}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Order Details - #{selectedOrder?.id}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Order Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Order Date:</Typography>
                      <Typography variant="body2">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Status:</Typography>
                      <Chip
                        label={selectedOrder.status?.toUpperCase()}
                        color={getStatusColor(selectedOrder.status)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Payment Status:</Typography>
                      <Chip
                        label={selectedOrder.paymentStatus?.toUpperCase()}
                        color={getPaymentStatusColor(selectedOrder.paymentStatus)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Payment Method:</Typography>
                      <Typography variant="body2">
                        {selectedOrder.paymentMethod?.toUpperCase()}
                      </Typography>
                    </Box>
                    {selectedOrder.estimatedDelivery && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Estimated Delivery:</Typography>
                        <Typography variant="body2">
                          {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Shipping Address
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedOrder.shippingAddress}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Order Items
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="center">Quantity</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                  component="img"
                                  src={item.image || 'https://via.placeholder.com/50x50?text=No+Image'}
                                  alt={item.name}
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    mr: 2
                                  }}
                                />
                                <Typography variant="body2">
                                  {item.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell align="right">₱{item.price.toLocaleString()}</TableCell>
                            <TableCell align="right">
                              ₱{(item.price * item.quantity).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 300 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">₱{selectedOrder.subtotal?.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Shipping:</Typography>
                      <Typography variant="body2">
                        {selectedOrder.shippingFee === 0 ? 'FREE' : `₱${selectedOrder.shippingFee?.toLocaleString()}`}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">TechCycle Commission:</Typography>
                      <Typography variant="body2">₱{selectedOrder.techCycleCommission?.toLocaleString()}</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" color="primary">
                        ₱{selectedOrder.total?.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders;