export interface IpcResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface ElectronAPI {
  credentials: {
    listProfiles: () => Promise<IpcResponse<string[]>>
    connectWithProfile: (profile: string, region: string) => Promise<IpcResponse<boolean>>
    connectWithKeys: (
      accessKeyId: string,
      secretAccessKey: string,
      region: string,
      endpoint?: string
    ) => Promise<IpcResponse<boolean>>
    testConnection: () => Promise<IpcResponse<boolean>>
    disconnect: () => Promise<IpcResponse<void>>
    isConnected: () => Promise<IpcResponse<boolean>>
  }

  dynamodb: {
    listTables: () => Promise<IpcResponse<string[]>>
    describeTable: (tableName: string) => Promise<IpcResponse>
    scanItems: (params: {
      tableName: string
      filters?: unknown[]
      limit?: number
      startKey?: Record<string, unknown>
    }) => Promise<IpcResponse>
    queryItems: (params: {
      tableName: string
      keyCondition: unknown
      indexName?: string
      filters?: unknown[]
      limit?: number
      startKey?: Record<string, unknown>
    }) => Promise<IpcResponse>
    getItem: (tableName: string, key: Record<string, unknown>) => Promise<IpcResponse>
    putItem: (tableName: string, item: Record<string, unknown>) => Promise<IpcResponse>
    updateItem: (
      tableName: string,
      key: Record<string, unknown>,
      attributes: Record<string, unknown>
    ) => Promise<IpcResponse>
    deleteItem: (tableName: string, key: Record<string, unknown>) => Promise<IpcResponse>
    createTable: (input: unknown) => Promise<IpcResponse>
    deleteTable: (tableName: string) => Promise<IpcResponse>
  }

  export: {
    toJSON: (data: Record<string, unknown>[]) => Promise<IpcResponse<string | null>>
    toCSV: (data: Record<string, unknown>[]) => Promise<IpcResponse<string | null>>
  }

  app: {
    onMenuCommand: (callback: (command: string) => void) => () => void
  }
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
