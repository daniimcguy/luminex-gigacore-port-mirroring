import { useState } from 'react'
import Header from './components/Header'
import SwitchConnector from './components/SwitchConnector'
import Dashboard from './components/Dashboard'
import StatusBar from './components/StatusBar'

export default function App() {
  const [connectedIp, setConnectedIp] = useState(null)
  const [switchInfo, setSwitchInfo] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)

  async function handleConnect(ip) {
    setConnecting(true)
    setError(null)
    const result = await window.api.connectSwitch(ip.trim())
    if (result.success) {
      setSwitchInfo(result.data)
      setConnectedIp(ip.trim())
    } else {
      setError(result.error || 'Could not connect to switch')
    }
    setConnecting(false)
  }

  function handleDisconnect() {
    setSwitchInfo(null)
    setConnectedIp(null)
    setError(null)
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden">
      <Header switchInfo={switchInfo} onDisconnect={handleDisconnect} />
      <main className="flex-1 overflow-hidden">
        {switchInfo ? (
          <Dashboard switchIp={connectedIp} switchInfo={switchInfo} />
        ) : (
          <SwitchConnector
            onConnect={handleConnect}
            connecting={connecting}
            error={error}
          />
        )}
      </main>
      <StatusBar switchInfo={switchInfo} switchIp={connectedIp} />
    </div>
  )
}
