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
  Schedule as PendingIcon,
  Refresh as RefreshIcon,
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
      console.log('🔍 DEBUG: Loading verifications in AdminVerification component...');
      const response = await verificationAPI.getAllVerifications();
      console.log('🔍 DEBUG: API response:', response);
      const verifications = response.verifications || [];
      console.log('🔍 DEBUG: Setting verifications state:', verifications);
      setVerifications(verifications);
      console.log('🔍 DEBUG: Verifications state updated!');
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

  const handleSetPending = (verification) => {
    setSelectedVerification(verification);
    setActionType('pending');
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedVerification) return;

    try {
      let status, notes;
      if (actionType === 'approve') {
        status = 'approved';
        notes = approvalNotes;
      } else if (actionType === 'reject') {
        status = 'rejected';
        notes = rejectionReason;
      } else if (actionType === 'pending') {
        status = 'pending';
        notes = approvalNotes || rejectionReason;
      }

      await verificationAPI.updateVerificationStatus(
        selectedVerification.id,
        status,
        notes
      );

      // Reload verifications to get updated data
      await loadVerifications();

      setActionDialogOpen(false);
      setSelectedVerification(null);
      setRejectionReason('');
      setApprovalNotes('');
      
      // Show success notification
      const actionText = actionType === 'approve' ? 'approved' : 
                        actionType === 'reject' ? 'rejected' : 'set to pending';
      alert(`Verification ${actionText} successfully!`);
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
              {verification.user ? `${verification.user.firstName || verification.user.username || 'User'} ${verification.user.lastName || ''}` : 'Unknown User'}
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
                {verification.idType || verification.validIdType || 'N/A'}
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
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<RejectIcon />}
                    onClick={() => handleReject(verification)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    startIcon={<PendingIcon />}
                    onClick={() => handleSetPending(verification)}
                  >
                    Set to Pending
                  </Button>
                </>
              )}
              {verification.status === 'rejected' && (
                <>
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    startIcon={<ApproveIcon />}
                    onClick={() => handleApprove(verification)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    startIcon={<PendingIcon />}
                    onClick={() => handleSetPending(verification)}
                  >
                    Set to Pending
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Seller Verification Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and approve seller verification requests to maintain platform quality and trust.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadVerifications}
            sx={{ alignSelf: 'flex-start' }}
          >
            Refresh
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              console.log('🔍 DEBUG: Manual localStorage check...');
              const rawData = localStorage.getItem('sellerVerifications');
              console.log('🔍 DEBUG: Raw localStorage data:', rawData);
              const parsedData = JSON.parse(rawData || '[]');
              console.log('🔍 DEBUG: Parsed data:', parsedData);
              alert(`Found ${parsedData.length} verifications in localStorage. Check console for details.`);
            }}
          >
            Check localStorage
          </Button>
          
          <Button
            variant="outlined"
            color="warning"
            onClick={() => {
              console.log('🔍 DEBUG: Creating test verification...');
              const testVerification = {
                id: `VER-TEST-${Date.now()}`,
                userId: 'test-user-123',
                user: {
                  id: 'test-user-123',
                  username: 'TestUser123',
                  email: 'test@example.com',
                  firstName: 'Test',
                  lastName: 'User'
                },
                name: 'Test User',
                address: '123 Test Street, Test City',
                phoneNumber: '123-456-7890',
                idType: 'Driver\'s License',
                idNumber: 'TEST123456',
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              
              const existingVerifications = JSON.parse(localStorage.getItem('sellerVerifications') || '[]');
              existingVerifications.push(testVerification);
              localStorage.setItem('sellerVerifications', JSON.stringify(existingVerifications));
              console.log('🔍 DEBUG: Test verification created:', testVerification);
              alert('Test verification created! Click Refresh to see it.');
            }}
          >
            Create Test
          </Button>
        </Box>
      </Box>

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
                    <strong>Name:</strong> {selectedVerification.user ? `${selectedVerification.user.firstName || selectedVerification.user.username || 'User'} ${selectedVerification.user.lastName || ''}` : 'Unknown User'}
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
                    <strong>ID Type:</strong> {selectedVerification.idType || selectedVerification.validIdType || 'N/A'}
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
          {actionType === 'approve' ? 'Approve Verification' : 
           actionType === 'reject' ? 'Reject Verification' : 'Set to Pending'}
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
          {actionType === 'pending' && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Are you sure you want to set this verification back to pending status? 
                This will reset the verification status and allow for further review.
              </Alert>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes (Optional)"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes about setting to pending..."
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={actionType === 'approve' ? 'success' : 
                   actionType === 'reject' ? 'error' : 'warning'}
            onClick={confirmAction}
            disabled={actionType === 'reject' && !rejectionReason.trim()}
          >
            {actionType === 'approve' ? 'Approve' : 
             actionType === 'reject' ? 'Reject' : 'Set to Pending'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminVerification;


