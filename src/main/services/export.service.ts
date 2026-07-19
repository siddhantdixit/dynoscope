import { dialog } from 'electron'
import { writeFileSync } from 'fs'
import Papa from 'papaparse'

export class ExportService {
  /**
   * Export data as a JSON file. Opens a save dialog and writes the file.
   */
  async exportToJSON(data: Record<string, unknown>[]): Promise<string | null> {
    const result = await dialog.showSaveDialog({
      title: 'Export as JSON',
      defaultPath: 'dynamodb-export.json',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (result.canceled || !result.filePath) {
      return null
    }

    const jsonContent = JSON.stringify(data, null, 2)
    writeFileSync(result.filePath, jsonContent, 'utf-8')

    return result.filePath
  }

  /**
   * Export data as a CSV file. Flattens nested objects and uses PapaParse for conversion.
   */
  async exportToCSV(data: Record<string, unknown>[]): Promise<string | null> {
    const result = await dialog.showSaveDialog({
      title: 'Export as CSV',
      defaultPath: 'dynamodb-export.csv',
      filters: [
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (result.canceled || !result.filePath) {
      return null
    }

    // Flatten nested objects for CSV compatibility
    const flattenedData = data.map((item) => this.flattenObject(item))

    const csvContent = Papa.unparse(flattenedData)
    writeFileSync(result.filePath, csvContent, 'utf-8')

    return result.filePath
  }

  /**
   * Recursively flatten a nested object into a single-level object with dot-notation keys.
   * Arrays are JSON-stringified.
   */
  private flattenObject(
    obj: Record<string, unknown>,
    prefix = '',
    result: Record<string, unknown> = {}
  ): Record<string, unknown> {
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key

      if (value === null || value === undefined) {
        result[newKey] = ''
      } else if (Array.isArray(value)) {
        result[newKey] = JSON.stringify(value)
      } else if (typeof value === 'object') {
        this.flattenObject(value as Record<string, unknown>, newKey, result)
      } else {
        result[newKey] = value
      }
    }

    return result
  }
}

export const exportService = new ExportService()
