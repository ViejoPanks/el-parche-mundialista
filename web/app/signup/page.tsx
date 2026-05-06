import { SignupForm } from '@/components/auth/signup-form';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl">🏆⚽</Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-4">
            Únete al parche
          </h1>
          <p className="text-slate-600 mt-2">
            Crea tu cuenta para empezar a predecir
          </p>
        </div>

        <SignupForm />

        <p className="text-center text-sm text-slate-600 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
