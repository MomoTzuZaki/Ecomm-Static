import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock orders data
  const orders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'pending',
      total: 799,
      items: [
        { name: 'iPhone 13 Pro', price: 799, quantity: 1 }
      ],
      seller: { name: 'Alice', rating: 4.9 },
      deliveryMethod: 'Standard',
      paymentMethod: 'GCash',
      trackingNumber: 'LAL123456789',
      courierService: 'Lalamove'
    },
    {
      id: 'ORD-002',
      date: '2024-01-14',
      status: 'shipped',
      total: 1099,
      items: [
        { name: 'Dell XPS 13', price: 1099, quantity: 1 }
      ],
      seller: { name: 'Bob', rating: 4.5 },
      deliveryMethod: 'Express',
      paymentMethod: 'PayMaya',
      trackingNumber: 'JT987654321',
      courierService: 'J&T Express'
    },
    {
      id: 'ORD-003',
      date: '2024-01-10',
      status: 'delivered',
      total: 279,
      items: [
        { name: 'Sony WH-1000XM5', price: 279, quantity: 1 }
      ],
      seller: { name: 'Carol', rating: 4.8 },
      deliveryMethod: 'Standard',
      paymentMethod: 'Bank Transfer',
      trackingNumber: 'LAL555666777',
      courierService: 'Lalamove'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'shipped': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ScheduleIcon />;
      case 'shipped': return <ShippingIcon />;
      case 'delivered': return <CheckIcon />;
      default: return <CartIcon />;
    }
  };

  const handleConfirmDelivery = (order) => {
    setSelectedOrder(order);
    setConfirmDialogOpen(true);
  };

  const confirmDelivery = () => {
    // In real app, this would update order status and release payment
    console.log('Confirming delivery for order:', selectedOrder.id);
    setConfirmDialogOpen(false);
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter(order => {
    switch (tabValue) {
      case 0: return true; // All
      case 1: return order.status === 'pending';
      case 2: return order.status === 'shipped';
      case 3: return order.status === 'delivered';
      default: return true;
    }
  });

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please log in to view your orders.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Orders" />
          <Tab label="Pending" />
          <Tab label="Shipped" />
          <Tab label="Delivered" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {filteredOrders.map((order) => (
          <Grid item xs={12} key={order.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">
                      Order #{order.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    icon={getStatusIcon(order.status)}
                    label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    color={getStatusColor(order.status)}
                    variant="outlined"
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Items Ordered:
                    </Typography>
                    <List dense>
                      {order.items.map((item, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <CartIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.name}
                            secondary={`Qty: ${item.quantity} × $${item.price}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Order Details:
                    </Typography>
                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <PaymentIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Total Amount"
                          secondary={`$${order.total.toFixed(2)}`}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <StarIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Seller"
                          secondary={`${order.seller.name} (${order.seller.rating}⭐)`}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <ShippingIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Delivery"
                          secondary={`${order.deliveryMethod} via ${order.courierService}`}
                        />
                      </ListItem>
                      {order.trackingNumber && (
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText
                            primary="Tracking Number"
                            secondary={order.trackingNumber}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Grid>
                </Grid>

                {order.status === 'shipped' && (
                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleConfirmDelivery(order)}
                    >
                      Confirm Delivery
                    </Button>
                  </Box>
                )}

                {order.status === 'delivered' && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Order completed! Payment has been released to the seller.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredOrders.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No orders found
          </Typography>
        </Box>
      )}

      {/* Confirm Delivery Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Delivery</DialogTitle>
        <DialogContent>
          <Typography>
            Have you received the items from order #{selectedOrder?.id}?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Once confirmed, payment will be released to the seller and cannot be reversed.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={confirmDelivery}>
            Confirm Delivery
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders;
