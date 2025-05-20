// src/services/authService.ts
import { supabase } from './supabase';
import { isSupabaseConfigured } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
  avatarUrl?: string;
}

// A mock user for development purposes
const MOCK_USER: AuthUser = {
  id: 'mock-user-id',
  email: 'demo@example.com',
  role: 'admin',
  fullName: 'Demo User',
};

export const authService = {
  async signIn(email: string, password: string): Promise<AuthUser> {
    // If Supabase is not configured, use mock authentication
    if (!isSupabaseConfigured()) {
      console.log('Using mock authentication (Supabase not configured)');

      // Very simple mock auth - in a real app, you'd want better security
      if (email === 'demo@example.com' && password === 'password') {
        // Store auth in localStorage to persist the session
        localStorage.setItem('mock_auth_user', JSON.stringify(MOCK_USER));
        return MOCK_USER;
      } else {
        throw new Error('Invalid email or password');
      }
    }

    // Use actual Supabase authentication
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.user?.id || 'unknown',
        email: data.user?.email || email,
        role: data.user?.user_metadata?.role || 'user',
        fullName: data.user?.user_metadata?.full_name || email.split('@')[0],
        avatarUrl: data.user?.user_metadata?.avatar_url,
      };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  async signOut(): Promise<void> {
    // If using mock auth, clear the mock user
    if (!isSupabaseConfigured()) {
      localStorage.removeItem('mock_auth_user');
      return;
    }

    // Otherwise use Supabase signOut
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    // If using mock auth, check localStorage for mock user
    if (!isSupabaseConfigured()) {
      const mockUser = localStorage.getItem('mock_auth_user');
      return mockUser ? JSON.parse(mockUser) : null;
    }

    // Otherwise use Supabase
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return null;
      }

      return {
        id: session.user.id,
        email: session.user.email || '',
        role: session.user.user_metadata?.role || 'user',
        fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        avatarUrl: session.user.user_metadata?.avatar_url,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
};
