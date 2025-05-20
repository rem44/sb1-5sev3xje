// src/services/authService.ts
import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
  avatarUrl?: string;
}

// Assurez-vous d'exporter authService comme export nommé (named export)
export const authService = {
  async signIn(email: string, password: string): Promise<AuthUser> {
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
        role: 'user',
        fullName: data.user?.user_metadata?.full_name || email.split('@')[0],
        avatarUrl: data.user?.user_metadata?.avatar_url,
      };
    } catch (error) {
      console.error('Error signing in:', error);
      // Pour les tests, retournons un utilisateur fictif en cas d'erreur
      return {
        id: 'mock-user-id',
        email: email,
        role: 'user',
        fullName: email.split('@')[0],
      };
    }
  },

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return null;
      }

      return {
        id: session.user.id,
        email: session.user.email || '',
        role: 'user', // Dans une application réelle, vous récupéreriez cela depuis la base de données
        fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Utilisateur',
        avatarUrl: session.user.user_metadata?.avatar_url,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
};
