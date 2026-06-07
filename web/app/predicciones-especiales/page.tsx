import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import {
  getLockoutInfo,
  getMySpecialPredictions,
  getAllTeams,
  getAllPlayers,
} from '@/lib/special-predictions/queries';
import { LockoutBanner } from '@/components/special-predictions/lockout-banner';
import { SpecialPredictionsForm } from '@/components/special-predictions/special-predictions-form';
import { SpecialPredictionsView } from '@/components/special-predictions/special-predictions-view';

export default async function PrediccionesEspecialesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Cargar datos en paralelo
  const [lockoutInfo, predictions, teams, players] = await Promise.all([
    getLockoutInfo(),
    getMySpecialPredictions(),
    getAllTeams(),
    getAllPlayers(),
  ]);

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/grupos"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Mis grupos
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">
        Predicciones especiales
      </h1>
      <p className="text-sm text-slate-600 mb-6">
        {lockoutInfo.isLocked
          ? 'Estas son tus predicciones para todo el torneo'
          : 'Tus predicciones para todo el torneo · 75 puntos en juego'}
      </p>

      {/* Banner de bloqueo o countdown */}
      <LockoutBanner lockoutInfo={lockoutInfo} />

      {/* Form (editable) o vista (bloqueado) */}
      {lockoutInfo.isLocked ? (
        <SpecialPredictionsView
          teams={teams}
          players={players}
          predictions={predictions}
        />
      ) : (
        <SpecialPredictionsForm
          teams={teams}
          players={players}
          initialPredictions={predictions}
        />
      )}
    </main>
  );
}
