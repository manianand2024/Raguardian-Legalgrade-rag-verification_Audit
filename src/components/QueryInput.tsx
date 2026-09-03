interface QueryInputProps {
  userQuery: string
  setUserQuery: (v: string) => void
  llmOutput: string
  setLlmOutput: (v: string) => void
}

export default function QueryInput({
  userQuery,
  setUserQuery,
  llmOutput,
  setLlmOutput,
}: QueryInputProps) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: 8,
            letterSpacing: '0.3px',
          }}
        >
          User Query
        </label>
        <input
          type="text"
          value={userQuery}
          onChange={e => setUserQuery(e.target.value)}
          placeholder="e.g. What is the API key rotation policy?"
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: 14,
            borderRadius: 10,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-primary)',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
        />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <label
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: 8,
            letterSpacing: '0.3px',
          }}
        >
          LLM Output
        </label>
        <textarea
          value={llmOutput}
          onChange={e => setLlmOutput(e.target.value)}
          placeholder="Paste the LLM-generated response here..."
          rows={8}
          style={{
            width: '100%',
            padding: '14px 16px',
            fontSize: 14,
            lineHeight: 1.6,
            borderRadius: 10,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-primary)',
            resize: 'vertical',
            minHeight: 180,
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
        />
      </div>
    </div>
  )
}
