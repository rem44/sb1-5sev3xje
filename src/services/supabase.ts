// src/services/supabase.ts
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
  // Remove the forced 'false' return
};
