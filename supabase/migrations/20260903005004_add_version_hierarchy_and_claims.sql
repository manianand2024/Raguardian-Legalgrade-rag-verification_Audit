/*
# Add version hierarchy, receipt ID, claims, and compliance status columns

1. Modified Tables
- `verification_runs`
  - `receipt_id` (text) — unique receipt ID (REC-XXXXXXXX) for each audit run
  - `doc_id` (text) — the active document ID selected by version hierarchy
  - `doc_version` (numeric) — the active document version (highest wins)
  - `query_hash` (text) — SHA-256 hash of the user query
  - `source_chunk_hash` (text) — SHA-256 hash of the active chunk content
  - `compliance_status` (text) — 'PASSED_ISO42001' or 'BLOCKED_HALLUCINATION'
  - `verified_claims` (text[]) — claims that were grounded in source
  - `blocked_claims` (text[]) — claims that were NOT grounded (hallucinations)

2. New Tables
- `verification_claims`
  - `id` (uuid, primary key)
  - `run_id` (uuid, FK → verification_runs ON DELETE CASCADE)
  - `statement` (text, not null) — the claim text
  - `status` (text, not null) — 'VERIFIED' or 'BLOCKED'
  - `created_at` (timestamptz)

3. Security
- RLS already enabled on verification_runs and verification_citations.
- Enable RLS on verification_claims with anon+authenticated CRUD (single-tenant demo).

4. Important Notes
- All new columns are nullable or have defaults so existing rows are not broken.
- The verification_claims table stores per-claim results for detailed audit trails.
- Existing citation functionality remains fully intact.
*/

-- Add new columns to verification_runs (all nullable/with defaults for backward compat)
ALTER TABLE verification_runs
  ADD COLUMN IF NOT EXISTS receipt_id text,
  ADD COLUMN IF NOT EXISTS doc_id text,
  ADD COLUMN IF NOT EXISTS doc_version numeric,
  ADD COLUMN IF NOT EXISTS query_hash text,
  ADD COLUMN IF NOT EXISTS source_chunk_hash text,
  ADD COLUMN IF NOT EXISTS compliance_status text DEFAULT 'BLOCKED_HALLUCINATION',
  ADD COLUMN IF NOT EXISTS verified_claims text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS blocked_claims text[] DEFAULT '{}';

-- Create verification_claims table
CREATE TABLE IF NOT EXISTS verification_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES verification_runs(id) ON DELETE CASCADE,
  statement text NOT NULL,
  status text NOT NULL DEFAULT 'BLOCKED',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE verification_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_claims" ON verification_claims;
CREATE POLICY "anon_select_claims" ON verification_claims FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_claims" ON verification_claims;
CREATE POLICY "anon_insert_claims" ON verification_claims FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_claims" ON verification_claims;
CREATE POLICY "anon_update_claims" ON verification_claims FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_claims" ON verification_claims;
CREATE POLICY "anon_delete_claims" ON verification_claims FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_claims_run_id ON verification_claims(run_id);
