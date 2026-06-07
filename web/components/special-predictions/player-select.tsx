'use client';

import type { Player } from '@/lib/special-predictions/queries';

interface Props {
  players: Player[];
  value: number | null;
  onChange: (playerId: number | null) => void;
  placeholder?: string;
  name: string;
  id?: string;
}

export function PlayerSelect({
  players,
  value,
  onChange,
  placeholder = 'Selecciona un jugador...',
  name,
  id,
}: Props) {
  // Agrupar por equipo
  const playersByTeam = new Map<string, Player[]>();
  for (const player of players) {
    if (!playersByTeam.has(player.team_name)) {
      playersByTeam.set(player.team_name, []);
    }
    playersByTeam.get(player.team_name)!.push(player);
  }

  const sortedTeamNames = Array.from(playersByTeam.keys()).sort();

  return (
    <select
      id={id}
      name={name}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className="min-w-[220px] px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
    >
      <option value="">{placeholder}</option>
      {sortedTeamNames.map((teamName) => (
        <optgroup key={teamName} label={teamName}>
          {playersByTeam.get(teamName)!.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name} {player.position ? `(${player.position})` : ''}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
