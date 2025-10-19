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
  TextField,
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
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const SellerOrders = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [shipDialogOpen, setShipDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierService, setCourierService] = useState('');

  // Mock seller orders data
  const sellerOrders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'pending',
      total: 799,
      platformFee: 23.97,
      netAmount: 775.03,
      items: [
        { name: 'iPhone 13 Pro', price: 799, quantity: 1 }
      ],
      buyer: { name: 'John Doe', email: 'john@example.com' },
      deliveryAddress: '123 Main St, Manila, Philippines',
      paymentMethod: 'GCash'
    },
    {
      id: 'ORD-002',
      date: '2024-01-14',
      status: 'shipped',
      total: 1099,
      platformFee: 32.97,
      netAmount: 1066.03,
      items: [
        { name: 'Dell XPS 13', price: 1099, quantity: 1 }
      ],
      buyer: { name: 'Jane Smith', email: 'jane@example.com' },
      deliveryAddress: '456 Oak Ave, Quezon City, Philippines',
      paymentMethod: 'PayMaya',
      trackingNumber: 'JT987654321',
      courierService: 'J&T Express'
    },
    {
      id: 'ORD-003',
      date: '2024-01-10',
      status: 'delivered',
      total: 279,
      platformFee: 8.37,
      netAmount: 270.63,
      items: [
        { name: 'Sony WH-1000XM5', price: 279, quantity: 1 }
      ],
      buyer: { name: 'Mike Johnson', email: 'mike@example.com' },
      deliveryAddress: '789 Pine St, Makati, Philippines',
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

  const handleShipOrder = (order) => {
    setSelectedOrder(order);
    setShipDialogOpen(true);
  };

  const confirmShipment = () => {
    if (!trackingNumber || !courierService) {
      alert('Please fill in tracking number and courier service');
      return;
    }
    
    // In real app, this would update order status
    console.log('Shipping order:', selectedOrder.id, 'with tracking:', trackingNumber);
    setShipDialogOpen(false);
    setSelectedOrder(null);
    setTrackingNumber('');
    setCourierService('');
  };

  const filteredOrders = sellerOrders.filter(order => {
    switch (tabValue) {
      case 0: return true; // All
      case 1: return order.status === 'pending';
      case 2: return order.status === 'shipped';
      case 3: return order.status === 'delivered';
      default: return true;
    }
  });

  const totalEarnings = sellerOrders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + order.netAmount, 0);

  const pendingEarnings = sellerOrders
    .filter(order => order.status === 'shipped')
    .reduce((sum, order) => sum + order.netAmount, 0);

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please log in to view your seller orders.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Seller Orders
      </Typography>

      {/* Earnings Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Total Earnings</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                ${totalEarnings.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                From completed orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ScheduleIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Pending Payment</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                ${pendingEarnings.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Awaiting delivery confirmation
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PaymentIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Platform Fees</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                3%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Per transaction
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Orders" />
          <Tab label="Pending Shipment" />
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
                      Order Details:
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
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Buyer"
                          secondary={order.buyer.name}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <PaymentIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Payment"
                          secondary={`${order.paymentMethod} - $${order.total.toFixed(2)}`}
                        />
                      </ListItem>
                    </List>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Financial Breakdown:
                    </Typography>
                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary="Order Total"
                          secondary={`$${order.total.toFixed(2)}`}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary="Platform Fee (3%)"
                          secondary={`-$${order.platformFee.toFixed(2)}`}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary="Your Earnings"
                          secondary={`$${order.netAmount.toFixed(2)}`}
                        />
                      </ListItem>
                    </List>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Delivery Address:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.deliveryAddress}
                    </Typography>
                    
                    {order.trackingNumber && (
                      <>
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                          Tracking:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.trackingNumber} ({order.courierService})
                        </Typography>
                      </>
                    )}
                  </Grid>
                </Grid>

                {order.status === 'pending' && (
                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <Button
                      variant="contained"
                      onClick={() => handleShipOrder(order)}
                    >
                      Mark as Shipped
                    </Button>
                  </Box>
                )}

                {order.status === 'delivered' && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Payment of ${order.netAmount.toFixed(2)} has been released to your account.
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

      {/* Ship Order Dialog */}
      <Dialog open={shipDialogOpen} onClose={() => setShipDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Order as Shipped</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Please provide shipping details for order #{selectedOrder?.id}:
          </Typography>
          
          <TextField
            fullWidth
            label="Tracking Number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Courier Service"
            placeholder="e.g., Lalamove, J&T Express, Grab"
            value={courierService}
            onChange={(e) => setCourierService(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Alert severity="info">
            The buyer will be notified and can track the shipment. Payment will be held in escrow until delivery confirmation.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShipDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmShipment}>
            Mark as Shipped
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SellerOrders;
