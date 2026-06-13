/**
 * Reglamento de puntaje — fuente única de verdad.
 *
 * Este contenido alimenta tanto la página /reglas como el resumen
 * colapsable en la tabla de posiciones, para que nunca diverjan.
 * El texto refleja el reglamento documentado en Notion (v1.0).
 */

// ============================================================
// Puntos por partido según fase
// ============================================================

export interface ScoringRow {
  acierto: string;
  icon: string;
  grupos: number;
  octavos: number;
  cuartos: number;
  semis: number;
  final: number;
}

export const scoringByPhase: ScoringRow[] = [
  { acierto: 'Marcador exacto', icon: '🎯', grupos: 5, octavos: 6, cuartos: 7, semis: 9, final: 10 },
  { acierto: 'Diferencia + ganador', icon: '➕', grupos: 3, octavos: 4, cuartos: 5, semis: 6, final: 6 },
  { acierto: 'Solo ganador', icon: '✅', grupos: 1, octavos: 1, cuartos: 2, semis: 2, final: 2 },
  { acierto: 'Falla', icon: '❌', grupos: 0, octavos: 0, cuartos: 0, semis: 0, final: 0 },
];

// ============================================================
// Cómo se clasifica cada predicción
// ============================================================

export const scoringExplanation = [
  { icon: '🎯', label: 'Marcador exacto', desc: 'Los goles de ambos equipos coinciden con tu predicción.' },
  { icon: '➕', label: 'Diferencia + ganador', desc: 'La diferencia de goles coincide con la real, pero el marcador no es exacto.' },
  { icon: '✅', label: 'Solo ganador', desc: 'Acertaste quién gana (o que es empate), pero la diferencia es distinta.' },
  { icon: '❌', label: 'Falla', desc: 'No acertaste ni el ganador.' },
];

// ============================================================
// Ejemplos prácticos (resultado real: Argentina 2 - Francia 1)
// ============================================================

export interface ExampleRow {
  prediccion: string;
  acierto: string;
  puntos: number;
}

export const exampleResult = 'Argentina 2 - Francia 1';

export const examples: ExampleRow[] = [
  { prediccion: '2-1', acierto: 'Marcador exacto', puntos: 5 },
  { prediccion: '3-2', acierto: 'Diferencia + ganador', puntos: 3 },
  { prediccion: '1-0', acierto: 'Diferencia + ganador', puntos: 3 },
  { prediccion: '3-1', acierto: 'Solo ganador', puntos: 1 },
  { prediccion: '1-1', acierto: 'Falló (predijo empate)', puntos: 0 },
  { prediccion: '1-2', acierto: 'Falló (ganador incorrecto)', puntos: 0 },
];

// ============================================================
// Predicciones especiales
// ============================================================

export interface SpecialRow {
  icon: string;
  label: string;
  puntos: number;
}

export const specialPredictions: SpecialRow[] = [
  { icon: '🏆', label: 'Campeón', puntos: 25 },
  { icon: '🥈', label: 'Subcampeón', puntos: 15 },
  { icon: '🥉', label: 'Tercer lugar', puntos: 10 },
  { icon: '⚽', label: 'Goleador (Bota de Oro)', puntos: 15 },
  { icon: '⭐', label: 'Mejor jugador (Balón de Oro)', puntos: 10 },
];

export const specialTotal = 75;

// ============================================================
// Bonus "¿quién pasa de fase?"
// ============================================================

export const advanceBonus = {
  puntos: 2,
  desc: 'En cada partido de eliminación directa hay una pregunta extra: ¿qué selección avanza? (incluye prórroga y penales). Es independiente del marcador: puedes fallar el marcador del 90\u2032 pero acertar quién pasa.',
};

// ============================================================
// Criterios de desempate (en orden)
// ============================================================

export const tiebreakers = [
  'Mayor cantidad de marcadores exactos',
  'Mayor cantidad de diferencias correctas',
  'Mayor puntaje en predicciones especiales',
  'Mayor cantidad de aciertos en "quién pasa de fase"',
  'Fecha de registro más antigua en el grupo',
];

// ============================================================
// Notas de tiempo / reglas clave
// ============================================================

export const timeRules = [
  'Cada partido cierra al pitazo inicial (hora oficial FIFA).',
  'Puedes editar tu predicción sin límite hasta el cierre.',
  'Las predicciones especiales se cierran con el primer partido del Mundial (11 jun 2026).',
  'Si no predices un partido, recibes 0 pts sin penalización adicional.',
  'Se evalúa el marcador al minuto 90 (sin prórroga ni penales).',
];

// ============================================================
// Resumen corto (para el colapsable de la tabla de posiciones)
// ============================================================

export const shortSummary = [
  { icon: '🎯', label: 'Marcador exacto', rango: '5-10 pts' },
  { icon: '➕', label: 'Diferencia + ganador', rango: '3-6 pts' },
  { icon: '✅', label: 'Solo ganador', rango: '1-2 pts' },
  { icon: '🔄', label: 'Bonus "quién pasa" (eliminatorias)', rango: '+2 pts' },
  { icon: '⭐', label: 'Especiales (campeón, goleador...)', rango: 'hasta 75 pts' },
];
