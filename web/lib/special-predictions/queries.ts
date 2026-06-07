import { createClient } from '@/lib/supabase/server';

export interface Team {
  id: number;
  name: string;
  code: string;
  flag_url: string | null;
  group_name: string | null;
}

export interface Player {
  id: number;
  name: string;
  team_id: number;
  position: string | null;
  team_name: string;
  team_code: string;
}

export interface SpecialPredictions {
  user_id: string;
  champion_team_id: number | null;
  runner_up_team_id: number | null;
  third_place_team_id: number | null;
  top_scorer_player_id: number | null;
  best_player_id: number | null;
  points_earned: number;
  updated_at: string;
}

export interface LockoutInfo {
  lockoutAt: string | null;
  isLocked: boolean;
  msUntilLockout: number;
}

/**
 * Obtiene info de bloqueo: cuándo se bloquean las predicciones
 * y si ya están bloqueadas.
 */
export async function getLockoutInfo(): Promise<LockoutInfo> {
  const supabase = createClient();

  const { data: lockoutData } = await supabase.rpc('get_predictions_lockout_at');
  const { data: isLockedData } = await supabase.rpc('are_special_predictions_locked');

  const lockoutAt = (lockoutData as string | null) ?? null;
  const isLocked = Boolean(isLockedData);

  let msUntilLockout = 0;
  if (lockoutAt && !isLocked) {
    msUntilLockout = new Date(lockoutAt).getTime() - Date.now();
  }

  return {
    lockoutAt,
    isLocked,
    msUntilLockout: Math.max(0, msUntilLockout),
  };
}

/**
 * Obtiene la predicción especial del usuario actual (si existe).
 */
export async function getMySpecialPredictions(): Promise<SpecialPredictions | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('special_predictions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching special predictions:', error);
    return null;
  }

  return data;
}

/**
 * Obtiene todos los equipos ordenados por grupo y luego nombre.
 */
export async function getAllTeams(): Promise<Team[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('teams')
    .select('id, name, code, flag_url, group_name')
    .order('group_name', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching teams:', error);
    return [];
  }

  return data ?? [];
}

/**
 * Obtiene todos los jugadores con info de su equipo,
 * ordenados por equipo y luego nombre.
 */
export async function getAllPlayers(): Promise<Player[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('players')
    .select(`
      id,
      name,
      team_id,
      position,
      team:teams (
        name,
        code
      )
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching players:', error);
    return [];
  }

  if (!data) return [];

  return data.map((p) => ({
    id: p.id as number,
    name: p.name as string,
    team_id: p.team_id as number,
    position: p.position as string | null,
    // @ts-expect-error - Supabase typing
    team_name: p.team?.name ?? '',
    // @ts-expect-error - Supabase typing
    team_code: p.team?.code ?? '',
  }));
}
