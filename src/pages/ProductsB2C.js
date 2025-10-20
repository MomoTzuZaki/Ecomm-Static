import React, { useState, useEffect, useCallback } from 'react';
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
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productAPI, cartAPI } from '../services/api_b2c';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

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
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, brandFilter, conditionFilter, sortBy, filterProducts]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts();
      const products = response.products || [];
      
      // If no products exist, automatically initialize sample data
      if (products.length === 0) {
        const { initializeSampleData } = await import('../services/api_b2c');
        initializeSampleData();
        
        // Reload products after initialization
        const newResponse = await productAPI.getAllProducts();
        setProducts(newResponse.products.filter(p => p.isActive));
      } else {
        setProducts(products.filter(p => p.isActive));
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };


  const filterProducts = useCallback(() => {
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
  }, [products, searchTerm, categoryFilter, brandFilter, conditionFilter, sortBy]);

  const handleAddToCart = async (productId) => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      await cartAPI.addToCart(productId, 1);
      
      // Trigger storage event to update cart count in navbar
      window.dispatchEvent(new Event('storage'));
      
      // Show success message
      setToast({ open: true, message: 'Product added to cart successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToast({ open: true, message: 'Error adding product to cart. Please try again.', severity: 'error' });
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const getUniqueValues = (key) => {
    return [...new Set(products.map(p => p[key]))].filter(Boolean);
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
        </Box>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <FilterIcon />
            Search & Filter Products
          </Typography>
          
          {/* Search Bar - Full Width */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search products, brands, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
          
          {/* Filter Controls */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel shrink={false} sx={{ 
                  color: 'text.secondary',
                  '&.Mui-focused': { color: 'primary.main' }
                }}>
                  Category
                </InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  displayEmpty
                  renderValue={(value) => value ? value : 'All Categories'}
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiSelect-select': {
                      color: categoryFilter ? 'text.primary' : 'text.secondary'
                    }
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {getUniqueValues('category').map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel shrink={false} sx={{ 
                  color: 'text.secondary',
                  '&.Mui-focused': { color: 'primary.main' }
                }}>
                  Brand
                </InputLabel>
                <Select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  displayEmpty
                  renderValue={(value) => value ? value : 'All Brands'}
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiSelect-select': {
                      color: brandFilter ? 'text.primary' : 'text.secondary'
                    }
                  }}
                >
                  <MenuItem value="">All Brands</MenuItem>
                  {getUniqueValues('brand').map(brand => (
                    <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel shrink={false} sx={{ 
                  color: 'text.secondary',
                  '&.Mui-focused': { color: 'primary.main' }
                }}>
                  Condition
                </InputLabel>
                <Select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  displayEmpty
                  renderValue={(value) => value ? value : 'All Conditions'}
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiSelect-select': {
                      color: conditionFilter ? 'text.primary' : 'text.secondary'
                    }
                  }}
                >
                  <MenuItem value="">All Conditions</MenuItem>
                  {getUniqueValues('condition').map(condition => (
                    <MenuItem key={condition} value={condition}>{condition}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel shrink={false} sx={{ 
                  color: 'text.secondary',
                  '&.Mui-focused': { color: 'primary.main' }
                }}>
                  Sort By
                </InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  displayEmpty
                  renderValue={(value) => {
                    const options = {
                      'name': 'Name (A-Z)',
                      'price-low': 'Price: Low to High',
                      'price-high': 'Price: High to Low',
                      'newest': 'Newest First'
                    };
                    return options[value] || 'Name (A-Z)';
                  }}
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiSelect-select': {
                      color: 'text.primary'
                    }
                  }}
                >
                  <MenuItem value="name">Name (A-Z)</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="newest">Newest First</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {/* Clear Filters Button */}
          {(searchTerm || categoryFilter || brandFilter || conditionFilter) && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setBrandFilter('');
                  setConditionFilter('');
                }}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Clear All Filters
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

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
          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            {getPaginatedProducts().map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id} sx={{ display: 'flex' }}>
                <Card sx={{ 
                  width: '100%',
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column'
                }}>
                  <Box sx={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                      alt={product.name}
                      sx={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                    <Chip
                      label={product.condition}
                      color={product.condition === 'Like New' ? 'success' : 
                             product.condition === 'Excellent' ? 'primary' : 'default'}
                      size="small"
                      sx={{ position: 'absolute', top: 8, left: 8 }}
                    />
                    {/* Removed discount chip for second-hand store */}
                  </Box>
                  
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: '16px',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom sx={{ 
                        minHeight: '48px', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden',
                        lineHeight: '1.2'
                      }}>
                        {product.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: '20px' }}>
                        {product.brand} • {product.category}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 2, minHeight: '60px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.description.length > 100 
                          ? `${product.description.substring(0, 100)}...` 
                          : product.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, minHeight: '32px' }}>
                        <Typography variant="h6" color="primary" sx={{ mr: 1 }}>
                          ₱{product.price.toLocaleString()}
                        </Typography>
                        {product.originalPrice && (
                          <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            ₱{product.originalPrice.toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '20px' }}>
                        Second-hand device
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1,
                      marginTop: 'auto'
                    }}>
                      <Button
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewProduct(product.id)}
                        sx={{ flexGrow: 1 }}
                        size="small"
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<CartIcon />}
                        onClick={() => handleAddToCart(product.id)}
                        sx={{ flexGrow: 1 }}
                        size="small"
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
      
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Container>
  );
};

export default ProductsB2C;
