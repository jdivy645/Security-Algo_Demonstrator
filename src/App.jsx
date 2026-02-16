import { useEffect, useRef, useState } from 'react'
import './App.css'

const ALGORITHMS = [
  {
    id: 'caesar',
    name: 'Caesar Cipher',
    description: 'Shift each letter by a fixed amount in the alphabet.',
    fields: [
      { name: 'text', label: 'Text', type: 'textarea', placeholder: 'HELLO WORLD', default: 'HELLO WORLD' },
      { name: 'shift', label: 'Shift (0-25)', type: 'number', default: 3 },
      {
        name: 'mode',
        label: 'Mode',
        type: 'select',
        default: 'encrypt',
        options: [
          { value: 'encrypt', label: 'Encrypt' },
          { value: 'decrypt', label: 'Decrypt' },
        ],
      },
    ],
  },
  {
    id: 'playfair',
    name: 'Playfair Cipher',
    description: 'Digraph substitution cipher using a 5x5 key square.',
    fields: [
      { name: 'text', label: 'Text', type: 'textarea', placeholder: 'HIDE THE GOLD', default: 'HIDE THE GOLD' },
      { name: 'key', label: 'Key', type: 'text', default: 'MONARCHY' },
      {
        name: 'mode',
        label: 'Mode',
        type: 'select',
        default: 'encrypt',
        options: [
          { value: 'encrypt', label: 'Encrypt' },
          { value: 'decrypt', label: 'Decrypt' },
        ],
      },
    ],
  },
  {
    id: 'hill',
    name: 'Hill Cipher',
    description: 'Linear algebra cipher with a 2x2 key matrix.',
    fields: [
      { name: 'text', label: 'Text', type: 'textarea', placeholder: 'ATTACK', default: 'ATTACK' },
      { name: 'matrix', label: 'Key matrix (a,b,c,d)', type: 'text', default: '3,3,2,5' },
      {
        name: 'mode',
        label: 'Mode',
        type: 'select',
        default: 'encrypt',
        options: [
          { value: 'encrypt', label: 'Encrypt' },
          { value: 'decrypt', label: 'Decrypt' },
        ],
      },
    ],
  },
  {
    id: 'vigenere',
    name: 'Vigenere Cipher',
    description: 'Polyalphabetic cipher using a repeating key.',
    fields: [
      { name: 'text', label: 'Text', type: 'textarea', placeholder: 'DEFEND THE EAST', default: 'DEFEND THE EAST' },
      { name: 'key', label: 'Key', type: 'text', default: 'LEMON' },
      {
        name: 'mode',
        label: 'Mode',
        type: 'select',
        default: 'encrypt',
        options: [
          { value: 'encrypt', label: 'Encrypt' },
          { value: 'decrypt', label: 'Decrypt' },
        ],
      },
    ],
  },
  {
    id: 'rail',
    name: 'Rail Fence + Columnar',
    description: 'Transposition using zig-zag rails or column order.',
    fields: [
      { name: 'text', label: 'Text', type: 'textarea', placeholder: 'WE ARE DISCOVERED', default: 'WE ARE DISCOVERED' },
      {
        name: 'variant',
        label: 'Variant',
        type: 'select',
        default: 'rail',
        options: [
          { value: 'rail', label: 'Rail Fence' },
          { value: 'columnar', label: 'Columnar Transposition' },
        ],
      },
      { name: 'rails', label: 'Rails (Rail Fence)', type: 'number', default: 3 },
      { name: 'key', label: 'Key (Columnar)', type: 'text', default: 'ZEBRA' },
      {
        name: 'mode',
        label: 'Mode',
        type: 'select',
        default: 'encrypt',
        options: [
          { value: 'encrypt', label: 'Encrypt' },
          { value: 'decrypt', label: 'Decrypt' },
        ],
      },
    ],
  },
  {
    id: 'des',
    name: 'DES (Toy Demo)',
    description: 'Feistel-style toy demo to show round structure (not full DES).',
    fields: [
      { name: 'plaintext', label: 'Plaintext byte (0-255)', type: 'number', default: 201 },
      { name: 'key', label: 'Key byte (0-255)', type: 'number', default: 43 },
      { name: 'rounds', label: 'Rounds (1-6)', type: 'number', default: 3 },
      {
        name: 'mode',
        label: 'Mode',
        type: 'select',
        default: 'encrypt',
        options: [
          { value: 'encrypt', label: 'Encrypt' },
          { value: 'decrypt', label: 'Decrypt' },
        ],
      },
    ],
    note: 'Educational toy cipher. Do not use for security.',
  },
  {
    id: 'rsa',
    name: 'RSA',
    description: 'Public-key encryption with small primes for demo.',
    fields: [
      { name: 'p', label: 'Prime p', type: 'number', default: 61 },
      { name: 'q', label: 'Prime q', type: 'number', default: 53 },
      { name: 'e', label: 'Public exponent e', type: 'number', default: 17 },
      { name: 'message', label: 'Message (number)', type: 'number', default: 65 },
    ],
  },
  {
    id: 'dh',
    name: 'Diffie-Hellman',
    description: 'Key agreement with shared secret.',
    fields: [
      { name: 'p', label: 'Prime p', type: 'number', default: 23 },
      { name: 'g', label: 'Generator g', type: 'number', default: 5 },
      { name: 'a', label: 'Private a', type: 'number', default: 6 },
      { name: 'b', label: 'Private b', type: 'number', default: 15 },
    ],
  },
  {
    id: 'md5',
    name: 'MD5',
    description: 'Message digest (128-bit) for demonstration only.',
    fields: [
      { name: 'text', label: 'Message', type: 'textarea', default: 'security lab' },
    ],
    note: 'MD5 is broken for security. Use only for learning.'
  },
  {
    id: 'sha1',
    name: 'SHA-1',
    description: 'Hash function producing 160-bit digest.',
    fields: [
      { name: 'text', label: 'Message', type: 'textarea', default: 'security lab' },
    ],
    note: 'SHA-1 is deprecated for security. Use only for learning.'
  },
  {
    id: 'dss',
    name: 'DSS (DSA Demo)',
    description: 'Digital signature demonstration with small parameters.',
    fields: [
      { name: 'p', label: 'Prime p', type: 'number', default: 59 },
      { name: 'q', label: 'Prime q', type: 'number', default: 29 },
      { name: 'g', label: 'Generator g', type: 'number', default: 4 },
      { name: 'x', label: 'Private key x', type: 'number', default: 7 },
      { name: 'k', label: 'Nonce k', type: 'number', default: 9 },
      { name: 'message', label: 'Message', type: 'textarea', default: 'verify me' },
    ],
    note: 'Small primes are for demo only.'
  },
]

const buildDefaults = (fields) =>
  fields.reduce((acc, field) => {
    acc[field.name] = field.default ?? ''
    return acc
  }, {})

const runAlgorithm = async (algorithmId, inputs, signal) => {
  const response = await fetch(`/api/run/${algorithmId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs || {}),
    signal,
  })
  if (!response.ok) {
    let message = ''
    try {
      const data = await response.json()
      message = data?.error || ''
    } catch {
      message = ''
    }
    throw new Error(message || `Request failed with ${response.status}`)
  }
  return response.json()
}

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const toCleanAlpha = (value) =>
  (value || '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')

const mod = (n, m) => ((n % m) + m) % m

const chunkPairs = (text) => {
  const pairs = []
  for (let i = 0; i < text.length; i += 2) {
    pairs.push(text.slice(i, i + 2))
  }
  return pairs
}

const preparePlayfairText = (text) => {
  let cleaned = toCleanAlpha(text).replace(/J/g, 'I')
  const result = []
  for (let i = 0; i < cleaned.length; i += 1) {
    const a = cleaned[i]
    const b = cleaned[i + 1]
    if (!b || a === b) {
      result.push(a, 'X')
    } else {
      result.push(a, b)
      i += 1
    }
  }
  if (result.length % 2 !== 0) result.push('X')
  return result.join('')
}

const parseStep = (step) => {
  const text = String(step || '').trim()
  if (!text) return { label: 'Step', value: '(empty)', chips: [] }
  let label = 'Detail'
  let value = text
  if (text.includes(':')) {
    const parts = text.split(':')
    label = parts[0].trim() || label
    value = parts.slice(1).join(':').trim()
  } else if (text.includes('=')) {
    const parts = text.split('=')
    label = parts[0].trim() || label
    value = parts.slice(1).join('=').trim()
  }
  let chips = []
  if (value.includes(' | ')) {
    chips = value.split(' | ').map((item) => item.trim()).filter(Boolean)
  } else if (value.includes(' -> ')) {
    chips = value.split(' -> ').map((item) => item.trim()).filter(Boolean)
  } else if (value.includes(',') && value.split(',').length <= 8) {
    chips = value.split(',').map((item) => item.trim()).filter(Boolean)
  }
  return { label, value, chips }
}

const getPlayfairMatrix = (key) => {
  const cleaned = toCleanAlpha(key).replace(/J/g, 'I')
  const seen = new Set()
  const letters = []
  for (const ch of cleaned) {
    if (!seen.has(ch)) {
      seen.add(ch)
      letters.push(ch)
    }
  }
  for (const ch of ALPHA) {
    if (ch === 'J') continue
    if (!seen.has(ch)) {
      seen.add(ch)
      letters.push(ch)
    }
  }
  const matrix = []
  for (let i = 0; i < 5; i += 1) {
    matrix.push(letters.slice(i * 5, i * 5 + 5))
  }
  return matrix
}

const toMatrix2x2 = (input) => {
  const parts = (input || '')
    .split(/[\s,]+/)
    .map((val) => val.trim())
    .filter(Boolean)
    .map((val) => Number(val))
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
    return null
  }
  return [parts[0], parts[1], parts[2], parts[3]].map((n) => mod(n, 26))
}

const buildRailFenceGrid = (text, rails) => {
  const cleaned = toCleanAlpha(text)
  const railCount = Number(rails)
  if (!cleaned || railCount < 2) return []
  const grid = Array.from({ length: railCount }, () => Array(cleaned.length).fill(''))
  let row = 0
  let dir = 1
  for (let i = 0; i < cleaned.length; i += 1) {
    grid[row][i] = cleaned[i]
    row += dir
    if (row === 0 || row === railCount - 1) dir *= -1
  }
  return grid
}

const buildColumnarGrid = (text, key) => {
  const cleaned = toCleanAlpha(text)
  const keyClean = toCleanAlpha(key)
  const cols = keyClean.length
  if (!cols) return null
  const rows = Math.ceil(cleaned.length / cols)
  const grid = Array.from({ length: rows }, () => Array(cols).fill('X'))
  let idx = 0
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (idx < cleaned.length) grid[r][c] = cleaned[idx]
      idx += 1
    }
  }
  const order = keyClean
    .split('')
    .map((ch, i) => ({ ch, i }))
    .sort((a, b) => (a.ch === b.ch ? a.i - b.i : a.ch.localeCompare(b.ch)))
  return { grid, order, keyClean }
}

const InputField = ({ field, value, onChange }) => {
  const common = {
    id: field.name,
    name: field.name,
    value: value ?? '',
    onChange: (event) => onChange(field.name, event.target.value),
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        {...common}
        rows={4}
        placeholder={field.placeholder || ''}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <select {...common}>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }

  return (
    <input
      {...common}
      type={field.type || 'text'}
      placeholder={field.placeholder || ''}
    />
  )
}

const VisualizationPanel = ({ algorithm, inputs, result }) => {
  if (result?.error) {
    return (
      <div className="viz-card">
        <p className="output-title">Visualization</p>
        <p className="viz-muted">Fix the input error to see the visualization.</p>
      </div>
    )
  }

  if (algorithm.id === 'caesar') {
    const cleaned = toCleanAlpha(inputs.text)
    const shift = mod(Number(inputs.shift || 0), 26)
    const step = inputs.mode === 'decrypt' ? mod(26 - shift, 26) : shift
    const preview = cleaned.slice(0, 14).split('').map((ch, index) => ({
      from: ch,
      to: result?.output?.[index] || '',
    }))
    return (
      <div className="viz-card">
        <p className="output-title">Visualization</p>
        <div className="viz-row">
          <span>Shift</span>
          <strong>{step}</strong>
        </div>
        <div className="viz-pairs">
          {preview.length ? preview.map((pair, index) => (
            <div key={`caesar-${index}`} className="viz-chip">
              <span>{pair.from}</span>
              <span className="viz-arrow">→</span>
              <span>{pair.to}</span>
            </div>
          )) : <span className="viz-muted">No input yet.</span>}
        </div>
      </div>
    )
  }

  if (algorithm.id === 'vigenere') {
    const cleaned = toCleanAlpha(inputs.text)
    const keyClean = toCleanAlpha(inputs.key)
    const keyStream = cleaned
      .split('')
      .map((_, i) => keyClean[i % (keyClean.length || 1)] || '')
      .join('')
    return (
      <div className="viz-card">
        <p className="output-title">Visualization</p>
        <div className="viz-aligned">
          <span className="viz-label">Text</span>
          <span>{cleaned || '(empty)'}</span>
        </div>
        <div className="viz-aligned">
          <span className="viz-label">Key</span>
          <span>{keyStream || '(empty)'}</span>
        </div>
        <div className="viz-aligned">
          <span className="viz-label">Out</span>
          <span>{result?.output || '(empty)'}</span>
        </div>
      </div>
    )
  }

  if (algorithm.id === 'playfair') {
    const matrix = getPlayfairMatrix(inputs.key)
    const prepared = inputs.mode === 'decrypt'
      ? toCleanAlpha(inputs.text).replace(/J/g, 'I')
      : preparePlayfairText(inputs.text)
    const pairs = chunkPairs(prepared)
    return (
      <div className="viz-card">
        <p className="output-title">Visualization</p>
        <div className="viz-grid">
          {matrix.flat().map((cell, index) => (
            <span key={`pf-${index}`}>{cell}</span>
          ))}
        </div>
        <div className="viz-pairs">
          {pairs.map((pair, index) => (
            <div key={`pf-pair-${index}`} className="viz-chip">
              {pair}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (algorithm.id === 'hill') {
    const keyMatrix = toMatrix2x2(inputs.matrix)
    const cleaned = toCleanAlpha(inputs.text)
    const pairs = chunkPairs(cleaned.length % 2 === 0 ? cleaned : `${cleaned}X`)
    const outPairs = chunkPairs(result?.output || '')
    return (
      <div className="viz-card">
        <p className="output-title">Visualization</p>
        <div className="viz-matrix">
          <div>
            <span>{keyMatrix ? keyMatrix[0] : '-'}</span>
            <span>{keyMatrix ? keyMatrix[1] : '-'}</span>
          </div>
          <div>
            <span>{keyMatrix ? keyMatrix[2] : '-'}</span>
            <span>{keyMatrix ? keyMatrix[3] : '-'}</span>
          </div>
        </div>
        <div className="viz-pairs">
          {pairs.map((pair, index) => (
            <div key={`hill-${index}`} className="viz-chip">
              {pair} → {outPairs[index] || ''}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (algorithm.id === 'rail') {
    if (inputs.variant === 'columnar') {
      const gridData = buildColumnarGrid(inputs.text, inputs.key)
      return (
        <div className="viz-card">
          <p className="output-title">Visualization</p>
          {gridData ? (
            <>
              <div className="viz-key">
                {gridData.keyClean.split('').map((ch, index) => (
                  <span key={`key-${index}`}>{ch}</span>
                ))}
              </div>
              <div className="viz-grid">
                {gridData.grid.flat().map((cell, index) => (
                  <span key={`cg-${index}`}>{cell}</span>
                ))}
              </div>
              <div className="viz-order">
                Order: {gridData.order.map((o) => o.ch).join('')}
              </div>
            </>
          ) : (
            <p className="viz-muted">Enter a key to build the grid.</p>
          )}
        </div>
      )
    }
    const railGrid = buildRailFenceGrid(inputs.text, inputs.rails)
    return (
      <div className="viz-card">
        <p className="output-title">Visualization</p>
        {railGrid.length ? (
          <div className="viz-rail">
            {railGrid.map((row, rowIndex) => (
              <div key={`rail-${rowIndex}`}>
                {row.map((cell, index) => (
                  <span key={`rail-${rowIndex}-${index}`}>{cell || '·'}</span>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="viz-muted">Provide text and rails to see the pattern.</p>
        )}
      </div>
    )
  }

  if (algorithm.id === 'des') {
    const rounds = (result?.steps || [])
      .filter((step) => step.startsWith('Round'))
      .map((step) => {
        const match = step.match(/Round (\d+): k=([01]+) f=([01]+) -> L=([01]+) R=([01]+)/)
        if (!match) return null
        return {
          round: match[1],
          k: match[2],
          f: match[3],
          l: match[4],
          r: match[5],
        }
      })
      .filter(Boolean)
    return (
      <div className="viz-card">
        <p className="output-title">Visualization</p>
        <div className="viz-rounds">
          {rounds.map((row, index) => (
            <div key={`des-${index}`} className="viz-round">
              <span>R{row.round}</span>
              <span>k {row.k}</span>
              <span>f {row.f}</span>
              <span>L {row.l}</span>
              <span>R {row.r}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (algorithm.id === 'dss') {
    const steps = result?.steps || []
    const pick = (pattern) => {
      const step = steps.find((entry) => pattern.test(entry))
      if (!step) return null
      const match = step.match(pattern)
      return match?.[1]?.trim() || null
    }
    const y = pick(/Public key y .* = (.+)$/)
    const h = pick(/Hash h .* = (.+)$/)
    const r = pick(/r = .* = (.+)$/)
    const s = pick(/s = .* = (.+)$/)
    const v = pick(/Verify v = (.+)$/)
    const status = result?.output?.includes('valid')
      ? 'valid'
      : result?.output?.includes('invalid')
        ? 'invalid'
        : ''
    const entries = [
      { label: 'Public key y', value: y },
      { label: 'Hash h', value: h },
      { label: 'Signature r', value: r },
      { label: 'Signature s', value: s },
      { label: 'Verify v', value: v },
    ].filter((entry) => entry.value !== null)
    const signature = r && s ? `(${r}, ${s})` : ''
    return (
      <div className="viz-card">
        <p className="output-title">Visualization</p>
        <div className="viz-dss-banner">
          <div>
            <span className="viz-label">Signature</span>
            <div className="viz-dss-sig">{signature || result?.output || '(pending)'}</div>
          </div>
          {status ? (
            <span className={`viz-dss-status ${status === 'valid' ? 'ok' : 'bad'}`}>
              {status}
            </span>
          ) : null}
        </div>
        <div className="viz-list viz-dss-list">
          {entries.map((entry, index) => (
            <div key={`dss-${index}`}>
              <span>{entry.label}</span>
              <strong>{entry.value}</strong>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (algorithm.id === 'rsa' || algorithm.id === 'dh') {
    const entries = (result?.steps || []).map((step) => {
      const parts = step.split('=')
      if (parts.length < 2) return { label: step, value: '' }
      return { label: parts[0].trim(), value: parts.slice(1).join('=').trim() }
    })
    return (
      <div className="viz-card">
        <p className="output-title">Visualization</p>
        <div className="viz-list">
          {entries.map((entry, index) => (
            <div key={`entry-${index}`}>
              <span>{entry.label}</span>
              <strong>{entry.value}</strong>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (algorithm.id === 'md5' || algorithm.id === 'sha1') {
    const len = (inputs.text || '').length
    const blocks = Math.ceil((len + 9) / 64)
    return (
      <div className="viz-card">
        <p className="output-title">Visualization</p>
        <div className="viz-row">
          <span>Length</span>
          <strong>{len} chars</strong>
        </div>
        <div className="viz-row">
          <span>Blocks</span>
          <strong>{blocks} x 512-bit</strong>
        </div>
        <div className="viz-digest">{result?.output}</div>
      </div>
    )
  }

  return (
    <div className="viz-card">
      <p className="output-title">Visualization</p>
      <p className="viz-muted">Visualization is not available for this module yet.</p>
    </div>
  )
}

const AlgorithmPanel = ({ algorithm, inputs, onChange }) => {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')
  const [visibleSteps, setVisibleSteps] = useState(0)
  const copyTimer = useRef(null)
  const revealTimer = useRef(null)
  const fieldCount = algorithm.fields.length
  const outputText = result?.error ? result.error : result?.output || ''
  const stepsText = result?.steps ? result.steps.join('\n') : ''

  useEffect(
    () => () => {
      clearTimeout(copyTimer.current)
      clearInterval(revealTimer.current)
    },
    []
  )

  useEffect(() => {
    clearInterval(revealTimer.current)
    if (loading || !result?.steps?.length) {
      setVisibleSteps(0)
      return
    }
    setVisibleSteps(0)
    let index = 0
    revealTimer.current = setInterval(() => {
      index += 1
      setVisibleSteps(index)
      if (index >= result.steps.length) {
        clearInterval(revealTimer.current)
      }
    }, 200)
    return () => clearInterval(revealTimer.current)
  }, [loading, result?.steps])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    runAlgorithm(algorithm.id, inputs, controller.signal)
      .then((data) => setResult(data))
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setResult({ error: err?.message || 'Failed to run the algorithm.' })
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [algorithm.id, inputs])

  const handleCopy = (label, value) => {
    if (!value || !navigator?.clipboard) return
    navigator.clipboard.writeText(value).then(() => {
      setCopied(label)
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(''), 1400)
    }).catch(() => {})
  }

  return (
    <section className="workspace-panel">
      <div className="workspace-header">
        <div>
          <p className="panel-kicker">Algorithm workspace</p>
          <h2>{algorithm.name}</h2>
          <p className="panel-desc">{algorithm.description}</p>
          <div className="panel-meta">
            <span>{fieldCount} inputs</span>
            <span>Interactive steps</span>
            <span>Live output</span>
          </div>
        </div>
        {algorithm.note ? <span className="panel-note">{algorithm.note}</span> : null}
      </div>
      <div className="workspace-grid">
        <div className="workspace-card input-card">
          <p className="output-title">Inputs</p>
          <div className="panel-form">
            {algorithm.fields.map((field) => (
              <label key={field.name} className="form-field">
                <span>{field.label}</span>
                <InputField field={field} value={inputs[field.name]} onChange={onChange} />
              </label>
            ))}
          </div>
        </div>
        <div className="workspace-card result-card">
          <div className="result-grid">
            <div className="output-card">
              <p className="output-title">Output</p>
              {result?.error ? (
                <p className="output-error">{result.error}</p>
              ) : loading ? (
                <p className="output-muted">Running...</p>
              ) : (
                <p className="output-value">{result?.output || '(empty)'}</p>
              )}
              <div className="output-actions">
                <button
                  type="button"
                  className="ghost"
                  onClick={() => handleCopy('output', outputText)}
                  disabled={!outputText}
                >
                  Copy output
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => handleCopy('steps', stepsText)}
                  disabled={!stepsText}
                >
                  Copy steps
                </button>
                <span className={`copy-hint ${copied ? 'show' : ''}`}>
                  {copied ? `${copied} copied` : ''}
                </span>
              </div>
            </div>
            <VisualizationPanel algorithm={algorithm} inputs={inputs} result={result} />
          </div>
        </div>
      </div>
      <div className="workspace-card steps-card">
        <p className="output-title">Step-by-step</p>
        {loading ? (
          <p className="output-muted">Calculating steps...</p>
        ) : result?.steps ? (
          <ul className="steps-list">
            {result.steps.slice(0, visibleSteps).map((step, index) => {
              const parsed = parseStep(step)
              const label = parsed.label === 'Detail' ? `Step ${index + 1}` : parsed.label
              return (
                <li key={`${algorithm.id}-step-${index}`} style={{ '--i': index }} className="step-item">
                  <span className="step-index">{String(index + 1).padStart(2, '0')}</span>
                  <div className="step-body">
                    <span className="step-label">{label}</span>
                    {parsed.chips.length > 1 ? (
                      <div className="step-chips">
                        {parsed.chips.map((chip, chipIndex) => (
                          <span key={`${algorithm.id}-chip-${index}-${chipIndex}`}>{chip}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="step-value">{parsed.value || step}</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="output-muted">No steps available.</p>
        )}
      </div>
    </section>
  )
}

function App() {
  const [activeId, setActiveId] = useState(ALGORITHMS[0].id)
  const [inputsByAlgo, setInputsByAlgo] = useState(() =>
    ALGORITHMS.reduce((acc, algo) => {
      acc[algo.id] = buildDefaults(algo.fields)
      return acc
    }, {})
  )

  const activeAlgo = ALGORITHMS.find((algo) => algo.id === activeId) || ALGORITHMS[0]
  const algorithmCount = ALGORITHMS.length

  const handleInputChange = (name, value) => {
    setInputsByAlgo((prev) => ({
      ...prev,
      [activeAlgo.id]: {
        ...prev[activeAlgo.id],
        [name]: value,
      },
    }))
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <p className="brand-kicker">Security Lab</p>
          <h1>Algorithm Demonstrator</h1>
          <p className="brand-subtitle">Interactive walkthroughs for classical and modern crypto.</p>
        </div>
        <div className="sidebar-art" aria-hidden="true">
          <svg viewBox="0 0 320 200" role="img">
            <defs>
              <linearGradient id="pulse" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--accent-2)" />
              </linearGradient>
            </defs>
            <rect x="14" y="12" width="292" height="176" rx="24" fill="rgba(15, 24, 31, 0.06)" />
            <circle cx="72" cy="82" r="36" fill="url(#pulse)" opacity="0.75" />
            <circle cx="232" cy="110" r="42" fill="rgba(44, 127, 123, 0.18)" />
            <path
              d="M46 140 C82 118, 112 154, 148 132 C182 112, 214 118, 272 96"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.4"
            />
            <g fill="var(--ink)" opacity="0.5">
              <rect x="64" y="44" width="16" height="16" rx="4" />
              <rect x="120" y="70" width="16" height="16" rx="4" />
              <rect x="176" y="56" width="16" height="16" rx="4" />
              <rect x="212" y="78" width="16" height="16" rx="4" />
            </g>
          </svg>
        </div>
        <div className="sidebar-meta">
          <div>
            <span className="meta-label">Active Module</span>
            <span className="meta-value">{activeAlgo.name}</span>
          </div>
          <div>
            <span className="meta-label">Focus</span>
            <span className="meta-value">Interactive steps</span>
          </div>
        </div>
        <nav className="nav">
          {ALGORITHMS.map((algo) => (
            <button
              key={algo.id}
              className={`nav-item ${activeId === algo.id ? 'active' : ''}`}
              onClick={() => setActiveId(algo.id)}
              type="button"
              aria-pressed={activeId === algo.id}
            >
              <span>{algo.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div className="topbar-title">
            <p>Crypto Studio</p>
            <h2>Interactive Algorithm Workspace</h2>
          </div>
          <div className="topbar-actions">
            <button type="button" className="ghost">Export report</button>
            <button type="button" className="primary">New session</button>
          </div>
        </header>
        <section className="hero hero-wide">
          <div className="hero-text">
            <p className="hero-kicker">Crypto Lab Interface</p>
            <h2>
              Explore <span>{activeAlgo.name}</span> in detail
            </h2>
            <p>
              Input values, inspect each transformation, and compare outputs across algorithms.
              Designed for classroom demos and lab submissions.
            </p>
            <div className="hero-tags">
              <span>Substitution</span>
              <span>Transposition</span>
              <span>Public Key</span>
              <span>Hashing</span>
              <span>Signature</span>
            </div>
            <div className="hero-actions">
              <button type="button" className="primary">Start walkthrough</button>
              <button type="button" className="secondary">View quick guide</button>
            </div>
            <div className="hero-stats">
              <div>
                <span className="stat-label">Active module</span>
                <span className="stat-value">{activeAlgo.name}</span>
              </div>
              <div>
                <span className="stat-label">Input fields</span>
                <span className="stat-value">{activeAlgo.fields.length}</span>
              </div>
              <div>
                <span className="stat-label">Live steps</span>
                <span className="stat-value">{algorithmCount}</span>
              </div>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-orb" />
            <div className="hero-card">
              <p>Live Demo</p>
              <h3>{activeAlgo.name}</h3>
              <span>{algorithmCount} algorithms ready</span>
            </div>
            <div className="hero-ring" />
          </div>
        </section>
        <AlgorithmPanel
          algorithm={activeAlgo}
          inputs={inputsByAlgo[activeAlgo.id]}
          onChange={handleInputChange}
        />
      </main>
    </div>
  )
}

export default App
