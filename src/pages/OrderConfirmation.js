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
  const { orderId, total, items } = location.state || {};

  if (!orderId) {
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
          Order ID: {orderId}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Thank you for your purchase! Your order has been placed and payment is being processed.
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <PaymentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Payment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${total?.toFixed(2)} held in escrow
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
                  {items} item(s) ordered
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>What happens next:</strong>
            <br />• Seller will contact you to arrange delivery
            <br />• Use your preferred courier service (Lalamove, J&T Express, etc.)
            <br />• Confirm delivery when you receive the items
            <br />• Payment will be released to the seller
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
