import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  ListTablesCommand,
  type AttributeDefinition,
  type GlobalSecondaryIndex,
  type KeySchemaElement,
  type LocalSecondaryIndex,
  type TableDescription
} from '@aws-sdk/client-dynamodb'
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb'
import { credentialsService } from './credentials.service'

// ── Exported interfaces ──────────────────────────────────────────────

export interface FilterExpression {
  attribute: string
  operator:
    | 'equals'
    | 'not_equals'
    | 'less_than'
    | 'less_equal'
    | 'greater_than'
    | 'greater_equal'
    | 'between'
    | 'begins_with'
    | 'contains'
    | 'not_contains'
    | 'exists'
    | 'not_exists'
  value?: unknown
  value2?: unknown // For "between" operator
}

export interface KeyCondition {
  partitionKey: { attribute: string; value: unknown }
  sortKey?: {
    attribute: string
    operator: 'equals' | 'less_than' | 'less_equal' | 'greater_than' | 'greater_equal' | 'between' | 'begins_with'
    value: unknown
    value2?: unknown
  }
}

export interface ScanResult {
  items: Record<string, unknown>[]
  lastEvaluatedKey?: Record<string, unknown>
  count: number
  scannedCount: number
}

export interface GSIInput {
  indexName: string
  partitionKey: { name: string; type: 'S' | 'N' | 'B' }
  sortKey?: { name: string; type: 'S' | 'N' | 'B' }
  projectionType: 'ALL' | 'KEYS_ONLY' | 'INCLUDE'
  nonKeyAttributes?: string[]
}

export interface LSIInput {
  indexName: string
  sortKey: { name: string; type: 'S' | 'N' | 'B' }
  projectionType: 'ALL' | 'KEYS_ONLY' | 'INCLUDE'
  nonKeyAttributes?: string[]
}

export interface CreateTableInput {
  tableName: string
  partitionKey: { name: string; type: 'S' | 'N' | 'B' }
  sortKey?: { name: string; type: 'S' | 'N' | 'B' }
  billingMode: 'PAY_PER_REQUEST' | 'PROVISIONED'
  readCapacity?: number
  writeCapacity?: number
  globalSecondaryIndexes?: GSIInput[]
  localSecondaryIndexes?: LSIInput[]
}

// ── Service class ────────────────────────────────────────────────────

export class DynamoDBService {
  /**
   * List all tables, paginating through results.
   */
  async listTables(): Promise<string[]> {
    const client = credentialsService.getClient()
    const tables: string[] = []
    let lastEvaluatedTableName: string | undefined

    do {
      const response = await client.send(
        new ListTablesCommand({
          ExclusiveStartTableName: lastEvaluatedTableName
        })
      )

      if (response.TableNames) {
        tables.push(...response.TableNames)
      }

      lastEvaluatedTableName = response.LastEvaluatedTableName
    } while (lastEvaluatedTableName)

    return tables.sort()
  }

  /**
   * Describe a table and return its full metadata.
   */
  async describeTable(tableName: string): Promise<TableDescription> {
    const client = credentialsService.getClient()
    const response = await client.send(
      new DescribeTableCommand({ TableName: tableName })
    )

    if (!response.Table) {
      throw new Error(`Table "${tableName}" not found`)
    }

    return response.Table
  }

  /**
   * Scan items from a table with optional filters.
   */
  async scanItems(params: {
    tableName: string
    filters?: FilterExpression[]
    limit?: number
    startKey?: Record<string, unknown>
  }): Promise<ScanResult> {
    const docClient = credentialsService.getDocClient()

    const commandInput: Record<string, unknown> = {
      TableName: params.tableName
    }

    if (params.limit) {
      commandInput.Limit = params.limit
    }

    if (params.startKey) {
      commandInput.ExclusiveStartKey = params.startKey
    }

    // Build filter expression
    if (params.filters && params.filters.length > 0) {
      const filterResult = this.buildFilterExpression(params.filters)
      commandInput.FilterExpression = filterResult.expression
      commandInput.ExpressionAttributeNames = filterResult.names
      commandInput.ExpressionAttributeValues = filterResult.values
    }

    const response = await docClient.send(new ScanCommand(commandInput as any))

    return {
      items: (response.Items as Record<string, unknown>[]) || [],
      lastEvaluatedKey: response.LastEvaluatedKey as Record<string, unknown> | undefined,
      count: response.Count || 0,
      scannedCount: response.ScannedCount || 0
    }
  }

  /**
   * Query items from a table using key conditions and optional filters.
   */
  async queryItems(params: {
    tableName: string
    keyCondition: KeyCondition
    indexName?: string
    filters?: FilterExpression[]
    limit?: number
    startKey?: Record<string, unknown>
  }): Promise<ScanResult> {
    const docClient = credentialsService.getDocClient()

    const expressionNames: Record<string, string> = {}
    const expressionValues: Record<string, unknown> = {}
    const keyConditions: string[] = []

    // Partition key condition (always equality)
    const pkAlias = '#pk'
    const pkValueAlias = ':pkVal'
    expressionNames[pkAlias] = params.keyCondition.partitionKey.attribute
    expressionValues[pkValueAlias] = params.keyCondition.partitionKey.value
    keyConditions.push(`${pkAlias} = ${pkValueAlias}`)

    // Sort key condition (optional)
    if (params.keyCondition.sortKey) {
      const sk = params.keyCondition.sortKey
      const skAlias = '#sk'
      expressionNames[skAlias] = sk.attribute

      switch (sk.operator) {
        case 'equals':
          expressionValues[':skVal'] = sk.value
          keyConditions.push(`${skAlias} = :skVal`)
          break
        case 'less_than':
          expressionValues[':skVal'] = sk.value
          keyConditions.push(`${skAlias} < :skVal`)
          break
        case 'less_equal':
          expressionValues[':skVal'] = sk.value
          keyConditions.push(`${skAlias} <= :skVal`)
          break
        case 'greater_than':
          expressionValues[':skVal'] = sk.value
          keyConditions.push(`${skAlias} > :skVal`)
          break
        case 'greater_equal':
          expressionValues[':skVal'] = sk.value
          keyConditions.push(`${skAlias} >= :skVal`)
          break
        case 'between':
          expressionValues[':skVal1'] = sk.value
          expressionValues[':skVal2'] = sk.value2
          keyConditions.push(`${skAlias} BETWEEN :skVal1 AND :skVal2`)
          break
        case 'begins_with':
          expressionValues[':skVal'] = sk.value
          keyConditions.push(`begins_with(${skAlias}, :skVal)`)
          break
      }
    }

    const commandInput: Record<string, unknown> = {
      TableName: params.tableName,
      KeyConditionExpression: keyConditions.join(' AND '),
      ExpressionAttributeNames: expressionNames,
      ExpressionAttributeValues: expressionValues
    }

    if (params.indexName) {
      commandInput.IndexName = params.indexName
    }

    if (params.limit) {
      commandInput.Limit = params.limit
    }

    if (params.startKey) {
      commandInput.ExclusiveStartKey = params.startKey
    }

    // Build filter expression for non-key attributes
    if (params.filters && params.filters.length > 0) {
      const filterResult = this.buildFilterExpression(params.filters, 'f')
      commandInput.FilterExpression = filterResult.expression
      Object.assign(expressionNames, filterResult.names)
      Object.assign(expressionValues, filterResult.values)
    }

    const response = await docClient.send(new QueryCommand(commandInput as any))

    return {
      items: (response.Items as Record<string, unknown>[]) || [],
      lastEvaluatedKey: response.LastEvaluatedKey as Record<string, unknown> | undefined,
      count: response.Count || 0,
      scannedCount: response.ScannedCount || 0
    }
  }

  /**
   * Get a single item by its key.
   */
  async getItem(
    tableName: string,
    key: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> {
    const docClient = credentialsService.getDocClient()

    const response = await docClient.send(
      new GetCommand({
        TableName: tableName,
        Key: key
      })
    )

    return (response.Item as Record<string, unknown>) || null
  }

  /**
   * Put (create or replace) an item.
   */
  async putItem(
    tableName: string,
    item: Record<string, unknown>
  ): Promise<void> {
    const docClient = credentialsService.getDocClient()

    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: item
      })
    )
  }

  /**
   * Update an item using a SET expression built from the provided attributes.
   */
  async updateItem(
    tableName: string,
    key: Record<string, unknown>,
    attributes: Record<string, unknown>
  ): Promise<void> {
    const docClient = credentialsService.getDocClient()

    const expressionParts: string[] = []
    const expressionNames: Record<string, string> = {}
    const expressionValues: Record<string, unknown> = {}

    let index = 0
    for (const [attrName, attrValue] of Object.entries(attributes)) {
      const nameAlias = `#attr${index}`
      const valueAlias = `:val${index}`
      expressionNames[nameAlias] = attrName
      expressionValues[valueAlias] = attrValue
      expressionParts.push(`${nameAlias} = ${valueAlias}`)
      index++
    }

    if (expressionParts.length === 0) {
      throw new Error('No attributes provided for update')
    }

    await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: key,
        UpdateExpression: `SET ${expressionParts.join(', ')}`,
        ExpressionAttributeNames: expressionNames,
        ExpressionAttributeValues: expressionValues
      })
    )
  }

  /**
   * Delete an item by its key.
   */
  async deleteItem(
    tableName: string,
    key: Record<string, unknown>
  ): Promise<void> {
    const docClient = credentialsService.getDocClient()

    await docClient.send(
      new DeleteCommand({
        TableName: tableName,
        Key: key
      })
    )
  }

  /**
   * Create a new table with optional GSIs and LSIs.
   */
  async createTable(input: CreateTableInput): Promise<void> {
    const client = credentialsService.getClient()

    const keySchema: KeySchemaElement[] = [
      { AttributeName: input.partitionKey.name, KeyType: 'HASH' }
    ]

    const attributeDefinitions: AttributeDefinition[] = [
      { AttributeName: input.partitionKey.name, AttributeType: input.partitionKey.type }
    ]

    if (input.sortKey) {
      keySchema.push({ AttributeName: input.sortKey.name, KeyType: 'RANGE' })
      attributeDefinitions.push({
        AttributeName: input.sortKey.name,
        AttributeType: input.sortKey.type
      })
    }

    const commandInput: Record<string, unknown> = {
      TableName: input.tableName,
      KeySchema: keySchema,
      AttributeDefinitions: attributeDefinitions,
      BillingMode: input.billingMode
    }

    if (input.billingMode === 'PROVISIONED') {
      commandInput.ProvisionedThroughput = {
        ReadCapacityUnits: input.readCapacity || 5,
        WriteCapacityUnits: input.writeCapacity || 5
      }
    }

    // Global Secondary Indexes
    if (input.globalSecondaryIndexes && input.globalSecondaryIndexes.length > 0) {
      const gsis: GlobalSecondaryIndex[] = input.globalSecondaryIndexes.map((gsi) => {
        // Add attribute definitions for GSI keys
        const existingAttrNames = attributeDefinitions.map((a) => a.AttributeName)

        if (!existingAttrNames.includes(gsi.partitionKey.name)) {
          attributeDefinitions.push({
            AttributeName: gsi.partitionKey.name,
            AttributeType: gsi.partitionKey.type
          })
        }

        const gsiKeySchema: KeySchemaElement[] = [
          { AttributeName: gsi.partitionKey.name, KeyType: 'HASH' }
        ]

        if (gsi.sortKey) {
          if (!existingAttrNames.includes(gsi.sortKey.name)) {
            attributeDefinitions.push({
              AttributeName: gsi.sortKey.name,
              AttributeType: gsi.sortKey.type
            })
          }
          gsiKeySchema.push({ AttributeName: gsi.sortKey.name, KeyType: 'RANGE' })
        }

        const gsiDef: GlobalSecondaryIndex = {
          IndexName: gsi.indexName,
          KeySchema: gsiKeySchema,
          Projection: {
            ProjectionType: gsi.projectionType,
            ...(gsi.projectionType === 'INCLUDE' && gsi.nonKeyAttributes
              ? { NonKeyAttributes: gsi.nonKeyAttributes }
              : {})
          }
        }

        if (input.billingMode === 'PROVISIONED') {
          gsiDef.ProvisionedThroughput = {
            ReadCapacityUnits: input.readCapacity || 5,
            WriteCapacityUnits: input.writeCapacity || 5
          }
        }

        return gsiDef
      })

      commandInput.GlobalSecondaryIndexes = gsis
    }

    // Local Secondary Indexes
    if (input.localSecondaryIndexes && input.localSecondaryIndexes.length > 0) {
      const lsis: LocalSecondaryIndex[] = input.localSecondaryIndexes.map((lsi) => {
        const existingAttrNames = attributeDefinitions.map((a) => a.AttributeName)

        if (!existingAttrNames.includes(lsi.sortKey.name)) {
          attributeDefinitions.push({
            AttributeName: lsi.sortKey.name,
            AttributeType: lsi.sortKey.type
          })
        }

        return {
          IndexName: lsi.indexName,
          KeySchema: [
            { AttributeName: input.partitionKey.name, KeyType: 'HASH' as const },
            { AttributeName: lsi.sortKey.name, KeyType: 'RANGE' as const }
          ],
          Projection: {
            ProjectionType: lsi.projectionType,
            ...(lsi.projectionType === 'INCLUDE' && lsi.nonKeyAttributes
              ? { NonKeyAttributes: lsi.nonKeyAttributes }
              : {})
          }
        }
      })

      commandInput.LocalSecondaryIndexes = lsis
    }

    await client.send(new CreateTableCommand(commandInput as any))
  }

  /**
   * Delete a table.
   */
  async deleteTable(tableName: string): Promise<void> {
    const client = credentialsService.getClient()
    await client.send(new DeleteTableCommand({ TableName: tableName }))
  }

  /**
   * Build a FilterExpression from an array of filter definitions.
   * @param prefix Optional prefix for expression attribute aliases to avoid conflicts
   */
  private buildFilterExpression(
    filters: FilterExpression[],
    prefix = 'filter'
  ): {
    expression: string
    names: Record<string, string>
    values: Record<string, unknown>
  } {
    const expressions: string[] = []
    const names: Record<string, string> = {}
    const values: Record<string, unknown> = {}

    filters.forEach((filter, index) => {
      const nameAlias = `#${prefix}${index}`
      const valueAlias = `:${prefix}Val${index}`
      names[nameAlias] = filter.attribute

      switch (filter.operator) {
        case 'equals':
          values[valueAlias] = filter.value
          expressions.push(`${nameAlias} = ${valueAlias}`)
          break
        case 'not_equals':
          values[valueAlias] = filter.value
          expressions.push(`${nameAlias} <> ${valueAlias}`)
          break
        case 'less_than':
          values[valueAlias] = filter.value
          expressions.push(`${nameAlias} < ${valueAlias}`)
          break
        case 'less_equal':
          values[valueAlias] = filter.value
          expressions.push(`${nameAlias} <= ${valueAlias}`)
          break
        case 'greater_than':
          values[valueAlias] = filter.value
          expressions.push(`${nameAlias} > ${valueAlias}`)
          break
        case 'greater_equal':
          values[valueAlias] = filter.value
          expressions.push(`${nameAlias} >= ${valueAlias}`)
          break
        case 'between': {
          const valueAlias2 = `:${prefix}Val${index}b`
          values[valueAlias] = filter.value
          values[valueAlias2] = filter.value2
          expressions.push(`${nameAlias} BETWEEN ${valueAlias} AND ${valueAlias2}`)
          break
        }
        case 'begins_with':
          values[valueAlias] = filter.value
          expressions.push(`begins_with(${nameAlias}, ${valueAlias})`)
          break
        case 'contains':
          values[valueAlias] = filter.value
          expressions.push(`contains(${nameAlias}, ${valueAlias})`)
          break
        case 'not_contains':
          values[valueAlias] = filter.value
          expressions.push(`NOT contains(${nameAlias}, ${valueAlias})`)
          break
        case 'exists':
          expressions.push(`attribute_exists(${nameAlias})`)
          break
        case 'not_exists':
          expressions.push(`attribute_not_exists(${nameAlias})`)
          break
      }
    })

    return {
      expression: expressions.join(' AND '),
      names,
      values
    }
  }
}

export const dynamoDBService = new DynamoDBService()
