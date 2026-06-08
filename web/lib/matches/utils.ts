/**
 * Types and utilities puros — sin dependencias de server.
 * Pueden usarse tanto en Server como en Client Components.
 */

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
  date: string;
  dateLabel: string;
  matches: Match[];
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

/**
 * Formatea una fecha YYYY-MM-DD a "Jueves, 11 de junio".
 */
export function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
