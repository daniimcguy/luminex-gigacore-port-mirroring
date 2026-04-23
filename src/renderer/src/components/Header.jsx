export default function Header({ switchInfo, onDisconnect }) {
  return (
    <header
      className="flex items-center justify-between px-5 border-b border-slate-700/60 bg-slate-900/95 backdrop-blur"
      style={{ height: 52, WebkitAppRegion: 'drag', paddingLeft: process.platform === 'darwin' ? 80 : 20 }}
    >
      {/* Logo + title */}
      <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' }}>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 led-blue" />
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 led-purple" />
        </div>
        <span className="text-sm font-semibold tracking-wide text-slate-200">
          GigaCore Port Mirror
        </span>
      </div>

      {/* Switch info + disconnect */}
      {switchInfo && (
        <div
          className="flex items-center gap-4 text-sm"
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow led-green" />
            <span className="font-medium text-slate-200">{switchInfo.model}</span>
            {switchInfo.name && (
              <span className="text-slate-500">{switchInfo.name}</span>
            )}
          </div>
          <button
            onClick={onDisconnect}
            className="px-3 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </header>
  )
}
