import { useState, useEffect } from 'react'

const DIRECTIONS = [
  { value: 'both', label: 'Both (ingress + egress)' },
  { value: 'ingress', label: 'Ingress only' },
  { value: 'egress', label: 'Egress only' },
]

export default function MirrorPanel({ ports, mirrorConfig, onApply, onClear, lastRefreshed }) {
  const [sources, setSources] = useState(mirrorConfig.sources ?? [])
  const [destination, setDestination] = useState(mirrorConfig.destination ?? null)
  const [direction, setDirection] = useState(mirrorConfig.direction ?? 'both')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Sync when external config changes (e.g. polling refresh)
  useEffect(() => {
    setSources(mirrorConfig.sources ?? [])
    setDestination(mirrorConfig.destination ?? null)
    setDirection(mirrorConfig.direction ?? 'both')
  }, [mirrorConfig])

  function toggleSource(portId) {
    if (portId === destination) setDestination(null)
    setSources((prev) =>
      prev.includes(portId) ? prev.filter((id) => id !== portId) : [...prev, portId]
    )
  }

  function setDest(portId) {
    setSources((prev) => prev.filter((id) => id !== portId))
    setDestination(portId)
  }

  async function handleApply() {
    if (sources.length === 0) return showFeedback('error', 'Select at least one source port.')
    if (!destination) return showFeedback('error', 'Select a destination port.')
    setSaving(true)
    const result = await onApply({ sources, destination, direction })
    setSaving(false)
    showFeedback(result.success ? 'ok' : 'error', result.success ? 'Mirror applied successfully.' : result.error)
  }

  async function handleClear() {
    setSaving(true)
    const result = await onClear()
    setSaving(false)
    if (result.success) {
      setSources([])
      setDestination(null)
      setDirection('both')
      showFeedback('ok', 'Mirror configuration cleared.')
    } else {
      showFeedback('error', result.error)
    }
  }

  function showFeedback(type, msg) {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 3500)
  }

  const upPorts = ports.filter((p) => p.status === 'up')

  return (
    <div className="flex flex-col h-full overflow-y-auto p-5 gap-5">
      {/* Status badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300">Mirror Configuration</h2>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
            mirrorConfig.enabled
              ? 'bg-blue-900/40 text-blue-400 border-blue-800'
              : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}
        >
          {mirrorConfig.enabled ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Source ports */}
      <section>
        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
          Source Ports
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ports.map((port) => {
            const isSrc = sources.includes(port.id)
            const isDst = destination === port.id
            return (
              <button
                key={port.id}
                disabled={isDst}
                onClick={() => toggleSource(port.id)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition-colors ${
                  isSrc
                    ? 'bg-blue-600 text-white border-blue-500'
                    : isDst
                    ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                    : port.status === 'up'
                    ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                    : 'bg-slate-800 text-slate-600 border-slate-700 hover:bg-slate-700'
                }`}
              >
                P{port.id}
              </button>
            )
          })}
        </div>
        {sources.length > 0 && (
          <p className="mt-1.5 text-xs text-blue-400">
            {sources.length} port{sources.length > 1 ? 's' : ''} selected
          </p>
        )}
      </section>

      {/* Destination port */}
      <section>
        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
          Destination Port
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ports.map((port) => {
            const isDst = destination === port.id
            const isSrc = sources.includes(port.id)
            return (
              <button
                key={port.id}
                disabled={isSrc}
                onClick={() => setDest(port.id)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition-colors ${
                  isDst
                    ? 'bg-purple-600 text-white border-purple-500'
                    : isSrc
                    ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                    : port.status === 'up'
                    ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                    : 'bg-slate-800 text-slate-600 border-slate-700 hover:bg-slate-700'
                }`}
              >
                P{port.id}
              </button>
            )
          })}
        </div>
        {destination && (
          <p className="mt-1.5 text-xs text-purple-400">
            Port {destination} selected as destination
          </p>
        )}
      </section>

      {/* Direction */}
      <section>
        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
          Traffic Direction
        </label>
        <div className="flex flex-col gap-1.5">
          {DIRECTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-300 hover:text-slate-100"
            >
              <input
                type="radio"
                value={value}
                checked={direction === value}
                onChange={() => setDirection(value)}
                className="accent-blue-500"
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {/* Feedback */}
      {feedback && (
        <div
          className={`px-3 py-2.5 rounded-lg text-sm border ${
            feedback.type === 'ok'
              ? 'bg-green-950/60 text-green-300 border-green-800/60'
              : 'bg-red-950/60 text-red-300 border-red-800/60'
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-slate-700/60">
        <button
          onClick={handleApply}
          disabled={saving || sources.length === 0 || !destination}
          className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          {saving ? 'Applying…' : 'Apply Mirror'}
        </button>
        {mirrorConfig.enabled && (
          <button
            onClick={handleClear}
            disabled={saving}
            className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium transition-colors disabled:opacity-40"
          >
            Clear Mirror
          </button>
        )}
      </div>

      {lastRefreshed && (
        <p className="text-[10px] text-slate-600 text-center -mt-2">
          Last updated {lastRefreshed.toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
