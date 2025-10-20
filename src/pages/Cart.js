import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  IconButton,
  Grid,
  Divider,
  TextField,
  Paper,
  Alert,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api_b2c';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingFee, setShippingFee] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCart();
  }, [user]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCart(response.cart);
      
      // Set default shipping address
      if (user && !shippingAddress) {
        setShippingAddress(`${user.firstName} ${user.lastName}\n${user.email}`);
      }
      
      // Calculate shipping fee (free for orders over ₱5000)
      const subtotal = calculateSubtotal(response.cart);
      setShippingFee(subtotal >= 5000 ? 0 : 150);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = (cartItems) => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal(cart) + shippingFee;
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    try {
      await cartAPI.updateCartItem(cartItemId, newQuantity);
      await loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Error updating quantity');
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await cartAPI.removeFromCart(cartItemId);
      await loadCart();
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Error removing item');
    }
  };

  const handleCheckout = () => {
    if (!shippingAddress.trim()) {
      alert('Please provide a shipping address');
      return;
    }

    // Store shipping info and proceed to checkout
    const checkoutData = {
      items: cart,
      subtotal: calculateSubtotal(cart),
      shippingFee,
      total: calculateTotal(),
      shippingAddress
    };

    navigate('/checkout', { state: { checkoutData } });
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading cart...</Typography>
      </Container>
    );
  }

  if (cart.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            Home
          </Link>
          <Link color="inherit" href="/products" onClick={(e) => { e.preventDefault(); navigate('/products'); }}>
            Products
          </Link>
          <Typography color="text.primary">Shopping Cart</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <CartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Looks like you haven't added any items to your cart yet.
          </Typography>
          <Button
            variant="contained"
            onClick={handleContinueShopping}
            startIcon={<BackIcon />}
          >
            Continue Shopping
          </Button>
        </Paper>
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
        <Typography color="text.primary">Shopping Cart</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
      </Typography>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              component="img"
                              src={item.product.image || 'https://via.placeholder.com/80x80?text=No+Image'}
                              alt={item.product.name}
                              sx={{
                                width: 80,
                                height: 80,
                                objectFit: 'cover',
                                borderRadius: 1,
                                mr: 2
                              }}
                            />
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {item.product.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Stock: {item.product.stock} available
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography sx={{ mx: 2, minWidth: 30, textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1">
                            ₱{item.product.price.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle1" fontWeight="bold">
                            ₱{(item.product.price * item.quantity).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Continue Shopping */}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </Button>
          </Box>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal ({cart.length} items):</Typography>
                <Typography>₱{calculateSubtotal(cart).toLocaleString()}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping:</Typography>
                <Typography color={shippingFee === 0 ? 'success.main' : 'text.primary'}>
                  {shippingFee === 0 ? 'FREE' : `₱${shippingFee.toLocaleString()}`}
                </Typography>
              </Box>

              {calculateSubtotal(cart) < 5000 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Add ₱{(5000 - calculateSubtotal(cart)).toLocaleString()} more for free shipping!
                </Alert>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  ₱{calculateTotal().toLocaleString()}
                </Typography>
              </Box>

              {/* Shipping Address */}
              <Typography variant="subtitle2" gutterBottom>
                Shipping Address
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your complete shipping address..."
                sx={{ mb: 3 }}
              />

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleCheckout}
                disabled={cart.length === 0 || !shippingAddress.trim()}
              >
                Proceed to Checkout
              </Button>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                Secure checkout with multiple payment options
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;