import { Plus, Trash2, FileText, GitBranch } from 'lucide-react'
import type { SourceChunk } from '../lib/verification'

interface ChunkManagerProps {
  chunks: SourceChunk[]
  addChunk: () => void
  updateChunk: (index: number, field: keyof SourceChunk, value: string | string[] | number) => void
  removeChunk: (index: number) => void
}

export default function ChunkManager({ chunks, addChunk, updateChunk, removeChunk }: ChunkManagerProps) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={18} color="var(--primary-light)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>
            Source Chunks ({chunks.length})
          </span>
        </div>
        <button onClick={addChunk} style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, borderRadius: 8, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-dark)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--primary)')}
        >
          <Plus size={14} /> Add Chunk
        </button>
      </div>

      {chunks.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px dashed var(--border-light)' }}>
          <FileText size={32} color="var(--neutral-600)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>No source chunks added yet</p>
          <p style={{ fontSize: 12, color: 'var(--neutral-600)' }}>Add document chunks to verify LLM output against</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
          {chunks.map((chunk, i) => (
            <div key={chunk.id} className="animate-slideIn" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', fontFamily: 'JetBrains Mono, monospace' }}>{chunk.id}</span>
                <button onClick={() => removeChunk(i)} style={{ background: 'transparent', color: 'var(--error)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={chunk.doc_name} onChange={e => updateChunk(i, 'doc_name', e.target.value)} placeholder="Document name" style={{ flex: 2, padding: '8px 12px', fontSize: 13, borderRadius: 8, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                <input type="text" value={chunk.doc_id} onChange={e => updateChunk(i, 'doc_id', e.target.value)} placeholder="Doc ID (e.g. POLICY-01)" style={{ flex: 1, padding: '8px 12px', fontSize: 13, borderRadius: 8, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <GitBranch size={14} color="var(--accent-light)" style={{ flexShrink: 0 }} />
                <input type="number" step="0.1" value={chunk.version} onChange={e => updateChunk(i, 'version', e.target.value)} placeholder="Version" style={{ width: 100, padding: '8px 12px', fontSize: 13, borderRadius: 8, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Higher version = active binding source</span>
              </div>
              <textarea value={chunk.content} onChange={e => updateChunk(i, 'content', e.target.value)} placeholder="Chunk content..." rows={3} style={{ width: '100%', padding: '10px 12px', fontSize: 13, lineHeight: 1.5, borderRadius: 8, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)', resize: 'vertical' }} />
              <input type="text" value={chunk.keywords.join(', ')} onChange={e => updateChunk(i, 'keywords', e.target.value)} placeholder="Keywords (comma-separated)" style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
