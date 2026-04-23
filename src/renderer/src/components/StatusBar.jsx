export default function StatusBar({ switchInfo, switchIp }) {
  if (!switchInfo) {
    return (
      <footer className="h-6 flex items-center px-4 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-600">
        Not connected
      </footer>
    )
  }

  function formatUptime(seconds) {
    if (!seconds) return null
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (d > 0) return `${d}d ${h}h uptime`
    if (h > 0) return `${h}h ${m}m uptime`
    return `${m}m uptime`
  }

  const items = [
    ['IP', switchIp],
    ['Model', switchInfo.model],
    switchInfo.firmware ? ['Firmware', switchInfo.firmware] : null,
    switchInfo.uptime ? [null, formatUptime(switchInfo.uptime)] : null,
    switchInfo.macAddress ? ['MAC', switchInfo.macAddress] : null,
  ].filter(Boolean)

  return (
    <footer className="h-6 flex items-center px-4 gap-4 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-500">
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Connected
      </span>
      {items.map(([label, value]) => (
        <span key={label ?? value} className="font-mono">
          {label && <span className="text-slate-600">{label}: </span>}
          <span className="text-slate-400">{value}</span>
        </span>
      ))}
    </footer>
  )
}
