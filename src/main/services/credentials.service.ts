import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { fromIni } from '@aws-sdk/credential-providers'
import { loadSharedConfigFiles } from '@aws-sdk/shared-ini-file-loader'

export class CredentialsService {
  private client: DynamoDBClient | null = null
  private docClient: DynamoDBDocumentClient | null = null
  private connected = false

  /**
   * List all available AWS credential profiles from shared config files.
   */
  async listProfiles(): Promise<string[]> {
    try {
      const configFiles = await loadSharedConfigFiles()
      const profileNames = new Set<string>()

      // Collect profiles from credentials file
      if (configFiles.credentialsFile) {
        for (const profileName of Object.keys(configFiles.credentialsFile)) {
          profileNames.add(profileName)
        }
      }

      // Collect profiles from config file
      if (configFiles.configFile) {
        for (const profileName of Object.keys(configFiles.configFile)) {
          profileNames.add(profileName)
        }
      }

      return Array.from(profileNames).sort()
    } catch (error) {
      console.error('Failed to load AWS profiles:', error)
      return []
    }
  }

  /**
   * Connect using a named AWS profile and region.
   */
  async connectWithProfile(profile: string, region: string): Promise<void> {
    this.disconnect()

    const credentials = fromIni({ profile })

    this.client = new DynamoDBClient({
      region,
      credentials
    })

    this.docClient = DynamoDBDocumentClient.from(this.client, {
      marshallOptions: {
        convertEmptyValues: false,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true
      },
      unmarshallOptions: {
        wrapNumbers: false
      }
    })

    this.connected = true
  }

  /**
   * Connect using explicit access key credentials.
   */
  async connectWithKeys(
    accessKeyId: string,
    secretAccessKey: string,
    region: string,
    endpoint?: string
  ): Promise<void> {
    this.disconnect()

    const clientConfig: ConstructorParameters<typeof DynamoDBClient>[0] = {
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    }

    if (endpoint) {
      clientConfig.endpoint = endpoint
    }

    this.client = new DynamoDBClient(clientConfig)

    this.docClient = DynamoDBDocumentClient.from(this.client, {
      marshallOptions: {
        convertEmptyValues: false,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true
      },
      unmarshallOptions: {
        wrapNumbers: false
      }
    })

    this.connected = true
  }

  /**
   * Test the current connection by listing tables.
   */
  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false
    }

    try {
      await this.client.send(new ListTablesCommand({ Limit: 1 }))
      return true
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }

  /**
   * Get the raw DynamoDBClient. Throws if not connected.
   */
  getClient(): DynamoDBClient {
    if (!this.client) {
      throw new Error('Not connected. Please establish a connection first.')
    }
    return this.client
  }

  /**
   * Get the DynamoDBDocumentClient. Throws if not connected.
   */
  getDocClient(): DynamoDBDocumentClient {
    if (!this.docClient) {
      throw new Error('Not connected. Please establish a connection first.')
    }
    return this.docClient
  }

  /**
   * Disconnect and clean up resources.
   */
  disconnect(): void {
    if (this.client) {
      this.client.destroy()
      this.client = null
    }
    this.docClient = null
    this.connected = false
  }

  /**
   * Check if currently connected.
   */
  isConnected(): boolean {
    return this.connected
  }
}

export const credentialsService = new CredentialsService()
