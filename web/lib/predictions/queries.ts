import { createClient } from '@/lib/supabase/server';
import type { Match } from '@/lib/matches/utils';
import { formatDateLabel } from '@/lib/matches/utils';
import type {
  MyPrediction,
  MatchWithPrediction,
  PredictionsByDay,
} from '@/lib/predictions/types';

// Re-exportar tipos para compatibilidad. Los Client Components deben
// importar DIRECTAMENTE de '@/lib/predictions/types'.
export type { MyPrediction, MatchWithPrediction, PredictionsByDay } from '@/lib/predictions/types';

/**
 * Obtiene los partidos con la predicción del usuario (si existe).
 * Agrupados por día.
 */
export async function getMatchesWithMyPredictions(): Promise<PredictionsByDay[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: matchesData, error: matchesError } = await supabase
    .from('matches')
    .select(`
      id,
      match_number,
      phase,
      kickoff_at,
      venue,
      status,
      goals_local_90,
      goals_visitante_90,
      team_local:teams!matches_team_local_id_fkey (
        id, name, code, flag_url, group_name
      ),
      team_visitante:teams!matches_team_visitante_id_fkey (
        id, name, code, flag_url, group_name
      )
    `)
    .not('team_local_id', 'is', null)
    .not('team_visitante_id', 'is', null)
    .order('kickoff_at', { ascending: true });

  if (matchesError) {
    console.error('Error fetching matches:', matchesError);
    return [];
  }

  if (!matchesData) return [];

  const { data: predictionsData, error: predError } = await supabase
    .from('predictions')
    .select('match_id, pred_local, pred_visitante, points_earned, is_exact, is_diff_correct, updated_at')
    .eq('user_id', user.id);

  if (predError) {
    console.error('Error fetching predictions:', predError);
  }

  const predictionsByMatchId = new Map<number, MyPrediction>();
  for (const p of predictionsData ?? []) {
    predictionsByMatchId.set(p.match_id as number, p as MyPrediction);
  }

  const now = Date.now();

  const enriched: MatchWithPrediction[] = matchesData.map((raw) => {
    const match = raw as unknown as Match;
    const isLocked = new Date(match.kickoff_at).getTime() <= now;
    const prediction = predictionsByMatchId.get(match.id) ?? null;
    return { match, prediction, isLocked };
  });

  const groups = new Map<string, MatchWithPrediction[]>();
  for (const item of enriched) {
    const utc = new Date(item.match.kickoff_at);
    const colombiaTime = new Date(utc.getTime() - 5 * 60 * 60 * 1000);
    const dateKey = colombiaTime.toISOString().slice(0, 10);

    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(item);
  }

  const result: PredictionsByDay[] = Array.from(groups.entries()).map(([date, matches]) => ({
    date,
    dateLabel: formatDateLabel(date),
    matches,
  }));

  result.sort((a, b) => a.date.localeCompare(b.date));
  return result;
}

/**
 * Obtiene estadísticas resumidas: predicciones hechas vs partidos abiertos.
 */
export async function getPredictionsSummary(): Promise<{
  totalMatches: number;
  predictedCount: number;
  upcomingOpenCount: number;
}> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { totalMatches: 0, predictedCount: 0, upcomingOpenCount: 0 };
  }

  const { count: totalMatches } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true });

  const { count: predictedCount } = await supabase
    .from('predictions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const nowIso = new Date().toISOString();
  const { count: openCount } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .gt('kickoff_at', nowIso);

  return {
    totalMatches: totalMatches ?? 0,
    predictedCount: predictedCount ?? 0,
    upcomingOpenCount: openCount ?? 0,
  };
}
