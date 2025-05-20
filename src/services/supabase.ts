// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Les URL et clés seront stockées dans les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
