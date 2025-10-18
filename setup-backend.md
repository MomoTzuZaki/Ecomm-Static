# Backend Setup Guide for Tech Cycle

## Quick Setup Instructions

### 1. Install MongoDB
**Option A: Local MongoDB**
- Download from: https://www.mongodb.com/try/download/community
- Install and start the MongoDB service
- Default connection: `mongodb://localhost:27017/techcycle`

**Option B: MongoDB Atlas (Cloud - Recommended)**
- Go to: https://www.mongodb.com/atlas
- Create a free account and cluster
- Get your connection string
- Update the MONGODB_URI in your .env file

### 2. Create Environment File
Create a file named `.env` in the `backend` folder with this content:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/techcycle

# JWT Secret (change this to a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000

# Environment
NODE_ENV=development
```

### 3. Start the Backend Server
```bash
cd backend
npm run dev
```

The server will start on http://localhost:5000

### 4. Test the API
Visit: http://localhost:5000/api/health
You should see: `{"message":"Tech Cycle API is running!"}`

## Next Steps

1. **Create Admin User**: Use the register endpoint to create an admin user
2. **Update Frontend**: Modify your React app to use the API endpoints
3. **Test Features**: Register, login, create products, add to cart

## API Testing with Postman/Thunder Client

### Register Admin User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@techcycle.com",
  "password": "admin123",
  "role": "admin"
}
```

### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@techcycle.com",
  "password": "admin123"
}
```

### Create Product (use token from login)
```
POST http://localhost:5000/api/products
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "iPhone 13 Pro",
  "description": "Excellent condition iPhone 13 Pro",
  "price": 899,
  "originalPrice": 999,
  "category": "Smartphones",
  "condition": "Excellent",
  "brand": "Apple",
  "model": "iPhone 13 Pro",
  "specifications": {
    "storage": "128GB",
    "color": "Graphite",
    "screenSize": "6.1 inches"
  },
  "images": ["https://via.placeholder.com/600x400?text=iPhone+13+Pro"],
  "highlights": ["Excellent condition", "Battery health 95%"],
  "location": "New York, NY",
  "contactInfo": "admin@techcycle.com"
}
```

## Frontend Integration

The next step is to update your React frontend to use these API endpoints instead of localStorage. This will involve:

1. Creating API service functions
2. Updating contexts to use API calls
3. Handling authentication tokens
4. Error handling and loading states

Would you like me to help you integrate the frontend with the API?

