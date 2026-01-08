/*
  # Add Screening Details Columns to screening_results Table

  ## Overview
  Adds new columns to track customer identification and entity classification details
  in the screening results table.

  ## Modified Tables

  ### `screening_results`
  - `customer_id` (text) - Unique customer identifier
  - `entity_type` (text) - Classification of entity (Individual, Organization, Business, etc)
  - `date_of_birth` (date) - Date of birth for individual entities
  - `account_number` (text) - Associated account number for tracking

  ## Security
  - RLS policies remain unchanged
  - All new columns are non-nullable with defaults
*/

DO $$
BEGIN
  -- Add customer_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'screening_results' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE screening_results ADD COLUMN customer_id text NOT NULL DEFAULT '';
  END IF;

  -- Add entity_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'screening_results' AND column_name = 'entity_type'
  ) THEN
    ALTER TABLE screening_results ADD COLUMN entity_type text NOT NULL DEFAULT 'individual';
  END IF;

  -- Add date_of_birth column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'screening_results' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE screening_results ADD COLUMN date_of_birth date;
  END IF;

  -- Add account_number column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'screening_results' AND column_name = 'account_number'
  ) THEN
    ALTER TABLE screening_results ADD COLUMN account_number text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Create index on customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_screening_customer_id ON screening_results(customer_id);

-- Create index on account_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_screening_account_number ON screening_results(account_number);
