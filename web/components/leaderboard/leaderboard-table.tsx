import type { LeaderboardEntry } from '@/lib/leaderboard/queries';

interface Props {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

const avatarColors = [
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500',
  'bg-emerald-500', 'bg-rose-500', 'bg-indigo-500', 'bg-teal-500',
];

function getAvatarColor(userId: string): string {
  const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

function getRankDisplay(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
}

export function LeaderboardTable({ entries, currentUserId }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-slate-50 rounded-xl">
        <p className="text-4xl mb-3">📊</p>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          Tabla vacía por ahora
        </h2>
        <p className="text-sm text-slate-600">
          Los puntos aparecerán cuando empiecen a jugarse los partidos.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header de la tabla */}
      <div className="grid grid-cols-[auto_1fr_auto] gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span className="w-8 text-center">#</span>
        <span>Jugador</span>
        <span className="text-right">Puntos</span>
      </div>

      {/* Filas */}
      <div className="divide-y divide-slate-100">
        {entries.map((entry) => {
          const isCurrentUser = entry.user_id === currentUserId;
          const isPodium = entry.rank <= 3;

          return (
            <div
              key={entry.user_id}
              className={`grid grid-cols-[auto_1fr_auto] gap-3 px-4 py-3 items-center ${
                isCurrentUser ? 'bg-blue-50' : ''
              }`}
            >
              {/* Rank */}
              <span
                className={`w-8 text-center font-bold ${
                  isPodium ? 'text-lg' : 'text-sm text-slate-500'
                }`}
              >
                {getRankDisplay(entry.rank)}
              </span>

              {/* Jugador */}
              <div className="flex items-center gap-3 min-w-0">
                {entry.avatar_url ? (
                  <img
                    src={entry.avatar_url}
                    alt={entry.display_name}
                    className="w-9 h-9 rounded-full flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className={`w-9 h-9 rounded-full ${getAvatarColor(
                      entry.user_id
                    )} text-white flex items-center justify-center text-sm font-semibold flex-shrink-0`}
                  >
                    {entry.display_name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate flex items-center gap-2">
                    {entry.display_name}
                    {isCurrentUser && (
                      <span className="text-xs text-blue-600 font-normal">(tú)</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {entry.exact_count} exactos · {entry.diff_count} difs
                    {entry.special_points > 0 && ` · ${entry.special_points} esp`}
                  </p>
                </div>
              </div>

              {/* Puntos */}
              <span className="text-right font-bold text-slate-900 tabular-nums text-lg">
                {entry.total_points}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
