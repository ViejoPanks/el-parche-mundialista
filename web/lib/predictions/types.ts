/**
 * Types puros de predicciones — sin dependencias de server.
 * Pueden usarse tanto en Server como en Client Components.
 */

import type { Match } from '@/lib/matches/utils';

export interface MyPrediction {
  match_id: number;
  pred_local: number;
  pred_visitante: number;
  points_earned: number;
  is_exact: boolean;
  is_diff_correct: boolean;
  updated_at: string;
}

export interface MatchWithPrediction {
  match: Match;
  prediction: MyPrediction | null;
  isLocked: boolean; // ya pasó el kickoff
}

export interface PredictionsByDay {
  date: string;
  dateLabel: string;
  matches: MatchWithPrediction[];
}
