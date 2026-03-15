import { create } from 'zustand'

interface IAppState {
  collapsed: boolean
  toggleCollapsed: () => void
}

export const useAppStore = create<IAppState>((set) => ({
  collapsed: false,
  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
}))
