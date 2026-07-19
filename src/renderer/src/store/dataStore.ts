import { create } from 'zustand'

export interface FilterExpression {
  attribute: string
  operator: string
  value: string
  value2?: string
}

interface DataState {
  items: any[]
  totalCount: number
  scannedCount: number
  lastEvaluatedKey: any | null
  isLoading: boolean
  error: string | null
  mode: 'scan' | 'query'
  selectedIndex: string | null
  filters: FilterExpression[]
  queryKeyCondition: {
    partitionKey: { name: string, value: string }
    sortKey?: { name: string, operator: string, value: string }
  } | null
  pageSize: number
  pageHistory: any[]
  
  setItems: (items: any[], lastKey?: any, count?: number, scannedCount?: number) => void
  appendItems: (items: any[], lastKey?: any) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setMode: (mode: 'scan' | 'query') => void
  setSelectedIndex: (index: string | null) => void
  setFilters: (filters: FilterExpression[]) => void
  addFilter: () => void
  removeFilter: (index: number) => void
  updateFilter: (index: number, filter: Partial<FilterExpression>) => void
  setQueryKeyCondition: (condition: any) => void
  setPageSize: (size: number) => void
  reset: () => void
}

export const useDataStore = create<DataState>((set) => ({
  items: [],
  totalCount: 0,
  scannedCount: 0,
  lastEvaluatedKey: null,
  isLoading: false,
  error: null,
  mode: 'scan',
  selectedIndex: null,
  filters: [],
  queryKeyCondition: null,
  pageSize: 25,
  pageHistory: [],
  
  setItems: (items, lastKey = null, count = 0, scannedCount = 0) => set({
    items, lastEvaluatedKey: lastKey, totalCount: count, scannedCount, isLoading: false, error: null
  }),
  appendItems: (newItems, lastKey = null) => set((state) => ({
    items: [...state.items, ...newItems],
    lastEvaluatedKey: lastKey,
    isLoading: false,
    error: null
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setMode: (mode) => set({ mode }),
  setSelectedIndex: (selectedIndex) => set({ selectedIndex }),
  setFilters: (filters) => set({ filters }),
  addFilter: () => set((state) => ({
    filters: [...state.filters, { attribute: '', operator: 'equals', value: '' }]
  })),
  removeFilter: (index) => set((state) => ({
    filters: state.filters.filter((_, i) => i !== index)
  })),
  updateFilter: (index, filter) => set((state) => ({
    filters: state.filters.map((f, i) => i === index ? { ...f, ...filter } : f)
  })),
  setQueryKeyCondition: (queryKeyCondition) => set({ queryKeyCondition }),
  setPageSize: (pageSize) => set({ pageSize }),
  reset: () => set({
    items: [], totalCount: 0, scannedCount: 0, lastEvaluatedKey: null,
    isLoading: false, error: null, pageHistory: [], filters: [], queryKeyCondition: null
  })
}))
