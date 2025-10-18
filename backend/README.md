# Tech Cycle Backend API

This is the backend API for the Tech Cycle e-commerce platform.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/techcycle

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000

# Environment
NODE_ENV=development
```

### 3. Install MongoDB
- Download and install MongoDB Community Server from https://www.mongodb.com/try/download/community
- Start MongoDB service
- Or use MongoDB Atlas (cloud database) and update MONGODB_URI

### 4. Run the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products (with search/filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (authenticated)
- `PUT /api/products/:id` - Update product (owner/admin)
- `DELETE /api/products/:id` - Delete product (owner/admin)
- `GET /api/products/user/:userId` - Get user's products
- `GET /api/products/admin/all` - Get all products (admin)
- `PATCH /api/products/:id/approve` - Approve product (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart
- `GET /api/cart/count` - Get cart item count

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/products` - Get user's products
- `PUT /api/users/:id` - Update user (own profile/admin)
- `DELETE /api/users/:id` - Delete user (admin)
- `GET /api/users/admin/stats` - Get user statistics (admin)

## Database Models

### User
- name, email, password, role (user/admin)
- profile info: avatar, location, phone
- seller stats: rating, totalSales, responseRate, responseTime

### Product
- title, description, price, originalPrice
- category, condition, brand, model
- specifications, images, highlights
- seller reference, location, contactInfo
- approval status, view count

### Cart
- user reference, items array
- calculated totals (totalItems, totalPrice)

## Authentication
- JWT tokens for authentication
- Protected routes require Authorization header: `Bearer <token>`
- Admin routes require admin role

