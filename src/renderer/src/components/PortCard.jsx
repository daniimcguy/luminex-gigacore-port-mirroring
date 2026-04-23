export default function PortCard({ port, role, selected, onClick }) {
  const isUp = port.status === 'up'

  const ledClass = isUp
    ? role === 'source'
      ? 'bg-blue-500 led-blue'
      : role === 'destination'
      ? 'bg-purple-500 led-purple'
      : 'bg-green-500 led-green'
    : 'bg-slate-700'

  const borderClass = selected
    ? 'border-white/60'
    : role === 'source'
    ? 'border-blue-600/80'
    : role === 'destination'
    ? 'border-purple-600/80'
    : 'border-slate-600/60'

  const bgClass =
    role === 'source'
      ? 'bg-blue-950/60 hover:bg-blue-900/40'
      : role === 'destination'
      ? 'bg-purple-950/60 hover:bg-purple-900/40'
      : isUp
      ? 'bg-slate-700/40 hover:bg-slate-600/40'
      : 'bg-slate-800/60 hover:bg-slate-700/40'

  return (
    <button
      onClick={() => onClick(port)}
      title={`Port ${port.id} — ${port.type} — ${isUp ? port.speed || 'UP' : 'DOWN'}`}
      className={`
        relative flex flex-col items-center justify-between
        w-14 h-16 rounded-md border-2 pt-2 pb-1.5
        transition-all duration-100 cursor-pointer
        ${bgClass} ${borderClass}
        ${selected ? 'scale-105 shadow-lg' : 'hover:scale-[1.03]'}
      `}
    >
      {/* LED */}
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${ledClass} ${isUp ? 'animate-pulse-slow' : ''}`}
      />

      {/* Port number */}
      <span className={`text-xs font-bold font-mono leading-none ${selected ? 'text-white' : 'text-slate-300'}`}>
        {port.id}
      </span>

      {/* Port type */}
      <span className="text-[9px] text-slate-500 leading-none">{port.type}</span>

      {/* Role badge */}
      {role !== 'none' && (
        <span
          className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-bold px-1 rounded-sm leading-none py-0.5 ${
            role === 'source'
              ? 'bg-blue-600 text-white'
              : 'bg-purple-600 text-white'
          }`}
        >
          {role === 'source' ? 'SRC' : 'DST'}
        </span>
      )}
    </button>
  )
}
