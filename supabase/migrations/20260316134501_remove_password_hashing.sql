/*
  # Remove Password Hashing - Switch to Plaintext

  1. Changes
    - Rename `password_hash` column to `password` in users table
    - Update existing admin user to use plaintext password "12345678"
  
  2. Security
    - This migration removes password hashing for development purposes only
    - DO NOT use in production environments
*/

-- Rename password_hash column to password
ALTER TABLE users 
RENAME COLUMN password_hash TO password;

-- Update admin user with plaintext password
UPDATE users 
SET password = '12345678' 
WHERE username = 'admin';
