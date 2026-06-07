'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinGroup } from '@/lib/actions/groups';
import { Lightbulb, Loader2 } from 'lucide-react';

export function JoinGroupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('inviteCode', code.toUpperCase().trim());

    const result = await joinGroup(formData);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(`/grupos/${result.data.groupId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-1.5">
          Código de invitación
        </label>
        <input
          id="code"
          type="text"
          required
          minLength={8}
          maxLength={8}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="XXXXXXXX"
          className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-2xl font-medium tracking-widest uppercase"
          autoComplete="off"
          autoCapitalize="characters"
        />
        <p className="mt-1 text-xs text-slate-500">
          8 caracteres alfanuméricos (sin distinguir mayúsculas)
        </p>
      </div>

      <div className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900">¿No tienes código?</p>
          <p className="text-xs text-amber-800 mt-0.5">
            Pídele al admin del grupo que te lo comparta. O crea tu propio grupo.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || code.trim().length !== 8}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Unirme al grupo
        </button>
        <button
          type="button"
          onClick={() => router.push('/grupos')}
          className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
