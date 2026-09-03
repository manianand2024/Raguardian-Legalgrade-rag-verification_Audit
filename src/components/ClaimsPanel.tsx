import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react'
import type { VerificationResult } from '../lib/verification'

interface ClaimsPanelProps {
  result: VerificationResult
}

export default function ClaimsPanel({ result }: ClaimsPanelProps) {
  const hasClaims = result.claim_results.length > 0

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <ShieldCheck size={20} color="var(--primary-light)" />
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
          Pillar 2: Source-Grounded Guardrails — Per-Claim Verification
        </h2>
      </div>

      {!hasClaims ? (
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No claims parsed from LLM output.</p>
        </div>
      ) : (
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {result.claim_results.map((claim, i) => {
            const isVerified = claim.status === 'VERIFIED'
            return (
              <div key={i} className="animate-fadeIn" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 10, background: 'var(--bg-secondary)', border: `1px solid ${isVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                {isVerified ? (
                  <CheckCircle2 size={18} color="var(--success)" style={{ marginTop: 2, flexShrink: 0 }} />
                ) : (
                  <XCircle size={18} color="var(--error)" style={{ marginTop: 2, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>{claim.statement}</p>
                </div>
                <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, borderRadius: 6, letterSpacing: '0.5px', flexShrink: 0, background: isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: isVerified ? 'var(--success-light)' : 'var(--error-light)' }}>
                  {isVerified ? 'VERIFIED' : 'BLOCKED'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
