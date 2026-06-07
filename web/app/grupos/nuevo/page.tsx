import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { CreateGroupForm } from '@/components/groups/create-group-form';

export default async function NuevoGrupoPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href="/grupos"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a mis grupos
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">Crear un grupo</h1>
      <p className="text-sm text-slate-600 mb-6">
        Después podrás invitar a tus amigos con un código
      </p>

      <CreateGroupForm />
    </main>
  );
}
