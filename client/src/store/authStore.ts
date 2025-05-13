import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { signIn, signOut, getCurrentUser, signUp, type SupabaseUser } from '@/lib/supabase';

interface AuthState {
  user: SupabaseUser | null;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isLoading: false,
        error: null,
        
        checkAuth: async () => {
          try {
            set({ isLoading: true });
            const user = await getCurrentUser();
            set({ user, isLoading: false });
          } catch (error) {
            set({ user: null, isLoading: false });
          }
        },
        
        login: async (email, password) => {
          try {
            set({ isLoading: true, error: null });
            const { user } = await signIn(email, password);
            set({ user, isLoading: false });
          } catch (error: any) {
            set({ 
              isLoading: false, 
              error: error.message || 'Failed to sign in' 
            });
            throw error;
          }
        },
        
        register: async (email, password) => {
          try {
            set({ isLoading: true, error: null });
            const { user } = await signUp(email, password);
            set({ user, isLoading: false });
          } catch (error: any) {
            set({ 
              isLoading: false, 
              error: error.message || 'Failed to sign up' 
            });
            throw error;
          }
        },
        
        logout: async () => {
          try {
            set({ isLoading: true });
            await signOut();
            set({ user: null, isLoading: false });
          } catch (error: any) {
            set({ 
              isLoading: false, 
              error: error.message || 'Failed to sign out' 
            });
          }
        },
        
        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user }),
      }
    )
  )
);
