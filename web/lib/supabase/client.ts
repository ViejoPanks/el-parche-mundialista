import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente de Supabase para usar dentro de Client Components.
 * Funciona en el navegador del usuario.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
