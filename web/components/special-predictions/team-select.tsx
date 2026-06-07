'use client';

import type { Team } from '@/lib/special-predictions/queries';

interface Props {
  teams: Team[];
  value: number | null;
  onChange: (teamId: number | null) => void;
  excludeIds?: number[];
  placeholder?: string;
  name: string;
  id?: string;
}

export function TeamSelect({
  teams,
  value,
  onChange,
  excludeIds = [],
  placeholder = 'Selecciona un equipo...',
  name,
  id,
}: Props) {
  // Agrupar por grupo (A, B, C, ...)
  const teamsByGroup = new Map<string, Team[]>();
  for (const team of teams) {
    if (excludeIds.includes(team.id)) continue;
    const group = team.group_name ?? '-';
    if (!teamsByGroup.has(group)) teamsByGroup.set(group, []);
    teamsByGroup.get(group)!.push(team);
  }

  const sortedGroups = Array.from(teamsByGroup.keys()).sort();
  const selectedTeam = teams.find((t) => t.id === value);

  return (
    <div className="flex items-center gap-2 min-w-[220px]">
      {selectedTeam?.flag_url && (
        <img
          src={selectedTeam.flag_url}
          alt={selectedTeam.name}
          className="w-7 h-5 object-cover rounded-sm border border-slate-200 flex-shrink-0"
        />
      )}
      <select
        id={id}
        name={name}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
      >
        <option value="">{placeholder}</option>
        {sortedGroups.map((group) => (
          <optgroup key={group} label={`Grupo ${group}`}>
            {teamsByGroup.get(group)!.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
