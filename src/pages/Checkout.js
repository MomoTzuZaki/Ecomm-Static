import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const subtotal = getCartTotal();
  const platformFee = subtotal * 0.03; // 3% platform fee
  const deliveryFee = deliveryMethod === 'express' ? 50 : 25;
  const total = subtotal + platformFee + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!deliveryMethod || !deliveryAddress || !paymentMethod) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clear cart and redirect to order confirmation
    clearCart();
    navigate('/order-confirmation', { 
      state: { 
        orderId: `ORD-${Date.now()}`,
        total,
        items: cartItems.length 
      } 
    });
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please log in to proceed with checkout.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>

      <Grid container spacing={3}>
        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            <List dense>
              {cartItems.map((item) => (
                <ListItem key={item.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CartIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.product.title}
                    secondary={`Qty: ${item.quantity} × $${item.product.price}`}
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography>${subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Platform Fee (3%):</Typography>
              <Typography>${platformFee.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Delivery:</Typography>
              <Typography>${deliveryFee.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">${total.toFixed(2)}</Typography>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Payment is held in escrow until you confirm delivery.
              </Typography>
            </Alert>
          </Paper>
        </Grid>

        {/* Checkout Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {/* Delivery Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                <ShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Delivery Information
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Delivery Method</InputLabel>
                <Select
                  value={deliveryMethod}
                  label="Delivery Method"
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                >
                  <MenuItem value="standard">Standard (2-3 days) - $25</MenuItem>
                  <MenuItem value="express">Express (1 day) - $50</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Delivery Address"
                placeholder="Enter your complete address..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Alert severity="info">
                <Typography variant="body2">
                  You'll coordinate delivery directly with the seller using your preferred courier service (Lalamove, J&T Express, etc.)
                </Typography>
              </Alert>
            </Box>

            {/* Payment Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Payment Method
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="gcash">GCash</MenuItem>
                  <MenuItem value="paymaya">PayMaya</MenuItem>
                  <MenuItem value="bank">Bank Transfer</MenuItem>
                  <MenuItem value="cod">Cash on Delivery</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Security Notice */}
            <Card sx={{ mb: 3, bgcolor: 'success.light', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SecurityIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Secure Payment</Typography>
                </Box>
                <Typography variant="body2">
                  Your payment is protected by our escrow system. Funds are held securely until you confirm delivery.
                </Typography>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handlePlaceOrder}
              disabled={loading || !deliveryMethod || !deliveryAddress || !paymentMethod}
              sx={{ py: 2 }}
            >
              {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
