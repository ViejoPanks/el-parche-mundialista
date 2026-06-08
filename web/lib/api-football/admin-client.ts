import { createClient } from '@supabase/supabase-js';

/**
 * Cliente de Supabase con SERVICE ROLE.
 *
 * ⚠️ PELIGRO: Este cliente SALTA todas las políticas RLS.
 * Tiene acceso total a la base de datos. USAR SOLO en endpoints
 * del servidor protegidos (admin/cron). NUNCA exponer al navegador.
 *
 * La service_role key vive solo en el servidor
 * (process.env.SUPABASE_SERVICE_ROLE_KEY).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Faltan variables de entorno de Supabase admin');
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
