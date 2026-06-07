'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// SCHEMA DE VALIDACIÓN
// ============================================================

const specialPredictionsSchema = z.object({
  champion_team_id: z.coerce.number().int().positive().nullable(),
  runner_up_team_id: z.coerce.number().int().positive().nullable(),
  third_place_team_id: z.coerce.number().int().positive().nullable(),
  top_scorer_player_id: z.coerce.number().int().positive().nullable(),
  best_player_id: z.coerce.number().int().positive().nullable(),
});

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================
// GUARDAR PREDICCIONES ESPECIALES
// ============================================================

export async function saveSpecialPredictions(
  formData: FormData
): Promise<ActionResult<null>> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Debes iniciar sesión' };
  }

  // Verificar si ya está bloqueado (early return)
  const { data: isLocked } = await supabase.rpc('are_special_predictions_locked');
  if (isLocked) {
    return {
      success: false,
      error: 'Las predicciones especiales ya están bloqueadas. El torneo arrancó.',
    };
  }

  // Validar input
  const raw = {
    champion_team_id: formData.get('champion_team_id') || null,
    runner_up_team_id: formData.get('runner_up_team_id') || null,
    third_place_team_id: formData.get('third_place_team_id') || null,
    top_scorer_player_id: formData.get('top_scorer_player_id') || null,
    best_player_id: formData.get('best_player_id') || null,
  };

  // Convertir cadenas vacías a null
  const cleaned: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = value === '' || value === null ? null : String(value);
  }

  const parsed = specialPredictionsSchema.safeParse(cleaned);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? 'Datos inválidos',
    };
  }

  // Validar que campeón, runner-up y tercer lugar sean diferentes
  const teamIds = [
    parsed.data.champion_team_id,
    parsed.data.runner_up_team_id,
    parsed.data.third_place_team_id,
  ].filter((id) => id !== null);

  if (new Set(teamIds).size !== teamIds.length) {
    return {
      success: false,
      error: 'Campeón, subcampeón y tercer lugar deben ser equipos diferentes',
    };
  }

  // Upsert: insertar si no existe, actualizar si existe
  const { error } = await supabase
    .from('special_predictions')
    .upsert(
      {
        user_id: user.id,
        ...parsed.data,
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('Error saving special predictions:', error);

    // Si la RLS rechazó por bloqueo
    if (error.message?.includes('row-level security')) {
      return {
        success: false,
        error: 'Las predicciones ya están bloqueadas. No se pueden modificar.',
      };
    }

    return {
      success: false,
      error: 'No se pudieron guardar las predicciones. Intenta de nuevo.',
    };
  }

  revalidatePath('/predicciones-especiales');
  return { success: true, data: null };
}
