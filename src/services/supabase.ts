// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anonymous Key not found in environment variables. ' +
    'The app will use mock data instead of connecting to Supabase.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ Force l'utilisation des données mock temporairement
export const isSupabaseConfigured = () => {
  // Temporairement forcé à false pour utiliser les données mock
  return false;
  
  // Décommentez ceci quand Supabase sera complètement configuré
  // return Boolean(supabaseUrl && supabaseAnonKey);
};
