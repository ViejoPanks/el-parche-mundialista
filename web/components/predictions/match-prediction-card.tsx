'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, Lock, Trophy, MapPin, Clock } from 'lucide-react';
import { savePrediction } from '@/lib/actions/predictions';
import type { MatchWithPrediction } from '@/lib/predictions/types';
import { formatMatchTime } from '@/lib/matches/utils';
import { getPhaseMeta } from '@/lib/matches/phases';

interface Props {
  item: MatchWithPrediction;
}

type CardMatch = MatchWithPrediction['match'];

// ============================================================
// Fase / grupo
// ============================================================
function getStageLabel(match: CardMatch): string | null {
  if (match.phase === 'group') {
    return match.team_local?.group_name
      ? `Grupo ${match.team_local.group_name}`
      : null;
  }
  return getPhaseMeta(match.phase).label;
}

function StageBadge({ label }: { label: string | null }) {
  if (!label) return null;
  return (
    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
      {label}
    </span>
  );
}

// ============================================================
// Bonus "¿quién avanza?" (solo eliminatorias desde octavos)
// r32 (16avos) queda excluido por decisión.
// ============================================================
const ADVANCE_PHASES = ['r16', 'qf', 'sf', 'third_place', 'final'];

function phaseUsesAdvance(phase: string): boolean {
  return ADVANCE_PHASES.includes(phase);
}

function advanceLabel(phase: string): string {
  return phase === 'final' || phase === 'third_place'
    ? '¿Quién gana?'
    : '¿Quién avanza?';
}

function teamNameById(match: CardMatch, id: number | null): string | null {
  if (id == null) return null;
  if (match.team_local?.id === id) return match.team_local.name;
  if (match.team_visitante?.id === id) return match.team_visitante.name;
  return null;
}

export function MatchPredictionCard({ item }: Props) {
  const { match, prediction, isLocked } = item;
  const router = useRouter();

  const [predLocal, setPredLocal] = useState<string>(
    prediction?.pred_local !== undefined ? String(prediction.pred_local) : ''
  );
  const [predVisitante, setPredVisitante] = useState<string>(
    prediction?.pred_visitante !== undefined ? String(prediction.pred_visitante) : ''
  );

  const showAdvance = phaseUsesAdvance(match.phase);
  const initialAdvance = prediction?.pred_winner_advance ?? null;
  const [advanceId, setAdvanceId] = useState<number | null>(initialAdvance);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const time = formatMatchTime(match.kickoff_at);
  const stageLabel = getStageLabel(match);
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  const hasPrediction = prediction !== null;

  const numLocal = predLocal === '' ? null : parseInt(predLocal, 10);
  const numVisitante = predVisitante === '' ? null : parseInt(predVisitante, 10);
  const isComplete = numLocal !== null && numVisitante !== null && !isNaN(numLocal) && !isNaN(numVisitante);

  const advanceChanged = showAdvance && advanceId !== initialAdvance;
  const isChanged =
    prediction === null ||
    numLocal !== prediction.pred_local ||
    numVisitante !== prediction.pred_visitante ||
    advanceChanged;

  async function handleSave() {
    if (!isComplete) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    const formData = new FormData();
    formData.set('matchId', String(match.id));
    formData.set('predLocal', String(numLocal));
    formData.set('predVisitante', String(numVisitante));
    if (showAdvance && advanceId !== null) {
      formData.set('predWinnerAdvance', String(advanceId));
    }

    const result = await savePrediction(formData);

    if (!result.success) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);
    router.refresh();
  }

  // ============================================================
  // ESTADO: Partido terminado o en vivo
  // ============================================================
  if (isFinished || isLive) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-slate-700">{time}</span>
            <StageBadge label={stageLabel} />
          </div>
          {isLive ? (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded font-medium animate-pulse">
              EN VIVO
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
              Terminado
            </span>
          )}
        </div>

        <div className="space-y-2 mb-3">
          <TeamRow team={match.team_local} score={match.goals_local_90} bold />
          <TeamRow team={match.team_visitante} score={match.goals_visitante_90} bold />
        </div>

        {hasPrediction && (
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                Tu predicción:{' '}
                <span className="font-semibold text-slate-900">
                  {prediction.pred_local} - {prediction.pred_visitante}
                </span>
              </span>
              {isFinished && (
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded font-medium ${
                    prediction.points_earned > 0
                      ? 'bg-green-50 text-green-800'
                      : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  <Trophy className="w-3 h-3" />
                  {prediction.points_earned} pts
                </span>
              )}
            </div>
            {showAdvance && prediction.pred_winner_advance != null && (
              <p className="text-xs text-slate-500 mt-1">
                Tu pase:{' '}
                <span className="font-medium text-slate-700">
                  {teamNameById(match, prediction.pred_winner_advance) ?? '—'}
                </span>
              </p>
            )}
            {prediction.is_exact && (
              <p className="text-xs text-green-700 font-medium mt-1">🎯 Marcador exacto</p>
            )}
            {!prediction.is_exact && prediction.is_diff_correct && (
              <p className="text-xs text-blue-700 font-medium mt-1">
                ✓ Diferencia + ganador
              </p>
            )}
          </div>
        )}

        {!hasPrediction && isFinished && (
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 italic">
            No predijiste este partido
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // ESTADO: Bloqueado (kickoff pasado pero aún no terminado)
  // ============================================================
  if (isLocked) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 opacity-75">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-slate-700">{time}</span>
            <StageBadge label={stageLabel} />
          </div>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
            <Lock className="w-3 h-3" />
            Bloqueado
          </span>
        </div>

        <div className="space-y-2 mb-3">
          <TeamRow team={match.team_local} />
          <TeamRow team={match.team_visitante} />
        </div>

        {hasPrediction ? (
          <div className="pt-3 border-t border-slate-100 text-sm text-slate-600">
            Tu predicción:{' '}
            <span className="font-semibold text-slate-900">
              {prediction.pred_local} - {prediction.pred_visitante}
            </span>
            {showAdvance && prediction.pred_winner_advance != null && (
              <span className="block text-xs text-slate-500 mt-1">
                Tu pase:{' '}
                <span className="font-medium text-slate-700">
                  {teamNameById(match, prediction.pred_winner_advance) ?? '—'}
                </span>
              </span>
            )}
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 italic">
            No alcanzaste a predecir
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // ESTADO: Abierto (puede predecir)
  // ============================================================
  return (
    <div
      className={`bg-white border rounded-xl p-4 transition ${
        hasPrediction ? 'border-blue-200' : 'border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-slate-500" />
          <span className="font-mono font-semibold text-slate-700">{time}</span>
          <StageBadge label={stageLabel} />
        </div>
        {hasPrediction ? (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
            Predicho
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-medium">
            Sin predecir
          </span>
        )}
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between gap-3">
          <TeamRow team={match.team_local} flex />
          <ScoreInput
            value={predLocal}
            onChange={setPredLocal}
            ariaLabel={`Goles de ${match.team_local?.name ?? 'local'}`}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <TeamRow team={match.team_visitante} flex />
          <ScoreInput
            value={predVisitante}
            onChange={setPredVisitante}
            ariaLabel={`Goles de ${match.team_visitante?.name ?? 'visitante'}`}
          />
        </div>
      </div>

      {showAdvance && (
        <AdvanceSelector match={match} value={advanceId} onChange={setAdvanceId} />
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
        {match.venue && (
          <div className="flex items-center gap-1 text-xs text-slate-500 flex-1 min-w-0">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{match.venue}</span>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !isComplete || !isChanged}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saved ? (
            <Check className="w-3.5 h-3.5" />
          ) : null}
          {saved ? 'Guardado' : hasPrediction ? 'Actualizar' : 'Guardar'}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-700">{error}</p>
      )}
    </div>
  );
}

// ============================================================
// Componentes auxiliares
// ============================================================

function AdvanceSelector({
  match,
  value,
  onChange,
}: {
  match: CardMatch;
  value: number | null;
  onChange: (id: number) => void;
}) {
  const local = match.team_local;
  const visitante = match.team_visitante;
  if (!local || !visitante) return null;

  return (
    <div className="pt-3 mb-1 border-t border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-700">
          {advanceLabel(match.phase)}
        </span>
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
          +2 pts
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <AdvanceButton
          team={local}
          selected={value === local.id}
          onClick={() => onChange(local.id)}
        />
        <AdvanceButton
          team={visitante}
          selected={value === visitante.id}
          onClick={() => onChange(visitante.id)}
        />
      </div>

      <p className="text-xs text-slate-400 mt-2">Incluye prórroga y penales</p>
    </div>
  );
}

function AdvanceButton({
  team,
  selected,
  onClick,
}: {
  team: { id: number; name: string; code: string; flag_url: string | null };
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition ${
        selected
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-slate-200 text-slate-700 hover:border-slate-300'
      }`}
    >
      {team.flag_url ? (
        <img
          src={team.flag_url}
          alt=""
          className="w-6 h-4 object-cover rounded-sm border border-slate-200 flex-shrink-0"
        />
      ) : (
        <span className="text-xs font-semibold">{team.code}</span>
      )}
      <span className="truncate">{team.name}</span>
      {selected && <Check className="w-4 h-4 flex-shrink-0" />}
    </button>
  );
}

function TeamRow({
  team,
  score,
  bold = false,
  flex = false,
}: {
  team: { name: string; flag_url: string | null } | null;
  score?: number | null;
  bold?: boolean;
  flex?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${flex ? 'flex-1 min-w-0' : ''}`}>
      {team?.flag_url ? (
        <img
          src={team.flag_url}
          alt={team.name}
          className="w-8 h-6 object-cover rounded-sm border border-slate-200 flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-6 bg-slate-100 rounded-sm flex-shrink-0" />
      )}
      <span className={`${bold ? 'font-semibold' : 'font-medium'} text-slate-900 truncate`}>
        {team?.name ?? 'Por definir'}
      </span>
      {score !== undefined && score !== null && (
        <span className="ml-auto text-xl font-bold text-slate-900 tabular-nums">
          {score}
        </span>
      )}
    </div>
  );
}

function ScoreInput({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      min={0}
      max={20}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      placeholder="-"
      className="w-14 px-2 py-1.5 text-center font-mono text-lg font-semibold text-slate-900 bg-white placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
      style={{ WebkitTextFillColor: '#0f172a' }}
    />
  );
}
