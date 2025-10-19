import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  PhoneAndroid as MobileIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import QRCodePayment from './QRCodePayment';

const PaymentDialog = ({ open, onClose, product, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrPaymentOpen, setQrPaymentOpen] = useState(false);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    setError('');
  };

  const handleShippingChange = (field) => (event) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePaymentDetailsChange = (field) => (event) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const calculateCommission = (amount) => {
    return Math.round(amount * 0.03 * 100) / 100;
  };

  const calculateSellerAmount = (amount) => {
    return Math.round((amount - calculateCommission(amount)) * 100) / 100;
  };

  const handleSubmit = async () => {
    setError('');

    try {
      // Check if product is still available
      if (product.status === 'sold') {
        throw new Error('This product has already been sold.');
      }
      
      if (product.status === 'pending_sale') {
        throw new Error('This product is already being ordered by another buyer. Please check back later or browse other products.');
      }

      // Validate required fields
      if (!paymentMethod) {
        throw new Error('Please select a payment method');
      }

      if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city) {
        throw new Error('Please fill in all shipping address fields');
      }

      // Check if it's a QR code payment method
      if (['gcash', 'bank_transfer', 'paymaya'].includes(paymentMethod)) {
        setQrPaymentOpen(true);
        return;
      }

      // Handle card payments
      if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
        if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.cardName) {
          throw new Error('Please fill in all payment details');
        }
      }

      setLoading(true);

      // Simulate payment processing for card payments
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call success callback
      onPaymentSuccess({
        paymentMethod,
        shippingAddress,
        paymentDetails,
        amount: product.price,
        commission: calculateCommission(product.price),
        sellerAmount: calculateSellerAmount(product.price)
      });

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQRPaymentComplete = (qrPaymentData) => {
    // Call success callback with QR payment data
    onPaymentSuccess({
      paymentMethod: qrPaymentData.paymentMethod,
      shippingAddress,
      paymentDetails: qrPaymentData,
      amount: product.price,
      commission: calculateCommission(product.price),
      sellerAmount: calculateSellerAmount(product.price),
      receiptFile: qrPaymentData.receiptFile,
      paymentReference: qrPaymentData.paymentDetails.reference
    });

    setQrPaymentOpen(false);
    onClose();
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCardIcon />;
      case 'bank_transfer':
        return <BankIcon />;
      case 'gcash':
      case 'paymaya':
        return <MobileIcon />;
      default:
        return <MoneyIcon />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Complete Purchase
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Secure payment through TechCycle escrow system
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Product Summary */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {product.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Seller: {product.seller?.name || 'Unknown'}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Product Price:</Typography>
                  <Typography variant="body2">${product.price}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Platform Fee (3%):</Typography>
                  <Typography variant="body2" color="error">-${calculateCommission(product.price)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total to Pay:</Typography>
                  <Typography variant="h6" color="primary">${product.price}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">Seller Receives:</Typography>
                  <Typography variant="body2" color="success.main">${calculateSellerAmount(product.price)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Form */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Select Payment Method</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Select Payment Method"
                  onChange={handlePaymentMethodChange}
                >
                  <MenuItem value="credit_card">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCardIcon />
                      Credit Card
                    </Box>
                  </MenuItem>
                  <MenuItem value="debit_card">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCardIcon />
                      Debit Card
                    </Box>
                  </MenuItem>
                  <MenuItem value="bank_transfer">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BankIcon />
                      Bank Transfer
                    </Box>
                  </MenuItem>
                  <MenuItem value="gcash">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MobileIcon />
                      GCash
                    </Box>
                  </MenuItem>
                  <MenuItem value="paymaya">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MobileIcon />
                      PayMaya
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Payment Details */}
            {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Payment Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      value={paymentDetails.cardNumber}
                      onChange={handlePaymentDetailsChange('cardNumber')}
                      placeholder="1234 5678 9012 3456"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      value={paymentDetails.expiryDate}
                      onChange={handlePaymentDetailsChange('expiryDate')}
                      placeholder="MM/YY"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      value={paymentDetails.cvv}
                      onChange={handlePaymentDetailsChange('cvv')}
                      placeholder="123"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Cardholder Name"
                      value={paymentDetails.cardName}
                      onChange={handlePaymentDetailsChange('cardName')}
                      placeholder="John Doe"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Shipping Address */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={shippingAddress.fullName}
                    onChange={handleShippingChange('fullName')}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={shippingAddress.address}
                    onChange={handleShippingChange('address')}
                    multiline
                    rows={2}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={shippingAddress.city}
                    onChange={handleShippingChange('city')}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="State/Province"
                    value={shippingAddress.state}
                    onChange={handleShippingChange('state')}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    value={shippingAddress.zipCode}
                    onChange={handleShippingChange('zipCode')}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={shippingAddress.phone}
                    onChange={handleShippingChange('phone')}
                    required
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Security Notice */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Secure Escrow Payment:</strong> Your payment is held securely by TechCycle until the transaction is verified by our admin team. The seller will receive their payment (minus 3% platform fee) after successful verification.
              </Typography>
            </Alert>

            {/* Availability Notice */}
            <Alert severity="success" sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Product Available:</strong> This product is currently available for purchase. 
                Once you complete payment, it will be reserved for you and unavailable to other buyers.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Processing...' : `Pay $${product.price}`}
        </Button>
      </DialogActions>

      {/* QR Code Payment Dialog */}
      <QRCodePayment
        open={qrPaymentOpen}
        onClose={() => setQrPaymentOpen(false)}
        product={product}
        paymentMethod={paymentMethod}
        amount={product.price}
        onPaymentComplete={handleQRPaymentComplete}
      />
    </Dialog>
  );
};

export default PaymentDialog;
