import { useState, useEffect, useCallback } from 'react'
import PortGrid from './PortGrid'
import MirrorPanel from './MirrorPanel'

export default function Dashboard({ switchIp, switchInfo }) {
  const [ports, setPorts] = useState([])
  const [mirrorConfig, setMirrorConfig] = useState({
    enabled: false,
    sources: [],
    destination: null,
    direction: 'both',
  })
  const [selectedPort, setSelectedPort] = useState(null)
  const [selectedStats, setSelectedStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState(null)

  const loadData = useCallback(async () => {
    const [portsRes, mirrorRes] = await Promise.all([
      window.api.getPorts(switchIp),
      window.api.getMirrorConfig(switchIp),
    ])
    if (portsRes.success) setPorts(portsRes.data)
    if (mirrorRes.success) setMirrorConfig(mirrorRes.data)
    setLoading(false)
    setLastRefreshed(new Date())
  }, [switchIp])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [loadData])

  async function handlePortClick(port) {
    if (selectedPort?.id === port.id) {
      setSelectedPort(null)
      setSelectedStats(null)
      return
    }
    setSelectedPort(port)
    const statsRes = await window.api.getStats(switchIp, port.id)
    if (statsRes.success) setSelectedStats(statsRes.data)
  }

  async function handleApplyMirror(config) {
    const result = await window.api.setMirrorConfig(switchIp, { ...config, enabled: true })
    if (result.success) setMirrorConfig({ ...config, enabled: true })
    return result
  }

  async function handleClearMirror() {
    const result = await window.api.deleteMirrorConfig(switchIp)
    if (result.success)
      setMirrorConfig({ enabled: false, sources: [], destination: null, direction: 'both' })
    return result
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-slate-400">
        <span className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
        Loading switch data…
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6">
        {/* Switch front panel */}
        <PortGrid
          switchInfo={switchInfo}
          ports={ports}
          mirrorConfig={mirrorConfig}
          selectedPort={selectedPort}
          onPortClick={handlePortClick}
        />

        {/* Port detail card */}
        {selectedPort ? (
          <PortDetail port={selectedPort} stats={selectedStats} />
        ) : (
          <Legend />
        )}
      </div>

      {/* Right: Mirror config */}
      <aside className="w-80 border-l border-slate-700/60 flex flex-col overflow-hidden">
        <MirrorPanel
          ports={ports}
          mirrorConfig={mirrorConfig}
          onApply={handleApplyMirror}
          onClear={handleClearMirror}
          lastRefreshed={lastRefreshed}
        />
      </aside>
    </div>
  )
}

function PortDetail({ port, stats }) {
  function fmt(bytes) {
    if (!bytes) return '—'
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
    return `${(bytes / 1e3).toFixed(0)} KB`
  }

  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-sm font-semibold text-slate-200">Port {port.id}</span>
          <span className="ml-2 text-xs text-slate-500">{port.type}</span>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            port.status === 'up'
              ? 'bg-green-900/50 text-green-400 border border-green-800'
              : 'bg-slate-700 text-slate-500 border border-slate-600'
          }`}
        >
          {port.status === 'up' ? port.speed || 'UP' : 'DOWN'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        {[
          ['TX', fmt(stats?.txBytes ?? port.txBytes)],
          ['RX', fmt(stats?.rxBytes ?? port.rxBytes)],
          ['TX Packets', stats?.txPackets ? stats.txPackets.toLocaleString() : '—'],
          ['RX Packets', stats?.rxPackets ? stats.rxPackets.toLocaleString() : '—'],
          ['Errors', stats?.errors ?? '—'],
          ['VLAN', port.vlan ?? '—'],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-200 font-mono">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Legend() {
  return (
    <div className="flex items-center gap-5 text-xs text-slate-500 px-1">
      {[
        ['bg-green-500', 'Active'],
        ['bg-blue-500', 'Mirror source'],
        ['bg-purple-500', 'Mirror destination'],
        ['bg-slate-600', 'Inactive'],
      ].map(([color, label]) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
          {label}
        </div>
      ))}
      <span className="ml-auto text-slate-600">Click a port for details</span>
    </div>
  )
}
