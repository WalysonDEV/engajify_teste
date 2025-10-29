import { createClient } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// ⚠️ ATENÇÃO: Configure suas credenciais do Supabase aqui.
// Você pode encontrá-las nas configurações do seu projeto Supabase em "API".
// -----------------------------------------------------------------------------
export const supabaseUrl = 'https://bimyftsietfckboghmav.supabase.co'; // Substitua pelo URL do seu projeto Supabase
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbXlmdHNpZXRmY2tib2dobWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDIyMDUsImV4cCI6MjA3NzA3ODIwNX0.p4-ppQkiB2ylIwoaJ8AivbdmPHNU_krOVSJSLqTaDE8'; // Substitua pela sua chave anônima pública Supabase

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Verifica se as credenciais do Supabase foram alteradas dos valores de placeholder.
 * @returns {boolean} `true` se configurado, `false` caso contrário.
 */
export const isSupabaseConfigured = () => {
  const isDefaultUrl = supabaseUrl.includes('your-project-id');
  const isDefaultKey = supabaseAnonKey.includes('your-public-anon-key');
  return !isDefaultUrl && !isDefaultKey;
};