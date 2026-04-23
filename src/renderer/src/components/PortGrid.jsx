import PortCard from './PortCard'

export default function PortGrid({ switchInfo, ports, mirrorConfig, selectedPort, onPortClick }) {
  const { sources = [], destination } = mirrorConfig

  function getRoleOf(port) {
    if (sources.includes(port.id)) return 'source'
    if (destination === port.id) return 'destination'
    return 'none'
  }

  // Split ports into two rows for switch front-panel look
  const half = Math.ceil(ports.length / 2)
  const topRow = ports.slice(0, half)
  const bottomRow = ports.slice(half)

  return (
    <div className="switch-panel rounded-xl p-5 flex flex-col gap-3">
      {/* Switch model badge */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
            {switchInfo?.model || 'GigaCore'}
          </span>
          {mirrorConfig.enabled && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-400 border border-blue-800 font-medium animate-pulse-slow">
              MIRROR ACTIVE
            </span>
          )}
        </div>
        <span className="text-xs text-slate-600 font-mono">{switchInfo?.firmware ? `fw ${switchInfo.firmware}` : ''}</span>
      </div>

      {/* Port rows */}
      <div className="flex flex-col gap-2">
        <PortRow ports={topRow} getRoleOf={getRoleOf} selectedPort={selectedPort} onPortClick={onPortClick} />
        {bottomRow.length > 0 && (
          <PortRow ports={bottomRow} getRoleOf={getRoleOf} selectedPort={selectedPort} onPortClick={onPortClick} />
        )}
      </div>
    </div>
  )
}

function PortRow({ ports, getRoleOf, selectedPort, onPortClick }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {ports.map((port) => (
        <PortCard
          key={port.id}
          port={port}
          role={getRoleOf(port)}
          selected={selectedPort?.id === port.id}
          onClick={onPortClick}
        />
      ))}
    </div>
  )
}
