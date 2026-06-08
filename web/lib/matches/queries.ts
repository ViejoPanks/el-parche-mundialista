import { createClient } from '@/lib/supabase/server';
import type { Match, MatchesByDay } from '@/lib/matches/utils';
import { formatDateLabel } from '@/lib/matches/utils';

// Re-exportar tipos y utils para compatibilidad con imports existentes.
// Los Client Components deben importar DIRECTAMENTE de '@/lib/matches/utils'
// para evitar arrastrar este archivo (que usa server).
export type {
  Match,
  MatchesByDay,
  Team,
  MatchPhase,
  MatchStatus,
} from '@/lib/matches/utils';
export { formatMatchTime, getPhaseLabel } from '@/lib/matches/utils';

/**
 * Obtiene todos los partidos agrupados por día (en hora Colombia).
 */
export async function getMatchesByDay(): Promise<MatchesByDay[]> {
  const supabase = createClient();

  const { data, error } = await supabase
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
    .order('kickoff_at', { ascending: true });

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  if (!data) return [];

  const groups = new Map<string, Match[]>();

  for (const raw of data) {
    const match = raw as unknown as Match;
    const utc = new Date(match.kickoff_at);
    const colombiaTime = new Date(utc.getTime() - 5 * 60 * 60 * 1000);
    const dateKey = colombiaTime.toISOString().slice(0, 10);

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(match);
  }

  const result: MatchesByDay[] = Array.from(groups.entries()).map(([date, matches]) => ({
    date,
    dateLabel: formatDateLabel(date),
    matches,
  }));

  result.sort((a, b) => a.date.localeCompare(b.date));

  return result;
}
