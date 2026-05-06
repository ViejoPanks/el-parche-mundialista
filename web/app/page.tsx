import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Trophy, Users, Target, ChartBar } from 'lucide-react';

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-4">🏆⚽</div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4">
            El Parche Mundialista
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            La polla del Mundial 2026 para vivir cada partido con tu parche y tus colegas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                href="/protected"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Ir a mi polla
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Crear cuenta
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Iniciar sesión
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Grupos privados"
            description="Crea pollas con tus amigos o tu oficina. Solo entran con código."
          />
          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="Predicciones"
            description="Pronostica los marcadores y suma puntos por cada acierto."
          />
          <FeatureCard
            icon={<Trophy className="w-8 h-8" />}
            title="Bonus de campeón"
            description="Acierta al campeón, goleador y mejor jugador desde el día 1."
          />
          <FeatureCard
            icon={<ChartBar className="w-8 h-8" />}
            title="Tabla en vivo"
            description="Mira las posiciones actualizándose en tiempo real."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-slate-500">
        <p>
          Hecho con ❤️ para el Mundial 2026 · Solo registro de puntos, sin manejo de dinero
        </p>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="text-blue-600 mb-3">{icon}</div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}
