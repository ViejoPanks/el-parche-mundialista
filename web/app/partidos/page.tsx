import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Calendar, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getMatchesByDay } from '@/lib/matches/queries';
import { MatchCard } from '@/components/matches/match-card';

export default async function PartidosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const days = await getMatchesByDay();

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 max-w-3xl">
      {/* Header con back link */}
      <Link
        href="/grupos"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Mis grupos
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <Trophy className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900">Mundial 2026</h1>
      </div>
      <p className="text-sm text-slate-600 mb-6">
        Calendario completo de la fase de grupos · Horarios en hora Colombia (UTC-5)
      </p>

      {/* Empty state */}
      {days.length === 0 ? (
        <div className="text-center py-12 px-6 bg-slate-50 rounded-xl">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            No hay partidos cargados
          </h2>
          <p className="text-sm text-slate-600">
            El fixture se cargará pronto.
          </p>
        </div>
      ) : (
        /* Lista agrupada por día */
        <div className="space-y-6">
          {days.map((day) => (
            <section key={day.date}>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {day.dateLabel}
              </h2>
              <div className="flex flex-col gap-3">
                {day.matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
