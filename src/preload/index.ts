import { contextBridge, ipcRenderer } from 'electron'

const api = {
  credentials: {
    listProfiles: () => ipcRenderer.invoke('credentials:list-profiles'),
    connectWithProfile: (profile: string, region: string) =>
      ipcRenderer.invoke('credentials:connect-profile', profile, region),
    connectWithKeys: (
      accessKeyId: string,
      secretAccessKey: string,
      region: string,
      endpoint?: string
    ) => ipcRenderer.invoke('credentials:connect-keys', accessKeyId, secretAccessKey, region, endpoint),
    testConnection: () => ipcRenderer.invoke('credentials:test-connection'),
    disconnect: () => ipcRenderer.invoke('credentials:disconnect'),
    isConnected: () => ipcRenderer.invoke('credentials:is-connected')
  },

  dynamodb: {
    listTables: () => ipcRenderer.invoke('dynamodb:list-tables'),
    describeTable: (tableName: string) =>
      ipcRenderer.invoke('dynamodb:describe-table', tableName),
    scanItems: (params: {
      tableName: string
      filters?: unknown[]
      limit?: number
      startKey?: Record<string, unknown>
    }) => ipcRenderer.invoke('dynamodb:scan-items', params),
    queryItems: (params: {
      tableName: string
      keyCondition: unknown
      indexName?: string
      filters?: unknown[]
      limit?: number
      startKey?: Record<string, unknown>
    }) => ipcRenderer.invoke('dynamodb:query-items', params),
    getItem: (tableName: string, key: Record<string, unknown>) =>
      ipcRenderer.invoke('dynamodb:get-item', tableName, key),
    putItem: (tableName: string, item: Record<string, unknown>) =>
      ipcRenderer.invoke('dynamodb:put-item', tableName, item),
    updateItem: (
      tableName: string,
      key: Record<string, unknown>,
      attributes: Record<string, unknown>
    ) => ipcRenderer.invoke('dynamodb:update-item', tableName, key, attributes),
    deleteItem: (tableName: string, key: Record<string, unknown>) =>
      ipcRenderer.invoke('dynamodb:delete-item', tableName, key),
    createTable: (input: unknown) =>
      ipcRenderer.invoke('dynamodb:create-table', input),
    deleteTable: (tableName: string) =>
      ipcRenderer.invoke('dynamodb:delete-table', tableName)
  },

  export: {
    toJSON: (data: Record<string, unknown>[]) =>
      ipcRenderer.invoke('export:json', data),
    toCSV: (data: Record<string, unknown>[]) =>
      ipcRenderer.invoke('export:csv', data)
  },

  app: {
    onMenuCommand: (callback: (command: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, command: string) => callback(command)
      ipcRenderer.on('menu-command', handler)
      // Return a cleanup function
      return () => {
        ipcRenderer.removeListener('menu-command', handler)
      }
    }
  }
}

contextBridge.exposeInMainWorld('api', api)
