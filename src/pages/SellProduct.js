import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const schema = yup.object({
  title: yup.string().required('Product title is required'),
  description: yup.string().required('Product description is required'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  originalPrice: yup.number().positive('Original price must be positive'),
  category: yup.string().required('Category is required'),
  condition: yup.string().required('Condition is required'),
  location: yup.string().required('Location is required'),
  contactInfo: yup.string().required('Contact information is required'),
  brand: yup.string(),
  storage: yup.string(),
  color: yup.string(),
  screenSize: yup.string(),
  warranty: yup.string(),
  accessories: yup.string(),
  keyFeatures: yup.string(),
  // Technical Specifications
  processor: yup.string(),
  memory: yup.string(),
  graphics: yup.string(),
  battery: yup.string(),
  connectivity: yup.string(),
  ports: yup.string(),
  operatingSystem: yup.string(),
  // Product Information
  dimensions: yup.string(),
  weight: yup.string(),
});

const categories = [
  'Smartphones',
  'Laptops',
  'Tablets',
  'Audio',
  'Cameras',
  'Gaming',
  'Accessories',
  'Other',
];

const conditions = [
  'Excellent',
  'Good',
  'Fair',
  'Poor',
];

const SellProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      condition: '',
      location: '',
      contactInfo: user?.email || '',
      brand: '',
      storage: '',
      color: '',
      screenSize: '',
      warranty: '',
      accessories: '',
      keyFeatures: '',
      // Technical Specifications
      processor: '',
      memory: '',
      graphics: '',
      battery: '',
      connectivity: '',
      ports: '',
      operatingSystem: '',
      // Product Information
      dimensions: '',
      weight: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Simulate API call - replace with actual backend integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Product data:', data);
      setSuccess(true);
      reset();
      
      // Redirect to dashboard after successful submission
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            Product submitted successfully! It will be reviewed and published soon.
          </Alert>
          <Typography variant="h6" gutterBottom>
            Thank you for listing your product on Tech Cycle!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting to your dashboard...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Sell Your Gadget
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        List your second-hand gadgets and reach thousands of potential buyers
      </Typography>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Product Title"
                    placeholder="e.g., iPhone 13 Pro 128GB"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Product Description"
                    placeholder="Describe your product in detail..."
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Selling Price ($)"
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="originalPrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Original Price ($)"
                    placeholder="Optional"
                    error={!!errors.originalPrice}
                    helperText={errors.originalPrice?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {errors.category.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="condition"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.condition}>
                    <InputLabel>Condition</InputLabel>
                    <Select {...field} label="Condition">
                      {conditions.map((condition) => (
                        <MenuItem key={condition} value={condition}>
                          {condition}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.condition && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {errors.condition.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Location"
                    placeholder="e.g., New York, NY"
                    error={!!errors.location}
                    helperText={errors.location?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="contactInfo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Contact Information"
                    placeholder="Email or phone number"
                    error={!!errors.contactInfo}
                    helperText={errors.contactInfo?.message}
                  />
                )}
              />
            </Grid>

            {/* Additional Product Details Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
                Additional Product Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="brand"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Brand"
                    placeholder="e.g., Apple, Samsung, Dell"
                    error={!!errors.brand}
                    helperText={errors.brand?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="storage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Storage"
                    placeholder="e.g., 128GB, 256GB, 512GB"
                    error={!!errors.storage}
                    helperText={errors.storage?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Color"
                    placeholder="e.g., Graphite, Silver, Space Gray"
                    error={!!errors.color}
                    helperText={errors.color?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="screenSize"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Screen Size"
                    placeholder="e.g., 6.1 inches, 13 inches"
                    error={!!errors.screenSize}
                    helperText={errors.screenSize?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="warranty"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Warranty"
                    placeholder="e.g., No warranty, 1 year remaining"
                    error={!!errors.warranty}
                    helperText={errors.warranty?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="accessories"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Accessories Included"
                    placeholder="e.g., Original box, charger, cable"
                    error={!!errors.accessories}
                    helperText={errors.accessories?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="keyFeatures"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label="Key Features"
                    placeholder="List key features separated by commas (e.g., Excellent condition, Battery health at 95%, All original accessories included)"
                    error={!!errors.keyFeatures}
                    helperText={errors.keyFeatures?.message}
                  />
                )}
              />
            </Grid>

            {/* Technical Specifications Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                Technical Specifications
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="processor"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Processor"
                    placeholder="e.g., Apple M1 Pro chip, Intel i7, AMD Ryzen 7"
                    error={!!errors.processor}
                    helperText={errors.processor?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="memory"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Memory/RAM"
                    placeholder="e.g., 16GB unified memory, 8GB DDR4, 32GB"
                    error={!!errors.memory}
                    helperText={errors.memory?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="graphics"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Graphics"
                    placeholder="e.g., 16-core GPU, NVIDIA RTX 3060, Intel Iris Xe"
                    error={!!errors.graphics}
                    helperText={errors.graphics?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="battery"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Battery"
                    placeholder="e.g., Up to 17 hours video playback, 5000mAh"
                    error={!!errors.battery}
                    helperText={errors.battery?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="connectivity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Connectivity"
                    placeholder="e.g., Wi-Fi 6, Bluetooth 5.0, 5G"
                    error={!!errors.connectivity}
                    helperText={errors.connectivity?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="ports"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Ports"
                    placeholder="e.g., 3x Thunderbolt 4, HDMI, SD card slot"
                    error={!!errors.ports}
                    helperText={errors.ports?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="operatingSystem"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Operating System"
                    placeholder="e.g., macOS Monterey, Windows 11, iOS 15"
                    error={!!errors.operatingSystem}
                    helperText={errors.operatingSystem?.message}
                  />
                )}
              />
            </Grid>

            {/* Product Information Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                Product Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="dimensions"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Dimensions"
                    placeholder="e.g., 312.6 x 221.2 x 15.5 mm"
                    error={!!errors.dimensions}
                    helperText={errors.dimensions?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="weight"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Weight"
                    placeholder="e.g., 1.6 kg, 203g"
                    error={!!errors.weight}
                    helperText={errors.weight?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tips for a successful listing:
                  </Typography>
                  <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                    <li>Use clear, descriptive titles</li>
                    <li>Include detailed descriptions and any defects</li>
                    <li>Take high-quality photos (you can add them later)</li>
                    <li>Set a competitive price based on market research</li>
                    <li>Be honest about the condition of your item</li>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'List Product'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default SellProduct;
