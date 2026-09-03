import { ShieldCheck, AlertTriangle, FileText, GitBranch, Receipt } from 'lucide-react'
import type { VerificationResult } from '../lib/verification'

interface ResultsPanelProps {
  result: VerificationResult
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
  const isSafe = !result.hallucination_flag

  return (
    <div style={{ background: 'var(--bg-card)', border: `1px solid ${isSafe ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', background: isSafe ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${isSafe ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
        {isSafe ? <ShieldCheck size={24} color="var(--success)" /> : <AlertTriangle size={24} color="var(--error)" />}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: isSafe ? 'var(--success-light)' : 'var(--error-light)' }}>
            {isSafe ? 'Output Verified — All Claims Grounded in Source Data' : 'Hallucination Detected — Unverified Claims Blocked'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            {isSafe
              ? `${result.verified_claims.length} claims verified against ${result.active_doc_id} v${result.active_doc_version}. Compliance: ${result.compliance_status}`
              : `${result.blocked_claims.length} claim(s) blocked. No grounding in active source version. Compliance: ${result.compliance_status}`}
          </p>
        </div>
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Pillar 1: Version Hierarchy */}
        <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <GitBranch size={16} color="var(--accent-light)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Pillar 1: Verifiable Retrieval — Active Binding Source</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>
            <span style={{ fontWeight: 600 }}>{result.active_doc_id}</span> version <span style={{ fontWeight: 600, color: 'var(--accent-light)' }}>{result.active_doc_version}</span> selected as the latest binding version.
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontStyle: 'italic' }}>
            "{result.active_chunk_content}"
          </p>
        </div>

        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>User Query</p>
          <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 14, color: 'var(--text-primary)' }}>{result.user_query}</div>
        </div>

        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>LLM Output</p>
          <div style={{ padding: '16px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{result.llm_output}</div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <FileText size={14} color="var(--success-light)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--success-light)' }}>{result.verified_claims.length} Verified Claims</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <FileText size={14} color="var(--error-light)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--error-light)' }}>{result.blocked_claims.length} Blocked Claims</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <Receipt size={14} color="var(--accent-light)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>{result.receipt_id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
