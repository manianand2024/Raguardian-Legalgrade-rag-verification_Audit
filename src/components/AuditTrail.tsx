import { useState } from 'react'
import { ChevronDown, ChevronRight, ShieldCheck, AlertCircle, Hash, FileText, GitBranch } from 'lucide-react'
import type { VerifiedCitation } from '../lib/verification'

interface AuditTrailProps {
  citations: VerifiedCitation[]
}

export default function AuditTrail({ citations }: AuditTrailProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]))

  const toggle = (index: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <FileText size={20} color="var(--primary-light)" />
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
          Pillar 3: Immutable Audit Trail — Citation Verification
        </h2>
      </div>

      <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {citations.map((citation, i) => {
          const isVerified = citation.status === 'VERIFIED_GROUNDED'
          const isOpen = expanded.has(i)
          const isActive = citation.is_active_version

          return (
            <div key={i} className="animate-fadeIn" style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${isVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)'}`, background: 'var(--bg-secondary)' }}>
              <button onClick={() => toggle(i)} style={{ width: '100%', padding: '16px 20px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  {isOpen ? <ChevronDown size={18} color="var(--text-muted)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
                  {isVerified ? <ShieldCheck size={18} color="var(--success)" style={{ flexShrink: 0 }} /> : <AlertCircle size={18} color="var(--neutral-500)" style={{ flexShrink: 0 }} />}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{citation.source_doc || 'Untitled Document'}</p>
                      {isActive && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 8px', fontSize: 10, fontWeight: 700, borderRadius: 5, background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-light)', letterSpacing: '0.5px', flexShrink: 0 }}>
                          <GitBranch size={10} /> ACTIVE v{citation.doc_version}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                      {citation.chunk_id} {citation.doc_id && `· ${citation.doc_id} v${citation.doc_version}`}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, borderRadius: 6, letterSpacing: '0.5px', background: isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)', color: isVerified ? 'var(--success-light)' : 'var(--text-muted)' }}>
                    {isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                  </span>
                  <div style={{ width: 48, height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    <div style={{ width: `${citation.match_score * 100}%`, height: '100%', borderRadius: 3, background: isVerified ? (citation.match_score > 0.5 ? 'var(--success)' : 'var(--warning)') : 'var(--neutral-600)', transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', minWidth: 36, textAlign: 'right' }}>{Math.round(citation.match_score * 100)}%</span>
                </div>
              </button>

              {isOpen && (
                <div className="animate-fadeIn" style={{ padding: '0 20px 20px 56px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6 }}>Source Content</p>
                    <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', fontSize: 13, lineHeight: 1.6, color: 'var(--text-primary)' }}>{citation.chunk_content}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6 }}>Proof Hash (SHA-256)</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                        <Hash size={13} color="var(--accent-light)" />
                        <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-light)', fontWeight: 600 }}>{citation.proof_hash}</span>
                      </div>
                    </div>
                    {citation.matched_keywords.length > 0 && (
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6 }}>Matched Keywords</p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {citation.matched_keywords.map((kw, j) => (
                            <span key={j} style={{ padding: '4px 10px', fontSize: 12, fontWeight: 500, borderRadius: 6, background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary-light)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>{kw}</span>
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
    </div>
  )
}
