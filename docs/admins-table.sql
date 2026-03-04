-- Admins Table Schema
-- Add this to your MySQL database

CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- INSERT SAMPLE ADMIN (Password is plain text in this example, use bcrypt in production)
-- Replace 'admin@example.com' and 'admin123' with your desired credentials
-- INSERT INTO admins (email, password, is_active) VALUES ('admin@example.com', 'admin123', 1);
