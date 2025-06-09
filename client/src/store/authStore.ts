import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { signIn, signOut, getCurrentUser, signUp, updateUserMetadataSupabase, type SupabaseUser } from '@/lib/supabase';

interface AuthState {
  user: SupabaseUser | null;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUserMetadata: (newMetadata: { full_name?: string; role?: string }) => Promise<void>;
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
        },

        updateUserMetadata: async (newMetadata: { full_name?: string; role?: string }) => {
          try {
            set({ isLoading: true, error: null });
            console.log('[AuthStore] Attempting to update user metadata with:', JSON.parse(JSON.stringify(newMetadata)));
            const updatedSupabaseUser = await updateUserMetadataSupabase(newMetadata);
            console.log('[AuthStore] Received updatedSupabaseUser from Supabase:', JSON.parse(JSON.stringify(updatedSupabaseUser)));

            set((state) => {
              console.log('[AuthStore] Current state.user before update:', JSON.parse(JSON.stringify(state.user)));
              
              const finalUserObject = updatedSupabaseUser ? {
                ...(state.user), // Spread existing user state (id, email, app_metadata, etc.)
                id: updatedSupabaseUser.id, // Ensure id is from the authoritative source
                email: updatedSupabaseUser.email, // Ensure email is from the authoritative source
                user_metadata: {
                  ...(state.user?.user_metadata || {}), // Spread existing user_metadata
                  ...(updatedSupabaseUser.user_metadata || {}), // Spread new user_metadata, overwriting relevant keys
                }
              } : state.user;

              console.log('[AuthStore] New user state to be set:', JSON.parse(JSON.stringify(finalUserObject)));
              return {
                user: finalUserObject,
                isLoading: false,
              };
            });
          } catch (error: any) {
            console.error('[AuthStore] Error updating user metadata:', error);
            set({
              isLoading: false,
              error: error.message || 'Failed to update user metadata',
            });
            throw error;
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user }),
      }
    )
  )
);
