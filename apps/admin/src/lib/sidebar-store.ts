import { create } from 'zustand'

interface SidebarState {
  open:   boolean
  setOpen: (v: boolean) => void
  toggle: () => void
}

// Trạng thái mở/đóng sidebar trên mobile (drawer)
export const useSidebar = create<SidebarState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
  toggle: () => set((s) => ({ open: !s.open })),
}))
