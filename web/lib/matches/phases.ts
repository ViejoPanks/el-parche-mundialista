export interface PhaseMeta {
  label: string;
  color: string;
  order: number;
}

export const PHASE_META: Record<string, PhaseMeta> = {
  group:       { label: 'Fase de grupos',         color: '#3B82F6', order: 1 },
  r32:         { label: 'Dieciseisavos de final', color: '#F97316', order: 2 },
  r16:         { label: 'Octavos de final',       color: '#EF4444', order: 3 },
  qf:          { label: 'Cuartos de final',       color: '#A855F7', order: 4 },
  sf:          { label: 'Semifinales',            color: '#22C55E', order: 5 },
  third_place: { label: 'Tercer lugar',           color: '#EAB308', order: 6 },
  final:       { label: 'Final',                  color: '#0F172A', order: 7 },
};

export function getPhaseMeta(phase: string): PhaseMeta {
  return PHASE_META[phase] ?? { label: phase, color: '#64748B', order: 99 };
}