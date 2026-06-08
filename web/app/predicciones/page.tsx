import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Target, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getMatchesWithMyPredictions, getPredictionsSummary } from '@/lib/predictions/queries';
import { MatchPredictionCard } from '@/components/predictions/match-prediction-card';

export default async function PrediccionesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Cargar en paralelo
  const [days, summary] = await Promise.all([
    getMatchesWithMyPredictions(),
    getPredictionsSummary(),
  ]);

  // Separar días futuros (con partidos abiertos) y días pasados
  const now = Date.now();
  const futureDays = days.filter((d) =>
    d.matches.some((m) => new Date(m.match.kickoff_at).getTime() > now)
  );
  const pastDays = days.filter((d) =>
    d.matches.every((m) => new Date(m.match.kickoff_at).getTime() <= now)
  );

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
        <Target className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900">Mis predicciones</h1>
      </div>
      <p className="text-sm text-slate-600 mb-6">
        Predice el marcador de cada partido · Cada predicción se cierra al kickoff
      </p>

      {/* Resumen */}
      {summary.totalMatches > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">Predicciones</p>
            <p className="text-xl font-bold text-blue-900">
              {summary.predictedCount}
              <span className="text-sm font-normal text-blue-700">/{summary.totalMatches}</span>
            </p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700 font-medium">Por predecir</p>
            <p className="text-xl font-bold text-amber-900">
              {summary.upcomingOpenCount - summary.predictedCount > 0
                ? summary.upcomingOpenCount - summary.predictedCount
                : 0}
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs text-slate-700 font-medium">Restantes</p>
            <p className="text-xl font-bold text-slate-900">{summary.upcomingOpenCount}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {days.length === 0 && (
        <div className="text-center py-12 px-6 bg-slate-50 rounded-xl">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            No hay partidos para predecir
          </h2>
          <p className="text-sm text-slate-600">El fixture se cargará pronto.</p>
        </div>
      )}

      {/* Partidos futuros */}
      {futureDays.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            📅 Próximos partidos
          </h2>
          <div className="space-y-6">
            {futureDays.map((day) => (
              <DayBlock key={day.date} day={day} />
            ))}
          </div>
        </section>
      )}

      {/* Partidos pasados */}
      {pastDays.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            🏁 Partidos anteriores
          </h2>
          <div className="space-y-6">
            {pastDays.map((day) => (
              <DayBlock key={day.date} day={day} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function DayBlock({ day }: { day: { date: string; dateLabel: string; matches: any[] } }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        {day.dateLabel}
      </h3>
      <div className="space-y-3">
        {day.matches.map((item) => (
          <MatchPredictionCard key={item.match.id} item={item} />
        ))}
      </div>
    </div>
  );
}
