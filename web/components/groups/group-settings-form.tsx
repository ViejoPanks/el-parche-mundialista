'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateGroup, regenerateInviteCode, deleteGroup } from '@/lib/actions/groups';
import { Loader2, RefreshCw, Trash2, AlertTriangle, Save, Check } from 'lucide-react';

interface Props {
  groupId: number;
  initialName: string;
  initialDescription: string;
  inviteCode: string;
}

export function GroupSettingsForm({
  groupId,
  initialName,
  initialDescription,
  inviteCode: initialCode,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [code, setCode] = useState(initialCode);

  // Save changes
  const [savingChanges, setSavingChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Regenerate code
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  // Delete
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleSaveChanges(e: React.FormEvent) {
    e.preventDefault();
    setSavingChanges(true);
    setSaveError(null);
    setSaveSuccess(false);

    const formData = new FormData();
    formData.append('groupId', String(groupId));
    formData.append('name', name);
    formData.append('description', description);

    const result = await updateGroup(formData);

    if (!result.success) {
      setSaveError(result.error);
      setSavingChanges(false);
      return;
    }

    setSaveSuccess(true);
    setSavingChanges(false);
    setTimeout(() => setSaveSuccess(false), 3000);
    router.refresh();
  }

  async function handleRegenerate() {
    setRegenerating(true);
    setRegenError(null);

    const formData = new FormData();
    formData.append('groupId', String(groupId));

    const result = await regenerateInviteCode(formData);

    if (!result.success) {
      setRegenError(result.error);
      setRegenerating(false);
      setConfirmRegenerate(false);
      return;
    }

    setCode(result.data.newCode);
    setRegenerating(false);
    setConfirmRegenerate(false);
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);

    const formData = new FormData();
    formData.append('groupId', String(groupId));

    const result = await deleteGroup(formData);

    // deleteGroup hace redirect en éxito; si llegamos aquí, falló
    if (!result.success) {
      setDeleteError(result.error);
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* SECCIÓN: Información básica */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Información básica
        </h2>
        <form onSubmit={handleSaveChanges} className="space-y-4">
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
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
              Descripción
            </label>
            <textarea
              id="description"
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
          </div>

          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {saveError}
            </div>
          )}

          <button
            type="submit"
            disabled={savingChanges || name.trim().length < 3}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingChanges ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveSuccess ? '¡Guardado!' : 'Guardar cambios'}
          </button>
        </form>
      </section>

      {/* SECCIÓN: Código de invitación */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Código de invitación
        </h2>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <span className="font-mono text-lg font-medium tracking-widest text-slate-900 flex-1">
            {code}
          </span>
          {!confirmRegenerate ? (
            <button
              onClick={() => setConfirmRegenerate(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
              >
                {regenerating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirmar
              </button>
              <button
                onClick={() => setConfirmRegenerate(false)}
                disabled={regenerating}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {regenError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {regenError}
          </div>
        )}

        <p className="mt-1.5 text-xs text-slate-500">
          Regenerar invalidará el código actual. Los miembros existentes no se ven afectados.
        </p>
      </section>

      {/* SECCIÓN: Zona peligrosa */}
      <section className="p-4 border border-red-300 rounded-xl bg-white">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-red-700 mb-1">
          <AlertTriangle className="w-4 h-4" />
          Zona peligrosa
        </h2>
        <p className="text-xs text-slate-600 mb-3">
          Eliminar el grupo es permanente. Se borrarán todos los miembros y predicciones asociadas.
        </p>

        {deleteError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {deleteError}
          </div>
        )}

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar grupo
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-900 font-medium">
              ¿Eliminar definitivamente este grupo? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
