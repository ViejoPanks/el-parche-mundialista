'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// SCHEMAS DE VALIDACIÓN (con Zod)
// ============================================================

const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z
    .string()
    .trim()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
});

const joinGroupSchema = z.object({
  inviteCode: z
    .string()
    .trim()
    .min(8, 'El código debe tener 8 caracteres')
    .max(10, 'El código es demasiado largo'),
});

const updateGroupSchema = z.object({
  groupId: z.coerce.number().int().positive(),
  name: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100),
  description: z.string().trim().max(500).optional().or(z.literal('')),
});

const groupIdSchema = z.object({
  groupId: z.coerce.number().int().positive(),
});

// ============================================================
// TIPO DE RESULTADO ESTÁNDAR
// ============================================================
// Todos los Server Actions devuelven { success, error?, data? }
// para manejo consistente desde el cliente.

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================
// CREAR GRUPO
// ============================================================

export async function createGroup(
  formData: FormData
): Promise<ActionResult<{ groupId: number; inviteCode: string }>> {
  const supabase = createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Debes iniciar sesión' };
  }

  // Validar input
  const parsed = createGroupSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? 'Datos inválidos',
    };
  }

  // Llamar a la función RPC que crea grupo + agrega admin atómicamente
  const { data, error } = await supabase
    .rpc('create_group_with_admin', {
      p_name: parsed.data.name,
      p_description: parsed.data.description || null,
    })
    .single();

  if (error) {
    console.error('Error creating group:', error);
    return { success: false, error: 'No se pudo crear el grupo. Intenta de nuevo.' };
  }

  if (!data) {
    return { success: false, error: 'Error inesperado al crear el grupo' };
  }

  // Refrescar la lista de grupos
  revalidatePath('/grupos');

  return {
    success: true,
    data: {
      groupId: data.id as number,
      inviteCode: data.invite_code as string,
    },
  };
}

// ============================================================
// UNIRSE A GRUPO POR CÓDIGO
// ============================================================

export async function joinGroup(
  formData: FormData
): Promise<ActionResult<{ groupId: number; groupName: string }>> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Debes iniciar sesión' };
  }

  const parsed = joinGroupSchema.safeParse({
    inviteCode: formData.get('inviteCode'),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? 'Código inválido',
    };
  }

  const { data, error } = await supabase
    .rpc('join_group_by_code', {
      p_invite_code: parsed.data.inviteCode,
    })
    .single();

  if (error) {
    console.error('Error joining group:', error);

    // Mapear errores conocidos de Postgres a mensajes amigables
    const message = error.message ?? '';
    if (message.includes('Código de invitación inválido')) {
      return { success: false, error: 'El código no existe. Verifica que esté bien escrito.' };
    }
    if (message.includes('Ya eres miembro')) {
      return { success: false, error: 'Ya perteneces a este grupo' };
    }
    if (message.includes('límite de 50 miembros')) {
      return { success: false, error: 'Este grupo ya alcanzó el máximo de 50 miembros' };
    }

    return { success: false, error: 'No se pudo unir al grupo. Intenta de nuevo.' };
  }

  if (!data) {
    return { success: false, error: 'Error inesperado al unirse al grupo' };
  }

  revalidatePath('/grupos');

  return {
    success: true,
    data: {
      groupId: data.id as number,
      groupName: data.name as string,
    },
  };
}

// ============================================================
// SALIR DE GRUPO
// ============================================================

export async function leaveGroup(
  formData: FormData
): Promise<ActionResult<null>> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Debes iniciar sesión' };
  }

  const parsed = groupIdSchema.safeParse({
    groupId: formData.get('groupId'),
  });

  if (!parsed.success) {
    return { success: false, error: 'Grupo inválido' };
  }

  // Verificar que NO sea el único admin
  const { data: members } = await supabase
    .from('group_members')
    .select('user_id, role')
    .eq('group_id', parsed.data.groupId);

  if (!members || members.length === 0) {
    return { success: false, error: 'No perteneces a este grupo' };
  }

  const isAdmin = members.some(
    (m) => m.user_id === user.id && m.role === 'admin'
  );
  const adminCount = members.filter((m) => m.role === 'admin').length;

  if (isAdmin && adminCount === 1 && members.length > 1) {
    return {
      success: false,
      error:
        'Eres el único admin. Asigna a otro como admin antes de salir, o elimina el grupo.',
    };
  }

  // Eliminar la membresía
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', parsed.data.groupId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error leaving group:', error);
    return { success: false, error: 'No se pudo salir del grupo' };
  }

  revalidatePath('/grupos');
  return { success: true, data: null };
}

// ============================================================
// ELIMINAR GRUPO (solo admin)
// ============================================================

export async function deleteGroup(
  formData: FormData
): Promise<ActionResult<null>> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Debes iniciar sesión' };
  }

  const parsed = groupIdSchema.safeParse({
    groupId: formData.get('groupId'),
  });

  if (!parsed.success) {
    return { success: false, error: 'Grupo inválido' };
  }

  // El RLS valida que solo el admin pueda hacer DELETE
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', parsed.data.groupId);

  if (error) {
    console.error('Error deleting group:', error);
    return {
      success: false,
      error: 'No se pudo eliminar el grupo. Solo el admin puede hacerlo.',
    };
  }

  revalidatePath('/grupos');
  redirect('/grupos');
}

// ============================================================
// ACTUALIZAR GRUPO (nombre/descripción) — solo admin
// ============================================================

export async function updateGroup(
  formData: FormData
): Promise<ActionResult<null>> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Debes iniciar sesión' };
  }

  const parsed = updateGroupSchema.safeParse({
    groupId: formData.get('groupId'),
    name: formData.get('name'),
    description: formData.get('description'),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? 'Datos inválidos',
    };
  }

  // RLS valida que solo el admin pueda hacer UPDATE
  const { error } = await supabase
    .from('groups')
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
    })
    .eq('id', parsed.data.groupId);

  if (error) {
    console.error('Error updating group:', error);
    return {
      success: false,
      error: 'No se pudo actualizar. Solo el admin puede modificar el grupo.',
    };
  }

  revalidatePath(`/grupos/${parsed.data.groupId}`);
  return { success: true, data: null };
}

// ============================================================
// REGENERAR CÓDIGO DE INVITACIÓN (solo admin)
// ============================================================
// Útil si el código se filtró y el admin quiere bloquear nuevos ingresos.

export async function regenerateInviteCode(
  formData: FormData
): Promise<ActionResult<{ newCode: string }>> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Debes iniciar sesión' };
  }

  const parsed = groupIdSchema.safeParse({
    groupId: formData.get('groupId'),
  });

  if (!parsed.success) {
    return { success: false, error: 'Grupo inválido' };
  }

  // Generar nuevo código vía función SQL (la misma del trigger)
  const { data: codeResult } = await supabase.rpc('generate_invite_code');

  if (!codeResult) {
    return { success: false, error: 'No se pudo generar nuevo código' };
  }

  // Actualizar el grupo (RLS valida que solo admin pueda)
  const { error } = await supabase
    .from('groups')
    .update({ invite_code: codeResult })
    .eq('id', parsed.data.groupId);

  if (error) {
    console.error('Error regenerating code:', error);
    return {
      success: false,
      error: 'No se pudo regenerar. Solo el admin puede hacerlo.',
    };
  }

  revalidatePath(`/grupos/${parsed.data.groupId}`);
  return { success: true, data: { newCode: codeResult as string } };
}
