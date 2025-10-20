import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  ArrowBack as BackIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, cartAPI } from '../services/api_b2c';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProductById(id);
      if (response.product) {
        setProduct(response.product);
        setSelectedImage(0);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      await cartAPI.addToCart(product.id, quantity);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding product to cart');
    }
  };

  const handleBuyNow = async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      await cartAPI.addToCart(product.id, quantity);
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding product to cart');
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading product...</Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Product not found</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Products
        </Button>
      </Container>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          Home
        </Link>
        <Link color="inherit" href="/products" onClick={(e) => { e.preventDefault(); navigate('/products'); }}>
          Products
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/products')}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.images?.[selectedImage] || 'https://via.placeholder.com/400x300?text=No+Image'}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
            
            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, p: 2, overflowX: 'auto' }}>
                {product.images.map((image, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: selectedImage === index ? 2 : 1,
                      borderColor: selectedImage === index ? 'primary.main' : 'divider',
                      opacity: selectedImage === index ? 1 : 0.7,
                      '&:hover': {
                        opacity: 1
                      }
                    }}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </Box>
            )}
          </Card>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
            <Chip
              label={product.condition}
              color={product.condition === 'Like New' ? 'success' : 
                     product.condition === 'Excellent' ? 'primary' : 'default'}
              sx={{ mr: 1 }}
            />
            {discountPercentage > 0 && (
              <Chip
                label={`${discountPercentage}% OFF`}
                color="error"
                size="small"
              />
            )}
          </Box>

          <Typography variant="h4" component="h1" gutterBottom>
            {product.name}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {product.brand} • {product.category}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" color="primary" sx={{ mr: 2 }}>
              ₱{product.price.toLocaleString()}
            </Typography>
            {product.originalPrice && (
              <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                ₱{product.originalPrice.toLocaleString()}
              </Typography>
            )}
          </Box>

          <Typography variant="body1" sx={{ mb: 3 }}>
            {product.description}
          </Typography>

          {/* Stock Status */}
          <Box sx={{ mb: 3 }}>
            {product.stock > 0 ? (
              <Typography color="success.main">
                ✓ In Stock ({product.stock} available)
              </Typography>
            ) : (
              <Typography color="error">
                ✗ Out of Stock
              </Typography>
            )}
          </Box>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ mr: 2 }}>Quantity:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <Typography sx={{ mx: 2, minWidth: 40, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <Button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
              </Box>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<CartIcon />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              sx={{ flexGrow: 1 }}
            >
              Add to Cart
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              sx={{ flexGrow: 1 }}
            >
              Buy Now
            </Button>
          </Box>

          {/* Additional Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={toggleFavorite} color={isFavorite ? 'error' : 'default'}>
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <IconButton onClick={handleShare}>
              <ShareIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      {/* Specifications */}
      {product.specifications && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Specifications
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <TableContainer component={Paper} sx={{ maxWidth: 600 }}>
            <Table>
              <TableBody>
                {Object.entries(product.specifications).map(([key, value]) => (
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
        </Box>
      )}

      {/* Additional Info */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Product Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Condition
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {product.condition} - This device has been thoroughly tested and is in excellent working condition.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Warranty
              </Typography>
              <Typography variant="body2" color="text.secondary">
                30-day return policy. 6-month warranty on hardware defects.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Shipping
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Free shipping nationwide. 2-3 business days delivery.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProductDetail;