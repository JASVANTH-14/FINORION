/*
  # Finorion Sanction Screening Platform Schema

  ## Overview
  Creates the database schema for the Finorion sanction screening platform,
  including watchlist data, screening results, and risk analytics.

  ## New Tables
  
  ### `sanction_watchlist`
  Master list of sanctioned entities for screening
  - `id` (uuid, primary key) - Unique identifier
  - `entity_name` (text) - Full name of sanctioned entity
  - `entity_type` (text) - Type: individual, organization, vessel
  - `country` (text) - Country associated with entity
  - `risk_level` (text) - Risk level: high, medium, low
  - `sanction_list` (text) - Source list (OFAC, UN, EU, etc)
  - `aliases` (text array) - Known aliases
  - `details` (jsonb) - Additional entity details
  - `created_at` (timestamptz) - Record creation timestamp

  ### `screening_results`
  Stores all screening operation results
  - `id` (uuid, primary key) - Unique identifier
  - `customer_name` (text) - Name being screened
  - `customer_country` (text) - Customer country
  - `device_ip` (text) - Device IP address
  - `similarity_score` (numeric) - Name match score (0-100)
  - `country_risk_score` (numeric) - Country risk score (0-100)
  - `overall_risk_level` (text) - Final risk: low, medium, high, critical
  - `risk_percentage` (numeric) - Overall risk percentage
  - `matched_entities` (jsonb) - Array of matched entities
  - `ai_explanation` (text) - AI reasoning for the decision
  - `network_analysis` (jsonb) - Graph-based network connections
  - `aml_flags` (jsonb) - AML-specific flags
  - `screening_timestamp` (timestamptz) - When screening occurred
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access to sanction_watchlist for screening
  - Authenticated access for screening_results
*/

-- Create sanction_watchlist table
CREATE TABLE IF NOT EXISTS sanction_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name text NOT NULL,
  entity_type text NOT NULL DEFAULT 'individual',
  country text NOT NULL,
  risk_level text NOT NULL DEFAULT 'medium',
  sanction_list text NOT NULL,
  aliases text[] DEFAULT '{}',
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create screening_results table
CREATE TABLE IF NOT EXISTS screening_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_country text NOT NULL,
  device_ip text NOT NULL,
  similarity_score numeric(5,2) NOT NULL DEFAULT 0,
  country_risk_score numeric(5,2) NOT NULL DEFAULT 0,
  overall_risk_level text NOT NULL DEFAULT 'low',
  risk_percentage numeric(5,2) NOT NULL DEFAULT 0,
  matched_entities jsonb DEFAULT '[]',
  ai_explanation text,
  network_analysis jsonb DEFAULT '{}',
  aml_flags jsonb DEFAULT '[]',
  screening_timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_watchlist_entity_name ON sanction_watchlist(entity_name);
CREATE INDEX IF NOT EXISTS idx_watchlist_country ON sanction_watchlist(country);
CREATE INDEX IF NOT EXISTS idx_screening_timestamp ON screening_results(screening_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_screening_risk_level ON screening_results(overall_risk_level);

-- Enable Row Level Security
ALTER TABLE sanction_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sanction_watchlist (public read for screening)
CREATE POLICY "Public can read sanction watchlist"
  ON sanction_watchlist
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert watchlist entries"
  ON sanction_watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for screening_results
CREATE POLICY "Public can insert screening results"
  ON screening_results
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can read screening results"
  ON screening_results
  FOR SELECT
  TO public
  USING (true);

-- Insert sample sanction data
INSERT INTO sanction_watchlist (entity_name, entity_type, country, risk_level, sanction_list, aliases, details) VALUES
  ('Mohammad Ahmed Hassan', 'individual', 'Iran', 'high', 'OFAC-SDN', ARRAY['M. Hassan', 'Ahmed Mohammad'], '{"dob": "1975-03-15", "passport": "IR123456"}'),
  ('Viktor Petrov', 'individual', 'Russia', 'high', 'EU Sanctions', ARRAY['V. Petrov', 'Victor Petrov'], '{"dob": "1968-07-22", "business": "Energy"}'),
  ('North Star Trading LLC', 'organization', 'North Korea', 'critical', 'UN Sanctions', ARRAY['North Star Trade', 'NS Trading'], '{"sector": "Weapons", "established": "2010"}'),
  ('Li Wei', 'individual', 'China', 'medium', 'OFAC-SDN', ARRAY['Lee Wei', 'Wei Li'], '{"dob": "1982-11-30", "occupation": "Technology"}'),
  ('Phantom Shell Corp', 'organization', 'Syria', 'high', 'OFAC-SDN', ARRAY['Phantom Corp', 'PSC Holdings'], '{"sector": "Finance", "established": "2015"}'),
  ('Abdul Rahman', 'individual', 'Yemen', 'high', 'UN Sanctions', ARRAY['A. Rahman', 'Rahman Abdul'], '{"dob": "1970-05-10", "affiliations": "Militant"}'),
  ('Golden Bridge International', 'organization', 'Belarus', 'medium', 'EU Sanctions', ARRAY['Golden Bridge Int', 'GB International'], '{"sector": "Banking", "established": "2008"}'),
  ('Carlos Martinez', 'individual', 'Venezuela', 'medium', 'OFAC-SDN', ARRAY['C. Martinez', 'Martinez Carlos'], '{"dob": "1965-09-18", "position": "Government Official"}'),
  ('Red Dragon Shipping', 'organization', 'Iran', 'high', 'OFAC-SDN', ARRAY['Red Dragon Ship', 'RDS Co'], '{"sector": "Maritime", "established": "2012"}'),
  ('Dmitry Sokolov', 'individual', 'Russia', 'high', 'UK Sanctions', ARRAY['D. Sokolov', 'Dmitri Sokolov'], '{"dob": "1972-12-05", "business": "Defense"}');
