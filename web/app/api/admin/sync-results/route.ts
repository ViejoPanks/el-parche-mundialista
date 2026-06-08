import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncResults } from '@/lib/api-football/sync';

/**
 * POST /api/admin/sync-results
 *
 * Trae los resultados de partidos terminados desde API-Football
 * y actualiza nuestra tabla. Dispara el cálculo de puntos.
 *
 * Protegido: solo el ADMIN_USER_ID puede ejecutarlo manualmente.
 */
export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  if (user.id !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const result = await syncResults();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error('Error syncing results:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
