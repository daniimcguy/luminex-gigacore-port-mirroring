import { useState } from 'react'

export default function SwitchConnector({ onConnect, connecting, error }) {
  const [ip, setIp] = useState('')
  const [discovering, setDiscovering] = useState(false)
  const [discovered, setDiscovered] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (ip.trim()) onConnect(ip.trim())
  }

  async function handleDiscover() {
    setDiscovering(true)
    setDiscovered(null)
    const result = await window.api.discoverSwitches()
    setDiscovered(result.data || [])
    setDiscovering(false)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-4">
      {/* Icon */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
          <SwitchIcon />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-100">Connect to GigaCore Switch</h1>
          <p className="text-sm text-slate-400 mt-1">
            Enter the switch IP address or use{' '}
            <span className="font-mono text-blue-400">demo</span> to explore with sample data
          </p>
        </div>
      </div>

      {/* Connection form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="192.168.1.100 or demo"
            disabled={connecting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono disabled:opacity-50"
            autoFocus
          />
          <button
            type="submit"
            disabled={connecting || !ip.trim()}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {connecting ? 'Connecting…' : 'Connect'}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-300 text-sm">
            <span className="shrink-0">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-slate-600 text-xs">
          <div className="flex-1 h-px bg-slate-800" />
          <span>or</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <button
          type="button"
          onClick={handleDiscover}
          disabled={discovering || connecting}
          className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {discovering ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              Scanning network…
            </span>
          ) : (
            'Discover switches on network'
          )}
        </button>
      </form>

      {/* Discovery results */}
      {discovered !== null && (
        <div className="w-full max-w-md">
          {discovered.length === 0 ? (
            <p className="text-center text-sm text-slate-500">No GigaCore switches found on local subnets.</p>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Found switches</p>
              {discovered.map((sw) => (
                <button
                  key={sw.ip}
                  onClick={() => { setIp(sw.ip); onConnect(sw.ip) }}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-blue-600 text-left transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-200">{sw.model || 'GigaCore Switch'}</div>
                    <div className="text-xs text-slate-500">{sw.name || sw.ip}</div>
                  </div>
                  <span className="font-mono text-xs text-blue-400">{sw.ip}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SwitchIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="28" height="12" rx="2" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
      {[6, 10, 14, 18, 22, 26].map((x) => (
        <g key={x}>
          <rect x={x - 2} y="13" width="4" height="6" rx="0.5" fill="#1e293b" stroke="#475569" strokeWidth="0.5"/>
          <circle cx={x} cy="12" r="1" fill="#22c55e" opacity="0.8"/>
        </g>
      ))}
    </svg>
  )
}
