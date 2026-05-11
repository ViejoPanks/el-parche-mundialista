import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/auth/logout-button';
import { Trophy, Users, Target, ChartBar } from 'lucide-react';

export default async function ProtectedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtener perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <main className="min-h-screen container mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name ?? 'Avatar'}
              className="w-12 h-12 rounded-full border-2 border-blue-200"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
              {profile?.display_name?.[0]?.toUpperCase() ?? '⚽'}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900">El Parche Mundialista</h1>
            <p className="text-sm text-slate-600">
              Hola, {profile?.display_name ?? 'parcero'} 👋
            </p>
          </div>
        </div>
        <LogoutButton />
      </header>

      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold mb-2">¡Bienvenido al parche! 🎉</h2>
        <p className="text-blue-100">
          Estamos preparando todo para el Mundial 2026. Pronto podrás crear tu polla, invitar a tus amigos y empezar a predecir.
        </p>
      </div>

      {/* Próximos pasos (placeholders) */}
      <section className="grid md:grid-cols-2 gap-4 mb-8">
        <PlaceholderCard
          icon={<Users />}
          title="Crear o unirte a un grupo"
          description="Próximamente"
        />
        <PlaceholderCard
          icon={<Target />}
          title="Hacer predicciones"
          description="Disponible cuando empiece el Mundial"
        />
        <PlaceholderCard
          icon={<Trophy />}
          title="Predicciones especiales"
          description="Campeón, goleador, mejor jugador"
        />
        <PlaceholderCard
          icon={<ChartBar />}
          title="Tabla de posiciones"
          description="Compite con tu parche"
        />
      </section>

      {/* Debug info (solo en dev) */}
      {process.env.NEXT_PUBLIC_APP_ENV === 'development' && (
        <details className="text-xs text-slate-500 mt-8 p-4 bg-slate-100 rounded-lg">
          <summary className="cursor-pointer font-semibold">
            🔧 Info de debug (solo en dev)
          </summary>
          <pre className="mt-2 overflow-x-auto">
{JSON.stringify(
  {
    user_id: user.id,
    email: user.email,
    provider: user.app_metadata.provider,
    profile,
  },
  null,
  2
)}
          </pre>
        </details>
      )}
    </main>
  );
}

function PlaceholderCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 opacity-75">
      <div className="text-blue-600 mb-3">{icon}</div>
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}
