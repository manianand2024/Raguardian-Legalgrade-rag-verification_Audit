/*
 * RAG Verification Engine — 3-Pillar Approach
 * Pillar 1: Verifiable Retrieval (version hierarchy — latest binding version wins)
 * Pillar 2: Source-Grounded Guardrails (per-claim citation enforcement)
 * Pillar 3: Immutable Audit Trails (cryptographic lineage with receipt IDs)
 *
 * Also retains the original keyword + n-gram citation matching for full audit trail.
 */

export interface SourceChunk {
  id: string
  doc_name: string
  doc_id: string
  version: number
  content: string
  keywords: string[]
}

export interface VerifiedCitation {
  source_doc: string
  chunk_id: string
  chunk_content: string
  proof_hash: string
  status: 'VERIFIED_GROUNDED' | 'UNVERIFIED'
  match_score: number
  matched_keywords: string[]
  doc_id: string
  doc_version: number
  is_active_version: boolean
}

export interface ClaimResult {
  statement: string
  status: 'VERIFIED' | 'BLOCKED'
}

export interface VerificationResult {
  user_query: string
  llm_output: string
  audit_trail: VerifiedCitation[]
  hallucination_flag: boolean
  iso_42001_compliant: boolean
  risk_score: number
  grounded_count: number
  total_chunks: number
  // Pillar 1: Version hierarchy
  active_doc_id: string
  active_doc_version: number
  active_chunk_content: string
  // Pillar 2: Per-claim verification
  verified_claims: string[]
  blocked_claims: string[]
  claim_results: ClaimResult[]
  // Pillar 3: Immutable audit trail
  receipt_id: string
  query_hash: string
  source_chunk_hash: string
  compliance_status: 'PASSED_ISO42001' | 'BLOCKED_HALLUCINATION'
}

function sha256Short(text: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

async function sha256Browser(text: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return sha256Short(text)
  }
}

async function sha256Full(text: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return sha256Short(text) + sha256Short(text + 'x')
  }
}

function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2)
  )
}

function ngramSimilarity(a: string, b: string, n: number = 3): number {
  const tokensA = a.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
  const tokensB = b.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
  if (tokensA.length < n || tokensB.length < n) return 0
  const gramsA = new Set<string>()
  for (let i = 0; i <= tokensA.length - n; i++) gramsA.add(tokensA.slice(i, i + n).join(' '))
  const gramsB = new Set<string>()
  for (let i = 0; i <= tokensB.length - n; i++) gramsB.add(tokensB.slice(i, i + n).join(' '))
  let overlap = 0
  for (const g of gramsA) if (gramsB.has(g)) overlap++
  return overlap / Math.max(gramsA.size, gramsB.size, 1)
}

function parseClaims(llmOutput: string): string[] {
  return llmOutput
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

export async function verifyRagResponse(
  userQuery: string,
  retrievedChunks: SourceChunk[],
  llmOutput: string
): Promise<VerificationResult> {
  const llmLower = llmOutput.toLowerCase()
  const llmTokens = tokenize(llmOutput)
  const auditTrail: VerifiedCitation[] = []

  // Pillar 1: Verifiable Retrieval — sort by version descending, highest wins
  const sortedChunks = [...retrievedChunks].sort((a, b) => b.version - a.version)
  const activeChunk = sortedChunks[0]

  // Build audit trail with keyword + n-gram matching (existing functionality)
  for (const chunk of retrievedChunks) {
    const proofHash = await sha256Browser(chunk.content)
    const matchedKeywords = chunk.keywords.filter(kw => llmLower.includes(kw.toLowerCase()))
    const chunkTokens = tokenize(chunk.content)
    let tokenOverlap = 0
    let tokenTotal = 0
    for (const t of chunkTokens) { tokenTotal++; if (llmTokens.has(t)) tokenOverlap++ }
    const overlapRatio = tokenTotal > 0 ? tokenOverlap / tokenTotal : 0
    const ngSim = ngramSimilarity(llmOutput, chunk.content, 3)
    const keywordScore = chunk.keywords.length > 0 ? matchedKeywords.length / chunk.keywords.length : 0
    const matchScore = Math.min(1, keywordScore * 0.4 + overlapRatio * 0.3 + ngSim * 0.3)
    const isGrounded = matchedKeywords.length > 0 || matchScore >= 0.15

    auditTrail.push({
      source_doc: chunk.doc_name,
      chunk_id: chunk.id,
      chunk_content: chunk.content,
      proof_hash: proofHash,
      status: isGrounded ? 'VERIFIED_GROUNDED' : 'UNVERIFIED',
      match_score: Math.round(matchScore * 100) / 100,
      matched_keywords: matchedKeywords,
      doc_id: chunk.doc_id,
      doc_version: chunk.version,
      is_active_version: chunk.id === activeChunk.id,
    })
  }

  // Pillar 2: Source-Grounded Guardrails — per-claim citation enforcement
  const claims = parseClaims(llmOutput)
  const activeContentLower = activeChunk.content.toLowerCase()
  const verifiedClaims: string[] = []
  const blockedClaims: string[] = []
  const claimResults: ClaimResult[] = []

  for (const claim of claims) {
    const claimLower = claim.toLowerCase()
    // Check if the claim text exists in the active (latest version) source chunk
    if (activeContentLower.includes(claimLower) || claimLower.includes(activeContentLower)) {
      verifiedClaims.push(claim)
      claimResults.push({ statement: claim, status: 'VERIFIED' })
    } else {
      // Also check partial match — if key phrases from the claim appear in source
      const claimTokens = claimLower.split(/\s+/).filter((w: string) => w.length > 3)
      const matchedInSource = claimTokens.filter((t: string) => activeContentLower.includes(t))
      const matchRatio = claimTokens.length > 0 ? matchedInSource.length / claimTokens.length : 0
      if (matchRatio >= 0.6) {
        verifiedClaims.push(claim)
        claimResults.push({ statement: claim, status: 'VERIFIED' })
      } else {
        blockedClaims.push(claim)
        claimResults.push({ statement: claim, status: 'BLOCKED' })
      }
    }
  }

  // Determine compliance — blocked if any claims are unverified or no claims verified
  const isBlocked = blockedClaims.length > 0 || verifiedClaims.length === 0
  const complianceStatus = isBlocked ? 'BLOCKED_HALLUCINATION' : 'PASSED_ISO42001'

  // Pillar 3: Immutable Audit Trails — cryptographic lineage
  const chunkHash = await sha256Full(activeChunk.content)
  const queryHash = await sha256Full(userQuery)
  const receiptId = `REC-${(await sha256Full(queryHash + chunkHash)).slice(0, 8)}`

  // Existing risk score calculation
  const groundedCitations = auditTrail.filter(c => c.status === 'VERIFIED_GROUNDED')
  const groundedCount = groundedCitations.length
  const totalChunks = retrievedChunks.length
  let riskScore: number
  if (totalChunks === 0) riskScore = 100
  else riskScore = Math.round((1 - groundedCount / totalChunks) * 100)

  // Also factor in blocked claims
  if (blockedClaims.length > 0) {
    const claimRisk = Math.round((blockedClaims.length / Math.max(claims.length, 1)) * 100)
    riskScore = Math.max(riskScore, claimRisk)
  }

  const isHallucination = isBlocked
  const isCompliant = !isBlocked

  return {
    user_query: userQuery,
    llm_output: llmOutput,
    audit_trail: auditTrail,
    hallucination_flag: isHallucination,
    iso_42001_compliant: isCompliant,
    risk_score: riskScore,
    grounded_count: groundedCount,
    total_chunks: totalChunks,
    active_doc_id: activeChunk.doc_id || activeChunk.doc_name,
    active_doc_version: activeChunk.version,
    active_chunk_content: activeChunk.content,
    verified_claims: verifiedClaims,
    blocked_claims: blockedClaims,
    claim_results: claimResults,
    receipt_id: receiptId,
    query_hash: queryHash.slice(0, 16),
    source_chunk_hash: chunkHash.slice(0, 16),
    compliance_status: complianceStatus,
  }
}
