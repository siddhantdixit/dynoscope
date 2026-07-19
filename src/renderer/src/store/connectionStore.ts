import { create } from 'zustand'

interface ConnectionState {
  isConnected: boolean
  connectionType: 'profile' | 'manual' | null
  profileName: string | null
  region: string
  endpoint: string | null
  isConnecting: boolean
  error: string | null
  availableProfiles: string[]
  setConnecting: (connecting: boolean) => void
  setConnected: (config: { type: 'profile' | 'manual', profileName?: string, region: string, endpoint?: string }) => void
  setDisconnected: () => void
  setError: (error: string | null) => void
  setProfiles: (profiles: string[]) => void
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  isConnected: false,
  connectionType: null,
  profileName: null,
  region: 'us-east-1',
  endpoint: null,
  isConnecting: false,
  error: null,
  availableProfiles: [],
  setConnecting: (connecting) => set({ isConnecting: connecting, error: null }),
  setConnected: (config) => set({
    isConnected: true,
    isConnecting: false,
    connectionType: config.type,
    profileName: config.profileName || null,
    region: config.region,
    endpoint: config.endpoint || null,
    error: null,
  }),
  setDisconnected: () => set({
    isConnected: false,
    connectionType: null,
    profileName: null,
    region: 'us-east-1',
    endpoint: null,
    error: null,
  }),
  setError: (error) => set({ error, isConnecting: false }),
  setProfiles: (profiles) => set({ availableProfiles: profiles }),
}))
