import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  InputBase,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  AccountCircle,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartAPI } from '../services/api_b2c';
import TechCycleLogo from '../assets/images/TechCycle.png';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '25px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  '&:focus-within': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  transition: 'all 0.3s ease',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(255, 255, 255, 0.7)',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'white',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.95rem',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.6)',
      opacity: 1,
    },
    [theme.breakpoints.up('md')]: {
      width: '25ch',
    },
  },
}));

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const loadCartCount = useCallback(async () => {
    if (user) {
      try {
        const response = await cartAPI.getCart();
        const totalItems = response.cart.reduce((total, item) => total + item.quantity, 0);
        setCartCount(totalItems);
      } catch (error) {
        console.error('Error loading cart count:', error);
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  }, [user]);

  useEffect(() => {
    loadCartCount();
  }, [user, loadCartCount]);

  // Listen for storage changes to update cart count when items are added/removed
  useEffect(() => {
    const handleStorageChange = () => {
      loadCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, loadCartCount]);

  return (
    <AppBar 
      position="static" 
      sx={{ 
        bgcolor: 'black',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Toolbar sx={{ minHeight: '70px' }}>
        <Box
          component="img"
          src={TechCycleLogo}
          alt="Tech Cycle"
          sx={{ 
            display: { xs: 'none', md: 'block' },
            cursor: 'pointer',
            height: '40px',
            width: 'auto',
            objectFit: 'contain',
            '&:hover': {
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s ease'
          }}
          onClick={() => navigate('/')}
        />
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <form onSubmit={handleSearch}>
            <StyledInputBase
              placeholder="Search gadgets..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </Search>

        <Button 
          color="inherit" 
          onClick={() => navigate('/contact')}
          sx={{
            color: 'white',
            fontWeight: 500,
            textTransform: 'none',
            fontSize: '1rem',
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Contact
        </Button>

        <Button 
          color="inherit" 
          onClick={() => navigate('/products')}
          sx={{
            color: 'white',
            fontWeight: 500,
            textTransform: 'none',
            fontSize: '1rem',
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Browse
        </Button>

        {user ? (
          <>
            {/* Cart Icon */}
            <IconButton
              size="large"
              aria-label="shopping cart"
              onClick={() => navigate('/cart')}
              color="inherit"
              sx={{
                color: 'white',
                ml: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {/* Account Icon */}
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{
                color: 'white',
                ml: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                Dashboard
              </MenuItem>
              <MenuItem onClick={() => { navigate('/orders'); handleClose(); }}>
                My Orders
              </MenuItem>
              <MenuItem onClick={() => { navigate('/contact'); handleClose(); }}>
                Contact TechCycle
              </MenuItem>
              {/* Removed seller-related menu items for B2C model */}
              {isAdmin() && (
                <MenuItem onClick={() => { navigate('/admin'); handleClose(); }}>
                  Admin Panel
                </MenuItem>
              )}
              {isAdmin() && (
                <MenuItem onClick={() => { navigate('/admin/transactions'); handleClose(); }}>
                  Transactions
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button 
              color="inherit" 
              onClick={() => navigate('/login')}
              sx={{
                color: 'white',
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '1rem',
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Login
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/register')}
              sx={{
                color: 'white',
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '1rem',
                px: 2,
                ml: 1,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
