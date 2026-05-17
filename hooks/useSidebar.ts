'use client';


import { create } from 'zustand';

interface SidebarStore {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

export const useSidebar = create<SidebarStore>((set) => ({
  isOpen: true,
  toggle: () => set(s => ({ isOpen: !s.isOpen })),
  close: () => set({ isOpen: false }),
}));