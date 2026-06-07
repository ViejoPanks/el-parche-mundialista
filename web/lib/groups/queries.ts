import { createClient } from '@/lib/supabase/server';

/**
 * Tipos compartidos
 */
export interface Group {
  id: number;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface GroupWithMembership extends Group {
  role: 'admin' | 'member';
  member_count: number;
}

export interface GroupMember {
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  display_name: string;
  avatar_url: string | null;
}

/**
 * Obtiene todos los grupos a los que pertenece el usuario autenticado,
 * con su rol y la cantidad total de miembros de cada grupo.
 */
export async function getMyGroups(): Promise<GroupWithMembership[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberships, error } = await supabase
    .from('group_members')
    .select(`
      role,
      group:groups (
        id,
        name,
        description,
        invite_code,
        created_by,
        created_at
      )
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching groups:', error);
    return [];
  }

  if (!memberships) return [];

  // Para cada grupo, contar miembros
  const groupsWithCount = await Promise.all(
    memberships
      .filter((m) => m.group !== null)
      .map(async (m) => {
        // @ts-expect-error - Supabase typing
        const group: Group = m.group;

        const { count } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);

        return {
          ...group,
          role: m.role as 'admin' | 'member',
          member_count: count ?? 0,
        };
      })
  );

  // Ordenar: admin primero, después por fecha de creación
  groupsWithCount.sort((a, b) => {
    if (a.role !== b.role) return a.role === 'admin' ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return groupsWithCount;
}

/**
 * Obtiene un grupo específico por su ID, verificando que el usuario
 * sea miembro. Devuelve null si no existe o si no tiene acceso.
 */
export async function getGroupById(
  groupId: number
): Promise<{ group: Group; role: 'admin' | 'member'; members: GroupMember[] } | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Verificar membresía y obtener rol
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) return null;

  // Obtener datos del grupo
  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (!group) return null;

  // Obtener todos los miembros con sus perfiles
  const { data: membersData } = await supabase
    .from('group_members')
    .select(`
      user_id,
      role,
      joined_at,
      profile:profiles (
        display_name,
        avatar_url
      )
    `)
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  const members: GroupMember[] = (membersData ?? [])
    .filter((m) => m.profile !== null)
    .map((m) => ({
      user_id: m.user_id,
      role: m.role as 'admin' | 'member',
      joined_at: m.joined_at,
      // @ts-expect-error - Supabase typing
      display_name: m.profile.display_name,
      // @ts-expect-error - Supabase typing
      avatar_url: m.profile.avatar_url,
    }));

  return {
    group: group as Group,
    role: membership.role as 'admin' | 'member',
    members,
  };
}
