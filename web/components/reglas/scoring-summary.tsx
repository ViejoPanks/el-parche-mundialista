'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Info, ChevronDown } from 'lucide-react';
import { shortSummary } from '@/lib/reglas/content';

/**
 * Resumen colapsable del puntaje, para mostrar en la tabla de
 * posiciones. Arranca cerrado; el usuario lo abre si tiene la duda.
 */
export function ScoringSummary() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition text-sm font-medium text-slate-700"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Info className="w-4 h-4" />
          ¿Cómo se ganan los puntos?
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-4 py-3 text-sm">
          <div className="space-y-1.5">
            {shortSummary.map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-slate-700">
                  {row.icon} {row.label}
                </span>
                <span className="font-medium text-slate-900">{row.rango}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <Link
              href="/reglas"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver reglamento completo →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
