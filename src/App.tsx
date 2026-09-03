import { useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  verifyRagResponse,
  type SourceChunk,
  type VerificationResult,
} from './lib/verification'
import { type VerificationRun, type VerificationCitation, type VerificationClaim } from './lib/supabase'
import Header from './components/Header'
import QueryInput from './components/QueryInput'
import ChunkManager from './components/ChunkManager'
import ResultsPanel from './components/ResultsPanel'
import AuditTrail from './components/AuditTrail'
import ClaimsPanel from './components/ClaimsPanel'
import HistoryPanel from './components/HistoryPanel'
import StatsBar from './components/StatsBar'
import Footer from './components/Footer'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

type View = 'verify' | 'history'

function App() {
  const [view, setView] = useState<View>('verify')
  const [userQuery, setUserQuery] = useState('')
  const [llmOutput, setLlmOutput] = useState('')
  const [chunks, setChunks] = useState<SourceChunk[]>([])
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [history, setHistory] = useState<VerificationRun[]>([])
  const [historyCitations, setHistoryCitations] = useState<Record<string, VerificationCitation[]>>({})
  const [historyClaims, setHistoryClaims] = useState<Record<string, VerificationClaim[]>>({})
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [savedToDb, setSavedToDb] = useState(false)

  const addChunk = () => {
    setChunks([
      ...chunks,
      {
        id: `chunk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        doc_name: '',
        doc_id: '',
        version: 1,
        content: '',
        keywords: [],
      },
    ])
  }

  const updateChunk = (index: number, field: keyof SourceChunk, value: string | string[] | number) => {
    const updated = [...chunks]
    if (field === 'keywords') {
      updated[index].keywords = (value as string).split(',').map(k => k.trim()).filter(Boolean)
    } else if (field === 'version') {
      updated[index].version = parseFloat(value as string) || 1
    } else {
      updated[index][field] = value as string
    }
    setChunks(updated)
  }

  const removeChunk = (index: number) => {
    setChunks(chunks.filter((_, i) => i !== index))
  }

  const loadExample = () => {
    setUserQuery('What is the API key rotation policy?')
    setLlmOutput(
      'According to company policy, all API keys must rotate every 30 days. Access logs are retained for 2 years and must be reviewed monthly by the security team.'
    )
    setChunks([
      {
        id: 'doc_101',
        doc_name: 'SOC2_Access_Policy.pdf',
        doc_id: 'POLICY-01',
        version: 1.0,
        content: 'All API keys must rotate every 90 days. Access logs are retained for 2 years.',
        keywords: ['rotate', '90 days', 'api key', 'access logs', 'retained', '2 years'],
      },
      {
        id: 'doc_102',
        doc_name: 'SOC2_Access_Policy_v2.pdf',
        doc_id: 'POLICY-01',
        version: 2.0,
        content: 'API keys must rotate every 30 days. Access logs are retained for 2 years.',
        keywords: ['rotate', '30 days', 'api key', 'access logs', 'retained', '2 years'],
      },
      {
        id: 'doc_103',
        doc_name: 'Security_Review_Procedures.pdf',
        doc_id: 'SEC-02',
        version: 1.0,
        content: 'The security team must review access logs on a monthly basis to ensure compliance.',
        keywords: ['security team', 'review', 'monthly', 'access logs'],
      },
    ])
    setResult(null)
    setSavedToDb(false)
  }

  const handleVerify = async () => {
    if (!userQuery.trim() || !llmOutput.trim() || chunks.length === 0) return
    setIsVerifying(true)
    setSavedToDb(false)
    try {
      const res = await verifyRagResponse(userQuery, chunks, llmOutput)
      setResult(res)

      const { data: runData, error: runError } = await supabase
        .from('verification_runs')
        .insert({
          user_query: res.user_query,
          llm_output: res.llm_output,
          hallucination_flag: res.hallucination_flag,
          iso_42001_compliant: res.iso_42001_compliant,
          risk_score: res.risk_score,
          total_chunks: res.total_chunks,
          verified_chunks: res.grounded_count,
          receipt_id: res.receipt_id,
          doc_id: res.active_doc_id,
          doc_version: res.active_doc_version,
          query_hash: res.query_hash,
          source_chunk_hash: res.source_chunk_hash,
          compliance_status: res.compliance_status,
          verified_claims: res.verified_claims,
          blocked_claims: res.blocked_claims,
        })
        .select()
        .single()

      if (runError || !runData) {
        console.error('Failed to save run:', runError)
      } else {
        const runId = runData.id
        const citationRows = res.audit_trail.map(c => ({
          run_id: runId,
          source_doc: c.source_doc,
          chunk_id: c.chunk_id,
          chunk_content: c.chunk_content,
          proof_hash: c.proof_hash,
          keywords: c.matched_keywords,
          status: c.status,
          match_score: c.match_score,
        }))
        const { error: citeError } = await supabase.from('verification_citations').insert(citationRows)

        const claimRows = res.claim_results.map(c => ({
          run_id: runId,
          statement: c.statement,
          status: c.status,
        }))
        const { error: claimError } = await supabase.from('verification_claims').insert(claimRows)

        if (citeError) console.error('Failed to save citations:', citeError)
        if (claimError) console.error('Failed to save claims:', claimError)
        if (!citeError && !claimError) setSavedToDb(true)
      }
    } catch (err) {
      console.error('Verification failed:', err)
    } finally {
      setIsVerifying(false)
    }
  }

  const loadHistory = useCallback(async () => {
    const { data, error } = await supabase
      .from('verification_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) { console.error('Failed to load history:', error); return }
    setHistory((data || []) as VerificationRun[])
    setHistoryLoaded(true)
  }, [])

  const loadHistoryCitations = useCallback(async (runId: string) => {
    if (historyCitations[runId]) return
    const { data, error } = await supabase.from('verification_citations').select('*').eq('run_id', runId)
    if (error) return
    setHistoryCitations(prev => ({ ...prev, [runId]: (data || []) as VerificationCitation[] }))
  }, [historyCitations])

  const loadHistoryClaims = useCallback(async (runId: string) => {
    if (historyClaims[runId]) return
    const { data, error } = await supabase.from('verification_claims').select('*').eq('run_id', runId)
    if (error) return
    setHistoryClaims(prev => ({ ...prev, [runId]: (data || []) as VerificationClaim[] }))
  }, [historyClaims])

  const deleteRun = async (runId: string) => {
    const { error } = await supabase.from('verification_runs').delete().eq('id', runId)
    if (error) { console.error('Delete failed:', error); return }
    setHistory(prev => prev.filter(r => r.id !== runId))
    setHistoryCitations(prev => { const n = { ...prev }; delete n[runId]; return n })
    setHistoryClaims(prev => { const n = { ...prev }; delete n[runId]; return n })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Header view={view} setView={setView} onLoadExample={loadExample} />

      {view === 'verify' ? (
        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', flex: 1, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <QueryInput
              userQuery={userQuery}
              setUserQuery={setUserQuery}
              llmOutput={llmOutput}
              setLlmOutput={setLlmOutput}
            />
            <ChunkManager
              chunks={chunks}
              addChunk={addChunk}
              updateChunk={updateChunk}
              removeChunk={removeChunk}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <button
              onClick={handleVerify}
              disabled={isVerifying || !userQuery.trim() || !llmOutput.trim() || chunks.length === 0}
              style={{
                padding: '14px 48px', fontSize: 16, fontWeight: 600, borderRadius: 12,
                background: isVerifying || !userQuery.trim() || !llmOutput.trim() || chunks.length === 0 ? 'var(--neutral-700)' : 'var(--primary)',
                color: 'white',
                cursor: isVerifying || !userQuery.trim() || !llmOutput.trim() || chunks.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', opacity: isVerifying ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              {isVerifying ? (
                <>
                  <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Verifying...
                </>
              ) : 'Run Verification Audit'}
            </button>
          </div>

          {result && (
            <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <StatsBar result={result} savedToDb={savedToDb} />
              <ResultsPanel result={result} />
              <ClaimsPanel result={result} />
              <AuditTrail citations={result.audit_trail} />
            </div>
          )}
        </main>
      ) : (
        <HistoryPanel
          history={history}
          historyCitations={historyCitations}
          historyClaims={historyClaims}
          historyLoaded={historyLoaded}
          loadHistory={loadHistory}
          loadHistoryCitations={loadHistoryCitations}
          loadHistoryClaims={loadHistoryClaims}
          deleteRun={deleteRun}
        />
      )}

      <Footer />
    </div>
  )
}

export default App
