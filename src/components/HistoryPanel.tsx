import { useEffect, useState } from 'react'
import { History, ShieldCheck, AlertTriangle, ChevronDown, ChevronRight, Trash2, Hash, Database, Receipt, GitBranch, CheckCircle2, XCircle } from 'lucide-react'
import type { VerificationRun, VerificationCitation, VerificationClaim } from '../lib/supabase'

interface HistoryPanelProps {
  history: VerificationRun[]
  historyCitations: Record<string, VerificationCitation[]>
  historyClaims: Record<string, VerificationClaim[]>
  historyLoaded: boolean
  loadHistory: () => void
  loadHistoryCitations: (runId: string) => void
  loadHistoryClaims: (runId: string) => void
  deleteRun: (runId: string) => void
}

export default function HistoryPanel({
  history, historyCitations, historyClaims, historyLoaded,
  loadHistory, loadHistoryCitations, loadHistoryClaims, deleteRun,
}: HistoryPanelProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => { if (!historyLoaded) loadHistory() }, [historyLoaded, loadHistory])

  const toggle = (runId: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(runId)) { next.delete(runId) }
      else { next.add(runId); loadHistoryCitations(runId); loadHistoryClaims(runId) }
      return next
    })
  }

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <History size={24} color="var(--primary-light)" />
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Audit History</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            All verification runs are persisted with immutable proof hashes and receipt IDs for compliance traceability.
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <div style={{ padding: '64px 24px', textAlign: 'center', borderRadius: 16, background: 'var(--bg-card)', border: '1px dashed var(--border-light)' }}>
          <Database size={40} color="var(--neutral-600)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}>No verification runs yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Run a verification audit and it will appear here with full citation and claim records.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map(run => {
            const isExpanded = expanded.has(run.id)
            const citations = historyCitations[run.id] || []
            const claims = historyClaims[run.id] || []
            const isSafe = !run.hallucination_flag
            const date = new Date(run.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
            const compliance = run.compliance_status || (isSafe ? 'PASSED_ISO42001' : 'BLOCKED_HALLUCINATION')

            return (
              <div key={run.id} className="animate-fadeIn" style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${isSafe ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  <div style={{ width: 4, background: isSafe ? 'var(--success)' : 'var(--error)', flexShrink: 0 }} />
                  <button onClick={() => toggle(run.id)} style={{ flex: 1, padding: '18px 20px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                      {isExpanded ? <ChevronDown size={18} color="var(--text-muted)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
                      {isSafe ? <ShieldCheck size={18} color="var(--success)" /> : <AlertTriangle size={18} color="var(--error)" />}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{run.user_query}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {date} — Risk: {run.risk_score}/100 — {run.verified_chunks}/{run.total_chunks} grounded
                          {run.receipt_id && <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-light)' }}> — {run.receipt_id}</span>}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {run.doc_id && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', fontSize: 10, fontWeight: 600, borderRadius: 5, background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-light)' }}>
                          <GitBranch size={10} /> {run.doc_id} v{run.doc_version}
                        </span>
                      )}
                      <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, borderRadius: 6, letterSpacing: '0.5px', background: isSafe ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: isSafe ? 'var(--success-light)' : 'var(--error-light)' }}>
                        {compliance === 'PASSED_ISO42001' ? 'PASSED' : 'BLOCKED'}
                      </span>
                      <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, borderRadius: 6, letterSpacing: '0.5px', background: run.iso_42001_compliant ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: run.iso_42001_compliant ? 'var(--success-light)' : 'var(--error-light)' }}>
                        ISO 42001 {run.iso_42001_compliant ? 'OK' : 'FAIL'}
                      </span>
                    </div>
                  </button>
                  <button onClick={() => deleteRun(run.id)} style={{ padding: '0 20px', background: 'transparent', color: 'var(--neutral-600)', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--error)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--neutral-600)')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {isExpanded && (
                  <div className="animate-fadeIn" style={{ padding: '0 24px 20px 24px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Receipt + Hashes */}
                      {run.receipt_id && (
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            <Receipt size={13} color="var(--accent-light)" />
                            <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-light)', fontWeight: 600 }}>{run.receipt_id}</span>
                          </div>
                          {run.query_hash && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Q:</span>
                              <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>{run.query_hash.slice(0, 16)}</span>
                            </div>
                          )}
                          {run.source_chunk_hash && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>S:</span>
                              <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>{run.source_chunk_hash.slice(0, 16)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6 }}>LLM Output</p>
                        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 13, lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{run.llm_output}</div>
                      </div>

                      {/* Claims */}
                      {claims.length > 0 && (
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>Per-Claim Verification ({claims.length})</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {claims.map((c, j) => (
                              <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-secondary)', border: `1px solid ${c.status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                                {c.status === 'VERIFIED' ? <CheckCircle2 size={15} color="var(--success)" style={{ marginTop: 2, flexShrink: 0 }} /> : <XCircle size={15} color="var(--error)" style={{ marginTop: 2, flexShrink: 0 }} />}
                                <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, flex: 1 }}>{c.statement}</p>
                                <span style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, borderRadius: 5, flexShrink: 0, background: c.status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: c.status === 'VERIFIED' ? 'var(--success-light)' : 'var(--error-light)' }}>
                                  {c.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Citations */}
                      {citations.length > 0 && (
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>Citations ({citations.length})</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {citations.map((c, j) => (
                              <div key={j} style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--bg-secondary)', border: `1px solid ${c.status === 'VERIFIED_GROUNDED' ? 'rgba(16, 185, 129, 0.2)' : 'var(--border)'}`, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                {c.status === 'VERIFIED_GROUNDED' ? <ShieldCheck size={16} color="var(--success)" style={{ marginTop: 2, flexShrink: 0 }} /> : <AlertTriangle size={16} color="var(--neutral-500)" style={{ marginTop: 2, flexShrink: 0 }} />}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.source_doc}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{c.chunk_id}</span>
                                  </div>
                                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{c.chunk_content}</p>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 5, background: 'var(--bg-tertiary)' }}>
                                      <Hash size={11} color="var(--accent-light)" />
                                      <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-light)', fontWeight: 600 }}>{c.proof_hash}</span>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Match: {Math.round(c.match_score * 100)}%</span>
                                    {c.keywords && c.keywords.length > 0 && <span style={{ fontSize: 11, color: 'var(--primary-light)' }}>[{c.keywords.join(', ')}]</span>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
