import { create } from 'zustand'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface UIState {
  sidebarCollapsed: boolean
  theme: 'dark' | 'light'
  activeModal: string | null
  modalData: any | null
  toasts: Toast[]
  tableInfoExpanded: boolean
  queryBuilderExpanded: boolean
  inspectorData: { title: string; data: any } | null
  
  toggleSidebar: () => void
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void
  openModal: (modalId: string, data?: any) => void
  closeModal: () => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  toggleTableInfo: () => void
  toggleQueryBuilder: () => void
  openInspector: (title: string, data: any) => void
  closeInspector: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  theme: 'dark',
  activeModal: null,
  modalData: null,
  toasts: [],
  tableInfoExpanded: true,
  queryBuilderExpanded: false,
  inspectorData: null,
  
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  openModal: (activeModal, modalData = null) => set({ activeModal, modalData }),
  closeModal: () => set({ activeModal: null, modalData: null }),
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    
    // Auto remove toast
    const duration = toast.duration ?? 4000
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
      }, duration)
    }
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  toggleTableInfo: () => set((state) => ({ tableInfoExpanded: !state.tableInfoExpanded })),
  toggleQueryBuilder: () => set((state) => ({ queryBuilderExpanded: !state.queryBuilderExpanded })),
  openInspector: (title, data) => set({ inspectorData: { title, data } }),
  closeInspector: () => set({ inspectorData: null })
}))
