-- Cyber Knights Database Setup
-- Run this in Supabase SQL Editor

-- Scan Reports table
CREATE TABLE IF NOT EXISTS scan_reports (
  report_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_hash TEXT,
  package_name TEXT,
  permission_count INT DEFAULT 0,
  dangerous_permissions JSONB DEFAULT '[]'::jsonb,
  all_permissions JSONB DEFAULT '[]'::jsonb,
  malware_match BOOLEAN DEFAULT false,
  matched_threat TEXT,
  url_count INT DEFAULT 0,
  extracted_urls JSONB DEFAULT '[]'::jsonb,
  all_urls JSONB DEFAULT '[]'::jsonb,
  api_count INT DEFAULT 0,
  suspicious_apis JSONB DEFAULT '[]'::jsonb,
  risk_score NUMERIC DEFAULT 0,
  risk_raw_score NUMERIC DEFAULT 0,
  classification TEXT DEFAULT 'Safe',
  risk_breakdown JSONB,
  risk_formula TEXT,
  activities JSONB DEFAULT '[]'::jsonb,
  services JSONB DEFAULT '[]'::jsonb,
  receivers JSONB DEFAULT '[]'::jsonb,
  files_in_apk INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Malware Signatures table
CREATE TABLE IF NOT EXISTS malware_signatures (
  signature_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sha256_hash TEXT UNIQUE NOT NULL,
  threat_name TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles table (for admin access control)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE scan_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE malware_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read their own reports
DROP POLICY IF EXISTS "Users can view own reports" ON scan_reports;
CREATE POLICY "Users can view own reports"
  ON scan_reports FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reports" ON scan_reports;
CREATE POLICY "Users can insert own reports"
  ON scan_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies: Anyone authenticated can read signatures
DROP POLICY IF EXISTS "Authenticated users can view signatures" ON malware_signatures;
CREATE POLICY "Authenticated users can view signatures"
  ON malware_signatures FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert signatures" ON malware_signatures;
CREATE POLICY "Authenticated users can insert signatures"
  ON malware_signatures FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete signatures" ON malware_signatures;
CREATE POLICY "Authenticated users can delete signatures"
  ON malware_signatures FOR DELETE
  TO authenticated
  USING (true);

-- Policies: Users can read their own role
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Seed some sample malware signatures
INSERT INTO malware_signatures (sha256_hash, threat_name) VALUES
  ('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'Empty File Exploit'),
  ('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', 'Trojan.AndroidOS.FakeApp'),
  ('d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5', 'Trojan.AndroidOS.Banker'),
  ('b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3', 'Spyware.AndroidOS.Agent'),
  ('c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', 'Ransomware.AndroidOS.Locker'),
  ('f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1', 'Adware.AndroidOS.HiddenAd'),
  ('1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b', 'Trojan.AndroidOS.Joker'),
  ('2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c', 'Trojan.AndroidOS.Harly')
ON CONFLICT (sha256_hash) DO NOTHING;
