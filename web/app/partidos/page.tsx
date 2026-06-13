import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Calendar, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getMatchesByDay } from '@/lib/matches/queries';
import { getPhaseMeta } from '@/lib/matches/phases';
import { MatchCard } from '@/components/matches/match-card';

export default async function PartidosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const days = await getMatchesByDay();

  // Agrupar días por etapa. Las etapas no se solapan en el calendario,
  // así que cada día hereda la fase de sus partidos.
  type PhaseGroup = { phase: string; days: typeof days; count: number };
  const phaseGroups: PhaseGroup[] = [];
  for (const day of days) {
    const phase = day.matches[0]?.phase ?? 'group';
    const last = phaseGroups[phaseGroups.length - 1];
    if (last && last.phase === phase) {
      last.days.push(day);
      last.count += day.matches.length;
    } else {
      phaseGroups.push({ phase, days: [day], count: day.matches.length });
    }
  }

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 max-w-3xl">
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
        Calendario completo del torneo · Horarios en hora Colombia (UTC-5)
      </p>

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
        <div className="space-y-10">
          {phaseGroups.map((group) => {
            const meta = getPhaseMeta(group.phase);
            return (
              <div key={group.phase + group.days[0].date}>
                <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-slate-200">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <h2 className="text-lg font-semibold text-slate-900">
                    {meta.label}
                  </h2>
                  <span className="text-sm text-slate-400">
                    {group.count} {group.count === 1 ? 'partido' : 'partidos'}
                  </span>
                </div>

                <div className="space-y-6">
                  {group.days.map((day) => (
                    <section key={day.date}>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        {day.dateLabel}
                      </h3>
                      <div className="flex flex-col gap-3">
                        {day.matches.map((match) => (
                          <MatchCard key={match.id} match={match} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}