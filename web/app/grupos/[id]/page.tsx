import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { ArrowLeft, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getGroupById } from '@/lib/groups/queries';
import { InviteCodeDisplay } from '@/components/groups/invite-code-display';
import { LeaveGroupButton } from '@/components/groups/leave-group-button';

export default async function GrupoDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const groupId = parseInt(params.id, 10);
  if (isNaN(groupId)) notFound();

  const data = await getGroupById(groupId);
  if (!data) notFound();

  const { group, role, members } = data;

  // Colores para avatares según índice
  const avatarColors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-rose-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];

  function getAvatarColor(userId: string): string {
    // Determinístico: misma persona, mismo color
    const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return avatarColors[hash % avatarColors.length];
  }

  function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'hace unos minutos';
    if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays < 7) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const isCreator = group.created_by === user.id;

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href="/grupos"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Mis grupos
      </Link>

      {/* Título + botón configuración */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
          {group.description && (
            <p className="text-sm text-slate-600 mt-1">{group.description}</p>
          )}
        </div>

        {role === 'admin' && (
          <Link
            href={`/grupos/${group.id}/configuracion`}
            className="inline-flex items-center justify-center w-9 h-9 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            title="Configuración"
            aria-label="Configuración del grupo"
          >
            <Settings className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Código de invitación */}
      <InviteCodeDisplay code={group.invite_code} />

      {/* Sección de miembros */}
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-3">
        Miembros · {members.length}
      </h2>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {members.map((member) => (
          <div key={member.user_id} className="flex items-center gap-3 p-3">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.display_name}
                className="w-9 h-9 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className={`w-9 h-9 rounded-full ${getAvatarColor(
                  member.user_id
                )} text-white flex items-center justify-center text-sm font-semibold`}
              >
                {member.display_name[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate flex items-center gap-2">
                {member.display_name}
                {member.user_id === user.id && (
                  <span className="text-xs text-slate-500 font-normal">(tú)</span>
                )}
                {member.role === 'admin' && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    Admin
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-500">
                {member.user_id === group.created_by
                  ? `Creó el grupo · ${formatRelativeDate(member.joined_at)}`
                  : `Se unió ${formatRelativeDate(member.joined_at)}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Botón salir (no se muestra si es el creador único admin) */}
      <div className="mt-6">
        <LeaveGroupButton groupId={group.id} groupName={group.name} />
      </div>
    </main>
  );
}
