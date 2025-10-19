import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const AdminTransactions = () => {
  const { user, isAdmin } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock admin transaction data
  const transactions = [
    {
      id: 'TXN-001',
      orderId: 'ORD-001',
      date: '2024-01-15',
      status: 'completed',
      buyer: 'John Doe',
      seller: 'Alice',
      amount: 799,
      platformFee: 23.97,
      sellerEarnings: 775.03,
      paymentMethod: 'GCash',
      deliveryMethod: 'Standard',
      courierService: 'Lalamove'
    },
    {
      id: 'TXN-002',
      orderId: 'ORD-002',
      date: '2024-01-14',
      status: 'pending',
      buyer: 'Jane Smith',
      seller: 'Bob',
      amount: 1099,
      platformFee: 32.97,
      sellerEarnings: 1066.03,
      paymentMethod: 'PayMaya',
      deliveryMethod: 'Express',
      courierService: 'J&T Express'
    },
    {
      id: 'TXN-003',
      orderId: 'ORD-003',
      date: '2024-01-10',
      status: 'completed',
      buyer: 'Mike Johnson',
      seller: 'Carol',
      amount: 279,
      platformFee: 8.37,
      sellerEarnings: 270.63,
      paymentMethod: 'Bank Transfer',
      deliveryMethod: 'Standard',
      courierService: 'Lalamove'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ScheduleIcon />;
      case 'completed': return <CheckIcon />;
      case 'cancelled': return <CartIcon />;
      default: return <CartIcon />;
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesTab = tabValue === 0 || txn.status === (tabValue === 1 ? 'pending' : 'completed');
    const matchesSearch = searchTerm === '' || 
      txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.seller.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalRevenue = transactions
    .filter(txn => txn.status === 'completed')
    .reduce((sum, txn) => sum + txn.platformFee, 0);

  const pendingRevenue = transactions
    .filter(txn => txn.status === 'pending')
    .reduce((sum, txn) => sum + txn.platformFee, 0);

  const totalVolume = transactions
    .filter(txn => txn.status === 'completed')
    .reduce((sum, txn) => sum + txn.amount, 0);

  if (!user || !isAdmin()) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Transaction Management
      </Typography>

      {/* Revenue Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Total Revenue</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                ${totalRevenue.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                From platform fees
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ScheduleIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Pending Revenue</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                ${pendingRevenue.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Awaiting completion
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Total Volume</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                ${totalVolume.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transaction volume
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Fee Rate</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                3%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Platform fee
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search transactions by ID, buyer, or seller..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="All Transactions" />
            <Tab label="Pending" />
            <Tab label="Completed" />
          </Tabs>
        </Box>
      </Box>

      {/* Transactions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Buyer</TableCell>
              <TableCell>Seller</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Platform Fee</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Courier</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {txn.id}
                  </Typography>
                </TableCell>
                <TableCell>{txn.orderId}</TableCell>
                <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                <TableCell>{txn.buyer}</TableCell>
                <TableCell>{txn.seller}</TableCell>
                <TableCell>${txn.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Typography color="success.main" fontWeight="bold">
                    ${txn.platformFee.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(txn.status)}
                    label={txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                    color={getStatusColor(txn.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{txn.paymentMethod}</TableCell>
                <TableCell>{txn.courierService}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredTransactions.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No transactions found
          </Typography>
        </Box>
      )}

      {/* Platform Fee Information */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Platform Fee Structure:</strong> 3% of each transaction is collected as platform fee. 
          This fee is automatically deducted from the total amount before payment is released to sellers.
          Payment is held in escrow until buyers confirm delivery.
        </Typography>
      </Alert>
    </Container>
  );
};

export default AdminTransactions;
