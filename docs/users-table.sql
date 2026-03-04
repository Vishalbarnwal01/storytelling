-- Users Table Schema with Google OAuth Support
-- Run this SQL to create the users table or update existing one

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  name VARCHAR(255),
  googleId VARCHAR(255) UNIQUE,
  isGoogleAuth BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_googleId (googleId)
);

-- If you already have a users table, add the missing columns with:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS googleId VARCHAR(255) UNIQUE;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS isGoogleAuth BOOLEAN DEFAULT FALSE;
-- ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;
-- CREATE INDEX idx_googleId ON users(googleId);
