import type { Team, Player, SpecialPredictions } from '@/lib/special-predictions/queries';

interface Props {
  teams: Team[];
  players: Player[];
  predictions: SpecialPredictions | null;
}

export function SpecialPredictionsView({ teams, players, predictions }: Props) {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const playerMap = new Map(players.map((p) => [p.id, p]));

  // Si no hizo ninguna predicción
  if (!predictions ||
    (predictions.champion_team_id === null &&
      predictions.runner_up_team_id === null &&
      predictions.third_place_team_id === null &&
      predictions.top_scorer_player_id === null &&
      predictions.best_player_id === null)
  ) {
    return (
      <div className="text-center py-12 px-6 bg-slate-50 rounded-xl">
        <p className="text-4xl mb-3">🚫</p>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          No alcanzaste a hacer predicciones especiales
        </h2>
        <p className="text-sm text-slate-600">
          El torneo arrancó antes de que registraras tu predicción.
          Aún puedes ganar puntos en cada partido individual.
        </p>
      </div>
    );
  }

  const champion = predictions.champion_team_id ? teamMap.get(predictions.champion_team_id) : null;
  const runnerUp = predictions.runner_up_team_id ? teamMap.get(predictions.runner_up_team_id) : null;
  const thirdPlace = predictions.third_place_team_id ? teamMap.get(predictions.third_place_team_id) : null;
  const topScorer = predictions.top_scorer_player_id ? playerMap.get(predictions.top_scorer_player_id) : null;
  const bestPlayer = predictions.best_player_id ? playerMap.get(predictions.best_player_id) : null;

  return (
    <>
      {/* Sección: Posiciones finales */}
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Posiciones finales
      </h2>

      <div className="space-y-3 mb-6">
        <ReadOnlyRow icon="🏆" name="Campeón" points={25}>
          {champion ? <TeamDisplay team={champion} /> : <NotPredicted />}
        </ReadOnlyRow>

        <ReadOnlyRow icon="🥈" name="Subcampeón" points={15}>
          {runnerUp ? <TeamDisplay team={runnerUp} /> : <NotPredicted />}
        </ReadOnlyRow>

        <ReadOnlyRow icon="🥉" name="Tercer lugar" points={10}>
          {thirdPlace ? <TeamDisplay team={thirdPlace} /> : <NotPredicted />}
        </ReadOnlyRow>
      </div>

      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Premios individuales
      </h2>

      <div className="space-y-3 mb-6">
        <ReadOnlyRow icon="⚽" name="Goleador" points={15}>
          {topScorer ? <PlayerDisplay player={topScorer} /> : <NotPredicted />}
        </ReadOnlyRow>

        <ReadOnlyRow icon="⭐" name="Mejor jugador" points={10}>
          {bestPlayer ? <PlayerDisplay player={bestPlayer} /> : <NotPredicted />}
        </ReadOnlyRow>
      </div>

      {/* Puntos ganados (si hay) */}
      {predictions.points_earned > 0 && (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-sm text-green-900">Puntos ganados</span>
          <span className="text-lg font-bold text-green-900">
            {predictions.points_earned} pts
          </span>
        </div>
      )}
    </>
  );
}

function ReadOnlyRow({
  icon,
  name,
  points,
  children,
}: {
  icon: string;
  name: string;
  points: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-semibold text-slate-900">{name}</span>
        <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-900 rounded">
          +{points} pts
        </span>
      </div>
      {children}
    </div>
  );
}

function TeamDisplay({ team }: { team: Team }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-sm">
      {team.flag_url && (
        <img
          src={team.flag_url}
          alt={team.name}
          className="w-6 h-4 object-cover rounded-sm border border-slate-200"
        />
      )}
      <span className="font-medium text-slate-900">{team.name}</span>
    </div>
  );
}

function PlayerDisplay({ player }: { player: Player }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-sm">
      <span className="font-medium text-slate-900">{player.name}</span>
      <span className="text-xs text-slate-500">({player.team_code})</span>
    </div>
  );
}

function NotPredicted() {
  return (
    <span className="text-sm text-slate-400 italic">No predijo</span>
  );
}
