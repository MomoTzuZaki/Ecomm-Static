import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SellProduct from './pages/SellProduct';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import SellerOrders from './pages/SellerOrders';
import AdminTransactions from './pages/AdminTransactions';
import EditProduct from './pages/EditProduct';
import SellerVerification from './pages/SellerVerification';
import AdminVerification from './pages/AdminVerification';
import Messages from './pages/Messages';
import './App.css';

// Development helper available at ./utils/clearLocalStorage if needed

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB', // Tech Blue
      light: '#3B82F6',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#16A34A', // Eco Green
      light: '#22C55E',
      dark: '#15803D',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC', // Light background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B', // Slate Gray
    },
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B', // Slate Gray
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
    success: {
      main: '#16A34A', // Eco Green
      light: '#22C55E',
      dark: '#15803D',
    },
    warning: {
      main: '#FACC15', // Warm Yellow
      light: '#FDE047',
      dark: '#EAB308',
    },
    info: {
      main: '#2563EB', // Tech Blue
      light: '#3B82F6',
      dark: '#1D4ED8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <NotificationProvider>
            <AuthProvider>
              <ProductProvider>
                <CartProvider>
            <Router>
            <div className="App">
              <Navbar />
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/edit/:id" element={<ProtectedRoute requireAdmin={true}><EditProduct /></ProtectedRoute>} />
              <Route path="/admin/verification" element={<ProtectedRoute requireAdmin={true}><AdminVerification /></ProtectedRoute>} />
              <Route path="/admin/transactions" element={<ProtectedRoute requireAdmin={true}><AdminTransactions /></ProtectedRoute>} />
              <Route path="/sell" element={<ProtectedRoute requireSeller={true}><SellProduct /></ProtectedRoute>} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/seller-orders" element={<ProtectedRoute><SellerOrders /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/verify-seller" element={<ProtectedRoute><SellerVerification /></ProtectedRoute>} />
            </Routes>
            </div>
            </Router>
                </CartProvider>
              </ProductProvider>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
  );
}

export default App;