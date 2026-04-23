import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  connectSwitch: (ip) => ipcRenderer.invoke('switch:connect', { ip }),
  getPorts: (ip) => ipcRenderer.invoke('switch:getPorts', { ip }),
  getMirrorConfig: (ip) => ipcRenderer.invoke('switch:getMirrorConfig', { ip }),
  setMirrorConfig: (ip, config) => ipcRenderer.invoke('switch:setMirrorConfig', { ip, config }),
  deleteMirrorConfig: (ip) => ipcRenderer.invoke('switch:deleteMirrorConfig', { ip }),
  getStats: (ip, portId) => ipcRenderer.invoke('switch:getStats', { ip, portId }),
  discoverSwitches: () => ipcRenderer.invoke('switch:discover'),
})
