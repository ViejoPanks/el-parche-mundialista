import type { Match } from '@/lib/matches/utils';
import { formatMatchTime } from '@/lib/matches/utils';
import { MapPin, Circle } from 'lucide-react';

export function MatchCard({ match }: { match: Match }) {
  const time = formatMatchTime(match.kickoff_at);
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  const isScheduled = match.status === 'scheduled';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition">
      {/* Header con hora, grupo y estado */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-slate-700">{time}</span>
          {/* El grupo solo aplica en fase de grupos. En knockout la fase
              ya se muestra en el encabezado de sección (getPhaseMeta). */}
          {match.phase === 'group' && match.team_local?.group_name && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
              Grupo {match.team_local.group_name}
            </span>
          )}
        </div>

        {isLive && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded font-medium">
            <Circle className="w-2 h-2 fill-current animate-pulse" />
            EN VIVO
          </span>
        )}
        {isFinished && (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
            Terminado
          </span>
        )}
      </div>

      {/* Equipos y marcador */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {match.team_local?.flag_url ? (
              <img
                src={match.team_local.flag_url}
                alt={match.team_local.name}
                className="w-8 h-6 object-cover rounded-sm border border-slate-200"
              />
            ) : (
              <div className="w-8 h-6 bg-slate-100 rounded-sm" />
            )}
            <span className="font-semibold text-slate-900 truncate">
              {match.team_local?.name ?? 'Por definir'}
            </span>
          </div>
          {(isFinished || isLive) && match.goals_local_90 !== null && (
            <span className="text-xl font-bold text-slate-900 tabular-nums ml-3">
              {match.goals_local_90}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {match.team_visitante?.flag_url ? (
              <img
                src={match.team_visitante.flag_url}
                alt={match.team_visitante.name}
                className="w-8 h-6 object-cover rounded-sm border border-slate-200"
              />
            ) : (
              <div className="w-8 h-6 bg-slate-100 rounded-sm" />
            )}
            <span className="font-semibold text-slate-900 truncate">
              {match.team_visitante?.name ?? 'Por definir'}
            </span>
          </div>
          {(isFinished || isLive) && match.goals_visitante_90 !== null && (
            <span className="text-xl font-bold text-slate-900 tabular-nums ml-3">
              {match.goals_visitante_90}
            </span>
          )}
        </div>
      </div>

      {/* Sede */}
      {match.venue && (
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{match.venue}</span>
        </div>
      )}
    </div>
  );
}
