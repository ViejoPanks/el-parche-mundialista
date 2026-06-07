'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { leaveGroup } from '@/lib/actions/groups';
import { DoorOpen, Loader2 } from 'lucide-react';

export function LeaveGroupButton({ groupId, groupName }: { groupId: number; groupName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLeave() {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('groupId', String(groupId));

    const result = await leaveGroup(formData);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      setConfirming(false);
      return;
    }

    router.push('/grupos');
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-3">
        <p className="text-sm text-red-900">
          ¿Confirmas que quieres salir de <strong>{groupName}</strong>?
        </p>
        {error && (
          <p className="text-xs text-red-700">{error}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleLeave}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Sí, salir
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition"
    >
      <DoorOpen className="w-4 h-4" />
      Salir del grupo
    </button>
  );
}
