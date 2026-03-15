/*
  # Create default admin user

  1. New Data
    - Create default admin user with username: admin, password: 12345678
  
  2. Details
    - Username: admin
    - Password: 12345678 (hashed with SHA-256)
    - Role: Admin with full access
    - Status: Active
*/

DO $$
DECLARE
  v_user_id uuid;
  v_password_hash text;
BEGIN
  -- Calculate SHA-256 hash for password '12345678' with salt
  -- Using the same algorithm as the edge function
  v_password_hash := '$2y$10$' || 
    encode(
      digest('12345678salt', 'sha256'),
      'base64'
    );

  -- Insert admin user if not already exists
  INSERT INTO users (username, password_hash, is_admin, is_active)
  VALUES ('admin', v_password_hash, true, true)
  ON CONFLICT (username) DO NOTHING;
  
  RAISE NOTICE 'Admin user created or already exists';
END $$;
