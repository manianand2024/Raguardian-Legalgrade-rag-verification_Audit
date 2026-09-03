export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '24px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Mani Anand Sagar Yenubothula
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.3px' }}>
            AI Researcher · AI Security · Cybersecurity · CISO
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {['Pillar 1: Verifiable Retrieval', 'Pillar 2: Source-Grounded Guardrails', 'Pillar 3: Immutable Audit Trails'].map((pillar, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '4px 10px', borderRadius: 6, background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
              {pillar}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
