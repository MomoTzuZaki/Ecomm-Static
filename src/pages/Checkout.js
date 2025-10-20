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
  TextField,
  Paper,
  Alert,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Breadcrumbs,
  Link,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderAPI, paymentAPI } from '../services/api_b2c';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [paymentReference, setPaymentReference] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (location.state?.checkoutData) {
      setCheckoutData(location.state.checkoutData);
      setShippingAddress(location.state.checkoutData.shippingAddress || '');
    } else {
      navigate('/cart');
    }
  }, [location.state, user, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!shippingAddress.trim()) {
      newErrors.shippingAddress = 'Shipping address is required';
    }

    if (!paymentReference.trim()) {
      newErrors.paymentReference = 'Payment reference is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Create order
      const orderData = {
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
        shippingFee: checkoutData.shippingFee
      };

      const orderResponse = await orderAPI.createOrder(orderData);

      // Process payment
      const paymentData = {
        method: paymentMethod,
        reference: paymentReference.trim()
      };

      await paymentAPI.processPayment(orderResponse.order.id, paymentData);

      // Redirect to order confirmation
      navigate('/order-confirmation', { 
        state: { 
          order: orderResponse.order,
          paymentReference: paymentReference.trim()
        } 
      });

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  if (!checkoutData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading checkout...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          Home
        </Link>
        <Link color="inherit" href="/products" onClick={(e) => { e.preventDefault(); navigate('/products'); }}>
          Products
        </Link>
        <Link color="inherit" href="/cart" onClick={(e) => { e.preventDefault(); navigate('/cart'); }}>
          Cart
        </Link>
        <Typography color="text.primary">Checkout</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      <Grid container spacing={4}>
        {/* Order Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="center">Qty</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {checkoutData.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              component="img"
                              src={item.product.image || 'https://via.placeholder.com/50x50?text=No+Image'}
                              alt={item.product.name}
                              sx={{
                                width: 50,
                                height: 50,
                                objectFit: 'cover',
                                borderRadius: 1,
                                mr: 2
                              }}
                            />
                            <Typography variant="body2">
                              {item.product.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">₱{item.product.price.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          ₱{(item.product.price * item.quantity).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TextField
                fullWidth
                multiline
                rows={4}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your complete shipping address..."
                error={!!errors.shippingAddress}
                helperText={errors.shippingAddress}
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <FormControl component="fieldset">
                <FormLabel component="legend">Choose Payment Method</FormLabel>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="gcash"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ mr: 1, color: '#00D4AA' }} />
                        <Typography>GCash</Typography>
                        <Chip label="Recommended" color="success" size="small" sx={{ ml: 2 }} />
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="paymaya"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ mr: 1, color: '#00B2FF' }} />
                        <Typography>PayMaya</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="bank_transfer"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BankIcon sx={{ mr: 1, color: '#1976D2' }} />
                        <Typography>Bank Transfer</Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>

              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Payment Reference Number"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder={
                    paymentMethod === 'gcash' ? 'Enter GCash reference number' :
                    paymentMethod === 'paymaya' ? 'Enter PayMaya reference number' :
                    'Enter bank transfer reference number'
                  }
                  error={!!errors.paymentReference}
                  helperText={errors.paymentReference}
                />
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Payment Instructions:</strong>
                  <br />
                  {paymentMethod === 'gcash' && (
                    <>
                      • Send payment to GCash: 0917-123-4567<br />
                      • Reference: TechCycle Order<br />
                      • Enter the GCash reference number above
                    </>
                  )}
                  {paymentMethod === 'paymaya' && (
                    <>
                      • Send payment to PayMaya: 0917-123-4567<br />
                      • Reference: TechCycle Order<br />
                      • Enter the PayMaya reference number above
                    </>
                  )}
                  {paymentMethod === 'bank_transfer' && (
                    <>
                      • Bank: BPI<br />
                      • Account: TechCycle Store (123-456-789)<br />
                      • Reference: TechCycle Order<br />
                      • Enter the bank transfer reference number above
                    </>
                  )}
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal ({checkoutData.items.length} items):</Typography>
                <Typography>₱{checkoutData.subtotal.toLocaleString()}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping:</Typography>
                <Typography color={checkoutData.shippingFee === 0 ? 'success.main' : 'text.primary'}>
                  {checkoutData.shippingFee === 0 ? 'FREE' : `₱${checkoutData.shippingFee.toLocaleString()}`}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>TechCycle Commission (3%):</Typography>
                <Typography>₱{Math.round(checkoutData.subtotal * 0.03).toLocaleString()}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  ₱{(checkoutData.total + Math.round(checkoutData.subtotal * 0.03)).toLocaleString()}
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handlePlaceOrder}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </Button>

              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={handleBackToCart}
                startIcon={<BackIcon />}
              >
                Back to Cart
              </Button>

              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Your order will be processed within 1-2 business days.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;