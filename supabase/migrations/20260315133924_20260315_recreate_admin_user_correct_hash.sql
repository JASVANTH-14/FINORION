/*
  # Recreate admin user with correct password hash

  1. New Data
    - Create admin user with correct password hash matching JavaScript algorithm
    - Username: admin
    - Password: 12345678
    - Uses SHA-256 hash with 'salt' suffix, base64 encoded
*/

INSERT INTO users (username, password_hash, is_admin, is_active)
VALUES (
  'admin',
  '$2y$10$' || encode(digest('12345678salt', 'sha256'), 'base64'),
  true,
  true
)
ON CONFLICT (username) DO UPDATE
SET password_hash = '$2y$10$' || encode(digest('12345678salt', 'sha256'), 'base64'),
    is_admin = true,
    is_active = true;
