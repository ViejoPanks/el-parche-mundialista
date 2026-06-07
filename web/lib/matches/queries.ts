import { createClient } from '@/lib/supabase/server';

export type MatchPhase = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third_place' | 'final';
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'cancelled' | 'postponed';

export interface Team {
  id: number;
  name: string;
  code: string;
  flag_url: string | null;
  group_name: string | null;
}

export interface Match {
  id: number;
  match_number: number | null;
  phase: MatchPhase;
  kickoff_at: string;
  venue: string | null;
  status: MatchStatus;
  goals_local_90: number | null;
  goals_visitante_90: number | null;
  team_local: Team | null;
  team_visitante: Team | null;
}

export interface MatchesByDay {
  date: string; // YYYY-MM-DD en hora Colombia
  dateLabel: string; // "Jueves, 11 de junio"
  matches: Match[];
}

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

  // Agrupar por día en hora Colombia (UTC-5)
  const groups = new Map<string, Match[]>();

  for (const raw of data) {
    const match = raw as unknown as Match;
    const utc = new Date(match.kickoff_at);
    // Convertir a hora Colombia (UTC-5)
    const colombiaTime = new Date(utc.getTime() - 5 * 60 * 60 * 1000);
    const dateKey = colombiaTime.toISOString().slice(0, 10); // YYYY-MM-DD

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(match);
  }

  // Convertir a array ordenado
  const result: MatchesByDay[] = Array.from(groups.entries()).map(([date, matches]) => ({
    date,
    dateLabel: formatDateLabel(date),
    matches,
  }));

  result.sort((a, b) => a.date.localeCompare(b.date));

  return result;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Formatea la hora de un partido en hora Colombia (UTC-5).
 */
export function formatMatchTime(kickoffAt: string): string {
  const utc = new Date(kickoffAt);
  const colombiaTime = new Date(utc.getTime() - 5 * 60 * 60 * 1000);
  const hours = colombiaTime.getUTCHours();
  const minutes = colombiaTime.getUTCMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Etiqueta legible para cada fase.
 */
export function getPhaseLabel(phase: MatchPhase): string {
  const labels: Record<MatchPhase, string> = {
    group: 'Fase de grupos',
    r32: '16avos de final',
    r16: 'Octavos de final',
    qf: 'Cuartos de final',
    sf: 'Semifinales',
    third_place: 'Tercer lugar',
    final: 'Final',
  };
  return labels[phase];
}
