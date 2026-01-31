import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type LinkViewMode = 'grid' | 'list';

interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  linkViewMode: LinkViewMode;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  setLinkViewMode: (mode: LinkViewMode) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',
      linkViewMode: 'grid',

      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      setTheme: (theme) => set({ theme }),

      setLinkViewMode: (linkViewMode) => set({ linkViewMode }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        linkViewMode: state.linkViewMode,
      }),
    }
  )
);

export const selectIsDarkMode = (state: UIState): boolean => {
  if (state.theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return state.theme === 'dark';
};

export const selectIsGridView = (state: UIState): boolean =>
  state.linkViewMode === 'grid';

export const selectIsListView = (state: UIState): boolean =>
  state.linkViewMode === 'list';
