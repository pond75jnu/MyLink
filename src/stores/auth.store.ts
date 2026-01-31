import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '../types';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, session: Session) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) =>
        set((state) => ({
          user,
          isAuthenticated: user !== null && state.session !== null,
        })),

      setSession: (session) =>
        set((state) => ({
          session,
          isAuthenticated: state.user !== null && session !== null,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      login: (user, session) =>
        set({
          user,
          session,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      initialize: async () => {
        const { session } = get();
        if (!session) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        const expiresAt = new Date(session.expiresAt);
        if (expiresAt <= new Date()) {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        set({ isAuthenticated: true, isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        session: state.session,
        user: state.user,
      }),
    }
  )
);
