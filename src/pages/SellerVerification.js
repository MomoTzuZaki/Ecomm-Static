import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Grid,
  MenuItem,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { verificationAPI } from '../services/api';

const schema = yup.object({
  name: yup.string().required('Full name is required'),
  address: yup.string().required('Address is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  idType: yup.string().required('ID type is required'),
  idNumber: yup.string().required('ID number is required'),
});

const steps = [
  'Personal Information',
  'ID Verification',
  'Selfie with ID',
  'Review & Submit',
];

const idTypes = [
  'Driver\'s License',
  'Passport',
  'National ID',
  'SSS ID',
  'PhilHealth ID',
  'TIN ID',
  'Voter\'s ID',
  'Postal ID',
];

const SellerVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [idImage, setIdImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [proofOfOwnership, setProofOfOwnership] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    idType: '',
    idNumber: '',
  });

  // Direct state for name field to bypass form issues
  const [directName, setDirectName] = useState('');
  // Direct state for phone number field to bypass form issues
  const [directPhone, setDirectPhone] = useState('');

  // Clear form data when component mounts
  useEffect(() => {
    setFormData({
      name: '',
      phoneNumber: '',
      address: '',
      idType: '',
      idNumber: '',
    });
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    formState,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      address: '',
      phoneNumber: '',
      idType: '',
      idNumber: '',
    },
  });

  // Watch form values and update formData
  const watchedValues = watch();
  
  useEffect(() => {
    setFormData({
      name: watchedValues.name || '',
      phoneNumber: watchedValues.phoneNumber || '',
      address: watchedValues.address || '',
      idType: watchedValues.idType || '',
      idNumber: watchedValues.idNumber || '',
    });
  }, [watchedValues]);

  // Ensure form values are properly set when user data changes
  useEffect(() => {
    if (user?.username) {
      setValue('name', user.username);
      setDirectName(user.username);
    } else if (user?.email) {
      // Try using email as fallback
      const emailPrefix = user.email.split('@')[0];
      setValue('name', emailPrefix);
      setDirectName(emailPrefix);
    }
  }, [user, setValue]);

  const handleNext = () => {
    // Capture form data when moving to review step
    if (activeStep === 2) {
      const currentValues = getValues();
      setFormData({
        name: currentValues.name || '',
        phoneNumber: currentValues.phoneNumber || '',
        address: currentValues.address || '',
        idType: currentValues.idType || '',
        idNumber: currentValues.idNumber || '',
      });
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleImageUpload = (setter, file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (setter) => {
    setter(null);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const verificationData = {
        fullName: data.name, // Map 'name' to 'fullName' for backend compatibility
        phoneNumber: data.phoneNumber || directPhone, // Use direct phone as fallback
        address: data.address,
        idType: data.idType,
        idNumber: data.idNumber,
        idImage,
        selfieImage,
        proofOfOwnership,
      };

      const response = await verificationAPI.submitVerification(verificationData);
      
      setVerificationId(response.verificationId);
      setSuccess(true);
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert(error.message || 'Failed to submit verification request');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={directName}
                  onChange={(e) => {
                    setDirectName(e.target.value);
                    // Also update the form field
                    setValue('name', e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={directPhone}
                  onChange={(e) => {
                    setDirectPhone(e.target.value);
                    // Also update the form field
                    setValue('phoneNumber', e.target.value);
                  }}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Complete Address"
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              ID Verification
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Controller
                  name="idType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Select ID Type"
                      error={!!errors.idType}
                      helperText={errors.idType?.message}
                      sx={{ minWidth: '200px' }}
                    >
                      {idTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="idNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="ID Number"
                      error={!!errors.idNumber}
                      helperText={errors.idNumber?.message}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Upload Valid ID Photo
                  </Typography>
                  <Card sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {idImage ? (
                      <Box sx={{ width: '100%' }}>
                        <CardMedia
                          component="img"
                          height="120"
                          image={idImage}
                          alt="ID Photo"
                          sx={{ objectFit: 'contain' }}
                        />
                        <CardContent sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveImage(setIdImage)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </CardContent>
                      </Box>
                    ) : (
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="id-upload"
                          onChange={(e) => handleImageUpload(setIdImage, e.target.files[0])}
                        />
                        <label htmlFor="id-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<UploadIcon />}
                            fullWidth
                            size="small"
                          >
                            Upload ID Photo
                          </Button>
                        </label>
                      </CardContent>
                    )}
                  </Card>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Selfie with ID
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please take a clear selfie holding your ID next to your face. Make sure both your face and the ID are clearly visible.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Selfie with ID
                  </Typography>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                    <Card sx={{ maxWidth: 300, width: '100%', height: '250px', display: 'flex', flexDirection: 'column' }}>
                      {selfieImage ? (
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <CardMedia
                            component="img"
                            height="200"
                            image={selfieImage}
                            alt="Selfie with ID"
                            sx={{ objectFit: 'cover' }}
                          />
                          <CardContent sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveImage(setSelfieImage)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </CardContent>
                        </Box>
                      ) : (
                        <CardContent sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="selfie-upload"
                            onChange={(e) => handleImageUpload(setSelfieImage, e.target.files[0])}
                          />
                          <label htmlFor="selfie-upload">
                            <Button
                              variant="outlined"
                              component="span"
                              startIcon={<UploadIcon />}
                              fullWidth
                            >
                              Upload Selfie with ID
                            </Button>
                          </label>
                        </CardContent>
                      )}
                    </Card>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Proof of Ownership (Optional)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload receipts, warranty cards, or other documents proving you own the gadgets you plan to sell.
                  </Typography>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                    <Card sx={{ maxWidth: 300, width: '100%', height: '250px', display: 'flex', flexDirection: 'column' }}>
                      {proofOfOwnership ? (
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <CardMedia
                            component="img"
                            height="200"
                            image={proofOfOwnership}
                            alt="Proof of Ownership"
                            sx={{ objectFit: 'cover' }}
                          />
                          <CardContent sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveImage(setProofOfOwnership)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </CardContent>
                        </Box>
                      ) : (
                        <CardContent sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="proof-upload"
                            onChange={(e) => handleImageUpload(setProofOfOwnership, e.target.files[0])}
                          />
                          <label htmlFor="proof-upload">
                            <Button
                              variant="outlined"
                              component="span"
                              startIcon={<UploadIcon />}
                              fullWidth
                            >
                              Upload Proof of Ownership
                            </Button>
                          </label>
                        </CardContent>
                      )}
                    </Card>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Submit
            </Typography>
            <Alert severity="warning" sx={{ mb: 3 }}>
              Please review all information carefully. Once submitted, you cannot edit your verification request.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Personal Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {directName || watchedValues.name || formData.name || 'Not provided'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {directPhone || watchedValues.phoneNumber || formData.phoneNumber || 'Not provided'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Address:</strong> {watchedValues.address || formData.address || 'Not provided'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    ID Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>ID Type:</strong> {watchedValues.idType || formData.idType || 'Not selected'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>ID Number:</strong> {watchedValues.idNumber || formData.idNumber || 'Not provided'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>ID Photo:</strong> {idImage ? '✅ Uploaded' : '❌ Missing'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Selfie:</strong> {selfieImage ? '✅ Uploaded' : '❌ Missing'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Verification Submitted!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Your seller verification request has been submitted successfully. 
            Our admin team will review your application within 24-48 hours.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Verification ID:</strong> {verificationId}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You will receive an email notification once your verification is approved or if additional information is needed.
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              window.location.href = '/dashboard?tab=2';
            }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Become a Verified Seller
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Join our community of trusted sellers and start listing your gadgets. 
        Verification helps build trust with buyers and unlocks premium features.
      </Typography>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <>
                <Button
                  variant="contained"
                  onClick={() => {
                    // Get form data using react-hook-form's getValues
                    const formData = getValues();
                    onSubmit(formData);
                  }}
                  disabled={loading}
                  startIcon={<CheckCircleIcon />}
                >
                  {loading ? 'Submitting...' : 'Submit Verification'}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && (!!errors.name || !!errors.phoneNumber || !!errors.address)) ||
                  (activeStep === 1 && (!!errors.idType || !!errors.idNumber || !idImage)) ||
                  (activeStep === 2 && !selfieImage)
                }
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SellerVerification;

