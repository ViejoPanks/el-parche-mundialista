'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// SCHEMA
// ============================================================

const savePredictionSchema = z.object({
  matchId: z.coerce.number().int().positive(),
  predLocal: z.coerce.number().int().min(0).max(20),
  predVisitante: z.coerce.number().int().min(0).max(20),
});

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================
// GUARDAR PREDICCIÓN DE UN PARTIDO
// ============================================================

export async function savePrediction(
  formData: FormData
): Promise<ActionResult<{ matchId: number }>> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Debes iniciar sesión' };
  }

  // Validar input
  const parsed = savePredictionSchema.safeParse({
    matchId: formData.get('matchId'),
    predLocal: formData.get('predLocal'),
    predVisitante: formData.get('predVisitante'),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? 'Datos inválidos',
    };
  }

  const { matchId, predLocal, predVisitante } = parsed.data;

  // Verificar que el partido no esté bloqueado (early return)
  const { data: isLocked } = await supabase.rpc('is_match_locked', {
    p_match_id: matchId,
  });

  if (isLocked) {
    return {
      success: false,
      error: 'Este partido ya empezó. Las predicciones están cerradas.',
    };
  }

  // Upsert: insertar si no existe, actualizar si existe
  const { error } = await supabase
    .from('predictions')
    .upsert(
      {
        user_id: user.id,
        match_id: matchId,
        pred_local: predLocal,
        pred_visitante: predVisitante,
      },
      { onConflict: 'user_id,match_id' }
    );

  if (error) {
    console.error('Error saving prediction:', error);

    if (error.message?.includes('row-level security')) {
      return {
        success: false,
        error: 'El partido ya empezó o no tienes permisos.',
      };
    }

    return {
      success: false,
      error: 'No se pudo guardar la predicción. Intenta de nuevo.',
    };
  }

  revalidatePath('/predicciones');
  return { success: true, data: { matchId } };
}
