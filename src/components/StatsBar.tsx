import { ShieldCheck, AlertTriangle, Gauge, CheckCircle2, Database, Receipt } from 'lucide-react'
import type { VerificationResult } from '../lib/verification'

interface StatsBarProps {
  result: VerificationResult
  savedToDb: boolean
}

export default function StatsBar({ result, savedToDb }: StatsBarProps) {
  const isBlocked = result.compliance_status === 'BLOCKED_HALLUCINATION'
  const stats = [
    {
      label: 'Compliance Status',
      value: isBlocked ? 'BLOCKED' : 'PASSED',
      icon: isBlocked ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />,
      color: isBlocked ? 'var(--error)' : 'var(--success)',
      bg: isBlocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'Risk Score',
      value: `${result.risk_score}/100`,
      icon: <Gauge size={20} />,
      color: result.risk_score < 30 ? 'var(--success)' : result.risk_score < 70 ? 'var(--warning)' : 'var(--error)',
      bg: result.risk_score < 30 ? 'rgba(16, 185, 129, 0.1)' : result.risk_score < 70 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    },
    {
      label: 'Verified Claims',
      value: `${result.verified_claims.length}/${result.claim_results.length}`,
      icon: <CheckCircle2 size={20} />,
      color: 'var(--primary-light)',
      bg: 'rgba(59, 130, 246, 0.1)',
    },
    {
      label: 'ISO 42001',
      value: result.iso_42001_compliant ? 'COMPLIANT' : 'NON-COMPLIANT',
      icon: <ShieldCheck size={20} />,
      color: result.iso_42001_compliant ? 'var(--success)' : 'var(--error)',
      bg: result.iso_42001_compliant ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {stats.map((stat, i) => (
          <div key={stat.label} className="animate-countUp" style={{ animationDelay: `${i * 80}ms`, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>{stat.icon}</div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>{stat.label}</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: stat.color, letterSpacing: '-0.3px' }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Receipt ID + Cryptographic Lineage */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Receipt size={15} color="var(--accent-light)" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Receipt:</span>
          <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-light)', fontWeight: 600 }}>{result.receipt_id}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Query Hash:</span>
          <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>{result.query_hash}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Source Hash:</span>
          <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>{result.source_chunk_hash}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Active Doc:</span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{result.active_doc_id} v{result.active_doc_version}</span>
        </div>
      </div>

      {savedToDb && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: 13, color: 'var(--success-light)', fontWeight: 500 }}>
          <Database size={15} /> Audit trail saved to database and available in History
        </div>
      )}
    </div>
  )
}
