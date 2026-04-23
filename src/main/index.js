import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import http from 'http'
import net from 'net'

const isDev = !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#0f172a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  })

  win.once('ready-to-show', () => win.show())

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ─── Mock data (used when ip === 'demo') ─────────────────────────────────────

const MOCK_INFO = {
  model: 'GigaCore 16',
  firmware: '3.4.1',
  name: 'GigaCore-DEMO',
  uptime: 172800,
  macAddress: '00:1A:2B:3C:4D:5E',
  ipAddress: 'demo',
}

function buildMockPorts() {
  const activeIds = new Set([1, 2, 3, 5, 7, 9, 10, 12, 16])
  return Array.from({ length: 16 }, (_, i) => {
    const id = i + 1
    const up = activeIds.has(id)
    return {
      id,
      name: `P${id}`,
      type: id <= 12 ? 'SFP+' : 'RJ45',
      speed: up ? (id <= 12 ? '10G' : '1G') : null,
      status: up ? 'up' : 'down',
      vlan: id <= 12 ? 10 : 1,
      txBytes: up ? Math.floor(Math.random() * 2e9) : 0,
      rxBytes: up ? Math.floor(Math.random() * 1.5e9) : 0,
    }
  })
}

const mockMirror = { enabled: false, sources: [], destination: null, direction: 'both' }

// ─── HTTP helper ──────────────────────────────────────────────────────────────

function switchRequest(ip, path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null
    const req = http.request(
      {
        hostname: ip,
        port: 80,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
        },
        timeout: 5000,
      },
      (res) => {
        let data = ''
        res.on('data', (c) => (data += c))
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) })
          } catch {
            resolve({ status: res.statusCode, data })
          }
        })
      }
    )
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Connection timed out'))
    })
    if (bodyStr) req.write(bodyStr)
    req.end()
  })
}

// ─── IPC handlers ─────────────────────────────────────────────────────────────

ipcMain.handle('switch:connect', async (_, { ip }) => {
  if (ip === 'demo') return { success: true, data: MOCK_INFO }
  try {
    const r = await switchRequest(ip, '/api/v1/system/info')
    return r.status === 200
      ? { success: true, data: r.data }
      : { success: false, error: `HTTP ${r.status} — not a GigaCore switch` }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('switch:getPorts', async (_, { ip }) => {
  if (ip === 'demo') return { success: true, data: buildMockPorts() }
  try {
    const r = await switchRequest(ip, '/api/v1/ports')
    return { success: r.status === 200, data: r.data, error: r.status !== 200 ? `HTTP ${r.status}` : undefined }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('switch:getMirrorConfig', async (_, { ip }) => {
  if (ip === 'demo') return { success: true, data: { ...mockMirror } }
  try {
    const r = await switchRequest(ip, '/api/v1/mirroring')
    return { success: r.status === 200, data: r.data }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('switch:setMirrorConfig', async (_, { ip, config }) => {
  if (ip === 'demo') {
    Object.assign(mockMirror, config)
    return { success: true, data: { ...mockMirror } }
  }
  try {
    const r = await switchRequest(ip, '/api/v1/mirroring', 'POST', config)
    return { success: r.status === 200 || r.status === 204, data: r.data }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('switch:deleteMirrorConfig', async (_, { ip }) => {
  if (ip === 'demo') {
    Object.assign(mockMirror, { enabled: false, sources: [], destination: null })
    return { success: true }
  }
  try {
    const r = await switchRequest(ip, '/api/v1/mirroring', 'DELETE')
    return { success: r.status === 200 || r.status === 204 }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('switch:getStats', async (_, { ip, portId }) => {
  if (ip === 'demo') {
    return {
      success: true,
      data: {
        portId,
        txBytes: Math.floor(Math.random() * 3e9),
        rxBytes: Math.floor(Math.random() * 3e9),
        txPackets: Math.floor(Math.random() * 2e7),
        rxPackets: Math.floor(Math.random() * 2e7),
        errors: 0,
        drops: 0,
      },
    }
  }
  try {
    const r = await switchRequest(ip, `/api/v1/statistics/${portId}`)
    return { success: r.status === 200, data: r.data }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// Discovery: scan local subnets for GigaCore switches
ipcMain.handle('switch:discover', async () => {
  const found = []
  const subnets = ['192.168.1', '192.168.0', '10.0.0', '10.0.1']
  const CONCURRENCY = 60

  function probeTCP(ip) {
    return new Promise((resolve) => {
      const s = new net.Socket()
      s.setTimeout(800)
      s.connect(80, ip, () => {
        s.destroy()
        switchRequest(ip, '/api/v1/system/info')
          .then((r) => resolve(r.status === 200 && r.data ? { ip, ...r.data } : null))
          .catch(() => resolve(null))
      })
      s.on('error', () => { s.destroy(); resolve(null) })
      s.on('timeout', () => { s.destroy(); resolve(null) })
    })
  }

  const ips = subnets.flatMap((s) =>
    Array.from({ length: 254 }, (_, i) => `${s}.${i + 1}`)
  )

  for (let i = 0; i < ips.length; i += CONCURRENCY) {
    const batch = ips.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(batch.map((ip) => probeTCP(ip)))
    results.forEach((r) => { if (r.status === 'fulfilled' && r.value) found.push(r.value) })
  }

  return { success: true, data: found }
})
