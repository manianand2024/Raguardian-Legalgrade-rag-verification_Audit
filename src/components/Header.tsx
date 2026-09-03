import { Shield, FileSearch, History, Sparkles } from 'lucide-react'

type View = 'verify' | 'history'

interface HeaderProps {
  view: View
  setView: (v: View) => void
  onLoadExample: () => void
}

export default function Header({ view, setView, onLoadExample }: HeaderProps) {
  return (
    <header style={{ borderBottom: '1px solid var(--border)', background: 'rgba(10, 14, 26, 0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={22} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>RAGuardian</h1>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Legal-Grade RAG Verification & Audit</p>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onLoadExample} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, borderRadius: 8, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            <Sparkles size={14} /> Load Example
          </button>
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <button onClick={() => setView('verify')} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, borderRadius: 7, background: view === 'verify' ? 'var(--primary)' : 'transparent', color: view === 'verify' ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileSearch size={15} /> Verify
            </button>
            <button onClick={() => setView('history')} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, borderRadius: 7, background: view === 'history' ? 'var(--primary)' : 'transparent', color: view === 'history' ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
              <History size={15} /> History
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
