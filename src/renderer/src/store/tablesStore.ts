import { create } from 'zustand'

interface TablesState {
  tables: string[]
  selectedTable: string | null
  tableDescriptions: Record<string, any>
  isLoading: boolean
  error: string | null
  searchQuery: string
  setTables: (tables: string[]) => void
  selectTable: (table: string | null) => void
  setTableDescription: (table: string, description: any) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  filteredTables: () => string[]
}

export const useTablesStore = create<TablesState>((set, get) => ({
  tables: [],
  selectedTable: null,
  tableDescriptions: {},
  isLoading: false,
  error: null,
  searchQuery: '',
  setTables: (tables) => set({ tables }),
  selectTable: (table) => set({ selectedTable: table }),
  setTableDescription: (table, description) => set((state) => ({
    tableDescriptions: { ...state.tableDescriptions, [table]: description }
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  filteredTables: () => {
    const { tables, searchQuery } = get()
    if (!searchQuery) return tables
    return tables.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  }
}))
