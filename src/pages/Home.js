import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
} from '@mui/material';
import {
  PhoneAndroid,
  Laptop,
  Headphones,
  CameraAlt,
  TrendingUp,
  Security,
  LocalShipping,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const categories = [
    { name: 'Smartphones', icon: <PhoneAndroid />, color: '#2563EB', bgColor: '#E0F2FE' },
    { name: 'Laptops', icon: <Laptop />, color: '#16A34A', bgColor: '#DCFCE7' },
    { name: 'Audio', icon: <Headphones />, color: '#FACC15', bgColor: '#FEF3C7' },
    { name: 'Cameras', icon: <CameraAlt />, color: '#64748B', bgColor: '#F1F5F9' },
  ];

  const features = [
    {
      icon: <TrendingUp />,
      title: 'Best Prices',
      description: 'Find amazing deals on quality second-hand gadgets',
      color: '#16A34A',
      bgColor: '#DCFCE7'
    },
    {
      icon: <Security />,
      title: 'Verified Sellers',
      description: 'All sellers are verified to ensure safe transactions',
      color: '#2563EB',
      bgColor: '#E0F2FE'
    },
    {
      icon: <LocalShipping />,
      title: 'Fast Delivery',
      description: 'Quick and secure delivery to your doorstep',
      color: '#FACC15',
      bgColor: '#FEF3C7'
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Tech Cycle
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
            Your Premier Destination for Second-Hand Gadgets
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem' }}>
            Buy and sell quality pre-owned tech devices at unbeatable prices. 
            From smartphones to laptops, find exactly what you need.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{ 
                bgcolor: 'white', 
                color: '#2563EB',
                '&:hover': { bgcolor: '#F8FAFC' }
              }}
              onClick={() => navigate('/products')}
            >
              Browse Products
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
              onClick={() => navigate('/sell')}
            >
              Sell Your Gadgets
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          Shop by Category
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2, justifyContent: 'center' }}>
          {categories.map((category, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  backgroundColor: category.bgColor,
                  border: `2px solid ${category.color}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    backgroundColor: category.color,
                    '& .category-icon': {
                      color: 'white',
                    },
                    '& .category-text': {
                      color: 'white',
                    },
                  },
                }}
                onClick={() => navigate('/products')}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                  <Box
                    className="category-icon"
                    sx={{
                      color: category.color,
                      fontSize: '3rem',
                      mb: 2,
                      transition: 'color 0.2s',
                    }}
                  >
                    {category.icon}
                  </Box>
                  <Typography className="category-text" variant="h6" component="h3" sx={{ color: category.color, transition: 'color 0.2s' }}>
                    {category.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: '#F8FAFC', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
            Why Choose Tech Cycle?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2, justifyContent: 'center' }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    width: '100%',
                    maxWidth: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: feature.bgColor,
                    border: `2px solid ${feature.color}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: feature.color,
                      fontSize: '3rem',
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ color: feature.color }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to Get Started?
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Join thousands of satisfied customers who have found their perfect gadgets on Tech Cycle.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/register')}
        >
          Create Account
        </Button>
      </Container>
    </Box>
  );
};

export default Home;
