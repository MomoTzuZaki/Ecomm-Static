import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api';

const AdminTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getPendingVerifications();
      setTransactions(response.transactions || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setViewDialogOpen(true);
  };

  const handleVerifyTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setAdminNotes('');
    setTrackingNumber('');
    setVerifyDialogOpen(true);
  };

  const confirmVerification = async () => {
    if (!selectedTransaction) return;

    try {
      await transactionAPI.verifyTransaction(
        selectedTransaction.id,
        adminNotes,
        trackingNumber
      );
      
      await loadTransactions();
      setVerifyDialogOpen(false);
      setSelectedTransaction(null);
      setAdminNotes('');
      setTrackingNumber('');
      
      alert('Transaction verified successfully!');
    } catch (error) {
      console.error('Error verifying transaction:', error);
      alert('Failed to verify transaction. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_payment':
        return 'warning';
      case 'paid':
        return 'info';
      case 'admin_verification':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Typography variant="h6">Loading transactions...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Transaction Management
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Review and verify pending transactions. TechCycle holds payments in escrow until verification is complete.
      </Typography>

      {transactions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No pending transactions to verify
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All transactions have been processed
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Buyer</TableCell>
                <TableCell>Seller</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Commission</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {transaction.id.substring(0, 8)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {transaction.buyer?.firstName} {transaction.buyer?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {transaction.buyer?.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {transaction.seller?.firstName} {transaction.seller?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {transaction.seller?.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200 }}>
                      {transaction.product?.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ${transaction.amount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="error">
                      -${transaction.commission}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(transaction.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {formatDate(transaction.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewTransaction(transaction)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Verify Transaction">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleVerifyTransaction(transaction)}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Transaction Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Transaction Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Transaction ID:</strong> {selectedTransaction.id}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Status:</strong> 
                      <Chip
                        label={selectedTransaction.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(selectedTransaction.status)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Amount:</strong> ${selectedTransaction.amount}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Commission (3%):</strong> ${selectedTransaction.commission}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Seller Receives:</strong> ${selectedTransaction.sellerAmount}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Created:</strong> {formatDate(selectedTransaction.createdAt)}
                    </Typography>
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    Buyer Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Name:</strong> {selectedTransaction.buyer?.firstName} {selectedTransaction.buyer?.lastName}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Email:</strong> {selectedTransaction.buyer?.email}
                    </Typography>
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    Seller Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Name:</strong> {selectedTransaction.seller?.firstName} {selectedTransaction.seller?.lastName}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Email:</strong> {selectedTransaction.seller?.email}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Product Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Product:</strong> {selectedTransaction.product?.title}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Price:</strong> ${selectedTransaction.product?.price}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Category:</strong> {selectedTransaction.product?.category}
                    </Typography>
                  </Box>

                  {selectedTransaction.shippingAddress && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Shipping Address
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Name:</strong> {selectedTransaction.shippingAddress.fullName}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Address:</strong> {selectedTransaction.shippingAddress.address}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>City:</strong> {selectedTransaction.shippingAddress.city}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>State:</strong> {selectedTransaction.shippingAddress.state}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>ZIP:</strong> {selectedTransaction.shippingAddress.zipCode}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Phone:</strong> {selectedTransaction.shippingAddress.phone}
                        </Typography>
                      </Box>
                    </>
                  )}

                  {selectedTransaction.payments && selectedTransaction.payments.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Payment Information
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Method:</strong> {selectedTransaction.payments[0].paymentMethod}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Reference:</strong> {selectedTransaction.payments[0].paymentReference}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Status:</strong> {selectedTransaction.payments[0].status}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Verify Transaction Dialog */}
      <Dialog
        open={verifyDialogOpen}
        onClose={() => setVerifyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="success" />
            Verify Transaction
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Verify this transaction to release payment to the seller. TechCycle will keep the 3% commission.
              </Alert>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Transaction:</strong> {selectedTransaction.id.substring(0, 8)}...
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Amount:</strong> ${selectedTransaction.amount}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Seller Receives:</strong> ${selectedTransaction.sellerAmount}
                </Typography>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Admin Notes (Optional)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this verification..."
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Tracking Number (Optional)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number if available..."
                InputProps={{
                  startAdornment: <ShippingIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={confirmVerification}
            startIcon={<CheckCircleIcon />}
          >
            Verify & Complete Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminTransactions;