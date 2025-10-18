-- Tech Cycle Database Schema for Neon.tech PostgreSQL
-- C2C Second-hand Gadget Marketplace

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Buyers, Sellers, Admins)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('user', 'seller', 'admin')) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(20) CHECK (verification_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none',
    verification_id VARCHAR(100),
    
    -- Profile information
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    address TEXT,
    avatar VARCHAR(255),
    
    -- Seller specific information
    business_name VARCHAR(100),
    business_description TEXT,
    seller_rating DECIMAL(3,2) DEFAULT 0.00,
    total_sales INTEGER DEFAULT 0,
    response_rate VARCHAR(10) DEFAULT '0%',
    response_time VARCHAR(20) DEFAULT 'N/A',
    
    -- Account status
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seller verifications table
CREATE TABLE seller_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    valid_id_type VARCHAR(50) NOT NULL,
    id_image VARCHAR(255) NOT NULL,
    selfie_image VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    proof_of_ownership VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    admin_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products/Gadgets table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    
    -- Basic product information
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(10,2) NOT NULL CHECK (original_price >= 0),
    condition VARCHAR(20) CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Poor')) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    
    -- Technical specifications (JSON for flexibility)
    specifications JSONB,
    
    -- Media
    images TEXT[] DEFAULT '{}',
    highlights TEXT[] DEFAULT '{}',
    
    -- Location and status
    location VARCHAR(100) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'sold', 'inactive')) DEFAULT 'pending',
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP,
    
    -- Engagement metrics
    views INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    
    -- Timestamps
    date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Transaction details
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    transaction_fee DECIMAL(10,2) DEFAULT 0 CHECK (transaction_fee >= 0),
    net_amount DECIMAL(10,2) NOT NULL CHECK (net_amount >= 0),
    
    -- Status tracking
    status VARCHAR(30) CHECK (status IN ('pending_payment', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded')) DEFAULT 'pending_payment',
    
    -- Payment information
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    payment_proof VARCHAR(255),
    payment_verified BOOLEAN DEFAULT FALSE,
    payment_verified_at TIMESTAMP,
    
    -- Shipping information
    shipping_address TEXT NOT NULL,
    shipping_method VARCHAR(50),
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table (detailed payment tracking)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(100),
    proof_image VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('pending_verification', 'verified', 'rejected')) DEFAULT 'pending_verification',
    admin_notes TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipping table
CREATE TABLE shipping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    courier VARCHAR(50) NOT NULL,
    tracking_number VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('pending', 'shipped', 'in_transit', 'delivered', 'failed')) DEFAULT 'pending',
    estimated_delivery DATE,
    actual_delivery TIMESTAMP,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table (Chat system)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(20) CHECK (message_type IN ('text', 'image', 'file')) DEFAULT 'text',
    attachment_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    screenshot VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')) DEFAULT 'pending',
    admin_notes TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(buyer_id, transaction_id)
);

-- Favorites table
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Platform earnings table (for profit tracking)
CREATE TABLE platform_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    transaction_fee DECIMAL(10,2) NOT NULL CHECK (transaction_fee >= 0),
    premium_listing_fee DECIMAL(10,2) DEFAULT 0 CHECK (premium_listing_fee >= 0),
    shipping_commission DECIMAL(10,2) DEFAULT 0 CHECK (shipping_commission >= 0),
    total_earnings DECIMAL(10,2) NOT NULL CHECK (total_earnings >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Premium listings table
CREATE TABLE premium_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_paid DECIMAL(10,2) NOT NULL CHECK (amount_paid >= 0),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'expired', 'cancelled')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verification_status ON users(verification_status);

CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_is_premium ON products(is_premium);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_title_search ON products USING gin(to_tsvector('english', title));
CREATE INDEX idx_products_description_search ON products USING gin(to_tsvector('english', description));

CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX idx_reports_status ON reports(status);

CREATE INDEX idx_reviews_seller_id ON reviews(seller_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Insert default categories
INSERT INTO categories (name, description, icon) VALUES
('Smartphones', 'Mobile phones and accessories', '📱'),
('Laptops', 'Laptops, notebooks, and computer accessories', '💻'),
('Tablets', 'Tablets and e-readers', '📱'),
('Audio', 'Headphones, speakers, and audio equipment', '🎧'),
('Cameras', 'Digital cameras and photography equipment', '📷'),
('Accessories', 'Chargers, cases, and other tech accessories', '🔌'),
('Gaming', 'Gaming consoles, controllers, and accessories', '🎮'),
('Wearables', 'Smartwatches, fitness trackers, and wearables', '⌚');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seller_verifications_updated_at BEFORE UPDATE ON seller_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipping_updated_at BEFORE UPDATE ON shipping FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to update product favorites count
CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE products SET favorites_count = favorites_count + 1 WHERE id = NEW.product_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE products SET favorites_count = favorites_count - 1 WHERE id = OLD.product_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for favorites count
CREATE TRIGGER update_product_favorites_count
    AFTER INSERT OR DELETE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_favorites_count();

-- Create a function to calculate seller rating
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET seller_rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM reviews 
        WHERE seller_id = NEW.seller_id
    )
    WHERE id = NEW.seller_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for seller rating
CREATE TRIGGER update_seller_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_seller_rating();

COMMENT ON TABLE users IS 'Stores user accounts including buyers, sellers, and admins';
COMMENT ON TABLE seller_verifications IS 'Stores seller verification applications and documents';
COMMENT ON TABLE categories IS 'Product categories for organization';
COMMENT ON TABLE products IS 'Gadget listings posted by verified sellers';
COMMENT ON TABLE cart IS 'Shopping cart items for users';
COMMENT ON TABLE transactions IS 'Purchase transactions between buyers and sellers';
COMMENT ON TABLE payments IS 'Payment details and verification status';
COMMENT ON TABLE shipping IS 'Shipping and delivery tracking information';
COMMENT ON TABLE messages IS 'Chat messages between users';
COMMENT ON TABLE reports IS 'User reports about suspicious activities';
COMMENT ON TABLE reviews IS 'Buyer reviews and ratings for sellers';
COMMENT ON TABLE favorites IS 'User favorite products';
COMMENT ON TABLE platform_earnings IS 'Platform profit tracking from transaction fees';
COMMENT ON TABLE premium_listings IS 'Premium listing purchases for featured placement';
