import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Ticket, Users, Calendar, Star, Target } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getMyGroups } from '@/lib/groups/queries';
import { GroupCard } from '@/components/groups/group-card';
import { LogoutButton } from '@/components/auth/logout-button';

export default async function GruposPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single();

  const groups = await getMyGroups();

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
        <Link href="/grupos" className="flex items-center gap-3">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name ?? 'Avatar'}
              className="w-10 h-10 rounded-full border-2 border-blue-200"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
              {profile?.display_name?.[0]?.toUpperCase() ?? '⚽'}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900">El Parche Mundialista 🏆</p>
            <p className="text-xs text-slate-600">Hola, {profile?.display_name ?? 'parcero'} 👋</p>
          </div>
        </Link>
        <LogoutButton />
      </header>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/predicciones"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-300 text-blue-900 text-sm font-medium rounded-lg hover:bg-blue-100 transition"
        >
          <Target className="w-4 h-4" />
          Mis predicciones
        </Link>
        <Link
          href="/predicciones-especiales"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-900 text-sm font-medium rounded-lg hover:bg-amber-100 transition"
        >
          <Star className="w-4 h-4" />
          Predicciones especiales
        </Link>
        <Link
          href="/partidos"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
        >
          <Calendar className="w-4 h-4" />
          Ver fixture
        </Link>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Mis grupos</h1>
        <p className="text-sm text-slate-600 mt-1">
          {groups.length === 0
            ? 'Aún no perteneces a ningún grupo'
            : `${groups.length} ${groups.length === 1 ? 'grupo activo' : 'grupos activos'} · Listo para el Mundial 2026`}
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/grupos/nuevo"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Crear grupo
        </Link>
        <Link
          href="/grupos/unirme"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
        >
          <Ticket className="w-4 h-4" />
          Unirme con código
        </Link>
      </div>

      {/* Lista de grupos o empty state */}
      {groups.length === 0 ? (
        <div className="text-center py-12 px-6 bg-slate-50 rounded-xl">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Aún no tienes grupos
          </h2>
          <p className="text-sm text-slate-600 mb-1">
            Crea tu primer grupo o únete con un código que te haya compartido un amigo.
          </p>
          <p className="text-xs text-slate-500 mt-3">
            Faltan pocas semanas para que arranque el Mundial 2026 ⚽🇨🇴
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </main>
  );
}
