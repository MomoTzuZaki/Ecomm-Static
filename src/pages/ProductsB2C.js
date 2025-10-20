import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  IconButton,
  Badge,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  FilterList as FilterIcon,
  Star as StarIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productAPI, cartAPI } from '../services/api_b2c';
import { useAuth } from '../context/AuthContext';

const ProductsB2C = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, brandFilter, conditionFilter, sortBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts();
      setProducts(response.products.filter(p => p.isActive));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const response = await cartAPI.getCart();
      setCart(response.cart);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Brand filter
    if (brandFilter) {
      filtered = filtered.filter(product => product.brand === brandFilter);
    }

    // Condition filter
    if (conditionFilter) {
      filtered = filtered.filter(product => product.condition === conditionFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
    setPage(1);
  };

  const handleAddToCart = async (productId) => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      await cartAPI.addToCart(productId, 1);
      await loadCart();
      
      // Show success message (you can replace this with a proper notification)
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding product to cart');
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const getUniqueValues = (key) => {
    return [...new Set(products.map(p => p[key]))].filter(Boolean);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getPaginatedProducts = () => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = () => {
    return Math.ceil(filteredProducts.length / itemsPerPage);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading products...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          TechCycle - Second-Hand Devices
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<CartIcon />}
            onClick={() => navigate('/cart')}
            sx={{ position: 'relative' }}
          >
            Cart
            {getCartItemCount() > 0 && (
              <Badge
                badgeContent={getCartItemCount()}
                color="error"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                }}
              />
            )}
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {getUniqueValues('category').map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Brand</InputLabel>
              <Select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                label="Brand"
              >
                <MenuItem value="">All Brands</MenuItem>
                {getUniqueValues('brand').map(brand => (
                  <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Condition</InputLabel>
              <Select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                label="Condition"
              >
                <MenuItem value="">All Conditions</MenuItem>
                {getUniqueValues('condition').map(condition => (
                  <MenuItem key={condition} value={condition}>{condition}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="price-low">Price: Low to High</MenuItem>
                <MenuItem value="price-high">Price: High to Low</MenuItem>
                <MenuItem value="newest">Newest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Results Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredProducts.length} products
      </Typography>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Alert severity="info">
          No products found matching your criteria.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {getPaginatedProducts().map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                      alt={product.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Chip
                      label={product.condition}
                      color={product.condition === 'Like New' ? 'success' : 
                             product.condition === 'Excellent' ? 'primary' : 'default'}
                      size="small"
                      sx={{ position: 'absolute', top: 8, left: 8 }}
                    />
                    {product.originalPrice && (
                      <Chip
                        label={`Save ₱${(product.originalPrice - product.price).toLocaleString()}`}
                        color="error"
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      />
                    )}
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                      {product.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {product.brand} • {product.category}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                      {product.description.length > 100 
                        ? `${product.description.substring(0, 100)}...` 
                        : product.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" color="primary" sx={{ mr: 1 }}>
                        ₱{product.price.toLocaleString()}
                      </Typography>
                      {product.originalPrice && (
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                          ₱{product.originalPrice.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Stock: {product.stock} available
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewProduct(product.id)}
                        sx={{ flexGrow: 1 }}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<CartIcon />}
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.stock === 0}
                        sx={{ flexGrow: 1 }}
                      >
                        Add to Cart
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {getTotalPages() > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={getTotalPages()}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ProductsB2C;
