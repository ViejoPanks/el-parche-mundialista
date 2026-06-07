import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getGroupById } from '@/lib/groups/queries';
import { GroupSettingsForm } from '@/components/groups/group-settings-form';

export default async function ConfiguracionPage({
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

  const { group, role } = data;

  // Solo admin puede ver esta página
  if (role !== 'admin') {
    redirect(`/grupos/${groupId}`);
  }

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href={`/grupos/${group.id}`}
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al grupo
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">Configuración del grupo</h1>
      <p className="text-sm text-slate-600 mb-6">
        Solo el admin puede modificar estos ajustes
      </p>

      <GroupSettingsForm
        groupId={group.id}
        initialName={group.name}
        initialDescription={group.description ?? ''}
        inviteCode={group.invite_code}
      />
    </main>
  );
}
