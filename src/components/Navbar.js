import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
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
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
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
  const { user, logout, isAdmin, isSeller } = useAuth();
  const { getCartItemCount } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

        <IconButton
          color="inherit"
          onClick={() => navigate('/cart')}
          sx={{ 
            ml: 2,
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <Badge 
            badgeContent={getCartItemCount()} 
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: 'white',
                color: 'black',
                fontWeight: 600,
                fontSize: '0.75rem'
              }
            }}
          >
            <ShoppingCartIcon />
          </Badge>
        </IconButton>

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
            {isSeller() && (
              <Button 
                color="inherit" 
                onClick={() => navigate('/sell')}
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
                Sell
              </Button>
            )}
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
              {user.role === 'seller' && (
                <MenuItem onClick={() => { navigate('/seller-orders'); handleClose(); }}>
                  Seller Orders
                </MenuItem>
              )}
              {user.role === 'user' && (
                <MenuItem onClick={() => { navigate('/verify-seller'); handleClose(); }}>
                  Become a Seller
                </MenuItem>
              )}
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
