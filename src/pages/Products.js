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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Pagination,
  CircularProgress,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';

// Using ProductContext for product data

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getAllProducts } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading] = useState(false);
  const { user } = useAuth();
  
  // Get products directly from context
  const products = getAllProducts();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const categories = ['Smartphones', 'Laptops', 'Audio', 'Cameras'];
  const conditions = ['Excellent', 'Good', 'Fair'];

  // Initialize filtered products when products change
  useEffect(() => {
    if (products && products.length > 0) {
      setFilteredProducts(products);
    }
  }, [products]);

  const filterProducts = React.useCallback(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Condition filter
    if (conditionFilter) {
      filtered = filtered.filter(product => product.condition === conditionFilter);
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(product => product.price >= parseInt(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => product.price <= parseInt(priceRange.max));
    }

    // Filter out sold and pending sale products
    filtered = filtered.filter(product =>
      product.status !== 'sold' && product.status !== 'pending_sale'
    );

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, conditionFilter, priceRange, products]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(e.target.value);
    setSearchParams({ search: e.target.value });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setConditionFilter('');
    setPriceRange({ min: '', max: '' });
    setSearchParams({});
  };

  const getPaginatedProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Browse Products
      </Typography>

      {/* Search and Filters */}
      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filter Products
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2.5}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2.5}>
            <FormControl fullWidth>
              <InputLabel>Condition</InputLabel>
              <Select
                value={conditionFilter}
                label="Condition"
                onChange={(e) => setConditionFilter(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                {conditions.map((condition) => (
                  <MenuItem key={condition} value={condition}>
                    {condition}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              label="Min Price"
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              label="Max Price"
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            />
          </Grid>
        </Grid>
        
        {/* Clear Filters Button */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </Box>

        {/* Active Filters */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {searchQuery && (
            <Chip
              label={`Search: ${searchQuery}`}
              onDelete={() => setSearchQuery('')}
              color="primary"
            />
          )}
          {categoryFilter && categoryFilter !== 'All' && (
            <Chip
              label={`Category: ${categoryFilter}`}
              onDelete={() => setCategoryFilter('')}
              color="primary"
            />
          )}
          {conditionFilter && conditionFilter !== 'All' && (
            <Chip
              label={`Condition: ${conditionFilter}`}
              onDelete={() => setConditionFilter('')}
              color="primary"
            />
          )}
        </Box>
      </Box>

      {/* Results Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filteredProducts.length} products found
      </Typography>

      {/* Products Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : products.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No products available. Please check back later.
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
            {getPaginatedProducts().map((product, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                  sx={{
                    width: '100%',
                    maxWidth: '300px',
                    height: '450px',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.images && product.images.length > 0 ? product.images[0] : 'https://picsum.photos/300/200'}
                    alt={product.title}
                    sx={{ 
                      objectFit: 'cover',
                      width: '100%',
                      aspectRatio: '4/3',
                      minHeight: '200px'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://picsum.photos/300/200';
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 1.5, overflow: 'visible' }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {product.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        height: '40px'
                      }}
                    >
                      {product.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" color="primary">
                        ${product.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                        ${product.originalPrice}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={product.condition}
                        size="small"
                        color={product.condition === 'Excellent' ? 'success' : 'default'}
                      />
                      {product.status === 'sold' && (
                        <Chip
                          label="SOLD"
                          size="small"
                          color="error"
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                      {product.status === 'pending_sale' && (
                        <Chip
                          label="BEING ORDERED"
                          size="small"
                          color="warning"
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                    </Box>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                      {product.location} • {product.datePosted}
                    </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Seller: {typeof product.seller === 'object' ? product.seller.name : product.seller}
                          </Typography>
                          {typeof product.seller === 'object' && product.seller.isVerified && (
                            <Chip
                              label="Verified"
                              size="small"
                              color="success"
                              sx={{ height: 16, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, value) => setCurrentPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Products;
