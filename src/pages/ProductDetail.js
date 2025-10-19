import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import {
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  LocalShipping as ShippingIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import PaymentDialog from '../components/PaymentDialog';
import { transactionAPI } from '../services/api';

// Mock data - replace with actual API calls
const mockProduct = {
  id: 1,
  title: 'iPhone 13 Pro',
  description: 'Excellent condition iPhone 13 Pro with 128GB storage. This device has been well-maintained and comes with original box and charger. No scratches or dents, battery health at 95%. Perfect for anyone looking for a premium smartphone experience.',
  price: 899,
  originalPrice: 999,
  category: 'Smartphones',
  condition: 'Excellent',
  brand: 'Apple',
  model: 'iPhone 13 Pro',
  storage: '128GB',
  color: 'Graphite',
  screenSize: '6.1 inches',
  operatingSystem: 'iOS 15',
  batteryHealth: '95%',
  network: '5G',
  camera: 'Triple 12MP',
  material: 'Ceramic Shield',
  dimensions: '146.7 x 71.5 x 7.65 mm',
  weight: '203g',
  warranty: 'No warranty (used)',
  accessories: 'Original box, charger, cable',
  images: [
    'https://via.placeholder.com/600x400?text=iPhone+13+Pro+Front',
    'https://via.placeholder.com/600x400?text=iPhone+13+Pro+Back',
    'https://via.placeholder.com/600x400?text=iPhone+13+Pro+Side',
    'https://via.placeholder.com/600x400?text=iPhone+13+Pro+Box',
  ],
  seller: {
    name: 'John Doe',
    email: 'john@example.com',
    rating: 4.8,
    totalSales: 23,
    joinDate: '2023-06-15',
    responseRate: '98%',
    responseTime: 'Within 1 hour',
  },
  location: 'New York, NY',
  datePosted: '2024-01-15',
  views: 45,
  isFavorite: false,
  specifications: {
    'Display': '6.1-inch Super Retina XDR display',
    'Chip': 'A15 Bionic chip',
    'Camera': 'Pro camera system with 12MP Ultra Wide, Wide, and Telephoto cameras',
    'Video': 'Cinematic mode, ProRes video recording',
    'Battery': 'Up to 22 hours video playback',
    'Storage': '128GB',
    'Connectivity': '5G, Wi-Fi 6, Bluetooth 5.0',
    'Security': 'Face ID',
    'Water Resistance': 'IP68 rating',
    'Operating System': 'iOS 15 (upgradeable)',
  },
  highlights: [
    'Excellent condition with minimal wear',
    'Battery health at 95%',
    'All original accessories included',
    'No scratches or dents',
    'Unlocked for all carriers',
    'Recent software update',
  ],
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getProductById, getProductByIdSync } = useProducts();
  const [product, setProduct] = useState(() => getProductByIdSync(id) || mockProduct);
  const [selectedImage, setSelectedImage] = useState(0);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [userHasOrdered, setUserHasOrdered] = useState(false);

  // Update product when context data changes
  useEffect(() => {
    const load = async () => {
      const initial = getProductByIdSync(id);
      if (initial) {
        setProduct(initial);
        return;
      }
      try {
        const fetched = await getProductById(id);
        if (fetched) setProduct(fetched);
      } catch (_) {
        // keep mock
      }
    };
    load();
  }, [id, getProductById, getProductByIdSync]);

  // Check if user has already ordered this product
  useEffect(() => {
    const checkUserOrder = async () => {
      if (!user) {
        setUserHasOrdered(false);
        return;
      }

      try {
        const response = await transactionAPI.getMyTransactions('buyer');
        const userTransactions = response.transactions || [];
        const existingOrder = userTransactions.find(t => 
          t.productId === product.id && 
          ['pending_payment', 'paid', 'admin_verification', 'completed'].includes(t.status)
        );
        setUserHasOrdered(!!existingOrder);
      } catch (error) {
        console.error('Error checking user orders:', error);
        setUserHasOrdered(false);
      }
    };

    checkUserOrder();
  }, [user, product.id]);

  const handleContactSeller = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setContactDialogOpen(true);
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if product is available for purchase
    if (product.status === 'sold') {
      alert('This product has already been sold.');
      return;
    }
    
    if (product.status === 'pending_sale') {
      alert('This product is already being ordered by another buyer. Please check back later or browse other products.');
      return;
    }
    
    // Check if user has already ordered this product
    try {
      const response = await transactionAPI.getMyTransactions('buyer');
      const userTransactions = response.transactions || [];
      const existingOrder = userTransactions.find(t => 
        t.productId === product.id && 
        ['pending_payment', 'paid', 'admin_verification', 'completed'].includes(t.status)
      );
      
      if (existingOrder) {
        alert('You have already placed an order for this product. You can only order each item once. Check your orders to see the status.');
        return;
      }
    } catch (error) {
      console.error('Error checking existing orders:', error);
      // Continue with purchase if we can't check orders
    }
    
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Create transaction
      const transactionResponse = await transactionAPI.createTransaction(
        product.id,
        paymentData.shippingAddress,
        paymentData.paymentMethod
      );

      // Process payment
      await transactionAPI.processPayment(
        transactionResponse.transaction.id,
        paymentData.paymentMethod,
        `PAY-${Date.now()}`, // Mock payment reference
        paymentData.paymentDetails
      );

      // Show success message and navigate
      alert('Payment successful! Your transaction is now pending admin verification.');
      navigate('/orders');
    } catch (error) {
      console.error('Payment processing error:', error);
      console.error('Error message:', error.message);
      alert(error.message || 'Payment failed. Please try again.');
    }
  };

  const handleSendMessage = () => {
    // Simulate sending message
    console.log('Message sent:', message);
    setContactDialogOpen(false);
    setMessage('');
    
    // Navigate to messages page after sending
    navigate('/messages');
    
    // Show success notification (you can implement a toast notification here)
    alert('Message sent! You can view your conversation in the Messages section.');
  };

  const handleToggleFavorite = () => {
    setProduct(prev => ({
      ...prev,
      isFavorite: !prev.isFavorite
    }));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show success notification
    }
  };


  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Excellent':
        return 'success';
      case 'Good':
        return 'info';
      case 'Fair':
        return 'warning';
      case 'Poor':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Layout Version: MacBook Format - Updated */}
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={(product.images && product.images.length > 0 && product.images[selectedImage]) || 'https://picsum.photos/600/400'}
              alt={product.title}
              sx={{ objectFit: 'contain' }}
              onError={(e) => {
                e.target.src = 'https://picsum.photos/600/400';
              }}
            />
            {product.images && product.images.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, p: 2, overflowX: 'auto' }}>
                {product.images.map((image, index) => (
                  <CardMedia
                    key={index}
                    component="img"
                    height="80"
                    image={image}
                    alt={`${product.title} ${index + 1}`}
                    sx={{
                      width: 80,
                      cursor: 'pointer',
                      border: selectedImage === index ? 2 : 1,
                      borderColor: selectedImage === index ? 'primary.main' : 'grey.300',
                      borderRadius: 1,
                    }}
                    onClick={() => setSelectedImage(index)}
                    onError={(e) => {
                      e.target.src = 'https://picsum.photos/80/80';
                    }}
                  />
                ))}
              </Box>
            )}
          </Card>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h4" component="h1" color="primary">
              {product.title}
            </Typography>
            <Box>
              <IconButton onClick={handleToggleFavorite} color="error">
                {product.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <IconButton onClick={handleShare}>
                <ShareIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h4" color="primary">
              ${product.price}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              ${product.originalPrice}
            </Typography>
            <Chip
              label={product.condition}
              color={getConditionColor(product.condition)}
              size="small"
            />
          </Box>

          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            {product.description}
          </Typography>

          {/* Key Features */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Key Features
            </Typography>
            <List dense>
              {(product.highlights || []).map((highlight, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                  <ListItemText primary={highlight} />
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Quick Specs */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Specifications
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Brand:</Typography>
                  <Typography variant="body2">{product.brand}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Storage:</Typography>
                  <Typography variant="body2">{product.storage}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Color:</Typography>
                  <Typography variant="body2">{product.color}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Screen:</Typography>
                  <Typography variant="body2">{product.screenSize}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Seller Info */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Seller Information
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <PersonIcon />
                  <Box>
                    <Typography variant="subtitle1">{product.seller?.name || 'Seller'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ⭐ {product.seller?.rating || 'N/A'} ({product.seller?.totalSales || 0} sales)
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationIcon fontSize="small" />
                  <Typography variant="body2">{product.location || 'Unknown location'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon fontSize="small" />
                  <Typography variant="body2">
                    Member since {product.seller?.joinDate ? new Date(product.seller.joinDate).getFullYear() : '—'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon fontSize="small" />
                  <Typography variant="body2">
                    Response Rate: {product.seller?.responseRate || '—'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                {product.status === 'sold' ? (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled
                    sx={{
                      bgcolor: 'grey.400',
                      color: 'white'
                    }}
                  >
                    SOLD
                  </Button>
                ) : product.status === 'pending_sale' ? (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled
                    sx={{
                      bgcolor: 'warning.main',
                      color: 'white'
                    }}
                  >
                    BEING ORDERED
                  </Button>
                ) : userHasOrdered ? (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled
                    sx={{
                      bgcolor: 'info.main',
                      color: 'white'
                    }}
                  >
                    YOU ALREADY ORDERED THIS
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleBuyNow}
                    sx={{
                      bgcolor: 'success.main',
                      '&:hover': {
                        bgcolor: 'success.dark',
                      }
                    }}
                  >
                    Buy Now - ${product.price}
                  </Button>
                )}
                
                {userHasOrdered && (
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'info.light', 
                    borderRadius: 1, 
                    textAlign: 'center',
                    mb: 1
                  }}>
                    <Typography variant="body2" color="info.dark" sx={{ mb: 1 }}>
                      You have already placed an order for this product.
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate('/orders')}
                      sx={{
                        bgcolor: 'info.main',
                        '&:hover': {
                          bgcolor: 'info.dark',
                        }
                      }}
                    >
                      View My Orders
                    </Button>
                  </Box>
                )}
                
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={handleContactSeller}
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      bgcolor: 'primary.light',
                    }
                  }}
                >
                  Contact Seller
                </Button>
                <Button
                  variant="text"
                  size="large"
                  fullWidth
                  onClick={() => navigate('/products')}
                >
                  Back to Browse
                </Button>
              </Box>
        </Grid>
      </Grid>

      {/* Detailed Specifications Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Product Specifications & Details
        </Typography>
        
        <Grid container spacing={3}>
          {/* Product Specifications */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Technical Specifications
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {Object.entries(product.specifications || {}).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            {key}
                          </TableCell>
                          <TableCell>{value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Product Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Product Information
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                          Category
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                          Condition
                        </TableCell>
                        <TableCell>{product.condition}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                          Dimensions
                        </TableCell>
                        <TableCell>{product.dimensions}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                          Weight
                        </TableCell>
                        <TableCell>{product.weight}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                          Warranty
                        </TableCell>
                        <TableCell>{product.warranty}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                          Accessories
                        </TableCell>
                        <TableCell>{product.accessories}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                          Date Posted
                        </TableCell>
                        <TableCell>{product.datePosted}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                          Views
                        </TableCell>
                        <TableCell>{product.views}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Marketplace Info */}
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                <ShippingIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Direct Shipping
                </Typography>
                <Typography variant="body2">
                  Seller arranges shipping via Lalamove, J&T Express, etc.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
                <SecurityIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Secure Communication
                </Typography>
                <Typography variant="body2">
                  Contact seller directly for payment and delivery
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Verified Sellers
                </Typography>
                <Typography variant="body2">
                  All sellers are verified for your safety
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Contact Seller Dialog */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Contact {product.seller?.name || 'Seller'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send a message to the seller about "{product.title}"
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            💡 <strong>Tip:</strong> Ask about availability, shipping options, payment methods, and any questions you have about the product.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Hi! I'm interested in this product. Could you tell me more about the condition, shipping options, and payment methods? Also, is it still available?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSendMessage}
            disabled={!message.trim()}
          >
            Send Message
          </Button>
          </DialogActions>
        </Dialog>

        {/* Payment Dialog */}
        <PaymentDialog
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          product={product}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </Container>
    );
  };

  export default ProductDetail;
