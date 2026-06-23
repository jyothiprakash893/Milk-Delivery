-- Milk Delivery Management System
-- Database Initialization Script (auto-run by MySQL container on first start)

-- ============================================================
-- Database 1: users_db (auth-service)
-- ============================================================
CREATE DATABASE IF NOT EXISTS users_db;
USE users_db;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','CUSTOMER','DELIVERY_BOY') NOT NULL,
  customer_id BIGINT,
  delivery_boy_id BIGINT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_customer_id ON users(customer_id);
CREATE INDEX idx_users_delivery_boy_id ON users(delivery_boy_id);

-- ============================================================
-- Database 2: customers_db (customer-service)
-- ============================================================
CREATE DATABASE IF NOT EXISTS customers_db;
USE customers_db;

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(100),
  address TEXT NOT NULL,
  area VARCHAR(100),
  milk_quantity DECIMAL(4,1) NOT NULL,
  price_per_litre DECIMAL(6,2) NOT NULL DEFAULT 60.00,
  delivery_time VARCHAR(10) DEFAULT '7:00 AM',
  start_date DATE NOT NULL,
  notes TEXT,
  status ENUM('ACTIVE','INACTIVE','HOLD') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_area ON customers(area);

CREATE TABLE IF NOT EXISTS service_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  customer_id BIGINT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  address TEXT NOT NULL,
  area VARCHAR(100),
  status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  admin_note VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_requests_user ON service_requests(user_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);

-- ============================================================
-- Database 3: deliveries_db (delivery-service)
-- ============================================================
CREATE DATABASE IF NOT EXISTS deliveries_db;
USE deliveries_db;

CREATE TABLE IF NOT EXISTS deliveries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  delivery_date DATE NOT NULL,
  quantity DECIMAL(4,1) NOT NULL,
  is_delivered BOOLEAN DEFAULT FALSE,
  skip_reason VARCHAR(255),
  marked_at TIMESTAMP,
  UNIQUE KEY unique_delivery (customer_id, delivery_date)
);

CREATE INDEX idx_deliveries_date ON deliveries(delivery_date);
CREATE INDEX idx_deliveries_customer ON deliveries(customer_id);
CREATE INDEX idx_deliveries_status ON deliveries(is_delivered);

-- ============================================================
-- Database 4: billing_db (billing-service)
-- ============================================================
CREATE DATABASE IF NOT EXISTS billing_db;
USE billing_db;

CREATE TABLE IF NOT EXISTS bills (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  month TINYINT NOT NULL,
  year SMALLINT NOT NULL,
  total_days_delivered INT NOT NULL,
  total_litres DECIMAL(8,2) NOT NULL,
  price_per_litre DECIMAL(6,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_bill (customer_id, month, year)
);

CREATE INDEX idx_bills_customer ON bills(customer_id);
CREATE INDEX idx_bills_month_year ON bills(month, year);
CREATE INDEX idx_bills_paid ON bills(is_paid);

-- ============================================================
-- Database 5: payments_db (payment-service)
-- ============================================================
CREATE DATABASE IF NOT EXISTS payments_db;
USE payments_db;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  bill_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_mode ENUM('CASH','UPI','BANK') DEFAULT 'CASH',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_bill ON payments(bill_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- ============================================================
-- Database 6: orders_db (order-service)
-- ============================================================
CREATE DATABASE IF NOT EXISTS orders_db;
USE orders_db;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  delivery_boy_id BIGINT,
  milk_type VARCHAR(20) DEFAULT 'Cow',
  quantity DECIMAL(4,1) NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time VARCHAR(20) DEFAULT '7:00 AM',
  delivery_address VARCHAR(255),
  status ENUM('PENDING','ASSIGNED','PICKED_UP','DELIVERED','CANCELLED') DEFAULT 'PENDING',
  special_instructions TEXT,
  total_amount DECIMAL(10,2),
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_boy ON orders(delivery_boy_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(delivery_date);

-- ============================================================
-- Database 7: delivery_boys_db (delivery-boy-service)
-- ============================================================
CREATE DATABASE IF NOT EXISTS delivery_boys_db;
USE delivery_boys_db;

CREATE TABLE IF NOT EXISTS delivery_boys (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(100),
  vehicle_number VARCHAR(50),
  area VARCHAR(100),
  is_available BOOLEAN DEFAULT TRUE,
  status ENUM('ACTIVE','INACTIVE','SUSPENDED') DEFAULT 'ACTIVE',
  rating DECIMAL(3,1) DEFAULT 0.0,
  total_deliveries INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_delivery_boys_phone ON delivery_boys(phone);
CREATE INDEX idx_delivery_boys_available ON delivery_boys(is_available);
CREATE INDEX idx_delivery_boys_area ON delivery_boys(area);
