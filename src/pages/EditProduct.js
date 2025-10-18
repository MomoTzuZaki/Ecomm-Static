import React, { useState, useEffect, useRef } from 'react';
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
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Alert,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';

const schema = yup.object({
  title: yup.string().required('Product title is required'),
  description: yup.string().required('Product description is required'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  originalPrice: yup.number().positive('Original price must be positive'),
  category: yup.string().required('Category is required'),
  condition: yup.string().required('Condition is required'),
  brand: yup.string().required('Brand is required'),
  model: yup.string().required('Model is required'),
  storage: yup.string(),
  color: yup.string(),
  screenSize: yup.string(),
  operatingSystem: yup.string(),
  batteryHealth: yup.string(),
  network: yup.string(),
  camera: yup.string(),
  material: yup.string(),
  dimensions: yup.string(),
  weight: yup.string(),
  warranty: yup.string(),
  accessories: yup.string(),
  location: yup.string().required('Location is required'),
  contactInfo: yup.string().required('Contact information is required'),
  highlights: yup.array().of(yup.string()),
  specifications: yup.object(),
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

// Mock product data - in real app, this would come from API
const mockProduct = {
  id: 1,
  title: 'iPhone 13 Pro',
  description: 'Excellent condition iPhone 13 Pro with 128GB storage. This device has been well-maintained and comes with original box and charger. No scratches or dents, battery health at 95%. Perfect for anyone looking for a premium smartphone experience.',
  price: 899,
  originalPrice: 999,
  category: 'Smartphones',
  condition: 'Excellent',
  brand: 'Apple',
  model: 'iPhone 13 Pro',
  storage: '128GB',
  color: 'Graphite',
  screenSize: '6.1 inches',
  operatingSystem: 'iOS 15',
  batteryHealth: '95%',
  network: '5G',
  camera: 'Triple 12MP',
  material: 'Ceramic Shield',
  dimensions: '146.7 x 71.5 x 7.65 mm',
  weight: '203g',
  warranty: 'No warranty (used)',
  accessories: 'Original box, charger, cable',
  location: 'New York, NY',
  contactInfo: 'john@example.com',
  images: [
    'https://via.placeholder.com/600x400?text=iPhone+13+Pro+Front',
    'https://via.placeholder.com/600x400?text=iPhone+13+Pro+Back',
    'https://via.placeholder.com/600x400?text=iPhone+13+Pro+Side',
    'https://via.placeholder.com/600x400?text=iPhone+13+Pro+Box',
  ],
  highlights: [
    'Excellent condition with minimal wear',
    'Battery health at 95%',
    'All original accessories included',
    'No scratches or dents',
    'Unlocked for all carriers',
    'Recent software update',
  ],
  specifications: {
    'Display': '6.1-inch Super Retina XDR display',
    'Chip': 'A15 Bionic chip',
    'Camera': 'Pro camera system with 12MP Ultra Wide, Wide, and Telephoto cameras',
    'Video': 'Cinematic mode, ProRes video recording',
    'Battery': 'Up to 22 hours video playback',
    'Storage': '128GB',
    'Connectivity': '5G, Wi-Fi 6, Bluetooth 5.0',
    'Security': 'Face ID',
    'Water Resistance': 'IP68 rating',
    'Operating System': 'iOS 15 (upgradeable)',
  },
};

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, updateProduct } = useProducts();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [product, setProduct] = useState(() => getProductById(id) || mockProduct);
  const fileInputRefs = useRef([]);
  const addInputRef = useRef(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: product.title,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      condition: product.condition,
      brand: product.brand,
      model: product.model,
      storage: product.storage,
      color: product.color,
      screenSize: product.screenSize,
      operatingSystem: product.operatingSystem,
      batteryHealth: product.batteryHealth,
      network: product.network,
      camera: product.camera,
      material: product.material,
      dimensions: product.dimensions,
      weight: product.weight,
      warranty: product.warranty,
      accessories: product.accessories,
      location: product.location,
      contactInfo: product.contactInfo,
      highlights: product.highlights,
      specifications: product.specifications,
    },
  });

  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
    control,
    name: 'highlights',
  });

  const [specFields, setSpecFields] = useState(
    Object.entries(product.specifications).map(([key, value]) => ({ key, value }))
  );

  const addSpecField = () => {
    setSpecFields([...specFields, { key: '', value: '' }]);
  };

  const removeSpecField = (index) => {
    setSpecFields(specFields.filter((_, i) => i !== index));
  };

  const updateSpecField = (index, field, newValue) => {
    const updated = [...specFields];
    updated[index][field] = newValue;
    setSpecFields(updated);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Convert spec fields to object
      const specifications = {};
      specFields.forEach(field => {
        if (field.key && field.value) {
          specifications[field.key] = field.value;
        }
      });

      const productData = {
        ...data,
        specifications,
        id: product.id,
        images: product.images,
        seller: product.seller,
        datePosted: product.datePosted,
        views: product.views,
        isFavorite: product.isFavorite,
      };

      console.log('Updated product data:', productData);
      console.log('Images being saved:', productData.images.length, 'images');
      console.log('First image preview:', productData.images[0]?.substring(0, 50) + '...');
      
      // Update product in global state
      updateProduct(productData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  const handleReplaceImageClick = (index) => {
    fileInputRefs.current[index]?.click();
  };

  const handleReplaceImageChange = (index, e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('Image converted to base64, length:', reader.result.length);
      setProduct(prev => {
        const updated = [...prev.images];
        updated[index] = reader.result; // This is the base64 string
        return { ...prev, images: updated };
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteImage = (index) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddImageClick = () => {
    addInputRef.current?.click();
  };

  const handleAddImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Process each file and convert to base64
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('New image converted to base64, length:', reader.result.length);
        setProduct(prev => ({ 
          ...prev, 
          images: [...prev.images, reader.result] // This is the base64 string
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            Product updated successfully!
          </Alert>
          <Typography variant="h6" gutterBottom>
            The product has been updated and is now live.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting to admin dashboard...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Edit Product
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Product Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="brand"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Brand"
                    error={!!errors.brand}
                    helperText={errors.brand?.message}
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
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
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

            <Grid item xs={12} md={4}>
              <Controller
                name="originalPrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Original Price ($)"
                    error={!!errors.originalPrice}
                    helperText={errors.originalPrice?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
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

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
              <Controller
                name="model"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Model"
                    error={!!errors.model}
                    helperText={errors.model?.message}
                  />
                )}
              />
            </Grid>

            {/* Technical Specifications */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Technical Specifications
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="storage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Storage"
                    placeholder="e.g., 128GB, 256GB"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Color"
                    placeholder="e.g., Graphite, Silver"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="screenSize"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Screen Size"
                    placeholder="e.g., 6.1 inches"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="operatingSystem"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Operating System"
                    placeholder="e.g., iOS 15, Android 12"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="batteryHealth"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Battery Health"
                    placeholder="e.g., 95%"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="network"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Network"
                    placeholder="e.g., 5G, 4G LTE"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="camera"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Camera"
                    placeholder="e.g., Triple 12MP"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="material"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Material"
                    placeholder="e.g., Ceramic Shield, Aluminum"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="dimensions"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Dimensions"
                    placeholder="e.g., 146.7 x 71.5 x 7.65 mm"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="weight"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Weight"
                    placeholder="e.g., 203g"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="warranty"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Warranty"
                    placeholder="e.g., No warranty (used), 1 year"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="accessories"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Accessories"
                    placeholder="e.g., Original box, charger, cable"
                  />
                )}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Contact Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
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

            {/* Product Highlights */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Product Highlights
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              {highlightFields.map((field, index) => (
                <Box key={field.id} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Controller
                    name={`highlights.${index}`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={`Highlight ${index + 1}`}
                        placeholder="Enter a product highlight"
                      />
                    )}
                  />
                  <IconButton
                    color="error"
                    onClick={() => removeHighlight(index)}
                    sx={{ mt: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => appendHighlight('')}
              >
                Add Highlight
              </Button>
            </Grid>

            {/* Custom Specifications */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Custom Specifications
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              {specFields.map((field, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Specification Name"
                    value={field.key}
                    onChange={(e) => updateSpecField(index, 'key', e.target.value)}
                    placeholder="e.g., Display, Chip, Camera"
                  />
                  <TextField
                    fullWidth
                    label="Specification Value"
                    value={field.value}
                    onChange={(e) => updateSpecField(index, 'value', e.target.value)}
                    placeholder="e.g., 6.1-inch Super Retina XDR display"
                  />
                  <IconButton
                    color="error"
                    onClick={() => removeSpecField(index)}
                    sx={{ mt: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addSpecField}
              >
                Add Specification
              </Button>
            </Grid>

            {/* Product Images */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Product Images
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                {product.images.map((image, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="150"
                        image={image}
                        alt={`Product image ${index + 1}`}
                      />
                      <CardContent sx={{ p: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Button
                            size="small"
                            startIcon={<UploadIcon />}
                            variant="outlined"
                            onClick={() => handleReplaceImageClick(index)}
                          >
                            Replace
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            ref={(el) => (fileInputRefs.current[index] = el)}
                            onChange={(e) => handleReplaceImageChange(index, e)}
                            style={{ display: 'none' }}
                          />
                          <IconButton size="small" color="error" onClick={() => handleDeleteImage(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
                onClick={handleAddImageClick}
              >
                Add Image
              </Button>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={addInputRef}
                onChange={handleAddImagesChange}
                style={{ display: 'none' }}
              />
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditProduct;
