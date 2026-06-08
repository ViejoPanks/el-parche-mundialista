import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mapFixtures } from '@/lib/api-football/sync';

/**
 * POST /api/admin/map-fixtures
 *
 * Vincula nuestros partidos con los fixtures de API-Football.
 * Se corre una vez (o cuando se carguen las eliminatorias).
 *
 * Protegido: solo el ADMIN_USER_ID puede ejecutarlo.
 */
export async function POST() {
  // Verificar que el usuario autenticado es el admin
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  if (user.id !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const result = await mapFixtures();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error('Error mapping fixtures:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
