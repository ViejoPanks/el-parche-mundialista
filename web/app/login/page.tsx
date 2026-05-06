import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; error?: string };
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl">🏆⚽</Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-4">
            Bienvenido de vuelta
          </h1>
          <p className="text-slate-600 mt-2">
            Inicia sesión para hacer tus predicciones
          </p>
        </div>

        <LoginForm
          redirect={searchParams.redirect}
          error={searchParams.error}
        />

        <p className="text-center text-sm text-slate-600 mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/signup" className="text-blue-600 font-medium hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </main>
  );
}
