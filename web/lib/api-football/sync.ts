import { createAdminClient } from '@/lib/api-football/admin-client';
import {
  fetchAllWorldCupFixtures,
  fetchFinishedFixtures,
  getAdvanceWinner,
} from '@/lib/api-football/client';

/**
 * Lógica compartida entre el endpoint manual (/api/admin/sync-results)
 * y el cron (/api/cron/sync-results).
 */

export interface SyncResult {
  matchesUpdated: number;
  details: string[];
}

/**
 * MAPEO: vincula nuestros partidos con los fixtures de API-Football.
 * Se corre una vez (o cuando se carguen las eliminatorias).
 *
 * Empareja por api_team_id de ambos equipos.
 */
export async function mapFixtures(): Promise<SyncResult> {
  const supabase = createAdminClient();
  const details: string[] = [];

  // 1. Traer todos los fixtures de la API
  const apiFixtures = await fetchAllWorldCupFixtures();
  details.push(`API devolvió ${apiFixtures.length} fixtures`);

  // 2. Traer nuestros partidos con los api_team_id de cada equipo
  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      id,
      match_number,
      team_local:teams!matches_team_local_id_fkey ( api_team_id ),
      team_visitante:teams!matches_team_visitante_id_fkey ( api_team_id )
    `);

  if (error || !matches) {
    throw new Error(`Error leyendo matches: ${error?.message}`);
  }

  let mapped = 0;

  // 3. Para cada partido nuestro, buscar el fixture de la API que
  //    tenga los mismos dos equipos (por api_team_id)
  for (const match of matches) {
    // @ts-expect-error - Supabase typing
    const localApiId = match.team_local?.api_team_id;
    // @ts-expect-error - Supabase typing
    const visitanteApiId = match.team_visitante?.api_team_id;

    if (!localApiId || !visitanteApiId) continue;

    const apiMatch = apiFixtures.find(
      (f) =>
        (f.teams.home.id === localApiId && f.teams.away.id === visitanteApiId) ||
        (f.teams.home.id === visitanteApiId && f.teams.away.id === localApiId)
    );

    if (apiMatch) {
      const { error: updateError } = await supabase
        .from('matches')
        .update({ api_fixture_id: apiMatch.fixture.id })
        .eq('id', match.id);

      if (!updateError) mapped++;
    }
  }

  details.push(`${mapped} partidos mapeados con su api_fixture_id`);
  return { matchesUpdated: mapped, details };
}

/**
 * SYNC: trae los resultados de partidos terminados y actualiza
 * nuestra tabla matches. Al marcar status='finished', el trigger
 * del Sprint 1 calcula los puntos automáticamente.
 */
export async function syncResults(): Promise<SyncResult> {
  const supabase = createAdminClient();
  const details: string[] = [];

  // 1. Traer fixtures terminados de la API
  const finished = await fetchFinishedFixtures();
  details.push(`${finished.length} partidos terminados en la API`);

  // 2. Traer nuestros partidos que tienen api_fixture_id y aún no
  //    están marcados como finished
  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, api_fixture_id, status, team_local_id, team_visitante_id')
    .not('api_fixture_id', 'is', null)
    .neq('status', 'finished');

  if (error || !matches) {
    throw new Error(`Error leyendo matches: ${error?.message}`);
  }

  // Indexar nuestros partidos por api_fixture_id
  const matchesByApiId = new Map<number, typeof matches[number]>();
  for (const m of matches) {
    if (m.api_fixture_id) matchesByApiId.set(m.api_fixture_id, m);
  }

  let updated = 0;

  // 3. Para cada fixture terminado, actualizar el marcador
  for (const apiFixture of finished) {
    const ourMatch = matchesByApiId.get(apiFixture.fixture.id);
    if (!ourMatch) continue;

    // Marcador de los 90' (tiempo reglamentario). score.fulltime es el
    // resultado al minuto 90; apiFixture.goals incluye el alargue.
    // En fase de grupos ambos coinciden.
    const goalsLocal = apiFixture.score.fulltime?.home ?? apiFixture.goals.home;
    const goalsVisitante = apiFixture.score.fulltime?.away ?? apiFixture.goals.away;

    if (goalsLocal === null || goalsVisitante === null) continue;

    // Determinar quién avanza de fase (para el bonus de eliminatorias).
    // Usa el marcador final (alargue) y, si sigue empatado, penales.
    const advanceWinnerApiId = getAdvanceWinner(apiFixture);
    let winnerAdvanceTeamId: number | null = null;

    if (advanceWinnerApiId !== null) {
      // Buscar nuestro team_id correspondiente al api_team_id ganador
      const { data: winnerTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('api_team_id', advanceWinnerApiId)
        .maybeSingle();
      winnerAdvanceTeamId = winnerTeam?.id ?? null;
    }

    // Actualizar el partido → dispara el trigger de cálculo de puntos
    const updateData: Record<string, unknown> = {
      goals_local_90: goalsLocal,
      goals_visitante_90: goalsVisitante,
      status: 'finished',
      finished_at: new Date().toISOString(),
    };

    if (winnerAdvanceTeamId !== null) {
      updateData.winner_advance_team_id = winnerAdvanceTeamId;
    }

    const { error: updateError } = await supabase
      .from('matches')
      .update(updateData)
      .eq('id', ourMatch.id);

    if (!updateError) {
      updated++;
      details.push(`Partido ${ourMatch.id}: ${goalsLocal}-${goalsVisitante}`);
    }
  }

  details.push(`${updated} partidos actualizados`);
  return { matchesUpdated: updated, details };
}
