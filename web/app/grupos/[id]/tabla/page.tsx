import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { ArrowLeft, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getGroupById } from '@/lib/groups/queries';
import { getGroupLeaderboard } from '@/lib/leaderboard/queries';
import { ScoringSummary } from '@/components/reglas/scoring-summary';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';

export default async function TablaPage({
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

  const { group } = data;
  const leaderboard = await getGroupLeaderboard(groupId);

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href={`/grupos/${group.id}`}
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al grupo
      </Link>

      <div className="flex items-center gap-3 mb-1">
        <Trophy className="w-7 h-7 text-amber-500" />
        <h1 className="text-2xl font-bold text-slate-900">Tabla de posiciones</h1>
      </div>
      <p className="text-sm text-slate-600 mb-6">{group.name}</p>

      <ScoringSummary />
      <LeaderboardTable entries={leaderboard} currentUserId={user.id} />

      {/* Leyenda */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
        <p className="font-medium mb-1">Cómo se desempata:</p>
        <p>
          Puntos totales → marcadores exactos → diferencias acertadas →
          puntos especiales → quién se unió primero.
        </p>
      </div>
    </main>
  );
}
