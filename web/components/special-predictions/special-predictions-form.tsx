'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Check } from 'lucide-react';
import { saveSpecialPredictions } from '@/lib/actions/special-predictions';
import { TeamSelect } from './team-select';
import { PlayerSelect } from './player-select';
import type { Team, Player, SpecialPredictions } from '@/lib/special-predictions/queries';

interface Props {
  teams: Team[];
  players: Player[];
  initialPredictions: SpecialPredictions | null;
}

export function SpecialPredictionsForm({ teams, players, initialPredictions }: Props) {
  const router = useRouter();
  const [champion, setChampion] = useState<number | null>(initialPredictions?.champion_team_id ?? null);
  const [runnerUp, setRunnerUp] = useState<number | null>(initialPredictions?.runner_up_team_id ?? null);
  const [thirdPlace, setThirdPlace] = useState<number | null>(initialPredictions?.third_place_team_id ?? null);
  const [topScorer, setTopScorer] = useState<number | null>(initialPredictions?.top_scorer_player_id ?? null);
  const [bestPlayer, setBestPlayer] = useState<number | null>(initialPredictions?.best_player_id ?? null);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validar duplicados en cliente (UX)
  const teamIds = [champion, runnerUp, thirdPlace].filter((v) => v !== null) as number[];
  const hasDuplicates = new Set(teamIds).size !== teamIds.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    if (champion !== null) formData.set('champion_team_id', String(champion));
    if (runnerUp !== null) formData.set('runner_up_team_id', String(runnerUp));
    if (thirdPlace !== null) formData.set('third_place_team_id', String(thirdPlace));
    if (topScorer !== null) formData.set('top_scorer_player_id', String(topScorer));
    if (bestPlayer !== null) formData.set('best_player_id', String(bestPlayer));

    const result = await saveSpecialPredictions(formData);

    if (!result.success) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
    setTimeout(() => setSuccess(false), 3000);
    router.refresh();
  }

  // Contar predicciones hechas
  const filledCount = [champion, runnerUp, thirdPlace, topScorer, bestPlayer]
    .filter((v) => v !== null).length;

  return (
    <form onSubmit={handleSubmit}>
      {/* Info banner */}
      <div className="flex gap-2 p-3 mb-6 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
        <span className="font-medium">ℹ️</span>
        <p>
          Una vez arranque el primer partido (México vs Sudáfrica, 11 jun 13:00 COT),
          no podrás modificar estas predicciones. Valen para todos los grupos donde participes.
        </p>
      </div>

      {/* Sección: Posiciones finales */}
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Posiciones finales
      </h2>

      <div className="space-y-3 mb-6">
        <PredictionRow
          icon="🏆"
          name="Campeón"
          description="¿Qué selección levantará la copa?"
          points={25}
        >
          <TeamSelect
            id="champion"
            name="champion_team_id"
            teams={teams}
            value={champion}
            onChange={setChampion}
            excludeIds={[runnerUp, thirdPlace].filter((v) => v !== null) as number[]}
          />
        </PredictionRow>

        <PredictionRow
          icon="🥈"
          name="Subcampeón"
          description="¿Quién perderá la final?"
          points={15}
        >
          <TeamSelect
            id="runner_up"
            name="runner_up_team_id"
            teams={teams}
            value={runnerUp}
            onChange={setRunnerUp}
            excludeIds={[champion, thirdPlace].filter((v) => v !== null) as number[]}
          />
        </PredictionRow>

        <PredictionRow
          icon="🥉"
          name="Tercer lugar"
          description="¿Quién ganará el partido por el bronce?"
          points={10}
        >
          <TeamSelect
            id="third_place"
            name="third_place_team_id"
            teams={teams}
            value={thirdPlace}
            onChange={setThirdPlace}
            excludeIds={[champion, runnerUp].filter((v) => v !== null) as number[]}
          />
        </PredictionRow>
      </div>

      {/* Sección: Premios individuales */}
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Premios individuales
      </h2>

      <div className="space-y-3 mb-6">
        <PredictionRow
          icon="⚽"
          name="Goleador del torneo"
          description="¿Quién será el máximo anotador?"
          points={15}
        >
          <PlayerSelect
            id="top_scorer"
            name="top_scorer_player_id"
            players={players}
            value={topScorer}
            onChange={setTopScorer}
          />
        </PredictionRow>

        <PredictionRow
          icon="⭐"
          name="Mejor jugador"
          description="¿Quién ganará el balón de oro del Mundial?"
          points={10}
        >
          <PlayerSelect
            id="best_player"
            name="best_player_id"
            players={players}
            value={bestPlayer}
            onChange={setBestPlayer}
          />
        </PredictionRow>
      </div>

      {/* Errores */}
      {hasDuplicates && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Campeón, subcampeón y tercer lugar deben ser equipos diferentes.
        </div>
      )}

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Resumen de puntos */}
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-5">
        <span className="text-sm text-slate-600">
          {filledCount === 5
            ? 'Todas las predicciones listas'
            : `${filledCount} de 5 predicciones completadas`}
        </span>
        <span className="text-base font-medium text-slate-900">
          75 pts 🎯 si aciertas todo
        </span>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || hasDuplicates}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : success ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {success ? '¡Guardado!' : 'Guardar predicciones'}
        </button>
      </div>
    </form>
  );
}

// ============================================================
// Componente auxiliar
// ============================================================

function PredictionRow({
  icon,
  name,
  description,
  points,
  children,
}: {
  icon: string;
  name: string;
  description: string;
  points: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl flex-wrap">
      <div className="flex-1 min-w-[180px]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-semibold text-slate-900">{name}</span>
          <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-900 rounded">
            +{points} pts
          </span>
        </div>
        <p className="text-xs text-slate-600">{description}</p>
      </div>
      {children}
    </div>
  );
}
