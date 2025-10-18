import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Grid,
  Divider,
  Paper,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ShoppingCartCheckout as CheckoutIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // In a real app, this would redirect to checkout/payment
    alert('Checkout functionality would be implemented here!');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Shopping Cart
        </Typography>
        <Paper
          elevation={2}
          sx={{
            p: 6,
            textAlign: 'center',
            mt: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add some products to get started!
          </Typography>
          <Button
            variant="contained"
            onClick={handleContinueShopping}
            startIcon={<ShoppingCartIcon />}
          >
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Shopping Cart ({cartItems.length} items)
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={clearCart}
          startIcon={<DeleteIcon />}
        >
          Clear Cart
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          {cartItems.map((item) => (
            <Card key={item.id} sx={{ mb: 2, position: 'relative' }}>
              <CardContent>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveItem(item.id)}
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8,
                    zIndex: 1
                  }}
                >
                  <DeleteIcon />
                </IconButton>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={item.image || 'https://via.placeholder.com/200x120?text=Product'}
                      alt={item.title}
                      sx={{ objectFit: 'contain', borderRadius: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <Typography variant="h6" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {item.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Condition: {item.condition}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      ${item.price}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Subtotal ({cartItems.length} items)
                </Typography>
                <Typography variant="body2">
                  ${getCartTotal().toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Shipping</Typography>
                <Typography variant="body2">Free</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Tax</Typography>
                <Typography variant="body2">$0.00</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">
                  ${getCartTotal().toFixed(2)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCheckout}
                startIcon={<CheckoutIcon />}
                sx={{ mb: 2 }}
              >
                {user ? 'Proceed to Checkout' : 'Login to Checkout'}
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;
