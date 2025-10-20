import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  TextField,
  Grid,
  Alert,
  Breadcrumbs,
  Link,
  Divider,
  Paper,
  Chip
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
  Support as SupportIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ContactTechCycle = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user ? user.email : '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      
      // Reset form
      setFormData({
        name: user ? `${user.firstName} ${user.lastName}` : '',
        email: user ? user.email : '',
        subject: '',
        message: '',
        category: 'general'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SendIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main">
            Message Sent Successfully!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Thank you for contacting TechCycle. We'll get back to you within 24 hours.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setSubmitted(false)}
          >
            Send Another Message
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          Home
        </Link>
        <Typography color="text.primary">Contact TechCycle</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        Contact TechCycle
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Have questions about our second-hand devices? Need support with your order? 
        We're here to help! Reach out to us through any of the methods below.
      </Typography>

      <Grid container spacing={4}>
        {/* Contact Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SupportIcon color="primary" />
                Get in Touch
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2">Email</Typography>
                    <Typography variant="body2" color="text.secondary">
                      support@techcycle.com
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2">Phone</Typography>
                    <Typography variant="body2" color="text.secondary">
                      +63 917 123 4567
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2">Address</Typography>
                    <Typography variant="body2" color="text.secondary">
                      123 Tech Street,<br />
                      Manila, Philippines 1000
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon color="primary" />
                Business Hours
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday: 10:00 AM - 4:00 PM<br />
                Sunday: Closed
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Support
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Common questions and quick solutions:
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={() => navigate('/products')}>
                  Browse Products
                </Button>
                <Button variant="outlined" size="small" onClick={() => navigate('/cart')}>
                  View Cart
                </Button>
                <Button variant="outlined" size="small" onClick={() => navigate('/orders')}>
                  Track Order
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Send us a Message
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Fill out the form below and we'll get back to you as soon as possible.
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Support</option>
                      <option value="product">Product Question</option>
                      <option value="technical">Technical Support</option>
                      <option value="complaint">Complaint</option>
                      <option value="suggestion">Suggestion</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please describe your inquiry in detail..."
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<SendIcon />}
                      disabled={loading}
                      sx={{ minWidth: 200 }}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </form>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Response Time:</strong> We typically respond to inquiries within 24 hours during business days.
                  For urgent matters, please call us directly.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FAQ Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                How do I place an order?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Simply browse our products, add items to your cart, and proceed to checkout. 
                We accept GCash, PayMaya, and bank transfers.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                What's the condition of your devices?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All our devices are thoroughly tested and come with detailed condition descriptions. 
                We offer Like New, Excellent, Good, and Fair conditions.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Do you offer warranty?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yes, all devices come with a 30-day warranty covering manufacturing defects. 
                Normal wear and tear is not covered.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                How long does shipping take?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Shipping typically takes 3-5 business days within Metro Manila and 5-7 business days 
                for other areas in the Philippines.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ContactTechCycle;
