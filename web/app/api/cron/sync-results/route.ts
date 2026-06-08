import { NextRequest, NextResponse } from 'next/server';
import { syncResults } from '@/lib/api-football/sync';

/**
 * GET /api/cron/sync-results
 *
 * Endpoint llamado por un cron externo (cron-job.org u otro) para
 * sincronizar resultados automáticamente.
 *
 * Protegido con CRON_SECRET. Acepta el secret de dos formas para
 * facilitar la configuración con servicios de cron externos:
 *   1. Header:  Authorization: Bearer TU_CRON_SECRET
 *   2. Query:   /api/cron/sync-results?secret=TU_CRON_SECRET
 *
 * La opción de header es más segura (no queda en logs de URL).
 * Usa la que tu servicio de cron soporte mejor.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET no configurado en el servidor' },
      { status: 500 }
    );
  }

  // Verificar secret por header O por query param
  const authHeader = request.headers.get('authorization');
  const querySecret = request.nextUrl.searchParams.get('secret');

  const headerOk = authHeader === `Bearer ${secret}`;
  const queryOk = querySecret === secret;

  if (!headerOk && !queryOk) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const result = await syncResults();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err) {
    console.error('Error in cron sync:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
