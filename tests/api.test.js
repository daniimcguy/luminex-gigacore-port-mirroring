import { describe, it, expect } from 'vitest'

// Unit tests for pure utility logic. IPC/Electron is exercised via integration tests
// against real hardware or the demo mode.

describe('mirror config validation', () => {
  function validateMirrorConfig({ sources, destination, direction }) {
    if (!sources || sources.length === 0) return 'At least one source port is required'
    if (!destination) return 'A destination port is required'
    if (sources.includes(destination)) return 'Destination cannot be a source port'
    if (!['both', 'ingress', 'egress'].includes(direction)) return 'Invalid direction'
    return null
  }

  it('rejects empty sources', () => {
    expect(validateMirrorConfig({ sources: [], destination: 16, direction: 'both' })).toBeTruthy()
  })

  it('rejects missing destination', () => {
    expect(validateMirrorConfig({ sources: [1], destination: null, direction: 'both' })).toBeTruthy()
  })

  it('rejects source === destination', () => {
    expect(validateMirrorConfig({ sources: [5], destination: 5, direction: 'both' })).toBeTruthy()
  })

  it('accepts valid config', () => {
    expect(validateMirrorConfig({ sources: [1, 2, 3], destination: 16, direction: 'ingress' })).toBeNull()
  })

  it('rejects invalid direction', () => {
    expect(validateMirrorConfig({ sources: [1], destination: 16, direction: 'sideways' })).toBeTruthy()
  })
})

describe('port formatting', () => {
  function fmtBytes(bytes) {
    if (!bytes) return '—'
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
    return `${(bytes / 1e3).toFixed(0)} KB`
  }

  it('formats bytes to GB', () => {
    expect(fmtBytes(2_500_000_000)).toBe('2.50 GB')
  })

  it('formats bytes to MB', () => {
    expect(fmtBytes(45_000_000)).toBe('45.0 MB')
  })

  it('formats bytes to KB', () => {
    expect(fmtBytes(500_000)).toBe('500 KB')
  })

  it('returns — for zero/null', () => {
    expect(fmtBytes(0)).toBe('—')
    expect(fmtBytes(null)).toBe('—')
  })
})
