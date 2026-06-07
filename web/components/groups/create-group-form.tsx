'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGroup } from '@/lib/actions/groups';
import { Info, Loader2 } from 'lucide-react';

export function CreateGroupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);

    const result = await createGroup(formData);

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
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
          Nombre del grupo
        </label>
        <input
          id="name"
          type="text"
          required
          minLength={3}
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Amigos del barrio"
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-slate-500">Mínimo 3 caracteres, máximo 100</p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
          Descripción <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="description"
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Una descripción corta del grupo"
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />
      </div>

      <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Tú serás el admin</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Podrás editar, eliminar el grupo y regenerar el código de invitación
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
          disabled={loading || name.trim().length < 3}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Crear grupo
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
