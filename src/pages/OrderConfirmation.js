import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { order, paymentReference } = location.state || {};

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          No order information found. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        
        <Typography variant="h4" component="h1" gutterBottom color="success.main">
          Order Confirmed!
        </Typography>
        
        <Typography variant="h6" gutterBottom>
          Order ID: {order.id}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Thank you for your purchase! Your order has been placed and payment is being processed.
        </Typography>

        {paymentReference && (
          <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>Payment Reference:</strong> {paymentReference}
              <br />
              <strong>Payment Method:</strong> {order.paymentMethod?.toUpperCase()}
              <br />
              <strong>Total Amount:</strong> ₱{order.total?.toLocaleString()}
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <PaymentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Payment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ₱{order.total?.toLocaleString()} paid
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <ShippingIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Delivery
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Coordinate with seller
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Timeline
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.items?.length} item(s) ordered
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>What happens next:</strong>
            <br />• Your order will be processed within 1-2 business days
            <br />• We'll prepare your items and arrange shipping
            <br />• You'll receive tracking information via email
            <br />• Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
            <br />• Contact us if you have any questions
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/orders')}
            sx={{ minWidth: 150 }}
          >
            View Orders
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/products')}
            sx={{ minWidth: 150 }}
          >
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderConfirmation;
