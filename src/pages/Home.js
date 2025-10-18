import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
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
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isSeller } = useAuth();

  const categories = [
    { 
      name: 'Smartphones', 
      icon: <PhoneAndroid />, 
      color: '#2D3748', 
      bgColor: '#F7FAFC',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop&crop=center',
      description: 'Latest smartphones and accessories'
    },
    { 
      name: 'Laptops', 
      icon: <Laptop />, 
      color: '#2D3748', 
      bgColor: '#F7FAFC',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop&crop=center',
      description: 'High-performance laptops and notebooks'
    },
    { 
      name: 'Audio', 
      icon: <Headphones />, 
      color: '#2D3748', 
      bgColor: '#F7FAFC',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop&crop=center',
      description: 'Premium headphones and speakers'
    },
    { 
      name: 'Cameras', 
      icon: <CameraAlt />, 
      color: '#2D3748', 
      bgColor: '#F7FAFC',
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=200&fit=crop&crop=center',
      description: 'Professional cameras and equipment'
    },
  ];

  // Carousel images for hero section
  const carouselImages = [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=1080&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1920&h=1080&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1920&h=1080&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&h=1080&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1920&h=1080&fit=crop&crop=center',
  ];

  // Carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const features = [
    {
      icon: <TrendingUp />,
      title: 'Best Prices',
      description: 'Find amazing deals on quality second-hand gadgets',
      color: '#2D3748',
      bgColor: '#F7FAFC'
    },
    {
      icon: <Security />,
      title: 'Verified Sellers',
      description: 'All sellers are verified to ensure safe transactions',
      color: '#2D3748',
      bgColor: '#F7FAFC'
    },
    {
      icon: <LocalShipping />,
      title: 'Fast Delivery',
      description: 'Quick and secure delivery to your doorstep',
      color: '#2D3748',
      bgColor: '#F7FAFC'
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          py: 8,
          textAlign: 'center',
          overflow: 'hidden',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Background Carousel */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            backgroundImage: `url(${carouselImages[currentImageIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transition: 'background-image 1s ease-in-out',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%)',
              zIndex: 2,
            },
          }}
        />
        
        {/* Content */}
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 3 }}>
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
                bgcolor: 'rgba(255, 255, 255, 0.95)', 
                color: '#1a1a1a',
                fontWeight: 500,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                '&:hover': { 
                  bgcolor: 'rgba(255, 255, 255, 1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.3s ease'
              }}
              onClick={() => navigate('/products')}
            >
              Browse Products
            </Button>
            {isSeller() && (
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  borderColor: 'rgba(255, 255, 255, 0.8)', 
                  color: 'white',
                  fontWeight: 500,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                  '&:hover': { 
                    borderColor: 'white', 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(255,255,255,0.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
                onClick={() => navigate('/sell')}
              >
                Sell Your Gadgets
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          Shop by Category
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
          Discover amazing deals across different categories
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
          {categories.map((category, index) => (
            <Grid item xs={12} sm={6} md={3} lg={2.4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                    '& .category-image': {
                      transform: 'scale(1.02)',
                    },
                    '& .category-overlay': {
                      opacity: 1,
                    },
                  },
                }}
                onClick={() => navigate('/products')}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={category.image}
                    alt={category.name}
                    className="category-image"
                    sx={{
                      transition: 'transform 0.3s ease-in-out',
                      objectFit: 'cover',
                    }}
                  />
                  <Box
                    className="category-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease-in-out',
                    }}
                  >
                    <Box
                      sx={{
                        color: 'white',
                        fontSize: '3rem',
                        textAlign: 'center',
                      }}
                    >
                      {category.icon}
                    </Box>
                  </Box>
                </Box>
                <CardContent sx={{ 
                  flexGrow: 1, 
                  textAlign: 'center', 
                  py: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  backgroundColor: category.bgColor,
                }}>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                      color: category.color, 
                      fontWeight: 'bold',
                      mb: 1,
                    }}
                  >
                    {category.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {category.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: '#FAFAFA', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
            Why Choose Tech Cycle?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2, justifyContent: 'center' }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    height: '100%',
                    width: '100%',
                    maxWidth: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'white',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
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
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#2D3748', fontWeight: 500 }}>
          Ready to Get Started?
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#718096', fontSize: '1.1rem' }}>
          Join thousands of satisfied customers who have found their perfect gadgets on Tech Cycle.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/register')}
          sx={{
            bgcolor: '#2D3748',
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 500,
            '&:hover': {
              bgcolor: '#1A202C',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(45, 55, 72, 0.3)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Create Account
        </Button>
      </Container>
    </Box>
  );
};

export default Home;
