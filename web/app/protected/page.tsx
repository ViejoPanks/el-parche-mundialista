import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * /protected es el home autenticado.
 * Despues del login el usuario llega aqui y lo redirigimos a /grupos,
 * que es el verdadero dashboard del MVP.
 */
export default async function ProtectedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  redirect('/grupos');
}