'use client';

import { useState } from 'react';
import { Loader2, RefreshCw, Link2, AlertTriangle } from 'lucide-react';

interface SyncResponse {
  success?: boolean;
  matchesUpdated?: number;
  details?: string[];
  error?: string;
}

export default function AdminPage() {
  const [mapping, setMapping] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResponse | null>(null);

  async function handleMap() {
    setMapping(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/map-fixtures', { method: 'POST' });
      setResult(await res.json());
    } catch (err) {
      setResult({ error: 'Error de red' });
    } finally {
      setMapping(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/sync-results', { method: 'POST' });
      setResult(await res.json());
    } catch (err) {
      setResult({ error: 'Error de red' });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Admin · Resultados</h1>
      <p className="text-sm text-slate-600 mb-6">
        Panel de sincronización con API-Football. Solo visible para el admin.
      </p>

      {/* Aviso */}
      <div className="flex gap-3 p-3 mb-6 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800">
          <p className="font-medium mb-1">Orden de uso:</p>
          <p>1. <strong>Mapear fixtures</strong> una sola vez (vincula los partidos con la API).</p>
          <p>2. <strong>Sincronizar</strong> cuando quieras traer resultados. El cron lo hace solo cada minuto.</p>
        </div>
      </div>

      {/* Botones */}
      <div className="space-y-3 mb-6">
        <button
          onClick={handleMap}
          disabled={mapping || syncing}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition disabled:opacity-50"
        >
          {mapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
          Mapear fixtures (una vez)
        </button>

        <button
          onClick={handleSync}
          disabled={mapping || syncing}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Sincronizar resultados ahora
        </button>
      </div>

      {/* Resultado */}
      {result && (
        <div
          className={`p-4 rounded-lg border ${
            result.error
              ? 'bg-red-50 border-red-200'
              : 'bg-green-50 border-green-200'
          }`}
        >
          {result.error ? (
            <p className="text-sm text-red-700 font-medium">Error: {result.error}</p>
          ) : (
            <>
              <p className="text-sm font-medium text-green-900 mb-2">
                ✅ {result.matchesUpdated} partidos actualizados
              </p>
              {result.details && (
                <ul className="text-xs text-green-800 space-y-0.5 font-mono">
                  {result.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
