import { createClient } from '@/lib/supabase/server';

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  exact_count: number;
  diff_count: number;
  advance_count: number;
  special_points: number;
  joined_at: string;
  rank: number;
}

/**
 * Obtiene la tabla de posiciones de un grupo.
 * La función RPC valida que el usuario sea miembro.
 */
export async function getGroupLeaderboard(
  groupId: number
): Promise<LeaderboardEntry[]> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_group_leaderboard', {
    p_group_id: groupId,
  });

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  if (!data) return [];

  return (data as any[]).map((row) => ({
    user_id: row.user_id,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    total_points: Number(row.total_points),
    exact_count: Number(row.exact_count),
    diff_count: Number(row.diff_count),
    advance_count: Number(row.advance_count),
    special_points: Number(row.special_points),
    joined_at: row.joined_at,
    rank: Number(row.rank),
  }));
}
