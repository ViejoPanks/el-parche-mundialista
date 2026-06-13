import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  scoringByPhase,
  scoringExplanation,
  exampleResult,
  examples,
  specialPredictions,
  specialTotal,
  advanceBonus,
  tiebreakers,
  timeRules,
} from '@/lib/reglas/content';

export const metadata = {
  title: 'Cómo se juega · El Parche Mundialista',
};

export default function ReglasPage() {
  return (
    <main className="min-h-screen container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/grupos"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Mis grupos
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">📋 Cómo se juega</h1>
      <p className="text-sm text-slate-600 mb-6">Reglamento de puntaje · Mundial 2026</p>

      {/* Cómo se evalúa cada predicción */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Cómo se evalúa tu predicción
        </h2>
        <div className="space-y-2">
          {scoringExplanation.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg"
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tabla de puntos por fase */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Puntos por partido (según fase)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500">
                <th className="text-left font-medium px-3 py-2">Acierto</th>
                <th className="font-medium px-2 py-2">Grupos</th>
                <th className="font-medium px-2 py-2">8vos</th>
                <th className="font-medium px-2 py-2">4tos</th>
                <th className="font-medium px-2 py-2">Semis</th>
                <th className="font-medium px-2 py-2">Final</th>
              </tr>
            </thead>
            <tbody>
              {scoringByPhase.map((row) => (
                <tr key={row.acierto} className="border-t border-slate-100">
                  <td className="px-3 py-2.5 font-medium text-slate-900">
                    {row.icon} {row.acierto}
                  </td>
                  <td className="text-center px-2 py-2.5 tabular-nums">{row.grupos}</td>
                  <td className="text-center px-2 py-2.5 tabular-nums">{row.octavos}</td>
                  <td className="text-center px-2 py-2.5 tabular-nums">{row.cuartos}</td>
                  <td className="text-center px-2 py-2.5 tabular-nums">{row.semis}</td>
                  <td className="text-center px-2 py-2.5 tabular-nums">{row.final}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Se evalúa el marcador al minuto 90 (sin prórroga ni penales).
        </p>
      </section>

      {/* Ejemplos prácticos */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Ejemplos prácticos
        </h2>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-3">
            Si el resultado real es <strong>{exampleResult}</strong> (en fase de grupos):
          </p>
          <div className="space-y-1.5">
            {examples.map((ex) => (
              <div
                key={ex.prediccion}
                className="flex items-center justify-between text-sm bg-white rounded px-3 py-2"
              >
                <span className="font-mono font-semibold text-slate-900 w-12">{ex.prediccion}</span>
                <span className="text-slate-600 flex-1 px-2">{ex.acierto}</span>
                <span className="font-semibold text-slate-900">
                  {ex.puntos} {ex.puntos === 1 ? 'pt' : 'pts'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bonus quién pasa */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Bonus "¿quién pasa?" (solo eliminatorias)
        </h2>
        <div className="flex items-start justify-between gap-3 p-4 bg-white border border-slate-200 rounded-lg">
          <p className="text-sm text-slate-600 flex-1">{advanceBonus.desc}</p>
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-900 rounded flex-shrink-0">
            +{advanceBonus.puntos} pts
          </span>
        </div>
      </section>

      {/* Predicciones especiales */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Predicciones especiales
        </h2>
        <p className="text-xs text-slate-600 mb-3">
          Se hacen una sola vez antes del primer partido (11 jun 2026). Una vez bloqueadas, no se pueden modificar.
        </p>
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {specialPredictions.map((sp) => (
            <div key={sp.label} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm text-slate-700">
                {sp.icon} {sp.label}
              </span>
              <span className="text-sm font-medium text-blue-900">{sp.puntos} pts</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50">
            <span className="text-sm font-semibold text-slate-900">Total máximo</span>
            <span className="text-sm font-bold text-blue-900">{specialTotal} pts</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          💡 Si hay empate en goleadores, basta con que tu jugador esté entre los empatados.
        </p>
      </section>

      {/* Desempate */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Desempate en la tabla
        </h2>
        <p className="text-xs text-slate-600 mb-3">
          Cuando dos jugadores tienen los mismos puntos, se aplican estos criterios en orden:
        </p>
        <div className="space-y-2">
          {tiebreakers.map((tie, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600 flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-slate-700">{tie}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Reglas de tiempo */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Reglas de tiempo
        </h2>
        <ul className="space-y-1.5">
          {timeRules.map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-slate-400 mt-1">•</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Nota dinero */}
      <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
        La plataforma no procesa pagos ni administra dinero. Cualquier acuerdo
        económico entre los participantes es responsabilidad del administrador de
        cada grupo y se maneja por fuera de la app.
      </div>
    </main>
  );
}
