'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function InviteCodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 my-4 text-center">
      <p className="text-xs font-semibold text-blue-900 mb-1.5 tracking-wider">
        CÓDIGO DE INVITACIÓN
      </p>
      <p className="font-mono text-3xl font-medium text-blue-950 tracking-widest mb-3">
        {code}
      </p>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            ¡Copiado!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copiar código
          </>
        )}
      </button>
    </div>
  );
}
