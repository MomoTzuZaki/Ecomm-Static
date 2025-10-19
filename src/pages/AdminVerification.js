import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  Paper,
  Divider,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { verificationAPI } from '../services/api';

const AdminVerification = () => {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      const response = await verificationAPI.getAllVerifications();
      setVerifications(response.verifications || []);
    } catch (error) {
      console.error('Error loading verifications:', error);
      // Set empty array on error to prevent crashes
      setVerifications([]);
    }
  };

  const handleViewVerification = (verification) => {
    setSelectedVerification(verification);
    setViewDialogOpen(true);
  };

  const handleApprove = (verification) => {
    setSelectedVerification(verification);
    setActionType('approve');
    setActionDialogOpen(true);
  };

  const handleReject = (verification) => {
    setSelectedVerification(verification);
    setActionType('reject');
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedVerification) return;

    try {
      await verificationAPI.updateVerificationStatus(
        selectedVerification.id,
        actionType === 'approve' ? 'approved' : 'rejected',
        actionType === 'reject' ? rejectionReason : approvalNotes
      );

      // Reload verifications to get updated data
      await loadVerifications();

      setActionDialogOpen(false);
      setSelectedVerification(null);
      setRejectionReason('');
      setApprovalNotes('');
    } catch (error) {
      console.error('Error updating verification status:', error);
      alert(error.message || 'Failed to update verification status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const filteredVerifications = verifications.filter(verification => {
    if (tabValue === 0) return verification.status === 'pending';
    if (tabValue === 1) return verification.status === 'approved';
    if (tabValue === 2) return verification.status === 'rejected';
    return true;
  });

  const renderVerificationCard = (verification) => (
    <Card key={verification.id} sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            {verification.idImage && (
              <CardMedia
                component="img"
                height="120"
                image={verification.idImage}
                alt="ID Photo"
                sx={{ objectFit: 'cover', borderRadius: 1 }}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {verification.user ? `${verification.user.firstName} ${verification.user.lastName}` : 'Unknown User'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PersonIcon fontSize="small" />
              <Typography variant="body2">{verification.user?.email || 'No email'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <HomeIcon fontSize="small" />
              <Typography variant="body2">{verification.address}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <SecurityIcon fontSize="small" />
              <Typography variant="body2">
                {verification.validIdType}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Submitted: {new Date(verification.createdAt).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Chip
                label={verification.status.toUpperCase()}
                color={getStatusColor(verification.status)}
                size="small"
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<ViewIcon />}
                onClick={() => handleViewVerification(verification)}
              >
                View Details
              </Button>
              {verification.status === 'pending' && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<ApproveIcon />}
                    onClick={() => handleApprove(verification)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<RejectIcon />}
                    onClick={() => handleReject(verification)}
                  >
                    Reject
                  </Button>
                </>
              )}
              {verification.status === 'approved' && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<RejectIcon />}
                  onClick={() => handleReject(verification)}
                >
                  Reject
                </Button>
              )}
              {verification.status === 'rejected' && (
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  startIcon={<ApproveIcon />}
                  onClick={() => handleApprove(verification)}
                >
                  Approve
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Seller Verification Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Review and approve seller verification requests to maintain platform quality and trust.
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={`Pending (${verifications.filter(v => v.status === 'pending').length})`} />
          <Tab label={`Approved (${verifications.filter(v => v.status === 'approved').length})`} />
          <Tab label={`Rejected (${verifications.filter(v => v.status === 'rejected').length})`} />
        </Tabs>
      </Paper>

      <Box>
        {filteredVerifications.length === 0 ? (
          <Alert severity="info">
            No verification requests found for this category.
          </Alert>
        ) : (
          filteredVerifications.map(renderVerificationCard)
        )}
      </Box>

      {/* View Verification Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Verification Details</DialogTitle>
        <DialogContent>
          {selectedVerification && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Name:</strong> {selectedVerification.user ? `${selectedVerification.user.firstName} ${selectedVerification.user.lastName}` : 'Unknown User'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Email:</strong> {selectedVerification.user?.email || 'No email'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Address:</strong> {selectedVerification.address}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    ID Information
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>ID Type:</strong> {selectedVerification.validIdType}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Status:</strong> {selectedVerification.status}
                  </Typography>
                  {selectedVerification.reviewedAt && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Reviewed:</strong> {new Date(selectedVerification.reviewedAt).toLocaleDateString()}
                    </Typography>
                  )}
                  {selectedVerification.reviewer && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Reviewed By:</strong> {selectedVerification.reviewer.username}
                    </Typography>
                  )}
                  {selectedVerification.adminNotes && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Admin Notes:</strong> {selectedVerification.adminNotes}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Verification Photos
                  </Typography>
                  {selectedVerification.idImage && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        ID Photo:
                      </Typography>
                      <CardMedia
                        component="img"
                        height="200"
                        image={selectedVerification.idImage}
                        alt="ID Photo"
                        sx={{ objectFit: 'cover', borderRadius: 1 }}
                      />
                    </Box>
                  )}
                  {selectedVerification.selfieImage && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Selfie with ID:
                      </Typography>
                      <CardMedia
                        component="img"
                        height="200"
                        image={selectedVerification.selfieImage}
                        alt="Selfie with ID"
                        sx={{ objectFit: 'cover', borderRadius: 1 }}
                      />
                    </Box>
                  )}
                  {selectedVerification.proofOfOwnership && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Proof of Ownership:
                      </Typography>
                      <CardMedia
                        component="img"
                        height="200"
                        image={selectedVerification.proofOfOwnership}
                        alt="Proof of Ownership"
                        sx={{ objectFit: 'cover', borderRadius: 1 }}
                      />
                    </Box>
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

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Verification' : 'Reject Verification'}
        </DialogTitle>
        <DialogContent>
          {actionType === 'approve' ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Are you sure you want to approve this seller verification? 
                This will grant the user seller privileges and a verified badge.
              </Alert>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Approval Notes (Optional)"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                sx={{ mt: 2 }}
              />
            </Box>
          ) : (
            <Box>
              <Alert severity="error" sx={{ mb: 2 }}>
                Are you sure you want to reject this seller verification?
              </Alert>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Rejection Reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                sx={{ mt: 2 }}
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            onClick={confirmAction}
            disabled={actionType === 'reject' && !rejectionReason.trim()}
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminVerification;


