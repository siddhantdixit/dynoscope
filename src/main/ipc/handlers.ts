import { ipcMain } from 'electron'
import { credentialsService } from '../services/credentials.service'
import { dynamoDBService } from '../services/dynamodb.service'
import { exportService } from '../services/export.service'
import type { CreateTableInput, FilterExpression, KeyCondition } from '../services/dynamodb.service'

interface IpcResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

function success<T>(data: T): IpcResponse<T> {
  return { success: true, data }
}

function failure(error: unknown): IpcResponse {
  const message = error instanceof Error ? error.message : String(error)
  return { success: false, error: message }
}

export function registerIpcHandlers(): void {
  // ── Credentials ──────────────────────────────────────────────────

  ipcMain.handle('credentials:list-profiles', async (): Promise<IpcResponse<string[]>> => {
    try {
      const profiles = await credentialsService.listProfiles()
      return success(profiles)
    } catch (error) {
      return failure(error)
    }
  })

  ipcMain.handle(
    'credentials:connect-profile',
    async (_, profile: string, region: string): Promise<IpcResponse<boolean>> => {
      try {
        await credentialsService.connectWithProfile(profile, region)
        const connected = await credentialsService.testConnection()
        return success(connected)
      } catch (error) {
        return failure(error)
      }
    }
  )

  ipcMain.handle(
    'credentials:connect-keys',
    async (
      _,
      accessKeyId: string,
      secretAccessKey: string,
      region: string,
      endpoint?: string
    ): Promise<IpcResponse<boolean>> => {
      try {
        await credentialsService.connectWithKeys(accessKeyId, secretAccessKey, region, endpoint)
        const connected = await credentialsService.testConnection()
        return success(connected)
      } catch (error) {
        return failure(error)
      }
    }
  )

  ipcMain.handle('credentials:test-connection', async (): Promise<IpcResponse<boolean>> => {
    try {
      const result = await credentialsService.testConnection()
      return success(result)
    } catch (error) {
      return failure(error)
    }
  })

  ipcMain.handle('credentials:disconnect', async (): Promise<IpcResponse<void>> => {
    try {
      credentialsService.disconnect()
      return success(undefined)
    } catch (error) {
      return failure(error)
    }
  })

  ipcMain.handle('credentials:is-connected', async (): Promise<IpcResponse<boolean>> => {
    try {
      return success(credentialsService.isConnected())
    } catch (error) {
      return failure(error)
    }
  })

  // ── DynamoDB Tables ──────────────────────────────────────────────

  ipcMain.handle('dynamodb:list-tables', async (): Promise<IpcResponse<string[]>> => {
    try {
      const tables = await dynamoDBService.listTables()
      return success(tables)
    } catch (error) {
      return failure(error)
    }
  })

  ipcMain.handle(
    'dynamodb:describe-table',
    async (_, tableName: string): Promise<IpcResponse> => {
      try {
        const description = await dynamoDBService.describeTable(tableName)
        return success(description)
      } catch (error) {
        return failure(error)
      }
    }
  )

  // ── DynamoDB Items ───────────────────────────────────────────────

  ipcMain.handle(
    'dynamodb:scan-items',
    async (
      _,
      params: {
        tableName: string
        filters?: FilterExpression[]
        limit?: number
        startKey?: Record<string, unknown>
      }
    ): Promise<IpcResponse> => {
      try {
        const result = await dynamoDBService.scanItems(params)
        return success(result)
      } catch (error) {
        return failure(error)
      }
    }
  )

  ipcMain.handle(
    'dynamodb:query-items',
    async (
      _,
      params: {
        tableName: string
        keyCondition: KeyCondition
        indexName?: string
        filters?: FilterExpression[]
        limit?: number
        startKey?: Record<string, unknown>
      }
    ): Promise<IpcResponse> => {
      try {
        const result = await dynamoDBService.queryItems(params)
        return success(result)
      } catch (error) {
        return failure(error)
      }
    }
  )

  ipcMain.handle(
    'dynamodb:get-item',
    async (_, tableName: string, key: Record<string, unknown>): Promise<IpcResponse> => {
      try {
        const item = await dynamoDBService.getItem(tableName, key)
        return success(item)
      } catch (error) {
        return failure(error)
      }
    }
  )

  ipcMain.handle(
    'dynamodb:put-item',
    async (_, tableName: string, item: Record<string, unknown>): Promise<IpcResponse> => {
      try {
        await dynamoDBService.putItem(tableName, item)
        return success(undefined)
      } catch (error) {
        return failure(error)
      }
    }
  )

  ipcMain.handle(
    'dynamodb:update-item',
    async (
      _,
      tableName: string,
      key: Record<string, unknown>,
      attributes: Record<string, unknown>
    ): Promise<IpcResponse> => {
      try {
        await dynamoDBService.updateItem(tableName, key, attributes)
        return success(undefined)
      } catch (error) {
        return failure(error)
      }
    }
  )

  ipcMain.handle(
    'dynamodb:delete-item',
    async (_, tableName: string, key: Record<string, unknown>): Promise<IpcResponse> => {
      try {
        await dynamoDBService.deleteItem(tableName, key)
        return success(undefined)
      } catch (error) {
        return failure(error)
      }
    }
  )

  // ── DynamoDB Table Management ────────────────────────────────────

  ipcMain.handle(
    'dynamodb:create-table',
    async (_, input: CreateTableInput): Promise<IpcResponse> => {
      try {
        await dynamoDBService.createTable(input)
        return success(undefined)
      } catch (error) {
        return failure(error)
      }
    }
  )

  ipcMain.handle(
    'dynamodb:delete-table',
    async (_, tableName: string): Promise<IpcResponse> => {
      try {
        await dynamoDBService.deleteTable(tableName)
        return success(undefined)
      } catch (error) {
        return failure(error)
      }
    }
  )

  // ── Export ───────────────────────────────────────────────────────

  ipcMain.handle(
    'export:json',
    async (_, data: Record<string, unknown>[]): Promise<IpcResponse<string | null>> => {
      try {
        const filePath = await exportService.exportToJSON(data)
        return success(filePath)
      } catch (error) {
        return failure(error)
      }
    }
  )

  ipcMain.handle(
    'export:csv',
    async (_, data: Record<string, unknown>[]): Promise<IpcResponse<string | null>> => {
      try {
        const filePath = await exportService.exportToCSV(data)
        return success(filePath)
      } catch (error) {
        return failure(error)
      }
    }
  )
}
