import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface VerificationRun {
  id: string
  user_query: string
  llm_output: string
  hallucination_flag: boolean
  iso_42001_compliant: boolean
  risk_score: number
  total_chunks: number
  verified_chunks: number
  created_at: string
  receipt_id: string | null
  doc_id: string | null
  doc_version: number | null
  query_hash: string | null
  source_chunk_hash: string | null
  compliance_status: string | null
  verified_claims: string[] | null
  blocked_claims: string[] | null
}

export interface VerificationCitation {
  id: string
  run_id: string
  source_doc: string
  chunk_id: string
  chunk_content: string
  proof_hash: string
  keywords: string[]
  status: string
  match_score: number
  created_at: string
}

export interface VerificationClaim {
  id: string
  run_id: string
  statement: string
  status: string
  created_at: string
}
