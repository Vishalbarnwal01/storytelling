-- MySQL Table Schema for Songs/Stories

-- Create the songs table
CREATE TABLE songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT NOT NULL,
  audio_path VARCHAR(255) NOT NULL,
  thumbnail_path VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Create an index for better query performance
CREATE INDEX idx_user_status ON songs(user_id, status);

-- Example Query: Get all songs uploaded by a specific user
-- SELECT * FROM songs WHERE user_id = ? ORDER BY created_at DESC;

-- Example Query: Get approved songs with pagination
-- SELECT * FROM songs WHERE status = 'approved' ORDER BY created_at DESC LIMIT 10 OFFSET 0;

-- Example Query: Get user's upload statistics
-- SELECT 
--   COUNT(*) as total_uploads,
--   SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
--   SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
--   SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
-- FROM songs 
-- WHERE user_id = ?;

-- Example Query: Insert a new song
-- INSERT INTO songs (user_id, title, description, audio_path, thumbnail_path, status)
-- VALUES (?, ?, ?, ?, ?, 'pending');

-- Example Query: Update song status (admin approval)
-- UPDATE songs SET status = 'approved' WHERE id = ?;

-- Example Query: Get top songs by views
-- SELECT * FROM songs WHERE status = 'approved' ORDER BY views DESC LIMIT 10;

-- Example Query: Search songs by title
-- SELECT * FROM songs WHERE status = 'approved' AND title LIKE CONCAT('%', ?, '%') ORDER BY created_at DESC;
